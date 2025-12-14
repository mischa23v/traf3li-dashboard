/**
 * Saudi Arabia Validation Utilities
 * Validation functions for Saudi-specific data formats
 */

// ═══════════════════════════════════════════════════════════════
// NATIONAL ID VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi National ID or Iqama number
 * Saudi ID: 10 digits starting with 1
 * Iqama: 10 digits starting with 2
 *
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid
 */
const validateNationalId = (id) => {
    if (!id) return true; // Optional field
    const cleaned = String(id).trim();
    if (!/^\d{10}$/.test(cleaned)) return false;
    // Saudi ID starts with 1, Iqama starts with 2
    return cleaned.startsWith('1') || cleaned.startsWith('2');
};

/**
 * Validates specifically Saudi National ID (starts with 1)
 *
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid Saudi ID
 */
const validateSaudiId = (id) => {
    if (!id) return true;
    const cleaned = String(id).trim();
    return /^1\d{9}$/.test(cleaned);
};

/**
 * Validates specifically Iqama number (starts with 2)
 *
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid Iqama
 */
const validateIqamaNumber = (id) => {
    if (!id) return true;
    const cleaned = String(id).trim();
    return /^2\d{9}$/.test(cleaned);
};

// ═══════════════════════════════════════════════════════════════
// COMMERCIAL REGISTRATION VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi Commercial Registration (CR) Number
 * Must be exactly 10 digits
 *
 * @param {string} cr - The CR number to validate
 * @returns {boolean} True if valid
 */
const validateCRNumber = (cr) => {
    if (!cr) return true; // Optional field
    const cleaned = String(cr).trim();
    return /^\d{10}$/.test(cleaned);
};

// ═══════════════════════════════════════════════════════════════
// PHONE NUMBER VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi phone number
 * Accepts: +966501234567, 0501234567, 501234567
 *
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid
 */
const validateSaudiPhone = (phone) => {
    if (!phone) return true; // Optional field
    const cleaned = String(phone).replace(/\s/g, '');
    return /^(\+966|966|0)?5\d{8}$/.test(cleaned);
};

/**
 * Normalizes Saudi phone number to international format (+966...)
 *
 * @param {string} phone - The phone number to normalize
 * @returns {string} Normalized phone number
 */
const normalizeSaudiPhone = (phone) => {
    if (!phone) return phone;
    const cleaned = String(phone).replace(/\s/g, '');

    if (cleaned.startsWith('+966')) {
        return cleaned;
    } else if (cleaned.startsWith('966')) {
        return '+' + cleaned;
    } else if (cleaned.startsWith('05')) {
        return '+966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
        return '+966' + cleaned;
    }
    return cleaned;
};

// ═══════════════════════════════════════════════════════════════
// EMAIL VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates email address format
 *
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 */
const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const cleaned = String(email).trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
};

// ═══════════════════════════════════════════════════════════════
// IBAN VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi IBAN
 * Format: SA + 22 alphanumeric characters
 *
 * @param {string} iban - The IBAN to validate
 * @returns {boolean} True if valid format
 */
const validateSaudiIBAN = (iban) => {
    if (!iban) return true; // Optional field
    const cleaned = String(iban).toUpperCase().replace(/\s/g, '');
    if (!/^SA\d{22}$/.test(cleaned)) return false;

    // IBAN checksum validation (mod 97)
    const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);
    const numericString = rearranged.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) { // A-Z
            return (code - 55).toString();
        }
        return char;
    }).join('');

    let remainder = numericString;
    while (remainder.length > 2) {
        const block = remainder.substring(0, 9);
        remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length);
    }

    return parseInt(remainder, 10) % 97 === 1;
};

// ═══════════════════════════════════════════════════════════════
// VAT NUMBER VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi VAT Number
 * Format: 15 digits starting with 3
 *
 * @param {string} vat - The VAT number to validate
 * @returns {boolean} True if valid
 */
const validateSaudiVAT = (vat) => {
    if (!vat) return true; // Optional field
    const cleaned = String(vat).trim();
    return /^3\d{14}$/.test(cleaned);
};

// ═══════════════════════════════════════════════════════════════
// DATE VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates that a date is not in the future
 *
 * @param {Date|string} date - The date to validate
 * @returns {boolean} True if valid (not in future)
 */
const validateNotFutureDate = (date) => {
    if (!date) return true;
    const dateObj = new Date(date);
    return dateObj <= new Date();
};

/**
 * Validates that expiry date is after issue date
 *
 * @param {Date|string} issueDate - The issue date
 * @param {Date|string} expiryDate - The expiry date
 * @returns {boolean} True if expiry is after issue
 */
const validateExpiryAfterIssue = (issueDate, expiryDate) => {
    if (!issueDate || !expiryDate) return true;
    return new Date(expiryDate) > new Date(issueDate);
};

// ═══════════════════════════════════════════════════════════════
// CASE NUMBER VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates Saudi court case number format
 * Common formats: 12345/1445, 12345/1446ه
 *
 * @param {string} caseNumber - The case number to validate
 * @returns {boolean} True if valid format
 */
const validateCaseNumber = (caseNumber) => {
    if (!caseNumber) return true; // Optional field
    const cleaned = String(caseNumber).trim();
    // Matches: digits/Hijri year (with optional ه suffix)
    return /^\d+\/14\d{2}[ه]?$/.test(cleaned);
};

// ═══════════════════════════════════════════════════════════════
// AMOUNT VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validates monetary amount
 *
 * @param {number|string} amount - The amount to validate
 * @returns {boolean} True if valid positive number
 */
const validateAmount = (amount) => {
    if (amount === null || amount === undefined) return true;
    const num = Number(amount);
    return !isNaN(num) && num >= 0;
};

// ═══════════════════════════════════════════════════════════════
// COMPOSITE VALIDATORS
// ═══════════════════════════════════════════════════════════════

/**
 * Validates plaintiff/defendant individual data
 *
 * @param {Object} data - The individual data object
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validateIndividualParty = (data) => {
    const errors = [];

    if (data.nationalId && !validateNationalId(data.nationalId)) {
        errors.push('Invalid National ID/Iqama format (must be 10 digits starting with 1 or 2)');
    }
    if (data.phone && !validateSaudiPhone(data.phone)) {
        errors.push('Invalid Saudi phone number format');
    }
    if (data.email && !validateEmail(data.email)) {
        errors.push('Invalid email format');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validates plaintiff/defendant company data
 *
 * @param {Object} data - The company data object
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validateCompanyParty = (data) => {
    const errors = [];

    if (data.crNumber && !validateCRNumber(data.crNumber)) {
        errors.push('Invalid Commercial Registration number format (must be 10 digits)');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validates power of attorney data
 *
 * @param {Object} poa - The POA data object
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validatePowerOfAttorney = (poa) => {
    const errors = [];

    if (poa.poaDate && !validateNotFutureDate(poa.poaDate)) {
        errors.push('POA date cannot be in the future');
    }
    if (poa.poaDate && poa.poaExpiry && !validateExpiryAfterIssue(poa.poaDate, poa.poaExpiry)) {
        errors.push('POA expiry date must be after issue date');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validates claim data
 *
 * @param {Object} claim - The claim data object
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validateClaim = (claim) => {
    const errors = [];

    if (!claim.type) {
        errors.push('Claim type is required');
    }
    if (!validateAmount(claim.amount)) {
        errors.push('Claim amount must be a valid positive number');
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validates case data for creation/update
 *
 * @param {Object} caseData - The case data object
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
const validateCaseData = (caseData) => {
    const errors = [];

    // Validate plaintiff if provided
    if (caseData.plaintiffType === 'individual' && caseData.plaintiff) {
        const result = validateIndividualParty(caseData.plaintiff);
        errors.push(...result.errors.map(e => 'Plaintiff: ' + e));
    }
    if (caseData.plaintiffType === 'company' && caseData.plaintiff) {
        const result = validateCompanyParty(caseData.plaintiff);
        errors.push(...result.errors.map(e => 'Plaintiff: ' + e));
    }

    // Validate defendant if provided
    if (caseData.defendantType === 'individual' && caseData.defendant) {
        const result = validateIndividualParty(caseData.defendant);
        errors.push(...result.errors.map(e => 'Defendant: ' + e));
    }
    if (caseData.defendantType === 'company' && caseData.defendant) {
        const result = validateCompanyParty(caseData.defendant);
        errors.push(...result.errors.map(e => 'Defendant: ' + e));
    }

    // Validate power of attorney if provided
    if (caseData.powerOfAttorney) {
        const result = validatePowerOfAttorney(caseData.powerOfAttorney);
        errors.push(...result.errors.map(e => 'POA: ' + e));
    }

    // Validate claims if provided
    if (caseData.claims && Array.isArray(caseData.claims)) {
        caseData.claims.forEach((claim, index) => {
            const result = validateClaim(claim);
            errors.push(...result.errors.map(e => `Claim ${index + 1}: ` + e));
        });
    }

    // Validate case number format
    if (caseData.caseNumber && !validateCaseNumber(caseData.caseNumber)) {
        errors.push('Invalid case number format (expected: digits/Hijri year)');
    }

    // Validate labor case specific fields
    if (caseData.laborCaseSpecific) {
        const labor = caseData.laborCaseSpecific;
        if (labor.monthlySalary && !validateAmount(labor.monthlySalary)) {
            errors.push('Invalid monthly salary amount');
        }
        if (labor.employmentStartDate && labor.employmentEndDate) {
            if (new Date(labor.employmentEndDate) < new Date(labor.employmentStartDate)) {
                errors.push('Employment end date cannot be before start date');
            }
        }
    }

    // Validate commercial details
    if (caseData.commercialDetails) {
        if (caseData.commercialDetails.contractValue && !validateAmount(caseData.commercialDetails.contractValue)) {
            errors.push('Invalid contract value amount');
        }
    }

    return { valid: errors.length === 0, errors };
};

module.exports = {
    // Individual validators
    validateNationalId,
    validateSaudiId,
    validateIqamaNumber,
    validateCRNumber,
    validateSaudiPhone,
    normalizeSaudiPhone,
    validateEmail,
    validateSaudiIBAN,
    validateSaudiVAT,
    validateNotFutureDate,
    validateExpiryAfterIssue,
    validateCaseNumber,
    validateAmount,

    // Composite validators
    validateIndividualParty,
    validateCompanyParty,
    validatePowerOfAttorney,
    validateClaim,
    validateCaseData
};
