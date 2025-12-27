import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, FileText, Package, DollarSign, Settings,
    Plus, X, ChevronDown, ChevronUp, Loader2, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

interface ProductFormViewProps {
    editMode?: boolean
    productId?: string
    initialData?: any
}

export function ProductFormView({ editMode = false, productId, initialData }: ProductFormViewProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createProductMutation = useCreateProduct()
    const updateProductMutation = useUpdateProduct()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        nameAr: '',
        sku: '',
        category: '',
        description: '',
        descriptionAr: '',
        basePrice: 0,
        cost: 0,
        currency: 'SAR',
        taxRate: 15,
        unit: 'service',
        isActive: true,
        isTaxable: true,
        tags: [] as string[],
    })

    // Section toggles
    const [showSettings, setShowSettings] = useState(false)
    const [showAdditional, setShowAdditional] = useState(false)

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Load initial data in edit mode
    useEffect(() => {
        if (editMode && initialData) {
            setFormData({
                name: initialData.name || '',
                nameAr: initialData.nameAr || '',
                sku: initialData.sku || '',
                category: initialData.category || '',
                description: initialData.description || '',
                descriptionAr: initialData.descriptionAr || '',
                basePrice: initialData.basePrice || 0,
                cost: initialData.cost || 0,
                currency: initialData.currency || 'SAR',
                taxRate: initialData.taxRate || 15,
                unit: initialData.unit || 'service',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                isTaxable: initialData.isTaxable !== undefined ? initialData.isTaxable : true,
                tags: initialData.tags || [],
            })
        }
    }, [editMode, initialData])

    // Validate a single field
    const validateField = (field: string, value: any): string => {
        if (field === 'name' && !value?.trim()) {
            return 'اسم المنتج مطلوب'
        }
        if (field === 'sku' && !value?.trim()) {
            return 'رمز المنتج مطلوب'
        }
        if (field === 'basePrice' && (!value || value <= 0)) {
            return 'السعر يجب أن يكون أكبر من صفر'
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

        const skuError = validateField('sku', formData.sku)
        if (skuError) newErrors.sku = skuError

        const priceError = validateField('basePrice', formData.basePrice)
        if (priceError) newErrors.basePrice = priceError

        setErrors(newErrors)
        setTouched({
            name: true,
            sku: true,
            basePrice: true,
        })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const productData = {
            name: formData.name,
            nameAr: formData.nameAr,
            sku: formData.sku,
            category: formData.category,
            description: formData.description,
            descriptionAr: formData.descriptionAr,
            basePrice: formData.basePrice,
            cost: formData.cost,
            currency: formData.currency,
            taxRate: formData.taxRate,
            unit: formData.unit,
            isActive: formData.isActive,
            isTaxable: formData.isTaxable,
            tags: formData.tags,
        }

        if (editMode && productId) {
            updateProductMutation.mutate({ id: productId, ...productData }, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.products.list })
                }
            })
        } else {
            createProductMutation.mutate(productData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.products.list })
                }
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
        { title: 'إدارة علاقات العملاء', href: ROUTES.dashboard.crm.products.list, isActive: true },
    ]

    const isLoading = createProductMutation.isPending || updateProductMutation.isPending

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
                    badge="إدارة المنتجات"
                    title={editMode ? "تعديل منتج" : "إضافة منتج جديد"}
                    type="crm"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Package className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم المنتج (إنجليزي)
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: Legal Consultation"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.name && errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                onBlur={() => handleBlur('name')}
                                            />
                                            {touched.name && errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم المنتج (عربي)
                                            </label>
                                            <Input
                                                placeholder="مثال: استشارة قانونية"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.nameAr}
                                                onChange={(e) => handleChange('nameAr', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                رمز المنتج (SKU)
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="مثال: CONS-001"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.sku && errors.sku && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.sku}
                                                onChange={(e) => handleChange('sku', e.target.value)}
                                                onBlur={() => handleBlur('sku')}
                                            />
                                            {touched.sku && errors.sku && (
                                                <p className="text-sm text-red-500 mt-1">{errors.sku}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-500" />
                                                التصنيف
                                            </label>
                                            <Input
                                                placeholder="مثال: استشارات قانونية"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.category}
                                                onChange={(e) => handleChange('category', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        الوصف
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            وصف المنتج (إنجليزي)
                                        </label>
                                        <Textarea
                                            placeholder="أدخل وصف المنتج بالإنجليزية..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            وصف المنتج (عربي)
                                        </label>
                                        <Textarea
                                            placeholder="أدخل وصف المنتج بالعربية..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.descriptionAr}
                                            onChange={(e) => handleChange('descriptionAr', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        التسعير
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                السعر الأساسي
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.basePrice && errors.basePrice && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.basePrice || ''}
                                                onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                                                onBlur={() => handleBlur('basePrice')}
                                            />
                                            {touched.basePrice && errors.basePrice && (
                                                <p className="text-sm text-red-500 mt-1">{errors.basePrice}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                التكلفة
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.cost || ''}
                                                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                العملة
                                            </label>
                                            <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر العملة" />
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

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            نسبة الضريبة
                                        </label>
                                        <Select
                                            value={formData.taxRate.toString()}
                                            onValueChange={(value) => handleChange('taxRate', parseInt(value))}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر نسبة الضريبة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">0% - معفى من الضريبة</SelectItem>
                                                <SelectItem value="5">5%</SelectItem>
                                                <SelectItem value="15">15% - القيمة المضافة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Settings Section - Collapsible */}
                                <Collapsible open={showSettings} onOpenChange={setShowSettings}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <Settings className="w-5 h-5 text-emerald-500" />
                                                        الإعدادات
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                    {showSettings ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        الوحدة
                                                    </label>
                                                    <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                            <SelectValue placeholder="اختر الوحدة" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="service">خدمة</SelectItem>
                                                            <SelectItem value="hour">ساعة</SelectItem>
                                                            <SelectItem value="piece">قطعة</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="isActive"
                                                        checked={formData.isActive}
                                                        onCheckedChange={(checked) => handleChange('isActive', checked === true)}
                                                    />
                                                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                                                        المنتج نشط
                                                    </label>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="isTaxable"
                                                        checked={formData.isTaxable}
                                                        onCheckedChange={(checked) => handleChange('isTaxable', checked === true)}
                                                    />
                                                    <label htmlFor="isTaxable" className="text-sm font-medium text-slate-700">
                                                        خاضع للضريبة
                                                    </label>
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
                                                        <Tag className="w-5 h-5 text-emerald-500" />
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
                                    <Link to={ROUTES.dashboard.crm.products.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
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
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {editMode ? 'حفظ التعديلات' : 'حفظ المنتج'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - Placeholder for future widgets */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">إرشادات سريعة</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <p>• املأ جميع الحقول المطلوبة (*)</p>
                                <p>• تأكد من صحة رمز المنتج (SKU)</p>
                                <p>• حدد السعر والتكلفة بدقة</p>
                                <p>• اختر نسبة الضريبة المناسبة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

export default ProductFormView
