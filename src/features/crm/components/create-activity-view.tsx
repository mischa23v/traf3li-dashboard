import { useState } from 'react'
import {
  ArrowRight, Save, User,
  FileText, Loader2, Calendar,
  Phone, Mail, MessageSquare, Video,
  Clock, Users, MapPin, ChevronDown, ChevronUp,
  Building2, AlertCircle, Globe, Eye, Link2,
  DollarSign, Bell, CalendarClock, MapPinned
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { SalesSidebar } from './sales-sidebar'
import { useCreateActivity, useLeads } from '@/hooks/useCrm'
import type { ActivityType, ActivityEntityType } from '@/types/crm'
import { cn } from '@/lib/utils'

// Firm Size Type - Controls form complexity
type FirmSize = 'solo' | 'small' | 'medium' | 'large'

// Firm Size Options
const FIRM_SIZE_OPTIONS = [
  { value: 'solo' as FirmSize, label: 'محامي فردي', labelEn: 'Solo Practice', icon: User, description: 'ممارسة فردية' },
  { value: 'small' as FirmSize, label: 'مكتب صغير', labelEn: 'Small Firm (2-10)', icon: Users, description: '2-10 محامين' },
  { value: 'medium' as FirmSize, label: 'مكتب متوسط', labelEn: 'Medium Firm (11-50)', icon: Building2, description: '11-50 محامي' },
  { value: 'large' as FirmSize, label: 'شركة محاماة', labelEn: 'Large Firm (50+)', icon: Building2, description: '50+ محامي' },
]

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: typeof Phone }[] = [
  { value: 'call', label: 'مكالمة', icon: Phone },
  { value: 'email', label: 'بريد إلكتروني', icon: Mail },
  { value: 'sms', label: 'رسالة SMS', icon: MessageSquare },
  { value: 'whatsapp', label: 'واتساب', icon: MessageSquare },
  { value: 'meeting', label: 'اجتماع', icon: Video },
  { value: 'note', label: 'ملاحظة', icon: FileText },
  { value: 'task', label: 'مهمة', icon: Clock },
]

const ENTITY_TYPES: { value: ActivityEntityType; label: string }[] = [
  { value: 'lead', label: 'عميل محتمل' },
  { value: 'client', label: 'عميل' },
  { value: 'contact', label: 'جهة اتصال' },
  { value: 'case', label: 'قضية' },
]

const CALL_DIRECTIONS = [
  { value: 'outbound', label: 'صادرة' },
  { value: 'inbound', label: 'واردة' },
]

const MEETING_TYPES = [
  { value: 'in_person', label: 'حضوري' },
  { value: 'video', label: 'فيديو' },
  { value: 'phone', label: 'هاتفي' },
  { value: 'consultation', label: 'استشارة' },
]

const ACTIVITY_STATUS = [
  { value: 'scheduled', label: 'مجدول' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'منخفضة', color: 'text-slate-500' },
  { value: 'medium', label: 'متوسطة', color: 'text-blue-500' },
  { value: 'high', label: 'عالية', color: 'text-orange-500' },
  { value: 'urgent', label: 'عاجلة', color: 'text-red-500' },
]

const TIME_ZONES = [
  { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
  { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
  { value: 'Asia/Kuwait', label: 'الكويت (GMT+3)' },
  { value: 'Asia/Bahrain', label: 'البحرين (GMT+3)' },
  { value: 'Asia/Qatar', label: 'قطر (GMT+3)' },
]

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'بدون تكرار' },
  { value: 'daily', label: 'يومي' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'biweekly', label: 'كل أسبوعين' },
  { value: 'monthly', label: 'شهري' },
  { value: 'quarterly', label: 'ربع سنوي' },
  { value: 'yearly', label: 'سنوي' },
]

const REMINDER_OPTIONS = [
  { value: 'none', label: 'بدون تذكير' },
  { value: '15min', label: 'قبل 15 دقيقة' },
  { value: '30min', label: 'قبل 30 دقيقة' },
  { value: '1hour', label: 'قبل ساعة' },
  { value: '1day', label: 'قبل يوم' },
  { value: '1week', label: 'قبل أسبوع' },
]

const LOCATION_TYPES = [
  { value: 'in_person', label: 'حضوري' },
  { value: 'phone', label: 'هاتفي' },
  { value: 'video_call', label: 'اجتماع فيديو' },
  { value: 'online', label: 'عبر الإنترنت' },
]

const CALL_OUTCOMES = [
  { value: 'connected', label: 'تم التواصل' },
  { value: 'no_answer', label: 'لم يرد' },
  { value: 'busy', label: 'مشغول' },
  { value: 'voicemail', label: 'بريد صوتي' },
  { value: 'left_message', label: 'ترك رسالة' },
  { value: 'wrong_number', label: 'رقم خاطئ' },
]

const MEETING_OUTCOMES = [
  { value: 'held', label: 'تم عقده' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'rescheduled', label: 'معاد جدولته' },
  { value: 'no_show', label: 'لم يحضر' },
  { value: 'postponed', label: 'مؤجل' },
]

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'خاص' },
  { value: 'team', label: 'الفريق' },
  { value: 'public', label: 'عام' },
]

const CALENDAR_SYNC_OPTIONS = [
  { value: 'none', label: 'بدون مزامنة' },
  { value: 'google', label: 'Google Calendar' },
  { value: 'outlook', label: 'Outlook Calendar' },
  { value: 'both', label: 'كلاهما' },
]

const UTBMS_CODES = [
  { value: 'L110', label: 'L110 - مؤتمر قضائي' },
  { value: 'L120', label: 'L120 - بحث قانوني' },
  { value: 'L130', label: 'L130 - صياغة' },
  { value: 'L140', label: 'L140 - مراجعة مستندات' },
  { value: 'L210', label: 'L210 - استشارة عميل' },
]

export function CreateActivityView() {
  const navigate = useNavigate()
  const createActivityMutation = useCreateActivity()
  const { data: leadsData } = useLeads({})

  // Firm size selection - controls visibility of organizational fields
  const [firmSize, setFirmSize] = useState<FirmSize>('solo')
  const [showOrgFields, setShowOrgFields] = useState(false)

  // Advanced view toggle
  const [advancedView, setAdvancedView] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    entityType: 'lead' as ActivityEntityType,
    entityId: '',
    title: '',
    description: '',
    status: 'completed',
    // Enhanced Basic Info
    dueDate: '',
    dueTime: '',
    durationHours: 0,
    durationMinutes: 0,
    priority: 'medium',
    // Call data
    callDirection: 'outbound',
    phoneNumber: '',
    callDuration: 0,
    callOutcome: '',
    // Meeting data
    meetingType: 'in_person',
    location: '',
    scheduledStart: '',
    scheduledEnd: '',
    agenda: '',
    summary: '',
    // Email data
    emailSubject: '',
    emailTo: '',
    // Scheduling Section
    startDateTime: '',
    endDateTime: '',
    allDayEvent: false,
    timeZone: 'Asia/Riyadh',
    recurring: 'none',
    recurrenceEndDate: '',
    reminder: 'none',
    // Location Section
    locationType: 'in_person',
    addressLocation: '',
    meetingRoom: '',
    videoLink: '',
    dialInNumber: '',
    // Participants Section
    internalAttendees: [] as string[],
    externalParticipants: '',
    sendCalendarInvite: false,
    // Outcome Section
    callOutcomeAdvanced: '',
    meetingOutcome: '',
    nextSteps: '',
    followUpRequired: false,
    followUpDate: '',
    // Billing Section
    billable: false,
    billableHours: 0,
    hourlyRate: 0,
    activityCode: '',
    matterNumber: '',
    billingNotes: '',
    // Visibility Section
    visibility: 'private',
    showOnCalendar: true,
    markAsImportant: false,
    // Integration Section
    syncToCalendar: 'none',
    externalEventId: '',
  })

  // Section toggles
  const [showTypeSpecific, setShowTypeSpecific] = useState(true)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const activityData = {
      type: formData.type,
      entityType: formData.entityType,
      entityId: formData.entityId,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      // Call data
      ...(formData.type === 'call' && {
        callData: {
          direction: formData.callDirection as 'inbound' | 'outbound',
          phoneNumber: formData.phoneNumber || undefined,
          duration: formData.callDuration || undefined,
          outcome: formData.callOutcome || undefined,
        },
      }),
      // Meeting data
      ...(formData.type === 'meeting' && {
        meetingData: {
          meetingType: formData.meetingType,
          location: formData.location || undefined,
          scheduledStart: formData.scheduledStart || undefined,
          scheduledEnd: formData.scheduledEnd || undefined,
          agenda: formData.agenda || undefined,
          summary: formData.summary || undefined,
        },
      }),
      // Email data
      ...(formData.type === 'email' && {
        emailData: {
          subject: formData.emailSubject || undefined,
          to: formData.emailTo ? [formData.emailTo] : undefined,
        },
      }),
    }

    createActivityMutation.mutate(activityData, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.crm.activities.list })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'مسار المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'الإحالات', href: ROUTES.dashboard.crm.referrals.list, isActive: false },
    { title: 'سجل الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: true },
  ]

  const selectedType = ACTIVITY_TYPES.find(t => t.value === formData.type)
  const TypeIcon = selectedType?.icon || FileText

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero badge="إدارة النشاطات" title="تسجيل نشاط جديد" type="activities" listMode={true} hideButtons={true}>
          <Link to={ROUTES.dashboard.crm.activities.list}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* FIRM SIZE SELECTOR - Like Finance Module */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      نوع المكتب
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      اختر حجم مكتبك لتخصيص النموذج حسب احتياجاتك
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {FIRM_SIZE_OPTIONS.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFirmSize(option.value)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all text-center",
                              firmSize === option.value
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                            )}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium block">{option.label}</span>
                            <span className="text-xs text-slate-400 block mt-1">{option.description}</span>
                          </button>
                        )
                      })}
                    </div>
                    {firmSize !== 'solo' && (
                      <div className="mt-4 flex items-center gap-2">
                        <Switch
                          checked={showOrgFields}
                          onCheckedChange={setShowOrgFields}
                        />
                        <Label className="text-sm text-slate-600">إظهار الحقول التنظيمية المتقدمة</Label>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* BASIC/ADVANCED TOGGLE */}
                <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          advancedView ? "bg-blue-500 text-white" : "bg-white text-slate-600"
                        )}>
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {advancedView ? 'الوضع المتقدم' : 'الوضع الأساسي'}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {advancedView
                              ? 'عرض جميع الخيارات المتقدمة والحقول التفصيلية'
                              : 'عرض الحقول الأساسية فقط'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={advancedView}
                        onCheckedChange={setAdvancedView}
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Type Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
                    نوع النشاط
                  </h3>

                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                    {ACTIVITY_TYPES.map(type => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleChange('type', type.value)}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-slate-200 hover:border-blue-200 text-slate-600'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Entity Selection */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
                    مرتبط بـ
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        نوع السجل
                      </label>
                      <Select value={formData.entityType} onValueChange={(value) => handleChange('entityType', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENTITY_TYPES.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.entityType === 'lead' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          العميل المحتمل
                        </label>
                        <Select value={formData.entityId} onValueChange={(value) => handleChange('entityId', value)}>
                          <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                            <SelectValue placeholder="اختر عميل محتمل" />
                          </SelectTrigger>
                          <SelectContent>
                            {leadsData?.data?.map((lead) => (
                              <SelectItem key={lead._id} value={lead._id}>
                                {lead.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Basic Info */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      العنوان
                    </label>
                    <Input
                      placeholder="عنوان النشاط..."
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الحالة
                      </label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_STATUS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        الأولوية
                      </label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className={option.color}>{option.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        تاريخ الاستحقاق
                      </label>
                      <Input
                        type="date"
                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        وقت الاستحقاق
                      </label>
                      <Input
                        type="time"
                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.dueTime}
                        onChange={(e) => handleChange('dueTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        المدة - ساعات
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        placeholder="0"
                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.durationHours || ''}
                        onChange={(e) => handleChange('durationHours', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        المدة - دقائق
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        value={formData.durationMinutes || ''}
                        onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      الوصف
                    </label>
                    <Textarea
                      placeholder="تفاصيل النشاط..."
                      className="min-h-[100px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                </div>

                {/* ORGANIZATIONAL FIELDS - Only for non-solo firms */}
                {firmSize !== 'solo' && (
                  <Collapsible open={showOrgFields} onOpenChange={setShowOrgFields}>
                    <Card className="border-0 shadow-sm border-s-4 border-s-blue-500">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                              الحقول التنظيمية المتقدمة
                            </span>
                            <ChevronDown className={cn("w-5 h-5 text-slate-600 transition-transform", showOrgFields && "rotate-180")} />
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-6 pt-0">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">القسم / الفريق</label>
                            <Input
                              placeholder="مثال: قسم التقاضي"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">رقم المشروع / القضية</label>
                            <Input
                              placeholder="مثال: CASE-2024-001"
                              className="rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Type-specific Fields */}
                <Collapsible open={showTypeSpecific} onOpenChange={setShowTypeSpecific}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <TypeIcon className="w-5 h-5 text-blue-500" />
                          تفاصيل {selectedType?.label}
                        </h3>
                        {showTypeSpecific ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        {/* Call Fields */}
                        {formData.type === 'call' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الاتجاه</label>
                                <Select value={formData.callDirection} onValueChange={(value) => handleChange('callDirection', value)}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CALL_DIRECTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
                                <Input
                                  placeholder="+966 5x xxx xxxx"
                                  className="rounded-xl"
                                  dir="ltr"
                                  value={formData.phoneNumber}
                                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">المدة (دقائق)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="15"
                                  className="rounded-xl"
                                  value={formData.callDuration || ''}
                                  onChange={(e) => handleChange('callDuration', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">النتيجة</label>
                                <Input
                                  placeholder="تم الاتفاق على موعد"
                                  className="rounded-xl"
                                  value={formData.callOutcome}
                                  onChange={(e) => handleChange('callOutcome', e.target.value)}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Meeting Fields */}
                        {formData.type === 'meeting' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">نوع الاجتماع</label>
                                <Select value={formData.meetingType} onValueChange={(value) => handleChange('meetingType', value)}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {MEETING_TYPES.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-500" aria-hidden="true" />
                                  الموقع
                                </label>
                                <Input
                                  placeholder="مكتب المحاماة"
                                  className="rounded-xl"
                                  value={formData.location}
                                  onChange={(e) => handleChange('location', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">وقت البداية</label>
                                <Input
                                  type="datetime-local"
                                  className="rounded-xl"
                                  value={formData.scheduledStart}
                                  onChange={(e) => handleChange('scheduledStart', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">وقت النهاية</label>
                                <Input
                                  type="datetime-local"
                                  className="rounded-xl"
                                  value={formData.scheduledEnd}
                                  onChange={(e) => handleChange('scheduledEnd', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">جدول الأعمال</label>
                              <Textarea
                                placeholder="نقاط الاجتماع..."
                                className="min-h-[80px] rounded-xl"
                                value={formData.agenda}
                                onChange={(e) => handleChange('agenda', e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {/* Email Fields */}
                        {formData.type === 'email' && (
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">الموضوع</label>
                              <Input
                                placeholder="موضوع الرسالة"
                                className="rounded-xl"
                                value={formData.emailSubject}
                                onChange={(e) => handleChange('emailSubject', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">إلى</label>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                className="rounded-xl"
                                dir="ltr"
                                value={formData.emailTo}
                                onChange={(e) => handleChange('emailTo', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Note/SMS/WhatsApp - just description is enough */}
                        {['note', 'sms', 'whatsapp', 'task'].includes(formData.type) && (
                          <p className="text-sm text-slate-500">
                            استخدم حقل الوصف أعلاه لتسجيل تفاصيل {selectedType?.label}
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* ADVANCED SECTIONS - Only visible in advanced mode */}
                {advancedView && (
                  <div className="border-t border-slate-100 pt-6">
                    <Accordion type="multiple" className="space-y-4">

                      {/* Scheduling Section */}
                      <AccordionItem value="scheduling" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-purple-500" />
                            <span className="font-bold text-slate-800">الجدولة والتكرار</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">تاريخ ووقت البداية</label>
                              <Input
                                type="datetime-local"
                                className="rounded-xl"
                                value={formData.startDateTime}
                                onChange={(e) => handleChange('startDateTime', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">تاريخ ووقت النهاية</label>
                              <Input
                                type="datetime-local"
                                className="rounded-xl"
                                value={formData.endDateTime}
                                onChange={(e) => handleChange('endDateTime', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Switch
                              checked={formData.allDayEvent}
                              onCheckedChange={(checked) => handleChange('allDayEvent', checked)}
                            />
                            <Label className="text-sm text-slate-700">حدث يوم كامل</Label>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              المنطقة الزمنية
                            </label>
                            <Select value={formData.timeZone} onValueChange={(value) => handleChange('timeZone', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_ZONES.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">التكرار</label>
                              <Select value={formData.recurring} onValueChange={(value) => handleChange('recurring', value)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {RECURRENCE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {formData.recurring !== 'none' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">تاريخ انتهاء التكرار</label>
                                <Input
                                  type="date"
                                  className="rounded-xl"
                                  value={formData.recurrenceEndDate}
                                  onChange={(e) => handleChange('recurrenceEndDate', e.target.value)}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Bell className="w-4 h-4 text-yellow-500" />
                              التذكير
                            </label>
                            <Select value={formData.reminder} onValueChange={(value) => handleChange('reminder', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {REMINDER_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Location Section */}
                      <AccordionItem value="location" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <MapPinned className="w-5 h-5 text-green-500" />
                            <span className="font-bold text-slate-800">الموقع وتفاصيل الاجتماع</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">نوع الموقع</label>
                            <Select value={formData.locationType} onValueChange={(value) => handleChange('locationType', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LOCATION_TYPES.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">العنوان / الموقع</label>
                            <Input
                              placeholder="الرياض، المملكة العربية السعودية"
                              className="rounded-xl"
                              value={formData.addressLocation}
                              onChange={(e) => handleChange('addressLocation', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">قاعة الاجتماع</label>
                            <Input
                              placeholder="قاعة المؤتمرات A"
                              className="rounded-xl"
                              value={formData.meetingRoom}
                              onChange={(e) => handleChange('meetingRoom', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">رابط الفيديو (Zoom/Teams/Meet)</label>
                            <Input
                              placeholder="https://zoom.us/j/..."
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.videoLink}
                              onChange={(e) => handleChange('videoLink', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">رقم الاتصال الهاتفي</label>
                            <Input
                              placeholder="+966 11 xxx xxxx"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.dialInNumber}
                              onChange={(e) => handleChange('dialInNumber', e.target.value)}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Participants Section */}
                      <AccordionItem value="participants" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="font-bold text-slate-800">المشاركون والحضور</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الحضور الداخليون</label>
                            <Textarea
                              placeholder="اختر من الموظفين... (قريباً: Multi-select)"
                              className="min-h-[80px] rounded-xl"
                              value={formData.internalAttendees.join(', ')}
                              onChange={(e) => handleChange('internalAttendees', e.target.value.split(',').map(s => s.trim()))}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">المشاركون الخارجيون</label>
                            <Textarea
                              placeholder="البريد الإلكتروني مفصول بفواصل: email1@example.com, email2@example.com"
                              className="min-h-[80px] rounded-xl"
                              dir="ltr"
                              value={formData.externalParticipants}
                              onChange={(e) => handleChange('externalParticipants', e.target.value)}
                            />
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Switch
                              checked={formData.sendCalendarInvite}
                              onCheckedChange={(checked) => handleChange('sendCalendarInvite', checked)}
                            />
                            <Label className="text-sm text-slate-700">إرسال دعوة تقويم</Label>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Outcome Section */}
                      <AccordionItem value="outcome" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <span className="font-bold text-slate-800">النتيجة والمتابعة</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          {formData.type === 'call' && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">نتيجة المكالمة</label>
                              <Select value={formData.callOutcomeAdvanced} onValueChange={(value) => handleChange('callOutcomeAdvanced', value)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="اختر النتيجة..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {CALL_OUTCOMES.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {formData.type === 'meeting' && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">نتيجة الاجتماع</label>
                              <Select value={formData.meetingOutcome} onValueChange={(value) => handleChange('meetingOutcome', value)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="اختر النتيجة..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEETING_OUTCOMES.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الخطوات التالية</label>
                            <Textarea
                              placeholder="اكتب الخطوات والإجراءات المطلوبة..."
                              className="min-h-[100px] rounded-xl"
                              value={formData.nextSteps}
                              onChange={(e) => handleChange('nextSteps', e.target.value)}
                            />
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Switch
                              checked={formData.followUpRequired}
                              onCheckedChange={(checked) => handleChange('followUpRequired', checked)}
                            />
                            <Label className="text-sm text-slate-700">يتطلب متابعة</Label>
                          </div>

                          {formData.followUpRequired && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">تاريخ المتابعة</label>
                              <Input
                                type="date"
                                className="rounded-xl"
                                value={formData.followUpDate}
                                onChange={(e) => handleChange('followUpDate', e.target.value)}
                              />
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Billing Section - Law Firm */}
                      <AccordionItem value="billing" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-slate-800">الفوترة والمحاسبة</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                            <Switch
                              checked={formData.billable}
                              onCheckedChange={(checked) => handleChange('billable', checked)}
                            />
                            <Label className="text-sm text-slate-700 font-medium">نشاط قابل للفوترة</Label>
                          </div>

                          {formData.billable && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700">الساعات القابلة للفوترة</label>
                                  <Input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    placeholder="0.00"
                                    className="rounded-xl"
                                    value={formData.billableHours || ''}
                                    onChange={(e) => handleChange('billableHours', parseFloat(e.target.value) || 0)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700">السعر بالساعة (ريال)</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="rounded-xl"
                                    value={formData.hourlyRate || ''}
                                    onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">رمز النشاط (UTBMS)</label>
                                <Select value={formData.activityCode} onValueChange={(value) => handleChange('activityCode', value)}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="اختر رمز النشاط..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UTBMS_CODES.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">رقم الملف / القضية</label>
                                <Input
                                  placeholder="MATTER-2024-001"
                                  className="rounded-xl"
                                  dir="ltr"
                                  value={formData.matterNumber}
                                  onChange={(e) => handleChange('matterNumber', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">ملاحظات الفوترة</label>
                                <Textarea
                                  placeholder="ملاحظات للفاتورة..."
                                  className="min-h-[80px] rounded-xl"
                                  value={formData.billingNotes}
                                  onChange={(e) => handleChange('billingNotes', e.target.value)}
                                />
                              </div>

                              {formData.billableHours > 0 && formData.hourlyRate > 0 && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">المبلغ الإجمالي:</span>
                                    <span className="text-lg font-bold text-emerald-600">
                                      {(formData.billableHours * formData.hourlyRate).toFixed(2)} ريال
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </AccordionContent>
                      </AccordionItem>

                      {/* Visibility Section */}
                      <AccordionItem value="visibility" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-slate-800">الخصوصية والرؤية</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">مستوى الرؤية</label>
                            <Select value={formData.visibility} onValueChange={(value) => handleChange('visibility', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {VISIBILITY_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Switch
                              checked={formData.showOnCalendar}
                              onCheckedChange={(checked) => handleChange('showOnCalendar', checked)}
                            />
                            <Label className="text-sm text-slate-700">إظهار في التقويم</Label>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                            <Switch
                              checked={formData.markAsImportant}
                              onCheckedChange={(checked) => handleChange('markAsImportant', checked)}
                            />
                            <Label className="text-sm text-slate-700">تحديد كمهم</Label>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Integration Section */}
                      <AccordionItem value="integration" className="border border-slate-200 rounded-xl px-6 bg-white shadow-sm">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-cyan-500" />
                            <span className="font-bold text-slate-800">التكامل مع التقويمات</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">المزامنة مع التقويم</label>
                            <Select value={formData.syncToCalendar} onValueChange={(value) => handleChange('syncToCalendar', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CALENDAR_SYNC_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">معرّف الحدث الخارجي</label>
                            <Input
                              placeholder="يتم إنشاؤه تلقائياً..."
                              className="rounded-xl bg-slate-50"
                              dir="ltr"
                              value={formData.externalEventId}
                              onChange={(e) => handleChange('externalEventId', e.target.value)}
                              readOnly
                            />
                            <p className="text-xs text-slate-500">هذا الحقل للقراءة فقط ويتم ملؤه تلقائياً بعد المزامنة</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                    </Accordion>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Link to={ROUTES.dashboard.crm.activities.list}>
                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                      إلغاء
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-blue-500/20"
                    disabled={createActivityMutation.isPending}
                  >
                    {createActivityMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" aria-hidden="true" />
                        حفظ النشاط
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <SalesSidebar context="activities" />
        </div>
      </Main>
    </>
  )
}
