import { useState } from 'react'
import {
    ArrowRight, Trash2, Loader2, DollarSign, Users,
    Calendar, CheckCircle, Clock, FileText, AlertCircle, Download, Play
} from 'lucide-react'
import { usePayroll, useDeletePayroll, useProcessPayroll } from '@/hooks/useHR'
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

function PayrollDetailSkeleton() {
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

export function PayrollDetail() {
    const { payrollId } = useParams({ from: '/_authenticated/dashboard/hr/payroll/$payrollId' })
    const navigate = useNavigate()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: payroll, isLoading, error } = usePayroll(payrollId)
    const deleteMutation = useDeletePayroll()
    const processMutation = useProcessPayroll()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(payrollId)
            toast({ title: 'تم حذف مسير الرواتب بنجاح' })
            navigate({ to: '/dashboard/hr/payroll' })
        } catch {
            toast({ title: 'فشل في حذف مسير الرواتب', variant: 'destructive' })
        }
    }

    const handleProcess = async () => {
        try {
            await processMutation.mutateAsync(payrollId)
            toast({ title: 'تم تنفيذ مسير الرواتب بنجاح' })
        } catch {
            toast({ title: 'فشل في تنفيذ مسير الرواتب', variant: 'destructive' })
        }
    }

    const statusConfig = {
        draft: { label: 'مسودة', color: 'bg-slate-500/10 text-slate-600 border-slate-200', icon: FileText },
        pending: { label: 'قيد المراجعة', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
        approved: { label: 'معتمد', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle },
        processing: { label: 'قيد التنفيذ', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: Clock },
        completed: { label: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
        cancelled: { label: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-200', icon: AlertCircle },
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'مسيرات الرواتب', href: '/dashboard/hr/payroll', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount)
    }

    const StatusIcon = payroll ? statusConfig[payroll.status]?.icon : Clock

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
                        <span className="text-sm text-slate-600">تفاصيل مسير الرواتب</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {isLoading ? (
                    <PayrollDetailSkeleton />
                ) : error || !payroll ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                        <p className="text-red-600 mt-1">لم يتم العثور على مسير الرواتب</p>
                        <Link to="/dashboard/hr/payroll">
                            <Button className="mt-4">العودة للقائمة</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Hero Card */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title={payroll.name || `مسير رواتب ${payroll.month}/${payroll.year}`}
                            type="hr"
                            listMode={true}
                            hideButtons={true}
                            stats={[
                                {
                                    label: "الفترة",
                                    value: `${payroll.month}/${payroll.year}`,
                                    icon: Calendar,
                                    status: 'normal'
                                },
                                {
                                    label: "عدد الموظفين",
                                    value: payroll.employeeCount || 0,
                                    icon: Users,
                                    status: 'normal'
                                },
                                {
                                    label: "إجمالي الرواتب",
                                    value: formatCurrency(payroll.totalGross || 0),
                                    icon: DollarSign,
                                    status: 'normal'
                                },
                                {
                                    label: "صافي المستحق",
                                    value: formatCurrency(payroll.totalNet || 0),
                                    icon: DollarSign,
                                    status: 'normal'
                                }
                            ]}
                        >
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/payroll">
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
                                                    <p className="text-white/60 mt-1">{payroll.description || 'مسير الرواتب الشهري'}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className={cn("font-medium border-white/20", statusConfig[payroll.status]?.color)}>
                                                            <StatusIcon className="w-3 h-3 ml-1" />
                                                            {statusConfig[payroll.status]?.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {payroll.status === 'approved' && (
                                                <Button
                                                    onClick={handleProcess}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                                                    disabled={processMutation.isPending}
                                                >
                                                    {processMutation.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Play className="w-4 h-4" />
                                                    )}
                                                    تنفيذ
                                                </Button>
                                            )}
                                            <Button className="bg-white text-emerald-900 hover:bg-white/90 rounded-xl gap-2">
                                                <Download className="w-4 h-4" />
                                                تصدير
                                            </Button>
                                            {payroll.status === 'draft' && (
                                                <Button
                                                    variant="ghost"
                                                    className="bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl"
                                                    onClick={() => setShowDeleteDialog(true)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ProductivityHero>

                        {/* Main content grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                    {/* Summary */}
                                    <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                                ملخص المسير
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500">تاريخ الإنشاء</p>
                                                        <p className="font-medium">
                                                            {payroll.createdAt ? format(parseISO(payroll.createdAt), 'd MMMM yyyy', { locale: ar }) : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500">تاريخ الصرف</p>
                                                        <p className="font-medium">
                                                            {payroll.paymentDate ? format(parseISO(payroll.paymentDate), 'd MMMM yyyy', { locale: ar }) : '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-4 space-y-3">
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-slate-600">إجمالي الرواتب الأساسية</span>
                                                        <span className="font-medium">{formatCurrency(payroll.totalBasic || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-slate-600">إجمالي البدلات</span>
                                                        <span className="font-medium text-emerald-600">+{formatCurrency(payroll.totalAllowances || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-slate-600">إجمالي الخصومات</span>
                                                        <span className="font-medium text-red-600">-{formatCurrency(payroll.totalDeductions || 0)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-3">
                                                        <span className="font-semibold text-emerald-700">صافي المستحق</span>
                                                        <span className="font-bold text-emerald-700 text-lg">{formatCurrency(payroll.totalNet || 0)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Processing Info */}
                                    {payroll.status === 'completed' && payroll.processedAt && (
                                        <Card className="bg-emerald-50 border-emerald-200 rounded-2xl">
                                            <CardContent className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                                    <div>
                                                        <p className="font-medium text-emerald-800">تم تنفيذ المسير بنجاح</p>
                                                        <p className="text-sm text-emerald-600">
                                                            {format(parseISO(payroll.processedAt), 'd MMMM yyyy - HH:mm', { locale: ar })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                            <HRSidebar context="payroll" />
                        </div>
                    </>
                )}
            </Main>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا المسير؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف مسير الرواتب بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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
