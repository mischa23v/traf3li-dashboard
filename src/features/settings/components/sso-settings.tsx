/**
 * SSO Settings Component
 * Main component for managing OAuth 2.0 SSO configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Plus,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Copy,
  CheckCircle2,
  TestTube2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { SSOProviderCard } from './sso-provider-card'
import {
  useSSOSettings,
  useUpdateSSOSettings,
  useAvailableProviders,
  useCreateSSOProvider,
  useUpdateSSOProvider,
  useDeleteSSOProvider,
  useTestSSOConnection,
} from '@/hooks/useSSO'
import { SSOProviderConfig, SSOProvider, SaveProviderRequest } from '@/services/ssoService'

export function SSOSettings() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Queries
  const { data: ssoSettings, isLoading: isLoadingSettings } = useSSOSettings()
  const { data: availableProviders } = useAvailableProviders()

  // Mutations
  const updateSettingsMutation = useUpdateSSOSettings()
  const createProviderMutation = useCreateSSOProvider()
  const updateProviderMutation = useUpdateSSOProvider()
  const deleteProviderMutation = useDeleteSSOProvider()
  const testConnectionMutation = useTestSSOConnection()

  // Local state
  const [ssoEnabled, setSsoEnabled] = useState(false)
  const [allowPasswordLogin, setAllowPasswordLogin] = useState(true)
  const [showProviderDialog, setShowProviderDialog] = useState(false)
  const [editingProvider, setEditingProvider] = useState<SSOProviderConfig | null>(null)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Provider form state
  const [providerForm, setProviderForm] = useState<SaveProviderRequest>({
    provider: 'google',
    enabled: true,
    displayName: 'Google',
    displayNameAr: 'جوجل',
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/sso/callback`,
    scope: 'openid profile email',
  })

  // Update local state when settings load
  useEffect(() => {
    if (ssoSettings) {
      setSsoEnabled(ssoSettings.enabled)
      setAllowPasswordLogin(ssoSettings.allowPasswordLogin)
    }
  }, [ssoSettings])

  // Handle global SSO settings save
  const handleSaveGlobalSettings = async () => {
    await updateSettingsMutation.mutateAsync({
      enabled: ssoEnabled,
      allowPasswordLogin,
    })
  }

  // Handle add new provider
  const handleAddProvider = () => {
    setEditingProvider(null)
    setProviderForm({
      provider: 'google',
      enabled: true,
      displayName: 'Google',
      displayNameAr: 'جوجل',
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/auth/sso/callback`,
      scope: 'openid profile email',
    })
    setShowProviderDialog(true)
  }

  // Handle configure existing provider
  const handleConfigureProvider = (provider: SSOProviderConfig) => {
    setEditingProvider(provider)
    setProviderForm({
      provider: provider.provider,
      enabled: provider.enabled,
      displayName: provider.displayName,
      displayNameAr: provider.displayNameAr,
      clientId: provider.clientId,
      clientSecret: '', // Don't populate secret for security
      redirectUri: provider.redirectUri,
      authorizationUrl: provider.authorizationUrl,
      tokenUrl: provider.tokenUrl,
      scope: provider.scope,
      additionalConfig: provider.additionalConfig,
    })
    setShowProviderDialog(true)
  }

  // Handle provider form change
  const handleProviderFormChange = (field: string, value: any) => {
    setProviderForm(prev => ({ ...prev, [field]: value }))

    // Auto-update display names when provider changes
    if (field === 'provider') {
      const selectedProvider = availableProviders?.find(p => p.id === value)
      if (selectedProvider) {
        setProviderForm(prev => ({
          ...prev,
          displayName: selectedProvider.name,
          displayNameAr: selectedProvider.nameAr,
          scope: selectedProvider.defaultScopes.join(' '),
        }))
      }
    }
  }

  // Handle save provider
  const handleSaveProvider = async () => {
    if (!providerForm.clientId || !providerForm.clientSecret) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    try {
      if (editingProvider?._id) {
        // Update existing provider
        await updateProviderMutation.mutateAsync({
          providerId: editingProvider._id,
          data: providerForm,
        })
      } else {
        // Create new provider
        await createProviderMutation.mutateAsync(providerForm)
      }
      setShowProviderDialog(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  // Handle test connection
  const handleTestConnection = async () => {
    if (!providerForm.clientId || !providerForm.clientSecret) {
      toast.error(isRTL ? 'يرجى ملء معرف العميل والسر أولاً' : 'Please fill Client ID and Secret first')
      return
    }

    await testConnectionMutation.mutateAsync({
      provider: providerForm.provider,
      clientId: providerForm.clientId,
      clientSecret: providerForm.clientSecret,
      redirectUri: providerForm.redirectUri,
      authorizationUrl: providerForm.authorizationUrl,
      tokenUrl: providerForm.tokenUrl,
      scope: providerForm.scope,
    })
  }

  // Handle copy redirect URL
  const handleCopyRedirectUrl = () => {
    navigator.clipboard.writeText(providerForm.redirectUri)
    setCopiedUrl(true)
    toast.success(isRTL ? 'تم نسخ عنوان URL' : 'URL copied')
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  // Handle remove provider
  const handleRemoveProvider = async (providerId: string) => {
    await deleteProviderMutation.mutateAsync(providerId)
  }

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy">
          {isRTL ? 'إعدادات تسجيل الدخول الموحد (SSO)' : 'Single Sign-On (SSO) Settings'}
        </h2>
        <p className="text-slate-500">
          {isRTL
            ? 'إدارة موفري OAuth 2.0 للمصادقة'
            : 'Manage OAuth 2.0 providers for authentication'}
        </p>
      </div>

      {/* Global SSO Settings */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'الإعدادات العامة' : 'Global Settings'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'تمكين أو تعطيل تسجيل الدخول الموحد للمؤسسة'
              : 'Enable or disable Single Sign-On for your organization'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable SSO */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sso-enabled" className="text-base font-medium">
                {isRTL ? 'تمكين SSO' : 'Enable SSO'}
              </Label>
              <p className="text-sm text-slate-500">
                {isRTL
                  ? 'السماح للمستخدمين بتسجيل الدخول باستخدام موفري SSO'
                  : 'Allow users to sign in using SSO providers'}
              </p>
            </div>
            <Switch
              id="sso-enabled"
              checked={ssoEnabled}
              onCheckedChange={setSsoEnabled}
            />
          </div>

          <Separator />

          {/* Allow Password Login */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-password" className="text-base font-medium">
                {isRTL ? 'السماح بتسجيل الدخول بكلمة المرور' : 'Allow Password Login'}
              </Label>
              <p className="text-sm text-slate-500">
                {isRTL
                  ? 'السماح للمستخدمين بتسجيل الدخول باستخدام كلمة المرور التقليدية'
                  : 'Allow users to sign in using traditional password'}
              </p>
            </div>
            <Switch
              id="allow-password"
              checked={allowPasswordLogin}
              onCheckedChange={setAllowPasswordLogin}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveGlobalSettings}
              disabled={updateSettingsMutation.isPending}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ms-2" />
              )}
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SSO Providers */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isRTL ? 'موفرو تسجيل الدخول' : 'SSO Providers'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? 'إدارة موفري OAuth 2.0 المتاحين'
                  : 'Manage available OAuth 2.0 providers'}
              </CardDescription>
            </div>
            <Button onClick={handleAddProvider} className="bg-brand-blue hover:bg-brand-blue/90">
              <Plus className="h-4 w-4 ms-2" />
              {isRTL ? 'إضافة موفر' : 'Add Provider'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ssoSettings?.providers && ssoSettings.providers.length > 0 ? (
            <div className="space-y-4">
              {ssoSettings.providers.map((provider) => (
                <SSOProviderCard
                  key={provider._id}
                  provider={provider}
                  onConfigure={handleConfigureProvider}
                  onRemove={handleRemoveProvider}
                  isRemoving={deleteProviderMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">
                {isRTL ? 'لم يتم تكوين أي موفر SSO' : 'No SSO providers configured'}
              </p>
              <Button
                variant="outline"
                onClick={handleAddProvider}
                className="mt-4"
              >
                <Plus className="h-4 w-4 ms-2" />
                {isRTL ? 'إضافة موفر الأول' : 'Add your first provider'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Configuration Dialog */}
      <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider
                ? (isRTL ? 'تكوين موفر SSO' : 'Configure SSO Provider')
                : (isRTL ? 'إضافة موفر SSO' : 'Add SSO Provider')}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'أدخل بيانات اعتماد OAuth 2.0 من وحدة تحكم موفر الخدمة'
                : 'Enter OAuth 2.0 credentials from your provider\'s console'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Provider Selection */}
            {!editingProvider && (
              <div className="space-y-2">
                <Label htmlFor="provider">
                  {isRTL ? 'الموفر' : 'Provider'} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={providerForm.provider}
                  onValueChange={(value) => handleProviderFormChange('provider', value as SSOProvider)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders?.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {isRTL ? provider.nameAr : provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Display Names */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">
                  {isRTL ? 'الاسم (إنجليزي)' : 'Display Name (English)'}
                </Label>
                <Input
                  id="displayName"
                  value={providerForm.displayName}
                  onChange={(e) => handleProviderFormChange('displayName', e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayNameAr">
                  {isRTL ? 'الاسم (عربي)' : 'Display Name (Arabic)'}
                </Label>
                <Input
                  id="displayNameAr"
                  value={providerForm.displayNameAr}
                  onChange={(e) => handleProviderFormChange('displayNameAr', e.target.value)}
                />
              </div>
            </div>

            {/* Client ID */}
            <div className="space-y-2">
              <Label htmlFor="clientId">
                {isRTL ? 'معرف العميل' : 'Client ID'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientId"
                value={providerForm.clientId}
                onChange={(e) => handleProviderFormChange('clientId', e.target.value)}
                placeholder="your-client-id"
                dir="ltr"
              />
            </div>

            {/* Client Secret */}
            <div className="space-y-2">
              <Label htmlFor="clientSecret">
                {isRTL ? 'سر العميل' : 'Client Secret'} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showClientSecret ? 'text' : 'password'}
                  value={providerForm.clientSecret}
                  onChange={(e) => handleProviderFormChange('clientSecret', e.target.value)}
                  placeholder={editingProvider ? '••••••••••••' : 'your-client-secret'}
                  dir="ltr"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {editingProvider && (
                <p className="text-xs text-slate-500">
                  {isRTL
                    ? 'اترك فارغاً للاحتفاظ بالسر الحالي'
                    : 'Leave empty to keep current secret'}
                </p>
              )}
            </div>

            {/* Redirect URI */}
            <div className="space-y-2">
              <Label htmlFor="redirectUri">
                {isRTL ? 'عنوان URL لإعادة التوجيه' : 'Redirect URI'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="redirectUri"
                  value={providerForm.redirectUri}
                  onChange={(e) => handleProviderFormChange('redirectUri', e.target.value)}
                  dir="ltr"
                  readOnly
                  className="bg-slate-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyRedirectUrl}
                >
                  {copiedUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {isRTL
                  ? 'استخدم هذا العنوان في إعدادات موفر OAuth'
                  : 'Use this URL in your OAuth provider settings'}
              </p>
            </div>

            {/* Scope */}
            <div className="space-y-2">
              <Label htmlFor="scope">
                {isRTL ? 'النطاق' : 'Scope'}
              </Label>
              <Input
                id="scope"
                value={providerForm.scope}
                onChange={(e) => handleProviderFormChange('scope', e.target.value)}
                placeholder="openid profile email"
                dir="ltr"
              />
              <p className="text-xs text-slate-500">
                {isRTL
                  ? 'الأذونات المطلوبة من الموفر (مفصولة بمسافات)'
                  : 'Permissions requested from provider (space-separated)'}
              </p>
            </div>

            {/* Enabled Switch */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="provider-enabled" className="text-base font-medium">
                  {isRTL ? 'تمكين الموفر' : 'Enable Provider'}
                </Label>
                <p className="text-sm text-slate-500">
                  {isRTL
                    ? 'السماح للمستخدمين بتسجيل الدخول باستخدام هذا الموفر'
                    : 'Allow users to sign in using this provider'}
                </p>
              </div>
              <Switch
                id="provider-enabled"
                checked={providerForm.enabled}
                onCheckedChange={(checked) => handleProviderFormChange('enabled', checked)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
            >
              {testConnectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <TestTube2 className="h-4 w-4 ms-2" />
              )}
              {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
            </Button>
            <Button
              type="button"
              onClick={handleSaveProvider}
              disabled={createProviderMutation.isPending || updateProviderMutation.isPending}
              className="bg-brand-blue hover:bg-brand-blue/90"
            >
              {(createProviderMutation.isPending || updateProviderMutation.isPending) ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 ms-2" />
              )}
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
