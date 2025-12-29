/**
 * Tax Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt } from 'lucide-react'
import { SettingsField } from './settings-field'
import { TaxSettings } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface TaxSettingsSectionProps {
  settings: TaxSettings
  onChange: (settings: TaxSettings) => void
}

export function TaxSettingsSection({ settings, onChange }: TaxSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof TaxSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الضرائب' : 'Tax Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إعدادات ضريبة القيمة المضافة والحسابات'
            : 'VAT settings and tax calculations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'defaultTaxRate',
            label: 'Default Tax Rate %',
            labelAr: 'معدل الضريبة الافتراضي %',
            type: 'percent',
            min: 0,
            max: 100,
            helpText: 'Default tax rate (e.g., 15 for Saudi VAT)',
            helpTextAr: 'معدل الضريبة الافتراضي (مثلاً 15 لضريبة القيمة المضافة السعودية)',
          }}
          value={settings.defaultTaxRate}
          onChange={(value) => handleFieldChange('defaultTaxRate', value)}
        />

        <SettingsField
          field={{
            key: 'taxIncludedInPrice',
            label: 'Tax Included in Price',
            labelAr: 'الضريبة مشمولة في السعر',
            type: 'boolean',
            helpText: 'Prices already include tax',
            helpTextAr: 'الأسعار تشمل الضريبة بالفعل',
          }}
          value={settings.taxIncludedInPrice}
          onChange={(value) => handleFieldChange('taxIncludedInPrice', value)}
        />

        <SettingsField
          field={{
            key: 'calculateTaxOnDiscount',
            label: 'Calculate Tax on Discount',
            labelAr: 'حساب الضريبة على الخصم',
            type: 'boolean',
            helpText: 'Calculate tax on discounted amount',
            helpTextAr: 'حساب الضريبة على المبلغ بعد الخصم',
          }}
          value={settings.calculateTaxOnDiscount}
          onChange={(value) => handleFieldChange('calculateTaxOnDiscount', value)}
        />

        <SettingsField
          field={{
            key: 'roundTaxPerLine',
            label: 'Round Tax Per Line',
            labelAr: 'تقريب الضريبة لكل سطر',
            type: 'boolean',
            helpText: 'Round tax per line item instead of total',
            helpTextAr: 'تقريب الضريبة لكل بند بدلاً من الإجمالي',
          }}
          value={settings.roundTaxPerLine}
          onChange={(value) => handleFieldChange('roundTaxPerLine', value)}
        />

        <SettingsField
          field={{
            key: 'taxRoundingMethod',
            label: 'Tax Rounding Method',
            labelAr: 'طريقة تقريب الضريبة',
            type: 'select',
            options: [
              { value: 'up', label: 'Round Up', labelAr: 'تقريب لأعلى' },
              { value: 'down', label: 'Round Down', labelAr: 'تقريب لأسفل' },
              { value: 'nearest', label: 'Round to Nearest', labelAr: 'تقريب للأقرب' },
            ],
            helpText: 'How to round tax amounts',
            helpTextAr: 'كيفية تقريب مبالغ الضريبة',
          }}
          value={settings.taxRoundingMethod}
          onChange={(value) => handleFieldChange('taxRoundingMethod', value)}
        />
      </CardContent>
    </Card>
  )
}
