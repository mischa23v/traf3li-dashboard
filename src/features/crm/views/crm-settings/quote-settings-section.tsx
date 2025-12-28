/**
 * Quote CRM Settings Section
 * Numbering, validity, payment terms, approval
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { QuoteCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'

interface QuoteCrmSettingsSectionProps {
  settings: QuoteCrmSettings
  onChange: (settings: QuoteCrmSettings) => void
}

export function QuoteCrmSettingsSection({ settings, onChange }: QuoteCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof QuoteCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات العروض' : 'Quote Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة الترقيم والصلاحية وشروط الدفع والموافقة'
            : 'Manage numbering, validity, payment terms, and approval'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrmSettingsField
            field={{
              key: 'autoNumbering',
              label: 'Enable Auto-Numbering',
              labelAr: 'تفعيل الترقيم التلقائي',
              type: 'boolean',
              helpText: 'Automatically generate quote numbers',
              helpTextAr: 'إنشاء أرقام العروض تلقائياً',
            }}
            value={settings.autoNumbering}
            onChange={(value) => handleFieldChange('autoNumbering', value)}
          />

          <CrmSettingsField
            field={{
              key: 'numberPrefix',
              label: 'Number Prefix',
              labelAr: 'بادئة الرقم',
              type: 'text',
              placeholder: 'QT-',
              placeholderAr: 'QT-',
              helpText: 'Prefix for quote numbers',
              helpTextAr: 'بادئة لأرقام العروض',
            }}
            value={settings.numberPrefix}
            onChange={(value) => handleFieldChange('numberPrefix', value)}
          />

          <CrmSettingsField
            field={{
              key: 'numberFormat',
              label: 'Number Format',
              labelAr: 'تنسيق الرقم',
              type: 'select',
              options: [
                { value: 'YYYY-####', label: 'YYYY-#### (2025-0001)', labelAr: 'YYYY-#### (2025-0001)' },
                { value: 'YYMM-####', label: 'YYMM-#### (2512-0001)', labelAr: 'YYMM-#### (2512-0001)' },
                { value: '####', label: '#### (0001)', labelAr: '#### (0001)' },
              ],
              helpText: 'Format for quote numbers',
              helpTextAr: 'تنسيق أرقام العروض',
            }}
            value={settings.numberFormat}
            onChange={(value) => handleFieldChange('numberFormat', value)}
          />

          <CrmSettingsField
            field={{
              key: 'defaultValidityDays',
              label: 'Default Validity (Days)',
              labelAr: 'الصلاحية الافتراضية (أيام)',
              type: 'number',
              min: 1,
              max: 365,
              helpText: 'Default quote validity period',
              helpTextAr: 'فترة صلاحية العرض الافتراضية',
            }}
            value={settings.defaultValidityDays}
            onChange={(value) => handleFieldChange('defaultValidityDays', value)}
          />

          <CrmSettingsField
            field={{
              key: 'defaultPaymentTerms',
              label: 'Default Payment Terms',
              labelAr: 'شروط الدفع الافتراضية',
              type: 'text',
              placeholder: 'Net 30',
              placeholderAr: 'خلال 30 يوم',
              helpText: 'Default payment terms',
              helpTextAr: 'شروط الدفع الافتراضية',
            }}
            value={settings.defaultPaymentTerms}
            onChange={(value) => handleFieldChange('defaultPaymentTerms', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'إعدادات الموافقة' : 'Approval Settings'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'requireApproval',
              label: 'Require Manager Approval',
              labelAr: 'طلب موافقة المدير',
              type: 'boolean',
              helpText: 'Require manager approval for quotes',
              helpTextAr: 'طلب موافقة المدير للعروض',
            }}
            value={settings.requireApproval}
            onChange={(value) => handleFieldChange('requireApproval', value)}
          />

          {settings.requireApproval && (
            <CrmSettingsField
              field={{
                key: 'approvalThreshold',
                label: 'Approval Threshold Amount',
                labelAr: 'مبلغ عتبة الموافقة',
                type: 'currency',
                min: 0,
                helpText: 'Quotes above this amount require approval',
                helpTextAr: 'العروض التي تتجاوز هذا المبلغ تتطلب موافقة',
              }}
              value={settings.approvalThreshold}
              onChange={(value) => handleFieldChange('approvalThreshold', value)}
            />
          )}

          <CrmSettingsField
            field={{
              key: 'enableESignature',
              label: 'Enable E-Signature',
              labelAr: 'تفعيل التوقيع الإلكتروني',
              type: 'boolean',
              helpText: 'Enable electronic signature for quotes',
              helpTextAr: 'تفعيل التوقيع الإلكتروني للعروض',
            }}
            value={settings.enableESignature}
            onChange={(value) => handleFieldChange('enableESignature', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'إعدادات التذكير' : 'Reminder Settings'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'sendExpiryReminder',
              label: 'Send Expiry Reminders',
              labelAr: 'إرسال تذكيرات انتهاء الصلاحية',
              type: 'boolean',
              helpText: 'Send reminder before quote expires',
              helpTextAr: 'إرسال تذكير قبل انتهاء صلاحية العرض',
            }}
            value={settings.sendExpiryReminder}
            onChange={(value) => handleFieldChange('sendExpiryReminder', value)}
          />

          {settings.sendExpiryReminder && (
            <CrmSettingsField
              field={{
                key: 'reminderDaysBefore',
                label: 'Reminder Days Before Expiry',
                labelAr: 'أيام التذكير قبل انتهاء الصلاحية',
                type: 'number',
                min: 1,
                max: 30,
                helpText: 'Days before expiry to send reminder',
                helpTextAr: 'الأيام قبل انتهاء الصلاحية لإرسال التذكير',
              }}
              value={settings.reminderDaysBefore}
              onChange={(value) => handleFieldChange('reminderDaysBefore', value)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
