/**
 * Delivery Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import { SettingsField } from './settings-field'
import { DeliverySettings } from '@/types/salesSettings'
import { useLanguage } from '@/hooks/use-language'

interface DeliverySettingsSectionProps {
  settings: DeliverySettings
  onChange: (settings: DeliverySettings) => void
}

export function DeliverySettingsSection({ settings, onChange }: DeliverySettingsSectionProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const handleFieldChange = (field: keyof DeliverySettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات التسليم' : 'Delivery Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'خيارات الشحن والتسليم والتتبع'
            : 'Shipping, delivery, and tracking options'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            field={{
              key: 'defaultShippingMethod',
              label: 'Default Shipping Method',
              labelAr: 'طريقة الشحن الافتراضية',
              type: 'text',
              placeholder: 'Standard',
              placeholderAr: 'قياسي',
            }}
            value={settings.defaultShippingMethod}
            onChange={(value) => handleFieldChange('defaultShippingMethod', value)}
          />

          <SettingsField
            field={{
              key: 'defaultCarrier',
              label: 'Default Carrier',
              labelAr: 'الناقل الافتراضي',
              type: 'text',
              placeholder: 'Courier Service',
              placeholderAr: 'خدمة التوصيل',
            }}
            value={settings.defaultCarrier}
            onChange={(value) => handleFieldChange('defaultCarrier', value)}
          />
        </div>

        <SettingsField
          field={{
            key: 'trackDeliveries',
            label: 'Track Deliveries',
            labelAr: 'تتبع التسليمات',
            type: 'boolean',
            helpText: 'Enable delivery tracking',
            helpTextAr: 'تفعيل تتبع التسليم',
          }}
          value={settings.trackDeliveries}
          onChange={(value) => handleFieldChange('trackDeliveries', value)}
        />

        <SettingsField
          field={{
            key: 'requireDeliveryConfirmation',
            label: 'Require Delivery Confirmation',
            labelAr: 'تأكيد التسليم مطلوب',
            type: 'boolean',
            helpText: 'Require customer signature on delivery',
            helpTextAr: 'توقيع العميل مطلوب عند التسليم',
          }}
          value={settings.requireDeliveryConfirmation}
          onChange={(value) => handleFieldChange('requireDeliveryConfirmation', value)}
        />

        <SettingsField
          field={{
            key: 'allowPartialDelivery',
            label: 'Allow Partial Delivery',
            labelAr: 'السماح بالتسليم الجزئي',
            type: 'boolean',
            helpText: 'Allow multiple shipments for one order',
            helpTextAr: 'السماح بشحنات متعددة لطلب واحد',
          }}
          value={settings.allowPartialDelivery}
          onChange={(value) => handleFieldChange('allowPartialDelivery', value)}
        />

        <SettingsField
          field={{
            key: 'calculateShippingCost',
            label: 'Calculate Shipping Cost',
            labelAr: 'حساب تكلفة الشحن',
            type: 'boolean',
            helpText: 'Automatically calculate shipping costs',
            helpTextAr: 'حساب تكلفة الشحن تلقائيًا',
          }}
          value={settings.calculateShippingCost}
          onChange={(value) => handleFieldChange('calculateShippingCost', value)}
        />

        {settings.calculateShippingCost && (
          <div className="ml-4">
            <SettingsField
              field={{
                key: 'freeShippingThreshold',
                label: 'Free Shipping Threshold',
                labelAr: 'حد الشحن المجاني',
                type: 'currency',
                min: 0,
                helpText: 'Order amount for free shipping',
                helpTextAr: 'مبلغ الطلب للشحن المجاني',
              }}
              value={settings.freeShippingThreshold}
              onChange={(value) => handleFieldChange('freeShippingThreshold', value)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
