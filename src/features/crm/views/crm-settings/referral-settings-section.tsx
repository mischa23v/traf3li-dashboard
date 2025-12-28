/**
 * Referral CRM Settings Section
 * Programs, commission rates, reward types
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { ReferralCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface ReferralCrmSettingsSectionProps {
  settings: ReferralCrmSettings
  onChange: (settings: ReferralCrmSettings) => void
}

export function ReferralCrmSettingsSection({ settings, onChange }: ReferralCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof ReferralCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الإحالات' : 'Referral Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة البرامج ومعدلات العمولة وأنواع المكافآت'
            : 'Manage programs, commission rates, and reward types'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CrmSettingsField
          field={{
            key: 'enabled',
            label: 'Enable Referral Program',
            labelAr: 'تفعيل برنامج الإحالة',
            type: 'boolean',
            helpText: 'Enable referral tracking and rewards',
            helpTextAr: 'تفعيل تتبع الإحالات والمكافآت',
          }}
          value={settings.enabled}
          onChange={(value) => handleFieldChange('enabled', value)}
        />

        {settings.enabled && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isRTL ? 'برامج الإحالة' : 'Referral Programs'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settings.programs.map((program) => (
                  <div
                    key={program.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="font-medium text-sm mb-1">
                      {isRTL ? program.nameAr : program.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {program.commissionType === 'percentage' ? (
                        <span>{program.commissionValue}%</span>
                      ) : (
                        <span>SAR {program.commissionValue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CrmSettingsField
                field={{
                  key: 'defaultCommissionRate',
                  label: 'Default Commission Rate (%)',
                  labelAr: 'معدل العمولة الافتراضي (%)',
                  type: 'percent',
                  min: 0,
                  max: 100,
                  helpText: 'Default commission percentage',
                  helpTextAr: 'النسبة المئوية الافتراضية للعمولة',
                }}
                value={settings.defaultCommissionRate}
                onChange={(value) => handleFieldChange('defaultCommissionRate', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'defaultRewardType',
                  label: 'Default Reward Type',
                  labelAr: 'نوع المكافأة الافتراضي',
                  type: 'select',
                  options: [
                    { value: 'cash', label: 'Cash', labelAr: 'نقدي' },
                    { value: 'credit', label: 'Store Credit', labelAr: 'رصيد المتجر' },
                    { value: 'discount', label: 'Discount Code', labelAr: 'كود خصم' },
                    { value: 'custom', label: 'Custom', labelAr: 'مخصص' },
                  ],
                  helpText: 'Default type of referral reward',
                  helpTextAr: 'نوع مكافأة الإحالة الافتراضي',
                }}
                value={settings.defaultRewardType}
                onChange={(value) => handleFieldChange('defaultRewardType', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'minDealValue',
                  label: 'Minimum Deal Value',
                  labelAr: 'الحد الأدنى لقيمة الصفقة',
                  type: 'currency',
                  min: 0,
                  helpText: 'Minimum deal value to earn referral commission',
                  helpTextAr: 'الحد الأدنى لقيمة الصفقة لكسب عمولة الإحالة',
                }}
                value={settings.minDealValue}
                onChange={(value) => handleFieldChange('minDealValue', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'payoutMethod',
                  label: 'Payout Method',
                  labelAr: 'طريقة الدفع',
                  type: 'select',
                  options: [
                    { value: 'automatic', label: 'Automatic', labelAr: 'تلقائي' },
                    { value: 'manual', label: 'Manual Approval', labelAr: 'موافقة يدوية' },
                  ],
                  helpText: 'How referral commissions are paid',
                  helpTextAr: 'كيفية دفع عمولات الإحالة',
                }}
                value={settings.payoutMethod}
                onChange={(value) => handleFieldChange('payoutMethod', value)}
              />

              <CrmSettingsField
                field={{
                  key: 'payoutFrequency',
                  label: 'Payout Frequency',
                  labelAr: 'تكرار الدفع',
                  type: 'select',
                  options: [
                    { value: 'immediate', label: 'Immediate', labelAr: 'فوري' },
                    { value: 'monthly', label: 'Monthly', labelAr: 'شهري' },
                    { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي' },
                  ],
                  helpText: 'How often commissions are paid out',
                  helpTextAr: 'كم مرة يتم دفع العمولات',
                }}
                value={settings.payoutFrequency}
                onChange={(value) => handleFieldChange('payoutFrequency', value)}
              />
            </div>

            <CrmSettingsField
              field={{
                key: 'requireApproval',
                label: 'Require Approval for Payouts',
                labelAr: 'طلب الموافقة على المدفوعات',
                type: 'boolean',
                helpText: 'Require manager approval before processing payouts',
                helpTextAr: 'طلب موافقة المدير قبل معالجة المدفوعات',
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
