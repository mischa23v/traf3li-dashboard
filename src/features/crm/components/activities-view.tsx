import { useState, useMemo } from 'react'
import {
  Search,
  Bell,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityTimeline, useActivityStats } from '@/hooks/useCrm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import type { CrmActivity, ActivityType } from '@/types/crm'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CrmSidebar } from './crm-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

const activityIcons: Record<ActivityType, React.ReactNode> = {
  call: <Phone className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
  sms: <MessageSquare className="h-5 w-5" />,
  whatsapp: <MessageSquare className="h-5 w-5" />,
  meeting: <Calendar className="h-5 w-5" />,
  note: <FileText className="h-5 w-5" />,
  task: <CheckCircle2 className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
  proposal: <FileText className="h-5 w-5" />,
  status_change: <Clock className="h-5 w-5" />,
  stage_change: <Clock className="h-5 w-5" />,
  lead_created: <Plus className="h-5 w-5" />,
  lead_converted: <CheckCircle2 className="h-5 w-5" />,
}

const activityLabels: Record<ActivityType, string> = {
  call: 'مكالمة',
  email: 'بريد إلكتروني',
  sms: 'رسالة نصية',
  whatsapp: 'واتساب',
  meeting: 'اجتماع',
  note: 'ملاحظة',
  task: 'مهمة',
  document: 'مستند',
  proposal: 'عرض سعر',
  status_change: 'تغيير الحالة',
  stage_change: 'تغيير المرحلة',
  lead_created: 'عميل محتمل جديد',
  lead_converted: 'تحويل العميل',
}

const activityColors: Record<ActivityType, string> = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  sms: 'bg-cyan-100 text-cyan-600 border-cyan-200',
  whatsapp: 'bg-green-100 text-green-600 border-green-200',
  meeting: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  task: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  document: 'bg-slate-100 text-slate-600 border-slate-200',
  proposal: 'bg-orange-100 text-orange-600 border-orange-200',
  status_change: 'bg-pink-100 text-pink-600 border-pink-200',
  stage_change: 'bg-rose-100 text-rose-600 border-rose-200',
  lead_created: 'bg-teal-100 text-teal-600 border-teal-200',
  lead_converted: 'bg-green-100 text-green-600 border-green-200',
}

export function ActivitiesView() {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all')

  // API Params
  const params = useMemo(() => {
    const p: any = { limit: 50 }
    if (activeTypeFilter !== 'all') {
      p.types = activeTypeFilter
    }
    return p
  }, [activeTypeFilter])

  // Fetch activities
  const { data: activitiesData, isLoading, isError, error, refetch } = useActivityTimeline(params)
  const { data: statsData } = useActivityStats()

  // Transform API data
  const activities = activitiesData || []
  const stats = statsData?.stats

  // Group activities by date
  const groupedActivities = useMemo(() => {
    if (!activities.length) return {}

    return activities.reduce((groups: Record<string, CrmActivity[]>, activity: CrmActivity) => {
      const date = format(new Date(activity.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = []
      groups[date].push(activity)
      return groups
    }, {})
  }, [activities])

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: true },
  ]

  const typeFilters = [
    { id: 'all', label: 'الكل' },
    { id: 'call', label: 'مكالمات' },
    { id: 'email', label: 'بريد' },
    { id: 'meeting', label: 'اجتماعات' },
    { id: 'note', label: 'ملاحظات' },
    { id: 'task', label: 'مهام' },
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
        {/* Header */}
        <ProductivityHero badge="سجل الأنشطة" title="سجل الأنشطة" type="activities" hideButtons={true}>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
          </div>
        </ProductivityHero>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">إجمالي الأنشطة</span>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.total}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-slate-600">مكتملة</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-600">مكالمات</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.byType?.find((t: any) => t._id === 'call')?.count || 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-slate-600">اجتماعات</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.byType?.find((t: any) => t._id === 'meeting')?.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {typeFilters.map((filter) => (
                <Button
                  key={filter.id}
                  size="sm"
                  onClick={() => setActiveTypeFilter(filter.id)}
                  className={
                    activeTypeFilter === filter.id
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4'
                      : 'bg-white text-slate-600 hover:bg-slate-100 rounded-full px-4 border'
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Activities Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    حدث خطأ أثناء تحميل الأنشطة
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
              )}

              {/* Empty State */}
              {!isLoading && !isError && activities.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    لا توجد أنشطة
                  </h3>
                  <p className="text-slate-500">سيتم عرض الأنشطة هنا عند إضافتها</p>
                </div>
              )}

              {/* Success State - Timeline */}
              {!isLoading &&
                !isError &&
                Object.entries(groupedActivities).map(([date, dayActivities]) => (
                  <div key={date} className="mb-8 last:mb-0">
                    {/* Date Header */}
                    <div className="sticky top-0 bg-slate-50 px-4 py-2 rounded-xl font-medium text-slate-700 mb-4 z-10">
                      {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: ar })}
                    </div>

                    {/* Activities for this date */}
                    <div className="space-y-4">
                      {dayActivities.map((activity: CrmActivity) => (
                        <div
                          key={activity._id}
                          className={`p-4 rounded-xl border-r-4 bg-slate-50 hover:bg-slate-100 transition-colors ${activityColors[activity.type]?.split(' ')[2] ||
                            'border-slate-200'
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColors[activity.type]?.split(' ').slice(0, 2).join(' ') ||
                                'bg-slate-100 text-slate-600'
                                }`}
                            >
                              {activityIcons[activity.type]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-navy">
                                  {activity.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-xs rounded-md"
                                >
                                  {activityLabels[activity.type]}
                                </Badge>
                              </div>

                              {activity.entityName && (
                                <Link
                                  to={`/dashboard/crm/leads/${activity.entityId}`}
                                  className="text-sm text-emerald-600 hover:underline mb-1 block"
                                >
                                  {activity.entityName}
                                </Link>
                              )}

                              {activity.description && (
                                <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                                  {activity.description}
                                </p>
                              )}

                              {/* Call-specific details */}
                              {activity.callData && (
                                <div className="text-xs text-slate-500 flex gap-4 mb-2">
                                  <span>
                                    {activity.callData.direction === 'outbound'
                                      ? 'صادرة'
                                      : 'واردة'}
                                  </span>
                                  {activity.callData.duration && (
                                    <span>
                                      {Math.floor(activity.callData.duration / 60)} دقيقة
                                    </span>
                                  )}
                                  {activity.callData.outcome && (
                                    <span>{activity.callData.outcome}</span>
                                  )}
                                </div>
                              )}

                              {/* Meeting-specific details */}
                              {activity.meetingData?.location && (
                                <div className="text-xs text-slate-500 mb-2">
                                  📍 {activity.meetingData.location}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span>
                                  {formatDistanceToNow(new Date(activity.createdAt), {
                                    addSuffix: true,
                                    locale: ar,
                                  })}
                                </span>
                                {activity.performedBy && (
                                  <span>
                                    {activity.performedBy.firstName}{' '}
                                    {activity.performedBy.lastName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <CrmSidebar context="activities" />
        </div>
      </Main>
    </>
  )
}
