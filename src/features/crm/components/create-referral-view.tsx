import { useState } from 'react'
import {
  ArrowRight, Save, User,
  FileText, Loader2, Plus, X, Phone, Mail,
  Building, DollarSign, Users,
  Percent, Star, Calendar,
  Award, TrendingUp, Shield,
  MessageSquare, Clock, CheckCircle,
  AlertTriangle, Briefcase, Scale,
  CreditCard, Receipt, Target,
  Gift, Handshake, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateReferral } from '@/hooks/useCrm'
import { cn } from '@/lib/utils'
import type { ReferralType, ReferralStatus, FeeType } from '@/types/crm'

// Referral Types
const TYPE_OPTIONS: { value: ReferralType; label: string; icon: any }[] = [
  { value: 'client', label: 'عميل', icon: User },
  { value: 'lawyer', label: 'محامي', icon: Scale },
  { value: 'law_firm', label: 'مكتب محاماة', icon: Building },
  { value: 'contact', label: 'جهة اتصال', icon: Users },
  { value: 'employee', label: 'موظف', icon: Briefcase },
  { value: 'partner', label: 'شريك', icon: Handshake },
  { value: 'organization', label: 'منظمة', icon: Building },
  { value: 'other', label: 'آخر', icon: User },
]

// Status Options
const STATUS_OPTIONS: { value: ReferralStatus; label: string; color: string }[] = [
  { value: 'active', label: 'نشط', color: 'bg-emerald-500' },
  { value: 'inactive', label: 'غير نشط', color: 'bg-slate-400' },
]

// Fee Type Options
const FEE_TYPE_OPTIONS: { value: FeeType; label: string; description: string }[] = [
  { value: 'none', label: 'لا يوجد', description: 'لا توجد عمولة' },
  { value: 'percentage', label: 'نسبة مئوية', description: 'نسبة من قيمة القضية' },
  { value: 'fixed', label: 'مبلغ ثابت', description: 'مبلغ ثابت لكل إحالة' },
  { value: 'tiered', label: 'متدرج', description: 'شرائح حسب القيمة' },
]

// Priority Options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'منخفض', color: 'bg-slate-400' },
  { value: 'normal', label: 'عادي', color: 'bg-blue-400' },
  { value: 'high', label: 'عالي', color: 'bg-orange-500' },
  { value: 'vip', label: 'VIP', color: 'bg-purple-500' },
]

// Relationship Type
const RELATIONSHIP_TYPES = [
  { value: 'new', label: 'جديد' },
  { value: 'occasional', label: 'عرضي' },
  { value: 'regular', label: 'منتظم' },
  { value: 'strategic', label: 'استراتيجي' },
  { value: 'preferred', label: 'مفضل' },
]

// Practice Areas
const PRACTICE_AREAS = [
  { value: 'corporate', label: 'قانون الشركات' },
  { value: 'litigation', label: 'التقاضي' },
  { value: 'labor', label: 'القانون العمالي' },
  { value: 'real_estate', label: 'العقارات' },
  { value: 'intellectual_property', label: 'الملكية الفكرية' },
  { value: 'criminal', label: 'القانون الجنائي' },
  { value: 'family', label: 'قانون الأسرة' },
  { value: 'banking', label: 'القانون المصرفي' },
  { value: 'arbitration', label: 'التحكيم' },
  { value: 'all', label: 'جميع المجالات' },
]

// Payment Terms
const PAYMENT_TERMS = [
  { value: 'on_retainer', label: 'عند التوكيل' },
  { value: 'on_settlement', label: 'عند التسوية' },
  { value: 'on_invoice', label: 'عند الفاتورة' },
  { value: 'net_30', label: '30 يوم' },
  { value: 'net_60', label: '60 يوم' },
  { value: 'net_90', label: '90 يوم' },
  { value: 'custom', label: 'مخصص' },
]

// Agreement Status
const AGREEMENT_STATUSES = [
  { value: 'none', label: 'لا يوجد', color: 'bg-slate-400' },
  { value: 'draft', label: 'مسودة', color: 'bg-yellow-500' },
  { value: 'sent', label: 'تم الإرسال', color: 'bg-blue-500' },
  { value: 'signed', label: 'موقعة', color: 'bg-emerald-500' },
  { value: 'expired', label: 'منتهية', color: 'bg-red-500' },
]

export function CreateReferralView() {
  const navigate = useNavigate()
  const createReferralMutation = useCreateReferral()

  // Form state
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    nameAr: '',
    type: 'client' as ReferralType,
    status: 'active' as ReferralStatus,
    priority: 'normal' as 'low' | 'normal' | 'high' | 'vip',
    relationshipType: 'new',

    // Contact info
    contactName: '',
    contactTitle: '',
    email: '',
    alternateEmail: '',
    phone: '',
    alternatePhone: '',
    whatsapp: '',
    preferredContactMethod: 'phone',

    // Organization info
    organizationName: '',
    website: '',
    address: '',
    city: '',
    country: 'المملكة العربية السعودية',

    // Referral preferences
    practiceAreas: [] as string[],
    minimumCaseValue: 0,
    maximumCaseValue: 0,
    preferredCaseTypes: '',
    exclusions: '',

    // Fee agreement
    hasFeeAgreement: false,
    feeType: 'none' as FeeType,
    feePercentage: 0,
    feeFixedAmount: 0,
    feeCap: 0,
    minimumFee: 0,
    paymentTerms: 'on_retainer',
    gracePeriodDays: 30,

    // Tiered fee structure
    tieredFees: [] as { minValue: number; maxValue: number; percentage: number }[],

    // Agreement details
    agreementStatus: 'none',
    agreementStartDate: '',
    agreementEndDate: '',
    agreementNotes: '',
    autoRenew: false,

    // Tracking
    trackCommissions: true,
    sendPaymentNotifications: true,
    sendReferralNotifications: true,

    // Banking info (for commission payments)
    bankName: '',
    accountHolderName: '',
    iban: '',
    swiftCode: '',

    // Mutual referrals
    isMutual: false,
    mutualAgreementDetails: '',

    // Other
    notes: '',
    internalNotes: '',
    tags: [] as string[],
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePracticeArea = (area: string) => {
    if (formData.practiceAreas.includes(area)) {
      handleChange('practiceAreas', formData.practiceAreas.filter(a => a !== area))
    } else {
      handleChange('practiceAreas', [...formData.practiceAreas, area])
    }
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

  const addTieredFee = () => {
    handleChange('tieredFees', [
      ...formData.tieredFees,
      { minValue: 0, maxValue: 0, percentage: 0 }
    ])
  }

  const updateTieredFee = (index: number, field: string, value: number) => {
    const updated = [...formData.tieredFees]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('tieredFees', updated)
  }

  const removeTieredFee = (index: number) => {
    handleChange('tieredFees', formData.tieredFees.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const referralData = {
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      relationshipType: formData.relationshipType,
      // Contact
      contact: {
        name: formData.contactName || undefined,
        title: formData.contactTitle || undefined,
        email: formData.email || undefined,
        alternateEmail: formData.alternateEmail || undefined,
        phone: formData.phone || undefined,
        alternatePhone: formData.alternatePhone || undefined,
        whatsapp: formData.whatsapp || undefined,
        preferredContactMethod: formData.preferredContactMethod,
      },
      // Organization
      organization: {
        name: formData.organizationName || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country,
      },
      // Preferences
      preferences: {
        practiceAreas: formData.practiceAreas.length > 0 ? formData.practiceAreas : undefined,
        minimumCaseValue: formData.minimumCaseValue || undefined,
        maximumCaseValue: formData.maximumCaseValue || undefined,
        preferredCaseTypes: formData.preferredCaseTypes || undefined,
        exclusions: formData.exclusions || undefined,
      },
      // Fee agreement
      hasFeeAgreement: formData.hasFeeAgreement,
      feeType: formData.hasFeeAgreement ? formData.feeType : 'none',
      ...(formData.hasFeeAgreement && {
        feeDetails: {
          percentage: formData.feeType === 'percentage' ? formData.feePercentage : undefined,
          fixedAmount: formData.feeType === 'fixed' ? formData.feeFixedAmount : undefined,
          cap: formData.feeCap || undefined,
          minimumFee: formData.minimumFee || undefined,
          paymentTerms: formData.paymentTerms,
          gracePeriodDays: formData.gracePeriodDays,
          tieredFees: formData.feeType === 'tiered' ? formData.tieredFees : undefined,
        },
      }),
      // Agreement
      agreement: {
        status: formData.agreementStatus,
        startDate: formData.agreementStartDate || undefined,
        endDate: formData.agreementEndDate || undefined,
        notes: formData.agreementNotes || undefined,
        autoRenew: formData.autoRenew,
      },
      // Tracking
      tracking: {
        commissions: formData.trackCommissions,
        paymentNotifications: formData.sendPaymentNotifications,
        referralNotifications: formData.sendReferralNotifications,
      },
      // Banking
      ...(formData.bankName && {
        banking: {
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName || undefined,
          iban: formData.iban || undefined,
          swiftCode: formData.swiftCode || undefined,
        },
      }),
      // Mutual
      isMutual: formData.isMutual,
      mutualAgreementDetails: formData.mutualAgreementDetails || undefined,
      // Other
      notes: formData.notes || undefined,
      internalNotes: formData.internalNotes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    createReferralMutation.mutate(referralData, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.crm.referrals.list })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'مسار المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'الإحالات', href: ROUTES.dashboard.crm.referrals.list, isActive: true },
    { title: 'سجل الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero badge="إدارة مصادر الإحالة" title="إضافة مصدر إحالة جديد" type="referrals" listMode={true} hideButtons={true}>
          <Link to={ROUTES.dashboard.crm.referrals.list}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Info Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" aria-hidden="true" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم (بالإنجليزية)
                      </label>
                      <Input
                        placeholder="Ahmed Law Firm"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم (بالعربية)
                      </label>
                      <Input
                        placeholder="مكتب أحمد للمحاماة"
                        className="rounded-xl"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        النوع
                      </label>
                      <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map(option => {
                            const Icon = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الحالة</label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
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
                      <label className="text-sm font-medium text-slate-700">نوع العلاقة</label>
                      <Select value={formData.relationshipType} onValueChange={(value) => handleChange('relationshipType', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_TYPES.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        الأولوية
                      </label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(option => (
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
                    <div className="flex items-center gap-4 pt-6">
                      <Switch
                        checked={formData.isMutual}
                        onCheckedChange={(checked) => handleChange('isMutual', checked)}
                      />
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-purple-500" />
                        إحالة متبادلة
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-purple-500" aria-hidden="true" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">اسم جهة الاتصال</label>
                      <Input
                        placeholder="أحمد محمد"
                        className="rounded-xl"
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">المسمى الوظيفي</label>
                      <Input
                        placeholder="الشريك المؤسس"
                        className="rounded-xl"
                        value={formData.contactTitle}
                        onChange={(e) => handleChange('contactTitle', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
                      <Input
                        placeholder="+966 5x xxx xxxx"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        واتساب
                      </label>
                      <Input
                        placeholder="+966 5x xxx xxxx"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" aria-hidden="true" />
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">طريقة الاتصال المفضلة</label>
                      <Select value={formData.preferredContactMethod} onValueChange={(v) => handleChange('preferredContactMethod', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">هاتف</SelectItem>
                          <SelectItem value="whatsapp">واتساب</SelectItem>
                          <SelectItem value="email">بريد إلكتروني</SelectItem>
                          <SelectItem value="in_person">شخصياً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Info */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-500" aria-hidden="true" />
                    معلومات المنظمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">اسم المنظمة</label>
                      <Input
                        placeholder="شركة الأمل للمحاماة"
                        className="rounded-xl"
                        value={formData.organizationName}
                        onChange={(e) => handleChange('organizationName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" aria-hidden="true" />
                        الموقع الإلكتروني
                      </label>
                      <Input
                        placeholder="https://example.com"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="text-sm font-medium text-slate-700">العنوان</label>
                      <Input
                        placeholder="شارع الملك فهد"
                        className="rounded-xl"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Practice Areas */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-500" />
                    مجالات الإحالة المفضلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {PRACTICE_AREAS.map(area => (
                      <Badge
                        key={area.value}
                        variant={formData.practiceAreas.includes(area.value) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors px-3 py-1.5',
                          formData.practiceAreas.includes(area.value)
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : 'hover:bg-purple-50'
                        )}
                        onClick={() => togglePracticeArea(area.value)}
                      >
                        {area.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-purple-500" />
                    الوسوم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 me-1">
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف وسم..."
                      className="rounded-xl flex-1"
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
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Sections */}
              <Accordion type="multiple" className="space-y-4">

                {/* Fee Agreement */}
                <AccordionItem value="fees" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      اتفاقية العمولة
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={formData.hasFeeAgreement}
                          onCheckedChange={(checked) => handleChange('hasFeeAgreement', checked)}
                        />
                        <label className="text-sm font-medium text-slate-700">
                          يوجد اتفاقية عمولة
                        </label>
                      </div>

                      {formData.hasFeeAgreement && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">نوع العمولة</label>
                              <Select value={formData.feeType} onValueChange={(value) => handleChange('feeType', value)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FEE_TYPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div>
                                        <div>{option.label}</div>
                                        <div className="text-xs text-slate-500">{option.description}</div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">شروط الدفع</label>
                              <Select value={formData.paymentTerms} onValueChange={(v) => handleChange('paymentTerms', v)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_TERMS.map(term => (
                                    <SelectItem key={term.value} value={term.value}>
                                      {term.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {formData.feeType === 'percentage' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <Percent className="w-4 h-4 text-blue-500" />
                                  نسبة العمولة (%)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="10"
                                  className="rounded-xl"
                                  value={formData.feePercentage || ''}
                                  onChange={(e) => handleChange('feePercentage', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الحد الأقصى (ر.س)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="50000"
                                  className="rounded-xl"
                                  value={formData.feeCap || ''}
                                  onChange={(e) => handleChange('feeCap', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">الحد الأدنى (ر.س)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="1000"
                                  className="rounded-xl"
                                  value={formData.minimumFee || ''}
                                  onChange={(e) => handleChange('minimumFee', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          )}

                          {formData.feeType === 'fixed' && (
                            <div className="p-4 bg-slate-50 rounded-xl">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  مبلغ العمولة الثابت (ر.س)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="5000"
                                  className="rounded-xl"
                                  value={formData.feeFixedAmount || ''}
                                  onChange={(e) => handleChange('feeFixedAmount', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          )}

                          {formData.feeType === 'tiered' && (
                            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">شرائح العمولة</label>
                                <Button type="button" variant="outline" size="sm" onClick={addTieredFee} className="rounded-xl">
                                  <Plus className="w-4 h-4 ms-1" aria-hidden="true" />
                                  إضافة شريحة
                                </Button>
                              </div>
                              {formData.tieredFees.map((tier, index) => (
                                <div key={index} className="grid grid-cols-4 gap-3 items-end">
                                  <div className="space-y-1">
                                    <label className="text-xs text-slate-500">من (ر.س)</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="rounded-lg h-9"
                                      value={tier.minValue || ''}
                                      onChange={(e) => updateTieredFee(index, 'minValue', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-slate-500">إلى (ر.س)</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="rounded-lg h-9"
                                      value={tier.maxValue || ''}
                                      onChange={(e) => updateTieredFee(index, 'maxValue', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-slate-500">النسبة (%)</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="rounded-lg h-9"
                                      value={tier.percentage || ''}
                                      onChange={(e) => updateTieredFee(index, 'percentage', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 text-red-500 hover:text-red-700"
                                    onClick={() => removeTieredFee(index)}
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </div>
                              ))}
                              {formData.tieredFees.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">
                                  أضف شرائح العمولة المتدرجة
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Agreement Details */}
                <AccordionItem value="agreement" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="w-5 h-5 text-purple-500" aria-hidden="true" />
                      تفاصيل الاتفاقية
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">حالة الاتفاقية</label>
                          <Select value={formData.agreementStatus} onValueChange={(v) => handleChange('agreementStatus', v)}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGREEMENT_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  <div className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", status.color)} />
                                    {status.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" aria-hidden="true" />
                            تاريخ البداية
                          </label>
                          <Input
                            type="date"
                            className="rounded-xl"
                            value={formData.agreementStartDate}
                            onChange={(e) => handleChange('agreementStartDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-500" aria-hidden="true" />
                            تاريخ الانتهاء
                          </label>
                          <Input
                            type="date"
                            className="rounded-xl"
                            value={formData.agreementEndDate}
                            onChange={(e) => handleChange('agreementEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={formData.autoRenew}
                          onCheckedChange={(checked) => handleChange('autoRenew', checked)}
                        />
                        <label className="text-sm font-medium text-slate-700">تجديد تلقائي</label>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ملاحظات الاتفاقية</label>
                        <Textarea
                          placeholder="أي شروط خاصة أو ملاحظات..."
                          className="min-h-[80px] rounded-xl"
                          value={formData.agreementNotes}
                          onChange={(e) => handleChange('agreementNotes', e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Banking Info */}
                <AccordionItem value="banking" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <CreditCard className="w-5 h-5 text-purple-500" />
                      معلومات الحساب البنكي
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم البنك</label>
                        <Input
                          placeholder="البنك الأهلي"
                          className="rounded-xl"
                          value={formData.bankName}
                          onChange={(e) => handleChange('bankName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم صاحب الحساب</label>
                        <Input
                          placeholder="اسم صاحب الحساب"
                          className="rounded-xl"
                          value={formData.accountHolderName}
                          onChange={(e) => handleChange('accountHolderName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">رقم الآيبان (IBAN)</label>
                        <Input
                          placeholder="SA..."
                          className="rounded-xl"
                          dir="ltr"
                          value={formData.iban}
                          onChange={(e) => handleChange('iban', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">رمز السويفت</label>
                        <Input
                          placeholder="NCBKSAJE"
                          className="rounded-xl"
                          dir="ltr"
                          value={formData.swiftCode}
                          onChange={(e) => handleChange('swiftCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Notifications & Tracking */}
                <AccordionItem value="tracking" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <Target className="w-5 h-5 text-purple-500" />
                      التتبع والإشعارات
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">تتبع العمولات</p>
                          <p className="text-sm text-slate-500">تتبع العمولات المستحقة والمدفوعة</p>
                        </div>
                        <Switch
                          checked={formData.trackCommissions}
                          onCheckedChange={(checked) => handleChange('trackCommissions', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">إشعارات الدفع</p>
                          <p className="text-sm text-slate-500">إرسال إشعار عند استحقاق أو دفع العمولة</p>
                        </div>
                        <Switch
                          checked={formData.sendPaymentNotifications}
                          onCheckedChange={(checked) => handleChange('sendPaymentNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">إشعارات الإحالات</p>
                          <p className="text-sm text-slate-500">إرسال إشعار عند تسجيل إحالة جديدة</p>
                        </div>
                        <Switch
                          checked={formData.sendReferralNotifications}
                          onCheckedChange={(checked) => handleChange('sendReferralNotifications', checked)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Notes */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" aria-hidden="true" />
                    ملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ملاحظات عامة</label>
                    <Textarea
                      placeholder="أي ملاحظات إضافية عن مصدر الإحالة..."
                      className="min-h-[100px] rounded-xl"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-500" />
                      ملاحظات داخلية (للفريق فقط)
                    </label>
                    <Textarea
                      placeholder="ملاحظات داخلية..."
                      className="min-h-[80px] rounded-xl bg-yellow-50"
                      value={formData.internalNotes}
                      onChange={(e) => handleChange('internalNotes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Link to={ROUTES.dashboard.crm.referrals.list}>
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-purple-500/20"
                  disabled={createReferralMutation.isPending}
                >
                  {createReferralMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      حفظ مصدر الإحالة
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Widgets */}
          <SalesSidebar context="referrals" />
        </div>
      </Main>
    </>
  )
}
