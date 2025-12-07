const express = require('express');
const { userMiddleware } = require('../middlewares');
const {
    createBenefit,
    getBenefits,
    getBenefitStats,
    getEmployeeBenefits,
    getBenefit,
    updateBenefit,
    deleteBenefit,
    bulkDeleteBenefits,
    activateBenefit,
    suspendBenefit,
    terminateBenefit,
    addDependent,
    removeDependent,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
    getBenefitsByType,
    addDocument,
    exportBenefits
} = require('../controllers/benefit.controller');

const app = express.Router();

// ==================== CRUD Operations ====================
app.post('/', userMiddleware, createBenefit);
app.get('/', userMiddleware, getBenefits);

// ==================== Statistics & Reports ====================
app.get('/stats', userMiddleware, getBenefitStats);
app.get('/by-type', userMiddleware, getBenefitsByType);
app.get('/export', userMiddleware, exportBenefits);

// ==================== Employee Benefits ====================
app.get('/employee/:employeeId', userMiddleware, getEmployeeBenefits);

// ==================== Bulk Operations ====================
app.post('/bulk-delete', userMiddleware, bulkDeleteBenefits);

// ==================== Single Benefit Operations ====================
app.get('/:id', userMiddleware, getBenefit);
app.put('/:id', userMiddleware, updateBenefit);
app.patch('/:id', userMiddleware, updateBenefit);
app.delete('/:id', userMiddleware, deleteBenefit);

// ==================== Status Actions ====================
app.post('/:id/activate', userMiddleware, activateBenefit);
app.post('/:id/suspend', userMiddleware, suspendBenefit);
app.post('/:id/terminate', userMiddleware, terminateBenefit);

// ==================== Dependents ====================
app.post('/:id/dependents', userMiddleware, addDependent);
app.delete('/:id/dependents/:memberId', userMiddleware, removeDependent);

// ==================== Beneficiaries ====================
app.post('/:id/beneficiaries', userMiddleware, addBeneficiary);
app.patch('/:id/beneficiaries/:beneficiaryId', userMiddleware, updateBeneficiary);
app.delete('/:id/beneficiaries/:beneficiaryId', userMiddleware, removeBeneficiary);

// ==================== Documents ====================
app.post('/:id/documents', userMiddleware, addDocument);

module.exports = app;
