/**
 * CRM Settings Field Component
 *
 * Reusable form field component for CRM settings with bilingual support
 * Handles different field types: text, number, boolean, select, textarea, time, etc.
 *
 * @module features/crm/views/crm-settings/crm-settings-field
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CrmSettingsField as CrmSettingsFieldType } from '@/types/crmSettingsComprehensive'
import { useTranslation } from 'react-i18next'

interface CrmSettingsFieldProps {
  field: CrmSettingsFieldType
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function CrmSettingsField({ field, value, onChange, disabled = false }: CrmSettingsFieldProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const label = isRTL ? field.labelAr : field.label
  const placeholder = isRTL ? field.placeholderAr : field.placeholder
  const helpText = isRTL ? field.helpTextAr : field.helpText

  // Boolean field (Switch)
  if (field.type === 'boolean') {
    return (
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="flex-1">
          <Label className="text-base font-medium">{label}</Label>
          {helpText && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{helpText}</p>}
        </div>
        <Switch checked={value || false} onCheckedChange={onChange} disabled={disabled} />
      </div>
    )
  }

  // Select field
  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {isRTL ? option.labelAr : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
      </div>
    )
  }

  // Textarea field
  if (field.type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="rounded-xl"
        />
        {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
      </div>
    )
  }

  // Time field
  if (field.type === 'time') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="rounded-xl"
          dir="ltr"
        />
        {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
      </div>
    )
  }

  // Number field (including currency and percent)
  if (field.type === 'number' || field.type === 'currency' || field.type === 'percent') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative">
          {field.type === 'currency' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              {isRTL ? 'ر.س' : 'SAR'}
            </span>
          )}
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : parseFloat(e.target.value)
              onChange(val)
            }}
            placeholder={placeholder}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`rounded-xl ${field.type === 'currency' ? 'pl-16' : ''}`}
            dir="ltr"
          />
          {field.type === 'percent' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
          )}
        </div>
        {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
      </div>
    )
  }

  // Text field (default)
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        dir={field.key.includes('Ar') ? 'rtl' : 'ltr'}
        className="rounded-xl"
      />
      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
    </div>
  )
}
