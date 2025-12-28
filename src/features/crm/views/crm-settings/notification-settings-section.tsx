/**
 * Notification CRM Settings Section
 * Email, in-app, SMS notifications
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { CrmSettingsField } from './crm-settings-field'
import { NotificationCrmSettings } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'

interface NotificationCrmSettingsSectionProps {
  settings: NotificationCrmSettings
  onChange: (settings: NotificationCrmSettings) => void
}

export function NotificationCrmSettingsSection({ settings, onChange }: NotificationCrmSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleFieldChange = (field: keyof NotificationCrmSettings, value: any) => {
    onChange({ ...settings, [field]: value })
  }

  const handlePreferenceChange = (event: string, channel: 'email' | 'inApp' | 'sms', value: boolean) => {
    const updatedPreferences = settings.preferences.map((pref) =>
      pref.event === event ? { ...pref, [channel]: value } : pref
    )
    onChange({ ...settings, preferences: updatedPreferences })
  }

  const eventLabels: Record<string, { en: string; ar: string }> = {
    lead_assigned: { en: 'Lead Assigned', ar: 'تم تعيين عميل محتمل' },
    lead_status_changed: { en: 'Lead Status Changed', ar: 'تغير حالة العميل المحتمل' },
    opportunity_won: { en: 'Opportunity Won', ar: 'فوز بفرصة' },
    opportunity_lost: { en: 'Opportunity Lost', ar: 'خسارة فرصة' },
    quote_sent: { en: 'Quote Sent', ar: 'تم إرسال العرض' },
    quote_accepted: { en: 'Quote Accepted', ar: 'تم قبول العرض' },
    task_due: { en: 'Task Due', ar: 'استحقاق مهمة' },
    activity_reminder: { en: 'Activity Reminder', ar: 'تذكير نشاط' },
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'إدارة إشعارات البريد الإلكتروني والتطبيق والرسائل النصية'
            : 'Manage email, in-app, and SMS notifications'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'القنوات' : 'Notification Channels'}
          </h3>

          <CrmSettingsField
            field={{
              key: 'emailEnabled',
              label: 'Enable Email Notifications',
              labelAr: 'تفعيل إشعارات البريد الإلكتروني',
              type: 'boolean',
              helpText: 'Send notifications via email',
              helpTextAr: 'إرسال الإشعارات عبر البريد الإلكتروني',
            }}
            value={settings.emailEnabled}
            onChange={(value) => handleFieldChange('emailEnabled', value)}
          />

          <CrmSettingsField
            field={{
              key: 'inAppEnabled',
              label: 'Enable In-App Notifications',
              labelAr: 'تفعيل إشعارات التطبيق',
              type: 'boolean',
              helpText: 'Show notifications in the application',
              helpTextAr: 'إظهار الإشعارات في التطبيق',
            }}
            value={settings.inAppEnabled}
            onChange={(value) => handleFieldChange('inAppEnabled', value)}
          />

          <CrmSettingsField
            field={{
              key: 'smsEnabled',
              label: 'Enable SMS Notifications',
              labelAr: 'تفعيل إشعارات الرسائل النصية',
              type: 'boolean',
              helpText: 'Send notifications via SMS',
              helpTextAr: 'إرسال الإشعارات عبر الرسائل النصية',
            }}
            value={settings.smsEnabled}
            onChange={(value) => handleFieldChange('smsEnabled', value)}
          />

          <CrmSettingsField
            field={{
              key: 'desktopEnabled',
              label: 'Enable Desktop Notifications',
              labelAr: 'تفعيل إشعارات سطح المكتب',
              type: 'boolean',
              helpText: 'Show browser desktop notifications',
              helpTextAr: 'إظهار إشعارات متصفح سطح المكتب',
            }}
            value={settings.desktopEnabled}
            onChange={(value) => handleFieldChange('desktopEnabled', value)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
          </h3>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'الحدث' : 'Event'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'بريد' : 'Email'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'تطبيق' : 'In-App'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'رسائل' : 'SMS'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.preferences.map((pref) => (
                  <TableRow key={pref.event}>
                    <TableCell className="font-medium">
                      {isRTL ? eventLabels[pref.event]?.ar : eventLabels[pref.event]?.en}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.email}
                        onCheckedChange={(value) => handlePreferenceChange(pref.event, 'email', value)}
                        disabled={!settings.emailEnabled}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.inApp}
                        onCheckedChange={(value) => handlePreferenceChange(pref.event, 'inApp', value)}
                        disabled={!settings.inAppEnabled}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={pref.sms}
                        onCheckedChange={(value) => handlePreferenceChange(pref.event, 'sms', value)}
                        disabled={!settings.smsEnabled}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrmSettingsField
            field={{
              key: 'emailFrequency',
              label: 'Email Frequency',
              labelAr: 'تكرار البريد الإلكتروني',
              type: 'select',
              options: [
                { value: 'instant', label: 'Instant', labelAr: 'فوري' },
                { value: 'daily', label: 'Daily Digest', labelAr: 'ملخص يومي' },
                { value: 'weekly', label: 'Weekly Digest', labelAr: 'ملخص أسبوعي' },
              ],
              helpText: 'How often to send email notifications',
              helpTextAr: 'كم مرة يتم إرسال إشعارات البريد الإلكتروني',
            }}
            value={settings.emailFrequency}
            onChange={(value) => handleFieldChange('emailFrequency', value)}
          />

          <CrmSettingsField
            field={{
              key: 'quietHoursStart',
              label: 'Quiet Hours Start',
              labelAr: 'بداية ساعات الهدوء',
              type: 'time',
              helpText: 'No notifications during quiet hours (optional)',
              helpTextAr: 'لا إشعارات خلال ساعات الهدوء (اختياري)',
            }}
            value={settings.quietHoursStart || ''}
            onChange={(value) => handleFieldChange('quietHoursStart', value || undefined)}
          />

          <CrmSettingsField
            field={{
              key: 'quietHoursEnd',
              label: 'Quiet Hours End',
              labelAr: 'نهاية ساعات الهدوء',
              type: 'time',
              helpText: 'End of quiet hours (optional)',
              helpTextAr: 'نهاية ساعات الهدوء (اختياري)',
            }}
            value={settings.quietHoursEnd || ''}
            onChange={(value) => handleFieldChange('quietHoursEnd', value || undefined)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
