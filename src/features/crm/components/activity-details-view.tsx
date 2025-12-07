import { useState } from 'react'
import {
  FileText,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  Search,
  Bell,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivity, useDeleteActivity, useUpdateActivityStatus } from '@/hooks/useCrm'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ProductivityHero } from '@/components/productivity-hero'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import type { ActivityType, ActivityStatus } from '@/types/crm'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalesSidebar } from './sales-sidebar'

const typeLabels: Record<ActivityType, string> = {
  call: 'مكالمة',
  email: 'بريد إلكتروني',
  sms: 'رسالة SMS',
  whatsapp: 'واتساب',
  meeting: 'اجتماع',
  note: 'ملاحظة',
  task: 'مهمة',
  document: 'مستند',
  proposal: 'عرض سعر',
  status_change: 'تغيير حالة',
  stage_change: 'تغيير مرحلة',
  lead_created: 'إنشاء عميل محتمل',
  lead_converted: 'تحويل عميل',
}

const typeIcons: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  meeting: Video,
  note: FileText,
  task: Clock,
  document: FileText,
  proposal: FileText,
  status_change: FileText,
  stage_change: FileText,
  lead_created: Users,
  lead_converted: CheckCircle2,
}

const typeColors: Record<ActivityType, string> = {
  call: 'bg-green-100 text-green-700',
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-purple-100 text-purple-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  meeting: 'bg-orange-100 text-orange-700',
  note: 'bg-slate-100 text-slate-700',
  task: 'bg-yellow-100 text-yellow-700',
  document: 'bg-indigo-100 text-indigo-700',
  proposal: 'bg-pink-100 text-pink-700',
  status_change: 'bg-cyan-100 text-cyan-700',
  stage_change: 'bg-teal-100 text-teal-700',
  lead_created: 'bg-rose-100 text-rose-700',
  lead_converted: 'bg-lime-100 text-lime-700',
}

const statusLabels: Record<ActivityStatus, string> = {
  scheduled: 'مجدول',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
}

const statusColors: Record<ActivityStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusIcons: Record<ActivityStatus, typeof CheckCircle2> = {
  scheduled: Clock,
  in_progress: PauseCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
}

export function ActivityDetailsView() {
  const { activityId } = useParams({ strict: false }) as { activityId: string }
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch activity data
  const { data: activityData, isLoading, isError, error, refetch } = useActivity(activityId)

  // Mutations
  const deleteActivityMutation = useDeleteActivity()
  const updateStatusMutation = useUpdateActivityStatus()

  const handleDelete = () => {
    deleteActivityMutation.mutate(activityId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/activities' })
      },
    })
  }

  const handleStatusChange = (status: ActivityStatus) => {
    updateStatusMutation.mutate({ activityId, status })
  }

  // Transform API data
  const activity = activityData?.activity

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: true },
  ]

  const TypeIcon = activity ? typeIcons[activity.type] || FileText : FileText
  const StatusIcon = activity ? statusIcons[activity.status] || Clock : Clock

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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/crm/activities"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى سجل الأنشطة
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
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
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                حدث خطأ أثناء تحميل بيانات النشاط
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || 'تعذر الاتصال بالخادم'}
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !activity && (
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                النشاط غير موجود
              </h3>
              <p className="text-slate-500 mb-4">
                لم يتم العثور على النشاط المطلوب
              </p>
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link to="/dashboard/crm/activities">العودة إلى القائمة</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && activity && (
          <>
            {/* Activity Hero Content */}
            <ProductivityHero badge="إدارة النشاطات" title={activity.titleAr || activity.title} type="activities" listMode={true} hideButtons={true}>
              <div className="flex flex-wrap gap-3">
                <Select
                  value={activity.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as ActivityStatus)
                  }
                >
                  <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white">
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
                      disabled={deleteActivityMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteActivityMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'تأكيد'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ProductivityHero>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description Card */}
                  {activity.description && (
                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" aria-hidden="true" />
                          الوصف
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Call Details */}
                  {activity.type === 'call' && activity.callData && (
                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                          <Phone className="h-5 w-5 text-green-500" aria-hidden="true" />
                          تفاصيل المكالمة
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <p className="text-xs text-slate-500 mb-1">الاتجاه</p>
                          <p className="font-medium text-navy">
                            {activity.callData.direction === 'inbound' ? 'واردة' : 'صادرة'}
                          </p>
                        </div>
                        {activity.callData.phoneNumber && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الرقم</p>
                            <p className="font-medium text-navy" dir="ltr">{activity.callData.phoneNumber}</p>
                          </div>
                        )}
                        {activity.callData.duration && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">المدة</p>
                            <p className="font-medium text-navy">{activity.callData.duration} دقيقة</p>
                          </div>
                        )}
                        {activity.callData.outcome && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">النتيجة</p>
                            <p className="font-medium text-navy">{activity.callData.outcome}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Meeting Details */}
                  {activity.type === 'meeting' && activity.meetingData && (
                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                          <Video className="h-5 w-5 text-orange-500" />
                          تفاصيل الاجتماع
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {activity.meetingData.meetingType && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">النوع</p>
                              <p className="font-medium text-navy">
                                {activity.meetingData.meetingType === 'in_person' ? 'حضوري' :
                                  activity.meetingData.meetingType === 'video' ? 'فيديو' :
                                    activity.meetingData.meetingType === 'phone' ? 'هاتفي' : 'استشارة'}
                              </p>
                            </div>
                          )}
                          {activity.meetingData.location && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">الموقع</p>
                              <p className="font-medium text-navy">{activity.meetingData.location}</p>
                            </div>
                          )}
                          {activity.meetingData.scheduledStart && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">البداية</p>
                              <p className="font-medium text-navy">
                                {format(new Date(activity.meetingData.scheduledStart), 'dd/MM HH:mm', { locale: ar })}
                              </p>
                            </div>
                          )}
                          {activity.meetingData.scheduledEnd && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">النهاية</p>
                              <p className="font-medium text-navy">
                                {format(new Date(activity.meetingData.scheduledEnd), 'dd/MM HH:mm', { locale: ar })}
                              </p>
                            </div>
                          )}
                        </div>
                        {activity.meetingData.agenda && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">جدول الأعمال</p>
                            <p className="text-slate-600">{activity.meetingData.agenda}</p>
                          </div>
                        )}
                        {activity.meetingData.summary && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-2">الملخص</p>
                            <p className="text-slate-600">{activity.meetingData.summary}</p>
                          </div>
                        )}
                        {activity.meetingData.outcome && (
                          <div className="p-4 bg-green-50 rounded-xl">
                            <p className="text-xs text-green-600 mb-2">النتيجة</p>
                            <p className="text-green-700">{activity.meetingData.outcome}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Email Details */}
                  {activity.type === 'email' && activity.emailData && (
                    <Card className="border border-slate-100 shadow-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                          <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                          تفاصيل البريد
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {activity.emailData.subject && (
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">الموضوع</p>
                            <p className="font-medium text-navy">{activity.emailData.subject}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {activity.emailData.from && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">من</p>
                              <p className="font-medium text-navy" dir="ltr">{activity.emailData.from}</p>
                            </div>
                          )}
                          {activity.emailData.to && activity.emailData.to.length > 0 && (
                            <div className="p-3 bg-slate-50 rounded-xl">
                              <p className="text-xs text-slate-500 mb-1">إلى</p>
                              <p className="font-medium text-navy" dir="ltr">{activity.emailData.to.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* SIDEBAR */}
                <SalesSidebar context="activities" />
              </div>
          </>
        )}
      </Main>
    </>
  )
}
