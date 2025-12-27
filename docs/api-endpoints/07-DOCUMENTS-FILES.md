# Documents & Files API Endpoints

## PDFMe Template & Generation API

### Base URL: `/api/pdfme`

### Template Management

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/pdfme/templates` | Query: category, type, isDefault, isActive, search, page, limit | Templates + pagination | Yes |
| POST | `/pdfme/templates` | name, nameAr, description, descriptionAr, category, type, basePdf, schemas[], isDefault, isActive | Template object | Yes |
| GET | `/pdfme/templates/default/:category` | category | Default template | Yes |
| GET | `/pdfme/templates/:id` | id | Single template | Yes |
| PUT | `/pdfme/templates/:id` | Template fields | Updated template | Yes |
| DELETE | `/pdfme/templates/:id` | id | Success | Yes |
| POST | `/pdfme/templates/:id/clone` | name, nameAr | Cloned template | Yes |
| POST | `/pdfme/templates/:id/set-default` | id | Set as default | Yes |
| POST | `/pdfme/templates/:id/preview` | inputs | Preview PDF (binary) | Yes |

### Template Categories
- `invoice`, `contract`, `receipt`, `report`, `statement`, `letter`, `certificate`, `custom`

### Template Types
- `standard`, `detailed`, `summary`, `minimal`, `custom`

### PDF Generation

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/pdfme/generate` | templateId, inputs, type (pdf/base64) | PDF file or base64 | Yes |
| POST | `/pdfme/generate/async` | templateId, inputs | Job confirmation | Yes |
| POST | `/pdfme/generate/invoice` | invoiceData, templateId, includeQR | PDF file | Yes |
| POST | `/pdfme/generate/contract` | contractData, templateId | PDF file | Yes |
| POST | `/pdfme/generate/receipt` | receiptData, templateId | PDF file | Yes |
| GET | `/pdfme/download/:fileName` | fileName | PDF file (binary) | Yes |

### Invoice Data Structure
```json
{
  "invoiceNumber": "string",
  "date": "string",
  "client": { "name": "", "email": "", "address": "" },
  "items": [],
  "subtotal": "number",
  "tax": "number",
  "totalAmount": "number",
  "currency": "SAR",
  "notes": "string"
}
```

### Contract Data Structure
```json
{
  "contractNumber": "string",
  "date": "string",
  "partyA": { "name": "", "address": "", "nationalId": "" },
  "partyB": { "name": "", "address": "", "nationalId": "" },
  "subject": "string",
  "terms": [],
  "amount": "number",
  "startDate": "string",
  "endDate": "string"
}
```

### Receipt Data Structure
```json
{
  "receiptNumber": "string",
  "date": "string",
  "receivedFrom": "string",
  "amount": "number",
  "amountInWords": "string",
  "purpose": "string",
  "paymentMethod": "string",
  "notes": "string"
}
```

---

## Legal Documents API (NOT MOUNTED)

### Base URL: `/api/legal-documents` (defined but not registered)

| Method | Endpoint | Parameters | Returns | Status |
|--------|----------|------------|---------|--------|
| POST | `/legal-documents` | title, summary, content, category, type, keywords, fileUrl, author, publicationDate, accessLevel | Document | ⚠️ NOT MOUNTED |
| GET | `/legal-documents` | Query: search, category, type, accessLevel | Documents (role-filtered) | ⚠️ NOT MOUNTED |
| GET | `/legal-documents/:_id` | _id | Document (increments views) | ⚠️ NOT MOUNTED |
| PATCH | `/legal-documents/:_id` | Document fields | Updated document | ⚠️ NOT MOUNTED |
| DELETE | `/legal-documents/:_id` | _id | Success | ⚠️ NOT MOUNTED |
| POST | `/legal-documents/:_id/download` | _id | Increments download count | ⚠️ NOT MOUNTED |

### Document Categories
- `labor`, `commercial`, `family`, `criminal`, `real-estate`, `corporate`, `immigration`, `tax`, `intellectual-property`, `general`

### Document Types
- `law`, `regulation`, `case`, `template`, `guide`, `article`

### Access Levels
- `public`, `lawyers-only`, `admin-only`

---

## Message File Uploads

### Base URL: `/api/messages`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/messages` | conversationID, description, files (multipart, max 5) | Message with attachments | Yes |

### Upload Configuration
- Max files: 5
- Max size: 10MB per file
- Allowed: jpeg, jpg, png, gif, pdf, doc, docx, txt, mp4, webm
- Storage: `/uploads/messages`

### Attachment Structure
```json
{
  "filename": "generated-filename",
  "originalName": "original-filename",
  "mimetype": "file/type",
  "size": 12345,
  "url": "/uploads/messages/filename",
  "type": "image|video|document|other"
}
```

---

## Case Documents

### Base URL: `/api/cases/:_id/document`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/cases/:_id/document` | name, url | Case with new document | Yes |

### Document Types
- `contract`, `evidence`, `correspondence`, `court_document`, `poa`, `id_document`, `other`

---

## Expense Receipts

### Base URL: `/api/expenses/:id/receipt`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/expenses/:id/receipt` | receiptUrl | Expense with receipt | Yes |

---

## Benefit Documents

### Base URL: `/api/benefits/:id/documents`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/benefits/:id/documents` | documentType, documentName, documentNameAr, fileUrl, fileName, fileSize, expiryDate | Updated benefit | Yes |

### Document Types
- `enrollment_form`, `beneficiary_designation`, `insurance_card`, `policy_document`, `summary_of_benefits`, `claim_form`, `medical_certificate`, `dependent_proof`, `termination_notice`, `continuation_notice`, `receipt`, `other`

---

## Employee Documents

### Base URL: `/api/hr/employees/:id/documents`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/hr/employees/:id/documents` | id | Documents array | Yes |
| POST | `/hr/employees/:id/documents` | file (multipart), documentType, expiryDate | Document | Yes |
| DELETE | `/hr/employees/:id/documents/:documentId` | id, documentId | Success (204) | Yes |
| POST | `/hr/employees/:id/documents/:documentId/verify` | verifiedBy, verificationNotes | Verified document | Yes |

---

## Static File Serving

### Base URL: `/uploads`

| Path | Purpose | Cache |
|------|---------|-------|
| `/uploads/messages/*` | Message attachments | 7 days (images) |
| `/uploads/pdfs/*` | Generated PDFs | 1 day |
| `/uploads/templates/*` | PDF templates | 7 days |
| `/uploads/previews/*` | PDF previews | 7 days |

### Storage Limits

| Directory | Max Size | File Types |
|-----------|----------|------------|
| `/uploads/messages` | 10MB | jpeg, jpg, png, gif, pdf, doc, docx, txt, mp4, webm |
| `/uploads/pdfs` | 20MB | pdf |
| `/uploads/templates` | 50MB | pdf, jpeg, jpg, png |

---

## Security Features

1. **MIME type validation**
2. **File extension validation**
3. **File size limits**
4. **Path traversal protection** (filename sanitization)
5. **Base directory confinement**
6. **Ownership verification**
7. **Role-based access for document types**

---

**Total Document/File Endpoints: 25+**
