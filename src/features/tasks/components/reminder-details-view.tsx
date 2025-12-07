import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
    Clock, AlertCircle, CheckCircle2, Trash2, Edit3, Loader2,
    ArrowLeft, Briefcase, XCircle,
    History, Flag, Send, Bell, Calendar, Search, UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
    useReminder,
    useDeleteReminder,
    useCompleteReminder,
    useDismissReminder,
    useSnoozeReminder,
    useReopenReminder,
    useDelegateReminder
} from '@/hooks/useRemindersAndEvents'
import { useTeamMembers } from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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

const SNOOZE_OPTIONS = [
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 180, label: '3 ساعات' },
    { value: 1440, label: 'يوم واحد' },
    { value: 10080, label: 'أسبوع' },
]

export function ReminderDetailsView() {
    const [activeTab, setActiveTab] = useState('overview')
    const { reminderId } = useParams({ strict: false }) as { reminderId: string }
    const navigate = useNavigate()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const { data: reminderData, isLoading, isError, error, refetch } = useReminder(reminderId)

    // Mutations
    const deleteReminderMutation = useDeleteReminder()
    const completeReminderMutation = useCompleteReminder()
    const dismissReminderMutation = useDismissReminder()
    const snoozeReminderMutation = useSnoozeReminder()
    const reopenReminderMutation = useReopenReminder()
    const delegateReminderMutation = useDelegateReminder()

    // Team members for delegation
    const { data: teamMembers } = useTeamMembers()

    // Delegate dialog state
    const [showDelegateDialog, setShowDelegateDialog] = useState(false)
    const [delegateTo, setDelegateTo] = useState('')
    const [delegateNote, setDelegateNote] = useState('')

    const handleDelete = () => {
        deleteReminderMutation.mutate(reminderId, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/reminders' })
            }
        })
    }

    const handleComplete = () => {
        if (reminderData?.status === 'completed') {
            reopenReminderMutation.mutate(reminderId)
        } else {
            completeReminderMutation.mutate(reminderId)
        }
    }

    const handleDismiss = () => {
        dismissReminderMutation.mutate(reminderId)
    }

    const handleSnooze = (duration: number) => {
        snoozeReminderMutation.mutate({ id: reminderId, duration })
    }

    const handleDelegate = () => {
        if (!delegateTo) return
        delegateReminderMutation.mutate(
            { id: reminderId, delegateTo, note: delegateNote || undefined },
            {
                onSuccess: () => {
                    setShowDelegateDialog(false)
                    setDelegateTo('')
                    setDelegateNote('')
                }
            }
        )
    }

    const reminder = useMemo(() => {
        if (!reminderData) return null
        const r = reminderData

        const reminderDate = r.dueDate ? new Date(r.dueDate) : null
        const dateDisplay = reminderDate ? reminderDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'
        const timeDisplay = r.time || (reminderDate ? reminderDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد')

        // Type narrow assignedTo
        const assignee = !r.assignedTo
            ? null
            : typeof r.assignedTo === 'string'
                ? { name: r.assignedTo, role: 'موظف', avatar: '/avatars/default.png' }
                : {
                    name: (r.assignedTo.firstName || '') + ' ' + (r.assignedTo.lastName || '') || 'غير محدد',
                    role: r.assignedTo.role || 'موظف',
                    avatar: r.assignedTo.avatar || '/avatars/default.png'
                }

        // Type narrow caseId
        const relatedTo = !r.caseId
            ? null
            : typeof r.caseId === 'string'
                ? { type: 'case' as const, id: r.caseId, title: 'قضية' }
                : {
                    type: 'case' as const,
                    id: r.caseId.caseNumber || 'غير محدد',
                    title: r.caseId.title || 'قضية غير محددة'
                }

        return {
            id: r._id,
            title: r.title || r.message || 'تذكير غير محدد',
            description: r.description || r.message || 'لا يوجد وصف',
            type: r.type || 'general',
            priority: r.priority || 'medium',
            date: dateDisplay,
            time: timeDisplay,
            status: r.status || 'pending',
            assignee,
            relatedTo,
            timeline: (r.history || []).map((h: any) => ({
                date: h.timestamp ? new Date(h.timestamp).toLocaleDateString('ar-SA') : 'غير محدد',
                title: h.description || h.action || 'تحديث',
                type: h.type || 'update',
                status: 'completed'
            }))
        }
    }, [reminderData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: true },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: false },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">


                {/* Loading State */}
                {isLoading && (
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        <div className="bg-emerald-950 rounded-3xl p-8 shadow-xl">
                            <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
                            <Skeleton className="h-6 w-1/2 mb-6 bg-white/20" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32 bg-white/20" />
                                <Skeleton className="h-10 w-32 bg-white/20" />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-3">
                                <Skeleton className="h-64 w-full rounded-2xl" />
                            </div>
                            <div className="col-span-12 lg:col-span-9">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && !isLoading && (
                    <div className="max-w-[1600px] mx-auto">
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                            <AlertDescription className="text-red-800">
                                <div className="flex items-center justify-between">
                                    <span>حدث خطأ أثناء تحميل تفاصيل التذكير: {error?.message || 'خطأ غير معروف'}</span>
                                    <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !reminder && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <Bell className="h-8 w-8 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-bold text-navy mb-2">لم يتم العثور على التذكير</h4>
                            <p className="text-slate-500 mb-4">التذكير المطلوب غير موجود أو تم حذفه</p>
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl">
                                <Link to="/dashboard/tasks/reminders">
                                    <ArrowLeft className="ms-2 h-4 w-4" />
                                    العودة إلى التذكيرات
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success State - Hero Content */}
                {!isLoading && !isError && reminder && (
                    <>
                        <ProductivityHero badge="التذكيرات" title={reminder.title} type="reminders" listMode={true} />

                        {/* ACTION BUTTONS */}
                        <div className="max-w-[1600px] mx-auto">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex flex-wrap gap-3">
                                    {/* Complete/Reopen Button */}
                                    <Button
                                        onClick={handleComplete}
                                        disabled={completeReminderMutation.isPending || reopenReminderMutation.isPending}
                                        className={reminder.status === 'completed'
                                            ? "bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                                            : "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                        }
                                    >
                                        {(completeReminderMutation.isPending || reopenReminderMutation.isPending) ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 ms-2" />
                                        )}
                                        {reminder.status === 'completed' ? 'إعادة فتح' : 'إكمال'}
                                    </Button>

                                    {/* Dismiss Button */}
                                    {reminder.status !== 'dismissed' && reminder.status !== 'completed' && (
                                        <Button
                                            onClick={handleDismiss}
                                            disabled={dismissReminderMutation.isPending}
                                            variant="outline"
                                            className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
                                        >
                                            {dismissReminderMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4 ms-2" />
                                            )}
                                            تجاهل
                                        </Button>
                                    )}

                                    {/* Snooze Dropdown */}
                                    {reminder.status !== 'completed' && reminder.status !== 'dismissed' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={snoozeReminderMutation.isPending}
                                                    className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"
                                                >
                                                    {snoozeReminderMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 ms-2" aria-hidden="true" />
                                                    )}
                                                    تأجيل
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48">
                                                {SNOOZE_OPTIONS.map((option) => (
                                                    <DropdownMenuItem
                                                        key={option.value}
                                                        onClick={() => handleSnooze(option.value)}
                                                    >
                                                        {option.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}

                                    {/* Delegate Button */}
                                    {reminder.status !== 'completed' && reminder.status !== 'dismissed' && (
                                        <Button
                                            onClick={() => setShowDelegateDialog(true)}
                                            variant="outline"
                                            className="border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
                                        >
                                            <UserPlus className="h-4 w-4 ms-2" />
                                            تفويض
                                        </Button>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <div className="flex gap-3">
                                    {showDeleteConfirm ? (
                                        <>
                                            <Button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                variant="outline"
                                                className="rounded-xl"
                                            >
                                                إلغاء
                                            </Button>
                                            <Button
                                                onClick={handleDelete}
                                                disabled={deleteReminderMutation.isPending}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                            >
                                                {deleteReminderMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 ms-2" />
                                                )}
                                                تأكيد الحذف
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <Trash2 className="h-4 w-4 ms-2" />
                                            حذف
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN CONTENT GRID */}
                        <div className="max-w-[1600px] mx-auto pb-12">
                            <div className="grid grid-cols-12 gap-6">

                                {/* LEFT SIDEBAR */}
                                <div className="col-span-12 lg:col-span-3 space-y-6">
                                    {/* Timeline Card */}
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                        <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                                <History className="h-5 w-5 text-brand-blue" />
                                                الجدول الزمني
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <ScrollArea className="h-[200px]">
                                                <div className="relative p-6">
                                                    <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                                                    <div className="space-y-8 relative">
                                                        {reminder.timeline.map((event, i) => (
                                                            <div key={i} className="flex gap-4 relative">
                                                                <div className={`
                                                            w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white
                                                            ${event.status === 'completed' ? 'bg-emerald-500' :
                                                                        event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                        `}></div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-bold text-navy">{event.title}</div>
                                                                    <div className="text-xs text-slate-500 mb-1">{event.date}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>

                                    {/* Related To Card */}
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold text-navy">مرتبط بـ</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 text-blue-600">
                                                    <Briefcase className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-navy line-clamp-1" title={reminder.relatedTo?.title}>{reminder.relatedTo?.title}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{reminder.relatedTo?.id}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* CENTER CONTENT */}
                                <div className="col-span-12 lg:col-span-9">
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="border-b border-slate-100 px-6 pt-4">
                                                <TabsList className="bg-transparent h-auto p-0 gap-6">
                                                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-blue data-[state=active]:text-brand-blue text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                                                        التفاصيل
                                                    </TabsTrigger>
                                                    <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-blue data-[state=active]:text-brand-blue text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                                                        ملاحظات
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <div className="p-6 bg-slate-50/50 min-h-[400px]">
                                                <TabsContent value="overview" className="mt-0 space-y-6">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle className="text-lg font-bold text-navy">وصف التذكير</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-slate-600 leading-relaxed">
                                                                {reminder.description}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="notes" className="mt-0">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardContent className="p-6">
                                                            <div className="flex gap-3">
                                                                <Avatar className="w-10 h-10">
                                                                    <AvatarFallback className="bg-navy text-white">أنا</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 relative">
                                                                    <Textarea placeholder="أضف ملاحظة..." className="min-h-[80px] rounded-xl resize-none pe-12 bg-slate-50 border-slate-200 focus:border-brand-blue" />
                                                                    <Button size="icon" className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-brand-blue hover:bg-blue-600">
                                                                        <Send className="w-4 h-4" aria-hidden="true" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Main>

            {/* Delegate Reminder Dialog */}
            <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تفويض التذكير</DialogTitle>
                        <DialogDescription>
                            اختر الشخص الذي تريد تفويض التذكير إليه
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">تفويض إلى</label>
                            <Select value={delegateTo} onValueChange={setDelegateTo}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="اختر عضو الفريق" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers && teamMembers.length > 0 ? (
                                        teamMembers.map((member) => (
                                            <SelectItem key={member._id} value={member._id}>
                                                {member.firstName} {member.lastName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            لا يوجد أعضاء فريق
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ملاحظة (اختياري)</label>
                            <Textarea
                                placeholder="أضف ملاحظة للتفويض..."
                                value={delegateNote}
                                onChange={(e) => setDelegateNote(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDelegateDialog(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleDelegate}
                            disabled={!delegateTo || delegateReminderMutation.isPending}
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            {delegateReminderMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                    جاري التفويض...
                                </>
                            ) : (
                                'تفويض'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
