/**
 * Ticket Details View
 * Complete details view for Support tickets with communications, activity log, and SLA tracking
 */

import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Bell,
  AlertCircle,
  Headphones,
  User,
  Clock,
  AlertTriangle,
  Trash2,
  Loader2,
  Send,
  Edit3,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Paperclip,
  Activity,
  Tag,
  Building2,
} from 'lucide-react'

// Layout Components
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
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

// Support Components
import { SupportSidebar } from './support-sidebar'

// Hooks
import {
  useTicket,
  useTicketCommunications,
  useDeleteTicket,
  useAddCommunication,
  useUpdateTicketStatus,
} from '@/hooks/use-support'

// Constants
import { ROUTES } from '@/constants/routes'

// Types
import type { TicketStatus, TicketPriority, SlaStatus } from '@/types/support'

export function TicketDetailsView() {
  const { ticketId } = useParams({ strict: false }) as { ticketId: string }
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('info')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)

  // Fetch ticket data
  const { data: ticketData, isLoading, isError, error, refetch } = useTicket(ticketId)

  // Fetch communications
  const { data: communicationsData, isLoading: loadingComms } = useTicketCommunications(ticketId)

  // Mutations
  const deleteTicketMutation = useDeleteTicket()
  const addCommunicationMutation = useAddCommunication()
  const updateStatusMutation = useUpdateTicketStatus()

  // Handle delete
  const handleDelete = () => {
    deleteTicketMutation.mutate(ticketId, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.support.list })
      },
    })
  }

  // Handle add reply
  const handleAddReply = () => {
    if (!replyContent.trim()) return
    addCommunicationMutation.mutate(
      {
        ticketId,
        data: {
          content: replyContent.trim(),
          isInternal: isInternalNote,
        },
      },
      {
        onSuccess: () => {
          setReplyContent('')
          setIsInternalNote(false)
        },
      }
    )
  }

  // Handle status change
  const handleStatusChange = (status: TicketStatus) => {
    updateStatusMutation.mutate({ id: ticketId, status })
  }

  // Format date helper
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return t('support.notSet', 'غير محدد')
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Status badge styling
  const getStatusBadge = (status: TicketStatus) => {
    const styles: Record<TicketStatus, string> = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      replied: 'bg-purple-100 text-purple-700 border-purple-200',
      resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      closed: 'bg-slate-100 text-slate-700 border-slate-200',
      on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
    }
    const labels: Record<TicketStatus, string> = {
      open: t('support.status.open', 'مفتوح'),
      replied: t('support.status.replied', 'تم الرد'),
      resolved: t('support.status.resolved', 'محلول'),
      closed: t('support.status.closed', 'مغلق'),
      on_hold: t('support.status.on_hold', 'معلق'),
    }
    return <Badge className={`${styles[status]} border rounded-md px-3 py-1`}>{labels[status]}</Badge>
  }

  // Priority badge styling
  const getPriorityBadge = (priority: TicketPriority) => {
    const styles: Record<TicketPriority, string> = {
      low: 'bg-slate-100 text-slate-700 border-slate-200',
      medium: 'bg-blue-100 text-blue-700 border-blue-200',
      high: 'bg-amber-100 text-amber-700 border-amber-200',
      urgent: 'bg-red-100 text-red-700 border-red-200',
    }
    const labels: Record<TicketPriority, string> = {
      low: t('support.priority.low', 'منخفض'),
      medium: t('support.priority.medium', 'متوسط'),
      high: t('support.priority.high', 'عالي'),
      urgent: t('support.priority.urgent', 'عاجل'),
    }
    return <Badge className={`${styles[priority]} border rounded-md px-3 py-1`}>{labels[priority]}</Badge>
  }

  // SLA Status badge
  const getSLABadge = (slaStatus: SlaStatus | undefined) => {
    if (!slaStatus) return null
    const styles: Record<SlaStatus, string> = {
      within_sla: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-100 text-amber-700 border-amber-200',
      breached: 'bg-red-100 text-red-700 border-red-200',
    }
    const labels: Record<SlaStatus, string> = {
      within_sla: t('support.sla.withinSLA', 'ضمن SLA'),
      warning: t('support.sla.warning', 'تحذير'),
      breached: t('support.sla.breached', 'منتهك'),
    }
    return <Badge className={`${styles[slaStatus]} border rounded-md px-3 py-1`}>{labels[slaStatus]}</Badge>
  }

  // Transform data for display
  const ticket = useMemo(() => {
    if (!ticketData) return null
    return {
      ...ticketData,
      subject: ticketData.subject || t('support.untitled', 'بدون عنوان'),
      raisedByName: ticketData.raisedByName || t('support.unknown', 'غير معروف'),
      assignedToName: ticketData.assignedToName || t('support.unassigned', 'غير معين'),
      clientName: ticketData.clientName,
    }
  }, [ticketData, t])

  // Transform communications for display
  const communications = useMemo(() => {
    if (!communicationsData?.communications) return []
    return communicationsData.communications.map((comm) => ({
      ...comm,
      senderName: comm.senderName || t('support.unknown', 'غير معروف'),
      formattedTime: formatDate(comm.timestamp),
    }))
  }, [communicationsData, t])

  // Activity log from ticket history
  const activityLog = useMemo(() => {
    if (!ticketData) return []
    // Create activity log entries based on ticket changes
    const activities = []

    activities.push({
      id: 'created',
      title: t('support.activity.created', 'تم إنشاء التذكرة'),
      description: `${t('support.by', 'بواسطة')} ${ticket?.raisedByName}`,
      timestamp: ticketData.createdAt,
      icon: <MessageSquare className="w-4 h-4" />,
    })

    if (ticketData.assignedTo) {
      activities.push({
        id: 'assigned',
        title: t('support.activity.assigned', 'تم التعيين'),
        description: `${t('support.assignedTo', 'معين إلى')} ${ticket?.assignedToName}`,
        timestamp: ticketData.updatedAt,
        icon: <User className="w-4 h-4" />,
      })
    }

    if (ticketData.resolvedAt) {
      activities.push({
        id: 'resolved',
        title: t('support.activity.resolved', 'تم الحل'),
        description: t('support.activity.resolvedDesc', 'تم حل التذكرة'),
        timestamp: ticketData.resolvedAt,
        icon: <CheckCircle2 className="w-4 h-4" />,
      })
    }

    if (ticketData.closedAt) {
      activities.push({
        id: 'closed',
        title: t('support.activity.closed', 'تم الإغلاق'),
        description: t('support.activity.closedDesc', 'تم إغلاق التذكرة'),
        timestamp: ticketData.closedAt,
        icon: <XCircle className="w-4 h-4" />,
      })
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [ticketData, ticket, t])

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: ROUTES.dashboard.home, isActive: false },
    { title: t('nav.support', 'الدعم الفني'), href: ROUTES.dashboard.support.list, isActive: true },
    { title: t('nav.tickets', 'التذاكر'), href: ROUTES.dashboard.support.list, isActive: false },
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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('search.placeholder', 'بحث...')}
              aria-label={t('search.label', 'بحث')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label={t('notifications.label', 'الإشعارات')}>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('support.error.loadFailed', 'حدث خطأ أثناء تحميل التذكرة')}
            </h3>
            <p className="text-slate-500 mb-4">{error?.message || t('support.error.serverError', 'تعذر الاتصال بالخادم')}</p>
            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
              {t('support.retry', 'إعادة المحاولة')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !ticket && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Headphones className="w-8 h-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('support.notFound', 'التذكرة غير موجودة')}
            </h3>
            <p className="text-slate-500 mb-4">{t('support.notFoundDesc', 'لم يتم العثور على التذكرة المطلوبة')}</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to={ROUTES.dashboard.support.list}>{t('support.backToList', 'العودة إلى القائمة')}</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && ticket && (
          <>
            {/* HERO CARD */}
            <ProductivityHero
              badge={t('support.badge', 'الدعم الفني')}
              title={ticket.subject}
              type="support"
              listMode={true}
            />

            {/* MAIN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* RIGHT COLUMN (Main Content) */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Tabs Header */}
                    <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                      <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100/80 p-1.5 text-slate-500 w-full sm:w-auto gap-1">
                        {['info', 'communications', 'activity', 'attachments'].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="
                              inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 sm:px-6 py-2.5 text-sm font-semibold ring-offset-white transition-all duration-200
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                              disabled:pointer-events-none disabled:opacity-50
                              data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20
                              data-[state=inactive]:hover:bg-white data-[state=inactive]:hover:text-slate-900
                              flex-1 sm:flex-initial
                            "
                          >
                            {tab === 'info'
                              ? t('support.tabs.info', 'معلومات التذكرة')
                              : tab === 'communications'
                              ? t('support.tabs.communications', 'الردود')
                              : tab === 'activity'
                              ? t('support.tabs.activity', 'سجل النشاط')
                              : t('support.tabs.attachments', 'المرفقات')}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
                      {/* Ticket Info Tab */}
                      <TabsContent value="info" className="mt-0 space-y-6">
                        {/* Status & Priority Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                {t('support.status', 'الحالة')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>{getStatusBadge(ticket.status)}</CardContent>
                          </Card>

                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                {t('support.priority', 'الأولوية')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>{getPriorityBadge(ticket.priority)}</CardContent>
                          </Card>

                          {ticket.slaStatus && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                  {t('support.slaStatus', 'حالة SLA')}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>{getSLABadge(ticket.slaStatus)}</CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Description */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-navy">
                              {t('support.description', 'الوصف')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                          </CardContent>
                        </Card>

                        {/* Ticket Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Raised By */}
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                {t('support.raisedBy', 'تم الإنشاء بواسطة')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('support.name', 'الاسم')}</span>
                                <span className="font-medium text-slate-900">{ticket.raisedByName}</span>
                              </div>
                              {ticket.raisedByEmail && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">{t('support.email', 'البريد الإلكتروني')}</span>
                                  <span className="font-medium text-slate-900" dir="ltr">
                                    {ticket.raisedByEmail}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('support.createdAt', 'تاريخ الإنشاء')}</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.createdAt)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Assigned To */}
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                {t('support.assignedTo', 'معين إلى')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('support.agent', 'الموظف')}</span>
                                <span className="font-medium text-slate-900">{ticket.assignedToName}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('support.lastUpdate', 'آخر تحديث')}</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.updatedAt)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Client Info (if applicable) */}
                          {ticket.clientName && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                  {t('support.client', 'العميل')}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">{t('support.clientName', 'اسم العميل')}</span>
                                  <span className="font-medium text-slate-900">{ticket.clientName}</span>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* SLA Details */}
                          {ticket.slaId && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                  {t('support.slaDetails', 'تفاصيل SLA')}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {ticket.firstResponseDue && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('support.firstResponseDue', 'موعد الرد الأول')}</span>
                                    <span className="font-medium text-slate-900">{formatDate(ticket.firstResponseDue)}</span>
                                  </div>
                                )}
                                {ticket.resolutionDue && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('support.resolutionDue', 'موعد الحل')}</span>
                                    <span className="font-medium text-slate-900">{formatDate(ticket.resolutionDue)}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Tags */}
                        {ticket.tags && ticket.tags.length > 0 && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <Tag className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                {t('support.tags', 'الوسوم')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {ticket.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Communications Tab */}
                      <TabsContent value="communications" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            {/* Communications Thread */}
                            <div className="space-y-6 mb-6">
                              {loadingComms && (
                                <div className="space-y-4">
                                  <Skeleton className="h-24 w-full" />
                                  <Skeleton className="h-24 w-full" />
                                </div>
                              )}

                              {!loadingComms && communications.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                  <p>{t('support.noReplies', 'لا توجد ردود')}</p>
                                  <p className="text-xs mt-1">{t('support.beFirstToReply', 'كن أول من يرد على هذه التذكرة')}</p>
                                </div>
                              )}

                              {!loadingComms &&
                                communications.map((comm) => (
                                  <div key={comm._id || comm.communicationId} className="flex gap-4">
                                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                      <AvatarFallback
                                        className={
                                          comm.senderType === 'agent'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : comm.senderType === 'customer'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-slate-100 text-slate-700'
                                        }
                                      >
                                        {comm.senderName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div
                                        className={`p-4 rounded-2xl ${
                                          comm.isInternal
                                            ? 'bg-amber-50 border border-amber-200'
                                            : 'bg-slate-50'
                                        } rounded-tr-none`}
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-navy">{comm.senderName}</span>
                                            {comm.isInternal && (
                                              <Badge variant="outline" className="text-xs bg-amber-100 border-amber-300">
                                                {t('support.internal', 'داخلي')}
                                              </Badge>
                                            )}
                                          </div>
                                          <span className="text-xs text-slate-500">{comm.formattedTime}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{comm.content}</p>
                                        {comm.attachments && comm.attachments.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-slate-200">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                              <Paperclip className="w-3 h-3" aria-hidden="true" />
                                              <span>
                                                {comm.attachments.length} {t('support.attachments', 'مرفقات')}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Reply Form */}
                            {ticket.status !== 'closed' && (
                              <div className="border-t border-slate-200 pt-6">
                                <div className="flex gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-navy text-white">
                                      {t('support.you', 'أنا').charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 relative">
                                    <Textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                          handleAddReply()
                                        }
                                      }}
                                      placeholder={t('support.writeReply', 'اكتب ردك...')}
                                      className="min-h-[100px] rounded-xl resize-none pe-12 bg-slate-50 border-slate-200 focus:border-emerald-500"
                                    />
                                    <Button
                                      size="icon"
                                      aria-label={t('support.send', 'إرسال')}
                                      onClick={handleAddReply}
                                      disabled={!replyContent.trim() || addCommunicationMutation.isPending}
                                      className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                      {addCommunicationMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4" aria-hidden="true" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="internal-note"
                                    checked={isInternalNote}
                                    onChange={(e) => setIsInternalNote(e.target.checked)}
                                    className="rounded border-slate-300"
                                  />
                                  <label htmlFor="internal-note" className="text-sm text-slate-600">
                                    {t('support.internalNote', 'ملاحظة داخلية (لن يراها العميل)')}
                                  </label>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Activity Tab */}
                      <TabsContent value="activity" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {activityLog.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                  <p>{t('support.noActivity', 'لا يوجد نشاط')}</p>
                                </div>
                              )}

                              {activityLog.map((activity) => (
                                <div key={activity.id} className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    {activity.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-navy">{activity.title}</div>
                                    <div className="text-sm text-slate-500">{activity.description}</div>
                                    <div className="text-xs text-slate-400 mt-1">{formatDate(activity.timestamp)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Attachments Tab */}
                      <TabsContent value="attachments" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            {ticket.attachments && ticket.attachments.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ticket.attachments.map((attachment, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                      <Paperclip className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-navy text-sm truncate">{attachment.fileName}</div>
                                      <div className="text-xs text-slate-500">{formatDate(attachment.uploadedAt)}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-slate-500">
                                <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
                                <p>{t('support.noAttachments', 'لا توجد مرفقات')}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>

                {/* Quick Actions Bar */}
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('communications')}
                        className="rounded-xl"
                      >
                        <MessageSquare className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('support.reply', 'رد')}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => navigate({ to: `${ROUTES.dashboard.support.detail(ticketId)}/edit` })}
                        className="rounded-xl"
                      >
                        <Edit3 className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('support.edit', 'تعديل')}
                      </Button>

                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusChange('resolved')}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 ms-2" aria-hidden="true" />
                          )}
                          {t('support.resolve', 'حل')}
                        </Button>
                      )}

                      {ticket.status !== 'closed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusChange('closed')}
                          disabled={updateStatusMutation.isPending}
                          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                          )}
                          {t('support.close', 'إغلاق')}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 ms-auto"
                      >
                        <Trash2 className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('support.delete', 'حذف')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* LEFT SIDEBAR */}
              <SupportSidebar />
            </div>
          </>
        )}
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              {t('support.confirmDelete', 'هل أنت متأكد من حذف هذه التذكرة؟')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('support.deleteWarning', 'سيتم حذف التذكرة نهائياً ولا يمكن استرجاعها.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 justify-center sm:justify-center">
            <AlertDialogCancel className="rounded-xl">{t('support.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTicketMutation.isPending}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteTicketMutation.isPending ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
              )}
              {t('support.confirmDeleteButton', 'حذف التذكرة')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
