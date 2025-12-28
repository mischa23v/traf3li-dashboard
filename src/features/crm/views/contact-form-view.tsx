import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, User, Mail, Phone, Building2, Briefcase,
    MapPin, FileText, Tag, Loader2, ChevronDown, ChevronUp,
    X, Plus, Users
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
    const [showOrgFields, setShowOrgFields] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fullNameArabic: '',
        email: '',
        phone: '',
        mobile: '',
        company: '',
        jobTitle: '',
        department: '',
        street: '',
        city: '',
        country: '',
        postalCode: '',
        notes: '',
        tags: [] as string[],
        clientId: '',
    })

    // Section toggles
    const [showAddress, setShowAddress] = useState(false)
    const [showAdditional, setShowAdditional] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Validate a single field (validation disabled for testing)
    const validateField = (_field: string, _value: any): string => {
        return ''
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields (validation disabled for testing)
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

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const contactData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            fullNameArabic: formData.fullNameArabic,
            email: formData.email,
            phone: formData.phone,
            mobile: formData.mobile,
            company: formData.company,
            jobTitle: formData.jobTitle,
            department: formData.department,
            street: formData.street,
            city: formData.city,
            country: formData.country,
            postalCode: formData.postalCode,
            notes: formData.notes,
            tags: formData.tags,
            ...(formData.clientId && { clientId: formData.clientId }),
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
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="إدارة العلاقات" title="إنشاء جهة اتصال" type="crm" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
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

                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الاسم الأول
                                            </label>
                                            <Input
                                                placeholder="مثال: محمد"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.firstName && errors.firstName && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                                onBlur={() => handleBlur('firstName')}
                                            />
                                            {touched.firstName && errors.firstName && (
                                                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الاسم الأخير
                                            </label>
                                            <Input
                                                placeholder="مثال: أحمد"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.lastName && errors.lastName && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                                onBlur={() => handleBlur('lastName')}
                                            />
                                            {touched.lastName && errors.lastName && (
                                                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <User className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            الاسم الكامل بالعربية
                                        </label>
                                        <Input
                                            placeholder="مثال: محمد أحمد العلي"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.fullNameArabic}
                                            onChange={(e) => handleChange('fullNameArabic', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Phone className="w-5 h-5 text-emerald-500" />
                                        معلومات الاتصال
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                البريد الإلكتروني
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="example@domain.com"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الهاتف
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 12 345 6789"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الجوال
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 5X XXX XXXX"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.mobile}
                                                onChange={(e) => handleChange('mobile', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Work Info */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        معلومات العمل
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الشركة
                                            </label>
                                            <Input
                                                placeholder="مثال: شركة التقنية المتقدمة"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.company}
                                                onChange={(e) => handleChange('company', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                المسمى الوظيفي
                                            </label>
                                            <Input
                                                placeholder="مثال: مدير مبيعات"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.jobTitle}
                                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                القسم
                                            </label>
                                            <Input
                                                placeholder="مثال: المبيعات"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.department}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            {t('contacts.linkedClient', 'العميل المرتبط')}
                                        </label>
                                        <Select value={formData.clientId} onValueChange={(value) => handleChange('clientId', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder={t('contacts.selectClient', 'اختر العميل')} />
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
                                                        {t('contacts.noClients', 'لا يوجد عملاء')}
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
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
                                                            placeholder="مثال: قسم العملاء الرئيسيين"
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">رقم حساب العميل</label>
                                                        <Input
                                                            placeholder="مثال: CLIENT-2024-001"
                                                            className="rounded-xl"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                )}

                                {/* Address Section - Collapsible */}
                                <Collapsible open={showAddress} onOpenChange={setShowAddress}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <MapPin className="w-5 h-5 text-emerald-500" />
                                                        العنوان
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                    {showAddress ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">الشارع</label>
                                                    <Input
                                                        placeholder="مثال: شارع الملك فهد"
                                                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                        value={formData.street}
                                                        onChange={(e) => handleChange('street', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">المدينة</label>
                                                        <Input
                                                            placeholder="مثال: الرياض"
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                            value={formData.city}
                                                            onChange={(e) => handleChange('city', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">الدولة</label>
                                                        <Input
                                                            placeholder="مثال: السعودية"
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                            value={formData.country}
                                                            onChange={(e) => handleChange('country', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-slate-700">الرمز البريدي</label>
                                                        <Input
                                                            placeholder="12345"
                                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                            value={formData.postalCode}
                                                            onChange={(e) => handleChange('postalCode', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Additional Section - Collapsible */}
                                <Collapsible open={showAdditional} onOpenChange={setShowAdditional}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-emerald-500" />
                                                        معلومات إضافية
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                    {showAdditional ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        ملاحظات
                                                    </label>
                                                    <Textarea
                                                        placeholder="أدخل أي ملاحظات إضافية..."
                                                        className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                        value={formData.notes}
                                                        onChange={(e) => handleChange('notes', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-emerald-500" />
                                                        الوسوم
                                                    </label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {formData.tags.map(tag => (
                                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                                {tag}
                                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                                    <X className="w-3 h-3" aria-hidden="true" />
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
                                                            <Plus className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.crm.contacts.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createContactMutation.isPending}
                                    >
                                        {createContactMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                حفظ جهة الاتصال
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <CrmSidebar context="leads" />
                </div>
            </Main>
        </>
    )
}

export default ContactFormView
