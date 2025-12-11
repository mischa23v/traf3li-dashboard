const PdfmeTemplate = require('../models/pdfmeTemplate.model');
const { CustomException } = require('../utils');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Import pdfme packages
const { generate } = require('@pdfme/generator');
const { BLANK_PDF } = require('@pdfme/common');

// ==================== VALIDATION HELPERS ====================

const VALID_CATEGORIES = ['invoice', 'contract', 'receipt', 'report', 'statement', 'letter', 'certificate', 'custom'];
const VALID_TYPES = ['standard', 'detailed', 'summary', 'minimal', 'custom'];

// Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Sanitize filename to prevent path traversal
const sanitizeFileName = (fileName) => {
    if (!fileName || typeof fileName !== 'string') return null;
    // Remove any path components and only keep the basename
    const sanitized = path.basename(fileName);
    // Only allow alphanumeric, dash, underscore, and .pdf extension
    if (!/^[\w\-]+\.pdf$/i.test(sanitized)) return null;
    return sanitized;
};

// Validate string field
const validateString = (value, fieldName, minLength = 1, maxLength = 500) => {
    if (!value || typeof value !== 'string') {
        throw CustomException(`${fieldName} is required and must be a string`, 400);
    }
    if (value.length < minLength || value.length > maxLength) {
        throw CustomException(`${fieldName} must be between ${minLength} and ${maxLength} characters`, 400);
    }
    return value.trim();
};

// Validate category
const validateCategory = (category) => {
    if (!category || !VALID_CATEGORIES.includes(category)) {
        throw CustomException(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
    }
    return category;
};

// Validate type
const validateType = (type) => {
    if (type && !VALID_TYPES.includes(type)) {
        throw CustomException(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`, 400);
    }
    return type || 'standard';
};

// Validate schemas array
const validateSchemas = (schemas) => {
    if (!schemas || !Array.isArray(schemas)) {
        throw CustomException('schemas must be an array', 400);
    }
    if (schemas.length === 0) {
        throw CustomException('schemas array cannot be empty', 400);
    }
    return schemas;
};

// Validate basePdf
const validateBasePdf = (basePdf) => {
    if (!basePdf || typeof basePdf !== 'string') {
        throw CustomException('basePdf is required', 400);
    }
    // Allow BLANK_PDF keyword or base64 data
    if (basePdf !== 'BLANK_PDF' && !basePdf.startsWith('data:application/pdf')) {
        throw CustomException('basePdf must be "BLANK_PDF" or a valid base64 PDF data URL', 400);
    }
    return basePdf;
};

// Validate pagination
const validatePagination = (page, limit) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return {
        page: Math.max(1, pageNum),
        limit: Math.min(100, Math.max(1, limitNum)) // Max 100 items per page
    };
};

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
    try {
        const { name, nameAr, description, descriptionAr, category, type, basePdf, schemas, isDefault, isActive } = request.body;

        // Validate required fields
        const validatedName = validateString(name, 'name', 1, 200);
        const validatedNameAr = validateString(nameAr, 'nameAr', 1, 200);
        const validatedCategory = validateCategory(category);
        const validatedType = validateType(type);
        const validatedBasePdf = validateBasePdf(basePdf);
        const validatedSchemas = validateSchemas(schemas);

        const template = new PdfmeTemplate({
            name: validatedName,
            nameAr: validatedNameAr,
            description: description ? String(description).substring(0, 1000) : '',
            descriptionAr: descriptionAr ? String(descriptionAr).substring(0, 1000) : '',
            category: validatedCategory,
            type: validatedType,
            basePdf: validatedBasePdf,
            schemas: validatedSchemas,
            isDefault: Boolean(isDefault),
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
    try {
        const { category, type, isDefault, isActive, search } = request.query;
        const { page, limit } = validatePagination(request.query.page, request.query.limit);

        const filters = {};

        if (category && VALID_CATEGORIES.includes(category)) {
            filters.category = category;
        }
        if (type && VALID_TYPES.includes(type)) {
            filters.type = type;
        }
        if (isDefault !== undefined) {
            filters.isDefault = isDefault === 'true';
        }
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        // Search in name, nameAr, description, descriptionAr (sanitize search input)
        if (search && typeof search === 'string' && search.length <= 100) {
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filters.$or = [
                { name: { $regex: sanitizedSearch, $options: 'i' } },
                { nameAr: { $regex: sanitizedSearch, $options: 'i' } },
                { description: { $regex: sanitizedSearch, $options: 'i' } },
                { descriptionAr: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [templates, total] = await Promise.all([
            PdfmeTemplate.find(filters)
                .populate('createdBy', 'fullName username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            PdfmeTemplate.countDocuments(filters)
        ]);

        return response.send({
            error: false,
            data: templates,
            total,
            page,
            limit
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
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

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
    try {
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        // Only creator can update
        if (template.createdBy.toString() !== request.userID) {
            throw CustomException('You do not have permission to update this template!', 403);
        }

        const updateData = {};
        const { name, nameAr, description, descriptionAr, category, type, basePdf, schemas, isDefault, isActive } = request.body;

        // Validate and add only provided fields
        if (name !== undefined) updateData.name = validateString(name, 'name', 1, 200);
        if (nameAr !== undefined) updateData.nameAr = validateString(nameAr, 'nameAr', 1, 200);
        if (description !== undefined) updateData.description = String(description).substring(0, 1000);
        if (descriptionAr !== undefined) updateData.descriptionAr = String(descriptionAr).substring(0, 1000);
        if (category !== undefined) updateData.category = validateCategory(category);
        if (type !== undefined) updateData.type = validateType(type);
        if (basePdf !== undefined) updateData.basePdf = validateBasePdf(basePdf);
        if (schemas !== undefined) {
            updateData.schemas = validateSchemas(schemas);
            updateData.version = template.version + 1;
        }
        if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        // If setting as default, unset other defaults in same category
        if (updateData.isDefault === true) {
            const categoryToUse = updateData.category || template.category;
            await PdfmeTemplate.updateMany(
                { category: categoryToUse, _id: { $ne: id } },
                { isDefault: false }
            );
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
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

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
    try {
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const { name, nameAr } = request.body;

        const clonedTemplate = new PdfmeTemplate({
            name: name ? validateString(name, 'name', 1, 200) : `${template.name} (Copy)`,
            nameAr: nameAr ? validateString(nameAr, 'nameAr', 1, 200) : `${template.nameAr} (نسخة)`,
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
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

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
        if (!VALID_CATEGORIES.includes(category)) {
            throw CustomException(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`, 400);
        }

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

// Generate PDF from template using pdfme
const generatePdfFromTemplate = async (template, inputs) => {
    const templateData = {
        basePdf: template.basePdf === 'BLANK_PDF' ? BLANK_PDF : template.basePdf,
        schemas: template.schemas
    };

    const pdf = await generate({
        template: templateData,
        inputs: [inputs]
    });

    return Buffer.from(pdf);
};

// Preview template (generates PDF with sample/provided data)
const previewTemplate = async (request, response) => {
    const { id } = request.params;
    try {
        if (!isValidObjectId(id)) {
            throw CustomException('Invalid template ID', 400);
        }

        const template = await PdfmeTemplate.findById(id);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const { inputs } = request.body;
        const pdfBuffer = await generatePdfFromTemplate(template, inputs || {});

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `inline; filename="preview-${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
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
    try {
        const { templateId, inputs, type = 'pdf' } = request.body;

        if (!templateId) {
            throw CustomException('templateId is required', 400);
        }
        if (!isValidObjectId(templateId)) {
            throw CustomException('Invalid template ID', 400);
        }
        if (!inputs || typeof inputs !== 'object') {
            throw CustomException('inputs must be an object', 400);
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
    try {
        const { invoiceData, templateId, includeQR, qrData } = request.body;

        if (!invoiceData || typeof invoiceData !== 'object') {
            throw CustomException('invoiceData is required and must be an object', 400);
        }

        // Get template - either specified or default invoice template
        let template;
        if (templateId) {
            if (!isValidObjectId(templateId)) {
                throw CustomException('Invalid template ID', 400);
            }
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

        // Generate safe filename
        const invoiceNum = String(invoiceData.invoiceNumber || Date.now()).replace(/[^a-zA-Z0-9\-]/g, '_');
        const fileName = `invoice-${invoiceNum}.pdf`;
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
    try {
        const { contractData, templateId } = request.body;

        if (!contractData || typeof contractData !== 'object') {
            throw CustomException('contractData is required and must be an object', 400);
        }

        let template;
        if (templateId) {
            if (!isValidObjectId(templateId)) {
                throw CustomException('Invalid template ID', 400);
            }
            template = await PdfmeTemplate.findById(templateId);
        } else {
            template = await PdfmeTemplate.findOne({ category: 'contract', isDefault: true, isActive: true });
        }

        if (!template) {
            throw CustomException('No contract template found!', 404);
        }

        const inputs = mapContractDataToInputs(contractData);
        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        const contractNum = String(contractData.contractNumber || Date.now()).replace(/[^a-zA-Z0-9\-]/g, '_');
        const fileName = `contract-${contractNum}.pdf`;
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
    try {
        const { receiptData, templateId } = request.body;

        if (!receiptData || typeof receiptData !== 'object') {
            throw CustomException('receiptData is required and must be an object', 400);
        }

        let template;
        if (templateId) {
            if (!isValidObjectId(templateId)) {
                throw CustomException('Invalid template ID', 400);
            }
            template = await PdfmeTemplate.findById(templateId);
        } else {
            template = await PdfmeTemplate.findOne({ category: 'receipt', isDefault: true, isActive: true });
        }

        if (!template) {
            throw CustomException('No receipt template found!', 404);
        }

        const inputs = mapReceiptDataToInputs(receiptData);
        const pdfBuffer = await generatePdfFromTemplate(template, inputs);

        const receiptNum = String(receiptData.receiptNumber || Date.now()).replace(/[^a-zA-Z0-9\-]/g, '_');
        const fileName = `receipt-${receiptNum}.pdf`;
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
    try {
        const { templateId, inputs } = request.body;

        if (!templateId) {
            throw CustomException('templateId is required', 400);
        }
        if (!isValidObjectId(templateId)) {
            throw CustomException('Invalid template ID', 400);
        }

        const template = await PdfmeTemplate.findById(templateId);

        if (!template) {
            throw CustomException('Template not found!', 404);
        }

        const pdfBuffer = await generatePdfFromTemplate(template, inputs || {});
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

// Download generated PDF - SECURED against path traversal
const downloadPdf = async (request, response) => {
    try {
        const { fileName } = request.params;

        // Sanitize filename to prevent path traversal
        const sanitizedFileName = sanitizeFileName(fileName);
        if (!sanitizedFileName) {
            throw CustomException('Invalid file name', 400);
        }

        const filePath = path.join('uploads/pdfs', sanitizedFileName);
        const absolutePath = path.resolve(filePath);

        // Double-check the resolved path is within uploads/pdfs
        const uploadsDir = path.resolve('uploads/pdfs');
        if (!absolutePath.startsWith(uploadsDir)) {
            throw CustomException('Access denied', 403);
        }

        if (!fs.existsSync(absolutePath)) {
            throw CustomException('PDF file not found!', 404);
        }

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
        return response.sendFile(absolutePath);
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// ==================== HELPER FUNCTIONS ====================

// Map invoice data to template inputs
const mapInvoiceDataToInputs = (invoiceData, includeQR, qrData) => {
    const inputs = {
        invoiceNumber: String(invoiceData.invoiceNumber || ''),
        date: String(invoiceData.date || new Date().toISOString().split('T')[0]),
        clientName: String(invoiceData.client?.name || invoiceData.clientName || ''),
        clientEmail: String(invoiceData.client?.email || invoiceData.clientEmail || ''),
        clientAddress: String(invoiceData.client?.address || invoiceData.clientAddress || ''),
        items: JSON.stringify(invoiceData.items || []),
        subtotal: String(invoiceData.subtotal || 0),
        tax: String(invoiceData.tax || invoiceData.vatAmount || 0),
        totalAmount: String(invoiceData.totalAmount || invoiceData.total || 0),
        currency: String(invoiceData.currency || 'SAR'),
        notes: String(invoiceData.notes || '')
    };

    if (includeQR && qrData) {
        inputs.qrCode = String(qrData);
    }

    return inputs;
};

// Map contract data to template inputs
const mapContractDataToInputs = (contractData) => {
    return {
        contractNumber: String(contractData.contractNumber || ''),
        date: String(contractData.date || new Date().toISOString().split('T')[0]),
        partyAName: String(contractData.partyA?.name || ''),
        partyAAddress: String(contractData.partyA?.address || ''),
        partyANationalId: String(contractData.partyA?.nationalId || ''),
        partyBName: String(contractData.partyB?.name || ''),
        partyBAddress: String(contractData.partyB?.address || ''),
        partyBNationalId: String(contractData.partyB?.nationalId || ''),
        subject: String(contractData.subject || ''),
        terms: JSON.stringify(contractData.terms || []),
        amount: String(contractData.amount || 0),
        startDate: String(contractData.startDate || ''),
        endDate: String(contractData.endDate || '')
    };
};

// Map receipt data to template inputs
const mapReceiptDataToInputs = (receiptData) => {
    return {
        receiptNumber: String(receiptData.receiptNumber || ''),
        date: String(receiptData.date || new Date().toISOString().split('T')[0]),
        receivedFrom: String(receiptData.receivedFrom || ''),
        amount: String(receiptData.amount || 0),
        amountInWords: String(receiptData.amountInWords || ''),
        purpose: String(receiptData.purpose || ''),
        paymentMethod: String(receiptData.paymentMethod || ''),
        notes: String(receiptData.notes || '')
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
