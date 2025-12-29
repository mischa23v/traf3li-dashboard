/**
 * Order Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import { SettingsField } from './settings-field'
import { OrderSettings } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface OrderSettingsSectionProps {
  settings: OrderSettings
  onChange: (settings: OrderSettings) => void
}

export function OrderSettingsSection({ settings, onChange }: OrderSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof OrderSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الطلبات' : 'Order Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إعدادات طلبات المبيعات والموافقات والتسليم'
            : 'Sales order settings, approvals, and delivery'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'autoNumbering',
            label: 'Enable Auto-Numbering',
            labelAr: 'تفعيل الترقيم التلقائي',
            type: 'boolean',
            helpText: 'Automatically generate order numbers',
            helpTextAr: 'إنشاء أرقام الطلبات تلقائيًا',
          }}
          value={settings.autoNumbering}
          onChange={(value) => handleFieldChange('autoNumbering', value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            field={{
              key: 'numberPrefix',
              label: 'Number Prefix',
              labelAr: 'بادئة الرقم',
              type: 'text',
              placeholder: 'SO-',
              placeholderAr: 'SO-',
            }}
            value={settings.numberPrefix}
            onChange={(value) => handleFieldChange('numberPrefix', value)}
          />
        </div>

        <SettingsField
          field={{
            key: 'requireApproval',
            label: 'Require Approval',
            labelAr: 'يتطلب موافقة',
            type: 'boolean',
            helpText: 'Require manager approval before processing',
            helpTextAr: 'موافقة المدير مطلوبة قبل المعالجة',
          }}
          value={settings.requireApproval}
          onChange={(value) => handleFieldChange('requireApproval', value)}
        />

        {settings.requireApproval && (
          <div className="ml-4">
            <SettingsField
              field={{
                key: 'approvalThreshold',
                label: 'Approval Threshold',
                labelAr: 'حد الموافقة',
                type: 'currency',
                min: 0,
              }}
              value={settings.approvalThreshold}
              onChange={(value) => handleFieldChange('approvalThreshold', value)}
            />
          </div>
        )}

        <SettingsField
          field={{
            key: 'allowPartialDelivery',
            label: 'Allow Partial Delivery',
            labelAr: 'السماح بالتسليم الجزئي',
            type: 'boolean',
            helpText: 'Allow delivering order items in multiple shipments',
            helpTextAr: 'السماح بتسليم بنود الطلب في شحنات متعددة',
          }}
          value={settings.allowPartialDelivery}
          onChange={(value) => handleFieldChange('allowPartialDelivery', value)}
        />

        <SettingsField
          field={{
            key: 'allowPartialInvoicing',
            label: 'Allow Partial Invoicing',
            labelAr: 'السماح بالفوترة الجزئية',
            type: 'boolean',
            helpText: 'Allow invoicing orders in parts',
            helpTextAr: 'السماح بفوترة الطلبات على أجزاء',
          }}
          value={settings.allowPartialInvoicing}
          onChange={(value) => handleFieldChange('allowPartialInvoicing', value)}
        />

        <SettingsField
          field={{
            key: 'autoCreateDeliveryNote',
            label: 'Auto-Create Delivery Note',
            labelAr: 'إنشاء إشعار التسليم تلقائيًا',
            type: 'boolean',
            helpText: 'Automatically create delivery note with order',
            helpTextAr: 'إنشاء إشعار تسليم تلقائيًا مع الطلب',
          }}
          value={settings.autoCreateDeliveryNote}
          onChange={(value) => handleFieldChange('autoCreateDeliveryNote', value)}
        />

        <SettingsField
          field={{
            key: 'requireDeliveryBeforeInvoice',
            label: 'Require Delivery Before Invoice',
            labelAr: 'التسليم مطلوب قبل الفاتورة',
            type: 'boolean',
            helpText: 'Require delivery confirmation before invoicing',
            helpTextAr: 'تأكيد التسليم مطلوب قبل الفوترة',
          }}
          value={settings.requireDeliveryBeforeInvoice}
          onChange={(value) => handleFieldChange('requireDeliveryBeforeInvoice', value)}
        />

        <SettingsField
          field={{
            key: 'allowBackorders',
            label: 'Allow Backorders',
            labelAr: 'السماح بالطلبات المتأخرة',
            type: 'boolean',
            helpText: 'Allow orders when items are out of stock',
            helpTextAr: 'السماح بالطلبات عندما تكون المنتجات غير متوفرة',
          }}
          value={settings.allowBackorders}
          onChange={(value) => handleFieldChange('allowBackorders', value)}
        />
      </CardContent>
    </Card>
  )
}
