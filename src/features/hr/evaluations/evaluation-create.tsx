import { useState } from 'react'
import {
    ArrowRight, Save, Loader2, ClipboardCheck, User, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HRSidebar } from '../components/hr-sidebar'
import { useCreateEvaluation, useEmployees } from '@/hooks/useHR'
import { useNavigate, Link } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Star rating component
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="p-1 hover:scale-110 transition-transform"
                >
                    <Star
                        className={cn(
                            "w-6 h-6",
                            star <= value
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}

export function EvaluationCreate() {
    const navigate = useNavigate()
    const createMutation = useCreateEvaluation()
    const { data: employees = [] } = useEmployees()

    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)

    const [formData, setFormData] = useState({
        employeeId: '',
        evaluatorId: '',
        period: `${currentYear}-Q${currentQuarter}`,
        periodType: 'quarterly' as 'monthly' | 'quarterly' | 'semi_annual' | 'annual',
        status: 'draft' as 'draft',
        overallRating: 3 as 1 | 2 | 3 | 4 | 5,
        criteria: [
            { id: '1', name: 'جودة العمل', weight: 20, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
            { id: '2', name: 'الإنتاجية', weight: 20, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
            { id: '3', name: 'المبادرة', weight: 15, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
            { id: '4', name: 'العمل الجماعي', weight: 15, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
            { id: '5', name: 'الالتزام', weight: 15, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
            { id: '6', name: 'التطوير المهني', weight: 15, rating: 3 as 1 | 2 | 3 | 4 | 5, comments: '' },
        ],
        strengths: '',
        areasForImprovement: '',
        developmentPlan: '',
        managerComments: '',
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCriterionRating = (criterionId: string, rating: number) => {
        setFormData(prev => ({
            ...prev,
            criteria: prev.criteria.map(c =>
                c.id === criterionId ? { ...c, rating: rating as 1 | 2 | 3 | 4 | 5 } : c
            )
        }))
    }

    const calculateOverallRating = () => {
        const totalWeight = formData.criteria.reduce((acc, c) => acc + c.weight, 0)
        const weightedSum = formData.criteria.reduce((acc, c) => acc + (c.rating * c.weight), 0)
        return Math.round(weightedSum / totalWeight) as 1 | 2 | 3 | 4 | 5
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.employeeId || !formData.evaluatorId) {
            toast({
                title: 'خطأ',
                description: 'يرجى اختيار الموظف والمقيم',
                variant: 'destructive',
            })
            return
        }

        const overallRating = calculateOverallRating()

        try {
            await createMutation.mutateAsync({ ...formData, overallRating })
            toast({ title: 'تم إنشاء التقييم بنجاح' })
            navigate({ to: '/dashboard/hr/evaluations' })
        } catch {
            toast({
                title: 'خطأ',
                description: 'فشل في إنشاء التقييم',
                variant: 'destructive',
            })
        }
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'التقييمات', href: '/dashboard/hr/evaluations', isActive: true },
    ]

    const ratingLabels = ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز']

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
                        <span className="text-sm text-slate-600">إنشاء تقييم جديد</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {/* Hero Card */}
                    <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-transparent to-teal-900/30" />
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <Link to="/dashboard/hr/evaluations">
                                    <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <h2 className="text-3xl font-bold leading-tight">إنشاء تقييم أداء</h2>
                                    <p className="text-white/60 mt-1">تقييم أداء الموظف</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Employee & Evaluator */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        معلومات التقييم
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>الموظف *</Label>
                                            <Select value={formData.employeeId} onValueChange={(v) => handleChange('employeeId', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="اختر الموظف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>المقيم *</Label>
                                            <Select value={formData.evaluatorId} onValueChange={(v) => handleChange('evaluatorId', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="اختر المقيم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map((emp) => (
                                                        <SelectItem key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>الفترة</Label>
                                            <Input
                                                value={formData.period}
                                                onChange={(e) => handleChange('period', e.target.value)}
                                                placeholder="2024-Q1"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>نوع الفترة</Label>
                                            <Select value={formData.periodType} onValueChange={(v) => handleChange('periodType', v)}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="monthly">شهري</SelectItem>
                                                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                                                    <SelectItem value="semi_annual">نصف سنوي</SelectItem>
                                                    <SelectItem value="annual">سنوي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Criteria Rating */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                                        <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                                        معايير التقييم
                                    </h3>
                                    <div className="space-y-6">
                                        {formData.criteria.map((criterion) => (
                                            <div key={criterion.id} className="border-b border-slate-100 pb-4 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="font-medium">{criterion.name}</span>
                                                        <span className="text-sm text-slate-500 mr-2">({criterion.weight}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <StarRating
                                                            value={criterion.rating}
                                                            onChange={(v) => handleCriterionRating(criterion.id, v)}
                                                        />
                                                        <span className="text-sm text-slate-500 w-16">
                                                            {ratingLabels[criterion.rating]}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Overall Rating */}
                                    <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-amber-800">التقييم العام</span>
                                            <div className="flex items-center gap-2">
                                                <StarRating value={calculateOverallRating()} onChange={() => { }} />
                                                <span className="font-bold text-amber-800">
                                                    {calculateOverallRating()}/5 - {ratingLabels[calculateOverallRating()]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
                                    <div>
                                        <Label>نقاط القوة</Label>
                                        <Textarea
                                            value={formData.strengths}
                                            onChange={(e) => handleChange('strengths', e.target.value)}
                                            placeholder="ما هي نقاط القوة لدى الموظف؟"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>مجالات التحسين</Label>
                                        <Textarea
                                            value={formData.areasForImprovement}
                                            onChange={(e) => handleChange('areasForImprovement', e.target.value)}
                                            placeholder="ما هي المجالات التي تحتاج تحسين؟"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>خطة التطوير</Label>
                                        <Textarea
                                            value={formData.developmentPlan}
                                            onChange={(e) => handleChange('developmentPlan', e.target.value)}
                                            placeholder="ما هي خطة التطوير المقترحة؟"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>ملاحظات المدير</Label>
                                        <Textarea
                                            value={formData.managerComments}
                                            onChange={(e) => handleChange('managerComments', e.target.value)}
                                            placeholder="ملاحظات إضافية..."
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Link to="/dashboard/hr/evaluations">
                                        <Button variant="outline" type="button" className="rounded-xl">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        حفظ التقييم
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-1">
                            <HRSidebar context="evaluations" />
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
