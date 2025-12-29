/**
 * Pricing Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { SettingsField } from './settings-field'
import { PricingSettings } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface PricingSettingsSectionProps {
  settings: PricingSettings
  onChange: (settings: PricingSettings) => void
}

export function PricingSettingsSection({ settings, onChange }: PricingSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof PricingSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات التسعير' : 'Pricing Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'قواعد التسعير وقوائم الأسعار والهوامش'
            : 'Pricing rules, price lists, and margins'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'allowPriceOverride',
            label: 'Allow Price Override',
            labelAr: 'السماح بتجاوز السعر',
            type: 'boolean',
            helpText: 'Allow sales reps to override prices',
            helpTextAr: 'السماح لممثلي المبيعات بتجاوز الأسعار',
          }}
          value={settings.allowPriceOverride}
          onChange={(value) => handleFieldChange('allowPriceOverride', value)}
        />

        {settings.allowPriceOverride && (
          <div className="ml-4">
            <SettingsField
              field={{
                key: 'requirePriceOverrideReason',
                label: 'Require Override Reason',
                labelAr: 'سبب التجاوز مطلوب',
                type: 'boolean',
                helpText: 'Require reason when overriding price',
                helpTextAr: 'السبب مطلوب عند تجاوز السعر',
              }}
              value={settings.requirePriceOverrideReason}
              onChange={(value) => handleFieldChange('requirePriceOverrideReason', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'showCostPrice',
            label: 'Show Cost Price',
            labelAr: 'عرض سعر التكلفة',
            type: 'boolean',
            helpText: 'Show cost price to sales reps',
            helpTextAr: 'عرض سعر التكلفة لممثلي المبيعات',
          }}
          value={settings.showCostPrice}
          onChange={(value) => handleFieldChange('showCostPrice', value)}
        />

        <SettingsField
          field={{
            key: 'showMargin',
            label: 'Show Margin',
            labelAr: 'عرض الهامش',
            type: 'boolean',
            helpText: 'Show margin percentage to sales reps',
            helpTextAr: 'عرض نسبة الهامش لممثلي المبيعات',
          }}
          value={settings.showMargin}
          onChange={(value) => handleFieldChange('showMargin', value)}
        />

        {settings.showMargin && (
          <div className="ml-4 space-y-4">
            <SettingsField
              field={{
                key: 'minimumMarginPercent',
                label: 'Minimum Margin %',
                labelAr: 'الحد الأدنى للهامش %',
                type: 'percent',
                min: 0,
                max: 100,
                helpText: 'Minimum acceptable margin percentage',
                helpTextAr: 'الحد الأدنى المقبول لنسبة الهامش',
              }}
              value={settings.minimumMarginPercent}
              onChange={(value) => handleFieldChange('minimumMarginPercent', value)}
            />

            <SettingsField
              field={{
                key: 'warnBelowMinimumMargin',
                label: 'Warn Below Minimum',
                labelAr: 'تحذير أقل من الحد الأدنى',
                type: 'boolean',
                helpText: 'Show warning when margin is below minimum',
                helpTextAr: 'عرض تحذير عندما يكون الهامش أقل من الحد الأدنى',
              }}
              value={settings.warnBelowMinimumMargin}
              onChange={(value) => handleFieldChange('warnBelowMinimumMargin', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'enforcePriceList',
            label: 'Enforce Price List',
            labelAr: 'فرض قائمة الأسعار',
            type: 'boolean',
            helpText: 'Strict price list enforcement (no overrides)',
            helpTextAr: 'فرض صارم لقائمة الأسعار (لا تجاوزات)',
          }}
          value={settings.enforcePriceList}
          onChange={(value) => handleFieldChange('enforcePriceList', value)}
        />
      </CardContent>
    </Card>
  )
}
