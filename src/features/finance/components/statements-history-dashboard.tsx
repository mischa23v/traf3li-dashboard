import { useState, useMemo } from 'react'
import {
    Search, Download, Plus, MoreHorizontal,
    FileText, Calendar, Building, FileClock, Send, Bell,
    Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useStatements } from '@/hooks/useFinance'

export default function StatementsHistoryDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch statements from API
    const { data, isLoading, isError, error } = useStatements({ status: activeTab === 'all' ? undefined : activeTab })

    // Filter Logic
    const filteredStatements = useMemo(() => {
        if (!data?.data) return []

        return data.data.filter((st: any) => {
            if (searchQuery && !st.clientName.includes(searchQuery) && !st.statementNumber.includes(searchQuery)) {
                return false
            }
            return true
        })
    }, [data, searchQuery])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
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
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Section - Contained Navy Card */}
                    <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                        <FileClock className="w-3 h-3 ml-2" />
                                        الأرشيف
                                    </Badge>
                                    <span className="text-blue-200 text-sm">2025</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    سجل كشوف الحساب
                                </h1>
                                <p className="text-blue-200/80">إدارة ومراجعة جميع كشوف الحسابات الصادرة للعملاء</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                    <Download className="w-4 h-4 ml-2" />
                                    تصدير السجل
                                </Button>
                                <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                    <Link to="/dashboard/finance/statements/new">
                                        <Plus className="w-4 h-4 ml-2" />
                                        إنشاء كشف جديد
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Statements List */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Filters Bar */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                    <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                        >
                                            الكل
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sent"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            تم الإرسال
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="paid"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            مدفوع
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="draft"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            مسودة
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="بحث في الكشوفات..."
                                            className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="space-y-4">
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                                            <div className="flex gap-4 mb-4">
                                                <Skeleton className="w-12 h-12 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-5 w-1/3" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-16 w-full" />
                                        </div>
                                    ))
                                ) : isError ? (
                                    <div className="bg-white rounded-2xl p-12 text-center border border-red-100">
                                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2 text-slate-900">فشل تحميل الكشوف</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                                        <Button onClick={() => window.location.reload()} className="bg-[#022c22] hover:bg-[#033d2f]">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                ) : filteredStatements.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                                        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold mb-2 text-slate-900">لا توجد كشوف حساب</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإنشاء كشف حساب جديد للعملاء</p>
                                        <Button asChild className="bg-brand-blue hover:bg-blue-600">
                                            <Link to="/dashboard/finance/statements/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                إنشاء كشف جديد
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    filteredStatements.map((st: any) => (
                                        <div key={st._id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-sm mt-1">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-[#022c22] text-lg">{st.clientName}</h4>
                                                            <Badge variant="outline" className={`${st.status === 'sent' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                                st.status === 'paid' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                                    'text-slate-600 border-slate-200 bg-slate-50'
                                                                } border px-2 rounded-md`}>
                                                                {st.status === 'sent' ? 'تم الإرسال' :
                                                                    st.status === 'paid' ? 'مدفوع بالكامل' : 'مسودة'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <span className="font-mono text-slate-400">{st.statementNumber}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <Calendar className="w-3 h-3" />
                                                            {st.period}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to="/dashboard/finance/statements/$statementId" params={{ statementId: st._id }}>
                                                                عرض الكشف
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>تحميل PDF</DropdownMenuItem>
                                                        <DropdownMenuItem>إعادة إرسال</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">تاريخ الإصدار</div>
                                                        <div className="font-bold text-[#022c22]">{new Date(st.generatedDate).toLocaleDateString('ar-SA')}</div>
                                                    </div>
                                                    <div className="text-center pl-4 border-l border-slate-100">
                                                        <div className="text-xs text-slate-400 mb-1">عدد البنود</div>
                                                        <div className="font-bold text-slate-700">{st.items?.length || 0}</div>
                                                    </div>
                                                </div>

                                                <div className="text-left">
                                                    <div className="text-xs text-slate-400 mb-1">إجمالي الكشف</div>
                                                    <div className="font-bold text-[#022c22] text-xl">{formatCurrency(st.totalAmount)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sidebar - Summary */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                        <Building className="w-5 h-5 text-brand-blue" />
                                        ملخص الشهر
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">الكشوفات المصدرة</span>
                                        <span className="font-bold text-[#022c22]">{data?.data?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">إجمالي المبالغ</span>
                                        <span className="font-bold text-emerald-600">{formatCurrency(data?.data?.reduce((sum: number, st: any) => sum + st.totalAmount, 0) || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">بانتظار الدفع</span>
                                        <span className="font-bold text-amber-600">{formatCurrency(data?.data?.filter((st: any) => st.status === 'sent').reduce((sum: number, st: any) => sum + st.totalAmount, 0) || 0)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#022c22] text-white border-none rounded-3xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Send className="w-5 h-5 text-brand-blue" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">إرسال جماعي</h3>
                                        <p className="text-blue-200 text-sm mb-4">يمكنك إرسال تذكيرات لجميع العملاء الذين لم يسددوا كشوفاتهم بعد.</p>
                                        <Button className="w-full bg-brand-blue hover:bg-blue-600 text-white border-0">
                                            إرسال تذكيرات
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>
                </div>
            </Main>
        </>
    )
}
