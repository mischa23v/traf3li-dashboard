const express = require('express');
const { userMiddleware } = require('../middlewares');
const {
    // Template CRUD
    createTemplate,
    getTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    setDefaultTemplate,
    getDefaultTemplate,
    // PDF Generation
    previewTemplate,
    generatePdf,
    generateInvoicePdf,
    generateContractPdf,
    generateReceiptPdf,
    generatePdfAsync,
    downloadPdf
} = require('../controllers/pdfme.controller');

const router = express.Router();

// ==================== TEMPLATE ROUTES ====================

// GET /api/pdfme/templates - List all templates with filters
router.get('/templates', userMiddleware, getTemplates);

// GET /api/pdfme/templates/default/:category - Get default template for category
router.get('/templates/default/:category', userMiddleware, getDefaultTemplate);

// GET /api/pdfme/templates/:id - Get single template
router.get('/templates/:id', userMiddleware, getTemplate);

// POST /api/pdfme/templates - Create new template
router.post('/templates', userMiddleware, createTemplate);

// PUT /api/pdfme/templates/:id - Update template
router.put('/templates/:id', userMiddleware, updateTemplate);

// DELETE /api/pdfme/templates/:id - Delete template
router.delete('/templates/:id', userMiddleware, deleteTemplate);

// POST /api/pdfme/templates/:id/clone - Clone template
router.post('/templates/:id/clone', userMiddleware, cloneTemplate);

// POST /api/pdfme/templates/:id/set-default - Set as default
router.post('/templates/:id/set-default', userMiddleware, setDefaultTemplate);

// POST /api/pdfme/templates/:id/preview - Preview template with inputs
router.post('/templates/:id/preview', userMiddleware, previewTemplate);

// ==================== PDF GENERATION ROUTES ====================

// POST /api/pdfme/generate - Generate PDF (sync)
router.post('/generate', userMiddleware, generatePdf);

// POST /api/pdfme/generate/async - Generate PDF (async/queued)
router.post('/generate/async', userMiddleware, generatePdfAsync);

// POST /api/pdfme/generate/invoice - Generate invoice PDF
router.post('/generate/invoice', userMiddleware, generateInvoicePdf);

// POST /api/pdfme/generate/contract - Generate contract PDF
router.post('/generate/contract', userMiddleware, generateContractPdf);

// POST /api/pdfme/generate/receipt - Generate receipt PDF
router.post('/generate/receipt', userMiddleware, generateReceiptPdf);

// GET /api/pdfme/download/:fileName - Download generated PDF
router.get('/download/:fileName', userMiddleware, downloadPdf);

module.exports = router;
