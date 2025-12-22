/**
 * LDAP Settings Component
 * Main component for managing LDAP/Active Directory configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Save,
  Loader2,
  TestTube2,
  RefreshCw,
  Crown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { LDAPConfigForm } from './ldap-config-form'
import { LDAPTestDialog } from './ldap-test-dialog'
import {
  useLDAPConfig,
  useSaveLDAPConfig,
  useLDAPSyncStatus,
  useSyncLDAPUsers,
} from '@/hooks/useLDAP'
import { LDAPConfigFormData } from '@/services/ldapService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

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

export function LDAPSettings() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Queries
  const { data: ldapConfig, isLoading: isLoadingConfig } = useLDAPConfig()
  const { data: syncStatus } = useLDAPSyncStatus()

  // Mutations
  const saveConfigMutation = useSaveLDAPConfig()
  const syncUsersMutation = useSyncLDAPUsers()

  // Local state
  const [ldapEnabled, setLdapEnabled] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [formData, setFormData] = useState<LDAPConfigFormData>({
    enabled: false,
    serverUrl: '',
    bindDN: '',
    bindPassword: '',
    baseDN: '',
    userFilter: '(&(objectClass=person)(uid=%s))',
    useTLS: false,
    useSSL: false,
    attributeMappings: {
      email: 'mail',
      firstName: 'givenName',
      lastName: 'sn',
      username: 'uid',
      phone: 'telephoneNumber',
    },
    groupSync: {
      enabled: false,
      baseDN: '',
      groupFilter: '(objectClass=groupOfNames)',
      memberAttribute: 'member',
    },
  })

  // Update local state when config loads
  useEffect(() => {
    if (ldapConfig) {
      setLdapEnabled(ldapConfig.enabled)
      setFormData({
        enabled: ldapConfig.enabled,
        serverUrl: ldapConfig.serverUrl,
        bindDN: ldapConfig.bindDN,
        bindPassword: '', // Don't populate password for security
        baseDN: ldapConfig.baseDN,
        userFilter: ldapConfig.userFilter,
        useTLS: ldapConfig.useTLS,
        useSSL: ldapConfig.useSSL,
        attributeMappings: ldapConfig.attributeMappings,
        groupSync: ldapConfig.groupSync,
      })
    }
  }, [ldapConfig])

  // Handle form field change
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle nested field change
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  // Handle save configuration
  const handleSaveConfig = async () => {
    // Validate required fields
    if (!formData.serverUrl || !formData.bindDN || !formData.bindPassword || !formData.baseDN) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    // Validate email attribute mapping
    if (!formData.attributeMappings.email || !formData.attributeMappings.username ||
        !formData.attributeMappings.firstName || !formData.attributeMappings.lastName) {
      toast.error(isRTL ? 'يرجى ملء جميع تعيينات السمات المطلوبة' : 'Please fill all required attribute mappings')
      return
    }

    await saveConfigMutation.mutateAsync({
      ...formData,
      enabled: ldapEnabled,
    })
  }

  // Handle test connection
  const handleTestConnection = () => {
    // Validate required fields before testing
    if (!formData.serverUrl || !formData.bindDN || !formData.bindPassword || !formData.baseDN) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة قبل الاختبار' : 'Please fill all required fields before testing')
      return
    }
    setShowTestDialog(true)
  }

  // Handle manual sync
  const handleManualSync = async () => {
    if (!ldapConfig) {
      toast.error(isRTL ? 'يرجى حفظ إعدادات LDAP أولاً' : 'Please save LDAP configuration first')
      return
    }
    await syncUsersMutation.mutateAsync()
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp', { locale: isRTL ? ar : undefined })
  }

  if (isLoadingConfig) {
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
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-navy">
            {isRTL ? 'إعدادات LDAP / Active Directory' : 'LDAP / Active Directory Settings'}
          </h2>
          <EnterpriseBadge />
        </div>
        <p className="text-slate-500">
          {isRTL
            ? 'قم بتكوين LDAP أو Active Directory لمزامنة المستخدمين والمصادقة'
            : 'Configure LDAP or Active Directory for user synchronization and authentication'}
        </p>
      </div>

      {/* Coming Soon Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <div className="flex items-center justify-between">
            <span>
              {isRTL
                ? 'هذه ميزة قادمة قريباً. واجهة الإعدادات جاهزة، في انتظار تكامل الواجهة الخلفية.'
                : 'This is a coming soon feature. The settings interface is ready, pending backend integration.'}
            </span>
            <Badge variant="outline" className="bg-white">
              {isRTL ? 'قريباً' : 'Coming Soon'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Global LDAP Settings */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-blue" />
                {isRTL ? 'الإعدادات العامة' : 'Global Settings'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? 'تمكين أو تعطيل مصادقة LDAP ومزامنة المستخدمين'
                  : 'Enable or disable LDAP authentication and user synchronization'}
              </CardDescription>
            </div>
            <EnterpriseBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable LDAP */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ldap-enabled" className="text-base font-medium">
                {isRTL ? 'تمكين LDAP' : 'Enable LDAP'}
              </Label>
              <p className="text-sm text-slate-500">
                {isRTL
                  ? 'السماح للمستخدمين بتسجيل الدخول باستخدام بيانات اعتماد LDAP'
                  : 'Allow users to sign in using LDAP credentials'}
              </p>
            </div>
            <Switch
              id="ldap-enabled"
              checked={ldapEnabled}
              onCheckedChange={setLdapEnabled}
            />
          </div>

          {ldapEnabled && (
            <>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isRTL
                    ? 'عند تمكين LDAP، سيتمكن المستخدمون من تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور الخاصة بـ LDAP. تأكد من اختبار الإعدادات قبل الحفظ.'
                    : 'When LDAP is enabled, users will be able to sign in using their LDAP username and password. Make sure to test the settings before saving.'}
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* LDAP Configuration Form */}
      {ldapEnabled && (
        <LDAPConfigForm
          formData={formData}
          onChange={handleFormChange}
          onNestedChange={handleNestedChange}
        />
      )}

      {/* Sync Status */}
      {ldapEnabled && ldapConfig && syncStatus && (
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-brand-blue" />
              {isRTL ? 'حالة المزامنة' : 'Sync Status'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'حالة آخر مزامنة للمستخدمين من LDAP'
                : 'Status of the last user synchronization from LDAP'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStatus.isRunning ? (
              <Alert className="border-blue-200 bg-blue-50">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-900">
                  {isRTL
                    ? 'جارٍ مزامنة المستخدمين من LDAP...'
                    : 'Synchronizing users from LDAP...'}
                </AlertDescription>
              </Alert>
            ) : syncStatus.lastSync ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {syncStatus.lastSync.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : syncStatus.lastSync.status === 'failed' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {syncStatus.lastSync.status === 'success'
                          ? isRTL ? 'اكتملت المزامنة بنجاح' : 'Sync completed successfully'
                          : syncStatus.lastSync.status === 'failed'
                          ? isRTL ? 'فشلت المزامنة' : 'Sync failed'
                          : isRTL ? 'مزامنة جزئية' : 'Partial sync'}
                      </p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(syncStatus.lastSync.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleManualSync}
                    disabled={syncUsersMutation.isPending}
                    size="sm"
                    variant="outline"
                  >
                    {syncUsersMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 ms-2" />
                    )}
                    {isRTL ? 'مزامنة يدوية' : 'Manual Sync'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">
                        {isRTL ? 'مضاف' : 'Added'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {syncStatus.lastSync.usersAdded}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-blue-700 font-medium">
                        {isRTL ? 'محدث' : 'Updated'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {syncStatus.lastSync.usersUpdated}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-slate-600" />
                      <span className="text-xs text-slate-700 font-medium">
                        {isRTL ? 'معطل' : 'Deactivated'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-600">
                      {syncStatus.lastSync.usersDeactivated}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-700 font-medium">
                        {isRTL ? 'مجموعات' : 'Groups'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {syncStatus.lastSync.groupsSynced}
                    </p>
                  </div>
                </div>

                {syncStatus.lastSync.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">
                        {isRTL ? 'أخطاء المزامنة:' : 'Sync Errors:'}
                      </p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {syncStatus.lastSync.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isRTL
                    ? 'لم يتم تشغيل أي مزامنة بعد'
                    : 'No synchronization has been run yet'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {ldapEnabled && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={saveConfigMutation.isPending}
          >
            <TestTube2 className="h-4 w-4 ms-2" />
            {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={saveConfigMutation.isPending}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            {saveConfigMutation.isPending ? (
              <Loader2 className="h-4 w-4 ms-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 ms-2" />
            )}
            {isRTL ? 'حفظ الإعدادات' : 'Save Configuration'}
          </Button>
        </div>
      )}

      {/* Test Connection Dialog */}
      <LDAPTestDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        configData={formData}
      />
    </div>
  )
}
