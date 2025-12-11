import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Bell, Search, User, Phone, Mail, Building2,
  DollarSign, Target, FileText, Loader2, TrendingUp,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateLead, usePipelines } from '@/hooks/useCrm'
import { leadStatuses, leadSources } from '../data/data'

const createLeadSchema = z.object({
  displayName: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.string().default('new'),
  pipelineId: z.string().optional(),
  sourceType: z.string().optional(),
  sourceDetail: z.string().optional(),
  estimatedValue: z.coerce.number().optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

type CreateLeadForm = z.infer<typeof createLeadSchema>

export function CreateLead() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  const createLeadMutation = useCreateLead()
  const { data: pipelinesData } = usePipelines()
  const pipelines = pipelinesData?.data || []

  const topNav = [
    { title: t('sidebar.nav.leads'), href: '/dashboard/crm/leads', isActive: true },
    { title: t('sidebar.nav.pipeline'), href: '/dashboard/crm/pipeline', isActive: false },
    { title: t('sidebar.nav.referrals'), href: '/dashboard/crm/referrals', isActive: false },
    { title: t('sidebar.nav.activities'), href: '/dashboard/crm/activities', isActive: false },
  ]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeadForm>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      status: 'new',
      probability: 10,
    },
  })

  const onSubmit = async (data: CreateLeadForm) => {
    const leadData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: data.displayName || `${data.firstName} ${data.lastName || ''}`.trim(),
      email: data.email || undefined,
      phone: data.phone || undefined,
      status: data.status,
      pipelineId: data.pipelineId || undefined,
      estimatedValue: data.estimatedValue || 0,
      probability: data.probability || 10,
      notes: data.notes || undefined,
      source: data.sourceType ? {
        type: data.sourceType,
        detail: data.sourceDetail,
      } : undefined,
    }

    createLeadMutation.mutate(leadData, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/leads' })
      },
    })
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge={t('leads.management')}
          title={t('leads.createNewLead')}
          type="leads"
        >
          <Link to="/dashboard/crm/leads">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl">
              {t('common.cancel')}
            </Button>
          </Link>
        </ProductivityHero>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    {t('leads.basicInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('leads.firstName')} *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className="rounded-xl"
                        placeholder={t('leads.firstNamePlaceholder')}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('leads.lastName')}</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className="rounded-xl"
                        placeholder={t('leads.lastNamePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t('leads.displayName')}</Label>
                    <Input
                      id="displayName"
                      {...register('displayName')}
                      className="rounded-xl"
                      placeholder={t('leads.displayNamePlaceholder')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    {t('leads.contactInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('leads.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="rounded-xl"
                        placeholder={t('leads.emailPlaceholder')}
                        dir="ltr"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('leads.phone')}</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        className="rounded-xl"
                        placeholder={t('leads.phonePlaceholder')}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    {t('leads.leadDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('leads.status')}</Label>
                      <Select
                        value={watch('status')}
                        onValueChange={(value) => setValue('status', value)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('leads.selectStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          {leadStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {isArabic ? status.label : status.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('leads.pipeline')}</Label>
                      <Select
                        value={watch('pipelineId')}
                        onValueChange={(value) => setValue('pipelineId', value)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('leads.selectPipeline')} />
                        </SelectTrigger>
                        <SelectContent>
                          {pipelines.map((pipeline: any) => (
                            <SelectItem key={pipeline._id} value={pipeline._id}>
                              {isArabic ? pipeline.nameAr : pipeline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('leads.source')}</Label>
                      <Select
                        value={watch('sourceType')}
                        onValueChange={(value) => setValue('sourceType', value)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('leads.selectSource')} />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {isArabic ? source.label : source.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sourceDetail">{t('leads.sourceDetail')}</Label>
                      <Input
                        id="sourceDetail"
                        {...register('sourceDetail')}
                        className="rounded-xl"
                        placeholder={t('leads.sourceDetailPlaceholder')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value & Probability */}
              <Card className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    {t('leads.valueInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedValue">{t('leads.estimatedValue')}</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        {...register('estimatedValue')}
                        className="rounded-xl"
                        placeholder="0"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="probability">{t('leads.probability')} (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        min="0"
                        max="100"
                        {...register('probability')}
                        className="rounded-xl"
                        placeholder="10"
                        dir="ltr"
                      />
                      {errors.probability && (
                        <p className="text-sm text-red-500">{errors.probability.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border border-slate-100 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    {t('leads.notes')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...register('notes')}
                    className="rounded-xl min-h-[120px]"
                    placeholder={t('leads.notesPlaceholder')}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl sticky top-6">
                <h3 className="font-bold text-lg text-white mb-4">{t('common.actions')}</h3>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || createLeadMutation.isPending}
                    className="bg-white hover:bg-emerald-50 text-emerald-600 w-full rounded-xl"
                  >
                    {(isSubmitting || createLeadMutation.isPending) ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('leads.createLead')
                    )}
                  </Button>
                  <Link to="/dashboard/crm/leads" className="block">
                    <Button variant="outline" type="button" className="bg-transparent text-white border-white/30 hover:bg-white/10 w-full rounded-xl">
                      {t('common.cancel')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Main>
    </>
  )
}
