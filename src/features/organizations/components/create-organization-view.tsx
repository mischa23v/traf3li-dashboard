/**
 * Organization Form - Comprehensive Law Firm CRM
 *
 * Features:
 * - Full legal entity information (Arabic/English names)
 * - Commercial registration with expiry tracking
 * - VAT/Tax registration
 * - Multiple key contacts
 * - Parent/subsidiary relationships
 * - Shareholders and board members
 * - Conflict checking
 * - Industry categorization
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, Building2, Phone, Mail, MapPin, FileText, Loader2, Tag,
    Plus, X, Globe, Hash, Users, Shield, AlertTriangle, CheckCircle,
    Calendar, Star, CreditCard, Scale, Link as LinkIcon, Briefcase,
    ChevronDown, ChevronUp, Percent, Building, UserCheck
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
import { useCreateOrganization } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { cn } from '@/lib/utils'

// ==================== CONSTANTS ====================

const ORGANIZATION_TYPES = [
    { value: 'company', label: 'شركة', icon: Building2 },
    { value: 'government', label: 'جهة حكومية', icon: Shield },
    { value: 'court', label: 'محكمة', icon: Scale },
    { value: 'law_firm', label: 'مكتب محاماة', icon: Briefcase },
    { value: 'non_profit', label: 'منظمة غير ربحية', icon: Users },
    { value: 'partnership', label: 'شراكة', icon: Users },
    { value: 'sole_proprietorship', label: 'مؤسسة فردية', icon: Building },
    { value: 'other', label: 'أخرى', icon: Building2 },
]

const LEGAL_STRUCTURES = [
    { value: 'llc', label: 'شركة ذات مسؤولية محدودة' },
    { value: 'jsc', label: 'شركة مساهمة' },
    { value: 'closed_jsc', label: 'شركة مساهمة مقفلة' },
    { value: 'partnership', label: 'شركة تضامن' },
    { value: 'limited_partnership', label: 'شركة توصية بسيطة' },
    { value: 'sole_proprietorship', label: 'مؤسسة فردية' },
    { value: 'professional_company', label: 'شركة مهنية' },
    { value: 'foreign_branch', label: 'فرع شركة أجنبية' },
    { value: 'government_entity', label: 'جهة حكومية' },
    { value: 'non_profit', label: 'منظمة غير ربحية' },
    { value: 'other', label: 'أخرى' },
]

const INDUSTRIES = [
    { value: 'technology', label: 'التقنية والمعلومات' },
    { value: 'finance', label: 'الخدمات المالية والمصرفية' },
    { value: 'healthcare', label: 'الرعاية الصحية' },
    { value: 'real_estate', label: 'العقارات والتطوير' },
    { value: 'construction', label: 'البناء والمقاولات' },
    { value: 'energy', label: 'الطاقة والبترول' },
    { value: 'retail', label: 'التجزئة والتجارة' },
    { value: 'manufacturing', label: 'التصنيع' },
    { value: 'education', label: 'التعليم' },
    { value: 'hospitality', label: 'الضيافة والسياحة' },
    { value: 'telecom', label: 'الاتصالات' },
    { value: 'transport', label: 'النقل والخدمات اللوجستية' },
    { value: 'media', label: 'الإعلام والترفيه' },
    { value: 'legal', label: 'الخدمات القانونية' },
    { value: 'consulting', label: 'الاستشارات' },
    { value: 'government', label: 'القطاع الحكومي' },
    { value: 'other', label: 'أخرى' },
]

const ORGANIZATION_SIZES = [
    { value: 'micro', label: 'صغيرة جداً (1-10)' },
    { value: 'small', label: 'صغيرة (11-50)' },
    { value: 'medium', label: 'متوسطة (51-200)' },
    { value: 'large', label: 'كبيرة (201-1000)' },
    { value: 'enterprise', label: 'مؤسسة كبرى (1000+)' },
]

const ORGANIZATION_STATUSES = [
    { value: 'active', label: 'نشطة', color: 'bg-emerald-500' },
    { value: 'inactive', label: 'غير نشطة', color: 'bg-gray-500' },
    { value: 'dissolved', label: 'منحلة', color: 'bg-red-500' },
    { value: 'archived', label: 'مؤرشفة', color: 'bg-slate-500' },
]

const RELATIONSHIP_TYPES = [
    { value: 'client', label: 'عميل' },
    { value: 'former_client', label: 'عميل سابق' },
    { value: 'prospect', label: 'عميل محتمل' },
    { value: 'opposing_party', label: 'طرف مقابل' },
    { value: 'referral_source', label: 'مصدر إحالة' },
    { value: 'vendor', label: 'مورد' },
    { value: 'partner', label: 'شريك' },
    { value: 'co_counsel', label: 'محامي مشارك' },
]

const CONFLICT_STATUSES = [
    { value: 'not_checked', label: 'لم يتم الفحص', color: 'bg-gray-400', icon: AlertTriangle },
    { value: 'clear', label: 'واضح - لا يوجد تعارض', color: 'bg-emerald-500', icon: CheckCircle },
    { value: 'potential_conflict', label: 'تعارض محتمل', color: 'bg-yellow-500', icon: AlertTriangle },
    { value: 'confirmed_conflict', label: 'تعارض مؤكد', color: 'bg-red-500', icon: Shield },
]

const PRIORITIES = [
    { value: 'low', label: 'منخفضة', color: 'text-gray-500' },
    { value: 'normal', label: 'عادية', color: 'text-blue-500' },
    { value: 'high', label: 'عالية', color: 'text-orange-500' },
    { value: 'vip', label: 'VIP', color: 'text-purple-500' },
]

const CONTACT_ROLES = [
    { value: 'primary_contact', label: 'جهة الاتصال الرئيسية' },
    { value: 'billing_contact', label: 'جهة اتصال الفواتير' },
    { value: 'legal_contact', label: 'جهة الاتصال القانونية' },
    { value: 'ceo', label: 'الرئيس التنفيذي' },
    { value: 'cfo', label: 'المدير المالي' },
    { value: 'legal_counsel', label: 'المستشار القانوني' },
    { value: 'other', label: 'أخرى' },
]

// ==================== COMPONENT ====================

export function CreateOrganizationView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { mutate: createOrganization, isPending } = useCreateOrganization()
    const { data: contactsData } = useContacts()

    // Form state
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        nameAr: '',
        tradeName: '',
        tradeNameAr: '',

        // Type & Classification
        type: 'company',
        legalStructure: '',
        industry: '',
        sector: '',
        size: '',

        // Registration (Saudi specific)
        commercialRegistration: '',
        crIssueDate: '',
        crExpiryDate: '',
        crIssuingAuthority: 'الرياض',

        vatNumber: '',
        taxRegistrationDate: '',

        licenseNumber: '',
        licenseType: '',
        licenseExpiryDate: '',

        // Contact Info
        mainPhone: '',
        fax: '',
        website: '',
        emails: [{ type: 'main', email: '', isPrimary: true }],

        // Address
        street: '',
        buildingNumber: '',
        district: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'المملكة العربية السعودية',

        // Key Contacts
        keyContacts: [] as Array<{ contactId: string; role: string; isPrimary: boolean }>,

        // Relationships
        relationshipTypes: [] as string[],
        parentOrganizationId: '',

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
            emails: [...prev.emails, { type: 'other', email: '', isPrimary: false }]
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

    // Handle key contacts
    const addKeyContact = () => {
        setFormData(prev => ({
            ...prev,
            keyContacts: [...prev.keyContacts, { contactId: '', role: 'primary_contact', isPrimary: prev.keyContacts.length === 0 }]
        }))
    }

    const removeKeyContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keyContacts: prev.keyContacts.filter((_, i) => i !== index)
        }))
    }

    const updateKeyContact = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            keyContacts: prev.keyContacts.map((c, i) => i === index ? { ...c, [field]: value } : c)
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

        const organizationData = {
            // Basic
            name: formData.name,
            nameAr: formData.nameAr || undefined,
            tradeName: formData.tradeName || undefined,
            tradeNameAr: formData.tradeNameAr || undefined,

            // Type
            type: formData.type,
            legalStructure: formData.legalStructure || undefined,
            industry: formData.industry || undefined,
            sector: formData.sector || undefined,
            size: formData.size || undefined,

            // Registration
            registrationNumber: formData.commercialRegistration || undefined,
            crIssueDate: formData.crIssueDate || undefined,
            crExpiryDate: formData.crExpiryDate || undefined,
            crIssuingAuthority: formData.crIssuingAuthority || undefined,
            vatNumber: formData.vatNumber || undefined,
            taxRegistrationDate: formData.taxRegistrationDate || undefined,
            licenseNumber: formData.licenseNumber || undefined,
            licenseType: formData.licenseType || undefined,
            licenseExpiryDate: formData.licenseExpiryDate || undefined,

            // Contact
            phone: formData.mainPhone || undefined,
            fax: formData.fax || undefined,
            website: formData.website || undefined,
            email: formData.emails.find(e => e.isPrimary)?.email || formData.emails[0]?.email,
            emails: formData.emails.filter(e => e.email),

            // Address
            address: formData.street || undefined,
            buildingNumber: formData.buildingNumber || undefined,
            district: formData.district || undefined,
            city: formData.city || undefined,
            province: formData.province || undefined,
            postalCode: formData.postalCode || undefined,
            country: formData.country || undefined,

            // Key Contacts
            keyContacts: formData.keyContacts.filter(c => c.contactId),

            // Relationships
            relationshipTypes: formData.relationshipTypes.length > 0 ? formData.relationshipTypes : undefined,
            parentOrganizationId: formData.parentOrganizationId || undefined,

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
        }

        createOrganization(organizationData, {
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD */}
                <ProductivityHero badge="المنظمات" title="إنشاء منظمة" type="organizations" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>

                            {/* BASIC INFO CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        المعلومات الأساسية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Names */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                الاسم القانوني (إنجليزي)
                                            </Label>
                                            <Input
                                                placeholder="Legal Company Name LLC"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم القانوني (عربي)</Label>
                                            <Input
                                                placeholder="شركة الاسم القانوني ذ.م.م"
                                                className="rounded-xl border-slate-200"
                                                value={formData.nameAr}
                                                onChange={(e) => handleChange('nameAr', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم التجاري (إنجليزي)</Label>
                                            <Input
                                                placeholder="Trade Name"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.tradeName}
                                                onChange={(e) => handleChange('tradeName', e.target.value)}
                                            />
                                            <p className="text-xs text-slate-500">الاسم المعروف به في السوق</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الاسم التجاري (عربي)</Label>
                                            <Input
                                                placeholder="الاسم التجاري"
                                                className="rounded-xl border-slate-200"
                                                value={formData.tradeNameAr}
                                                onChange={(e) => handleChange('tradeNameAr', e.target.value)}
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
                                    {/* Organization Type */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-slate-700">نوع المنظمة </Label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {ORGANIZATION_TYPES.map((type) => {
                                                const Icon = type.icon
                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => handleChange('type', type.value)}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                                                            formData.type === type.value
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الهيكل القانوني</Label>
                                            <Select value={formData.legalStructure} onValueChange={(v) => handleChange('legalStructure', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الهيكل" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LEGAL_STRUCTURES.map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">حجم المنظمة</Label>
                                            <Select value={formData.size} onValueChange={(v) => handleChange('size', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الحجم" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORGANIZATION_SIZES.map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">القطاع / الصناعة</Label>
                                            <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر الصناعة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INDUSTRIES.map(i => (
                                                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">القطاع الفرعي</Label>
                                            <Input
                                                placeholder="مثال: البرمجيات، التجزئة"
                                                className="rounded-xl border-slate-200"
                                                value={formData.sector}
                                                onChange={(e) => handleChange('sector', e.target.value)}
                                            />
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

                            {/* REGISTRATION CARD */}
                            <Card className="border-slate-200 mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-emerald-500" />
                                        معلومات التسجيل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Commercial Registration */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700">السجل التجاري</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>رقم السجل التجاري</Label>
                                                <Input
                                                    placeholder="10 أرقام"
                                                    dir="ltr"
                                                    maxLength={10}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.commercialRegistration}
                                                    onChange={(e) => handleChange('commercialRegistration', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>جهة الإصدار</Label>
                                                <Input
                                                    placeholder="الرياض"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.crIssuingAuthority}
                                                    onChange={(e) => handleChange('crIssuingAuthority', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>تاريخ الإصدار</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.crIssueDate}
                                                    onChange={(e) => handleChange('crIssueDate', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>تاريخ الانتهاء</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.crExpiryDate}
                                                    onChange={(e) => handleChange('crExpiryDate', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* VAT */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700">الرقم الضريبي</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>الرقم الضريبي (VAT)</Label>
                                                <Input
                                                    placeholder="15 رقم"
                                                    dir="ltr"
                                                    maxLength={15}
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.vatNumber}
                                                    onChange={(e) => handleChange('vatNumber', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>تاريخ التسجيل الضريبي</Label>
                                                <Input
                                                    type="date"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.taxRegistrationDate}
                                                    onChange={(e) => handleChange('taxRegistrationDate', e.target.value)}
                                                />
                                            </div>
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
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>رقم الهاتف الرئيسي</Label>
                                            <Input
                                                placeholder="+966 XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.mainPhone}
                                                onChange={(e) => handleChange('mainPhone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>رقم الفاكس</Label>
                                            <Input
                                                placeholder="+966 XX XXX XXXX"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.fax}
                                                onChange={(e) => handleChange('fax', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>الموقع الإلكتروني</Label>
                                        <Input
                                            placeholder="https://www.company.com"
                                            dir="ltr"
                                            className="rounded-xl border-slate-200"
                                            value={formData.website}
                                            onChange={(e) => handleChange('website', e.target.value)}
                                        />
                                    </div>

                                    {/* Emails */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium text-slate-700">البريد الإلكتروني</Label>
                                            <Button type="button" variant="ghost" size="sm" onClick={addEmail} className="text-emerald-600">
                                                <Plus className="w-4 h-4 ms-1" aria-hidden="true" /> إضافة
                                            </Button>
                                        </div>
                                        {formData.emails.map((email, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <Input
                                                    type="email"
                                                    placeholder="info@company.com"
                                                    dir="ltr"
                                                    className="flex-1 rounded-xl border-slate-200"
                                                    value={email.email}
                                                    onChange={(e) => updateEmail(index, 'email', e.target.value)}
                                                />
                                                <label className="flex items-center gap-1 text-xs text-slate-500">
                                                    <input
                                                        type="checkbox"
                                                        checked={email.isPrimary}
                                                        onChange={(e) => updateEmail(index, 'isPrimary', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    رئيسي
                                                </label>
                                                {formData.emails.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)} className="text-red-500">
                                                        <X className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTIONS */}
                            <Accordion type="multiple" className="mb-6">
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

                                {/* Key Contacts */}
                                <AccordionItem value="contacts" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            <span className="font-semibold">جهات الاتصال الرئيسية</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-4">
                                        <div className="flex justify-end">
                                            <Button type="button" variant="outline" size="sm" onClick={addKeyContact} className="text-emerald-600">
                                                <Plus className="w-4 h-4 ms-1" aria-hidden="true" /> إضافة جهة اتصال
                                            </Button>
                                        </div>
                                        {formData.keyContacts.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-4">لم تتم إضافة جهات اتصال بعد</p>
                                        ) : (
                                            formData.keyContacts.map((contact, index) => (
                                                <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl">
                                                    <Select value={contact.contactId} onValueChange={(v) => updateKeyContact(index, 'contactId', v)}>
                                                        <SelectTrigger className="flex-1 rounded-xl border-slate-200">
                                                            <SelectValue placeholder="اختر جهة الاتصال" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(contactsData?.data ?? contactsData?.contacts ?? [])?.map((c: any) => (
                                                                <SelectItem key={c._id} value={c._id}>
                                                                    {c.firstName} {c.lastName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Select value={contact.role} onValueChange={(v) => updateKeyContact(index, 'role', v)}>
                                                        <SelectTrigger className="w-48 rounded-xl border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CONTACT_ROLES.map(r => (
                                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <label className="flex items-center gap-1 text-xs text-slate-500">
                                                        <input
                                                            type="checkbox"
                                                            checked={contact.isPrimary}
                                                            onChange={(e) => updateKeyContact(index, 'isPrimary', e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        رئيسي
                                                    </label>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeKeyContact(index)} className="text-red-500">
                                                        <X className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
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
                                                يجب فحص تعارض المصالح قبل قبول أي عميل أو قضية جديدة
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
                                                            <RadioGroupItem value={status.value} id={`org-${status.value}`} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={`org-${status.value}`}
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
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>الحالة</Label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORGANIZATION_STATUSES.map(s => (
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
                                            <Label>الأولوية</Label>
                                            <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
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
                                        <div className="flex items-center gap-2 pt-6">
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
                                <Link to="/dashboard/organizations">
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
                                            حفظ المنظمة
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar Widgets */}
                    <ClientsSidebar context="organizations" />
                </div>
            </Main>
        </>
    )
}
