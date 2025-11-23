import { useState } from 'react'
import {
    Search, Filter, Download, Plus, MoreHorizontal,
    CheckSquare, AlertCircle, User, Calendar,
    Briefcase, FileText, Flag, CheckCircle, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TaskManagementDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Mock Data
    const tasks = [
        {
            id: 'TASK-1001',
            title: 'تحضير استراتيجية الدفاع في قضية نزاع الأراضي',
            client: 'مشاري الرابح',
            status: 'pending',
            priority: 'high',
            dueDate: '2025-11-25',
            assignee: 'أحمد السالم',
            caseNumber: 'CASE-2025-001',
            progress: 0,
            type: 'legal_prep'
        },
        {
            id: 'TASK-1002',
            title: 'مراجعة وتحليل مستندات العقد',
            client: 'شركة البناء الحديثة',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2025-11-26',
            assignee: 'فاطمة الغامدي',
            caseNumber: 'CASE-2025-012',
            progress: 45,
            type: 'document_review'
        },
        {
            id: 'TASK-1003',
            title: 'استشارة العميل - تحضير لجلسات المحاكمة',
            client: 'سارة المطيري',
            status: 'completed',
            priority: 'medium',
            dueDate: '2025-11-20',
            assignee: 'خالد المري',
            caseNumber: 'CASE-2025-005',
            progress: 100,
            type: 'consultation'
        },
        {
            id: 'TASK-1004',
            title: 'بحث قانوني عن سوابق قضائية مشابهة',
            client: 'عمر العنزي',
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2025-11-30',
            assignee: 'محمد العتيبي',
            caseNumber: 'CASE-2025-008',
            progress: 60,
            type: 'research'
        },
        {
            id: 'TASK-1005',
            title: 'صياغة عقد المقاولة والمراجعة النهائية',
            client: 'شركة البناء الحديثة',
            status: 'pending',
            priority: 'high',
            dueDate: '2025-12-01',
            assignee: 'فاطمة الغامدي',
            caseNumber: 'CASE-2025-012',
            progress: 0,
            type: 'document_review'
        },
        {
            id: 'TASK-1006',
            title: 'إعداد مذكرة دفاع في القضية التجارية',
            client: 'المجموعة التجارية الكبرى',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2025-11-24',
            assignee: 'أحمد السالم',
            caseNumber: 'CASE-2025-018',
            progress: 75,
            type: 'legal_prep'
        },
        {
            id: 'TASK-1007',
            title: 'تقييم ممتلكات - قضية دعوى محكمة العدل',
            client: 'سارة الدوسري',
            status: 'pending',
            priority: 'medium',
            dueDate: '2025-11-22',
            assignee: 'سارة الدوسري',
            caseNumber: 'CASE-2025-004',
            progress: 0,
            type: 'assessment',
            overdue: true
        }
    ]

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'all') return true
        if (activeTab === 'pending') return task.status === 'pending'
        if (activeTab === 'in_progress') return task.status === 'in_progress'
        if (activeTab === 'completed') return task.status === 'completed'
        if (searchQuery && !task.title.includes(searchQuery) && !task.caseNumber.includes(searchQuery)) return false
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200'
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد الانتظار'
            case 'in_progress': return 'قيد التنفيذ'
            case 'completed': return 'مكتملة'
            default: return status
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200'
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
            case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
            default: return 'text-slate-600 bg-slate-50 border-slate-200'
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'عاجل'
            case 'medium': return 'متوسط'
            case 'low': return 'منخفض'
            default: return priority
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'legal_prep': return Briefcase
            case 'document_review': return FileText
            case 'consultation': return User
            case 'research': return Search
            default: return CheckSquare
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Section - Contained Navy Card */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                    <CheckSquare className="w-3 h-3 ml-2" />
                                    المهام
                                </Badge>
                                <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                المهام القانونية
                            </h1>
                            <p className="text-blue-200/80">إدارة ومتابعة المهام القانونية للقضايا والمشاريع</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                <Download className="w-4 h-4 ml-2" />
                                تقرير المهام
                            </Button>
                            <Button className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                <Plus className="w-4 h-4 ml-2" />
                                مهمة جديدة
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Tasks List */}
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
                                        value="pending"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        انتظار
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="in_progress"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        تنفيذ
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="completed"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        مكتملة
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="بحث في المهام..."
                                        className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-4">
                            {filteredTasks.map((task) => {
                                const Icon = getTypeIcon(task.type)
                                return (
                                    <div key={task.id} className={`bg-white rounded-2xl p-6 border hover:border-blue-200 transition-all group shadow-sm ${task.overdue ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-start">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mt-1 ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-[#022c22] text-lg">{task.title}</h4>
                                                        {task.overdue && (
                                                            <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-200 border-red-200">
                                                                <AlertCircle className="w-3 h-3 ml-1" />
                                                                متأخر
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                                                        <span className="font-mono text-slate-400">{task.caseNumber}</span>
                                                        <span className="text-slate-300">•</span>
                                                        <User className="w-3 h-3" />
                                                        {task.client}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`${getStatusColor(task.status)} border px-2 rounded-md`}>
                                                            {getStatusLabel(task.status)}
                                                        </Badge>
                                                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} border px-2 rounded-md`}>
                                                            <Flag className="w-3 h-3 ml-1" />
                                                            {getPriorityLabel(task.priority)}
                                                        </Badge>
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
                                                    <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                                                    <DropdownMenuItem>تعديل المهمة</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {task.status === 'in_progress' && (
                                            <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-slate-500">نسبة الإنجاز</span>
                                                    <span className="font-bold text-blue-600">{task.progress}%</span>
                                                </div>
                                                <Progress value={task.progress} className="h-2 bg-slate-200" indicatorClassName="bg-blue-600" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>تاريخ الاستحقاق: <span className="font-bold text-[#022c22]">{task.dueDate}</span></span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span>المكلف: <span className="font-bold text-[#022c22]">{task.assignee}</span></span>
                                                </div>
                                            </div>

                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2">
                                                عرض التفاصيل
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Sidebar - Summary */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-brand-blue" />
                                    ملخص المهام
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">إجمالي المهام</span>
                                    <span className="font-bold text-[#022c22]">{tasks.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">قيد التنفيذ</span>
                                    <span className="font-bold text-blue-600">{tasks.filter(t => t.status === 'in_progress').length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">متأخرة</span>
                                    <span className="font-bold text-red-600">{tasks.filter(t => t.overdue).length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">مكتملة</span>
                                    <span className="font-bold text-emerald-600">{tasks.filter(t => t.status === 'completed').length}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                    <User className="w-5 h-5 text-amber-500" />
                                    مهامي
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckSquare className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-700 mb-1">لا توجد مهام عاجلة</h3>
                                    <p className="text-sm text-slate-500">أنت متفرغ حالياً، استمتع بوقتك!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
