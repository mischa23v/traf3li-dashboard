import { useState, useMemo } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useInvoice } from '@/hooks/useFinance'
import { useParams } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'

export function InvoiceDetailsView() {
    const { invoiceId } = useParams({ strict: false }) as { invoiceId: string }
    const [activeTab, setActiveTab] = useState('details')

    // Fetch invoice data
    const { data: invoiceData, isLoading, isError, error, refetch } = useInvoice(invoiceId)

    // Transform API data to component format
    const invoice = useMemo(() => {
        if (!invoiceData) return null
        const inv = invoiceData
        return {
            id: inv.invoiceNumber || inv._id,
            client: typeof inv.clientId === 'string' ? inv.clientId : (inv.clientId?.name || `${inv.clientId?.firstName || ''} ${inv.clientId?.lastName || ''}`.trim() || 'عميل غير محدد'),
            amount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(inv.totalAmount || 0),
            currency: 'ر.س',
            status: inv.status,
            issueDate: new Date(inv.issueDate).toLocaleDateString('ar-SA'),
            dueDate: new Date(inv.dueDate).toLocaleDateString('ar-SA'),
            paidDate: inv.paidDate ? new Date(inv.paidDate).toLocaleDateString('ar-SA') : null,
            subtotal: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(inv.subtotal || 0),
            vatRate: inv.vatRate || 0,
            vatAmount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(inv.vatAmount || 0),
            amountPaid: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(inv.amountPaid || 0),
            balanceDue: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(inv.balanceDue || 0),
            items: (inv.items || []).map((item: any) => ({
                description: item.description,
                quantity: item.quantity,
                rate: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(item.unitPrice || 0),
                amount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(item.total || 0)
            })),
            history: (inv.history || []).map((h: any) => ({
                date: new Date(h.timestamp).toLocaleDateString('ar-SA'),
                action: h.action,
                user: h.performedBy || 'النظام'
            })),
            notes: inv.notes,
            pdfUrl: inv.pdfUrl,
        }
    }, [invoiceData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: true },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
    ]

    // LOADING STATE
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
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
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to={ROUTES.dashboard.finance.invoices.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                            العودة إلى الفواتير
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل تفاصيل الفاتورة</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ms-2 h-4 w-4" aria-hidden="true" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // EMPTY STATE (invoice not found)
    if (!invoice) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <div className="relative hidden md:block">
                            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                        </div>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to={ROUTES.dashboard.finance.invoices.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                            العودة إلى الفواتير
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-slate-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">الفاتورة غير موجودة</h3>
                        <p className="text-slate-500 mb-6">لم نتمكن من العثور على الفاتورة المطلوبة</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to={ROUTES.dashboard.finance.invoices.list}>
                                <ArrowLeft className="ms-2 h-4 w-4" aria-hidden="true" />
                                العودة إلى قائمة الفواتير
                            </Link>
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // SUCCESS STATE
    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to={ROUTES.dashboard.finance.invoices.list} className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى الفواتير
                    </Link>
                </div>

                <ProductivityHero
                    badge="فاتورة ضريبية"
                    title={invoice.id}
                    type="invoices"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">بنود الفاتورة</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-start">
                                            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
                                                <tr>
                                                    <th className="px-6 py-4">الوصف</th>
                                                    <th className="px-6 py-4 text-center">الكمية</th>
                                                    <th className="px-6 py-4 text-center">السعر</th>
                                                    <th className="px-6 py-4 text-start">المجموع</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {invoice.items.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-medium text-navy">{item.description}</td>
                                                        <td className="px-6 py-4 text-center text-slate-600">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-center text-slate-600">{item.rate}</td>
                                                        <td className="px-6 py-4 text-start font-bold text-navy">{item.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-50">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 font-bold text-navy text-start">الإجمالي</td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600 text-start text-lg">{invoice.amount} {invoice.currency}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <FinanceSidebar context="invoices" />
                </div>
            </Main>
        </>
    )
}
