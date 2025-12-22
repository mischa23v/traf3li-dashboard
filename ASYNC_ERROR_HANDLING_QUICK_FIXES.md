# ASYNC/AWAIT ERROR HANDLING - QUICK FIX GUIDE

## CRITICAL ISSUES - FIX TODAY

### 1. Add Global Error Handlers (server.js)

Add this code BEFORE `server.listen()`:

```javascript
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED PROMISE REJECTION:', reason);
    console.error('Stack:', reason?.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    console.error('Stack:', error.stack);
    setTimeout(() => process.exit(1), 1000);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### 2. Fix Database Connection (configs/db.js)

Replace `server.listen()` code with:

```javascript
const startServer = async () => {
    try {
        await connectDB();
        scheduleTaskReminders();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
```

### 3. Fix Error Swallowing (legalDocument.controller.js)

**Line 46 & 90 - CHANGE:**
```javascript
const user = await User.findById(request.userID).catch(() => null);
```

**TO:**
```javascript
const user = await User.findById(request.userID);
```

### 4. Fix Authentication (middlewares/userMiddleware.js)

**CHANGE** the catch block from:
```javascript
catch({message, status = 500}) {
    return response.status(status).send({
        error: true,
        message
    })
}
```

**TO:**
```javascript
catch(error) {
    const status = error.status || 500;
    const message = error.message || 'Authentication failed';
    return response.status(status).send({
        error: true,
        message
    });
}
```

---

## HIGH PRIORITY - THIS WEEK

### 5. Convert Controllers to asyncHandler

For each controller NOT using asyncHandler (23 files), change:

**FROM:**
```javascript
const myController = async (req, res) => {
    try {
        // code
    } catch ({ message, status = 500 }) {
        return res.status(status).send({ error: true, message });
    }
};
```

**TO:**
```javascript
const asyncHandler = require('../utils/asyncHandler');

const myController = asyncHandler(async (req, res) => {
    // code - no try/catch needed
});
```

**Affected files:**
- auth.controller.js
- case.controller.js
- user.controller.js
- gig.controller.js
- order.controller.js
- invoice.controller.js
- task.controller.js
- notification.controller.js
- event.controller.js
- message.controller.js
- conversation.controller.js
- question.controller.js
- answer.controller.js
- review.controller.js
- peerReview.controller.js
- score.controller.js
- firm.controller.js
- pdfme.controller.js
- legalDocument.controller.js

### 6. Fix Model Hooks

Add try/catch to ALL model pre/post hooks:

**models/payment.model.js** (line 118):
```javascript
paymentSchema.pre('save', async function(next) {
    try {
        if (this.isNew && !this.paymentNumber) {
            const year = new Date().getFullYear();
            const count = await this.constructor.countDocuments({
                paymentNumber: new RegExp(`^PAY-${year}`)
            });
            this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});
```

**Apply to:**
- models/payment.model.js
- models/retainer.model.js
- All other models with hooks

### 7. Fix createNotification (notification.controller.js)

**Line 159 - CHANGE:**
```javascript
} catch (error) {
    console.error('Error creating notification:', error);
    return null;
}
```

**TO:**
```javascript
} catch (error) {
    console.error('Error creating notification:', error);
    throw error;  // Let caller decide if critical
}
```

**Then update all callers to handle errors:**
```javascript
try {
    await createNotification({...});
} catch (err) {
    console.warn('Notification failed (non-critical):', err);
}
```

---

## TESTING AFTER FIXES

Run these scenarios to verify:

### Test 1: Unhandled Rejection
```javascript
// Add temporary code to any controller:
Promise.reject(new Error('Test rejection'));

// Should log error, NOT crash server
```

### Test 2: Database Down
```bash
# Stop MongoDB
sudo systemctl stop mongod

# Start server
node server.js

# Should exit with error message, not hang
```

### Test 3: Invalid JWT
```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:8080/api/auth/status

# Should return 401 error, not 500
```

---

## FILES TO MODIFY

**Priority 1 (CRITICAL):**
- [ ] src/server.js - Add global handlers
- [ ] src/configs/db.js - Fix startup
- [ ] src/controllers/legalDocument.controller.js - Remove .catch()
- [ ] src/middlewares/userMiddleware.js - Fix catch block
- [ ] src/middlewares/authenticate.js - Fix catch block

**Priority 2 (HIGH):**
- [ ] src/controllers/auth.controller.js - Convert to asyncHandler
- [ ] src/controllers/case.controller.js - Convert to asyncHandler
- [ ] src/controllers/user.controller.js - Convert to asyncHandler
- [ ] src/controllers/invoice.controller.js - Convert to asyncHandler
- [ ] src/controllers/task.controller.js - Convert to asyncHandler
- [ ] src/controllers/notification.controller.js - Fix error re-throwing
- [ ] src/models/payment.model.js - Add try/catch to hooks
- [ ] src/models/retainer.model.js - Add try/catch to hooks

---

## VERIFICATION CHECKLIST

After implementing fixes:

- [ ] Server starts successfully
- [ ] Unhandled rejections logged (not crashing)
- [ ] Database connection failure exits gracefully
- [ ] Authentication errors return 401 (not 500)
- [ ] Notifications can fail without breaking operations
- [ ] Model hooks handle errors properly
- [ ] All tests pass

---

## ROLLBACK PLAN

If issues occur after deployment:

1. Keep backup of current code
2. Test in staging first
3. Monitor error logs closely
4. Be ready to rollback if crashes increase
5. Have team member available for 1 hour post-deploy

---

## ESTIMATED TIME

- Global handlers: 30 min
- Database connection: 15 min
- Error swallowing: 10 min
- Auth middleware: 15 min
- Controller migration: 4-6 hours (19 files × 15 min)
- Model hooks: 1 hour (9 files)
- createNotification: 1 hour (update callers)
- Testing: 2 hours

**Total: ~10 hours (1.5 days)**

---

## NEED HELP?

See full report: `ASYNC_AWAIT_ERROR_HANDLING_SECURITY_REPORT.md`

Common issues:
- **Import errors**: Make sure `asyncHandler` is imported
- **Middleware errors**: Ensure error middleware is AFTER routes
- **Model errors**: Check Mongoose version compatibility
