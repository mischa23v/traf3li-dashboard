import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Save, User, Phone, Mail, Building2, MapPin, FileText, Loader2
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
import { useCreateClient } from '@/hooks/useClients'
import { clientStatuses, contactMethods } from '../data/data'

const formSchema = z.object({
    fullName: z.string().min(2, 'الاسم مطلوب ويجب أن يكون حرفين على الأقل'),
    email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
    phone: z.string().min(9, 'رقم الهاتف مطلوب'),
    alternatePhone: z.string().optional(),
    nationalId: z.string().optional(),
    companyName: z.string().optional(),
    companyRegistration: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().default('SA'),
    notes: z.string().optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']).default('phone'),
    language: z.string().default('ar'),
    status: z.enum(['active', 'inactive', 'archived']).default('active'),
})

type ClientForm = z.infer<typeof formSchema>

export function CreateClientView() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'
    const navigate = useNavigate()
    const { mutate: createClient, isPending } = useCreateClient()

    const form = useForm<ClientForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            alternatePhone: '',
            nationalId: '',
            companyName: '',
            companyRegistration: '',
            address: '',
            city: '',
            country: 'SA',
            notes: '',
            preferredContactMethod: 'phone',
            language: 'ar',
            status: 'active',
        },
    })

    const onSubmit = (values: ClientForm) => {
        createClient(values, {
            onSuccess: () => {
                navigate({ to: '/dashboard/clients' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: true },
        { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: false },
        { title: 'المنظمات', href: '/dashboard/organizations', isActive: false },
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
                <ProductivityHero badge="العملاء" title="إنشاء عميل جديد" type="clients" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الكامل <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="أدخل الاسم الكامل"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('fullName')}
                                            />
                                            {form.formState.errors.fullName && (
                                                <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم الهوية
                                            </label>
                                            <Input
                                                placeholder="أدخل رقم الهوية"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('nationalId')}
                                            />
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
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم الهاتف <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('phone')}
                                            />
                                            {form.formState.errors.phone && (
                                                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم هاتف بديل
                                            </label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('alternatePhone')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                البريد الإلكتروني
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="example@email.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('email')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                طريقة التواصل المفضلة
                                            </label>
                                            <Select
                                                value={form.watch('preferredContactMethod')}
                                                onValueChange={(value) => form.setValue('preferredContactMethod', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر طريقة التواصل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contactMethods.map((method) => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                            {isArabic ? method.label : method.labelEn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Info Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" />
                                        معلومات الشركة
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اسم الشركة
                                            </label>
                                            <Input
                                                placeholder="أدخل اسم الشركة"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('companyName')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم السجل التجاري
                                            </label>
                                            <Input
                                                placeholder="أدخل رقم السجل التجاري"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('companyRegistration')}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                العنوان
                                            </label>
                                            <Input
                                                placeholder="أدخل العنوان التفصيلي"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('address')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
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
                                                {clientStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {isArabic ? status.label : status.labelEn}
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
                                    <Link to="/dashboard/clients">
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
                                                حفظ العميل
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <CrmSidebar context="clients" />
                </div>
            </Main>
        </>
    )
}
