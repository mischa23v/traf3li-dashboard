import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Save, User, Phone, Mail, Building2, MapPin, FileText, Loader2, Tag
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
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateContact } from '@/hooks/useContacts'
import { createContactSchema, type CreateContactInput } from '../data/schema'
import { contactTypes, contactCategories, contactStatuses } from '../data/data'

export function CreateContactView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { mutate: createContact, isPending } = useCreateContact()

    const form = useForm<CreateContactInput>({
        resolver: zodResolver(createContactSchema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            alternatePhone: '',
            title: '',
            company: '',
            type: 'individual',
            category: undefined,
            address: '',
            city: '',
            postalCode: '',
            country: '',
            notes: '',
            status: 'active',
        },
    })

    const onSubmit = (data: CreateContactInput) => {
        createContact(data, {
            onSuccess: () => {
                navigate({ to: '/dashboard/contacts' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
        { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: true },
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
                <ProductivityHero badge="جهات الاتصال" title="إنشاء جهة اتصال" type="contacts" listMode={true} />

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
                                                الاسم الأول <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="أدخل الاسم الأول"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('firstName')}
                                            />
                                            {form.formState.errors.firstName && (
                                                <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الأخير <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="أدخل الاسم الأخير"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('lastName')}
                                            />
                                            {form.formState.errors.lastName && (
                                                <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                المسمى الوظيفي
                                            </label>
                                            <Input
                                                placeholder="مثال: مدير التسويق"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('title')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الشركة
                                            </label>
                                            <Input
                                                placeholder="أدخل اسم الشركة"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('company')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Type & Category Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-emerald-500" />
                                        النوع والتصنيف
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                النوع <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={form.watch('type')}
                                                onValueChange={(value) => form.setValue('type', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contactTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {t(`contacts.types.${type.value}`)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                التصنيف
                                            </label>
                                            <Select
                                                value={form.watch('category')}
                                                onValueChange={(value) => form.setValue('category', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contactCategories.map((category) => (
                                                        <SelectItem key={category.value} value={category.value}>
                                                            {t(`contacts.categories.${category.value}`)}
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
                                                placeholder="example@email.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('email')}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                رقم الهاتف
                                            </label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('phone')}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
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
                                                {contactStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {t(`contacts.statuses.${status.value}`)}
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
                                    <Link to="/dashboard/contacts">
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
                                                حفظ جهة الاتصال
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <ClientsSidebar context="contacts" />
                </div>
            </Main>
        </>
    )
}
