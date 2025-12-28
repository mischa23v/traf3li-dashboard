/**
 * Quote Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { SettingsField } from './settings-field'
import { QuoteSettings } from '@/types/salesSettings'
import { useLanguage } from '@/hooks/use-language'

interface QuoteSettingsSectionProps {
  settings: QuoteSettings
  onChange: (settings: QuoteSettings) => void
}

export function QuoteSettingsSection({ settings, onChange }: QuoteSettingsSectionProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const handleFieldChange = (field: keyof QuoteSettings, value: any) => {
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
            ? 'صلاحية العروض، الموافقات، والترقيم التلقائي'
            : 'Quote validity, approvals, and auto-numbering'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            field={{
              key: 'defaultValidityDays',
              label: 'Default Validity (Days)',
              labelAr: 'الصلاحية الافتراضية (أيام)',
              type: 'number',
              min: 1,
              helpText: 'How long quotes remain valid',
              helpTextAr: 'مدة صلاحية العروض',
            }}
            value={settings.defaultValidityDays}
            onChange={(value) => handleFieldChange('defaultValidityDays', value)}
          />

          <SettingsField
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
        </div>

        <SettingsField
          field={{
            key: 'autoNumbering',
            label: 'Enable Auto-Numbering',
            labelAr: 'تفعيل الترقيم التلقائي',
            type: 'boolean',
            helpText: 'Automatically generate quote numbers',
            helpTextAr: 'إنشاء أرقام العروض تلقائيًا',
          }}
          value={settings.autoNumbering}
          onChange={(value) => handleFieldChange('autoNumbering', value)}
        />

        <SettingsField
          field={{
            key: 'requireApproval',
            label: 'Require Approval',
            labelAr: 'يتطلب موافقة',
            type: 'boolean',
            helpText: 'Require manager approval before sending',
            helpTextAr: 'موافقة المدير مطلوبة قبل الإرسال',
          }}
          value={settings.requireApproval}
          onChange={(value) => handleFieldChange('requireApproval', value)}
        />

        {settings.requireApproval && (
          <div className="ml-4 space-y-4">
            <SettingsField
              field={{
                key: 'approvalThreshold',
                label: 'Approval Threshold',
                labelAr: 'حد الموافقة',
                type: 'currency',
                min: 0,
                helpText: 'Amount that triggers approval requirement',
                helpTextAr: 'المبلغ الذي يتطلب الموافقة',
              }}
              value={settings.approvalThreshold}
              onChange={(value) => handleFieldChange('approvalThreshold', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'sendReminderBeforeExpiry',
            label: 'Send Expiry Reminder',
            labelAr: 'إرسال تذكير انتهاء الصلاحية',
            type: 'boolean',
            helpText: 'Send reminder before quote expires',
            helpTextAr: 'إرسال تذكير قبل انتهاء صلاحية العرض',
          }}
          value={settings.sendReminderBeforeExpiry}
          onChange={(value) => handleFieldChange('sendReminderBeforeExpiry', value)}
        />

        {settings.sendReminderBeforeExpiry && (
          <div className="ml-4">
            <SettingsField
              field={{
                key: 'reminderDaysBefore',
                label: 'Reminder Days Before',
                labelAr: 'أيام التذكير قبل',
                type: 'number',
                min: 1,
                helpText: 'Days before expiry to send reminder',
                helpTextAr: 'الأيام قبل انتهاء الصلاحية لإرسال التذكير',
              }}
              value={settings.reminderDaysBefore}
              onChange={(value) => handleFieldChange('reminderDaysBefore', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'allowConvertToOrder',
            label: 'Allow Convert to Order',
            labelAr: 'السماح بالتحويل إلى طلب',
            type: 'boolean',
            helpText: 'Allow converting quotes to sales orders',
            helpTextAr: 'السماح بتحويل العروض إلى طلبات مبيعات',
          }}
          value={settings.allowConvertToOrder}
          onChange={(value) => handleFieldChange('allowConvertToOrder', value)}
        />

        <SettingsField
          field={{
            key: 'allowConvertToInvoice',
            label: 'Allow Convert to Invoice',
            labelAr: 'السماح بالتحويل إلى فاتورة',
            type: 'boolean',
            helpText: 'Allow converting quotes directly to invoices',
            helpTextAr: 'السماح بتحويل العروض مباشرة إلى فواتير',
          }}
          value={settings.allowConvertToInvoice}
          onChange={(value) => handleFieldChange('allowConvertToInvoice', value)}
        />
      </CardContent>
    </Card>
  )
}
