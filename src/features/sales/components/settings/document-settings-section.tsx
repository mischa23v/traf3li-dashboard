/**
 * Document Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { SettingsField } from './settings-field'
import { DocumentSettings } from '@/types/salesSettings'
import { useLanguage } from '@/hooks/use-language'

interface DocumentSettingsSectionProps {
  settings: DocumentSettings
  onChange: (settings: DocumentSettings) => void
}

export function DocumentSettingsSection({ settings, onChange }: DocumentSettingsSectionProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const handleFieldChange = (field: keyof DocumentSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات المستندات' : 'Document Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'قوالب المستندات واللغة والشروط والأحكام'
            : 'Document templates, language, and terms'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'defaultLanguage',
            label: 'Default Language',
            labelAr: 'اللغة الافتراضية',
            type: 'select',
            options: [
              { value: 'en', label: 'English Only', labelAr: 'الإنجليزية فقط' },
              { value: 'ar', label: 'Arabic Only', labelAr: 'العربية فقط' },
              { value: 'both', label: 'Bilingual (Both)', labelAr: 'ثنائي اللغة (كلاهما)' },
            ],
            helpText: 'Default language for documents',
            helpTextAr: 'اللغة الافتراضية للمستندات',
          }}
          value={settings.defaultLanguage}
          onChange={(value) => handleFieldChange('defaultLanguage', value)}
        />

        <SettingsField
          field={{
            key: 'showLogo',
            label: 'Show Company Logo',
            labelAr: 'عرض شعار الشركة',
            type: 'boolean',
            helpText: 'Display company logo on documents',
            helpTextAr: 'عرض شعار الشركة على المستندات',
          }}
          value={settings.showLogo}
          onChange={(value) => handleFieldChange('showLogo', value)}
        />

        <SettingsField
          field={{
            key: 'showTermsAndConditions',
            label: 'Show Terms and Conditions',
            labelAr: 'عرض الشروط والأحكام',
            type: 'boolean',
            helpText: 'Display terms and conditions section',
            helpTextAr: 'عرض قسم الشروط والأحكام',
          }}
          value={settings.showTermsAndConditions}
          onChange={(value) => handleFieldChange('showTermsAndConditions', value)}
        />

        {settings.showTermsAndConditions && (
          <div className="ml-4 space-y-4">
            <SettingsField
              field={{
                key: 'defaultTermsAndConditions',
                label: 'Terms and Conditions (English)',
                labelAr: 'الشروط والأحكام (إنجليزي)',
                type: 'textarea',
                placeholder: 'Enter terms and conditions in English',
                placeholderAr: 'أدخل الشروط والأحكام بالإنجليزية',
              }}
              value={settings.defaultTermsAndConditions}
              onChange={(value) => handleFieldChange('defaultTermsAndConditions', value)}
            />

            <SettingsField
              field={{
                key: 'defaultTermsAndConditionsAr',
                label: 'Terms and Conditions (Arabic)',
                labelAr: 'الشروط والأحكام (عربي)',
                type: 'textarea',
                placeholder: 'أدخل الشروط والأحكام بالعربية',
                placeholderAr: 'أدخل الشروط والأحكام بالعربية',
              }}
              value={settings.defaultTermsAndConditionsAr}
              onChange={(value) => handleFieldChange('defaultTermsAndConditionsAr', value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
