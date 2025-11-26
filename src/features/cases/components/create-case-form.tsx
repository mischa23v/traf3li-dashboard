import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, User, Building, Phone, MapPin, FileText, Calendar } from 'lucide-react'
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCreateCase } from '@/hooks/useCasesAndClients'
import type { CaseCategory, CasePriority, CreateCaseData, LaborCaseDetails } from '@/services/casesService'

// Form validation schema
const createCaseSchema = z.object({
  title: z.string().min(3, 'عنوان القضية مطلوب (3 أحرف على الأقل)'),
  category: z.enum(['labor', 'commercial', 'civil', 'criminal', 'family', 'administrative', 'other']),
  description: z.string().optional(),
  clientName: z.string().min(2, 'اسم العميل مطلوب'),
  clientPhone: z.string().optional(),
  caseNumber: z.string().optional(),
  court: z.string().optional(),
  startDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  // Labor case plaintiff details
  plaintiffName: z.string().optional(),
  plaintiffNationalId: z.string().optional(),
  plaintiffPhone: z.string().optional(),
  plaintiffAddress: z.string().optional(),
  plaintiffCity: z.string().optional(),
  // Labor case company details
  companyName: z.string().optional(),
  companyRegistrationNumber: z.string().optional(),
  companyAddress: z.string().optional(),
  companyCity: z.string().optional(),
})

type CreateCaseFormData = z.infer<typeof createCaseSchema>

interface CreateCaseFormProps {
  onSuccess?: () => void
}

export function CreateCaseForm({ onSuccess }: CreateCaseFormProps) {
  const { t } = useTranslation()
  const [isLaborCase, setIsLaborCase] = useState(false)
  const createCaseMutation = useCreateCase()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      category: 'labor',
      priority: 'medium',
    },
  })

  const selectedCategory = watch('category')

  // Update labor case state when category changes
  const handleCategoryChange = (value: CaseCategory) => {
    setValue('category', value)
    setIsLaborCase(value === 'labor')
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-navy border-b pb-2">{t('cases.form.basicInfo', 'المعلومات الأساسية')}</h3>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t('cases.form.title', 'عنوان القضية')} *</Label>
          <Input
            id="title"
            placeholder={t('cases.form.titlePlaceholder', 'مثال: دعوى مطالبة بأجور متأخرة')}
            {...register('title')}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('cases.form.category', 'نوع القضية')} *</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="labor">{t('cases.category.labor', 'عمالية')}</SelectItem>
                <SelectItem value="commercial">{t('cases.category.commercial', 'تجارية')}</SelectItem>
                <SelectItem value="civil">{t('cases.category.civil', 'مدنية')}</SelectItem>
                <SelectItem value="criminal">{t('cases.category.criminal', 'جنائية')}</SelectItem>
                <SelectItem value="family">{t('cases.category.family', 'أحوال شخصية')}</SelectItem>
                <SelectItem value="administrative">{t('cases.category.administrative', 'إدارية')}</SelectItem>
                <SelectItem value="other">{t('cases.category.other', 'أخرى')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('cases.form.priority', 'الأولوية')}</Label>
            <Select defaultValue="medium" onValueChange={(v) => setValue('priority', v as CasePriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('cases.priority.low', 'منخفضة')}</SelectItem>
                <SelectItem value="medium">{t('cases.priority.medium', 'متوسطة')}</SelectItem>
                <SelectItem value="high">{t('cases.priority.high', 'عالية')}</SelectItem>
                <SelectItem value="critical">{t('cases.priority.critical', 'عاجلة')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('cases.form.description', 'وصف القضية')}</Label>
          <Textarea
            id="description"
            placeholder={t('cases.form.descriptionPlaceholder', 'أدخل وصفاً مختصراً للقضية...')}
            rows={3}
            {...register('description')}
          />
        </div>
      </div>

      {/* Client Info Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-navy border-b pb-2">{t('cases.form.clientInfo', 'بيانات العميل')}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">
              <User className="inline h-4 w-4 ml-1" />
              {t('cases.form.clientName', 'اسم العميل')} *
            </Label>
            <Input
              id="clientName"
              placeholder={t('cases.form.clientNamePlaceholder', 'الاسم الكامل')}
              {...register('clientName')}
              className={errors.clientName ? 'border-red-500' : ''}
            />
            {errors.clientName && <p className="text-sm text-red-500">{errors.clientName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientPhone">
              <Phone className="inline h-4 w-4 ml-1" />
              {t('cases.form.clientPhone', 'رقم الهاتف')}
            </Label>
            <Input
              id="clientPhone"
              placeholder="+966501234567"
              {...register('clientPhone')}
            />
          </div>
        </div>
      </div>

      {/* Court Info Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-navy border-b pb-2">{t('cases.form.courtInfo', 'بيانات المحكمة')}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="caseNumber">
              <FileText className="inline h-4 w-4 ml-1" />
              {t('cases.form.caseNumber', 'رقم القضية')}
            </Label>
            <Input
              id="caseNumber"
              placeholder={t('cases.form.caseNumberPlaceholder', 'CASE-2024-001')}
              {...register('caseNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="court">
              <MapPin className="inline h-4 w-4 ml-1" />
              {t('cases.form.court', 'المحكمة')}
            </Label>
            <Input
              id="court"
              placeholder={t('cases.form.courtPlaceholder', 'المحكمة العمالية - الرياض')}
              {...register('court')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">
            <Calendar className="inline h-4 w-4 ml-1" />
            {t('cases.form.startDate', 'تاريخ البدء')}
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
          />
        </div>
      </div>

      {/* Labor Case Details (Expandable) */}
      {selectedCategory === 'labor' && (
        <Accordion type="single" collapsible className="bg-blue-50 rounded-lg">
          <AccordionItem value="labor-details" className="border-0">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="font-bold text-navy">{t('cases.form.laborDetails', 'تفاصيل القضية العمالية')}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {/* Plaintiff Details */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-blue-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('cases.form.plaintiffDetails', 'بيانات المدعي (العامل)')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffName">{t('cases.form.name', 'الاسم')}</Label>
                    <Input id="plaintiffName" {...register('plaintiffName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffNationalId">{t('cases.form.nationalId', 'رقم الهوية')}</Label>
                    <Input id="plaintiffNationalId" {...register('plaintiffNationalId')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffPhone">{t('cases.form.phone', 'الهاتف')}</Label>
                    <Input id="plaintiffPhone" {...register('plaintiffPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plaintiffCity">{t('cases.form.city', 'المدينة')}</Label>
                    <Input id="plaintiffCity" {...register('plaintiffCity')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plaintiffAddress">{t('cases.form.address', 'العنوان')}</Label>
                  <Input id="plaintiffAddress" {...register('plaintiffAddress')} />
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-amber-700 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {t('cases.form.companyDetails', 'بيانات الشركة (المدعى عليه)')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t('cases.form.companyName', 'اسم الشركة')}</Label>
                    <Input id="companyName" {...register('companyName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">{t('cases.form.registrationNumber', 'السجل التجاري')}</Label>
                    <Input id="companyRegistrationNumber" {...register('companyRegistrationNumber')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCity">{t('cases.form.city', 'المدينة')}</Label>
                    <Input id="companyCity" {...register('companyCity')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">{t('cases.form.address', 'العنوان')}</Label>
                  <Input id="companyAddress" {...register('companyAddress')} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onSuccess}>
          {t('common.cancel', 'إلغاء')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createCaseMutation.isPending}
          className="bg-brand-blue hover:bg-blue-600"
        >
          {(isSubmitting || createCaseMutation.isPending) && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
          {t('cases.form.createCase', 'إنشاء القضية')}
        </Button>
      </div>
    </form>
  )
}
