const mongoose = require('mongoose');

const pdfmeTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nameAr: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    descriptionAr: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['invoice', 'contract', 'receipt', 'report', 'statement', 'letter', 'certificate', 'custom'],
        required: true
    },
    type: {
        type: String,
        enum: ['standard', 'detailed', 'summary', 'minimal', 'custom'],
        default: 'standard'
    },
    basePdf: {
        type: String,
        required: true
    },
    schemas: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: []
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    previewUrl: {
        type: String
    }
}, {
    versionKey: false,
    timestamps: true
});

// Indexes for efficient queries
pdfmeTemplateSchema.index({ category: 1, isDefault: 1 });
pdfmeTemplateSchema.index({ createdBy: 1 });
pdfmeTemplateSchema.index({ isActive: 1 });
pdfmeTemplateSchema.index({ name: 'text', nameAr: 'text', description: 'text', descriptionAr: 'text' });

// Pre-save hook to ensure only one default per category
pdfmeTemplateSchema.pre('save', async function(next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { category: this.category, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model('PdfmeTemplate', pdfmeTemplateSchema);
