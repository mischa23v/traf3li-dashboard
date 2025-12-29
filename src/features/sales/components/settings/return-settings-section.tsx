/**
 * Return Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Undo2 } from 'lucide-react'
import { SettingsField } from './settings-field'
import { ReturnSettings } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface ReturnSettingsSectionProps {
  settings: ReturnSettings
  onChange: (settings: ReturnSettings) => void
}

export function ReturnSettingsSection({ settings, onChange }: ReturnSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof ReturnSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Undo2 className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الإرجاع' : 'Return Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'سياسة الإرجاع والموافقات والائتمان'
            : 'Return policy, approvals, and credit notes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingsField
          field={{
            key: 'enabled',
            label: 'Enable Returns',
            labelAr: 'تفعيل الإرجاع',
            type: 'boolean',
            helpText: 'Allow customers to return products',
            helpTextAr: 'السماح للعملاء بإرجاع المنتجات',
          }}
          value={settings.enabled}
          onChange={(value) => handleFieldChange('enabled', value)}
        />

        {settings.enabled && (
          <>
            <SettingsField
              field={{
                key: 'defaultReturnWindowDays',
                label: 'Return Window (Days)',
                labelAr: 'نافذة الإرجاع (أيام)',
                type: 'number',
                min: 0,
                helpText: 'Days allowed for returns after purchase',
                helpTextAr: 'الأيام المسموح بها للإرجاع بعد الشراء',
              }}
              value={settings.defaultReturnWindowDays}
              onChange={(value) => handleFieldChange('defaultReturnWindowDays', value)}
            />

            <SettingsField
              field={{
                key: 'requireApproval',
                label: 'Require Approval',
                labelAr: 'يتطلب موافقة',
                type: 'boolean',
                helpText: 'Require manager approval for returns',
                helpTextAr: 'موافقة المدير مطلوبة للإرجاع',
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
                    helpText: 'Return amount that requires approval',
                    helpTextAr: 'مبلغ الإرجاع الذي يتطلب الموافقة',
                  }}
                  value={settings.approvalThreshold}
                  onChange={(value) => handleFieldChange('approvalThreshold', value)}
                />
              </div>
            )}

            <SettingsField
              field={{
                key: 'defaultRestockingFeePercent',
                label: 'Restocking Fee %',
                labelAr: 'رسوم إعادة التخزين %',
                type: 'percent',
                min: 0,
                max: 100,
                helpText: 'Default restocking fee percentage',
                helpTextAr: 'نسبة رسوم إعادة التخزين الافتراضية',
              }}
              value={settings.defaultRestockingFeePercent}
              onChange={(value) => handleFieldChange('defaultRestockingFeePercent', value)}
            />

            <SettingsField
              field={{
                key: 'autoCreateCreditNote',
                label: 'Auto-Create Credit Note',
                labelAr: 'إنشاء إشعار دائن تلقائيًا',
                type: 'boolean',
                helpText: 'Automatically create credit note on return',
                helpTextAr: 'إنشاء إشعار دائن تلقائيًا عند الإرجاع',
              }}
              value={settings.autoCreateCreditNote}
              onChange={(value) => handleFieldChange('autoCreateCreditNote', value)}
            />

            <SettingsField
              field={{
                key: 'requireInspection',
                label: 'Require Inspection',
                labelAr: 'الفحص مطلوب',
                type: 'boolean',
                helpText: 'Require physical inspection before processing',
                helpTextAr: 'الفحص الفعلي مطلوب قبل المعالجة',
              }}
              value={settings.requireInspection}
              onChange={(value) => handleFieldChange('requireInspection', value)}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
