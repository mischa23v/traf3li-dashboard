import { useState } from 'react'
import {
    FileText, Calendar, Clock, Plus, Upload,
    User, Scale,
    ArrowLeft, Gavel, Shield, MoreHorizontal,
    AlertTriangle, Download, Eye, History, Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ImprovedCaseManagement() {
    const [activeTab, setActiveTab] = useState('overview')

    // Mock Data
    const caseInfo = {
        id: '4772077905',
        title: 'مشاري بن ناهد ضد المصنع السعودي العربي',
        status: 'active',
        type: 'labor',
        court: 'المحكمة العمالية - الرياض',
        judge: 'د. عبد العزيز المنصور',
        startDate: '2024-01-15',
        nextHearing: '2024-03-20',
        completion: 65,
        claimAmount: 12000,
        expectedWin: 2400
    }

    const timeline = [
        { date: '2024-01-15', title: 'فتح القضية', type: 'start', status: 'completed' },
        { date: '2024-01-25', title: 'تقديم الدعوى', type: 'submission', status: 'completed' },
        { date: '2024-02-10', title: 'الجلسة الأولى', type: 'hearing', status: 'completed' },
        { date: '2024-03-20', title: 'جلسة مرافعة', type: 'hearing', status: 'upcoming' },
        { date: '2024-04-05', title: 'النطق بالحكم', type: 'verdict', status: 'pending' },
    ]

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-['IBM_Plex_Sans_Arabic']" dir="rtl">

            {/* HEADER & HERO SECTION */}
            <div className="bg-navy text-white relative overflow-hidden pb-24">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                </div>

                {/* Top Navigation */}
                <div className="relative z-10 border-b border-white/10">
                    <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-10 w-10 p-0">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="h-6 w-px bg-white/20"></div>
                            <h1 className="text-lg font-bold">تفاصيل القضية</h1>
                            <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0">
                                {caseInfo.id}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
                                <Share2 className="h-4 w-4 ml-2" />
                                مشاركة
                            </Button>
                            <Button className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-600/30">
                                <Plus className="h-4 w-4 ml-2" />
                                إجراء جديد
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Case Hero Content */}
                <div className="relative z-10 max-w-[1600px] mx-auto px-6 pt-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Main Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
                                    <Scale className="h-6 w-6 text-brand-blue" />
                                </div>
                                <span className="text-blue-200 font-medium">قضية عمالية</span>
                                <span className="text-white/20">•</span>
                                <span className="text-slate-300">{caseInfo.court}</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">
                                {caseInfo.title}
                            </h1>
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

                        {/* Status Card */}
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
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="max-w-[1600px] mx-auto px-6 -mt-16 relative z-20 pb-12">
                <div className="grid grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR (Timeline & Quick Actions) */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Timeline Card */}
                        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <History className="h-5 w-5 text-brand-blue" />
                                    الجدول الزمني
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="relative p-6">
                                        {/* Vertical Line */}
                                        <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>

                                        <div className="space-y-8 relative">
                                            {timeline.map((event, i) => (
                                                <div key={i} className="flex gap-4 relative">
                                                    <div className={`
                                                        w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white
                                                        ${event.status === 'completed' ? 'bg-green-500' :
                                                            event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                    `}></div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-navy">{event.title}</div>
                                                        <div className="text-xs text-slate-500 mb-1">{event.date}</div>
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-slate-50">
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
                        <Card className="border-0 shadow-lg rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy">أطراف القضية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                    <div className="col-span-12 lg:col-span-9">
                        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden min-h-[600px]">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b border-slate-100 px-6 pt-4">
                                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                                        {['overview', 'hearings', 'documents', 'claims', 'billing'].map((tab) => (
                                            <TabsTrigger
                                                key={tab}
                                                value={tab}
                                                className="
                                                    data-[state=active]:bg-transparent data-[state=active]:shadow-none 
                                                    data-[state=active]:border-b-2 data-[state=active]:border-brand-blue 
                                                    data-[state=active]:text-brand-blue
                                                    text-slate-500 font-medium text-base pb-4 rounded-none px-2
                                                "
                                            >
                                                {tab === 'overview' ? 'نظرة عامة' :
                                                    tab === 'hearings' ? 'الجلسات والمواعيد' :
                                                        tab === 'documents' ? 'المستندات' :
                                                            tab === 'claims' ? 'المطالبات' : 'الفواتير'}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="p-6 bg-slate-50/50 min-h-[500px]">
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        {/* Quick Stats Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
                                                    <Gavel className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-slate-500">حالة القضية</div>
                                                    <div className="font-bold text-navy">قيد النظر</div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                    <Shield className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-slate-500">درجة التقاضي</div>
                                                    <div className="font-bold text-navy">الدرجة الأولى</div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
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
                                    </TabsContent>

                                    <TabsContent value="documents" className="mt-0">
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
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-100">
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
                                                    <div className="pt-3 border-t border-slate-50 flex gap-2">
                                                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">معاينة</Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
