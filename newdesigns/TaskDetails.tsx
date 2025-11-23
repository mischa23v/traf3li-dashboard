import { useState } from 'react'
import {
    Calendar, User, Clock,
    CheckSquare, Flag, ChevronRight,
    Briefcase, Send, Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TaskDetails() {
    const [activeTab, setActiveTab] = useState('overview')

    // Mock Data for a single task
    const task = {
        id: 'TASK-1001',
        title: 'تحضير استراتيجية الدفاع في قضية نزاع الأراضي',
        description: 'يجب إعداد استراتيجية دفاع شاملة تتضمن مراجعة جميع المستندات المقدمة من الخصم، وتحليل الثغرات القانونية في عقود الملكية. يرجى التركيز على المادة 45 من نظام المرافعات.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-11-25',
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
            { id: 1, user: 'فاطمة الغامدي', text: 'تم رفع المستندات المطلوبة على النظام.', time: 'منذ ساعتين' },
            { id: 2, user: 'أحمد السالم', text: 'شكراً فاطمة، سأبدأ بالمراجعة فوراً.', time: 'منذ ساعة' },
        ]
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Breadcrumb / Back */}
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <span className="hover:text-[#022c22] cursor-pointer">المهام</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-[#022c22] font-medium">{task.id}</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {task.id}
                            </Badge>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <Flag className="w-3 h-3 ml-1" />
                                عاجل
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#022c22] mb-3 leading-tight">
                            {task.title}
                        </h1>
                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                            <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{task.case.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{task.client.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>تاريخ الاستحقاق: {task.dueDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border-slate-200">
                            <LinkIcon className="w-4 h-4 ml-2" />
                            نسخ الرابط
                        </Button>
                        <Button className="bg-[#022c22] hover:bg-[#022c22]/90 text-white rounded-xl">
                            <CheckSquare className="w-4 h-4 ml-2" />
                            إكمال المهمة
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start bg-white p-1 rounded-xl border border-slate-100 h-auto mb-6">
                                <TabsTrigger value="overview" className="flex-1 rounded-lg py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-[#022c22]">نظرة عامة</TabsTrigger>
                                <TabsTrigger value="subtasks" className="flex-1 rounded-lg py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-[#022c22]">المهام الفرعية</TabsTrigger>
                                <TabsTrigger value="files" className="flex-1 rounded-lg py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-[#022c22]">المرفقات</TabsTrigger>
                                <TabsTrigger value="comments" className="flex-1 rounded-lg py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-[#022c22]">التعليقات</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-[#022c22]">وصف المهمة</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 leading-relaxed">
                                            {task.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-[#022c22] flex items-center gap-2">
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

                                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-[#022c22] flex items-center gap-2">
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

                            <TabsContent value="subtasks">
                                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-6 space-y-4">
                                        {task.subtasks.map((subtask) => (
                                            <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer ${subtask.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                                                    {subtask.completed && <CheckSquare className="w-3 h-3" />}
                                                </div>
                                                <span className={`flex-1 ${subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {subtask.title}
                                                </span>
                                            </div>
                                        ))}
                                        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-[#022c22]">
                                            <span className="text-xl mr-2">+</span> إضافة مهمة فرعية
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="comments">
                                <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="space-y-6 mb-6">
                                            {task.comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-4">
                                                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-blue-100 text-blue-700">{comment.user[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tr-none">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-sm text-[#022c22]">{comment.user}</span>
                                                            <span className="text-xs text-slate-400">{comment.time}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{comment.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarFallback className="bg-[#022c22] text-white">أنا</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 relative">
                                                <Textarea placeholder="اكتب تعليقاً..." className="min-h-[80px] rounded-xl resize-none pr-12" />
                                                <Button size="icon" className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-[#022c22] hover:bg-[#022c22]/90">
                                                    <Send className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Status Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22]">حالة المهمة</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm text-slate-500 mb-2 block">الحالة</label>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
                                        <span className="font-medium">قيد التنفيذ</span>
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 mb-2 block">الأولوية</label>
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100 text-red-700">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-4 h-4" />
                                            <span className="font-medium">عاجل</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-sm text-slate-500 mb-2 block">المكلف بالمهمة</label>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10 border border-slate-200">
                                            <AvatarFallback className="bg-slate-100 text-slate-600">أحمد</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-slate-900">{task.assignee.name}</div>
                                            <div className="text-xs text-slate-500">{task.assignee.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22]">الجدول الزمني</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">تاريخ البدء</div>
                                        <div className="font-medium text-slate-900">20 نوفمبر 2025</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">تاريخ الاستحقاق</div>
                                        <div className="font-medium text-slate-900">{task.dueDate}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    )
}
