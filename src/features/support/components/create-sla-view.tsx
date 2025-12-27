/**
 * Create SLA View
 * Comprehensive Service Level Agreement creation form
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Loader2,
  X,
  Clock,
  AlertCircle,
  Briefcase,
  Calendar,
  Users,
  Settings,
  CheckCircle2,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { SupportSidebar } from './support-sidebar'
import { useCreateSLA } from '@/hooks/use-support'
import { useTeamMembers } from '@/hooks/useUsers'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import type { TicketPriority, TicketType } from '@/types/support'

// ==================== CONSTANTS ====================

const PRIORITY_OPTIONS: { value: TicketPriority; label: string; labelEn: string; dotColor: string }[] = [
  { value: 'low', label: 'منخفضة', labelEn: 'Low', dotColor: 'bg-slate-400' },
  { value: 'medium', label: 'متوسطة', labelEn: 'Medium', dotColor: 'bg-blue-500' },
  { value: 'high', label: 'عالية', labelEn: 'High', dotColor: 'bg-orange-500' },
  { value: 'urgent', label: 'عاجلة', labelEn: 'Urgent', dotColor: 'bg-red-500' },
]

const TICKET_TYPES: { value: TicketType; label: string; labelEn: string }[] = [
  { value: 'question', label: 'سؤال', labelEn: 'Question' },
  { value: 'problem', label: 'مشكلة', labelEn: 'Problem' },
  { value: 'feature_request', label: 'طلب ميزة', labelEn: 'Feature Request' },
  { value: 'incident', label: 'حادثة', labelEn: 'Incident' },
  { value: 'service_request', label: 'طلب خدمة', labelEn: 'Service Request' },
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'الأحد', labelEn: 'Sunday' },
  { value: 1, label: 'الاثنين', labelEn: 'Monday' },
  { value: 2, label: 'الثلاثاء', labelEn: 'Tuesday' },
  { value: 3, label: 'الأربعاء', labelEn: 'Wednesday' },
  { value: 4, label: 'الخميس', labelEn: 'Thursday' },
  { value: 5, label: 'الجمعة', labelEn: 'Friday' },
  { value: 6, label: 'السبت', labelEn: 'Saturday' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط', labelEn: 'Active' },
  { value: 'inactive', label: 'غير نشط', labelEn: 'Inactive' },
]

// ==================== COMPONENT ====================

export function CreateSLAView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createSLA, isPending } = useCreateSLA()
  const { data: teamData } = useTeamMembers()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    priority: 'medium' as TicketPriority,
    firstResponseTime: '',
    resolutionTime: '',
    escalationTime: '',
    escalateTo: '',
    isDefault: false,
    applyToTicketTypes: [] as TicketType[],
    workingDays: [0, 1, 2, 3, 4] as number[], // Sunday to Thursday (default for Middle East)
    startTime: '09:00',
    endTime: '17:00',
    status: 'active' as 'active' | 'inactive',
  })

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle working days toggle
  const toggleWorkingDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort()
    }))
  }

  // Handle ticket types toggle
  const toggleTicketType = (type: TicketType) => {
    setFormData(prev => ({
      ...prev,
      applyToTicketTypes: prev.applyToTicketTypes.includes(type)
        ? prev.applyToTicketTypes.filter(t => t !== type)
        : [...prev.applyToTicketTypes, type]
    }))
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name.trim()) {
      return
    }

    if (!formData.firstResponseTime || Number(formData.firstResponseTime) <= 0) {
      return
    }

    if (!formData.resolutionTime || Number(formData.resolutionTime) <= 0) {
      return
    }

    // Build SLA data
    const slaData = {
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      priority: formData.priority,
      firstResponseMinutes: Number(formData.firstResponseTime) * 60, // Convert hours to minutes
      resolutionMinutes: Number(formData.resolutionTime) * 60, // Convert hours to minutes
      workingHours: {
        start: formData.startTime,
        end: formData.endTime,
      },
      workingDays: formData.workingDays,
      isDefault: formData.isDefault,
      status: formData.status,
      // Additional fields that may be used by extended backend
      supportType: formData.applyToTicketTypes.length > 0 ? formData.applyToTicketTypes.join(',') : undefined,
    } as any

    createSLA(slaData, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.support.sla.list })
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
    { title: 'الدعم الفني', href: ROUTES.dashboard.support.list, isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero
          badge="الدعم الفني"
          title="إنشاء اتفاقية مستوى الخدمة (SLA)"
          type="support"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>

              {/* BASIC INFO CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* SLA Name (English) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      اسم SLA (بالإنجليزية) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Enter SLA name in English"
                      className="rounded-xl border-slate-200"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>

                  {/* SLA Name (Arabic) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      اسم SLA (بالعربية)
                    </Label>
                    <Input
                      placeholder="أدخل اسم SLA بالعربية"
                      className="rounded-xl border-slate-200"
                      value={formData.nameAr}
                      onChange={(e) => handleChange('nameAr', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الوصف
                    </Label>
                    <Textarea
                      placeholder="اشرح تفاصيل اتفاقية مستوى الخدمة..."
                      className="min-h-[100px] rounded-xl border-slate-200"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الأولوية <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => handleChange('priority', v as TicketPriority)}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="اختر الأولوية" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", p.dotColor)} />
                              {p.label} ({p.labelEn})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* RESPONSE & RESOLUTION TIMES CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-emerald-500" />
                    أوقات الاستجابة والحل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Response Time */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        وقت الاستجابة الأولى (ساعات) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="مثال: 2"
                        className="rounded-xl border-slate-200"
                        value={formData.firstResponseTime}
                        onChange={(e) => handleChange('firstResponseTime', e.target.value)}
                        required
                      />
                      <p className="text-xs text-slate-500">
                        الوقت المتوقع للرد الأول على التذكرة
                      </p>
                    </div>

                    {/* Resolution Time */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        وقت الحل (ساعات) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="مثال: 24"
                        className="rounded-xl border-slate-200"
                        value={formData.resolutionTime}
                        onChange={(e) => handleChange('resolutionTime', e.target.value)}
                        required
                      />
                      <p className="text-xs text-slate-500">
                        الوقت المتوقع لحل التذكرة بالكامل
                      </p>
                    </div>
                  </div>

                  {/* Escalation Time */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      وقت التصعيد (ساعات)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="مثال: 4 (اختياري)"
                      className="rounded-xl border-slate-200"
                      value={formData.escalationTime}
                      onChange={(e) => handleChange('escalationTime', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      الوقت الذي يتم بعده تصعيد التذكرة تلقائياً
                    </p>
                  </div>

                  {/* Escalate To */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      التصعيد إلى
                    </Label>
                    <Select
                      value={formData.escalateTo}
                      onValueChange={(v) => handleChange('escalateTo', v)}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="اختر المستخدم (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- بدون تصعيد --</SelectItem>
                        {(teamData?.users ?? [])?.map((user: any) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.fullNameAr || user.fullName || user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      المستخدم الذي سيتم تصعيد التذكرة إليه عند تجاوز وقت التصعيد
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* BUSINESS HOURS CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    ساعات العمل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Working Days */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      أيام العمل
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DAYS_OF_WEEK.map((day) => (
                        <div
                          key={day.value}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer",
                            formData.workingDays.includes(day.value)
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => toggleWorkingDay(day.value)}
                        >
                          <Checkbox
                            checked={formData.workingDays.includes(day.value)}
                            onCheckedChange={() => toggleWorkingDay(day.value)}
                            className="pointer-events-none"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">
                              {day.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {day.labelEn}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        وقت البدء
                      </Label>
                      <Input
                        type="time"
                        className="rounded-xl border-slate-200"
                        value={formData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        وقت الانتهاء
                      </Label>
                      <Input
                        type="time"
                        className="rounded-xl border-slate-200"
                        value={formData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <strong>ملاحظة:</strong> سيتم احتساب أوقات الاستجابة والحل فقط خلال ساعات وأيام العمل المحددة.
                  </p>
                </CardContent>
              </Card>

              {/* APPLY TO TICKET TYPES CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-500" />
                    تطبيق على أنواع التذاكر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">
                    اختر أنواع التذاكر التي سيتم تطبيق هذه الاتفاقية عليها (اتركها فارغة للتطبيق على جميع الأنواع)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TICKET_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                          formData.applyToTicketTypes.includes(type.value)
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => toggleTicketType(type.value)}
                      >
                        <Checkbox
                          checked={formData.applyToTicketTypes.includes(type.value)}
                          onCheckedChange={() => toggleTicketType(type.value)}
                          className="pointer-events-none"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">
                            {type.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {type.labelEn}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SETTINGS CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    الإعدادات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Is Default */}
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 bg-slate-50">
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-slate-700 cursor-pointer">
                        تعيين كافتراضي
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        استخدام هذه الاتفاقية كإعداد افتراضي للتذاكر الجديدة
                      </p>
                    </div>
                    <Switch
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => handleChange('isDefault', checked)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الحالة
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => handleChange('status', v as 'active' | 'inactive')}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={cn(
                                "w-4 h-4",
                                s.value === 'active' ? "text-emerald-500" : "text-slate-400"
                              )} />
                              {s.label} ({s.labelEn})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Link to={ROUTES.dashboard.support.sla.list}>
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy rounded-xl">
                    <X className="ms-2 h-4 w-4" aria-hidden="true" />
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={isPending || !formData.name.trim() || !formData.firstResponseTime || !formData.resolutionTime}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      حفظ SLA
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Widgets */}
          <SupportSidebar />
        </div>
      </Main>
    </>
  )
}
