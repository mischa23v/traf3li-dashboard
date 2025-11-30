import { useState } from 'react'
import {
  ArrowRight, Save, Calendar, User,
  Flag, FileText, Briefcase, Users, Loader2,
  Plus, X, Phone, Mail, Building, MapPin,
  DollarSign, Target, ChevronDown, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { CrmSidebar } from './crm-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateLead, usePipelines } from '@/hooks/useCrm'
import { cn } from '@/lib/utils'
import type { LeadStatus, LeadSource } from '@/types/crm'

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'جديد', color: 'bg-blue-500' },
  { value: 'contacted', label: 'تم التواصل', color: 'bg-purple-500' },
  { value: 'qualified', label: 'مؤهل', color: 'bg-emerald-500' },
  { value: 'proposal', label: 'عرض سعر', color: 'bg-orange-500' },
  { value: 'negotiation', label: 'تفاوض', color: 'bg-yellow-500' },
]

const SOURCE_OPTIONS: { value: LeadSource['type']; label: string }[] = [
  { value: 'website', label: 'الموقع الإلكتروني' },
  { value: 'referral', label: 'إحالة' },
  { value: 'social_media', label: 'وسائل التواصل' },
  { value: 'advertising', label: 'إعلان' },
  { value: 'cold_call', label: 'اتصال مباشر' },
  { value: 'walk_in', label: 'زيارة شخصية' },
  { value: 'event', label: 'فعالية' },
  { value: 'other', label: 'أخرى' },
]

const BUDGET_OPTIONS = [
  { value: 'unknown', label: 'غير محدد' },
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
  { value: 'premium', label: 'ممتازة' },
]

const AUTHORITY_OPTIONS = [
  { value: 'unknown', label: 'غير محدد' },
  { value: 'researcher', label: 'باحث' },
  { value: 'influencer', label: 'مؤثر' },
  { value: 'decision_maker', label: 'صانع قرار' },
]

const NEED_OPTIONS = [
  { value: 'unknown', label: 'غير محدد' },
  { value: 'exploring', label: 'استكشاف' },
  { value: 'planning', label: 'تخطيط' },
  { value: 'urgent', label: 'عاجلة' },
]

const TIMELINE_OPTIONS = [
  { value: 'unknown', label: 'غير محدد' },
  { value: 'immediate', label: 'فوري' },
  { value: 'this_month', label: 'هذا الشهر' },
  { value: 'this_quarter', label: 'هذا الربع' },
  { value: 'this_year', label: 'هذا العام' },
  { value: 'no_timeline', label: 'بدون جدول' },
]

const URGENCY_OPTIONS = [
  { value: 'low', label: 'منخفضة' },
  { value: 'normal', label: 'عادية' },
  { value: 'high', label: 'عالية' },
  { value: 'urgent', label: 'عاجلة' },
]

export function CreateLeadView() {
  const navigate = useNavigate()
  const createLeadMutation = useCreateLead()
  const { data: pipelinesData } = usePipelines()

  // Form state
  const [formData, setFormData] = useState({
    // Basic info
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    whatsapp: '',
    company: '',
    jobTitle: '',
    // Status
    status: 'new' as LeadStatus,
    pipelineId: '',
    stageId: '',
    // Source
    sourceType: '' as LeadSource['type'] | '',
    sourceDetails: '',
    referralSource: '',
    // Financial
    estimatedValue: 0,
    probability: 50,
    // Intake
    caseType: '',
    caseDescription: '',
    urgency: 'normal',
    // Address
    street: '',
    city: '',
    postalCode: '',
    country: 'المملكة العربية السعودية',
    // Qualification
    budget: 'unknown',
    authority: 'unknown',
    need: 'unknown',
    timeline: 'unknown',
    // Other
    notes: '',
    tags: [] as string[],
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')

  // Section toggles
  const [showQualification, setShowQualification] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [showIntake, setShowIntake] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const leadData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email || undefined,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      whatsapp: formData.whatsapp || undefined,
      company: formData.company || undefined,
      jobTitle: formData.jobTitle || undefined,
      status: formData.status,
      ...(formData.pipelineId && { pipelineId: formData.pipelineId }),
      ...(formData.stageId && { stageId: formData.stageId }),
      ...(formData.sourceType && {
        source: {
          type: formData.sourceType,
          details: formData.sourceDetails || undefined,
          referralSource: formData.referralSource || undefined,
        },
      }),
      ...(formData.estimatedValue > 0 && { estimatedValue: formData.estimatedValue }),
      probability: formData.probability,
      // Intake
      intake: {
        caseType: formData.caseType || undefined,
        caseDescription: formData.caseDescription || undefined,
        urgency: formData.urgency,
        conflictCheckCompleted: false,
      },
      // Address
      ...(formData.street && {
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      }),
      // Qualification
      qualification: {
        budget: formData.budget !== 'unknown' ? formData.budget : undefined,
        authority: formData.authority !== 'unknown' ? formData.authority : undefined,
        need: formData.need !== 'unknown' ? formData.need : undefined,
        timeline: formData.timeline !== 'unknown' ? formData.timeline : undefined,
      },
      notes: formData.notes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    createLeadMutation.mutate(leadData, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/leads' })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: true },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: false },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* HERO CARD */}
            <ProductivityHero badge="إدارة العملاء المحتملين" title="إضافة عميل محتمل جديد" type="leads" hideButtons={true}>
              <Link to="/dashboard/crm/leads">
                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </ProductivityHero>

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    المعلومات الأساسية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم الأول <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="أحمد"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        اسم العائلة <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="الشمري"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="+966 5x xxx xxxx"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        dir="ltr"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-500" />
                        الشركة
                      </label>
                      <Input
                        placeholder="اسم الشركة"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        المسمى الوظيفي
                      </label>
                      <Input
                        placeholder="مدير تنفيذي"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Source */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    الحالة والمصدر
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الحالة
                      </label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", option.color)} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        مصدر العميل
                      </label>
                      <Select value={formData.sourceType} onValueChange={(value) => handleChange('sourceType', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                          <SelectValue placeholder="كيف وصل إلينا؟" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.sourceType === 'referral' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        مصدر الإحالة
                      </label>
                      <Input
                        placeholder="اسم الشخص أو الجهة المحيلة"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={formData.referralSource}
                        onChange={(e) => handleChange('referralSource', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        القيمة المتوقعة (ر.س)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="50000"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={formData.estimatedValue || ''}
                        onChange={(e) => handleChange('estimatedValue', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        احتمالية التحويل (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        value={formData.probability}
                        onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <label className="text-sm font-medium text-slate-700">
                    الوسوم
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف وسم..."
                      className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 flex-1"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Intake Section */}
                <Collapsible open={showIntake} onOpenChange={setShowIntake}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-500" />
                          بيانات الاستقبال
                        </h3>
                        {showIntake ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              نوع القضية
                            </label>
                            <Input
                              placeholder="قضية تجارية"
                              className="rounded-xl"
                              value={formData.caseType}
                              onChange={(e) => handleChange('caseType', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                              الأولوية
                            </label>
                            <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {URGENCY_OPTIONS.map(option => (
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
                            وصف القضية
                          </label>
                          <Textarea
                            placeholder="اكتب وصفاً مختصراً للقضية..."
                            className="min-h-[100px] rounded-xl"
                            value={formData.caseDescription}
                            onChange={(e) => handleChange('caseDescription', e.target.value)}
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Qualification Section */}
                <Collapsible open={showQualification} onOpenChange={setShowQualification}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <Flag className="w-5 h-5 text-emerald-500" />
                          معايير التأهيل (BANT)
                        </h3>
                        {showQualification ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الميزانية (Budget)</label>
                            <Select value={formData.budget} onValueChange={(value) => handleChange('budget', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BUDGET_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">صلاحية القرار (Authority)</label>
                            <Select value={formData.authority} onValueChange={(value) => handleChange('authority', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AUTHORITY_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الحاجة (Need)</label>
                            <Select value={formData.need} onValueChange={(value) => handleChange('need', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {NEED_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الجدول الزمني (Timeline)</label>
                            <Select value={formData.timeline} onValueChange={(value) => handleChange('timeline', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIMELINE_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Address Section */}
                <Collapsible open={showAddress} onOpenChange={setShowAddress}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-emerald-500" />
                          العنوان
                        </h3>
                        {showAddress ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">الشارع</label>
                          <Input
                            placeholder="شارع الملك فهد"
                            className="rounded-xl"
                            value={formData.street}
                            onChange={(e) => handleChange('street', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">المدينة</label>
                            <Input
                              placeholder="الرياض"
                              className="rounded-xl"
                              value={formData.city}
                              onChange={(e) => handleChange('city', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الرمز البريدي</label>
                            <Input
                              placeholder="12345"
                              className="rounded-xl"
                              value={formData.postalCode}
                              onChange={(e) => handleChange('postalCode', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الدولة</label>
                            <Input
                              placeholder="المملكة العربية السعودية"
                              className="rounded-xl"
                              value={formData.country}
                              onChange={(e) => handleChange('country', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Notes */}
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    ملاحظات
                  </label>
                  <Textarea
                    placeholder="أي ملاحظات إضافية..."
                    className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Link to="/dashboard/crm/leads">
                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                      إلغاء
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                    disabled={createLeadMutation.isPending}
                  >
                    {createLeadMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        حفظ العميل المحتمل
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <CrmSidebar />
        </div>
      </Main>
    </>
  )
}
