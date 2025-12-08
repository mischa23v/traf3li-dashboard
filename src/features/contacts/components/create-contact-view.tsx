/**
 * Contact Form - Comprehensive Law Firm CRM
 *
 * Features:
 * - Full contact information with multiple emails/phones
 * - Saudi-specific identification (National ID, Iqama, Passport)
 * - Contact type & classification for legal work
 * - Conflict checking status
 * - Communication preferences
 * - Relationship to firm
 * - Organization linking
 * - Tags & categorization
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, User, Phone, Mail, Building2, MapPin, FileText, Loader2, Tag,
    Plus, X, Briefcase, Shield, Globe, Heart, AlertTriangle, CheckCircle,
    Users, MessageSquare, Calendar, Star, Lock, Eye, UserCheck, Scale,
    CreditCard, Hash, Flag, Bell, ChevronDown, ChevronUp, Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateContact } from '@/hooks/useContacts'
import { useOrganizations } from '@/hooks/useOrganizations'
import { cn } from '@/lib/utils'

// ==================== CONSTANTS ====================

const CONTACT_TYPES = [
    { value: 'individual', label: 'فرد', icon: User },
    { value: 'organization', label: 'منظمة', icon: Building2 },
    { value: 'court', label: 'محكمة', icon: Scale },
    { value: 'attorney', label: 'محامي', icon: Briefcase },
    { value: 'expert', label: 'خبير', icon: Star },
    { value: 'government', label: 'جهة حكومية', icon: Shield },
    { value: 'other', label: 'أخرى', icon: Users },
]

const PRIMARY_ROLES = [
    { value: 'client_contact', label: 'جهة اتصال عميل' },
    { value: 'opposing_party', label: 'الطرف المقابل' },
    { value: 'opposing_counsel', label: 'محامي الطرف المقابل' },
    { value: 'witness', label: 'شاهد' },
    { value: 'expert_witness', label: 'شاهد خبير' },
    { value: 'judge', label: 'قاضي' },
    { value: 'court_clerk', label: 'كاتب محكمة' },
    { value: 'mediator', label: 'وسيط' },
    { value: 'arbitrator', label: 'محكّم' },
    { value: 'referral_source', label: 'مصدر إحالة' },
    { value: 'vendor', label: 'مورد' },
    { value: 'other', label: 'أخرى' },
]

const RELATIONSHIP_TYPES = [
    { value: 'current_client', label: 'عميل حالي' },
    { value: 'former_client', label: 'عميل سابق' },
    { value: 'prospect', label: 'عميل محتمل' },
    { value: 'adverse_party', label: 'طرف معادي' },
    { value: 'related_party', label: 'طرف مرتبط' },
    { value: 'referral_source', label: 'مصدر إحالة' },
    { value: 'business_contact', label: 'جهة اتصال عمل' },
    { value: 'personal_contact', label: 'جهة اتصال شخصية' },
]

const SALUTATIONS = [
    { value: 'none', label: 'بدون' },
    { value: 'mr', label: 'السيد' },
    { value: 'mrs', label: 'السيدة' },
    { value: 'ms', label: 'الآنسة' },
    { value: 'dr', label: 'د.' },
    { value: 'eng', label: 'م.' },
    { value: 'prof', label: 'أ.د.' },
    { value: 'sheikh', label: 'الشيخ' },
    { value: 'his_excellency', label: 'معالي' },
]

const CONTACT_STATUSES = [
    { value: 'active', label: 'نشط', color: 'bg-emerald-500' },
    { value: 'inactive', label: 'غير نشط', color: 'bg-gray-500' },
    { value: 'archived', label: 'مؤرشف', color: 'bg-slate-500' },
    { value: 'deceased', label: 'متوفي', color: 'bg-red-500' },
]

const CONFLICT_STATUSES = [
    { value: 'not_checked', label: 'لم يتم الفحص', color: 'bg-gray-400', icon: AlertTriangle },
    { value: 'clear', label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-500', icon: CheckCircle },
    { value: 'potential_conflict', label: 'تعارض محتمل', color: 'bg-yellow-500', icon: AlertTriangle },
    { value: 'confirmed_conflict', label: 'تعارض مؤكد', color: 'bg-red-500', icon: Shield },
]

const PREFERRED_CONTACT_METHODS = [
    { value: 'email', label: 'البريد الإلكتروني', icon: Mail },
    { value: 'phone', label: 'الهاتف', icon: Phone },
    { value: 'sms', label: 'رسالة نصية', icon: MessageSquare },
    { value: 'whatsapp', label: 'واتساب', icon: MessageSquare },
    { value: 'in_person', label: 'شخصياً', icon: User },
]

const LANGUAGES = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'الإنجليزية' },
]

const PRIORITIES = [
    { value: 'low', label: 'منخفضة', color: 'text-gray-500' },
    { value: 'normal', label: 'عادية', color: 'text-blue-500' },
    { value: 'high', label: 'عالية', color: 'text-orange-500' },
    { value: 'vip', label: 'VIP', color: 'text-purple-500' },
]

const PHONE_TYPES = [
    { value: 'mobile', label: 'جوال' },
    { value: 'work', label: 'عمل' },
    { value: 'home', label: 'منزل' },
    { value: 'fax', label: 'فاكس' },
    { value: 'other', label: 'أخرى' },
]

const EMAIL_TYPES = [
    { value: 'work', label: 'عمل' },
    { value: 'personal', label: 'شخصي' },
    { value: 'other', label: 'أخرى' },
]

// ==================== COMPONENT ====================

export function CreateContactView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { mutate: createContact, isPending } = useCreateContact()
    const { data: organizationsData } = useOrganizations()

    // Form state
    const [formData, setFormData] = useState({
        // Basic Info
        salutation: 'none',
        firstName: '',
        middleName: '',
        lastName: '',
        preferredName: '',
        suffix: '',
        fullNameArabic: '',

        // Type & Classification
        contactType: 'individual',
        primaryRole: '',
        relationshipTypes: [] as string[],

        // Contact Information - Multiple entries
        emails: [{ type: 'work', email: '', isPrimary: true, canContact: true }],
        phones: [{ type: 'mobile', number: '', countryCode: '+966', isPrimary: true, canSMS: true, canWhatsApp: true }],

        // Employment/Affiliation
        company: '',
        organizationId: '',
        jobTitle: '',
        department: '',

        // Identification (Saudi specific)
        nationalId: '',
        iqamaNumber: '',
        passportNumber: '',
        passportCountry: '',
        dateOfBirth: '',
        nationality: 'سعودي',

        // Address
        addressType: 'work',
        street: '',
        buildingNumber: '',
        district: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'المملكة العربية السعودية',

        // Communication Preferences
        preferredLanguage: 'ar',
        preferredContactMethod: 'phone',
        bestTimeToContact: '',
        doNotContact: false,
        doNotEmail: false,
        doNotCall: false,
        doNotSMS: false,

        // Conflict Check
        conflictCheckStatus: 'not_checked',
        conflictNotes: '',

        // Status & Priority
        status: 'active',
        priority: 'normal',
        vipStatus: false,

        // Tags
        tags: [] as string[],
        practiceAreas: [] as string[],

        // Notes
        notes: '',

        // Risk
        riskLevel: 'low',
        isBlacklisted: false,
        blacklistReason: '',
    })

    // Tags input
    const [tagInput, setTagInput] = useState('')

    // Handle form changes
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle emails
    const addEmail = () => {
        setFormData(prev => ({
            ...prev,
            emails: [...prev.emails, { type: 'work', email: '', isPrimary: false, canContact: true }]
        }))
    }

    const removeEmail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            emails: prev.emails.filter((_, i) => i !== index)
        }))
    }

    const updateEmail = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            emails: prev.emails.map((e, i) => i === index ? { ...e, [field]: value } : e)
        }))
    }

    // Handle phones
    const addPhone = () => {
        setFormData(prev => ({
            ...prev,
            phones: [...prev.phones, { type: 'mobile', number: '', countryCode: '+966', isPrimary: false, canSMS: true, canWhatsApp: true }]
        }))
    }

    const removePhone = (index: number) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.filter((_, i) => i !== index)
        }))
    }

    const updatePhone = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.map((p, i) => i === index ? { ...p, [field]: value } : p)
        }))
    }

    // Handle tags
    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleChange('tags', [...formData.tags, tagInput.trim()])
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        handleChange('tags', formData.tags.filter(t => t !== tag))
    }

    // Toggle relationship type
    const toggleRelationshipType = (type: string) => {
        const current = formData.relationshipTypes
        if (current.includes(type)) {
            handleChange('relationshipTypes', current.filter(t => t !== type))
        } else {
            handleChange('relationshipTypes', [...current, type])
        }
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const contactData = {
            // Basic
            salutation: formData.salutation === 'none' ? undefined : formData.salutation,
            firstName: formData.firstName,
            middleName: formData.middleName || undefined,
            lastName: formData.lastName,
            preferredName: formData.preferredName || undefined,
            suffix: formData.suffix || undefined,
            fullNameArabic: formData.fullNameArabic || undefined,

            // Type
            type: formData.contactType,
            primaryRole: formData.primaryRole || undefined,
            relationshipTypes: formData.relationshipTypes.length > 0 ? formData.relationshipTypes : undefined,

            // Contact
            email: formData.emails.find(e => e.isPrimary)?.email || formData.emails[0]?.email,
            phone: formData.phones.find(p => p.isPrimary)?.number || formData.phones[0]?.number,
            emails: formData.emails.filter(e => e.email),
            phones: formData.phones.filter(p => p.number),

            // Employment
            company: formData.company || undefined,
            organizationId: formData.organizationId || undefined,
            title: formData.jobTitle || undefined,
            department: formData.department || undefined,

            // Identification
            nationalId: formData.nationalId || undefined,
            iqamaNumber: formData.iqamaNumber || undefined,
            passportNumber: formData.passportNumber || undefined,
            passportCountry: formData.passportCountry || undefined,
            dateOfBirth: formData.dateOfBirth || undefined,
            nationality: formData.nationality || undefined,

            // Address
            address: formData.street || undefined,
            buildingNumber: formData.buildingNumber || undefined,
            district: formData.district || undefined,
            city: formData.city || undefined,
            province: formData.province || undefined,
            postalCode: formData.postalCode || undefined,
            country: formData.country || undefined,

            // Communication
            preferredLanguage: formData.preferredLanguage,
            preferredContactMethod: formData.preferredContactMethod,
            bestTimeToContact: formData.bestTimeToContact || undefined,
            doNotContact: formData.doNotContact,
            doNotEmail: formData.doNotEmail,
            doNotCall: formData.doNotCall,
            doNotSMS: formData.doNotSMS,

            // Conflict
            conflictCheckStatus: formData.conflictCheckStatus,
            conflictNotes: formData.conflictNotes || undefined,

            // Status
            status: formData.status,
            priority: formData.priority,
            vipStatus: formData.vipStatus,

            // Tags
            tags: formData.tags.length > 0 ? formData.tags : undefined,
            practiceAreas: formData.practiceAreas.length > 0 ? formData.practiceAreas : undefined,

            // Notes
            notes: formData.notes || undefined,

            // Risk
            riskLevel: formData.riskLevel,
            isBlacklisted: formData.isBlacklisted,
            blacklistReason: formData.blacklistReason || undefined,
        }

        createContact(contactData, {
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
                {/* HERO CARD */}
                <ProductivityHero badge="جهات الاتصال" title="إنشاء جهة اتصال" type="contacts" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>

                            {/* BASIC INFO CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        المعلومات الأساسية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Name Row 1 */}
                                    <div className="grid grid-cols-6 gap-4">
                                        <div className="col-span-1 space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">اللقب</Label>
                                            <Select value={formData.salutation} onValueChange={(v) => handleChange('salutation', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SALUTATIONS.map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
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
                                        <div className="col-span-1 space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم الأوسط</Label>
                                            <Input
                                                placeholder="محمد"
                                                className="rounded-xl border-slate-200"
                                                value={formData.middleName}
                                                onChange={(e) => handleChange('middleName', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
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

                                    {/* Name Row 2 */}
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
                                            <Label className="text-sm font-medium text-slate-700">الاسم الكامل بالعربية</Label>
                                            <Input
                                                placeholder="أحمد محمد الشمري"
                                                className="rounded-xl border-slate-200"
                                                value={formData.fullNameArabic}
                                                onChange={(e) => handleChange('fullNameArabic', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* TYPE & CLASSIFICATION CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-emerald-500" />
                                        النوع والتصنيف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Contact Type */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-700">نوع جهة الاتصال <span className="text-red-500">*</span></Label>
                                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                            {CONTACT_TYPES.map((type) => {
                                                const Icon = type.icon
                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => handleChange('contactType', type.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                                                            formData.contactType === type.value
                                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                                                        )}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-xs font-medium">{type.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Primary Role */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الدور الأساسي</Label>
                                            <Select value={formData.primaryRole} onValueChange={(v) => handleChange('primaryRole', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الدور" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIMARY_ROLES.map(r => (
                                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الأولوية</Label>
                                            <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الأولوية" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRIORITIES.map(p => (
                                                        <SelectItem key={p.value} value={p.value}>
                                                            <span className={p.color}>{p.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Relationship to Firm */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-700">العلاقة بالمكتب (يمكن اختيار أكثر من خيار)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {RELATIONSHIP_TYPES.map(rt => (
                                                <Badge
                                                    key={rt.value}
                                                    variant={formData.relationshipTypes.includes(rt.value) ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer transition-all",
                                                        formData.relationshipTypes.includes(rt.value)
                                                            ? "bg-emerald-500 hover:bg-emerald-600"
                                                            : "hover:bg-slate-100"
                                                    )}
                                                    onClick={() => toggleRelationshipType(rt.value)}
                                                >
                                                    {rt.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* CONTACT INFORMATION CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الاتصال
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Emails */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-slate-700">البريد الإلكتروني<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addEmail} className="text-emerald-600">
                                                <Plus className="w-4 h-4 ms-1" aria-hidden="true" /> إضافة
                                            </Button>
                                        </div>
                                        {formData.emails.map((email, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <Select value={email.type} onValueChange={(v) => updateEmail(index, 'type', v)}>
                                                    <SelectTrigger className="w-24 rounded-xl border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EMAIL_TYPES.map(t => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="email"
                                                    placeholder="example@email.com"
                                                    dir="ltr"
                                                    className="flex-1 rounded-xl border-slate-200"
                                                    value={email.email}
                                                    onChange={(e) => updateEmail(index, 'email', e.target.value)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-1 text-xs text-slate-500">
                                                        <input
                                                            type="checkbox"
                                                            checked={email.isPrimary}
                                                            onChange={(e) => updateEmail(index, 'isPrimary', e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        رئيسي
                                                    </label>
                                                </div>
                                                {formData.emails.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)} className="text-red-500">
                                                        <X className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Phones */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-slate-700">رقم الهاتف<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addPhone} className="text-emerald-600">
                                                <Plus className="w-4 h-4 ms-1" aria-hidden="true" /> إضافة
                                            </Button>
                                        </div>
                                        {formData.phones.map((phone, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex gap-2 items-start">
                                                    <Select value={phone.type} onValueChange={(v) => updatePhone(index, 'type', v)}>
                                                        <SelectTrigger className="w-24 rounded-xl border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PHONE_TYPES.map(t => (
                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder="5XX XXX XXXX"
                                                        dir="ltr"
                                                        className="flex-1 rounded-xl border-slate-200"
                                                        value={phone.number}
                                                        onChange={(e) => updatePhone(index, 'number', e.target.value)}
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-1 text-xs text-slate-500">
                                                            <input
                                                                type="checkbox"
                                                                checked={phone.isPrimary}
                                                                onChange={(e) => updatePhone(index, 'isPrimary', e.target.checked)}
                                                                className="rounded"
                                                            />
                                                            رئيسي
                                                        </label>
                                                        <label className="flex items-center gap-1 text-xs text-slate-500">
                                                            <input
                                                                type="checkbox"
                                                                checked={phone.canWhatsApp}
                                                                onChange={(e) => updatePhone(index, 'canWhatsApp', e.target.checked)}
                                                                className="rounded"
                                                            />
                                                            واتساب
                                                        </label>
                                                    </div>
                                                    {formData.phones.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)} className="text-red-500">
                                                            <X className="w-4 h-4" aria-hidden="true" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* EMPLOYMENT CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        العمل والانتماء
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الشركة / الجهة</Label>
                                            <Input
                                                placeholder="اسم الشركة"
                                                className="rounded-xl border-slate-200"
                                                value={formData.company}
                                                onChange={(e) => handleChange('company', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">ربط بمنظمة</Label>
                                            <Select value={formData.organizationId} onValueChange={(v) => handleChange('organizationId', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر منظمة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {organizationsData?.data?.filter((org: any) => org._id)?.map((org: any) => (
                                                        <SelectItem key={org._id} value={org._id}>
                                                            {org.nameAr || org.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">المسمى الوظيفي</Label>
                                            <Input
                                                placeholder="مدير تنفيذي"
                                                className="rounded-xl border-slate-200"
                                                value={formData.jobTitle}
                                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">القسم</Label>
                                            <Input
                                                placeholder="الشؤون القانونية"
                                                className="rounded-xl border-slate-200"
                                                value={formData.department}
                                                onChange={(e) => handleChange('department', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTIONS (Accordion) */}
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
                                                <Label>رقم الهوية الوطنية<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
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
                                                <Label>رقم الإقامة</Label>
                                                <Input
                                                    placeholder="للمقيمين"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.iqamaNumber}
                                                    onChange={(e) => handleChange('iqamaNumber', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>رقم جواز السفر<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                                                <Input
                                                    placeholder="رقم الجواز"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.passportNumber}
                                                    onChange={(e) => handleChange('passportNumber', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>دولة الجواز</Label>
                                                <Input
                                                    placeholder="السعودية"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.passportCountry}
                                                    onChange={(e) => handleChange('passportCountry', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>تاريخ الميلاد</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                />
                                            </div>
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

                                {/* Address */}
                                <AccordionItem value="address" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            <span className="font-semibold">العنوان</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2 space-y-2">
                                                <Label>الشارع</Label>
                                                <Input
                                                    placeholder="شارع الملك فهد"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.street}
                                                    onChange={(e) => handleChange('street', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>رقم المبنى</Label>
                                                <Input
                                                    placeholder="1234"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.buildingNumber}
                                                    onChange={(e) => handleChange('buildingNumber', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>الحي</Label>
                                                <Input
                                                    placeholder="العليا"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.district}
                                                    onChange={(e) => handleChange('district', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>المدينة</Label>
                                                <Input
                                                    placeholder="الرياض"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.city}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>المنطقة</Label>
                                                <Input
                                                    placeholder="منطقة الرياض"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.province}
                                                    onChange={(e) => handleChange('province', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الرمز البريدي</Label>
                                                <Input
                                                    placeholder="12345"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.postalCode}
                                                    onChange={(e) => handleChange('postalCode', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>الدولة</Label>
                                                <Input
                                                    placeholder="المملكة العربية السعودية"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.country}
                                                    onChange={(e) => handleChange('country', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Communication Preferences */}
                                <AccordionItem value="communication" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-slate-500" />
                                            <span className="font-semibold">تفضيلات التواصل</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>اللغة المفضلة</Label>
                                                <Select value={formData.preferredLanguage} onValueChange={(v) => handleChange('preferredLanguage', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LANGUAGES.map(l => (
                                                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>طريقة التواصل المفضلة</Label>
                                                <Select value={formData.preferredContactMethod} onValueChange={(v) => handleChange('preferredContactMethod', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PREFERRED_CONTACT_METHODS.map(m => (
                                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>أفضل وقت للتواصل</Label>
                                            <Input
                                                placeholder="صباحاً من 9 إلى 12"
                                                className="rounded-xl border-slate-200"
                                                value={formData.bestTimeToContact}
                                                onChange={(e) => handleChange('bestTimeToContact', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={formData.doNotContact}
                                                    onCheckedChange={(v) => handleChange('doNotContact', v)}
                                                />
                                                <Label className="text-red-600">عدم التواصل نهائياً</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={formData.doNotEmail}
                                                    onCheckedChange={(v) => handleChange('doNotEmail', v)}
                                                />
                                                <Label>عدم إرسال بريد إلكتروني</Label>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Conflict Check */}
                                <AccordionItem value="conflict" className="border rounded-xl mb-2 px-4 border-orange-200">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-orange-500" />
                                            <span className="font-semibold text-orange-700">فحص تعارض المصالح</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <Alert className="bg-orange-50 border-orange-200">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
                                            <AlertDescription className="text-orange-700">
                                                يجب فحص تعارض المصالح قبل قبول أي قضية جديدة
                                            </AlertDescription>
                                        </Alert>
                                        <div className="space-y-3">
                                            <Label>حالة فحص التعارض</Label>
                                            <RadioGroup
                                                value={formData.conflictCheckStatus}
                                                onValueChange={(v) => handleChange('conflictCheckStatus', v)}
                                                className="grid grid-cols-2 gap-3"
                                            >
                                                {CONFLICT_STATUSES.map((status) => {
                                                    const Icon = status.icon
                                                    return (
                                                        <div key={status.value} className="relative">
                                                            <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={status.value}
                                                                className={cn(
                                                                    "flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all",
                                                                    "hover:bg-slate-50 peer-data-[state=checked]:border-current",
                                                                    status.value === 'clear' && "peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50",
                                                                    status.value === 'potential_conflict' && "peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-50",
                                                                    status.value === 'confirmed_conflict' && "peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50",
                                                                    status.value === 'not_checked' && "peer-data-[state=checked]:border-gray-400 peer-data-[state=checked]:bg-gray-50"
                                                                )}
                                                            >
                                                                <Icon className={cn("w-4 h-4", status.color.replace('bg-', 'text-'))} />
                                                                <span className="text-sm">{status.label}</span>
                                                            </Label>
                                                        </div>
                                                    )
                                                })}
                                            </RadioGroup>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>ملاحظات التعارض</Label>
                                            <Textarea
                                                placeholder="أدخل ملاحظات فحص التعارض..."
                                                className="min-h-[80px] rounded-xl border-slate-200"
                                                value={formData.conflictNotes}
                                                onChange={(e) => handleChange('conflictNotes', e.target.value)}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* STATUS & TAGS CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        الحالة والوسوم
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>الحالة</Label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CONTACT_STATUSES.map(s => (
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
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={formData.vipStatus}
                                                    onCheckedChange={(v) => handleChange('vipStatus', v)}
                                                />
                                                <Label className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    عميل VIP
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-3">
                                        <Label>الوسوم</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                        <X className="w-3 h-3" aria-hidden="true" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="أضف وسم..."
                                                className="rounded-xl border-slate-200 flex-1"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault()
                                                        addTag()
                                                    }
                                                }}
                                            />
                                            <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label>ملاحظات</Label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية..."
                                            className="min-h-[120px] rounded-xl border-slate-200"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <Link to="/dashboard/contacts">
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
                                            حفظ جهة الاتصال
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Widgets */}
                    <ClientsSidebar context="contacts" />
                </div>
            </Main>
        </>
    )
}
