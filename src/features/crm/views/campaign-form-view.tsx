import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, Loader2, Mail, Users, Calendar, DollarSign,
    FileText, Target, ChevronDown, ChevronUp, Megaphone,
    Globe, Phone, MessageSquare, TrendingUp, Settings,
    Video, BookOpen, UserPlus, Tv, BarChart3, Percent,
    Hash, Link2, TestTube, Lightbulb, Building2, Tag,
    Clock, CheckCircle, XCircle, PauseCircle, PlayCircle,
    Plus, X, Zap, Calculator, Star, LayoutGrid, User,
    Shield, MapPin, Briefcase, Users2, MessageCircle, Send,
    Smartphone, AtSign, Clock3, FileCode, Activity, Brain,
    BookMarked, Network, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
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
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS - Enterprise Campaign Management
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

const CAMPAIGN_TYPES = [
    { value: 'email', labelAr: 'بريد إلكتروني', labelEn: 'Email', icon: Mail, color: 'blue' },
    { value: 'social', labelAr: 'وسائل التواصل', labelEn: 'Social Media', icon: Globe, color: 'purple' },
    { value: 'event', labelAr: 'حدث', labelEn: 'Event', icon: Calendar, color: 'orange' },
    { value: 'webinar', labelAr: 'ندوة عبر الإنترنت', labelEn: 'Webinar', icon: Video, color: 'indigo' },
    { value: 'content', labelAr: 'محتوى', labelEn: 'Content Marketing', icon: BookOpen, color: 'green' },
    { value: 'referral', labelAr: 'إحالة', labelEn: 'Referral', icon: UserPlus, color: 'pink' },
    { value: 'advertising', labelAr: 'إعلان مدفوع', labelEn: 'Paid Advertising', icon: Tv, color: 'red' },
]

const CAMPAIGN_STATUSES = [
    { value: 'draft', labelAr: 'مسودة', labelEn: 'Draft', icon: FileText, color: 'slate' },
    { value: 'scheduled', labelAr: 'مجدول', labelEn: 'Scheduled', icon: Clock, color: 'blue' },
    { value: 'active', labelAr: 'نشط', labelEn: 'Active', icon: PlayCircle, color: 'emerald' },
    { value: 'paused', labelAr: 'متوقف مؤقتاً', labelEn: 'Paused', icon: PauseCircle, color: 'amber' },
    { value: 'completed', labelAr: 'مكتمل', labelEn: 'Completed', icon: CheckCircle, color: 'green' },
    { value: 'cancelled', labelAr: 'ملغى', labelEn: 'Cancelled', icon: XCircle, color: 'red' },
]

const CHANNELS = [
    { value: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
    { value: 'facebook', labelAr: 'فيسبوك', labelEn: 'Facebook' },
    { value: 'instagram', labelAr: 'إنستغرام', labelEn: 'Instagram' },
    { value: 'twitter', labelAr: 'تويتر (X)', labelEn: 'Twitter (X)' },
    { value: 'linkedin', labelAr: 'لينكد إن', labelEn: 'LinkedIn' },
    { value: 'google-ads', labelAr: 'إعلانات جوجل', labelEn: 'Google Ads' },
    { value: 'whatsapp', labelAr: 'واتساب', labelEn: 'WhatsApp' },
    { value: 'sms', labelAr: 'رسائل نصية', labelEn: 'SMS' },
    { value: 'website', labelAr: 'الموقع الإلكتروني', labelEn: 'Website' },
    { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
]

const ATTRIBUTION_MODELS = [
    { value: 'first-touch', labelAr: 'اللمسة الأولى', labelEn: 'First Touch' },
    { value: 'last-touch', labelAr: 'اللمسة الأخيرة', labelEn: 'Last Touch' },
    { value: 'linear', labelAr: 'خطي', labelEn: 'Linear' },
    { value: 'time-decay', labelAr: 'تناقص زمني', labelEn: 'Time Decay' },
    { value: 'position-based', labelAr: 'موضعي', labelEn: 'Position Based' },
]

const AUDIENCE_SEGMENTS = [
    { value: 'leads', labelAr: 'عملاء محتملين', labelEn: 'Leads' },
    { value: 'clients', labelAr: 'عملاء حاليين', labelEn: 'Current Clients' },
    { value: 'prospects', labelAr: 'عملاء مستهدفين', labelEn: 'Prospects' },
    { value: 'inactive', labelAr: 'عملاء غير نشطين', labelEn: 'Inactive Clients' },
    { value: 'vip', labelAr: 'عملاء مميزين', labelEn: 'VIP Clients' },
    { value: 'partners', labelAr: 'شركاء', labelEn: 'Partners' },
]

const SAUDI_REGIONS = [
    { value: 'riyadh', labelAr: 'الرياض', labelEn: 'Riyadh' },
    { value: 'makkah', labelAr: 'مكة المكرمة', labelEn: 'Makkah' },
    { value: 'madinah', labelAr: 'المدينة المنورة', labelEn: 'Madinah' },
    { value: 'eastern', labelAr: 'المنطقة الشرقية', labelEn: 'Eastern Province' },
    { value: 'asir', labelAr: 'عسير', labelEn: 'Asir' },
    { value: 'tabuk', labelAr: 'تبوك', labelEn: 'Tabuk' },
    { value: 'qassim', labelAr: 'القصيم', labelEn: 'Qassim' },
    { value: 'hail', labelAr: 'حائل', labelEn: 'Hail' },
    { value: 'jazan', labelAr: 'جازان', labelEn: 'Jazan' },
    { value: 'najran', labelAr: 'نجران', labelEn: 'Najran' },
    { value: 'bahah', labelAr: 'الباحة', labelEn: 'Al Bahah' },
    { value: 'jouf', labelAr: 'الجوف', labelEn: 'Al Jouf' },
    { value: 'northern', labelAr: 'الحدود الشمالية', labelEn: 'Northern Borders' },
]

const INDUSTRIES = [
    { value: 'legal', labelAr: 'قانوني', labelEn: 'Legal Services' },
    { value: 'finance', labelAr: 'مالي', labelEn: 'Finance & Banking' },
    { value: 'technology', labelAr: 'تقنية', labelEn: 'Technology' },
    { value: 'healthcare', labelAr: 'رعاية صحية', labelEn: 'Healthcare' },
    { value: 'construction', labelAr: 'إنشاءات', labelEn: 'Construction' },
    { value: 'realestate', labelAr: 'عقارات', labelEn: 'Real Estate' },
    { value: 'education', labelAr: 'تعليم', labelEn: 'Education' },
    { value: 'retail', labelAr: 'تجزئة', labelEn: 'Retail' },
    { value: 'manufacturing', labelAr: 'تصنيع', labelEn: 'Manufacturing' },
    { value: 'hospitality', labelAr: 'ضيافة', labelEn: 'Hospitality' },
]

const COMPANY_SIZES = [
    { value: '1-10', labelAr: '1-10 موظفين', labelEn: '1-10 Employees' },
    { value: '11-50', labelAr: '11-50 موظف', labelEn: '11-50 Employees' },
    { value: '51-200', labelAr: '51-200 موظف', labelEn: '51-200 Employees' },
    { value: '201-500', labelAr: '201-500 موظف', labelEn: '201-500 Employees' },
    { value: '500+', labelAr: '+500 موظف', labelEn: '500+ Employees' },
]

const MARKETING_PLATFORMS = [
    { value: 'none', labelAr: 'لا يوجد', labelEn: 'None' },
    { value: 'mailchimp', labelAr: 'MailChimp', labelEn: 'MailChimp' },
    { value: 'hubspot', labelAr: 'HubSpot', labelEn: 'HubSpot' },
    { value: 'activecampaign', labelAr: 'ActiveCampaign', labelEn: 'ActiveCampaign' },
    { value: 'sendgrid', labelAr: 'SendGrid', labelEn: 'SendGrid' },
    { value: 'marketo', labelAr: 'Marketo', labelEn: 'Marketo' },
]

const SEND_TIME_OPTIONS = [
    { value: 'immediate', labelAr: 'فوري', labelEn: 'Immediate' },
    { value: 'scheduled', labelAr: 'مجدول', labelEn: 'Scheduled' },
    { value: 'optimized', labelAr: 'محسّن', labelEn: 'Optimized' },
]

const APPROVAL_STATUSES = [
    { value: 'pending', labelAr: 'قيد الانتظار', labelEn: 'Pending' },
    { value: 'approved', labelAr: 'موافق عليه', labelEn: 'Approved' },
    { value: 'rejected', labelAr: 'مرفوض', labelEn: 'Rejected' },
    { value: 'changes-requested', labelAr: 'تعديلات مطلوبة', labelEn: 'Changes Requested' },
]

// Mock staff members - in production, this would come from API
const STAFF_MEMBERS = [
    { value: 'staff-1', labelAr: 'أحمد محمد', labelEn: 'Ahmed Mohammed' },
    { value: 'staff-2', labelAr: 'فاطمة علي', labelEn: 'Fatima Ali' },
    { value: 'staff-3', labelAr: 'خالد عبدالله', labelEn: 'Khaled Abdullah' },
    { value: 'staff-4', labelAr: 'سارة حسن', labelEn: 'Sarah Hassan' },
    { value: 'staff-5', labelAr: 'محمد يوسف', labelEn: 'Mohammed Youssef' },
]

interface CampaignFormViewProps {
    editMode?: boolean
    campaignId?: string
    initialData?: any
}

export function CampaignFormView({ editMode = false, campaignId, initialData }: CampaignFormViewProps) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const createCampaignMutation = useCreateCampaign()
    const updateCampaignMutation = useUpdateCampaign()

    const isArabic = i18n.language === 'ar'

    // Firm size selection - controls visibility of organizational fields
    const [firmSize, setFirmSize] = useState<FirmSize>('solo')
    const [showOrgFields, setShowOrgFields] = useState(false)

    // Basic/Advanced mode toggle
    const [isAdvancedMode, setIsAdvancedMode] = useState(false)

    // Form state - ULTIMATE ENTERPRISE VERSION
    const [formData, setFormData] = useState({
        // ═══ OFFICE & BASIC INFO ═══
        officeType: 'individual' as string,
        name: '',
        nameAr: '',
        type: 'email' as string,
        description: '',
        descriptionAr: '',
        objective: '',
        objectiveAr: '',

        // ═══ STATUS & WORKFLOW ═══
        status: 'draft' as string,

        // ═══ TARGETING ═══
        targetAudience: [] as string[], // Changed to array for multiple segments
        targetSegments: [] as string[],
        customSegments: [] as string[],
        estimatedReach: 0,

        // ═══ BUDGET & GOALS ═══
        plannedBudget: 0,
        actualSpend: 0,
        currency: 'SAR',
        budgetAllocation: {} as Record<string, number>,

        // Date Range
        startDate: '',
        endDate: '',
        launchDate: '',

        // Goals & KPIs
        goalLeads: 0,
        goalConversions: 0,
        goalRevenue: 0,
        goalEngagement: 0,
        goalClicks: 0,
        goalImpressions: 0,

        // Actual Results (for tracking)
        actualLeads: 0,
        actualConversions: 0,
        actualRevenue: 0,
        actualEngagement: 0,
        actualClicks: 0,
        actualImpressions: 0,

        // ═══ CHANNELS ═══
        channels: [] as string[],
        primaryChannel: '',

        // ═══ CONTENT ═══
        subject: '',
        subjectAr: '',
        content: '',
        contentAr: '',
        callToAction: '',
        callToActionAr: '',
        landingPageUrl: '',

        // ═══ UTM PARAMETERS ═══
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',

        // ═══ ADVANCED SETTINGS ═══
        // ROI Tracking
        enableROITracking: true,
        costPerLead: 0,
        costPerConversion: 0,
        expectedROI: 0,
        actualROI: 0,

        // Attribution
        attributionModel: 'last-touch',
        trackingEnabled: true,

        // A/B Testing
        enableABTesting: false,
        testVariants: [] as { name: string; percentage: number; description: string }[],

        // Automation
        autoStart: false,
        autoStop: false,
        sendTime: '',
        timezone: 'Asia/Riyadh',

        // Notifications
        notifyOnStart: true,
        notifyOnComplete: true,
        notifyOnThreshold: false,
        thresholdValue: 0,

        // ═══ TAGS & NOTES ═══
        tags: [] as string[],
        internalNotes: '',
        externalNotes: '',

        // ═══ COMPLIANCE & APPROVAL ═══
        requiresApproval: false,
        approvedBy: '',
        approvalDate: '',
        complianceChecked: false,

        // ═══ EMAIL & SMS SETTINGS ═══
        fromName: '',
        fromEmail: '',
        replyToEmail: '',
        preheaderText: '',
        subjectLineA: '',
        subjectLineB: '',
        sendTimeOption: 'immediate',
        scheduledDateTime: '',
        frequencyCap: 0,
        emailTemplate: '',
        smsTemplate: '',

        // ═══ TEAM & APPROVAL ═══
        campaignManager: '',
        contentCreator: '',
        designer: '',
        approvers: [] as string[],
        approvalStatus: 'pending',
        approvalComments: '',
        approvalDateTeam: '',

        // ═══ ENHANCED TARGETING ═══
        geographicTargeting: [] as string[],
        industryTargeting: [] as string[],
        companySizeTargeting: [] as string[],
        inclusionCriteria: '',
        exclusionCriteria: '',

        // ═══ ENHANCED BUDGET ═══
        agencyCosts: 0,
        creativeCosts: 0,
        costPerLeadTarget: 0,
        costPerAcquisitionTarget: 0,
        targetROIPercent: 0,

        // ═══ INTEGRATION ═══
        crmSync: false,
        marketingPlatform: 'none',
        ga4TrackingId: '',
        reportingDashboardUrl: '',

        // ═══ STRATEGY & LEARNING ═══
        strategyNotes: '',
        lessonsLearned: '',
    })

    // Section toggles
    const [activeTab, setActiveTab] = useState('basic')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData && editMode) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }))
        }
    }, [initialData, editMode])

    // Calculate ROI automatically
    useEffect(() => {
        if (formData.plannedBudget > 0 && formData.goalRevenue > 0) {
            const expectedROI = ((formData.goalRevenue - formData.plannedBudget) / formData.plannedBudget) * 100
            setFormData(prev => ({ ...prev, expectedROI: parseFloat(expectedROI.toFixed(2)) }))
        }
        if (formData.actualSpend > 0 && formData.actualRevenue > 0) {
            const actualROI = ((formData.actualRevenue - formData.actualSpend) / formData.actualSpend) * 100
            setFormData(prev => ({ ...prev, actualROI: parseFloat(actualROI.toFixed(2)) }))
        }
    }, [formData.plannedBudget, formData.goalRevenue, formData.actualSpend, formData.actualRevenue])

    // Validate a single field
    const validateField = (field: string, value: any): string => {
        if (field === 'name' && !value?.trim()) {
            return isArabic ? 'اسم الحملة مطلوب' : 'Campaign name is required'
        }
        if (field === 'plannedBudget' && (!value || value <= 0)) {
            return isArabic ? 'الميزانية يجب أن تكون أكبر من صفر' : 'Budget must be greater than zero'
        }
        return ''
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        const nameError = validateField('name', formData.name)
        if (nameError) newErrors.name = nameError

        setErrors(newErrors)
        setTouched({ name: true })

        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error when user starts typing
        if (touched[field] && errors[field]) {
            const error = validateField(field, value)
            setErrors(prev => ({ ...prev, [field]: error }))
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

    const toggleChannel = (channel: string) => {
        const channels = formData.channels.includes(channel)
            ? formData.channels.filter(c => c !== channel)
            : [...formData.channels, channel]
        handleChange('channels', channels)
    }

    const toggleSegment = (segment: string) => {
        const segments = formData.targetAudience.includes(segment)
            ? formData.targetAudience.filter(s => s !== segment)
            : [...formData.targetAudience, segment]
        handleChange('targetAudience', segments)
    }

    const toggleRegion = (region: string) => {
        const regions = formData.geographicTargeting.includes(region)
            ? formData.geographicTargeting.filter(r => r !== region)
            : [...formData.geographicTargeting, region]
        handleChange('geographicTargeting', regions)
    }

    const toggleIndustry = (industry: string) => {
        const industries = formData.industryTargeting.includes(industry)
            ? formData.industryTargeting.filter(i => i !== industry)
            : [...formData.industryTargeting, industry]
        handleChange('industryTargeting', industries)
    }

    const toggleCompanySize = (size: string) => {
        const sizes = formData.companySizeTargeting.includes(size)
            ? formData.companySizeTargeting.filter(s => s !== size)
            : [...formData.companySizeTargeting, size]
        handleChange('companySizeTargeting', sizes)
    }

    const toggleApprover = (approver: string) => {
        const approvers = formData.approvers.includes(approver)
            ? formData.approvers.filter(a => a !== approver)
            : [...formData.approvers, approver]
        handleChange('approvers', approvers)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const campaignData = {
            ...formData
        }

        if (editMode && campaignId) {
            updateCampaignMutation.mutate({ id: campaignId, data: campaignData }, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.campaigns.list })
                }
            })
        } else {
            createCampaignMutation.mutate(campaignData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.campaigns.list })
                }
            })
        }
    }

    const topNav = [
        { title: isArabic ? 'نظرة عامة' : 'Overview', href: ROUTES.dashboard.home, isActive: false },
        { title: isArabic ? 'إدارة علاقات العملاء' : 'CRM', href: ROUTES.dashboard.crm.campaigns.list, isActive: true },
    ]

    const getCampaignTypeData = (type: string) => {
        return CAMPAIGN_TYPES.find(t => t.value === type) || CAMPAIGN_TYPES[0]
    }

    const getStatusData = (status: string) => {
        return CAMPAIGN_STATUSES.find(s => s.value === status) || CAMPAIGN_STATUSES[0]
    }

    const isLoading = createCampaignMutation.isPending || updateCampaignMutation.isPending

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
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge={isArabic ? "إدارة علاقات العملاء" : "CRM"}
                    title={editMode ? (isArabic ? "تحرير الحملة" : "Edit Campaign") : (isArabic ? "إنشاء حملة" : "Create Campaign")}
                    type="crm"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
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

                                <Separator />

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* BASIC / ADVANCED MODE TOGGLE */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-2xl border border-purple-200">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("px-4 py-2 rounded-lg font-medium transition-all", !isAdvancedMode ? "bg-white text-purple-700 shadow-md" : "text-slate-500")}>
                                            {isArabic ? 'عرض أساسي' : 'Basic View'}
                                        </div>
                                        <Switch
                                            checked={isAdvancedMode}
                                            onCheckedChange={setIsAdvancedMode}
                                            className="data-[state=checked]:bg-purple-600"
                                        />
                                        <div className={cn("px-4 py-2 rounded-lg font-medium transition-all", isAdvancedMode ? "bg-white text-purple-700 shadow-md" : "text-slate-500")}>
                                            {isArabic ? 'عرض متقدم' : 'Advanced View'}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* CAMPAIGN TYPE SELECTOR */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Megaphone className="w-4 h-4 text-emerald-500" />
                                        {isArabic ? 'نوع الحملة' : 'Campaign Type'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                        {CAMPAIGN_TYPES.map((type) => {
                                            const Icon = type.icon
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handleChange('type', type.value)}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 text-center transition-all",
                                                        formData.type === type.value
                                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 mx-auto mb-1",
                                                        formData.type === type.value ? "text-emerald-500" : "text-slate-400"
                                                    )} />
                                                    <span className="text-xs font-medium">
                                                        {isArabic ? type.labelAr : type.labelEn}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* STATUS WORKFLOW SELECTOR */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-emerald-500" />
                                        {isArabic ? 'حالة الحملة' : 'Campaign Status'}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {CAMPAIGN_STATUSES.map((status) => {
                                            const Icon = status.icon
                                            return (
                                                <button
                                                    key={status.value}
                                                    type="button"
                                                    onClick={() => handleChange('status', status.value)}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 text-center transition-all",
                                                        formData.status === status.value
                                                            ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                                            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "w-5 h-5 mx-auto mb-1",
                                                        formData.status === status.value ? `text-${status.color}-500` : "text-slate-400"
                                                    )} />
                                                    <span className="text-xs font-medium">
                                                        {isArabic ? status.labelAr : status.labelEn}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Separator />

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
                                                        <label className="text-sm font-medium text-slate-700">القسم / الفريق المسؤول</label>
                                                        <Input
                                                            placeholder="مثال: قسم التسويق"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">رقم مشروع الحملة</label>
                                                        <Input
                                                            placeholder="مثال: CAMP-2024-001"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                )}

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* TABBED SECTIONS - Enterprise Campaign Management */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className={cn("grid w-full bg-slate-100 rounded-xl p-1", isAdvancedMode ? "grid-cols-7" : "grid-cols-5")}>
                                        <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white">
                                            <FileText className="w-4 h-4 me-2" />
                                            {isArabic ? 'أساسي' : 'Basic'}
                                        </TabsTrigger>
                                        <TabsTrigger value="targeting" className="rounded-lg data-[state=active]:bg-white">
                                            <Target className="w-4 h-4 me-2" />
                                            {isArabic ? 'الاستهداف' : 'Targeting'}
                                        </TabsTrigger>
                                        <TabsTrigger value="budget" className="rounded-lg data-[state=active]:bg-white">
                                            <DollarSign className="w-4 h-4 me-2" />
                                            {isArabic ? 'الميزانية' : 'Budget'}
                                        </TabsTrigger>
                                        <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-white">
                                            <MessageSquare className="w-4 h-4 me-2" />
                                            {isArabic ? 'المحتوى' : 'Content'}
                                        </TabsTrigger>
                                        <TabsTrigger value="channels" className="rounded-lg data-[state=active]:bg-white">
                                            <Globe className="w-4 h-4 me-2" />
                                            {isArabic ? 'القنوات' : 'Channels'}
                                        </TabsTrigger>
                                        {isAdvancedMode && (
                                            <>
                                                <TabsTrigger value="email-sms" className="rounded-lg data-[state=active]:bg-white">
                                                    <Send className="w-4 h-4 me-2" />
                                                    {isArabic ? 'البريد والرسائل' : 'Email & SMS'}
                                                </TabsTrigger>
                                                <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-white">
                                                    <Users2 className="w-4 h-4 me-2" />
                                                    {isArabic ? 'الفريق والموافقة' : 'Team & Approval'}
                                                </TabsTrigger>
                                            </>
                                        )}
                                    </TabsList>

                                    {/* ═══ TAB 1: BASIC INFO ═══ */}
                                    <TabsContent value="basic" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'اسم الحملة (إنجليزي)' : 'Campaign Name (English)'}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: Summer Campaign 2024" : "e.g., Summer Campaign 2024"}
                                                    className={cn(
                                                        "rounded-xl border-slate-200 focus:border-emerald-500",
                                                        touched.name && errors.name && "border-red-500"
                                                    )}
                                                    value={formData.name}
                                                    onChange={(e) => handleChange('name', e.target.value)}
                                                    onBlur={() => handleBlur('name')}
                                                />
                                                {touched.name && errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'اسم الحملة (عربي)' : 'Campaign Name (Arabic)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: حملة الصيف 2024" : "e.g., حملة الصيف 2024"}
                                                    className="rounded-xl border-slate-200 focus:border-emerald-500"
                                                    value={formData.nameAr}
                                                    onChange={(e) => handleChange('nameAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "وصف الحملة بالإنجليزية..." : "Campaign description..."}
                                                className="min-h-[100px] rounded-xl border-slate-200"
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "وصف الحملة بالعربية..." : "وصف الحملة..."}
                                                className="min-h-[100px] rounded-xl border-slate-200"
                                                value={formData.descriptionAr}
                                                onChange={(e) => handleChange('descriptionAr', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'الهدف (إنجليزي)' : 'Objective (English)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: Increase brand awareness" : "e.g., Increase brand awareness"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.objective}
                                                    onChange={(e) => handleChange('objective', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'الهدف (عربي)' : 'Objective (Arabic)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: زيادة الوعي بالعلامة التجارية" : "مثال: زيادة الوعي"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.objectiveAr}
                                                    onChange={(e) => handleChange('objectiveAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'تاريخ البدء' : 'Start Date'}
                                                </label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.startDate}
                                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'تاريخ الانتهاء' : 'End Date'}
                                                </label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.endDate}
                                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'تاريخ الإطلاق' : 'Launch Date'}
                                                </label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.launchDate}
                                                    onChange={(e) => handleChange('launchDate', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'الوسوم' : 'Tags'}
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
                                                    placeholder={isArabic ? "أضف وسم..." : "Add tag..."}
                                                    className="rounded-xl flex-1"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                                />
                                                <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 2: TARGETING ═══ */}
                                    <TabsContent value="targeting" className="space-y-6 mt-6">
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'شرائح الجمهور المستهدف' : 'Target Audience Segments'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {AUDIENCE_SEGMENTS.map((segment) => (
                                                    <div
                                                        key={segment.value}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                                            formData.targetAudience.includes(segment.value)
                                                                ? "border-emerald-500 bg-emerald-50"
                                                                : "border-slate-200 hover:border-emerald-300"
                                                        )}
                                                        onClick={() => toggleSegment(segment.value)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={formData.targetAudience.includes(segment.value)}
                                                                onCheckedChange={() => toggleSegment(segment.value)}
                                                            />
                                                            <span className="text-sm font-medium">
                                                                {isArabic ? segment.labelAr : segment.labelEn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Geographic Targeting */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                {isArabic ? 'الاستهداف الجغرافي (المناطق السعودية)' : 'Geographic Targeting (Saudi Regions)'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {SAUDI_REGIONS.map((region) => (
                                                    <div
                                                        key={region.value}
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                            formData.geographicTargeting.includes(region.value)
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-slate-200 hover:border-blue-300"
                                                        )}
                                                        onClick={() => toggleRegion(region.value)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={formData.geographicTargeting.includes(region.value)}
                                                                onCheckedChange={() => toggleRegion(region.value)}
                                                            />
                                                            <span className="text-xs font-medium">
                                                                {isArabic ? region.labelAr : region.labelEn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Industry Targeting */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-purple-500" />
                                                {isArabic ? 'استهداف الصناعة' : 'Industry Targeting'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {INDUSTRIES.map((industry) => (
                                                    <div
                                                        key={industry.value}
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                            formData.industryTargeting.includes(industry.value)
                                                                ? "border-purple-500 bg-purple-50"
                                                                : "border-slate-200 hover:border-purple-300"
                                                        )}
                                                        onClick={() => toggleIndustry(industry.value)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={formData.industryTargeting.includes(industry.value)}
                                                                onCheckedChange={() => toggleIndustry(industry.value)}
                                                            />
                                                            <span className="text-xs font-medium">
                                                                {isArabic ? industry.labelAr : industry.labelEn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Company Size Targeting */}
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-orange-500" />
                                                {isArabic ? 'استهداف حجم الشركة' : 'Company Size Targeting'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {COMPANY_SIZES.map((size) => (
                                                    <div
                                                        key={size.value}
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                            formData.companySizeTargeting.includes(size.value)
                                                                ? "border-orange-500 bg-orange-50"
                                                                : "border-slate-200 hover:border-orange-300"
                                                        )}
                                                        onClick={() => toggleCompanySize(size.value)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={formData.companySizeTargeting.includes(size.value)}
                                                                onCheckedChange={() => toggleCompanySize(size.value)}
                                                            />
                                                            <span className="text-xs font-medium">
                                                                {isArabic ? size.labelAr : size.labelEn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Inclusion/Exclusion Criteria */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    {isArabic ? 'معايير التضمين' : 'Inclusion Criteria'}
                                                </label>
                                                <Textarea
                                                    placeholder={isArabic ? "صف من يجب تضمينه في هذه الحملة..." : "Describe who should be included in this campaign..."}
                                                    className="min-h-[100px] rounded-xl border-slate-200"
                                                    value={formData.inclusionCriteria}
                                                    onChange={(e) => handleChange('inclusionCriteria', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    {isArabic ? 'معايير الاستبعاد' : 'Exclusion Criteria'}
                                                </label>
                                                <Textarea
                                                    placeholder={isArabic ? "صف من يجب استبعاده من هذه الحملة..." : "Describe who should be excluded from this campaign..."}
                                                    className="min-h-[100px] rounded-xl border-slate-200"
                                                    value={formData.exclusionCriteria}
                                                    onChange={(e) => handleChange('exclusionCriteria', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'شرائح مخصصة' : 'Custom Segments'}
                                            </label>
                                            <Input
                                                placeholder={isArabic ? "مثال: قطاع الأعمال، القطاع العقاري (افصل بفاصلة)" : "e.g., Business sector, Real estate (comma-separated)"}
                                                className="rounded-xl border-slate-200"
                                                value={formData.customSegments.join(', ')}
                                                onChange={(e) => handleChange('customSegments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'الوصول المتوقع' : 'Estimated Reach'}
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="rounded-xl border-slate-200"
                                                value={formData.estimatedReach || ''}
                                                onChange={(e) => handleChange('estimatedReach', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 3: BUDGET & GOALS ═══ */}
                                    <TabsContent value="budget" className="space-y-6 mt-6">
                                        {/* Budget */}
                                        <div className="p-4 bg-emerald-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-emerald-800 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                {isArabic ? 'الميزانية' : 'Budget'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الميزانية المخططة' : 'Planned Budget'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.plannedBudget || ''}
                                                        onChange={(e) => handleChange('plannedBudget', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'الإنفاق الفعلي' : 'Actual Spend'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.actualSpend || ''}
                                                        onChange={(e) => handleChange('actualSpend', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'العملة' : 'Currency'}</label>
                                                    <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                                                        <SelectTrigger className="rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                            <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                            <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Budget Breakdown */}
                                        <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                <Calculator className="w-4 h-4" />
                                                {isArabic ? 'تفصيل التكاليف' : 'Cost Breakdown'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'تكاليف الوكالة' : 'Agency Costs'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.agencyCosts || ''}
                                                        onChange={(e) => handleChange('agencyCosts', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'تكاليف الإبداع' : 'Creative Costs'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.creativeCosts || ''}
                                                        onChange={(e) => handleChange('creativeCosts', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف تكلفة العميل المحتمل' : 'Cost per Lead Target'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.costPerLeadTarget || ''}
                                                        onChange={(e) => handleChange('costPerLeadTarget', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف تكلفة الاكتساب' : 'Cost per Acquisition Target'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.costPerAcquisitionTarget || ''}
                                                        onChange={(e) => handleChange('costPerAcquisitionTarget', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Target ROI */}
                                        <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                <Percent className="w-4 h-4" />
                                                {isArabic ? 'هدف عائد الاستثمار' : 'Target ROI'}
                                            </h4>
                                            <div className="space-y-2">
                                                <label className="text-xs text-slate-600">{isArabic ? 'نسبة عائد الاستثمار المستهدفة (%)' : 'Target ROI Percentage (%)'}</label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    className="rounded-lg"
                                                    value={formData.targetROIPercent || ''}
                                                    onChange={(e) => handleChange('targetROIPercent', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>

                                        {/* Goals & KPIs */}
                                        <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                <Target className="w-4 h-4" />
                                                {isArabic ? 'الأهداف ومؤشرات الأداء' : 'Goals & KPIs'}
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف العملاء المحتملين' : 'Lead Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="rounded-lg"
                                                        value={formData.goalLeads || ''}
                                                        onChange={(e) => handleChange('goalLeads', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف التحويلات' : 'Conversion Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="rounded-lg"
                                                        value={formData.goalConversions || ''}
                                                        onChange={(e) => handleChange('goalConversions', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف الإيرادات' : 'Revenue Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="rounded-lg"
                                                        value={formData.goalRevenue || ''}
                                                        onChange={(e) => handleChange('goalRevenue', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف التفاعل' : 'Engagement Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="rounded-lg"
                                                        value={formData.goalEngagement || ''}
                                                        onChange={(e) => handleChange('goalEngagement', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف النقرات' : 'Clicks Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="rounded-lg"
                                                        value={formData.goalClicks || ''}
                                                        onChange={(e) => handleChange('goalClicks', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'هدف الظهور' : 'Impressions Goal'}</label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        className="rounded-lg"
                                                        value={formData.goalImpressions || ''}
                                                        onChange={(e) => handleChange('goalImpressions', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ROI Display */}
                                        {(formData.expectedROI > 0 || formData.actualROI > 0) && (
                                            <div className="p-4 bg-purple-50 rounded-xl">
                                                <h4 className="font-medium text-purple-800 flex items-center gap-2 mb-4">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {isArabic ? 'عائد الاستثمار (ROI)' : 'Return on Investment (ROI)'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="p-3 bg-white rounded-lg">
                                                        <p className="text-xs text-slate-600 mb-1">{isArabic ? 'ROI المتوقع' : 'Expected ROI'}</p>
                                                        <p className="text-2xl font-bold text-purple-600">{formData.expectedROI.toFixed(2)}%</p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg">
                                                        <p className="text-xs text-slate-600 mb-1">{isArabic ? 'ROI الفعلي' : 'Actual ROI'}</p>
                                                        <p className="text-2xl font-bold text-emerald-600">{formData.actualROI.toFixed(2)}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* ═══ TAB 4: CONTENT ═══ */}
                                    <TabsContent value="content" className="space-y-6 mt-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'العنوان (إنجليزي)' : 'Subject (English)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "عنوان الحملة..." : "Campaign subject..."}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.subject}
                                                    onChange={(e) => handleChange('subject', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'العنوان (عربي)' : 'Subject (Arabic)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "عنوان الحملة..." : "عنوان الحملة..."}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.subjectAr}
                                                    onChange={(e) => handleChange('subjectAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "محتوى الرسالة بالإنجليزية..." : "Message content..."}
                                                className="min-h-[150px] rounded-xl border-slate-200"
                                                value={formData.content}
                                                onChange={(e) => handleChange('content', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                                            </label>
                                            <Textarea
                                                placeholder={isArabic ? "محتوى الرسالة بالعربية..." : "محتوى الرسالة..."}
                                                className="min-h-[150px] rounded-xl border-slate-200"
                                                value={formData.contentAr}
                                                onChange={(e) => handleChange('contentAr', e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'دعوة لاتخاذ إجراء (إنجليزي)' : 'Call to Action (English)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: Register Now" : "e.g., Register Now"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.callToAction}
                                                    onChange={(e) => handleChange('callToAction', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">
                                                    {isArabic ? 'دعوة لاتخاذ إجراء (عربي)' : 'Call to Action (Arabic)'}
                                                </label>
                                                <Input
                                                    placeholder={isArabic ? "مثال: سجل الآن" : "مثال: سجل الآن"}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.callToActionAr}
                                                    onChange={(e) => handleChange('callToActionAr', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Link2 className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'رابط الصفحة المقصودة' : 'Landing Page URL'}
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/campaign"
                                                className="rounded-xl border-slate-200"
                                                value={formData.landingPageUrl}
                                                onChange={(e) => handleChange('landingPageUrl', e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 5: CHANNELS & UTM ═══ */}
                                    <TabsContent value="channels" className="space-y-6 mt-6">
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-emerald-500" />
                                                {isArabic ? 'قنوات التسويق' : 'Marketing Channels'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {CHANNELS.map((channel) => (
                                                    <div
                                                        key={channel.value}
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all text-center",
                                                            formData.channels.includes(channel.value)
                                                                ? "border-emerald-500 bg-emerald-50"
                                                                : "border-slate-200 hover:border-emerald-300"
                                                        )}
                                                        onClick={() => toggleChannel(channel.value)}
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Checkbox
                                                                checked={formData.channels.includes(channel.value)}
                                                                onCheckedChange={() => toggleChannel(channel.value)}
                                                            />
                                                            <span className="text-xs font-medium">
                                                                {isArabic ? channel.labelAr : channel.labelEn}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                {isArabic ? 'القناة الرئيسية' : 'Primary Channel'}
                                            </label>
                                            <Select value={formData.primaryChannel} onValueChange={(v) => handleChange('primaryChannel', v)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder={isArabic ? "اختر القناة الرئيسية" : "Select primary channel"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CHANNELS.map((channel) => (
                                                        <SelectItem key={channel.value} value={channel.value}>
                                                            {isArabic ? channel.labelAr : channel.labelEn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* UTM Parameters */}
                                        <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                                            <h4 className="font-medium text-amber-800 flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                {isArabic ? 'معايير UTM للتتبع' : 'UTM Tracking Parameters'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">UTM Source</label>
                                                    <Input
                                                        placeholder="e.g., facebook, google, newsletter"
                                                        className="rounded-lg"
                                                        value={formData.utmSource}
                                                        onChange={(e) => handleChange('utmSource', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">UTM Medium</label>
                                                    <Input
                                                        placeholder="e.g., cpc, email, social"
                                                        className="rounded-lg"
                                                        value={formData.utmMedium}
                                                        onChange={(e) => handleChange('utmMedium', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">UTM Campaign</label>
                                                    <Input
                                                        placeholder="e.g., summer_sale_2024"
                                                        className="rounded-lg"
                                                        value={formData.utmCampaign}
                                                        onChange={(e) => handleChange('utmCampaign', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">UTM Term</label>
                                                    <Input
                                                        placeholder="e.g., legal+services"
                                                        className="rounded-lg"
                                                        value={formData.utmTerm}
                                                        onChange={(e) => handleChange('utmTerm', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs text-slate-600">UTM Content</label>
                                                    <Input
                                                        placeholder="e.g., banner_ad, text_link"
                                                        className="rounded-lg"
                                                        value={formData.utmContent}
                                                        onChange={(e) => handleChange('utmContent', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Generated UTM URL */}
                                            {formData.landingPageUrl && formData.utmSource && (
                                                <div className="p-3 bg-white rounded-lg border border-amber-200">
                                                    <p className="text-xs text-slate-600 mb-2">{isArabic ? 'الرابط مع معايير UTM:' : 'Generated UTM URL:'}</p>
                                                    <p className="text-xs font-mono text-slate-700 break-all">
                                                        {`${formData.landingPageUrl}?utm_source=${formData.utmSource}&utm_medium=${formData.utmMedium}&utm_campaign=${formData.utmCampaign}${formData.utmTerm ? `&utm_term=${formData.utmTerm}` : ''}${formData.utmContent ? `&utm_content=${formData.utmContent}` : ''}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* ═══ TAB 6: EMAIL & SMS SETTINGS (Advanced Only) ═══ */}
                                    {isAdvancedMode && (
                                        <TabsContent value="email-sms" className="space-y-6 mt-6">
                                            {/* Email Settings */}
                                            <div className="p-4 bg-blue-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                                                    <Mail className="w-4 h-4" />
                                                    {isArabic ? 'إعدادات البريد الإلكتروني' : 'Email Settings'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <AtSign className="w-3 h-3" />
                                                            {isArabic ? 'اسم المرسل' : 'From Name'}
                                                        </label>
                                                        <Input
                                                            placeholder={isArabic ? "مثال: شركة المحاماة" : "e.g., Law Firm"}
                                                            className="rounded-lg"
                                                            value={formData.fromName}
                                                            onChange={(e) => handleChange('fromName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {isArabic ? 'بريد المرسل' : 'From Email'}
                                                        </label>
                                                        <Input
                                                            type="email"
                                                            placeholder="info@lawfirm.com"
                                                            className="rounded-lg"
                                                            value={formData.fromEmail}
                                                            onChange={(e) => handleChange('fromEmail', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <MessageCircle className="w-3 h-3" />
                                                            {isArabic ? 'بريد الرد' : 'Reply-to Email'}
                                                        </label>
                                                        <Input
                                                            type="email"
                                                            placeholder="reply@lawfirm.com"
                                                            className="rounded-lg"
                                                            value={formData.replyToEmail}
                                                            onChange={(e) => handleChange('replyToEmail', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'نص ما قبل العنوان' : 'Preheader Text'}</label>
                                                        <Input
                                                            placeholder={isArabic ? "نص المعاينة..." : "Preview text..."}
                                                            className="rounded-lg"
                                                            value={formData.preheaderText}
                                                            onChange={(e) => handleChange('preheaderText', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* A/B Testing Subject Lines */}
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                    <TestTube className="w-4 h-4" />
                                                    {isArabic ? 'اختبار A/B لسطر الموضوع' : 'Subject Line A/B Testing'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'سطر الموضوع A' : 'Subject Line A'}</label>
                                                        <Input
                                                            placeholder={isArabic ? "الخيار الأول..." : "First option..."}
                                                            className="rounded-lg"
                                                            value={formData.subjectLineA}
                                                            onChange={(e) => handleChange('subjectLineA', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'سطر الموضوع B' : 'Subject Line B'}</label>
                                                        <Input
                                                            placeholder={isArabic ? "الخيار الثاني..." : "Second option..."}
                                                            className="rounded-lg"
                                                            value={formData.subjectLineB}
                                                            onChange={(e) => handleChange('subjectLineB', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Send Time & Frequency */}
                                            <div className="p-4 bg-amber-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-amber-800 flex items-center gap-2">
                                                    <Clock3 className="w-4 h-4" />
                                                    {isArabic ? 'وقت الإرسال والتكرار' : 'Send Time & Frequency'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'وقت الإرسال' : 'Send Time'}</label>
                                                        <Select value={formData.sendTimeOption} onValueChange={(v) => handleChange('sendTimeOption', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {SEND_TIME_OPTIONS.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {isArabic ? option.labelAr : option.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {formData.sendTimeOption === 'scheduled' && (
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-slate-600">{isArabic ? 'التاريخ والوقت المجدول' : 'Scheduled Date & Time'}</label>
                                                            <Input
                                                                type="datetime-local"
                                                                className="rounded-lg"
                                                                value={formData.scheduledDateTime}
                                                                onChange={(e) => handleChange('scheduledDateTime', e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'حد التكرار (رسائل/يوم)' : 'Frequency Cap (emails/day)'}</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0 = unlimited"
                                                            className="rounded-lg"
                                                            value={formData.frequencyCap || ''}
                                                            onChange={(e) => handleChange('frequencyCap', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Templates */}
                                            <div className="p-4 bg-green-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-green-800 flex items-center gap-2">
                                                    <FileCode className="w-4 h-4" />
                                                    {isArabic ? 'القوالب' : 'Templates'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {isArabic ? 'قالب البريد الإلكتروني' : 'Email Template'}
                                                        </label>
                                                        <Select value={formData.emailTemplate} onValueChange={(v) => handleChange('emailTemplate', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue placeholder={isArabic ? "اختر قالب..." : "Select template..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="template-1">{isArabic ? 'قالب احترافي' : 'Professional Template'}</SelectItem>
                                                                <SelectItem value="template-2">{isArabic ? 'قالب حديث' : 'Modern Template'}</SelectItem>
                                                                <SelectItem value="template-3">{isArabic ? 'قالب بسيط' : 'Simple Template'}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Smartphone className="w-3 h-3" />
                                                            {isArabic ? 'قالب الرسائل النصية' : 'SMS Template'}
                                                        </label>
                                                        <Select value={formData.smsTemplate} onValueChange={(v) => handleChange('smsTemplate', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue placeholder={isArabic ? "اختر قالب..." : "Select template..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="sms-1">{isArabic ? 'قالب قصير' : 'Short Template'}</SelectItem>
                                                                <SelectItem value="sms-2">{isArabic ? 'قالب متوسط' : 'Medium Template'}</SelectItem>
                                                                <SelectItem value="sms-3">{isArabic ? 'قالب مع رابط' : 'Template with Link'}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    )}

                                    {/* ═══ TAB 7: TEAM & APPROVAL (Advanced Only) ═══ */}
                                    {isAdvancedMode && (
                                        <TabsContent value="team" className="space-y-6 mt-6">
                                            {/* Team Members */}
                                            <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-indigo-800 flex items-center gap-2">
                                                    <Users2 className="w-4 h-4" />
                                                    {isArabic ? 'أعضاء الفريق' : 'Team Members'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'مدير الحملة' : 'Campaign Manager'}</label>
                                                        <Select value={formData.campaignManager} onValueChange={(v) => handleChange('campaignManager', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue placeholder={isArabic ? "اختر..." : "Select..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STAFF_MEMBERS.map((staff) => (
                                                                    <SelectItem key={staff.value} value={staff.value}>
                                                                        {isArabic ? staff.labelAr : staff.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'كاتب المحتوى' : 'Content Creator'}</label>
                                                        <Select value={formData.contentCreator} onValueChange={(v) => handleChange('contentCreator', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue placeholder={isArabic ? "اختر..." : "Select..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STAFF_MEMBERS.map((staff) => (
                                                                    <SelectItem key={staff.value} value={staff.value}>
                                                                        {isArabic ? staff.labelAr : staff.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'المصمم' : 'Designer'}</label>
                                                        <Select value={formData.designer} onValueChange={(v) => handleChange('designer', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue placeholder={isArabic ? "اختر..." : "Select..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {STAFF_MEMBERS.map((staff) => (
                                                                    <SelectItem key={staff.value} value={staff.value}>
                                                                        {isArabic ? staff.labelAr : staff.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Approvers */}
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                    <Shield className="w-4 h-4" />
                                                    {isArabic ? 'الموافقون' : 'Approvers'}
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {STAFF_MEMBERS.map((staff) => (
                                                        <div
                                                            key={staff.value}
                                                            className={cn(
                                                                "p-3 rounded-xl border-2 cursor-pointer transition-all",
                                                                formData.approvers.includes(staff.value)
                                                                    ? "border-purple-500 bg-purple-100"
                                                                    : "border-slate-200 hover:border-purple-300"
                                                            )}
                                                            onClick={() => toggleApprover(staff.value)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    checked={formData.approvers.includes(staff.value)}
                                                                    onCheckedChange={() => toggleApprover(staff.value)}
                                                                />
                                                                <span className="text-xs font-medium">
                                                                    {isArabic ? staff.labelAr : staff.labelEn}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Approval Status */}
                                            <div className="p-4 bg-emerald-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-emerald-800 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {isArabic ? 'حالة الموافقة' : 'Approval Status'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'الحالة' : 'Status'}</label>
                                                        <Select value={formData.approvalStatus} onValueChange={(v) => handleChange('approvalStatus', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {APPROVAL_STATUSES.map((status) => (
                                                                    <SelectItem key={status.value} value={status.value}>
                                                                        {isArabic ? status.labelAr : status.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'تاريخ الموافقة' : 'Approval Date'}</label>
                                                        <Input
                                                            type="date"
                                                            className="rounded-lg"
                                                            value={formData.approvalDateTeam}
                                                            onChange={(e) => handleChange('approvalDateTeam', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs text-slate-600">{isArabic ? 'ملاحظات الموافقة' : 'Approval Comments'}</label>
                                                    <Textarea
                                                        placeholder={isArabic ? "أضف ملاحظات أو طلبات تعديل..." : "Add comments or change requests..."}
                                                        className="min-h-[100px] rounded-lg"
                                                        value={formData.approvalComments}
                                                        onChange={(e) => handleChange('approvalComments', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    )}
                                </Tabs>

                                {/* ═══════════════════════════════════════════════════════════════ */}
                                {/* ADVANCED SETTINGS - Collapsible */}
                                {/* ═══════════════════════════════════════════════════════════════ */}
                                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                                    <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-8">
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-xl border border-slate-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Settings className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="text-start">
                                                        <h3 className="text-lg font-semibold text-slate-800">
                                                            {isArabic ? 'الإعدادات المتقدمة' : 'Advanced Settings'}
                                                        </h3>
                                                        <p className="text-xs text-slate-500">
                                                            {isArabic ? 'تتبع ROI، نماذج الإسناد، اختبار A/B، والأتمتة' : 'ROI tracking, attribution, A/B testing, and automation'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </Button>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="mt-6 space-y-6">
                                            {/* ROI Tracking */}
                                            <div className="p-4 bg-purple-50 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-purple-800 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4" />
                                                        {isArabic ? 'تتبع عائد الاستثمار' : 'ROI Tracking'}
                                                    </h4>
                                                    <Switch
                                                        checked={formData.enableROITracking}
                                                        onCheckedChange={(c) => handleChange('enableROITracking', c)}
                                                    />
                                                </div>

                                                {formData.enableROITracking && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-slate-600">{isArabic ? 'تكلفة العميل المحتمل' : 'Cost Per Lead'}</label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="rounded-lg"
                                                                value={formData.costPerLead || ''}
                                                                onChange={(e) => handleChange('costPerLead', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-slate-600">{isArabic ? 'تكلفة التحويل' : 'Cost Per Conversion'}</label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="rounded-lg"
                                                                value={formData.costPerConversion || ''}
                                                                onChange={(e) => handleChange('costPerConversion', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attribution Model */}
                                            <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-indigo-800 flex items-center gap-2">
                                                    <BarChart3 className="w-4 h-4" />
                                                    {isArabic ? 'نموذج الإسناد' : 'Attribution Model'}
                                                </h4>
                                                <Select value={formData.attributionModel} onValueChange={(v) => handleChange('attributionModel', v)}>
                                                    <SelectTrigger className="rounded-lg">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ATTRIBUTION_MODELS.map((model) => (
                                                            <SelectItem key={model.value} value={model.value}>
                                                                {isArabic ? model.labelAr : model.labelEn}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* A/B Testing */}
                                            <div className="p-4 bg-green-50 rounded-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-green-800 flex items-center gap-2">
                                                        <TestTube className="w-4 h-4" />
                                                        {isArabic ? 'اختبار A/B' : 'A/B Testing'}
                                                    </h4>
                                                    <Switch
                                                        checked={formData.enableABTesting}
                                                        onCheckedChange={(c) => handleChange('enableABTesting', c)}
                                                    />
                                                </div>

                                                {formData.enableABTesting && (
                                                    <div className="text-center p-4">
                                                        <p className="text-sm text-slate-600">
                                                            {isArabic ? 'يمكنك إضافة متغيرات الاختبار بعد إنشاء الحملة' : 'You can add test variants after creating the campaign'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Automation */}
                                            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                    {isArabic ? 'الأتمتة' : 'Automation'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.autoStart} onCheckedChange={(c) => handleChange('autoStart', c)} />
                                                        <label className="text-sm">{isArabic ? 'بدء تلقائي' : 'Auto Start'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.autoStop} onCheckedChange={(c) => handleChange('autoStop', c)} />
                                                        <label className="text-sm">{isArabic ? 'إيقاف تلقائي' : 'Auto Stop'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.notifyOnStart} onCheckedChange={(c) => handleChange('notifyOnStart', c)} />
                                                        <label className="text-sm">{isArabic ? 'إشعار عند البدء' : 'Notify on Start'}</label>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.notifyOnComplete} onCheckedChange={(c) => handleChange('notifyOnComplete', c)} />
                                                        <label className="text-sm">{isArabic ? 'إشعار عند الاكتمال' : 'Notify on Complete'}</label>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Integration Settings */}
                                            <div className="p-4 bg-cyan-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-cyan-800 flex items-center gap-2">
                                                    <Network className="w-4 h-4" />
                                                    {isArabic ? 'إعدادات التكامل' : 'Integration Settings'}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                                                        <Switch checked={formData.crmSync} onCheckedChange={(c) => handleChange('crmSync', c)} />
                                                        <label className="text-sm">{isArabic ? 'مزامنة CRM' : 'CRM Sync'}</label>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600">{isArabic ? 'منصة التسويق' : 'Marketing Platform'}</label>
                                                        <Select value={formData.marketingPlatform} onValueChange={(v) => handleChange('marketingPlatform', v)}>
                                                            <SelectTrigger className="rounded-lg">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {MARKETING_PLATFORMS.map((platform) => (
                                                                    <SelectItem key={platform.value} value={platform.value}>
                                                                        {isArabic ? platform.labelAr : platform.labelEn}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Activity className="w-3 h-3" />
                                                            {isArabic ? 'معرف تتبع GA4' : 'GA4 Tracking ID'}
                                                        </label>
                                                        <Input
                                                            placeholder="G-XXXXXXXXXX"
                                                            className="rounded-lg"
                                                            value={formData.ga4TrackingId}
                                                            onChange={(e) => handleChange('ga4TrackingId', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" />
                                                            {isArabic ? 'رابط لوحة التقارير' : 'Reporting Dashboard URL'}
                                                        </label>
                                                        <Input
                                                            type="url"
                                                            placeholder="https://dashboard.example.com"
                                                            className="rounded-lg"
                                                            value={formData.reportingDashboardUrl}
                                                            onChange={(e) => handleChange('reportingDashboardUrl', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Strategy & Learning */}
                                            <div className="p-4 bg-indigo-50 rounded-xl space-y-4">
                                                <h4 className="font-medium text-indigo-800 flex items-center gap-2">
                                                    <Brain className="w-4 h-4" />
                                                    {isArabic ? 'الاستراتيجية والتعلم' : 'Strategy & Learning'}
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <Lightbulb className="w-3 h-3" />
                                                            {isArabic ? 'ملاحظات الاستراتيجية' : 'Strategy Notes'}
                                                        </label>
                                                        <Textarea
                                                            className="rounded-lg min-h-[100px]"
                                                            placeholder={isArabic ? "وثق استراتيجية الحملة والنهج..." : "Document campaign strategy and approach..."}
                                                            value={formData.strategyNotes}
                                                            onChange={(e) => handleChange('strategyNotes', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-slate-600 flex items-center gap-1">
                                                            <BookMarked className="w-3 h-3" />
                                                            {isArabic ? 'الدروس المستفادة' : 'Lessons Learned'}
                                                        </label>
                                                        <Textarea
                                                            className="rounded-lg min-h-[100px]"
                                                            placeholder={isArabic ? "ماذا نجح؟ ماذا لم ينجح؟ ماذا ستفعل بشكل مختلف؟ (للحملات المكتملة)" : "What worked? What didn't? What would you do differently? (For completed campaigns)"}
                                                            value={formData.lessonsLearned}
                                                            onChange={(e) => handleChange('lessonsLearned', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'ملاحظات داخلية' : 'Internal Notes'}
                                                    </label>
                                                    <Textarea
                                                        className="rounded-xl min-h-[100px]"
                                                        placeholder={isArabic ? "ملاحظات للفريق الداخلي..." : "Notes for internal team..."}
                                                        value={formData.internalNotes}
                                                        onChange={(e) => handleChange('internalNotes', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">
                                                        {isArabic ? 'ملاحظات خارجية' : 'External Notes'}
                                                    </label>
                                                    <Textarea
                                                        className="rounded-xl min-h-[100px]"
                                                        placeholder={isArabic ? "ملاحظات للعملاء..." : "Notes for customers..."}
                                                        value={formData.externalNotes}
                                                        onChange={(e) => handleChange('externalNotes', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.crm.campaigns.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            {isArabic ? 'إلغاء' : 'Cancel'}
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {editMode
                                                    ? (isArabic ? 'حفظ التغييرات' : 'Save Changes')
                                                    : (isArabic ? 'حفظ الحملة' : 'Save Campaign')}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* SIDEBAR - Campaign Summary */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <div className="space-y-6">
                        {/* Quick Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4">
                                {isArabic ? 'ملخص الحملة' : 'Campaign Summary'}
                            </h3>
                            <div className="space-y-3">
                                {/* Office Type */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        {isArabic ? 'نوع المكتب:' : 'Office Type:'}
                                    </span>
                                    <span className="font-medium text-slate-900">
                                        {isArabic
                                            ? FIRM_SIZE_OPTIONS.find(o => o.value === firmSize)?.label
                                            : FIRM_SIZE_OPTIONS.find(o => o.value === firmSize)?.labelEn}
                                    </span>
                                </div>

                                {/* Campaign Type */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        {isArabic ? 'النوع:' : 'Type:'}
                                    </span>
                                    <Badge variant="secondary" className="gap-1">
                                        {(() => {
                                            const typeData = getCampaignTypeData(formData.type)
                                            const Icon = typeData.icon
                                            return (
                                                <>
                                                    <Icon className="w-3 h-3" />
                                                    {isArabic ? typeData.labelAr : typeData.labelEn}
                                                </>
                                            )
                                        })()}
                                    </Badge>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        {isArabic ? 'الحالة:' : 'Status:'}
                                    </span>
                                    <Badge variant="secondary" className={`bg-${getStatusData(formData.status).color}-100 text-${getStatusData(formData.status).color}-700`}>
                                        {isArabic ? getStatusData(formData.status).labelAr : getStatusData(formData.status).labelEn}
                                    </Badge>
                                </div>

                                {/* Target Audience */}
                                {formData.targetAudience.length > 0 && (
                                    <div className="flex items-start justify-between text-sm">
                                        <span className="text-slate-600">
                                            {isArabic ? 'الجمهور:' : 'Audience:'}
                                        </span>
                                        <span className="font-medium text-slate-900 text-end">
                                            {formData.targetAudience.length} {isArabic ? 'شريحة' : 'segment(s)'}
                                        </span>
                                    </div>
                                )}

                                {/* Planned Budget */}
                                {formData.plannedBudget > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            {isArabic ? 'الميزانية:' : 'Budget:'}
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                            {formData.plannedBudget.toLocaleString()} {formData.currency}
                                        </span>
                                    </div>
                                )}

                                {/* Date Range */}
                                {formData.startDate && formData.endDate && (
                                    <div className="flex items-start justify-between text-sm">
                                        <span className="text-slate-600">
                                            {isArabic ? 'المدة:' : 'Duration:'}
                                        </span>
                                        <span className="font-medium text-slate-900 text-end text-xs">
                                            {new Date(formData.startDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                                            <br />
                                            →<br />
                                            {new Date(formData.endDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                )}

                                {/* Channels */}
                                {formData.channels.length > 0 && (
                                    <div className="flex items-start justify-between text-sm">
                                        <span className="text-slate-600">
                                            {isArabic ? 'القنوات:' : 'Channels:'}
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {formData.channels.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* KPIs Card */}
                        {(formData.goalLeads > 0 || formData.goalConversions > 0 || formData.goalRevenue > 0) && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    {isArabic ? 'الأهداف' : 'Goals'}
                                </h3>
                                <div className="space-y-2 text-sm text-blue-800">
                                    {formData.goalLeads > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span>{isArabic ? 'عملاء محتملين:' : 'Leads:'}</span>
                                            <span className="font-bold">{formData.goalLeads.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {formData.goalConversions > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span>{isArabic ? 'تحويلات:' : 'Conversions:'}</span>
                                            <span className="font-bold">{formData.goalConversions.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {formData.goalRevenue > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span>{isArabic ? 'إيرادات:' : 'Revenue:'}</span>
                                            <span className="font-bold">{formData.goalRevenue.toLocaleString()} {formData.currency}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tips Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                            <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                {isArabic ? 'نصائح لحملة ناجحة' : 'Tips for Success'}
                            </h3>
                            <ul className="space-y-2 text-sm text-emerald-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{isArabic ? 'حدد هدفاً واضحاً وقابلاً للقياس' : 'Set clear, measurable goals'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{isArabic ? 'استهدف الجمهور المناسب' : 'Target the right audience'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{isArabic ? 'استخدم معايير UTM للتتبع' : 'Use UTM parameters for tracking'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>{isArabic ? 'تابع النتائج وحسّن الأداء' : 'Monitor and optimize performance'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* ROI Preview */}
                        {formData.expectedROI > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                                <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    {isArabic ? 'عائد الاستثمار المتوقع' : 'Expected ROI'}
                                </h3>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-purple-600">{formData.expectedROI.toFixed(1)}%</p>
                                    <p className="text-xs text-purple-700 mt-2">
                                        {isArabic ? 'بناءً على الميزانية والأهداف' : 'Based on budget & goals'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Main>
        </>
    )
}

// Export as both named and default export
export default CampaignFormView
