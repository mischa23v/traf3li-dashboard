import { useState } from 'react'
import {
    ArrowRight, Edit, Download, Printer,
    Calendar, User, CreditCard, Receipt,
    AlertCircle, CheckCircle, Clock, Loader2,
    Mail, FileText, DollarSign, Eye, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useParams } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { usePayment } from '@/hooks/useFinance'
import { ProductivityHero } from '@/components/productivity-hero'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { PaymentReceiptTemplate, useReceiptTemplate } from './payment-receipt-template'
import { toast } from 'sonner'
import financeService from '@/services/financeService'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700', icon: Clock },
    completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    failed: { label: 'فشل', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    refunded: { label: 'مسترد', color: 'bg-purple-100 text-purple-700', icon: Receipt },
}

export default function PaymentDetailsView() {
    const { paymentId } = useParams({ from: '/_authenticated/dashboard/finance/payments/$paymentId' })

    const { data: paymentData, isLoading, isError, error } = usePayment(paymentId)
    const { receiptRef, print: printReceipt } = useReceiptTemplate()

    const payment = paymentData?.payment

    // Receipt modals state
    const [showReceiptPreview, setShowReceiptPreview] = useState(false)
    const [showSendReceiptDialog, setShowSendReceiptDialog] = useState(false)
    const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)
    const [isSendingReceipt, setIsSendingReceipt] = useState(false)
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)

    // Receipt send form
    const [receiptEmail, setReceiptEmail] = useState('')
    const [receiptLanguage, setReceiptLanguage] = useState<'ar' | 'en' | 'both'>('ar')
    const [receiptMessage, setReceiptMessage] = useState('')

    // Receipt handlers
    const handleGenerateReceipt = async () => {
        try {
            setIsGeneratingReceipt(true)
            await financeService.generateReceipt(paymentId)
            toast.success('تم إنشاء الإيصال بنجاح | Receipt generated successfully')
            setShowReceiptPreview(true)
        } catch (error: any) {
            toast.error(error.message || 'فشل إنشاء الإيصال | Failed to generate receipt [BACKEND-PENDING]')
        } finally {
            setIsGeneratingReceipt(false)
        }
    }

    const handleViewReceipt = () => {
        setShowReceiptPreview(true)
    }

    const handlePrintReceipt = () => {
        printReceipt()
    }

    const handleDownloadReceipt = async () => {
        try {
            setIsDownloadingReceipt(true)
            const blob = await financeService.downloadReceipt(paymentId, receiptLanguage)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `receipt-${payment?.paymentNumber || paymentId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('تم تحميل الإيصال بنجاح | Receipt downloaded successfully')
        } catch (error: any) {
            toast.error(error.message || 'فشل تحميل الإيصال | Failed to download receipt [BACKEND-PENDING]')
        } finally {
            setIsDownloadingReceipt(false)
        }
    }

    const handleSendReceipt = async () => {
        if (!receiptEmail) {
            toast.error('يرجى إدخال البريد الإلكتروني | Please enter an email address')
            return
        }

        try {
            setIsSendingReceipt(true)
            await financeService.sendReceipt(paymentId, {
                email: receiptEmail,
                language: receiptLanguage,
                message: receiptMessage
            })
            toast.success('تم إرسال الإيصال بنجاح | Receipt sent successfully')
            setShowSendReceiptDialog(false)
            setReceiptEmail('')
            setReceiptMessage('')
        } catch (error: any) {
            toast.error(error.message || 'فشل إرسال الإيصال | Failed to send receipt [BACKEND-PENDING]')
        } finally {
            setIsSendingReceipt(false)
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: false },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
    ]

    const formatCurrency = (amount: number, currency: string = 'SAR') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Loading State
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error State
    if (isError || !payment) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <Button asChild variant="ghost" className="mb-6">
                            <Link to="/dashboard/finance/payments">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للمدفوعات
                            </Link>
                        </Button>
                        <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" aria-hidden="true" />
                            <h3 className="text-xl font-bold text-navy mb-2">فشل تحميل الدفعة</h3>
                            <p className="text-slate-500">{error?.message || 'الدفعة غير موجودة'}</p>
                        </Card>
                    </div>
                </Main>
            </>
        )
    }

    const status = statusConfig[payment.status] || statusConfig.pending
    const StatusIcon = status.icon

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main className="bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Button asChild variant="ghost" className="text-slate-600 hover:text-navy">
                            <Link to="/dashboard/finance/payments">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للمدفوعات
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleViewReceipt}
                            >
                                <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                عرض الإيصال
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDownloadReceipt}
                                disabled={isDownloadingReceipt}
                            >
                                {isDownloadingReceipt ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                تحميل PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePrintReceipt}
                            >
                                <Printer className="h-4 w-4 ms-2" aria-hidden="true" />
                                طباعة
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowSendReceiptDialog(true)}
                            >
                                <Send className="h-4 w-4 ms-2" aria-hidden="true" />
                                إرسال للعميل
                            </Button>
                        </div>
                    </div>

                    {/* Payment Header Card */}
                    <ProductivityHero
                        badge={`إيصال دفع #${payment.paymentNumber}`}
                        title={formatCurrency(payment.amount, payment.currency)}
                        type="payments"
                        listMode={true}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment Details */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        تفاصيل الدفعة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">رقم الدفعة</p>
                                            <p className="font-medium text-navy">{payment.paymentNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">طريقة الدفع</p>
                                            <p className="font-medium text-navy">{payment.paymentMethod || 'تحويل بنكي'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">المبلغ</p>
                                            <p className="font-bold text-emerald-600 text-lg">
                                                {formatCurrency(payment.amount, payment.currency)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">العملة</p>
                                            <p className="font-medium text-navy">{payment.currency}</p>
                                        </div>
                                        {payment.transactionId && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-slate-500 mb-1">رقم المعاملة</p>
                                                <p className="font-medium text-navy font-mono">{payment.transactionId}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Client Info */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        معلومات العميل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">اسم العميل</p>
                                            <p className="font-medium text-navy">
                                                {payment.clientId && typeof payment.clientId === 'object'
                                                    ? `${payment.clientId.firstName || ''} ${payment.clientId.lastName || ''}`.trim() || 'غير محدد'
                                                    : 'غير محدد'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {payment.notes && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy">ملاحظات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-slate-600 whitespace-pre-wrap">{payment.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Linked Invoice */}
                            {payment.invoiceId && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                            الفاتورة المرتبطة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Link
                                            to="/dashboard/finance/invoices/$invoiceId"
                                            params={{ invoiceId: typeof payment.invoiceId === 'string' ? payment.invoiceId : payment.invoiceId }}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-navy">فاتورة</p>
                                                <p className="text-sm text-slate-500">عرض الفاتورة</p>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-slate-600 rotate-180" />
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Dates */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        التواريخ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ الدفع</p>
                                        <p className="font-medium text-navy">{formatDate(payment.paymentDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ الإنشاء</p>
                                        <p className="font-medium text-navy">{formatDate(payment.createdAt)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleViewReceipt}
                                    >
                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                        عرض الإيصال
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => setShowSendReceiptDialog(true)}
                                    >
                                        <Send className="h-4 w-4 ms-2" aria-hidden="true" />
                                        إرسال الإيصال بالبريد
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleDownloadReceipt}
                                        disabled={isDownloadingReceipt}
                                    >
                                        {isDownloadingReceipt ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" aria-hidden="true" />
                                        ) : (
                                            <Download className="h-4 w-4 ms-2" aria-hidden="true" />
                                        )}
                                        تحميل إيصال PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handlePrintReceipt}
                                    >
                                        <Printer className="h-4 w-4 ms-2" aria-hidden="true" />
                                        طباعة الإيصال
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Receipt Preview Modal */}
                <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>معاينة الإيصال</DialogTitle>
                            <DialogDescription>
                                يمكنك طباعة أو تحميل الإيصال من هنا
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            {payment && (
                                <PaymentReceiptTemplate
                                    ref={receiptRef}
                                    payment={payment}
                                    language="both"
                                    receiptSettings={{
                                        receiptPrefix: 'REC',
                                        includeQRCode: true,
                                        footerText: 'Thank you for your business',
                                        footerTextAr: 'شكراً لتعاملكم معنا',
                                        termsAndConditions: 'This is an official receipt.',
                                        termsAndConditionsAr: 'هذا إيصال رسمي.',
                                    }}
                                />
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReceiptPreview(false)}>
                                إغلاق
                            </Button>
                            <Button variant="outline" onClick={handlePrintReceipt}>
                                <Printer className="h-4 w-4 ms-2" />
                                طباعة
                            </Button>
                            <Button onClick={handleDownloadReceipt} disabled={isDownloadingReceipt}>
                                {isDownloadingReceipt ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 ms-2" />
                                )}
                                تحميل PDF
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Send Receipt Dialog */}
                <Dialog open={showSendReceiptDialog} onOpenChange={setShowSendReceiptDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إرسال الإيصال</DialogTitle>
                            <DialogDescription>
                                أدخل البريد الإلكتروني لإرسال الإيصال
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="receipt-email">البريد الإلكتروني</Label>
                                <Input
                                    id="receipt-email"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={receiptEmail}
                                    onChange={(e) => setReceiptEmail(e.target.value)}
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receipt-language">اللغة</Label>
                                <Select value={receiptLanguage} onValueChange={(value: 'ar' | 'en' | 'both') => setReceiptLanguage(value)}>
                                    <SelectTrigger id="receipt-language">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ar">عربي</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="both">ثنائي اللغة / Bilingual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="receipt-message">رسالة إضافية (اختياري)</Label>
                                <Input
                                    id="receipt-message"
                                    placeholder="رسالة قصيرة للعميل..."
                                    value={receiptMessage}
                                    onChange={(e) => setReceiptMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowSendReceiptDialog(false)}
                                disabled={isSendingReceipt}
                            >
                                إلغاء
                            </Button>
                            <Button onClick={handleSendReceipt} disabled={isSendingReceipt}>
                                {isSendingReceipt ? (
                                    <>
                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 ms-2" />
                                        إرسال
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    )
}
