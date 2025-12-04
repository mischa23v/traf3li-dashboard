import { useState } from 'react'
import {
    ArrowRight, Trash2, Loader2, Clock, User,
    LogIn, LogOut, Calendar, MapPin, AlertCircle
} from 'lucide-react'
import { useAttendanceRecord, useDeleteAttendanceRecord } from '@/hooks/useHR'
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

function AttendanceDetailSkeleton() {
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

export function AttendanceDetail() {
    const { attendanceId } = useParams({ from: '/_authenticated/dashboard/hr/attendance/$attendanceId' })
    const navigate = useNavigate()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const { data: record, isLoading, error } = useAttendanceRecord(attendanceId)
    const deleteMutation = useDeleteAttendanceRecord()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(attendanceId)
            toast({ title: 'تم حذف سجل الحضور بنجاح' })
            navigate({ to: '/dashboard/hr/attendance' })
        } catch {
            toast({ title: 'فشل في حذف سجل الحضور', variant: 'destructive' })
        }
    }

    const statusConfig = {
        present: { label: 'حاضر', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
        absent: { label: 'غائب', color: 'bg-red-500/10 text-red-600 border-red-200' },
        late: { label: 'متأخر', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
        half_day: { label: 'نصف يوم', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
        remote: { label: 'عن بعد', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
        on_leave: { label: 'في إجازة', color: 'bg-slate-500/10 text-slate-600 border-slate-200' },
    }

    const topLinks = [
        { title: 'لوحة التحكم', href: '/dashboard', isActive: false },
        { title: 'الحضور والانصراف', href: '/dashboard/hr/attendance', isActive: true },
    ]

    const calculateWorkHours = () => {
        if (!record?.checkIn || !record?.checkOut) return '-'
        const checkIn = parseISO(`2000-01-01T${record.checkIn}`)
        const checkOut = parseISO(`2000-01-01T${record.checkOut}`)
        const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
        return `${diff.toFixed(1)} ساعة`
    }

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
                        <span className="text-sm text-slate-600">تفاصيل الحضور</span>
                    </div>
                </div>
            </DynamicIsland>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                    {isLoading ? (
                        <AttendanceDetailSkeleton />
                    ) : error || !record ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-red-800">خطأ في تحميل البيانات</h3>
                            <p className="text-red-600 mt-1">لم يتم العثور على سجل الحضور</p>
                            <Link to="/dashboard/hr/attendance">
                                <Button className="mt-4">العودة للقائمة</Button>
                            </Link>
                        </div>
                    ) : (
                    <>
                        {/* Hero Card */}
                        <ProductivityHero
                            badge="الموارد البشرية"
                            title="سجل حضور"
                            type="attendance"
                            listMode={true}
                        >
                                <div className="flex flex-col gap-4 w-full">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Link to="/dashboard/hr/attendance">
                                            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                    <Clock className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-white/60 mt-1">{record.employeeName}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Badge variant="outline" className={cn("font-medium border-white/20", statusConfig[record.status]?.color)}>
                                                            {statusConfig[record.status]?.label}
                                                        </Badge>
                                                        <span className="text-white/50 text-sm">
                                                            {format(parseISO(record.date), 'EEEE، d MMMM yyyy', { locale: ar })}
                                                        </span>
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
                                    <Card className="bg-white rounded-2xl border-0 shadow-lg">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-emerald-600" />
                                                تفاصيل السجل
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-slate-500">اسم الموظف</p>
                                                    <p className="font-medium">{record.employeeName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">التاريخ</p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {format(parseISO(record.date), 'd MMMM yyyy', { locale: ar })}
                                                    </p>
                                                </div>
                                            </div>
                                            {record.location && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-2">الموقع</p>
                                                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-400" />
                                                        <p className="text-slate-700">{typeof record.location === 'string' ? record.location : (record.location?.name || record.location?.address || 'عن بعد')}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {record.notes && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-2">ملاحظات</p>
                                                    <div className="bg-slate-50 rounded-xl p-4">
                                                        <p className="text-slate-700">{record.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="lg:col-span-1">
                                    <HRSidebar context="attendance" />
                            </div>
                        </div>
                    </>
                )}
            </Main>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذا السجل؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف سجل الحضور بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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
