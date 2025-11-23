import { useState, useEffect } from 'react'
import {
    Search, Download, Plus, MoreHorizontal,
    Clock, Play, Pause, Square, DollarSign,
    User, FileText, Check, Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TimeEntriesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isTimerRunning) {
            interval = setInterval(() => {
                setCurrentTime(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isTimerRunning])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Mock Data
    const timeEntries = [
        {
            id: 'TE-001',
            date: '17 نوفمبر 2025',
            client: 'مشاري الرابح',
            caseNumber: 'CASE-2025-001',
            task: 'إعداد مذكرة دفاع في القضية التجارية',
            hours: 3.5,
            rate: 500,
            amount: 1750,
            status: 'unbilled',
            lawyer: 'أحمد السالم',
            billable: true
        },
        {
            id: 'TE-002',
            date: '17 نوفمبر 2025',
            client: 'سارة المطيري',
            caseNumber: 'CASE-2025-005',
            task: 'مراجعة العقد وإبداء الملاحظات القانونية',
            hours: 2.0,
            rate: 450,
            amount: 900,
            status: 'unbilled',
            lawyer: 'فاطمة الغامدي',
            billable: true
        },
        {
            id: 'TE-003',
            date: '16 نوفمبر 2025',
            client: 'محمد الدوسري',
            caseNumber: 'CASE-2025-006',
            task: 'حضور جلسة المحكمة والمرافعة',
            hours: 4.0,
            rate: 600,
            amount: 2400,
            status: 'billed',
            lawyer: 'أحمد السالم',
            billable: true
        },
        {
            id: 'TE-004',
            date: '16 نوفمبر 2025',
            client: 'عمر العنزي',
            caseNumber: 'CASE-2025-008',
            task: 'البحث القانوني في سوابق قضائية مشابهة',
            hours: 5.5,
            rate: 350,
            amount: 1925,
            status: 'unbilled',
            lawyer: 'خالد المري',
            billable: true
        },
        {
            id: 'TE-006',
            date: '15 نوفمبر 2025',
            client: 'داخلي',
            caseNumber: 'INTERNAL',
            task: 'اجتماع فريق العمل الأسبوعي',
            hours: 1.5,
            rate: 0,
            amount: 0,
            status: 'non-billable',
            lawyer: 'الجميع',
            billable: false
        }
    ]

    // Filter Logic
    const filteredEntries = timeEntries.filter(entry => {
        if (activeTab === 'all') return true
        if (activeTab === 'unbilled') return entry.status === 'unbilled'
        if (activeTab === 'billed') return entry.status === 'billed'
        if (searchQuery && !entry.client.includes(searchQuery) && !entry.task.includes(searchQuery)) return false
        return true
    })

    // Stats
    const totalBillableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0)
    const totalUnbilledValue = timeEntries.filter(e => e.status === 'unbilled').reduce((sum, e) => sum + e.amount, 0)
    const thisWeekHours = 38.5 // Mock

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Section - Contained Navy Card */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                        <Clock className="w-3 h-3 ml-2" />
                                        إدارة الوقت
                                    </Badge>
                                    <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    سجل الساعات
                                </h1>
                                <p className="text-blue-200/80">تتبع الوقت، الفوترة، وإدارة إنتاجية الفريق</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                    <Download className="w-4 h-4 ml-2" />
                                    تصدير التقرير
                                </Button>
                                <Button className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                    <Plus className="w-4 h-4 ml-2" />
                                    تسجيل يدوي
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-blue-200">ساعات هذا الأسبوع</span>
                                    <span className="font-bold text-white">{thisWeekHours} ساعة</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{totalBillableHours}</div>
                                <div className="text-xs text-blue-200">إجمالي الساعات القابلة للفوترة</div>
                                <Progress value={75} className="h-1.5 bg-white/10 mt-2" indicatorClassName="bg-brand-blue" />
                            </div>
                            <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                <div>
                                    <div className="text-blue-200 text-sm mb-1">قيمة غير مفوترة</div>
                                    <div className="text-2xl font-bold text-amber-400">{formatCurrency(totalUnbilledValue)}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-amber-400" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                <div>
                                    <div className="text-blue-200 text-sm mb-1">معدل الإنجاز</div>
                                    <div className="text-2xl font-bold text-emerald-400">94%</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Time Entries List */}
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
                                        value="unbilled"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        غير مفوتر
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="billed"
                                        className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                    >
                                        تم الفوترة
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex items-center gap-3 flex-1 justify-end">
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="بحث في السجلات..."
                                        className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Entries List - Vertical Stack Cards */}
                        <div className="space-y-4">
                            {filteredEntries.map((entry) => (
                                <div key={entry.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-sm mt-1">
                                                <Clock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-[#022c22] text-lg">{entry.task}</h4>
                                                    <Badge variant="outline" className={`${entry.status === 'unbilled' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                        entry.status === 'billed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                            'text-slate-600 border-slate-200 bg-slate-50'
                                                        } border px-2 rounded-md`}>
                                                        {entry.status === 'unbilled' ? 'غير مفوتر' :
                                                            entry.status === 'billed' ? 'تم الفوترة' : 'غير قابل للفوترة'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                    <User className="w-3 h-3" />
                                                    {entry.client}
                                                    <span className="text-slate-300">•</span>
                                                    <FileText className="w-3 h-3" />
                                                    {entry.caseNumber}
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
                                                <DropdownMenuItem>تعديل السجل</DropdownMenuItem>
                                                <DropdownMenuItem>إنشاء فاتورة</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                    {entry.lawyer.charAt(0)}
                                                </div>
                                                <span className="text-sm text-slate-600">{entry.lawyer}</span>
                                            </div>
                                            <div className="h-4 w-px bg-slate-200"></div>
                                            <div className="text-sm text-slate-500">
                                                {entry.date}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">المدة</div>
                                                <div className="font-bold text-[#022c22] text-lg">{entry.hours} س</div>
                                            </div>
                                            {entry.amount > 0 && (
                                                <div className="text-center pl-4 border-l border-slate-100">
                                                    <div className="text-xs text-slate-400 mb-1">القيمة</div>
                                                    <div className="font-bold text-emerald-600 text-lg">{formatCurrency(entry.amount)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Timer & Analytics */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Quick Timer Card */}
                        <Card className="border-none shadow-sm bg-[#022c22] text-white rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-brand-blue" />
                                    المؤقت السريع
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 relative z-10">
                                <div className="text-center mb-6">
                                    <div className="text-5xl font-mono font-bold tracking-wider mb-2">
                                        {formatTime(currentTime)}
                                    </div>
                                    <div className="text-blue-200 text-sm">جاري التسجيل...</div>
                                </div>

                                <div className="flex gap-3 mb-6">
                                    {!isTimerRunning ? (
                                        <Button
                                            onClick={() => setIsTimerRunning(true)}
                                            className="flex-1 bg-brand-blue hover:bg-blue-600 text-white h-12 rounded-xl text-lg"
                                        >
                                            <Play className="w-5 h-5 ml-2" />
                                            بدء
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setIsTimerRunning(false)}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl text-lg"
                                        >
                                            <Pause className="w-5 h-5 ml-2" />
                                            إيقاف
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => {
                                            setIsTimerRunning(false)
                                            setCurrentTime(0)
                                        }}
                                        variant="outline"
                                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 w-12 rounded-xl p-0"
                                    >
                                        <Square className="w-5 h-5 fill-current" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Input
                                        placeholder="بماذا تعمل الآن؟"
                                        className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/50 rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hours by Lawyer */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-500" />
                                    ساعات الفريق
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[
                                    { name: 'أحمد السالم', hours: 42.5, color: 'bg-blue-500' },
                                    { name: 'فاطمة الغامدي', hours: 38.0, color: 'bg-emerald-500' },
                                    { name: 'خالد المري', hours: 31.5, color: 'bg-amber-500' }
                                ].map((lawyer, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700">{lawyer.name}</span>
                                            <span className="text-slate-500">{lawyer.hours} ساعة</span>
                                        </div>
                                        <Progress value={(lawyer.hours / 50) * 100} className="h-2 bg-slate-100" indicatorClassName={lawyer.color} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
