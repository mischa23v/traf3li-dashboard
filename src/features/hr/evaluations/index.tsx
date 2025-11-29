import { getRouteApi, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus, Search, Bell, AlertCircle, ChevronLeft,
    ClipboardCheck, Calendar, CheckCircle, Clock, ArrowRight, Users,
    FileText, Star, TrendingUp, Award
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HRSidebar } from '../components/hr-sidebar'
import { useEvaluations, useBulkDeleteEvaluations } from '@/hooks/useHR'
import { PerformanceEvaluation } from '@/types/hr'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const routeApi = getRouteApi('/_authenticated/dashboard/hr/evaluations')

// Stats cards for the hero section
function EvaluationStats({ evaluations }: { evaluations: PerformanceEvaluation[] }) {
    const stats = useMemo(() => {
        const avgRating = evaluations.length > 0
            ? evaluations.reduce((acc, e) => acc + e.overallRating, 0) / evaluations.length
            : 0
        const completed = evaluations.filter(e => e.status === 'completed').length
        const pending = evaluations.filter(e => e.status === 'pending_review').length
        const draft = evaluations.filter(e => e.status === 'draft').length

        return { avgRating: avgRating.toFixed(1), completed, pending, draft, total: evaluations.length }
    }, [evaluations])

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
                        <p className="text-xs text-white/60">متوسط التقييم</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.completed}</p>
                        <p className="text-xs text-white/60">مكتمل</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.pending}</p>
                        <p className="text-xs text-white/60">قيد المراجعة</p>
                    </div>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{stats.draft}</p>
                        <p className="text-xs text-white/60">مسودة</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Rating stars component
function RatingStars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "w-4 h-4",
                        star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300"
                    )}
                />
            ))}
        </div>
    )
}

// Evaluation card component
function EvaluationCard({
    evaluation,
    isSelected,
    onToggleSelect,
    isSelectionMode
}: {
    evaluation: PerformanceEvaluation
    isSelected: boolean
    onToggleSelect: () => void
    isSelectionMode: boolean
}) {
    const statusConfig = {
        draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: FileText },
        pending_review: { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
        completed: { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
        archived: { label: 'مؤرشف', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: FileText },
    }

    const periodTypeLabels: Record<string, string> = {
        monthly: 'شهري',
        quarterly: 'ربع سنوي',
        semi_annual: 'نصف سنوي',
        annual: 'سنوي',
    }

    const config = statusConfig[evaluation.status] || statusConfig.draft
    const StatusIcon = config.icon

    return (
        <div className={cn(
            "group bg-white rounded-2xl border border-slate-200/60 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/5 hover:border-emerald-200",
            isSelected && "ring-2 ring-emerald-500 border-emerald-300"
        )}>
            <div className="flex items-start gap-4">
                {isSelectionMode && (
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggleSelect}
                        className="mt-1"
                    />
                )}

                <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={evaluation.employeeAvatar} alt={evaluation.employeeName} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                        {evaluation.employeeName?.charAt(0) || 'م'}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {evaluation.employeeName}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {evaluation.position} - {evaluation.department}
                            </p>
                        </div>
                        <Badge variant="outline" className={cn("font-medium", config.color)}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {config.label}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {evaluation.period}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                            {periodTypeLabels[evaluation.periodType] || evaluation.periodType}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">التقييم العام:</span>
                            <RatingStars rating={evaluation.overallRating} />
                            <span className="text-sm font-semibold text-slate-700">{evaluation.overallRating}/5</span>
                        </div>
                        <span className="text-xs text-slate-400">
                            المقيم: {evaluation.evaluatorName}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Loading skeleton
function EvaluationListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5">
                    <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-5 w-40" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function EvaluationsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())

    const { data: evaluations = [], isLoading, error } = useEvaluations()
    const bulkDeleteMutation = useBulkDeleteEvaluations()

    // Filter evaluations
    const filteredEvaluations = useMemo(() => {
        return evaluations.filter(evaluation => {
            const matchesSearch = !searchQuery ||
                evaluation.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [evaluations, searchQuery, statusFilter])

    const handleToggleSelect = (evaluationId: string) => {
        const newSelected = new Set(selectedRecords)
        if (newSelected.has(evaluationId)) {
            newSelected.delete(evaluationId)
        } else {
            newSelected.add(evaluationId)
        }
        setSelectedRecords(newSelected)
    }

    const handleDeleteSelected = async () => {
        if (selectedRecords.size === 0) return

        try {
            await bulkDeleteMutation.mutateAsync(Array.from(selectedRecords))
            toast({
                title: 'تم الحذف',
                description: `تم حذف ${selectedRecords.size} تقييم بنجاح`,
            })
            setSelectedRecords(new Set())
            setIsSelectionMode(false)
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في حذف التقييمات',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الموارد البشرية', href: '/dashboard/hr/employees', isActive: true },
    ]

    return (
        <>
            <Header>
                <TopNav links={topLinks} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <DynamicIsland>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-slate-600">تقييم الأداء</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Bell className="w-4 h-4" />
                        <span>{evaluations.length} تقييم</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {/* Hero Card */}
                    <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
                        {/* Gradient effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-transparent to-teal-900/30" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl" />

                        <div className="relative z-10">
                            {/* Back button and title */}
                            <div className="flex items-center gap-4 mb-4">
                                <Link to="/dashboard">
                                    <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h2 className="text-3xl font-bold leading-tight">تقييم الأداء</h2>
                                    <p className="text-white/60 mt-1">إدارة تقييمات أداء الموظفين</p>
                                </div>
                            </div>

                            {/* Search and filters */}
                            <div className="flex flex-wrap items-center gap-3 mt-6">
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="البحث عن موظف..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    {['all', 'draft', 'pending_review', 'completed'].map((status) => (
                                        <Button
                                            key={status}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setStatusFilter(status)}
                                            className={cn(
                                                "rounded-xl text-white/70 hover:text-white hover:bg-white/10",
                                                statusFilter === status && "bg-white/20 text-white"
                                            )}
                                        >
                                            {status === 'all' && 'الكل'}
                                            {status === 'draft' && 'مسودة'}
                                            {status === 'pending_review' && 'قيد المراجعة'}
                                            {status === 'completed' && 'مكتمل'}
                                        </Button>
                                    ))}
                                </div>

                                <Link to="/dashboard/hr/evaluations/new">
                                    <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2 font-medium">
                                        <Plus className="w-4 h-4" />
                                        إنشاء تقييم
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats */}
                            <EvaluationStats evaluations={evaluations} />
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        {/* Evaluation list - 2/3 width */}
                        <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <EvaluationListSkeleton />
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                                    <p className="text-red-600 mt-1">حدث خطأ أثناء تحميل التقييمات</p>
                                </div>
                            ) : filteredEvaluations.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <ClipboardCheck className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">لا توجد تقييمات</h3>
                                    <p className="text-slate-500 mt-1 mb-4">لم يتم العثور على تقييمات أداء</p>
                                    <Link to="/dashboard/hr/evaluations/new">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
                                            <Plus className="w-4 h-4" />
                                            إنشاء تقييم جديد
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredEvaluations.map((evaluation) => (
                                        <EvaluationCard
                                            key={evaluation.id}
                                            evaluation={evaluation}
                                            isSelected={selectedRecords.has(evaluation.id)}
                                            onToggleSelect={() => handleToggleSelect(evaluation.id)}
                                            isSelectionMode={isSelectionMode}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="lg:col-span-1">
                            <HRSidebar
                                context="evaluations"
                                isSelectionMode={isSelectionMode}
                                onToggleSelectionMode={() => {
                                    setIsSelectionMode(!isSelectionMode)
                                    if (isSelectionMode) setSelectedRecords(new Set())
                                }}
                                selectedCount={selectedRecords.size}
                                onDeleteSelected={handleDeleteSelected}
                            />
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
