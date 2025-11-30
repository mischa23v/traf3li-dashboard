import { useState } from 'react'
import {
    ArrowRight, Trash2, Loader2, DollarSign, User,
    Calendar, CreditCard, TrendingUp, TrendingDown, AlertCircle, Download
} from 'lucide-react'
import { useSalaryRecord, useDeleteSalaryRecord } from '@/hooks/useHR'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

function SalaryDetailSkeleton() {
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

export function SalaryDetail() {
    const { salaryId } = useParams({ from: '/_authenticated/dashboard/hr/salaries/$salaryId' })
    const navigate = useNavigate()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: salary, isLoading, error } = useSalaryRecord(salaryId)
    const deleteMutation = useDeleteSalaryRecord()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(salaryId)
            toast({ title: 'تم حذف سجل الراتب بنجاح' })
            navigate({ to: '/dashboard/hr/salaries' })
        } catch {
            toast({ title: 'فشل في حذف سجل الراتب', variant: 'destructive' })
        }
    }

    const statusConfig = {
        draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
        pending: { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        approved: { label: 'معتمد', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        paid: { label: 'مدفوع', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-200' },
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الرواتب', href: '/dashboard/hr/salaries', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

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
                        <span className="text-sm text-slate-600">تفاصيل الراتب</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main className="bg-[#f8f9fa] min-h-screen">
                <div className="bg-[#022c22] rounded-tr-3xl min-h-screen -mt-4 -mr-4 -ml-4 p-6">
                    {isLoading ? (
                        <SalaryDetailSkeleton />
                    ) : error || !salary ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                            <p className="text-red-600 mt-1">لم يتم العثور على سجل الراتب</p>
                            <Link to="/dashboard/hr/salaries">
                                <Button className="mt-4">العودة للقائمة</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Hero Card */}
                            <ProductivityHero
                                badge="الموارد البشرية"
                                title={`كشف راتب - ${salary.month}/${salary.year}`}
                                type="hr"
                                hideButtons={true}
                                stats={[
                                    {
                                        label: "الراتب الأساسي",
                                        value: formatCurrency(salary.basicSalary),
                                        icon: <DollarSign className="w-4 h-4 text-blue-400" />,
                                        status: 'normal'
                                    },
                                    {
                                        label: "إجمالي البدلات",
                                        value: formatCurrency(salary.totalAllowances || 0),
                                        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
                                        status: 'normal'
                                    },
                                    {
                                        label: "إجمالي الخصومات",
                                        value: formatCurrency(salary.totalDeductions || 0),
                                        icon: <TrendingDown className="w-4 h-4 text-red-400" />,
                                        status: 'normal'
                                    },
                                    {
                                        label: "صافي الراتب",
                                        value: formatCurrency(salary.netSalary),
                                        icon: <CreditCard className="w-4 h-4 text-amber-400" />,
                                        status: 'normal'
                                    }
                                ]}
                            >
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/salaries">
                                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                    <DollarSign className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-white/60 mt-1">{salary.employeeName}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className={cn("font-medium border-white/20", statusConfig[salary.status]?.color)}>
                                                            {statusConfig[salary.status]?.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2">
                                                <Download className="w-4 h-4" />
                                                تحميل PDF
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl gap-2"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ProductivityHero>

                            {/* Main content grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Earnings */}
                                    <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                                المستحقات
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-slate-600">الراتب الأساسي</span>
                                                    <span className="font-medium">{formatCurrency(salary.basicSalary)}</span>
                                                </div>
                                                {salary.housingAllowance > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">بدل السكن</span>
                                                        <span className="font-medium">{formatCurrency(salary.housingAllowance)}</span>
                                                    </div>
                                                )}
                                                {salary.transportAllowance > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">بدل المواصلات</span>
                                                        <span className="font-medium">{formatCurrency(salary.transportAllowance)}</span>
                                                    </div>
                                                )}
                                                {salary.otherAllowances > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">بدلات أخرى</span>
                                                        <span className="font-medium">{formatCurrency(salary.otherAllowances)}</span>
                                                    </div>
                                                )}
                                                {salary.overtime > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">العمل الإضافي</span>
                                                        <span className="font-medium">{formatCurrency(salary.overtime)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-emerald-50 rounded-lg px-3">
                                                    <span className="font-semibold text-emerald-700">إجمالي المستحقات</span>
                                                    <span className="font-bold text-emerald-700">{formatCurrency(salary.grossSalary || (salary.basicSalary + (salary.totalAllowances || 0)))}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Deductions */}
                                    <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingDown className="w-5 h-5 text-red-600" />
                                                الخصومات
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {salary.gosiDeduction > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">التأمينات الاجتماعية (GOSI)</span>
                                                        <span className="font-medium text-red-600">-{formatCurrency(salary.gosiDeduction)}</span>
                                                    </div>
                                                )}
                                                {salary.taxDeduction > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">الضرائب</span>
                                                        <span className="font-medium text-red-600">-{formatCurrency(salary.taxDeduction)}</span>
                                                    </div>
                                                )}
                                                {salary.otherDeductions > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b">
                                                        <span className="text-slate-600">خصومات أخرى</span>
                                                        <span className="font-medium text-red-600">-{formatCurrency(salary.otherDeductions)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-red-50 rounded-lg px-3">
                                                    <span className="font-semibold text-red-700">إجمالي الخصومات</span>
                                                    <span className="font-bold text-red-700">-{formatCurrency(salary.totalDeductions || 0)}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Net Salary */}
                                    <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl border-0 shadow-lg text-white">
                                        <CardContent className="py-6">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-white/80">صافي الراتب</p>
                                                    <p className="text-3xl font-bold mt-1">{formatCurrency(salary.netSalary)}</p>
                                                </div>
                                                {salary.paymentDate && (
                                                    <div className="text-left">
                                                        <p className="text-white/80">تاريخ الصرف</p>
                                                        <p className="font-semibold mt-1">
                                                            {format(parseISO(salary.paymentDate), 'd MMMM yyyy', { locale: ar })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-1">
                                    <HRSidebar context="salaries" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Main>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا السجل؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف سجل الراتب بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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
