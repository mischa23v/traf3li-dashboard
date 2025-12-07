import { useState } from 'react'
import {
    ArrowRight, Save, User, Phone, Mail, Building,
    DollarSign, Calendar, FileText, Target, Loader2
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
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateLead, useUpdateLead, useLead } from '@/hooks/useAccounting'
import { useStaff } from '@/hooks/useStaff'
import type { LeadSource } from '@/services/accountingService'

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
    { value: 'website', label: 'الموقع الإلكتروني' },
    { value: 'referral', label: 'إحالة' },
    { value: 'social_media', label: 'وسائل التواصل' },
    { value: 'advertisement', label: 'إعلان' },
    { value: 'cold_call', label: 'اتصال مباشر' },
    { value: 'walk_in', label: 'زيارة شخصية' },
    { value: 'other', label: 'أخرى' },
]

const CASE_TYPES = [
    { value: 'labor', label: 'قضية عمالية' },
    { value: 'commercial', label: 'قضية تجارية' },
    { value: 'civil', label: 'قضية مدنية' },
    { value: 'criminal', label: 'قضية جنائية' },
    { value: 'family', label: 'قضية أسرية' },
    { value: 'administrative', label: 'قضية إدارية' },
]

interface CreateLeadViewProps {
    editMode?: boolean
}

export function CreateLeadView({ editMode = false }: CreateLeadViewProps) {
    const navigate = useNavigate()
    const params = editMode ? useParams({ from: '/_authenticated/dashboard/sales/leads/$leadId/edit' }) : null
    const leadId = params?.leadId

    const createLeadMutation = useCreateLead()
    const updateLeadMutation = useUpdateLead()
    const { data: staffData } = useStaff()
    const { data: leadData, isLoading: isLoadingLead } = useLead(leadId || '', { enabled: editMode && !!leadId })

    const lead = leadData?.data

    const [formData, setFormData] = useState({
        firstName: lead?.firstName || '',
        lastName: lead?.lastName || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        company: lead?.company || '',
        source: lead?.source || '' as LeadSource | '',
        estimatedValue: lead?.estimatedValue || 0,
        expectedCloseDate: lead?.expectedCloseDate?.split('T')[0] || '',
        caseType: lead?.caseType || '',
        description: lead?.description || '',
        notes: lead?.notes || '',
        assignedTo: typeof lead?.assignedTo === 'object' ? lead?.assignedTo?._id : lead?.assignedTo || '',
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const leadData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || undefined,
            phone: formData.phone || undefined,
            company: formData.company || undefined,
            source: formData.source as LeadSource,
            estimatedValue: formData.estimatedValue > 0 ? formData.estimatedValue : undefined,
            expectedCloseDate: formData.expectedCloseDate || undefined,
            caseType: formData.caseType || undefined,
            description: formData.description || undefined,
            notes: formData.notes || undefined,
            assignedTo: formData.assignedTo || undefined,
        }

        if (editMode && leadId) {
            updateLeadMutation.mutate(
                { id: leadId, data: leadData },
                {
                    onSuccess: () => {
                        navigate({ to: `/dashboard/sales/leads/${leadId}` })
                    }
                }
            )
        } else {
            createLeadMutation.mutate(leadData, {
                onSuccess: () => {
                    navigate({ to: '/dashboard/sales/leads' })
                }
            })
        }
    }

    const topNav = [
        { title: 'العملاء المحتملين', href: '/dashboard/sales/leads', isActive: true },
    ]

    if (editMode && isLoadingLead) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden">
                {/* HERO CARD */}
                <ProductivityHero
                    badge="إدارة العملاء المحتملين"
                    title={editMode ? "تعديل عميل محتمل" : "إضافة عميل محتمل جديد"}
                    type="clients"
                    listMode={true}
                    hideButtons={true}
                >
                    <Link to={editMode && leadId ? `/dashboard/sales/leads/${leadId}` : "/dashboard/sales/leads"}>
                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </ProductivityHero>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                الاسم الأول <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="أحمد"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                اسم العائلة <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="الشمري"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" />
                                                رقم الهاتف
                                            </label>
                                            <Input
                                                placeholder="+966 5x xxx xxxx"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                البريد الإلكتروني
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-emerald-500" />
                                            الشركة
                                        </label>
                                        <Input
                                            placeholder="اسم الشركة"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.company}
                                            onChange={(e) => handleChange('company', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Source & Assignment */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Target className="w-5 h-5 text-emerald-500" />
                                        المصدر والتعيين
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                مصدر العميل <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formData.source}
                                                onValueChange={(value) => handleChange('source', value)}
                                                required
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر المصدر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SOURCE_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                تعيين إلى
                                            </label>
                                            <Select
                                                value={formData.assignedTo}
                                                onValueChange={(value) => handleChange('assignedTo', value)}
                                            >
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر موظف" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staffData?.map((staff: any) => (
                                                        <SelectItem key={staff._id} value={staff._id}>
                                                            {staff.firstName} {staff.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Info */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        المعلومات المالية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                القيمة المتوقعة (ريال)
                                            </label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                min="0"
                                                value={formData.estimatedValue}
                                                onChange={(e) => handleChange('estimatedValue', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الإغلاق المتوقع
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                dir="ltr"
                                                value={formData.expectedCloseDate}
                                                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Case Details */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        تفاصيل القضية
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            نوع القضية
                                        </label>
                                        <Select
                                            value={formData.caseType}
                                            onValueChange={(value) => handleChange('caseType', value)}
                                        >
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="اختر نوع القضية" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CASE_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            الوصف
                                        </label>
                                        <Textarea
                                            placeholder="اكتب وصف القضية أو احتياجات العميل..."
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            ملاحظات
                                        </label>
                                        <Textarea
                                            placeholder="ملاحظات إضافية..."
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6"
                                        disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                                    >
                                        {(createLeadMutation.isPending || updateLeadMutation.isPending) && (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        )}
                                        <Save className="w-5 h-5 ms-2" aria-hidden="true" />
                                        {editMode ? 'حفظ التغييرات' : 'إنشاء عميل محتمل'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl px-8 py-6"
                                        onClick={() => navigate({ to: editMode && leadId ? `/dashboard/sales/leads/${leadId}` : '/dashboard/sales/leads' })}
                                    >
                                        إلغاء
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <SalesSidebar context="leads" />
                </div>
            </Main>
        </>
    )
}

export default CreateLeadView
