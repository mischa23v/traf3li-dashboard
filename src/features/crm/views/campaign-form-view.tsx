import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, ArrowLeft, Save, Send, Target, Users, DollarSign,
    Calendar, FileText, Mail, Phone, Share2, CheckCircle, Loader2,
    AlertCircle, Flag, MessageSquare
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import TipTapEditor from '@/components/tiptap-editor'
import { useCreateCampaign, useUpdateCampaign, useCampaign } from '@/hooks/useCampaigns'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

const campaignFormSchema = z.object({
    // Step 1: Campaign Info
    name: z.string().min(1, 'Campaign name is required'),
    nameAr: z.string().optional(),
    type: z.enum(['email', 'social', 'phone', 'event'], {
        required_error: 'Campaign type is required'
    }),
    objective: z.string().min(1, 'Objective is required'),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),

    // Step 2: Targeting
    targetAudience: z.enum(['leads', 'clients', 'all'], {
        required_error: 'Target audience is required'
    }),
    targetSegments: z.array(z.string()).optional(),
    excludeSegments: z.array(z.string()).optional(),

    // Step 3: Budget & Schedule
    budget: z.number().min(0).optional(),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed']).default('draft'),

    // Step 4: Content
    subject: z.string().optional(),
    subjectAr: z.string().optional(),
    content: z.string().optional(),
    contentAr: z.string().optional(),
    callToAction: z.string().optional(),
    landingPageUrl: z.string().url().optional().or(z.literal('')),
})

type CampaignFormData = z.infer<typeof campaignFormSchema>

// ═══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, name: 'Campaign Info', nameAr: 'معلومات الحملة', icon: FileText },
    { id: 2, name: 'Targeting', nameAr: 'الاستهداف', icon: Target },
    { id: 3, name: 'Budget & Schedule', nameAr: 'الميزانية والجدول', icon: Calendar },
    { id: 4, name: 'Content', nameAr: 'المحتوى', icon: MessageSquare },
]

interface CampaignFormViewProps {
    editMode?: boolean
}

export function CampaignFormView({ editMode = false }: CampaignFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/crm/campaigns/$campaignId/edit' }) : null
    const campaignId = params?.campaignId

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [currentStep, setCurrentStep] = useState(1)

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createCampaignMutation = useCreateCampaign()
    const updateCampaignMutation = useUpdateCampaign()
    const { data: campaignData, isLoading: isLoadingCampaign } = useCampaign(campaignId || '', editMode && !!campaignId)

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<CampaignFormData>({
        resolver: zodResolver(campaignFormSchema),
        defaultValues: {
            name: '',
            nameAr: '',
            type: 'email',
            objective: '',
            description: '',
            descriptionAr: '',
            targetAudience: 'leads',
            targetSegments: [],
            excludeSegments: [],
            budget: 0,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'draft',
            subject: '',
            subjectAr: '',
            content: '',
            contentAr: '',
            callToAction: '',
            landingPageUrl: '',
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // Load existing campaign data in edit mode
    useEffect(() => {
        if (editMode && campaignData) {
            const campaign = campaignData
            form.reset({
                name: campaign.name || '',
                nameAr: (campaign as any).nameAr || '',
                type: (campaign.type || 'email') as any,
                objective: (campaign as any).objective || '',
                description: (campaign as any).description || '',
                descriptionAr: (campaign as any).descriptionAr || '',
                targetAudience: ((campaign as any).targetAudience || 'leads') as any,
                targetSegments: (campaign as any).targetSegments || [],
                excludeSegments: (campaign as any).excludeSegments || [],
                budget: campaign.budget || 0,
                startDate: campaign.startDate ? new Date(campaign.startDate) : new Date(),
                endDate: campaign.endDate ? new Date(campaign.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: (campaign.status || 'draft') as any,
                subject: (campaign as any).subject || '',
                subjectAr: (campaign as any).subjectAr || '',
                content: (campaign as any).content || '',
                contentAr: (campaign as any).contentAr || '',
                callToAction: (campaign as any).callToAction || '',
                landingPageUrl: (campaign as any).landingPageUrl || '',
            })
        }
    }, [editMode, campaignData, form])

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: CampaignFormData, saveAsDraft = false) => {
        const campaignData = {
            name: data.name,
            nameAr: data.nameAr,
            type: data.type,
            channel: data.type, // Using type as channel for now
            objective: data.objective,
            description: data.description,
            descriptionAr: data.descriptionAr,
            targetAudience: data.targetAudience,
            targetSegments: data.targetSegments,
            excludeSegments: data.excludeSegments,
            budget: data.budget,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            status: saveAsDraft ? 'draft' : data.status,
            subject: data.subject,
            subjectAr: data.subjectAr,
            content: data.content,
            contentAr: data.contentAr,
            callToAction: data.callToAction,
            landingPageUrl: data.landingPageUrl,
        }

        if (editMode && campaignId) {
            updateCampaignMutation.mutate(
                { campaignId, data: campaignData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.crm.campaigns.list })
                    }
                }
            )
        } else {
            createCampaignMutation.mutate(campaignData as any, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.campaigns.list })
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
                return form.watch('name') !== '' && form.watch('type') !== undefined && form.watch('objective') !== ''
            case 2:
                return form.watch('targetAudience') !== undefined
            case 3:
                return form.watch('startDate') !== undefined && form.watch('endDate') !== undefined
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
                <FileText className="w-6 h-6 text-blue-500" />
                معلومات الحملة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        اسم الحملة <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input
                                    {...field}
                                    placeholder="مثال: حملة العودة للمدارس"
                                    className="rounded-xl"
                                />
                                {fieldState.error && (
                                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الاسم بالإنجليزية
                    </label>
                    <Controller
                        name="nameAr"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Back to School Campaign"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    نوع الحملة <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="اختر نوع الحملة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="email">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            بريد إلكتروني
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="social">
                                        <div className="flex items-center gap-2">
                                            <Share2 className="w-4 h-4 text-purple-500" />
                                            وسائل التواصل الاجتماعي
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="phone">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-500" />
                                            هاتف / رسائل نصية
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="event">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            فعالية / حدث
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-blue-500" />
                    هدف الحملة <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="objective"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Input
                                {...field}
                                placeholder="مثال: زيادة الوعي بالعلامة التجارية، توليد عملاء محتملين..."
                                className="rounded-xl"
                            />
                            {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الوصف (عربي)
                </label>
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="وصف مفصل للحملة..."
                            className="rounded-xl min-h-[100px]"
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الوصف (إنجليزي)
                </label>
                <Controller
                    name="descriptionAr"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Detailed campaign description..."
                            className="rounded-xl min-h-[100px]"
                            dir="ltr"
                        />
                    )}
                />
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                الجمهور المستهدف
            </h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        نوع الجمهور <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="targetAudience"
                        control={form.control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                                <div className="flex items-center space-x-2 space-x-reverse p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <RadioGroupItem value="leads" id="leads" />
                                    <Label htmlFor="leads" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <div>
                                            <div className="font-medium">عملاء محتملون (Leads)</div>
                                            <div className="text-xs text-slate-600">استهداف العملاء المحتملين الجدد</div>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <RadioGroupItem value="clients" id="clients" />
                                    <Label htmlFor="clients" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <div>
                                            <div className="font-medium">عملاء حاليون</div>
                                            <div className="text-xs text-slate-600">استهداف قاعدة العملاء الحالية</div>
                                        </div>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <RadioGroupItem value="all" id="all" />
                                    <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer flex-1">
                                        <Target className="w-4 h-4 text-purple-500" />
                                        <div>
                                            <div className="font-medium">الجميع</div>
                                            <div className="text-xs text-slate-600">كل من العملاء المحتملين والحاليين</div>
                                        </div>
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-amber-900">ملاحظة</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                يمكنك تحسين الاستهداف لاحقًا باستخدام الشرائح والفلاتر المتقدمة
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                الميزانية والجدول الزمني
            </h2>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    الميزانية (ريال سعودي)
                </label>
                <Controller
                    name="budget"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            placeholder="0.00"
                            className="rounded-xl"
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        تاريخ البداية <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="startDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-right font-normal rounded-xl",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="ms-2 h-4 w-4" />
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: ar })
                                            ) : (
                                                <span>اختر التاريخ</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && (
                                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        تاريخ النهاية <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="endDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-right font-normal rounded-xl",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="ms-2 h-4 w-4" />
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: ar })
                                            ) : (
                                                <span>اختر التاريخ</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date < (form.watch('startDate') || new Date())}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {fieldState.error && (
                                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    حالة الحملة
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
                                <SelectItem value="draft">مسودة</SelectItem>
                                <SelectItem value="scheduled">مجدولة</SelectItem>
                                <SelectItem value="active">نشطة</SelectItem>
                                <SelectItem value="paused">متوقفة مؤقتاً</SelectItem>
                                <SelectItem value="completed">مكتملة</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                محتوى الحملة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        العنوان / الموضوع (عربي)
                    </label>
                    <Controller
                        name="subject"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: عرض خاص لفترة محدودة"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        العنوان / الموضوع (إنجليزي)
                    </label>
                    <Controller
                        name="subjectAr"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Limited Time Offer"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    المحتوى (عربي)
                </label>
                <Controller
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="محتوى الحملة التسويقية..."
                            className="rounded-xl min-h-[150px]"
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    المحتوى (إنجليزي)
                </label>
                <Controller
                    name="contentAr"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Marketing campaign content..."
                            className="rounded-xl min-h-[150px]"
                            dir="ltr"
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    نص الدعوة لاتخاذ إجراء (Call to Action)
                </label>
                <Controller
                    name="callToAction"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="مثال: سجل الآن، احصل على العرض، تواصل معنا"
                            className="rounded-xl"
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    رابط الصفحة المقصودة
                </label>
                <Controller
                    name="landingPageUrl"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Input
                                {...field}
                                type="url"
                                placeholder="https://example.com/landing-page"
                                className="rounded-xl"
                                dir="ltr"
                            />
                            {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </div>
                    )}
                />
            </div>
        </div>
    )

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    if (editMode && isLoadingCampaign) {
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
        { title: 'الحملات', href: ROUTES.dashboard.crm.campaigns.list, isActive: true },
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
                    badge="الحملات"
                    title={editMode ? "تعديل الحملة" : "إنشاء حملة جديدة"}
                    type="crm"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.crm.campaigns.list })}
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
                                    onClick={() => navigate({ to: ROUTES.dashboard.crm.campaigns.list })}
                                    className="rounded-xl"
                                >
                                    إلغاء
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
                                        disabled={isSubmitting || !canGoToNextStep()}
                                        className="rounded-xl"
                                    >
                                        <Save className="w-4 h-4 ms-2" />
                                        حفظ كمسودة
                                    </Button>

                                    {currentStep === 4 ? (
                                        <Button
                                            type="button"
                                            onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                                            disabled={isSubmitting}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 ms-2 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4 ms-2" />
                                            )}
                                            {editMode ? 'حفظ التغييرات' : 'حفظ وإطلاق'}
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

export default CampaignFormView
