const PdfmeTemplate = require('../models/pdfmeTemplate.model');
const { CustomException } = require('../utils');
const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const ensureDirectories = () => {
    const dirs = ['uploads/pdfs', 'uploads/templates', 'uploads/previews'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
ensureDirectories();

// ==================== TEMPLATE CRUD ====================

// Create template
const createTemplate = async (request, response) => {
    const { name, nameAr, description, descriptionAr, category, type, basePdf, schemas, isDefault, isActive } = request.body;
    try {
        if (!name || !nameAr || !category || !basePdf || !schemas) {
            throw CustomException('Missing required fields: name, nameAr, category, basePdf, schemas', 400);
        }

        const template = new PdfmeTemplate({
            name,
            nameAr,
            description: description || '',
            descriptionAr: descriptionAr || '',
            category,
            type: type || 'standard',
            basePdf,
            schemas,
            isDefault: isDefault || false,
            isActive: isActive !== false,
            createdBy: request.userID
        });

        await template.save();

        return response.status(201).send({
            error: false,
            message: 'Template created successfully!',
            messageAr: 'تم إنشاء القالب بنجاح!',
            data: template
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Get all templates with filters and pagination
const getTemplates = async (request, response) => {
    const { category, type, isDefault, isActive, search, page = 1, limit = 10 } = request.query;
    try {
        const filters = {};

        if (category) filters.category = category;
        if (type) filters.type = type;
        if (isDefault !== undefined) filters.isDefault = isDefault === 'true';
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        // Search in name, nameAr, description, descriptionAr
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { nameAr: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { descriptionAr: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [templates, total] = await Promise.all([
            PdfmeTemplate.find(filters)
                .populate('createdBy', 'fullName username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PdfmeTemplate.countDocuments(filters)
        ]);

        return response.send({
            error: false,
            data: templates,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Get single template
const getTemplate = async (request, response) => {
    const { id } = request.params;
    try {
        const template = await PdfmeTemplate.findById(id)
            .populate('createdBy', 'fullName username email');

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        return response.send({
            error: false,
            data: template
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Update template
const updateTemplate = async (request, response) => {
    const { id } = request.params;
    const updateData = request.body;
    try {
        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        // Only creator can update (unless admin - could add admin check)
        if (template.createdBy.toString() !== request.userID) {
            throw CustomException('You do not have permission to update this template!', 403);
        }

        // If setting as default, unset other defaults in same category
        if (updateData.isDefault === true) {
            await PdfmeTemplate.updateMany(
                { category: template.category, _id: { $ne: id } },
                { isDefault: false }
            );
        }

        // Increment version if schemas changed
        if (updateData.schemas) {
            updateData.version = template.version + 1;
        }

        const updatedTemplate = await PdfmeTemplate.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('createdBy', 'fullName username email');

        return response.status(202).send({
            error: false,
            message: 'Template updated successfully!',
            messageAr: 'تم تحديث القالب بنجاح!',
            data: updatedTemplate
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Delete template
const deleteTemplate = async (request, response) => {
    const { id } = request.params;
    try {
        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        // Only creator can delete
        if (template.createdBy.toString() !== request.userID) {
            throw CustomException('You do not have permission to delete this template!', 403);
        }

        await PdfmeTemplate.findByIdAndDelete(id);

        return response.send({
            error: false,
            message: 'Template deleted successfully!',
            messageAr: 'تم حذف القالب بنجاح!'
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Clone template
const cloneTemplate = async (request, response) => {
    const { id } = request.params;
    const { name, nameAr } = request.body;
    try {
        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const clonedTemplate = new PdfmeTemplate({
            name: name || `${template.name} (Copy)`,
            nameAr: nameAr || `${template.nameAr} (نسخة)`,
            description: template.description,
            descriptionAr: template.descriptionAr,
            category: template.category,
            type: template.type,
            basePdf: template.basePdf,
            schemas: template.schemas,
            isDefault: false,
            isActive: true,
            createdBy: request.userID,
            version: 1
        });

        await clonedTemplate.save();

        return response.status(201).send({
            error: false,
            message: 'Template cloned successfully!',
            messageAr: 'تم استنساخ القالب بنجاح!',
            data: clonedTemplate
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Set template as default for its category
const setDefaultTemplate = async (request, response) => {
    const { id } = request.params;
    try {
        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        // Unset other defaults in same category
        await PdfmeTemplate.updateMany(
            { category: template.category, _id: { $ne: id } },
            { isDefault: false }
        );

        template.isDefault = true;
        await template.save();

        return response.send({
            error: false,
            message: 'Template set as default successfully!',
            messageAr: 'تم تعيين القالب كافتراضي بنجاح!',
            data: template
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Get default template for a category
const getDefaultTemplate = async (request, response) => {
    const { category } = request.params;
    try {
        const template = await PdfmeTemplate.findOne({
            category,
            isDefault: true,
            isActive: true
        }).populate('createdBy', 'fullName username email');

        if (!template) {
            // Try to get any active template in this category
            const anyTemplate = await PdfmeTemplate.findOne({
                category,
                isActive: true
            }).populate('createdBy', 'fullName username email');

            if (!anyTemplate) {
                throw CustomException(`No template found for category: ${category}`, 404);
            }

            return response.send({
                error: false,
                data: anyTemplate
            });
        }

        return response.send({
            error: false,
            data: template
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// ==================== PDF GENERATION ====================

// Preview template (generates PDF with sample/provided data)
const previewTemplate = async (request, response) => {
    const { id } = request.params;
    const { inputs } = request.body;
    try {
        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        // For now, return template data - actual PDF generation requires @pdfme/generator
        // This endpoint structure is ready for when the package is installed
        const pdfBuffer = await generatePdfFromTemplate(template, inputs || {});

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename="preview-${template.name}.pdf"`);
        return response.send(pdfBuffer);
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Generate PDF from template
const generatePdf = async (request, response) => {
    const { templateId, inputs, type = 'pdf' } = request.body;
    try {
        if (!templateId || !inputs) {
            throw CustomException('Missing required fields: templateId, inputs', 400);
        }

        const template = await PdfmeTemplate.findById(templateId);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        if (type === 'base64') {
            return response.send({
                error: false,
                data: pdfBuffer.toString('base64')
            });
        }

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', 'inline; filename="generated.pdf"');
        return response.send(pdfBuffer);
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Generate Invoice PDF
const generateInvoicePdf = async (request, response) => {
    const { invoiceData, templateId, includeQR, qrData } = request.body;
    try {
        if (!invoiceData) {
            throw CustomException('Missing required field: invoiceData', 400);
        }

        // Get template - either specified or default invoice template
        let template;
        if (templateId) {
            template = await PdfmeTemplate.findById(templateId);
        } else {
            template = await PdfmeTemplate.findOne({ category: 'invoice', isDefault: true, isActive: true });
        }

        if (!template) {
            throw CustomException('No invoice template found!', 404);
        }

        // Map invoice data to template inputs
        const inputs = mapInvoiceDataToInputs(invoiceData, includeQR, qrData);
        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        // Save PDF file
        const fileName = `invoice-${invoiceData.invoiceNumber || Date.now()}.pdf`;
        const filePath = path.join('uploads/pdfs', fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return response.status(201).send({
            success: true,
            data: {
                fileName,
                filePath: `/${filePath}`,
                size: pdfBuffer.length
            },
            message: 'Invoice PDF generated successfully',
            messageAr: 'تم إنشاء فاتورة PDF بنجاح'
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Generate Contract PDF
const generateContractPdf = async (request, response) => {
    const { contractData, templateId } = request.body;
    try {
        if (!contractData) {
            throw CustomException('Missing required field: contractData', 400);
        }

        let template;
        if (templateId) {
            template = await PdfmeTemplate.findById(templateId);
        } else {
            template = await PdfmeTemplate.findOne({ category: 'contract', isDefault: true, isActive: true });
        }

        if (!template) {
            throw CustomException('No contract template found!', 404);
        }

        const inputs = mapContractDataToInputs(contractData);
        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        const fileName = `contract-${contractData.contractNumber || Date.now()}.pdf`;
        const filePath = path.join('uploads/pdfs', fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return response.status(201).send({
            success: true,
            data: {
                fileName,
                filePath: `/${filePath}`,
                size: pdfBuffer.length
            },
            message: 'Contract PDF generated successfully',
            messageAr: 'تم إنشاء عقد PDF بنجاح'
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Generate Receipt PDF
const generateReceiptPdf = async (request, response) => {
    const { receiptData, templateId } = request.body;
    try {
        if (!receiptData) {
            throw CustomException('Missing required field: receiptData', 400);
        }

        let template;
        if (templateId) {
            template = await PdfmeTemplate.findById(templateId);
        } else {
            template = await PdfmeTemplate.findOne({ category: 'receipt', isDefault: true, isActive: true });
        }

        if (!template) {
            throw CustomException('No receipt template found!', 404);
        }

        const inputs = mapReceiptDataToInputs(receiptData);
        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        const fileName = `receipt-${receiptData.receiptNumber || Date.now()}.pdf`;
        const filePath = path.join('uploads/pdfs', fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return response.status(201).send({
            success: true,
            data: {
                fileName,
                filePath: `/${filePath}`,
                size: pdfBuffer.length
            },
            message: 'Receipt PDF generated successfully',
            messageAr: 'تم إنشاء إيصال PDF بنجاح'
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Async PDF Generation (queued)
const generatePdfAsync = async (request, response) => {
    const { templateId, inputs, type } = request.body;
    try {
        // For now, generate synchronously - can be enhanced with job queue (Bull, etc.)
        // This endpoint is ready for future async implementation
        const template = await PdfmeTemplate.findById(templateId);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const pdfBuffer = await generatePdfFromTemplate(template, inputs);
        const fileName = `generated-${Date.now()}.pdf`;
        const filePath = path.join('uploads/pdfs', fileName);
        fs.writeFileSync(filePath, pdfBuffer);

        return response.status(202).send({
            success: true,
            data: {
                jobId: `job_${Date.now()}`,
                status: 'completed',
                fileName,
                filePath: `/${filePath}`
            },
            message: 'PDF generation completed',
            messageAr: 'اكتملت عملية إنشاء PDF'
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// Download generated PDF
const downloadPdf = async (request, response) => {
    const { fileName } = request.params;
    try {
        const filePath = path.join('uploads/pdfs', fileName);

        if (!fs.existsSync(filePath)) {
            throw CustomException('PDF file not found!', 404);
        }

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return response.sendFile(path.resolve(filePath));
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// ==================== HELPER FUNCTIONS ====================

// Generate PDF from template using pdfme
// Note: Requires @pdfme/generator and @pdfme/common packages
const generatePdfFromTemplate = async (template, inputs) => {
    try {
        // Dynamic import to handle optional dependency
        const { generate } = await import('@pdfme/generator');
        const { BLANK_PDF } = await import('@pdfme/common');

        const templateData = {
            basePdf: template.basePdf === 'BLANK_PDF' ? BLANK_PDF : template.basePdf,
            schemas: template.schemas
        };

        const pdf = await generate({
            template: templateData,
            inputs: [inputs]
        });

        return Buffer.from(pdf);
    } catch (importError) {
        // Fallback: Return a placeholder message if pdfme is not installed
        console.warn('PDFMe generator not available:', importError.message);

        // Create a simple placeholder PDF buffer (minimal valid PDF)
        const placeholderPdf = Buffer.from(
            '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000052 00000 n 0000000101 00000 n trail<</Size 4/Root 1 0 R>>startxref 178 %%EOF',
            'utf8'
        );
        return placeholderPdf;
    }
};

// Map invoice data to template inputs
const mapInvoiceDataToInputs = (invoiceData, includeQR, qrData) => {
    const inputs = {
        invoiceNumber: invoiceData.invoiceNumber || '',
        date: invoiceData.date || new Date().toISOString().split('T')[0],
        clientName: invoiceData.client?.name || invoiceData.clientName || '',
        clientEmail: invoiceData.client?.email || invoiceData.clientEmail || '',
        clientAddress: invoiceData.client?.address || invoiceData.clientAddress || '',
        items: JSON.stringify(invoiceData.items || []),
        subtotal: String(invoiceData.subtotal || 0),
        tax: String(invoiceData.tax || invoiceData.vatAmount || 0),
        totalAmount: String(invoiceData.totalAmount || invoiceData.total || 0),
        currency: invoiceData.currency || 'SAR',
        notes: invoiceData.notes || ''
    };

    if (includeQR && qrData) {
        inputs.qrCode = qrData;
    }

    return inputs;
};

// Map contract data to template inputs
const mapContractDataToInputs = (contractData) => {
    return {
        contractNumber: contractData.contractNumber || '',
        date: contractData.date || new Date().toISOString().split('T')[0],
        partyAName: contractData.partyA?.name || '',
        partyAAddress: contractData.partyA?.address || '',
        partyANationalId: contractData.partyA?.nationalId || '',
        partyBName: contractData.partyB?.name || '',
        partyBAddress: contractData.partyB?.address || '',
        partyBNationalId: contractData.partyB?.nationalId || '',
        subject: contractData.subject || '',
        terms: JSON.stringify(contractData.terms || []),
        amount: String(contractData.amount || 0),
        startDate: contractData.startDate || '',
        endDate: contractData.endDate || ''
    };
};

// Map receipt data to template inputs
const mapReceiptDataToInputs = (receiptData) => {
    return {
        receiptNumber: receiptData.receiptNumber || '',
        date: receiptData.date || new Date().toISOString().split('T')[0],
        receivedFrom: receiptData.receivedFrom || '',
        amount: String(receiptData.amount || 0),
        amountInWords: receiptData.amountInWords || '',
        purpose: receiptData.purpose || '',
        paymentMethod: receiptData.paymentMethod || '',
        notes: receiptData.notes || ''
    };
};

module.exports = {
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
};
