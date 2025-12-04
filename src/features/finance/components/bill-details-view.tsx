import { useState, useMemo } from 'react'
import {
    FileText, Calendar, CheckSquare, MoreHorizontal, ArrowLeft,
    History, AlertCircle, Loader2, DollarSign, CheckCircle2,
    Edit, Trash2, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'

// Placeholder hook - will be implemented in useFinance.ts
const useBill = (id: string) => {
    // This is a placeholder. In production, this should be added to useFinance.ts
    return {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => {}
    }
}

export function BillDetailsView() {
    const { billId } = useParams({ strict: false }) as { billId: string }
    const navigate = useNavigate()

    // Fetch bill data
    const { data: billData, isLoading, isError, error, refetch } = useBill(billId)

    // Transform API data to component format
    const bill = useMemo(() => {
        if (!billData) return null
        const b = billData as any
        return {
            id: b.billNumber || b._id,
            vendor: typeof b.vendorId === 'string' ? b.vendorId : (b.vendorId?.name || 'مورد غير محدد'),
            amount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(b.totalAmount || 0),
            currency: 'ر.س',
            status: b.status,
            billDate: new Date(b.billDate).toLocaleDateString('ar-SA'),
            dueDate: new Date(b.dueDate).toLocaleDateString('ar-SA'),
            paidDate: b.paidDate ? new Date(b.paidDate).toLocaleDateString('ar-SA') : null,
            subtotal: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(b.subtotal || 0),
            vatRate: b.vatRate || 0,
            vatAmount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(b.vatAmount || 0),
            amountPaid: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(b.amountPaid || 0),
            balanceDue: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(b.balanceDue || 0),
            items: (b.items || []).map((item: any) => ({
                description: item.description,
                quantity: item.quantity,
                rate: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(item.unitPrice || 0),
                amount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(item.total || 0)
            })),
            history: (b.history || []).map((h: any) => ({
                date: new Date(h.timestamp).toLocaleDateString('ar-SA'),
                action: h.action,
                user: h.performedBy || 'النظام'
            })),
            notes: b.notes,
            pdfUrl: b.pdfUrl,
        }
    }, [billData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/bills', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    ]

    // Get status color and label
    const getStatusInfo = (status?: string) => {
        switch (status) {
            case 'draft':
                return { label: 'مسودة', color: 'bg-slate-100 text-slate-700' }
            case 'pending':
                return { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' }
            case 'approved':
                return { label: 'موافق عليها', color: 'bg-blue-100 text-blue-700' }
            case 'paid':
                return { label: 'مدفوعة', color: 'bg-emerald-100 text-emerald-700' }
            case 'overdue':
                return { label: 'متأخرة', color: 'bg-red-100 text-red-700' }
            case 'cancelled':
                return { label: 'ملغاة', color: 'bg-slate-100 text-slate-700' }
            default:
                return { label: status || 'غير محدد', color: 'bg-slate-100 text-slate-700' }
        }
    }

    // LOADING STATE
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <Skeleton className="h-96 w-full rounded-2xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // ERROR STATE
    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/bills" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ml-2" />
                            العودة إلى الفواتير
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل تفاصيل الفاتورة</h3>
                        <p className="text-slate-500 mb-6">{(error as any)?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // EMPTY STATE (bill not found)
    if (!bill) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/bills" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ml-2" />
                            العودة إلى الفواتير
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">الفاتورة غير موجودة</h3>
                        <p className="text-slate-500 mb-6">لم نتمكن من العثور على الفاتورة المطلوبة</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to="/dashboard/finance/bills">
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                العودة إلى قائمة الفواتير
                            </Link>
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    const statusInfo = getStatusInfo(bill.status)

    // SUCCESS STATE
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/bills" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى الفواتير
                    </Link>
                </div>

                <ProductivityHero
                    badge="فاتورة مورد"
                    title={bill.id}
                    type="bills"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bill Info Card */}
                        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy">معلومات الفاتورة</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm text-slate-500">المورد</label>
                                        <p className="font-bold text-navy mt-1">{bill.vendor}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">تاريخ الفاتورة</label>
                                        <p className="font-bold text-navy mt-1">{bill.billDate}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">تاريخ الاستحقاق</label>
                                        <p className="font-bold text-navy mt-1">{bill.dueDate}</p>
                                    </div>
                                    {bill.paidDate && (
                                        <div>
                                            <label className="text-sm text-slate-500">تاريخ الدفع</label>
                                            <p className="font-bold text-emerald-600 mt-1">{bill.paidDate}</p>
                                        </div>
                                    )}
                                </div>

                                {bill.notes && (
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <label className="text-sm text-slate-500">ملاحظات</label>
                                        <p className="text-navy mt-2">{bill.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Line Items Card */}
                        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                <CardTitle className="text-lg font-bold text-navy">بنود الفاتورة</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                                            <tr>
                                                <th className="px-6 py-4">الوصف</th>
                                                <th className="px-6 py-4 text-center">الكمية</th>
                                                <th className="px-6 py-4 text-center">السعر</th>
                                                <th className="px-6 py-4 text-left">المجموع</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {bill.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50/50">
                                                    <td className="px-6 py-4 font-medium text-navy">{item.description}</td>
                                                    <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-center text-slate-600">{item.rate}</td>
                                                    <td className="px-6 py-4 text-left font-bold text-navy">{item.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan={2} className="px-6 py-3 text-slate-600">المجموع الفرعي</td>
                                                <td colSpan={2} className="px-6 py-3 text-left font-bold text-navy">{bill.subtotal} {bill.currency}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={2} className="px-6 py-3 text-slate-600">ضريبة القيمة المضافة ({(bill.vatRate * 100).toFixed(0)}%)</td>
                                                <td colSpan={2} className="px-6 py-3 text-left font-bold text-navy">{bill.vatAmount} {bill.currency}</td>
                                            </tr>
                                            <tr className="bg-emerald-50">
                                                <td colSpan={2} className="px-6 py-4 font-bold text-emerald-800">الإجمالي</td>
                                                <td colSpan={2} className="px-6 py-4 text-left font-bold text-emerald-600 text-lg">{bill.amount} {bill.currency}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Card */}
                        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                <CardTitle className="text-lg font-bold text-navy">الإجراءات</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-wrap gap-3">
                                    {bill.status === 'pending' && (
                                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                                            <CheckCircle2 className="ml-2 h-4 w-4" />
                                            الموافقة على الفاتورة
                                        </Button>
                                    )}
                                    {(bill.status === 'approved' || bill.status === 'pending') && (
                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                            <DollarSign className="ml-2 h-4 w-4" />
                                            تسجيل دفعة
                                        </Button>
                                    )}
                                    {bill.status === 'paid' && (
                                        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                                            <CheckSquare className="ml-2 h-4 w-4" />
                                            ترحيل إلى دفتر الأستاذ
                                        </Button>
                                    )}
                                    <Button asChild variant="outline">
                                        <Link to={`/dashboard/finance/bills/${billId}/edit`}>
                                            <Edit className="ml-2 h-4 w-4" />
                                            تعديل
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                        <Trash2 className="ml-2 h-4 w-4" />
                                        حذف
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="bills" />
                </div>
            </Main>
        </>
    )
}
