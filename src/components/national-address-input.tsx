'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NationalAddress } from '@/types/najiz'
import {
  SAUDI_REGIONS,
  SAUDI_CITIES_BY_REGION,
  getCitiesByRegion,
} from '@/constants/najiz-constants'

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface NationalAddressInputProps {
  value?: NationalAddress
  onChange: (value: NationalAddress) => void
  disabled?: boolean
  className?: string
  showShortAddress?: boolean
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

const validateBuildingNumber = (value: string): boolean => {
  return /^\d{0,4}$/.test(value)
}

const validatePostalCode = (value: string): boolean => {
  return /^\d{0,5}$/.test(value)
}

const validateAdditionalNumber = (value: string): boolean => {
  return /^\d{0,4}$/.test(value)
}

/**
 * Generate short address from postal code and building number
 * Format: PPPP BBBB (where P = postal code, B = building number)
 */
const generateShortAddress = (
  postalCode?: string,
  buildingNumber?: string
): string => {
  if (!postalCode || !buildingNumber) return ''
  if (postalCode.length !== 5 || buildingNumber.length !== 4) return ''
  return `${postalCode} ${buildingNumber}`
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function NationalAddressInput({
  value = {},
  onChange,
  disabled = false,
  className,
  showShortAddress = true,
}: NationalAddressInputProps) {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Track selected region to filter cities
  const [selectedRegionCode, setSelectedRegionCode] = React.useState<string>(
    value?.regionCode || ''
  )

  // Get available cities based on selected region
  const availableCities = React.useMemo(() => {
    return selectedRegionCode ? getCitiesByRegion(selectedRegionCode) : []
  }, [selectedRegionCode])

  // Auto-generate short address when postal code or building number changes
  React.useEffect(() => {
    const shortAddress = generateShortAddress(
      value?.postalCode,
      value?.buildingNumber
    )
    if (shortAddress && shortAddress !== value?.shortAddress) {
      onChange({ ...value, shortAddress })
    }
  }, [value?.postalCode, value?.buildingNumber, value, onChange])

  const handleFieldChange = (field: keyof NationalAddress, newValue: string) => {
    // Validate numeric fields
    if (field === 'buildingNumber' && !validateBuildingNumber(newValue)) return
    if (field === 'postalCode' && !validatePostalCode(newValue)) return
    if (field === 'additionalNumber' && !validateAdditionalNumber(newValue)) return

    const updates: Partial<NationalAddress> = { [field]: newValue }

    // Handle region selection
    if (field === 'region') {
      const selectedRegion = SAUDI_REGIONS.find(
        (r) => (isRTL ? r.nameAr : r.nameEn) === newValue
      )
      if (selectedRegion) {
        setSelectedRegionCode(selectedRegion.code)
        updates.regionCode = selectedRegion.code
        updates.region = selectedRegion.nameEn
        updates.regionAr = selectedRegion.nameAr
        // Clear city when region changes
        updates.city = ''
        updates.cityAr = ''
      }
    }

    // Handle city selection
    if (field === 'city') {
      const selectedCity = availableCities.find(
        (c) => (isRTL ? c.nameAr : c.nameEn) === newValue
      )
      if (selectedCity) {
        updates.city = selectedCity.nameEn
        updates.cityAr = selectedCity.nameAr
      }
    }

    onChange({ ...value, ...updates })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Building Number & Additional Number */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Building Number */}
        <div className="space-y-2">
          <Label htmlFor="building-number">
            {isRTL ? 'رقم المبنى' : 'Building Number'}
            <span className="text-destructive ms-1">*</span>
          </Label>
          <Input
            id="building-number"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder={isRTL ? '1234' : '1234'}
            value={value?.buildingNumber || ''}
            onChange={(e) => handleFieldChange('buildingNumber', e.target.value)}
            disabled={disabled}
            aria-invalid={
              value?.buildingNumber && value.buildingNumber.length !== 4
            }
            className={cn(
              isRTL && 'text-right',
              value?.buildingNumber &&
                value.buildingNumber.length !== 4 &&
                'border-destructive'
            )}
          />
          {value?.buildingNumber && value.buildingNumber.length > 0 && value.buildingNumber.length < 4 && (
            <p className="text-xs text-destructive">
              {isRTL
                ? 'يجب أن يكون 4 أرقام'
                : 'Must be 4 digits'}
            </p>
          )}
        </div>

        {/* Additional Number */}
        <div className="space-y-2">
          <Label htmlFor="additional-number">
            {isRTL ? 'الرقم الإضافي' : 'Additional Number'}
            <span className="text-destructive ms-1">*</span>
          </Label>
          <Input
            id="additional-number"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder={isRTL ? '5678' : '5678'}
            value={value?.additionalNumber || ''}
            onChange={(e) =>
              handleFieldChange('additionalNumber', e.target.value)
            }
            disabled={disabled}
            aria-invalid={
              value?.additionalNumber && value.additionalNumber.length !== 4
            }
            className={cn(
              isRTL && 'text-right',
              value?.additionalNumber &&
                value.additionalNumber.length !== 4 &&
                'border-destructive'
            )}
          />
          {value?.additionalNumber && value.additionalNumber.length > 0 && value.additionalNumber.length < 4 && (
            <p className="text-xs text-destructive">
              {isRTL
                ? 'يجب أن يكون 4 أرقام'
                : 'Must be 4 digits'}
            </p>
          )}
        </div>
      </div>

      {/* Street Name */}
      <div className="space-y-2">
        <Label htmlFor="street-name">
          {isRTL ? 'اسم الشارع' : 'Street Name'}
          <span className="text-destructive ms-1">*</span>
        </Label>
        <Input
          id="street-name"
          type="text"
          placeholder={isRTL ? 'أدخل اسم الشارع' : 'Enter street name'}
          value={isRTL ? value?.streetNameAr || '' : value?.streetName || ''}
          onChange={(e) =>
            handleFieldChange(
              isRTL ? 'streetNameAr' : 'streetName',
              e.target.value
            )
          }
          disabled={disabled}
          className={isRTL ? 'text-right' : ''}
        />
      </div>

      {/* District */}
      <div className="space-y-2">
        <Label htmlFor="district">
          {isRTL ? 'الحي' : 'District'}
          <span className="text-destructive ms-1">*</span>
        </Label>
        <Input
          id="district"
          type="text"
          placeholder={isRTL ? 'أدخل اسم الحي' : 'Enter district name'}
          value={isRTL ? value?.districtAr || '' : value?.district || ''}
          onChange={(e) =>
            handleFieldChange(isRTL ? 'districtAr' : 'district', e.target.value)
          }
          disabled={disabled}
          className={isRTL ? 'text-right' : ''}
        />
      </div>

      {/* Region & City */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="region">
            {isRTL ? 'المنطقة' : 'Region'}
            <span className="text-destructive ms-1">*</span>
          </Label>
          <Select
            value={isRTL ? value?.regionAr : value?.region}
            onValueChange={(newValue) => handleFieldChange('region', newValue)}
            disabled={disabled}
          >
            <SelectTrigger id="region" className="w-full">
              <SelectValue
                placeholder={isRTL ? 'اختر المنطقة' : 'Select region'}
              />
            </SelectTrigger>
            <SelectContent>
              {SAUDI_REGIONS.map((region) => (
                <SelectItem
                  key={region.code}
                  value={isRTL ? region.nameAr : region.nameEn}
                >
                  {isRTL ? region.nameAr : region.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            {isRTL ? 'المدينة' : 'City'}
            <span className="text-destructive ms-1">*</span>
          </Label>
          <Select
            value={isRTL ? value?.cityAr : value?.city}
            onValueChange={(newValue) => handleFieldChange('city', newValue)}
            disabled={disabled || !selectedRegionCode}
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue
                placeholder={
                  selectedRegionCode
                    ? isRTL
                      ? 'اختر المدينة'
                      : 'Select city'
                    : isRTL
                      ? 'اختر المنطقة أولاً'
                      : 'Select region first'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city, index) => (
                <SelectItem
                  key={`${city.nameEn}-${index}`}
                  value={isRTL ? city.nameAr : city.nameEn}
                >
                  {isRTL ? city.nameAr : city.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <Label htmlFor="postal-code">
          {isRTL ? 'الرمز البريدي' : 'Postal Code'}
          <span className="text-destructive ms-1">*</span>
        </Label>
        <Input
          id="postal-code"
          type="text"
          inputMode="numeric"
          pattern="\d{5}"
          maxLength={5}
          placeholder={isRTL ? '12345' : '12345'}
          value={value?.postalCode || ''}
          onChange={(e) => handleFieldChange('postalCode', e.target.value)}
          disabled={disabled}
          aria-invalid={value?.postalCode && value.postalCode.length !== 5}
          className={cn(
            isRTL && 'text-right',
            value?.postalCode &&
              value.postalCode.length !== 5 &&
              'border-destructive'
          )}
        />
        {value?.postalCode && value.postalCode.length > 0 && value.postalCode.length < 5 && (
          <p className="text-xs text-destructive">
            {isRTL ? 'يجب أن يكون 5 أرقام' : 'Must be 5 digits'}
          </p>
        )}
      </div>

      {/* Short Address (Auto-generated, Read-only) */}
      {showShortAddress && value?.shortAddress && (
        <div className="space-y-2">
          <Label htmlFor="short-address">
            {isRTL ? 'العنوان المختصر' : 'Short Address'}
          </Label>
          <Input
            id="short-address"
            type="text"
            value={value.shortAddress}
            disabled
            readOnly
            className={cn(
              'bg-muted cursor-not-allowed',
              isRTL && 'text-right'
            )}
          />
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? 'يتم إنشاؤه تلقائياً من الرمز البريدي ورقم المبنى'
              : 'Auto-generated from postal code and building number'}
          </p>
        </div>
      )}
    </div>
  )
}
