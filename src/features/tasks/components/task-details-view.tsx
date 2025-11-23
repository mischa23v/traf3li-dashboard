import { useState } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function TaskDetailsView() {
    const [activeTab, setActiveTab] = useState('overview')

    // Mock Data for a single task
    const task = {
        id: 'TASK-1001',
        title: 'تحضير استراتيجية الدفاع في قضية نزاع الأراضي',
        description: 'يجب إعداد استراتيجية دفاع شاملة تتضمن مراجعة جميع المستندات المقدمة من الخصم، وتحليل الثغرات القانونية في عقود الملكية. يرجى التركيز على المادة 45 من نظام المرافعات.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-11-25',
        completion: 65,
        assignee: {
            name: 'أحمد السالم',
            role: 'محامي أول',
            avatar: '/avatars/01.png'
        },
        client: {
            name: 'مشاري الرابح',
            type: 'فرد',
            phone: '0501234567'
        },
        case: {
            id: 'CASE-2025-001',
            title: 'نزاع أراضي - حي العليا',
            court: 'المحكمة العامة بالرياض'
        },
        subtasks: [
            { id: 1, title: 'مراجعة لائحة الدعوى', completed: true },
            { id: 2, title: 'تحليل عقود الملكية', completed: true },
            { id: 3, title: 'إعداد مسودة الرد الأولية', completed: false },
            { id: 4, title: 'مراجعة المسودة مع العميل', completed: false },
        ],
        comments: [
            { id: 1, user: 'فاطمة الغامدي', text: 'تم رفع المستندات المطلوبة على النظام.', time: 'منذ ساعتين', avatar: 'FG' },
            { id: 2, user: 'أحمد السالم', text: 'شكراً فاطمة، سأبدأ بالمراجعة فوراً.', time: 'منذ ساعة', avatar: 'AS' },
        ],
        timeline: [
            { date: '2025-11-20', title: 'تم إنشاء المهمة', type: 'created', status: 'completed' },
            { date: '2025-11-21', title: 'بدء العمل', type: 'started', status: 'completed' },
            { date: '2025-11-25', title: 'موعد التسليم', type: 'deadline', status: 'upcoming' },
        ]
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
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

                {/* Breadcrumb / Back Link */}
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/tasks/list" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى قائمة المهام
                    </Link>
                </div>

                {/* Task Hero Content */}
                <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                        {/* Abstract Shapes */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                        {/* Main Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">{task.case.title}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-slate-300">{task.case.id}</span>
                                <Badge variant="outline" className="mr-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {task.id}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {task.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" />
                                    <span>العميل: <span className="text-white font-medium">{task.client.name}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    <span>تاريخ الاستحقاق: <span className="text-white font-medium">{task.dueDate}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-rose-400" />
                                    <span className="text-rose-200 font-bold">الأولوية: {task.priority === 'high' ? 'عالية جداً' : 'عادية'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <LinkIcon className="h-4 w-4 ml-2" />
                                    نسخ الرابط
                                </Button>
                                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0">
                                    <CheckSquare className="h-4 w-4 ml-2" />
                                    إكمال المهمة
                                </Button>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-300">نسبة الإنجاز</span>
                                    <span className="text-lg font-bold text-emerald-400">{task.completion}%</span>
                                </div>
                                <Progress value={task.completion} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR (Timeline & Quick Actions) */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            {/* Timeline Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        الجدول الزمني
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="relative p-6">
                                            {/* Vertical Line */}
                                            <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>

                                            <div className="space-y-8 relative">
                                                {task.timeline.map((event, i) => (
                                                    <div key={i} className="flex gap-4 relative">
                                                        <div className={`
                                                            w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white
                                                            ${event.status === 'completed' ? 'bg-emerald-500' :
                                                                event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                        `}></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-navy">{event.title}</div>
                                                            <div className="text-xs text-slate-500 mb-1">{event.date}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Assignee Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy">فريق العمل</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage src={task.assignee.avatar} />
                                            <AvatarFallback className="bg-brand-blue text-white">AS</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-bold text-navy">{task.assignee.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{task.assignee.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* CENTER CONTENT (Tabs & Details) */}
                        <div className="col-span-12 lg:col-span-9">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="border-b border-slate-100 px-6 pt-4">
                                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                                            {['overview', 'subtasks', 'files', 'comments'].map((tab) => (
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
                                                        tab === 'subtasks' ? 'المهام الفرعية' :
                                                            tab === 'files' ? 'المرفقات' : 'التعليقات'}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                                        <TabsContent value="overview" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold text-navy">وصف المهمة</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                                            تفاصيل القضية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">رقم القضية</span>
                                                            <span className="font-medium text-slate-900">{task.case.id}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">المحكمة</span>
                                                            <span className="font-medium text-slate-900">{task.case.court}</span>
                                                        </div>
                                                        <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">عرض ملف القضية</Button>
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <User className="w-4 h-4 text-amber-600" />
                                                            بيانات العميل
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">الاسم</span>
                                                            <span className="font-medium text-slate-900">{task.client.name}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">الصفة</span>
                                                            <span className="font-medium text-slate-900">{task.client.type}</span>
                                                        </div>
                                                        <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">عرض ملف العميل</Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="subtasks" className="mt-0">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardContent className="p-6 space-y-4">
                                                    {task.subtasks.map((subtask) => (
                                                        <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer ${subtask.completed ? 'bg-brand-blue border-brand-blue text-white' : 'border-slate-300'}`}>
                                                                {subtask.completed && <CheckSquare className="w-3 h-3" />}
                                                            </div>
                                                            <span className={`flex-1 font-medium ${subtask.completed ? 'text-slate-400 line-through' : 'text-navy'}`}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded-xl">
                                                        <Plus className="w-5 h-5 ml-2" /> إضافة مهمة فرعية
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="files" className="mt-0">
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
                                                    { name: 'مسودة الرد.docx', type: 'DOC', size: '850 KB', date: '20/11/2025' },
                                                    { name: 'المستندات الداعمة.pdf', type: 'PDF', size: '2.4 MB', date: '19/11/2025' },
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

                                        <TabsContent value="comments" className="mt-0">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="space-y-6 mb-6">
                                                        {task.comments.map((comment) => (
                                                            <div key={comment.id} className="flex gap-4">
                                                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-700">{comment.avatar}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tr-none">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-bold text-sm text-navy">{comment.user}</span>
                                                                        <span className="text-xs text-slate-400">{comment.time}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600">{comment.text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback className="bg-navy text-white">أنا</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 relative">
                                                            <Textarea placeholder="اكتب تعليقاً..." className="min-h-[80px] rounded-xl resize-none pr-12 bg-slate-50 border-slate-200 focus:border-brand-blue" />
                                                            <Button size="icon" className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-brand-blue hover:bg-blue-600">
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
