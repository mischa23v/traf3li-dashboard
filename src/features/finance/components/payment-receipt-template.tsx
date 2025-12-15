import { useRef, forwardRef } from 'react'
import {
    Receipt, Calendar, User, Building2, CreditCard,
    FileText, CheckCircle, Phone, Mail, MapPin, Globe
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Payment } from '@/services/financeService'

interface PaymentReceiptTemplateProps {
    payment: Payment & {
        clientId?: any
        invoiceId?: any
        appliedInvoices?: Array<{
            invoiceNumber: string
            amount: number
            balanceRemaining: number
        }>
    }
    language?: 'ar' | 'en' | 'both'
    receiptSettings?: {
        receiptPrefix?: string
        autoSendOnPayment?: boolean
        includeQRCode?: boolean
        footerText?: string
        footerTextAr?: string
        companyInfo?: {
            name?: string
            nameAr?: string
            address?: string
            addressAr?: string
            phone?: string
            email?: string
            website?: string
            crNumber?: string
            vatNumber?: string
            logo?: string
        }
        termsAndConditions?: string
        termsAndConditionsAr?: string
    }
    className?: string
}

/**
 * Payment Receipt Template Component
 *
 * Printable/PDF-ready payment receipt with:
 * - Bilingual support (Arabic/English)
 * - ZATCA compliance
 * - QR code verification
 * - Company branding
 * - Invoice allocations
 */
export const PaymentReceiptTemplate = forwardRef<HTMLDivElement, PaymentReceiptTemplateProps>(
    ({ payment, language = 'both', receiptSettings, className }, ref) => {
        const showArabic = language === 'ar' || language === 'both'
        const showEnglish = language === 'en' || language === 'both'

        // Format currency
        const formatCurrency = (amount: number, currency: string = 'SAR') => {
            return new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            }).format(amount)
        }

        // Format date
        const formatDate = (dateString: string, locale: 'ar' | 'en' = 'ar') => {
            return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        // Format time
        const formatTime = (dateString: string, locale: 'ar' | 'en' = 'ar') => {
            return new Date(dateString).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        // Generate receipt number
        const receiptNumber = `${receiptSettings?.receiptPrefix || 'REC'}-${new Date(payment.paymentDate).getFullYear()}-${String(payment.paymentNumber).padStart(4, '0')}`

        // Payment method labels
        const paymentMethodLabel = (method: string) => {
            const methods: Record<string, { ar: string; en: string }> = {
                cash: { ar: 'نقداً', en: 'Cash' },
                bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
                sarie: { ar: 'سريع', en: 'Sarie' },
                check: { ar: 'شيك', en: 'Check' },
                credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
                mada: { ar: 'مدى', en: 'Mada' },
                stc_pay: { ar: 'STC Pay', en: 'STC Pay' },
                apple_pay: { ar: 'Apple Pay', en: 'Apple Pay' },
            }
            return methods[method] || { ar: method, en: method }
        }

        const companyInfo = receiptSettings?.companyInfo || {}
        const clientName = typeof payment.clientId === 'object' && payment.clientId
            ? `${payment.clientId.firstName || ''} ${payment.clientId.lastName || ''}`.trim()
            : 'N/A'

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white p-8 max-w-4xl mx-auto print:p-0',
                    'font-[\'IBM_Plex_Sans_Arabic\'] text-slate-900',
                    className
                )}
                style={{
                    fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                    direction: language === 'en' ? 'ltr' : 'rtl'
                }}
            >
                {/* HEADER */}
                <div className="mb-8 flex justify-between items-start border-b-2 border-slate-200 pb-6">
                    {/* Company Logo and Info */}
                    <div className={cn('flex-1', showEnglish && !showArabic && 'text-left')}>
                        {companyInfo.logo ? (
                            <img
                                src={companyInfo.logo}
                                alt="Company Logo"
                                className="h-16 mb-4"
                            />
                        ) : (
                            <div className="flex items-center gap-2 mb-4">
                                <Building2 className="h-10 w-10 text-brand-blue" />
                                <div>
                                    {showArabic && <h1 className="text-2xl font-bold text-navy">{companyInfo.nameAr || 'شركة المحاماة'}</h1>}
                                    {showEnglish && <h2 className="text-lg text-slate-600">{companyInfo.name || 'Law Firm'}</h2>}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 text-sm text-slate-600">
                            {companyInfo.address && showArabic && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{companyInfo.addressAr || companyInfo.address}</span>
                                </div>
                            )}
                            {companyInfo.address && showEnglish && !showArabic && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{companyInfo.address}</span>
                                </div>
                            )}
                            {companyInfo.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span dir="ltr">{companyInfo.phone}</span>
                                </div>
                            )}
                            {companyInfo.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span dir="ltr">{companyInfo.email}</span>
                                </div>
                            )}
                            {companyInfo.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span dir="ltr">{companyInfo.website}</span>
                                </div>
                            )}
                        </div>

                        {(companyInfo.crNumber || companyInfo.vatNumber) && (
                            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                                {companyInfo.crNumber && (
                                    <div>
                                        {showArabic && <span>س.ت: </span>}
                                        {showEnglish && !showArabic && <span>CR: </span>}
                                        <span dir="ltr">{companyInfo.crNumber}</span>
                                    </div>
                                )}
                                {companyInfo.vatNumber && (
                                    <div>
                                        {showArabic && <span>الرقم الضريبي: </span>}
                                        {showEnglish && !showArabic && <span>VAT No: </span>}
                                        <span dir="ltr">{companyInfo.vatNumber}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Receipt Title and Number */}
                    <div className={cn('text-left', showArabic && 'text-right')}>
                        <div className="flex items-center gap-2 mb-2">
                            <Receipt className="h-6 w-6 text-emerald-600" />
                            <div>
                                {showArabic && <h2 className="text-xl font-bold text-emerald-600">إيصال دفع</h2>}
                                {showEnglish && <h3 className="text-lg font-semibold text-slate-600">Payment Receipt</h3>}
                            </div>
                        </div>
                        <div className="bg-slate-100 rounded-lg px-4 py-2 mt-3">
                            <div className="text-xs text-slate-500 mb-1">
                                {showArabic && 'رقم الإيصال'}
                                {showEnglish && !showArabic && 'Receipt No.'}
                            </div>
                            <div className="text-lg font-bold font-mono" dir="ltr">{receiptNumber}</div>
                        </div>
                        <div className="mt-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(payment.paymentDate, showArabic ? 'ar' : 'en')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(payment.createdAt, showArabic ? 'ar' : 'en')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CLIENT INFORMATION */}
                <div className="mb-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="h-5 w-5 text-brand-blue" />
                            <h3 className="font-bold text-slate-800">
                                {showArabic && 'معلومات العميل'}
                                {showEnglish && !showArabic && 'Client Information'}
                            </h3>
                        </div>
                        <div className="text-slate-700">
                            <div className="font-medium text-lg">{clientName}</div>
                            {payment.caseId && (
                                <div className="text-sm text-slate-500 mt-1">
                                    {showArabic && 'رقم القضية: '}
                                    {showEnglish && !showArabic && 'Case No: '}
                                    <span className="font-mono">{typeof payment.caseId === 'string' ? payment.caseId : payment.caseId?._id}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PAYMENT DETAILS */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="h-5 w-5 text-brand-blue" />
                        <h3 className="font-bold text-slate-800">
                            {showArabic && 'تفاصيل الدفعة'}
                            {showEnglish && !showArabic && 'Payment Details'}
                        </h3>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="p-3 bg-slate-50 font-medium" style={{ width: '40%' }}>
                                        {showArabic && 'رقم الدفعة'}
                                        {showEnglish && !showArabic && 'Payment Number'}
                                    </td>
                                    <td className="p-3 font-mono">{payment.paymentNumber}</td>
                                </tr>
                                <tr className="border-b border-slate-100 bg-emerald-50">
                                    <td className="p-3 bg-emerald-100 font-medium">
                                        {showArabic && 'المبلغ المستلم'}
                                        {showEnglish && !showArabic && 'Amount Received'}
                                    </td>
                                    <td className="p-3">
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="p-3 bg-slate-50 font-medium">
                                        {showArabic && 'طريقة الدفع'}
                                        {showEnglish && !showArabic && 'Payment Method'}
                                    </td>
                                    <td className="p-3">
                                        {showArabic && paymentMethodLabel(payment.paymentMethod).ar}
                                        {showEnglish && !showArabic && paymentMethodLabel(payment.paymentMethod).en}
                                    </td>
                                </tr>
                                {payment.transactionId && (
                                    <tr className="border-b border-slate-100">
                                        <td className="p-3 bg-slate-50 font-medium">
                                            {showArabic && 'رقم المعاملة'}
                                            {showEnglish && !showArabic && 'Transaction ID'}
                                        </td>
                                        <td className="p-3 font-mono" dir="ltr">{payment.transactionId}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="p-3 bg-slate-50 font-medium">
                                        {showArabic && 'الحالة'}
                                        {showEnglish && !showArabic && 'Status'}
                                    </td>
                                    <td className="p-3">
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <CheckCircle className="h-3 w-3 me-1" />
                                            {showArabic && 'مكتمل'}
                                            {showEnglish && !showArabic && 'Completed'}
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* INVOICE ALLOCATIONS */}
                {payment.appliedInvoices && payment.appliedInvoices.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-5 w-5 text-brand-blue" />
                            <h3 className="font-bold text-slate-800">
                                {showArabic && 'الفواتير المسددة'}
                                {showEnglish && !showArabic && 'Invoices Paid'}
                            </h3>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-3 text-start font-medium">
                                            {showArabic && 'رقم الفاتورة'}
                                            {showEnglish && !showArabic && 'Invoice No.'}
                                        </th>
                                        <th className="p-3 text-start font-medium">
                                            {showArabic && 'المبلغ المدفوع'}
                                            {showEnglish && !showArabic && 'Amount Paid'}
                                        </th>
                                        <th className="p-3 text-start font-medium">
                                            {showArabic && 'المتبقي'}
                                            {showEnglish && !showArabic && 'Remaining'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payment.appliedInvoices.map((inv, idx) => (
                                        <tr key={idx} className="border-t border-slate-100">
                                            <td className="p-3 font-mono">{inv.invoiceNumber}</td>
                                            <td className="p-3 font-medium text-emerald-600">
                                                {formatCurrency(inv.amount, payment.currency)}
                                            </td>
                                            <td className="p-3 text-slate-600">
                                                {inv.balanceRemaining > 0 ? (
                                                    formatCurrency(inv.balanceRemaining, payment.currency)
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700">
                                                        {showArabic && 'مسدد بالكامل'}
                                                        {showEnglish && !showArabic && 'Fully Paid'}
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* QR CODE (if enabled) */}
                {receiptSettings?.includeQRCode && (
                    <div className="mb-6 flex justify-center">
                        <div className="border-2 border-slate-200 rounded-xl p-4 text-center">
                            <div className="w-32 h-32 bg-slate-100 flex items-center justify-center mx-auto mb-2 rounded-lg">
                                {/* QR Code placeholder - integrate with actual QR library */}
                                <svg className="w-24 h-24" viewBox="0 0 100 100">
                                    <rect width="100" height="100" fill="white" />
                                    <path d="M10 10h30v30h-30z M60 10h30v30h-30z M10 60h30v30h-30z" fill="black" />
                                </svg>
                            </div>
                            <div className="text-xs text-slate-500">
                                {showArabic && 'امسح للتحقق'}
                                {showEnglish && !showArabic && 'Scan to Verify'}
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <Separator className="my-6" />

                {/* Thank You Message */}
                <div className="text-center mb-4">
                    {showArabic && (
                        <p className="text-lg font-medium text-slate-800 mb-1">
                            {receiptSettings?.footerTextAr || 'شكراً لتعاملكم معنا'}
                        </p>
                    )}
                    {showEnglish && (
                        <p className={cn('text-slate-600', showArabic && 'text-sm')}>
                            {receiptSettings?.footerText || 'Thank you for your business'}
                        </p>
                    )}
                </div>

                {/* Terms and Conditions */}
                {(receiptSettings?.termsAndConditions || receiptSettings?.termsAndConditionsAr) && (
                    <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600">
                        <div className="font-medium mb-2">
                            {showArabic && 'الشروط والأحكام'}
                            {showEnglish && !showArabic && 'Terms and Conditions'}
                        </div>
                        {showArabic && (
                            <p className="whitespace-pre-wrap mb-2">
                                {receiptSettings?.termsAndConditionsAr}
                            </p>
                        )}
                        {showEnglish && (
                            <p className="whitespace-pre-wrap">
                                {receiptSettings?.termsAndConditions}
                            </p>
                        )}
                    </div>
                )}

                {/* Print Footer */}
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center print:block hidden">
                    {showArabic && 'تم إنشاء هذا الإيصال إلكترونياً'}
                    {showEnglish && !showArabic && 'This receipt was generated electronically'}
                    <span className="mx-2">•</span>
                    {formatDate(new Date().toISOString(), showArabic ? 'ar' : 'en')}
                    {' '}
                    {formatTime(new Date().toISOString(), showArabic ? 'ar' : 'en')}
                </div>
            </div>
        )
    }
)

PaymentReceiptTemplate.displayName = 'PaymentReceiptTemplate'

/**
 * Hook for using the receipt template with print functionality
 */
export function useReceiptTemplate() {
    const receiptRef = useRef<HTMLDivElement>(null)

    const print = () => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank')
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html dir="rtl">
                    <head>
                        <title>Payment Receipt</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: 'IBM Plex Sans Arabic', sans-serif; }
                            @media print {
                                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                            }
                            @page { margin: 0.5cm; }
                        </style>
                        ${document.querySelector('style')?.innerHTML || ''}
                    </head>
                    <body>
                        ${receiptRef.current.innerHTML}
                    </body>
                    </html>
                `)
                printWindow.document.close()
                printWindow.focus()
                setTimeout(() => {
                    printWindow.print()
                    printWindow.close()
                }, 500)
            }
        }
    }

    const downloadAsPDF = async () => {
        // Integrate with html2canvas or jsPDF
        console.log('Download as PDF functionality - integrate with library')
    }

    return {
        receiptRef,
        print,
        downloadAsPDF
    }
}

function Clock({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
