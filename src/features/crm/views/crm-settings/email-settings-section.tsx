/**
 * Email CRM Settings Section
 * Templates, signature, tracking
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { EmailCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'

interface EmailCrmSettingsSectionProps {
  settings: EmailCrmSettings
  onChange: (settings: EmailCrmSettings) => void
}

export function EmailCrmSettingsSection({ settings, onChange }: EmailCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof EmailCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات البريد الإلكتروني' : 'Email Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة القوالب والتوقيع والتتبع'
            : 'Manage templates, signature, and tracking'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrmSettingsField
            field={{
              key: 'defaultSenderName',
              label: 'Default Sender Name',
              labelAr: 'اسم المرسل الافتراضي',
              type: 'text',
              placeholder: 'CRM Team',
              placeholderAr: 'فريق CRM',
              helpText: 'Name shown as email sender',
              helpTextAr: 'الاسم المعروض كمرسل البريد الإلكتروني',
            }}
            value={settings.defaultSenderName}
            onChange={(value) => handleFieldChange('defaultSenderName', value)}
          />

          <CrmSettingsField
            field={{
              key: 'defaultSenderEmail',
              label: 'Default Sender Email',
              labelAr: 'البريد الإلكتروني للمرسل الافتراضي',
              type: 'text',
              placeholder: 'crm@company.com',
              placeholderAr: 'crm@company.com',
              helpText: 'Email address shown as sender',
              helpTextAr: 'عنوان البريد الإلكتروني المعروض كمرسل',
            }}
            value={settings.defaultSenderEmail}
            onChange={(value) => handleFieldChange('defaultSenderEmail', value)}
          />

          <CrmSettingsField
            field={{
              key: 'bccAddress',
              label: 'BCC Email Address',
              labelAr: 'عنوان BCC',
              type: 'text',
              placeholder: 'admin@company.com',
              placeholderAr: 'admin@company.com',
              helpText: 'BCC all emails to this address (optional)',
              helpTextAr: 'إرسال نسخة مخفية من جميع الرسائل إلى هذا العنوان (اختياري)',
            }}
            value={settings.bccAddress || ''}
            onChange={(value) => handleFieldChange('bccAddress', value || undefined)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'التوقيع' : 'Email Signature'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'signature',
              label: 'Email Signature (English)',
              labelAr: 'توقيع البريد الإلكتروني (الإنجليزية)',
              type: 'textarea',
              placeholder: 'Best regards,\nYour Name\nCompany Name',
              placeholderAr: 'Best regards,\nYour Name\nCompany Name',
              helpText: 'Email signature in English',
              helpTextAr: 'توقيع البريد الإلكتروني بالإنجليزية',
            }}
            value={settings.signature}
            onChange={(value) => handleFieldChange('signature', value)}
          />

          <CrmSettingsField
            field={{
              key: 'signatureAr',
              label: 'Email Signature (Arabic)',
              labelAr: 'توقيع البريد الإلكتروني (العربية)',
              type: 'textarea',
              placeholder: 'مع أطيب التحيات،\nاسمك\nاسم الشركة',
              placeholderAr: 'مع أطيب التحيات،\nاسمك\nاسم الشركة',
              helpText: 'Email signature in Arabic',
              helpTextAr: 'توقيع البريد الإلكتروني بالعربية',
            }}
            value={settings.signatureAr}
            onChange={(value) => handleFieldChange('signatureAr', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'التتبع' : 'Email Tracking'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'trackingEnabled',
              label: 'Enable Email Tracking',
              labelAr: 'تفعيل تتبع البريد الإلكتروني',
              type: 'boolean',
              helpText: 'Track email opens and clicks',
              helpTextAr: 'تتبع فتح الرسائل والنقرات',
            }}
            value={settings.trackingEnabled}
            onChange={(value) => handleFieldChange('trackingEnabled', value)}
          />

          {settings.trackingEnabled && (
            <>
              <CrmSettingsField
                field={{
                  key: 'trackOpens',
                  label: 'Track Email Opens',
                  labelAr: 'تتبع فتح الرسائل',
                  type: 'boolean',
                  helpText: 'Track when emails are opened',
                  helpTextAr: 'تتبع وقت فتح الرسائل',
                }}
                value={settings.trackOpens}
                onChange={(value) => handleFieldChange('trackOpens', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'trackClicks',
                  label: 'Track Link Clicks',
                  labelAr: 'تتبع النقرات على الروابط',
                  type: 'boolean',
                  helpText: 'Track when links are clicked',
                  helpTextAr: 'تتبع وقت النقر على الروابط',
                }}
                value={settings.trackClicks}
                onChange={(value) => handleFieldChange('trackClicks', value)}
              />
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'الرد التلقائي' : 'Auto-Response'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'autoResponseEnabled',
              label: 'Enable Auto-Response',
              labelAr: 'تفعيل الرد التلقائي',
              type: 'boolean',
              helpText: 'Automatically respond to incoming emails',
              helpTextAr: 'الرد تلقائياً على الرسائل الواردة',
            }}
            value={settings.autoResponseEnabled}
            onChange={(value) => handleFieldChange('autoResponseEnabled', value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
