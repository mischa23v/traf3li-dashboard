import { useState } from 'react'
import {
  ArrowRight, Save, User,
  FileText, Loader2, Calendar,
  Phone, Mail, MessageSquare, Video,
  Clock, Users, MapPin, ChevronDown, ChevronUp
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Link, useNavigate } from '@tanstack/react-router'
import { SalesSidebar } from './sales-sidebar'
import { useCreateActivity, useLeads } from '@/hooks/useCrm'
import type { ActivityType, ActivityEntityType } from '@/types/crm'

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

export function CreateActivityView() {
  const navigate = useNavigate()
  const createActivityMutation = useCreateActivity()
  const { data: leadsData } = useLeads({})

  // Form state
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    entityType: 'lead' as ActivityEntityType,
    entityId: '',
    title: '',
    description: '',
    status: 'completed',
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
        navigate({ to: '/dashboard/crm/activities' })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: true },
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero badge="إدارة النشاطات" title="تسجيل نشاط جديد" type="activities" listMode={true} hideButtons={true}>
          <Link to="/dashboard/crm/activities">
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
                {/* Activity Type Selection */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
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
                    <Users className="w-5 h-5 text-blue-500" />
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
                          العميل المحتمل <span className="text-red-500">*</span>
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

                {/* Basic Info */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      العنوان <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="عنوان النشاط..."
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
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

                {/* Type-specific Fields */}
                <Collapsible open={showTypeSpecific} onOpenChange={setShowTypeSpecific}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <TypeIcon className="w-5 h-5 text-blue-500" />
                          تفاصيل {selectedType?.label}
                        </h3>
                        {showTypeSpecific ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                                  <MapPin className="w-4 h-4 text-blue-500" />
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

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Link to="/dashboard/crm/activities">
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
                        <Save className="w-4 h-4" />
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
