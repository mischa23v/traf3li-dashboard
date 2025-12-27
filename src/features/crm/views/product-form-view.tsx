import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useBlocker } from '@tanstack/react-router'
import {
    ArrowRight, ArrowLeft, Save, Package, DollarSign,
    FileText, Info, Percent, Plus, Trash2, Image,
    Loader2, Check, X, AlertCircle, Tag, Layers
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
import { useCreateProduct, useUpdateProduct, useProduct } from '@/hooks/useProducts'
import { TAX_CONFIG } from '@/config'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// TYPES & SCHEMAS
// ═══════════════════════════════════════════════════════════════

const productFormSchema = z.object({
    // Step 1: Basic Info
    name: z.string().min(1, 'Product name is required'),
    nameAr: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),

    // Step 2: Pricing
    basePrice: z.number().min(0, 'Base price must be positive'),
    discountedPrice: z.number().min(0).optional(),
    cost: z.number().min(0).optional(),
    taxRate: z.enum(['0', '0.05', '0.15']).default('0.15'),
    currency: z.string().default('SAR'),
    pricingModel: z.enum(['fixed', 'hourly', 'subscription']).default('fixed'),

    // Step 3: Details
    unit: z.string().default('service'),
    isActive: z.boolean().default(true),
    isTaxable: z.boolean().default(true),
    features: z.array(z.string()).default([]),
    tags: z.string().optional(),
    imageUrl: z.string().optional(),
})

type ProductFormData = z.infer<typeof productFormSchema>

// ═══════════════════════════════════════════════════════════════
// STEP COMPONENTS
// ═══════════════════════════════════════════════════════════════

const STEPS = [
    { id: 1, name: 'Basic Info', nameAr: 'المعلومات الأساسية', icon: Info },
    { id: 2, name: 'Pricing', nameAr: 'التسعير', icon: DollarSign },
    { id: 3, name: 'Details', nameAr: 'التفاصيل', icon: FileText },
]

interface ProductFormViewProps {
    editMode?: boolean
}

export function ProductFormView({ editMode = false }: ProductFormViewProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/crm/products/$productId/edit' }) : null
    const productId = params?.productId

    // ═══════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const [currentStep, setCurrentStep] = useState(1)
    const [features, setFeatures] = useState<string[]>([])
    const [newFeature, setNewFeature] = useState('')

    // ═══════════════════════════════════════════════════════════════
    // API HOOKS
    // ═══════════════════════════════════════════════════════════════

    const createProductMutation = useCreateProduct()
    const updateProductMutation = useUpdateProduct()
    const { data: productData, isLoading: isLoadingProduct } = useProduct(productId || '', editMode && !!productId)

    // ═══════════════════════════════════════════════════════════════
    // FORM INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            nameAr: '',
            sku: '',
            category: '',
            description: '',
            descriptionAr: '',
            basePrice: 0,
            discountedPrice: 0,
            cost: 0,
            taxRate: '0.15',
            currency: 'SAR',
            pricingModel: 'fixed',
            unit: 'service',
            isActive: true,
            isTaxable: true,
            features: [],
            tags: '',
            imageUrl: '',
        },
    })

    const { formState: { isDirty, isSubmitting } } = form

    // Unsaved changes warning
    const blocker = useBlocker({
        condition: isDirty && !isSubmitting,
    })

    // Load existing product data in edit mode
    useEffect(() => {
        if (editMode && productData) {
            const product = productData
            form.reset({
                name: product.name || '',
                nameAr: product.nameAr || '',
                sku: product.sku || product.code || '',
                category: product.category || '',
                description: product.description || '',
                descriptionAr: product.descriptionAr || '',
                basePrice: product.pricing?.basePrice || product.basePrice || 0,
                discountedPrice: product.pricing?.discountedPrice || product.discountedPrice || 0,
                cost: product.pricing?.cost || product.cost || 0,
                taxRate: product.taxRate?.toString() || '0.15',
                currency: product.pricing?.currency || product.currency || 'SAR',
                pricingModel: product.pricing?.model || product.pricingModel || 'fixed',
                unit: product.unit || 'service',
                isActive: product.isActive !== undefined ? product.isActive : true,
                isTaxable: product.isTaxable !== undefined ? product.isTaxable : true,
                features: product.features || [],
                tags: product.tags?.join(', ') || '',
                imageUrl: product.imageUrl || product.image || '',
            })

            if (product.features && product.features.length > 0) {
                setFeatures(product.features)
            }
        }
    }, [editMode, productData, form])

    // ═══════════════════════════════════════════════════════════════
    // FEATURE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    const addFeature = () => {
        if (newFeature.trim()) {
            const updated = [...features, newFeature.trim()]
            setFeatures(updated)
            form.setValue('features', updated)
            setNewFeature('')
        }
    }

    const removeFeature = (index: number) => {
        const updated = features.filter((_, i) => i !== index)
        setFeatures(updated)
        form.setValue('features', updated)
    }

    // ═══════════════════════════════════════════════════════════════
    // FORM SUBMISSION
    // ═══════════════════════════════════════════════════════════════

    const onSubmit = async (data: ProductFormData) => {
        const productData = {
            name: data.name,
            nameAr: data.nameAr,
            sku: data.sku,
            code: data.sku,
            category: data.category,
            description: data.description,
            descriptionAr: data.descriptionAr,
            pricing: {
                basePrice: data.basePrice,
                discountedPrice: data.discountedPrice,
                cost: data.cost,
                currency: data.currency,
                model: data.pricingModel,
            },
            basePrice: data.basePrice,
            discountedPrice: data.discountedPrice,
            cost: data.cost,
            currency: data.currency,
            pricingModel: data.pricingModel,
            taxRate: parseFloat(data.taxRate),
            unit: data.unit,
            isActive: data.isActive,
            isTaxable: data.isTaxable,
            features: features,
            tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            imageUrl: data.imageUrl,
            image: data.imageUrl,
        }

        if (editMode && productId) {
            updateProductMutation.mutate(
                { productId, data: productData },
                {
                    onSuccess: () => {
                        navigate({ to: ROUTES.dashboard.crm.products.list })
                    }
                }
            )
        } else {
            createProductMutation.mutate(productData as any, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.products.list })
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
                return form.watch('name') !== '' && form.watch('sku') !== '' && form.watch('category') !== ''
            case 2:
                return form.watch('basePrice') >= 0
            case 3:
                return true
            default:
                return false
        }
    }

    const nextStep = () => {
        if (canGoToNextStep() && currentStep < 3) {
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
                <Info className="w-6 h-6 text-blue-500" />
                المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        اسم المنتج <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: خدمة استشارية"
                                className="rounded-xl"
                            />
                        )}
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الاسم بالعربية
                    </label>
                    <Controller
                        name="nameAr"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="الاسم بالعربية"
                                className="rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        رمز المنتج (SKU) <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="sku"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="مثال: SERV-001"
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                    {form.formState.errors.sku && (
                        <p className="text-xs text-red-500">{form.formState.errors.sku.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الفئة <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="category"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl border-slate-200">
                                    <SelectValue placeholder="اختر الفئة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="legal-services">خدمات قانونية</SelectItem>
                                    <SelectItem value="consulting">استشارات</SelectItem>
                                    <SelectItem value="representation">تمثيل قانوني</SelectItem>
                                    <SelectItem value="documentation">توثيق</SelectItem>
                                    <SelectItem value="training">تدريب</SelectItem>
                                    <SelectItem value="other">أخرى</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {form.formState.errors.category && (
                        <p className="text-xs text-red-500">{form.formState.errors.category.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الوصف
                </label>
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="وصف المنتج أو الخدمة..."
                            className="rounded-xl min-h-[100px]"
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الوصف بالعربية
                </label>
                <Controller
                    name="descriptionAr"
                    control={form.control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="الوصف بالعربية..."
                            className="rounded-xl min-h-[100px]"
                        />
                    )}
                />
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-500" />
                التسعير
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        السعر الأساسي <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="basePrice"
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
                    {form.formState.errors.basePrice && (
                        <p className="text-xs text-red-500">{form.formState.errors.basePrice.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        السعر بعد الخصم
                    </label>
                    <Controller
                        name="discountedPrice"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        التكلفة
                    </label>
                    <Controller
                        name="cost"
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-500" />
                        نسبة الضريبة
                    </label>
                    <Controller
                        name="taxRate"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="0.05">5%</SelectItem>
                                    <SelectItem value="0.15">15%</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        العملة
                    </label>
                    <Controller
                        name="currency"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        نموذج التسعير
                    </label>
                    <Controller
                        name="pricingModel"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">سعر ثابت</SelectItem>
                                    <SelectItem value="hourly">بالساعة</SelectItem>
                                    <SelectItem value="subscription">اشتراك</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-blue-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">السعر الأساسي</span>
                    <span className="font-medium">{form.watch('basePrice')?.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                </div>
                {form.watch('discountedPrice') > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>السعر بعد الخصم</span>
                        <span>{form.watch('discountedPrice')?.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                )}
                {form.watch('cost') > 0 && (
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>التكلفة</span>
                        <span>{form.watch('cost')?.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                    </div>
                )}
                <hr className="border-blue-200" />
                <div className="flex justify-between text-sm">
                    <span className="text-slate-600">الضريبة ({(parseFloat(form.watch('taxRate')) * 100).toFixed(0)}%)</span>
                    <span className="font-medium">
                        {((form.watch('discountedPrice') || form.watch('basePrice') || 0) * parseFloat(form.watch('taxRate'))).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                    <span className="text-blue-800">السعر النهائي</span>
                    <span className="text-blue-600">
                        {((form.watch('discountedPrice') || form.watch('basePrice') || 0) * (1 + parseFloat(form.watch('taxRate')))).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </span>
                </div>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" />
                التفاصيل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        الوحدة
                    </label>
                    <Controller
                        name="unit"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">خدمة</SelectItem>
                                    <SelectItem value="hour">ساعة</SelectItem>
                                    <SelectItem value="piece">قطعة</SelectItem>
                                    <SelectItem value="package">باقة</SelectItem>
                                    <SelectItem value="session">جلسة</SelectItem>
                                    <SelectItem value="consultation">استشارة</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        رابط الصورة
                    </label>
                    <Controller
                        name="imageUrl"
                        control={form.control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="https://..."
                                className="rounded-xl"
                                dir="ltr"
                            />
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                    الوسوم (Tags)
                </label>
                <Controller
                    name="tags"
                    control={form.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            placeholder="خدمات قانونية, استشارات, عقود (افصل بفاصلة)"
                            className="rounded-xl"
                        />
                    )}
                />
                <p className="text-xs text-slate-500">افصل الوسوم بفواصل</p>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    المميزات
                </label>

                <div className="flex gap-2">
                    <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addFeature()
                            }
                        }}
                        placeholder="أضف ميزة جديدة..."
                        className="rounded-xl flex-1"
                    />
                    <Button
                        type="button"
                        onClick={addFeature}
                        variant="outline"
                        className="rounded-xl"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {features.length > 0 && (
                    <div className="space-y-2">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                    <Controller
                        name="isActive"
                        control={form.control}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="isActive"
                            />
                        )}
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        المنتج نشط ومتاح للبيع
                    </Label>
                </div>

                <div className="flex items-center gap-3">
                    <Controller
                        name="isTaxable"
                        control={form.control}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="isTaxable"
                            />
                        )}
                    />
                    <Label htmlFor="isTaxable" className="text-sm font-medium text-blue-800 flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        خاضع للضريبة
                    </Label>
                </div>
            </div>
        </div>
    )

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═══════════════════════════════════════════════════════════════

    if (editMode && isLoadingProduct) {
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
        { title: 'المنتجات', href: ROUTES.dashboard.crm.products.list, isActive: true },
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
                    badge="المنتجات"
                    title={editMode ? "تعديل المنتج" : "إنشاء منتج جديد"}
                    type="crm"
                    hideButtons={true}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => navigate({ to: ROUTES.dashboard.crm.products.list })}
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
                                    onClick={() => navigate({ to: ROUTES.dashboard.crm.products.list })}
                                    className="rounded-xl"
                                >
                                    إلغاء
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep === 3 ? (
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
                                            {editMode ? 'حفظ التغييرات' : 'حفظ المنتج'}
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

                                {currentStep < 3 && (
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

export default ProductFormView
