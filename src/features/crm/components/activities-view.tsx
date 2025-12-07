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
  MoreHorizontal,
  User,
  Building,
  ArrowUp,
  ArrowDown,
  Zap,
  Video,
  Link2,
  MapPin,
  Timer,
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  Star,
  X,
  ChevronDown,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityTimeline, useActivityStats } from '@/hooks/useCrm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Link } from '@tanstack/react-router'
import type { CrmActivity, ActivityType } from '@/types/crm'
import { formatDistanceToNow, format, startOfDay, subDays, isToday, isYesterday } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { cn } from '@/lib/utils'

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
  stage_change: <TrendingUp className="h-5 w-5" />,
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

const activityColors: Record<ActivityType, { bg: string; text: string; border: string; line: string }> = {
  call: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', line: 'bg-blue-400' },
  email: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', line: 'bg-purple-400' },
  sms: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', line: 'bg-cyan-400' },
  whatsapp: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', line: 'bg-green-500' },
  meeting: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', line: 'bg-emerald-400' },
  note: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', line: 'bg-yellow-400' },
  task: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', line: 'bg-indigo-400' },
  document: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', line: 'bg-slate-400' },
  proposal: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', line: 'bg-orange-400' },
  status_change: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', line: 'bg-pink-400' },
  stage_change: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', line: 'bg-rose-400' },
  lead_created: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', line: 'bg-teal-400' },
  lead_converted: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', line: 'bg-green-500' },
}

// Quick log activity types
const QUICK_LOG_TYPES = [
  { value: 'call', label: 'مكالمة', icon: Phone, color: 'bg-blue-500' },
  { value: 'email', label: 'بريد', icon: Mail, color: 'bg-purple-500' },
  { value: 'meeting', label: 'اجتماع', icon: Calendar, color: 'bg-emerald-500' },
  { value: 'note', label: 'ملاحظة', icon: FileText, color: 'bg-yellow-500' },
  { value: 'task', label: 'مهمة', icon: CheckCircle2, color: 'bg-indigo-500' },
  { value: 'whatsapp', label: 'واتساب', icon: MessageSquare, color: 'bg-green-500' },
]

// Call outcomes
const CALL_OUTCOMES = [
  { value: 'connected', label: 'تم الاتصال' },
  { value: 'no_answer', label: 'لم يرد' },
  { value: 'busy', label: 'مشغول' },
  { value: 'voicemail', label: 'بريد صوتي' },
  { value: 'wrong_number', label: 'رقم خاطئ' },
  { value: 'callback_requested', label: 'طلب معاودة الاتصال' },
]

// Date range filters
const DATE_RANGES = [
  { value: 'today', label: 'اليوم' },
  { value: 'yesterday', label: 'أمس' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'all', label: 'الكل' },
]

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  color = 'emerald',
}: {
  title: string
  value: number | string
  icon: any
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  color?: 'emerald' | 'blue' | 'purple' | 'orange'
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-navy mt-1">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1 text-xs">
                {changeType === 'up' && <ArrowUp className="w-3 h-3 text-emerald-500" />}
                {changeType === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                <span className={changeType === 'up' ? 'text-emerald-600' : changeType === 'down' ? 'text-red-600' : 'text-slate-500'}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={cn('p-2 rounded-xl', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Log Dialog Component
function QuickLogDialog({ trigger }: { trigger: React.ReactNode }) {
  const [selectedType, setSelectedType] = useState<string>('call')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [callOutcome, setCallOutcome] = useState('')
  const [duration, setDuration] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    // This would call the API to create the activity
    console.log({ type: selectedType, title, description, callOutcome, duration })
    setOpen(false)
    // Reset form
    setTitle('')
    setDescription('')
    setCallOutcome('')
    setDuration('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            تسجيل نشاط جديد
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* Activity Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LOG_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                    selectedType === type.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={cn('p-2 rounded-lg text-white', type.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              )
            })}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">العنوان</label>
            <Input
              placeholder="عنوان النشاط..."
              className="rounded-xl"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Call-specific fields */}
          {selectedType === 'call' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">نتيجة المكالمة</label>
                <Select value={callOutcome} onValueChange={setCallOutcome}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="اختر النتيجة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_OUTCOMES.map((outcome) => (
                      <SelectItem key={outcome.value} value={outcome.value}>
                        {outcome.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">المدة (دقائق)</label>
                <Input
                  type="number"
                  placeholder="5"
                  className="rounded-xl"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">الوصف</label>
            <Textarea
              placeholder="تفاصيل النشاط..."
              className="rounded-xl min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSubmit}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <Plus className="w-4 h-4 ms-1" />
              تسجيل النشاط
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Activity Card Component
function ActivityCard({ activity, isLast }: { activity: CrmActivity; isLast: boolean }) {
  const colors = activityColors[activity.type] || activityColors.note

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className={cn(
          'absolute right-5 top-12 bottom-0 w-0.5',
          colors.line
        )} style={{ opacity: 0.3 }} />
      )}

      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10',
        colors.bg, colors.text
      )}>
        {activityIcons[activity.type]}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 p-4 rounded-xl border transition-colors hover:shadow-md',
        colors.bg, colors.border
      )}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy">{activity.title}</span>
              <Badge variant="secondary" className={cn('text-xs', colors.text, colors.bg)}>
                {activityLabels[activity.type]}
              </Badge>
            </div>
            {activity.entityName && (
              <Link
                to={`/dashboard/crm/leads/${activity.entityId}`}
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1 mt-1"
              >
                {activity.entityType === 'lead' && <User className="w-3 h-3" />}
                {activity.entityType === 'contact' && <Users className="w-3 h-3" />}
                {activity.entityType === 'organization' && <Building className="w-3 h-3" />}
                {activity.entityName}
              </Link>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
              <DropdownMenuItem>تعديل</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {activity.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {activity.description}
          </p>
        )}

        {/* Call-specific details */}
        {activity.callData && (
          <div className="flex flex-wrap gap-3 mb-3">
            <Badge variant="outline" className="text-xs gap-1">
              {activity.callData.direction === 'outbound' ? (
                <><ArrowUp className="w-3 h-3" /> صادرة</>
              ) : (
                <><ArrowDown className="w-3 h-3" /> واردة</>
              )}
            </Badge>
            {activity.callData.duration && (
              <Badge variant="outline" className="text-xs gap-1">
                <Timer className="w-3 h-3" />
                {Math.floor(activity.callData.duration / 60)} دقيقة
              </Badge>
            )}
            {activity.callData.outcome && (
              <Badge variant="outline" className="text-xs">
                {activity.callData.outcome}
              </Badge>
            )}
          </div>
        )}

        {/* Meeting-specific details */}
        {activity.meetingData && (
          <div className="flex flex-wrap gap-3 mb-3">
            {activity.meetingData.location && (
              <Badge variant="outline" className="text-xs gap-1">
                <MapPin className="w-3 h-3" />
                {activity.meetingData.location}
              </Badge>
            )}
            {activity.meetingData.isVirtual && (
              <Badge variant="outline" className="text-xs gap-1">
                <Video className="w-3 h-3" />
                اجتماع افتراضي
              </Badge>
            )}
            {activity.meetingData.meetingLink && (
              <Badge variant="outline" className="text-xs gap-1">
                <Link2 className="w-3 h-3" />
                رابط الاجتماع
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(activity.createdAt), 'h:mm a', { locale: ar })}
            </span>
            {activity.performedBy && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {activity.performedBy.firstName} {activity.performedBy.lastName}
              </span>
            )}
          </div>
          <span>
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ar })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ActivitiesView() {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('week')
  const [searchQuery, setSearchQuery] = useState('')

  // API Params
  const params = useMemo(() => {
    const p: any = { limit: 100 }
    if (activeTypeFilter !== 'all') {
      p.types = activeTypeFilter
    }
    // Add date range filtering
    if (dateRange !== 'all') {
      const now = new Date()
      if (dateRange === 'today') {
        p.startDate = startOfDay(now).toISOString()
      } else if (dateRange === 'yesterday') {
        p.startDate = startOfDay(subDays(now, 1)).toISOString()
        p.endDate = startOfDay(now).toISOString()
      } else if (dateRange === 'week') {
        p.startDate = subDays(now, 7).toISOString()
      } else if (dateRange === 'month') {
        p.startDate = subDays(now, 30).toISOString()
      }
    }
    return p
  }, [activeTypeFilter, dateRange])

  // Fetch activities
  const { data: activitiesData, isLoading, isError, error, refetch } = useActivityTimeline(params)
  const { data: statsData } = useActivityStats()

  // Transform API data
  const activities = activitiesData || []
  const stats = statsData?.stats

  // Filter by search
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities
    const query = searchQuery.toLowerCase()
    return activities.filter((activity: CrmActivity) =>
      activity.title?.toLowerCase().includes(query) ||
      activity.description?.toLowerCase().includes(query) ||
      activity.entityName?.toLowerCase().includes(query)
    )
  }, [activities, searchQuery])

  // Group activities by date with better labels
  const groupedActivities = useMemo(() => {
    if (!filteredActivities.length) return {}

    return filteredActivities.reduce((groups: Record<string, { label: string; activities: CrmActivity[] }>, activity: CrmActivity) => {
      const date = format(new Date(activity.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        const activityDate = new Date(activity.createdAt)
        let label = format(activityDate, 'EEEE, d MMMM yyyy', { locale: ar })
        if (isToday(activityDate)) {
          label = 'اليوم - ' + format(activityDate, 'd MMMM', { locale: ar })
        } else if (isYesterday(activityDate)) {
          label = 'أمس - ' + format(activityDate, 'd MMMM', { locale: ar })
        }
        groups[date] = { label, activities: [] }
      }
      groups[date].activities.push(activity)
      return groups
    }, {})
  }, [filteredActivities])

  // Calculate activity distribution
  const activityDistribution = useMemo(() => {
    if (!stats?.byType) return []
    const total = stats.total || 1
    return stats.byType.map((t: any) => ({
      type: t._id as ActivityType,
      count: t.count,
      percentage: Math.round((t.count / total) * 100),
    }))
  }, [stats])

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: true },
  ]

  const typeFilters = [
    { id: 'all', label: 'الكل', icon: Activity },
    { id: 'call', label: 'مكالمات', icon: Phone },
    { id: 'email', label: 'بريد', icon: Mail },
    { id: 'meeting', label: 'اجتماعات', icon: Calendar },
    { id: 'whatsapp', label: 'واتساب', icon: MessageSquare },
    { id: 'note', label: 'ملاحظات', icon: FileText },
    { id: 'task', label: 'مهام', icon: CheckCircle2 },
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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Header */}
        <ProductivityHero badge="سجل الأنشطة" title="سجل الأنشطة" type="activities" hideButtons={true}>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] rounded-xl bg-white/10 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <QuickLogDialog
              trigger={
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg border-0">
                  <Plus className="ms-2 h-4 w-4" />
                  تسجيل نشاط
                </Button>
              }
            />
          </div>
        </ProductivityHero>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            title="إجمالي الأنشطة"
            value={stats?.total || 0}
            icon={Activity}
            change="+12%"
            changeType="up"
            color="blue"
          />
          <MetricCard
            title="مكتملة"
            value={stats?.completed || 0}
            icon={CheckCircle2}
            color="emerald"
          />
          <MetricCard
            title="مكالمات"
            value={stats?.byType?.find((t: any) => t._id === 'call')?.count || 0}
            icon={Phone}
            color="blue"
          />
          <MetricCard
            title="اجتماعات"
            value={stats?.byType?.find((t: any) => t._id === 'meeting')?.count || 0}
            icon={Calendar}
            color="purple"
          />
          <MetricCard
            title="بريد"
            value={stats?.byType?.find((t: any) => t._id === 'email')?.count || 0}
            icon={Mail}
            color="purple"
          />
          <MetricCard
            title="واتساب"
            value={stats?.byType?.find((t: any) => t._id === 'whatsapp')?.count || 0}
            icon={MessageSquare}
            color="emerald"
          />
        </div>

        {/* Activity Distribution */}
        {activityDistribution.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                توزيع الأنشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 h-6">
                {activityDistribution.map((item) => {
                  const colors = activityColors[item.type]
                  return (
                    <div
                      key={item.type}
                      className={cn('rounded-full transition-all hover:opacity-80', colors?.line || 'bg-slate-400')}
                      style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      title={`${activityLabels[item.type]}: ${item.count} (${item.percentage}%)`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {activityDistribution.slice(0, 5).map((item) => {
                  const colors = activityColors[item.type]
                  return (
                    <div key={item.type} className="flex items-center gap-2 text-xs">
                      <span className={cn('w-2 h-2 rounded-full', colors?.line || 'bg-slate-400')} />
                      <span className="text-slate-600">{activityLabels[item.type]}</span>
                      <span className="text-slate-400">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {typeFilters.map((filter) => {
                const Icon = filter.icon
                return (
                  <Button
                    key={filter.id}
                    size="sm"
                    onClick={() => setActiveTypeFilter(filter.id)}
                    className={cn(
                      'rounded-full px-4 gap-2 transition-all',
                      activeTypeFilter === filter.id
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border shadow-sm'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </Button>
                )
              })}
            </div>

            {/* Activities Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-16 w-full rounded-xl" />
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
                    className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    لا توجد أنشطة
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'سيتم عرض الأنشطة هنا عند إضافتها'}
                  </p>
                  <QuickLogDialog
                    trigger={
                      <Button className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                        <Plus className="ms-2 h-4 w-4" />
                        تسجيل أول نشاط
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Success State - Timeline */}
              {!isLoading && !isError && Object.entries(groupedActivities).map(([date, group]) => (
                <div key={date} className="mb-8 last:mb-0">
                  {/* Date Header */}
                  <div className="sticky top-0 bg-gradient-to-l from-emerald-50 to-white px-4 py-2 rounded-xl font-semibold text-slate-700 mb-6 z-10 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    {group.label}
                    <Badge variant="secondary" className="me-auto">
                      {group.activities.length} نشاط
                    </Badge>
                  </div>

                  {/* Activities for this date */}
                  <div className="space-y-4 pr-2">
                    {group.activities.map((activity: CrmActivity, index: number) => (
                      <ActivityCard
                        key={activity._id}
                        activity={activity}
                        isLast={index === group.activities.length - 1}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <SalesSidebar context="activities" />
        </div>
      </Main>
    </>
  )
}
