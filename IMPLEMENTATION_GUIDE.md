# Implementation Guide - Race Condition Fixes

## Quick Start

### 1. Prerequisites Check

Before deploying the fixes, verify your environment meets these requirements:

```bash
# Check MongoDB version (must be >= 4.0 for transactions)
mongosh --eval "db.version()"

# Verify replica set is configured (required for transactions)
mongosh --eval "rs.status()"

# If not a replica set, convert standalone to replica set:
# Add to mongod.conf:
# replication:
#   replSetName: "rs0"
# Then initialize:
mongosh --eval "rs.initiate()"
```

### 2. Backup Current Files

```bash
# Navigate to backend directory
cd /path/to/traf3li-backend/src/controllers

# Backup original files
cp retainer.controller.js retainer.controller.js.backup
cp payment.controller.js payment.controller.js.backup
cp bankTransfer.controller.js bankTransfer.controller.js.backup
```

### 3. Deploy Fixed Files

```bash
# Copy fixed files from this repository
cp /home/user/traf3li-dashboard/fixed-retainer.controller.js \
   /path/to/traf3li-backend/src/controllers/retainer.controller.js

cp /home/user/traf3li-dashboard/fixed-payment.controller.js \
   /path/to/traf3li-backend/src/controllers/payment.controller.js

cp /home/user/traf3li-dashboard/fixed-bankTransfer.controller.js \
   /path/to/traf3li-backend/src/controllers/bankTransfer.controller.js
```

### 4. Install Dependencies (if needed)

```bash
cd /path/to/traf3li-backend

# Ensure mongoose is up to date (for transaction support)
npm install mongoose@latest

# Verify version >= 5.2.0
npm list mongoose
```

### 5. Test in Development Environment

```bash
# Start backend in development mode
npm run dev

# Run test suite
npm test

# Or manually test critical endpoints:
# See testing section below
```

---

## Testing Procedures

### A. Test Retainer Consumption Race Condition

Create a test script `test-retainer-race.js`:

```javascript
const axios = require('axios');

async function testRetainerRace() {
  const API_URL = 'http://localhost:3000/api';
  const TOKEN = 'your-auth-token';

  // Create test retainer with 1000 SAR
  const retainerRes = await axios.post(`${API_URL}/retainers`, {
    clientId: 'test-client-id',
    retainerType: 'hourly',
    initialAmount: 1000
  }, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const retainerId = retainerRes.data.retainer._id;

  console.log(`Created retainer ${retainerId} with 1000 SAR`);

  // Try to consume 800 SAR concurrently 10 times
  const promises = Array(10).fill(null).map((_, i) =>
    axios.post(`${API_URL}/retainers/${retainerId}/consume`, {
      amount: 800,
      description: `Concurrent test ${i}`
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).catch(err => err.response)
  );

  const results = await Promise.all(promises);

  const succeeded = results.filter(r => r.status === 200);
  const failed = results.filter(r => r.status !== 200);

  console.log(`✅ Succeeded: ${succeeded.length} (should be 1)`);
  console.log(`❌ Failed: ${failed.length} (should be 9)`);

  // Check final balance
  const finalRes = await axios.get(`${API_URL}/retainers/${retainerId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const finalBalance = finalRes.data.data.currentBalance;
  console.log(`Final balance: ${finalBalance} SAR (should be 200)`);

  if (succeeded.length === 1 && finalBalance === 200) {
    console.log('✅ TEST PASSED: Race condition prevented!');
  } else {
    console.log('❌ TEST FAILED: Race condition still exists!');
  }
}

testRetainerRace().catch(console.error);
```

Run the test:
```bash
node test-retainer-race.js
```

### B. Test Payment Double-Processing

Create `test-payment-race.js`:

```javascript
const axios = require('axios');

async function testPaymentRace() {
  const API_URL = 'http://localhost:3000/api';
  const TOKEN = 'your-auth-token';

  // Create test payment
  const paymentRes = await axios.post(`${API_URL}/payments`, {
    customerId: 'test-client-id',
    amount: 1000,
    paymentMethod: 'bank_transfer',
    status: 'pending'
  }, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const paymentId = paymentRes.data.payment._id;

  console.log(`Created payment ${paymentId}`);

  // Try to complete concurrently 10 times
  const promises = Array(10).fill(null).map((_, i) =>
    axios.post(`${API_URL}/payments/${paymentId}/complete`, {}, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).catch(err => err.response)
  );

  const results = await Promise.all(promises);

  const succeeded = results.filter(r => r.status === 200);
  const failed = results.filter(r => r.status !== 200);

  console.log(`✅ Succeeded: ${succeeded.length} (should be 1)`);
  console.log(`❌ Failed: ${failed.length} (should be 9)`);

  if (succeeded.length === 1) {
    console.log('✅ TEST PASSED: Double-processing prevented!');
  } else {
    console.log('❌ TEST FAILED: Payment processed multiple times!');
  }
}

testPaymentRace().catch(console.error);
```

Run the test:
```bash
node test-payment-race.js
```

### C. Test Bank Transfer Race Condition

Create `test-transfer-race.js`:

```javascript
const axios = require('axios');

async function testTransferRace() {
  const API_URL = 'http://localhost:3000/api';
  const TOKEN = 'your-auth-token';

  // Create test accounts
  const account1 = await axios.post(`${API_URL}/bank-accounts`, {
    name: 'Test Source',
    accountNumber: '123456',
    bankName: 'Test Bank',
    currency: 'SAR',
    balance: 1000
  }, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const account2 = await axios.post(`${API_URL}/bank-accounts`, {
    name: 'Test Destination',
    accountNumber: '789012',
    bankName: 'Test Bank',
    currency: 'SAR',
    balance: 0
  }, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const fromId = account1.data.account._id;
  const toId = account2.data.account._id;

  console.log(`Source account: ${fromId} with 1000 SAR`);
  console.log(`Destination account: ${toId} with 0 SAR`);

  // Try to transfer 800 SAR concurrently 10 times
  const promises = Array(10).fill(null).map((_, i) =>
    axios.post(`${API_URL}/bank-transfers`, {
      fromAccountId: fromId,
      toAccountId: toId,
      amount: 800,
      description: `Concurrent test ${i}`
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).catch(err => err.response)
  );

  const results = await Promise.all(promises);

  const succeeded = results.filter(r => r.status === 201);
  const failed = results.filter(r => r.status !== 201);

  console.log(`✅ Succeeded: ${succeeded.length} (should be 1)`);
  console.log(`❌ Failed: ${failed.length} (should be 9)`);

  // Check final balances
  const source = await axios.get(`${API_URL}/bank-accounts/${fromId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const dest = await axios.get(`${API_URL}/bank-accounts/${toId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const sourceBalance = source.data.account.availableBalance;
  const destBalance = dest.data.account.availableBalance;

  console.log(`Source balance: ${sourceBalance} SAR (should be 200)`);
  console.log(`Destination balance: ${destBalance} SAR (should be 800)`);

  if (succeeded.length === 1 && sourceBalance === 200 && destBalance === 800) {
    console.log('✅ TEST PASSED: Concurrent transfers prevented!');
  } else {
    console.log('❌ TEST FAILED: Race condition exists!');
  }
}

testTransferRace().catch(console.error);
```

Run the test:
```bash
node test-transfer-race.js
```

---

## Load Testing

Use Apache Bench or Artillery for load testing:

### Using Apache Bench

```bash
# Test retainer consumption endpoint
ab -n 100 -c 10 -p consume.json -T application/json \
   -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:3000/api/retainers/RETAINER_ID/consume

# Where consume.json contains:
# {"amount": 100, "description": "Load test"}
```

### Using Artillery

Create `artillery-config.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 20
  headers:
    Authorization: "Bearer YOUR_TOKEN"

scenarios:
  - name: "Test retainer consumption"
    flow:
      - post:
          url: "/api/retainers/{{ retainerId }}/consume"
          json:
            amount: 10
            description: "Load test"

  - name: "Test payment completion"
    flow:
      - post:
          url: "/api/payments/{{ paymentId }}/complete"
          json: {}

  - name: "Test bank transfer"
    flow:
      - post:
          url: "/api/bank-transfers"
          json:
            fromAccountId: "{{ fromAccountId }}"
            toAccountId: "{{ toAccountId }}"
            amount: 100
```

Run load test:
```bash
artillery run artillery-config.yml
```

---

## Monitoring

### 1. Add Logging for Transaction Failures

Add to each controller:

```javascript
try {
  // ... transaction code
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();

  // Log transaction failure
  console.error('Transaction failed:', {
    controller: 'retainer',
    function: 'consumeRetainer',
    error: error.message,
    retainerId: id,
    amount,
    timestamp: new Date()
  });

  throw error;
} finally {
  session.endSession();
}
```

### 2. Monitor Key Metrics

Set up monitoring for:

```javascript
// Example with Prometheus/StatsD
const metrics = {
  transactionAttempts: new Counter('transaction_attempts_total'),
  transactionFailures: new Counter('transaction_failures_total'),
  transactionDuration: new Histogram('transaction_duration_seconds'),
  concurrentOperations: new Gauge('concurrent_operations')
};

// Instrument transaction code
const timer = metrics.transactionDuration.startTimer();
metrics.transactionAttempts.inc();

try {
  // ... transaction
  await session.commitTransaction();
} catch (error) {
  metrics.transactionFailures.inc({ reason: error.code });
  throw error;
} finally {
  timer();
  session.endSession();
}
```

### 3. Database Monitoring

Monitor MongoDB for:
- Transaction abort rate
- Lock contention
- Write conflicts
- Query performance

```bash
# Connect to MongoDB
mongosh

# Check transaction stats
db.serverStatus().transactions

# Check current operations
db.currentOp()

# Check slow queries
db.system.profile.find().sort({ts: -1}).limit(10)
```

---

## Rollback Procedure

If issues arise after deployment:

### 1. Quick Rollback

```bash
cd /path/to/traf3li-backend/src/controllers

# Restore original files
cp retainer.controller.js.backup retainer.controller.js
cp payment.controller.js.backup payment.controller.js
cp bankTransfer.controller.js.backup bankTransfer.controller.js

# Restart application
pm2 restart traf3li-backend
# or
npm run restart
```

### 2. Verify Database Consistency

```javascript
// Check for negative balances
db.retainers.find({ currentBalance: { $lt: 0 } })

// Check for duplicate payment processing
db.payments.aggregate([
  {
    $group: {
      _id: "$invoiceId",
      count: { $sum: 1 },
      payments: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } }
])

// Check bank account balances
db.bankAccounts.find({ availableBalance: { $lt: 0 } })
```

### 3. Manual Data Correction (if needed)

If data inconsistencies are found:

```javascript
// Fix negative balances (example)
const negativeRetainers = await Retainer.find({ currentBalance: { $lt: 0 } });

for (const retainer of negativeRetainers) {
  // Manual review and correction
  console.log(`Retainer ${retainer._id} has negative balance: ${retainer.currentBalance}`);

  // Calculate correct balance from transaction history
  const deposits = retainer.deposits.reduce((sum, d) => sum + d.amount, 0);
  const consumptions = retainer.consumptions.reduce((sum, c) => sum + c.amount, 0);
  const correctBalance = deposits - consumptions;

  console.log(`Correct balance should be: ${correctBalance}`);

  // Update if needed
  retainer.currentBalance = correctBalance;
  await retainer.save();
}
```

---

## Production Deployment Checklist

- [ ] MongoDB version >= 4.0
- [ ] Replica set configured
- [ ] Original files backed up
- [ ] All tests passing in development
- [ ] Load tests completed successfully
- [ ] Monitoring dashboards set up
- [ ] Team trained on new behavior
- [ ] Documentation updated
- [ ] Rollback procedure tested
- [ ] Database backup completed
- [ ] Stakeholders notified
- [ ] Deployment scheduled for low-traffic period

---

## Post-Deployment Verification

After deployment, verify:

### 1. Check Application Logs

```bash
# Check for transaction errors
tail -f /var/log/traf3li-backend/error.log | grep "Transaction"

# Check for race condition errors
tail -f /var/log/traf3li-backend/error.log | grep "already completed\|Insufficient balance\|already cancelled"
```

### 2. Monitor Error Rates

```bash
# Using PM2
pm2 logs traf3li-backend --err

# Check error rate
pm2 monit
```

### 3. Verify Financial Operations

- [ ] Test retainer consumption in production
- [ ] Test payment completion in production
- [ ] Test bank transfers in production
- [ ] Verify balances are accurate
- [ ] Check GL entries are correct
- [ ] Confirm no duplicate transactions

### 4. Performance Check

Monitor:
- Response time increase (should be minimal)
- Database CPU usage
- Transaction throughput
- Error rate (should decrease)

---

## Support

If issues arise:

1. **Check MongoDB logs**: `/var/log/mongodb/mongod.log`
2. **Check application logs**: `/var/log/traf3li-backend/`
3. **Review transaction failures**: Look for abort reasons
4. **Contact**: development team with error details

---

## Success Criteria

Deployment is successful when:

- ✅ No negative balances in retainers
- ✅ No duplicate payment processing
- ✅ No account overdrafts
- ✅ All concurrent operations handled correctly
- ✅ Response times remain acceptable
- ✅ No increase in error rates
- ✅ All financial reports accurate

---

## Additional Resources

- [RACE_CONDITION_FIXES.md](./RACE_CONDITION_FIXES.md) - Detailed technical explanation
- [MongoDB Transactions Docs](https://docs.mongodb.com/manual/core/transactions/)
- [Mongoose Transactions Guide](https://mongoosejs.com/docs/transactions.html)
