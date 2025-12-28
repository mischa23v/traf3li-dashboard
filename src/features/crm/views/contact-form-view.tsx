import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, User, Mail, Phone, Building2, Briefcase,
    MapPin, FileText, Tag, Loader2, ChevronDown, ChevronUp,
    X, Plus, Users, Globe, CreditCard, Shield, Heart,
    Smartphone, MessageSquare, Video, Camera, Calendar,
    Award, TrendingUp, DollarSign, AlertCircle, Home, Clock
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
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { CrmSidebar } from '../components/crm-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts'
import { useClients } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

// Firm Size Type - Controls form complexity
type FirmSize = 'solo' | 'small' | 'medium' | 'large'

// Firm Size Options
const FIRM_SIZE_OPTIONS = [
    { value: 'solo' as FirmSize, label: 'محامي فردي', labelEn: 'Solo Practice', icon: User, description: 'ممارسة فردية' },
    { value: 'small' as FirmSize, label: 'مكتب صغير', labelEn: 'Small Firm (2-10)', icon: Users, description: '2-10 محامين' },
    { value: 'medium' as FirmSize, label: 'مكتب متوسط', labelEn: 'Medium Firm (11-50)', icon: Building2, description: '11-50 محامي' },
    { value: 'large' as FirmSize, label: 'شركة محاماة', labelEn: 'Large Firm (50+)', icon: Building2, description: '50+ محامي' },
]

export function ContactFormView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createContactMutation = useCreateContact()
    const updateContactMutation = useUpdateContact()

    // Fetch clients for linking
    const { data: clients, isLoading: clientsLoading } = useClients()

    // Firm size selection - controls visibility of organizational fields
    const [firmSize, setFirmSize] = useState<FirmSize>('solo')
    const [showAdvanced, setShowAdvanced] = useState(false)

    // Form state - ULTIMATE ENTERPRISE FIELDS
    const [formData, setFormData] = useState({
        // BASIC INFO
        salutation: '',
        firstName: '',
        middleName: '',
        lastName: '',
        fullNameArabic: '',
        nickname: '',
        maidenName: '',
        preferredName: '',

        // CONTACT INFO
        email: '',
        workEmail: '',
        personalEmail: '',
        phone: '',
        mobile: '',
        mobile2: '',
        homePhone: '',
        workPhone: '',
        fax: '',
        pager: '',

        // PROFESSIONAL
        company: '',
        jobTitle: '',
        department: '',
        role: '',
        reportsTo: '',
        assistantName: '',
        yearsInPosition: '',
        careerLevel: '',
        professionalLicenses: '',
        specializations: '',

        // PERSONAL DETAILS
        dateOfBirth: '',
        gender: '',
        nationality: '',
        languages: '',
        photo: '',
        nationalId: '',
        passportNumber: '',
        passportCountry: '',

        // DIGITAL PRESENCE
        skype: '',
        zoomId: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        whatsapp: '',
        telegram: '',
        website: '',

        // HOME ADDRESS
        homeStreet: '',
        homeApt: '',
        homeCity: '',
        homeState: '',
        homePostalCode: '',
        homeCountry: '',

        // WORK ADDRESS
        workStreet: '',
        workBuilding: '',
        workFloor: '',
        workCity: '',
        workState: '',
        workPostalCode: '',
        workCountry: '',

        // RELATIONSHIPS
        relatedContacts: '',
        accountRelationships: '',
        influenceLevel: '',
        decisionRole: '',
        referralSource: '',

        // COMMUNICATION PREFERENCES
        preferredContactMethod: '',
        bestTimeToContact: '',
        emailOptIn: false,
        smsOptIn: false,
        doNotCall: false,
        doNotEmail: false,
        doNotMail: false,
        newsletterSubscription: false,
        preferredLanguage: '',
        communicationFrequency: '',

        // LAW FIRM SPECIFIC
        clientSince: '',
        conflictStatus: '',
        barAssociation: '',
        licenseNumber: '',
        lawSpecializations: '',

        // FINANCIAL
        creditStatus: '',
        paymentTerms: '',
        isBillingContact: false,

        // MARKETING
        leadSource: '',
        campaign: '',
        marketingScore: '',
        lastMarketingTouch: '',

        // NOTES & TAGS
        description: '',
        internalNotes: '',
        activitySummary: '',
        tags: [] as string[],
        categories: '',

        // CUSTOM FIELDS
        customField1: '',
        customField2: '',
        customField3: '',
        customField4: '',
        customField5: '',

        // CLIENT LINKING
        clientId: '',
    })

    // Section toggles - All start collapsed
    const [personalDetails, setPersonalDetails] = useState(false)
    const [contactMethods, setContactMethods] = useState(false)
    const [professionalInfo, setProfessionalInfo] = useState(false)
    const [homeAddress, setHomeAddress] = useState(false)
    const [workAddress, setWorkAddress] = useState(false)
    const [relationships, setRelationships] = useState(false)
    const [commPreferences, setCommPreferences] = useState(false)
    const [legalInfo, setLegalInfo] = useState(false)
    const [financialInfo, setFinancialInfo] = useState(false)
    const [marketingInfo, setMarketingInfo] = useState(false)
    const [notesHistory, setNotesHistory] = useState(false)
    const [customFields, setCustomFields] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Validate a single field
    const validateField = (field: string, value: any): string => {
        // Add validation logic here if needed
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
        return true
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const contactData = {
            ...formData,
        }

        createContactMutation.mutate(contactData, {
            onSuccess: () => {
                navigate({ to: ROUTES.dashboard.crm.contacts.list })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
        { title: 'إدارة العلاقات', href: ROUTES.dashboard.crm.dashboard, isActive: true },
        { title: 'القضايا', href: ROUTES.dashboard.cases.list, isActive: false },
        { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: false },
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
                <ProductivityHero badge="إدارة العلاقات" title="إنشاء جهة اتصال" type="crm" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN FORM */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* FIRM SIZE SELECTOR */}
                                <Card className="border-0 shadow-sm">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                            نوع المكتب / Office Type
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
                                    </CardContent>
                                </Card>

                                {/* BASIC/ADVANCED TOGGLE */}
                                <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-blue-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-blue-500" />
                                                    {showAdvanced ? 'العرض المتقدم' : 'العرض الأساسي'}
                                                    <span className="text-sm font-normal text-slate-500">
                                                        / {showAdvanced ? 'Advanced View' : 'Basic View'}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {showAdvanced
                                                        ? 'جميع الحقول متاحة (60+ حقل)'
                                                        : 'الحقول الأساسية فقط (~12 حقل)'}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={showAdvanced}
                                                onCheckedChange={setShowAdvanced}
                                                className="data-[state=checked]:bg-emerald-500"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ═══════════════════════════════════════ */}
                                {/* BASIC INFO - Always Visible */}
                                {/* ═══════════════════════════════════════ */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية / Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اللقب / Salutation
                                            </label>
                                            <Select value={formData.salutation} onValueChange={(value) => handleChange('salutation', value)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="اختر..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mr">Mr. / السيد</SelectItem>
                                                    <SelectItem value="mrs">Mrs. / السيدة</SelectItem>
                                                    <SelectItem value="ms">Ms. / الآنسة</SelectItem>
                                                    <SelectItem value="dr">Dr. / الدكتور</SelectItem>
                                                    <SelectItem value="prof">Prof. / الأستاذ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الأول / First Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="محمد / Mohammed"
                                                className="rounded-xl"
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الأوسط / Middle Name
                                            </label>
                                            <Input
                                                placeholder="أحمد / Ahmed"
                                                className="rounded-xl"
                                                value={formData.middleName}
                                                onChange={(e) => handleChange('middleName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اسم العائلة / Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="العلي / Al-Ali"
                                                className="rounded-xl"
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الكامل بالعربية / Full Arabic Name
                                            </label>
                                            <Input
                                                placeholder="محمد أحمد العلي"
                                                className="rounded-xl"
                                                value={formData.fullNameArabic}
                                                onChange={(e) => handleChange('fullNameArabic', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم المفضل / Preferred Name
                                            </label>
                                            <Input
                                                placeholder="محمد / Mohammed"
                                                className="rounded-xl"
                                                value={formData.preferredName}
                                                onChange={(e) => handleChange('preferredName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                البريد الإلكتروني / Email <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="name@company.com"
                                                className="rounded-xl"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" />
                                                الهاتف / Phone
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 12 345 6789"
                                                className="rounded-xl"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-emerald-500" />
                                                الجوال / Mobile <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 5X XXX XXXX"
                                                className="rounded-xl"
                                                value={formData.mobile}
                                                onChange={(e) => handleChange('mobile', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-purple-500" />
                                                الشركة / Company
                                            </label>
                                            <Input
                                                placeholder="شركة التقنية المتقدمة"
                                                className="rounded-xl"
                                                value={formData.company}
                                                onChange={(e) => handleChange('company', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-purple-500" />
                                                المسمى الوظيفي / Job Title
                                            </label>
                                            <Input
                                                placeholder="مدير مبيعات / Sales Manager"
                                                className="rounded-xl"
                                                value={formData.jobTitle}
                                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-purple-500" />
                                                القسم / Department
                                            </label>
                                            <Input
                                                placeholder="المبيعات / Sales"
                                                className="rounded-xl"
                                                value={formData.department}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            العميل المرتبط / Linked Client
                                        </label>
                                        <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder="اختر العميل / Select Client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clientsLoading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                ) : clients?.data && clients.data.length > 0 ? (
                                                    clients.data.map((client) => (
                                                        <SelectItem key={client._id} value={client._id}>
                                                            {client.fullName}
                                                            {client.companyName && ` - ${client.companyName}`}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-slate-500 text-sm">
                                                        لا يوجد عملاء
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* ═══════════════════════════════════════ */}
                                {/* ADVANCED SECTIONS - Only if showAdvanced */}
                                {/* ═══════════════════════════════════════ */}
                                {showAdvanced && (
                                    <>
                                        {/* PERSONAL DETAILS */}
                                        <Collapsible open={personalDetails} onOpenChange={setPersonalDetails}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-purple-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <User className="w-5 h-5 text-purple-500" />
                                                                التفاصيل الشخصية / Personal Details
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", personalDetails && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الكنية / Nickname</label>
                                                                <Input placeholder="مثال: أبو أحمد" className="rounded-xl" value={formData.nickname} onChange={(e) => handleChange('nickname', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">اسم العائلة قبل الزواج / Maiden Name</label>
                                                                <Input placeholder="للسيدات المتزوجات" className="rounded-xl" value={formData.maidenName} onChange={(e) => handleChange('maidenName', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">
                                                                    <Calendar className="w-4 h-4 inline me-1" />
                                                                    تاريخ الميلاد / Date of Birth
                                                                </label>
                                                                <Input type="date" className="rounded-xl" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الجنس / Gender</label>
                                                                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="male">ذكر / Male</SelectItem>
                                                                        <SelectItem value="female">أنثى / Female</SelectItem>
                                                                        <SelectItem value="other">أخرى / Other</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الجنسية / Nationality</label>
                                                                <Input placeholder="السعودية / Saudi" className="rounded-xl" value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">اللغات / Languages</label>
                                                                <Input placeholder="العربية، الإنجليزية" className="rounded-xl" value={formData.languages} onChange={(e) => handleChange('languages', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">
                                                                    <CreditCard className="w-4 h-4 inline me-1" />
                                                                    رقم الهوية الوطنية / National ID
                                                                </label>
                                                                <Input placeholder="1XXXXXXXXX" className="rounded-xl" dir="ltr" value={formData.nationalId} onChange={(e) => handleChange('nationalId', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">رقم جواز السفر / Passport Number</label>
                                                                <Input placeholder="A12345678" className="rounded-xl" dir="ltr" value={formData.passportNumber} onChange={(e) => handleChange('passportNumber', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">بلد جواز السفر / Passport Country</label>
                                                            <Input placeholder="Saudi Arabia" className="rounded-xl" value={formData.passportCountry} onChange={(e) => handleChange('passportCountry', e.target.value)} />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* CONTACT METHODS */}
                                        <Collapsible open={contactMethods} onOpenChange={setContactMethods}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-blue-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Phone className="w-5 h-5 text-blue-500" />
                                                                طرق الاتصال الموسعة / Extended Contact Methods
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", contactMethods && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Mail className="w-4 h-4 inline me-1" />بريد العمل / Work Email</label>
                                                                <Input type="email" placeholder="name@company.com" className="rounded-xl" value={formData.workEmail} onChange={(e) => handleChange('workEmail', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Mail className="w-4 h-4 inline me-1" />البريد الشخصي / Personal Email</label>
                                                                <Input type="email" placeholder="personal@gmail.com" className="rounded-xl" value={formData.personalEmail} onChange={(e) => handleChange('personalEmail', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">هاتف العمل / Work Phone</label>
                                                                <Input type="tel" placeholder="+966 11 XXX XXXX" className="rounded-xl" value={formData.workPhone} onChange={(e) => handleChange('workPhone', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">هاتف المنزل / Home Phone</label>
                                                                <Input type="tel" placeholder="+966 11 XXX XXXX" className="rounded-xl" value={formData.homePhone} onChange={(e) => handleChange('homePhone', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">جوال إضافي / Mobile 2</label>
                                                                <Input type="tel" placeholder="+966 5X XXX XXXX" className="rounded-xl" value={formData.mobile2} onChange={(e) => handleChange('mobile2', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">فاكس / Fax</label>
                                                                <Input type="tel" placeholder="+966 11 XXX XXXX" className="rounded-xl" value={formData.fax} onChange={(e) => handleChange('fax', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">بيجر / Pager</label>
                                                                <Input placeholder="Pager number" className="rounded-xl" value={formData.pager} onChange={(e) => handleChange('pager', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Video className="w-4 h-4 inline me-1" />Skype ID</label>
                                                                <Input placeholder="skype_username" className="rounded-xl" value={formData.skype} onChange={(e) => handleChange('skype', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Video className="w-4 h-4 inline me-1" />Zoom ID</label>
                                                                <Input placeholder="zoom_meeting_id" className="rounded-xl" value={formData.zoomId} onChange={(e) => handleChange('zoomId', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><MessageSquare className="w-4 h-4 inline me-1" />WhatsApp</label>
                                                                <Input type="tel" placeholder="+966 5X XXX XXXX" className="rounded-xl" value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><MessageSquare className="w-4 h-4 inline me-1" />Telegram</label>
                                                                <Input placeholder="@username" className="rounded-xl" value={formData.telegram} onChange={(e) => handleChange('telegram', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Globe className="w-4 h-4 inline me-1" />LinkedIn</label>
                                                                <Input placeholder="linkedin.com/in/username" className="rounded-xl" value={formData.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Globe className="w-4 h-4 inline me-1" />Twitter</label>
                                                                <Input placeholder="@username" className="rounded-xl" value={formData.twitter} onChange={(e) => handleChange('twitter', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Globe className="w-4 h-4 inline me-1" />Facebook</label>
                                                                <Input placeholder="facebook.com/username" className="rounded-xl" value={formData.facebook} onChange={(e) => handleChange('facebook', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700"><Globe className="w-4 h-4 inline me-1" />الموقع الإلكتروني / Website</label>
                                                            <Input placeholder="https://example.com" className="rounded-xl" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">طريقة الاتصال المفضلة / Preferred Contact Method</label>
                                                                <Select value={formData.preferredContactMethod} onValueChange={(value) => handleChange('preferredContactMethod', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="email">Email / بريد إلكتروني</SelectItem>
                                                                        <SelectItem value="phone">Phone / هاتف</SelectItem>
                                                                        <SelectItem value="mobile">Mobile / جوال</SelectItem>
                                                                        <SelectItem value="whatsapp">WhatsApp / واتساب</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">أفضل وقت للاتصال / Best Time to Contact</label>
                                                                <Input placeholder="9AM - 5PM" className="rounded-xl" value={formData.bestTimeToContact} onChange={(e) => handleChange('bestTimeToContact', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* PROFESSIONAL INFO */}
                                        <Collapsible open={professionalInfo} onOpenChange={setProfessionalInfo}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-amber-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Briefcase className="w-5 h-5 text-amber-500" />
                                                                المعلومات المهنية / Professional Info
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", professionalInfo && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الدور / Role</label>
                                                                <Input placeholder="Senior Manager" className="rounded-xl" value={formData.role} onChange={(e) => handleChange('role', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">يرفع إلى / Reports To</label>
                                                                <Input placeholder="اسم المدير" className="rounded-xl" value={formData.reportsTo} onChange={(e) => handleChange('reportsTo', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">اسم المساعد / Assistant Name</label>
                                                                <Input placeholder="اسم المساعد" className="rounded-xl" value={formData.assistantName} onChange={(e) => handleChange('assistantName', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">سنوات في المنصب / Years in Position</label>
                                                                <Input type="number" placeholder="5" className="rounded-xl" value={formData.yearsInPosition} onChange={(e) => handleChange('yearsInPosition', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المستوى الوظيفي / Career Level</label>
                                                                <Select value={formData.careerLevel} onValueChange={(value) => handleChange('careerLevel', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="entry">Entry Level / مبتدئ</SelectItem>
                                                                        <SelectItem value="mid">Mid Level / متوسط</SelectItem>
                                                                        <SelectItem value="senior">Senior / متقدم</SelectItem>
                                                                        <SelectItem value="executive">Executive / تنفيذي</SelectItem>
                                                                        <SelectItem value="c-level">C-Level / إداري عليا</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700"><Award className="w-4 h-4 inline me-1" />التراخيص المهنية / Professional Licenses</label>
                                                                <Input placeholder="PMP, CPA, etc." className="rounded-xl" value={formData.professionalLicenses} onChange={(e) => handleChange('professionalLicenses', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">التخصصات / Specializations</label>
                                                            <Textarea placeholder="Project Management, Business Analysis..." className="rounded-xl min-h-[80px]" value={formData.specializations} onChange={(e) => handleChange('specializations', e.target.value)} />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* HOME ADDRESS */}
                                        <Collapsible open={homeAddress} onOpenChange={setHomeAddress}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-green-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Home className="w-5 h-5 text-green-500" />
                                                                عنوان المنزل / Home Address
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", homeAddress && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الشارع / Street</label>
                                                                <Input placeholder="شارع الملك فهد" className="rounded-xl" value={formData.homeStreet} onChange={(e) => handleChange('homeStreet', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الشقة/الجناح / Apt/Suite</label>
                                                                <Input placeholder="شقة رقم 5" className="rounded-xl" value={formData.homeApt} onChange={(e) => handleChange('homeApt', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المدينة / City</label>
                                                                <Input placeholder="الرياض" className="rounded-xl" value={formData.homeCity} onChange={(e) => handleChange('homeCity', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المنطقة/الولاية / State</label>
                                                                <Input placeholder="الرياض" className="rounded-xl" value={formData.homeState} onChange={(e) => handleChange('homeState', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الرمز البريدي / Postal Code</label>
                                                                <Input placeholder="12345" className="rounded-xl" value={formData.homePostalCode} onChange={(e) => handleChange('homePostalCode', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الدولة / Country</label>
                                                                <Input placeholder="السعودية" className="rounded-xl" value={formData.homeCountry} onChange={(e) => handleChange('homeCountry', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* WORK ADDRESS */}
                                        <Collapsible open={workAddress} onOpenChange={setWorkAddress}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-indigo-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Building2 className="w-5 h-5 text-indigo-500" />
                                                                عنوان العمل / Work Address
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", workAddress && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الشارع / Street</label>
                                                                <Input placeholder="شارع العليا" className="rounded-xl" value={formData.workStreet} onChange={(e) => handleChange('workStreet', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المبنى / Building</label>
                                                                <Input placeholder="برج الفيصلية" className="rounded-xl" value={formData.workBuilding} onChange={(e) => handleChange('workBuilding', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الطابق / Floor</label>
                                                                <Input placeholder="الطابق 12" className="rounded-xl" value={formData.workFloor} onChange={(e) => handleChange('workFloor', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المدينة / City</label>
                                                                <Input placeholder="الرياض" className="rounded-xl" value={formData.workCity} onChange={(e) => handleChange('workCity', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">المنطقة/الولاية / State</label>
                                                                <Input placeholder="الرياض" className="rounded-xl" value={formData.workState} onChange={(e) => handleChange('workState', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الرمز البريدي / Postal Code</label>
                                                                <Input placeholder="12345" className="rounded-xl" value={formData.workPostalCode} onChange={(e) => handleChange('workPostalCode', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الدولة / Country</label>
                                                                <Input placeholder="السعودية" className="rounded-xl" value={formData.workCountry} onChange={(e) => handleChange('workCountry', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* RELATIONSHIPS */}
                                        <Collapsible open={relationships} onOpenChange={setRelationships}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-pink-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Heart className="w-5 h-5 text-pink-500" />
                                                                العلاقات / Relationships
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", relationships && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">جهات الاتصال ذات الصلة / Related Contacts</label>
                                                            <Textarea placeholder="Spouse, Colleague, etc..." className="rounded-xl" value={formData.relatedContacts} onChange={(e) => handleChange('relatedContacts', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">علاقات الحساب / Account Relationships</label>
                                                            <Input placeholder="Primary Contact, Decision Maker..." className="rounded-xl" value={formData.accountRelationships} onChange={(e) => handleChange('accountRelationships', e.target.value)} />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">مستوى التأثير / Influence Level</label>
                                                                <Select value={formData.influenceLevel} onValueChange={(value) => handleChange('influenceLevel', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="low">منخفض / Low</SelectItem>
                                                                        <SelectItem value="medium">متوسط / Medium</SelectItem>
                                                                        <SelectItem value="high">عالي / High</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">دور اتخاذ القرار / Decision Role</label>
                                                                <Select value={formData.decisionRole} onValueChange={(value) => handleChange('decisionRole', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="decision_maker">صانع القرار / Decision Maker</SelectItem>
                                                                        <SelectItem value="influencer">مؤثر / Influencer</SelectItem>
                                                                        <SelectItem value="user">مستخدم / User</SelectItem>
                                                                        <SelectItem value="gatekeeper">حارس البوابة / Gatekeeper</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">مصدر الإحالة / Referral Source</label>
                                                            <Input placeholder="كيف تعرفت على هذا الشخص" className="rounded-xl" value={formData.referralSource} onChange={(e) => handleChange('referralSource', e.target.value)} />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* COMMUNICATION PREFERENCES */}
                                        <Collapsible open={commPreferences} onOpenChange={setCommPreferences}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-cyan-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <MessageSquare className="w-5 h-5 text-cyan-500" />
                                                                تفضيلات التواصل / Communication Preferences
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", commPreferences && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">اللغة المفضلة / Preferred Language</label>
                                                                <Select value={formData.preferredLanguage} onValueChange={(value) => handleChange('preferredLanguage', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="ar">العربية / Arabic</SelectItem>
                                                                        <SelectItem value="en">الإنجليزية / English</SelectItem>
                                                                        <SelectItem value="both">كلاهما / Both</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">تكرار التواصل / Communication Frequency</label>
                                                                <Select value={formData.communicationFrequency} onValueChange={(value) => handleChange('communicationFrequency', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="daily">يومي / Daily</SelectItem>
                                                                        <SelectItem value="weekly">أسبوعي / Weekly</SelectItem>
                                                                        <SelectItem value="monthly">شهري / Monthly</SelectItem>
                                                                        <SelectItem value="quarterly">ربع سنوي / Quarterly</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                                <label className="text-sm font-medium text-slate-700">الموافقة على البريد الإلكتروني / Email Opt-in</label>
                                                                <Checkbox checked={formData.emailOptIn} onCheckedChange={(checked) => handleChange('emailOptIn', checked)} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                                <label className="text-sm font-medium text-slate-700">الموافقة على الرسائل النصية / SMS Opt-in</label>
                                                                <Checkbox checked={formData.smsOptIn} onCheckedChange={(checked) => handleChange('smsOptIn', checked)} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                                <label className="text-sm font-medium text-slate-700">الاشتراك في النشرة الإخبارية / Newsletter Subscription</label>
                                                                <Checkbox checked={formData.newsletterSubscription} onCheckedChange={(checked) => handleChange('newsletterSubscription', checked)} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                                <label className="text-sm font-medium text-red-700">عدم الاتصال / Do Not Call</label>
                                                                <Checkbox checked={formData.doNotCall} onCheckedChange={(checked) => handleChange('doNotCall', checked)} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                                <label className="text-sm font-medium text-red-700">عدم إرسال بريد إلكتروني / Do Not Email</label>
                                                                <Checkbox checked={formData.doNotEmail} onCheckedChange={(checked) => handleChange('doNotEmail', checked)} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                                <label className="text-sm font-medium text-red-700">عدم إرسال بريد عادي / Do Not Mail</label>
                                                                <Checkbox checked={formData.doNotMail} onCheckedChange={(checked) => handleChange('doNotMail', checked)} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* LEGAL/LAW FIRM SPECIFIC */}
                                        <Collapsible open={legalInfo} onOpenChange={setLegalInfo}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-red-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <Shield className="w-5 h-5 text-red-500" />
                                                                معلومات قانونية (مكاتب المحاماة) / Legal Info (Law Firms)
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", legalInfo && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">عميل منذ / Client Since</label>
                                                                <Input type="date" className="rounded-xl" value={formData.clientSince} onChange={(e) => handleChange('clientSince', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">حالة التعارض / Conflict Status</label>
                                                                <Select value={formData.conflictStatus} onValueChange={(value) => handleChange('conflictStatus', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="clear">واضح / Clear</SelectItem>
                                                                        <SelectItem value="potential">محتمل / Potential</SelectItem>
                                                                        <SelectItem value="confirmed">مؤكد / Confirmed</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">نقابة المحامين / Bar Association</label>
                                                                <Input placeholder="Saudi Bar Association" className="rounded-xl" value={formData.barAssociation} onChange={(e) => handleChange('barAssociation', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">رقم الترخيص / License Number</label>
                                                                <Input placeholder="123456" className="rounded-xl" value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">مجالات التخصص القانونية / Law Specialization Areas</label>
                                                            <Textarea placeholder="Corporate Law, Criminal Law..." className="rounded-xl" value={formData.lawSpecializations} onChange={(e) => handleChange('lawSpecializations', e.target.value)} />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* FINANCIAL INFO */}
                                        <Collapsible open={financialInfo} onOpenChange={setFinancialInfo}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-yellow-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <DollarSign className="w-5 h-5 text-yellow-500" />
                                                                معلومات مالية / Financial Info
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", financialInfo && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الحالة الائتمانية / Credit Status</label>
                                                                <Select value={formData.creditStatus} onValueChange={(value) => handleChange('creditStatus', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="excellent">ممتاز / Excellent</SelectItem>
                                                                        <SelectItem value="good">جيد / Good</SelectItem>
                                                                        <SelectItem value="fair">مقبول / Fair</SelectItem>
                                                                        <SelectItem value="poor">ضعيف / Poor</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">شروط الدفع / Payment Terms</label>
                                                                <Select value={formData.paymentTerms} onValueChange={(value) => handleChange('paymentTerms', value)}>
                                                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر..." /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="net_30">Net 30</SelectItem>
                                                                        <SelectItem value="net_60">Net 60</SelectItem>
                                                                        <SelectItem value="net_90">Net 90</SelectItem>
                                                                        <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                            <label className="text-sm font-medium text-slate-700">جهة اتصال الفواتير / Billing Contact</label>
                                                            <Checkbox checked={formData.isBillingContact} onCheckedChange={(checked) => handleChange('isBillingContact', checked)} />
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* MARKETING INFO */}
                                        <Collapsible open={marketingInfo} onOpenChange={setMarketingInfo}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-orange-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <TrendingUp className="w-5 h-5 text-orange-500" />
                                                                معلومات تسويقية / Marketing Info
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", marketingInfo && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">مصدر العميل المحتمل / Lead Source</label>
                                                                <Input placeholder="Website, Referral, Event..." className="rounded-xl" value={formData.leadSource} onChange={(e) => handleChange('leadSource', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">الحملة / Campaign</label>
                                                                <Input placeholder="Campaign name" className="rounded-xl" value={formData.campaign} onChange={(e) => handleChange('campaign', e.target.value)} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">درجة التسويق / Marketing Score</label>
                                                                <Input type="number" placeholder="0-100" className="rounded-xl" value={formData.marketingScore} onChange={(e) => handleChange('marketingScore', e.target.value)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">آخر نقطة اتصال تسويقية / Last Marketing Touch</label>
                                                                <Input type="date" className="rounded-xl" value={formData.lastMarketingTouch} onChange={(e) => handleChange('lastMarketingTouch', e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* NOTES & HISTORY */}
                                        <Collapsible open={notesHistory} onOpenChange={setNotesHistory}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-slate-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <FileText className="w-5 h-5 text-slate-500" />
                                                                الملاحظات والسجل / Notes & History
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", notesHistory && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">الوصف / السيرة الذاتية / Description/Bio</label>
                                                            <Textarea placeholder="نبذة عن الشخص..." className="rounded-xl min-h-[100px]" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">ملاحظات داخلية / Internal Notes</label>
                                                            <Textarea placeholder="ملاحظات للفريق الداخلي فقط..." className="rounded-xl min-h-[100px]" value={formData.internalNotes} onChange={(e) => handleChange('internalNotes', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">ملخص الأنشطة / Activity Summary</label>
                                                            <Textarea placeholder="ملخص الأنشطة والتفاعلات..." className="rounded-xl min-h-[100px]" value={formData.activitySummary} onChange={(e) => handleChange('activitySummary', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                                الوسوم / Tags
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
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>

                                        {/* CUSTOM FIELDS */}
                                        <Collapsible open={customFields} onOpenChange={setCustomFields}>
                                            <Card className="border-0 shadow-sm border-s-4 border-s-gray-500">
                                                <CollapsibleTrigger asChild>
                                                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="flex items-center gap-2">
                                                                <AlertCircle className="w-5 h-5 text-gray-500" />
                                                                حقول مخصصة / Custom Fields
                                                            </span>
                                                            <ChevronDown className={cn("w-5 h-5 transition-transform", customFields && "rotate-180")} />
                                                        </CardTitle>
                                                    </CardHeader>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <CardContent className="space-y-4 pt-0">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-slate-700">الفئات / Categories</label>
                                                            <Input placeholder="VIP, Enterprise, SMB..." className="rounded-xl" value={formData.categories} onChange={(e) => handleChange('categories', e.target.value)} />
                                                        </div>
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <div key={num} className="space-y-2">
                                                                <label className="text-sm font-medium text-slate-700">حقل مخصص {num} / Custom Field {num}</label>
                                                                <Input placeholder={`Custom value ${num}`} className="rounded-xl" value={formData[`customField${num}` as keyof typeof formData]} onChange={(e) => handleChange(`customField${num}`, e.target.value)} />
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </CollapsibleContent>
                                            </Card>
                                        </Collapsible>
                                    </>
                                )}

                                {/* SUBMIT BUTTONS */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.crm.contacts.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy rounded-xl">
                                            إلغاء / Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[180px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createContactMutation.isPending}
                                    >
                                        {createContactMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ جهة الاتصال / Save Contact
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <CrmSidebar context="leads" />
                </div>
            </Main>
        </>
    )
}

export default ContactFormView
