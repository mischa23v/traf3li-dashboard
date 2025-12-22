# BUSINESS LOGIC VULNERABILITIES - QUICK FIX GUIDE

**Priority:** CRITICAL - Implement within 24-48 hours
**Last Updated:** 2025-12-22

---

## EMERGENCY ACTIONS (Do Now!)

### 1. DISABLE TEST ENDPOINTS IMMEDIATELY ⚠️ CATASTROPHIC

**Location:** `/src/controllers/order.controller.js`

**Current Code:**
```javascript
module.exports = {
    getOrders,
    paymentIntent,
    proposalPaymentIntent,
    updatePaymentStatus,
    createTestContract,          // ❌ DANGER!
    createTestProposalContract   // ❌ DANGER!
}
```

**Quick Fix:**
```javascript
// Only export test functions in development
const testFunctions = process.env.NODE_ENV === 'production' ? {} : {
    createTestContract,
    createTestProposalContract
};

module.exports = {
    getOrders,
    paymentIntent,
    proposalPaymentIntent,
    updatePaymentStatus,
    ...testFunctions
};
```

**Impact if not fixed:** Anyone can get ANY service for FREE
**Lines to modify:** 336-343

---

## CRITICAL FIXES (Within 24 Hours)

### 2. Add Price Locking to Gig Orders

**Location:** `/src/controllers/order.controller.js:30-82`

**Minimal Fix (Quick):**
```javascript
const paymentIntent = async (request, response) => {
    const { _id } = request.params;

    try {
        const gig = await Gig.findOne({ _id }).populate('userID', 'username');

        // ✅ ADD THIS: Lock the price
        const lockedPrice = gig.price;

        // ✅ ADD THIS: Validate price is reasonable
        if (lockedPrice <= 0 || lockedPrice > 1000000) {
            throw CustomException('Invalid price', 400);
        }

        const payment_intent = await stripe.paymentIntents.create({
            amount: Math.round(lockedPrice * 100), // ✅ Changed to lockedPrice
            currency: "SAR", // ✅ Changed from INR
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {  // ✅ ADD THIS
                gigId: _id,
                agreedPrice: lockedPrice,
                timestamp: new Date().toISOString()
            }
        });

        const order = new Order({
            gigID: gig._id,
            image: gig.cover,
            title: gig.title,
            buyerID: request.userID,
            sellerID: gig.userID,
            price: lockedPrice,  // ✅ Changed to lockedPrice
            agreedPrice: lockedPrice,  // ✅ ADD THIS field to schema
            payment_intent: payment_intent.id
        });

        await order.save();
        // ... rest of code
```

**Impact:** Prevents price manipulation during checkout

---

### 3. Add Price Locking to Proposal Orders

**Location:** `/src/controllers/order.controller.js:85-153`

**Minimal Fix:**
```javascript
const proposalPaymentIntent = async (request, response) => {
    const { _id } = request.params;

    try {
        const proposal = await Proposal.findById(_id).populate('jobId');

        if (!proposal) {
            throw CustomException('Proposal not found', 404);
        }

        // ✅ ADD THIS: Verify proposal status
        if (proposal.status !== 'accepted') {
            throw CustomException('Proposal must be accepted first', 400);
        }

        const job = proposal.jobId;

        if (job.userID.toString() !== request.userID) {
            throw CustomException('Not authorized', 403);
        }

        // ✅ ADD THIS: Lock the price
        const lockedAmount = proposal.proposedAmount;

        // ✅ ADD THIS: Validate amount
        if (lockedAmount <= 0 || lockedAmount > 10000000) {
            throw CustomException('Invalid proposal amount', 400);
        }

        const payment_intent = await stripe.paymentIntents.create({
            amount: Math.round(lockedAmount * 100), // ✅ Changed to Math.round
            currency: "SAR",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {  // ✅ ADD THIS
                proposalId: _id,
                jobId: job._id.toString(),
                agreedAmount: lockedAmount,
                timestamp: new Date().toISOString()
            }
        });

        const order = new Order({
            gigID: null,
            jobId: job._id,
            image: job.attachments?.[0]?.url || '',
            title: job.title,
            buyerID: request.userID,
            sellerID: proposal.lawyerId,
            price: lockedAmount,  // ✅ Use locked amount
            agreedAmount: lockedAmount,  // ✅ ADD THIS field
            payment_intent: payment_intent.id,
            status: 'pending'
        });

        await order.save();
        // ... rest of code
```

**Impact:** Prevents proposal price manipulation

---

### 4. Fix Invoice Total Calculation

**Location:** `/src/controllers/invoice.controller.js:14-66`

**Critical Change:**
```javascript
const createInvoice = async (request, response) => {
    const { caseId, contractId, items, dueDate } = request.body;
    try {
        // ... existing user check ...

        // ✅ REPLACE THIS SECTION:
        // const subtotal = items.reduce((sum, item) => sum + item.total, 0);

        // ✅ WITH SERVER-SIDE CALCULATION:
        let calculatedSubtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            // Validate item
            if (!item.description || !item.quantity || !item.rate) {
                throw CustomException('Invalid item format', 400);
            }

            if (item.quantity <= 0 || item.rate <= 0) {
                throw CustomException('Quantity and rate must be positive', 400);
            }

            // SERVER calculates total (ignore client's total)
            const calculatedTotal = Math.round(item.quantity * item.rate * 100) / 100;
            calculatedSubtotal += calculatedTotal;

            validatedItems.push({
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                total: calculatedTotal  // ✅ Use calculated, not client's value
            });
        }

        const vatAmount = Math.round(calculatedSubtotal * 0.15 * 100) / 100;
        const total = Math.round((calculatedSubtotal + vatAmount) * 100) / 100;

        // ... rest of code using calculatedSubtotal and validatedItems ...
```

**Impact:** Prevents invoice price manipulation

---

### 5. Fix Payment Race Condition

**Location:** `/src/controllers/payment.controller.js:274-350`

**Add This NPM Package:**
```bash
npm install mongoose
```

**Critical Changes:**
```javascript
const mongoose = require('mongoose');  // ✅ ADD at top of file

const completePayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lawyerId = req.userID;

    // ✅ ADD TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // ✅ REPLACE: const payment = await Payment.findById(id);
        // WITH ATOMIC UPDATE:
        const payment = await Payment.findOneAndUpdate(
            {
                _id: id,
                lawyerId: lawyerId,
                status: 'pending'  // ✅ Only update if still pending
            },
            {
                $set: {
                    status: 'completed',
                    processedBy: lawyerId,
                    completedAt: new Date()
                }
            },
            {
                new: true,
                session  // ✅ Use transaction
            }
        );

        if (!payment) {
            await session.abortTransaction();
            session.endSession();
            throw new CustomException('Payment not found or already processed', 400);
        }

        // Update invoice atomically
        if (payment.invoiceId) {
            // ✅ REPLACE invoice.amountPaid = (invoice.amountPaid || 0) + payment.amount;
            // WITH ATOMIC INCREMENT:
            const invoice = await Invoice.findByIdAndUpdate(
                payment.invoiceId,
                {
                    $inc: { amountPaid: payment.amount }  // ✅ Atomic increment
                },
                {
                    new: true,
                    session
                }
            );

            if (invoice) {
                invoice.balanceDue = invoice.totalAmount - invoice.amountPaid;

                if (invoice.balanceDue <= 0) {
                    invoice.status = 'paid';
                    invoice.paidDate = new Date();
                } else if (invoice.amountPaid > 0) {
                    invoice.status = 'partial';
                }

                await invoice.save({ session });
            }
        }

        // ... retainer update ...

        await session.commitTransaction();  // ✅ Commit transaction
        session.endSession();

        // ... rest of code ...
    } catch (error) {
        await session.abortTransaction();  // ✅ Rollback on error
        session.endSession();
        throw error;
    }
});
```

**Impact:** Prevents double-payment attacks

---

## HIGH PRIORITY (Within 48 Hours)

### 6. Fix Review System - Add Purchase Verification

**Location:** `/src/controllers/review.controller.js:4-30`

**Replace Entire Function:**
```javascript
const createReview = async(request, response) => {
    const { gigID, star, description } = request.body;
    try {
        // ✅ REMOVE THIS LINE:
        // // All checks disabled for Playwright testing

        // ✅ ADD VALIDATION:
        if (!star || star < 1 || star > 5) {
            throw CustomException('Star rating must be between 1 and 5', 400);
        }

        // ✅ ADD THIS: Verify purchase
        const completedOrder = await Order.findOne({
            gigID: gigID,
            buyerID: request.userID,
            isCompleted: true,
            status: 'completed'
        });

        if (!completedOrder) {
            throw CustomException(
                'You can only review services you have purchased',
                403
            );
        }

        // ✅ ADD THIS: Prevent duplicate reviews
        const existingReview = await Review.findOne({
            userID: request.userID,
            gigID: gigID
        });

        if (existingReview) {
            throw CustomException('You have already reviewed this service', 400);
        }

        // ✅ ADD THIS: Prevent self-review
        const gig = await Gig.findById(gigID);
        if (gig && gig.userID.toString() === request.userID) {
            throw CustomException('You cannot review your own service', 403);
        }

        const review = new Review({
            userID: request.userID,
            gigID,
            orderID: completedOrder._id,  // ✅ ADD THIS
            star,
            description,
            verifiedPurchase: true  // ✅ ADD THIS
        });

        await Gig.findByIdAndUpdate(gigID, {
            $inc: { totalStars: star, starNumber: 1 }
        });
        await review.save();

        return response.status(201).send({
            error: false,
            review
        });
    }
    catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        });
    }
}
```

**Impact:** Prevents fake reviews

---

### 7. Fix Retainer Race Condition

**Location:** `/src/controllers/retainer.controller.js:248-320`

**Replace consumeRetainer Function:**
```javascript
const consumeRetainer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, invoiceId, description } = req.body;
    const lawyerId = req.userID;

    if (!amount || amount <= 0) {
        throw new CustomException('Valid amount required', 400);
    }

    // ✅ ADD TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // ✅ ATOMIC UPDATE WITH BALANCE CHECK
        const retainer = await Retainer.findOneAndUpdate(
            {
                _id: id,
                lawyerId: lawyerId,
                status: 'active',
                currentBalance: { $gte: amount }  // ✅ Ensure sufficient balance
            },
            {
                $inc: { currentBalance: -amount },  // ✅ Atomic decrement
                $push: {
                    consumptions: {
                        date: new Date(),
                        amount,
                        invoiceId,
                        description
                    }
                }
            },
            {
                new: true,
                session
            }
        );

        if (!retainer) {
            await session.abortTransaction();
            session.endSession();

            const check = await Retainer.findById(id);
            if (!check) {
                throw new CustomException('Retainer not found', 404);
            }
            if (check.currentBalance < amount) {
                throw new CustomException(
                    `Insufficient balance. Available: ${check.currentBalance}, Required: ${amount}`,
                    400
                );
            }
            throw new CustomException('Failed to consume retainer', 400);
        }

        // ... rest of logic ...

        await session.commitTransaction();
        session.endSession();

        // ... response ...
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
```

**Impact:** Prevents balance corruption

---

### 8. Fix Refund Over-Refund Vulnerability

**Location:** `/src/controllers/payment.controller.js:400-485`

**Add This Check:**
```javascript
const createRefund = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const lawyerId = req.userID;

    // ✅ ADD TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const originalPayment = await Payment.findById(id).session(session);

        // ... existing checks ...

        const requestedRefund = amount || originalPayment.amount;

        // ✅ ADD THIS: Calculate total refunds already issued
        const existingRefunds = await Payment.find({
            originalPaymentId: originalPayment._id,
            isRefund: true,
            status: { $in: ['completed', 'pending'] }
        }).session(session);

        const totalRefunded = existingRefunds.reduce((sum, refund) => {
            return sum + Math.abs(refund.amount);
        }, 0);

        const maxRefundable = originalPayment.amount - totalRefunded;

        // ✅ ADD THIS: Validate refund doesn't exceed remaining
        if (requestedRefund > maxRefundable) {
            throw new CustomException(
                `Refund (${requestedRefund}) exceeds refundable amount (${maxRefundable})`,
                400
            );
        }

        // ... rest of code ...

        await session.commitTransaction();
        session.endSession();

        // ... response ...
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});
```

**Impact:** Prevents over-refunding

---

### 9. Fix User Profile Mass Assignment

**Location:** `/src/controllers/user.controller.js:242-266`

**Add Field Whitelist:**
```javascript
const updateUserProfile = async (request, response) => {
    const { _id } = request.params;

    try {
        if (request.userID !== _id) {
            throw CustomException('You can only update your own profile!', 403);
        }

        // ✅ ADD THIS: Whitelist allowed fields
        const allowedFields = [
            'username',
            'phone',
            'country',
            'city',
            'address',
            'description',
            'image',
            'bio',
            'website'
        ];

        // ✅ ADD THIS: Filter to only allowed fields
        const updates = {};
        allowedFields.forEach(field => {
            if (request.body[field] !== undefined) {
                updates[field] = request.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            throw CustomException('No valid fields to update', 400);
        }

        // ✅ REPLACE: { $set: request.body }
        // WITH: { $set: updates }
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { $set: updates },  // ✅ Only whitelisted fields
            { new: true, runValidators: true }
        ).select('-password');

        // ... rest of code ...
```

**Impact:** Prevents privilege escalation

---

## SCHEMA UPDATES NEEDED

### Add to Order Model
```javascript
// /src/models/order.model.js
const orderSchema = new mongoose.Schema({
    // ... existing fields ...

    // ✅ ADD THESE:
    agreedPrice: {
        type: Number,
        required: true
    },
    priceLockedAt: {
        type: Date,
        default: Date.now
    }
});
```

### Add to Review Model
```javascript
// /src/models/review.model.js
const reviewSchema = new mongoose.Schema({
    // ... existing fields ...

    // ✅ ADD THESE:
    orderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    }
});
```

### Add to Payment Model
```javascript
// /src/models/payment.model.js
const paymentSchema = new mongoose.Schema({
    // ... existing fields ...

    // ✅ ADD THESE:
    completedAt: Date,
    totalRefunded: {
        type: Number,
        default: 0
    },
    fullyRefundedAt: Date
});
```

---

## DEPLOYMENT CHECKLIST

Before deploying fixes:

- [ ] Test endpoint disabled in production
- [ ] All price locking implemented
- [ ] Transactions added to payment operations
- [ ] Review purchase verification active
- [ ] Retainer operations use transactions
- [ ] Refund limits enforced
- [ ] Profile updates whitelisted
- [ ] Schema migrations complete
- [ ] Database indexes created
- [ ] Load testing completed
- [ ] Security scan run again

---

## MONITORING AFTER DEPLOYMENT

Monitor these metrics for 48 hours:

1. **Payment failures** - Should remain low
2. **Concurrent operation errors** - Expected to increase slightly (this is good - means race conditions are caught)
3. **Review submission rate** - Should decrease (fake reviews blocked)
4. **Refund requests** - Watch for unusual patterns
5. **Error logs** - Look for "insufficient balance" errors
6. **Transaction rollbacks** - Monitor frequency

---

## EMERGENCY ROLLBACK PLAN

If critical issues occur:

1. Revert to previous version
2. Disable affected endpoints via feature flags
3. Enable maintenance mode for payments
4. Contact payment processor to halt transactions
5. Review error logs and database state

---

**Created:** 2025-12-22
**Priority:** CRITICAL
**Estimated Implementation Time:** 4-8 hours for critical fixes
