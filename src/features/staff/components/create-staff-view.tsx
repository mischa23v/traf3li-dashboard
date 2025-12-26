/**
 * Staff/Team Member Form - Comprehensive Law Firm HR
 *
 * Features:
 * - Personal information with Saudi ID
 * - Bar admission and licensing (Saudi Bar Association)
 * - Practice areas and specializations
 * - Billing rates (hourly, target hours)
 * - Employment details (department, hire date, manager)
 * - Education and certifications
 * - Emergency contact
 * - Work permissions and access levels
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, User, Phone, Mail, Briefcase, Loader2, Tag,
    Plus, X, GraduationCap, Shield, Calendar, Star,
    CreditCard, Scale, DollarSign, Clock, Building,
    Users, Award, FileText, MapPin, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateStaff } from '@/hooks/useStaff'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'

// ==================== CONSTANTS ====================

const STAFF_ROLES = [
    { value: 'owner', label: 'مالك', icon: Star },
    { value: 'admin', label: 'إداري', icon: Building },
    { value: 'partner', label: 'شريك', icon: Users },
    { value: 'lawyer', label: 'محامي', icon: Scale },
    { value: 'paralegal', label: 'مساعد قانوني', icon: Briefcase },
    { value: 'secretary', label: 'سكرتير', icon: FileText },
    { value: 'accountant', label: 'محاسب', icon: DollarSign },
    { value: 'departed', label: 'مغادر', icon: User },
]

const EMPLOYMENT_TYPES = [
    { value: 'full_time', label: 'دوام كامل' },
    { value: 'part_time', label: 'دوام جزئي' },
    { value: 'contract', label: 'عقد مؤقت' },
    { value: 'consultant', label: 'مستشار' },
    { value: 'intern', label: 'متدرب' },
    { value: 'of_counsel', label: 'مستشار خارجي' },
]

const DEPARTMENTS = [
    { value: 'litigation', label: 'التقاضي' },
    { value: 'corporate', label: 'الشركات' },
    { value: 'real_estate', label: 'العقارات' },
    { value: 'ip', label: 'الملكية الفكرية' },
    { value: 'labor', label: 'العمل والتوظيف' },
    { value: 'family', label: 'الأحوال الشخصية' },
    { value: 'criminal', label: 'الجنائي' },
    { value: 'banking', label: 'المصرفي والتمويل' },
    { value: 'tax', label: 'الضرائب والزكاة' },
    { value: 'admin', label: 'الإدارة' },
    { value: 'finance', label: 'المالية' },
    { value: 'other', label: 'أخرى' },
]

const PRACTICE_AREAS = [
    { value: 'litigation', label: 'التقاضي والمحاكم' },
    { value: 'corporate', label: 'الشركات والتجاري' },
    { value: 'mergers', label: 'الاندماج والاستحواذ' },
    { value: 'real_estate', label: 'العقارات' },
    { value: 'construction', label: 'المقاولات والإنشاءات' },
    { value: 'ip', label: 'الملكية الفكرية' },
    { value: 'labor', label: 'العمل والتوظيف' },
    { value: 'family', label: 'الأحوال الشخصية' },
    { value: 'criminal', label: 'الجنائي' },
    { value: 'banking', label: 'المصرفي والتمويل' },
    { value: 'insurance', label: 'التأمين' },
    { value: 'tax', label: 'الضرائب والزكاة' },
    { value: 'arbitration', label: 'التحكيم' },
    { value: 'mediation', label: 'الوساطة' },
    { value: 'administrative', label: 'الإداري' },
    { value: 'compliance', label: 'الالتزام والحوكمة' },
    { value: 'cyber', label: 'الجرائم الإلكترونية' },
    { value: 'contracts', label: 'العقود' },
]

const EDUCATION_LEVELS = [
    { value: 'bachelor', label: 'بكالوريوس' },
    { value: 'master', label: 'ماجستير' },
    { value: 'phd', label: 'دكتوراه' },
    { value: 'diploma', label: 'دبلوم' },
    { value: 'professional', label: 'شهادة مهنية' },
]

const STAFF_STATUSES = [
    { value: 'active', label: 'نشط', color: 'bg-emerald-500' },
    { value: 'inactive', label: 'غير نشط', color: 'bg-gray-500' },
    { value: 'departed', label: 'مغادر', color: 'bg-red-500' },
    { value: 'suspended', label: 'معلق', color: 'bg-orange-500' },
    { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-500' },
    { value: 'pending_approval', label: 'في انتظار الموافقة', color: 'bg-blue-500' },
]

const BILLING_TYPES = [
    { value: 'hourly', label: 'بالساعة' },
    { value: 'fixed', label: 'ثابت' },
    { value: 'non_billable', label: 'غير قابل للفوترة' },
]

// ==================== COMPONENT ====================

export function CreateStaffView() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'
    const navigate = useNavigate()
    const { mutate: createStaff, isPending } = useCreateStaff()
    const { isAdminOrOwner, canManageTeam } = usePermissions()

    // Check if user can manage permissions (admin, owner, or team manager)
    const canManagePermissions = isAdminOrOwner() || canManageTeam()

    // Form state
    const [formData, setFormData] = useState({
        // Personal Info
        firstName: '',
        middleName: '',
        lastName: '',
        firstNameAr: '',
        lastNameAr: '',
        preferredName: '',
        gender: 'male',

        // Contact
        email: '',
        personalEmail: '',
        phone: '',
        personalPhone: '',
        whatsApp: '',

        // Identification
        nationalId: '',
        iqamaNumber: '',
        iqamaExpiry: '',
        passportNumber: '',
        passportExpiry: '',
        dateOfBirth: '',
        nationality: 'سعودي',

        // Address
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'المملكة العربية السعودية',

        // Employment
        role: 'lawyer',
        employmentType: 'full_time',
        department: '',
        title: '',
        hireDate: '',
        startDate: '',
        probationEndDate: '',
        reportsTo: '',
        employeeId: '',

        // Bar & Licensing
        isLicensedAttorney: false,
        barNumber: '',
        barAdmissionDate: '',
        barExpiryDate: '',
        barJurisdiction: 'المملكة العربية السعودية',

        // Practice Areas
        practiceAreas: [] as string[],
        primaryPracticeArea: '',

        // Billing
        billingType: 'hourly',
        hourlyRate: '',
        targetHours: '160',
        canBillClients: true,

        // Education
        educationLevel: '',
        university: '',
        graduationYear: '',
        certifications: [] as string[],

        // Emergency Contact
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactPhone: '',

        // Permissions
        canAccessAllCases: false,
        canAccessFinancials: false,
        canApproveTimeEntries: false,
        canCreateInvoices: false,

        // Status
        status: 'active',

        // Notes
        notes: '',
    })

    // Tags/certifications input
    const [certInput, setCertInput] = useState('')

    // Handle form changes
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Toggle practice area
    const togglePracticeArea = (area: string) => {
        const current = formData.practiceAreas
        if (current.includes(area)) {
            handleChange('practiceAreas', current.filter(a => a !== area))
        } else {
            handleChange('practiceAreas', [...current, area])
        }
    }

    // Handle certifications
    const addCertification = () => {
        if (certInput.trim() && !formData.certifications.includes(certInput.trim())) {
            handleChange('certifications', [...formData.certifications, certInput.trim()])
            setCertInput('')
        }
    }

    const removeCertification = (cert: string) => {
        handleChange('certifications', formData.certifications.filter(c => c !== cert))
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const staffData = {
            // Personal
            firstName: formData.firstName,
            middleName: formData.middleName || undefined,
            lastName: formData.lastName,
            firstNameAr: formData.firstNameAr || undefined,
            lastNameAr: formData.lastNameAr || undefined,
            preferredName: formData.preferredName || undefined,
            gender: formData.gender,

            // Contact
            email: formData.email,
            personalEmail: formData.personalEmail || undefined,
            phone: formData.phone || undefined,
            personalPhone: formData.personalPhone || undefined,
            whatsApp: formData.whatsApp || undefined,

            // Identification
            nationalId: formData.nationalId || undefined,
            iqamaNumber: formData.iqamaNumber || undefined,
            iqamaExpiry: formData.iqamaExpiry || undefined,
            passportNumber: formData.passportNumber || undefined,
            passportExpiry: formData.passportExpiry || undefined,
            dateOfBirth: formData.dateOfBirth || undefined,
            nationality: formData.nationality || undefined,

            // Address
            address: formData.street || undefined,
            city: formData.city || undefined,
            province: formData.province || undefined,
            postalCode: formData.postalCode || undefined,
            country: formData.country || undefined,

            // Employment
            role: formData.role,
            employmentType: formData.employmentType,
            department: formData.department || undefined,
            title: formData.title || undefined,
            hireDate: formData.hireDate || undefined,
            startDate: formData.startDate || undefined,
            probationEndDate: formData.probationEndDate || undefined,
            reportsTo: formData.reportsTo || undefined,
            employeeId: formData.employeeId || undefined,

            // Bar
            isLicensedAttorney: formData.isLicensedAttorney,
            barNumber: formData.barNumber || undefined,
            barAdmissionDate: formData.barAdmissionDate || undefined,
            barExpiryDate: formData.barExpiryDate || undefined,
            barJurisdiction: formData.barJurisdiction || undefined,

            // Practice
            practiceAreas: formData.practiceAreas.length > 0 ? formData.practiceAreas : undefined,
            primaryPracticeArea: formData.primaryPracticeArea || undefined,
            specialization: formData.primaryPracticeArea || undefined,

            // Billing
            billingType: formData.billingType,
            hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) * 100 : undefined, // Convert to halalas
            targetHours: formData.targetHours ? parseInt(formData.targetHours) : undefined,
            canBillClients: formData.canBillClients,

            // Education
            educationLevel: formData.educationLevel || undefined,
            university: formData.university || undefined,
            graduationYear: formData.graduationYear || undefined,
            certifications: formData.certifications.length > 0 ? formData.certifications : undefined,

            // Emergency
            emergencyContact: formData.emergencyContactName ? {
                name: formData.emergencyContactName,
                relation: formData.emergencyContactRelation,
                phone: formData.emergencyContactPhone,
            } : undefined,

            // Permissions
            permissions: {
                canAccessAllCases: formData.canAccessAllCases,
                canAccessFinancials: formData.canAccessFinancials,
                canApproveTimeEntries: formData.canApproveTimeEntries,
                canCreateInvoices: formData.canCreateInvoices,
            },

            // Status
            status: formData.status,

            // Notes
            notes: formData.notes || undefined,
        }

        createStaff(staffData, {
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD */}
                <ProductivityHero badge="فريق العمل" title="إضافة موظف جديد" type="staff" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>

                            {/* PERSONAL INFO CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        المعلومات الشخصية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Names */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                الاسم الأول <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                placeholder="أحمد"
                                                className="rounded-xl border-slate-200"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => handleChange('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم الأوسط</Label>
                                            <Input
                                                placeholder="محمد"
                                                className="rounded-xl border-slate-200"
                                                value={formData.middleName}
                                                onChange={(e) => handleChange('middleName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                الاسم الأخير <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                placeholder="الشمري"
                                                className="rounded-xl border-slate-200"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => handleChange('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم المفضل</Label>
                                            <Input
                                                placeholder="أبو محمد"
                                                className="rounded-xl border-slate-200"
                                                value={formData.preferredName}
                                                onChange={(e) => handleChange('preferredName', e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500">ما يفضل أن يُنادى به</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الجنس</Label>
                                            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">ذكر</SelectItem>
                                                    <SelectItem value="female">أنثى</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CONTACT INFO CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الاتصال
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                البريد الإلكتروني (العمل) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="email"
                                                placeholder="ahmed@lawfirm.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                required
                                                value={formData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">البريد الإلكتروني (الشخصي)</Label>
                                            <Input
                                                type="email"
                                                placeholder="ahmed@personal.com"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.personalEmail}
                                                onChange={(e) => handleChange('personalEmail', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم الهاتف (العمل)</Label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم الهاتف (الشخصي)</Label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.personalPhone}
                                                onChange={(e) => handleChange('personalPhone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">واتساب</Label>
                                            <Input
                                                placeholder="+966 5XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.whatsApp}
                                                onChange={(e) => handleChange('whatsApp', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EMPLOYMENT CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        المعلومات الوظيفية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Role Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-700">الدور الوظيفي <span className="text-red-500">*</span></Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {STAFF_ROLES.slice(0, 8).map((role) => {
                                                const Icon = role.icon
                                                return (
                                                    <button
                                                        key={role.value}
                                                        type="button"
                                                        onClick={() => handleChange('role', role.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                                                            formData.role === role.value
                                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                        )}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-xs font-medium">{role.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>نوع التوظيف</Label>
                                            <Select value={formData.employmentType} onValueChange={(v) => handleChange('employmentType', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EMPLOYMENT_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>القسم</Label>
                                            <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر القسم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DEPARTMENTS.map(d => (
                                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المسمى الوظيفي</Label>
                                            <Input
                                                placeholder="محامي أول"
                                                className="rounded-xl border-slate-200"
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>تاريخ التعيين</Label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200"
                                                value={formData.hireDate}
                                                onChange={(e) => handleChange('hireDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>تاريخ بدء العمل</Label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200"
                                                value={formData.startDate}
                                                onChange={(e) => handleChange('startDate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>نهاية فترة التجربة</Label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200"
                                                value={formData.probationEndDate}
                                                onChange={(e) => handleChange('probationEndDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>رقم الموظف</Label>
                                            <Input
                                                placeholder="EMP-001"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.employeeId}
                                                onChange={(e) => handleChange('employeeId', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>المدير المباشر</Label>
                                            <Input
                                                placeholder="اسم المدير"
                                                className="rounded-xl border-slate-200"
                                                value={formData.reportsTo}
                                                onChange={(e) => handleChange('reportsTo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BAR & LICENSING CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Scale className="w-5 h-5 text-emerald-500" />
                                        الترخيص القانوني
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={formData.isLicensedAttorney}
                                            onCheckedChange={(v) => handleChange('isLicensedAttorney', v)}
                                        />
                                        <Label className="font-medium">محامي مرخص</Label>
                                    </div>

                                    {formData.isLicensedAttorney && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>رقم الترخيص (الرقم المهني)</Label>
                                                    <Input
                                                        placeholder="1234567890"
                                                        dir="ltr"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.barNumber}
                                                        onChange={(e) => handleChange('barNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>جهة الترخيص</Label>
                                                    <Input
                                                        placeholder="الهيئة السعودية للمحامين"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.barJurisdiction}
                                                        onChange={(e) => handleChange('barJurisdiction', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>تاريخ الترخيص</Label>
                                                    <Input
                                                        type="date"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.barAdmissionDate}
                                                        onChange={(e) => handleChange('barAdmissionDate', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>تاريخ انتهاء الترخيص</Label>
                                                    <Input
                                                        type="date"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.barExpiryDate}
                                                        onChange={(e) => handleChange('barExpiryDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* PRACTICE AREAS CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-emerald-500" />
                                        مجالات الممارسة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>مجال التخصص الرئيسي</Label>
                                        <Select value={formData.primaryPracticeArea} onValueChange={(v) => handleChange('primaryPracticeArea', v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue placeholder="اختر التخصص الرئيسي" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRACTICE_AREAS.map(p => (
                                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>مجالات الممارسة (يمكن اختيار أكثر من مجال)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {PRACTICE_AREAS.map(area => (
                                                <Badge
                                                    key={area.value}
                                                    variant={formData.practiceAreas.includes(area.value) ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer transition-all",
                                                        formData.practiceAreas.includes(area.value)
                                                            ? "bg-emerald-500 hover:bg-emerald-600"
                                                            : "hover:bg-slate-100"
                                                    )}
                                                    onClick={() => togglePracticeArea(area.value)}
                                                >
                                                    {area.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BILLING CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                        الفوترة والأتعاب
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>نوع الفوترة</Label>
                                            <Select value={formData.billingType} onValueChange={(v) => handleChange('billingType', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BILLING_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>السعر بالساعة (ر.س)</Label>
                                            <Input
                                                type="number"
                                                placeholder="500"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.hourlyRate}
                                                onChange={(e) => handleChange('hourlyRate', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>الساعات المستهدفة (شهرياً)</Label>
                                            <Input
                                                type="number"
                                                placeholder="160"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.targetHours}
                                                onChange={(e) => handleChange('targetHours', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={formData.canBillClients}
                                            onCheckedChange={(v) => handleChange('canBillClients', v)}
                                        />
                                        <Label>يمكنه فوترة العملاء</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTIONS */}
                            <Accordion type="multiple" className="mb-6">
                                {/* Identification */}
                                <AccordionItem value="identification" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-slate-500" />
                                            <span className="font-semibold">الهوية والتعريف</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>رقم الهوية الوطنية</Label>
                                                <Input
                                                    placeholder="10 أرقام"
                                                    dir="ltr"
                                                    maxLength={10}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.nationalId}
                                                    onChange={(e) => handleChange('nationalId', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>تاريخ الميلاد</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>رقم الإقامة</Label>
                                                <Input
                                                    placeholder="للمقيمين"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.iqamaNumber}
                                                    onChange={(e) => handleChange('iqamaNumber', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>تاريخ انتهاء الإقامة</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.iqamaExpiry}
                                                    onChange={(e) => handleChange('iqamaExpiry', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>الجنسية</Label>
                                                <Input
                                                    placeholder="سعودي"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.nationality}
                                                    onChange={(e) => handleChange('nationality', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Education */}
                                <AccordionItem value="education" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-slate-500" />
                                            <span className="font-semibold">التعليم والشهادات</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>المستوى التعليمي</Label>
                                                <Select value={formData.educationLevel} onValueChange={(v) => handleChange('educationLevel', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EDUCATION_LEVELS.map(l => (
                                                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الجامعة</Label>
                                                <Input
                                                    placeholder="جامعة الملك سعود"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.university}
                                                    onChange={(e) => handleChange('university', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>سنة التخرج</Label>
                                                <Input
                                                    placeholder="2020"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.graduationYear}
                                                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="space-y-3">
                                            <Label>الشهادات المهنية</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {formData.certifications.map(cert => (
                                                    <Badge key={cert} variant="secondary" className="gap-1">
                                                        {cert}
                                                        <button type="button" onClick={() => removeCertification(cert)} className="hover:text-red-500">
                                                            <X className="w-3 h-3" aria-hidden="true" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="أضف شهادة..."
                                                    className="rounded-xl border-slate-200 flex-1"
                                                    value={certInput}
                                                    onChange={(e) => setCertInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addCertification()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="outline" onClick={addCertification} className="rounded-xl">
                                                    <Plus className="w-4 h-4" aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Emergency Contact */}
                                <AccordionItem value="emergency" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden="true" />
                                            <span className="font-semibold">جهة اتصال الطوارئ</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>الاسم</Label>
                                                <Input
                                                    placeholder="محمد الشمري"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.emergencyContactName}
                                                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>صلة القرابة</Label>
                                                <Input
                                                    placeholder="أخ / زوج / والد"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.emergencyContactRelation}
                                                    onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>رقم الهاتف</Label>
                                                <Input
                                                    placeholder="+966 5XX XXX XXXX"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.emergencyContactPhone}
                                                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Permissions */}
                                {canManagePermissions && (
                                    <AccordionItem value="permissions" className="border rounded-xl mb-2 px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-slate-500" />
                                                <span className="font-semibold">الصلاحيات</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pb-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={formData.canAccessAllCases}
                                                        onCheckedChange={(v) => handleChange('canAccessAllCases', v)}
                                                    />
                                                    <Label>الوصول لجميع القضايا</Label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={formData.canAccessFinancials}
                                                        onCheckedChange={(v) => handleChange('canAccessFinancials', v)}
                                                    />
                                                    <Label>الوصول للبيانات المالية</Label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={formData.canApproveTimeEntries}
                                                        onCheckedChange={(v) => handleChange('canApproveTimeEntries', v)}
                                                    />
                                                    <Label>اعتماد إدخالات الوقت</Label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={formData.canCreateInvoices}
                                                        onCheckedChange={(v) => handleChange('canCreateInvoices', v)}
                                                    />
                                                    <Label>إنشاء الفواتير</Label>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>

                            {/* STATUS & NOTES CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        الحالة والملاحظات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>الحالة</Label>
                                        <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STAFF_STATUSES.map(s => (
                                                    <SelectItem key={s.value} value={s.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("w-2 h-2 rounded-full", s.color)} />
                                                            {s.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>ملاحظات</Label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية..."
                                            className="min-h-[100px] rounded-xl border-slate-200"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <Link to="/dashboard/staff">
                                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                        <X className="ms-2 h-4 w-4" aria-hidden="true" />
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            جاري الحفظ...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-4 h-4" aria-hidden="true" />
                                            حفظ الموظف
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Widgets */}
                    <ClientsSidebar context="staff" />
                </div>
            </Main>
        </>
    )
}
