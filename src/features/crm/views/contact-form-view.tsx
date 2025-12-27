import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, ArrowLeft, Save, User, Mail, MapPin,
    FileText, Loader2, Phone, Building, Globe, Hash,
    ChevronLeft, ChevronRight, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateContact, useUpdateContact, useContact } from '@/hooks/useContacts'
import { useClients } from '@/hooks/useCasesAndClients'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

const contactFormSchema = z.object({
    // Step 1: Basic Info
    firstName: z.string().min(1, 'الاسم الأول مطلوب'),
    lastName: z.string().min(1, 'اسم العائلة مطلوب'),
    fullNameArabic: z.string().optional(),
    title: z.string().optional(),
    department: z.string().optional(),

    // Step 2: Contact Details
    email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(), // alternatePhone
    fax: z.string().optional(), // Will be ignored, just for form compatibility
    preferredContactMethod: z.enum(['email', 'phone', 'whatsapp', 'sms']).default('email'),

    // Step 3: Address
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(), // district
    country: z.string().default('SA'),
    postalCode: z.string().optional(),
    nationalAddress: z.string().optional(), // nationalId

    // Step 4: Additional Info
    linkedClient: z.string().optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
})

type ContactFormData = z.infer<typeof contactFormSchema>

// ═══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, name: 'Basic Info', nameAr: 'المعلومات الأساسية', icon: User },
    { id: 2, name: 'Contact', nameAr: 'معلومات الاتصال', icon: Mail },
    { id: 3, name: 'Address', nameAr: 'العنوان', icon: MapPin },
    { id: 4, name: 'Additional', nameAr: 'معلومات إضافية', icon: FileText },
]

interface ContactFormViewProps {
    editMode?: boolean
}

export function ContactFormView({ editMode = false }: ContactFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/crm/contacts/$contactId/edit' }) : null
    const contactId = params?.contactId

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [currentStep, setCurrentStep] = useState(1)
    const [tagInput, setTagInput] = useState('')

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createContactMutation = useCreateContact()
    const updateContactMutation = useUpdateContact()
    const { data: contactData, isLoading: isLoadingContact } = useContact(contactId || '', editMode && !!contactId)
    const { data: clientsData, isLoading: loadingClients } = useClients()

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            fullNameArabic: '',
            title: '',
            department: '',
            email: '',
            phone: '',
            mobile: '',
            fax: '',
            preferredContactMethod: 'email',
            street: '',
            city: '',
            state: '',
            country: 'SA',
            postalCode: '',
            nationalAddress: '',
            linkedClient: '',
            tags: [],
            notes: '',
            isActive: true,
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // Load existing contact data in edit mode
    useEffect(() => {
        if (editMode && contactData) {
            const contact = contactData
            form.reset({
                firstName: contact.firstName || '',
                lastName: contact.lastName || '',
                fullNameArabic: contact.fullNameArabic || contact.arabicName?.fullName || '',
                title: contact.title || '',
                department: contact.department || '',
                email: contact.email || '',
                phone: contact.phone || '',
                mobile: contact.alternatePhone || '',
                fax: '',
                preferredContactMethod: (contact.preferredContactMethod as any) || 'email',
                street: contact.address || '',
                city: contact.city || '',
                state: contact.district || '',
                country: contact.country || 'SA',
                postalCode: contact.postalCode || '',
                nationalAddress: contact.nationalId || '',
                linkedClient: contact.linkedClients?.[0] || '',
                tags: contact.tags || [],
                notes: contact.notes || '',
                isActive: contact.status === 'active',
            })
        }
    }, [editMode, contactData, form])

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: ContactFormData) => {
        const contactData = {
            firstName: data.firstName,
            lastName: data.lastName,
            fullNameArabic: data.fullNameArabic,
            title: data.title,
            department: data.department,
            email: data.email || undefined,
            phone: data.phone,
            alternatePhone: data.mobile,
            preferredContactMethod: data.preferredContactMethod,
            address: data.street,
            city: data.city,
            district: data.state,
            country: data.country,
            postalCode: data.postalCode,
            nationalId: data.nationalAddress,
            linkedClients: data.linkedClient ? [data.linkedClient] : undefined,
            tags: data.tags,
            notes: data.notes,
            status: data.isActive ? 'active' : 'inactive',
        }

        if (editMode && contactId) {
            updateContactMutation.mutate(
                { contactId, data: contactData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.crm.contacts.list })
                    }
                }
            )
        } else {
            createContactMutation.mutate(contactData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.contacts.list })
                }
            })
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    const canGoToNextStep = () => {
        switch (currentStep) {
            case 1:
                return form.watch('firstName') !== '' && form.watch('lastName') !== ''
            case 2:
                return true // All fields optional
            case 3:
                return true // All fields optional
            case 4:
                return true
            default:
                return false
        }
    }

    const nextStep = () => {
        if (canGoToNextStep() && currentStep < 4) {
            setCurrentStep(currentStep + 1)
        }
    }

    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // TAG MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const addTag = () => {
        const trimmedTag = tagInput.trim()
        if (trimmedTag && !form.watch('tags').includes(trimmedTag)) {
            form.setValue('tags', [...form.watch('tags'), trimmedTag], { shouldDirty: true })
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        form.setValue('tags', form.watch('tags').filter(t => t !== tag), { shouldDirty: true })
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER HELPERS
    // ═══════════════════════════════════════════════════════════════

    const clients = clientsData?.data || []

    // ═══════════════════════════════════════════════════════════════
    // STEP RENDERS
    // ═══════════════════════════════════════════════════════════════

    const renderStepIndicators = () => (
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
            {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(step.id)}
                        disabled={step.id > currentStep && !canGoToNextStep()}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                            currentStep === step.id
                                ? "bg-blue-500 text-white shadow-lg"
                                : currentStep > step.id
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        <step.icon className="w-4 h-4" />
                        <span className="hidden md:inline text-sm font-medium">
                            {isRTL ? step.nameAr : step.name}
                        </span>
                        <span className="md:hidden text-sm font-bold">{step.id}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                        <div className={cn(
                            "w-8 md:w-12 h-0.5 mx-1",
                            currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                        )} />
                    )}
                </div>
            ))}
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الاسم الأول <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="firstName"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="أحمد"
                                className="rounded-xl"
                            />
                        )}
                    />
                    {form.formState.errors.firstName && (
                        <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        اسم العائلة <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="lastName"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="محمد"
                                className="rounded-xl"
                            />
                        )}
                    />
                    {form.formState.errors.lastName && (
                        <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الاسم الكامل بالعربية
                </label>
                <Controller
                    name="fullNameArabic"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="أحمد بن محمد العلي"
                            className="rounded-xl"
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        المسمى الوظيفي
                    </label>
                    <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مدير تنفيذي"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        القسم
                    </label>
                    <Controller
                        name="department"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="الشؤون القانونية"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-500" />
                معلومات الاتصال
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    البريد الإلكتروني
                </label>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="email"
                            placeholder="example@example.com"
                            className="rounded-xl"
                            dir="ltr"
                        />
                    )}
                />
                {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        رقم الهاتف
                    </label>
                    <Controller
                        name="phone"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="tel"
                                placeholder="+966 50 123 4567"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        رقم الجوال البديل
                    </label>
                    <Controller
                        name="mobile"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="tel"
                                placeholder="+966 55 123 4567"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    طريقة التواصل المفضلة
                </label>
                <Controller
                    name="preferredContactMethod"
                    control={form.control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">البريد الإلكتروني</SelectItem>
                                <SelectItem value="phone">الهاتف</SelectItem>
                                <SelectItem value="whatsapp">واتساب</SelectItem>
                                <SelectItem value="sms">رسالة نصية</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-500" />
                معلومات العنوان
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الشارع / العنوان
                </label>
                <Controller
                    name="street"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="شارع الملك فهد"
                            className="rounded-xl"
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        المدينة
                    </label>
                    <Controller
                        name="city"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="الرياض"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الحي / المنطقة
                    </label>
                    <Controller
                        name="state"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="العليا"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        الدولة
                    </label>
                    <Controller
                        name="country"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SA">المملكة العربية السعودية</SelectItem>
                                    <SelectItem value="AE">الإمارات العربية المتحدة</SelectItem>
                                    <SelectItem value="KW">الكويت</SelectItem>
                                    <SelectItem value="BH">البحرين</SelectItem>
                                    <SelectItem value="QA">قطر</SelectItem>
                                    <SelectItem value="OM">عمان</SelectItem>
                                    <SelectItem value="JO">الأردن</SelectItem>
                                    <SelectItem value="LB">لبنان</SelectItem>
                                    <SelectItem value="EG">مصر</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الرمز البريدي
                    </label>
                    <Controller
                        name="postalCode"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="12345"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    العنوان الوطني السعودي
                </label>
                <Controller
                    name="nationalAddress"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="AAAA1234"
                            className="rounded-xl"
                            dir="ltr"
                        />
                    )}
                />
                <p className="text-xs text-slate-500">
                    رقم الهوية الوطنية أو الإقامة للعنوان الوطني
                </p>
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                معلومات إضافية
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    ربط بعميل
                </label>
                <Controller
                    name="linkedClient"
                    control={form.control}
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-xl border-slate-200">
                                <SelectValue placeholder={
                                    loadingClients
                                        ? "جاري التحميل..."
                                        : "اختر عميل (اختياري)"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">بدون ربط</SelectItem>
                                {clients.map((client: any) => (
                                    <SelectItem key={client._id} value={client._id}>
                                        {client.fullName || client.name || `${client.firstName} ${client.lastName}`.trim()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    الوسوم
                </label>
                <div className="flex gap-2">
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addTag()
                            }
                        }}
                        placeholder="أضف وسم واضغط Enter"
                        className="rounded-xl flex-1"
                    />
                    <Button
                        type="button"
                        onClick={addTag}
                        variant="outline"
                        className="rounded-xl"
                    >
                        إضافة
                    </Button>
                </div>
                {form.watch('tags').length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {form.watch('tags').map((tag) => (
                            <div
                                key={tag}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                                <span>{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    ملاحظات
                </label>
                <Controller
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="أضف أي ملاحظات إضافية..."
                            className="rounded-xl min-h-[120px]"
                        />
                    )}
                />
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
                <Controller
                    name="isActive"
                    control={form.control}
                    render={({ field }) => (
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="isActive"
                            />
                            <Label htmlFor="isActive" className="text-sm font-medium text-blue-800">
                                جهة اتصال نشطة
                            </Label>
                        </div>
                    )}
                />
            </div>
        </div>
    )

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    if (editMode && isLoadingContact) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={[]} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </Main>
            </>
        )
    }

    const topNav = [
        { title: 'جهات الاتصال', href: ROUTES.dashboard.crm.contacts.list, isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                {/* Hero */}
                <ProductivityHero
                    badge="جهات الاتصال"
                    title={editMode ? "تعديل جهة الاتصال" : "إضافة جهة اتصال جديدة"}
                    type="crm"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.crm.contacts.list })}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </ProductivityHero>

                {/* Form Card */}
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 rounded-t-3xl p-6">
                            {renderStepIndicators()}

                            <div className="flex items-center justify-between mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate({ to: ROUTES.dashboard.crm.contacts.list })}
                                    className="rounded-xl"
                                >
                                    إلغاء
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep === 4 ? (
                                        <Button
                                            type="button"
                                            onClick={() => form.handleSubmit(onSubmit)()}
                                            disabled={isSubmitting}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 ms-2" />
                                            )}
                                            {editMode ? 'حفظ التغييرات' : 'حفظ جهة الاتصال'}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canGoToNextStep()}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                        >
                                            التالي
                                            <ArrowLeft className="w-4 h-4 me-2" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form className="p-8">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={previousStep}
                                    disabled={currentStep === 1}
                                    className="rounded-xl"
                                >
                                    <ArrowRight className="w-4 h-4 ms-2" />
                                    السابق
                                </Button>

                                {currentStep < 4 && (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canGoToNextStep()}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                    >
                                        التالي
                                        <ArrowLeft className="w-4 h-4 me-2" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </Main>

            {/* Unsaved Changes Dialog */}
            <Dialog open={blocker.state === 'blocked'} onOpenChange={() => {}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغييرات غير محفوظة</DialogTitle>
                        <DialogDescription>
                            لديك تغييرات غير محفوظة. هل تريد حقاً المغادرة؟
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => blocker.reset?.()}>
                            البقاء في الصفحة
                        </Button>
                        <Button variant="destructive" onClick={() => blocker.proceed?.()}>
                            المغادرة بدون حفظ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ContactFormView
