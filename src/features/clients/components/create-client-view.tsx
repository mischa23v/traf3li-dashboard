import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Save, User, Phone, Mail, Building2, MapPin, FileText, Loader2,
    CheckCircle, Search, Briefcase, CreditCard, Users, Shield,
    Clock, Bell, AlertTriangle, Tag, Paperclip, ChevronDown,
    Scale, UserCheck, BadgePercent, Receipt, Globe, Home,
    Calendar, DollarSign, FileCheck, X, Plus, Trash2, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateClient } from '@/hooks/useClients'
import { useLawyers } from '@/hooks/useCasesAndClients'
import { cn } from '@/lib/utils'

// Types
type ClientType = 'individual' | 'company'
type VerificationStatus = 'idle' | 'loading' | 'verified' | 'error'

// Verification response interfaces
interface YakeenResponse {
    firstName: string
    middleName: string
    lastName: string
    fullNameArabic: string
    fullNameEnglish: string
    gender: 'male' | 'female'
    nationality: string
    dateOfBirth: string
    dateOfBirthHijri: string
    idStatus: string
    issueDate: string
    expiryDate: string
}

interface WathqResponse {
    crNumber: string
    crName: string
    crNameEn: string
    unifiedNumber: string
    crEntityStatus: string
    entityDuration: number
    capital: number
    phone: string
    issueDate: string
    mainActivity: string
    website: string
    ecommerceLink: string
    city: string
    address: string
    owners: Array<{ name: string; share: number }>
    managers: Array<{ name: string; position: string }>
}

interface MOJResponse {
    attorneyName: string
    attorneyType: string
    gender: string
    status: string
    residence: string
    workplace: string
}

// Saudi cities
const saudiCities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
    'الخبر', 'الطائف', 'تبوك', 'بريدة', 'الجبيل', 'حائل',
    'الأحساء', 'القطيف', 'خميس مشيط', 'نجران', 'جازان', 'أبها'
]

export function CreateClientView() {
    const { t, i18n } = useTranslation()
    const isArabic = i18n.language === 'ar'
    const navigate = useNavigate()
    const { mutate: createClient, isPending } = useCreateClient()
    const { data: lawyersData, isLoading: loadingLawyers } = useLawyers()

    // Client type
    const [clientType, setClientType] = useState<ClientType>('individual')

    // Verification states
    const [yakeenStatus, setYakeenStatus] = useState<VerificationStatus>('idle')
    const [wathqStatus, setWathqStatus] = useState<VerificationStatus>('idle')
    const [mojStatus, setMojStatus] = useState<VerificationStatus>('idle')

    // Verified data
    const [yakeenData, setYakeenData] = useState<YakeenResponse | null>(null)
    const [wathqData, setWathqData] = useState<WathqResponse | null>(null)
    const [mojData, setMojData] = useState<MOJResponse | null>(null)

    // Form state - Individual
    const [nationalId, setNationalId] = useState('')
    const [firstName, setFirstName] = useState('')
    const [middleName, setMiddleName] = useState('')
    const [lastName, setLastName] = useState('')
    const [fullNameArabic, setFullNameArabic] = useState('')
    const [fullNameEnglish, setFullNameEnglish] = useState('')
    const [gender, setGender] = useState<'male' | 'female'>('male')
    const [nationality, setNationality] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [dateOfBirthHijri, setDateOfBirthHijri] = useState('')
    const [idStatus, setIdStatus] = useState('')
    const [idIssueDate, setIdIssueDate] = useState('')
    const [idExpiryDate, setIdExpiryDate] = useState('')

    // Form state - Company
    const [crNumber, setCrNumber] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [companyNameEnglish, setCompanyNameEnglish] = useState('')
    const [unifiedNumber, setUnifiedNumber] = useState('')
    const [crStatus, setCrStatus] = useState('')
    const [entityDuration, setEntityDuration] = useState<number | null>(null)
    const [capital, setCapital] = useState<number | null>(null)
    const [companyPhone, setCompanyPhone] = useState('')
    const [crIssueDate, setCrIssueDate] = useState('')
    const [mainActivity, setMainActivity] = useState('')
    const [website, setWebsite] = useState('')
    const [ecommerceLink, setEcommerceLink] = useState('')
    const [companyCity, setCompanyCity] = useState('')
    const [companyAddress, setCompanyAddress] = useState('')
    const [owners, setOwners] = useState<Array<{ name: string; share: number }>>([])
    const [managers, setManagers] = useState<Array<{ name: string; position: string }>>([])

    // Legal representative (for company)
    const [legalRepName, setLegalRepName] = useState('')
    const [legalRepId, setLegalRepId] = useState('')
    const [legalRepPosition, setLegalRepPosition] = useState('')
    const [legalRepPhone, setLegalRepPhone] = useState('')

    // Contact info
    const [phone, setPhone] = useState('')
    const [alternatePhone, setAlternatePhone] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [sameAsPhone, setSameAsPhone] = useState(true)
    const [email, setEmail] = useState('')
    const [secondaryEmail, setSecondaryEmail] = useState('')
    const [preferredContact, setPreferredContact] = useState<'phone' | 'email' | 'whatsapp' | 'sms'>('phone')
    const [preferredTime, setPreferredTime] = useState<'morning' | 'noon' | 'evening' | 'anytime'>('anytime')
    const [preferredLanguage, setPreferredLanguage] = useState<'ar' | 'en'>('ar')

    // Address
    const [city, setCity] = useState('')
    const [district, setDistrict] = useState('')
    const [street, setStreet] = useState('')
    const [buildingNumber, setBuildingNumber] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [additionalNumber, setAdditionalNumber] = useState('')
    const [unitNumber, setUnitNumber] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [differentMailingAddress, setDifferentMailingAddress] = useState(false)
    const [mailingCity, setMailingCity] = useState('')
    const [mailingAddress, setMailingAddress] = useState('')

    // Power of Attorney
    const [hasPowerOfAttorney, setHasPowerOfAttorney] = useState(false)
    const [attorneyId, setAttorneyId] = useState('')
    const [attorneyName, setAttorneyName] = useState('')
    const [attorneyType, setAttorneyType] = useState('')
    const [attorneyGender, setAttorneyGender] = useState('')
    const [attorneyStatus, setAttorneyStatus] = useState('')
    const [attorneyResidence, setAttorneyResidence] = useState('')
    const [attorneyWorkplace, setAttorneyWorkplace] = useState('')
    const [poaSource, setPoaSource] = useState<'notary' | 'embassy' | 'court' | 'other'>('notary')
    const [poaNumber, setPoaNumber] = useState('')
    const [notaryNumber, setNotaryNumber] = useState('')
    const [poaIssueDate, setPoaIssueDate] = useState('')
    const [poaExpiryDate, setPoaExpiryDate] = useState('')
    const [attorneyPhone, setAttorneyPhone] = useState('')
    const [attorneyEmail, setAttorneyEmail] = useState('')
    const [poaPowers, setPoaPowers] = useState<string[]>(['litigation', 'contracting'])
    const [poaLimitations, setPoaLimitations] = useState('')

    // Case assignment
    const [responsibleLawyerId, setResponsibleLawyerId] = useState('')
    const [assistantLawyerId, setAssistantLawyerId] = useState('')
    const [paralegalId, setParalegalId] = useState('')
    const [researcherId, setResearcherId] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [officeId, setOfficeId] = useState('')
    const [clientSource, setClientSource] = useState<'website' | 'referral' | 'returning' | 'ads' | 'social' | 'walkin'>('website')
    const [referredBy, setReferredBy] = useState('')
    const [referralCommission, setReferralCommission] = useState<number | null>(null)

    // Billing info
    const [billingType, setBillingType] = useState<'hourly' | 'flat_fee' | 'contingency' | 'retainer'>('hourly')
    const [hourlyRate, setHourlyRate] = useState<number | null>(null)
    const [currency, setCurrency] = useState('SAR')
    const [paymentTerms, setPaymentTerms] = useState<'immediate' | 'net_15' | 'net_30' | 'net_45' | 'net_60'>('net_30')
    const [isVatRegistered, setIsVatRegistered] = useState(false)
    const [vatNumber, setVatNumber] = useState('')
    const [creditLimit, setCreditLimit] = useState<number | null>(null)
    const [hasDiscount, setHasDiscount] = useState(false)
    const [discountPercent, setDiscountPercent] = useState<number | null>(null)
    const [discountReason, setDiscountReason] = useState('')
    const [invoiceDelivery, setInvoiceDelivery] = useState<'email' | 'mail' | 'hand'>('email')
    const [invoiceLanguage, setInvoiceLanguage] = useState<'ar' | 'en' | 'both'>('ar')

    // Professional info (optional)
    const [profession, setProfession] = useState('')
    const [employer, setEmployer] = useState('')
    const [workPhone, setWorkPhone] = useState('')
    const [workAddress, setWorkAddress] = useState('')
    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null)
    const [eligibleForLegalAid, setEligibleForLegalAid] = useState(false)

    // Emergency contact (optional)
    const [emergencyName, setEmergencyName] = useState('')
    const [emergencyRelation, setEmergencyRelation] = useState('')
    const [emergencyPhone, setEmergencyPhone] = useState('')
    const [emergencyAltPhone, setEmergencyAltPhone] = useState('')
    const [emergencyEmail, setEmergencyEmail] = useState('')
    const [emergencyAddress, setEmergencyAddress] = useState('')

    // Communication preferences
    const [allowEmail, setAllowEmail] = useState(true)
    const [allowSms, setAllowSms] = useState(true)
    const [allowWhatsapp, setAllowWhatsapp] = useState(true)
    const [allowPhone, setAllowPhone] = useState(true)
    const [notifyCaseUpdates, setNotifyCaseUpdates] = useState(true)
    const [notifyHearings, setNotifyHearings] = useState(true)
    const [notifyInvoices, setNotifyInvoices] = useState(true)
    const [notifyPayments, setNotifyPayments] = useState(true)
    const [notifyNewsletter, setNotifyNewsletter] = useState(false)

    // Conflict check (firm mode)
    const [conflictChecked, setConflictChecked] = useState(false)
    const [conflictCheckedBy, setConflictCheckedBy] = useState('')
    const [conflictCheckDate, setConflictCheckDate] = useState('')
    const [hasConflict, setHasConflict] = useState(false)
    const [conflictDetails, setConflictDetails] = useState('')
    const [conflictResolution, setConflictResolution] = useState('')
    const [conflictApprovedBy, setConflictApprovedBy] = useState('')

    // Status & flags
    const [isVip, setIsVip] = useState(false)
    const [isHighRisk, setIsHighRisk] = useState(false)
    const [needsApproval, setNeedsApproval] = useState(false)
    const [isBlacklisted, setIsBlacklisted] = useState(false)
    const [blacklistReason, setBlacklistReason] = useState('')
    const [creditHold, setCreditHold] = useState(false)

    // Notes & tags
    const [generalNotes, setGeneralNotes] = useState('')
    const [internalNotes, setInternalNotes] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')

    // Attachments
    const [attachments, setAttachments] = useState<File[]>([])

    // Lawyers list
    const lawyers = useMemo(() => {
        if (!lawyersData) return []
        return Array.isArray(lawyersData) ? lawyersData : (lawyersData as any)?.data || []
    }, [lawyersData])

    // Verification handlers
    const verifyWithYakeen = async () => {
        if (!nationalId || nationalId.length < 10) return

        setYakeenStatus('loading')
        try {
            const response = await fetch('/api/verify/yakeen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nationalId })
            })
            const data = await response.json()

            if (data.success) {
                setYakeenData(data.data)
                setYakeenStatus('verified')

                // Auto-fill fields
                setFirstName(data.data.firstName)
                setMiddleName(data.data.middleName)
                setLastName(data.data.lastName)
                setFullNameArabic(data.data.fullNameArabic)
                setFullNameEnglish(data.data.fullNameEnglish)
                setGender(data.data.gender)
                setNationality(data.data.nationality)
                setDateOfBirth(data.data.dateOfBirth)
                setDateOfBirthHijri(data.data.dateOfBirthHijri)
                setIdStatus(data.data.idStatus)
                setIdIssueDate(data.data.issueDate)
                setIdExpiryDate(data.data.expiryDate)
            } else {
                setYakeenStatus('error')
            }
        } catch (error) {
            setYakeenStatus('error')
        }
    }

    const verifyWithWathq = async () => {
        if (!crNumber || crNumber.length < 10) return

        setWathqStatus('loading')
        try {
            const response = await fetch(`/api/companies/${crNumber}`)
            const data = await response.json()

            if (data.success || data.crNumber) {
                const companyData = data.data || data
                setWathqData(companyData)
                setWathqStatus('verified')

                // Auto-fill fields
                setCompanyName(companyData.crName || companyData.companyName)
                setCompanyNameEnglish(companyData.crNameEn || companyData.companyNameEnglish || '')
                setUnifiedNumber(companyData.unifiedNumber || '')
                setCrStatus(companyData.crEntityStatus || companyData.status || '')
                setEntityDuration(companyData.entityDuration || null)
                setCapital(companyData.capital || null)
                setCompanyPhone(companyData.phone || '')
                setCrIssueDate(companyData.issueDate || '')
                setMainActivity(companyData.mainActivity || '')
                setWebsite(companyData.website || '')
                setEcommerceLink(companyData.ecommerceLink || '')
                setCompanyCity(companyData.city || '')
                setCompanyAddress(companyData.address || '')
                setOwners(companyData.owners || [])
                setManagers(companyData.managers || [])
            } else {
                setWathqStatus('error')
            }
        } catch (error) {
            setWathqStatus('error')
        }
    }

    const verifyWithMOJ = async () => {
        if (!attorneyId || attorneyId.length < 10) return

        setMojStatus('loading')
        try {
            const response = await fetch('/api/verify/moj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attorneyId })
            })
            const data = await response.json()

            if (data.success) {
                setMojData(data.data)
                setMojStatus('verified')

                // Auto-fill fields
                setAttorneyName(data.data.attorneyName)
                setAttorneyType(data.data.attorneyType)
                setAttorneyGender(data.data.gender)
                setAttorneyStatus(data.data.status)
                setAttorneyResidence(data.data.residence)
                setAttorneyWorkplace(data.data.workplace)
            } else {
                setMojStatus('error')
            }
        } catch (error) {
            setMojStatus('error')
        }
    }

    // Tag handlers
    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag])
            setNewTag('')
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    // Format currency
    const formatCurrency = (value: number | null) => {
        if (value === null) return ''
        return value.toLocaleString('ar-SA') + ' ر.س'
    }

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!consentDataProcessing || !consentPrivacyPolicy) {
            alert('يجب الموافقة على معالجة البيانات وسياسة الخصوصية')
            return
        }

        const clientData = {
            // Type
            clientType,

            // Individual info
            ...(clientType === 'individual' && {
                nationalId,
                firstName,
                middleName,
                lastName,
                fullNameArabic,
                fullNameEnglish,
                gender,
                nationality,
                dateOfBirth,
                dateOfBirthHijri,
                idStatus,
                idIssueDate,
                idExpiryDate,
                yakeenVerified: yakeenStatus === 'verified',
                yakeenVerifiedAt: yakeenStatus === 'verified' ? new Date().toISOString() : null,
            }),

            // Company info
            ...(clientType === 'company' && {
                crNumber,
                companyName,
                companyNameEnglish,
                unifiedNumber,
                crStatus,
                entityDuration,
                capital,
                companyPhone,
                crIssueDate,
                mainActivity,
                website,
                ecommerceLink,
                companyCity,
                companyAddress,
                owners,
                managers,
                legalRepresentative: {
                    name: legalRepName,
                    nationalId: legalRepId,
                    position: legalRepPosition,
                    phone: legalRepPhone,
                },
                wathqVerified: wathqStatus === 'verified',
                wathqVerifiedAt: wathqStatus === 'verified' ? new Date().toISOString() : null,
            }),

            // Contact info - LINKED TO FINANCE SECTION
            contact: {
                phone,
                alternatePhone,
                whatsapp: sameAsPhone ? phone : whatsapp,
                email,
                secondaryEmail,
                preferredContact,
                preferredTime,
                preferredLanguage,
            },

            // Address - LINKED TO INVOICE ADDRESS
            address: {
                city,
                district,
                street,
                buildingNumber,
                postalCode,
                additionalNumber,
                unitNumber,
                fullAddress,
            },
            ...(differentMailingAddress && {
                mailingAddress: {
                    city: mailingCity,
                    address: mailingAddress,
                }
            }),

            // Power of Attorney
            ...(hasPowerOfAttorney && {
                powerOfAttorney: {
                    attorneyId,
                    attorneyName,
                    attorneyType,
                    attorneyGender,
                    attorneyStatus,
                    attorneyResidence,
                    attorneyWorkplace,
                    source: poaSource,
                    poaNumber,
                    notaryNumber,
                    issueDate: poaIssueDate,
                    expiryDate: poaExpiryDate,
                    phone: attorneyPhone,
                    email: attorneyEmail,
                    powers: poaPowers,
                    limitations: poaLimitations,
                    mojVerified: mojStatus === 'verified',
                    mojVerifiedAt: mojStatus === 'verified' ? new Date().toISOString() : null,
                }
            }),

            // Assignment
            assignment: {
                responsibleLawyerId,
                assistantLawyerId,
                paralegalId,
                researcherId,
                departmentId,
                officeId,
            },
            clientSource,
            ...(clientSource === 'referral' && {
                referredBy,
                referralCommission,
            }),

            // Billing - CRITICAL FOR FINANCE LINKING
            billing: {
                type: billingType,
                hourlyRate,
                currency,
                paymentTerms,
                creditLimit,
                ...(hasDiscount && {
                    discount: {
                        percent: discountPercent,
                        reason: discountReason,
                    }
                }),
                invoiceDelivery,
                invoiceLanguage,
            },
            // VAT - CRITICAL FOR ZATCA
            ...(isVatRegistered && { vatNumber }),
            isVatRegistered,

            // Professional info
            professional: {
                profession,
                employer,
                workPhone,
                workAddress,
                monthlyIncome,
                eligibleForLegalAid,
            },

            // Emergency contact
            emergencyContact: {
                name: emergencyName,
                relation: emergencyRelation,
                phone: emergencyPhone,
                altPhone: emergencyAltPhone,
                email: emergencyEmail,
                address: emergencyAddress,
            },

            // Communication preferences
            communicationPreferences: {
                allowEmail,
                allowSms,
                allowWhatsapp,
                allowPhone,
                notifications: {
                    caseUpdates: notifyCaseUpdates,
                    hearings: notifyHearings,
                    invoices: notifyInvoices,
                    payments: notifyPayments,
                    newsletter: notifyNewsletter,
                }
            },

            // Conflict check
            conflictCheck: {
                checked: conflictChecked,
                checkedBy: conflictCheckedBy,
                checkDate: conflictCheckDate,
                hasConflict,
                details: conflictDetails,
                resolution: conflictResolution,
                approvedBy: conflictApprovedBy,
            },

            // Flags
            flags: {
                isVip,
                isHighRisk,
                needsApproval,
                isBlacklisted,
                blacklistReason,
                creditHold,
            },

            // Compliance
            compliance: {
                consentDataProcessing,
                consentPrivacyPolicy,
                consentDate: new Date().toISOString(),
                consentIP: '', // Will be filled by backend
            },

            // Notes & tags
            generalNotes,
            internalNotes,
            tags,

            // Status
            status,
        }

        createClient(clientData as any, {
            onSuccess: () => {
                navigate({ to: '/dashboard/clients' })
            },
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'المالية', href: '/dashboard/finance/overview', isActive: false },
    ]

    // Verification badge component
    const VerificationBadge = ({ service, status }: { service: string; status: VerificationStatus }) => {
        if (status === 'verified') {
            return (
                <Badge className="bg-green-100 text-green-700 rounded-full">
                    <CheckCircle className="w-3 h-3 ms-1" />
                    تم التحقق عبر {service}
                </Badge>
            )
        }
        return null
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <ProductivityHero badge="العملاء" title="تسجيل عميل جديد" type="clients" listMode={true} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* CLIENT TYPE SELECTOR */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        نوع العميل <span className="text-red-500">*</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setClientType('individual')}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all text-center",
                                                clientType === 'individual'
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <User className={cn("w-8 h-8 mx-auto mb-2", clientType === 'individual' ? "text-emerald-600" : "text-slate-500")} />
                                            <span className={cn("text-lg font-medium", clientType === 'individual' ? "text-emerald-700" : "text-slate-600")}>
                                                فرد
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">شخص طبيعي</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClientType('company')}
                                            className={cn(
                                                "p-6 rounded-xl border-2 transition-all text-center",
                                                clientType === 'company'
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            <Building2 className={cn("w-8 h-8 mx-auto mb-2", clientType === 'company' ? "text-emerald-600" : "text-slate-500")} />
                                            <span className={cn("text-lg font-medium", clientType === 'company' ? "text-emerald-700" : "text-slate-600")}>
                                                شركة
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">منشأة تجارية</p>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* INDIVIDUAL FORM */}
                            {clientType === 'individual' && (
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                                المعلومات الشخصية
                                            </CardTitle>
                                            <VerificationBadge service="يقين" status={yakeenStatus} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* National ID with verification */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                رقم الهوية الوطنية / الإقامة<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /> <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={nationalId}
                                                    onChange={(e) => setNationalId(e.target.value)}
                                                    placeholder="1234567890"
                                                    className="flex-1 rounded-xl border-slate-200"
                                                    dir="ltr"
                                                    maxLength={10}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={verifyWithYakeen}
                                                    disabled={yakeenStatus === 'loading' || nationalId.length < 10}
                                                    className="rounded-xl bg-blue-500 hover:bg-blue-600"
                                                >
                                                    {yakeenStatus === 'loading' ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Search className="w-4 h-4 ms-2" aria-hidden="true" />
                                                            تحقق عبر يقين
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Auto-filled fields */}
                                        {yakeenStatus === 'verified' && (
                                            <div className={cn("space-y-4 p-4 rounded-xl", yakeenStatus === 'verified' ? "bg-green-50 border border-green-200" : "")}>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الاسم الأول</Label>
                                                        <Input value={firstName} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">اسم الأب</Label>
                                                        <Input value={middleName} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">اسم العائلة</Label>
                                                        <Input value={lastName} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الاسم الكامل (عربي)</Label>
                                                        <Input value={fullNameArabic} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الاسم الكامل (إنجليزي)</Label>
                                                        <Input value={fullNameEnglish} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الجنس</Label>
                                                        <Input value={gender === 'male' ? 'ذكر' : 'أنثى'} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الجنسية</Label>
                                                        <Input value={nationality} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">تاريخ الميلاد</Label>
                                                        <Input value={dateOfBirth} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">حالة الهوية</Label>
                                                        <Input value={idStatus} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Manual entry if not verified */}
                                        {yakeenStatus !== 'verified' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">
                                                        الاسم الكامل <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={fullNameArabic}
                                                        onChange={(e) => setFullNameArabic(e.target.value)}
                                                        placeholder="أدخل الاسم الكامل"
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">الجنس</Label>
                                                    <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')}>
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
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* COMPANY FORM */}
                            {clientType === 'company' && (
                                <Card className="rounded-3xl shadow-sm border-slate-100">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                                معلومات الشركة
                                            </CardTitle>
                                            <VerificationBadge service="وثق" status={wathqStatus} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* CR Number with verification */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                رقم السجل التجاري <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={crNumber}
                                                    onChange={(e) => setCrNumber(e.target.value)}
                                                    placeholder="2050012516"
                                                    className="flex-1 rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={verifyWithWathq}
                                                    disabled={wathqStatus === 'loading' || crNumber.length < 10}
                                                    className="rounded-xl bg-purple-500 hover:bg-purple-600"
                                                >
                                                    {wathqStatus === 'loading' ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Search className="w-4 h-4 ms-2" aria-hidden="true" />
                                                            تحقق عبر وثق
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Auto-filled company fields */}
                                        {wathqStatus === 'verified' && (
                                            <div className="space-y-4 p-4 rounded-xl bg-green-50 border border-green-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">اسم الشركة</Label>
                                                        <Input value={companyName} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الاسم بالإنجليزية</Label>
                                                        <Input value={companyNameEnglish} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الرقم الموحد</Label>
                                                        <Input value={unifiedNumber} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">حالة السجل</Label>
                                                        <Badge className={cn("w-full justify-center py-2", crStatus === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                                                            {crStatus}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">مدة المنشأة</Label>
                                                        <Input value={entityDuration !== null ? `${entityDuration} سنة` : 'غير محدد'} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">رأس المال</Label>
                                                        <Input value={capital !== null ? formatCurrency(capital) : ''} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">هاتف الشركة</Label>
                                                        <Input value={companyPhone} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">تاريخ الإصدار</Label>
                                                        <Input value={crIssueDate} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">المدينة</Label>
                                                        <Input value={companyCity} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">العنوان</Label>
                                                        <Input value={companyAddress || 'غير متوفر'} disabled className="bg-white/50 rounded-xl" />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الموقع الإلكتروني</Label>
                                                        <Input value={website || 'غير متوفر'} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">رابط المتجر الإلكتروني</Label>
                                                        <Input value={ecommerceLink || 'غير متوفر'} disabled className="bg-white/50 rounded-xl" dir="ltr" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm text-slate-600">النشاط التجاري</Label>
                                                    <Textarea value={mainActivity} disabled className="bg-white/50 rounded-xl min-h-[60px]" />
                                                </div>

                                                {/* Owners */}
                                                {owners.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">الملاك</Label>
                                                        <div className="space-y-1">
                                                            {owners.map((owner, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                                                                    <span>{owner.name}</span>
                                                                    <span className="text-slate-500">{owner.share}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Managers */}
                                                {managers.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm text-slate-600">المديرون</Label>
                                                        <div className="space-y-1">
                                                            {managers.map((manager, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
                                                                    <span>{manager.name}</span>
                                                                    <span className="text-slate-500">{manager.position}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Legal Representative */}
                                        <Separator />
                                        <h5 className="font-semibold text-slate-700">الممثل القانوني</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    اسم الممثل القانوني <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    value={legalRepName}
                                                    onChange={(e) => setLegalRepName(e.target.value)}
                                                    placeholder="أدخل اسم الممثل"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رقم الهوية<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                                                <Input
                                                    value={legalRepId}
                                                    onChange={(e) => setLegalRepId(e.target.value)}
                                                    placeholder="رقم هوية الممثل"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">المنصب</Label>
                                                <Input
                                                    value={legalRepPosition}
                                                    onChange={(e) => setLegalRepPosition(e.target.value)}
                                                    placeholder="مثال: المدير العام"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">رقم الهاتف<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /></Label>
                                                <Input
                                                    value={legalRepPhone}
                                                    onChange={(e) => setLegalRepPhone(e.target.value)}
                                                    placeholder="+966 5XX XXX XXXX"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* CONTACT INFO */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Phone className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        معلومات الاتصال
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                رقم الهاتف<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /> <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+966 5XX XXX XXXX"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم هاتف بديل</Label>
                                            <Input
                                                value={alternatePhone}
                                                onChange={(e) => setAlternatePhone(e.target.value)}
                                                placeholder="+966 5XX XXX XXXX"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم واتساب</Label>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={sameAsPhone}
                                                    onCheckedChange={(checked) => setSameAsPhone(!!checked)}
                                                />
                                                <span className="text-xs text-slate-500">نفس الرقم الأساسي</span>
                                            </div>
                                        </div>
                                        {!sameAsPhone && (
                                            <Input
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                placeholder="+966 5XX XXX XXXX"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                البريد الإلكتروني<Lock className="h-3 w-3 text-slate-500 inline ms-1" aria-hidden="true" /> <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="example@email.com"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">بريد إلكتروني ثانوي</Label>
                                            <Input
                                                type="email"
                                                value={secondaryEmail}
                                                onChange={(e) => setSecondaryEmail(e.target.value)}
                                                placeholder="secondary@email.com"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">طريقة التواصل المفضلة</Label>
                                            <Select value={preferredContact} onValueChange={(v) => setPreferredContact(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone">الهاتف</SelectItem>
                                                    <SelectItem value="email">البريد الإلكتروني</SelectItem>
                                                    <SelectItem value="whatsapp">واتساب</SelectItem>
                                                    <SelectItem value="sms">رسالة نصية</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الوقت المفضل للاتصال</Label>
                                            <Select value={preferredTime} onValueChange={(v) => setPreferredTime(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">صباحاً</SelectItem>
                                                    <SelectItem value="noon">ظهراً</SelectItem>
                                                    <SelectItem value="evening">مساءً</SelectItem>
                                                    <SelectItem value="anytime">في أي وقت</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">اللغة المفضلة</Label>
                                            <Select value={preferredLanguage} onValueChange={(v) => setPreferredLanguage(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ar">العربية</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ADDRESS */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                        العنوان
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">المدينة <span className="text-red-500">*</span></Label>
                                            <Select value={city} onValueChange={setCity}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر المدينة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {saudiCities.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الحي</Label>
                                            <Input
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                placeholder="اسم الحي"
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الشارع</Label>
                                            <Input
                                                value={street}
                                                onChange={(e) => setStreet(e.target.value)}
                                                placeholder="اسم الشارع"
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم المبنى</Label>
                                            <Input
                                                value={buildingNumber}
                                                onChange={(e) => setBuildingNumber(e.target.value)}
                                                placeholder="1234"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الرمز البريدي</Label>
                                            <Input
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                placeholder="12345"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الرقم الإضافي</Label>
                                            <Input
                                                value={additionalNumber}
                                                onChange={(e) => setAdditionalNumber(e.target.value)}
                                                placeholder="6789"
                                                className="rounded-xl border-slate-200"
                                                dir="ltr"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">رقم الوحدة</Label>
                                            <Input
                                                value={unitNumber}
                                                onChange={(e) => setUnitNumber(e.target.value)}
                                                placeholder="مكتب 101"
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">العنوان الكامل</Label>
                                        <Textarea
                                            value={fullAddress}
                                            onChange={(e) => setFullAddress(e.target.value)}
                                            placeholder="أدخل العنوان التفصيلي..."
                                            className="rounded-xl border-slate-200 min-h-[80px]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={differentMailingAddress}
                                            onCheckedChange={(checked) => setDifferentMailingAddress(!!checked)}
                                        />
                                        <Label className="text-sm text-slate-600">عنوان البريد مختلف</Label>
                                    </div>

                                    {differentMailingAddress && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">مدينة البريد</Label>
                                                <Select value={mailingCity} onValueChange={setMailingCity}>
                                                    <SelectTrigger className="rounded-xl border-slate-200">
                                                        <SelectValue placeholder="اختر المدينة" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {saudiCities.map((c) => (
                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">عنوان البريد</Label>
                                                <Input
                                                    value={mailingAddress}
                                                    onChange={(e) => setMailingAddress(e.target.value)}
                                                    placeholder="العنوان البريدي"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CASE ASSIGNMENT */}
                            <Card className="rounded-3xl shadow-sm border-slate-100">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-emerald-500" />
                                        تعيين القضية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">
                                                المحامي المسؤول <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={responsibleLawyerId} onValueChange={setResponsibleLawyerId} disabled={loadingLawyers}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر المحامي" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {lawyers.map((lawyer: any) => (
                                                        <SelectItem key={lawyer._id} value={lawyer._id}>
                                                            {lawyer.firstName} {lawyer.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">المحامي المساعد</Label>
                                            <Select value={assistantLawyerId} onValueChange={setAssistantLawyerId} disabled={loadingLawyers}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue placeholder="اختر المحامي المساعد" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">بدون</SelectItem>
                                                    {lawyers.map((lawyer: any) => (
                                                        <SelectItem key={lawyer._id} value={lawyer._id}>
                                                            {lawyer.firstName} {lawyer.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">مصدر العميل</Label>
                                            <Select value={clientSource} onValueChange={(v) => setClientSource(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                                                    <SelectItem value="referral">إحالة</SelectItem>
                                                    <SelectItem value="returning">عميل سابق</SelectItem>
                                                    <SelectItem value="ads">إعلانات</SelectItem>
                                                    <SelectItem value="social">وسائل التواصل</SelectItem>
                                                    <SelectItem value="walkin">زيارة مباشرة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {clientSource === 'referral' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">أحيل من قبل</Label>
                                                    <Input
                                                        value={referredBy}
                                                        onChange={(e) => setReferredBy(e.target.value)}
                                                        placeholder="اسم المحيل"
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* BILLING INFO - CRITICAL FOR FINANCE LINKING */}
                            <Card className="rounded-3xl shadow-sm border-emerald-200 bg-emerald-50/30">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-500" />
                                        معلومات الفوترة
                                        <Badge className="bg-emerald-100 text-emerald-700 rounded-full text-xs">مرتبط بالمالية</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="rounded-xl bg-blue-50 border-blue-200">
                                        <AlertDescription className="text-blue-700 text-sm">
                                            هذه المعلومات ستظهر تلقائياً عند إنشاء فواتير أو مدفوعات لهذا العميل
                                        </AlertDescription>
                                    </Alert>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">نوع الفوترة <span className="text-red-500">*</span></Label>
                                            <Select value={billingType} onValueChange={(v) => setBillingType(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hourly">بالساعة</SelectItem>
                                                    <SelectItem value="flat_fee">رسوم ثابتة</SelectItem>
                                                    <SelectItem value="contingency">نسبة من التعويض</SelectItem>
                                                    <SelectItem value="retainer">عقد شامل</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">السعر بالساعة</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    value={hourlyRate || ''}
                                                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || null)}
                                                    placeholder="500"
                                                    className="flex-1 rounded-xl border-slate-200"
                                                />
                                                <Select value={currency} onValueChange={setCurrency}>
                                                    <SelectTrigger className="w-28 rounded-xl border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="SAR">ر.س</SelectItem>
                                                        <SelectItem value="USD">$</SelectItem>
                                                        <SelectItem value="EUR">€</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">شروط الدفع</Label>
                                            <Select value={paymentTerms} onValueChange={(v) => setPaymentTerms(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="immediate">فوري</SelectItem>
                                                    <SelectItem value="net_15">15 يوم</SelectItem>
                                                    <SelectItem value="net_30">30 يوم</SelectItem>
                                                    <SelectItem value="net_45">45 يوم</SelectItem>
                                                    <SelectItem value="net_60">60 يوم</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">الحد الائتماني</Label>
                                            <Input
                                                type="number"
                                                value={creditLimit || ''}
                                                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || null)}
                                                placeholder="50000"
                                                className="rounded-xl border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    {/* VAT - CRITICAL FOR ZATCA */}
                                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-sm font-medium text-slate-700">مسجل في ضريبة القيمة المضافة</Label>
                                            <Switch checked={isVatRegistered} onCheckedChange={setIsVatRegistered} />
                                        </div>
                                        {isVatRegistered && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">
                                                    الرقم الضريبي <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    value={vatNumber}
                                                    onChange={(e) => setVatNumber(e.target.value)}
                                                    placeholder="300000000000003"
                                                    className="rounded-xl border-slate-200"
                                                    dir="ltr"
                                                    maxLength={15}
                                                />
                                                <p className="text-xs text-slate-500">سيستخدم هذا الرقم في الفواتير الضريبية (ZATCA)</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount */}
                                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-sm font-medium text-slate-700">منح خصم</Label>
                                            <Switch checked={hasDiscount} onCheckedChange={setHasDiscount} />
                                        </div>
                                        {hasDiscount && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">نسبة الخصم (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={discountPercent || ''}
                                                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || null)}
                                                        placeholder="10"
                                                        className="rounded-xl border-slate-200"
                                                        max={100}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-slate-700">سبب الخصم</Label>
                                                    <Input
                                                        value={discountReason}
                                                        onChange={(e) => setDiscountReason(e.target.value)}
                                                        placeholder="عميل VIP / إحالة..."
                                                        className="rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">طريقة تسليم الفاتورة</Label>
                                            <Select value={invoiceDelivery} onValueChange={(v) => setInvoiceDelivery(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="email">البريد الإلكتروني</SelectItem>
                                                    <SelectItem value="mail">بريد عادي</SelectItem>
                                                    <SelectItem value="hand">تسليم يدوي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">لغة الفاتورة</Label>
                                            <Select value={invoiceLanguage} onValueChange={(v) => setInvoiceLanguage(v as any)}>
                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ar">العربية</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="both">ثنائية اللغة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* ADVANCED SECTIONS (Accordion) */}
                            <Accordion type="multiple" className="space-y-4">
                                {/* Power of Attorney */}
                                <AccordionItem value="poa" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Scale className="h-5 w-5 text-purple-500" />
                                            <span className="font-bold text-slate-800">الوكالة الشرعية</span>
                                            {hasPowerOfAttorney && mojStatus === 'verified' && (
                                                <Badge className="bg-green-100 text-green-700 rounded-full">تم التحقق</Badge>
                                            )}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={hasPowerOfAttorney}
                                                    onCheckedChange={(checked) => setHasPowerOfAttorney(!!checked)}
                                                />
                                                <Label className="text-sm font-medium text-slate-700">لدي وكالة شرعية</Label>
                                            </div>

                                            {hasPowerOfAttorney && (
                                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                    {/* Attorney ID verification */}
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">رقم هوية الوكيل</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={attorneyId}
                                                                onChange={(e) => setAttorneyId(e.target.value)}
                                                                placeholder="1234567890"
                                                                className="flex-1 rounded-xl border-slate-200"
                                                                dir="ltr"
                                                            />
                                                            <Button
                                                                type="button"
                                                                onClick={verifyWithMOJ}
                                                                disabled={mojStatus === 'loading'}
                                                                className="rounded-xl bg-indigo-500 hover:bg-indigo-600"
                                                            >
                                                                {mojStatus === 'loading' ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Search className="w-4 h-4 ms-2" aria-hidden="true" />
                                                                        تحقق
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {mojStatus === 'verified' && (
                                                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 space-y-2">
                                                            <VerificationBadge service="وزارة العدل" status={mojStatus} />
                                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                                <div><Label className="text-xs text-slate-500">اسم الوكيل</Label><p className="font-medium">{attorneyName}</p></div>
                                                                <div><Label className="text-xs text-slate-500">صفة الوكيل</Label><p className="font-medium">{attorneyType}</p></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">مصدر الوكالة</Label>
                                                            <Select value={poaSource} onValueChange={(v) => setPoaSource(v as any)}>
                                                                <SelectTrigger className="rounded-xl border-slate-200">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="notary">كتابة العدل</SelectItem>
                                                                    <SelectItem value="embassy">السفارة</SelectItem>
                                                                    <SelectItem value="court">المحكمة</SelectItem>
                                                                    <SelectItem value="other">أخرى</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium text-slate-700">رقم الوكالة</Label>
                                                            <Input
                                                                value={poaNumber}
                                                                onChange={(e) => setPoaNumber(e.target.value)}
                                                                className="rounded-xl border-slate-200"
                                                                dir="ltr"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-slate-700">الصلاحيات الممنوحة</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                            {[
                                                                { value: 'litigation', label: 'التقاضي' },
                                                                { value: 'contracting', label: 'التعاقد' },
                                                                { value: 'buying_selling', label: 'البيع والشراء' },
                                                                { value: 'acknowledgment', label: 'الإقرار' },
                                                                { value: 'settlement', label: 'التصالح' },
                                                                { value: 'receipt', label: 'القبض والإيصال' },
                                                            ].map((power) => (
                                                                <div key={power.value} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        checked={poaPowers.includes(power.value)}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                setPoaPowers([...poaPowers, power.value])
                                                                            } else {
                                                                                setPoaPowers(poaPowers.filter(p => p !== power.value))
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label className="text-sm">{power.label}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Communication Preferences */}
                                <AccordionItem value="communication" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-blue-500" />
                                            <span className="font-bold text-slate-800">تفضيلات الاتصال</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-slate-700">طرق الاتصال المسموحة</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {[
                                                        { value: allowEmail, setter: setAllowEmail, label: 'البريد الإلكتروني' },
                                                        { value: allowSms, setter: setAllowSms, label: 'الرسائل النصية' },
                                                        { value: allowWhatsapp, setter: setAllowWhatsapp, label: 'واتساب' },
                                                        { value: allowPhone, setter: setAllowPhone, label: 'الاتصال الهاتفي' },
                                                    ].map((item) => (
                                                        <div key={item.label} className="flex items-center gap-2">
                                                            <Checkbox checked={item.value} onCheckedChange={(v) => item.setter(!!v)} />
                                                            <Label className="text-sm">{item.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-slate-700">الإشعارات</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {[
                                                        { value: notifyCaseUpdates, setter: setNotifyCaseUpdates, label: 'تحديثات القضية' },
                                                        { value: notifyHearings, setter: setNotifyHearings, label: 'مواعيد الجلسات' },
                                                        { value: notifyInvoices, setter: setNotifyInvoices, label: 'إشعارات الفواتير' },
                                                        { value: notifyPayments, setter: setNotifyPayments, label: 'تذكير بالدفعات' },
                                                        { value: notifyNewsletter, setter: setNotifyNewsletter, label: 'النشرات القانونية' },
                                                    ].map((item) => (
                                                        <div key={item.label} className="flex items-center gap-2">
                                                            <Checkbox checked={item.value} onCheckedChange={(v) => item.setter(!!v)} />
                                                            <Label className="text-sm">{item.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Status & Flags */}
                                <AccordionItem value="flags" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                                            <span className="font-bold text-slate-800">حالة ومؤشرات</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {[
                                                    { value: isVip, setter: setIsVip, label: 'عميل VIP', color: 'text-amber-500' },
                                                    { value: isHighRisk, setter: setIsHighRisk, label: 'عالي المخاطر', color: 'text-red-500' },
                                                    { value: needsApproval, setter: setNeedsApproval, label: 'يحتاج موافقة', color: 'text-blue-500' },
                                                    { value: creditHold, setter: setCreditHold, label: 'إيقاف الائتمان', color: 'text-red-500' },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                        <Label className={cn("text-sm font-medium", item.color)}>{item.label}</Label>
                                                        <Switch checked={item.value} onCheckedChange={item.setter} />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Label className="text-sm font-medium text-red-700">في القائمة السوداء</Label>
                                                    <Switch checked={isBlacklisted} onCheckedChange={setIsBlacklisted} />
                                                </div>
                                                {isBlacklisted && (
                                                    <Textarea
                                                        value={blacklistReason}
                                                        onChange={(e) => setBlacklistReason(e.target.value)}
                                                        placeholder="سبب الإضافة للقائمة السوداء..."
                                                        className="rounded-xl border-red-200 min-h-[80px]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Notes & Tags */}
                                <AccordionItem value="notes" className="border rounded-3xl shadow-sm border-slate-100 overflow-hidden">
                                    <AccordionTrigger className="px-6 py-4 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-5 w-5 text-slate-500" />
                                            <span className="font-bold text-slate-800">الملاحظات والوسوم</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">ملاحظات عامة</Label>
                                                <Textarea
                                                    value={generalNotes}
                                                    onChange={(e) => setGeneralNotes(e.target.value)}
                                                    placeholder="ملاحظات تظهر للجميع..."
                                                    className="rounded-xl border-slate-200 min-h-[100px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">ملاحظات داخلية (لا تظهر للعميل)</Label>
                                                <Textarea
                                                    value={internalNotes}
                                                    onChange={(e) => setInternalNotes(e.target.value)}
                                                    placeholder="ملاحظات داخلية للفريق..."
                                                    className="rounded-xl border-slate-200 min-h-[100px]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">الوسوم</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        placeholder="أضف وسم..."
                                                        className="flex-1 rounded-xl border-slate-200"
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                    />
                                                    <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
                                                        <Plus className="w-4 h-4" aria-hidden="true" />
                                                    </Button>
                                                </div>
                                                {tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="rounded-full">
                                                                {tag}
                                                                <button onClick={() => removeTag(tag)} className="ms-1 hover:text-red-500">
                                                                    <X className="w-3 h-3" aria-hidden="true" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <Link to="/dashboard/clients">
                                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-slate-700 rounded-xl">
                                        <X className="ms-2 h-4 w-4" aria-hidden="true" />
                                        إلغاء
                                    </Button>
                                </Link>

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="rounded-xl">
                                        <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                        حفظ كمسودة
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 min-w-[160px]"
                                                disabled={isPending}
                                            >
                                                {isPending ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        جاري الحفظ...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        حفظ العميل
                                                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={handleSubmit}>
                                                <Save className="ms-2 h-4 w-4" aria-hidden="true" />
                                                حفظ فقط
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Briefcase className="ms-2 h-4 w-4" />
                                                حفظ وإنشاء قضية
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="ms-2 h-4 w-4" aria-hidden="true" />
                                                حفظ وإرسال ترحيب
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR */}
                    <ClientsSidebar context="clients" />
                </div>
            </Main>
        </>
    )
}
