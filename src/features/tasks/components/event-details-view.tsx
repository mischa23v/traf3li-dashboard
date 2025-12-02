import { useState, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
    Calendar as CalendarIcon, MapPin, CheckCircle2, Trash2, Edit3, Loader2,
    ArrowLeft, Briefcase, XCircle, Check, X, HelpCircle,
    History, Link as LinkIcon, Send, Bell, Search, Clock, AlertCircle
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
    useEvent,
    useDeleteEvent,
    useCompleteEvent,
    useCancelEvent,
    useRSVPEvent
} from '@/hooks/useRemindersAndEvents'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductivityHero } from '@/components/productivity-hero'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function EventDetailsView() {
    const [activeTab, setActiveTab] = useState('overview')
    const { eventId } = useParams({ strict: false }) as { eventId: string }
    const navigate = useNavigate()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Fetch event data
    const { data: eventData, isLoading, isError, error, refetch } = useEvent(eventId)

    // Mutations
    const deleteEventMutation = useDeleteEvent()
    const completeEventMutation = useCompleteEvent()
    const cancelEventMutation = useCancelEvent()
    const rsvpEventMutation = useRSVPEvent()

    const handleDelete = () => {
        deleteEventMutation.mutate(eventId, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/events' })
            }
        })
    }

    const handleComplete = () => {
        completeEventMutation.mutate(eventId)
    }

    const handleCancel = () => {
        cancelEventMutation.mutate({ id: eventId, reason: 'تم الإلغاء من قبل المستخدم' })
    }

    const handleRSVP = (status: 'accepted' | 'declined' | 'tentative') => {
        rsvpEventMutation.mutate({ id: eventId, status })
    }

    // Transform API data
    const event = useMemo(() => {
        if (!eventData) return null
        const e = eventData

        const eventDate = e.date ? new Date(e.date) : null
        const dateDisplay = eventDate ? eventDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'
        const timeDisplay = e.time || (eventDate ? eventDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد')

        return {
            id: e._id,
            title: e.title || e.description || 'فعالية غير محددة',
            description: e.description || e.notes || 'لا يوجد وصف',
            type: e.type || 'meeting',
            location: e.location || 'غير محدد',
            date: dateDisplay,
            time: timeDisplay,
            status: e.status || 'pending',
            attendees: (e.attendees || []).map((att: any) => ({
                name: typeof att === 'string' ? att : (att.name || att.userId?.firstName + ' ' + att.userId?.lastName || 'حاضر'),
                role: typeof att === 'string' ? 'حاضر' : (att.role || att.userId?.role || 'حاضر'),
                status: typeof att === 'string' ? 'pending' : (att.status || 'pending')
            })),
            relatedTo: e.caseId ? {
                type: 'case',
                id: typeof e.caseId === 'string' ? e.caseId : (e.caseId.caseNumber || 'N/A'),
                title: typeof e.caseId === 'string' ? 'قضية' : (e.caseId.title || 'قضية غير محددة')
            } : null,
            timeline: (e.history || []).map((h: any) => ({
                date: h.timestamp ? new Date(h.timestamp).toLocaleDateString('ar-SA') : 'غير محدد',
                title: h.description || h.action || 'تحديث',
                type: h.type || 'update',
                status: 'completed'
            }))
        }
    }, [eventData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: false },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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

                {/* Breadcrumb / Back Link */}
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/tasks/events" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى الفعاليات
                    </Link>
                </div>

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
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <div className="flex items-center justify-between">
                                    <span>حدث خطأ أثناء تحميل تفاصيل الفعالية: {error?.message || 'خطأ غير معروف'}</span>
                                    <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                                        إعادة المحاولة
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !event && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <CalendarIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-bold text-navy mb-2">لم يتم العثور على الفعالية</h4>
                            <p className="text-slate-500 mb-4">الفعالية المطلوبة غير موجودة أو تم حذفها</p>
                            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                                <Link to="/dashboard/tasks/events">
                                    <ArrowLeft className="ml-2 h-4 w-4" />
                                    العودة إلى الفعاليات
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success State - Hero Content */}
                {!isLoading && !isError && event && (
                    <>
                        <ProductivityHero badge="الأحداث" title={event.title} type="events" hideButtons={false} />

                        {/* ACTION BUTTONS */}
                        <div className="max-w-[1600px] mx-auto">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex flex-wrap gap-3">
                                    {/* Complete Button */}
                                    {event.status !== 'completed' && event.status !== 'cancelled' && (
                                        <Button
                                            onClick={handleComplete}
                                            disabled={completeEventMutation.isPending}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                                        >
                                            {completeEventMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 ml-2" />
                                            )}
                                            إكمال
                                        </Button>
                                    )}

                                    {/* Cancel Button */}
                                    {event.status !== 'cancelled' && event.status !== 'completed' && (
                                        <Button
                                            onClick={handleCancel}
                                            disabled={cancelEventMutation.isPending}
                                            variant="outline"
                                            className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl"
                                        >
                                            {cancelEventMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                            ) : (
                                                <XCircle className="h-4 w-4 ml-2" />
                                            )}
                                            إلغاء الفعالية
                                        </Button>
                                    )}

                                    {/* RSVP Dropdown */}
                                    {event.status !== 'completed' && event.status !== 'cancelled' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    disabled={rsvpEventMutation.isPending}
                                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl"
                                                >
                                                    {rsvpEventMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                                    ) : (
                                                        <CalendarIcon className="h-4 w-4 ml-2" />
                                                    )}
                                                    تأكيد الحضور
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48">
                                                <DropdownMenuItem onClick={() => handleRSVP('accepted')}>
                                                    <Check className="h-4 w-4 ml-2 text-emerald-500" />
                                                    سأحضر
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRSVP('tentative')}>
                                                    <HelpCircle className="h-4 w-4 ml-2 text-amber-500" />
                                                    ربما
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRSVP('declined')}>
                                                    <X className="h-4 w-4 ml-2 text-red-500" />
                                                    لن أحضر
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}

                                    {/* Status Badge */}
                                    <Badge
                                        variant="outline"
                                        className={
                                            event.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            event.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }
                                    >
                                        {event.status === 'completed' ? 'مكتملة' :
                                         event.status === 'cancelled' ? 'ملغاة' : 'مجدولة'}
                                    </Badge>
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
                                                disabled={deleteEventMutation.isPending}
                                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                            >
                                                {deleteEventMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 ml-2" />
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
                                            <Trash2 className="h-4 w-4 ml-2" />
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
                                                        {event.timeline.map((evt, i) => (
                                                            <div key={i} className="flex gap-4 relative">
                                                                <div className={`
                                                            w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white
                                                            ${evt.status === 'completed' ? 'bg-emerald-500' :
                                                                        evt.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                        `}></div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-bold text-navy">{evt.title}</div>
                                                                    <div className="text-xs text-slate-500 mb-1">{evt.date}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>

                                    {/* Related To Card */}
                                    {event.relatedTo && (
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
                                                        <div className="text-sm font-bold text-navy line-clamp-1" title={event.relatedTo?.title}>{event.relatedTo?.title}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{event.relatedTo?.id}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
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
                                                    <TabsTrigger value="attendees" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-blue data-[state=active]:text-brand-blue text-slate-500 font-medium text-base pb-4 rounded-none px-2">
                                                        الحضور
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
                                                            <CardTitle className="text-lg font-bold text-navy">تفاصيل الفعالية</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-slate-600 leading-relaxed">
                                                                {event.description}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>

                                                <TabsContent value="attendees" className="mt-0">
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardContent className="p-6 space-y-4">
                                                            {event.attendees.map((attendee, i) => (
                                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                                        {attendee.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-navy">{attendee.name}</div>
                                                                        <div className="text-xs text-slate-500">{attendee.role}</div>
                                                                    </div>
                                                                    <Badge variant={attendee.status === 'confirmed' ? 'default' : 'secondary'} className={attendee.status === 'confirmed' ? 'bg-emerald-500' : ''}>
                                                                        {attendee.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}
                                                                    </Badge>
                                                                </div>
                                                            ))}
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
                                                                    <Textarea placeholder="أضف ملاحظة..." className="min-h-[80px] rounded-xl resize-none pr-12 bg-slate-50 border-slate-200 focus:border-brand-blue" />
                                                                    <Button size="icon" className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-brand-blue hover:bg-blue-600">
                                                                        <Send className="w-4 h-4" />
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
        </>
    )
}
