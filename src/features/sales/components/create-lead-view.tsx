import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ArrowRight, Save, User, Phone, Mail, Building,
    DollarSign, Calendar, FileText, Target, Loader2,
    Building2, Users, ChevronDown, ChevronUp, MapPin,
    Globe, Upload, Plus, X, Hash, Tag, Boxes,
    ExternalLink, RefreshCw, Database, FolderOpen
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateLead, useUpdateLead, useLead } from '@/hooks/useAccounting'
import { useStaff } from '@/hooks/useStaff'
import type { LeadSource } from '@/services/accountingService'
import { ROUTES } from '@/constants/routes'
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

const getSourceOptions = (t: any) => [
  { value: 'website' as LeadSource, label: t('sales.leads.sources.website') },
  { value: 'referral' as LeadSource, label: t('sales.leads.sources.referral') },
  { value: 'social_media' as LeadSource, label: t('sales.leads.sources.social_media') },
  { value: 'advertisement' as LeadSource, label: t('sales.leads.sources.advertisement') },
  { value: 'cold_call' as LeadSource, label: t('sales.leads.sources.cold_call') },
  { value: 'walk_in' as LeadSource, label: t('sales.leads.sources.walk_in') },
  { value: 'other' as LeadSource, label: t('sales.leads.sources.other') },
]

const getCaseTypes = (t: any) => [
  { value: 'labor', label: t('sales.leads.caseTypes.labor') },
  { value: 'commercial', label: t('sales.leads.caseTypes.commercial') },
  { value: 'civil', label: t('sales.leads.caseTypes.civil') },
  { value: 'criminal', label: t('sales.leads.caseTypes.criminal') },
  { value: 'family', label: t('sales.leads.caseTypes.family') },
  { value: 'administrative', label: t('sales.leads.caseTypes.administrative') },
]

interface CreateLeadViewProps {
    editMode?: boolean
}

export function CreateLeadView({ editMode = false }: CreateLeadViewProps) {
  const { t } = useTranslation()
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/sales/leads/$leadId/edit' }) : null
    const leadId = params?.leadId

    const createLeadMutation = useCreateLead()
    const updateLeadMutation = useUpdateLead()
    const { data: staffData } = useStaff()
    const { data: leadData, isLoading: isLoadingLead } = useLead(leadId || '', { enabled: editMode && !!leadId })

    const lead = leadData?.data

    // Firm size selection - controls visibility of organizational fields
    const [firmSize, setFirmSize] = useState<FirmSize>('solo')
    const [showOrgFields, setShowOrgFields] = useState(false)
    const [advancedView, setAdvancedView] = useState(false)

    const [formData, setFormData] = useState({
        // Basic Fields
        firstName: lead?.firstName || '',
        lastName: lead?.lastName || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        source: lead?.source || '' as LeadSource | '',
        estimatedValue: lead?.estimatedValue || 0,
        expectedCloseDate: lead?.expectedCloseDate?.split('T')[0] || '',
        caseType: lead?.caseType || '',
        description: lead?.description || '',
        notes: lead?.notes || '',
        assignedTo: typeof lead?.assignedTo === 'object' ? lead?.assignedTo?._id : lead?.assignedTo || '',

        // Enhanced Contact Details
        linkedinUrl: '',
        twitterHandle: '',
        website: '',
        alternateEmail: '',
        alternatePhone: '',
        whatsapp: '',

        // Enhanced Company Details
        jobTitle: '',
        department: '',
        industry: '',
        vatNumber: '',
        crNumber: '',
        companyLinkedinUrl: '',
        annualRevenue: 0,
        employeeCount: 0,

        // Marketing Section
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',
        leadMagnet: '',
        landingPageUrl: '',
        marketingScore: 0,

        // Territory/Region Section
        territory: '',
        region: '',
        escalationPath: '',
        backupAssignee: '',

        // Integration Section
        externalId: '',
        sourceSystem: 'manual',
        lastSyncDate: '',
        syncStatus: 'synced',

        // Documents (storing URLs/paths)
        documentUrls: [] as string[],

        // Custom Fields
        customField1: '',
        customField2: '',
        customField3: '',
        customField4: '',
        customField5: '',

        // Address
        street: '',
        city: '',
        postalCode: '',
        country: 'المملكة العربية السعودية',
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const leadData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            company: formData.company || undefined,
            source: formData.source as LeadSource,
            estimatedValue: formData.estimatedValue > 0 ? formData.estimatedValue : undefined,
            expectedCloseDate: formData.expectedCloseDate || undefined,
            caseType: formData.caseType || undefined,
            description: formData.description || undefined,
            notes: formData.notes || undefined,
            assignedTo: formData.assignedTo || undefined,
        }

        if (editMode && leadId) {
            updateLeadMutation.mutate(
                { id: leadId, data: leadData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.sales.leads.list })
                    }
                }
            )
        } else {
            createLeadMutation.mutate(leadData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.sales.leads.list })
                }
            })
        }
    }

    const topNav = [
        { title: 'العملاء المحتملين', href: ROUTES.dashboard.sales.leads.list, isActive: true },
    ]

    if (editMode && isLoadingLead) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden">
                {/* HERO CARD */}
                <ProductivityHero
                    badge={t('sales.leads.management')}
                    title={editMode ? t('sales.leads.editLead') : t('sales.leads.addLead')}
                    type="clients"
                    listMode={true}
                    hideButtons={true}
                >
                    <Link to={ROUTES.dashboard.sales.leads.list}>
                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </ProductivityHero>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
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
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <Label className="text-sm font-medium">العرض المتقدم</Label>
                                        <p className="text-xs text-slate-500">إظهار جميع الحقول ({advancedView ? '50+' : '12'} حقل)</p>
                                    </div>
                                    <Switch checked={advancedView} onCheckedChange={setAdvancedView} />
                                </div>

                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
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
                                                <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                رقم الهاتف
                                            </label>
                                            <Input
                                                placeholder="+966 5x xxx xxxx"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            الشركة
                                        </label>
                                        <Input
                                            placeholder={t('sales.leads.form.companyName')}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.company}
                                            onChange={(e) => handleChange('company', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Source & Assignment */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Target className="w-5 h-5 text-emerald-500" />
                                        المصدر والتعيين
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                مصدر العميل <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.source}
                                                onValueChange={(value) => handleChange('source', value)}
                                                required
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={t('sales.leads.form.selectSource')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getSourceOptions(t).map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                تعيين إلى
                                            </label>
                                            <Select
                                                value={formData.assignedTo}
                                                onValueChange={(value) => handleChange('assignedTo', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder={t('sales.leads.form.selectStaff')} />
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
                                                            placeholder="مثال: قسم المبيعات"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">رقم الفرصة</label>
                                                        <Input
                                                            placeholder="مثال: LEAD-2024-001"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                )}

                                {/* Financial Info */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        المعلومات المالية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                القيمة المتوقعة (ريال)
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                min="0"
                                                value={formData.estimatedValue}
                                                onChange={(e) => handleChange('estimatedValue', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الإغلاق المتوقع
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                value={formData.expectedCloseDate}
                                                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Case Details */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        تفاصيل القضية
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            نوع القضية
                                        </label>
                                        <Select
                                            value={formData.caseType}
                                            onValueChange={(value) => handleChange('caseType', value)}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder={t('sales.leads.selectCaseType')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getCaseTypes(t).map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الوصف
                                        </label>
                                        <Textarea
                                            placeholder={t('sales.leads.form.descriptionPlaceholder')}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder={t('sales.leads.form.notesPlaceholder')}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Advanced Sections Accordion */}
                                {advancedView && (
                                <Accordion type="multiple" className="space-y-4">

                                    {/* Enhanced Contact Details */}
                                    <AccordionItem value="contact_enhanced" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <Phone className="w-5 h-5 text-emerald-500" />
                                                معلومات الاتصال الموسعة
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        البريد البديل
                                                    </label>
                                                    <Input
                                                        type="email"
                                                        placeholder="alternate@example.com"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.alternateEmail}
                                                        onChange={(e) => handleChange('alternateEmail', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        هاتف بديل
                                                    </label>
                                                    <Input
                                                        placeholder="+966 5x xxx xxxx"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.alternatePhone}
                                                        onChange={(e) => handleChange('alternatePhone', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">واتساب</label>
                                                    <Input
                                                        placeholder="+966 5x xxx xxxx"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.whatsapp}
                                                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <ExternalLink className="w-4 h-4" />
                                                        LinkedIn
                                                    </label>
                                                    <Input
                                                        placeholder="https://linkedin.com/in/..."
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.linkedinUrl}
                                                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Twitter</label>
                                                    <Input
                                                        placeholder="@username"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.twitterHandle}
                                                        onChange={(e) => handleChange('twitterHandle', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Globe className="w-4 h-4" />
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
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Enhanced Company Details */}
                                    <AccordionItem value="company_enhanced" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <Building className="w-5 h-5 text-emerald-500" />
                                                معلومات الشركة الموسعة
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">المسمى الوظيفي</label>
                                                    <Input
                                                        placeholder="مدير المشتريات"
                                                        className="rounded-xl"
                                                        value={formData.jobTitle}
                                                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">القسم</label>
                                                    <Input
                                                        placeholder="المبيعات"
                                                        className="rounded-xl"
                                                        value={formData.department}
                                                        onChange={(e) => handleChange('department', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الصناعة</label>
                                                    <Input
                                                        placeholder="التكنولوجيا"
                                                        className="rounded-xl"
                                                        value={formData.industry}
                                                        onChange={(e) => handleChange('industry', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">رقم السجل التجاري</label>
                                                    <Input
                                                        placeholder="1010XXXXXX"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.crNumber}
                                                        onChange={(e) => handleChange('crNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الرقم الضريبي</label>
                                                    <Input
                                                        placeholder="3XXXXXXXXXX3"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.vatNumber}
                                                        onChange={(e) => handleChange('vatNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">عدد الموظفين</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="rounded-xl"
                                                        min="0"
                                                        value={formData.employeeCount}
                                                        onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الإيرادات السنوية (ريال)</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        min="0"
                                                        value={formData.annualRevenue}
                                                        onChange={(e) => handleChange('annualRevenue', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">LinkedIn الشركة</label>
                                                    <Input
                                                        placeholder="https://linkedin.com/company/..."
                                                        className="rounded-xl"
                                                        dir="ltr"
                                                        value={formData.companyLinkedinUrl}
                                                        onChange={(e) => handleChange('companyLinkedinUrl', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Marketing Section */}
                                    <AccordionItem value="marketing" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <Target className="w-5 h-5 text-emerald-500" />
                                                تتبع التسويق
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-blue-800 flex items-center gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        معلومات UTM والحملات التسويقية
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">UTM Source</label>
                                                        <Input
                                                            placeholder="google, facebook, email"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.utmSource}
                                                            onChange={(e) => handleChange('utmSource', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">UTM Medium</label>
                                                        <Input
                                                            placeholder="cpc, banner, email"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.utmMedium}
                                                            onChange={(e) => handleChange('utmMedium', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">UTM Campaign</label>
                                                        <Input
                                                            placeholder="spring_sale"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.utmCampaign}
                                                            onChange={(e) => handleChange('utmCampaign', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">UTM Term</label>
                                                        <Input
                                                            placeholder="keyword"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.utmTerm}
                                                            onChange={(e) => handleChange('utmTerm', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">UTM Content</label>
                                                        <Input
                                                            placeholder="logolink, textlink"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.utmContent}
                                                            onChange={(e) => handleChange('utmContent', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">Lead Magnet</label>
                                                        <Input
                                                            placeholder="ebook, webinar, free_trial"
                                                            className="rounded-xl"
                                                            value={formData.leadMagnet}
                                                            onChange={(e) => handleChange('leadMagnet', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium text-slate-700">Landing Page URL</label>
                                                        <Input
                                                            placeholder="https://example.com/landing-page"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.landingPageUrl}
                                                            onChange={(e) => handleChange('landingPageUrl', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">Marketing Score</label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0-100"
                                                            className="rounded-xl"
                                                            min="0"
                                                            max="100"
                                                            value={formData.marketingScore}
                                                            onChange={(e) => handleChange('marketingScore', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Territory/Region Section */}
                                    <AccordionItem value="territory" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                                المنطقة والإقليم
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الإقليم</label>
                                                    <Select value={formData.territory} onValueChange={(v) => handleChange('territory', v)}>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder="اختر الإقليم" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="central">المنطقة الوسطى</SelectItem>
                                                            <SelectItem value="western">المنطقة الغربية</SelectItem>
                                                            <SelectItem value="eastern">المنطقة الشرقية</SelectItem>
                                                            <SelectItem value="northern">المنطقة الشمالية</SelectItem>
                                                            <SelectItem value="southern">المنطقة الجنوبية</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">المنطقة</label>
                                                    <Input
                                                        placeholder="الرياض، جدة، الدمام..."
                                                        className="rounded-xl"
                                                        value={formData.region}
                                                        onChange={(e) => handleChange('region', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">مسار التصعيد</label>
                                                    <Input
                                                        placeholder="المدير > المدير العام"
                                                        className="rounded-xl"
                                                        value={formData.escalationPath}
                                                        onChange={(e) => handleChange('escalationPath', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">المُعيّن الاحتياطي</label>
                                                    <Select value={formData.backupAssignee} onValueChange={(v) => handleChange('backupAssignee', v)}>
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
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Address Section */}
                                    <AccordionItem value="address" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
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
                                                            dir="ltr"
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

                                    {/* Integration Section */}
                                    <AccordionItem value="integration" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <RefreshCw className="w-5 h-5 text-emerald-500" />
                                                التكامل والمزامنة
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-4">
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-purple-800 flex items-center gap-2">
                                                        <Database className="w-4 h-4" />
                                                        معلومات المزامنة مع الأنظمة الخارجية
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">External ID</label>
                                                        <Input
                                                            placeholder="EXT-12345"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.externalId}
                                                            onChange={(e) => handleChange('externalId', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">النظام المصدر</label>
                                                        <Select value={formData.sourceSystem} onValueChange={(v) => handleChange('sourceSystem', v)}>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="manual">يدوي</SelectItem>
                                                                <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                                                                <SelectItem value="crm">نظام CRM</SelectItem>
                                                                <SelectItem value="api">API خارجي</SelectItem>
                                                                <SelectItem value="import">استيراد</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">حالة المزامنة</label>
                                                        <Select value={formData.syncStatus} onValueChange={(v) => handleChange('syncStatus', v)}>
                                                            <SelectTrigger className="rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="synced">متزامن</SelectItem>
                                                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                                                <SelectItem value="error">خطأ</SelectItem>
                                                                <SelectItem value="not_synced">غير متزامن</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">تاريخ آخر مزامنة</label>
                                                        <Input
                                                            type="datetime-local"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                            value={formData.lastSyncDate}
                                                            onChange={(e) => handleChange('lastSyncDate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Documents Section */}
                                    <AccordionItem value="documents" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <FolderOpen className="w-5 h-5 text-emerald-500" />
                                                المستندات المرفقة
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-4">
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                    <p className="text-sm text-amber-800 flex items-center gap-2">
                                                        <Upload className="w-4 h-4" />
                                                        قم بإضافة روابط المستندات المتعلقة بهذا العميل المحتمل
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">رابط المستند</label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="https://..."
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                        />
                                                        <Button type="button" variant="outline" className="rounded-xl">
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {formData.documentUrls.length > 0 && (
                                                    <div className="space-y-2">
                                                        {formData.documentUrls.map((url, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                                <span className="text-sm text-slate-600 truncate">{url}</span>
                                                                <Button type="button" variant="ghost" size="sm">
                                                                    <X className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Custom Fields Section */}
                                    <AccordionItem value="custom_fields" className="border rounded-2xl bg-white shadow-sm">
                                        <AccordionTrigger className="px-6 hover:no-underline">
                                            <span className="flex items-center gap-2 text-lg font-semibold">
                                                <Boxes className="w-5 h-5 text-emerald-500" />
                                                حقول مخصصة
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-4">
                                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-indigo-800 flex items-center gap-2">
                                                        <Hash className="w-4 h-4" />
                                                        استخدم هذه الحقول لتخزين معلومات إضافية خاصة بمؤسستك
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <div key={num} className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">
                                                                حقل مخصص {num}
                                                            </label>
                                                            <Input
                                                                placeholder={`قيمة الحقل المخصص ${num}`}
                                                                className="rounded-xl"
                                                                value={formData[`customField${num}` as keyof typeof formData] as string}
                                                                onChange={(e) => handleChange(`customField${num}`, e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                </Accordion>
                                )}

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6"
                                        disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                                    >
                                        {(createLeadMutation.isPending || updateLeadMutation.isPending) && (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        )}
                                        <Save className="w-5 h-5 ms-2" aria-hidden="true" />
                                        {editMode ? t('sales.leads.form.saveChanges') : t('sales.leads.form.create')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl px-8 py-6"
                                        onClick={() => navigate({ to: ROUTES.dashboard.sales.leads.list })}
                                    >
                                        إلغاء
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <SalesSidebar context="leads" />
                </div>
            </Main>
        </>
    )
}

export default CreateLeadView
