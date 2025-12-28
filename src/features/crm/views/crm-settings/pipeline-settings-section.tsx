/**
 * Pipeline CRM Settings Section
 * Stages, requirements, win/loss reasons
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitBranch } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { PipelineCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface PipelineCrmSettingsSectionProps {
  settings: PipelineCrmSettings
  onChange: (settings: PipelineCrmSettings) => void
}

export function PipelineCrmSettingsSection({ settings, onChange }: PipelineCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof PipelineCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات خط الأنابيب' : 'Pipeline Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة المراحل والمتطلبات وأسباب الفوز/الخسارة'
            : 'Manage stages, requirements, and win/loss reasons'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Stages */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'مراحل خط الأنابيب' : 'Pipeline Stages'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {settings.stages.map((stage) => (
              <div
                key={stage.id}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="font-medium text-sm mb-1">
                  {isRTL ? stage.nameAr : stage.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isRTL ? 'الاحتمالية' : 'Probability'}: {stage.probability}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Settings */}
        <div className="space-y-4">
          <CrmSettingsField
            field={{
              key: 'enforceStageRequirements',
              label: 'Enforce Stage Requirements',
              labelAr: 'فرض متطلبات المرحلة',
              type: 'boolean',
              helpText: 'Require completion of stage requirements before progression',
              helpTextAr: 'طلب إكمال متطلبات المرحلة قبل التقدم',
            }}
            value={settings.enforceStageRequirements}
            onChange={(value) => handleFieldChange('enforceStageRequirements', value)}
          />

          <CrmSettingsField
            field={{
              key: 'enableWeightedValue',
              label: 'Enable Weighted Pipeline Value',
              labelAr: 'تفعيل القيمة الموزونة لخط الأنابيب',
              type: 'boolean',
              helpText: 'Calculate opportunity value based on stage probability',
              helpTextAr: 'حساب قيمة الفرصة بناءً على احتمالية المرحلة',
            }}
            value={settings.enableWeightedValue}
            onChange={(value) => handleFieldChange('enableWeightedValue', value)}
          />

          <CrmSettingsField
            field={{
              key: 'requireWinLossReason',
              label: 'Require Win/Loss Reason',
              labelAr: 'إلزامية سبب الفوز/الخسارة',
              type: 'boolean',
              helpText: 'Require reason when closing opportunities',
              helpTextAr: 'طلب السبب عند إغلاق الفرص',
            }}
            value={settings.requireWinLossReason}
            onChange={(value) => handleFieldChange('requireWinLossReason', value)}
          />
        </div>

        {/* Win/Loss Reasons */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'أسباب الفوز/الخسارة' : 'Win/Loss Reasons'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                {isRTL ? 'أسباب الفوز' : 'Win Reasons'}
              </div>
              <div className="space-y-2">
                {settings.winLossReasons
                  .filter((r) => r.type === 'win')
                  .map((reason) => (
                    <Badge key={reason.id} variant="outline" className="block w-fit">
                      {isRTL ? reason.reasonAr : reason.reason}
                    </Badge>
                  ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                {isRTL ? 'أسباب الخسارة' : 'Loss Reasons'}
              </div>
              <div className="space-y-2">
                {settings.winLossReasons
                  .filter((r) => r.type === 'loss')
                  .map((reason) => (
                    <Badge key={reason.id} variant="outline" className="block w-fit">
                      {isRTL ? reason.reasonAr : reason.reason}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
