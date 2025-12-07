import {
    ArrowRight, Edit, Phone, Mail, Building, User,
    Calendar, DollarSign, Target, TrendingUp,
    Activity, MessageSquare, Plus, CheckCircle,
    XCircle, Clock, Loader2, AlertCircle, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useLead, useUpdateLeadStage, useAddLeadActivity, useConvertLead } from '@/hooks/useAccounting'
import { ProductivityHero } from '@/components/productivity-hero'
import { SalesSidebar } from './sales-sidebar'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import type { LeadStage, LeadActivity } from '@/services/accountingService'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const STAGE_CONFIG: Record<LeadStage, { label: string; color: string; icon: React.ElementType }> = {
    new: { label: 'جديد', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
    contacted: { label: 'تم التواصل', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: MessageSquare },
    qualified: { label: 'مؤهل', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
    proposal: { label: 'عرض مقدم', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Target },
    negotiation: { label: 'مفاوضة', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: TrendingUp },
    won: { label: 'مكتسب', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
    lost: { label: 'مفقود', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
}

const SOURCE_LABELS: Record<string, string> = {
    website: 'الموقع الإلكتروني',
    referral: 'إحالة',
    social_media: 'وسائل التواصل',
    advertisement: 'إعلان',
    cold_call: 'اتصال مباشر',
    walk_in: 'زيارة شخصية',
    other: 'أخرى',
}

const ACTIVITY_TYPES = [
    { value: 'call', label: 'مكالمة' },
    { value: 'email', label: 'بريد إلكتروني' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'note', label: 'ملاحظة' },
    { value: 'task', label: 'مهمة' },
]

export default function LeadDetailsView() {
    const { leadId } = useParams({ from: '/_authenticated/dashboard/sales/leads/$leadId' })
    const navigate = useNavigate()

    const { data: leadData, isLoading, isError } = useLead(leadId)
    const updateStageMutation = useUpdateLeadStage()
    const addActivityMutation = useAddLeadActivity()
    const convertLeadMutation = useConvertLead()

    const [showActivityDialog, setShowActivityDialog] = useState(false)
    const [showStageDialog, setShowStageDialog] = useState(false)
    const [showConvertDialog, setShowConvertDialog] = useState(false)
    const [activityForm, setActivityForm] = useState({
        type: 'call' as 'call' | 'email' | 'meeting' | 'note' | 'task',
        description: '',
        outcome: '',
        date: new Date().toISOString().split('T')[0],
    })

    const lead = leadData?.data

    const topNav = [
        { title: 'العملاء المحتملين', href: '/dashboard/sales/leads', isActive: true },
    ]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'غير محدد'
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: arSA })
    }

    const handleChangeStage = async (newStage: LeadStage) => {
        try {
            await updateStageMutation.mutateAsync({ id: leadId, stage: newStage })
            setShowStageDialog(false)
        } catch (error) {
        }
    }

    const handleAddActivity = async () => {
        try {
            await addActivityMutation.mutateAsync({
                id: leadId,
                activity: {
                    type: activityForm.type,
                    description: activityForm.description,
                    outcome: activityForm.outcome,
                    date: activityForm.date,
                }
            })
            setShowActivityDialog(false)
            setActivityForm({
                type: 'call',
                description: '',
                outcome: '',
                date: new Date().toISOString().split('T')[0],
            })
        } catch (error) {
        }
    }

    const handleConvert = async () => {
        try {
            await convertLeadMutation.mutateAsync({ id: leadId })
            setShowConvertDialog(false)
            navigate({ to: '/dashboard/sales/leads' })
        } catch (error) {
        }
    }

    // Loading State
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Error State
    if (isError || !lead) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher className="text-slate-300" />
                        <ThemeSwitch className="text-slate-300" />
                        <ProfileDropdown className="text-slate-300" />
                    </div>
                </Header>
                <Main className="bg-[#f8f9fa] p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Button asChild variant="ghost" className="mb-6">
                            <Link to="/dashboard/sales/leads">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للعملاء المحتملين
                            </Link>
                        </Button>
                        <Card className="border-0 shadow-sm rounded-3xl p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-rose-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-navy mb-2">فشل تحميل العميل المحتمل</h3>
                            <p className="text-slate-500">العميل المحتمل غير موجود</p>
                        </Card>
                    </div>
                </Main>
            </>
        )
    }

    const stageConfig = STAGE_CONFIG[lead.stage]
    const StageIcon = stageConfig.icon

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
            </Header>

            <Main className="bg-[#f8f9fa] p-6 lg:p-8 space-y-6">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <Button asChild variant="ghost" className="text-slate-600 hover:text-navy">
                            <Link to="/dashboard/sales/leads">
                                <ArrowRight className="h-4 w-4 ms-2" />
                                العودة للعملاء المحتملين
                            </Link>
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowActivityDialog(true)}
                            >
                                <Plus className="h-4 w-4 ms-2" />
                                إضافة نشاط
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowStageDialog(true)}
                            >
                                <TrendingUp className="h-4 w-4 ms-2" />
                                تغيير المرحلة
                            </Button>
                            {lead.stage !== 'won' && lead.stage !== 'lost' && (
                                <Button
                                    onClick={() => setShowConvertDialog(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <UserCheck className="h-4 w-4 ms-2" />
                                    تحويل لعميل
                                </Button>
                            )}
                            <Button asChild variant="outline">
                                <Link to={`/dashboard/sales/leads/${leadId}/edit`}>
                                    <Edit className="h-4 w-4 ms-2" />
                                    تعديل
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Header Card */}
                    <ProductivityHero
                        badge={`عميل محتمل`}
                        title={`${lead.firstName} ${lead.lastName}`}
                        type="clients"
                        listMode={true}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Lead Info */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <User className="h-5 w-5 text-brand-blue" />
                                        معلومات العميل المحتمل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">الاسم الكامل</p>
                                            <p className="font-medium text-navy">{`${lead.firstName} ${lead.lastName}`}</p>
                                        </div>
                                        {lead.email && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">البريد الإلكتروني</p>
                                                <p className="font-medium text-navy flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-slate-500" />
                                                    {lead.email}
                                                </p>
                                            </div>
                                        )}
                                        {lead.phone && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">رقم الهاتف</p>
                                                <p className="font-medium text-navy flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-500" />
                                                    {lead.phone}
                                                </p>
                                            </div>
                                        )}
                                        {lead.company && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">الشركة</p>
                                                <p className="font-medium text-navy flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-slate-500" />
                                                    {lead.company}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">المصدر</p>
                                            <Badge variant="outline" className="font-normal">
                                                {SOURCE_LABELS[lead.source] || lead.source}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 mb-1">المرحلة</p>
                                            <Badge className={cn("font-normal border", stageConfig.color)}>
                                                <StageIcon className="h-3 w-3 ms-1" />
                                                {stageConfig.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financial Info */}
                            {(lead.estimatedValue || lead.expectedCloseDate) && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-brand-blue" />
                                            المعلومات المالية
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            {lead.estimatedValue && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">القيمة المتوقعة</p>
                                                    <p className="font-bold text-emerald-600 text-lg">
                                                        {formatCurrency(lead.estimatedValue)}
                                                    </p>
                                                </div>
                                            )}
                                            {lead.expectedCloseDate && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">تاريخ الإغلاق المتوقع</p>
                                                    <p className="font-medium text-navy flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-500" />
                                                        {formatDate(lead.expectedCloseDate)}
                                                    </p>
                                                </div>
                                            )}
                                            {lead.probability !== undefined && (
                                                <div>
                                                    <p className="text-sm text-slate-500 mb-1">احتمالية النجاح</p>
                                                    <p className="font-medium text-navy">{lead.probability}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Case Type & Description */}
                            {(lead.caseType || lead.description) && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy">تفاصيل القضية</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        {lead.caseType && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">نوع القضية</p>
                                                <p className="font-medium text-navy">{lead.caseType}</p>
                                            </div>
                                        )}
                                        {lead.description && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">الوصف</p>
                                                <p className="text-slate-600 whitespace-pre-wrap">{lead.description}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {lead.notes && (
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100">
                                        <CardTitle className="text-lg font-bold text-navy">ملاحظات</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <p className="text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Activities Timeline */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-brand-blue" />
                                        الأنشطة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {lead.activities && lead.activities.length > 0 ? (
                                        <div className="space-y-4">
                                            {lead.activities.map((activity) => (
                                                <div key={activity._id} className="flex gap-4 border-r-2 border-emerald-500 pe-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {ACTIVITY_TYPES.find(t => t.value === activity.type)?.label || activity.type}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500">
                                                                {formatDate(activity.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700">{activity.description}</p>
                                                        {activity.outcome && (
                                                            <p className="text-xs text-slate-500 mt-1">النتيجة: {activity.outcome}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-slate-500 py-8">لا توجد أنشطة بعد</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <SalesSidebar context="leads" />
                    </div>
                </div>
            </Main>

            {/* Add Activity Dialog */}
            <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة نشاط</DialogTitle>
                        <DialogDescription>
                            أضف نشاطاً جديداً لهذا العميل المحتمل
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">نوع النشاط</label>
                            <Select
                                value={activityForm.type}
                                onValueChange={(value: any) => setActivityForm(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVITY_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">التاريخ</label>
                            <Input
                                type="date"
                                value={activityForm.date}
                                onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">الوصف</label>
                            <Textarea
                                value={activityForm.description}
                                onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                placeholder="اكتب وصف النشاط..."
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">النتيجة (اختياري)</label>
                            <Input
                                value={activityForm.outcome}
                                onChange={(e) => setActivityForm(prev => ({ ...prev, outcome: e.target.value }))}
                                placeholder="ما هي نتيجة هذا النشاط؟"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowActivityDialog(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleAddActivity}
                            disabled={!activityForm.description || addActivityMutation.isPending}
                        >
                            {addActivityMutation.isPending && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
                            إضافة
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Stage Dialog */}
            <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغيير المرحلة</DialogTitle>
                        <DialogDescription>
                            اختر المرحلة الجديدة للعميل المحتمل
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {(Object.keys(STAGE_CONFIG) as LeadStage[]).map(stage => {
                            const config = STAGE_CONFIG[stage]
                            const Icon = config.icon
                            return (
                                <Button
                                    key={stage}
                                    variant={lead.stage === stage ? "default" : "outline"}
                                    className={cn(
                                        "h-auto py-4 flex flex-col items-center gap-2",
                                        lead.stage === stage && "ring-2 ring-emerald-500"
                                    )}
                                    onClick={() => handleChangeStage(stage)}
                                    disabled={updateStageMutation.isPending}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-sm">{config.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Convert to Client Dialog */}
            <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تحويل لعميل</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من تحويل هذا العميل المحتمل إلى عميل فعلي؟
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600">
                            سيتم إنشاء عميل جديد بالمعلومات التالية:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-2">
                            <p className="text-sm"><span className="font-medium">الاسم:</span> {lead.firstName} {lead.lastName}</p>
                            {lead.email && <p className="text-sm"><span className="font-medium">البريد:</span> {lead.email}</p>}
                            {lead.phone && <p className="text-sm"><span className="font-medium">الهاتف:</span> {lead.phone}</p>}
                            {lead.company && <p className="text-sm"><span className="font-medium">الشركة:</span> {lead.company}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleConvert}
                            disabled={convertLeadMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {convertLeadMutation.isPending && <Loader2 className="h-4 w-4 ms-2 animate-spin" />}
                            تحويل لعميل
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
