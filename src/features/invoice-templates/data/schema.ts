import { z } from 'zod'

export const templateTypeSchema = z.enum([
  'standard',
  'detailed',
  'summary',
  'retainer',
  'pro_bono',
  'custom'
])

export const headerSchema = z.object({
  showLogo: z.boolean(),
  logoPosition: z.enum(['left', 'center', 'right']),
  showCompanyInfo: z.boolean(),
  showInvoiceNumber: z.boolean(),
  showDate: z.boolean(),
  showDueDate: z.boolean(),
  customHeader: z.string().optional(),
  customHeaderAr: z.string().optional(),
})

export const clientSectionSchema = z.object({
  showClientName: z.boolean(),
  showClientAddress: z.boolean(),
  showClientPhone: z.boolean(),
  showClientEmail: z.boolean(),
  showClientVat: z.boolean(),
})

export const itemsSectionSchema = z.object({
  showDescription: z.boolean(),
  showQuantity: z.boolean(),
  showUnitPrice: z.boolean(),
  showDiscount: z.boolean(),
  showTax: z.boolean(),
  showLineTotal: z.boolean(),
  groupByCategory: z.boolean(),
  showTimeEntries: z.boolean(),
  showExpenses: z.boolean(),
})

export const footerSchema = z.object({
  showSubtotal: z.boolean(),
  showDiscount: z.boolean(),
  showTax: z.boolean(),
  showTotal: z.boolean(),
  showPaymentTerms: z.boolean(),
  showBankDetails: z.boolean(),
  showNotes: z.boolean(),
  showSignature: z.boolean(),
  customFooter: z.string().optional(),
  customFooterAr: z.string().optional(),
  paymentTerms: z.string().optional(),
  paymentTermsAr: z.string().optional(),
  bankDetails: z.string().optional(),
  bankDetailsAr: z.string().optional(),
})

export const stylingSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.enum(['cairo', 'tajawal', 'arial', 'times']),
  fontSize: z.enum(['small', 'medium', 'large']),
  tableStyle: z.enum(['striped', 'bordered', 'minimal']),
  pageSize: z.enum(['a4', 'letter']),
  orientation: z.enum(['portrait', 'landscape']),
})

export const numberingFormatSchema = z.object({
  prefix: z.string(),
  suffix: z.string(),
  digits: z.number().min(1).max(10),
  startFrom: z.number().min(1),
  includeYear: z.boolean(),
  includeMonth: z.boolean(),
  separator: z.string(),
})

export const taxSettingsSchema = z.object({
  vatRate: z.number().min(0).max(100),
  includeVatNumber: z.boolean(),
  vatDisplayMode: z.enum(['inclusive', 'exclusive', 'none']),
})

export const invoiceTemplateSchema = z.object({
  _id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  type: templateTypeSchema,
  isDefault: z.boolean(),
  isActive: z.boolean(),
  header: headerSchema,
  clientSection: clientSectionSchema,
  itemsSection: itemsSectionSchema,
  footer: footerSchema,
  styling: stylingSchema,
  numberingFormat: numberingFormatSchema,
  taxSettings: taxSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional(),
})

export type InvoiceTemplate = z.infer<typeof invoiceTemplateSchema>
export type TemplateType = z.infer<typeof templateTypeSchema>
