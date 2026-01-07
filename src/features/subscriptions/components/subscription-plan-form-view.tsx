/**
 * Subscription Plan Form View Component
 *
 * API Endpoints Status:
 * ✅ POST /subscription-plans - Create new plan
 * ✅ GET /subscription-plans/:id - Get plan for editing
 * ✅ PATCH /subscription-plans/:id - Update plan
 *
 * All error messages are bilingual (English | Arabic)
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Main } from '@/components/layout/main'
import { ROUTES } from '@/constants/routes'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Search,
  Bell,
  ChevronLeft,
  Save,
  X,
  Package,
  DollarSign,
  Clock,
  Settings,
  FileText,
  Percent,
  Users,
  Briefcase,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GosiCard,
  GosiCardContent,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton,
} from '@/components/ui/gosi-ui'
import {
  useSubscriptionPlan,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from '@/hooks/useSubscriptions'
import {
  getPlanTypeLabel,
  getBillingPeriodLabel,
} from '@/services/subscriptionService'
import type {
  SubscriptionPlanType,
  BillingPeriod,
  SubscriptionCurrency,
  ProrationBehavior,
  CreateSubscriptionPlanData,
} from '../types/subscription-types'

// Form validation schema
const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Name is required | الاسم مطلوب'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  planType: z.enum([
    'retainer',
    'hourly_package',
    'flat_fee',
    'hybrid',
    'compliance',
    'document_review',
    'advisory',
  ]),
  code: z.string().optional(),
  billingPeriod: z.enum([
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'semi_annually',
    'annually',
  ]),
  amount: z.number().min(0, 'Amount must be positive | المبلغ يجب أن يكون موجباً'),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED']),
  setupFee: z.number().min(0).optional(),
  includedHours: z.number().min(0).optional(),
  hourlyRateAfter: z.number().min(0).optional(),
  trialDays: z.number().min(0).optional(),
  trialAmount: z.number().min(0).optional(),
  autoRenew: z.boolean().default(true),
  autoInvoice: z.boolean().default(true),
  invoiceDaysBefore: z.number().min(0).max(30).default(7),
  autoCloseDays: z.number().min(0).optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).default('create_prorations'),
  alignToPeriodStart: z.boolean().default(false),
  maxClients: z.number().min(0).optional(),
  maxCases: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  sortOrder: z.number().optional(),
})

type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>

export function SubscriptionPlanFormView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // Check if editing
  const params = useParams({ strict: false })
  const planId = (params as any)?.planId
  const isEditing = !!planId

  // Fetch plan if editing
  const { data: existingPlan, isLoading: planLoading } = useSubscriptionPlan(planId || '', !!planId)

  // Mutations
  const createPlanMutation = useCreateSubscriptionPlan()
  const updatePlanMutation = useUpdateSubscriptionPlan()

  // Form
  const form = useForm<SubscriptionPlanFormData>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      planType: 'retainer',
      code: '',
      billingPeriod: 'monthly',
      amount: 0,
      currency: 'SAR',
      setupFee: 0,
      includedHours: 0,
      hourlyRateAfter: 0,
      trialDays: 0,
      trialAmount: 0,
      autoRenew: true,
      autoInvoice: true,
      invoiceDaysBefore: 7,
      autoCloseDays: 30,
      prorationBehavior: 'create_prorations',
      alignToPeriodStart: false,
      maxClients: undefined,
      maxCases: undefined,
      isActive: true,
      isPublic: false,
      sortOrder: 0,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (existingPlan && isEditing) {
      form.reset({
        name: existingPlan.name,
        nameAr: existingPlan.nameAr || '',
        description: existingPlan.description || '',
        descriptionAr: existingPlan.descriptionAr || '',
        planType: existingPlan.planType,
        code: existingPlan.code || '',
        billingPeriod: existingPlan.billingPeriod,
        amount: existingPlan.amount,
        currency: existingPlan.currency,
        setupFee: existingPlan.setupFee || 0,
        includedHours: existingPlan.includedHours || 0,
        hourlyRateAfter: existingPlan.hourlyRateAfter || 0,
        trialDays: existingPlan.trialDays || 0,
        trialAmount: existingPlan.trialAmount || 0,
        autoRenew: existingPlan.autoRenew,
        autoInvoice: existingPlan.autoInvoice,
        invoiceDaysBefore: existingPlan.invoiceDaysBefore,
        autoCloseDays: existingPlan.autoCloseDays || 30,
        prorationBehavior: existingPlan.prorationBehavior,
        alignToPeriodStart: existingPlan.alignToPeriodStart || false,
        maxClients: existingPlan.maxClients,
        maxCases: existingPlan.maxCases,
        isActive: existingPlan.isActive,
        isPublic: existingPlan.isPublic,
        sortOrder: existingPlan.sortOrder || 0,
      })
    }
  }, [existingPlan, isEditing, form])

  // Handle form submission
  const onSubmit = async (data: SubscriptionPlanFormData) => {
    try {
      // Clean up optional fields
      const cleanData: CreateSubscriptionPlanData = {
        name: data.name,
        nameAr: data.nameAr || undefined,
        description: data.description || undefined,
        descriptionAr: data.descriptionAr || undefined,
        planType: data.planType,
        code: data.code || undefined,
        billingPeriod: data.billingPeriod,
        amount: data.amount,
        currency: data.currency,
        setupFee: data.setupFee || undefined,
        includedHours: data.includedHours || undefined,
        hourlyRateAfter: data.hourlyRateAfter || undefined,
        trialDays: data.trialDays || undefined,
        trialAmount: data.trialAmount || undefined,
        autoRenew: data.autoRenew,
        autoInvoice: data.autoInvoice,
        invoiceDaysBefore: data.invoiceDaysBefore,
        autoCloseDays: data.autoCloseDays || undefined,
        prorationBehavior: data.prorationBehavior,
        alignToPeriodStart: data.alignToPeriodStart,
        maxClients: data.maxClients || undefined,
        maxCases: data.maxCases || undefined,
        isActive: data.isActive,
        isPublic: data.isPublic,
        sortOrder: data.sortOrder || undefined,
      }

      if (isEditing) {
        await updatePlanMutation.mutateAsync({ id: planId, data: cleanData })
        toast.success(
          i18n.language === 'ar'
            ? 'تم تحديث الخطة بنجاح | Plan updated successfully'
            : 'Plan updated successfully | تم تحديث الخطة بنجاح'
        )
      } else {
        await createPlanMutation.mutateAsync(cleanData)
        toast.success(
          i18n.language === 'ar'
            ? 'تم إنشاء الخطة بنجاح | Plan created successfully'
            : 'Plan created successfully | تم إنشاء الخطة بنجاح'
        )
      }

      navigate({ to: ROUTES.dashboard.finance.subscriptionPlans.list })
    } catch (error) {
      toast.error(
        i18n.language === 'ar'
          ? 'حدث خطأ أثناء حفظ الخطة | Error saving plan'
          : 'Error saving plan | حدث خطأ أثناء حفظ الخطة'
      )
    }
  }

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: ROUTES.dashboard.home, isActive: false },
    {
      title: t('subscriptionPlans.title', 'خطط الاشتراك'),
      href: ROUTES.dashboard.finance.subscriptionPlans.list,
      isActive: false,
    },
    {
      title: isEditing
        ? t('subscriptionPlans.form.editTitle', 'تعديل الخطة')
        : t('subscriptionPlans.form.newTitle', 'خطة جديدة'),
      href: '#',
      isActive: true,
    },
  ]

  // Plan type options
  const planTypeOptions: { value: SubscriptionPlanType; label: string }[] = [
    { value: 'retainer', label: getPlanTypeLabel('retainer', i18n.language as 'ar' | 'en') },
    { value: 'hourly_package', label: getPlanTypeLabel('hourly_package', i18n.language as 'ar' | 'en') },
    { value: 'flat_fee', label: getPlanTypeLabel('flat_fee', i18n.language as 'ar' | 'en') },
    { value: 'hybrid', label: getPlanTypeLabel('hybrid', i18n.language as 'ar' | 'en') },
    { value: 'compliance', label: getPlanTypeLabel('compliance', i18n.language as 'ar' | 'en') },
    { value: 'document_review', label: getPlanTypeLabel('document_review', i18n.language as 'ar' | 'en') },
    { value: 'advisory', label: getPlanTypeLabel('advisory', i18n.language as 'ar' | 'en') },
  ]

  // Billing period options
  const billingPeriodOptions: { value: BillingPeriod; label: string }[] = [
    { value: 'weekly', label: getBillingPeriodLabel('weekly', i18n.language as 'ar' | 'en') },
    { value: 'biweekly', label: getBillingPeriodLabel('biweekly', i18n.language as 'ar' | 'en') },
    { value: 'monthly', label: getBillingPeriodLabel('monthly', i18n.language as 'ar' | 'en') },
    { value: 'quarterly', label: getBillingPeriodLabel('quarterly', i18n.language as 'ar' | 'en') },
    { value: 'semi_annually', label: getBillingPeriodLabel('semi_annually', i18n.language as 'ar' | 'en') },
    { value: 'annually', label: getBillingPeriodLabel('annually', i18n.language as 'ar' | 'en') },
  ]

  // Currency options
  const currencyOptions: { value: SubscriptionCurrency; label: string }[] = [
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
    { value: 'AED', label: 'درهم إماراتي (AED)' },
  ]

  // Proration options
  const prorationOptions: { value: ProrationBehavior; label: string }[] = [
    {
      value: 'create_prorations',
      label: i18n.language === 'ar' ? 'حساب التناسب' : 'Create Prorations',
    },
    {
      value: 'none',
      label: i18n.language === 'ar' ? 'بدون تناسب' : 'No Proration',
    },
    {
      value: 'always_invoice',
      label: i18n.language === 'ar' ? 'فوترة فورية' : 'Always Invoice',
    },
  ]

  const isPending = createPlanMutation.isPending || updatePlanMutation.isPending

  if (planLoading && isEditing) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav
            links={topNav}
            className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
          />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GosiButton
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => navigate({ to: ROUTES.dashboard.finance.subscriptionPlans.list })}
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </GosiButton>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {isEditing
                    ? t('subscriptionPlans.form.editTitle', 'تعديل الخطة')
                    : t('subscriptionPlans.form.newTitle', 'خطة اشتراك جديدة')}
                </h1>
                <p className="text-slate-500 text-sm">
                  {isEditing
                    ? t('subscriptionPlans.form.editDescription', 'قم بتعديل تفاصيل خطة الاشتراك')
                    : t('subscriptionPlans.form.newDescription', 'أنشئ خطة اشتراك جديدة لعملائك')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GosiButton
                type="button"
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.finance.subscriptionPlans.list })}
              >
                <X className="h-4 w-4 ms-2" />
                {t('common.cancel', 'إلغاء')}
              </GosiButton>
              <GosiButton type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600">
                <Save className="h-4 w-4 ms-2" />
                {isPending
                  ? t('common.saving', 'جاري الحفظ...')
                  : isEditing
                    ? t('common.save', 'حفظ التغييرات')
                    : t('common.create', 'إنشاء الخطة')}
              </GosiButton>
            </div>
          </div>

          {/* Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {t('subscriptionPlans.form.sections.basicInfo', 'المعلومات الأساسية')}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t('subscriptionPlans.form.sections.basicInfoDesc', 'الاسم والوصف ونوع الخطة')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('subscriptionPlans.form.name', 'الاسم')} ({t('common.english', 'English')}) *
                      </Label>
                      <Controller
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="name"
                            {...field}
                            placeholder={t('subscriptionPlans.form.namePlaceholder', 'مثال: باقة التوكيل الشهري')}
                            className="h-12"
                          />
                        )}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">
                        {t('subscriptionPlans.form.nameAr', 'الاسم بالعربية')} ({t('common.arabic', 'العربية')})
                      </Label>
                      <Controller
                        name="nameAr"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="nameAr"
                            {...field}
                            placeholder={t('subscriptionPlans.form.nameArPlaceholder', 'مثال: باقة التوكيل الشهري')}
                            className="h-12"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Plan Type & Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('subscriptionPlans.form.planType', 'نوع الخطة')} *</Label>
                      <Controller
                        name="planType"
                        control={form.control}
                        render={({ field }) => (
                          <GosiSelect value={field.value} onValueChange={field.onChange}>
                            <GosiSelectTrigger className="h-12">
                              <GosiSelectValue />
                            </GosiSelectTrigger>
                            <GosiSelectContent>
                              {planTypeOptions.map((option) => (
                                <GosiSelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </GosiSelectItem>
                              ))}
                            </GosiSelectContent>
                          </GosiSelect>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">{t('subscriptionPlans.form.code', 'كود الخطة')}</Label>
                      <Controller
                        name="code"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="code"
                            {...field}
                            placeholder="RET-001"
                            className="h-12 font-mono"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">{t('subscriptionPlans.form.description', 'الوصف')} (EN)</Label>
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea
                            id="description"
                            {...field}
                            placeholder={t('subscriptionPlans.form.descriptionPlaceholder', 'وصف مختصر للخطة...')}
                            rows={3}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionAr">{t('subscriptionPlans.form.descriptionAr', 'الوصف بالعربية')} (AR)</Label>
                      <Controller
                        name="descriptionAr"
                        control={form.control}
                        render={({ field }) => (
                          <Textarea
                            id="descriptionAr"
                            {...field}
                            placeholder={t('subscriptionPlans.form.descriptionArPlaceholder', 'وصف مختصر للخطة بالعربية...')}
                            rows={3}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </GosiCard>

              {/* Pricing */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {t('subscriptionPlans.form.sections.pricing', 'التسعير')}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t('subscriptionPlans.form.sections.pricingDesc', 'المبلغ وفترة الفوترة والعملة')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">{t('subscriptionPlans.form.amount', 'المبلغ')} *</Label>
                      <Controller
                        name="amount"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="amount"
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="h-12"
                          />
                        )}
                      />
                      {form.formState.errors.amount && (
                        <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('subscriptionPlans.form.currency', 'العملة')} *</Label>
                      <Controller
                        name="currency"
                        control={form.control}
                        render={({ field }) => (
                          <GosiSelect value={field.value} onValueChange={field.onChange}>
                            <GosiSelectTrigger className="h-12">
                              <GosiSelectValue />
                            </GosiSelectTrigger>
                            <GosiSelectContent>
                              {currencyOptions.map((option) => (
                                <GosiSelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </GosiSelectItem>
                              ))}
                            </GosiSelectContent>
                          </GosiSelect>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('subscriptionPlans.form.billingPeriod', 'فترة الفوترة')} *</Label>
                      <Controller
                        name="billingPeriod"
                        control={form.control}
                        render={({ field }) => (
                          <GosiSelect value={field.value} onValueChange={field.onChange}>
                            <GosiSelectTrigger className="h-12">
                              <GosiSelectValue />
                            </GosiSelectTrigger>
                            <GosiSelectContent>
                              {billingPeriodOptions.map((option) => (
                                <GosiSelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </GosiSelectItem>
                              ))}
                            </GosiSelectContent>
                          </GosiSelect>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setupFee">{t('subscriptionPlans.form.setupFee', 'رسوم الإعداد')}</Label>
                      <Controller
                        name="setupFee"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="setupFee"
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="h-12"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </GosiCard>

              {/* Hours & Services (Legal-specific) */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {t('subscriptionPlans.form.sections.hours', 'الساعات والخدمات')}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t('subscriptionPlans.form.sections.hoursDesc', 'الساعات المشمولة والسعر بعد الاستنفاد')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="includedHours">
                        {t('subscriptionPlans.form.includedHours', 'الساعات المشمولة')}
                      </Label>
                      <Controller
                        name="includedHours"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="includedHours"
                            type="number"
                            min={0}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="10"
                            className="h-12"
                          />
                        )}
                      />
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.includedHoursHelp', 'عدد الساعات المشمولة في كل فترة فوترة')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRateAfter">
                        {t('subscriptionPlans.form.hourlyRateAfter', 'سعر الساعة بعد الاستنفاد')}
                      </Label>
                      <Controller
                        name="hourlyRateAfter"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="hourlyRateAfter"
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="500"
                            className="h-12"
                          />
                        )}
                      />
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.hourlyRateAfterHelp', 'السعر لكل ساعة بعد استنفاد الساعات المشمولة')}
                      </p>
                    </div>
                  </div>
                </div>
              </GosiCard>

              {/* Trial Settings */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {t('subscriptionPlans.form.sections.trial', 'الفترة التجريبية')}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t('subscriptionPlans.form.sections.trialDesc', 'إعدادات الفترة التجريبية للعملاء الجدد')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trialDays">{t('subscriptionPlans.form.trialDays', 'أيام التجربة')}</Label>
                      <Controller
                        name="trialDays"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="trialDays"
                            type="number"
                            min={0}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="14"
                            className="h-12"
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trialAmount">
                        {t('subscriptionPlans.form.trialAmount', 'مبلغ التجربة')}
                      </Label>
                      <Controller
                        name="trialAmount"
                        control={form.control}
                        render={({ field }) => (
                          <GosiInput
                            id="trialAmount"
                            type="number"
                            min={0}
                            step="0.01"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-12"
                          />
                        )}
                      />
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.trialAmountHelp', 'اتركه 0 للتجربة المجانية')}
                      </p>
                    </div>
                  </div>
                </div>
              </GosiCard>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              {/* Automation Settings */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-slate-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">
                    {t('subscriptionPlans.form.sections.automation', 'الأتمتة')}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Auto Renew */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {t('subscriptionPlans.form.autoRenew', 'تجديد تلقائي')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.autoRenewHelp', 'تجديد الاشتراك تلقائياً')}
                      </p>
                    </div>
                    <Controller
                      name="autoRenew"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                      )}
                    />
                  </div>

                  {/* Auto Invoice */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {t('subscriptionPlans.form.autoInvoice', 'فوترة تلقائية')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.autoInvoiceHelp', 'إنشاء الفواتير تلقائياً')}
                      </p>
                    </div>
                    <Controller
                      name="autoInvoice"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                      )}
                    />
                  </div>

                  {/* Invoice Days Before */}
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDaysBefore">
                      {t('subscriptionPlans.form.invoiceDaysBefore', 'إنشاء الفاتورة قبل')}
                    </Label>
                    <Controller
                      name="invoiceDaysBefore"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <GosiInput
                            id="invoiceDaysBefore"
                            type="number"
                            min={0}
                            max={30}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                            className="h-10 w-20"
                          />
                          <span className="text-sm text-slate-500">
                            {t('subscriptionPlans.form.days', 'أيام')}
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  {/* Proration Behavior */}
                  <div className="space-y-2">
                    <Label>{t('subscriptionPlans.form.prorationBehavior', 'سلوك التناسب')}</Label>
                    <Controller
                      name="prorationBehavior"
                      control={form.control}
                      render={({ field }) => (
                        <GosiSelect value={field.value} onValueChange={field.onChange}>
                          <GosiSelectTrigger className="h-10">
                            <GosiSelectValue />
                          </GosiSelectTrigger>
                          <GosiSelectContent>
                            {prorationOptions.map((option) => (
                              <GosiSelectItem key={option.value} value={option.value}>
                                {option.label}
                              </GosiSelectItem>
                            ))}
                          </GosiSelectContent>
                        </GosiSelect>
                      )}
                    />
                  </div>

                  {/* Align to Period Start */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {t('subscriptionPlans.form.alignToPeriodStart', 'محاذاة لبداية الفترة')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.alignToPeriodStartHelp', 'الفوترة في أول الشهر')}
                      </p>
                    </div>
                    <Controller
                      name="alignToPeriodStart"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                      )}
                    />
                  </div>

                  {/* Auto Close Days */}
                  <div className="space-y-2">
                    <Label htmlFor="autoCloseDays">
                      {t('subscriptionPlans.form.autoCloseDays', 'إغلاق تلقائي بعد')}
                    </Label>
                    <Controller
                      name="autoCloseDays"
                      control={form.control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <GosiInput
                            id="autoCloseDays"
                            type="number"
                            min={0}
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-10 w-20"
                          />
                          <span className="text-sm text-slate-500">
                            {t('subscriptionPlans.form.daysIfUnpaid', 'يوم بدون سداد')}
                          </span>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </GosiCard>

              {/* Limits */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">
                    {t('subscriptionPlans.form.sections.limits', 'الحدود')}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxClients">{t('subscriptionPlans.form.maxClients', 'الحد الأقصى للعملاء')}</Label>
                    <Controller
                      name="maxClients"
                      control={form.control}
                      render={({ field }) => (
                        <GosiInput
                          id="maxClients"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          placeholder={t('subscriptionPlans.form.unlimited', 'غير محدود')}
                          className="h-10"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCases">{t('subscriptionPlans.form.maxCases', 'الحد الأقصى للقضايا')}</Label>
                    <Controller
                      name="maxCases"
                      control={form.control}
                      render={({ field }) => (
                        <GosiInput
                          id="maxCases"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          placeholder={t('subscriptionPlans.form.unlimited', 'غير محدود')}
                          className="h-10"
                        />
                      )}
                    />
                  </div>
                </div>
              </GosiCard>

              {/* Status */}
              <GosiCard className="p-6 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-rose-600" />
                  </div>
                  <h2 className="font-bold text-slate-900">
                    {t('subscriptionPlans.form.sections.status', 'الحالة')}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Is Active */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {t('subscriptionPlans.form.isActive', 'نشط')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.isActiveHelp', 'السماح بإنشاء اشتراكات جديدة')}
                      </p>
                    </div>
                    <Controller
                      name="isActive"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                      )}
                    />
                  </div>

                  {/* Is Public */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">
                        {t('subscriptionPlans.form.isPublic', 'عام')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('subscriptionPlans.form.isPublicHelp', 'إظهار في بوابة العملاء')}
                      </p>
                    </div>
                    <Controller
                      name="isPublic"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5"
                        />
                      )}
                    />
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">{t('subscriptionPlans.form.sortOrder', 'ترتيب العرض')}</Label>
                    <Controller
                      name="sortOrder"
                      control={form.control}
                      render={({ field }) => (
                        <GosiInput
                          id="sortOrder"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="h-10"
                        />
                      )}
                    />
                  </div>
                </div>
              </GosiCard>
            </div>
          </div>
        </form>
      </Main>
    </>
  )
}
