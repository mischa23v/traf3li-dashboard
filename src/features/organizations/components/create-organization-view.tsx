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
    ChevronDown, ChevronUp, Percent, Building, UserCheck, DollarSign,
    Banknote, TrendingUp, Award, FileCheck, Upload, Settings
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
import { ROUTES } from '@/constants/routes'

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
    { value: 'ceo', label: 'الرئيس التنفيذي / المالك' },
    { value: 'cfo', label: 'المدير المالي' },
    { value: 'legal_counsel', label: 'المستشار القانوني' },
    { value: 'hr_contact', label: 'جهة اتصال الموارد البشرية' },
    { value: 'finance_contact', label: 'جهة الاتصال المالية' },
    { value: 'other', label: 'أخرى' },
]

const ANNUAL_REVENUE_RANGES = [
    { value: 'under_1m', label: 'أقل من مليون ريال' },
    { value: '1m_5m', label: '1-5 مليون ريال' },
    { value: '5m_10m', label: '5-10 مليون ريال' },
    { value: '10m_50m', label: '10-50 مليون ريال' },
    { value: '50m_100m', label: '50-100 مليون ريال' },
    { value: '100m_500m', label: '100-500 مليون ريال' },
    { value: '500m_1b', label: '500 مليون - مليار ريال' },
    { value: 'over_1b', label: 'أكثر من مليار ريال' },
]

const CURRENCIES = [
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'GBP', label: 'جنيه إسترليني (GBP)' },
    { value: 'AED', label: 'درهم إماراتي (AED)' },
    { value: 'KWD', label: 'دينار كويتي (KWD)' },
]

const PAYMENT_TERMS = [
    { value: 'immediate', label: 'فوري' },
    { value: 'net_7', label: 'خلال 7 أيام' },
    { value: 'net_15', label: 'خلال 15 يوم' },
    { value: 'net_30', label: 'خلال 30 يوم' },
    { value: 'net_60', label: 'خلال 60 يوم' },
    { value: 'net_90', label: 'خلال 90 يوم' },
    { value: 'custom', label: 'مخصص' },
]

const CREDIT_RATINGS = [
    { value: 'aaa', label: 'AAA - ممتاز' },
    { value: 'aa', label: 'AA - جيد جداً' },
    { value: 'a', label: 'A - جيد' },
    { value: 'bbb', label: 'BBB - متوسط' },
    { value: 'bb', label: 'BB - منخفض' },
    { value: 'b', label: 'B - ضعيف' },
    { value: 'c', label: 'C - مخاطر عالية' },
    { value: 'not_rated', label: 'غير مصنف' },
]

const ENGAGEMENT_STATUSES = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'on_hold', label: 'معلق' },
    { value: 'completed', label: 'مكتمل' },
]

const LICENSE_TYPES = [
    { value: 'commercial', label: 'تجاري' },
    { value: 'professional', label: 'مهني' },
    { value: 'industrial', label: 'صناعي' },
    { value: 'franchise', label: 'امتياز تجاري' },
    { value: 'other', label: 'أخرى' },
]

const FIRM_SIZES = [
    { value: 'startup', label: 'ناشئة', icon: '🚀', employees: '1-10', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { value: 'small', label: 'صغيرة', icon: '🏢', employees: '11-50', color: 'bg-green-50 border-green-200 text-green-700' },
    { value: 'medium', label: 'متوسطة', icon: '🏗️', employees: '51-200', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { value: 'large', label: 'كبيرة', icon: '🏛️', employees: '201-500', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { value: 'enterprise', label: 'مؤسسة', icon: '🏰', employees: '500+', color: 'bg-red-50 border-red-200 text-red-700' },
]

// ==================== COMPONENT ====================

export function CreateOrganizationView() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { mutate: createOrganization, isPending } = useCreateOrganization()
    const { data: contactsData } = useContacts()

    // UI State
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [selectedFirmSize, setSelectedFirmSize] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        nameAr: '',
        tradeName: '',
        tradeNameAr: '',
        shortName: '',

        // Type & Classification
        type: 'company',
        legalStructure: '',
        industry: '',
        sector: '',
        subIndustry: '',
        size: '',
        annualRevenue: '',
        isPublic: false,

        // Registration (Saudi specific)
        commercialRegistration: '',
        crIssueDate: '',
        crExpiryDate: '',
        crIssuingAuthority: 'الرياض',

        vatNumber: '',
        taxRegistrationDate: '',
        taxId: '',

        licenseNumber: '',
        licenseType: '',
        licenseExpiryDate: '',

        gosiNumber: '',
        zakatCertificate: '',

        // Contact Info
        mainPhone: '',
        fax: '',
        website: '',
        emails: [{ type: 'main', email: '', isPrimary: true }],

        // Addresses
        headquartersAddress: {
            street: '',
            buildingNumber: '',
            district: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'المملكة العربية السعودية',
        },
        registeredAddress: {
            street: '',
            buildingNumber: '',
            district: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'المملكة العربية السعودية',
            sameAsHeadquarters: true,
        },
        branchAddresses: [] as Array<{
            name: string;
            street: string;
            city: string;
            country: string;
        }>,

        // Financial
        bankName: '',
        accountNumber: '',
        iban: '',
        creditRating: '',
        creditLimit: '',
        paymentTerms: '',
        currency: 'SAR',
        fiscalYearEnd: '',

        // Key Contacts
        keyContacts: [] as Array<{ contactId: string; role: string; isPrimary: boolean }>,
        primaryContact: '',
        ceoOwner: '',
        financeContact: '',
        legalContact: '',
        hrContact: '',

        // Ownership & Relationships
        relationshipTypes: [] as string[],
        parentOrganizationId: '',
        subsidiaries: [] as string[],
        shareholders: [] as Array<{ name: string; percentage: string }>,

        // Legal/Law Firm Specific
        clientSince: '',
        engagementStatus: 'active',
        retainer: '',
        preferredPracticeAreas: [] as string[],

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

        // Custom Fields
        customField1: '',
        customField2: '',
        customField3: '',
        customField4: '',
        customField5: '',

        // Notes
        notes: '',
        internalNotes: '',
    })

    // Tags input
    const [tagInput, setTagInput] = useState('')
    const [shareholderInput, setShareholderInput] = useState({ name: '', percentage: '' })

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

    // Handle branch addresses
    const addBranchAddress = () => {
        setFormData(prev => ({
            ...prev,
            branchAddresses: [...prev.branchAddresses, { name: '', street: '', city: '', country: 'المملكة العربية السعودية' }]
        }))
    }

    const removeBranchAddress = (index: number) => {
        setFormData(prev => ({
            ...prev,
            branchAddresses: prev.branchAddresses.filter((_, i) => i !== index)
        }))
    }

    const updateBranchAddress = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            branchAddresses: prev.branchAddresses.map((b, i) => i === index ? { ...b, [field]: value } : b)
        }))
    }

    // Handle shareholders
    const addShareholder = () => {
        if (shareholderInput.name && shareholderInput.percentage) {
            setFormData(prev => ({
                ...prev,
                shareholders: [...prev.shareholders, { ...shareholderInput }]
            }))
            setShareholderInput({ name: '', percentage: '' })
        }
    }

    const removeShareholder = (index: number) => {
        setFormData(prev => ({
            ...prev,
            shareholders: prev.shareholders.filter((_, i) => i !== index)
        }))
    }

    // Handle nested address changes
    const handleAddressChange = (addressType: 'headquartersAddress' | 'registeredAddress', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [addressType]: {
                ...prev[addressType],
                [field]: value
            }
        }))
    }

    // Copy headquarters to registered address
    const copyHeadquartersToRegistered = () => {
        setFormData(prev => ({
            ...prev,
            registeredAddress: {
                ...prev.headquartersAddress,
                sameAsHeadquarters: true
            }
        }))
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
                navigate({ to: ROUTES.dashboard.organizations.list })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.overview, isActive: false },
        { title: 'العملاء', href: ROUTES.dashboard.clients.list, isActive: false },
        { title: 'جهات الاتصال', href: ROUTES.dashboard.contacts.list, isActive: false },
        { title: 'المنظمات', href: ROUTES.dashboard.organizations.list, isActive: true },
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

                            {/* FIRM SIZE SELECTOR */}
                            <Card className="border-slate-200 mb-6 bg-gradient-to-br from-slate-50 to-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-emerald-500" />
                                        اختر حجم المنظمة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-3">
                                        {FIRM_SIZES.map((size) => (
                                            <button
                                                key={size.value}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFirmSize(size.value)
                                                    handleChange('size', size.value)
                                                }}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                                                    selectedFirmSize === size.value
                                                        ? size.color + " border-current"
                                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                                )}
                                            >
                                                <span className="text-3xl">{size.icon}</span>
                                                <span className="text-sm font-bold">{size.label}</span>
                                                <span className="text-xs text-slate-500">{size.employees}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BASIC/ADVANCED TOGGLE */}
                            <div className="flex items-center justify-between mb-6 p-4 bg-slate-100 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-600" />
                                    <span className="font-semibold text-slate-700">
                                        {showAdvanced ? 'الوضع المتقدم' : 'الوضع الأساسي'}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="rounded-xl"
                                >
                                    {showAdvanced ? (
                                        <>
                                            <ChevronUp className="w-4 h-4 ms-1" />
                                            إخفاء الحقول المتقدمة
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 ms-1" />
                                            عرض جميع الحقول
                                        </>
                                    )}
                                </Button>
                            </div>

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
                                                الاسم القانوني (إنجليزي) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                placeholder="Legal Company Name LLC"
                                                dir="ltr"
                                                className="rounded-xl border-slate-200"
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                required
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

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">الاسم المختصر</Label>
                                        <Input
                                            placeholder="اسم مختصر للمنظمة"
                                            className="rounded-xl border-slate-200"
                                            value={formData.shortName}
                                            onChange={(e) => handleChange('shortName', e.target.value)}
                                        />
                                    </div>

                                    {/* Organization Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الحالة</Label>
                                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">نشطة</SelectItem>
                                                    <SelectItem value="inactive">غير نشطة</SelectItem>
                                                    <SelectItem value="prospect">عميل محتمل</SelectItem>
                                                    <SelectItem value="former">عميل سابق</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-4 pt-6">
                                            <label className="flex items-center gap-2">
                                                <Switch
                                                    checked={formData.isPublic}
                                                    onCheckedChange={(v) => handleChange('isPublic', v)}
                                                />
                                                <span className="text-sm text-slate-700">شركة مساهمة عامة</span>
                                            </label>
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
                                            <Label className="text-sm font-medium text-slate-700">نطاق الإيرادات السنوية</Label>
                                            <Select value={formData.annualRevenue} onValueChange={(v) => handleChange('annualRevenue', v)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر النطاق" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ANNUAL_REVENUE_RANGES.map(r => (
                                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
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
                                                value={formData.subIndustry}
                                                onChange={(e) => handleChange('subIndustry', e.target.value)}
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

                                    {/* VAT & Tax */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700">المعلومات الضريبية</h4>
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
                                                <Label>الرقم الضريبي (Tax ID)</Label>
                                                <Input
                                                    placeholder="Tax ID"
                                                    dir="ltr"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.taxId}
                                                    onChange={(e) => handleChange('taxId', e.target.value)}
                                                />
                                            </div>
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

                                    <Separator />

                                    {/* License */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-700">الترخيص</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>رقم الترخيص</Label>
                                                <Input
                                                    placeholder="رقم الترخيص"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.licenseNumber}
                                                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>نوع الترخيص</Label>
                                                <Select value={formData.licenseType} onValueChange={(v) => handleChange('licenseType', v)}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر النوع" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LICENSE_TYPES.map(lt => (
                                                            <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>تاريخ انتهاء الترخيص</Label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200"
                                                value={formData.licenseExpiryDate}
                                                onChange={(e) => handleChange('licenseExpiryDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {showAdvanced && (
                                        <>
                                            <Separator />

                                            {/* Additional Registrations */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-slate-700">تسجيلات إضافية</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>رقم التأمينات الاجتماعية (GOSI)</Label>
                                                        <Input
                                                            placeholder="GOSI Number"
                                                            dir="ltr"
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.gosiNumber}
                                                            onChange={(e) => handleChange('gosiNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>شهادة الزكاة</Label>
                                                        <Input
                                                            placeholder="رقم شهادة الزكاة"
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.zakatCertificate}
                                                            onChange={(e) => handleChange('zakatCertificate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                                {/* Addresses */}
                                <AccordionItem value="addresses" className="border rounded-xl mb-2 px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-slate-500" aria-hidden="true" />
                                            <span className="font-semibold">العناوين</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-6 pb-4">
                                        {/* Headquarters Address */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" />
                                                عنوان المقر الرئيسي
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 space-y-2">
                                                    <Label>الشارع</Label>
                                                    <Input
                                                        placeholder="شارع الملك فهد"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.street}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'street', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>رقم المبنى</Label>
                                                    <Input
                                                        placeholder="1234"
                                                        dir="ltr"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.buildingNumber}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'buildingNumber', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>الحي</Label>
                                                    <Input
                                                        placeholder="العليا"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.district}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'district', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>المدينة</Label>
                                                    <Input
                                                        placeholder="الرياض"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.city}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'city', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>المنطقة</Label>
                                                    <Input
                                                        placeholder="منطقة الرياض"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.province}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'province', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>الرمز البريدي</Label>
                                                    <Input
                                                        placeholder="12345"
                                                        dir="ltr"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.postalCode}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'postalCode', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>الدولة</Label>
                                                    <Input
                                                        placeholder="المملكة العربية السعودية"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.headquartersAddress.country}
                                                        onChange={(e) => handleAddressChange('headquartersAddress', 'country', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {showAdvanced && (
                                            <>
                                                <Separator />

                                                {/* Registered Address */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                                            <FileCheck className="w-4 h-4" />
                                                            العنوان المسجل
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={copyHeadquartersToRegistered}
                                                            className="text-xs"
                                                        >
                                                            نسخ من المقر الرئيسي
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="col-span-2 space-y-2">
                                                            <Label>الشارع</Label>
                                                            <Input
                                                                placeholder="شارع الملك فهد"
                                                                className="rounded-xl border-slate-200"
                                                                value={formData.registeredAddress.street}
                                                                onChange={(e) => handleAddressChange('registeredAddress', 'street', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>رقم المبنى</Label>
                                                            <Input
                                                                placeholder="1234"
                                                                dir="ltr"
                                                                className="rounded-xl border-slate-200"
                                                                value={formData.registeredAddress.buildingNumber}
                                                                onChange={(e) => handleAddressChange('registeredAddress', 'buildingNumber', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>المدينة</Label>
                                                            <Input
                                                                placeholder="الرياض"
                                                                className="rounded-xl border-slate-200"
                                                                value={formData.registeredAddress.city}
                                                                onChange={(e) => handleAddressChange('registeredAddress', 'city', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>الرمز البريدي</Label>
                                                            <Input
                                                                placeholder="12345"
                                                                dir="ltr"
                                                                className="rounded-xl border-slate-200"
                                                                value={formData.registeredAddress.postalCode}
                                                                onChange={(e) => handleAddressChange('registeredAddress', 'postalCode', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Branch Addresses */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-slate-700">عناوين الفروع</h4>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={addBranchAddress}
                                                            className="text-emerald-600"
                                                        >
                                                            <Plus className="w-4 h-4 ms-1" />
                                                            إضافة فرع
                                                        </Button>
                                                    </div>
                                                    {formData.branchAddresses.length === 0 ? (
                                                        <p className="text-sm text-slate-500 text-center py-4">لا توجد فروع مضافة</p>
                                                    ) : (
                                                        formData.branchAddresses.map((branch, index) => (
                                                            <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="font-semibold">الفرع {index + 1}</Label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeBranchAddress(index)}
                                                                        className="text-red-500"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <Input
                                                                        placeholder="اسم الفرع"
                                                                        value={branch.name}
                                                                        onChange={(e) => updateBranchAddress(index, 'name', e.target.value)}
                                                                        className="rounded-xl"
                                                                    />
                                                                    <Input
                                                                        placeholder="المدينة"
                                                                        value={branch.city}
                                                                        onChange={(e) => updateBranchAddress(index, 'city', e.target.value)}
                                                                        className="rounded-xl"
                                                                    />
                                                                </div>
                                                                <Input
                                                                    placeholder="العنوان"
                                                                    value={branch.street}
                                                                    onChange={(e) => updateBranchAddress(index, 'street', e.target.value)}
                                                                    className="rounded-xl"
                                                                />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        )}
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

                                {/* Financial Details - Advanced Only */}
                                {showAdvanced && (
                                    <AccordionItem value="financial" className="border rounded-xl mb-2 px-4 border-blue-200">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4 text-blue-500" />
                                                <span className="font-semibold text-blue-700">المعلومات المالية</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-6 pb-4">
                                            {/* Banking Details */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-slate-700">التفاصيل المصرفية</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>اسم البنك</Label>
                                                        <Input
                                                            placeholder="البنك الأهلي السعودي"
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.bankName}
                                                            onChange={(e) => handleChange('bankName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>رقم الحساب</Label>
                                                        <Input
                                                            placeholder="Account Number"
                                                            dir="ltr"
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.accountNumber}
                                                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>رقم الآيبان (IBAN)</Label>
                                                    <Input
                                                        placeholder="SA00 0000 0000 0000 0000 0000"
                                                        dir="ltr"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.iban}
                                                        onChange={(e) => handleChange('iban', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Credit & Payment Terms */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-slate-700">الائتمان والشروط</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>التصنيف الائتماني</Label>
                                                        <Select value={formData.creditRating} onValueChange={(v) => handleChange('creditRating', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر التصنيف" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {CREDIT_RATINGS.map(cr => (
                                                                    <SelectItem key={cr.value} value={cr.value}>{cr.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>حد الائتمان</Label>
                                                        <Input
                                                            placeholder="100,000 SAR"
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.creditLimit}
                                                            onChange={(e) => handleChange('creditLimit', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>شروط الدفع</Label>
                                                        <Select value={formData.paymentTerms} onValueChange={(v) => handleChange('paymentTerms', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue placeholder="اختر الشروط" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {PAYMENT_TERMS.map(pt => (
                                                                    <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>العملة</Label>
                                                        <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
                                                            <SelectTrigger className="rounded-xl border-slate-200">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {CURRENCIES.map(c => (
                                                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>نهاية السنة المالية</Label>
                                                    <Input
                                                        type="date"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.fiscalYearEnd}
                                                        onChange={(e) => handleChange('fiscalYearEnd', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Ownership & Relationships - Advanced Only */}
                                {showAdvanced && (
                                    <AccordionItem value="ownership" className="border rounded-xl mb-2 px-4 border-purple-200">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-purple-500" />
                                                <span className="font-semibold text-purple-700">الملكية والعلاقات</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-6 pb-4">
                                            {/* Parent Company */}
                                            <div className="space-y-2">
                                                <Label>الشركة الأم</Label>
                                                <Input
                                                    placeholder="اسم الشركة الأم (إن وجدت)"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.parentOrganizationId}
                                                    onChange={(e) => handleChange('parentOrganizationId', e.target.value)}
                                                />
                                            </div>

                                            <Separator />

                                            {/* Shareholders */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-semibold">المساهمون / الشركاء</Label>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="اسم المساهم"
                                                        className="rounded-xl flex-1"
                                                        value={shareholderInput.name}
                                                        onChange={(e) => setShareholderInput(prev => ({ ...prev, name: e.target.value }))}
                                                    />
                                                    <Input
                                                        placeholder="النسبة %"
                                                        className="rounded-xl w-24"
                                                        value={shareholderInput.percentage}
                                                        onChange={(e) => setShareholderInput(prev => ({ ...prev, percentage: e.target.value }))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={addShareholder}
                                                        className="rounded-xl"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {formData.shareholders.map((sh, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                            <span className="font-medium">{sh.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="secondary">{sh.percentage}%</Badge>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeShareholder(index)}
                                                                    className="text-red-500"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Law Firm Specific - Advanced Only */}
                                {showAdvanced && (
                                    <AccordionItem value="law-firm" className="border rounded-xl mb-2 px-4 border-emerald-200">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Scale className="h-4 w-4 text-emerald-500" />
                                                <span className="font-semibold text-emerald-700">معلومات مكتب المحاماة</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-6 pb-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>عميل منذ</Label>
                                                    <Input
                                                        type="date"
                                                        className="rounded-xl border-slate-200"
                                                        value={formData.clientSince}
                                                        onChange={(e) => handleChange('clientSince', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>حالة التعاقد</Label>
                                                    <Select value={formData.engagementStatus} onValueChange={(v) => handleChange('engagementStatus', v)}>
                                                        <SelectTrigger className="rounded-xl border-slate-200">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ENGAGEMENT_STATUSES.map(es => (
                                                                <SelectItem key={es.value} value={es.value}>{es.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>الأتعاب الثابتة (Retainer)</Label>
                                                <Input
                                                    placeholder="50,000 SAR سنوياً"
                                                    className="rounded-xl border-slate-200"
                                                    value={formData.retainer}
                                                    onChange={(e) => handleChange('retainer', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>مجالات الممارسة المفضلة</Label>
                                                <Textarea
                                                    placeholder="القانون التجاري، قانون الشركات، العقود..."
                                                    className="min-h-[80px] rounded-xl border-slate-200"
                                                    value={formData.preferredPracticeAreas.join(', ')}
                                                    onChange={(e) => handleChange('preferredPracticeAreas', e.target.value.split(',').map(s => s.trim()))}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}

                                {/* Documents - Advanced Only */}
                                {showAdvanced && (
                                    <AccordionItem value="documents" className="border rounded-xl mb-2 px-4">
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Upload className="h-4 w-4 text-slate-500" />
                                                <span className="font-semibold">المستندات</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pb-4">
                                            <Alert className="bg-blue-50 border-blue-200">
                                                <FileCheck className="h-4 w-4 text-blue-500" />
                                                <AlertDescription className="text-blue-700">
                                                    يمكنك رفع المستندات المطلوبة مثل شهادة السجل التجاري، شهادة الضريبة، الرخصة التجارية، والنظام الأساسي
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-3">
                                                <p className="text-sm text-slate-500">سيتم إضافة نظام رفع المستندات قريباً</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
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
                                        <Label>ملاحظات عامة</Label>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات عامة..."
                                            className="min-h-[100px] rounded-xl border-slate-200"
                                            value={formData.notes}
                                            onChange={(e) => handleChange('notes', e.target.value)}
                                        />
                                    </div>

                                    {showAdvanced && (
                                        <>
                                            <div className="space-y-2">
                                                <Label>ملاحظات داخلية (خاصة)</Label>
                                                <Textarea
                                                    placeholder="ملاحظات داخلية للاستخدام الخاص بالمكتب..."
                                                    className="min-h-[80px] rounded-xl border-slate-200 bg-slate-50"
                                                    value={formData.internalNotes}
                                                    onChange={(e) => handleChange('internalNotes', e.target.value)}
                                                />
                                            </div>

                                            <Separator />

                                            {/* Custom Fields */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                                    <Settings className="w-4 h-4" />
                                                    حقول مخصصة
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>حقل مخصص 1</Label>
                                                        <Input
                                                            placeholder="قيمة مخصصة..."
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.customField1}
                                                            onChange={(e) => handleChange('customField1', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>حقل مخصص 2</Label>
                                                        <Input
                                                            placeholder="قيمة مخصصة..."
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.customField2}
                                                            onChange={(e) => handleChange('customField2', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>حقل مخصص 3</Label>
                                                        <Input
                                                            placeholder="قيمة مخصصة..."
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.customField3}
                                                            onChange={(e) => handleChange('customField3', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>حقل مخصص 4</Label>
                                                        <Input
                                                            placeholder="قيمة مخصصة..."
                                                            className="rounded-xl border-slate-200"
                                                            value={formData.customField4}
                                                            onChange={(e) => handleChange('customField4', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>حقل مخصص 5 (نص طويل)</Label>
                                                    <Textarea
                                                        placeholder="نص طويل..."
                                                        className="min-h-[60px] rounded-xl border-slate-200"
                                                        value={formData.customField5}
                                                        onChange={(e) => handleChange('customField5', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <Link to={ROUTES.dashboard.organizations.list}>
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
