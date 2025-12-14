import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import {
    Loader2, User, Building, FileText, Calendar, ChevronDown, ChevronUp,
    Scale, Flag, Briefcase, Hash, Sparkles, Save, ArrowRight, ArrowLeft,
    Plus, Trash2, Users, Gavel, ScrollText, Building2, Baby, CreditCard,
    CheckCircle2, Landmark, Tag
} from 'lucide-react'
import { saudiNationalIdSchemaOptional, saudiCrNumberSchemaOptional } from '@/lib/zod-validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { FieldTooltip } from '@/components/ui/field-tooltip'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { PracticeSidebar } from './practice-sidebar'
import { useCreateCase } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type { CaseCategory, CasePriority, CreateCaseData, LaborCaseDetails } from '@/services/casesService'

// Field Tooltips
const FIELD_TOOLTIPS = {
    title: 'عنوان واضح ومختصر للقضية يسهل تحديدها لاحقاً',
    category: 'تصنيف القضية يساعد في تحديد الإجراءات والنماذج المطلوبة',
    subCategory: 'التصنيف الفرعي يحدد نوع القضية بشكل أدق',
    priority: 'تحديد أولوية القضية يساعد في ترتيب العمل',
    filingDate: 'تاريخ تقديم الدعوى للمحكمة',
    caseNumber: 'رقم القضية المسجل في المحكمة',
    internalReference: 'رقم مرجعي داخلي للمكتب',
    entityType: 'اختر محكمة أو لجنة حسب اختصاص القضية',
    region: 'المنطقة الإدارية التي تقع فيها المحكمة',
    plaintiff: 'الطرف الذي يرفع الدعوى',
    defendant: 'الطرف المرفوعة عليه الدعوى',
    claims: 'المطالبات المالية وغيرها المطلوبة في الدعوى',
    laborDetails: 'بيانات العلاقة العمالية المطلوبة للقضايا العمالية',
    powerOfAttorney: 'بيانات الوكالة الشرعية للتمثيل أمام المحكمة',
    team: 'فريق العمل المسؤول عن متابعة القضية',
}

// ==================== CONSTANTS ====================

// Saudi Courts
const COURTS = [
    { value: 'general', label: 'المحكمة العامة' },
    { value: 'criminal', label: 'المحكمة الجزائية' },
    { value: 'commercial', label: 'المحكمة التجارية' },
    { value: 'labor', label: 'المحكمة العمالية' },
    { value: 'family', label: 'محكمة الأحوال الشخصية' },
    { value: 'administrative', label: 'المحكمة الإدارية (ديوان المظالم)' },
    { value: 'appeal', label: 'محكمة الاستئناف' },
    { value: 'supreme', label: 'المحكمة العليا' },
]

// Committees
const COMMITTEES = [
    { value: 'banking', label: 'لجنة المنازعات المصرفية' },
    { value: 'securities', label: 'لجنة الفصل في منازعات الأوراق المالية' },
    { value: 'insurance', label: 'لجنة الفصل في المنازعات والمخالفات التأمينية' },
    { value: 'customs', label: 'لجنة الفصل في المخالفات والمنازعات الجمركية' },
    { value: 'tax', label: 'لجنة الفصل في المخالفات والمنازعات الضريبية' },
    { value: 'labor_primary', label: 'الهيئة الابتدائية لتسوية الخلافات العمالية' },
    { value: 'labor_supreme', label: 'الهيئة العليا لتسوية الخلافات العمالية' },
    { value: 'real_estate', label: 'لجنة النزاعات العقارية' },
    { value: 'competition', label: 'لجنة الفصل في مخالفات نظام المنافسة' },
]

// Saudi Regions
const REGIONS = [
    { value: 'riyadh', label: 'منطقة الرياض', cities: ['الرياض', 'الخرج', 'الدوادمي', 'المجمعة', 'القويعية', 'وادي الدواسر', 'الأفلاج', 'الزلفي', 'شقراء', 'حوطة بني تميم', 'عفيف', 'السليل', 'ضرما', 'المزاحمية', 'رماح', 'ثادق', 'حريملاء', 'الحريق', 'الغاط', 'مرات'] },
    { value: 'makkah', label: 'منطقة مكة المكرمة', cities: ['مكة المكرمة', 'جدة', 'الطائف', 'القنفذة', 'الليث', 'رابغ', 'خليص', 'الجموم', 'الكامل', 'الخرمة', 'رنية', 'تربة', 'الموية', 'ميسان', 'أضم', 'العرضيات', 'بحرة'] },
    { value: 'madinah', label: 'منطقة المدينة المنورة', cities: ['المدينة المنورة', 'ينبع', 'العلا', 'المهد', 'بدر', 'خيبر', 'الحناكية', 'وادي الفرع'] },
    { value: 'qassim', label: 'منطقة القصيم', cities: ['بريدة', 'عنيزة', 'الرس', 'المذنب', 'البكيرية', 'البدائع', 'الأسياح', 'النبهانية', 'الشماسية', 'عيون الجواء', 'رياض الخبراء', 'عقلة الصقور', 'ضرية'] },
    { value: 'eastern', label: 'المنطقة الشرقية', cities: ['الدمام', 'الأحساء', 'حفر الباطن', 'الجبيل', 'القطيف', 'الخبر', 'الظهران', 'رأس تنورة', 'بقيق', 'النعيرية', 'قرية العليا', 'العديد'] },
    { value: 'asir', label: 'منطقة عسير', cities: ['أبها', 'خميس مشيط', 'بيشة', 'النماص', 'محايل', 'ظهران الجنوب', 'تثليث', 'سراة عبيدة', 'رجال ألمع', 'أحد رفيدة', 'بلقرن', 'المجاردة', 'البرك', 'بارق', 'تنومة'] },
    { value: 'tabuk', label: 'منطقة تبوك', cities: ['تبوك', 'الوجه', 'ضباء', 'تيماء', 'أملج', 'حقل', 'البدع'] },
    { value: 'hail', label: 'منطقة حائل', cities: ['حائل', 'بقعاء', 'الغزالة', 'الشنان', 'الحائط', 'السليمي', 'الشملي', 'موقق'] },
    { value: 'northern', label: 'منطقة الحدود الشمالية', cities: ['عرعر', 'رفحاء', 'طريف', 'العويقيلة'] },
    { value: 'jazan', label: 'منطقة جازان', cities: ['جازان', 'صبيا', 'أبو عريش', 'صامطة', 'بيش', 'الدرب', 'الريث', 'ضمد', 'الطوال', 'فرسان', 'أحد المسارحة', 'العارضة', 'فيفا', 'الدائر', 'الحرث', 'هروب', 'العيدابي'] },
    { value: 'najran', label: 'منطقة نجران', cities: ['نجران', 'شرورة', 'حبونا', 'بدر الجنوب', 'يدمة', 'ثار', 'خباش'] },
    { value: 'baha', label: 'منطقة الباحة', cities: ['الباحة', 'بلجرشي', 'المندق', 'المخواة', 'قلوة', 'العقيق', 'غامد الزناد', 'الحجرة', 'القرى'] },
    { value: 'jawf', label: 'منطقة الجوف', cities: ['سكاكا', 'دومة الجندل', 'القريات', 'طبرجل'] },
]

// Case Categories with sub-categories
const CASE_CATEGORIES = [
    {
        value: 'labor',
        label: 'عمالية',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        subCategories: [
            { value: 'wages', label: 'أجور ومستحقات' },
            { value: 'termination', label: 'فصل تعسفي' },
            { value: 'end_of_service', label: 'مكافأة نهاية الخدمة' },
            { value: 'work_injury', label: 'إصابات عمل' },
            { value: 'vacation', label: 'إجازات' },
            { value: 'contract_dispute', label: 'نزاع عقد عمل' },
        ]
    },
    {
        value: 'commercial',
        label: 'تجارية',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        subCategories: [
            { value: 'contracts', label: 'عقود تجارية' },
            { value: 'partnership', label: 'شراكة' },
            { value: 'bankruptcy', label: 'إفلاس' },
            { value: 'cheques', label: 'شيكات' },
            { value: 'promissory', label: 'سندات لأمر' },
            { value: 'agency', label: 'وكالة تجارية' },
            { value: 'franchise', label: 'امتياز تجاري' },
            { value: 'insurance', label: 'تأمين' },
        ]
    },
    {
        value: 'civil',
        label: 'مدنية',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        subCategories: [
            { value: 'property', label: 'ملكية عقارية' },
            { value: 'rent', label: 'إيجارات' },
            { value: 'compensation', label: 'تعويضات' },
            { value: 'debt', label: 'مطالبة مالية' },
            { value: 'inheritance', label: 'ميراث' },
        ]
    },
    {
        value: 'criminal',
        label: 'جنائية',
        color: 'bg-red-100 text-red-700 border-red-200',
        subCategories: [
            { value: 'fraud', label: 'احتيال' },
            { value: 'forgery', label: 'تزوير' },
            { value: 'embezzlement', label: 'اختلاس' },
            { value: 'defamation', label: 'قذف وتشهير' },
            { value: 'assault', label: 'اعتداء' },
        ]
    },
    {
        value: 'family',
        label: 'أحوال شخصية',
        color: 'bg-pink-100 text-pink-700 border-pink-200',
        subCategories: [
            { value: 'divorce', label: 'طلاق' },
            { value: 'khula', label: 'خلع' },
            { value: 'custody', label: 'حضانة' },
            { value: 'alimony', label: 'نفقة' },
            { value: 'visitation', label: 'رؤية' },
            { value: 'marriage_contract', label: 'عقد زواج' },
            { value: 'inheritance_division', label: 'قسمة تركة' },
        ]
    },
    {
        value: 'administrative',
        label: 'إدارية',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        subCategories: [
            { value: 'government_decision', label: 'قرار إداري' },
            { value: 'tender', label: 'مناقصات' },
            { value: 'employment', label: 'وظيفة حكومية' },
            { value: 'license', label: 'تراخيص' },
        ]
    },
]

// Priority options
const PRIORITY_OPTIONS = [
    { value: 'low', label: 'منخفضة', dotColor: 'bg-slate-400' },
    { value: 'medium', label: 'متوسطة', dotColor: 'bg-blue-500' },
    { value: 'high', label: 'عالية', dotColor: 'bg-orange-500' },
    { value: 'critical', label: 'عاجلة', dotColor: 'bg-red-500' },
]

// Party types
const PARTY_TYPES = [
    { value: 'individual', label: 'فرد' },
    { value: 'company', label: 'شركة / مؤسسة' },
    { value: 'government', label: 'جهة حكومية' },
]

// Claim types
const CLAIM_TYPES = [
    { value: 'wages', label: 'أجور متأخرة' },
    { value: 'end_of_service', label: 'مكافأة نهاية خدمة' },
    { value: 'vacation', label: 'بدل إجازات' },
    { value: 'compensation', label: 'تعويض' },
    { value: 'allowances', label: 'بدلات' },
    { value: 'overtime', label: 'ساعات إضافية' },
    { value: 'notice_period', label: 'بدل إشعار' },
    { value: 'other', label: 'أخرى' },
]

// Wizard Steps
const WIZARD_STEPS = [
    { id: 1, title: 'المعلومات الأساسية', icon: FileText },
    { id: 2, title: 'أطراف الدعوى', icon: Users },
    { id: 3, title: 'تفاصيل القضية', icon: Scale },
    { id: 4, title: 'المحكمة والفريق', icon: Gavel },
]

// ==================== FORM SCHEMA ====================

const createCaseSchema = z.object({
    // Step 1: Basic Info
    title: z.string().min(1, 'عنوان القضية مطلوب'),
    category: z.enum(['labor', 'commercial', 'civil', 'criminal', 'family', 'administrative', 'other']).optional(),
    subCategory: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    description: z.string().optional(),
    caseNumber: z.string().optional(),
    internalReference: z.string().optional(),
    filingDate: z.string().optional(),

    // Court/Committee
    entityType: z.enum(['court', 'committee']).optional(),
    court: z.string().optional(),
    committee: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),

    // Step 2: Parties - Plaintiff
    plaintiffType: z.enum(['individual', 'company', 'government']).optional(),
    plaintiffName: z.string().optional(),
    plaintiffNationalId: saudiNationalIdSchemaOptional,
    plaintiffPhone: z.string().optional(),
    plaintiffEmail: z.string().email().optional().or(z.literal('')),
    plaintiffAddress: z.string().optional(),
    plaintiffCity: z.string().optional(),
    // Company plaintiff
    plaintiffCompanyName: z.string().optional(),
    plaintiffCrNumber: saudiCrNumberSchemaOptional,
    plaintiffCompanyAddress: z.string().optional(),
    plaintiffRepresentativeName: z.string().optional(),
    plaintiffRepresentativePosition: z.string().optional(),
    // Government plaintiff
    plaintiffGovEntity: z.string().optional(),
    plaintiffGovRepresentative: z.string().optional(),

    // Step 2: Parties - Defendant
    defendantType: z.enum(['individual', 'company', 'government']).optional(),
    defendantName: z.string().optional(),
    defendantNationalId: saudiNationalIdSchemaOptional,
    defendantPhone: z.string().optional(),
    defendantEmail: z.string().email().optional().or(z.literal('')),
    defendantAddress: z.string().optional(),
    defendantCity: z.string().optional(),
    // Company defendant
    defendantCompanyName: z.string().optional(),
    defendantCrNumber: saudiCrNumberSchemaOptional,
    defendantCompanyAddress: z.string().optional(),
    defendantRepresentativeName: z.string().optional(),
    defendantRepresentativePosition: z.string().optional(),
    // Government defendant
    defendantGovEntity: z.string().optional(),
    defendantGovRepresentative: z.string().optional(),

    // Step 3: Case Details
    caseSubject: z.string().optional(),
    legalBasis: z.string().optional(),
    claimAmount: z.number().optional(),

    // Claims array
    claims: z.array(z.object({
        type: z.string(),
        amount: z.number(),
        period: z.string().optional(),
        description: z.string().optional(),
    })).optional(),

    // Labor case fields
    jobTitle: z.string().optional(),
    employmentStartDate: z.string().optional(),
    employmentEndDate: z.string().optional(),
    monthlySalary: z.number().optional(),
    terminationReason: z.string().optional(),

    // Personal status fields
    marriageDate: z.string().optional(),
    marriageCity: z.string().optional(),
    childrenCount: z.number().optional(),

    // Commercial case fields
    contractDate: z.string().optional(),
    contractValue: z.number().optional(),

    // Step 4: Court & Team
    circuitNumber: z.string().optional(),
    judgeName: z.string().optional(),
    courtRoom: z.string().optional(),

    // Team
    assignedLawyer: z.string().optional(),
    assistants: z.array(z.string()).optional(),

    // Power of Attorney
    poaNumber: z.string().optional(),
    poaDate: z.string().optional(),
    poaExpiry: z.string().optional(),
    poaScope: z.string().optional(),

    // Client info (for external cases)
    clientName: z.string().optional(),
    clientPhone: z.string().optional(),
    startDate: z.string().optional(),
})

type CreateCaseFormData = z.infer<typeof createCaseSchema>

// ==================== COMPONENT ====================

export function CreateCaseView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [laborDetailsOpen, setLaborDetailsOpen] = useState(false)
    const [personalStatusOpen, setPersonalStatusOpen] = useState(false)
    const [commercialOpen, setCommercialOpen] = useState(false)
    const createCaseMutation = useCreateCase()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm<CreateCaseFormData>({
        resolver: zodResolver(createCaseSchema) as any,
        defaultValues: {
            category: 'labor',
            priority: 'medium',
            entityType: 'court',
            plaintiffType: 'individual',
            defendantType: 'company',
            claims: [],
        },
    })

    const { fields: claimFields, append: appendClaim, remove: removeClaim } = useFieldArray({
        control,
        name: 'claims',
    })

    const selectedCategory = watch('category')
    const selectedPriority = watch('priority')
    const entityType = watch('entityType')
    const plaintiffType = watch('plaintiffType')
    const defendantType = watch('defendantType')
    const selectedRegion = watch('region')

    // Get cities for selected region
    const getCitiesForRegion = (regionValue: string) => {
        const region = REGIONS.find(r => r.value === regionValue)
        return region?.cities || []
    }

    // Get sub-categories for selected category
    const getSubCategories = (categoryValue: string) => {
        const category = CASE_CATEGORIES.find(c => c.value === categoryValue)
        return category?.subCategories || []
    }

    const handleCategoryChange = (value: CaseCategory) => {
        setValue('category', value)
        setValue('subCategory', undefined)
    }

    const nextStep = () => {
        if (currentStep < WIZARD_STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const onSubmit = async (data: CreateCaseFormData) => {
        // Build the request payload
        const payload: CreateCaseData = {
            title: data.title || '',
            category: data.category as CaseCategory,
            description: data.description,
            clientName: data.clientName || data.plaintiffName,
            clientPhone: data.clientPhone || data.plaintiffPhone,
            caseNumber: data.caseNumber,
            court: data.court,
            startDate: data.startDate || data.filingDate,
            priority: data.priority as CasePriority,
        }

        // Add labor case details if it's a labor case
        if (data.category === 'labor') {
            const laborCaseDetails: LaborCaseDetails = {}

            if (data.plaintiffName || data.plaintiffNationalId || data.plaintiffPhone || data.plaintiffAddress || data.plaintiffCity) {
                laborCaseDetails.plaintiff = {
                    name: data.plaintiffName,
                    nationalId: data.plaintiffNationalId,
                    phone: data.plaintiffPhone,
                    address: data.plaintiffAddress,
                    city: data.plaintiffCity,
                }
            }

            if (data.defendantCompanyName || data.defendantCrNumber || data.defendantCompanyAddress || data.defendantCity) {
                laborCaseDetails.company = {
                    name: data.defendantCompanyName,
                    registrationNumber: data.defendantCrNumber,
                    address: data.defendantCompanyAddress,
                    city: data.defendantCity,
                }
            }

            if (Object.keys(laborCaseDetails).length > 0) {
                payload.laborCaseDetails = laborCaseDetails
            }
        }

        try {
            await createCaseMutation.mutateAsync(payload)
            navigate({ to: '/dashboard/cases' })
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    const topNav = [
        { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
        { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
    ]

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1()
            case 2:
                return renderStep2()
            case 3:
                return renderStep3()
            case 4:
                return renderStep4()
            default:
                return null
        }
    }

    // Step 1: Basic Information
    const renderStep1 = () => (
        <div className="space-y-8">
            {/* Case Title */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        {t('cases.caseTitle', 'عنوان القضية')}
                        <FieldTooltip content={FIELD_TOOLTIPS.title} />
                    </label>
                    <Input
                        placeholder={t('cases.titlePlaceholder', 'مثال: دعوى مطالبة بأجور متأخرة')}
                        className={cn(
                            "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 text-lg",
                            errors.title && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        )}
                        {...register('title')}
                        autoComplete="off"
                    />
                    {errors.title ? (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                    ) : (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t('cases.titleHint', 'عنوان واضح يسهل البحث عن القضية')}
                        </p>
                    )}
                </div>
            </div>

            {/* Category & Sub-category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-500" />
                        {t('cases.caseType', 'التصنيف الرئيسي')}
                        <FieldTooltip content={FIELD_TOOLTIPS.category} />
                    </label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11">
                            <SelectValue placeholder={t('cases.selectType', 'اختر نوع القضية')} />
                        </SelectTrigger>
                        <SelectContent>
                            {CASE_CATEGORIES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <Badge variant="secondary" className={cn("text-xs", option.color)}>
                                        {option.label}
                                    </Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-emerald-500" />
                        {t('cases.subCategory', 'التصنيف الفرعي')}
                        <FieldTooltip content={FIELD_TOOLTIPS.subCategory} />
                    </label>
                    <Select
                        value={watch('subCategory')}
                        onValueChange={(v) => setValue('subCategory', v)}
                        disabled={!selectedCategory}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11">
                            <SelectValue placeholder={t('cases.selectSubCategory', 'اختر التصنيف الفرعي')} />
                        </SelectTrigger>
                        <SelectContent>
                            {getSubCategories(selectedCategory || '').map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Priority & Filing Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Flag className="w-4 h-4 text-emerald-500" />
                        {t('cases.priority', 'الأولوية')}
                        <FieldTooltip content={FIELD_TOOLTIPS.priority} />
                    </label>
                    <Select
                        value={selectedPriority}
                        onValueChange={(v) => setValue('priority', v as CasePriority)}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11">
                            <SelectValue placeholder={t('cases.selectPriority', 'اختر الأولوية')} />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("w-2.5 h-2.5 rounded-full", option.dotColor)} />
                                        {option.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {t('cases.filingDate', 'تاريخ رفع الدعوى')}
                        <FieldTooltip content={FIELD_TOOLTIPS.filingDate} />
                    </label>
                    <Input
                        type="date"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                        {...register('filingDate')}
                    />
                </div>
            </div>

            {/* Case Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-500" />
                        {t('cases.caseNumber', 'رقم القضية (المحكمة)')}
                        <FieldTooltip content={FIELD_TOOLTIPS.caseNumber} />
                    </label>
                    <Input
                        placeholder="12345/1445"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                        {...register('caseNumber')}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-500" />
                        {t('cases.internalReference', 'الرقم المرجعي الداخلي')}
                        <FieldTooltip content={FIELD_TOOLTIPS.internalReference} />
                    </label>
                    <Input
                        placeholder="CASE-2024-001"
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                        {...register('internalReference')}
                    />
                </div>
            </div>

            {/* Entity Type (Court/Committee) */}
            <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" />
                    {t('cases.courtCommittee', 'المحكمة / اللجنة')}
                    <FieldTooltip content={FIELD_TOOLTIPS.entityType} />
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    {/* Entity Type Selection */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="court"
                                checked={entityType === 'court'}
                                onChange={() => setValue('entityType', 'court')}
                                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{t('cases.court', 'محكمة')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="committee"
                                checked={entityType === 'committee'}
                                onChange={() => setValue('entityType', 'committee')}
                                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-slate-700">{t('cases.committee', 'لجنة')}</span>
                        </label>
                    </div>

                    {/* Court/Committee Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {entityType === 'court' ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.selectCourt', 'اختر المحكمة')}</label>
                                <Select value={watch('court')} onValueChange={(v) => setValue('court', v)}>
                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                        <SelectValue placeholder={t('cases.selectCourt', 'اختر المحكمة')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURTS.map(court => (
                                            <SelectItem key={court.value} value={court.value}>
                                                {court.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.selectCommittee', 'اختر اللجنة')}</label>
                                <Select value={watch('committee')} onValueChange={(v) => setValue('committee', v)}>
                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                        <SelectValue placeholder={t('cases.selectCommittee', 'اختر اللجنة')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMMITTEES.map(committee => (
                                            <SelectItem key={committee.value} value={committee.value}>
                                                {committee.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Region */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                {t('cases.region', 'المنطقة')}
                                <FieldTooltip content={FIELD_TOOLTIPS.region} />
                            </label>
                            <Select value={selectedRegion} onValueChange={(v) => { setValue('region', v); setValue('city', undefined) }}>
                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                    <SelectValue placeholder={t('cases.selectRegion', 'اختر المنطقة')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map(region => (
                                        <SelectItem key={region.value} value={region.value}>
                                            {region.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* City */}
                    {selectedRegion && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.city', 'المدينة')}</label>
                            <Select value={watch('city')} onValueChange={(v) => setValue('city', v)}>
                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                    <SelectValue placeholder={t('cases.selectCity', 'اختر المدينة')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getCitiesForRegion(selectedRegion).map(city => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    {t('cases.description', 'وصف القضية')}
                </label>
                <Textarea
                    placeholder={t('cases.descriptionPlaceholder', 'أدخل وصفاً مختصراً للقضية...')}
                    className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    {...register('description')}
                />
            </div>
        </div>
    )

    // Step 2: Parties
    const renderStep2 = () => (
        <div className="space-y-8">
            {/* Plaintiff Section */}
            <div className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    {t('cases.plaintiff', 'المدعي')}
                    <FieldTooltip content={FIELD_TOOLTIPS.plaintiff} />
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    {/* Party Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{t('cases.partyType', 'نوع الطرف')}</label>
                        <Select value={plaintiffType} onValueChange={(v) => setValue('plaintiffType', v as any)}>
                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PARTY_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Individual Fields */}
                    {plaintiffType === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.fullName', 'الاسم الكامل')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.nationalId', 'رقم الهوية / الإقامة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffNationalId')} placeholder="1234567890" />
                                {errors.plaintiffNationalId && <p className="text-sm text-red-500 mt-1">{errors.plaintiffNationalId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.phone', 'رقم الجوال')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffPhone')} placeholder="+966501234567" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.email', 'البريد الإلكتروني')}</label>
                                <Input type="email" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffEmail')} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.address', 'العنوان')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Company Fields */}
                    {plaintiffType === 'company' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.companyName', 'اسم الشركة / المؤسسة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffCompanyName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.crNumber', 'رقم السجل التجاري')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffCrNumber')} placeholder="1234567890" />
                                {errors.plaintiffCrNumber && <p className="text-sm text-red-500 mt-1">{errors.plaintiffCrNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.representativeName', 'اسم الممثل النظامي')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffRepresentativeName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.representativePosition', 'صفته')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffRepresentativePosition')} placeholder="مدير عام" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.address', 'العنوان')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffCompanyAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Government Fields */}
                    {plaintiffType === 'government' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.govEntity', 'الجهة الحكومية')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffGovEntity')} placeholder="وزارة / هيئة / مؤسسة" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.govRepresentative', 'ممثل الجهة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('plaintiffGovRepresentative')} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Defendant Section */}
            <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-500" />
                    {t('cases.defendant', 'المدعى عليه')}
                    <FieldTooltip content={FIELD_TOOLTIPS.defendant} />
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    {/* Party Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{t('cases.partyType', 'نوع الطرف')}</label>
                        <Select value={defendantType} onValueChange={(v) => setValue('defendantType', v as any)}>
                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PARTY_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Individual Fields */}
                    {defendantType === 'individual' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.fullName', 'الاسم الكامل')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.nationalId', 'رقم الهوية / الإقامة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantNationalId')} placeholder="1234567890" />
                                {errors.defendantNationalId && <p className="text-sm text-red-500 mt-1">{errors.defendantNationalId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.phone', 'رقم الجوال')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantPhone')} placeholder="+966501234567" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.email', 'البريد الإلكتروني')}</label>
                                <Input type="email" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantEmail')} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.address', 'العنوان')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Company Fields */}
                    {defendantType === 'company' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.companyName', 'اسم الشركة / المؤسسة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantCompanyName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.crNumber', 'رقم السجل التجاري')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantCrNumber')} placeholder="1234567890" />
                                {errors.defendantCrNumber && <p className="text-sm text-red-500 mt-1">{errors.defendantCrNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.representativeName', 'اسم الممثل النظامي')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantRepresentativeName')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.representativePosition', 'صفته')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantRepresentativePosition')} placeholder="مدير عام" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.address', 'العنوان')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantCompanyAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Government Fields */}
                    {defendantType === 'government' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.govEntity', 'الجهة الحكومية')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantGovEntity')} placeholder="وزارة / هيئة / مؤسسة" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">{t('cases.govRepresentative', 'ممثل الجهة')}</label>
                                <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('defendantGovRepresentative')} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    // Step 3: Case Details & Claims
    const renderStep3 = () => (
        <div className="space-y-8">
            {/* Case Subject & Legal Basis */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-emerald-500" />
                        {t('cases.caseSubject', 'موضوع الدعوى')}
                    </label>
                    <Textarea
                        className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder={t('cases.caseSubjectPlaceholder', 'ملخص موضوع الدعوى...')}
                        {...register('caseSubject')}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        {t('cases.legalBasis', 'السند النظامي')}
                    </label>
                    <Textarea
                        className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder={t('cases.legalBasisPlaceholder', 'المواد القانونية والأنظمة المستند إليها...')}
                        {...register('legalBasis')}
                    />
                </div>
            </div>

            {/* Claims Section */}
            <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                        {t('cases.claims', 'المطالبات')}
                        <FieldTooltip content={FIELD_TOOLTIPS.claims} />
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendClaim({ type: '', amount: 0, period: '', description: '' })}
                        className="rounded-xl"
                    >
                        <Plus className="w-4 h-4 ms-2" />
                        {t('cases.addClaim', 'إضافة مطالبة')}
                    </Button>
                </div>

                <div className="space-y-3">
                    {claimFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Select
                                    value={watch(`claims.${index}.type`)}
                                    onValueChange={(v) => setValue(`claims.${index}.type`, v)}
                                >
                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-10 bg-white">
                                        <SelectValue placeholder={t('cases.selectClaimType', 'نوع المطالبة')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CLAIM_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder={t('cases.claimAmount', 'المبلغ (ر.س)')}
                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-10 bg-white"
                                    {...register(`claims.${index}.amount`, { valueAsNumber: true })}
                                />
                                <Input
                                    placeholder={t('cases.claimPeriod', 'الفترة (من - إلى)')}
                                    className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-10 bg-white"
                                    {...register(`claims.${index}.period`)}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeClaim(index)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {claimFields.length === 0 && (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">{t('cases.noClaims', 'لم يتم إضافة مطالبات بعد')}</p>
                        </div>
                    )}
                </div>

                {/* Total Claim Amount */}
                {claimFields.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl mt-4">
                        <span className="font-medium text-emerald-700">{t('cases.totalClaims', 'إجمالي المطالبات')}</span>
                        <span className="text-lg font-bold text-emerald-700">
                            {(watch('claims') || []).reduce((sum, claim) => sum + (claim?.amount || 0), 0).toLocaleString('ar-SA')} ر.س
                        </span>
                    </div>
                )}
            </div>

            {/* Conditional Fields based on Category */}
            {selectedCategory === 'labor' && (
                <Collapsible open={laborDetailsOpen} onOpenChange={setLaborDetailsOpen}>
                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between w-full">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        {t('cases.laborDetails', 'بيانات العلاقة العمالية')}
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex items-center gap-2">
                                <FieldTooltip content={FIELD_TOOLTIPS.laborDetails} />
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                        {laborDetailsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                        <CollapsibleContent className="mt-4">
                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.jobTitle', 'المسمى الوظيفي')}</label>
                                        <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('jobTitle')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.monthlySalary', 'الراتب الشهري (ر.س)')}</label>
                                        <Input type="number" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('monthlySalary', { valueAsNumber: true })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.employmentStartDate', 'تاريخ بداية العمل')}</label>
                                        <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('employmentStartDate')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.employmentEndDate', 'تاريخ نهاية العمل')}</label>
                                        <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('employmentEndDate')} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">{t('cases.terminationReason', 'سبب إنهاء العلاقة العمالية')}</label>
                                    <Textarea className="min-h-[80px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white" {...register('terminationReason')} />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}

            {selectedCategory === 'family' && (
                <Collapsible open={personalStatusOpen} onOpenChange={setPersonalStatusOpen}>
                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between w-full">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Baby className="w-5 h-5 text-emerald-500" />
                                        {t('cases.personalStatusDetails', 'بيانات الأحوال الشخصية')}
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                    {personalStatusOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-4">
                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.marriageDate', 'تاريخ الزواج')}</label>
                                        <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('marriageDate')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.marriageCity', 'مدينة عقد الزواج')}</label>
                                        <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('marriageCity')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.childrenCount', 'عدد الأطفال')}</label>
                                        <Input type="number" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('childrenCount', { valueAsNumber: true })} />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}

            {selectedCategory === 'commercial' && (
                <Collapsible open={commercialOpen} onOpenChange={setCommercialOpen}>
                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between w-full">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        {t('cases.commercialDetails', 'بيانات العقد التجاري')}
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                    {commercialOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="mt-4">
                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.contractDate', 'تاريخ العقد')}</label>
                                        <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('contractDate')} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">{t('cases.contractValue', 'قيمة العقد (ر.س)')}</label>
                                        <Input type="number" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('contractValue', { valueAsNumber: true })} />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}
        </div>
    )

    // Step 4: Court & Team
    const renderStep4 = () => (
        <div className="space-y-8">
            {/* Court Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-emerald-500" />
                    {t('cases.courtDetails', 'بيانات المحكمة')}
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.circuitNumber', 'رقم الدائرة')}</label>
                            <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('circuitNumber')} placeholder="الدائرة الأولى" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.judgeName', 'اسم القاضي')}</label>
                            <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('judgeName')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.courtRoom', 'قاعة المحكمة')}</label>
                            <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('courtRoom')} placeholder="قاعة 5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Power of Attorney */}
            <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-emerald-500" />
                    {t('cases.powerOfAttorney', 'الوكالة الشرعية')}
                    <FieldTooltip content={FIELD_TOOLTIPS.powerOfAttorney} />
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.poaNumber', 'رقم الوكالة')}</label>
                            <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('poaNumber')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.poaDate', 'تاريخ الوكالة')}</label>
                            <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('poaDate')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.poaExpiry', 'تاريخ انتهاء الوكالة')}</label>
                            <Input type="date" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('poaExpiry')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t('cases.poaScope', 'نطاق الوكالة')}</label>
                            <Select value={watch('poaScope')} onValueChange={(v) => setValue('poaScope', v)}>
                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500 h-11 bg-white">
                                    <SelectValue placeholder={t('cases.selectPoaScope', 'اختر نطاق الوكالة')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">{t('cases.poaGeneral', 'وكالة عامة')}</SelectItem>
                                    <SelectItem value="specific">{t('cases.poaSpecific', 'وكالة خاصة')}</SelectItem>
                                    <SelectItem value="litigation">{t('cases.poaLitigation', 'وكالة خصومة')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Assignment */}
            <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    {t('cases.teamAssignment', 'فريق العمل')}
                    <FieldTooltip content={FIELD_TOOLTIPS.team} />
                </h3>

                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">{t('cases.assignedLawyer', 'المحامي المسؤول')}</label>
                        <Input className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11 bg-white" {...register('assignedLawyer')} placeholder={t('cases.lawyerName', 'اسم المحامي')} />
                    </div>
                </div>
            </div>
        </div>
    )

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
                <ProductivityHero badge="القضايا" title="إنشاء قضية جديدة" type="cases" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Wizard Progress */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between">
                                {WIZARD_STEPS.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(step.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                                                currentStep === step.id
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : currentStep > step.id
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                                currentStep === step.id
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                    : currentStep > step.id
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-200 text-slate-500"
                                            )}>
                                                {currentStep > step.id ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    step.id
                                                )}
                                            </div>
                                            <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                                        </button>
                                        {index < WIZARD_STEPS.length - 1 && (
                                            <div className={cn(
                                                "w-8 lg:w-16 h-0.5 mx-2 transition-colors",
                                                currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"
                                            )} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Step Content */}
                                {renderStepContent()}

                                {/* Navigation Footer */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/cases">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            {t('common.cancel', 'إلغاء')}
                                        </Button>
                                    </Link>

                                    {currentStep > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="rounded-xl"
                                        >
                                            <ArrowRight className="ms-2 h-4 w-4" />
                                            {t('common.previous', 'السابق')}
                                        </Button>
                                    )}

                                    {currentStep < WIZARD_STEPS.length ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        >
                                            {t('common.next', 'التالي')}
                                            <ArrowLeft className="me-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || createCaseMutation.isPending}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        >
                                            {(isSubmitting || createCaseMutation.isPending) ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {t('common.creating', 'جاري الإنشاء...')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="w-4 h-4" />
                                                    {t('cases.createCase', 'حفظ القضية')}
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <PracticeSidebar context="cases" />
                </div>
            </Main>
        </>
    )
}
