/**
 * General Settings Section
 *
 * General sales configuration including currency, payment terms, rounding, etc.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'
import { SettingsField } from './settings-field'
import { GeneralSettings } from '@/types/salesSettings'
import { useLanguage } from '@/hooks/use-language'

interface GeneralSettingsSectionProps {
  settings: GeneralSettings
  onChange: (settings: GeneralSettings) => void
}

export function GeneralSettingsSection({ settings, onChange }: GeneralSettingsSectionProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const handleFieldChange = (field: keyof GeneralSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'الإعدادات العامة' : 'General Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إعدادات المبيعات الأساسية والعملة وشروط الدفع'
            : 'Basic sales settings, currency, and payment terms'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
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
              helpText: 'Currency for all sales transactions',
              helpTextAr: 'العملة لجميع معاملات المبيعات',
            }}
            value={settings.defaultCurrency}
            onChange={(value) => handleFieldChange('defaultCurrency', value)}
          />

          <SettingsField
            field={{
              key: 'defaultPaymentTerms',
              label: 'Default Payment Terms',
              labelAr: 'شروط الدفع الافتراضية',
              type: 'text',
              placeholder: 'Net 30',
              placeholderAr: 'خلال 30 يوم',
              helpText: 'Default payment terms label',
              helpTextAr: 'تسمية شروط الدفع الافتراضية',
            }}
            value={settings.defaultPaymentTerms}
            onChange={(value) => handleFieldChange('defaultPaymentTerms', value)}
          />

          <SettingsField
            field={{
              key: 'defaultPaymentTermsDays',
              label: 'Payment Terms (Days)',
              labelAr: 'شروط الدفع (أيام)',
              type: 'number',
              min: 0,
              helpText: 'Number of days until payment is due',
              helpTextAr: 'عدد الأيام حتى استحقاق الدفع',
            }}
            value={settings.defaultPaymentTermsDays}
            onChange={(value) => handleFieldChange('defaultPaymentTermsDays', value)}
          />

          <SettingsField
            field={{
              key: 'roundingMethod',
              label: 'Rounding Method',
              labelAr: 'طريقة التقريب',
              type: 'select',
              options: [
                { value: 'none', label: 'No Rounding', labelAr: 'بدون تقريب' },
                { value: 'up', label: 'Round Up', labelAr: 'تقريب لأعلى' },
                { value: 'down', label: 'Round Down', labelAr: 'تقريب لأسفل' },
                { value: 'nearest', label: 'Round to Nearest', labelAr: 'تقريب للأقرب' },
              ],
              helpText: 'How to round calculated amounts',
              helpTextAr: 'كيفية تقريب المبالغ المحسوبة',
            }}
            value={settings.roundingMethod}
            onChange={(value) => handleFieldChange('roundingMethod', value)}
          />

          <SettingsField
            field={{
              key: 'roundingPrecision',
              label: 'Rounding Precision',
              labelAr: 'دقة التقريب',
              type: 'number',
              min: 0,
              max: 4,
              helpText: 'Number of decimal places (0-4)',
              helpTextAr: 'عدد المنازل العشرية (0-4)',
            }}
            value={settings.roundingPrecision}
            onChange={(value) => handleFieldChange('roundingPrecision', value)}
          />
        </div>

        <SettingsField
          field={{
            key: 'requireCustomerOnQuote',
            label: 'Require Customer on Quote',
            labelAr: 'إلزامية العميل في العرض',
            type: 'boolean',
            helpText: 'Customer selection required when creating quotes',
            helpTextAr: 'اختيار العميل إلزامي عند إنشاء العروض',
          }}
          value={settings.requireCustomerOnQuote}
          onChange={(value) => handleFieldChange('requireCustomerOnQuote', value)}
        />

        <SettingsField
          field={{
            key: 'requireCustomerOnOrder',
            label: 'Require Customer on Order',
            labelAr: 'إلزامية العميل في الطلب',
            type: 'boolean',
            helpText: 'Customer selection required when creating orders',
            helpTextAr: 'اختيار العميل إلزامي عند إنشاء الطلبات',
          }}
          value={settings.requireCustomerOnOrder}
          onChange={(value) => handleFieldChange('requireCustomerOnOrder', value)}
        />

        <SettingsField
          field={{
            key: 'allowNegativePrices',
            label: 'Allow Negative Prices',
            labelAr: 'السماح بالأسعار السالبة',
            type: 'boolean',
            helpText: 'Allow negative prices in line items',
            helpTextAr: 'السماح بالأسعار السالبة في بنود السطر',
          }}
          value={settings.allowNegativePrices}
          onChange={(value) => handleFieldChange('allowNegativePrices', value)}
        />
      </CardContent>
    </Card>
  )
}
