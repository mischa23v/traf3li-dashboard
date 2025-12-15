import { useState, useMemo } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell,
    CreditCard, DollarSign, CheckCircle2, AlertCircle, Timer, Lock, Unlock, ShieldCheck, Edit
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimeEntry, useUnlockTimeEntry } from '@/hooks/useFinance'
import { useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LOCK_REASON_LABELS, LOCK_REASON_DESCRIPTIONS } from '@/features/finance/types/time-entry-lock-types'

export function TimeEntryDetailsView() {
    const { entryId } = useParams({ strict: false }) as { entryId: string }
    const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
    const [unlockReason, setUnlockReason] = useState('')

    // Fetch time entry data
    const { data: entryData, isLoading, isError, error, refetch } = useTimeEntry(entryId)
    const unlockMutation = useUnlockTimeEntry()

    // Transform API data
    const entry = useMemo(() => {
        if (!entryData?.data) return null
        const e = entryData.data

        // Format duration
        const hours = Math.floor(e.hours || 0)
        const minutes = Math.round(((e.hours || 0) - hours) * 60)
        const duration = `${hours}h ${minutes}m`

        // Type narrow clientId and userId
        const clientName = typeof e.clientId === 'string' ? e.clientId : 'عميل غير محدد'
        const lawyerName = typeof e.lawyerId === 'string'
            ? e.lawyerId
            : `${e.lawyerId?.firstName || ''} ${e.lawyerId?.lastName || ''}`.trim() || 'غير محدد'
        const userIdName = !e.userId
            ? 'غير محدد'
            : typeof e.userId === 'string'
            ? e.userId
            : `${e.userId.firstName || ''} ${e.userId.lastName || ''}`.trim() || 'غير محدد'

        // Lock information
        const lockedByName = !e.lockedBy
            ? null
            : typeof e.lockedBy === 'string'
            ? e.lockedBy
            : `${e.lockedBy.firstName || ''} ${e.lockedBy.lastName || ''}`.trim() || 'غير محدد'

        return {
            id: e._id,
            task: e.description || 'مهمة غير محددة',
            client: clientName,
            lawyer: lawyerName,
            userId: userIdName,
            date: new Date(e.date).toLocaleDateString('ar-SA'),
            startTime: e.startTime ? new Date(e.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            endTime: e.endTime ? new Date(e.endTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد',
            duration,
            rate: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(e.hourlyRate || 0),
            total: new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2 }).format(e.totalAmount || 0),
            currency: 'ر.س',
            billable: e.isBillable,
            status: e.isBilled ? 'billed' : 'unbilled',
            description: e.notes || e.description || 'لا توجد ملاحظات',
            history: e.history || [],
            // Lock information
            isLocked: e.isLocked || false,
            lockReason: e.lockReason,
            lockedAt: e.lockedAt ? new Date(e.lockedAt).toLocaleString('ar-SA') : null,
            lockedBy: lockedByName,
            unlockHistory: e.unlockHistory || []
        }
    }, [entryData])

    const handleUnlock = () => {
        if (entry && unlockReason.trim()) {
            unlockMutation.mutate(
                { id: entry.id, reason: unlockReason },
                {
                    onSuccess: () => {
                        setUnlockDialogOpen(false)
                        setUnlockReason('')
                        refetch()
                    }
                }
            )
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
        { title: 'نشاط الحساب', href: '/dashboard/finance/activity', isActive: false },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/finance/time-tracking" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ms-2" aria-hidden="true" />
                        العودة إلى تتبع الوقت
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل سجل الوقت</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                            <Button onClick={() => refetch()} className="bg-[#022c22] hover:bg-[#022c22]/90">
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !entry && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-brand-blue" aria-hidden="true" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">سجل الوقت غير موجود</h3>
                            <p className="text-slate-500 mb-4">لم يتم العثور على سجل الوقت المطلوب</p>
                            <Button asChild className="bg-brand-blue hover:bg-blue-600">
                                <Link to="/dashboard/finance/time-tracking">
                                    العودة إلى القائمة
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && entry && (
                    <>
                        <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                                    <Timer className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">سجل وقت</span>
                                <span className="text-white/20">•</span>
                                <Badge variant="outline" className="me-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {entry.status === 'billed' ? 'تمت الفوترة' : 'غير مفوتر'}
                                </Badge>
                                {entry.isLocked && (
                                    <>
                                        <span className="text-white/20">•</span>
                                        <Badge variant="outline" className="border-red-500/30 text-red-300 bg-red-500/10 flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            مقفل
                                        </Badge>
                                        {entry.lockReason && (
                                            <Badge variant="secondary" className="text-xs">
                                                {LOCK_REASON_LABELS[entry.lockReason]}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {entry.task}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                                    <span>العميل: <span className="text-white font-medium">{entry.client}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-emerald-400" />
                                    <span>المحامي: <span className="text-white font-medium">{entry.lawyer}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="text-start lg:text-start">
                                <div className="text-slate-300 text-sm mb-1">المدة / التكلفة</div>
                                <div className="text-3xl font-bold text-white">{entry.duration} <span className="text-lg text-emerald-400">({entry.total} {entry.currency})</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy">تفاصيل العمل</CardTitle>
                                    <div className="flex gap-2">
                                        {!entry.isLocked && (
                                            <Button asChild size="sm" className="bg-brand-blue hover:bg-blue-700">
                                                <Link to={`/dashboard/finance/time-tracking/${entry.id}/edit`}>
                                                    <Edit className="h-4 w-4 ms-2" />
                                                    تعديل
                                                </Link>
                                            </Button>
                                        )}
                                        {entry.isLocked && (
                                            <Button size="sm" variant="outline" onClick={() => setUnlockDialogOpen(true)}>
                                                <Unlock className="h-4 w-4 ms-2" />
                                                إلغاء القفل
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {entry.isLocked && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-red-100 p-2 rounded-lg">
                                                    <Lock className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-red-900 mb-1">سجل مقفل</h4>
                                                    <p className="text-sm text-red-700 mb-2">
                                                        {entry.lockReason && LOCK_REASON_DESCRIPTIONS[entry.lockReason]}
                                                    </p>
                                                    <div className="text-xs text-red-600 space-y-1">
                                                        {entry.lockedBy && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-3 w-3" />
                                                                قام بالقفل: {entry.lockedBy}
                                                            </div>
                                                        )}
                                                        {entry.lockedAt && (
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-3 w-3" />
                                                                تاريخ القفل: {entry.lockedAt}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-red-600 mt-2 font-medium">
                                                        لا يمكن تعديل السجلات المقفلة. اتصل بالمسؤول لإلغاء القفل.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">التاريخ</label>
                                            <div className="font-medium text-navy">{entry.date}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">الوقت</label>
                                            <div className="font-medium text-navy">{entry.startTime} - {entry.endTime}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">معدل الساعة</label>
                                            <div className="font-medium text-navy">{entry.rate} {entry.currency}/ساعة</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 block mb-2">قابل للفوترة</label>
                                            <div className="font-medium text-navy">{entry.billable ? 'نعم' : 'لا'}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-sm text-slate-500 block mb-2">الوصف</label>
                                            <div className="font-medium text-navy leading-relaxed">{entry.description}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        سجل النشاط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="relative p-6">
                                            <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                                            <div className="space-y-8 relative">
                                                {entry.history.map((event, i) => (
                                                    <div key={i} className="flex gap-4 relative">
                                                        <div className="w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white bg-blue-500"></div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-bold text-navy">{event.action}</div>
                                                            <div className="text-xs text-slate-500 mb-1">{event.date} • {event.user}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </Main>

            {/* Unlock Dialog */}
            <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Unlock className="h-5 w-5" />
                            إلغاء قفل سجل الوقت
                        </DialogTitle>
                        <DialogDescription>
                            يرجى تقديم سبب إلغاء القفل. سيتم تسجيل هذا الإجراء في سجل التدقيق.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">السبب *</label>
                            <Textarea
                                placeholder="اكتب سبب إلغاء القفل..."
                                value={unlockReason}
                                onChange={(e) => setUnlockReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                        {entry?.lockReason && (
                            <div className="bg-slate-50 p-3 rounded-lg text-sm">
                                <div className="font-medium text-slate-700 mb-1">سبب القفل الأصلي:</div>
                                <div className="text-slate-600">{LOCK_REASON_DESCRIPTIONS[entry.lockReason]}</div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setUnlockDialogOpen(false)
                            setUnlockReason('')
                        }}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleUnlock}
                            disabled={!unlockReason.trim() || unlockMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {unlockMutation.isPending ? 'جاري إلغاء القفل...' : 'إلغاء القفل'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
