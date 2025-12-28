/**
 * Commission Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { SettingsField } from './settings-field'
import { CommissionSettings } from '@/types/salesSettings'
import { useLanguage } from '@/hooks/use-language'

interface CommissionSettingsSectionProps {
  settings: CommissionSettings
  onChange: (settings: CommissionSettings) => void
}

export function CommissionSettingsSection({ settings, onChange }: CommissionSettingsSectionProps) {
  const { language } = useLanguage()
  const isRTL = language === 'ar'

  const handleFieldChange = (field: keyof CommissionSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات العمولات' : 'Commission Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'حساب العمولات وتسوية المدفوعات'
            : 'Commission calculation and payment settlement'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'enabled',
            label: 'Enable Commission Tracking',
            labelAr: 'تفعيل تتبع العمولات',
            type: 'boolean',
            helpText: 'Track and calculate sales commissions',
            helpTextAr: 'تتبع وحساب عمولات المبيعات',
          }}
          value={settings.enabled}
          onChange={(value) => handleFieldChange('enabled', value)}
        />

        {settings.enabled && (
          <>
            <SettingsField
              field={{
                key: 'calculateOn',
                label: 'Calculate Commission On',
                labelAr: 'حساب العمولة على',
                type: 'select',
                options: [
                  { value: 'invoice', label: 'Invoice Creation', labelAr: 'إنشاء الفاتورة' },
                  { value: 'payment', label: 'Payment Received', labelAr: 'استلام الدفعة' },
                  { value: 'order', label: 'Order Confirmation', labelAr: 'تأكيد الطلب' },
                ],
                helpText: 'When to calculate commission',
                helpTextAr: 'متى يتم حساب العمولة',
              }}
              value={settings.calculateOn}
              onChange={(value) => handleFieldChange('calculateOn', value)}
            />

            <SettingsField
              field={{
                key: 'autoCalculate',
                label: 'Auto-Calculate',
                labelAr: 'الحساب التلقائي',
                type: 'boolean',
                helpText: 'Automatically calculate commissions',
                helpTextAr: 'حساب العمولات تلقائيًا',
              }}
              value={settings.autoCalculate}
              onChange={(value) => handleFieldChange('autoCalculate', value)}
            />

            <SettingsField
              field={{
                key: 'settlementFrequency',
                label: 'Settlement Frequency',
                labelAr: 'تكرار التسوية',
                type: 'select',
                options: [
                  { value: 'monthly', label: 'Monthly', labelAr: 'شهريًا' },
                  { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي' },
                ],
                helpText: 'How often to settle commissions',
                helpTextAr: 'كم مرة يتم تسوية العمولات',
              }}
              value={settings.settlementFrequency}
              onChange={(value) => handleFieldChange('settlementFrequency', value)}
            />

            <SettingsField
              field={{
                key: 'requireApproval',
                label: 'Require Approval',
                labelAr: 'يتطلب موافقة',
                type: 'boolean',
                helpText: 'Require approval before payout',
                helpTextAr: 'الموافقة مطلوبة قبل الدفع',
              }}
              value={settings.requireApproval}
              onChange={(value) => handleFieldChange('requireApproval', value)}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
