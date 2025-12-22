/**
 * LDAP Test Dialog Component
 * Dialog for testing LDAP connection and user lookup
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TestTube2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useTestLDAPConnection, useTestLDAPUserLookup } from '@/hooks/useLDAP'
import { LDAPConfigFormData } from '@/services/ldapService'

interface LDAPTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  configData: LDAPConfigFormData
}

export function LDAPTestDialog({ open, onOpenChange, configData }: LDAPTestDialogProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [testUsername, setTestUsername] = useState('')
  const testConnectionMutation = useTestLDAPConnection()
  const testUserLookupMutation = useTestLDAPUserLookup()

  const handleTestConnection = async () => {
    await testConnectionMutation.mutateAsync(configData)
  }

  const handleTestUserLookup = async () => {
    if (!testUsername.trim()) {
      return
    }
    await testUserLookupMutation.mutateAsync(testUsername)
  }

  const connectionResult = testConnectionMutation.data
  const userLookupResult = testUserLookupMutation.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'اختبار اتصال LDAP' : 'Test LDAP Connection'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'تحقق من إعدادات LDAP واختبر البحث عن المستخدمين'
              : 'Verify your LDAP settings and test user lookup'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Test Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {isRTL ? 'اختبار الاتصال' : 'Connection Test'}
              </h3>
              <Button
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                size="sm"
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                ) : (
                  <TestTube2 className="h-4 w-4 ms-2" />
                )}
                {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
              </Button>
            </div>

            {connectionResult && (
              <Alert
                variant={connectionResult.success ? 'default' : 'destructive'}
                className={connectionResult.success ? 'border-green-200 bg-green-50' : ''}
              >
                {connectionResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <p className="font-medium mb-2">
                    {isRTL ? connectionResult.messageAr : connectionResult.message}
                  </p>
                  {connectionResult.details && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {connectionResult.details.canConnect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>
                          {isRTL
                            ? 'الاتصال بالخادم'
                            : 'Server Connection'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {connectionResult.details.canBind ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>
                          {isRTL
                            ? 'ربط المصادقة'
                            : 'Authentication Bind'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {connectionResult.details.canSearch ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>
                          {isRTL
                            ? 'البحث في الدليل'
                            : 'Directory Search'}
                        </span>
                      </div>
                      {connectionResult.details.usersFound !== undefined && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-medium">
                            {isRTL
                              ? `تم العثور على ${connectionResult.details.usersFound} مستخدم`
                              : `Found ${connectionResult.details.usersFound} users`}
                          </span>
                        </div>
                      )}
                      {connectionResult.details.groupsFound !== undefined && (
                        <div>
                          <span className="font-medium">
                            {isRTL
                              ? `تم العثور على ${connectionResult.details.groupsFound} مجموعة`
                              : `Found ${connectionResult.details.groupsFound} groups`}
                          </span>
                        </div>
                      )}
                      {connectionResult.details.error && (
                        <div className="pt-2 border-t border-slate-200 text-red-600">
                          <span className="font-medium">{isRTL ? 'خطأ: ' : 'Error: '}</span>
                          {connectionResult.details.error}
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* User Lookup Test Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold mb-2">
                {isRTL ? 'اختبار البحث عن مستخدم' : 'User Lookup Test'}
              </h3>
              <p className="text-sm text-slate-500">
                {isRTL
                  ? 'أدخل اسم مستخدم للتحقق من أن خاصية تعيين السمات تعمل بشكل صحيح'
                  : 'Enter a username to verify that attribute mapping is working correctly'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="test-username">
                  {isRTL ? 'اسم المستخدم' : 'Username'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="test-username"
                    value={testUsername}
                    onChange={(e) => setTestUsername(e.target.value)}
                    placeholder={isRTL ? 'مثال: john.doe' : 'Example: john.doe'}
                    dir="ltr"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && testUsername.trim()) {
                        handleTestUserLookup()
                      }
                    }}
                  />
                  <Button
                    onClick={handleTestUserLookup}
                    disabled={testUserLookupMutation.isPending || !testUsername.trim()}
                  >
                    {testUserLookupMutation.isPending ? (
                      <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 ms-2" />
                    )}
                    {isRTL ? 'بحث' : 'Search'}
                  </Button>
                </div>
              </div>

              {userLookupResult && (
                <Alert
                  variant={userLookupResult.success ? 'default' : 'destructive'}
                  className={userLookupResult.success ? 'border-green-200 bg-green-50' : ''}
                >
                  {userLookupResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {userLookupResult.success && userLookupResult.user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {isRTL ? 'تم العثور على المستخدم' : 'User Found'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <span className="text-slate-600">
                              {isRTL ? 'اسم المستخدم:' : 'Username:'}
                            </span>
                            <Badge variant="outline" className="font-mono">
                              {userLookupResult.user.username}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <span className="text-slate-600">
                              {isRTL ? 'البريد الإلكتروني:' : 'Email:'}
                            </span>
                            <Badge variant="outline" className="font-mono" dir="ltr">
                              {userLookupResult.user.email}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <span className="text-slate-600">
                              {isRTL ? 'الاسم:' : 'Name:'}
                            </span>
                            <Badge variant="outline">
                              {userLookupResult.user.firstName} {userLookupResult.user.lastName}
                            </Badge>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-white rounded-lg">
                            <span className="text-slate-600 text-xs">
                              {isRTL ? 'DN:' : 'DN:'}
                            </span>
                            <code className="text-xs font-mono text-slate-800" dir="ltr">
                              {userLookupResult.user.dn}
                            </code>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>
                        {userLookupResult.error ||
                          (isRTL
                            ? 'لم يتم العثور على المستخدم'
                            : 'User not found')}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Information Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isRTL
                ? 'تأكد من أن إعدادات LDAP صحيحة قبل حفظها. يمكنك اختبار الاتصال والبحث عن مستخدم للتحقق من الإعدادات.'
                : 'Make sure your LDAP settings are correct before saving. You can test the connection and search for a user to verify the settings.'}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
