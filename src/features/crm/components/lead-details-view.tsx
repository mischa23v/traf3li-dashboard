import { useState, useMemo } from 'react'
import {
  FileText,
  Calendar,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Plus,
  User,
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  History,
  Link as LinkIcon,
  Flag,
  Send,
  Search,
  Bell,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  ArrowUpRight,
  MessageSquare,
  Users,
  TrendingUp,
  Target,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLead, useDeleteLead, useConvertLead, useUpdateLeadStatus, useScheduleFollowUp } from '@/hooks/useCrm'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import type { LeadStatus, CrmActivity } from '@/types/crm'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'

const statusLabels: Record<LeadStatus, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  qualified: 'مؤهل',
  proposal: 'عرض سعر',
  negotiation: 'تفاوض',
  won: 'تم الكسب',
  lost: 'خسارة',
  dormant: 'خامل',
}

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  proposal: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  dormant: 'bg-gray-100 text-gray-700',
}

const sourceLabels: Record<string, string> = {
  website: 'الموقع الإلكتروني',
  referral: 'إحالة',
  social_media: 'وسائل التواصل',
  advertising: 'إعلان',
  cold_call: 'اتصال مباشر',
  walk_in: 'زيارة شخصية',
  event: 'فعالية',
  other: 'أخرى',
}

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  status_change: <Clock className="h-4 w-4" />,
  stage_change: <TrendingUp className="h-4 w-4" />,
}

export function LeadDetailsView() {
  const { leadId } = useParams({ strict: false }) as { leadId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNote, setFollowUpNote] = useState('')

  // Fetch lead data
  const { data: leadData, isLoading, isError, error, refetch } = useLead(leadId)

  // Mutations
  const deleteLeadMutation = useDeleteLead()
  const convertLeadMutation = useConvertLead()
  const updateStatusMutation = useUpdateLeadStatus()
  const scheduleFollowUpMutation = useScheduleFollowUp()

  const handleDelete = () => {
    deleteLeadMutation.mutate(leadId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/leads' })
      },
    })
  }

  const handleConvert = () => {
    convertLeadMutation.mutate(leadId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/clients' })
      },
    })
  }

  const handleStatusChange = (status: LeadStatus) => {
    updateStatusMutation.mutate({ leadId, status })
  }

  const handleScheduleFollowUp = () => {
    if (followUpDate) {
      scheduleFollowUpMutation.mutate(
        { leadId, date: followUpDate, note: followUpNote },
        {
          onSuccess: () => {
            setFollowUpDate('')
            setFollowUpNote('')
          },
        }
      )
    }
  }

  // Transform API data
  const lead = leadData?.lead
  const activities = leadData?.activities || []

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: true },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="max-w-[1600px] mx-auto mb-6">
          <Link
            to="/dashboard/crm/leads"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة إلى قائمة العملاء المحتملين
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
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                حدث خطأ أثناء تحميل بيانات العميل المحتمل
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || 'تعذر الاتصال بالخادم'}
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !lead && (
          <div className="max-w-[1600px] mx-auto">
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                العميل المحتمل غير موجود
              </h3>
              <p className="text-slate-500 mb-4">
                لم يتم العثور على العميل المحتمل المطلوب
              </p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link to="/dashboard/crm/leads">العودة إلى القائمة</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && lead && (
          <>
            {/* Lead Hero Content */}
            <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                      <Users className="h-6 w-6" />
                    </div>
                    <Badge
                      className={`${statusColors[lead.status]} border-0 rounded-lg px-3 py-1`}
                    >
                      {statusLabels[lead.status]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                    >
                      {lead.leadId}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                    {lead.displayName}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-400" />
                        <span dir="ltr">{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-400" />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.source?.type && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-400" />
                        <span>
                          المصدر:{' '}
                          <span className="text-white font-medium">
                            {sourceLabels[lead.source.type] || lead.source.type}
                          </span>
                        </span>
                      </div>
                    )}
                    {lead.estimatedValue > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-200 font-bold">
                          {lead.estimatedValue.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex flex-col gap-4 min-w-[280px]">
                  <div className="flex gap-3">
                    <Link to={`/dashboard/crm/leads/${leadId}/edit`}>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                      >
                        <Edit3 className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      onClick={handleConvert}
                      disabled={
                        convertLeadMutation.isPending || lead.convertedToClient
                      }
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-0"
                    >
                      {convertLeadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      )}
                      {lead.convertedToClient ? 'تم التحويل' : 'تحويل لعميل'}
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        handleStatusChange(value as LeadStatus)
                      }
                    >
                      <SelectTrigger className="flex-1 border-white/10 bg-white/5 text-white">
                        <SelectValue placeholder="تغيير الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!showDeleteConfirm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="border-white/10 text-white hover:bg-white/10"
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          disabled={deleteLeadMutation.isPending}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {deleteLeadMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'تأكيد'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Qualification Score */}
                  {lead.qualification?.score && (
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">
                          نقاط التأهيل
                        </span>
                        <span className="text-lg font-bold text-emerald-400">
                          {lead.qualification.score}%
                        </span>
                      </div>
                      <Progress
                        value={lead.qualification.score}
                        className="h-2 bg-white/10"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="max-w-[1600px] mx-auto pb-12">
              <div className="grid grid-cols-12 gap-6">
                {/* LEFT SIDEBAR (Timeline & Quick Actions) */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                  {/* Schedule Follow-up */}
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 pb-4">
                      <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-500" />
                        جدولة متابعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="rounded-xl"
                      />
                      <Textarea
                        placeholder="ملاحظة المتابعة..."
                        value={followUpNote}
                        onChange={(e) => setFollowUpNote(e.target.value)}
                        className="rounded-xl min-h-[80px]"
                      />
                      <Button
                        onClick={handleScheduleFollowUp}
                        disabled={
                          !followUpDate || scheduleFollowUpMutation.isPending
                        }
                        className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                      >
                        {scheduleFollowUpMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <Calendar className="h-4 w-4 ml-2" />
                        )}
                        جدولة المتابعة
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Activity Timeline */}
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-50 pb-4">
                      <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-500" />
                        سجل الأنشطة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[300px]">
                        <div className="relative p-6">
                          <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>
                          <div className="space-y-6 relative">
                            {activities.length > 0 ? (
                              activities.slice(0, 10).map((activity: CrmActivity, i: number) => (
                                <div key={activity._id || i} className="flex gap-4 relative">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center z-10 ring-4 ring-white">
                                    {activityIcons[activity.type] || (
                                      <Clock className="h-4 w-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold text-navy">
                                      {activity.title}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {formatDistanceToNow(
                                        new Date(activity.createdAt),
                                        { addSuffix: true, locale: ar }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 text-sm text-center py-4">
                                لا توجد أنشطة بعد
                              </p>
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* CENTER CONTENT (Tabs & Details) */}
                <div className="col-span-12 lg:col-span-9">
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <div className="border-b border-slate-100 px-6 pt-4">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                          {['overview', 'intake', 'qualification', 'notes'].map(
                            (tab) => (
                              <TabsTrigger
                                key={tab}
                                value={tab}
                                className="
                                  data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                  data-[state=active]:border-b-2 data-[state=active]:border-emerald-500
                                  data-[state=active]:text-emerald-600
                                  text-slate-500 font-medium text-base pb-4 rounded-none px-2
                                "
                              >
                                {tab === 'overview'
                                  ? 'نظرة عامة'
                                  : tab === 'intake'
                                    ? 'بيانات الاستقبال'
                                    : tab === 'qualification'
                                      ? 'التأهيل'
                                      : 'الملاحظات'}
                              </TabsTrigger>
                            )
                          )}
                        </TabsList>
                      </div>

                      <div className="p-6 bg-slate-50/50 min-h-[500px]">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                          {/* Contact Info */}
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy">
                                معلومات التواصل
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Phone className="h-5 w-5 text-emerald-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      الهاتف
                                    </p>
                                    <p
                                      className="font-medium text-navy"
                                      dir="ltr"
                                    >
                                      {lead.phone || 'غير محدد'}
                                    </p>
                                  </div>
                                </div>
                                {lead.alternatePhone && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                    <div>
                                      <p className="text-xs text-slate-500">
                                        هاتف بديل
                                      </p>
                                      <p
                                        className="font-medium text-navy"
                                        dir="ltr"
                                      >
                                        {lead.alternatePhone}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                  <Mail className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <p className="text-xs text-slate-500">
                                      البريد الإلكتروني
                                    </p>
                                    <p className="font-medium text-navy">
                                      {lead.email || 'غير محدد'}
                                    </p>
                                  </div>
                                </div>
                                {lead.whatsapp && (
                                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <MessageSquare className="h-5 w-5 text-green-500" />
                                    <div>
                                      <p className="text-xs text-slate-500">
                                        واتساب
                                      </p>
                                      <p
                                        className="font-medium text-navy"
                                        dir="ltr"
                                      >
                                        {lead.whatsapp}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Address */}
                          {lead.address && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader>
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                  <MapPin className="h-5 w-5 text-red-500" />
                                  العنوان
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-slate-600">
                                  {[
                                    lead.address.street,
                                    lead.address.city,
                                    lead.address.postalCode,
                                    lead.address.country,
                                  ]
                                    .filter(Boolean)
                                    .join(', ') || 'غير محدد'}
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                منذ الإنشاء
                              </p>
                              <p className="text-lg font-bold text-navy">
                                {lead.daysSinceCreated} يوم
                              </p>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                آخر تواصل
                              </p>
                              <p className="text-lg font-bold text-navy">
                                {lead.daysSinceContact
                                  ? `${lead.daysSinceContact} يوم`
                                  : 'لم يتم'}
                              </p>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                عدد الأنشطة
                              </p>
                              <p className="text-lg font-bold text-emerald-600">
                                {lead.activityCount}
                              </p>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                الاحتمالية
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {lead.probability}%
                              </p>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="intake" className="mt-0 space-y-6">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy">
                                تفاصيل الاستقبال
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    نوع القضية
                                  </p>
                                  <p className="font-medium text-navy">
                                    {lead.intake?.caseType || 'غير محدد'}
                                  </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    الأولوية
                                  </p>
                                  <Badge
                                    className={
                                      lead.intake?.urgency === 'urgent'
                                        ? 'bg-red-100 text-red-700'
                                        : lead.intake?.urgency === 'high'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-slate-100 text-slate-700'
                                    }
                                  >
                                    {lead.intake?.urgency === 'urgent'
                                      ? 'عاجل'
                                      : lead.intake?.urgency === 'high'
                                        ? 'عالي'
                                        : lead.intake?.urgency === 'normal'
                                          ? 'عادي'
                                          : 'منخفض'}
                                  </Badge>
                                </div>
                              </div>
                              {lead.intake?.caseDescription && (
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-2">
                                    وصف القضية
                                  </p>
                                  <p className="text-slate-600 leading-relaxed">
                                    {lead.intake.caseDescription}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                                <CheckSquare
                                  className={`h-5 w-5 ${lead.intake?.conflictCheckCompleted ? 'text-emerald-500' : 'text-slate-300'}`}
                                />
                                <span className="text-slate-600">
                                  فحص تعارض المصالح
                                </span>
                                <Badge
                                  className={
                                    lead.intake?.conflictCheckCompleted
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-slate-100 text-slate-500'
                                  }
                                >
                                  {lead.intake?.conflictCheckCompleted
                                    ? 'تم'
                                    : 'لم يتم'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent
                          value="qualification"
                          className="mt-0 space-y-6"
                        >
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy">
                                معايير التأهيل (BANT)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    الميزانية
                                  </p>
                                  <Badge className="bg-blue-100 text-blue-700">
                                    {lead.qualification?.budget === 'premium'
                                      ? 'ممتازة'
                                      : lead.qualification?.budget === 'high'
                                        ? 'عالية'
                                        : lead.qualification?.budget === 'medium'
                                          ? 'متوسطة'
                                          : lead.qualification?.budget === 'low'
                                            ? 'منخفضة'
                                            : 'غير محدد'}
                                  </Badge>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    صلاحية القرار
                                  </p>
                                  <Badge className="bg-purple-100 text-purple-700">
                                    {lead.qualification?.authority ===
                                    'decision_maker'
                                      ? 'صانع قرار'
                                      : lead.qualification?.authority ===
                                          'influencer'
                                        ? 'مؤثر'
                                        : lead.qualification?.authority ===
                                            'researcher'
                                          ? 'باحث'
                                          : 'غير محدد'}
                                  </Badge>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    الحاجة
                                  </p>
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    {lead.qualification?.need === 'urgent'
                                      ? 'عاجلة'
                                      : lead.qualification?.need === 'planning'
                                        ? 'تخطيط'
                                        : lead.qualification?.need === 'exploring'
                                          ? 'استكشاف'
                                          : 'غير محدد'}
                                  </Badge>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                  <p className="text-xs text-slate-500 mb-1">
                                    الجدول الزمني
                                  </p>
                                  <Badge className="bg-orange-100 text-orange-700">
                                    {lead.qualification?.timeline === 'immediate'
                                      ? 'فوري'
                                      : lead.qualification?.timeline ===
                                          'this_month'
                                        ? 'هذا الشهر'
                                        : lead.qualification?.timeline ===
                                            'this_quarter'
                                          ? 'هذا الربع'
                                          : lead.qualification?.timeline ===
                                              'this_year'
                                            ? 'هذا العام'
                                            : 'غير محدد'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy">
                                الملاحظات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {lead.notes || 'لا توجد ملاحظات'}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Tags */}
                          {lead.tags && lead.tags.length > 0 && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mt-6">
                              <CardHeader>
                                <CardTitle className="text-lg font-bold text-navy">
                                  الوسوم
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {lead.tags.map((tag: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="rounded-full"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
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
