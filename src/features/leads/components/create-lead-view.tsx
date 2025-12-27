import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Bell, Search, User, Phone, Mail, Building2,
    DollarSign, Target, FileText, Loader2, TrendingUp,
    Save, ArrowRight, AlertCircle
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
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
import { useCreateLead, usePipelines } from '@/hooks/useCrm'
import { SalesSidebar } from '@/features/crm/components/sales-sidebar'
import { ROUTES } from '@/constants/routes'

// Status options
const LEAD_STATUSES = [
    { value: 'new', label: 'جديد' },
    { value: 'contacted', label: 'تم التواصل' },
    { value: 'qualified', label: 'مؤهل' },
    { value: 'proposal', label: 'عرض سعر' },
    { value: 'negotiation', label: 'تفاوض' },
]

// Source options
const LEAD_SOURCES = [
    { value: 'website', label: 'الموقع الإلكتروني' },
    { value: 'referral', label: 'إحالة' },
    { value: 'social_media', label: 'وسائل التواصل' },
    { value: 'advertising', label: 'إعلان' },
    { value: 'cold_call', label: 'اتصال مباشر' },
    { value: 'walk_in', label: 'زيارة شخصية' },
    { value: 'event', label: 'فعالية' },
    { value: 'other', label: 'أخرى' },
]

const createLeadSchema = z.object({
    displayName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
    phone: z.string().optional(),
    status: z.string().default('new'),
    pipelineId: z.string().optional(),
    sourceType: z.string().optional(),
    sourceNotes: z.string().optional(),
    estimatedValue: z.coerce.number().optional(),
    probability: z.coerce.number().min(0).max(100).optional(),
    notes: z.string().optional(),
})

type CreateLeadForm = z.infer<typeof createLeadSchema>

export function CreateLead() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const navigate = useNavigate()

    const createLeadMutation = useCreateLead()
    const { data: pipelinesData } = usePipelines()
    const pipelines = pipelinesData?.data || []

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
        { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: true },
        { title: 'خط المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: false },
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
                notes: data.sourceNotes || undefined,
            } : undefined,
        }

        createLeadMutation.mutate(leadData, {
            onSuccess: () => {
                toast.success('تم إنشاء العميل المحتمل بنجاح')
                navigate({ to: ROUTES.dashboard.crm.leads.list })
            },
            onError: () => {
                toast.error('حدث خطأ أثناء إنشاء العميل المحتمل')
            }
        })
    }

    return (
        <>
            {/* Header */}
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="بحث..."
                            className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            {/* Main Content */}
            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* Hero Card - Hidden on mobile */}
                <div className="hidden md:block">
                    <ProductivityHero badge="إدارة المبيعات" title="إضافة عميل محتمل" type="leads" listMode={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form Content (col-span-2) */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Back Link */}
                        <Link to={ROUTES.dashboard.crm.leads.list} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <span className="text-base font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">العودة لقائمة العملاء المحتملين</span>
                        </Link>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Header */}
                                <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900">عميل محتمل جديد</h1>
                                            <p className="text-base text-slate-500">أدخل بيانات العميل المحتمل</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Info Section */}
                                <div className="px-8 py-6 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-slate-800">المعلومات الأساسية</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                                                الاسم الأول
                                            </Label>
                                            <Input
                                                id="firstName"
                                                {...register('firstName')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="أدخل الاسم الأول"
                                            />
                                            {errors.firstName && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.firstName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                                                الاسم الأخير
                                            </Label>
                                            <Input
                                                id="lastName"
                                                {...register('lastName')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="أدخل الاسم الأخير"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="displayName" className="text-sm font-medium text-slate-700">
                                            الاسم المعروض
                                        </Label>
                                        <Input
                                            id="displayName"
                                            {...register('displayName')}
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            placeholder="الاسم الذي سيظهر في القائمة (اختياري)"
                                        />
                                    </div>
                                </div>

                                {/* Contact Info Section */}
                                <div className="px-8 py-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Phone className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-slate-800">معلومات الاتصال</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                                                البريد الإلكتروني
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                {...register('email')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="example@email.com"
                                                dir="ltr"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                                                رقم الهاتف
                                            </Label>
                                            <Input
                                                id="phone"
                                                {...register('phone')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="+966512345678"
                                                dir="ltr"
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lead Details Section */}
                                <div className="px-8 py-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-slate-800">تفاصيل العميل المحتمل</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الحالة</Label>
                                            <Select
                                                value={watch('status')}
                                                onValueChange={(value) => setValue('status', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الحالة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LEAD_STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            {status.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">خط المبيعات</Label>
                                            <Select
                                                value={watch('pipelineId')}
                                                onValueChange={(value) => setValue('pipelineId', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر خط المبيعات" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pipelines.map((pipeline: any) => (
                                                        <SelectItem key={pipeline._id} value={pipeline._id}>
                                                            {isRTL ? pipeline.nameAr : pipeline.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">المصدر</Label>
                                            <Select
                                                value={watch('sourceType')}
                                                onValueChange={(value) => setValue('sourceType', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر مصدر العميل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LEAD_SOURCES.map((source) => (
                                                        <SelectItem key={source.value} value={source.value}>
                                                            {source.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sourceNotes" className="text-sm font-medium text-slate-700">
                                                ملاحظات المصدر
                                            </Label>
                                            <Input
                                                id="sourceNotes"
                                                {...register('sourceNotes')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="مثال: اسم الشخص المُحيل"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Value & Probability Section */}
                                <div className="px-8 py-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-slate-800">القيمة والاحتمالية</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="estimatedValue" className="text-sm font-medium text-slate-700">
                                                القيمة المتوقعة (ر.س)
                                            </Label>
                                            <Input
                                                id="estimatedValue"
                                                type="number"
                                                {...register('estimatedValue')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="0"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="probability" className="text-sm font-medium text-slate-700">
                                                احتمالية الإغلاق (%)
                                            </Label>
                                            <Input
                                                id="probability"
                                                type="number"
                                                min="0"
                                                max="100"
                                                {...register('probability')}
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                placeholder="10"
                                                dir="ltr"
                                            />
                                            {errors.probability && (
                                                <p className="text-sm text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.probability.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="px-8 py-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-lg font-semibold text-slate-800">ملاحظات</h3>
                                    </div>

                                    <Textarea
                                        {...register('notes')}
                                        className="rounded-xl min-h-[120px] border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="أضف أي ملاحظات إضافية عن العميل المحتمل..."
                                    />
                                </div>

                                {/* Footer / Actions */}
                                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                                    <Link to={ROUTES.dashboard.crm.leads.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 h-11 px-6">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 h-11 px-8 font-medium"
                                        disabled={isSubmitting || createLeadMutation.isPending}
                                    >
                                        {(isSubmitting || createLeadMutation.isPending) ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ العميل المحتمل
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar (col-span-1) - Hidden on mobile */}
                    <div className="hidden lg:block">
                        <SalesSidebar context="leads" />
                    </div>
                </div>
            </Main>
        </>
    )
}
