import { useMemo } from 'react'
import {
    ArrowRight, Edit, Send, Download, Copy,
    ArrowRightLeft, Calendar, User, FileText,
    DollarSign, Clock, AlertCircle, CheckCircle,
    XCircle, Loader2, Mail, Printer, Trash2
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
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useQuote, useSendQuote, useConvertQuoteToInvoice, useDeleteQuote } from '@/hooks/useQuotes'
import type { Quote, QuoteStatus } from '@/services/quoteService'
import { ProductivityHero } from '@/components/productivity-hero'

const statusConfig: Record<QuoteStatus, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'مسودة', color: 'bg-slate-100 text-slate-700', icon: FileText },
    pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700', icon: Clock },
    sent: { label: 'مرسل', color: 'bg-blue-100 text-blue-700', icon: Send },
    accepted: { label: 'مقبول', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    declined: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { label: 'ملغي', color: 'bg-slate-100 text-slate-500', icon: XCircle },
    on_hold: { label: 'معلق', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    expired: { label: 'منتهي', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
}

export default function QuoteDetailsView() {
    const { quoteId } = useParams({ from: '/_authenticated/dashboard/finance/quotes/$quoteId' })
    const navigate = useNavigate()

    const { data: quoteData, isLoading, isError, error } = useQuote(quoteId)
    const sendQuoteMutation = useSendQuote()
    const convertMutation = useConvertQuoteToInvoice()
    const deleteMutation = useDeleteQuote()

    const quote = quoteData?.quote

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'عروض الأسعار', href: '/dashboard/finance/quotes', isActive: true },
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
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

    const handleSendQuote = async () => {
        if (!quote) return
        await sendQuoteMutation.mutateAsync(quote._id)
    }

    const handleConvertToInvoice = async () => {
        if (!quote) return
        const result = await convertMutation.mutateAsync(quote._id)
        if (result.invoice) {
            navigate({ to: '/dashboard/finance/invoices/$invoiceId', params: { invoiceId: result.invoice._id } })
        }
    }

    const handleDelete = async () => {
        if (!quote) return
        if (confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) {
            await deleteMutation.mutateAsync(quote._id)
            navigate({ to: '/dashboard/finance/quotes' })
        }
    }

    const isExpired = useMemo(() => {
        if (!quote?.expiredDate) return false
        return new Date(quote.expiredDate) < new Date()
    }, [quote])

    // Loading State
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-[600px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error State
    if (isError || !quote) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <Button asChild variant="ghost" className="mb-6">
                            <Link to="/dashboard/finance/quotes">
                                <ArrowRight className="h-4 w-4 ml-2" />
                                العودة لعروض الأسعار
                            </Link>
                        </Button>
                        <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-navy mb-2">فشل تحميل عرض السعر</h3>
                            <p className="text-slate-500">{error?.message || 'عرض السعر غير موجود'}</p>
                        </Card>
                    </div>
                </Main>
            </>
        )
    }

    const status = statusConfig[quote.status]
    const StatusIcon = status.icon

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center space-x-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main className="bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
                <div className="max-w-5xl mx-auto">
                    <ProductivityHero
                        badge="عرض سعر"
                        title={`عرض سعر #${quote.quoteNumber}`}
                        type="quotes"
                        listMode={true}
                    >
                        <div className="flex gap-2 flex-wrap">
                            {quote.status === 'draft' && (
                                <Button
                                    onClick={handleSendQuote}
                                    disabled={sendQuoteMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                                >
                                    {sendQuoteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4 ml-2" />
                                    )}
                                    إرسال للعميل
                                </Button>
                            )}
                            {(quote.status === 'sent' || quote.status === 'accepted') && !quote.convertedToInvoice && (
                                <Button
                                    onClick={handleConvertToInvoice}
                                    disabled={convertMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                >
                                    {convertMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    ) : (
                                        <ArrowRightLeft className="h-4 w-4 ml-2" />
                                    )}
                                    تحويل لفاتورة
                                </Button>
                            )}
                            <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm">
                                <Link to="/dashboard/finance/quotes/$quoteId/edit" params={{ quoteId: quote._id }}>
                                    <Edit className="h-4 w-4 ml-2" />
                                    تعديل
                                </Link>
                            </Button>
                            <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm">
                                <Download className="h-4 w-4 ml-2" />
                                تحميل PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white/10 text-white hover:bg-red-500/20 hover:text-red-200 border-0 backdrop-blur-sm"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                            </Button>
                        </div>
                    </ProductivityHero>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Client Info */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="h-5 w-5 text-brand-blue" />
                                        معلومات العميل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">اسم العميل</p>
                                            <p className="font-medium text-navy">
                                                {typeof quote.clientId === 'object'
                                                    ? `${quote.clientId.firstName || ''} ${quote.clientId.lastName || ''}`.trim() || quote.clientId.name
                                                    : 'غير محدد'}
                                            </p>
                                        </div>
                                        {quote.caseId && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">القضية</p>
                                                <p className="font-medium text-navy">
                                                    {typeof quote.caseId === 'object'
                                                        ? quote.caseId.caseNumber || quote.caseId.title
                                                        : quote.caseId}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Items Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-brand-blue" />
                                        بنود عرض السعر
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="text-right p-4 text-sm font-medium text-slate-600">البند</th>
                                                    <th className="text-center p-4 text-sm font-medium text-slate-600">الكمية</th>
                                                    <th className="text-center p-4 text-sm font-medium text-slate-600">السعر</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-600">الإجمالي</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {quote.items.map((item, index) => (
                                                    <tr key={item._id || index} className="hover:bg-slate-50/50">
                                                        <td className="p-4">
                                                            <div className="font-medium text-navy">{item.itemName}</div>
                                                            {item.description && (
                                                                <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center text-slate-600">{item.quantity}</td>
                                                        <td className="p-4 text-center text-slate-600">
                                                            {formatCurrency(item.price, quote.currency)}
                                                        </td>
                                                        <td className="p-4 text-left font-medium text-navy">
                                                            {formatCurrency(item.total, quote.currency)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {quote.notes && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy">ملاحظات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-slate-600 whitespace-pre-wrap">{quote.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-brand-blue" />
                                        ملخص عرض السعر
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">المجموع الفرعي</span>
                                        <span className="font-medium">{formatCurrency(quote.subTotal, quote.currency)}</span>
                                    </div>
                                    {quote.discount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>الخصم</span>
                                            <span>-{formatCurrency(quote.discount, quote.currency)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">الضريبة ({quote.taxRate}%)</span>
                                        <span className="font-medium">{formatCurrency(quote.taxTotal, quote.currency)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold text-navy">الإجمالي</span>
                                        <span className="font-bold text-navy">{formatCurrency(quote.total, quote.currency)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-brand-blue" />
                                        التواريخ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ الإنشاء</p>
                                        <p className="font-medium text-navy">{formatDate(quote.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ الانتهاء</p>
                                        <p className={`font-medium ${isExpired ? 'text-rose-600' : 'text-navy'}`}>
                                            {formatDate(quote.expiredDate)}
                                            {isExpired && ' (منتهي)'}
                                        </p>
                                    </div>
                                    {quote.convertedToInvoice && quote.invoiceId && (
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">تم التحويل لفاتورة</p>
                                            <Link
                                                to="/dashboard/finance/invoices/$invoiceId"
                                                params={{ invoiceId: typeof quote.invoiceId === 'string' ? quote.invoiceId : quote.invoiceId._id }}
                                                className="text-brand-blue hover:underline"
                                            >
                                                عرض الفاتورة
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy">إجراءات سريعة</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Mail className="h-4 w-4 ml-2" />
                                        إرسال بالبريد الإلكتروني
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Copy className="h-4 w-4 ml-2" />
                                        نسخ عرض السعر
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
