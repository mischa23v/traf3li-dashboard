import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Save, Building2, Phone, Mail, MapPin, FileText, Loader2, Globe, Hash
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { CrmSidebar } from '@/components/crm-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateOrganization } from '@/hooks/useOrganizations'
import { createOrganizationSchema, type CreateOrganizationInput } from '../data/schema'
import { organizationTypes, organizationSizes, organizationStatuses } from '../data/data'

export function CreateOrganizationView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { mutate: createOrganization, isPending } = useCreateOrganization()

    const form = useForm<CreateOrganizationInput>({
        resolver: zodResolver(createOrganizationSchema) as any,
        defaultValues: {
            name: '',
            nameAr: '',
            type: 'company',
            registrationNumber: '',
            vatNumber: '',
            phone: '',
            fax: '',
            email: '',
            website: '',
            address: '',
            city: '',
            postalCode: '',
            country: '',
            industry: '',
            size: undefined,
            notes: '',
            status: 'active',
        },
    })

    const onSubmit = (data: CreateOrganizationInput) => {
        createOrganization(data, {
            onSuccess: () => {
                navigate({ to: '/dashboard/organizations' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
        { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: false },
        { title: 'المنظمات', href: '/dashboard/organizations', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Full width */}
                <ProductivityHero badge="العملاء والتواصل" title="إضافة منظمة جديدة" type="organizations" hideButtons={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اسم المنظمة (إنجليزي) <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Organization Name"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('name')}
                                            />
                                            {form.formState.errors.name && (
                                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اسم المنظمة (عربي)
                                            </label>
                                            <Input
                                                placeholder="أدخل اسم المنظمة بالعربي"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('nameAr')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                نوع المنظمة <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={form.watch('type')}
                                                onValueChange={(value) => form.setValue('type', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {organizationTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {t(`organizations.types.${type.value}`)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                القطاع / الصناعة
                                            </label>
                                            <Input
                                                placeholder="مثال: التقنية، العقارات"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('industry')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Registration Info Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-emerald-500" />
                                        معلومات التسجيل
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم السجل التجاري
                                            </label>
                                            <Input
                                                placeholder="أدخل رقم السجل التجاري"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('registrationNumber')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الرقم الضريبي
                                            </label>
                                            <Input
                                                placeholder="أدخل الرقم الضريبي"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('vatNumber')}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                حجم المنظمة
                                            </label>
                                            <Select
                                                value={form.watch('size')}
                                                onValueChange={(value) => form.setValue('size', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر حجم المنظمة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {organizationSizes.map((size) => (
                                                        <SelectItem key={size.value} value={size.value}>
                                                            {t(`organizations.sizes.${size.value}`)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-emerald-500" />
                                        معلومات الاتصال
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                البريد الإلكتروني
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="info@company.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('email')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-emerald-500" />
                                                الموقع الإلكتروني
                                            </label>
                                            <Input
                                                placeholder="https://www.company.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('website')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم الهاتف
                                            </label>
                                            <Input
                                                placeholder="+966 XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('phone')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم الفاكس
                                            </label>
                                            <Input
                                                placeholder="+966 XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('fax')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-500" />
                                        العنوان
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            العنوان
                                        </label>
                                        <Input
                                            placeholder="أدخل العنوان التفصيلي"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            {...form.register('address')}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                المدينة
                                            </label>
                                            <Input
                                                placeholder="أدخل المدينة"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('city')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الرمز البريدي
                                            </label>
                                            <Input
                                                placeholder="12345"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('postalCode')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الدولة
                                            </label>
                                            <Input
                                                placeholder="المملكة العربية السعودية"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('country')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Notes Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        الحالة والملاحظات
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الحالة
                                        </label>
                                        <Select
                                            value={form.watch('status')}
                                            onValueChange={(value) => form.setValue('status', value as any)}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر الحالة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {organizationStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {t(`organizations.statuses.${status.value}`)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            {...form.register('notes')}
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/organizations">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ المنظمة
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <CrmSidebar context="organizations" />
                </div>
            </Main>
        </>
    )
}
