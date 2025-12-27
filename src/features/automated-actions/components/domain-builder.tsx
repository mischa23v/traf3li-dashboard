/**
 * Domain Builder Component
 * Visual query builder for filter conditions
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, GripVertical, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import type { ModelField, DomainOperator, FilterDomain, DomainCondition } from '@/types/automatedAction'

interface DomainBuilderProps {
  fields?: ModelField[]
  value?: FilterDomain
  onChange: (domain: FilterDomain) => void
  className?: string
}

const OPERATORS: { value: DomainOperator; label: string; labelAr: string }[] = [
  { value: '$eq', label: '=', labelAr: '=' },
  { value: '$ne', label: '≠', labelAr: '≠' },
  { value: '$gt', label: '>', labelAr: '>' },
  { value: '$gte', label: '≥', labelAr: '≥' },
  { value: '$lt', label: '<', labelAr: '<' },
  { value: '$lte', label: '≤', labelAr: '≤' },
  { value: '$in', label: 'In', labelAr: 'ضمن' },
  { value: '$nin', label: 'Not In', labelAr: 'ليس ضمن' },
  { value: '$regex', label: 'Contains', labelAr: 'يحتوي' },
  { value: '$exists', label: 'Exists', labelAr: 'موجود' },
]

// Parse domain object to conditions array
function parseDomainToConditions(domain: FilterDomain | undefined): DomainCondition[] {
  if (!domain || Object.keys(domain).length === 0) return []

  const conditions: DomainCondition[] = []

  Object.entries(domain).forEach(([field, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Operator object like { $gt: 100 }
      Object.entries(value as Record<string, unknown>).forEach(([op, val]) => {
        conditions.push({
          field,
          operator: op as DomainOperator,
          value: val,
        })
      })
    } else {
      // Simple equality
      conditions.push({
        field,
        operator: '$eq',
        value,
      })
    }
  })

  return conditions
}

// Convert conditions array back to domain object
function conditionsToDomain(conditions: DomainCondition[]): FilterDomain {
  const domain: FilterDomain = {}

  conditions.forEach((cond) => {
    if (!cond.field) return

    if (cond.operator === '$eq') {
      domain[cond.field] = cond.value
    } else {
      if (!domain[cond.field]) {
        domain[cond.field] = {}
      }
      (domain[cond.field] as Record<string, unknown>)[cond.operator] = cond.value
    }
  })

  return domain
}

export function DomainBuilder({ fields, value, onChange, className }: DomainBuilderProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [conditions, setConditions] = React.useState<DomainCondition[]>(
    parseDomainToConditions(value)
  )

  // Update parent when conditions change
  React.useEffect(() => {
    const domain = conditionsToDomain(conditions.filter((c) => c.field))
    onChange(domain)
  }, [conditions, onChange])

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '$eq', value: '' }])
  }

  const removeCondition = (index: number) => {
    const newConditions = [...conditions]
    newConditions.splice(index, 1)
    setConditions(newConditions)
  }

  const updateCondition = (index: number, updates: Partial<DomainCondition>) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], ...updates }
    setConditions(newConditions)
  }

  const getFieldType = (fieldName: string) => {
    return fields?.find((f) => f.field === fieldName)?.type
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Coming Soon Alert */}
      <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          {t('automatedActions.comingSoonAlt')}
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          {t('automatedActions.comingSoonDesc')}
          <br />
          <span className="text-sm">
            {t('automatedActions.comingSoonDescAr')}
          </span>
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          {t('automatedActions.conditions.title')}
        </h4>
        <Button variant="outline" size="sm" onClick={addCondition}>
          <Plus className="h-4 w-4 me-1" />
          {t('automatedActions.conditions.addCondition')}
        </Button>
      </div>

      {/* Conditions */}
      {conditions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
          <p className="text-sm">
            {t('automatedActions.conditions.noConditions')}
          </p>
          <Button variant="link" size="sm" onClick={addCondition} className="mt-2">
            <Plus className="h-4 w-4 me-1" />
            {t('automatedActions.conditions.addCondition')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg"
            >
              {/* Drag Handle (visual only for now) */}
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

              {/* Field Select */}
              <Select
                value={condition.field}
                onValueChange={(val) => updateCondition(index, { field: val })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('automatedActions.conditions.selectField')} />
                </SelectTrigger>
                <SelectContent>
                  {fields?.map((field) => (
                    <SelectItem key={field.field} value={field.field}>
                      {isArabic ? field.nameAr : field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator Select */}
              <Select
                value={condition.operator}
                onValueChange={(val) =>
                  updateCondition(index, { operator: val as DomainOperator })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {isArabic ? op.labelAr : op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value Input */}
              {condition.operator !== '$exists' && (
                <Input
                  value={String(condition.value || '')}
                  onChange={(e) => {
                    let val: unknown = e.target.value
                    const fieldType = getFieldType(condition.field)

                    // Type coercion based on field type
                    if (fieldType === 'number' && e.target.value) {
                      val = Number(e.target.value)
                    } else if (fieldType === 'boolean') {
                      val = e.target.value.toLowerCase() === 'true'
                    }

                    updateCondition(index, { value: val })
                  }}
                  placeholder={t('automatedActions.conditions.value')}
                  className="flex-1"
                />
              )}

              {/* Boolean value for $exists */}
              {condition.operator === '$exists' && (
                <Select
                  value={String(condition.value)}
                  onValueChange={(val) =>
                    updateCondition(index, { value: val === 'true' })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t('automatedActions.conditions.yes')}</SelectItem>
                    <SelectItem value="false">{t('automatedActions.conditions.no')}</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCondition(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {conditions.length > 0 && (
        <div className="p-2 bg-muted rounded text-xs font-mono overflow-x-auto">
          <pre>{JSON.stringify(conditionsToDomain(conditions), null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default DomainBuilder
