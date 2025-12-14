import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@tanstack/react-router'
import {
    Loader2, User, Building, Phone, MapPin, FileText, Calendar, ChevronDown,
    Scale, Flag, Briefcase, Hash, Sparkles, Save, ArrowRight, ArrowLeft,
    Plus, Trash2, Users, Gavel, ScrollText, Building2, Baby, CreditCard,
    Clock, CheckCircle2, Circle, UserCircle, Landmark
} from 'lucide-react'
import { saudiNationalIdSchemaOptional, saudiCrNumberSchemaOptional } from '@/lib/zod-validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { PracticeSidebar } from './practice-sidebar'
import { useCreateCase } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type { CaseCategory, CasePriority, CreateCaseData, LaborCaseDetails } from '@/services/casesService'

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
        <div className="space-y-6">
            {/* Case Title */}
            <div className="pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Scale className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">{t('cases.basicInfo', 'المعلومات الأساسية')}</span>
                </div>

                <div className="space-y-2">
                    <Input
                        placeholder={t('cases.titlePlaceholder', 'عنوان القضية')}
                        className={cn(
                            "text-xl sm:text-2xl font-bold border-0 border-b-2 border-slate-100 focus:border-blue-500 rounded-none shadow-none focus-visible:ring-0 px-0 h-auto py-4 placeholder:text-slate-300 placeholder:font-normal bg-transparent transition-all",
                            errors.title && "border-red-300 focus:border-red-500"
                        )}
                        {...register('title')}
                        autoComplete="off"
                    />
                    {errors.title ? (
                        <p className="text-xs text-red-500">{errors.title.message}</p>
                    ) : (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t('cases.titleHint', 'مثال: دعوى مطالبة بأجور متأخرة، قضية تجارية ضد شركة...')}
                        </p>
                    )}
                </div>
            </div>

            {/* Category & Sub-category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.caseType', 'التصنيف الرئيسي')}
                    </Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
                            <SelectValue placeholder={t('cases.selectType', 'اختر نوع القضية')} />
                        </SelectTrigger>
                        <SelectContent>
                            {CASE_CATEGORIES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", option.color)}>
                                            {option.label}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <ScrollText className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.subCategory', 'التصنيف الفرعي')}
                    </Label>
                    <Select
                        value={watch('subCategory')}
                        onValueChange={(v) => setValue('subCategory', v)}
                        disabled={!selectedCategory}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.priority', 'الأولوية')}
                    </Label>
                    <Select
                        value={selectedPriority}
                        onValueChange={(v) => setValue('priority', v as CasePriority)}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.filingDate', 'تاريخ رفع الدعوى')}
                    </Label>
                    <Input
                        type="date"
                        className="rounded-xl border-slate-200 h-12 bg-white"
                        {...register('filingDate')}
                    />
                </div>
            </div>

            {/* Case Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.caseNumber', 'رقم القضية (المحكمة)')}
                    </Label>
                    <Input
                        placeholder="12345/1445"
                        className="rounded-xl border-slate-200 h-12 bg-white"
                        {...register('caseNumber')}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {t('cases.internalReference', 'الرقم المرجعي الداخلي')}
                    </Label>
                    <Input
                        placeholder="CASE-2024-001"
                        className="rounded-xl border-slate-200 h-12 bg-white"
                        {...register('internalReference')}
                    />
                </div>
            </div>

            {/* Entity Type (Court/Committee) */}
            <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.courtCommittee', 'المحكمة / اللجنة')}</span>
                </div>

                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    {/* Entity Type Selection */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="court"
                                checked={entityType === 'court'}
                                onChange={() => setValue('entityType', 'court')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{t('cases.court', 'محكمة')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value="committee"
                                checked={entityType === 'committee'}
                                onChange={() => setValue('entityType', 'committee')}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">{t('cases.committee', 'لجنة')}</span>
                        </label>
                    </div>

                    {/* Court/Committee Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {entityType === 'court' ? (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.selectCourt', 'اختر المحكمة')}</Label>
                                <Select value={watch('court')} onValueChange={(v) => setValue('court', v)}>
                                    <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                                <Label className="text-sm font-medium text-slate-600">{t('cases.selectCommittee', 'اختر اللجنة')}</Label>
                                <Select value={watch('committee')} onValueChange={(v) => setValue('committee', v)}>
                                    <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                            <Label className="text-sm font-medium text-slate-600">{t('cases.region', 'المنطقة')}</Label>
                            <Select value={selectedRegion} onValueChange={(v) => { setValue('region', v); setValue('city', undefined) }}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                            <Label className="text-sm font-medium text-slate-600">{t('cases.city', 'المدينة')}</Label>
                            <Select value={watch('city')} onValueChange={(v) => setValue('city', v)}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {t('cases.description', 'وصف القضية')}
                </Label>
                <Textarea
                    placeholder={t('cases.descriptionPlaceholder', 'أدخل وصفاً مختصراً للقضية...')}
                    className="min-h-[100px] rounded-xl border-slate-200 resize-none focus:border-blue-500 text-base bg-white"
                    {...register('description')}
                />
            </div>
        </div>
    )

    // Step 2: Parties
    const renderStep2 = () => (
        <div className="space-y-8">
            {/* Plaintiff Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.plaintiff', 'المدعي')}</span>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                    {/* Party Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">{t('cases.partyType', 'نوع الطرف')}</Label>
                        <Select value={plaintiffType} onValueChange={(v) => setValue('plaintiffType', v as any)}>
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.fullName', 'الاسم الكامل')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.nationalId', 'رقم الهوية / الإقامة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffNationalId')} placeholder="1234567890" />
                                {errors.plaintiffNationalId && <p className="text-xs text-red-500">{errors.plaintiffNationalId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.phone', 'رقم الجوال')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffPhone')} placeholder="+966501234567" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.email', 'البريد الإلكتروني')}</Label>
                                <Input type="email" className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffEmail')} />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.address', 'العنوان')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Company Fields */}
                    {plaintiffType === 'company' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.companyName', 'اسم الشركة / المؤسسة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffCompanyName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.crNumber', 'رقم السجل التجاري')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffCrNumber')} placeholder="1234567890" />
                                {errors.plaintiffCrNumber && <p className="text-xs text-red-500">{errors.plaintiffCrNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.representativeName', 'اسم الممثل النظامي')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffRepresentativeName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.representativePosition', 'صفته')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffRepresentativePosition')} placeholder="مدير عام" />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.address', 'العنوان')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffCompanyAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Government Fields */}
                    {plaintiffType === 'government' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.govEntity', 'الجهة الحكومية')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffGovEntity')} placeholder="وزارة / هيئة / مؤسسة" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.govRepresentative', 'ممثل الجهة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('plaintiffGovRepresentative')} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Defendant Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Building className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.defendant', 'المدعى عليه')}</span>
                </div>

                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                    {/* Party Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">{t('cases.partyType', 'نوع الطرف')}</Label>
                        <Select value={defendantType} onValueChange={(v) => setValue('defendantType', v as any)}>
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.fullName', 'الاسم الكامل')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.nationalId', 'رقم الهوية / الإقامة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantNationalId')} placeholder="1234567890" />
                                {errors.defendantNationalId && <p className="text-xs text-red-500">{errors.defendantNationalId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.phone', 'رقم الجوال')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantPhone')} placeholder="+966501234567" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.email', 'البريد الإلكتروني')}</Label>
                                <Input type="email" className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantEmail')} />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.address', 'العنوان')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Company Fields */}
                    {defendantType === 'company' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.companyName', 'اسم الشركة / المؤسسة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantCompanyName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.crNumber', 'رقم السجل التجاري')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantCrNumber')} placeholder="1234567890" />
                                {errors.defendantCrNumber && <p className="text-xs text-red-500">{errors.defendantCrNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.representativeName', 'اسم الممثل النظامي')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantRepresentativeName')} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.representativePosition', 'صفته')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantRepresentativePosition')} placeholder="مدير عام" />
                            </div>
                            <div className="sm:col-span-2 space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.address', 'العنوان')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantCompanyAddress')} />
                            </div>
                        </div>
                    )}

                    {/* Government Fields */}
                    {defendantType === 'government' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.govEntity', 'الجهة الحكومية')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantGovEntity')} placeholder="وزارة / هيئة / مؤسسة" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.govRepresentative', 'ممثل الجهة')}</Label>
                                <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('defendantGovRepresentative')} />
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
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ScrollText className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.caseDetails', 'تفاصيل الدعوى')}</span>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">{t('cases.caseSubject', 'موضوع الدعوى')}</Label>
                        <Textarea
                            className="min-h-[80px] rounded-xl border-slate-200 resize-none bg-white"
                            placeholder={t('cases.caseSubjectPlaceholder', 'ملخص موضوع الدعوى...')}
                            {...register('caseSubject')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600">{t('cases.legalBasis', 'السند النظامي')}</Label>
                        <Textarea
                            className="min-h-[80px] rounded-xl border-slate-200 resize-none bg-white"
                            placeholder={t('cases.legalBasisPlaceholder', 'المواد القانونية والأنظمة المستند إليها...')}
                            {...register('legalBasis')}
                        />
                    </div>
                </div>
            </div>

            {/* Claims Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{t('cases.claims', 'المطالبات')}</span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendClaim({ type: '', amount: 0, period: '', description: '' })}
                        className="rounded-lg"
                    >
                        <Plus className="w-4 h-4 ms-1" />
                        {t('cases.addClaim', 'إضافة مطالبة')}
                    </Button>
                </div>

                <div className="space-y-3">
                    {claimFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-emerald-700">{t('cases.claim', 'مطالبة')} {index + 1}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeClaim(index)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600">{t('cases.claimType', 'نوع المطالبة')}</Label>
                                    <Select
                                        value={watch(`claims.${index}.type`)}
                                        onValueChange={(v) => setValue(`claims.${index}.type`, v)}
                                    >
                                        <SelectTrigger className="rounded-lg border-slate-200 h-10 bg-white">
                                            <SelectValue placeholder={t('cases.selectClaimType', 'اختر النوع')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLAIM_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600">{t('cases.claimAmount', 'المبلغ (ر.س)')}</Label>
                                    <Input
                                        type="number"
                                        className="rounded-lg border-slate-200 h-10 bg-white"
                                        {...register(`claims.${index}.amount`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-slate-600">{t('cases.claimPeriod', 'الفترة')}</Label>
                                    <Input
                                        className="rounded-lg border-slate-200 h-10 bg-white"
                                        placeholder="من - إلى"
                                        {...register(`claims.${index}.period`)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {claimFields.length === 0 && (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">{t('cases.noClaims', 'لم يتم إضافة مطالبات بعد')}</p>
                        </div>
                    )}
                </div>

                {/* Total Claim Amount */}
                <div className="flex items-center justify-between p-4 bg-emerald-100 rounded-xl">
                    <span className="font-medium text-emerald-800">{t('cases.totalClaims', 'إجمالي المطالبات')}</span>
                    <span className="text-lg font-bold text-emerald-800">
                        {(watch('claims') || []).reduce((sum, claim) => sum + (claim?.amount || 0), 0).toLocaleString('ar-SA')} ر.س
                    </span>
                </div>
            </div>

            {/* Conditional Fields based on Category */}
            {selectedCategory === 'labor' && (
                <Collapsible open={laborDetailsOpen} onOpenChange={setLaborDetailsOpen}>
                    <CollapsibleTrigger asChild>
                        <button type="button" className="flex items-center justify-between w-full text-sm group p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-blue-700">{t('cases.laborDetails', 'بيانات العلاقة العمالية')}</span>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-blue-600 transition-transform", laborDetailsOpen && "rotate-180")} />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                        <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.jobTitle', 'المسمى الوظيفي')}</Label>
                                    <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('jobTitle')} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.monthlySalary', 'الراتب الشهري (ر.س)')}</Label>
                                    <Input type="number" className="rounded-xl border-slate-200 h-12 bg-white" {...register('monthlySalary', { valueAsNumber: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.employmentStartDate', 'تاريخ بداية العمل')}</Label>
                                    <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('employmentStartDate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.employmentEndDate', 'تاريخ نهاية العمل')}</Label>
                                    <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('employmentEndDate')} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-slate-600">{t('cases.terminationReason', 'سبب إنهاء العلاقة العمالية')}</Label>
                                <Textarea className="min-h-[80px] rounded-xl border-slate-200 resize-none bg-white" {...register('terminationReason')} />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {selectedCategory === 'family' && (
                <Collapsible open={personalStatusOpen} onOpenChange={setPersonalStatusOpen}>
                    <CollapsibleTrigger asChild>
                        <button type="button" className="flex items-center justify-between w-full text-sm group p-4 bg-pink-50 rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Baby className="w-5 h-5 text-pink-600" />
                                <span className="font-medium text-pink-700">{t('cases.personalStatusDetails', 'بيانات الأحوال الشخصية')}</span>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-pink-600 transition-transform", personalStatusOpen && "rotate-180")} />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                        <div className="p-5 bg-pink-50/50 rounded-xl border border-pink-100 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.marriageDate', 'تاريخ الزواج')}</Label>
                                    <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('marriageDate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.marriageCity', 'مدينة عقد الزواج')}</Label>
                                    <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('marriageCity')} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.childrenCount', 'عدد الأطفال')}</Label>
                                    <Input type="number" className="rounded-xl border-slate-200 h-12 bg-white" {...register('childrenCount', { valueAsNumber: true })} />
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {selectedCategory === 'commercial' && (
                <Collapsible open={commercialOpen} onOpenChange={setCommercialOpen}>
                    <CollapsibleTrigger asChild>
                        <button type="button" className="flex items-center justify-between w-full text-sm group p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium text-emerald-700">{t('cases.commercialDetails', 'بيانات العقد التجاري')}</span>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-emerald-600 transition-transform", commercialOpen && "rotate-180")} />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                        <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.contractDate', 'تاريخ العقد')}</Label>
                                    <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('contractDate')} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">{t('cases.contractValue', 'قيمة العقد (ر.س)')}</Label>
                                    <Input type="number" className="rounded-xl border-slate-200 h-12 bg-white" {...register('contractValue', { valueAsNumber: true })} />
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    )

    // Step 4: Court & Team
    const renderStep4 = () => (
        <div className="space-y-8">
            {/* Court Details */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Gavel className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.courtDetails', 'بيانات المحكمة')}</span>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.circuitNumber', 'رقم الدائرة')}</Label>
                            <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('circuitNumber')} placeholder="الدائرة الأولى" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.judgeName', 'اسم القاضي')}</Label>
                            <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('judgeName')} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.courtRoom', 'قاعة المحكمة')}</Label>
                            <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('courtRoom')} placeholder="قاعة 5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Power of Attorney */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <ScrollText className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.powerOfAttorney', 'الوكالة الشرعية')}</span>
                </div>

                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.poaNumber', 'رقم الوكالة')}</Label>
                            <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('poaNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.poaDate', 'تاريخ الوكالة')}</Label>
                            <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('poaDate')} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.poaExpiry', 'تاريخ انتهاء الوكالة')}</Label>
                            <Input type="date" className="rounded-xl border-slate-200 h-12 bg-white" {...register('poaExpiry')} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.poaScope', 'نطاق الوكالة')}</Label>
                            <Select value={watch('poaScope')} onValueChange={(v) => setValue('poaScope', v)}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
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
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{t('cases.teamAssignment', 'فريق العمل')}</span>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600">{t('cases.assignedLawyer', 'المحامي المسؤول')}</Label>
                            <Input className="rounded-xl border-slate-200 h-12 bg-white" {...register('assignedLawyer')} placeholder={t('cases.lawyerName', 'اسم المحامي')} />
                        </div>
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
                                                    ? "bg-blue-100 text-blue-700"
                                                    : currentStep > step.id
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-50 text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                                                currentStep === step.id
                                                    ? "bg-blue-600 text-white"
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
                                                "w-8 lg:w-16 h-0.5 mx-2",
                                                currentStep > step.id ? "bg-emerald-300" : "bg-slate-200"
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
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div>
                                        {currentStep > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={prevStep}
                                                className="text-slate-500 hover:text-slate-700 rounded-xl h-11 px-5"
                                            >
                                                <ArrowRight className="ms-2 h-4 w-4" />
                                                {t('common.previous', 'السابق')}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link to="/dashboard/cases">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-slate-500 hover:text-slate-700 rounded-xl h-11 px-5"
                                            >
                                                {t('common.cancel', 'إلغاء')}
                                            </Button>
                                        </Link>

                                        {currentStep < WIZARD_STEPS.length ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-blue-500/20 font-medium"
                                            >
                                                {t('common.next', 'التالي')}
                                                <ArrowLeft className="me-2 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || createCaseMutation.isPending}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-emerald-500/20 font-medium min-w-[140px]"
                                            >
                                                {(isSubmitting || createCaseMutation.isPending) ? (
                                                    <>
                                                        <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                                        {t('common.creating', 'جاري الإنشاء')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="ms-2 h-4 w-4" />
                                                        {t('cases.createCase', 'إنشاء القضية')}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Step indicator */}
                                <p className="text-xs text-slate-400 text-center">
                                    {t('cases.step', 'الخطوة')} {currentStep} {t('cases.of', 'من')} {WIZARD_STEPS.length}
                                </p>
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
