import { useState, useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, AlertCircle, CheckCircle2, Scale, Building, Mail, Phone,
    ChevronRight, Search, ArrowLeft, Gavel, Shield, Briefcase,
    FileCheck, AlertTriangle, Download, Eye, History, Share2, Bell, MapPin,
    DollarSign, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useCase } from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CaseDetailsView() {
    const [activeTab, setActiveTab] = useState('overview')
    const { caseId } = useParams({ strict: false }) as { caseId: string }

    const { data: caseData, isLoading, isError, error, refetch } = useCase(caseId)

    const caseInfo = useMemo(() => {
        if (!caseData?.data) return null
        const c = caseData.data

        return {
            id: c.caseNumber || c._id,
            title: c.title || 'قضية غير محددة',
            status: c.status || 'active',
            statusLabel: c.status === 'active' ? 'قيد النظر' : 'مغلقة',
            plaintiff: c.clientId?.name || 'غير محدد',
            defendant: c.opposingParty || 'غير محدد',
            type: c.caseType || 'عامة',
            court: c.court || 'غير محدد',
            judge: c.judge || 'غير محدد',
            assignedLawyer: c.assignedTo?.firstName + ' ' + c.assignedTo?.lastName || 'غير محدد',
            filingDate: c.filingDate ? new Date(c.filingDate).toLocaleDateString('ar-SA') : 'غير محدد',
            nextHearingDate: c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('ar-SA') : 'غير محدد',
            claimAmount: c.claimAmount || 0,
            caseDescription: c.description || 'لا يوجد وصف',
            priority: c.priority || 'medium',
            progress: c.progress || 0,
            documents: c.documents || [],
            tasks: c.tasks || [],
            timeline: c.history || [],
            _id: c._id,
        }
    }, [caseData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'القضايا', href: '/dashboard/cases', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

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

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        <div className="bg-navy rounded-3xl p-8">
                            <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
                            <Skeleton className="h-6 w-1/2 bg-white/20" />
                        </div>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <div className="flex items-center justify-between">
                                <span>حدث خطأ أثناء تحميل تفاصيل القضية: {error?.message || 'خطأ غير معروف'}</span>
                                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                    إعادة المحاولة
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !caseInfo && (
                    <div className="text-center py-12 bg-white rounded-3xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                        <h4 className="text-lg font-bold text-navy mb-2">لم يتم العثور على القضية</h4>
                        <p className="text-slate-500 mb-4">القضية المطلوبة غير موجودة أو تم حذفها</p>
                        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                            <Link to="/dashboard/cases">
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                العودة إلى القضايا
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Success State - HERO BANNER */}
                {!isLoading && !isError && caseInfo && (
                <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Link to="/dashboard/cases">
                                    <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-8 w-8 p-0 mr-2">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                                    <Scale className="h-4 w-4 text-brand-blue" />
                                </div>
                                <span className="text-blue-200 font-medium">قضية عمالية</span>
                                <span className="text-white/20">•</span>
                                <span className="text-slate-300">{caseInfo.court}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{caseInfo.title}</h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span>القاضي: {caseInfo.judge}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>تاريخ الفتح: {caseInfo.startDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-400" />
                                    <span className="text-amber-100 font-bold">الجلسة القادمة: {caseInfo.nextHearing}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card in Hero */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[300px]">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-300">نسبة الإنجاز</span>
                                <span className="text-2xl font-bold text-brand-blue">{caseInfo.completion}%</span>
                            </div>
                            <Progress value={caseInfo.completion} className="h-2 bg-white/10 mb-6" indicatorClassName="bg-brand-blue" />
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <div>
                                    <div className="text-xs text-slate-400 mb-1">قيمة المطالبة</div>
                                    <div className="font-bold text-lg">{caseInfo.claimAmount.toLocaleString()} ر.س</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-slate-400 mb-1">الربح المتوقع</div>
                                    <div className="font-bold text-lg text-emerald-400">{caseInfo.expectedWin.toLocaleString()} ر.س</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT SIDEBAR (Timeline & Quick Actions) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Timeline Card */}
                        <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                            <div className="bg-navy p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue blur-[40px] opacity-30"></div>
                                <h3 className="text-lg font-bold relative z-10 mb-1 flex items-center gap-2">
                                    <History className="h-5 w-5 text-brand-blue" />
                                    الجدول الزمني
                                </h3>
                            </div>
                            <CardContent className="p-0 flex-1 bg-slate-50/50">
                                <ScrollArea className="h-[400px] p-6">
                                    <div className="relative">
                                        {/* Vertical Line */}
                                        <div className="absolute top-2 bottom-2 right-[5px] w-0.5 bg-slate-200"></div>

                                        <div className="space-y-6 relative">
                                            {timeline.map((event, i) => (
                                                <div key={i} className="flex gap-4 relative">
                                                    <div className={`
                                                        w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white shrink-0
                                                        ${event.status === 'completed' ? 'bg-green-500' :
                                                            event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                    `}></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-navy">{event.title}</div>
                                                        <div className="text-xs text-slate-500 mb-1">{event.date}</div>
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white border-slate-200 text-slate-600">
                                                            {event.type === 'hearing' ? 'جلسة' :
                                                                event.type === 'submission' ? 'تقديم' : 'إجراء'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Parties Card */}
                        <Card className="border-0 shadow-lg rounded-2xl bg-white">
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-navy">أطراف القضية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                        م
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-navy">مشاري الرابح</div>
                                        <div className="text-xs text-green-600 font-medium">المدعي (موكلنا)</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                        ش
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-navy">المصنع السعودي</div>
                                        <div className="text-xs text-amber-600 font-medium">المدعى عليه</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CENTER CONTENT (Tabs & Details) */}
                    <div className="lg:col-span-9 flex flex-col gap-6">

                        {/* Tabs Toolbar */}
                        <div className="bg-white p-2 rounded-[20px] border border-slate-100 shadow-sm overflow-x-auto">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="bg-slate-50 p-1 rounded-xl h-auto w-full justify-start gap-2">
                                    {['overview', 'hearings', 'documents', 'claims', 'billing'].map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className="
                                                rounded-lg px-6 py-2 text-sm font-bold transition-all
                                                data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm
                                                text-slate-500 hover:text-navy
                                            "
                                        >
                                            {tab === 'overview' ? 'نظرة عامة' :
                                                tab === 'hearings' ? 'الجلسات والمواعيد' :
                                                    tab === 'documents' ? 'المستندات' :
                                                        tab === 'claims' ? 'المطالبات' : 'الفواتير'}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Tab Content Area */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 min-h-[600px]">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue">
                                                <Gavel className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500">حالة القضية</div>
                                                <div className="font-bold text-navy">قيد النظر</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500">درجة التقاضي</div>
                                                <div className="font-bold text-navy">الدرجة الأولى</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-slate-500">المهام المعلقة</div>
                                                <div className="font-bold text-navy">2 مهام عاجلة</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-lg text-navy">آخر التحديثات</h3>
                                            <Button variant="ghost" size="sm" className="text-brand-blue">عرض السجل الكامل</Button>
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', title: 'تم تقديم مذكرة الدفاع', date: 'منذ يومين', user: 'أحمد المحامي' },
                                                { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', title: 'تحديد موعد جلسة جديدة', date: 'منذ 3 أيام', user: 'النظام' },
                                                { icon: Upload, color: 'text-green-600', bg: 'bg-green-50', title: 'تم رفع مستندات إضافية', date: 'منذ 5 أيام', user: 'سارة المساعد' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                                    <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-navy text-sm">{item.title}</div>
                                                        <div className="text-xs text-slate-500">بواسطة {item.user}</div>
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">{item.date}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Upload New Card */}
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-all group h-[180px]">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-brand-blue mb-3 transition-colors">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <span className="font-bold text-slate-600 group-hover:text-brand-blue">رفع مستند جديد</span>
                                        <span className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG</span>
                                    </div>

                                    {/* Document Cards */}
                                    {[
                                        { name: 'صحيفة الدعوى.pdf', type: 'PDF', size: '2.4 MB', date: '15/01/2024' },
                                        { name: 'عقد العمل.pdf', type: 'PDF', size: '1.1 MB', date: '16/01/2024' },
                                        { name: 'صورة الهوية.jpg', type: 'IMG', size: '450 KB', date: '16/01/2024' },
                                        { name: 'مذكرة الرد.docx', type: 'DOC', size: '850 KB', date: '20/02/2024' },
                                        { name: 'وكالة شرعية.pdf', type: 'PDF', size: '1.8 MB', date: '15/01/2024' },
                                    ].map((doc, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                                    {doc.type}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 ml-2" /> معاينة
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Download className="h-4 w-4 ml-2" /> تحميل
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-navy text-sm mb-1 line-clamp-1" title={doc.name}>{doc.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span>{doc.size}</span>
                                                    <span>•</span>
                                                    <span>{doc.date}</span>
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-slate-200 flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-white border-slate-200 hover:bg-slate-50">معاينة</Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'hearings' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-navy">الجلسات القادمة</h3>
                                        <Button size="sm" className="bg-brand-blue hover:bg-blue-600 text-white">
                                            <Plus className="h-4 w-4 ml-2" />
                                            إضافة جلسة
                                        </Button>
                                    </div>

                                    {/* Court Hearing Card */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                        <div className="flex items-start justify-between mb-4 gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">جلسة مرافعة</Badge>
                                                    <Badge variant="outline" className="bg-white/50 text-blue-700 border-blue-200">عن بعد</Badge>
                                                </div>
                                                <h4 className="text-lg font-bold text-navy mb-1">جلسة مرافعة - المحكمة العمالية</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span>٢٦ جمادى الأولى ١٤٤٧</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                        <span>10:35 صباحاً</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 text-center min-w-[80px]">
                                                <div className="text-xs text-slate-500 mb-1">باقي</div>
                                                <div className="text-xl font-bold text-blue-600">5</div>
                                                <div className="text-xs text-slate-500">أيام</div>
                                            </div>
                                        </div>

                                        <Separator className="bg-blue-200/50 my-4" />

                                        <div className="space-y-3">
                                            <h5 className="text-sm font-bold text-navy">المذكرات المطلوبة</h5>
                                            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <FileCheck className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-navy">صحيفة الدعوى</div>
                                                        <div className="text-xs text-slate-500">تم التقديم بواسطة المدعي</div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                    عرض
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-blue-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-navy">مذكرة الدفاع</div>
                                                        <div className="text-xs text-slate-500">بانتظار تقديم المدعى عليه</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">معلق</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Past Hearing */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 opacity-75 hover:opacity-100 transition-opacity">
                                        <div className="flex items-start justify-between mb-4 gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="bg-slate-200 text-slate-700">جلسة أولى</Badge>
                                                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">مكتملة</Badge>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-700 mb-1">الجلسة الأولى - المحكمة العمالية</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>١٠ جمادى الأولى ١٤٤٧</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'claims' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-navy">تفاصيل المطالبات</h3>
                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                                            <Plus className="h-4 w-4 ml-2" />
                                            إضافة مطالبة
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Claim Item 1 */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy">أجور متأخرة</h4>
                                                        <div className="text-xs text-slate-500">عن شهر أكتوبر 2023</div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">طلب أجر</Badge>
                                            </div>
                                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                                <div className="text-xs text-slate-400">
                                                    <div>من: 01/10/2023</div>
                                                    <div>إلى: 31/10/2023</div>
                                                </div>
                                                <div className="text-lg font-bold text-navy">4,000 ر.س</div>
                                            </div>
                                        </div>

                                        {/* Claim Item 2 */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy">أجور متأخرة</h4>
                                                        <div className="text-xs text-slate-500">عن شهر نوفمبر 2023</div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">طلب أجر</Badge>
                                            </div>
                                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                                <div className="text-xs text-slate-400">
                                                    <div>من: 01/11/2023</div>
                                                    <div>إلى: 30/11/2023</div>
                                                </div>
                                                <div className="text-lg font-bold text-navy">4,000 ر.س</div>
                                            </div>
                                        </div>

                                        {/* Claim Item 3 */}
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                        <DollarSign className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-navy">أجور متأخرة</h4>
                                                        <div className="text-xs text-slate-500">عن شهر ديسمبر 2023</div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">طلب أجر</Badge>
                                            </div>
                                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                                <div className="text-xs text-slate-400">
                                                    <div>من: 01/12/2023</div>
                                                    <div>إلى: 31/12/2023</div>
                                                </div>
                                                <div className="text-lg font-bold text-navy">4,000 ر.س</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Summary */}
                                    <div className="bg-navy rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-navy/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                                <Scale className="h-6 w-6 text-brand-blue" />
                                            </div>
                                            <div>
                                                <div className="text-blue-200 text-sm mb-1">إجمالي المطالبات</div>
                                                <div className="font-bold text-xl">3 مواضيع</div>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-blue-200 text-sm mb-1">المبلغ الكلي</div>
                                            <div className="font-bold text-3xl text-emerald-400">12,000 ر.س</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'billing' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-navy">الفواتير والمدفوعات</h3>
                                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                                            <Plus className="h-4 w-4 ml-2" />
                                            فاتورة جديدة
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="text-sm text-slate-500 mb-1">إجمالي المستحقات</div>
                                            <div className="text-2xl font-bold text-navy">{formatCurrency(8300)}</div>
                                            <Progress value={45} className="h-1.5 mt-3 bg-slate-200" indicatorClassName="bg-emerald-500" />
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="text-sm text-slate-500 mb-1">المدفوع</div>
                                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(3800)}</div>
                                            <div className="text-xs text-slate-400 mt-2">45% من إجمالي المبلغ</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {invoices.map((invoice) => (
                                            <div key={invoice.id} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${invoice.status === 'مدفوعة' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-bold text-navy">{invoice.id}</h4>
                                                                <Badge className={`${invoice.statusColor} border-0 px-2 py-0.5 text-[10px]`}>
                                                                    {invoice.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                استحقاق: {invoice.dueDate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold text-lg text-navy">{formatCurrency(invoice.amount)}</div>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                                    {invoice.services.map((service, idx) => (
                                                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-normal">
                                                            {service}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}
            </Main>
        </>
    )
}
