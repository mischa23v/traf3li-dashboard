/**
 * Activity CRM Settings Section
 * Types, reminders, calendar sync
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { ActivityCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

interface ActivityCrmSettingsSectionProps {
  settings: ActivityCrmSettings
  onChange: (settings: ActivityCrmSettings) => void
}

export function ActivityCrmSettingsSection({ settings, onChange }: ActivityCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof ActivityCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الأنشطة' : 'Activity Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة الأنواع والتذكيرات ومزامنة التقويم'
            : 'Manage types, reminders, and calendar sync'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'أنواع الأنشطة' : 'Activity Types'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {settings.types.map((type) => (
              <Badge
                key={type.id}
                variant={type.enabled ? 'default' : 'secondary'}
                style={{ backgroundColor: type.enabled ? type.color : undefined }}
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
              key: 'defaultReminderMinutes',
              label: 'Default Reminder Time',
              labelAr: 'وقت التذكير الافتراضي',
              type: 'select',
              options: [
                { value: '5', label: '5 minutes before', labelAr: '5 دقائق قبل' },
                { value: '15', label: '15 minutes before', labelAr: '15 دقيقة قبل' },
                { value: '30', label: '30 minutes before', labelAr: '30 دقيقة قبل' },
                { value: '60', label: '1 hour before', labelAr: 'ساعة قبل' },
              ],
              helpText: 'Default reminder time before activity',
              helpTextAr: 'وقت التذكير الافتراضي قبل النشاط',
            }}
            value={settings.defaultReminderMinutes.toString()}
            onChange={(value) => handleFieldChange('defaultReminderMinutes', parseInt(value))}
          />

          <CrmSettingsField
            field={{
              key: 'calendarProvider',
              label: 'Calendar Provider',
              labelAr: 'مزود التقويم',
              type: 'select',
              options: [
                { value: 'none', label: 'None', labelAr: 'لا يوجد' },
                { value: 'google', label: 'Google Calendar', labelAr: 'تقويم Google' },
                { value: 'outlook', label: 'Microsoft Outlook', labelAr: 'Microsoft Outlook' },
                { value: 'apple', label: 'Apple Calendar', labelAr: 'تقويم Apple' },
              ],
              helpText: 'Calendar integration provider',
              helpTextAr: 'مزود تكامل التقويم',
            }}
            value={settings.calendarProvider}
            onChange={(value) => handleFieldChange('calendarProvider', value)}
          />

          <CrmSettingsField
            field={{
              key: 'workingHoursStart',
              label: 'Working Hours Start',
              labelAr: 'بداية ساعات العمل',
              type: 'time',
              helpText: 'Start of working hours',
              helpTextAr: 'بداية ساعات العمل',
            }}
            value={settings.workingHoursStart}
            onChange={(value) => handleFieldChange('workingHoursStart', value)}
          />

          <CrmSettingsField
            field={{
              key: 'workingHoursEnd',
              label: 'Working Hours End',
              labelAr: 'نهاية ساعات العمل',
              type: 'time',
              helpText: 'End of working hours',
              helpTextAr: 'نهاية ساعات العمل',
            }}
            value={settings.workingHoursEnd}
            onChange={(value) => handleFieldChange('workingHoursEnd', value)}
          />
        </div>

        <div className="space-y-4">
          <CrmSettingsField
            field={{
              key: 'calendarSyncEnabled',
              label: 'Enable Calendar Sync',
              labelAr: 'تفعيل مزامنة التقويم',
              type: 'boolean',
              helpText: 'Sync activities with external calendar',
              helpTextAr: 'مزامنة الأنشطة مع التقويم الخارجي',
            }}
            value={settings.calendarSyncEnabled}
            onChange={(value) => handleFieldChange('calendarSyncEnabled', value)}
          />

          <CrmSettingsField
            field={{
              key: 'autoCreateFollowUp',
              label: 'Auto-Create Follow-up Tasks',
              labelAr: 'إنشاء مهام المتابعة تلقائياً',
              type: 'boolean',
              helpText: 'Automatically create follow-up tasks',
              helpTextAr: 'إنشاء مهام المتابعة تلقائياً',
            }}
            value={settings.autoCreateFollowUp}
            onChange={(value) => handleFieldChange('autoCreateFollowUp', value)}
          />

          {settings.autoCreateFollowUp && (
            <CrmSettingsField
              field={{
                key: 'defaultFollowUpDays',
                label: 'Default Follow-up Days',
                labelAr: 'أيام المتابعة الافتراضية',
                type: 'number',
                min: 1,
                max: 30,
                helpText: 'Days until follow-up task is due',
                helpTextAr: 'الأيام حتى استحقاق مهمة المتابعة',
              }}
              value={settings.defaultFollowUpDays}
              onChange={(value) => handleFieldChange('defaultFollowUpDays', value)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
