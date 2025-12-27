import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    Calendar,
    Clock,
    FileText,
    Plus,
    Search,
    Upload,
    User,
    Briefcase,
    Building,
    Building2,
    DollarSign,
    FileCheck,
    MapPin,
    Scale,
    AlertCircle,
    Download,
    Bell
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function CasesView() {
    const [activeTab, setActiveTab] = useState("overview")

    // Mock Data from LegalCaseManagement.jsx
    const caseData = {
        id: "4772077905",
        title: "مشاري بن ناهد بن حسين الرابح ضد المصنع السعودي العربي للمنتجات المعدنية",
        status: "قيد التنفيذ",
        progress: 65,
        court: "المحكمة العمالية - الرياض",
        judge: "د. عبد العزيز الفوزان",
        filingDate: "15 يناير 2024",
        nextHearing: "20 مارس 2024 (بعد 5 أيام)",
        laborOffice: "مكتب عمل الخبر",
        claimAmount: 12000,
        expectedProfit: 2400
    }

    const parties = {
        plaintiff: {
            name: "مشاري بن ناهد بن حسين الرابح",
            id: "1045678901",
            nationality: "سعودي",
            dobGregorian: "12/05/1985",
            dobHijri: "22/08/1405",
            job: "مهندس إنتاج",
            phone: "0551234567",
            email: "meshari@example.com",
            address: "حي العليا، الرياض",
            region: "المنطقة الشرقية",
            city: "الدمام"
        },
        defendant: {
            name: "المصنع السعودي العربي للمنتجات المعدنية",
            type: "شركة ذات مسؤولية محدودة",
            crNo: "2051056789",
            unifiedNo: "7001234567",
            fileNo: "300456789",
            phone: "0138889999",
            email: "legal@saudimetal.com",
            address: "المدينة الصناعية الثانية، الدمام",
            region: "المنطقة الشرقية",
            city: "الدمام"
        }
    }

    const workDetails = {
        wageType: "راتب شهري",
        salary: 8500,
        contractType: "محدد المدة",
        contractNo: "CN-2023-889",
        startDateGregorian: "01/03/2020",
        startDateHijri: "05/07/1441",
        lastDay: "31/12/2023",
        reason: "فسخ العقد من قبل صاحب العمل"
    }

    const claims = [
        {
            title: "أجر متأخر - أكتوبر 2023",
            amount: 4000,
            type: "طلب أجر",
            subtype: "أجر متأخر",
            period: { fromG: "01 أكتوبر 2023", fromH: "16/03/1445", toG: "31 أكتوبر 2023", toH: "14/04/1446" }
        },
        {
            title: "أجر متأخر - نوفمبر 2023",
            amount: 4000,
            type: "طلب أجر",
            subtype: "أجر متأخر",
            period: { fromG: "01 نوفمبر 2023", fromH: "15/04/1445", toG: "30 نوفمبر 2023", toH: "24/05/1445" }
        },
        {
            title: "أجر متأخر - ديسمبر 2023",
            amount: 4000,
            type: "طلب أجر",
            subtype: "أجر متأخر",
            period: { fromG: "01 ديسمبر 2023", fromH: "15/05/1445", toG: "31 ديسمبر 2023", toH: "16/06/1445" }
        }
    ]

    const hearings = [
        {
            title: "تم تقديم الدعوى للمحكمة",
            date: "25 يناير 2024",
            location: "بواسطة أحمد المحامي",
            status: "completed",
            isNew: true,
            memos: [
                { type: "مذكرة دفاع", date: "24 يناير 2024", by: "المدعى عليه", status: "viewed" },
                { type: "مذكرة رد", date: "26 يناير 2024", by: "المدعي", status: "pending" }
            ],
            mechanism: null,
            result: null
        },
        {
            title: "الشركة رفضت التسوية الودية",
            date: "20 يناير 2024",
            location: "بواسطة أحمد المحامي",
            status: "completed",
            isNew: true,
            memos: [],
            mechanism: null,
            result: null
        },
        {
            title: "تم التواصل مع العميل",
            date: "16 يناير 2024",
            location: "بواسطة أحمد المحامي",
            status: "completed",
            isNew: true,
            memos: [],
            mechanism: null,
            result: null
        }
    ]

    const documents = {
        memos: [
            { name: "مذكرة الدفاع الأولية.pdf", size: "2.4 MB", date: "24 يناير 2024", party: "مدعى عليه" },
            { name: "لائحة الدعوى.pdf", size: "1.8 MB", date: "15 يناير 2024", party: "مدعي" }
        ],
        evidence: [
            { name: "عقد العمل.pdf", size: "4.2 MB", date: "15 يناير 2024", category: "عقود" },
            { name: "كشف حساب بنكي.pdf", size: "3.1 MB", date: "15 يناير 2024", category: "مالية" },
            { name: "خطاب إنهاء الخدمة.jpg", size: "1.5 MB", date: "15 يناير 2024", category: "مراسلات" }
        ]
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'القضايا', href: ROUTES.dashboard.cases.list, isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="التنبيهات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-slate-50/50 flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Section - Contained Navy Card */}
                    <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 mb-8">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                            <Scale className="w-3 h-3 ms-2" aria-hidden="true" />
                                            قضية عمالية
                                        </Badge>
                                        <span className="text-blue-200 text-sm">{caseData.court}</span>
                                        <span className="text-slate-500 text-sm">•</span>
                                        <span className="text-blue-200 text-sm font-mono">{caseData.id}</span>
                                    </div>
                                    <Link to={ROUTES.dashboard.cases.detail(caseData.id)} className="hover:underline decoration-emerald-400 underline-offset-4">
                                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2 hover:text-emerald-400 transition-colors">
                                            {caseData.title}
                                        </h1>
                                    </Link>
                                </div>
                                <div className="flex gap-3">
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
                                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                        إجراء جديد
                                    </Button>
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                        <Upload className="w-4 h-4 ms-2" aria-hidden="true" />
                                        مشاركة
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">نسبة الإنجاز</span>
                                        <span className="font-bold text-emerald-400">{caseData.progress}%</span>
                                    </div>
                                    <Progress value={caseData.progress} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div className="flex justify-between items-center border-e border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">قيمة المطالبة</div>
                                        <div className="text-2xl font-bold">{caseData.claimAmount.toLocaleString()} ر.س</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-e border-white/10 pe-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">الربح المتوقع</div>
                                        <div className="text-2xl font-bold text-emerald-400">{caseData.expectedProfit.toLocaleString()} ر.س</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6 mt-6 text-sm text-blue-200/80">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" aria-hidden="true" />
                                    تاريخ الفتح: {caseData.filingDate}
                                </div>
                                <div className="flex items-center gap-2 text-amber-300">
                                    <Clock className="w-4 h-4" aria-hidden="true" />
                                    الجلسة القادمة: {caseData.nextHearing}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" aria-hidden="true" />
                                    مكتب العمل: {caseData.laborOffice}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar - Timeline */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center justify-between">
                                        <span>السجل الزمني</span>
                                        <Clock className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[600px] p-6">
                                        <div className="relative border-e-2 border-slate-100 pe-6 space-y-8">
                                            {hearings.map((event, index) => (
                                                <div key={index} className="relative">
                                                    <div className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-brand-blue' : 'bg-slate-300'}`}></div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={`font-bold text-sm ${index === 0 ? 'text-navy' : 'text-slate-600'}`}>{event.title}</h4>
                                                        </div>
                                                        <div className="text-xs text-slate-500">{event.date}</div>
                                                        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg inline-block">
                                                            {typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || 'عن بعد')}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <Card className="lg:col-span-8 border-none shadow-none bg-transparent">
                            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full justify-start bg-white p-1 rounded-full border border-slate-200 mb-6 h-auto flex-wrap">
                                    <TabsTrigger
                                        value="overview"
                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-brand-blue data-[state=active]:text-white transition-all duration-300"
                                    >
                                        نظرة عامة
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="parties"
                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-brand-blue data-[state=active]:text-white transition-all duration-300"
                                    >
                                        الأطراف والعمل
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="claims"
                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-brand-blue data-[state=active]:text-white transition-all duration-300"
                                    >
                                        المطالبات المالية
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="hearings"
                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-brand-blue data-[state=active]:text-white transition-all duration-300"
                                    >
                                        الجلسات والمواعيد
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="documents"
                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-brand-blue data-[state=active]:text-white transition-all duration-300"
                                    >
                                        المسندات
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6">
                                    {/* OVERVIEW TAB */}
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                                    <CardTitle className="text-base font-bold text-navy">ملخص القضية</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">رقم القضية</span>
                                                        <span className="font-mono font-bold text-navy">{caseData.id}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">تاريخ الفتح</span>
                                                        <span className="font-bold text-navy">{caseData.filingDate}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">الحالة</span>
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">{caseData.status}</Badge>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">القاضي</span>
                                                        <span className="font-bold text-navy">{caseData.judge}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                                    <CardTitle className="text-base font-bold text-navy">الموقع والاختصاص</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">المحكمة</span>
                                                        <span className="font-bold text-navy">{caseData.court}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">مكتب العمل</span>
                                                        <span className="font-bold text-navy">{caseData.laborOffice}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">المدينة</span>
                                                        <span className="font-bold text-navy">{parties.plaintiff.city}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 text-sm">نوع القضية</span>
                                                        <Badge variant="outline" className="text-navy border-navy/20 rounded-lg">عمالية</Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* PARTIES TAB */}
                                    <TabsContent value="parties" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            {/* Plaintiff */}
                                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 bg-green-50/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                            <User className="h-5 w-5" aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-bold text-navy">المدعي</CardTitle>
                                                            <div className="text-xs text-green-600 font-medium">موكلنا</div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-slate-500">الاسم الكامل</span>
                                                        <div className="font-bold text-navy">{parties.plaintiff.name}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">رقم الهوية</span>
                                                            <div className="font-medium text-navy">{parties.plaintiff.id}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">الجنسية</span>
                                                            <div className="font-medium text-navy">{parties.plaintiff.nationality}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">تاريخ الميلاد</span>
                                                            <div className="font-medium text-navy">{parties.plaintiff.dobGregorian}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">المهنة</span>
                                                            <div className="font-medium text-navy">{parties.plaintiff.job}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">رقم الهاتف</span>
                                                            <div className="font-medium text-navy" dir="ltr">{parties.plaintiff.phone}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">المنطقة</span>
                                                            <div className="font-medium text-navy">{parties.plaintiff.region} - {parties.plaintiff.city}</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Defendant */}
                                            <Card className="border-slate-200 shadow-sm rounded-2xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 bg-amber-50/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                            <Building2 className="h-5 w-5" aria-hidden="true" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-bold text-navy">المدعى عليه</CardTitle>
                                                            <div className="text-xs text-amber-600 font-medium">الخصم</div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    <div className="space-y-1">
                                                        <span className="text-xs text-slate-500">اسم الجهة</span>
                                                        <div className="font-bold text-navy">{parties.defendant.name}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">رقم السجل التجاري</span>
                                                            <div className="font-medium text-navy">{parties.defendant.crNo}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">رقم الملف</span>
                                                            <div className="font-medium text-navy">{parties.defendant.fileNo}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">الرقم الموحد</span>
                                                            <div className="font-medium text-navy">{parties.defendant.unifiedNo}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">نوع الجهة</span>
                                                            <div className="font-medium text-navy">{parties.defendant.type}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">المنطقة</span>
                                                            <div className="font-medium text-navy">{parties.defendant.region} - {parties.defendant.city}</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Work Details */}
                                            <Card className="border-slate-200 shadow-sm xl:col-span-2 rounded-2xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                        <Briefcase className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                                        بيانات العمل
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">نوع الأجر</span>
                                                            <Badge variant="outline" className="rounded-lg">{workDetails.wageType}</Badge>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">الراتب الحالي</span>
                                                            <div className="font-bold text-navy">{workDetails.salary.toLocaleString()} ر.س</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">نوع العقد</span>
                                                            <div className="font-medium text-navy">{workDetails.contractType}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">رقم العقد</span>
                                                            <div className="font-medium text-navy">{workDetails.contractNo}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">تاريخ البدء</span>
                                                            <div className="font-medium text-navy">{workDetails.startDateGregorian}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">تاريخ النهاية</span>
                                                            <div className="font-medium text-navy">{workDetails.lastDay}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-xs text-slate-500">على رأس العمل</span>
                                                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 rounded-lg">لا</Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* CLAIMS TAB */}
                                    <TabsContent value="claims" className="mt-0 space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            {claims.map((claim, i) => (
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                                                                <DollarSign className="h-5 w-5" aria-hidden="true" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-navy">{claim.title}</h4>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge className="bg-blue-500 text-[10px] rounded-md">{claim.type}</Badge>
                                                                    <Badge variant="outline" className="text-[10px] rounded-md">{claim.subtype}</Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-start">
                                                            <div className="text-xl font-bold text-navy">{claim.amount.toLocaleString()} ر.س</div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-slate-500 text-xs block mb-1">من تاريخ</span>
                                                            <span className="font-medium text-navy">{claim.period.fromG}</span>
                                                            <span className="text-xs text-slate-500 mx-1">({claim.period.fromH})</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500 text-xs block mb-1">إلى تاريخ</span>
                                                            <span className="font-medium text-navy">{claim.period.toG}</span>
                                                            <span className="text-xs text-slate-500 mx-1">({claim.period.toH})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-navy text-white p-6 rounded-2xl shadow-lg flex justify-between items-center relative overflow-hidden border border-white/5">
                                            {/* Background Effects */}
                                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                                                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-brand-blue/10 rounded-full blur-[50px]"></div>
                                                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[120%] bg-emerald-500/5 rounded-full blur-[50px]"></div>
                                            </div>

                                            <div className="relative z-10">
                                                <div className="text-blue-200 mb-1">إجمالي المطالبات</div>
                                                <div className="text-sm opacity-70">{claims.length} مواضيع</div>
                                            </div>
                                            <div className="relative z-10 text-3xl font-bold">{caseData.claimAmount.toLocaleString()} ر.س</div>
                                        </div>
                                    </TabsContent>

                                    {/* HEARINGS TAB */}
                                    <TabsContent value="hearings" className="mt-0 space-y-6">
                                        {hearings.map((hearing, i) => (
                                            <Card key={i} className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                                                <div className={`h-2 ${hearing.isNew ? 'bg-brand-blue' : 'bg-slate-200'}`}></div>
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-navy font-bold border border-slate-100">
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-bold text-lg text-navy">{hearing.title}</h3>
                                                                    {hearing.isNew && <Badge className="bg-brand-blue rounded-md">جديدة</Badge>}
                                                                    {hearing.status === 'completed' && <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 rounded-md">مكتملة</Badge>}
                                                                </div>
                                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                                                        {hearing.date}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="h-4 w-4" aria-hidden="true" />
                                                                        {typeof hearing.location === 'string' ? hearing.location : (hearing.location?.name || hearing.location?.address || 'عن بعد')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {hearing.mechanism && (
                                                            <Badge variant="outline" className="text-navy border-navy/20 rounded-lg">{hearing.mechanism}</Badge>
                                                        )}
                                                    </div>

                                                    {hearing.result && (
                                                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-6 text-red-700 text-sm font-medium flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                                            النتيجة: {hearing.result}
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <div className="text-sm font-bold text-navy">المذكرات والوثائق</div>
                                                        {hearing.memos.map((memo, j) => (
                                                            <div key={j} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={`rounded-md ${memo.by === 'المدعي' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                                        {memo.by}
                                                                    </Badge>
                                                                    <div>
                                                                        <div className="font-bold text-navy text-sm">{memo.type}</div>
                                                                        <div className="text-xs text-slate-500">{memo.date}</div>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="sm" disabled={memo.status === 'pending'} className="rounded-lg">
                                                                    {memo.status === 'pending' ? 'منتظر' : 'عرض'}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </TabsContent>

                                    {/* DOCUMENTS TAB */}
                                    <TabsContent value="documents" className="mt-0 space-y-8">
                                        {/* Memos Section */}
                                        <div>
                                            <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                                المذكرات القانونية
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {documents.memos.map((doc, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue shrink-0">
                                                            <FileText className="h-6 w-6" aria-hidden="true" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-navy truncate">{doc.name}</div>
                                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                                <span>{doc.size}</span>
                                                                <span>•</span>
                                                                <span>{doc.date}</span>
                                                            </div>
                                                            <Badge variant="outline" className={`mt-2 text-[10px] rounded-md ${doc.party === 'مدعي' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                {doc.party}
                                                            </Badge>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-brand-blue rounded-full" aria-label="تنزيل">
                                                            <Download className="h-4 w-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Evidence Section */}
                                        <div>
                                            <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
                                                <Briefcase className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                                الأدلة والمستندات الداعمة
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {documents.evidence.map((doc, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                            <FileCheck className="h-6 w-6" aria-hidden="true" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-navy truncate">{doc.name}</div>
                                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                                <span>{doc.size}</span>
                                                                <span>•</span>
                                                                <span>{doc.date}</span>
                                                            </div>
                                                            <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50 text-slate-600 border-slate-200 rounded-md">
                                                                {doc.category}
                                                            </Badge>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-brand-blue rounded-full" aria-label="تنزيل">
                                                            <Download className="h-4 w-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                </div>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    )
}
