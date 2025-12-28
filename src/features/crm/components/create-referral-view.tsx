/**
 * Ultimate Enterprise Referral Form - CRM Module
 *
 * Full-featured referral creation with:
 * - 5 Tabs: Referrer Info, Referred Person, Program & Rewards, Follow-up, Advanced
 * - Enhanced status workflow (7 statuses)
 * - Referral source tracking
 * - Commission/reward settings (percentage, fixed, points, tiered)
 * - Expected deal value & services of interest
 * - Follow-up scheduling
 * - Payment status tracking
 * - Full bilingual support (Arabic/English)
 */

import { useState } from 'react'
import {
  ArrowRight, Save, User, FileText, Loader2, Plus, X,
  Phone, Mail, Building, DollarSign, Users, Percent, Star,
  Calendar, Award, TrendingUp, Shield, MessageSquare, Clock,
  CheckCircle, AlertTriangle, Briefcase, Scale, CreditCard,
  Receipt, Target, Gift, Handshake, Globe, ChevronDown, UserCheck,
  UserPlus, Building2, Settings, Bell, Coins, Zap, ThumbsUp,
  Package, Layers, Tag, Link2, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Card,
  CardContent,
  CardDescription,
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

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & OPTIONS
// ═══════════════════════════════════════════════════════════════

// Firm Size Type - Controls form complexity
type FirmSize = 'solo' | 'small' | 'medium' | 'large'

// Firm Size Options
const FIRM_SIZE_OPTIONS = [
  { value: 'solo' as FirmSize, label: 'محامي فردي', labelEn: 'Solo Practice', icon: User, description: 'ممارسة فردية' },
  { value: 'small' as FirmSize, label: 'مكتب صغير', labelEn: 'Small Firm (2-10)', icon: Users, description: '2-10 محامين' },
  { value: 'medium' as FirmSize, label: 'مكتب متوسط', labelEn: 'Medium Firm (11-50)', icon: Building2, description: '11-50 محامي' },
  { value: 'large' as FirmSize, label: 'شركة محاماة', labelEn: 'Large Firm (50+)', icon: Building2, description: '50+ محامي' },
]

// Referrer Types
const REFERRER_TYPES: { value: ReferralType; label: string; labelEn: string; icon: any }[] = [
  { value: 'client', label: 'عميل حالي', labelEn: 'Existing Client', icon: UserCheck },
  { value: 'lawyer', label: 'محامي', labelEn: 'Lawyer', icon: Scale },
  { value: 'law_firm', label: 'مكتب محاماة', labelEn: 'Law Firm', icon: Building },
  { value: 'partner', label: 'شريك استراتيجي', labelEn: 'Strategic Partner', icon: Handshake },
  { value: 'employee', label: 'موظف', labelEn: 'Employee', icon: Briefcase },
  { value: 'contact', label: 'جهة اتصال', labelEn: 'Contact', icon: Users },
  { value: 'organization', label: 'منظمة', labelEn: 'Organization', icon: Building2 },
  { value: 'other', label: 'آخر', labelEn: 'Other', icon: User },
]

// Enhanced Status Options (7 statuses)
const STATUS_OPTIONS: { value: string; label: string; labelEn: string; color: string }[] = [
  { value: 'pending', label: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-yellow-500' },
  { value: 'contacted', label: 'تم التواصل', labelEn: 'Contacted', color: 'bg-blue-500' },
  { value: 'qualified', label: 'مؤهل', labelEn: 'Qualified', color: 'bg-indigo-500' },
  { value: 'converted', label: 'تم التحويل', labelEn: 'Converted', color: 'bg-emerald-500' },
  { value: 'rejected', label: 'مرفوض', labelEn: 'Rejected', color: 'bg-red-500' },
  { value: 'active', label: 'نشط', labelEn: 'Active', color: 'bg-green-500' },
  { value: 'inactive', label: 'غير نشط', labelEn: 'Inactive', color: 'bg-slate-400' },
]

// Referral Source Types
const REFERRAL_SOURCES = [
  { value: 'website', label: 'الموقع الإلكتروني', labelEn: 'Website' },
  { value: 'social_media', label: 'وسائل التواصل', labelEn: 'Social Media' },
  { value: 'email_campaign', label: 'حملة بريدية', labelEn: 'Email Campaign' },
  { value: 'networking_event', label: 'فعالية تواصل', labelEn: 'Networking Event' },
  { value: 'word_of_mouth', label: 'توصية شخصية', labelEn: 'Word of Mouth' },
  { value: 'advertisement', label: 'إعلان', labelEn: 'Advertisement' },
  { value: 'conference', label: 'مؤتمر', labelEn: 'Conference' },
  { value: 'partnership', label: 'شراكة', labelEn: 'Partnership' },
  { value: 'cold_call', label: 'اتصال بارد', labelEn: 'Cold Call' },
  { value: 'other', label: 'آخر', labelEn: 'Other' },
]

// Referral Programs
const REFERRAL_PROGRAMS = [
  { value: 'standard', label: 'البرنامج القياسي', labelEn: 'Standard Program', commission: '10%' },
  { value: 'premium', label: 'البرنامج المميز', labelEn: 'Premium Program', commission: '15%' },
  { value: 'elite', label: 'البرنامج النخبة', labelEn: 'Elite Program', commission: '20%' },
  { value: 'partner', label: 'برنامج الشركاء', labelEn: 'Partner Program', commission: 'Tiered' },
  { value: 'employee', label: 'برنامج الموظفين', labelEn: 'Employee Program', commission: 'Points' },
  { value: 'custom', label: 'برنامج مخصص', labelEn: 'Custom Program', commission: 'Custom' },
]

// Reward Types
const REWARD_TYPES: { value: string; label: string; labelEn: string; icon: any; description: string }[] = [
  { value: 'percentage', label: 'نسبة مئوية', labelEn: 'Percentage', icon: Percent, description: 'نسبة من قيمة الصفقة' },
  { value: 'fixed', label: 'مبلغ ثابت', labelEn: 'Fixed Amount', icon: DollarSign, description: 'مبلغ ثابت لكل إحالة' },
  { value: 'points', label: 'نقاط', labelEn: 'Points', icon: Award, description: 'نقاط قابلة للاستبدال' },
  { value: 'tiered', label: 'متدرج', labelEn: 'Tiered', icon: Layers, description: 'مكافآت متدرجة حسب القيمة' },
  { value: 'hybrid', label: 'مختلط', labelEn: 'Hybrid', icon: Zap, description: 'نقاط + عمولة مالية' },
  { value: 'none', label: 'لا يوجد', labelEn: 'None', icon: X, description: 'بدون مكافأة' },
]

// Services of Interest
const SERVICES_OF_INTEREST = [
  { value: 'corporate_law', label: 'قانون الشركات', labelEn: 'Corporate Law' },
  { value: 'litigation', label: 'التقاضي', labelEn: 'Litigation' },
  { value: 'labor_law', label: 'قانون العمل', labelEn: 'Labor Law' },
  { value: 'real_estate', label: 'العقارات', labelEn: 'Real Estate' },
  { value: 'intellectual_property', label: 'الملكية الفكرية', labelEn: 'IP' },
  { value: 'criminal_law', label: 'القانون الجنائي', labelEn: 'Criminal Law' },
  { value: 'family_law', label: 'قانون الأسرة', labelEn: 'Family Law' },
  { value: 'banking_finance', label: 'القانون المصرفي', labelEn: 'Banking & Finance' },
  { value: 'arbitration', label: 'التحكيم', labelEn: 'Arbitration' },
  { value: 'tax_law', label: 'القانون الضريبي', labelEn: 'Tax Law' },
  { value: 'compliance', label: 'الامتثال', labelEn: 'Compliance' },
  { value: 'consultation', label: 'استشارات قانونية', labelEn: 'Legal Consultation' },
  { value: 'contract_drafting', label: 'صياغة العقود', labelEn: 'Contract Drafting' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
]

// Priority Options
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'منخفض', labelEn: 'Low', color: 'bg-slate-400' },
  { value: 'normal', label: 'عادي', labelEn: 'Normal', color: 'bg-blue-400' },
  { value: 'high', label: 'عالي', labelEn: 'High', color: 'bg-orange-500' },
  { value: 'vip', label: 'VIP', labelEn: 'VIP', color: 'bg-purple-500' },
]

// Payment Status
const PAYMENT_STATUSES = [
  { value: 'not_applicable', label: 'لا ينطبق', labelEn: 'N/A', color: 'bg-slate-400' },
  { value: 'pending', label: 'قيد الانتظار', labelEn: 'Pending', color: 'bg-yellow-500' },
  { value: 'processing', label: 'قيد المعالجة', labelEn: 'Processing', color: 'bg-blue-500' },
  { value: 'paid', label: 'مدفوع', labelEn: 'Paid', color: 'bg-green-500' },
  { value: 'overdue', label: 'متأخر', labelEn: 'Overdue', color: 'bg-red-500' },
  { value: 'partial', label: 'جزئي', labelEn: 'Partial', color: 'bg-orange-500' },
]

// Payment Terms
const PAYMENT_TERMS = [
  { value: 'on_retainer', label: 'عند التوكيل', labelEn: 'On Retainer' },
  { value: 'on_conversion', label: 'عند التحويل', labelEn: 'On Conversion' },
  { value: 'on_settlement', label: 'عند التسوية', labelEn: 'On Settlement' },
  { value: 'on_invoice', label: 'عند الفاتورة', labelEn: 'On Invoice' },
  { value: 'net_30', label: '30 يوم', labelEn: 'Net 30' },
  { value: 'net_60', label: '60 يوم', labelEn: 'Net 60' },
  { value: 'net_90', label: '90 يوم', labelEn: 'Net 90' },
  { value: 'custom', label: 'مخصص', labelEn: 'Custom' },
]

// Follow-up Frequencies
const FOLLOWUP_FREQUENCIES = [
  { value: 'daily', label: 'يومياً', labelEn: 'Daily' },
  { value: 'weekly', label: 'أسبوعياً', labelEn: 'Weekly' },
  { value: 'biweekly', label: 'كل أسبوعين', labelEn: 'Bi-weekly' },
  { value: 'monthly', label: 'شهرياً', labelEn: 'Monthly' },
  { value: 'quarterly', label: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 'custom', label: 'مخصص', labelEn: 'Custom' },
]

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CreateReferralView() {
  const navigate = useNavigate()
  const createReferralMutation = useCreateReferral()
  const [activeTab, setActiveTab] = useState('referrer')
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)

  // Firm size selection - controls visibility of organizational fields
  const [firmSize, setFirmSize] = useState<FirmSize>('solo')
  const [showOrgFields, setShowOrgFields] = useState(false)

  // Form state - ULTIMATE Enterprise Version
  const [formData, setFormData] = useState({
    // ═══ TAB 1: REFERRER INFO ═══
    referrerType: 'client' as ReferralType,
    referrerName: '',
    referrerNameAr: '',
    referrerEmail: '',
    referrerPhone: '',
    referrerCompany: '',
    referrerJobTitle: '',
    referrerRelationship: 'new', // new, occasional, regular, strategic, preferred
    referrerLinkedEntityId: '', // clientId, contactId, etc.

    // ═══ TAB 2: REFERRED PERSON/COMPANY ═══
    referredType: 'individual', // individual, company
    referredFirstName: '',
    referredLastName: '',
    referredFullName: '',
    referredCompanyName: '',
    referredCompanyNameAr: '',
    referredEmail: '',
    referredPhone: '',
    referredWhatsapp: '',
    referredJobTitle: '',
    referredIndustry: '',
    referredWebsite: '',
    referredAddress: '',
    referredCity: '',
    referredCountry: 'المملكة العربية السعودية',

    // Referral Source & Tracking
    referralSource: 'word_of_mouth',
    referralSourceDetails: '',
    referralDate: new Date().toISOString().split('T')[0],
    referralCampaign: '',

    // ═══ TAB 3: PROGRAM & REWARDS ═══
    referralProgram: 'standard',
    rewardType: 'percentage' as string,

    // Commission settings
    rewardPercentage: 10,
    rewardFixedAmount: 0,
    rewardPoints: 100,
    pointsConversionRate: 1, // 1 SAR = X points

    // Expected value
    expectedDealValue: 0,
    estimatedClosingDate: '',

    // Services of Interest
    servicesOfInterest: [] as string[],
    specificRequirements: '',

    // Status & Priority
    status: 'pending',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'vip',

    // ═══ TAB 4: FOLLOW-UP ═══
    followUpEnabled: true,
    firstFollowUpDate: '',
    followUpFrequency: 'weekly',
    followUpAssignedTo: '',
    followUpNotes: '',
    nextFollowUpAction: '',
    followUpReminders: true,

    // ═══ TAB 5: ADVANCED SETTINGS ═══
    // Payment Status
    paymentStatus: 'not_applicable',
    paymentTerms: 'on_conversion',
    paymentDueDate: '',
    paymentNotes: '',

    // Tiered Rewards
    enableTieredRewards: false,
    tieredRewards: [] as { minValue: number; maxValue: number; percentage: number; points: number }[],

    // Agreement
    agreementRequired: false,
    agreementStatus: 'none', // none, draft, sent, signed, expired
    agreementStartDate: '',
    agreementEndDate: '',
    agreementNotes: '',
    autoRenew: false,

    // Banking (for commission payments)
    bankingInfoRequired: false,
    bankName: '',
    accountHolderName: '',
    iban: '',
    swiftCode: '',

    // Tracking & Notifications
    trackCommissions: true,
    sendPaymentNotifications: true,
    sendReferralNotifications: true,
    sendFollowUpReminders: true,

    // Mutual Referrals
    isMutual: false,
    mutualAgreementDetails: '',

    // Other
    notes: '',
    internalNotes: '',
    tags: [] as string[],
    customFields: {} as Record<string, any>,
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleService = (service: string) => {
    if (formData.servicesOfInterest.includes(service)) {
      handleChange('servicesOfInterest', formData.servicesOfInterest.filter(s => s !== service))
    } else {
      handleChange('servicesOfInterest', [...formData.servicesOfInterest, service])
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

  const addTieredReward = () => {
    handleChange('tieredRewards', [
      ...formData.tieredRewards,
      { minValue: 0, maxValue: 0, percentage: 0, points: 0 }
    ])
  }

  const updateTieredReward = (index: number, field: string, value: number) => {
    const updated = [...formData.tieredRewards]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('tieredRewards', updated)
  }

  const removeTieredReward = (index: number) => {
    handleChange('tieredRewards', formData.tieredRewards.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const referralData = {
      // Referrer
      type: formData.referrerType,
      name: formData.referrerName,
      nameAr: formData.referrerNameAr || undefined,

      // Referred
      referredPerson: {
        type: formData.referredType,
        firstName: formData.referredFirstName || undefined,
        lastName: formData.referredLastName || undefined,
        fullName: formData.referredFullName || undefined,
        companyName: formData.referredCompanyName || undefined,
        companyNameAr: formData.referredCompanyNameAr || undefined,
        email: formData.referredEmail || undefined,
        phone: formData.referredPhone || undefined,
        whatsapp: formData.referredWhatsapp || undefined,
        jobTitle: formData.referredJobTitle || undefined,
        industry: formData.referredIndustry || undefined,
        website: formData.referredWebsite || undefined,
        address: formData.referredAddress || undefined,
        city: formData.referredCity || undefined,
        country: formData.referredCountry,
      },

      // Source & Tracking
      referralSource: {
        type: formData.referralSource,
        details: formData.referralSourceDetails || undefined,
        campaign: formData.referralCampaign || undefined,
        date: formData.referralDate,
      },

      // Program & Rewards
      referralProgram: formData.referralProgram,
      rewardType: formData.rewardType,
      rewardSettings: {
        percentage: formData.rewardType === 'percentage' ? formData.rewardPercentage : undefined,
        fixedAmount: formData.rewardType === 'fixed' ? formData.rewardFixedAmount : undefined,
        points: formData.rewardType === 'points' || formData.rewardType === 'hybrid' ? formData.rewardPoints : undefined,
        pointsConversionRate: formData.rewardType === 'points' || formData.rewardType === 'hybrid' ? formData.pointsConversionRate : undefined,
        tieredRewards: formData.enableTieredRewards ? formData.tieredRewards : undefined,
      },

      // Expected value & services
      expectedDealValue: formData.expectedDealValue || undefined,
      estimatedClosingDate: formData.estimatedClosingDate || undefined,
      servicesOfInterest: formData.servicesOfInterest.length > 0 ? formData.servicesOfInterest : undefined,
      specificRequirements: formData.specificRequirements || undefined,

      // Status
      status: formData.status,
      priority: formData.priority,

      // Follow-up
      followUp: formData.followUpEnabled ? {
        firstDate: formData.firstFollowUpDate || undefined,
        frequency: formData.followUpFrequency,
        assignedTo: formData.followUpAssignedTo || undefined,
        notes: formData.followUpNotes || undefined,
        nextAction: formData.nextFollowUpAction || undefined,
        reminders: formData.followUpReminders,
      } : undefined,

      // Payment
      payment: {
        status: formData.paymentStatus,
        terms: formData.paymentTerms,
        dueDate: formData.paymentDueDate || undefined,
        notes: formData.paymentNotes || undefined,
      },

      // Agreement
      agreement: formData.agreementRequired ? {
        status: formData.agreementStatus,
        startDate: formData.agreementStartDate || undefined,
        endDate: formData.agreementEndDate || undefined,
        notes: formData.agreementNotes || undefined,
        autoRenew: formData.autoRenew,
      } : undefined,

      // Banking
      banking: formData.bankingInfoRequired && formData.bankName ? {
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName || undefined,
        iban: formData.iban || undefined,
        swiftCode: formData.swiftCode || undefined,
      } : undefined,

      // Tracking
      tracking: {
        commissions: formData.trackCommissions,
        paymentNotifications: formData.sendPaymentNotifications,
        referralNotifications: formData.sendReferralNotifications,
        followUpReminders: formData.sendFollowUpReminders,
      },

      // Mutual
      isMutual: formData.isMutual,
      mutualAgreementDetails: formData.mutualAgreementDetails || undefined,

      // Other
      notes: formData.notes || undefined,
      internalNotes: formData.internalNotes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
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
        <ProductivityHero badge="إدارة الإحالات" title="إضافة إحالة جديدة" type="referrals" listMode={true} hideButtons={true}>
          <Link to={ROUTES.dashboard.crm.referrals.list}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

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

              {/* TABS */}
              <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Tabs Header */}
                  <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 pt-6">
                    <TabsList className="bg-white/70 backdrop-blur-sm h-auto p-1 gap-1 rounded-xl border border-slate-200 w-full grid grid-cols-5">
                      <TabsTrigger
                        value="referrer"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                      >
                        <UserCheck className="w-4 h-4 me-2" />
                        <span className="hidden md:inline">المُحيل</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="referred"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                      >
                        <UserPlus className="w-4 h-4 me-2" />
                        <span className="hidden md:inline">المُحال</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="program"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                      >
                        <Award className="w-4 h-4 me-2" />
                        <span className="hidden md:inline">المكافآت</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="followup"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                      >
                        <Clock className="w-4 h-4 me-2" />
                        <span className="hidden md:inline">المتابعة</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="advanced"
                        className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                      >
                        <Settings className="w-4 h-4 me-2" />
                        <span className="hidden md:inline">متقدم</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Tab Contents */}
                  <div className="p-6 bg-white min-h-[600px]">

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* TAB 1: REFERRER INFO (Who is making the referral) */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="referrer" className="mt-0 space-y-6">
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                          <UserCheck className="w-6 h-6 text-purple-500" />
                          معلومات المُحيل
                        </h3>
                        <p className="text-sm text-slate-500">
                          من قام بإحالة العميل المحتمل؟ (عميل حالي، شريك، موظف، إلخ)
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Referrer Type & Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">نوع المُحيل *</Label>
                            <Select value={formData.referrerType} onValueChange={(value) => handleChange('referrerType', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {REFERRER_TYPES.map(option => {
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
                            <Label className="text-sm font-medium text-slate-700">
                              <Star className="w-4 h-4 inline text-yellow-500 me-1" />
                              الأولوية
                            </Label>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">اسم المُحيل (بالإنجليزية) *</Label>
                            <Input
                              placeholder="Ahmed Al-Mansour"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referrerName}
                              onChange={(e) => handleChange('referrerName', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">اسم المُحيل (بالعربية)</Label>
                            <Input
                              placeholder="أحمد المنصور"
                              className="rounded-xl"
                              value={formData.referrerNameAr}
                              onChange={(e) => handleChange('referrerNameAr', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              البريد الإلكتروني
                            </Label>
                            <Input
                              type="email"
                              placeholder="ahmed@example.com"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referrerEmail}
                              onChange={(e) => handleChange('referrerEmail', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              رقم الهاتف
                            </Label>
                            <Input
                              placeholder="+966 5x xxx xxxx"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referrerPhone}
                              onChange={(e) => handleChange('referrerPhone', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Building className="w-4 h-4 text-purple-500" />
                              الشركة / الجهة
                            </Label>
                            <Input
                              placeholder="مكتب أحمد للمحاماة"
                              className="rounded-xl"
                              value={formData.referrerCompany}
                              onChange={(e) => handleChange('referrerCompany', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">المسمى الوظيفي</Label>
                            <Input
                              placeholder="المدير التنفيذي"
                              className="rounded-xl"
                              value={formData.referrerJobTitle}
                              onChange={(e) => handleChange('referrerJobTitle', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                          <Switch
                            checked={formData.isMutual}
                            onCheckedChange={(checked) => handleChange('isMutual', checked)}
                          />
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Handshake className="w-4 h-4 text-purple-500" />
                              إحالة متبادلة
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">
                              هل توجد اتفاقية إحالة متبادلة مع هذا المُحيل؟
                            </p>
                          </div>
                        </div>

                        {formData.isMutual && (
                          <div className="space-y-2 p-4 bg-purple-50 rounded-xl">
                            <Label className="text-sm font-medium text-slate-700">تفاصيل الاتفاقية المتبادلة</Label>
                            <Textarea
                              placeholder="اكتب تفاصيل اتفاقية الإحالة المتبادلة..."
                              className="rounded-xl min-h-[80px]"
                              value={formData.mutualAgreementDetails}
                              onChange={(e) => handleChange('mutualAgreementDetails', e.target.value)}
                            />
                          </div>
                        )}

                        {/* ORGANIZATIONAL FIELDS - Only for non-solo firms */}
                        {firmSize !== 'solo' && (
                          <Collapsible open={showOrgFields} onOpenChange={setShowOrgFields}>
                            <Card className="border-0 shadow-sm border-s-4 border-s-blue-500 mt-6">
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
                                    <Label className="text-sm font-medium text-slate-700">القسم / الفريق المسؤول</Label>
                                    <Input
                                      placeholder="مثال: قسم تطوير الأعمال"
                                      className="rounded-xl"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">رقم برنامج الإحالة</Label>
                                    <Input
                                      placeholder="مثال: REF-PROG-2024-001"
                                      className="rounded-xl"
                                      dir="ltr"
                                    />
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        )}
                      </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* TAB 2: REFERRED PERSON/COMPANY (Who is being referred) */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="referred" className="mt-0 space-y-6">
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                          <UserPlus className="w-6 h-6 text-purple-500" />
                          معلومات العميل المُحال
                        </h3>
                        <p className="text-sm text-slate-500">
                          من هو الشخص أو الشركة التي تم إحالتها؟
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Referred Type */}
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant={formData.referredType === 'individual' ? 'default' : 'outline'}
                            className={cn(
                              "flex-1 rounded-xl h-auto py-4",
                              formData.referredType === 'individual' ? 'bg-purple-500 hover:bg-purple-600' : ''
                            )}
                            onClick={() => handleChange('referredType', 'individual')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <User className="w-6 h-6" />
                              <span className="font-medium">شخص / فرد</span>
                            </div>
                          </Button>
                          <Button
                            type="button"
                            variant={formData.referredType === 'company' ? 'default' : 'outline'}
                            className={cn(
                              "flex-1 rounded-xl h-auto py-4",
                              formData.referredType === 'company' ? 'bg-purple-500 hover:bg-purple-600' : ''
                            )}
                            onClick={() => handleChange('referredType', 'company')}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Building2 className="w-6 h-6" />
                              <span className="font-medium">شركة / منشأة</span>
                            </div>
                          </Button>
                        </div>

                        {/* Individual Fields */}
                        {formData.referredType === 'individual' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">الاسم الأول *</Label>
                                <Input
                                  placeholder="محمد"
                                  className="rounded-xl"
                                  value={formData.referredFirstName}
                                  onChange={(e) => handleChange('referredFirstName', e.target.value)}
                                  required={formData.referredType === 'individual'}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">اسم العائلة *</Label>
                                <Input
                                  placeholder="العلي"
                                  className="rounded-xl"
                                  value={formData.referredLastName}
                                  onChange={(e) => handleChange('referredLastName', e.target.value)}
                                  required={formData.referredType === 'individual'}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">الاسم الكامل (بالإنجليزية)</Label>
                              <Input
                                placeholder="Mohammed Al-Ali"
                                className="rounded-xl"
                                dir="ltr"
                                value={formData.referredFullName}
                                onChange={(e) => handleChange('referredFullName', e.target.value)}
                              />
                            </div>
                          </>
                        )}

                        {/* Company Fields */}
                        {formData.referredType === 'company' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">اسم الشركة (بالإنجليزية) *</Label>
                              <Input
                                placeholder="Al-Noor Trading Company"
                                className="rounded-xl"
                                dir="ltr"
                                value={formData.referredCompanyName}
                                onChange={(e) => handleChange('referredCompanyName', e.target.value)}
                                required={formData.referredType === 'company'}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">اسم الشركة (بالعربية)</Label>
                              <Input
                                placeholder="شركة النور للتجارة"
                                className="rounded-xl"
                                value={formData.referredCompanyNameAr}
                                onChange={(e) => handleChange('referredCompanyNameAr', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              البريد الإلكتروني *
                            </Label>
                            <Input
                              type="email"
                              placeholder="client@example.com"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referredEmail}
                              onChange={(e) => handleChange('referredEmail', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              رقم الهاتف *
                            </Label>
                            <Input
                              placeholder="+966 5x xxx xxxx"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referredPhone}
                              onChange={(e) => handleChange('referredPhone', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-green-600" />
                              واتساب
                            </Label>
                            <Input
                              placeholder="+966 5x xxx xxxx"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.referredWhatsapp}
                              onChange={(e) => handleChange('referredWhatsapp', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">المسمى الوظيفي</Label>
                            <Input
                              placeholder="المدير العام"
                              className="rounded-xl"
                              value={formData.referredJobTitle}
                              onChange={(e) => handleChange('referredJobTitle', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Referral Source Tracking */}
                        <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                          <h4 className="font-semibold text-navy flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-indigo-500" />
                            تتبع مصدر الإحالة
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">مصدر الإحالة</Label>
                              <Select value={formData.referralSource} onValueChange={(value) => handleChange('referralSource', value)}>
                                <SelectTrigger className="rounded-xl bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {REFERRAL_SOURCES.map(source => (
                                    <SelectItem key={source.value} value={source.value}>
                                      {source.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">تاريخ الإحالة</Label>
                              <Input
                                type="date"
                                className="rounded-xl bg-white"
                                value={formData.referralDate}
                                onChange={(e) => handleChange('referralDate', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">تفاصيل المصدر / الحملة</Label>
                            <Input
                              placeholder="مثال: حملة لينكد إن - Q4 2024"
                              className="rounded-xl bg-white"
                              value={formData.referralCampaign}
                              onChange={(e) => handleChange('referralCampaign', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">المدينة</Label>
                            <Input
                              placeholder="الرياض"
                              className="rounded-xl"
                              value={formData.referredCity}
                              onChange={(e) => handleChange('referredCity', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-medium text-slate-700">العنوان</Label>
                            <Input
                              placeholder="شارع الملك فهد، حي العليا"
                              className="rounded-xl"
                              value={formData.referredAddress}
                              onChange={(e) => handleChange('referredAddress', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* TAB 3: PROGRAM & REWARDS */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="program" className="mt-0 space-y-6">
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                          <Award className="w-6 h-6 text-purple-500" />
                          برنامج المكافآت والعمولات
                        </h3>
                        <p className="text-sm text-slate-500">
                          اختر برنامج الإحالة ونوع المكافأة والقيمة المتوقعة
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Status & Program */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">حالة الإحالة</Label>
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
                            <Label className="text-sm font-medium text-slate-700">برنامج الإحالة</Label>
                            <Select value={formData.referralProgram} onValueChange={(value) => handleChange('referralProgram', value)}>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {REFERRAL_PROGRAMS.map(program => (
                                  <SelectItem key={program.value} value={program.value}>
                                    <div>
                                      <div className="font-medium">{program.label}</div>
                                      <div className="text-xs text-slate-500">العمولة: {program.commission}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Expected Deal Value */}
                        <div className="p-4 bg-emerald-50 rounded-xl space-y-4">
                          <h4 className="font-semibold text-navy flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            القيمة المتوقعة للصفقة
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">قيمة الصفقة المتوقعة (ر.س)</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="50000"
                                className="rounded-xl bg-white"
                                value={formData.expectedDealValue || ''}
                                onChange={(e) => handleChange('expectedDealValue', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">تاريخ الإغلاق المتوقع</Label>
                              <Input
                                type="date"
                                className="rounded-xl bg-white"
                                value={formData.estimatedClosingDate}
                                onChange={(e) => handleChange('estimatedClosingDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Services of Interest */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-500" />
                            الخدمات محل الاهتمام
                          </Label>
                          <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl">
                            {SERVICES_OF_INTEREST.map(service => (
                              <Badge
                                key={service.value}
                                variant={formData.servicesOfInterest.includes(service.value) ? 'default' : 'outline'}
                                className={cn(
                                  'cursor-pointer transition-all px-3 py-1.5 text-sm',
                                  formData.servicesOfInterest.includes(service.value)
                                    ? 'bg-purple-500 hover:bg-purple-600'
                                    : 'hover:bg-purple-50 hover:border-purple-300'
                                )}
                                onClick={() => toggleService(service.value)}
                              >
                                {service.label}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">متطلبات محددة</Label>
                          <Textarea
                            placeholder="اكتب أي متطلبات محددة للخدمات..."
                            className="rounded-xl min-h-[80px]"
                            value={formData.specificRequirements}
                            onChange={(e) => handleChange('specificRequirements', e.target.value)}
                          />
                        </div>

                        {/* Reward Type Selection */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-500" />
                            نوع المكافأة
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {REWARD_TYPES.map(reward => {
                              const Icon = reward.icon
                              return (
                                <Button
                                  key={reward.value}
                                  type="button"
                                  variant={formData.rewardType === reward.value ? 'default' : 'outline'}
                                  className={cn(
                                    "h-auto py-4 rounded-xl flex-col gap-2",
                                    formData.rewardType === reward.value ? 'bg-purple-500 hover:bg-purple-600' : ''
                                  )}
                                  onClick={() => handleChange('rewardType', reward.value)}
                                >
                                  <Icon className="w-5 h-5" />
                                  <span className="font-medium">{reward.label}</span>
                                  <span className="text-xs opacity-80">{reward.description}</span>
                                </Button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Reward Settings based on type */}
                        {formData.rewardType === 'percentage' && (
                          <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                            <h4 className="font-semibold text-navy flex items-center gap-2">
                              <Percent className="w-5 h-5 text-blue-500" />
                              إعدادات النسبة المئوية
                            </h4>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">نسبة العمولة (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="10"
                                className="rounded-xl bg-white"
                                value={formData.rewardPercentage || ''}
                                onChange={(e) => handleChange('rewardPercentage', parseFloat(e.target.value) || 0)}
                              />
                              <p className="text-xs text-slate-500">
                                العمولة المتوقعة: {((formData.expectedDealValue * formData.rewardPercentage) / 100).toLocaleString('ar-SA')} ر.س
                              </p>
                            </div>
                          </div>
                        )}

                        {formData.rewardType === 'fixed' && (
                          <div className="p-4 bg-green-50 rounded-xl space-y-4">
                            <h4 className="font-semibold text-navy flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              إعدادات المبلغ الثابت
                            </h4>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">مبلغ العمولة (ر.س)</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="5000"
                                className="rounded-xl bg-white"
                                value={formData.rewardFixedAmount || ''}
                                onChange={(e) => handleChange('rewardFixedAmount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                        )}

                        {(formData.rewardType === 'points' || formData.rewardType === 'hybrid') && (
                          <div className="p-4 bg-orange-50 rounded-xl space-y-4">
                            <h4 className="font-semibold text-navy flex items-center gap-2">
                              <Coins className="w-5 h-5 text-orange-500" />
                              إعدادات النقاط
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">عدد النقاط</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="100"
                                  className="rounded-xl bg-white"
                                  value={formData.rewardPoints || ''}
                                  onChange={(e) => handleChange('rewardPoints', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">معدل التحويل (1 ر.س = ؟ نقطة)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  placeholder="1"
                                  className="rounded-xl bg-white"
                                  value={formData.pointsConversionRate || ''}
                                  onChange={(e) => handleChange('pointsConversionRate', parseFloat(e.target.value) || 1)}
                                />
                              </div>
                            </div>
                            {formData.rewardType === 'hybrid' && (
                              <div className="space-y-2 pt-4 border-t">
                                <Label className="text-sm font-medium text-slate-700">نسبة العمولة النقدية (%) - إضافة للنقاط</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  placeholder="5"
                                  className="rounded-xl bg-white"
                                  value={formData.rewardPercentage || ''}
                                  onChange={(e) => handleChange('rewardPercentage', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* TAB 4: FOLLOW-UP */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="followup" className="mt-0 space-y-6">
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                          <Clock className="w-6 h-6 text-purple-500" />
                          جدولة المتابعة
                        </h3>
                        <p className="text-sm text-slate-500">
                          حدد خطة المتابعة والإشعارات للإحالة
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                          <Switch
                            checked={formData.followUpEnabled}
                            onCheckedChange={(checked) => handleChange('followUpEnabled', checked)}
                          />
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Bell className="w-4 h-4 text-purple-500" />
                              تفعيل المتابعة التلقائية
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">
                              إنشاء مهام متابعة تلقائية للإحالة
                            </p>
                          </div>
                        </div>

                        {formData.followUpEnabled && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">تاريخ أول متابعة</Label>
                                <Input
                                  type="date"
                                  className="rounded-xl"
                                  value={formData.firstFollowUpDate}
                                  onChange={(e) => handleChange('firstFollowUpDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">تكرار المتابعة</Label>
                                <Select value={formData.followUpFrequency} onValueChange={(value) => handleChange('followUpFrequency', value)}>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FOLLOWUP_FREQUENCIES.map(freq => (
                                      <SelectItem key={freq.value} value={freq.value}>
                                        {freq.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">المكلف بالمتابعة</Label>
                              <Input
                                placeholder="اختر الموظف المسؤول"
                                className="rounded-xl"
                                value={formData.followUpAssignedTo}
                                onChange={(e) => handleChange('followUpAssignedTo', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">الإجراء التالي</Label>
                              <Input
                                placeholder="مثال: الاتصال بالعميل المحال لتقديم الخدمة"
                                className="rounded-xl"
                                value={formData.nextFollowUpAction}
                                onChange={(e) => handleChange('nextFollowUpAction', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-slate-700">ملاحظات المتابعة</Label>
                              <Textarea
                                placeholder="أي ملاحظات خاصة بالمتابعة..."
                                className="rounded-xl min-h-[100px]"
                                value={formData.followUpNotes}
                                onChange={(e) => handleChange('followUpNotes', e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                              <Switch
                                checked={formData.followUpReminders}
                                onCheckedChange={(checked) => handleChange('followUpReminders', checked)}
                              />
                              <div className="flex-1">
                                <Label className="text-sm font-medium text-slate-700">إرسال تذكيرات</Label>
                                <p className="text-xs text-slate-500 mt-1">
                                  إرسال تذكيرات بمواعيد المتابعة للمكلف
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {!formData.followUpEnabled && (
                          <div className="text-center py-12 bg-slate-50 rounded-xl">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">قم بتفعيل المتابعة لإنشاء خطة متابعة تلقائية</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* TAB 5: ADVANCED SETTINGS */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <TabsContent value="advanced" className="mt-0 space-y-6">
                      <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-bold text-navy flex items-center gap-2">
                          <Settings className="w-6 h-6 text-purple-500" />
                          الإعدادات المتقدمة
                        </h3>
                        <p className="text-sm text-slate-500">
                          حالة الدفع، المكافآت المتدرجة، الاتفاقيات، والمعلومات البنكية
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Payment Status */}
                        <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen}>
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between rounded-xl h-auto py-4"
                            >
                              <span className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-purple-500" />
                                <span className="font-semibold">حالة الدفع والشروط</span>
                              </span>
                              <ChevronDown className={cn("w-5 h-5 transition-transform", advancedSettingsOpen && "rotate-180")} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4 space-y-4 p-4 bg-slate-50 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">حالة الدفع</Label>
                                <Select value={formData.paymentStatus} onValueChange={(value) => handleChange('paymentStatus', value)}>
                                  <SelectTrigger className="rounded-xl bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PAYMENT_STATUSES.map(status => (
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
                                <Label className="text-sm font-medium text-slate-700">شروط الدفع</Label>
                                <Select value={formData.paymentTerms} onValueChange={(value) => handleChange('paymentTerms', value)}>
                                  <SelectTrigger className="rounded-xl bg-white">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">تاريخ استحقاق الدفع</Label>
                                <Input
                                  type="date"
                                  className="rounded-xl bg-white"
                                  value={formData.paymentDueDate}
                                  onChange={(e) => handleChange('paymentDueDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">ملاحظات الدفع</Label>
                                <Input
                                  placeholder="ملاحظات إضافية..."
                                  className="rounded-xl bg-white"
                                  value={formData.paymentNotes}
                                  onChange={(e) => handleChange('paymentNotes', e.target.value)}
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Tiered Rewards */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                            <Switch
                              checked={formData.enableTieredRewards}
                              onCheckedChange={(checked) => handleChange('enableTieredRewards', checked)}
                            />
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-orange-500" />
                                تفعيل المكافآت المتدرجة
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">
                                مكافآت مختلفة حسب قيمة الصفقة
                              </p>
                            </div>
                          </div>

                          {formData.enableTieredRewards && (
                            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-slate-700">شرائح المكافآت</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addTieredReward}
                                  className="rounded-xl"
                                >
                                  <Plus className="w-4 h-4 ms-1" />
                                  إضافة شريحة
                                </Button>
                              </div>

                              {formData.tieredRewards.map((tier, index) => (
                                <div key={index} className="grid grid-cols-5 gap-3 items-end p-3 bg-white rounded-xl">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">من (ر.س)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="rounded-lg h-9"
                                      value={tier.minValue || ''}
                                      onChange={(e) => updateTieredReward(index, 'minValue', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">إلى (ر.س)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="rounded-lg h-9"
                                      value={tier.maxValue || ''}
                                      onChange={(e) => updateTieredReward(index, 'maxValue', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">النسبة (%)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      className="rounded-lg h-9"
                                      value={tier.percentage || ''}
                                      onChange={(e) => updateTieredReward(index, 'percentage', parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">النقاط</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      className="rounded-lg h-9"
                                      value={tier.points || ''}
                                      onChange={(e) => updateTieredReward(index, 'points', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeTieredReward(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}

                              {formData.tieredRewards.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-6">
                                  أضف شرائح المكافآت المتدرجة
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Banking Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                            <Switch
                              checked={formData.bankingInfoRequired}
                              onCheckedChange={(checked) => handleChange('bankingInfoRequired', checked)}
                            />
                            <div className="flex-1">
                              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-500" />
                                إضافة معلومات بنكية
                              </Label>
                              <p className="text-xs text-slate-500 mt-1">
                                لتحويل العمولات المستحقة
                              </p>
                            </div>
                          </div>

                          {formData.bankingInfoRequired && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">اسم البنك</Label>
                                <Input
                                  placeholder="البنك الأهلي السعودي"
                                  className="rounded-xl bg-white"
                                  value={formData.bankName}
                                  onChange={(e) => handleChange('bankName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">اسم صاحب الحساب</Label>
                                <Input
                                  placeholder="اسم صاحب الحساب"
                                  className="rounded-xl bg-white"
                                  value={formData.accountHolderName}
                                  onChange={(e) => handleChange('accountHolderName', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">رقم الآيبان (IBAN)</Label>
                                <Input
                                  placeholder="SA..."
                                  className="rounded-xl bg-white"
                                  dir="ltr"
                                  value={formData.iban}
                                  onChange={(e) => handleChange('iban', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-700">رمز السويفت (SWIFT)</Label>
                                <Input
                                  placeholder="NCBKSAJE"
                                  className="rounded-xl bg-white"
                                  dir="ltr"
                                  value={formData.swiftCode}
                                  onChange={(e) => handleChange('swiftCode', e.target.value)}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tracking & Notifications */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-500" />
                            التتبع والإشعارات
                          </Label>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div>
                                <p className="font-medium text-slate-700 text-sm">تتبع العمولات</p>
                                <p className="text-xs text-slate-500">تتبع العمولات المستحقة والمدفوعة</p>
                              </div>
                              <Switch
                                checked={formData.trackCommissions}
                                onCheckedChange={(checked) => handleChange('trackCommissions', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div>
                                <p className="font-medium text-slate-700 text-sm">إشعارات الدفع</p>
                                <p className="text-xs text-slate-500">إرسال إشعار عند استحقاق أو دفع العمولة</p>
                              </div>
                              <Switch
                                checked={formData.sendPaymentNotifications}
                                onCheckedChange={(checked) => handleChange('sendPaymentNotifications', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div>
                                <p className="font-medium text-slate-700 text-sm">إشعارات الإحالات</p>
                                <p className="text-xs text-slate-500">إرسال إشعار عند تسجيل إحالة جديدة</p>
                              </div>
                              <Switch
                                checked={formData.sendReferralNotifications}
                                onCheckedChange={(checked) => handleChange('sendReferralNotifications', checked)}
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <div>
                                <p className="font-medium text-slate-700 text-sm">تذكيرات المتابعة</p>
                                <p className="text-xs text-slate-500">إرسال تذكيرات بمواعيد المتابعة</p>
                              </div>
                              <Switch
                                checked={formData.sendFollowUpReminders}
                                onCheckedChange={(checked) => handleChange('sendFollowUpReminders', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-500" />
                            الوسوم
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1.5 rounded-lg">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-red-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
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
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addTag}
                              className="rounded-xl"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">ملاحظات عامة</Label>
                            <Textarea
                              placeholder="أي ملاحظات إضافية..."
                              className="min-h-[100px] rounded-xl"
                              value={formData.notes}
                              onChange={(e) => handleChange('notes', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-yellow-500" />
                              ملاحظات داخلية (للفريق فقط)
                            </Label>
                            <Textarea
                              placeholder="ملاحظات داخلية..."
                              className="min-h-[80px] rounded-xl bg-yellow-50"
                              value={formData.internalNotes}
                              onChange={(e) => handleChange('internalNotes', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <Link to={ROUTES.dashboard.crm.referrals.list}>
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy rounded-xl">
                    <ArrowRight className="w-4 h-4 ms-2" />
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white min-w-[200px] rounded-xl shadow-xl shadow-purple-500/30"
                  disabled={createReferralMutation.isPending}
                >
                  {createReferralMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      حفظ الإحالة
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <SalesSidebar context="referrals" />
        </div>
      </Main>
    </>
  )
}
