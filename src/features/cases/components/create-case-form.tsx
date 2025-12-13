import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Loader2, User, Building, Phone, MapPin, FileText, Calendar, ChevronDown,
    Scale, Flag, Briefcase, Hash, Sparkles
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
import { useCreateCase } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'
import type { CaseCategory, CasePriority, CreateCaseData, LaborCaseDetails } from '@/services/casesService'

// Form validation schema - All fields optional for Playwright testing
const createCaseSchema = z.object({
    title: z.string().optional(),
    category: z.enum(['labor', 'commercial', 'civil', 'criminal', 'family', 'administrative', 'other']).optional(),
    description: z.string().optional(),
    clientName: z.string().optional(),
    clientPhone: z.string().optional(),
    caseNumber: z.string().optional(),
    court: z.string().optional(),
    startDate: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    // Labor case plaintiff details
    plaintiffName: z.string().optional(),
    plaintiffNationalId: saudiNationalIdSchemaOptional,
    plaintiffPhone: z.string().optional(),
    plaintiffAddress: z.string().optional(),
    plaintiffCity: z.string().optional(),
    // Labor case company details
    companyName: z.string().optional(),
    companyRegistrationNumber: saudiCrNumberSchemaOptional,
    companyAddress: z.string().optional(),
    companyCity: z.string().optional(),
})

type CreateCaseFormData = z.infer<typeof createCaseSchema>

interface CreateCaseFormProps {
    onSuccess?: () => void
}

// Category options with colors
const CATEGORY_OPTIONS = [
    { value: 'labor', label: 'عمالية', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'commercial', label: 'تجارية', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'civil', label: 'مدنية', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'criminal', label: 'جنائية', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'family', label: 'أحوال شخصية', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    { value: 'administrative', label: 'إدارية', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'other', label: 'أخرى', color: 'bg-slate-100 text-slate-700 border-slate-200' },
]

// Priority options with colors
const PRIORITY_OPTIONS = [
    { value: 'low', label: 'منخفضة', dotColor: 'bg-slate-400' },
    { value: 'medium', label: 'متوسطة', dotColor: 'bg-blue-500' },
    { value: 'high', label: 'عالية', dotColor: 'bg-orange-500' },
    { value: 'critical', label: 'عاجلة', dotColor: 'bg-red-500' },
]

export function CreateCaseForm({ onSuccess }: CreateCaseFormProps) {
    const { t } = useTranslation()
    const [laborDetailsOpen, setLaborDetailsOpen] = useState(false)
    const createCaseMutation = useCreateCase()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateCaseFormData>({
        resolver: zodResolver(createCaseSchema) as any,
        defaultValues: {
            category: 'labor',
            priority: 'medium',
        },
    })

    const selectedCategory = watch('category')
    const selectedPriority = watch('priority')

    // Update labor case state when category changes
    const handleCategoryChange = (value: CaseCategory) => {
        setValue('category', value)
    }

    const onSubmit = async (data: CreateCaseFormData) => {
        // Build the request payload
        const payload: CreateCaseData = {
            title: data.title,
            category: data.category as CaseCategory,
            description: data.description,
            clientName: data.clientName,
            clientPhone: data.clientPhone,
            caseNumber: data.caseNumber,
            court: data.court,
            startDate: data.startDate,
            priority: data.priority as CasePriority,
        }

        // Add labor case details if it's a labor case
        if (data.category === 'labor') {
            const laborCaseDetails: LaborCaseDetails = {}

            // Add plaintiff details if any field is filled
            if (data.plaintiffName || data.plaintiffNationalId || data.plaintiffPhone || data.plaintiffAddress || data.plaintiffCity) {
                laborCaseDetails.plaintiff = {
                    name: data.plaintiffName,
                    nationalId: data.plaintiffNationalId,
                    phone: data.plaintiffPhone,
                    address: data.plaintiffAddress,
                    city: data.plaintiffCity,
                }
            }

            // Add company details if any field is filled
            if (data.companyName || data.companyRegistrationNumber || data.companyAddress || data.companyCity) {
                laborCaseDetails.company = {
                    name: data.companyName,
                    registrationNumber: data.companyRegistrationNumber,
                    address: data.companyAddress,
                    city: data.companyCity,
                }
            }

            if (Object.keys(laborCaseDetails).length > 0) {
                payload.laborCaseDetails = laborCaseDetails
            }
        }

        try {
            await createCaseMutation.mutateAsync(payload)
            onSuccess?.()
        } catch (error) {
            // Error is handled by the mutation
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            {/* Form Header with Section Label */}
            <div className="pb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Scale className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-500">معلومات القضية</span>
                </div>

                {/* Title Input - Hero of the form */}
                <div className="space-y-2">
                    <Input
                        placeholder="عنوان القضية"
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
                            مثال: دعوى مطالبة بأجور متأخرة، قضية تجارية ضد شركة...
                        </p>
                    )}
                </div>
            </div>

            {/* Category, Priority & Description Section */}
            <div className="py-6 border-b border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            نوع القضية
                        </Label>
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
                                <SelectValue placeholder="اختر نوع القضية" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map(option => (
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
                            <Flag className="w-3.5 h-3.5 text-slate-400" />
                            الأولوية
                        </Label>
                        <Select
                            value={selectedPriority}
                            onValueChange={(v) => setValue('priority', v as CasePriority)}
                        >
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 bg-white">
                                <SelectValue placeholder="اختر الأولوية" />
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
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        وصف القضية
                    </Label>
                    <Textarea
                        placeholder="أدخل وصفاً مختصراً للقضية..."
                        className="min-h-[100px] rounded-xl border-slate-200 resize-none focus:border-blue-500 text-base bg-white"
                        {...register('description')}
                    />
                </div>
            </div>

            {/* Client Info Section */}
            <div className="py-5 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">بيانات العميل</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            اسم العميل
                        </Label>
                        <Input
                            placeholder="الاسم الكامل"
                            className={cn(
                                "rounded-xl border-slate-200 h-12 bg-white",
                                errors.clientName && "border-red-300 focus:border-red-500"
                            )}
                            {...register('clientName')}
                        />
                        {errors.clientName && <p className="text-xs text-red-500">{errors.clientName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            رقم الهاتف
                        </Label>
                        <Input
                            placeholder="+966501234567"
                            className="rounded-xl border-slate-200 h-12 bg-white"
                            {...register('clientPhone')}
                        />
                    </div>
                </div>
            </div>

            {/* Court Info Section */}
            <div className="py-5 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">بيانات المحكمة</span>
                </div>

                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                <Hash className="w-3.5 h-3.5 text-slate-400" />
                                رقم القضية
                            </Label>
                            <Input
                                placeholder="CASE-2024-001"
                                className="rounded-xl border-slate-200 h-12 bg-white"
                                {...register('caseNumber')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                المحكمة
                            </Label>
                            <Input
                                placeholder="المحكمة العمالية - الرياض"
                                className="rounded-xl border-slate-200 h-12 bg-white"
                                {...register('court')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            تاريخ البدء
                        </Label>
                        <Input
                            type="date"
                            className="rounded-xl border-slate-200 h-12 bg-white w-full sm:w-auto"
                            {...register('startDate')}
                        />
                    </div>
                </div>
            </div>

            {/* Labor Case Details (Expandable) */}
            {selectedCategory === 'labor' && (
                <Collapsible
                    open={laborDetailsOpen}
                    onOpenChange={setLaborDetailsOpen}
                    className="py-5"
                >
                    <CollapsibleTrigger asChild>
                        <button type="button" className="flex items-center justify-between w-full text-sm group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-start">
                                    <span className="font-medium text-slate-700">تفاصيل القضية العمالية</span>
                                    <p className="text-xs text-slate-500 mt-0.5">بيانات المدعي والشركة</p>
                                </div>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", laborDetailsOpen && "rotate-180")} />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                        <div className="space-y-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                            {/* Plaintiff Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <h4 className="font-medium text-blue-700">بيانات المدعي (العامل)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">الاسم</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('plaintiffName')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">رقم الهوية</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('plaintiffNationalId')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">الهاتف</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('plaintiffPhone')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">المدينة</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('plaintiffCity')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">العنوان</Label>
                                    <Input
                                        className="rounded-xl border-slate-200 h-12 bg-white"
                                        {...register('plaintiffAddress')}
                                    />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-blue-200/50" />

                            {/* Company Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-amber-600" />
                                    <h4 className="font-medium text-amber-700">بيانات الشركة (المدعى عليه)</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">اسم الشركة</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('companyName')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">السجل التجاري</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('companyRegistrationNumber')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-600">المدينة</Label>
                                        <Input
                                            className="rounded-xl border-slate-200 h-12 bg-white"
                                            {...register('companyCity')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">العنوان</Label>
                                    <Input
                                        className="rounded-xl border-slate-200 h-12 bg-white"
                                        {...register('companyAddress')}
                                    />
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Submit Footer */}
            <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onSuccess}
                        className="text-slate-500 hover:text-slate-700 rounded-xl h-11 px-5"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || createCaseMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-blue-500/20 font-medium"
                    >
                        {(isSubmitting || createCaseMutation.isPending) ? (
                            <>
                                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                                جاري الإنشاء
                            </>
                        ) : (
                            <>
                                <Scale className="ms-2 h-4 w-4" />
                                إنشاء القضية
                            </>
                        )}
                    </Button>
                </div>
                {/* Helpful hint */}
                <p className="text-xs text-slate-400 mt-3 flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3" />
                    جميع الحقول اختيارية
                </p>
            </div>
        </form>
    )
}
