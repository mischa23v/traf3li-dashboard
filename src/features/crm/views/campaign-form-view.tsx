import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Save, Loader2, Mail, Users, Calendar, DollarSign,
    FileText, Target, ChevronDown, ChevronUp, Megaphone,
    Globe, Phone, MessageSquare, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { cn } from '@/lib/utils'

interface CampaignFormViewProps {
    editMode?: boolean
    campaignId?: string
    initialData?: {
        name?: string
        nameAr?: string
        type?: 'email' | 'social' | 'phone' | 'event'
        description?: string
        objective?: string
        targetAudience?: 'leads' | 'clients' | 'all'
        targetSegments?: string[]
        budget?: number
        startDate?: string
        endDate?: string
        status?: 'draft' | 'scheduled' | 'active'
        subject?: string
        content?: string
        callToAction?: string
    }
}

export function CampaignFormView({ editMode = false, campaignId, initialData }: CampaignFormViewProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const createCampaignMutation = useCreateCampaign()
    const updateCampaignMutation = useUpdateCampaign()

    // Form state
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        nameAr: initialData?.nameAr || '',
        type: initialData?.type || 'email' as 'email' | 'social' | 'phone' | 'event',
        description: initialData?.description || '',
        objective: initialData?.objective || '',
        targetAudience: initialData?.targetAudience || 'all' as 'leads' | 'clients' | 'all',
        targetSegments: initialData?.targetSegments || [] as string[],
        budget: initialData?.budget || 0,
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        status: initialData?.status || 'draft' as 'draft' | 'scheduled' | 'active',
        subject: initialData?.subject || '',
        content: initialData?.content || '',
        callToAction: initialData?.callToAction || '',
    })

    // Section toggles
    const [showContent, setShowContent] = useState(false)

    // Form validation state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData && editMode) {
            setFormData({
                name: initialData.name || '',
                nameAr: initialData.nameAr || '',
                type: initialData.type || 'email',
                description: initialData.description || '',
                objective: initialData.objective || '',
                targetAudience: initialData.targetAudience || 'all',
                targetSegments: initialData.targetSegments || [],
                budget: initialData.budget || 0,
                startDate: initialData.startDate || '',
                endDate: initialData.endDate || '',
                status: initialData.status || 'draft',
                subject: initialData.subject || '',
                content: initialData.content || '',
                callToAction: initialData.callToAction || '',
            })
        }
    }, [initialData, editMode])

    // Validate a single field (validation disabled for testing)
    const validateField = (_field: string, _value: any): string => {
        return ''
    }

    // Handle field blur for validation
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        const error = validateField(field, formData[field as keyof typeof formData])
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Validate all required fields (validation disabled for testing)
    const validateForm = (): boolean => {
        return true
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return
        }

        const campaignData = {
            name: formData.name,
            nameAr: formData.nameAr,
            type: formData.type,
            description: formData.description,
            objective: formData.objective,
            targetAudience: formData.targetAudience,
            targetSegments: formData.targetSegments,
            budget: formData.budget,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status,
            subject: formData.subject,
            content: formData.content,
            callToAction: formData.callToAction,
        }

        if (editMode && campaignId) {
            updateCampaignMutation.mutate({ id: campaignId, data: campaignData }, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.campaigns.list })
                }
            })
        } else {
            createCampaignMutation.mutate(campaignData, {
                onSuccess: () => {
                    navigate({ to: ROUTES.dashboard.crm.campaigns.list })
                }
            })
        }
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
        { title: 'إدارة علاقات العملاء', href: ROUTES.dashboard.crm.campaigns.list, isActive: true },
        { title: 'المهام', href: ROUTES.dashboard.tasks.list, isActive: false },
        { title: 'القضايا', href: ROUTES.dashboard.cases.list, isActive: false },
    ]

    const getCampaignTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="w-4 h-4" />
            case 'social':
                return <Globe className="w-4 h-4" />
            case 'phone':
                return <Phone className="w-4 h-4" />
            case 'event':
                return <Calendar className="w-4 h-4" />
            default:
                return <Megaphone className="w-4 h-4" />
        }
    }

    const getCampaignTypeLabel = (type: string) => {
        switch (type) {
            case 'email':
                return 'بريد إلكتروني'
            case 'social':
                return 'وسائل التواصل'
            case 'phone':
                return 'هاتف'
            case 'event':
                return 'حدث'
            default:
                return type
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700'
            case 'scheduled':
                return 'bg-blue-100 text-blue-700'
            case 'draft':
                return 'bg-slate-100 text-slate-700'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'نشط'
            case 'scheduled':
                return 'مجدول'
            case 'draft':
                return 'مسودة'
            default:
                return status
        }
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                {/* HERO CARD - Full width */}
                <ProductivityHero
                    badge="إدارة علاقات العملاء"
                    title={editMode ? "تحرير الحملة" : "إنشاء حملة"}
                    type="tasks"
                    listMode={true}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        المعلومات الأساسية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم الحملة (إنجليزي)
                                            </label>
                                            <Input
                                                placeholder="مثال: Summer Campaign 2024"
                                                className={cn(
                                                    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
                                                    touched.name && errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                value={formData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                onBlur={() => handleBlur('name')}
                                            />
                                            {touched.name && errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                اسم الحملة (عربي)
                                            </label>
                                            <Input
                                                placeholder="مثال: حملة الصيف 2024"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.nameAr}
                                                onChange={(e) => handleChange('nameAr', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Megaphone className="w-4 h-4 text-emerald-500" />
                                            نوع الحملة
                                        </label>
                                        <Select value={formData.type} onValueChange={(value: 'email' | 'social' | 'phone' | 'event') => handleChange('type', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر نوع الحملة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="email">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-blue-500" />
                                                        بريد إلكتروني
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="social">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-purple-500" />
                                                        وسائل التواصل
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="phone">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-green-500" />
                                                        هاتف
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="event">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-orange-500" />
                                                        حدث
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-emerald-500" />
                                        التفاصيل
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            الوصف
                                        </label>
                                        <Textarea
                                            placeholder="أدخل وصف مفصل للحملة..."
                                            className="min-h-[100px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            الهدف
                                        </label>
                                        <Input
                                            placeholder="مثال: زيادة الوعي بالعلامة التجارية"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.objective}
                                            onChange={(e) => handleChange('objective', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Targeting Section */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                        الاستهداف
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-500" />
                                            الجمهور المستهدف
                                        </label>
                                        <Select value={formData.targetAudience} onValueChange={(value: 'leads' | 'clients' | 'all') => handleChange('targetAudience', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                <SelectValue placeholder="اختر الجمهور المستهدف" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="leads">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                                        العملاء المحتملين
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="clients">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        العملاء الحاليين
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                        الجميع
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                            القطاعات المستهدفة
                                        </label>
                                        <Input
                                            placeholder="مثال: قطاع الأعمال، القطاع العقاري (افصل بفاصلة)"
                                            className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                            value={formData.targetSegments.join(', ')}
                                            onChange={(e) => handleChange('targetSegments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                        />
                                    </div>
                                </div>

                                {/* Schedule Section */}
                                <div className="border-t border-slate-100 pt-6 space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-emerald-500" />
                                        الجدولة والميزانية
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                الميزانية (ريال)
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.budget || ''}
                                                onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Badge className="w-4 h-4 text-emerald-500" />
                                                الحالة
                                            </label>
                                            <Select value={formData.status} onValueChange={(value: 'draft' | 'scheduled' | 'active') => handleChange('status', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                                                    <SelectValue placeholder="اختر الحالة" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                                                            مسودة
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="scheduled">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                            مجدول
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            نشط
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ البدء
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.startDate}
                                                onChange={(e) => handleChange('startDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                تاريخ الانتهاء
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                value={formData.endDate}
                                                onChange={(e) => handleChange('endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Section (Collapsible) */}
                                <Collapsible open={showContent} onOpenChange={setShowContent}>
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="flex-1 justify-start p-0 h-auto hover:bg-transparent">
                                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                                                        المحتوى
                                                    </h3>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                                    {showContent ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent className="mt-4">
                                            <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        موضوع الرسالة
                                                    </label>
                                                    <Input
                                                        placeholder="أدخل موضوع الرسالة..."
                                                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                        value={formData.subject}
                                                        onChange={(e) => handleChange('subject', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        محتوى الرسالة
                                                    </label>
                                                    <Textarea
                                                        placeholder="أدخل محتوى الرسالة..."
                                                        className="min-h-[150px] rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                        value={formData.content}
                                                        onChange={(e) => handleChange('content', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        دعوة لاتخاذ إجراء
                                                    </label>
                                                    <Input
                                                        placeholder="مثال: سجل الآن، اتصل بنا..."
                                                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                                                        value={formData.callToAction}
                                                        onChange={(e) => handleChange('callToAction', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to={ROUTES.dashboard.crm.campaigns.list}>
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-emerald-500/20"
                                        disabled={editMode ? updateCampaignMutation.isPending : createCampaignMutation.isPending}
                                    >
                                        {(editMode ? updateCampaignMutation.isPending : createCampaignMutation.isPending) ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" aria-hidden="true" />
                                                {editMode ? 'حفظ التغييرات' : 'حفظ الحملة'}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* SIDEBAR - Campaign Info */}
                    <div className="space-y-4">
                        {/* Quick Info Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-800 mb-4">ملخص الحملة</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">النوع:</span>
                                    <Badge variant="secondary" className="gap-1">
                                        {getCampaignTypeIcon(formData.type)}
                                        {getCampaignTypeLabel(formData.type)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">الحالة:</span>
                                    <Badge variant="secondary" className={getStatusBadgeColor(formData.status)}>
                                        {getStatusLabel(formData.status)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">الجمهور:</span>
                                    <span className="font-medium text-slate-900">
                                        {formData.targetAudience === 'leads' ? 'عملاء محتملين' :
                                         formData.targetAudience === 'clients' ? 'عملاء حاليين' : 'الجميع'}
                                    </span>
                                </div>
                                {formData.budget > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">الميزانية:</span>
                                        <span className="font-medium text-emerald-600">{formData.budget.toLocaleString()} ريال</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                            <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                نصائح لحملة ناجحة
                            </h3>
                            <ul className="space-y-2 text-sm text-emerald-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>حدد هدفاً واضحاً وقابلاً للقياس</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>استهدف الجمهور المناسب</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>اختبر المحتوى قبل الإطلاق</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span>تابع النتائج بانتظام</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

// Export as both named and default export
export default CampaignFormView
