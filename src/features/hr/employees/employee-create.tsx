import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ArrowRight, Save, Calendar, User,
    FileText, Briefcase, Users, Loader2,
    Plus, X, Building2, Mail, Phone, MapPin, DollarSign
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
import { HRSidebar } from '../components/hr-sidebar'
import { useCreateEmployee } from '@/hooks/useEmployees'
import type { CreateEmployeeData } from '@/types/hr'

const GENDER_OPTIONS = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
]

const MARITAL_STATUS_OPTIONS = [
    { value: 'single', label: 'أعزب' },
    { value: 'married', label: 'متزوج' },
    { value: 'divorced', label: 'مطلق' },
    { value: 'widowed', label: 'أرمل' },
]

const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'full_time', label: 'دوام كامل' },
    { value: 'part_time', label: 'دوام جزئي' },
    { value: 'contract', label: 'عقد' },
    { value: 'intern', label: 'متدرب' },
]

const STATUS_OPTIONS = [
    { value: 'active', label: 'نشط' },
    { value: 'probation', label: 'تحت التجربة' },
    { value: 'inactive', label: 'غير نشط' },
]

const DEPARTMENT_OPTIONS = [
    { value: 'legal', label: 'الشؤون القانونية' },
    { value: 'hr', label: 'الموارد البشرية' },
    { value: 'finance', label: 'المالية' },
    { value: 'admin', label: 'الإدارة' },
    { value: 'it', label: 'تقنية المعلومات' },
    { value: 'marketing', label: 'التسويق' },
]

export function EmployeeCreate() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createEmployeeMutation = useCreateEmployee()

    // Form state
    const [formData, setFormData] = useState({
        // Personal Info
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        nationalId: '',
        maritalStatus: '',
        // Work Info
        employeeId: '',
        department: '',
        position: '',
        hireDate: '',
        employmentType: 'full_time',
        status: 'active',
        managerId: '',
        // Salary
        salaryAmount: 0,
        salaryCurrency: 'SAR',
        // Address
        street: '',
        city: '',
        state: '',
        country: 'السعودية',
        postalCode: '',
        // Emergency Contact
        emergencyName: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        // Notes
        notes: '',
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const employeeData: CreateEmployeeData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
            dateOfBirth: formData.dateOfBirth || undefined,
            gender: formData.gender as 'male' | 'female' | undefined,
            nationality: formData.nationality || undefined,
            nationalId: formData.nationalId || undefined,
            maritalStatus: formData.maritalStatus as 'single' | 'married' | 'divorced' | 'widowed' | undefined,
            employeeId: formData.employeeId || undefined,
            department: formData.department || undefined,
            position: formData.position || undefined,
            hireDate: formData.hireDate,
            employmentType: formData.employmentType as 'full_time' | 'part_time' | 'contract' | 'intern',
            status: formData.status as 'active' | 'inactive' | 'on_leave' | 'probation' | 'terminated',
            salary: formData.salaryAmount > 0 ? {
                amount: formData.salaryAmount,
                currency: formData.salaryCurrency as 'SAR' | 'USD' | 'EUR',
            } : undefined,
            address: (formData.street || formData.city) ? {
                street: formData.street || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                country: formData.country || undefined,
                postalCode: formData.postalCode || undefined,
            } : undefined,
            emergencyContact: formData.emergencyName ? {
                name: formData.emergencyName,
                relationship: formData.emergencyRelationship || undefined,
                phone: formData.emergencyPhone || undefined,
            } : undefined,
            notes: formData.notes || undefined,
        }

        createEmployeeMutation.mutate(employeeData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/hr/employees' })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الموظفون', href: '/dashboard/hr/employees', isActive: true },
        { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
        { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: false },
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/hr/employees">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">إضافة موظف جديد</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    أدخل بيانات الموظف الجديد لإضافته إلى نظام الموارد البشرية.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Users className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <User className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <User className="w-5 h-5 text-emerald-500" />
                                        المعلومات الشخصية
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
                                                الاسم الأخير <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="محمد"
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
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                البريد الإلكتروني <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="ahmed@example.com"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" />
                                                رقم الهاتف
                                            </label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 5X XXX XXXX"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ الميلاد
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الجنس</label>
                                            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GENDER_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الحالة الاجتماعية</label>
                                            <Select value={formData.maritalStatus} onValueChange={(value) => handleChange('maritalStatus', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MARITAL_STATUS_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الجنسية</label>
                                            <Input
                                                placeholder="سعودي"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.nationality}
                                                onChange={(e) => handleChange('nationality', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">رقم الهوية الوطنية</label>
                                            <Input
                                                placeholder="XXXXXXXXXXX"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.nationalId}
                                                onChange={(e) => handleChange('nationalId', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Work Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        معلومات العمل
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">رقم الموظف</label>
                                            <Input
                                                placeholder="EMP-001"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.employeeId}
                                                onChange={(e) => handleChange('employeeId', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                تاريخ التعيين <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                required
                                                value={formData.hireDate}
                                                onChange={(e) => handleChange('hireDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-500" />
                                                القسم
                                            </label>
                                            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر القسم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEPARTMENT_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">المسمى الوظيفي</label>
                                            <Input
                                                placeholder="مثال: محاسب أول"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.position}
                                                onChange={(e) => handleChange('position', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">نوع التوظيف</label>
                                            <Select value={formData.employmentType} onValueChange={(value) => handleChange('employmentType', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الحالة</label>
                                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        الراتب
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الراتب الأساسي</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.salaryAmount || ''}
                                                onChange={(e) => handleChange('salaryAmount', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">العملة</label>
                                            <Select value={formData.salaryCurrency} onValueChange={(value) => handleChange('salaryCurrency', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <MapPin className="w-5 h-5 text-emerald-500" />
                                        العنوان
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">الشارع</label>
                                        <Input
                                            placeholder="شارع الملك فهد"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.street}
                                            onChange={(e) => handleChange('street', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">المدينة</label>
                                            <Input
                                                placeholder="الرياض"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">المنطقة</label>
                                            <Input
                                                placeholder="منطقة الرياض"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.state}
                                                onChange={(e) => handleChange('state', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الرمز البريدي</label>
                                            <Input
                                                placeholder="12345"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.postalCode}
                                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Phone className="w-5 h-5 text-emerald-500" />
                                        جهة اتصال الطوارئ
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">الاسم</label>
                                            <Input
                                                placeholder="اسم جهة الاتصال"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.emergencyName}
                                                onChange={(e) => handleChange('emergencyName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">صلة القرابة</label>
                                            <Input
                                                placeholder="مثال: أخ، زوجة"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.emergencyRelationship}
                                                onChange={(e) => handleChange('emergencyRelationship', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
                                            <Input
                                                type="tel"
                                                placeholder="+966 5X XXX XXXX"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.emergencyPhone}
                                                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        ملاحظات
                                    </h3>

                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="أي ملاحظات إضافية..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/hr/employees">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={createEmployeeMutation.isPending}
                                    >
                                        {createEmployeeMutation.isPending ? (
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
                    <HRSidebar context="employees" />
                </div>
            </Main>
        </>
    )
}
