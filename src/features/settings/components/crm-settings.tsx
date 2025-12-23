import { useState, useEffect } from 'react'
import {
    Users, Briefcase, FileText, Mail, Calendar, Hash,
    MapPin, UserCheck, ArrowRight, Save, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { DEFAULT_CRM_SETTINGS, DEFAULT_WORKING_HOURS } from '@/types/crmSettings'
import type {
    LeadSettings,
    CaseSettings,
    QuoteSettings,
    CommunicationSettings,
    AppointmentSettings,
    NamingSettings,
    TerritorySettings,
    SalesPersonSettings,
    ConversionSettings,
} from '@/types/crmSettings'

/**
 * [BACKEND-PENDING] Backend Integration Required
 *
 * These are placeholder hooks that need to be replaced with actual API integration:
 *
 * 1. useCRMSettings:
 *    - Should fetch CRM settings from: GET /api/settings/crm
 *    - Handle loading states and error cases
 *    - Use React Query or similar for caching
 *
 * 2. useUpdateCRMSettings:
 *    - Should update CRM settings via: PUT /api/settings/crm
 *    - Handle success/error notifications
 *    - Invalidate cache on successful update
 *
 * Reference: /docs/api/settings-endpoints.md
 * Backend issue: #TBD (create issue in backend repository)
 */
const useCRMSettings = () => {
    return {
        data: null,
        isLoading: false,
        error: null, // [BACKEND-PENDING] Will contain error details when API is connected
    }
}

const useUpdateCRMSettings = () => {
    return {
        mutateAsync: async (data: any) => {
            console.log('[BACKEND-PENDING] Update CRM Settings (Placeholder - No backend connected):', data)
            // [BACKEND-PENDING] Replace with actual API call to PUT /api/settings/crm
            // Example bilingual error handling:
            // try {
            //   const response = await apiClient.put('/settings/crm', data)
            //   return response.data
            // } catch (error) {
            //   throw new Error('Failed to update CRM settings | فشل في تحديث إعدادات CRM')
            // }
            return Promise.resolve(data)
        },
        isPending: false,
        error: null, // [BACKEND-PENDING] Will contain error details when API is connected
    }
}

export default function CRMSettings() {
    const { data: settingsData, isLoading } = useCRMSettings()
    const updateSettingsMutation = useUpdateCRMSettings()

    const [formData, setFormData] = useState({
        leadSettings: DEFAULT_CRM_SETTINGS.leadSettings,
        caseSettings: DEFAULT_CRM_SETTINGS.caseSettings,
        quoteSettings: DEFAULT_CRM_SETTINGS.quoteSettings,
        communicationSettings: DEFAULT_CRM_SETTINGS.communicationSettings,
        appointmentSettings: DEFAULT_CRM_SETTINGS.appointmentSettings,
        namingSettings: DEFAULT_CRM_SETTINGS.namingSettings,
        territorySettings: DEFAULT_CRM_SETTINGS.territorySettings,
        salesPersonSettings: DEFAULT_CRM_SETTINGS.salesPersonSettings,
        conversionSettings: DEFAULT_CRM_SETTINGS.conversionSettings,
    })

    useEffect(() => {
        if (settingsData) {
            setFormData({
                leadSettings: settingsData.leadSettings || DEFAULT_CRM_SETTINGS.leadSettings,
                caseSettings: settingsData.caseSettings || DEFAULT_CRM_SETTINGS.caseSettings,
                quoteSettings: settingsData.quoteSettings || DEFAULT_CRM_SETTINGS.quoteSettings,
                communicationSettings: settingsData.communicationSettings || DEFAULT_CRM_SETTINGS.communicationSettings,
                appointmentSettings: settingsData.appointmentSettings || DEFAULT_CRM_SETTINGS.appointmentSettings,
                namingSettings: settingsData.namingSettings || DEFAULT_CRM_SETTINGS.namingSettings,
                territorySettings: settingsData.territorySettings || DEFAULT_CRM_SETTINGS.territorySettings,
                salesPersonSettings: settingsData.salesPersonSettings || DEFAULT_CRM_SETTINGS.salesPersonSettings,
                conversionSettings: settingsData.conversionSettings || DEFAULT_CRM_SETTINGS.conversionSettings,
            })
        }
    }, [settingsData])

    const handleSwitchChange = (section: string, field: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as any),
                [field]: checked
            }
        }))
    }

    const handleInputChange = (section: string, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as any),
                [field]: value
            }
        }))
    }

    const handleSelectChange = (section: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as any),
                [field]: value
            }
        }))
    }

    const handleWorkingHoursChange = (day: string, field: 'enabled' | 'start' | 'end', value: boolean | string) => {
        setFormData(prev => ({
            ...prev,
            appointmentSettings: {
                ...prev.appointmentSettings,
                workingHours: {
                    ...prev.appointmentSettings.workingHours,
                    [day]: {
                        ...prev.appointmentSettings.workingHours[day as keyof typeof prev.appointmentSettings.workingHours],
                        [field]: value
                    }
                }
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await updateSettingsMutation.mutateAsync(formData)
    }

    if (isLoading) {
        return (
            <>
                <Header>
                    <div className='ms-auto flex items-center gap-4'>
                        <LanguageSwitcher />
                        <ThemeSwitch />
                        <ProfileDropdown />
                    </div>
                </Header>
                <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <Skeleton className="h-[600px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center gap-4'>
                    <LanguageSwitcher />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="p-6 lg:p-8 bg-[#f8f9fa]">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-navy">إعدادات إدارة علاقات العملاء (CRM)</h1>
                        <p className="text-slate-500">تخصيص إعدادات العملاء المحتملين، القضايا، العروض، والمواعيد</p>
                    </div>

                    {/* Backend Integration Notice - Bilingual */}
                    <Alert className="mb-6 border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            <div className="space-y-2">
                                <p dir="rtl">
                                    <strong>[BACKEND-PENDING]</strong> هذه الصفحة قيد التطوير حالياً. التغييرات التي تجريها سيتم حفظها محلياً ولن يتم إرسالها إلى الخادم حتى يتم ربط واجهة برمجة التطبيقات (API).
                                </p>
                                <p dir="ltr" className="text-sm opacity-90">
                                    <strong>[BACKEND-PENDING]</strong> This page is under development. Changes will be saved locally and won't be sent to the server until the API is connected.
                                </p>
                                <p className="text-xs mt-2 font-mono" dir="ltr">
                                    Required endpoints: GET/PUT /api/settings/crm
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Tabs defaultValue="leads" dir="rtl" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto gap-1">
                                <TabsTrigger value="leads" className="flex flex-col items-center gap-1 py-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs">العملاء</span>
                                </TabsTrigger>
                                <TabsTrigger value="cases" className="flex flex-col items-center gap-1 py-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="text-xs">القضايا</span>
                                </TabsTrigger>
                                <TabsTrigger value="quotes" className="flex flex-col items-center gap-1 py-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs">العروض</span>
                                </TabsTrigger>
                                <TabsTrigger value="communication" className="flex flex-col items-center gap-1 py-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-xs">التواصل</span>
                                </TabsTrigger>
                                <TabsTrigger value="appointments" className="flex flex-col items-center gap-1 py-2">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">المواعيد</span>
                                </TabsTrigger>
                                <TabsTrigger value="naming" className="flex flex-col items-center gap-1 py-2">
                                    <Hash className="h-4 w-4" />
                                    <span className="text-xs">الترقيم</span>
                                </TabsTrigger>
                                <TabsTrigger value="territory" className="flex flex-col items-center gap-1 py-2">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-xs">المناطق</span>
                                </TabsTrigger>
                                <TabsTrigger value="sales" className="flex flex-col items-center gap-1 py-2">
                                    <UserCheck className="h-4 w-4" />
                                    <span className="text-xs">المبيعات</span>
                                </TabsTrigger>
                                <TabsTrigger value="conversion" className="flex flex-col items-center gap-1 py-2">
                                    <ArrowRight className="h-4 w-4" />
                                    <span className="text-xs">التحويل</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Lead Settings */}
                            <TabsContent value="leads" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-brand-blue" />
                                            إعدادات العملاء المحتملين
                                        </CardTitle>
                                        <CardDescription>
                                            إدارة التكرار، الإنشاء التلقائي، والتعيين للعملاء المحتملين
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>السماح بتكرار البريد الإلكتروني</Label>
                                                <p className="text-sm text-slate-500">السماح بإنشاء عملاء محتملين بنفس البريد</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.allowDuplicateEmails}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'allowDuplicateEmails', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>السماح بتكرار رقم الهاتف</Label>
                                                <p className="text-sm text-slate-500">السماح بإنشاء عملاء محتملين بنفس الهاتف</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.allowDuplicatePhones}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'allowDuplicatePhones', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>الإنشاء التلقائي لجهة الاتصال</Label>
                                                <p className="text-sm text-slate-500">إنشاء جهة اتصال تلقائياً من العميل المحتمل</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.autoCreateContact}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'autoCreateContact', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تفعيل تسجيل النقاط</Label>
                                                <p className="text-sm text-slate-500">تمكين تسجيل وترتيب العملاء المحتملين</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.leadScoringEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'leadScoringEnabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>التعيين التلقائي</Label>
                                                <p className="text-sm text-slate-500">تعيين العملاء المحتملين تلقائياً لأعضاء الفريق</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.autoAssignmentEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'autoAssignmentEnabled', checked)}
                                            />
                                        </div>

                                        {formData.leadSettings.autoAssignmentEnabled && (
                                            <div className="space-y-2 ms-4">
                                                <Label>قاعدة التعيين التلقائي</Label>
                                                <Select
                                                    value={formData.leadSettings.autoAssignmentRule}
                                                    onValueChange={(value) => handleSelectChange('leadSettings', 'autoAssignmentRule', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="round_robin">توزيع دائري</SelectItem>
                                                        <SelectItem value="load_balance">توزيع متوازن</SelectItem>
                                                        <SelectItem value="territory">حسب المنطقة</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تتبع وقت الاستجابة الأول</Label>
                                                <p className="text-sm text-slate-500">قياس السرعة في الرد على العملاء المحتملين</p>
                                            </div>
                                            <Switch
                                                checked={formData.leadSettings.trackFirstResponseTime}
                                                onCheckedChange={(checked) => handleSwitchChange('leadSettings', 'trackFirstResponseTime', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Case Settings */}
                            <TabsContent value="cases" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-brand-blue" />
                                            إعدادات القضايا والفرص
                                        </CardTitle>
                                        <CardDescription>
                                            إعدادات الإغلاق التلقائي، فحص التعارض، ومسار المبيعات
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>الإغلاق التلقائي للقضايا</Label>
                                                <p className="text-sm text-slate-500">إغلاق القضايا القديمة تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.caseSettings.autoCloseEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('caseSettings', 'autoCloseEnabled', checked)}
                                            />
                                        </div>

                                        {formData.caseSettings.autoCloseEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ms-4">
                                                <div className="space-y-2">
                                                    <Label>إغلاق القضية بعد (أيام)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.caseSettings.autoCloseAfterDays}
                                                        onChange={(e) => handleInputChange('caseSettings', 'autoCloseAfterDays', parseInt(e.target.value) || 90)}
                                                        min="1"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>يتطلب فحص التعارض</Label>
                                                <p className="text-sm text-slate-500">فحص التعارض إلزامي قبل المتابعة</p>
                                            </div>
                                            <Switch
                                                checked={formData.caseSettings.requireConflictCheck}
                                                onCheckedChange={(checked) => handleSwitchChange('caseSettings', 'requireConflictCheck', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إنشاء عرض سعر تلقائي عند التأهيل</Label>
                                                <p className="text-sm text-slate-500">إنشاء عرض سعر تلقائياً عند تأهيل القضية</p>
                                            </div>
                                            <Switch
                                                checked={formData.caseSettings.autoCreateQuoteOnQualified}
                                                onCheckedChange={(checked) => handleSwitchChange('caseSettings', 'autoCreateQuoteOnQualified', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Quote Settings */}
                            <TabsContent value="quotes" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-brand-blue" />
                                            إعدادات عروض الأسعار
                                        </CardTitle>
                                        <CardDescription>
                                            صلاحية العروض، التذكيرات، والموافقات
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>صلاحية العرض الافتراضية (أيام)</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.quoteSettings.defaultValidDays}
                                                    onChange={(e) => handleInputChange('quoteSettings', 'defaultValidDays', parseInt(e.target.value) || 30)}
                                                    min="1"
                                                />
                                                <p className="text-xs text-slate-500">عدد الأيام التي يظل فيها العرض صالحاً</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إرسال تذكير تلقائي</Label>
                                                <p className="text-sm text-slate-500">تذكير العميل قبل انتهاء صلاحية العرض</p>
                                            </div>
                                            <Switch
                                                checked={formData.quoteSettings.autoSendReminder}
                                                onCheckedChange={(checked) => handleSwitchChange('quoteSettings', 'autoSendReminder', checked)}
                                            />
                                        </div>

                                        {formData.quoteSettings.autoSendReminder && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ms-4">
                                                <div className="space-y-2">
                                                    <Label>إرسال التذكير قبل (أيام)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.quoteSettings.reminderDaysBefore}
                                                        onChange={(e) => handleInputChange('quoteSettings', 'reminderDaysBefore', parseInt(e.target.value) || 7)}
                                                        min="1"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>يتطلب موافقة</Label>
                                                <p className="text-sm text-slate-500">موافقة المدير مطلوبة لإرسال العروض</p>
                                            </div>
                                            <Switch
                                                checked={formData.quoteSettings.requireApproval}
                                                onCheckedChange={(checked) => handleSwitchChange('quoteSettings', 'requireApproval', checked)}
                                            />
                                        </div>

                                        {formData.quoteSettings.requireApproval && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ms-4">
                                                <div className="space-y-2">
                                                    <Label>حد الموافقة (ر.س)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.quoteSettings.approvalThreshold || ''}
                                                        onChange={(e) => handleInputChange('quoteSettings', 'approvalThreshold', parseInt(e.target.value) || 0)}
                                                        min="0"
                                                        placeholder="100000"
                                                    />
                                                    <p className="text-xs text-slate-500">المبلغ الذي يتطلب موافقة المدير</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Communication Settings */}
                            <TabsContent value="communication" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-brand-blue" />
                                            إعدادات التواصل
                                        </CardTitle>
                                        <CardDescription>
                                            الحفاظ على الاتصالات، الطوابع الزمنية، والتسجيل التلقائي
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>الحفاظ على الاتصالات</Label>
                                                <p className="text-sm text-slate-500">نسخ الرسائل عبر مراحل المسار</p>
                                            </div>
                                            <Switch
                                                checked={formData.communicationSettings.carryForwardCommunication}
                                                onCheckedChange={(checked) => handleSwitchChange('communicationSettings', 'carryForwardCommunication', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تحديث الطابع الزمني عند التواصل</Label>
                                                <p className="text-sm text-slate-500">تتبع آخر نشاط للتواصل</p>
                                            </div>
                                            <Switch
                                                checked={formData.communicationSettings.updateTimestampOnCommunication}
                                                onCheckedChange={(checked) => handleSwitchChange('communicationSettings', 'updateTimestampOnCommunication', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تسجيل البريد الإلكتروني تلقائياً</Label>
                                                <p className="text-sm text-slate-500">تسجيل الرسائل الواردة والصادرة تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.communicationSettings.autoLogEmails}
                                                onCheckedChange={(checked) => handleSwitchChange('communicationSettings', 'autoLogEmails', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تسجيل المكالمات تلقائياً</Label>
                                                <p className="text-sm text-slate-500">تسجيل المكالمات الهاتفية تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.communicationSettings.autoLogCalls}
                                                onCheckedChange={(checked) => handleSwitchChange('communicationSettings', 'autoLogCalls', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تسجيل رسائل واتساب تلقائياً</Label>
                                                <p className="text-sm text-slate-500">تسجيل محادثات واتساب تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.communicationSettings.autoLogWhatsApp}
                                                onCheckedChange={(checked) => handleSwitchChange('communicationSettings', 'autoLogWhatsApp', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Appointment Settings */}
                            <TabsContent value="appointments" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-brand-blue" />
                                            إعدادات المواعيد
                                        </CardTitle>
                                        <CardDescription>
                                            الجدولة، المدة، وساعات العمل
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تفعيل نظام المواعيد</Label>
                                                <p className="text-sm text-slate-500">السماح بحجز المواعيد للعملاء</p>
                                            </div>
                                            <Switch
                                                checked={formData.appointmentSettings.enabled}
                                                onCheckedChange={(checked) => handleSwitchChange('appointmentSettings', 'enabled', checked)}
                                            />
                                        </div>

                                        {formData.appointmentSettings.enabled && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>مدة الموعد الافتراضية (دقيقة)</Label>
                                                        <Select
                                                            value={formData.appointmentSettings.defaultDuration.toString()}
                                                            onValueChange={(value) => handleInputChange('appointmentSettings', 'defaultDuration', parseInt(value))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="15">15 دقيقة</SelectItem>
                                                                <SelectItem value="30">30 دقيقة</SelectItem>
                                                                <SelectItem value="45">45 دقيقة</SelectItem>
                                                                <SelectItem value="60">60 دقيقة</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>الحجز المسبق (أيام)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.appointmentSettings.advanceBookingDays}
                                                            onChange={(e) => handleInputChange('appointmentSettings', 'advanceBookingDays', parseInt(e.target.value) || 30)}
                                                            min="1"
                                                        />
                                                        <p className="text-xs text-slate-500">كم يوم مقدماً يمكن للعميل الحجز</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>الحد الأدنى للحجز (ساعات)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.appointmentSettings.minAdvanceBookingHours}
                                                            onChange={(e) => handleInputChange('appointmentSettings', 'minAdvanceBookingHours', parseInt(e.target.value) || 2)}
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>الفاصل بين المواعيد (دقيقة)</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.appointmentSettings.bufferBetweenAppointments}
                                                            onChange={(e) => handleInputChange('appointmentSettings', 'bufferBetweenAppointments', parseInt(e.target.value) || 0)}
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Working Hours */}
                                                <div className="space-y-3 mt-6">
                                                    <Label className="text-base">ساعات العمل</Label>
                                                    <div className="space-y-2">
                                                        {Object.entries(formData.appointmentSettings.workingHours).map(([day, hours]) => (
                                                            <div key={day} className="grid grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <Switch
                                                                        checked={hours.enabled}
                                                                        onCheckedChange={(checked) => handleWorkingHoursChange(day, 'enabled', checked)}
                                                                    />
                                                                    <Label className="text-sm">
                                                                        {day === 'sunday' && 'الأحد'}
                                                                        {day === 'monday' && 'الإثنين'}
                                                                        {day === 'tuesday' && 'الثلاثاء'}
                                                                        {day === 'wednesday' && 'الأربعاء'}
                                                                        {day === 'thursday' && 'الخميس'}
                                                                        {day === 'friday' && 'الجمعة'}
                                                                        {day === 'saturday' && 'السبت'}
                                                                    </Label>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">من</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={hours.start}
                                                                        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                                                                        disabled={!hours.enabled}
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">إلى</Label>
                                                                    <Input
                                                                        type="time"
                                                                        value={hours.end}
                                                                        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                                                                        disabled={!hours.enabled}
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>إرسال تذكيرات</Label>
                                                        <p className="text-sm text-slate-500">إرسال تذكيرات قبل الموعد</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.appointmentSettings.sendReminders}
                                                        onCheckedChange={(checked) => handleSwitchChange('appointmentSettings', 'sendReminders', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>تفعيل الحجز العام</Label>
                                                        <p className="text-sm text-slate-500">السماح للعملاء بالحجز عبر صفحة عامة</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.appointmentSettings.publicBookingEnabled}
                                                        onCheckedChange={(checked) => handleSwitchChange('appointmentSettings', 'publicBookingEnabled', checked)}
                                                    />
                                                </div>

                                                {formData.appointmentSettings.publicBookingEnabled && (
                                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl ms-4">
                                                        <div>
                                                            <Label>يتطلب التحقق من الهاتف</Label>
                                                            <p className="text-sm text-slate-500">التحقق من رقم الهاتف قبل الحجز</p>
                                                        </div>
                                                        <Switch
                                                            checked={formData.appointmentSettings.requirePhoneVerification}
                                                            onCheckedChange={(checked) => handleSwitchChange('appointmentSettings', 'requirePhoneVerification', checked)}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Naming Settings */}
                            <TabsContent value="naming" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Hash className="h-5 w-5 text-brand-blue" />
                                            إعدادات الترقيم والتسمية
                                        </CardTitle>
                                        <CardDescription>
                                            البادئات وتنسيق الأرقام للمستندات
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>بادئة العميل المحتمل</Label>
                                                <Input
                                                    value={formData.namingSettings.leadPrefix}
                                                    onChange={(e) => handleInputChange('namingSettings', 'leadPrefix', e.target.value)}
                                                    placeholder="LEAD-"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>بادئة القضية</Label>
                                                <Input
                                                    value={formData.namingSettings.casePrefix}
                                                    onChange={(e) => handleInputChange('namingSettings', 'casePrefix', e.target.value)}
                                                    placeholder="CASE-"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>بادئة عرض السعر</Label>
                                                <Input
                                                    value={formData.namingSettings.quotePrefix}
                                                    onChange={(e) => handleInputChange('namingSettings', 'quotePrefix', e.target.value)}
                                                    placeholder="QT-"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>بادئة العقد</Label>
                                                <Input
                                                    value={formData.namingSettings.contractPrefix}
                                                    onChange={(e) => handleInputChange('namingSettings', 'contractPrefix', e.target.value)}
                                                    placeholder="CTR-"
                                                    dir="ltr"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>بادئة الموعد</Label>
                                                <Input
                                                    value={formData.namingSettings.appointmentPrefix}
                                                    onChange={(e) => handleInputChange('namingSettings', 'appointmentPrefix', e.target.value)}
                                                    placeholder="APT-"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>تنسيق الرقم</Label>
                                                <Select
                                                    value={formData.namingSettings.numberFormat}
                                                    onValueChange={(value) => handleSelectChange('namingSettings', 'numberFormat', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="YYYY-####">YYYY-#### (2025-0001)</SelectItem>
                                                        <SelectItem value="YYMM-####">YYMM-#### (2501-0001)</SelectItem>
                                                        <SelectItem value="####">#### (0001)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إعادة تعيين الترقيم سنوياً</Label>
                                                <p className="text-sm text-slate-500">البدء من 1 في كل سنة جديدة</p>
                                            </div>
                                            <Switch
                                                checked={formData.namingSettings.resetNumberingYearly}
                                                onCheckedChange={(checked) => handleSwitchChange('namingSettings', 'resetNumberingYearly', checked)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>تسمية الحملات</Label>
                                            <Select
                                                value={formData.namingSettings.campaignNamingBy}
                                                onValueChange={(value) => handleSelectChange('namingSettings', 'campaignNamingBy', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="name">حسب الاسم</SelectItem>
                                                    <SelectItem value="series">حسب السلسلة</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Territory Settings */}
                            <TabsContent value="territory" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-brand-blue" />
                                            إعدادات المناطق الجغرافية
                                        </CardTitle>
                                        <CardDescription>
                                            تفعيل وإدارة المناطق الجغرافية
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تفعيل إدارة المناطق</Label>
                                                <p className="text-sm text-slate-500">تمكين تنظيم العملاء والقضايا حسب المنطقة</p>
                                            </div>
                                            <Switch
                                                checked={formData.territorySettings.enabled}
                                                onCheckedChange={(checked) => handleSwitchChange('territorySettings', 'enabled', checked)}
                                            />
                                        </div>

                                        {formData.territorySettings.enabled && (
                                            <>
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>التعيين التلقائي حسب المنطقة</Label>
                                                        <p className="text-sm text-slate-500">تعيين العملاء تلقائياً بناءً على المنطقة</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.territorySettings.autoAssignByTerritory}
                                                        onCheckedChange={(checked) => handleSwitchChange('territorySettings', 'autoAssignByTerritory', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>المنطقة مطلوبة للعميل المحتمل</Label>
                                                        <p className="text-sm text-slate-500">إلزامية اختيار المنطقة عند إنشاء عميل محتمل</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.territorySettings.requireTerritoryOnLead}
                                                        onCheckedChange={(checked) => handleSwitchChange('territorySettings', 'requireTerritoryOnLead', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                    <div>
                                                        <Label>المنطقة مطلوبة للقضية</Label>
                                                        <p className="text-sm text-slate-500">إلزامية اختيار المنطقة عند إنشاء قضية</p>
                                                    </div>
                                                    <Switch
                                                        checked={formData.territorySettings.requireTerritoryOnCase}
                                                        onCheckedChange={(checked) => handleSwitchChange('territorySettings', 'requireTerritoryOnCase', checked)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Sales Person Settings */}
                            <TabsContent value="sales" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5 text-brand-blue" />
                                            إعدادات فريق المبيعات
                                        </CardTitle>
                                        <CardDescription>
                                            التسلسل الهرمي، العمولات، والأهداف
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تفعيل التسلسل الهرمي</Label>
                                                <p className="text-sm text-slate-500">تمكين هيكل تنظيمي لفريق المبيعات</p>
                                            </div>
                                            <Switch
                                                checked={formData.salesPersonSettings.hierarchyEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('salesPersonSettings', 'hierarchyEnabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تتبع العمولات</Label>
                                                <p className="text-sm text-slate-500">حساب وتتبع عمولات المبيعات</p>
                                            </div>
                                            <Switch
                                                checked={formData.salesPersonSettings.commissionTrackingEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('salesPersonSettings', 'commissionTrackingEnabled', checked)}
                                            />
                                        </div>

                                        {formData.salesPersonSettings.commissionTrackingEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ms-4">
                                                <div className="space-y-2">
                                                    <Label>نسبة العمولة الافتراضية (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.salesPersonSettings.defaultCommissionRate}
                                                        onChange={(e) => handleInputChange('salesPersonSettings', 'defaultCommissionRate', parseFloat(e.target.value) || 5)}
                                                        min="0"
                                                        max="100"
                                                        step="0.5"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>تتبع الأهداف</Label>
                                                <p className="text-sm text-slate-500">تحديد ومتابعة أهداف المبيعات</p>
                                            </div>
                                            <Switch
                                                checked={formData.salesPersonSettings.targetTrackingEnabled}
                                                onCheckedChange={(checked) => handleSwitchChange('salesPersonSettings', 'targetTrackingEnabled', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>موظف المبيعات مطلوب للقضية</Label>
                                                <p className="text-sm text-slate-500">إلزامية تحديد موظف مبيعات لكل قضية</p>
                                            </div>
                                            <Switch
                                                checked={formData.salesPersonSettings.requireSalesPersonOnCase}
                                                onCheckedChange={(checked) => handleSwitchChange('salesPersonSettings', 'requireSalesPersonOnCase', checked)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Conversion Settings */}
                            <TabsContent value="conversion" className="space-y-4">
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowRight className="h-5 w-5 text-brand-blue" />
                                            إعدادات التحويل
                                        </CardTitle>
                                        <CardDescription>
                                            قواعد الإنشاء التلقائي ونسخ البيانات
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إنشاء قضية تلقائياً بعد الاستشارة</Label>
                                                <p className="text-sm text-slate-500">تحويل العميل المحتمل إلى قضية تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.autoCreateCaseOnConsultation}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'autoCreateCaseOnConsultation', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>يتطلب تقييم BANT قبل القضية</Label>
                                                <p className="text-sm text-slate-500">التأكد من التقييم قبل إنشاء قضية</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.requireBANTBeforeCase}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'requireBANTBeforeCase', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إنشاء عرض سعر تلقائياً عند التأهيل</Label>
                                                <p className="text-sm text-slate-500">إنشاء عرض سعر عند تأهيل القضية</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.autoCreateQuoteOnQualified}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'autoCreateQuoteOnQualified', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إنشاء أمر مبيعات تلقائياً عند القبول</Label>
                                                <p className="text-sm text-slate-500">تحويل عرض السعر إلى أمر مبيعات تلقائياً</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.autoCreateSalesOrderOnAccept}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'autoCreateSalesOrderOnAccept', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>ربط أمر المبيعات بالمالية</Label>
                                                <p className="text-sm text-slate-500">ربط أوامر المبيعات بوحدة المالية</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.linkSalesOrderToFinance}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'linkSalesOrderToFinance', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <Label>إنشاء عميل تلقائياً مع أمر المبيعات</Label>
                                                <p className="text-sm text-slate-500">تحويل العميل المحتمل إلى عميل فعلي</p>
                                            </div>
                                            <Switch
                                                checked={formData.conversionSettings.autoCreateClientOnSalesOrder}
                                                onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'autoCreateClientOnSalesOrder', checked)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>محفز إنشاء العميل</Label>
                                            <Select
                                                value={formData.conversionSettings.clientCreationTrigger}
                                                onValueChange={(value) => handleSelectChange('conversionSettings', 'clientCreationTrigger', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sales_order">عند أمر المبيعات</SelectItem>
                                                    <SelectItem value="payment_received">عند استلام الدفعة</SelectItem>
                                                    <SelectItem value="manual">يدوي</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <Label className="text-base mb-3 block">البيانات المراد نسخها أثناء التحويل</Label>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <Label>نسخ الملاحظات</Label>
                                                <Switch
                                                    checked={formData.conversionSettings.copyNotesToCase}
                                                    onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'copyNotesToCase', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mt-2">
                                                <Label>نسخ سجل النشاط</Label>
                                                <Switch
                                                    checked={formData.conversionSettings.copyActivityHistory}
                                                    onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'copyActivityHistory', checked)}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mt-2">
                                                <Label>نسخ المستندات</Label>
                                                <Switch
                                                    checked={formData.conversionSettings.copyDocuments}
                                                    onCheckedChange={(checked) => handleSwitchChange('conversionSettings', 'copyDocuments', checked)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-brand-blue hover:bg-brand-blue/90"
                                disabled={updateSettingsMutation.isPending}
                            >
                                {updateSettingsMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                )}
                                حفظ التغييرات
                            </Button>
                        </div>
                    </form>
                </div>
            </Main>
        </>
    )
}
