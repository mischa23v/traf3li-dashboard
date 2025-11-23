import { useState } from 'react'
import {
    CheckSquare,
    Clock,
    AlertCircle,
    User,
    Calendar,
    Filter,
    Search,
    Plus,
    Download,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Flag,
    Briefcase,
    FileText,
    CheckCircle2,
    ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

export default function ImprovedTasksDashboard() {
    const [selectedFilter, setSelectedFilter] = useState('all')
    const [selectedPriority] = useState('all')
    const [selectedAssignee] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Summary stats
    const summary = {
        totalTasks: 18,
        pending: 7,
        inProgress: 6,
        completed: 5,
        overdue: 2
    }

    // Tasks data
    const tasks = [
        {
            id: 'CASE-1001',
            title: 'تحضير استراتيجية الدفاع في قضية نزاع الأراضي التجاري',
            client: 'تحضير استراتيجية',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-11-25',
            assignee: 'أحمد السالم',
            caseNumber: 'CASE-1001',
            progress: 0,
            type: 'legal_prep'
        },
        {
            id: 'CASE-1002',
            title: 'مراجعة وتحليل مستندات العقد لشركة لمعرفة',
            client: 'مراجعة مستندات',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-11-26',
            assignee: 'فاطمة الغامدي',
            caseNumber: 'CASE-1002',
            progress: 0,
            type: 'document_review'
        },
        {
            id: 'CASE-1003',
            title: 'استشارة العميل - تحضير لجلسات المحاكمة القادمة فيو',
            client: 'استشارة عميل',
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2024-11-28',
            assignee: 'خالد المري',
            caseNumber: 'CASE-1003',
            progress: 45,
            type: 'consultation'
        },
        {
            id: 'CASE-1004',
            title: 'تقييم ممتلكات - قضية #4521/2024 - قضية دعوى محكمة العدل',
            client: 'تقييم ممتلكات',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-11-22',
            assignee: 'سارة الدوسري',
            caseNumber: 'CASE-1004',
            progress: 0,
            type: 'assessment',
            overdue: true
        },
        {
            id: 'CASE-1005',
            title: 'بحث قانوني عن سوابق قضائية متشابهة للقضية',
            client: 'بحث قانوني',
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2024-11-30',
            assignee: 'محمد العتيبي',
            caseNumber: 'CASE-1005',
            progress: 60,
            type: 'research'
        },
        {
            id: 'CASE-1006',
            title: 'مراجعة دقيقة لعقود شركة الشركة في قضية التجارية',
            client: 'مراجعة مستندات',
            status: 'completed',
            priority: 'medium',
            dueDate: '2024-11-20',
            assignee: 'فاطمة الغامدي',
            caseNumber: 'CASE-1006',
            progress: 100,
            type: 'document_review'
        },
        {
            id: 'CASE-1007',
            title: 'تحضير شهادات الشهود لتقديم الدخول',
            client: 'تحضير استراتيجية',
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2024-12-01',
            assignee: 'أحمد السالم',
            caseNumber: 'CASE-1007',
            progress: 30,
            type: 'legal_prep'
        },
        {
            id: 'CASE-1008',
            title: 'اجتماع مع عميل لمناقشة مع تفاصيل دعوى العرض الشرعية',
            client: 'استشارة عميل',
            status: 'completed',
            priority: 'low',
            dueDate: '2024-11-18',
            assignee: 'خالد المري',
            caseNumber: 'CASE-1008',
            progress: 100,
            type: 'consultation'
        },
        {
            id: 'CASE-1009',
            title: 'بحث قانوني عن تشريعات العمل الصدري 2024',
            client: 'بحث قانوني',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-11-27',
            assignee: 'محمد العتيبي',
            caseNumber: 'CASE-1009',
            progress: 0,
            type: 'research'
        },
        {
            id: 'CASE-1010',
            title: 'تقييم ممتلكات - قضيم للمحكمة موكيل - في انتظار مستندات العميل',
            client: 'تقييم ممتلكات',
            status: 'in_progress',
            priority: 'medium',
            dueDate: '2024-12-05',
            assignee: 'سارة الدوسري',
            caseNumber: 'CASE-1010',
            progress: 20,
            type: 'assessment',
            overdue: true
        },
    ]

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'قيد الانتظار', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
            case 'in_progress':
                return { label: 'قيد التنفيذ', className: 'bg-blue-50 text-blue-700 border-blue-200' }
            case 'completed':
                return { label: 'مكتملة', className: 'bg-green-50 text-green-700 border-green-200' }
            default:
                return { label: 'غير محدد', className: 'bg-slate-50 text-slate-700 border-slate-200' }
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return { label: 'عاجل', className: 'bg-red-50 text-red-700 border-red-200', icon: <Flag className="h-3 w-3" /> }
            case 'medium':
                return { label: 'متوسط', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: <Flag className="h-3 w-3" /> }
            case 'low':
                return { label: 'منخفض', className: 'bg-green-50 text-green-700 border-green-200', icon: <Flag className="h-3 w-3" /> }
            default:
                return { label: 'عادي', className: 'bg-slate-50 text-slate-700 border-slate-200', icon: <Flag className="h-3 w-3" /> }
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'legal_prep':
                return <Briefcase className="h-5 w-5" />
            case 'document_review':
                return <FileText className="h-5 w-5" />
            case 'consultation':
                return <User className="h-5 w-5" />
            case 'research':
                return <Search className="h-5 w-5" />
            case 'assessment':
                return <CheckSquare className="h-5 w-5" />
            default:
                return <CheckSquare className="h-5 w-5" />
        }
    }

    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = selectedFilter === 'all' || task.status === selectedFilter
        const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
        const matchesAssignee = selectedAssignee === 'all' || task.assignee === selectedAssignee
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesPriority && matchesAssignee && matchesSearch
    })

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-6 lg:p-8 space-y-8 font-['IBM_Plex_Sans_Arabic']" dir="rtl">

            {/* HERO BANNER */}
            <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                                <CheckSquare className="w-3 h-3 ml-2" />
                                إدارة المهام
                            </Badge>
                            <span className="text-slate-400 text-sm">نظرة عامة</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight mb-2">المهام القانونية</h1>
                        <p className="text-slate-300 text-lg max-w-xl">
                            لديك <span className="text-white font-bold border-b-2 border-orange-500">{summary.pending} مهام قيد الانتظار</span> و <span className="text-white font-bold border-b-2 border-red-500">{summary.overdue} مهام متأخرة</span> تتطلب انتباهك.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base">
                            <Plus className="ml-2 h-5 w-5" />
                            مهمة جديدة
                        </Button>
                        <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                            <Download className="ml-2 h-5 w-5" />
                            تصدير
                        </Button>
                    </div>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                    { label: 'إجمالي المهام', value: summary.totalTasks, icon: Briefcase, color: 'text-brand-blue', bg: 'bg-blue-50' },
                    { label: 'قيد الانتظار', value: summary.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'قيد التنفيذ', value: summary.inProgress, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'مكتملة', value: summary.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'متأخرة', value: summary.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <h3 className="text-3xl font-bold text-navy mb-1">{stat.value}</h3>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                        </CardContent>
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${stat.color.replace('text', 'bg')}/20`}></div>
                    </Card>
                ))}
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث في المهام..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pr-10 pl-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none text-sm"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue/50">
                                <Filter className="h-4 w-4 ml-2" />
                                تصفية
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl">
                            {/* Filter options would go here */}
                            <DropdownMenuItem onClick={() => setSelectedFilter('all')}>الكل</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('pending')}>قيد الانتظار</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedFilter('in_progress')}>قيد التنفيذ</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'pending', 'in_progress', 'completed'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter)}
                            className={`
                                px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                                ${selectedFilter === filter
                                    ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-navy'}
                            `}
                        >
                            {filter === 'all' ? 'الكل' :
                                filter === 'pending' ? 'قيد الانتظار' :
                                    filter === 'in_progress' ? 'قيد التنفيذ' : 'مكتملة'}
                        </button>
                    ))}
                </div>
            </div>

            {/* TASKS LIST */}
            <div className="space-y-4">
                {filteredTasks.map((task) => {
                    const status = getStatusBadge(task.status)
                    const priority = getPriorityBadge(task.priority)
                    const daysUntil = getDaysUntilDue(task.dueDate)

                    return (
                        <div
                            key={task.id}
                            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            {/* Left Border Accent */}
                            <div className={`absolute top-0 right-0 w-1.5 h-full ${task.priority === 'high' ? 'bg-red-500' :
                                    task.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                }`}></div>

                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mr-3">
                                {/* Icon Box */}
                                <div className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm
                                    ${task.status === 'completed' ? 'bg-green-50 text-green-600' :
                                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}
                                `}>
                                    {getTypeIcon(task.type)}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`${status.className} border-0 px-2.5 py-0.5 rounded-lg`}>
                                            {status.label}
                                        </Badge>
                                        <Badge variant="outline" className={`${priority.className} border-0 px-2.5 py-0.5 rounded-lg flex items-center gap-1`}>
                                            {priority.icon}
                                            {priority.label}
                                        </Badge>
                                        {task.overdue && (
                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                متأخر
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-navy group-hover:text-brand-blue transition-colors line-clamp-1">
                                        {task.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            <span className="font-mono text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{task.caseNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-4 w-4 text-slate-400" />
                                            <span>{task.assignee}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <span className={daysUntil < 3 && !task.status.includes('completed') ? 'text-red-600 font-bold' : ''}>
                                                {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress & Actions */}
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-2">
                                    {task.status === 'in_progress' && (
                                        <div className="flex flex-col gap-1 w-32">
                                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                                <span>التقدم</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <Progress value={task.progress} className="h-2 bg-slate-100" indicatorClassName="bg-brand-blue" />
                                        </div>
                                    )}

                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-brand-blue hover:bg-blue-50">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-navy hover:bg-slate-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl">
                                                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                    <Trash2 className="h-4 w-4 ml-2" />
                                                    حذف المهمة
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
