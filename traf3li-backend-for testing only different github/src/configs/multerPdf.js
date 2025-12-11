const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/pdfs', 'uploads/templates', 'uploads/previews'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for PDFs
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/pdfs');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for templates
const templateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/templates');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'template-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for PDFs only
const pdfFilter = (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed.'));
    }
};

// File filter for PDFs and images (for templates with background images)
const templateFilter = (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const mimetype = allowedMimes.includes(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and image files (JPEG, PNG) are allowed.'));
    }
};

// PDF upload middleware
const uploadPdf = multer({
    storage: pdfStorage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit for PDFs
    },
    fileFilter: pdfFilter
});

// Template upload middleware
const uploadTemplate = multer({
    storage: templateStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for templates (can include images)
    },
    fileFilter: templateFilter
});

module.exports = {
    uploadPdf,
    uploadTemplate
};
