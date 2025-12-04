import { useState, useMemo } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle, ArrowRightLeft, Loader2
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
import { useTransaction } from '@/hooks/useFinance'
import { useParams } from '@tanstack/react-router'
import { ProductivityHero } from '@/components/productivity-hero'

export function TransactionDetailsView() {
    const { transactionId } = useParams({ strict: false }) as { transactionId: string }

    // Fetch transaction data
    const { data: transactionData, isLoading, isError, error, refetch } = useTransaction(transactionId)

    // Transform API data to component format
    const transaction = useMemo(() => {
        if (!transactionData?.data) return null
        const txn = transactionData.data
        return {
            id: txn._id,
            description: txn.description,
            amount: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(txn.amount || 0),
            currency: 'ر.س',
            type: txn.type, // credit or debit
            status: txn.status,
            date: new Date(txn.date).toLocaleDateString('ar-SA'),
            time: new Date(txn.date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            reference: txn.reference || '-',
            paymentMethod: txn.paymentMethod,
            category: txn.category,
            invoiceId: txn.invoiceId,
            expenseId: txn.expenseId,
            bank: txn.bank,
            account: txn.account,
            notes: txn.notes,
            history: txn.history || []
        }
    }, [transactionData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: true },
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
                    <div className='ms-auto flex items-center space-x-4'>
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
                    <Skeleton className="h-96 w-full rounded-2xl" />
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
                    <div className='ms-auto flex items-center space-x-4'>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/transactions" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ml-2" />
                            العودة إلى المعاملات
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل تفاصيل المعاملة</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // EMPTY STATE (not found)
    if (!transaction) {
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
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto mb-6">
                        <Link to="/dashboard/finance/transactions" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                            <ArrowLeft className="h-4 w-4 ml-2" />
                            العودة إلى المعاملات
                        </Link>
                    </div>
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRightLeft className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">المعاملة غير موجودة</h3>
                        <p className="text-slate-500 mb-6">لم نتمكن من العثور على المعاملة المطلوبة</p>
                        <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white px-8">
                            <Link to="/dashboard/finance/transactions">
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                العودة إلى قائمة المعاملات
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
                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/transactions" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى المعاملات
                    </Link>
                </div>

                <ProductivityHero
                    badge={`المرجع: ${transaction.reference}`}
                    title={transaction.description}
                    type="transactions"
                    listMode={true}
                    stats={[
                        {
                            label: "المبلغ",
                            value: `${transaction.type === 'income' ? '+' : '-'}${transaction.amount} ${transaction.currency}`,
                            icon: DollarSign,
                            status: transaction.type === 'income' ? 'normal' : 'attention'
                        },
                        {
                            label: "التاريخ",
                            value: `${transaction.date} - ${transaction.time}`,
                            icon: Calendar,
                            status: 'normal'
                        },
                        {
                            label: "الحالة",
                            value: transaction.status === 'completed' ? 'مكتملة' : 'قيد المعالجة',
                            icon: CheckCircle2,
                            status: 'normal'
                        }
                    ]}
                />

                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy">معلومات إضافية</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">البنك</label>
                                            <div className="font-medium text-navy">{transaction.bank}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">رقم الحساب</label>
                                            <div className="font-medium text-navy font-mono">{transaction.account}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">نوع المعاملة</label>
                                            <div className="font-medium text-navy">{transaction.type === 'income' ? 'إيداع' : 'سحب'}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        سجل النشاط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="relative p-6">
                                            <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                                            <div className="space-y-8 relative">
                                                {transaction.history.map((event, i) => (
                                                    <div key={i} className="flex gap-4 relative">
                                                        <div className="w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white bg-blue-500"></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-navy">{event.action}</div>
                                                            <div className="text-xs text-slate-500 mb-1">{event.date} • {event.user}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
