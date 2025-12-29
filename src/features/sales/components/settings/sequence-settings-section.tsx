/**
 * Sequence Settings Section
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash } from 'lucide-react'
import { SettingsField } from './settings-field'
import { SequencesSettings, SequenceConfig } from '@/types/salesSettings'
import { useTranslation } from 'react-i18next'

interface SequenceSettingsSectionProps {
  settings: SequencesSettings
  onChange: (settings: SequencesSettings) => void
}

export function SequenceSettingsSection({ settings, onChange }: SequenceSettingsSectionProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const handleSequenceChange = (
    sequenceKey: keyof SequencesSettings,
    field: keyof SequenceConfig,
    value: any
  ) => {
    onChange({
      ...settings,
      [sequenceKey]: {
        ...settings[sequenceKey],
        [field]: value,
      },
    })
  }

  const renderSequenceFields = (
    sequenceKey: keyof SequencesSettings,
    title: string,
    titleAr: string
  ) => {
    const sequence = settings[sequenceKey]

    return (
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <h4 className="font-medium">{isRTL ? titleAr : title}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            field={{
              key: 'prefix',
              label: 'Prefix',
              labelAr: 'البادئة',
              type: 'text',
              placeholder: 'QT-',
            }}
            value={sequence.prefix}
            onChange={(value) => handleSequenceChange(sequenceKey, 'prefix', value)}
          />

          <SettingsField
            field={{
              key: 'suffix',
              label: 'Suffix',
              labelAr: 'اللاحقة',
              type: 'text',
            }}
            value={sequence.suffix}
            onChange={(value) => handleSequenceChange(sequenceKey, 'suffix', value)}
          />

          <SettingsField
            field={{
              key: 'padding',
              label: 'Number Padding',
              labelAr: 'حشو الرقم',
              type: 'number',
              min: 1,
              max: 10,
              helpText: 'Number of digits',
              helpTextAr: 'عدد الأرقام',
            }}
            value={sequence.padding}
            onChange={(value) => handleSequenceChange(sequenceKey, 'padding', value)}
          />

          <SettingsField
            field={{
              key: 'resetPeriod',
              label: 'Reset Period',
              labelAr: 'فترة إعادة التعيين',
              type: 'select',
              options: [
                { value: 'never', label: 'Never', labelAr: 'أبدًا' },
                { value: 'yearly', label: 'Yearly', labelAr: 'سنويًا' },
                { value: 'monthly', label: 'Monthly', labelAr: 'شهريًا' },
              ],
            }}
            value={sequence.resetPeriod}
            onChange={(value) => handleSequenceChange(sequenceKey, 'resetPeriod', value)}
          />
        </div>

        <div className="flex gap-4">
          <SettingsField
            field={{
              key: 'includeYear',
              label: 'Include Year',
              labelAr: 'تضمين السنة',
              type: 'boolean',
            }}
            value={sequence.includeYear}
            onChange={(value) => handleSequenceChange(sequenceKey, 'includeYear', value)}
          />

          <SettingsField
            field={{
              key: 'includeMonth',
              label: 'Include Month',
              labelAr: 'تضمين الشهر',
              type: 'boolean',
            }}
            value={sequence.includeMonth}
            onChange={(value) => handleSequenceChange(sequenceKey, 'includeMonth', value)}
          />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-brand-blue" />
          {isRTL ? 'إعدادات التسلسل' : 'Sequence Settings'}
        </CardTitle>
        <CardDescription>
          {isRTL
            ? 'تكوين تسلسل الأرقام للمستندات المختلفة'
            : 'Configure number sequences for different documents'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderSequenceFields('quoteSequence', 'Quote Numbering', 'ترقيم العروض')}
        {renderSequenceFields('orderSequence', 'Order Numbering', 'ترقيم الطلبات')}
        {renderSequenceFields('deliverySequence', 'Delivery Numbering', 'ترقيم التسليم')}
        {renderSequenceFields('returnSequence', 'Return Numbering', 'ترقيم الإرجاع')}
      </CardContent>
    </Card>
  )
}
