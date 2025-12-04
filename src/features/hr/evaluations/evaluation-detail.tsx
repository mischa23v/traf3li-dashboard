import { useState } from 'react'
import {
    ArrowRight, Trash2, Loader2, Star, User,
    Calendar, Target, TrendingUp, AlertCircle, FileText
} from 'lucide-react'
import { useEvaluation, useDeleteEvaluation } from '@/hooks/useHR'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HRSidebar } from '../components/hr-sidebar'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'
import { ProductivityHero } from '@/components/productivity-hero'

function EvaluationDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="bg-emerald-950 rounded-3xl p-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32 mt-2" />
            </div>
            <Skeleton className="h-64 rounded-2xl" />
        </div>
    )
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "w-5 h-5",
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    )}
                />
            ))}
        </div>
    )
}

export function EvaluationDetail() {
    const { evaluationId } = useParams({ from: '/_authenticated/dashboard/hr/evaluations/$evaluationId' })
    const navigate = useNavigate()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: evaluation, isLoading, error } = useEvaluation(evaluationId)
    const deleteMutation = useDeleteEvaluation()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(evaluationId)
            toast({ title: 'تم حذف التقييم بنجاح' })
            navigate({ to: '/dashboard/hr/evaluations' })
        } catch {
            toast({ title: 'فشل في حذف التقييم', variant: 'destructive' })
        }
    }

    const statusConfig = {
        draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        pending: { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        completed: { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        acknowledged: { label: 'تم الاطلاع', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    }

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return 'ممتاز'
        if (rating >= 3.5) return 'جيد جداً'
        if (rating >= 2.5) return 'جيد'
        if (rating >= 1.5) return 'مقبول'
        return 'ضعيف'
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50'
        if (rating >= 3.5) return 'text-blue-600 bg-blue-50'
        if (rating >= 2.5) return 'text-amber-600 bg-amber-50'
        if (rating >= 1.5) return 'text-orange-600 bg-orange-50'
        return 'text-red-600 bg-red-50'
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'التقييمات', href: '/dashboard/hr/evaluations', isActive: true },
    ]

    // Default criteria if not provided
    const defaultCriteria = [
        { name: 'جودة العمل', rating: evaluation?.workQuality || 0, weight: 25 },
        { name: 'الالتزام بالمواعيد', rating: evaluation?.punctuality || 0, weight: 20 },
        { name: 'العمل الجماعي', rating: evaluation?.teamwork || 0, weight: 20 },
        { name: 'المبادرة', rating: evaluation?.initiative || 0, weight: 15 },
        { name: 'التواصل', rating: evaluation?.communication || 0, weight: 20 },
    ]

    return (
        <>
            <Header className="bg-navy">
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
                        <span className="text-sm text-slate-600">تفاصيل التقييم</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {isLoading ? (
                    <EvaluationDetailSkeleton />
                ) : error || !evaluation ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                        <p className="text-red-600 mt-1">لم يتم العثور على التقييم</p>
                        <Link to="/dashboard/hr/evaluations">
                            <Button className="mt-4">العودة للقائمة</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Hero Card */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title={`تقييم أداء - ${evaluation.period}`}
                            type="hr"
                            listMode={true}
                            hideButtons={true}
                                stats={[
                                    {
                                        label: "التقييم العام",
                                        value: `${evaluation.overallRating?.toFixed(1)} / 5`,
                                        icon: Star,
                                        status: 'normal'
                                    },
                                    {
                                        label: "فترة التقييم",
                                        value: evaluation.period,
                                        icon: Calendar,
                                        status: 'normal'
                                    },
                                    {
                                        label: "المُقيّم",
                                        value: evaluation.reviewerName || 'المدير المباشر',
                                        icon: User,
                                        status: 'normal'
                                    },
                                    {
                                        label: "التصنيف",
                                        value: getRatingLabel(evaluation.overallRating || 0),
                                        icon: Target,
                                        status: 'normal'
                                    }
                                ]}
                            >
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/evaluations">
                                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                    <Star className="w-8 h-8 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white/60 mt-1">{evaluation.employeeName}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className={cn("font-medium border-white/20", statusConfig[evaluation.status]?.color)}>
                                                            {statusConfig[evaluation.status]?.label}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-1">
                                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                            <span className="font-bold">{evaluation.overallRating?.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl gap-2"
                                            onClick={() => setShowDeleteDialog(true)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </ProductivityHero>

                        {/* Main content grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                    {/* Criteria Breakdown */}
                                    <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-emerald-600" />
                                                تفصيل المعايير
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {defaultCriteria.map((criterion, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{criterion.name}</span>
                                                                <span className="text-xs text-slate-500">({criterion.weight}%)</span>
                                                            </div>
                                                            <StarRating rating={criterion.rating} />
                                                        </div>
                                                        <Progress value={criterion.rating * 20} className="h-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Overall Rating */}
                                    <Card className={cn("rounded-2xl border-0 shadow-lg", getRatingColor(evaluation.overallRating || 0))}>
                                        <CardContent className="py-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm opacity-80">التقييم النهائي</p>
                                                    <p className="text-3xl font-bold mt-1">{getRatingLabel(evaluation.overallRating || 0)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Star className="w-10 h-10 fill-current" />
                                                    <span className="text-4xl font-bold">{evaluation.overallRating?.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Comments */}
                                    {(evaluation.strengths || evaluation.improvements || evaluation.comments) && (
                                        <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-emerald-600" />
                                                    الملاحظات
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {evaluation.strengths && (
                                                    <div>
                                                        <p className="text-sm text-emerald-600 font-medium mb-2 flex items-center gap-2">
                                                            <TrendingUp className="w-4 h-4" />
                                                            نقاط القوة
                                                        </p>
                                                        <div className="bg-emerald-50 rounded-xl p-4">
                                                            <p className="text-slate-700">{evaluation.strengths}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {evaluation.improvements && (
                                                    <div>
                                                        <p className="text-sm text-amber-600 font-medium mb-2 flex items-center gap-2">
                                                            <Target className="w-4 h-4" />
                                                            مجالات التحسين
                                                        </p>
                                                        <div className="bg-amber-50 rounded-xl p-4">
                                                            <p className="text-slate-700">{evaluation.improvements}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {evaluation.comments && (
                                                    <div>
                                                        <p className="text-sm text-slate-600 font-medium mb-2">ملاحظات إضافية</p>
                                                        <div className="bg-slate-50 rounded-xl p-4">
                                                            <p className="text-slate-700">{evaluation.comments}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                            <div className="lg:col-span-1">
                                <HRSidebar context="evaluations" />
                            </div>
                        </div>
                    </>
                )}
            </Main>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا التقييم؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف التقييم بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
