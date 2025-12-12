# Backend Implementation Guide: Najiz Integration for Clients & Leads

## Overview

This document provides detailed backend implementation instructions for adding Saudi Arabia Najiz (Ministry of Justice) integration fields to both **Client** and **Lead** models. Both models should have the same fields to ensure data consistency when leads convert to clients.

---

## Table of Contents

1. [Schema Updates](#schema-updates)
2. [Client Model Changes](#client-model-changes)
3. [Lead Model Changes](#lead-model-changes)
4. [API Endpoint Changes](#api-endpoint-changes)
5. [Database Indexes](#database-indexes)
6. [Migration Script](#migration-script)
7. [Validation Rules](#validation-rules)
8. [Virtual Fields](#virtual-fields)

---

## Schema Updates

### Shared Sub-Schemas (Create in `models/schemas/najiz.schema.js`)

```javascript
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Arabic Name Schema (الاسم الرباعي)
const arabicNameSchema = new Schema({
  firstName: { type: String, maxlength: 50 },        // الاسم الأول
  fatherName: { type: String, maxlength: 50 },       // اسم الأب
  grandfatherName: { type: String, maxlength: 50 },  // اسم الجد
  familyName: { type: String, maxlength: 50 },       // اسم العائلة
  fullName: { type: String, maxlength: 200 },        // الاسم الكامل (auto-generated)
}, { _id: false });

// National Address Schema (العنوان الوطني)
const nationalAddressSchema = new Schema({
  buildingNumber: { type: String, match: /^\d{4}$/ },     // رقم المبنى
  streetName: { type: String, maxlength: 100 },           // اسم الشارع (English)
  streetNameAr: { type: String, maxlength: 100 },         // اسم الشارع (Arabic)
  district: { type: String, maxlength: 100 },             // الحي (English)
  districtAr: { type: String, maxlength: 100 },           // الحي (Arabic)
  city: { type: String, maxlength: 100 },                 // المدينة (English)
  cityAr: { type: String, maxlength: 100 },               // المدينة (Arabic)
  region: { type: String, maxlength: 100 },               // المنطقة (English)
  regionAr: { type: String, maxlength: 100 },             // المنطقة (Arabic)
  regionCode: { type: String, match: /^(0[1-9]|1[0-3])$/ }, // رمز المنطقة
  postalCode: { type: String, match: /^\d{5}$/ },         // الرمز البريدي
  additionalNumber: { type: String, match: /^\d{4}$/ },   // الرقم الإضافي
  unitNumber: { type: String, maxlength: 10 },            // رقم الوحدة
  shortAddress: { type: String, maxlength: 8 },           // العنوان المختصر
  latitude: { type: Number, min: -90, max: 90 },          // خط العرض
  longitude: { type: Number, min: -180, max: 180 },       // خط الطول
  isVerified: { type: Boolean, default: false },          // التحقق من العنوان
  verifiedAt: Date,                                        // تاريخ التحقق
}, { _id: false });

// Sponsor Schema (for Iqama holders)
const sponsorSchema = new Schema({
  name: { type: String, maxlength: 100 },
  nameAr: { type: String, maxlength: 100 },
  identityNumber: { type: String, maxlength: 20 },
  relationship: { type: String, maxlength: 50 },
}, { _id: false });

// PO Box Schema
const poBoxSchema = new Schema({
  number: { type: String, maxlength: 20 },
  city: { type: String, maxlength: 100 },
  postalCode: { type: String, maxlength: 10 },
}, { _id: false });

// Identity Type Enum
const IDENTITY_TYPES = [
  'national_id',      // الهوية الوطنية
  'iqama',            // الإقامة
  'gcc_id',           // هوية مواطني الخليج
  'passport',         // جواز السفر
  'border_number',    // رقم الحدود
  'visitor_id',       // هوية زائر
  'temporary_id',     // هوية مؤقتة
  'diplomatic_id',    // هوية دبلوماسية
];

// GCC Countries
const GCC_COUNTRIES = ['SA', 'AE', 'KW', 'BH', 'OM', 'QA'];

// Gender Enum
const GENDERS = ['male', 'female'];

// Marital Status Enum
const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed'];

module.exports = {
  arabicNameSchema,
  nationalAddressSchema,
  sponsorSchema,
  poBoxSchema,
  IDENTITY_TYPES,
  GCC_COUNTRIES,
  GENDERS,
  MARITAL_STATUSES,
};
```

---

## Client Model Changes

### Update `models/Client.js`

Add these fields to the Client schema:

```javascript
const {
  arabicNameSchema,
  nationalAddressSchema,
  sponsorSchema,
  poBoxSchema,
  IDENTITY_TYPES,
  GCC_COUNTRIES,
  GENDERS,
  MARITAL_STATUSES,
} = require('./schemas/najiz.schema');

const clientSchema = new Schema({
  // ... existing fields ...

  // ═══════════════════════════════════════════════════════════════
  // INDIVIDUAL NAME FIELDS
  // ═══════════════════════════════════════════════════════════════

  fullNameArabic: { type: String, maxlength: 200 },
  fullNameEnglish: { type: String, maxlength: 200 },
  firstName: { type: String, maxlength: 100 },
  middleName: { type: String, maxlength: 100 },
  lastName: { type: String, maxlength: 100 },
  preferredName: { type: String, maxlength: 100 },
  salutation: { type: String, maxlength: 50 },
  suffix: { type: String, maxlength: 20 },

  // Arabic Name (الاسم الرباعي) - Najiz
  arabicName: arabicNameSchema,
  salutationAr: { type: String, maxlength: 50 },

  // ═══════════════════════════════════════════════════════════════
  // COMPANY FIELDS
  // ═══════════════════════════════════════════════════════════════

  companyName: { type: String, maxlength: 200 },
  companyNameEnglish: { type: String, maxlength: 200 },
  companyNameAr: { type: String, maxlength: 200 },
  crNumber: { type: String, match: /^\d{10}$/ },           // Commercial Registration
  unifiedNumber: { type: String, maxlength: 20 },          // 700 number
  vatNumber: { type: String, match: /^3\d{14}$/ },         // VAT (15 digits, starts with 3)
  municipalityLicense: { type: String, maxlength: 50 },
  chamberNumber: { type: String, maxlength: 50 },
  legalForm: { type: String, maxlength: 100 },
  legalFormAr: { type: String, maxlength: 100 },
  capital: { type: Number, min: 0 },
  capitalCurrency: { type: String, default: 'SAR', maxlength: 10 },
  establishmentDate: Date,
  crExpiryDate: Date,

  // Authorized Person (Company)
  authorizedPerson: { type: String, maxlength: 200 },
  authorizedPersonAr: { type: String, maxlength: 200 },
  authorizedPersonTitle: { type: String, maxlength: 100 },
  authorizedPersonIdentityType: { type: String, enum: IDENTITY_TYPES },
  authorizedPersonIdentityNumber: { type: String, maxlength: 20 },

  // ═══════════════════════════════════════════════════════════════
  // IDENTITY INFORMATION (Najiz)
  // ═══════════════════════════════════════════════════════════════

  identityType: {
    type: String,
    enum: IDENTITY_TYPES,
    default: 'national_id'
  },
  nationalId: {
    type: String,
    match: /^1\d{9}$/,    // 10 digits, starts with 1
    sparse: true,
    index: true
  },
  iqamaNumber: {
    type: String,
    match: /^2\d{9}$/,    // 10 digits, starts with 2
    sparse: true,
    index: true
  },
  gccId: { type: String, maxlength: 20 },
  gccCountry: { type: String, enum: GCC_COUNTRIES },
  borderNumber: { type: String, maxlength: 20 },
  visitorId: { type: String, maxlength: 20 },
  passportNumber: { type: String, maxlength: 20 },
  passportCountry: { type: String, maxlength: 100 },
  passportIssueDate: Date,
  passportExpiryDate: Date,
  passportIssuePlace: { type: String, maxlength: 100 },
  identityIssueDate: Date,
  identityExpiryDate: Date,
  identityIssuePlace: { type: String, maxlength: 100 },

  // ═══════════════════════════════════════════════════════════════
  // PERSONAL DETAILS (Najiz)
  // ═══════════════════════════════════════════════════════════════

  dateOfBirth: Date,
  dateOfBirthHijri: {
    type: String,
    match: /^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/
  },
  placeOfBirth: { type: String, maxlength: 100 },
  gender: { type: String, enum: GENDERS },
  maritalStatus: { type: String, enum: MARITAL_STATUSES },
  nationality: { type: String, maxlength: 100 },
  nationalityCode: { type: String, maxlength: 3 },  // ISO 3166-1 alpha-3

  // ═══════════════════════════════════════════════════════════════
  // SPONSOR (for Iqama holders)
  // ═══════════════════════════════════════════════════════════════

  sponsor: sponsorSchema,

  // ═══════════════════════════════════════════════════════════════
  // NATIONAL ADDRESS (العنوان الوطني) - Najiz
  // ═══════════════════════════════════════════════════════════════

  nationalAddress: nationalAddressSchema,
  workAddress: nationalAddressSchema,
  poBox: poBoxSchema,
  headquartersAddress: nationalAddressSchema,
  branchAddresses: [nationalAddressSchema],

  // Legacy address fields (keep for backward compatibility)
  address: Schema.Types.Mixed,  // String or Object
  city: { type: String, maxlength: 100 },
  district: { type: String, maxlength: 100 },
  province: { type: String, maxlength: 100 },
  region: { type: String, maxlength: 100 },
  postalCode: { type: String, maxlength: 10 },
  country: { type: String, maxlength: 100, default: 'Saudi Arabia' },

  // ═══════════════════════════════════════════════════════════════
  // COMMUNICATION PREFERENCES
  // ═══════════════════════════════════════════════════════════════

  preferredLanguage: { type: String, enum: ['ar', 'en'], default: 'ar' },
  preferredContactMethod: { type: String, enum: ['email', 'phone', 'sms', 'whatsapp'] },
  bestTimeToContact: String,
  doNotContact: { type: Boolean, default: false },
  doNotEmail: { type: Boolean, default: false },
  doNotCall: { type: Boolean, default: false },
  doNotSMS: { type: Boolean, default: false },

  // ═══════════════════════════════════════════════════════════════
  // RISK & CONFLICT
  // ═══════════════════════════════════════════════════════════════

  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: String,
  conflictCheckStatus: {
    type: String,
    enum: ['not_checked', 'clear', 'potential_conflict', 'confirmed_conflict'],
    default: 'not_checked'
  },
  conflictNotes: String,
  conflictCheckDate: Date,
  conflictCheckedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  // ═══════════════════════════════════════════════════════════════
  // VERIFICATION STATUS (Wathq/MOJ/Absher)
  // ═══════════════════════════════════════════════════════════════

  isVerified: { type: Boolean, default: false },
  verificationSource: { type: String, enum: ['wathq', 'absher', 'manual', 'najiz'] },
  verifiedAt: Date,
  verificationData: Schema.Types.Mixed,

  // ═══════════════════════════════════════════════════════════════
  // STATUS & CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════

  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'pending'],
    default: 'active'
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'vip'], default: 'normal' },
  vipStatus: { type: Boolean, default: false },
  tags: [String],
  practiceAreas: [String],

  // ... existing billing, conversion, and timestamp fields ...
});
```

---

## Lead Model Changes

### Update `models/Lead.js`

Add the **exact same fields** to the Lead schema to ensure consistency when converting leads to clients:

```javascript
const {
  arabicNameSchema,
  nationalAddressSchema,
  sponsorSchema,
  poBoxSchema,
  IDENTITY_TYPES,
  GCC_COUNTRIES,
  GENDERS,
  MARITAL_STATUSES,
} = require('./schemas/najiz.schema');

const leadSchema = new Schema({
  // ... existing fields (leadId, lawyerId, type, etc.) ...

  // ═══════════════════════════════════════════════════════════════
  // INDIVIDUAL NAME FIELDS
  // ═══════════════════════════════════════════════════════════════

  fullNameArabic: { type: String, maxlength: 200 },
  fullNameEnglish: { type: String, maxlength: 200 },
  firstName: { type: String, maxlength: 100 },
  middleName: { type: String, maxlength: 100 },
  lastName: { type: String, maxlength: 100 },
  preferredName: { type: String, maxlength: 100 },
  salutation: { type: String, maxlength: 50 },
  suffix: { type: String, maxlength: 20 },

  // Arabic Name (الاسم الرباعي) - Najiz
  arabicName: arabicNameSchema,
  salutationAr: { type: String, maxlength: 50 },

  // ═══════════════════════════════════════════════════════════════
  // COMPANY FIELDS
  // ═══════════════════════════════════════════════════════════════

  companyName: { type: String, maxlength: 200 },
  companyNameEnglish: { type: String, maxlength: 200 },
  companyNameAr: { type: String, maxlength: 200 },
  crNumber: { type: String, match: /^\d{10}$/ },
  unifiedNumber: { type: String, maxlength: 20 },
  vatNumber: { type: String, match: /^3\d{14}$/ },
  municipalityLicense: { type: String, maxlength: 50 },
  chamberNumber: { type: String, maxlength: 50 },
  legalForm: { type: String, maxlength: 100 },
  legalFormAr: { type: String, maxlength: 100 },
  capital: { type: Number, min: 0 },
  capitalCurrency: { type: String, default: 'SAR', maxlength: 10 },
  establishmentDate: Date,
  crExpiryDate: Date,

  // Authorized Person (Company)
  authorizedPerson: { type: String, maxlength: 200 },
  authorizedPersonAr: { type: String, maxlength: 200 },
  authorizedPersonTitle: { type: String, maxlength: 100 },
  authorizedPersonIdentityType: { type: String, enum: IDENTITY_TYPES },
  authorizedPersonIdentityNumber: { type: String, maxlength: 20 },

  // ═══════════════════════════════════════════════════════════════
  // IDENTITY INFORMATION (Najiz)
  // ═══════════════════════════════════════════════════════════════

  identityType: {
    type: String,
    enum: IDENTITY_TYPES,
    default: 'national_id'
  },
  nationalId: {
    type: String,
    match: /^1\d{9}$/,
    sparse: true,
    index: true
  },
  iqamaNumber: {
    type: String,
    match: /^2\d{9}$/,
    sparse: true,
    index: true
  },
  gccId: { type: String, maxlength: 20 },
  gccCountry: { type: String, enum: GCC_COUNTRIES },
  borderNumber: { type: String, maxlength: 20 },
  visitorId: { type: String, maxlength: 20 },
  passportNumber: { type: String, maxlength: 20 },
  passportCountry: { type: String, maxlength: 100 },
  passportIssueDate: Date,
  passportExpiryDate: Date,
  passportIssuePlace: { type: String, maxlength: 100 },
  identityIssueDate: Date,
  identityExpiryDate: Date,
  identityIssuePlace: { type: String, maxlength: 100 },

  // ═══════════════════════════════════════════════════════════════
  // PERSONAL DETAILS (Najiz)
  // ═══════════════════════════════════════════════════════════════

  dateOfBirth: Date,
  dateOfBirthHijri: {
    type: String,
    match: /^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/
  },
  placeOfBirth: { type: String, maxlength: 100 },
  gender: { type: String, enum: GENDERS },
  maritalStatus: { type: String, enum: MARITAL_STATUSES },
  nationality: { type: String, maxlength: 100 },
  nationalityCode: { type: String, maxlength: 3 },

  // ═══════════════════════════════════════════════════════════════
  // SPONSOR (for Iqama holders)
  // ═══════════════════════════════════════════════════════════════

  sponsor: sponsorSchema,

  // ═══════════════════════════════════════════════════════════════
  // NATIONAL ADDRESS (العنوان الوطني) - Najiz
  // ═══════════════════════════════════════════════════════════════

  nationalAddress: nationalAddressSchema,
  workAddress: nationalAddressSchema,
  poBox: poBoxSchema,
  headquartersAddress: nationalAddressSchema,
  branchAddresses: [nationalAddressSchema],

  // Legacy address fields
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    country: { type: String, default: 'Saudi Arabia' },
    region: String,
    regionCode: String,
  },
  city: { type: String, maxlength: 100 },
  district: { type: String, maxlength: 100 },
  province: { type: String, maxlength: 100 },
  region: { type: String, maxlength: 100 },
  postalCode: { type: String, maxlength: 10 },
  country: { type: String, maxlength: 100, default: 'Saudi Arabia' },

  // ═══════════════════════════════════════════════════════════════
  // COMMUNICATION PREFERENCES
  // ═══════════════════════════════════════════════════════════════

  preferredLanguage: { type: String, enum: ['ar', 'en'], default: 'ar' },
  preferredContactMethod: { type: String, enum: ['email', 'phone', 'sms', 'whatsapp'] },
  bestTimeToContact: String,
  doNotContact: { type: Boolean, default: false },
  doNotEmail: { type: Boolean, default: false },
  doNotCall: { type: Boolean, default: false },
  doNotSMS: { type: Boolean, default: false },

  // ═══════════════════════════════════════════════════════════════
  // RISK & CONFLICT
  // ═══════════════════════════════════════════════════════════════

  riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: String,
  conflictCheckStatus: {
    type: String,
    enum: ['not_checked', 'clear', 'potential_conflict', 'confirmed_conflict'],
    default: 'not_checked'
  },
  conflictNotes: String,
  conflictCheckDate: Date,

  // ═══════════════════════════════════════════════════════════════
  // VERIFICATION STATUS (Wathq/MOJ/Absher)
  // ═══════════════════════════════════════════════════════════════

  isVerified: { type: Boolean, default: false },
  verificationSource: { type: String, enum: ['wathq', 'absher', 'manual', 'najiz'] },
  verifiedAt: Date,
  verificationData: Schema.Types.Mixed,

  // ═══════════════════════════════════════════════════════════════
  // STATUS & CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════

  priority: { type: String, enum: ['low', 'normal', 'high', 'vip'], default: 'normal' },
  vipStatus: { type: Boolean, default: false },

  // ... existing pipeline, source, intake, qualification fields ...
});
```

---

## API Endpoint Changes

### New Endpoints for Verification

Add these routes to both `routes/clients.js` and `routes/leads.js`:

```javascript
// Verify with Wathq (Commercial Registration)
router.post('/:id/verify/wathq', auth, async (req, res) => {
  try {
    const entity = await Model.findById(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Not found' });

    // Call Wathq API
    const wathqResult = await wathqService.verifyCR(entity.crNumber);

    // Update verification status
    entity.isVerified = wathqResult.verified;
    entity.verificationSource = 'wathq';
    entity.verifiedAt = new Date();
    entity.verificationData = wathqResult.data;
    await entity.save();

    res.json({ success: true, data: { verified: wathqResult.verified, data: wathqResult.data } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify with Absher (National ID)
router.post('/:id/verify/absher', auth, async (req, res) => {
  try {
    const entity = await Model.findById(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Not found' });

    const idNumber = req.body.nationalId || entity.nationalId;

    // Call Absher/NIC API
    const absherResult = await absherService.verifyNationalId(idNumber);

    // Update verification status
    entity.isVerified = absherResult.verified;
    entity.verificationSource = 'absher';
    entity.verifiedAt = new Date();
    entity.verificationData = absherResult.data;
    await entity.save();

    res.json({ success: true, data: { verified: absherResult.verified, data: absherResult.data } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify National Address with Saudi Post
router.post('/:id/verify/address', auth, async (req, res) => {
  try {
    const entity = await Model.findById(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Not found' });

    const address = req.body || entity.nationalAddress;

    // Call Saudi Post API
    const addressResult = await saudiPostService.verifyAddress(address);

    // Update address verification
    if (entity.nationalAddress) {
      entity.nationalAddress.isVerified = addressResult.verified;
      entity.nationalAddress.verifiedAt = new Date();
    }
    await entity.save();

    res.json({ success: true, data: { verified: addressResult.verified, data: addressResult.data } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Conflict Check
router.post('/:id/conflict-check', auth, async (req, res) => {
  try {
    const entity = await Model.findById(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Not found' });

    // Run conflict check against clients, contacts, and cases
    const conflictResult = await conflictService.checkConflicts({
      nationalId: entity.nationalId,
      iqamaNumber: entity.iqamaNumber,
      crNumber: entity.crNumber,
      fullName: entity.fullNameArabic || entity.companyName,
      excludeId: entity._id,
    });

    // Update conflict status
    entity.conflictCheckStatus = conflictResult.hasConflict ? 'potential_conflict' : 'clear';
    entity.conflictCheckDate = new Date();
    entity.conflictNotes = conflictResult.notes;
    await entity.save();

    res.json({ success: true, data: conflictResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Update Lead Conversion to Copy All Najiz Fields

Update `routes/leads.js` conversion endpoint:

```javascript
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Copy all fields from lead to client
    const clientData = {
      lawyerId: lead.lawyerId,
      clientType: lead.type,

      // Name fields
      fullNameArabic: lead.fullNameArabic,
      fullNameEnglish: lead.fullNameEnglish,
      firstName: lead.firstName,
      middleName: lead.middleName,
      lastName: lead.lastName,
      preferredName: lead.preferredName,
      salutation: lead.salutation,
      suffix: lead.suffix,
      arabicName: lead.arabicName,
      salutationAr: lead.salutationAr,

      // Company fields
      companyName: lead.companyName,
      companyNameEnglish: lead.companyNameEnglish,
      companyNameAr: lead.companyNameAr,
      crNumber: lead.crNumber,
      unifiedNumber: lead.unifiedNumber,
      vatNumber: lead.vatNumber,
      municipalityLicense: lead.municipalityLicense,
      chamberNumber: lead.chamberNumber,
      legalForm: lead.legalForm,
      legalFormAr: lead.legalFormAr,
      capital: lead.capital,
      capitalCurrency: lead.capitalCurrency,
      establishmentDate: lead.establishmentDate,
      crExpiryDate: lead.crExpiryDate,
      authorizedPerson: lead.authorizedPerson,
      authorizedPersonAr: lead.authorizedPersonAr,
      authorizedPersonTitle: lead.authorizedPersonTitle,
      authorizedPersonIdentityType: lead.authorizedPersonIdentityType,
      authorizedPersonIdentityNumber: lead.authorizedPersonIdentityNumber,

      // Contact
      email: lead.email,
      phone: lead.phone,
      alternatePhone: lead.alternatePhone,
      whatsapp: lead.whatsapp,
      fax: lead.fax,
      website: lead.website,

      // Identity
      identityType: lead.identityType,
      nationalId: lead.nationalId,
      iqamaNumber: lead.iqamaNumber,
      gccId: lead.gccId,
      gccCountry: lead.gccCountry,
      borderNumber: lead.borderNumber,
      visitorId: lead.visitorId,
      passportNumber: lead.passportNumber,
      passportCountry: lead.passportCountry,
      passportIssueDate: lead.passportIssueDate,
      passportExpiryDate: lead.passportExpiryDate,
      passportIssuePlace: lead.passportIssuePlace,
      identityIssueDate: lead.identityIssueDate,
      identityExpiryDate: lead.identityExpiryDate,
      identityIssuePlace: lead.identityIssuePlace,

      // Personal
      dateOfBirth: lead.dateOfBirth,
      dateOfBirthHijri: lead.dateOfBirthHijri,
      placeOfBirth: lead.placeOfBirth,
      gender: lead.gender,
      maritalStatus: lead.maritalStatus,
      nationality: lead.nationality,
      nationalityCode: lead.nationalityCode,

      // Sponsor
      sponsor: lead.sponsor,

      // Addresses
      nationalAddress: lead.nationalAddress,
      workAddress: lead.workAddress,
      poBox: lead.poBox,
      headquartersAddress: lead.headquartersAddress,
      branchAddresses: lead.branchAddresses,
      address: lead.address,
      city: lead.city,
      district: lead.district,
      province: lead.province,
      region: lead.region,
      postalCode: lead.postalCode,
      country: lead.country,

      // Preferences
      preferredLanguage: lead.preferredLanguage,
      preferredContactMethod: lead.preferredContactMethod,
      bestTimeToContact: lead.bestTimeToContact,
      doNotContact: lead.doNotContact,
      doNotEmail: lead.doNotEmail,
      doNotCall: lead.doNotCall,
      doNotSMS: lead.doNotSMS,

      // Risk & Conflict
      riskLevel: lead.riskLevel,
      isBlacklisted: lead.isBlacklisted,
      blacklistReason: lead.blacklistReason,
      conflictCheckStatus: lead.conflictCheckStatus,
      conflictNotes: lead.conflictNotes,
      conflictCheckDate: lead.conflictCheckDate,

      // Verification
      isVerified: lead.isVerified,
      verificationSource: lead.verificationSource,
      verifiedAt: lead.verifiedAt,
      verificationData: lead.verificationData,

      // Meta
      priority: lead.priority,
      vipStatus: lead.vipStatus,
      tags: lead.tags,
      notes: lead.notes,

      // Conversion tracking
      convertedFromLead: true,
      convertedAt: new Date(),
      leadId: lead._id,
    };

    const client = new Client(clientData);
    await client.save();

    // Update lead status
    lead.status = 'won';
    lead.convertedToClient = true;
    lead.clientId = client._id;
    lead.convertedAt = new Date();
    await lead.save();

    res.json({ success: true, data: { lead, client } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Database Indexes

Add these indexes for optimal query performance:

```javascript
// Client indexes
clientSchema.index({ nationalId: 1 }, { sparse: true });
clientSchema.index({ iqamaNumber: 1 }, { sparse: true });
clientSchema.index({ crNumber: 1 }, { sparse: true });
clientSchema.index({ vatNumber: 1 }, { sparse: true });
clientSchema.index({ 'arabicName.fullName': 'text' });
clientSchema.index({ 'nationalAddress.regionCode': 1 });
clientSchema.index({ 'nationalAddress.cityAr': 1 });
clientSchema.index({ identityType: 1 });
clientSchema.index({ conflictCheckStatus: 1 });
clientSchema.index({ isVerified: 1 });

// Lead indexes
leadSchema.index({ nationalId: 1 }, { sparse: true });
leadSchema.index({ iqamaNumber: 1 }, { sparse: true });
leadSchema.index({ crNumber: 1 }, { sparse: true });
leadSchema.index({ vatNumber: 1 }, { sparse: true });
leadSchema.index({ 'arabicName.fullName': 'text' });
leadSchema.index({ 'nationalAddress.regionCode': 1 });
leadSchema.index({ identityType: 1 });
```

---

## Migration Script

Create `migrations/add-najiz-fields.js`:

```javascript
const mongoose = require('mongoose');
const Client = require('../models/Client');
const Lead = require('../models/Lead');

async function migrateNajizFields() {
  // Migrate existing nationalId fields to identityType
  await Client.updateMany(
    { nationalId: { $exists: true, $ne: null }, identityType: { $exists: false } },
    { $set: { identityType: 'national_id' } }
  );

  await Lead.updateMany(
    { nationalId: { $exists: true, $ne: null }, identityType: { $exists: false } },
    { $set: { identityType: 'national_id' } }
  );

  // Migrate existing iqamaNumber fields
  await Client.updateMany(
    { iqamaNumber: { $exists: true, $ne: null }, identityType: { $exists: false } },
    { $set: { identityType: 'iqama' } }
  );

  await Lead.updateMany(
    { iqamaNumber: { $exists: true, $ne: null }, identityType: { $exists: false } },
    { $set: { identityType: 'iqama' } }
  );

  // Set default conflictCheckStatus
  await Client.updateMany(
    { conflictCheckStatus: { $exists: false } },
    { $set: { conflictCheckStatus: 'not_checked' } }
  );

  await Lead.updateMany(
    { conflictCheckStatus: { $exists: false } },
    { $set: { conflictCheckStatus: 'not_checked' } }
  );

  console.log('Migration completed successfully');
}

module.exports = migrateNajizFields;
```

---

## Validation Rules

Add validation middleware in `middleware/validation/najiz.validation.js`:

```javascript
const { body, validationResult } = require('express-validator');

const nationalIdValidation = body('nationalId')
  .optional()
  .matches(/^1\d{9}$/)
  .withMessage('Saudi National ID must be 10 digits starting with 1');

const iqamaValidation = body('iqamaNumber')
  .optional()
  .matches(/^2\d{9}$/)
  .withMessage('Iqama number must be 10 digits starting with 2');

const crNumberValidation = body('crNumber')
  .optional()
  .matches(/^\d{10}$/)
  .withMessage('Commercial Registration must be 10 digits');

const vatNumberValidation = body('vatNumber')
  .optional()
  .matches(/^3\d{14}$/)
  .withMessage('VAT number must be 15 digits starting with 3');

const postalCodeValidation = body('nationalAddress.postalCode')
  .optional()
  .matches(/^\d{5}$/)
  .withMessage('Postal code must be 5 digits');

const buildingNumberValidation = body('nationalAddress.buildingNumber')
  .optional()
  .matches(/^\d{4}$/)
  .withMessage('Building number must be 4 digits');

const hijriDateValidation = body('dateOfBirthHijri')
  .optional()
  .matches(/^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|30)$/)
  .withMessage('Hijri date must be in YYYY/MM/DD format (1300-1499)');

const najizValidation = [
  nationalIdValidation,
  iqamaValidation,
  crNumberValidation,
  vatNumberValidation,
  postalCodeValidation,
  buildingNumberValidation,
  hijriDateValidation,
];

module.exports = { najizValidation };
```

---

## Virtual Fields

Add virtual fields for computed values:

```javascript
// Full Arabic Name virtual
clientSchema.virtual('fullArabicName').get(function() {
  if (this.arabicName) {
    return [
      this.arabicName.firstName,
      this.arabicName.fatherName,
      this.arabicName.grandfatherName,
      this.arabicName.familyName,
    ].filter(Boolean).join(' ');
  }
  return this.fullNameArabic || '';
});

// Formatted National Address virtual
clientSchema.virtual('formattedNationalAddress').get(function() {
  if (!this.nationalAddress) return '';
  const addr = this.nationalAddress;
  const parts = [
    addr.buildingNumber,
    addr.streetNameAr || addr.streetName,
    addr.districtAr || addr.district,
    addr.cityAr || addr.city,
    addr.postalCode,
  ].filter(Boolean);

  if (addr.additionalNumber) {
    parts.push(`(${addr.additionalNumber})`);
  }

  return parts.join('، ');
});

// Primary Identity Number virtual
clientSchema.virtual('primaryIdentityNumber').get(function() {
  switch (this.identityType) {
    case 'national_id': return this.nationalId;
    case 'iqama': return this.iqamaNumber;
    case 'gcc_id': return this.gccId;
    case 'passport': return this.passportNumber;
    case 'border_number': return this.borderNumber;
    case 'visitor_id': return this.visitorId;
    default: return this.nationalId || this.iqamaNumber;
  }
});

// Short Address Display virtual
clientSchema.virtual('displayShortAddress').get(function() {
  if (this.nationalAddress?.shortAddress) {
    return this.nationalAddress.shortAddress;
  }
  if (this.nationalAddress?.buildingNumber && this.nationalAddress?.postalCode) {
    return `${this.nationalAddress.buildingNumber}${this.nationalAddress.postalCode}`;
  }
  return '';
});

// Apply same virtuals to Lead model
```

---

## Summary

### Files to Create/Update

1. **Create**: `models/schemas/najiz.schema.js` - Shared sub-schemas
2. **Update**: `models/Client.js` - Add Najiz fields
3. **Update**: `models/Lead.js` - Add same Najiz fields
4. **Update**: `routes/clients.js` - Add verification endpoints
5. **Update**: `routes/leads.js` - Add verification endpoints, update conversion
6. **Create**: `migrations/add-najiz-fields.js` - Migration script
7. **Create**: `middleware/validation/najiz.validation.js` - Validation rules

### Key Points

- Both Client and Lead models have **identical Najiz fields** for seamless conversion
- All fields are **optional** for backward compatibility
- **Sparse indexes** used for identity fields to allow null values
- **Virtual fields** provide computed values without storage overhead
- **Verification endpoints** support Wathq, Absher, and Saudi Post APIs
- **Conflict check** searches across all identity types
