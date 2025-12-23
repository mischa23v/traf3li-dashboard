import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Shield, Save, Palette, Upload, Phone, Mail,
    Clock, Key, Lock, Users, Database, FileText,
    AlertCircle, Globe, Loader2, Settings, CheckCircle,
    Webhook, Code, Download, Trash2, Plus, Eye, EyeOff,
    Crown, Building2, HeadphonesIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateFile, FILE_TYPES, SIZE_LIMITS } from '@/lib/file-validation'
import { Separator } from '@/components/ui/separator'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Enterprise badge component
function EnterpriseBadge() {
    const { i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    return (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
            <Crown className="h-3 w-3" />
            {isRTL ? 'مميزات المؤسسات' : 'Enterprise Only'}
        </Badge>
    )
}

// API Key type
interface ApiKey {
    id: string
    name: string
    nameAr: string
    key: string
    createdAt: string
    lastUsed?: string
}

// Webhook type
interface Webhook {
    id: string
    name: string
    nameAr: string
    url: string
    events: string[]
    isActive: boolean
}

export default function EnterpriseSettings() {
    const { i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const { isAdminOrOwner, isLoading: permissionsLoading } = usePermissions()

    // Check if user has permission to access enterprise settings
    const hasAccess = isAdminOrOwner()

    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Security & Compliance Form Data
    const [securityData, setSecurityData] = useState({
        ssoEnabled: false,
        samlConfigured: false,
        twoFactorEnforced: false,
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumbers: true,
        passwordRequireSpecialChars: true,
        sessionTimeout: 30,
        ipWhitelist: '',
    })

    // Branding Form Data
    const [brandingData, setBrandingData] = useState({
        customLogo: '',
        primaryColor: '#2563eb',
        secondaryColor: '#10b981',
        customEmailTemplates: false,
        whiteLabel: false,
        companyName: '',
        companyNameAr: '',
    })

    // SLA & Support Data
    const [slaData, setSlaData] = useState({
        slaLevel: 'enterprise',
        supportEmail: 'enterprise-support@traf3li.com',
        supportPhone: '+966 11 XXX XXXX',
        accountManager: 'أحمد محمد',
        accountManagerEmail: 'ahmad.m@traf3li.com',
        responseTime: '2 ساعة',
        resolutionTime: '24 ساعة',
    })

    // Data & Privacy Form Data
    const [dataPrivacyData, setDataPrivacyData] = useState({
        dataRetentionPeriod: 365,
        autoDeleteOldData: false,
        gdprCompliance: true,
        dataExportFormat: 'json',
        anonymizeDeletedData: true,
    })

    // API Keys State
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([
        {
            id: '1',
            name: 'Production API',
            nameAr: 'واجهة برمجية للإنتاج',
            key: 'sk_live_••••••••••••••••',
            createdAt: '2025-01-15',
            lastUsed: '2025-12-16'
        }
    ])

    // Webhooks State
    const [webhooks, setWebhooks] = useState<Webhook[]>([
        {
            id: '1',
            name: 'Case Updates',
            nameAr: 'تحديثات القضايا',
            url: 'https://api.example.com/webhooks/cases',
            events: ['case.created', 'case.updated', 'case.closed'],
            isActive: true
        }
    ])

    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
    const [showWebhookDialog, setShowWebhookDialog] = useState(false)
    const [newApiKeyName, setNewApiKeyName] = useState('')
    const [newApiKeyNameAr, setNewApiKeyNameAr] = useState('')

    const handleSecurityChange = (field: string, value: any) => {
        setSecurityData(prev => ({ ...prev, [field]: value }))
    }

    const handleBrandingChange = (field: string, value: any) => {
        setBrandingData(prev => ({ ...prev, [field]: value }))
    }

    const handleDataPrivacyChange = (field: string, value: any) => {
        setDataPrivacyData(prev => ({ ...prev, [field]: value }))
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        const validation = validateFile(file, {
            allowedTypes: FILE_TYPES.IMAGES,
            maxSize: SIZE_LIMITS.LOGO,
        })

        if (!validation.valid) {
            toast.error(validation.errorAr || validation.error)
            e.target.value = ''
            return
        }

        // Simulate upload
        toast.success(isRTL ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully')
    }

    const handleSaveSecuritySettings = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(isRTL ? 'تم حفظ إعدادات الأمان' : 'Security settings saved')
        setIsSaving(false)
    }

    const handleSaveBrandingSettings = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(isRTL ? 'تم حفظ إعدادات العلامة التجارية' : 'Branding settings saved')
        setIsSaving(false)
    }

    const handleSaveDataPrivacySettings = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(isRTL ? 'تم حفظ إعدادات الخصوصية' : 'Privacy settings saved')
        setIsSaving(false)
    }

    const handleRequestDataExport = async () => {
        toast.success(isRTL ? 'سيتم إرسال ملف التصدير عبر البريد الإلكتروني' : 'Data export will be sent via email')
    }

    const handleRequestDataDeletion = async () => {
        if (confirm(isRTL ? 'هل أنت متأكد من طلب حذف البيانات؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to request data deletion? This action cannot be undone.')) {
            toast.success(isRTL ? 'تم استلام طلب الحذف' : 'Deletion request received')
        }
    }

    const handleCreateApiKey = () => {
        if (!newApiKeyName.trim()) {
            toast.error(isRTL ? 'الرجاء إدخال اسم للمفتاح' : 'Please enter a key name')
            return
        }

        const newKey: ApiKey = {
            id: Date.now().toString(),
            name: newApiKeyName,
            nameAr: newApiKeyNameAr,
            key: `sk_live_${Math.random().toString(36).substring(2, 18)}`,
            createdAt: new Date().toISOString().split('T')[0],
        }

        setApiKeys([...apiKeys, newKey])
        setShowApiKeyDialog(false)
        setNewApiKeyName('')
        setNewApiKeyNameAr('')
        toast.success(isRTL ? 'تم إنشاء المفتاح بنجاح' : 'API key created successfully')
    }

    const handleDeleteApiKey = (id: string) => {
        if (confirm(isRTL ? 'هل أنت متأكد من حذف هذا المفتاح؟' : 'Are you sure you want to delete this key?')) {
            setApiKeys(apiKeys.filter(key => key.id !== id))
            toast.success(isRTL ? 'تم حذف المفتاح' : 'API key deleted')
        }
    }

    if (permissionsLoading) {
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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-12 w-64" />
                        <Skeleton className="h-[600px] w-full rounded-3xl" />
                    </div>
                </Main>
            </>
        )
    }

    // Show access denied if not admin
    if (!hasAccess) {
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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-navy">
                                {isRTL ? 'إعدادات المؤسسات' : 'Enterprise Settings'}
                            </h1>
                            <p className="text-slate-500">
                                {isRTL ? 'إعدادات متقدمة للمؤسسات الكبيرة' : 'Advanced settings for enterprise organizations'}
                            </p>
                        </div>
                        <Alert variant="destructive">
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                {isRTL ? 'ليس لديك صلاحية الوصول إلى إعدادات المؤسسات. يرجى التواصل مع المسؤول.' : 'You do not have permission to access enterprise settings. Please contact your administrator.'}
                            </AlertDescription>
                        </Alert>
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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-navy">
                                {isRTL ? 'إعدادات المؤسسات' : 'Enterprise Settings'}
                            </h1>
                            <EnterpriseBadge />
                        </div>
                        <p className="text-slate-500">
                            {isRTL ? 'إعدادات متقدمة للمؤسسات الكبيرة تشمل الأمان والعلامة التجارية والدعم' : 'Advanced enterprise settings including security, branding, and support'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Security & Compliance */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        <CardTitle>
                                            {isRTL ? 'الأمان والامتثال' : 'Security & Compliance'}
                                        </CardTitle>
                                    </div>
                                    <EnterpriseBadge />
                                </div>
                                <CardDescription>
                                    {isRTL ? 'إدارة إعدادات الأمان والمصادقة والسياسات' : 'Manage security, authentication, and compliance policies'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* SSO/SAML Configuration */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Key className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <Label className="text-base">
                                                    {isRTL ? 'تفعيل تسجيل الدخول الموحد (SSO)' : 'Enable Single Sign-On (SSO)'}
                                                </Label>
                                                <p className="text-sm text-slate-500">
                                                    {isRTL ? 'السماح للموظفين بتسجيل الدخول عبر مزود الهوية الخاص بالشركة' : 'Allow employees to sign in through your company identity provider'}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={securityData.ssoEnabled}
                                            onCheckedChange={(checked) => handleSecurityChange('ssoEnabled', checked)}
                                        />
                                    </div>

                                    {securityData.ssoEnabled && (
                                        <div className="ps-8 space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="saml-entity-id">
                                                    {isRTL ? 'معرف كيان SAML' : 'SAML Entity ID'}
                                                </Label>
                                                <Input
                                                    id="saml-entity-id"
                                                    placeholder="https://your-company.com/saml"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="saml-sso-url">
                                                    {isRTL ? 'رابط تسجيل الدخول SAML' : 'SAML SSO URL'}
                                                </Label>
                                                <Input
                                                    id="saml-sso-url"
                                                    placeholder="https://your-idp.com/sso"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="saml-certificate">
                                                    {isRTL ? 'شهادة X.509' : 'X.509 Certificate'}
                                                </Label>
                                                <Textarea
                                                    id="saml-certificate"
                                                    placeholder="-----BEGIN CERTIFICATE-----"
                                                    rows={4}
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Two-Factor Authentication */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-green-600" />
                                        <div>
                                            <Label className="text-base">
                                                {isRTL ? 'إجبار المصادقة الثنائية' : 'Enforce Two-Factor Authentication'}
                                            </Label>
                                            <p className="text-sm text-slate-500">
                                                {isRTL ? 'يتطلب من جميع المستخدمين تفعيل المصادقة الثنائية' : 'Require all users to enable 2FA'}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={securityData.twoFactorEnforced}
                                        onCheckedChange={(checked) => handleSecurityChange('twoFactorEnforced', checked)}
                                    />
                                </div>

                                <Separator />

                                {/* Password Policy */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-orange-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'سياسة كلمات المرور' : 'Password Policy'}
                                        </Label>
                                    </div>

                                    <div className="ps-7 space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="password-min-length">
                                                {isRTL ? 'الحد الأدنى لطول كلمة المرور' : 'Minimum Password Length'}
                                            </Label>
                                            <Select
                                                value={securityData.passwordMinLength.toString()}
                                                onValueChange={(value) => handleSecurityChange('passwordMinLength', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="8">8 {isRTL ? 'أحرف' : 'characters'}</SelectItem>
                                                    <SelectItem value="10">10 {isRTL ? 'أحرف' : 'characters'}</SelectItem>
                                                    <SelectItem value="12">12 {isRTL ? 'حرف' : 'characters'}</SelectItem>
                                                    <SelectItem value="16">16 {isRTL ? 'حرف' : 'characters'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-sm">
                                                    {isRTL ? 'أحرف كبيرة' : 'Uppercase'}
                                                </Label>
                                                <Switch
                                                    checked={securityData.passwordRequireUppercase}
                                                    onCheckedChange={(checked) => handleSecurityChange('passwordRequireUppercase', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-sm">
                                                    {isRTL ? 'أحرف صغيرة' : 'Lowercase'}
                                                </Label>
                                                <Switch
                                                    checked={securityData.passwordRequireLowercase}
                                                    onCheckedChange={(checked) => handleSecurityChange('passwordRequireLowercase', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-sm">
                                                    {isRTL ? 'أرقام' : 'Numbers'}
                                                </Label>
                                                <Switch
                                                    checked={securityData.passwordRequireNumbers}
                                                    onCheckedChange={(checked) => handleSecurityChange('passwordRequireNumbers', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-sm">
                                                    {isRTL ? 'رموز خاصة' : 'Special Characters'}
                                                </Label>
                                                <Switch
                                                    checked={securityData.passwordRequireSpecialChars}
                                                    onCheckedChange={(checked) => handleSecurityChange('passwordRequireSpecialChars', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Session Timeout */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                        <Label htmlFor="session-timeout" className="text-base">
                                            {isRTL ? 'مهلة الجلسة (دقائق)' : 'Session Timeout (minutes)'}
                                        </Label>
                                    </div>
                                    <Select
                                        value={securityData.sessionTimeout.toString()}
                                        onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
                                    >
                                        <SelectTrigger className="ms-7">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 {isRTL ? 'دقيقة' : 'minutes'}</SelectItem>
                                            <SelectItem value="30">30 {isRTL ? 'دقيقة' : 'minutes'}</SelectItem>
                                            <SelectItem value="60">60 {isRTL ? 'دقيقة' : 'minutes'}</SelectItem>
                                            <SelectItem value="120">120 {isRTL ? 'دقيقة' : 'minutes'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* IP Whitelist */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-cyan-600" />
                                        <Label htmlFor="ip-whitelist" className="text-base">
                                            {isRTL ? 'قائمة IP المسموحة' : 'IP Whitelist'}
                                        </Label>
                                    </div>
                                    <Textarea
                                        id="ip-whitelist"
                                        value={securityData.ipWhitelist}
                                        onChange={(e) => handleSecurityChange('ipWhitelist', e.target.value)}
                                        placeholder={isRTL ? 'أدخل عناوين IP، واحد في كل سطر\n192.168.1.1\n10.0.0.0/8' : 'Enter IP addresses, one per line\n192.168.1.1\n10.0.0.0/8'}
                                        rows={4}
                                        dir="ltr"
                                        className="ms-7"
                                    />
                                    <p className="text-sm text-slate-500 ms-7">
                                        {isRTL ? 'اترك فارغاً للسماح بجميع عناوين IP' : 'Leave empty to allow all IP addresses'}
                                    </p>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveSecuritySettings}
                                        className="bg-brand-blue hover:bg-brand-blue/90"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                        )}
                                        {isRTL ? 'حفظ إعدادات الأمان' : 'Save Security Settings'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Branding */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        <CardTitle>
                                            {isRTL ? 'العلامة التجارية' : 'Branding'}
                                        </CardTitle>
                                    </div>
                                    <EnterpriseBadge />
                                </div>
                                <CardDescription>
                                    {isRTL ? 'تخصيص مظهر النظام ليتناسب مع هوية شركتك' : 'Customize the system appearance to match your company identity'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Custom Logo */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-blue-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'شعار مخصص' : 'Custom Logo'}
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-6 ms-7">
                                        <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                            {brandingData.customLogo ? (
                                                <img
                                                    src={brandingData.customLogo}
                                                    alt="Custom Logo"
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 className="h-12 w-12 text-slate-500" aria-hidden="true" />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                <Upload className="h-4 w-4 ms-2" aria-hidden="true" />
                                                {isRTL ? 'رفع شعار' : 'Upload Logo'}
                                            </Button>
                                            <p className="text-sm text-slate-500 mt-2">
                                                {isRTL ? 'PNG, JPG, SVG حتى 2 ميجابايت' : 'PNG, JPG, SVG up to 2MB'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Color Scheme */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-purple-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'نظام الألوان' : 'Color Scheme'}
                                        </Label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 ms-7">
                                        <div className="space-y-2">
                                            <Label htmlFor="primary-color">
                                                {isRTL ? 'اللون الأساسي' : 'Primary Color'}
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="primary-color"
                                                    type="color"
                                                    value={brandingData.primaryColor}
                                                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                                                    className="w-20 h-10 cursor-pointer"
                                                />
                                                <Input
                                                    value={brandingData.primaryColor}
                                                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                                                    dir="ltr"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="secondary-color">
                                                {isRTL ? 'اللون الثانوي' : 'Secondary Color'}
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="secondary-color"
                                                    type="color"
                                                    value={brandingData.secondaryColor}
                                                    onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                                                    className="w-20 h-10 cursor-pointer"
                                                />
                                                <Input
                                                    value={brandingData.secondaryColor}
                                                    onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                                                    dir="ltr"
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* White Label Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <Label className="text-base">
                                                {isRTL ? 'تفعيل البريد الإلكتروني المخصص' : 'Enable Custom Email Templates'}
                                            </Label>
                                            <p className="text-sm text-slate-500">
                                                {isRTL ? 'استخدام قوالب بريد إلكتروني مخصصة بعلامتك التجارية' : 'Use custom branded email templates'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={brandingData.customEmailTemplates}
                                            onCheckedChange={(checked) => handleBrandingChange('customEmailTemplates', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <Label className="text-base">
                                                {isRTL ? 'الوضع الكامل للعلامة البيضاء' : 'Full White-Label Mode'}
                                            </Label>
                                            <p className="text-sm text-slate-500">
                                                {isRTL ? 'إزالة جميع إشارات Traf3li وإظهار علامتك التجارية فقط' : 'Remove all Traf3li branding and show only your brand'}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={brandingData.whiteLabel}
                                            onCheckedChange={(checked) => handleBrandingChange('whiteLabel', checked)}
                                        />
                                    </div>

                                    {brandingData.whiteLabel && (
                                        <div className="ms-7 space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="company-name">
                                                    {isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
                                                </Label>
                                                <Input
                                                    id="company-name"
                                                    value={brandingData.companyName}
                                                    onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                                                    placeholder="Your Company Name"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="company-name-ar">
                                                    {isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
                                                </Label>
                                                <Input
                                                    id="company-name-ar"
                                                    value={brandingData.companyNameAr}
                                                    onChange={(e) => handleBrandingChange('companyNameAr', e.target.value)}
                                                    placeholder="اسم شركتك"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveBrandingSettings}
                                        className="bg-brand-blue hover:bg-brand-blue/90"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                        )}
                                        {isRTL ? 'حفظ إعدادات العلامة التجارية' : 'Save Branding Settings'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SLA & Support */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HeadphonesIcon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        <CardTitle>
                                            {isRTL ? 'اتفاقية مستوى الخدمة والدعم' : 'SLA & Support'}
                                        </CardTitle>
                                    </div>
                                    <EnterpriseBadge />
                                </div>
                                <CardDescription>
                                    {isRTL ? 'معلومات اتفاقية مستوى الخدمة والدعم المخصص' : 'Service level agreement and dedicated support information'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Current SLA Tier */}
                                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Crown className="h-5 w-5 text-amber-600" />
                                            <Label className="text-base font-semibold text-amber-900">
                                                {isRTL ? 'مستوى الخدمة' : 'SLA Tier'}
                                            </Label>
                                        </div>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {isRTL ? 'مؤسسات - متميز' : 'Enterprise Premium'}
                                        </p>
                                        <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                                            <CheckCircle className="h-3 w-3" />
                                            {isRTL ? 'نشط' : 'Active'}
                                        </Badge>
                                    </div>

                                    {/* Support Contact */}
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                                            <Label className="text-base font-semibold text-blue-900">
                                                {isRTL ? 'الدعم الفني' : 'Technical Support'}
                                            </Label>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                                <span dir="ltr">{slaData.supportEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-blue-600" />
                                                <span dir="ltr">{slaData.supportPhone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Manager */}
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="h-5 w-5 text-purple-600" />
                                            <Label className="text-base font-semibold text-purple-900">
                                                {isRTL ? 'مدير الحساب المخصص' : 'Dedicated Account Manager'}
                                            </Label>
                                        </div>
                                        <p className="font-semibold text-purple-900">{slaData.accountManager}</p>
                                        <p className="text-sm text-purple-700 mt-1" dir="ltr">{slaData.accountManagerEmail}</p>
                                    </div>

                                    {/* Response Times */}
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="h-5 w-5 text-green-600" />
                                            <Label className="text-base font-semibold text-green-900">
                                                {isRTL ? 'أوقات الاستجابة' : 'Response Times'}
                                            </Label>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-green-700 font-medium">
                                                    {isRTL ? 'وقت الاستجابة:' : 'Response Time:'}
                                                </span>
                                                <span className="text-green-900 font-bold ms-2">
                                                    {slaData.responseTime}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-green-700 font-medium">
                                                    {isRTL ? 'وقت الحل:' : 'Resolution Time:'}
                                                </span>
                                                <span className="text-green-900 font-bold ms-2">
                                                    {slaData.resolutionTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-900">
                                        {isRTL ? 'للحصول على تحديث لمستوى الخدمة أو تخصيص اتفاقية مستوى الخدمة، يرجى التواصل مع مدير حسابك المخصص.' : 'To upgrade your SLA tier or customize your service level agreement, please contact your dedicated account manager.'}
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        {/* Data & Privacy */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        <CardTitle>
                                            {isRTL ? 'البيانات والخصوصية' : 'Data & Privacy'}
                                        </CardTitle>
                                    </div>
                                    <EnterpriseBadge />
                                </div>
                                <CardDescription>
                                    {isRTL ? 'إدارة الاحتفاظ بالبيانات والامتثال للخصوصية' : 'Manage data retention and privacy compliance'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Data Retention */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-blue-600" />
                                        <Label htmlFor="data-retention" className="text-base">
                                            {isRTL ? 'فترة الاحتفاظ بالبيانات (أيام)' : 'Data Retention Period (days)'}
                                        </Label>
                                    </div>
                                    <Select
                                        value={dataPrivacyData.dataRetentionPeriod.toString()}
                                        onValueChange={(value) => handleDataPrivacyChange('dataRetentionPeriod', parseInt(value))}
                                    >
                                        <SelectTrigger className="ms-7">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="90">90 {isRTL ? 'يوم (3 أشهر)' : 'days (3 months)'}</SelectItem>
                                            <SelectItem value="180">180 {isRTL ? 'يوم (6 أشهر)' : 'days (6 months)'}</SelectItem>
                                            <SelectItem value="365">365 {isRTL ? 'يوم (سنة)' : 'days (1 year)'}</SelectItem>
                                            <SelectItem value="730">730 {isRTL ? 'يوم (سنتين)' : 'days (2 years)'}</SelectItem>
                                            <SelectItem value="1825">1825 {isRTL ? 'يوم (5 سنوات)' : 'days (5 years)'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <Label className="text-base">
                                            {isRTL ? 'حذف البيانات القديمة تلقائياً' : 'Auto-delete Old Data'}
                                        </Label>
                                        <p className="text-sm text-slate-500">
                                            {isRTL ? 'حذف البيانات التي تجاوزت فترة الاحتفاظ تلقائياً' : 'Automatically delete data older than retention period'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={dataPrivacyData.autoDeleteOldData}
                                        onCheckedChange={(checked) => handleDataPrivacyChange('autoDeleteOldData', checked)}
                                    />
                                </div>

                                <Separator />

                                {/* GDPR Compliance */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'أدوات الامتثال لحماية البيانات' : 'GDPR Compliance Tools'}
                                        </Label>
                                    </div>

                                    <div className="ms-7 space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <Label>
                                                {isRTL ? 'تفعيل أدوات الامتثال لحماية البيانات' : 'Enable GDPR Compliance Tools'}
                                            </Label>
                                            <Switch
                                                checked={dataPrivacyData.gdprCompliance}
                                                onCheckedChange={(checked) => handleDataPrivacyChange('gdprCompliance', checked)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <Label>
                                                {isRTL ? 'إخفاء هوية البيانات المحذوفة' : 'Anonymize Deleted Data'}
                                            </Label>
                                            <Switch
                                                checked={dataPrivacyData.anonymizeDeletedData}
                                                onCheckedChange={(checked) => handleDataPrivacyChange('anonymizeDeletedData', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Data Export */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Download className="h-5 w-5 text-purple-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'تصدير البيانات' : 'Data Export'}
                                        </Label>
                                    </div>

                                    <div className="ms-7 space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="export-format">
                                                {isRTL ? 'صيغة التصدير' : 'Export Format'}
                                            </Label>
                                            <Select
                                                value={dataPrivacyData.dataExportFormat}
                                                onValueChange={(value) => handleDataPrivacyChange('dataExportFormat', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="json">JSON</SelectItem>
                                                    <SelectItem value="csv">CSV</SelectItem>
                                                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                                                    <SelectItem value="pdf">PDF</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={handleRequestDataExport}
                                            className="w-full"
                                        >
                                            <Download className="h-4 w-4 ms-2" />
                                            {isRTL ? 'طلب تصدير البيانات' : 'Request Data Export'}
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Data Deletion */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                        <Label className="text-base text-red-600">
                                            {isRTL ? 'حذف البيانات' : 'Data Deletion'}
                                        </Label>
                                    </div>

                                    <Alert variant="destructive" className="ms-7">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {isRTL ? 'تحذير: طلب حذف البيانات سيؤدي إلى حذف جميع بيانات المؤسسة بشكل دائم. هذا الإجراء لا يمكن التراجع عنه.' : 'Warning: Requesting data deletion will permanently delete all organization data. This action cannot be undone.'}
                                        </AlertDescription>
                                    </Alert>

                                    <Button
                                        variant="destructive"
                                        onClick={handleRequestDataDeletion}
                                        className="ms-7"
                                    >
                                        <Trash2 className="h-4 w-4 ms-2" />
                                        {isRTL ? 'طلب حذف البيانات' : 'Request Data Deletion'}
                                    </Button>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveDataPrivacySettings}
                                        className="bg-brand-blue hover:bg-brand-blue/90"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                                        )}
                                        {isRTL ? 'حفظ إعدادات الخصوصية' : 'Save Privacy Settings'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Integrations */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Code className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                                        <CardTitle>
                                            {isRTL ? 'التكاملات' : 'Integrations'}
                                        </CardTitle>
                                    </div>
                                    <EnterpriseBadge />
                                </div>
                                <CardDescription>
                                    {isRTL ? 'إدارة مفاتيح API والتكاملات مع الأنظمة الخارجية' : 'Manage API keys and integrations with external systems'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* API Keys */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Key className="h-5 w-5 text-blue-600" />
                                            <Label className="text-base">
                                                {isRTL ? 'مفاتيح API' : 'API Keys'}
                                            </Label>
                                        </div>
                                        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    <Plus className="h-4 w-4 ms-1" />
                                                    {isRTL ? 'إنشاء مفتاح' : 'Create Key'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        {isRTL ? 'إنشاء مفتاح API جديد' : 'Create New API Key'}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        {isRTL ? 'سيتم عرض المفتاح مرة واحدة فقط، احفظه في مكان آمن' : 'The key will be displayed only once, save it securely'}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="api-key-name">
                                                            {isRTL ? 'اسم المفتاح (إنجليزي)' : 'Key Name (English)'}
                                                        </Label>
                                                        <Input
                                                            id="api-key-name"
                                                            value={newApiKeyName}
                                                            onChange={(e) => setNewApiKeyName(e.target.value)}
                                                            placeholder="Production API"
                                                            dir="ltr"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="api-key-name-ar">
                                                            {isRTL ? 'اسم المفتاح (عربي)' : 'Key Name (Arabic)'}
                                                        </Label>
                                                        <Input
                                                            id="api-key-name-ar"
                                                            value={newApiKeyNameAr}
                                                            onChange={(e) => setNewApiKeyNameAr(e.target.value)}
                                                            placeholder="واجهة برمجية للإنتاج"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                                    </Button>
                                                    <Button onClick={handleCreateApiKey}>
                                                        {isRTL ? 'إنشاء' : 'Create'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-end">{isRTL ? 'الاسم' : 'Name'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'المفتاح' : 'Key'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'آخر استخدام' : 'Last Used'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiKeys.map((key) => (
                                                <TableRow key={key.id}>
                                                    <TableCell>{isRTL ? key.nameAr : key.name}</TableCell>
                                                    <TableCell>
                                                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded" dir="ltr">
                                                            {key.key}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>{key.createdAt}</TableCell>
                                                    <TableCell>{key.lastUsed || '-'}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteApiKey(key.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Separator />

                                {/* Webhooks */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Webhook className="h-5 w-5 text-purple-600" />
                                            <Label className="text-base">
                                                {isRTL ? 'Webhooks' : 'Webhooks'}
                                            </Label>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <Plus className="h-4 w-4 ms-1" />
                                            {isRTL ? 'إضافة Webhook' : 'Add Webhook'}
                                        </Button>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-end">{isRTL ? 'الاسم' : 'Name'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'الرابط' : 'URL'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'الأحداث' : 'Events'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                                                <TableHead className="text-end">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {webhooks.map((webhook) => (
                                                <TableRow key={webhook.id}>
                                                    <TableCell>{isRTL ? webhook.nameAr : webhook.name}</TableCell>
                                                    <TableCell>
                                                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded" dir="ltr">
                                                            {webhook.url}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{webhook.events.length} {isRTL ? 'حدث' : 'events'}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {webhook.isActive ? (
                                                            <Badge className="bg-green-100 text-green-700">
                                                                {isRTL ? 'نشط' : 'Active'}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                {isRTL ? 'غير نشط' : 'Inactive'}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Separator />

                                {/* Third-party Integrations */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-cyan-600" />
                                        <Label className="text-base">
                                            {isRTL ? 'التكاملات الخارجية' : 'Third-Party Integrations'}
                                        </Label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ms-7">
                                        <div className="p-4 border rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Slack</p>
                                                    <p className="text-xs text-slate-500">
                                                        {isRTL ? 'غير متصل' : 'Not connected'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                {isRTL ? 'ربط' : 'Connect'}
                                            </Button>
                                        </div>

                                        <div className="p-4 border rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Microsoft Teams</p>
                                                    <p className="text-xs text-green-600 font-medium">
                                                        {isRTL ? 'متصل' : 'Connected'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                {isRTL ? 'فصل' : 'Disconnect'}
                                            </Button>
                                        </div>

                                        <div className="p-4 border rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Zapier</p>
                                                    <p className="text-xs text-slate-500">
                                                        {isRTL ? 'غير متصل' : 'Not connected'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                {isRTL ? 'ربط' : 'Connect'}
                                            </Button>
                                        </div>

                                        <div className="p-4 border rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Google Workspace</p>
                                                    <p className="text-xs text-slate-500">
                                                        {isRTL ? 'غير متصل' : 'Not connected'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                {isRTL ? 'ربط' : 'Connect'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    )
}
