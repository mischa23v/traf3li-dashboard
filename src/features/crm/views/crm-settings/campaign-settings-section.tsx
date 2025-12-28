/**
 * Campaign CRM Settings Section
 * Types, budget defaults, ROI thresholds
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { CampaignCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface CampaignCrmSettingsSectionProps {
  settings: CampaignCrmSettings
  onChange: (settings: CampaignCrmSettings) => void
}

export function CampaignCrmSettingsSection({ settings, onChange }: CampaignCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof CampaignCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الحملات' : 'Campaign Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة الأنواع وميزانيات الافتراضية وعتبات العائد على الاستثمار'
            : 'Manage types, budget defaults, and ROI thresholds'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'أنواع الحملات' : 'Campaign Types'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {settings.types.map((type) => (
              <Badge
                key={type.id}
                variant={type.enabled ? 'default' : 'secondary'}
                className="px-3 py-1"
              >
                {isRTL ? type.nameAr : type.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrmSettingsField
            field={{
              key: 'defaultBudget',
              label: 'Default Budget',
              labelAr: 'الميزانية الافتراضية',
              type: 'currency',
              min: 0,
              helpText: 'Default campaign budget amount',
              helpTextAr: 'مبلغ الميزانية الافتراضية للحملة',
            }}
            value={settings.defaultBudget}
            onChange={(value) => handleFieldChange('defaultBudget', value)}
          />

          <CrmSettingsField
            field={{
              key: 'defaultDurationDays',
              label: 'Default Duration (Days)',
              labelAr: 'المدة الافتراضية (أيام)',
              type: 'number',
              min: 1,
              max: 365,
              helpText: 'Default campaign duration',
              helpTextAr: 'مدة الحملة الافتراضية',
            }}
            value={settings.defaultDurationDays}
            onChange={(value) => handleFieldChange('defaultDurationDays', value)}
          />

          <CrmSettingsField
            field={{
              key: 'roiCalculation',
              label: 'ROI Calculation Method',
              labelAr: 'طريقة حساب العائد على الاستثمار',
              type: 'select',
              options: [
                { value: 'revenue', label: 'Revenue Based', labelAr: 'على أساس الإيرادات' },
                { value: 'profit', label: 'Profit Based', labelAr: 'على أساس الربح' },
                { value: 'custom', label: 'Custom Formula', labelAr: 'صيغة مخصصة' },
              ],
              helpText: 'How to calculate campaign ROI',
              helpTextAr: 'كيفية حساب عائد الاستثمار للحملة',
            }}
            value={settings.roiCalculation}
            onChange={(value) => handleFieldChange('roiCalculation', value)}
          />

          <CrmSettingsField
            field={{
              key: 'minRoiThreshold',
              label: 'Minimum ROI Threshold (%)',
              labelAr: 'عتبة الحد الأدنى للعائد على الاستثمار (%)',
              type: 'percent',
              min: 0,
              max: 1000,
              helpText: 'Minimum acceptable ROI percentage',
              helpTextAr: 'النسبة المئوية المقبولة كحد أدنى للعائد على الاستثمار',
            }}
            value={settings.minRoiThreshold}
            onChange={(value) => handleFieldChange('minRoiThreshold', value)}
          />

          <CrmSettingsField
            field={{
              key: 'attributionModel',
              label: 'Attribution Model',
              labelAr: 'نموذج الإحالة',
              type: 'select',
              options: [
                { value: 'first_touch', label: 'First Touch', labelAr: 'اللمسة الأولى' },
                { value: 'last_touch', label: 'Last Touch', labelAr: 'اللمسة الأخيرة' },
                { value: 'multi_touch', label: 'Multi-Touch', labelAr: 'متعدد اللمسات' },
                { value: 'time_decay', label: 'Time Decay', labelAr: 'التناقص الزمني' },
              ],
              helpText: 'How to attribute conversions to campaigns',
              helpTextAr: 'كيفية إحالة التحويلات إلى الحملات',
            }}
            value={settings.attributionModel}
            onChange={(value) => handleFieldChange('attributionModel', value)}
          />
        </div>

        <div className="space-y-4">
          <CrmSettingsField
            field={{
              key: 'enableAttribution',
              label: 'Enable Campaign Attribution',
              labelAr: 'تفعيل إحالة الحملة',
              type: 'boolean',
              helpText: 'Track which campaign led to conversion',
              helpTextAr: 'تتبع الحملة التي أدت إلى التحويل',
            }}
            value={settings.enableAttribution}
            onChange={(value) => handleFieldChange('enableAttribution', value)}
          />

          <CrmSettingsField
            field={{
              key: 'trackMembers',
              label: 'Track Campaign Members',
              labelAr: 'تتبع أعضاء الحملة',
              type: 'boolean',
              helpText: 'Track individual leads/contacts in campaigns',
              helpTextAr: 'تتبع العملاء المحتملين/جهات الاتصال الفردية في الحملات',
            }}
            value={settings.trackMembers}
            onChange={(value) => handleFieldChange('trackMembers', value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
