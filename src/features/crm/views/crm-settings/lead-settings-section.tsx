/**
 * Lead CRM Settings Section
 * Sources, scoring rules, assignment, duplicate detection
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { LeadCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface LeadCrmSettingsSectionProps {
  settings: LeadCrmSettings
  onChange: (settings: LeadCrmSettings) => void
}

export function LeadCrmSettingsSection({ settings, onChange }: LeadCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof LeadCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات العملاء المحتملين' : 'Lead Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة المصادر والتسجيل والتعيين واكتشاف التكرار'
            : 'Manage sources, scoring, assignment, and duplicate detection'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'إعدادات التعيين' : 'Assignment Settings'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'autoAssignEnabled',
              label: 'Enable Auto-Assignment',
              labelAr: 'تفعيل التعيين التلقائي',
              type: 'boolean',
              helpText: 'Automatically assign new leads to team members',
              helpTextAr: 'تعيين العملاء المحتملين الجدد تلقائياً لأعضاء الفريق',
            }}
            value={settings.autoAssignEnabled}
            onChange={(value) => handleFieldChange('autoAssignEnabled', value)}
          />

          {settings.autoAssignEnabled && (
            <CrmSettingsField
              field={{
                key: 'assignmentMethod',
                label: 'Assignment Method',
                labelAr: 'طريقة التعيين',
                type: 'select',
                options: [
                  { value: 'round_robin', label: 'Round Robin', labelAr: 'بالتناوب' },
                  { value: 'load_balanced', label: 'Load Balanced', labelAr: 'موازنة الحمل' },
                  { value: 'territory', label: 'By Territory', labelAr: 'حسب المنطقة' },
                  { value: 'manual', label: 'Manual', labelAr: 'يدوي' },
                ],
                helpText: 'Method for assigning leads to team members',
                helpTextAr: 'طريقة تعيين العملاء المحتملين لأعضاء الفريق',
              }}
              value={settings.assignmentMethod}
              onChange={(value) => handleFieldChange('assignmentMethod', value)}
            />
          )}
        </div>

        {/* Lead Scoring */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'تسجيل العملاء المحتملين' : 'Lead Scoring'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'leadScoringEnabled',
              label: 'Enable Lead Scoring',
              labelAr: 'تفعيل تسجيل العملاء المحتملين',
              type: 'boolean',
              helpText: 'Automatically score leads based on rules',
              helpTextAr: 'تسجيل العملاء المحتملين تلقائياً بناءً على القواعد',
            }}
            value={settings.leadScoringEnabled}
            onChange={(value) => handleFieldChange('leadScoringEnabled', value)}
          />

          {settings.leadScoringEnabled && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {isRTL
                  ? 'قواعد التسجيل: متوفرة في الإصدار القادم'
                  : 'Scoring rules: Available in next release'}
              </p>
            </div>
          )}
        </div>

        {/* Lead Sources */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'مصادر العملاء المحتملين' : 'Lead Sources'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {settings.sources.map((source) => (
              <Badge
                key={source.id}
                variant={source.enabled ? 'default' : 'secondary'}
                className="px-3 py-1"
              >
                {isRTL ? source.nameAr : source.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Duplicate Detection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'اكتشاف التكرار' : 'Duplicate Detection'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'duplicateDetectionEnabled',
              label: 'Enable Duplicate Detection',
              labelAr: 'تفعيل اكتشاف التكرار',
              type: 'boolean',
              helpText: 'Detect and prevent duplicate leads',
              helpTextAr: 'اكتشاف ومنع العملاء المحتملين المكررين',
            }}
            value={settings.duplicateDetectionEnabled}
            onChange={(value) => handleFieldChange('duplicateDetectionEnabled', value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CrmSettingsField
              field={{
                key: 'staleLeadThresholdDays',
                label: 'Stale Lead Threshold (Days)',
                labelAr: 'عتبة العميل المحتمل القديم (أيام)',
                type: 'number',
                min: 1,
                max: 365,
                helpText: 'Days before a lead is considered stale',
                helpTextAr: 'الأيام قبل اعتبار العميل المحتمل قديماً',
              }}
              value={settings.staleLeadThresholdDays}
              onChange={(value) => handleFieldChange('staleLeadThresholdDays', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
