import { useState, useMemo } from 'react'
import {
  ArrowRight, Save, Calendar, User,
  Flag, FileText, Briefcase, Users, Loader2,
  Plus, X, Phone, Mail, Building, MapPin,
  DollarSign, Target, ChevronDown, ChevronUp,
  MessageSquare, Shield, AlertTriangle, CheckCircle,
  Star, TrendingUp, Clock, Scale, Gauge, Award,
  Zap, UserCheck, Banknote, Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
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
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateLead, usePipelines } from '@/hooks/useCrm'
import { useStaff } from '@/hooks/useStaff'
import { cn } from '@/lib/utils'
import type { LeadStatus, LeadSource } from '@/types/crm'

// Lead Status Options
const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string; icon: any }[] = [
  { value: 'new', label: 'جديد', color: 'bg-blue-500', icon: Zap },
  { value: 'contacted', label: 'تم التواصل', color: 'bg-purple-500', icon: Phone },
  { value: 'qualified', label: 'مؤهل', color: 'bg-emerald-500', icon: UserCheck },
  { value: 'proposal', label: 'عرض سعر', color: 'bg-orange-500', icon: FileText },
  { value: 'negotiation', label: 'تفاوض', color: 'bg-yellow-500', icon: Scale },
]

// Lead Source Options
const SOURCE_OPTIONS: { value: LeadSource['type']; label: string; icon: any }[] = [
  { value: 'website', label: 'الموقع الإلكتروني', icon: Building },
  { value: 'referral', label: 'إحالة', icon: Users },
  { value: 'social_media', label: 'وسائل التواصل', icon: MessageSquare },
  { value: 'advertising', label: 'إعلان', icon: Star },
  { value: 'cold_call', label: 'اتصال مباشر', icon: Phone },
  { value: 'walk_in', label: 'زيارة شخصية', icon: User },
  { value: 'event', label: 'فعالية', icon: Calendar },
  { value: 'other', label: 'أخرى', icon: Flag },
]

// Practice Areas / Case Types
const PRACTICE_AREAS = [
  { value: 'corporate', label: 'قانون الشركات', icon: Building },
  { value: 'litigation', label: 'التقاضي', icon: Scale },
  { value: 'labor', label: 'القانون العمالي', icon: Users },
  { value: 'real_estate', label: 'العقارات', icon: MapPin },
  { value: 'intellectual_property', label: 'الملكية الفكرية', icon: Award },
  { value: 'criminal', label: 'القانون الجنائي', icon: Shield },
  { value: 'family', label: 'قانون الأسرة', icon: Users },
  { value: 'banking', label: 'القانون المصرفي', icon: Banknote },
  { value: 'arbitration', label: 'التحكيم', icon: Scale },
  { value: 'administrative', label: 'القانون الإداري', icon: FileText },
  { value: 'tax', label: 'الضرائب', icon: DollarSign },
  { value: 'other', label: 'أخرى', icon: Flag },
]

// BANT Qualification Options
const BUDGET_OPTIONS = [
  { value: 'unknown', label: 'غير محدد', score: 0 },
  { value: 'under_10k', label: 'أقل من 10,000 ر.س', score: 10 },
  { value: '10k_50k', label: '10,000 - 50,000 ر.س', score: 20 },
  { value: '50k_100k', label: '50,000 - 100,000 ر.س', score: 30 },
  { value: '100k_500k', label: '100,000 - 500,000 ر.س', score: 40 },
  { value: 'above_500k', label: 'أكثر من 500,000 ر.س', score: 50 },
]

const AUTHORITY_OPTIONS = [
  { value: 'unknown', label: 'غير محدد', score: 0 },
  { value: 'no_authority', label: 'لا يملك صلاحية', score: 5 },
  { value: 'influencer', label: 'مؤثر في القرار', score: 15 },
  { value: 'recommender', label: 'يوصي بالقرار', score: 20 },
  { value: 'decision_maker', label: 'صانع القرار', score: 30 },
  { value: 'final_approver', label: 'المعتمد النهائي', score: 35 },
]

const NEED_OPTIONS = [
  { value: 'unknown', label: 'غير محدد', score: 0 },
  { value: 'no_need', label: 'لا حاجة حالية', score: 0 },
  { value: 'exploring', label: 'استكشاف الخيارات', score: 10 },
  { value: 'researching', label: 'بحث نشط', score: 15 },
  { value: 'evaluating', label: 'تقييم العروض', score: 20 },
  { value: 'urgent', label: 'حاجة عاجلة', score: 25 },
  { value: 'critical', label: 'حاجة حرجة', score: 30 },
]

const TIMELINE_OPTIONS = [
  { value: 'unknown', label: 'غير محدد', score: 0 },
  { value: 'no_timeline', label: 'بدون جدول زمني', score: 5 },
  { value: 'next_year', label: 'العام القادم', score: 10 },
  { value: 'this_year', label: 'هذا العام', score: 15 },
  { value: 'this_quarter', label: 'هذا الربع', score: 20 },
  { value: 'this_month', label: 'هذا الشهر', score: 25 },
  { value: 'this_week', label: 'هذا الأسبوع', score: 30 },
  { value: 'immediate', label: 'فوري', score: 35 },
]

// Urgency Options
const URGENCY_OPTIONS = [
  { value: 'low', label: 'منخفضة', color: 'bg-slate-400' },
  { value: 'normal', label: 'عادية', color: 'bg-blue-400' },
  { value: 'high', label: 'عالية', color: 'bg-orange-500' },
  { value: 'urgent', label: 'عاجلة', color: 'bg-red-500' },
  { value: 'critical', label: 'حرجة', color: 'bg-red-700' },
]

// Conflict Check Status
const CONFLICT_STATUSES = [
  { value: 'not_checked', label: 'لم يتم الفحص', color: 'bg-gray-400', icon: AlertTriangle },
  { value: 'pending', label: 'قيد الفحص', color: 'bg-yellow-500', icon: Clock },
  { value: 'clear', label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-500', icon: CheckCircle },
  { value: 'potential', label: 'تعارض محتمل', color: 'bg-orange-500', icon: AlertTriangle },
  { value: 'confirmed', label: 'تعارض مؤكد', color: 'bg-red-500', icon: Shield },
  { value: 'waived', label: 'تم التنازل عنه', color: 'bg-purple-500', icon: CheckCircle },
]

// Proposal Status
const PROPOSAL_STATUSES = [
  { value: 'not_started', label: 'لم يبدأ' },
  { value: 'drafting', label: 'قيد الإعداد' },
  { value: 'internal_review', label: 'مراجعة داخلية' },
  { value: 'sent', label: 'تم الإرسال' },
  { value: 'client_review', label: 'مراجعة العميل' },
  { value: 'negotiating', label: 'تفاوض' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'expired', label: 'منتهي الصلاحية' },
]

// Lost Reasons
const LOST_REASONS = [
  { value: 'price', label: 'السعر مرتفع' },
  { value: 'competitor', label: 'اختار منافس' },
  { value: 'timing', label: 'توقيت غير مناسب' },
  { value: 'no_response', label: 'لا استجابة' },
  { value: 'no_budget', label: 'لا ميزانية' },
  { value: 'conflict', label: 'تعارض مصالح' },
  { value: 'scope', label: 'نطاق غير مناسب' },
  { value: 'relationship', label: 'علاقة مع منافس' },
  { value: 'internal', label: 'قرار داخلي' },
  { value: 'other', label: 'سبب آخر' },
]

// Competition Status
const COMPETITION_OPTIONS = [
  { value: 'unknown', label: 'غير معروف' },
  { value: 'no_competition', label: 'لا منافسة' },
  { value: 'early_stage', label: 'مرحلة مبكرة' },
  { value: 'active_competition', label: 'منافسة نشطة' },
  { value: 'head_to_head', label: 'مواجهة مباشرة' },
  { value: 'preferred', label: 'مفضل لدى العميل' },
]

export function CreateLeadView() {
  const navigate = useNavigate()
  const createLeadMutation = useCreateLead()
  const { data: pipelinesData } = usePipelines()
  const { data: staffData } = useStaff()

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    displayName: '',
    preferredName: '',
    salutation: '',

    // Contact Information
    email: '',
    alternateEmail: '',
    phone: '',
    alternatePhone: '',
    whatsapp: '',
    preferredContactMethod: 'phone',

    // Company Information
    company: '',
    jobTitle: '',
    department: '',
    website: '',

    // Status & Pipeline
    status: 'new' as LeadStatus,
    pipelineId: '',
    stageId: '',

    // Source Tracking
    sourceType: '' as LeadSource['type'] | '',
    sourceDetails: '',
    sourceCampaign: '',
    referralSource: '',
    referralContactId: '',

    // Financial
    estimatedValue: 0,
    probability: 50,
    expectedCloseDate: '',

    // Case/Legal Details
    practiceArea: '',
    caseType: '',
    caseDescription: '',
    opposingParty: '',
    urgency: 'normal',
    courtDeadline: '',
    statuteOfLimitations: '',

    // BANT Qualification
    budget: 'unknown',
    budgetAmount: 0,
    authority: 'unknown',
    need: 'unknown',
    timeline: 'unknown',

    // Conflict Check
    conflictStatus: 'not_checked',
    conflictNotes: '',
    conflictCheckedBy: '',
    conflictCheckedDate: '',

    // Competition
    competitionStatus: 'unknown',
    competitors: [] as string[],
    competitiveAdvantage: '',

    // Proposal Tracking
    proposalStatus: 'not_started',
    proposalSentDate: '',
    proposalExpiryDate: '',
    proposalAmount: 0,

    // Assignment
    assignedTo: '',
    assignedTeam: '',

    // Follow-up
    nextFollowUpDate: '',
    nextFollowUpNotes: '',
    followUpCount: 0,
    lastContactDate: '',

    // Address
    street: '',
    city: '',
    postalCode: '',
    country: 'المملكة العربية السعودية',

    // Tags & Classification
    tags: [] as string[],
    priority: 'normal',
    isVIP: false,

    // Lost Lead (if applicable)
    lostReason: '',
    lostReasonDetails: '',
    lostDate: '',

    // Notes
    notes: '',
    internalNotes: '',
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')
  const [competitorInput, setCompetitorInput] = useState('')

  // Calculate lead score
  const leadScore = useMemo(() => {
    let score = 0

    // BANT Scores
    score += BUDGET_OPTIONS.find(o => o.value === formData.budget)?.score || 0
    score += AUTHORITY_OPTIONS.find(o => o.value === formData.authority)?.score || 0
    score += NEED_OPTIONS.find(o => o.value === formData.need)?.score || 0
    score += TIMELINE_OPTIONS.find(o => o.value === formData.timeline)?.score || 0

    // Bonus points
    if (formData.email) score += 5
    if (formData.phone) score += 5
    if (formData.company) score += 5
    if (formData.estimatedValue > 0) score += 10
    if (formData.practiceArea) score += 5
    if (formData.conflictStatus === 'clear') score += 10
    if (formData.isVIP) score += 10

    return Math.min(score, 150) // Cap at 150
  }, [formData])

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'text-emerald-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-slate-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 100) return 'عميل محتمل ممتاز'
    if (score >= 70) return 'عميل محتمل جيد'
    if (score >= 40) return 'يحتاج متابعة'
    return 'مرحلة مبكرة'
  }

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

  const addCompetitor = () => {
    if (competitorInput.trim() && !formData.competitors.includes(competitorInput.trim())) {
      handleChange('competitors', [...formData.competitors, competitorInput.trim()])
      setCompetitorInput('')
    }
  }

  const removeCompetitor = (competitor: string) => {
    handleChange('competitors', formData.competitors.filter(c => c !== competitor))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const leadData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim(),
      preferredName: formData.preferredName || undefined,
      salutation: formData.salutation || undefined,
      email: formData.email || undefined,
      alternateEmail: formData.alternateEmail || undefined,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || undefined,
      whatsapp: formData.whatsapp || undefined,
      preferredContactMethod: formData.preferredContactMethod,
      company: formData.company || undefined,
      jobTitle: formData.jobTitle || undefined,
      department: formData.department || undefined,
      website: formData.website || undefined,
      status: formData.status,
      ...(formData.pipelineId && { pipelineId: formData.pipelineId }),
      ...(formData.stageId && { stageId: formData.stageId }),
      ...(formData.sourceType && {
        source: {
          type: formData.sourceType,
          details: formData.sourceDetails || undefined,
          campaign: formData.sourceCampaign || undefined,
          referralSource: formData.referralSource || undefined,
          referralContactId: formData.referralContactId || undefined,
        },
      }),
      ...(formData.estimatedValue > 0 && { estimatedValue: formData.estimatedValue }),
      probability: formData.probability,
      expectedCloseDate: formData.expectedCloseDate || undefined,
      // Legal/Case Details
      intake: {
        practiceArea: formData.practiceArea || undefined,
        caseType: formData.caseType || undefined,
        caseDescription: formData.caseDescription || undefined,
        opposingParty: formData.opposingParty || undefined,
        urgency: formData.urgency,
        courtDeadline: formData.courtDeadline || undefined,
        statuteOfLimitations: formData.statuteOfLimitations || undefined,
        conflictCheckCompleted: formData.conflictStatus !== 'not_checked',
      },
      // BANT Qualification
      qualification: {
        budget: formData.budget !== 'unknown' ? formData.budget : undefined,
        budgetAmount: formData.budgetAmount > 0 ? formData.budgetAmount : undefined,
        authority: formData.authority !== 'unknown' ? formData.authority : undefined,
        need: formData.need !== 'unknown' ? formData.need : undefined,
        timeline: formData.timeline !== 'unknown' ? formData.timeline : undefined,
        score: leadScore,
      },
      // Conflict Check
      conflictCheck: {
        status: formData.conflictStatus,
        notes: formData.conflictNotes || undefined,
        checkedBy: formData.conflictCheckedBy || undefined,
        checkedDate: formData.conflictCheckedDate || undefined,
      },
      // Competition
      competition: {
        status: formData.competitionStatus,
        competitors: formData.competitors.length > 0 ? formData.competitors : undefined,
        competitiveAdvantage: formData.competitiveAdvantage || undefined,
      },
      // Proposal
      proposal: {
        status: formData.proposalStatus,
        sentDate: formData.proposalSentDate || undefined,
        expiryDate: formData.proposalExpiryDate || undefined,
        amount: formData.proposalAmount > 0 ? formData.proposalAmount : undefined,
      },
      // Assignment
      assignedTo: formData.assignedTo || undefined,
      assignedTeam: formData.assignedTeam || undefined,
      // Follow-up
      followUp: {
        nextDate: formData.nextFollowUpDate || undefined,
        notes: formData.nextFollowUpNotes || undefined,
        count: formData.followUpCount,
        lastContactDate: formData.lastContactDate || undefined,
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
      // Classification
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      priority: formData.priority,
      isVIP: formData.isVIP,
      // Lost tracking
      ...(formData.lostReason && {
        lost: {
          reason: formData.lostReason,
          details: formData.lostReasonDetails || undefined,
          date: formData.lostDate || undefined,
        },
      }),
      notes: formData.notes || undefined,
      internalNotes: formData.internalNotes || undefined,
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
        {/* HERO CARD */}
        <ProductivityHero badge="إدارة العملاء المحتملين" title="إضافة عميل محتمل جديد" type="leads" listMode={true} hideButtons={true}>
          <Link to="/dashboard/crm/leads">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Lead Score Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-emerald-500" />
                      نتيجة تأهيل العميل
                    </span>
                    <Badge className={cn("text-lg px-4 py-1", getScoreColor(leadScore))}>
                      {leadScore} / 150
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={(leadScore / 150) * 100} className="h-3" />
                    <p className={cn("text-sm font-medium", getScoreColor(leadScore))}>
                      {getScoreLabel(leadScore)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Info Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">اللقب</label>
                      <Select value={formData.salutation} onValueChange={(v) => handleChange('salutation', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mr">السيد</SelectItem>
                          <SelectItem value="mrs">السيدة</SelectItem>
                          <SelectItem value="dr">الدكتور</SelectItem>
                          <SelectItem value="eng">المهندس</SelectItem>
                          <SelectItem value="prof">الأستاذ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم الأول <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="أحمد"
                        className="rounded-xl"
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
                        className="rounded-xl"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الاسم المختصر</label>
                      <Input
                        placeholder="اسم للعرض"
                        className="rounded-xl"
                        value={formData.preferredName}
                        onChange={(e) => handleChange('preferredName', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <Switch
                        checked={formData.isVIP}
                        onCheckedChange={(checked) => handleChange('isVIP', checked)}
                      />
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        عميل VIP
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="+966 5x xxx xxxx"
                        className="rounded-xl"
                        dir="ltr"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">هاتف بديل</label>
                      <Input
                        placeholder="+966 5x xxx xxxx"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.alternatePhone}
                        onChange={(e) => handleChange('alternatePhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
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
                      <label className="text-sm font-medium text-slate-700">بريد إلكتروني بديل</label>
                      <Input
                        type="email"
                        placeholder="alternate@example.com"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.alternateEmail}
                        onChange={(e) => handleChange('alternateEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    معلومات الشركة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">اسم الشركة</label>
                      <Input
                        placeholder="شركة الأمل للتجارة"
                        className="rounded-xl"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">المسمى الوظيفي</label>
                      <Input
                        placeholder="المدير التنفيذي"
                        className="rounded-xl"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">القسم</label>
                      <Input
                        placeholder="الإدارة العليا"
                        className="rounded-xl"
                        value={formData.department}
                        onChange={(e) => handleChange('department', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الموقع الإلكتروني</label>
                      <Input
                        placeholder="https://example.com"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Source */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    الحالة والمصدر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الحالة</label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(option => {
                            const Icon = option.icon
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <span className={cn("w-2 h-2 rounded-full", option.color)} />
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
                      <label className="text-sm font-medium text-slate-700">
                        مصدر العميل <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData.sourceType} onValueChange={(value) => handleChange('sourceType', value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="كيف وصل إلينا؟" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOURCE_OPTIONS.map(option => {
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
                  </div>

                  {formData.sourceType === 'referral' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم المُحيل</label>
                        <Input
                          placeholder="اسم الشخص أو الجهة"
                          className="rounded-xl"
                          value={formData.referralSource}
                          onChange={(e) => handleChange('referralSource', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">تفاصيل الإحالة</label>
                        <Input
                          placeholder="كيف تمت الإحالة؟"
                          className="rounded-xl"
                          value={formData.sourceDetails}
                          onChange={(e) => handleChange('sourceDetails', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الحملة التسويقية</label>
                      <Input
                        placeholder="اسم الحملة"
                        className="rounded-xl"
                        value={formData.sourceCampaign}
                        onChange={(e) => handleChange('sourceCampaign', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">تعيين إلى</label>
                      <Select value={formData.assignedTo} onValueChange={(v) => handleChange('assignedTo', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر موظف" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffData?.map((staff: any) => (
                            <SelectItem key={staff._id} value={staff._id}>
                              {staff.firstName} {staff.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    المعلومات المالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">القيمة المتوقعة (ر.س)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="50000"
                        className="rounded-xl"
                        value={formData.estimatedValue || ''}
                        onChange={(e) => handleChange('estimatedValue', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">احتمالية التحويل (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        className="rounded-xl"
                        value={formData.probability}
                        onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        تاريخ الإغلاق المتوقع
                      </label>
                      <Input
                        type="date"
                        className="rounded-xl"
                        value={formData.expectedCloseDate}
                        onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conflict Check - Critical for Law Firms */}
              <Card className="border-0 shadow-sm border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    فحص تعارض المصالح
                    <Badge variant="outline" className="me-2 text-yellow-600 border-yellow-300">
                      إلزامي
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">حالة الفحص</label>
                      <Select value={formData.conflictStatus} onValueChange={(v) => handleChange('conflictStatus', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONFLICT_STATUSES.map(status => {
                            const Icon = status.icon
                            return (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                  <span className={cn("w-2 h-2 rounded-full", status.color)} />
                                  <Icon className="w-4 h-4" />
                                  {status.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">تاريخ الفحص</label>
                      <Input
                        type="date"
                        className="rounded-xl"
                        value={formData.conflictCheckedDate}
                        onChange={(e) => handleChange('conflictCheckedDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ملاحظات الفحص</label>
                    <Textarea
                      placeholder="أي ملاحظات تتعلق بفحص تعارض المصالح..."
                      className="min-h-[80px] rounded-xl"
                      value={formData.conflictNotes}
                      onChange={(e) => handleChange('conflictNotes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Legal/Case Details */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    تفاصيل القضية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">مجال الممارسة</label>
                      <Select value={formData.practiceArea} onValueChange={(v) => handleChange('practiceArea', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر المجال" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRACTICE_AREAS.map(area => {
                            const Icon = area.icon
                            return (
                              <SelectItem key={area.value} value={area.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {area.label}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الأولوية</label>
                      <Select value={formData.urgency} onValueChange={(v) => handleChange('urgency', v)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCY_OPTIONS.map(option => (
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">نوع القضية</label>
                      <Input
                        placeholder="قضية تجارية - نزاع عقود"
                        className="rounded-xl"
                        value={formData.caseType}
                        onChange={(e) => handleChange('caseType', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">الطرف المقابل</label>
                      <Input
                        placeholder="اسم الخصم (إن وجد)"
                        className="rounded-xl"
                        value={formData.opposingParty}
                        onChange={(e) => handleChange('opposingParty', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500" aria-hidden="true" />
                        موعد المحكمة
                      </label>
                      <Input
                        type="date"
                        className="rounded-xl"
                        value={formData.courtDeadline}
                        onChange={(e) => handleChange('courtDeadline', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Timer className="w-4 h-4 text-red-500" />
                        انتهاء التقادم
                      </label>
                      <Input
                        type="date"
                        className="rounded-xl"
                        value={formData.statuteOfLimitations}
                        onChange={(e) => handleChange('statuteOfLimitations', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">وصف القضية</label>
                    <Textarea
                      placeholder="اكتب وصفاً مختصراً للقضية والاحتياجات القانونية..."
                      className="min-h-[100px] rounded-xl"
                      value={formData.caseDescription}
                      onChange={(e) => handleChange('caseDescription', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5 text-emerald-500" />
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

              {/* Advanced Sections Accordion */}
              <Accordion type="multiple" className="space-y-4">

                {/* BANT Qualification */}
                <AccordionItem value="qualification" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      معايير التأهيل (BANT)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Banknote className="w-4 h-4" />
                          الميزانية (Budget)
                        </label>
                        <Select value={formData.budget} onValueChange={(v) => handleChange('budget', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUDGET_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  <Badge variant="outline" className="me-2 text-xs">
                                    +{option.score}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          صلاحية القرار (Authority)
                        </label>
                        <Select value={formData.authority} onValueChange={(v) => handleChange('authority', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTHORITY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  <Badge variant="outline" className="me-2 text-xs">
                                    +{option.score}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          الحاجة (Need)
                        </label>
                        <Select value={formData.need} onValueChange={(v) => handleChange('need', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NEED_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  <Badge variant="outline" className="me-2 text-xs">
                                    +{option.score}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          الجدول الزمني (Timeline)
                        </label>
                        <Select value={formData.timeline} onValueChange={(v) => handleChange('timeline', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMELINE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  <Badge variant="outline" className="me-2 text-xs">
                                    +{option.score}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Competition Tracking */}
                <AccordionItem value="competition" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      تتبع المنافسة
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">حالة المنافسة</label>
                        <Select value={formData.competitionStatus} onValueChange={(v) => handleChange('competitionStatus', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPETITION_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">المنافسون</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.competitors.map(competitor => (
                            <Badge key={competitor} variant="outline" className="gap-1 px-3 py-1">
                              {competitor}
                              <button type="button" onClick={() => removeCompetitor(competitor)} className="hover:text-red-500 me-1">
                                <X className="w-3 h-3" aria-hidden="true" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="أضف منافس..."
                            className="rounded-xl flex-1"
                            value={competitorInput}
                            onChange={(e) => setCompetitorInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCompetitor()
                              }
                            }}
                          />
                          <Button type="button" variant="outline" onClick={addCompetitor} className="rounded-xl">
                            <Plus className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">الميزة التنافسية</label>
                        <Textarea
                          placeholder="ما الذي يميزنا عن المنافسين في هذه الفرصة؟"
                          className="min-h-[80px] rounded-xl"
                          value={formData.competitiveAdvantage}
                          onChange={(e) => handleChange('competitiveAdvantage', e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Proposal Tracking */}
                <AccordionItem value="proposal" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      تتبع العرض
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">حالة العرض</label>
                        <Select value={formData.proposalStatus} onValueChange={(v) => handleChange('proposalStatus', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPOSAL_STATUSES.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">قيمة العرض (ر.س)</label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="rounded-xl"
                          value={formData.proposalAmount || ''}
                          onChange={(e) => handleChange('proposalAmount', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">تاريخ الإرسال</label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.proposalSentDate}
                          onChange={(e) => handleChange('proposalSentDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">تاريخ انتهاء الصلاحية</label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.proposalExpiryDate}
                          onChange={(e) => handleChange('proposalExpiryDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Follow-up Tracking */}
                <AccordionItem value="followup" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <Clock className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      المتابعة
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">تاريخ المتابعة القادمة</label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.nextFollowUpDate}
                          onChange={(e) => handleChange('nextFollowUpDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">آخر تواصل</label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.lastContactDate}
                          onChange={(e) => handleChange('lastContactDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium text-slate-700">ملاحظات المتابعة</label>
                      <Textarea
                        placeholder="ملاحظات للمتابعة القادمة..."
                        className="min-h-[80px] rounded-xl"
                        value={formData.nextFollowUpNotes}
                        onChange={(e) => handleChange('nextFollowUpNotes', e.target.value)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Address */}
                <AccordionItem value="address" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                      العنوان
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-4">
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
                  </AccordionContent>
                </AccordionItem>

                {/* Lost Lead Tracking */}
                <AccordionItem value="lost" className="border rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lg font-semibold">
                      <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
                      تتبع الفرص المفقودة
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">سبب الخسارة</label>
                        <Select value={formData.lostReason} onValueChange={(v) => handleChange('lostReason', v)}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر السبب" />
                          </SelectTrigger>
                          <SelectContent>
                            {LOST_REASONS.map(reason => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">تاريخ الخسارة</label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.lostDate}
                          onChange={(e) => handleChange('lostDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium text-slate-700">تفاصيل إضافية</label>
                      <Textarea
                        placeholder="تفاصيل إضافية عن سبب خسارة الفرصة..."
                        className="min-h-[80px] rounded-xl"
                        value={formData.lostReasonDetails}
                        onChange={(e) => handleChange('lostReasonDetails', e.target.value)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Notes */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    ملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ملاحظات عامة</label>
                    <Textarea
                      placeholder="أي ملاحظات إضافية..."
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
                      placeholder="ملاحظات داخلية لا تظهر للعميل..."
                      className="min-h-[80px] rounded-xl bg-yellow-50"
                      value={formData.internalNotes}
                      onChange={(e) => handleChange('internalNotes', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Link to="/dashboard/crm/leads">
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={createLeadMutation.isPending}
                >
                  {createLeadMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      حفظ العميل المحتمل
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Widgets */}
          <SalesSidebar context="leads" />
        </div>
      </Main>
    </>
  )
}
