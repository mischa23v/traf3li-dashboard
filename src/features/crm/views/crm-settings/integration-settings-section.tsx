/**
 * Integration CRM Settings Section
 * WhatsApp, Calendar, Email provider
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plug } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { IntegrationCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'

interface IntegrationCrmSettingsSectionProps {
  settings: IntegrationCrmSettings
  onChange: (settings: IntegrationCrmSettings) => void
}

export function IntegrationCrmSettingsSection({ settings, onChange }: IntegrationCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleWhatsAppChange = (field: keyof typeof settings.whatsapp, value: any) => {
    onChange({
      ...settings,
      whatsapp: { ...settings.whatsapp, [field]: value },
    })
  }

  const handleCalendarChange = (field: keyof typeof settings.calendar, value: any) => {
    onChange({
      ...settings,
      calendar: { ...settings.calendar, [field]: value },
    })
  }

  const handleEmailProviderChange = (field: keyof typeof settings.emailProvider, value: any) => {
    onChange({
      ...settings,
      emailProvider: { ...settings.emailProvider, [field]: value },
    })
  }

  const handleFieldChange = (field: keyof IntegrationCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات التكاملات' : 'Integration Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة تكاملات WhatsApp والتقويم ومزود البريد الإلكتروني'
            : 'Manage WhatsApp, Calendar, and Email provider integrations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* WhatsApp Integration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="text-xl">📱</span>
            {isRTL ? 'تكامل WhatsApp' : 'WhatsApp Integration'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'whatsapp.enabled',
              label: 'Enable WhatsApp Integration',
              labelAr: 'تفعيل تكامل WhatsApp',
              type: 'boolean',
              helpText: 'Connect CRM with WhatsApp Business API',
              helpTextAr: 'ربط CRM مع WhatsApp Business API',
            }}
            value={settings.whatsapp.enabled}
            onChange={(value) => handleWhatsAppChange('enabled', value)}
          />

          {settings.whatsapp.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <CrmSettingsField
                field={{
                  key: 'whatsapp.phoneNumber',
                  label: 'WhatsApp Phone Number',
                  labelAr: 'رقم هاتف WhatsApp',
                  type: 'text',
                  placeholder: '+966 5X XXX XXXX',
                  placeholderAr: '+966 5X XXX XXXX',
                  helpText: 'WhatsApp Business phone number',
                  helpTextAr: 'رقم هاتف WhatsApp Business',
                }}
                value={settings.whatsapp.phoneNumber}
                onChange={(value) => handleWhatsAppChange('phoneNumber', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'whatsapp.apiKey',
                  label: 'API Key',
                  labelAr: 'مفتاح API',
                  type: 'text',
                  placeholder: '••••••••••••••••',
                  placeholderAr: '••••••••••••••••',
                  helpText: 'WhatsApp Business API key (optional)',
                  helpTextAr: 'مفتاح WhatsApp Business API (اختياري)',
                }}
                value={settings.whatsapp.apiKey || ''}
                onChange={(value) => handleWhatsAppChange('apiKey', value || undefined)}
              />
            </div>
          )}
        </div>

        {/* Calendar Integration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="text-xl">📅</span>
            {isRTL ? 'تكامل التقويم' : 'Calendar Integration'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'calendar.enabled',
              label: 'Enable Calendar Integration',
              labelAr: 'تفعيل تكامل التقويم',
              type: 'boolean',
              helpText: 'Sync CRM activities with external calendar',
              helpTextAr: 'مزامنة أنشطة CRM مع التقويم الخارجي',
            }}
            value={settings.calendar.enabled}
            onChange={(value) => handleCalendarChange('enabled', value)}
          />

          {settings.calendar.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <CrmSettingsField
                field={{
                  key: 'calendar.provider',
                  label: 'Calendar Provider',
                  labelAr: 'مزود التقويم',
                  type: 'select',
                  options: [
                    { value: 'none', label: 'None', labelAr: 'لا يوجد' },
                    { value: 'google', label: 'Google Calendar', labelAr: 'تقويم Google' },
                    { value: 'outlook', label: 'Microsoft Outlook', labelAr: 'Microsoft Outlook' },
                    { value: 'apple', label: 'Apple Calendar', labelAr: 'تقويم Apple' },
                  ],
                  helpText: 'Select calendar provider',
                  helpTextAr: 'اختر مزود التقويم',
                }}
                value={settings.calendar.provider}
                onChange={(value) => handleCalendarChange('provider', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'calendar.syncDirection',
                  label: 'Sync Direction',
                  labelAr: 'اتجاه المزامنة',
                  type: 'select',
                  options: [
                    { value: 'one_way', label: 'CRM → Calendar (One Way)', labelAr: 'CRM → التقويم (اتجاه واحد)' },
                    { value: 'two_way', label: 'CRM ↔ Calendar (Two Way)', labelAr: 'CRM ↔ التقويم (اتجاهين)' },
                  ],
                  helpText: 'How to sync events between CRM and calendar',
                  helpTextAr: 'كيفية مزامنة الأحداث بين CRM والتقويم',
                }}
                value={settings.calendar.syncDirection}
                onChange={(value) => handleCalendarChange('syncDirection', value)}
              />
            </div>
          )}
        </div>

        {/* Email Provider Integration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="text-xl">✉️</span>
            {isRTL ? 'تكامل مزود البريد الإلكتروني' : 'Email Provider Integration'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'emailProvider.enabled',
              label: 'Enable Email Provider Integration',
              labelAr: 'تفعيل تكامل مزود البريد الإلكتروني',
              type: 'boolean',
              helpText: 'Connect CRM with email service provider',
              helpTextAr: 'ربط CRM مع مزود خدمة البريد الإلكتروني',
            }}
            value={settings.emailProvider.enabled}
            onChange={(value) => handleEmailProviderChange('enabled', value)}
          />

          {settings.emailProvider.enabled && (
            <div className="space-y-4 ml-6">
              <CrmSettingsField
                field={{
                  key: 'emailProvider.provider',
                  label: 'Email Provider',
                  labelAr: 'مزود البريد الإلكتروني',
                  type: 'select',
                  options: [
                    { value: 'none', label: 'None', labelAr: 'لا يوجد' },
                    { value: 'gmail', label: 'Gmail', labelAr: 'Gmail' },
                    { value: 'outlook', label: 'Outlook', labelAr: 'Outlook' },
                    { value: 'smtp', label: 'Custom SMTP', labelAr: 'SMTP مخصص' },
                  ],
                  helpText: 'Select email provider',
                  helpTextAr: 'اختر مزود البريد الإلكتروني',
                }}
                value={settings.emailProvider.provider}
                onChange={(value) => handleEmailProviderChange('provider', value)}
              />

              {settings.emailProvider.provider === 'smtp' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CrmSettingsField
                    field={{
                      key: 'emailProvider.smtpHost',
                      label: 'SMTP Host',
                      labelAr: 'مضيف SMTP',
                      type: 'text',
                      placeholder: 'smtp.example.com',
                      placeholderAr: 'smtp.example.com',
                      helpText: 'SMTP server hostname',
                      helpTextAr: 'اسم مضيف خادم SMTP',
                    }}
                    value={settings.emailProvider.smtpHost || ''}
                    onChange={(value) => handleEmailProviderChange('smtpHost', value || undefined)}
                  />

                  <CrmSettingsField
                    field={{
                      key: 'emailProvider.smtpPort',
                      label: 'SMTP Port',
                      labelAr: 'منفذ SMTP',
                      type: 'number',
                      placeholder: '587',
                      placeholderAr: '587',
                      helpText: 'SMTP server port',
                      helpTextAr: 'منفذ خادم SMTP',
                      min: 1,
                      max: 65535,
                    }}
                    value={settings.emailProvider.smtpPort || ''}
                    onChange={(value) => handleEmailProviderChange('smtpPort', value || undefined)}
                  />

                  <CrmSettingsField
                    field={{
                      key: 'emailProvider.smtpUsername',
                      label: 'SMTP Username',
                      labelAr: 'اسم مستخدم SMTP',
                      type: 'text',
                      placeholder: 'user@example.com',
                      placeholderAr: 'user@example.com',
                      helpText: 'SMTP authentication username',
                      helpTextAr: 'اسم مستخدم مصادقة SMTP',
                    }}
                    value={settings.emailProvider.smtpUsername || ''}
                    onChange={(value) => handleEmailProviderChange('smtpUsername', value || undefined)}
                  />

                  <CrmSettingsField
                    field={{
                      key: 'emailProvider.useSsl',
                      label: 'Use SSL/TLS',
                      labelAr: 'استخدام SSL/TLS',
                      type: 'boolean',
                      helpText: 'Use secure connection (SSL/TLS)',
                      helpTextAr: 'استخدام اتصال آمن (SSL/TLS)',
                    }}
                    value={settings.emailProvider.useSsl}
                    onChange={(value) => handleEmailProviderChange('useSsl', value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Webhooks & API */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="text-xl">🔗</span>
            {isRTL ? 'Webhooks وAPI' : 'Webhooks & API'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'webhooksEnabled',
              label: 'Enable Webhooks',
              labelAr: 'تفعيل Webhooks',
              type: 'boolean',
              helpText: 'Send event notifications to external URLs',
              helpTextAr: 'إرسال إشعارات الأحداث إلى عناوين URL خارجية',
            }}
            value={settings.webhooksEnabled}
            onChange={(value) => handleFieldChange('webhooksEnabled', value)}
          />

          <CrmSettingsField
            field={{
              key: 'apiAccessEnabled',
              label: 'Enable API Access',
              labelAr: 'تفعيل الوصول إلى API',
              type: 'boolean',
              helpText: 'Allow external applications to access CRM via API',
              helpTextAr: 'السماح للتطبيقات الخارجية بالوصول إلى CRM عبر API',
            }}
            value={settings.apiAccessEnabled}
            onChange={(value) => handleFieldChange('apiAccessEnabled', value)}
          />

          {settings.apiAccessEnabled && (
            <CrmSettingsField
              field={{
                key: 'apiRateLimit',
                label: 'API Rate Limit (per hour)',
                labelAr: 'حد معدل API (في الساعة)',
                type: 'number',
                min: 100,
                max: 10000,
                helpText: 'Maximum API requests per hour',
                helpTextAr: 'الحد الأقصى لطلبات API في الساعة',
              }}
              value={settings.apiRateLimit}
              onChange={(value) => handleFieldChange('apiRateLimit', value)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
