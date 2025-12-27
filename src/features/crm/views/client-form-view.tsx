import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, ArrowLeft, Save, Building, User, MapPin,
    Briefcase, Loader2, Phone, Mail, Globe, Hash,
    FileText, DollarSign, Tag, AlertCircle
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateClient, useUpdateClient, useClient } from '@/hooks/useClients'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

const clientFormSchema = z.object({
    // Step 1: Company Info
    companyName: z.string().min(1, 'Company name is required'),
    companyNameAr: z.string().optional(),
    registrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional(),

    // Step 2: Contact Person
    contactName: z.string().min(1, 'Contact name is required'),
    contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    contactPhone: z.string().optional(),
    contactTitle: z.string().optional(),

    // Step 3: Address
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('Saudi Arabia'),
    postalCode: z.string().optional(),
    nationalAddress: z.string().optional(),

    // Step 4: Business Details
    clientType: z.enum(['individual', 'company']).default('company'),
    status: z.enum(['active', 'inactive']).default('active'),
    assignedSalesPerson: z.string().optional(),
    creditLimit: z.number().min(0).default(0),
    paymentTerms: z.string().optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientFormSchema>

// ═══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, name: 'Company Info', nameAr: 'معلومات الشركة', icon: Building },
    { id: 2, name: 'Contact Person', nameAr: 'الشخص المسؤول', icon: User },
    { id: 3, name: 'Address', nameAr: 'العنوان', icon: MapPin },
    { id: 4, name: 'Business Details', nameAr: 'تفاصيل العمل', icon: Briefcase },
]

interface ClientFormViewProps {
    editMode?: boolean
}

export function ClientFormView({ editMode = false }: ClientFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/crm/clients/$clientId/edit' }) : null
    const clientId = params?.clientId

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [currentStep, setCurrentStep] = useState(1)
    const [tagInput, setTagInput] = useState('')

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createClientMutation = useCreateClient()
    const updateClientMutation = useUpdateClient()
    const { data: clientData, isLoading: isLoadingClient } = useClient(clientId || '', editMode && !!clientId)

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<ClientFormData>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            companyName: '',
            companyNameAr: '',
            registrationNumber: '',
            vatNumber: '',
            industry: '',
            website: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            contactTitle: '',
            street: '',
            city: '',
            state: '',
            country: 'Saudi Arabia',
            postalCode: '',
            nationalAddress: '',
            clientType: 'company',
            status: 'active',
            assignedSalesPerson: '',
            creditLimit: 0,
            paymentTerms: '',
            tags: [],
            notes: '',
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // Load existing client data in edit mode
    useEffect(() => {
        if (editMode && clientData?.client) {
            const client = clientData.client
            form.reset({
                companyName: client.companyName || '',
                companyNameAr: client.companyNameAr || '',
                registrationNumber: client.crNumber || '',
                vatNumber: client.vatNumber || '',
                industry: client.practiceAreas?.[0] || '',
                website: client.website || '',
                contactName: client.authorizedPerson || client.fullNameEnglish || '',
                contactEmail: client.email || '',
                contactPhone: client.phone || '',
                contactTitle: client.authorizedPersonTitle || '',
                street: typeof client.address === 'object' ? client.address.street : '',
                city: client.city || '',
                state: client.province || client.region || '',
                country: client.country || 'Saudi Arabia',
                postalCode: client.postalCode || '',
                nationalAddress: client.nationalAddress?.buildingNumber ?
                    `${client.nationalAddress.buildingNumber} ${client.nationalAddress.streetName || ''} ${client.nationalAddress.district || ''}`.trim() : '',
                clientType: client.clientType || 'company',
                status: client.status || 'active',
                assignedSalesPerson: '',
                creditLimit: 0,
                paymentTerms: client.paymentTerms || '',
                tags: client.tags || [],
                notes: client.notes || client.generalNotes || '',
            })
        }
    }, [editMode, clientData, form])

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: ClientFormData) => {
        const clientData = {
            clientType: data.clientType,
            companyName: data.companyName,
            companyNameAr: data.companyNameAr,
            crNumber: data.registrationNumber,
            vatNumber: data.vatNumber,
            website: data.website,
            practiceAreas: data.industry ? [data.industry] : [],
            authorizedPerson: data.contactName,
            email: data.contactEmail,
            phone: data.contactPhone,
            authorizedPersonTitle: data.contactTitle,
            address: {
                street: data.street,
                city: data.city,
            },
            city: data.city,
            province: data.state,
            region: data.state,
            country: data.country,
            postalCode: data.postalCode,
            status: data.status,
            paymentTerms: data.paymentTerms,
            tags: data.tags,
            notes: data.notes,
            generalNotes: data.notes,
        }

        if (editMode && clientId) {
            updateClientMutation.mutate(
                { clientId, data: clientData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.crm.clients.list })
                    }
                }
            )
        } else {
            createClientMutation.mutate(clientData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.clients.list })
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
                return form.watch('companyName') !== ''
            case 2:
                return form.watch('contactName') !== ''
            case 3:
                return true
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
        if (tagInput.trim() && !form.watch('tags').includes(tagInput.trim())) {
            form.setValue('tags', [...form.watch('tags'), tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        form.setValue('tags', form.watch('tags').filter(t => t !== tag))
    }

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
                <Building className="w-6 h-6 text-blue-500" />
                معلومات الشركة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        اسم الشركة <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="companyName"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: شركة الخدمات القانونية"
                                className="rounded-xl"
                            />
                        )}
                    />
                    {form.formState.errors.companyName && (
                        <p className="text-sm text-red-500">{form.formState.errors.companyName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        اسم الشركة بالعربية
                    </label>
                    <Controller
                        name="companyNameAr"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="اسم الشركة بالعربية"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-500" />
                        رقم السجل التجاري (CR)
                    </label>
                    <Controller
                        name="registrationNumber"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="1234567890"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-500" />
                        الرقم الضريبي (VAT)
                    </label>
                    <Controller
                        name="vatNumber"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="300000000000003"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        القطاع / الصناعة
                    </label>
                    <Controller
                        name="industry"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: الخدمات القانونية"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        الموقع الإلكتروني
                    </label>
                    <Controller
                        name="website"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="https://example.com"
                                className="rounded-xl"
                                dir="ltr"
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
                <User className="w-6 h-6 text-blue-500" />
                الشخص المسؤول
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الاسم <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="contactName"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: أحمد محمد"
                                className="rounded-xl"
                            />
                        )}
                    />
                    {form.formState.errors.contactName && (
                        <p className="text-sm text-red-500">{form.formState.errors.contactName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        المسمى الوظيفي
                    </label>
                    <Controller
                        name="contactTitle"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: المدير التنفيذي"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        البريد الإلكتروني
                    </label>
                    <Controller
                        name="contactEmail"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type="email"
                                placeholder="example@company.com"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                    {form.formState.errors.contactEmail && (
                        <p className="text-sm text-red-500">{form.formState.errors.contactEmail.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        رقم الهاتف
                    </label>
                    <Controller
                        name="contactPhone"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="+966 50 123 4567"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-500" />
                العنوان
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الشارع
                </label>
                <Controller
                    name="street"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="مثال: شارع الملك فهد"
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
                                placeholder="مثال: الرياض"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        المنطقة / الولاية
                    </label>
                    <Controller
                        name="state"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: منطقة الرياض"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
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
                                    <SelectItem value="Saudi Arabia">المملكة العربية السعودية</SelectItem>
                                    <SelectItem value="UAE">الإمارات العربية المتحدة</SelectItem>
                                    <SelectItem value="Kuwait">الكويت</SelectItem>
                                    <SelectItem value="Bahrain">البحرين</SelectItem>
                                    <SelectItem value="Qatar">قطر</SelectItem>
                                    <SelectItem value="Oman">عُمان</SelectItem>
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
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    العنوان الوطني (السعودية)
                </label>
                <Controller
                    name="nationalAddress"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="رقم المبنى، اسم الشارع، الحي..."
                            className="rounded-xl min-h-[80px]"
                        />
                    )}
                />
                <p className="text-xs text-slate-500">
                    العنوان الوطني المعتمد من البريد السعودي
                </p>
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-500" />
                تفاصيل العمل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        نوع العميل
                    </label>
                    <Controller
                        name="clientType"
                        control={form.control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="company" id="company" />
                                    <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer">
                                        <Building className="w-4 h-4 text-blue-500" />
                                        شركة
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <RadioGroupItem value="individual" id="individual" />
                                    <Label htmlFor="individual" className="flex items-center gap-2 cursor-pointer">
                                        <User className="w-4 h-4 text-emerald-500" />
                                        فرد
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الحالة
                    </label>
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">نشط</SelectItem>
                                    <SelectItem value="inactive">غير نشط</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        مسؤول المبيعات
                    </label>
                    <Controller
                        name="assignedSalesPerson"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="اختر مسؤول المبيعات"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        الحد الائتماني (ر.س)
                    </label>
                    <Controller
                        name="creditLimit"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                min="0"
                                step="100"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    شروط الدفع
                </label>
                <Controller
                    name="paymentTerms"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="مثال: الدفع خلال 30 يوم من تاريخ الفاتورة"
                            className="rounded-xl min-h-[80px]"
                        />
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
                        className="rounded-xl"
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
                    <div className="flex flex-wrap gap-2 mt-2">
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
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    ملاحظات
                </label>
                <Controller
                    name="notes"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="أي ملاحظات إضافية عن العميل..."
                            className="rounded-xl min-h-[100px]"
                        />
                    )}
                />
            </div>
        </div>
    )

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    if (editMode && isLoadingClient) {
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
        { title: 'العملاء', href: ROUTES.dashboard.crm.clients.list, isActive: true },
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
                    badge="العملاء"
                    title={editMode ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
                    type="crm"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.crm.clients.list })}
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
                                    onClick={() => navigate({ to: ROUTES.dashboard.crm.clients.list })}
                                    className="rounded-xl"
                                >
                                    إلغاء
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep === 4 && (
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
                                            {editMode ? 'حفظ التغييرات' : 'حفظ العميل'}
                                        </Button>
                                    )}
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

export default ClientFormView
