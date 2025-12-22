# Race Condition Fixes - Financial Operations

## Overview
This document details the race condition vulnerabilities found in three critical financial controllers and the atomic database-level solutions implemented to fix them.

---

## 1. Retainer Controller (`retainer.controller.js`)

### Vulnerability: Balance Consumption Race Condition

#### Problem
```javascript
// ORIGINAL CODE - VULNERABLE
const retainer = await Retainer.findById(id);

if (retainer.currentBalance < amount) {
  throw CustomException('الرصيد غير كافٍ في العربون', 400);
}

// Time gap here - another request could consume balance
await retainer.consume(amount, invoiceId, description);
```

**Race Condition Scenario:**
1. Request A: Reads balance = 1000 SAR
2. Request B: Reads balance = 1000 SAR (before A completes)
3. Request A: Consumes 800 SAR → Balance = 200 SAR
4. Request B: Consumes 800 SAR → Balance = -600 SAR (NEGATIVE BALANCE!)

#### Solution: Atomic Update with Conditions

```javascript
// FIXED CODE - ATOMIC
const retainer = await Retainer.findOneAndUpdate(
  {
    _id: id,
    lawyerId: lawyerId,
    status: 'active',
    currentBalance: { $gte: amount } // ✅ Atomic condition check
  },
  {
    $inc: { currentBalance: -amount }, // ✅ Atomic decrement
    $push: {
      consumptions: {
        date: new Date(),
        amount: amount,
        invoiceId: invoiceId || null,
        description: description || 'استهلاك من العربون'
      }
    }
  },
  {
    new: true,
    session,
    runValidators: true
  }
);

if (!retainer) {
  // Conditions weren't met - provide detailed error
}
```

**Key Improvements:**
- ✅ Single atomic database operation
- ✅ Balance check happens at database level (not application level)
- ✅ Uses `$inc` operator for atomic increment/decrement
- ✅ MongoDB ensures only one operation succeeds if balance is insufficient
- ✅ Wrapped in transaction for consistency

**Similar Fix Applied To:**
- `consumeRetainer()` - Balance consumption
- `replenishRetainer()` - Balance replenishment

---

## 2. Payment Controller (`payment.controller.js`)

### Vulnerability: Double-Processing

#### Problem
```javascript
// ORIGINAL CODE - VULNERABLE
const payment = await Payment.findById(id);

if (payment.status === 'completed' || payment.status === 'reconciled') {
  throw CustomException('Payment already completed', 400);
}

// Time gap here - another request could also pass the check
const session = await mongoose.startSession();
session.startTransaction();

payment.status = 'completed';
await payment.save({ session });
```

**Race Condition Scenario:**
1. Request A: Checks status = 'pending' ✓
2. Request B: Checks status = 'pending' ✓ (before A updates)
3. Request A: Updates to 'completed', processes payment
4. Request B: Updates to 'completed', processes payment again (DOUBLE PROCESSING!)

**Financial Impact:**
- Invoice marked as paid twice
- GL entries posted twice
- Customer charged twice
- Retainer balance credited twice

#### Solution: Atomic Status Update

```javascript
// FIXED CODE - ATOMIC
const session = await mongoose.startSession();
session.startTransaction();

const payment = await Payment.findOneAndUpdate(
  {
    _id: id,
    status: 'pending', // ✅ Only update if currently pending
    $or: firmId
      ? [{ firmId: firmId }]
      : [{ lawyerId: lawyerId }]
  },
  {
    $set: {
      status: 'completed',
      processedBy: lawyerId,
      processedAt: new Date()
    }
  },
  {
    new: true,
    session,
    runValidators: true
  }
);

if (!payment) {
  await session.abortTransaction();
  // Payment not found, already processed, or access denied
}

// Continue with invoice application and GL posting
```

**Key Improvements:**
- ✅ Status check moved inside atomic operation
- ✅ Only one request can successfully update from 'pending' to 'completed'
- ✅ If payment already completed, `findOneAndUpdate` returns null
- ✅ Transaction wraps entire payment processing workflow
- ✅ Prevents duplicate invoice applications and GL entries

**Similar Fix Applied To:**
- `completePayment()` - Payment completion
- `recordInvoicePayment()` - Invoice payment recording with atomic invoice balance update

**Additional Fix in `recordInvoicePayment()`:**
```javascript
// Atomic invoice balance update
const invoice = await Invoice.findOneAndUpdate(
  {
    _id: invoiceId,
    status: { $nin: ['paid', 'cancelled'] },
    balanceDue: { $gte: amount } // ✅ Prevent overpayment
  },
  {
    $inc: {
      amountPaid: amount,
      balanceDue: -amount
    },
    $push: {
      paymentHistory: {
        amount,
        date: new Date(),
        method: paymentMethod || 'bank_transfer'
      }
    }
  },
  {
    new: false,
    session
  }
);
```

---

## 3. Bank Transfer Controller (`bankTransfer.controller.js`)

### Vulnerability: Concurrent Transfer Issues

#### Problem
```javascript
// ORIGINAL CODE - VULNERABLE
const fromAccount = await BankAccount.findById(fromAccountId);
const toAccount = await BankAccount.findById(toAccountId);

const totalDeduction = amount + (fee || 0);
if (fromAccount.availableBalance < totalDeduction) {
  throw CustomException('Insufficient balance in source account', 400);
}

// Time gap here - another transfer could use the same funds
const transfer = await BankTransfer.create({...});
await BankTransfer.executeTransfer(transfer._id);
```

**Race Condition Scenario:**
1. Request A: Checks balance = 1000 SAR, needs 800 SAR ✓
2. Request B: Checks balance = 1000 SAR, needs 800 SAR ✓
3. Request A: Deducts 800 SAR → Balance = 200 SAR
4. Request B: Deducts 800 SAR → Balance = -600 SAR (OVERDRAFT!)

**Financial Impact:**
- Account goes into negative balance
- Multiple transfers using same funds
- Accounting inconsistencies
- Bank reconciliation failures

#### Solution: Atomic Balance Updates

```javascript
// FIXED CODE - ATOMIC
const session = await mongoose.startSession();
session.startTransaction();

// ✅ Atomically check balance and deduct from source
const fromAccount = await BankAccount.findOneAndUpdate(
  {
    _id: fromAccountId,
    lawyerId: lawyerId,
    availableBalance: { $gte: totalDeduction }, // ✅ Atomic balance check
    isActive: true
  },
  {
    $inc: {
      availableBalance: -totalDeduction, // ✅ Atomic decrement
      totalWithdrawals: totalDeduction
    }
  },
  {
    new: false,
    session,
    runValidators: true
  }
);

if (!fromAccount) {
  await session.abortTransaction();
  // Insufficient balance or account not found
}

// ✅ Atomically add to destination
const toAccount = await BankAccount.findOneAndUpdate(
  {
    _id: toAccountId,
    lawyerId: lawyerId,
    isActive: true
  },
  {
    $inc: {
      availableBalance: amount,
      totalDeposits: amount
    }
  },
  {
    new: false,
    session,
    runValidators: true
  }
);

// Create transfer record (funds already moved)
const transfer = await BankTransfer.create([{
  ...
  status: 'completed'
}], { session });

await session.commitTransaction();
```

**Key Improvements:**
- ✅ Balance check and deduction in single atomic operation
- ✅ Uses MongoDB transactions for consistency
- ✅ Source and destination updates are atomic
- ✅ Transfer marked as completed only after funds moved
- ✅ Prevents overdraft scenarios

**Similar Fix Applied To:**
- `createTransfer()` - Transfer creation with atomic balance updates
- `cancelTransfer()` - Transfer cancellation with atomic balance reversal

**Additional Fix in `cancelTransfer()`:**
```javascript
// Atomic transfer cancellation
const transfer = await BankTransfer.findOneAndUpdate(
  {
    _id: id,
    lawyerId: lawyerId,
    status: 'completed' // ✅ Only cancel completed transfers once
  },
  {
    $set: {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: lawyerId,
      cancellationReason: reason || 'Transfer cancelled'
    }
  },
  { new: false, session }
);

// Then atomically reverse balances
```

---

## Common Patterns Used Across All Fixes

### 1. **findOneAndUpdate with Conditions**
Instead of:
```javascript
const doc = await Model.findById(id);
if (doc.someField < value) throw error;
doc.someField -= value;
await doc.save();
```

Use:
```javascript
const doc = await Model.findOneAndUpdate(
  {
    _id: id,
    someField: { $gte: value } // Check in query
  },
  {
    $inc: { someField: -value } // Atomic update
  },
  { new: true, session }
);

if (!doc) {
  // Condition not met
}
```

### 2. **MongoDB Transactions**
All financial operations wrapped in transactions:
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Atomic operations with session
  await operation1({ session });
  await operation2({ session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 3. **Atomic Operators**
- `$inc`: Atomic increment/decrement
- `$push`: Atomic array addition
- `$set`: Atomic field update
- Query conditions: Ensure preconditions met at database level

### 4. **Optimistic Concurrency Control**
Query conditions act as optimistic locks:
- If conditions fail, operation fails
- No explicit locking needed
- MongoDB handles concurrency

---

## Testing Race Conditions

### Test Script Example
```javascript
// Test concurrent retainer consumption
async function testRaceCondition() {
  const retainerId = 'xxx';
  const amount = 800;

  // Fire 10 concurrent requests
  const promises = Array(10).fill(null).map(() =>
    axios.post(`/api/retainers/${retainerId}/consume`, { amount })
  );

  const results = await Promise.allSettled(promises);

  // With fix: Only 1 succeeds (if balance = 1000)
  // Without fix: Multiple succeed, causing negative balance

  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  console.log(`Succeeded: ${succeeded.length}`);
  console.log(`Failed: ${failed.length}`);

  // Verify final balance
  const retainer = await Retainer.findById(retainerId);
  console.log(`Final balance: ${retainer.currentBalance}`);
  // Expected: 200 SAR (not negative)
}
```

---

## Performance Considerations

### Benefits
- ✅ Eliminates application-level locking overhead
- ✅ Uses database-native atomic operations (faster)
- ✅ Reduces network round trips (single query)
- ✅ Leverages MongoDB's built-in concurrency control

### Monitoring
Monitor these metrics:
- Transaction abort rate
- Concurrent operation conflicts
- Average transaction duration
- Failed balance check rate

---

## Migration Notes

### Before Deploying
1. ✅ Test all fixed endpoints thoroughly
2. ✅ Run load tests simulating concurrent operations
3. ✅ Verify MongoDB replica set configuration (required for transactions)
4. ✅ Check MongoDB version >= 4.0 (required for transactions)
5. ✅ Update API documentation

### Rollback Plan
If issues occur:
1. Keep original files as backup
2. Database state should remain consistent (transactions ensure this)
3. Monitor error logs for transaction failures

---

## Summary

### Files Fixed
1. ✅ `fixed-retainer.controller.js` - Balance consumption race condition
2. ✅ `fixed-payment.controller.js` - Double-processing vulnerability
3. ✅ `fixed-bankTransfer.controller.js` - Concurrent transfer issues

### Functions Fixed
- ✅ `consumeRetainer()` - Atomic balance deduction
- ✅ `replenishRetainer()` - Atomic balance addition
- ✅ `completePayment()` - Atomic status update
- ✅ `recordInvoicePayment()` - Atomic invoice payment with balance check
- ✅ `createTransfer()` - Atomic account balance updates
- ✅ `cancelTransfer()` - Atomic transfer reversal

### Key Technologies Used
- MongoDB Transactions (ACID guarantees)
- findOneAndUpdate with conditional queries
- Atomic operators ($inc, $push, $set)
- Session-based operations

### Security Impact
- ✅ Prevents financial fraud via race condition exploitation
- ✅ Ensures data consistency in high-concurrency scenarios
- ✅ Eliminates negative balance vulnerabilities
- ✅ Prevents double-processing of payments

---

## References

- [MongoDB Transactions](https://docs.mongodb.com/manual/core/transactions/)
- [Mongoose Transactions](https://mongoosejs.com/docs/transactions.html)
- [Atomic Operations](https://docs.mongodb.com/manual/core/write-operations-atomicity/)
- [OWASP Race Conditions](https://owasp.org/www-community/vulnerabilities/Race_Conditions)
