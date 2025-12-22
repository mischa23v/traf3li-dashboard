/**
 * LDAP Configuration Form Component
 * Form for configuring LDAP/Active Directory settings
 */

import { useTranslation } from 'react-i18next'
import { Server, Key, Users, Shield, Eye, EyeOff, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LDAPConfigFormData } from '@/services/ldapService'
import { useState } from 'react'

interface LDAPConfigFormProps {
  formData: LDAPConfigFormData
  onChange: (field: string, value: any) => void
  onNestedChange: (parent: string, field: string, value: any) => void
}

export function LDAPConfigForm({ formData, onChange, onNestedChange }: LDAPConfigFormProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [showBindPassword, setShowBindPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Server Configuration */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'إعدادات الخادم' : 'Server Configuration'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'إعدادات الاتصال بخادم LDAP أو Active Directory'
              : 'Connection settings for your LDAP or Active Directory server'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server URL */}
          <div className="space-y-2">
            <Label htmlFor="serverUrl">
              {isRTL ? 'عنوان URL للخادم' : 'Server URL'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serverUrl"
              value={formData.serverUrl}
              onChange={(e) => onChange('serverUrl', e.target.value)}
              placeholder="ldap://ldap.example.com:389"
              dir="ltr"
            />
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'استخدم ldap:// للاتصال العادي أو ldaps:// لـ LDAP عبر SSL'
                : 'Use ldap:// for plain connection or ldaps:// for LDAP over SSL'}
            </p>
          </div>

          {/* Bind DN */}
          <div className="space-y-2">
            <Label htmlFor="bindDN">
              {isRTL ? 'DN للربط (Bind DN)' : 'Bind DN'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bindDN"
              value={formData.bindDN}
              onChange={(e) => onChange('bindDN', e.target.value)}
              placeholder="cn=admin,dc=example,dc=com"
              dir="ltr"
            />
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'DN للمستخدم الذي سيتم استخدامه للربط والبحث في الدليل'
                : 'DN of the user account used to bind and search the directory'}
            </p>
          </div>

          {/* Bind Password */}
          <div className="space-y-2">
            <Label htmlFor="bindPassword">
              {isRTL ? 'كلمة مرور الربط' : 'Bind Password'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="bindPassword"
                type={showBindPassword ? 'text' : 'password'}
                value={formData.bindPassword}
                onChange={(e) => onChange('bindPassword', e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="pe-10"
              />
              <button
                type="button"
                onClick={() => setShowBindPassword(!showBindPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
              >
                {showBindPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <Label htmlFor="useTLS" className="text-sm font-medium">
                  {isRTL ? 'استخدام StartTLS' : 'Use StartTLS'}
                </Label>
                <p className="text-xs text-slate-500">
                  {isRTL
                    ? 'ترقية الاتصال إلى TLS بعد الاتصال الأولي'
                    : 'Upgrade connection to TLS after initial connection'}
                </p>
              </div>
              <Switch
                id="useTLS"
                checked={formData.useTLS}
                onCheckedChange={(checked) => onChange('useTLS', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <Label htmlFor="useSSL" className="text-sm font-medium">
                  {isRTL ? 'استخدام SSL/TLS' : 'Use SSL/TLS'}
                </Label>
                <p className="text-xs text-slate-500">
                  {isRTL
                    ? 'اتصال مشفر كامل من البداية (ldaps://)'
                    : 'Full encrypted connection from start (ldaps://)'}
                </p>
              </div>
              <Switch
                id="useSSL"
                checked={formData.useSSL}
                onCheckedChange={(checked) => onChange('useSSL', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Search Configuration */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'إعدادات البحث عن المستخدمين' : 'User Search Configuration'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'تحديد كيفية البحث عن المستخدمين في الدليل'
              : 'Specify how to search for users in the directory'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base DN */}
          <div className="space-y-2">
            <Label htmlFor="baseDN">
              {isRTL ? 'DN الأساسي للمستخدمين' : 'User Base DN'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="baseDN"
              value={formData.baseDN}
              onChange={(e) => onChange('baseDN', e.target.value)}
              placeholder="ou=users,dc=example,dc=com"
              dir="ltr"
            />
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'DN الأساسي حيث يتم تخزين حسابات المستخدمين'
                : 'Base DN where user accounts are stored'}
            </p>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label htmlFor="userFilter">
              {isRTL ? 'مرشح البحث عن المستخدمين' : 'User Search Filter'}
            </Label>
            <Textarea
              id="userFilter"
              value={formData.userFilter}
              onChange={(e) => onChange('userFilter', e.target.value)}
              placeholder="(&(objectClass=person)(uid=%s))"
              dir="ltr"
              rows={2}
            />
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'مرشح LDAP للبحث عن المستخدمين. استخدم %s كعنصر نائب لاسم المستخدم'
                : 'LDAP filter to search for users. Use %s as placeholder for username'}
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {isRTL
                ? 'أمثلة: Active Directory: (&(objectClass=user)(sAMAccountName=%s)) | OpenLDAP: (&(objectClass=person)(uid=%s))'
                : 'Examples: Active Directory: (&(objectClass=user)(sAMAccountName=%s)) | OpenLDAP: (&(objectClass=person)(uid=%s))'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Attribute Mapping */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'تعيين السمات' : 'Attribute Mapping'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'ربط سمات LDAP بحقول المستخدم في النظام'
              : 'Map LDAP attributes to system user fields'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Attribute */}
            <div className="space-y-2">
              <Label htmlFor="attr-email">
                {isRTL ? 'سمة البريد الإلكتروني' : 'Email Attribute'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="attr-email"
                value={formData.attributeMappings.email}
                onChange={(e) => onNestedChange('attributeMappings', 'email', e.target.value)}
                placeholder="mail"
                dir="ltr"
              />
            </div>

            {/* Username Attribute */}
            <div className="space-y-2">
              <Label htmlFor="attr-username">
                {isRTL ? 'سمة اسم المستخدم' : 'Username Attribute'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="attr-username"
                value={formData.attributeMappings.username}
                onChange={(e) => onNestedChange('attributeMappings', 'username', e.target.value)}
                placeholder="uid"
                dir="ltr"
              />
            </div>

            {/* First Name Attribute */}
            <div className="space-y-2">
              <Label htmlFor="attr-firstName">
                {isRTL ? 'سمة الاسم الأول' : 'First Name Attribute'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="attr-firstName"
                value={formData.attributeMappings.firstName}
                onChange={(e) => onNestedChange('attributeMappings', 'firstName', e.target.value)}
                placeholder="givenName"
                dir="ltr"
              />
            </div>

            {/* Last Name Attribute */}
            <div className="space-y-2">
              <Label htmlFor="attr-lastName">
                {isRTL ? 'سمة اسم العائلة' : 'Last Name Attribute'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="attr-lastName"
                value={formData.attributeMappings.lastName}
                onChange={(e) => onNestedChange('attributeMappings', 'lastName', e.target.value)}
                placeholder="sn"
                dir="ltr"
              />
            </div>

            {/* Phone Attribute (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="attr-phone">
                {isRTL ? 'سمة رقم الهاتف' : 'Phone Attribute'} {isRTL ? '(اختياري)' : '(Optional)'}
              </Label>
              <Input
                id="attr-phone"
                value={formData.attributeMappings.phone || ''}
                onChange={(e) => onNestedChange('attributeMappings', 'phone', e.target.value)}
                placeholder="telephoneNumber"
                dir="ltr"
              />
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {isRTL
                ? 'Active Directory الشائع: mail, sAMAccountName, givenName, sn, telephoneNumber | OpenLDAP الشائع: mail, uid, givenName, sn, telephoneNumber'
                : 'Common Active Directory: mail, sAMAccountName, givenName, sn, telephoneNumber | Common OpenLDAP: mail, uid, givenName, sn, telephoneNumber'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Group Sync Configuration */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            {isRTL ? 'مزامنة المجموعات' : 'Group Synchronization'}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'مزامنة عضوية المجموعات من LDAP (اختياري)'
              : 'Synchronize group memberships from LDAP (optional)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Group Sync */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <Label htmlFor="groupSyncEnabled" className="text-base font-medium">
                {isRTL ? 'تمكين مزامنة المجموعات' : 'Enable Group Sync'}
              </Label>
              <p className="text-sm text-slate-500">
                {isRTL
                  ? 'مزامنة عضوية المجموعات تلقائياً من LDAP'
                  : 'Automatically sync group memberships from LDAP'}
              </p>
            </div>
            <Switch
              id="groupSyncEnabled"
              checked={formData.groupSync.enabled}
              onCheckedChange={(checked) => onNestedChange('groupSync', 'enabled', checked)}
            />
          </div>

          {formData.groupSync.enabled && (
            <div className="space-y-4 ps-4">
              <Separator />

              {/* Group Base DN */}
              <div className="space-y-2">
                <Label htmlFor="groupBaseDN">
                  {isRTL ? 'DN الأساسي للمجموعات' : 'Group Base DN'}
                </Label>
                <Input
                  id="groupBaseDN"
                  value={formData.groupSync.baseDN || ''}
                  onChange={(e) => onNestedChange('groupSync', 'baseDN', e.target.value)}
                  placeholder="ou=groups,dc=example,dc=com"
                  dir="ltr"
                />
              </div>

              {/* Group Filter */}
              <div className="space-y-2">
                <Label htmlFor="groupFilter">
                  {isRTL ? 'مرشح المجموعات' : 'Group Filter'}
                </Label>
                <Input
                  id="groupFilter"
                  value={formData.groupSync.groupFilter || ''}
                  onChange={(e) => onNestedChange('groupSync', 'groupFilter', e.target.value)}
                  placeholder="(objectClass=groupOfNames)"
                  dir="ltr"
                />
              </div>

              {/* Member Attribute */}
              <div className="space-y-2">
                <Label htmlFor="memberAttribute">
                  {isRTL ? 'سمة العضو' : 'Member Attribute'}
                </Label>
                <Input
                  id="memberAttribute"
                  value={formData.groupSync.memberAttribute || ''}
                  onChange={(e) => onNestedChange('groupSync', 'memberAttribute', e.target.value)}
                  placeholder="member"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500">
                  {isRTL
                    ? 'السمة التي تحتوي على DNs للأعضاء (مثل: member، memberUid)'
                    : 'Attribute that contains member DNs (e.g., member, memberUid)'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
