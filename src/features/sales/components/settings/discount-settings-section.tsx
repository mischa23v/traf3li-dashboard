/**
 * Discount Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Percent } from 'lucide-react'
import { SettingsField } from './settings-field'
import { DiscountSettings } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface DiscountSettingsSectionProps {
  settings: DiscountSettings
  onChange: (settings: DiscountSettings) => void
}

export function DiscountSettingsSection({ settings, onChange }: DiscountSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof DiscountSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الخصومات' : 'Discount Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'حدود الخصم وقواعد الموافقة'
            : 'Discount limits and approval rules'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            field={{
              key: 'maxLineDiscountPercent',
              label: 'Max Line Discount %',
              labelAr: 'الحد الأقصى لخصم السطر %',
              type: 'percent',
              min: 0,
              max: 100,
              helpText: 'Maximum discount per line item',
              helpTextAr: 'الحد الأقصى للخصم لكل بند',
            }}
            value={settings.maxLineDiscountPercent}
            onChange={(value) => handleFieldChange('maxLineDiscountPercent', value)}
          />

          <SettingsField
            field={{
              key: 'maxOrderDiscountPercent',
              label: 'Max Order Discount %',
              labelAr: 'الحد الأقصى لخصم الطلب %',
              type: 'percent',
              min: 0,
              max: 100,
              helpText: 'Maximum discount on entire order',
              helpTextAr: 'الحد الأقصى للخصم على الطلب بالكامل',
            }}
            value={settings.maxOrderDiscountPercent}
            onChange={(value) => handleFieldChange('maxOrderDiscountPercent', value)}
          />
        </div>

        <SettingsField
          field={{
            key: 'requireDiscountApproval',
            label: 'Require Discount Approval',
            labelAr: 'موافقة الخصم مطلوبة',
            type: 'boolean',
            helpText: 'Require approval for discounts above threshold',
            helpTextAr: 'الموافقة مطلوبة للخصومات فوق الحد',
          }}
          value={settings.requireDiscountApproval}
          onChange={(value) => handleFieldChange('requireDiscountApproval', value)}
        />

        {settings.requireDiscountApproval && (
          <div className="ml-4">
            <SettingsField
              field={{
                key: 'discountApprovalThreshold',
                label: 'Approval Threshold %',
                labelAr: 'حد الموافقة %',
                type: 'percent',
                min: 0,
                max: 100,
                helpText: 'Discount percentage that requires approval',
                helpTextAr: 'نسبة الخصم التي تتطلب الموافقة',
              }}
              value={settings.discountApprovalThreshold}
              onChange={(value) => handleFieldChange('discountApprovalThreshold', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'allowCouponCodes',
            label: 'Allow Coupon Codes',
            labelAr: 'السماح بأكواد القسيمة',
            type: 'boolean',
            helpText: 'Allow customers to use coupon codes',
            helpTextAr: 'السماح للعملاء باستخدام أكواد القسيمة',
          }}
          value={settings.allowCouponCodes}
          onChange={(value) => handleFieldChange('allowCouponCodes', value)}
        />

        <SettingsField
          field={{
            key: 'allowLoyaltyRedemption',
            label: 'Allow Loyalty Redemption',
            labelAr: 'السماح باسترداد الولاء',
            type: 'boolean',
            helpText: 'Allow loyalty points redemption',
            helpTextAr: 'السماح باسترداد نقاط الولاء',
          }}
          value={settings.allowLoyaltyRedemption}
          onChange={(value) => handleFieldChange('allowLoyaltyRedemption', value)}
        />
      </CardContent>
    </Card>
  )
}
