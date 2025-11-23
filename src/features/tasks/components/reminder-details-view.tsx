import { useState } from 'react'
import {
    Clock, CheckCircle2,
    ArrowLeft,
    History, Bell, Calendar, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function ReminderDetailsView() {
    const [activeTab, setActiveTab] = useState('overview')

    // Mock Data for a single reminder
    const reminder = {
        id: 'REM-1001',
        title: 'انتهاء مهلة الاستئناف - قضية 402',
        description: 'تذكير بضرورة تقديم لائحة الاستئناف في القضية رقم 402 قبل انتهاء الدوام الرسمي. يرجى التأكد من إرفاق جميع المستندات المؤيدة.',
        type: 'deadline',
        priority: 'critical',
        date: '2025-11-22',
        time: '14:00',
        status: 'pending',
        assignee: {
            name: 'أحمد السالم',
            role: 'محامي أول',
            avatar: '/avatars/01.png'
        },
        relatedTo: {
            type: 'case',
            id: 'CASE-402',
            title: 'شركة الإنشاءات ضد مؤسسة النور'
        },
        timeline: [
            { date: '2025-11-20', title: 'تم إنشاء التذكير', type: 'created', status: 'completed' },
            { date: '2025-11-22', title: 'موعد التذكير', type: 'deadline', status: 'upcoming' },
        ]
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: true },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: false },
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
                    <Link to="/dashboard/tasks/reminders" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى التذكيرات
                    </Link>
                </div>

                {/* Hero Content */}
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
                                    <Clock className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">تذكير {reminder.type === 'deadline' ? 'موعد نهائي' : 'عام'}</span>
                                <span className="text-white/20">•</span>
                                <Badge variant="outline" className="mr-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {reminder.id}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {reminder.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    <span>التاريخ: <span className="text-white font-medium">{reminder.date}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-emerald-400" />
                                    <span>الوقت: <span className="text-white font-medium">{reminder.time}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-rose-400" />
                                    <span className="text-rose-200 font-bold">الأولوية: {reminder.priority === 'critical' ? 'عاجل جداً' : 'عادية'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <Clock className="h-4 w-4 ml-2" />
                                    تأجيل
                                </Button>
                                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0">
                                    <CheckCircle2 className="h-4 w-4 ml-2" />
                                    إتمام
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR */}
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
                                    <ScrollArea className="h-[200px]">
                                        <div className="relative p-6">
                                            <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                                            <div className="space-y-8 relative">
                                                {reminder.timeline.map((event, i) => (
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

                            {/* Related To Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy">مرتبط بـ</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-blue-600">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-navy line-clamp-1" title={reminder.relatedTo.title}>{reminder.relatedTo.title}</div>
                                            <div className="text-xs text-slate-500 font-medium">{reminder.relatedTo.id}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* CENTER CONTENT */}
                        <div className="col-span-12 lg:col-span-9">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="border-b border-slate-100 px-6 pt-4">
                                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-blue data-[state=active]:text-brand-blue text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                                                التفاصيل
                                            </TabsTrigger>
                                            <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-blue data-[state=active]:text-brand-blue text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                                                ملاحظات
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 min-h-[400px]">
                                        <TabsContent value="overview" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold text-navy">وصف التذكير</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {reminder.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="notes" className="mt-0">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="flex gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback className="bg-navy text-white">أنا</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 relative">
                                                            <Textarea placeholder="أضف ملاحظة..." className="min-h-[80px] rounded-xl resize-none pr-12 bg-slate-50 border-slate-200 focus:border-brand-blue" />
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
