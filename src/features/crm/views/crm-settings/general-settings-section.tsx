/**
 * General CRM Settings Section
 * Currency, language, timezone, date format
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { GeneralCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'

interface GeneralCrmSettingsSectionProps {
  settings: GeneralCrmSettings
  onChange: (settings: GeneralCrmSettings) => void
}

export function GeneralCrmSettingsSection({ settings, onChange }: GeneralCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof GeneralCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'الإعدادات العامة' : 'General Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إعدادات العملة واللغة والمنطقة الزمنية وتنسيق التاريخ'
            : 'Configure currency, language, timezone, and date format'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrmSettingsField
            field={{
              key: 'defaultCurrency',
              label: 'Default Currency',
              labelAr: 'العملة الافتراضية',
              type: 'select',
              options: [
                { value: 'SAR', label: 'Saudi Riyal (SAR)', labelAr: 'ريال سعودي (SAR)' },
                { value: 'USD', label: 'US Dollar (USD)', labelAr: 'دولار أمريكي (USD)' },
                { value: 'EUR', label: 'Euro (EUR)', labelAr: 'يورو (EUR)' },
                { value: 'AED', label: 'UAE Dirham (AED)', labelAr: 'درهم إماراتي (AED)' },
              ],
              helpText: 'Currency for all CRM transactions',
              helpTextAr: 'العملة لجميع معاملات CRM',
            }}
            value={settings.defaultCurrency}
            onChange={(value) => handleFieldChange('defaultCurrency', value)}
          />

          <CrmSettingsField
            field={{
              key: 'defaultLanguage',
              label: 'Default Language',
              labelAr: 'اللغة الافتراضية',
              type: 'select',
              options: [
                { value: 'en', label: 'English Only', labelAr: 'الإنجليزية فقط' },
                { value: 'ar', label: 'Arabic Only', labelAr: 'العربية فقط' },
                { value: 'both', label: 'Both Languages', labelAr: 'كلتا اللغتين' },
              ],
              helpText: 'Default language for CRM interface',
              helpTextAr: 'اللغة الافتراضية لواجهة CRM',
            }}
            value={settings.defaultLanguage}
            onChange={(value) => handleFieldChange('defaultLanguage', value)}
          />

          <CrmSettingsField
            field={{
              key: 'timezone',
              label: 'Timezone',
              labelAr: 'المنطقة الزمنية',
              type: 'select',
              options: [
                { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)', labelAr: 'الرياض (GMT+3)' },
                { value: 'Asia/Dubai', label: 'Dubai (GMT+4)', labelAr: 'دبي (GMT+4)' },
                { value: 'Europe/London', label: 'London (GMT)', labelAr: 'لندن (GMT)' },
                { value: 'America/New_York', label: 'New York (GMT-5)', labelAr: 'نيويورك (GMT-5)' },
              ],
              helpText: 'Default timezone for dates and times',
              helpTextAr: 'المنطقة الزمنية الافتراضية للتواريخ والأوقات',
            }}
            value={settings.timezone}
            onChange={(value) => handleFieldChange('timezone', value)}
          />

          <CrmSettingsField
            field={{
              key: 'dateFormat',
              label: 'Date Format',
              labelAr: 'تنسيق التاريخ',
              type: 'select',
              options: [
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)', labelAr: 'DD/MM/YYYY (31/12/2025)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)', labelAr: 'MM/DD/YYYY (12/31/2025)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)', labelAr: 'YYYY-MM-DD (2025-12-31)' },
              ],
              helpText: 'Date format for display',
              helpTextAr: 'تنسيق التاريخ للعرض',
            }}
            value={settings.dateFormat}
            onChange={(value) => handleFieldChange('dateFormat', value)}
          />

          <CrmSettingsField
            field={{
              key: 'timeFormat',
              label: 'Time Format',
              labelAr: 'تنسيق الوقت',
              type: 'select',
              options: [
                { value: '12h', label: '12-hour (2:30 PM)', labelAr: '12 ساعة (2:30 م)' },
                { value: '24h', label: '24-hour (14:30)', labelAr: '24 ساعة (14:30)' },
              ],
              helpText: 'Time format for display',
              helpTextAr: 'تنسيق الوقت للعرض',
            }}
            value={settings.timeFormat}
            onChange={(value) => handleFieldChange('timeFormat', value)}
          />

          <CrmSettingsField
            field={{
              key: 'fiscalYearStart',
              label: 'Fiscal Year Start Month',
              labelAr: 'شهر بداية السنة المالية',
              type: 'select',
              options: [
                { value: '1', label: 'January', labelAr: 'يناير' },
                { value: '2', label: 'February', labelAr: 'فبراير' },
                { value: '3', label: 'March', labelAr: 'مارس' },
                { value: '4', label: 'April', labelAr: 'أبريل' },
                { value: '5', label: 'May', labelAr: 'مايو' },
                { value: '6', label: 'June', labelAr: 'يونيو' },
                { value: '7', label: 'July', labelAr: 'يوليو' },
                { value: '8', label: 'August', labelAr: 'أغسطس' },
                { value: '9', label: 'September', labelAr: 'سبتمبر' },
                { value: '10', label: 'October', labelAr: 'أكتوبر' },
                { value: '11', label: 'November', labelAr: 'نوفمبر' },
                { value: '12', label: 'December', labelAr: 'ديسمبر' },
              ],
              helpText: 'Month when fiscal year begins',
              helpTextAr: 'الشهر الذي تبدأ فيه السنة المالية',
            }}
            value={settings.fiscalYearStart.toString()}
            onChange={(value) => handleFieldChange('fiscalYearStart', parseInt(value))}
          />
        </div>
      </CardContent>
    </Card>
  )
}
