import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Save, User, Phone, Mail, Briefcase, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { useCreateStaff } from '@/hooks/useStaff'
import { staffStatuses, staffRoles, specializations } from '../data/data'

const formSchema = z.object({
    firstName: z.string().min(2, 'الاسم الأول مطلوب'),
    lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'lawyer', 'paralegal', 'assistant']),
    specialization: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
})

type StaffForm = z.infer<typeof formSchema>

export function CreateStaffView() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'
    const navigate = useNavigate()
    const { mutate: createStaff, isPending } = useCreateStaff()

    const form = useForm<StaffForm>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: 'lawyer',
            specialization: '',
            status: 'active',
        },
    })

    const onSubmit = (values: StaffForm) => {
        createStaff(values, {
            onSuccess: () => {
                navigate({ to: '/dashboard/staff' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
        { title: 'جهات الاتصال', href: '/dashboard/contacts', isActive: false },
        { title: 'فريق العمل', href: '/dashboard/staff', isActive: true },
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
                <ProductivityHero badge="العملاء والتواصل" title="إضافة موظف جديد" type="staff" hideButtons={true} />

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
                                        المعلومات الشخصية
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
                                                البريد الإلكتروني <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="example@company.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                {...form.register('email')}
                                            />
                                            {form.formState.errors.email && (
                                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                            )}
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
                                    </div>
                                </div>

                                {/* Role Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        الدور الوظيفي
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الدور <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={form.watch('role')}
                                                onValueChange={(value) => form.setValue('role', value as any)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الدور" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staffRoles.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            {isArabic ? role.label : role.labelEn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                التخصص
                                            </label>
                                            <Select
                                                value={form.watch('specialization')}
                                                onValueChange={(value) => form.setValue('specialization', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر التخصص" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {specializations.map((spec) => (
                                                        <SelectItem key={spec.value} value={spec.value}>
                                                            {isArabic ? spec.label : spec.labelEn}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="space-y-6 border-t border-slate-100 pt-6">
                                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        الحالة
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
                                                {staffStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {isArabic ? status.label : status.labelEn}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/staff">
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
                                                حفظ الموظف
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <CrmSidebar context="staff" />
                </div>
            </Main>
        </>
    )
}
