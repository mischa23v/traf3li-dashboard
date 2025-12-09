import { SalesSidebar } from './sales-sidebar'
import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import {
    useLeadScores,
    useLeadScoreDistribution,
    useLeadLeaderboard,
    useLeadScoringConfig,
    useCalculateAllScores
} from '@/hooks/useCrmAdvanced'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
    Search,
    Bell,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    MoreHorizontal,
    Eye,
    Award,
    Target,
    Activity,
    Users,
    Zap,
    RefreshCw,
    Percent,
    Mail
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LeadScore, LeadGrade } from '@/types/crm-advanced'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function LeadScoringDashboard() {
    const navigate = useNavigate()
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [gradeFilter, setGradeFilter] = useState<string>('all')
    const [minScoreFilter, setMinScoreFilter] = useState<string>('all')

    // Mutations
    const { mutate: calculateAllScores, isPending: isCalculating } = useCalculateAllScores()

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}

        // Grade filter
        if (gradeFilter !== 'all') {
            f.grade = gradeFilter
        }

        // Min score filter
        if (minScoreFilter !== 'all') {
            f.minScore = parseInt(minScoreFilter)
        }

        return f
    }, [gradeFilter, minScoreFilter])

    // Check if any filter is active
    const hasActiveFilters = searchQuery || gradeFilter !== 'all' || minScoreFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setGradeFilter('all')
        setMinScoreFilter('all')
    }

    // Fetch lead scores
    const { data: leadScoresData, isLoading, isError, error, refetch } = useLeadScores(filters)
    const { data: distributionData } = useLeadScoreDistribution()
    const { data: leaderboardData } = useLeadLeaderboard(10)
    const { data: configData } = useLeadScoringConfig()

    // Transform API data
    const leadScores = useMemo(() => {
        if (!leadScoresData?.data) return []

        let scores = leadScoresData.data.map((score: LeadScore) => ({
            id: score._id,
            leadId: typeof score.leadId === 'string' ? score.leadId : score.leadId._id,
            leadName: score.leadName || (typeof score.leadId === 'object' ? `${score.leadId.firstName || ''} ${score.leadId.lastName || ''}`.trim() : 'غير محدد') || 'غير محدد',
            leadEmail: typeof score.leadId === 'object' ? score.leadId.email : undefined,
            leadStatus: typeof score.leadId === 'object' ? score.leadId.status : undefined,
            totalScore: score.totalScore,
            grade: score.grade,
            conversionProbability: score.conversionProbability, // NEW
            trend: score.trend,
            lastActivity: score.lastActivity,
            dimensions: score.dimensions,
            history: score.history,
        }))

        // Apply search filter on client side
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            scores = scores.filter((score: any) =>
                score.leadName.toLowerCase().includes(query)
            )
        }

        return scores
    }, [leadScoresData, searchQuery])

    // Prepare distribution chart data
    const distributionChartData = useMemo(() => {
        if (!distributionData?.data) return []
        return distributionData.data.map((item) => ({
            grade: item.grade,
            count: item.count,
            percentage: item.percentage,
            averageScore: item.averageScore,
        }))
    }, [distributionData])

    // Chart colors
    const GRADE_COLORS = {
        'A': '#10b981',
        'B': '#3b82f6',
        'C': '#f59e0b',
        'D': '#ef4444',
        'F': '#6b7280',
    }

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectScore = (scoreId: string) => {
        if (selectedIds.includes(scoreId)) {
            setSelectedIds(selectedIds.filter(id => id !== scoreId))
        } else {
            setSelectedIds([...selectedIds, scoreId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return
        // Implement bulk delete functionality if needed
        alert(`حذف ${selectedIds.length} تقييم`)
    }

    // Single lead actions
    const handleViewLead = (leadId: string) => {
        navigate({ to: '/dashboard/crm/leads/$leadId', params: { leadId } })
    }

    const handleRecalculateAll = () => {
        if (confirm('هل أنت متأكد من إعادة حساب جميع التقييمات؟')) {
            calculateAllScores()
        }
    }

    // Grade badge styling
    const getGradeBadge = (grade: LeadGrade) => {
        const styles: Record<LeadGrade, string> = {
            'A': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'B': 'bg-blue-100 text-blue-700 border-blue-200',
            'C': 'bg-amber-100 text-amber-700 border-amber-200',
            'D': 'bg-red-100 text-red-700 border-red-200',
            'F': 'bg-slate-100 text-slate-700 border-slate-200',
        }
        return <Badge className={`${styles[grade]} border-0 rounded-md px-3 py-1 text-lg font-bold`}>{grade}</Badge>
    }

    // Trend icon
    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-emerald-500" />
        if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-red-500" />
        return <Minus className="h-4 w-4 text-slate-400" />
    }

    // Stats for hero
    const heroStats = useMemo(() => {
        if (!leadScoresData?.data) return undefined
        const total = leadScoresData.data.length
        const avgScore = total > 0
            ? Math.round(leadScoresData.data.reduce((sum: number, s: LeadScore) => sum + s.totalScore, 0) / total)
            : 0
        const gradeA = leadScoresData.data.filter((s: LeadScore) => s.grade === 'A').length
        const highPriority = leadScoresData.data.filter((s: LeadScore) => s.totalScore >= 70).length

        return [
            { label: 'إجمالي العملاء', value: total, icon: Users, status: 'normal' as const },
            { label: 'متوسط التقييم', value: avgScore, icon: Target, status: 'normal' as const },
            { label: 'تقييم A', value: gradeA, icon: Award, status: 'normal' as const },
            { label: 'أولوية عالية', value: highPriority, icon: Zap, status: highPriority > 0 ? 'attention' as const : 'zero' as const },
        ]
    }, [leadScoresData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء المحتملون', href: '/dashboard/crm/leads', isActive: false },
        { title: 'تقييم العملاء', href: '/dashboard/crm/lead-scoring', isActive: true },
        { title: 'الأنشطة', href: '/dashboard/crm/activities', isActive: false },
    ]

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="CRM" title="تقييم العملاء المحتملين" type="lead-scoring" stats={heroStats} />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                                        <Input
                                            type="text"
                                            placeholder="بحث بالاسم..." aria-label="بحث بالاسم"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Grade Filter */}
                                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="التقييم" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل التقييمات</SelectItem>
                                            <SelectItem value="A">A - ممتاز</SelectItem>
                                            <SelectItem value="B">B - جيد جداً</SelectItem>
                                            <SelectItem value="C">C - جيد</SelectItem>
                                            <SelectItem value="D">D - مقبول</SelectItem>
                                            <SelectItem value="F">F - ضعيف</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Min Score Filter */}
                                    <Select value={minScoreFilter} onValueChange={setMinScoreFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="النقاط" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل النقاط</SelectItem>
                                            <SelectItem value="80">80+ نقطة</SelectItem>
                                            <SelectItem value="60">60+ نقطة</SelectItem>
                                            <SelectItem value="40">40+ نقطة</SelectItem>
                                            <SelectItem value="20">20+ نقطة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Recalculate All Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRecalculateAll}
                                        disabled={isCalculating}
                                        className="h-10 px-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border-emerald-200"
                                    >
                                        {isCalculating ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 ms-2 animate-spin" aria-hidden="true" />
                                                جاري الحساب...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="h-4 w-4 ms-2" aria-hidden="true" />
                                                إعادة حساب الكل
                                            </>
                                        )}
                                    </Button>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SCORE DISTRIBUTION CHART */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-navy text-xl">توزيع التقييمات</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {distributionChartData.length} فئات
                                </Badge>
                            </div>

                            {distributionChartData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Bar Chart */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={distributionChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="grade" stroke="#64748b" />
                                                <YAxis stroke="#64748b" />
                                                <Tooltip
                                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                    labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                                />
                                                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
                                                    {distributionChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as LeadGrade]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Pie Chart */}
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={distributionChartData}
                                                    dataKey="count"
                                                    nameKey="grade"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={(entry) => `${entry.grade}: ${entry.percentage}%`}
                                                >
                                                    {distributionChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as LeadGrade]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>لا توجد بيانات للعرض</p>
                                </div>
                            )}
                        </div>

                        {/* MAIN LEAD SCORES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">تقييمات العملاء</h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {leadScores.length} عميل
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-14 h-14 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل التقييمات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && leadScores.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Target className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد تقييمات</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة عملاء محتملين لرؤية تقييماتهم</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/crm/leads">
                                                <Users className="w-4 h-4 ms-2" aria-hidden="true" />
                                                عرض العملاء
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Lead Scores List */}
                                {!isLoading && !isError && leadScores.map((score) => (
                                    <div key={score.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(score.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center flex-1">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedIds.includes(score.id)}
                                                        onCheckedChange={() => handleSelectScore(score.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg text-white font-bold text-2xl">
                                                    {score.totalScore}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{score.leadName}</h4>
                                                        {getGradeBadge(score.grade)}
                                                        {getTrendIcon(score.trend)}
                                                        {/* Conversion Probability Badge */}
                                                        {score.conversionProbability !== undefined && (
                                                            <Badge className={`border-0 rounded-full px-3 py-1 text-xs font-medium ${
                                                                score.conversionProbability >= 0.7 ? 'bg-emerald-100 text-emerald-700' :
                                                                score.conversionProbability >= 0.4 ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                <Percent className="h-3 w-3 me-1 inline" />
                                                                {Math.round(score.conversionProbability * 100)}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-2">
                                                        {score.leadEmail && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {score.leadEmail}
                                                            </span>
                                                        )}
                                                        {score.leadStatus && (
                                                            <span className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                                                    {score.leadStatus}
                                                                </Badge>
                                                            </span>
                                                        )}
                                                        <span>
                                                            آخر نشاط: {score.lastActivity ? format(new Date(score.lastActivity), 'd MMMM yyyy', { locale: arSA }) : 'لا يوجد'}
                                                        </span>
                                                    </div>
                                                    {/* Conversion Probability Progress Bar */}
                                                    {score.conversionProbability !== undefined && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs text-slate-600 font-medium">احتمالية التحويل</span>
                                                                <span className="text-xs font-bold text-navy">
                                                                    {Math.round(score.conversionProbability * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        score.conversionProbability >= 0.7 ? 'bg-emerald-500' :
                                                                        score.conversionProbability >= 0.4 ? 'bg-amber-500' :
                                                                        'bg-slate-400'
                                                                    }`}
                                                                    style={{ width: `${score.conversionProbability * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy" aria-label="خيارات">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewLead(score.leadId)}>
                                                        <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200/50">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">ديموغرافي</div>
                                                <div className="font-bold text-navy text-sm">
                                                    {score.dimensions.demographic.score}/{score.dimensions.demographic.maxScore}
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="bg-blue-500 h-1.5 rounded-full"
                                                        style={{ width: `${(score.dimensions.demographic.score / score.dimensions.demographic.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">BANT</div>
                                                <div className="font-bold text-navy text-sm">
                                                    {score.dimensions.bant.score}/{score.dimensions.bant.maxScore}
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="bg-purple-500 h-1.5 rounded-full"
                                                        style={{ width: `${(score.dimensions.bant.score / score.dimensions.bant.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">سلوكي</div>
                                                <div className="font-bold text-navy text-sm">
                                                    {score.dimensions.behavioral.score}/{score.dimensions.behavioral.maxScore}
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="bg-amber-500 h-1.5 rounded-full"
                                                        style={{ width: `${(score.dimensions.behavioral.score / score.dimensions.behavioral.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-600 mb-1">تفاعل</div>
                                                <div className="font-bold text-navy text-sm">
                                                    {score.dimensions.engagement.score}/{score.dimensions.engagement.maxScore}
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="bg-emerald-500 h-1.5 rounded-full"
                                                        style={{ width: `${(score.dimensions.engagement.score / score.dimensions.engagement.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar) */}
                    <SalesSidebar
                        context="lead-scoring"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>
        </>
    )
}
