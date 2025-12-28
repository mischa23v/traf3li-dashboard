/**
 * Office Type Selector Component
 * Reusable component for selecting نوع المكتب (Office Type)
 * Used across all CRM pages (Lead, Contact, Client, Organization forms)
 */

import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import {
  OFFICE_TYPES,
  type OfficeType,
  type OfficeTypeConfig
} from '@/constants/crm-constants'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface OfficeTypeSelectorProps {
  value: OfficeType
  onChange: (value: OfficeType) => void
  variant?: 'cards' | 'select' | 'compact'
  showDescriptions?: boolean
  showFeatures?: boolean
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// CARD VARIANT
// ═══════════════════════════════════════════════════════════════

function OfficeTypeCards({
  value,
  onChange,
  showDescriptions = true,
  showFeatures = false,
  disabled = false,
}: {
  value: OfficeType
  onChange: (value: OfficeType) => void
  showDescriptions?: boolean
  showFeatures?: boolean
  disabled?: boolean
}) {
  const { isRTL } = useLanguage()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {OFFICE_TYPES.map((type) => {
        const isSelected = value === type.id
        const Icon = type.icon

        return (
          <Card
            key={type.id}
            className={cn(
              'relative cursor-pointer transition-all duration-200 p-4',
              'hover:shadow-md',
              isSelected && `${type.borderColor} border-2 ${type.bgColor}`,
              !isSelected && 'border-gray-200 hover:border-gray-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && onChange(type.id)}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <div className={cn(
                'absolute top-2',
                isRTL ? 'left-2' : 'right-2'
              )}>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  type.bgColor,
                  type.color
                )}>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
              isSelected ? type.bgColor : 'bg-gray-100',
              isSelected ? type.color : 'text-gray-500'
            )}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Title */}
            <h4 className={cn(
              'font-semibold text-sm',
              isSelected ? type.color : 'text-gray-900'
            )}>
              {isRTL ? type.labelAr : type.labelEn}
            </h4>

            {/* Description */}
            {showDescriptions && (
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? type.descriptionAr : type.descriptionEn}
              </p>
            )}

            {/* Employee Range Badge */}
            <Badge
              variant="outline"
              className={cn(
                'mt-2 text-xs',
                isSelected && type.color
              )}
            >
              {type.employeeRange} {isRTL ? 'موظف' : 'employees'}
            </Badge>

            {/* Features */}
            {showFeatures && isSelected && type.features.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <ul className="text-xs text-gray-600 space-y-1">
                  {type.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-center gap-1">
                      <svg
                        className={cn('w-3 h-3', type.color)}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SELECT VARIANT
// ═══════════════════════════════════════════════════════════════

function OfficeTypeSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: OfficeType
  onChange: (value: OfficeType) => void
  disabled?: boolean
}) {
  const { isRTL } = useLanguage()

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as OfficeType)}
      disabled={disabled}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isRTL ? 'اختر نوع المكتب' : 'Select office type'} />
      </SelectTrigger>
      <SelectContent>
        {OFFICE_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <SelectItem key={type.id} value={type.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded flex items-center justify-center',
                  type.bgColor,
                  type.color
                )}>
                  <Icon className="w-3 h-3" />
                </div>
                <span>{isRTL ? type.labelAr : type.labelEn}</span>
                <span className="text-xs text-gray-500">
                  ({type.employeeRange})
                </span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPACT VARIANT
// ═══════════════════════════════════════════════════════════════

function OfficeTypeCompact({
  value,
  onChange,
  disabled = false,
}: {
  value: OfficeType
  onChange: (value: OfficeType) => void
  disabled?: boolean
}) {
  const { isRTL } = useLanguage()

  return (
    <div className="flex gap-2 flex-wrap">
      {OFFICE_TYPES.map((type) => {
        const isSelected = value === type.id
        const Icon = type.icon

        return (
          <TooltipProvider key={type.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                    isSelected && `${type.borderColor} ${type.bgColor} ${type.color}`,
                    !isSelected && 'border-gray-200 hover:border-gray-300 text-gray-600',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !disabled && onChange(type.id)}
                  disabled={disabled}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isRTL ? type.labelAr : type.labelEn}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRTL ? type.descriptionAr : type.descriptionEn}</p>
                <p className="text-xs mt-1">{type.employeeRange} {isRTL ? 'موظف' : 'employees'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function OfficeTypeSelector({
  value,
  onChange,
  variant = 'cards',
  showDescriptions = true,
  showFeatures = false,
  disabled = false,
  required = false,
  error,
  className,
}: OfficeTypeSelectorProps) {
  const { isRTL } = useLanguage()

  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(error && 'text-red-500')}>
        {isRTL ? 'نوع المكتب' : 'Office Type'}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>

      {variant === 'cards' && (
        <OfficeTypeCards
          value={value}
          onChange={onChange}
          showDescriptions={showDescriptions}
          showFeatures={showFeatures}
          disabled={disabled}
        />
      )}

      {variant === 'select' && (
        <OfficeTypeSelect
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {variant === 'compact' && (
        <OfficeTypeCompact
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY COMPONENT (READ-ONLY)
// ═══════════════════════════════════════════════════════════════

export function OfficeTypeBadge({
  type,
  showLabel = true,
  size = 'default',
}: {
  type: OfficeType
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg'
}) {
  const { isRTL } = useLanguage()
  const config = OFFICE_TYPES.find((t) => t.id === type) || OFFICE_TYPES[0]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5',
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span>{isRTL ? config.labelAr : config.labelEn}</span>
      )}
    </Badge>
  )
}

export default OfficeTypeSelector
