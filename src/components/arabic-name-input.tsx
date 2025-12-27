import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArabicName } from '@/types/najiz'

export interface ArabicNameInputProps {
  value?: ArabicName
  onChange: (value: ArabicName) => void
  disabled?: boolean
  className?: string
  showFullName?: boolean
}

/**
 * ArabicNameInput Component
 *
 * A specialized input component for 4-part Arabic names (الاسم الرباعي).
 * Follows Saudi legal document standards.
 *
 * Features:
 * - 4-part name structure (First, Father, Grandfather, Family)
 * - Auto-concatenates to full name
 * - Always RTL text direction (even in English UI)
 * - Optional display of full concatenated name
 */
export function ArabicNameInput({
  value = {},
  onChange,
  disabled = false,
  className,
  showFullName = false,
}: ArabicNameInputProps) {
  const {
    firstName = '',
    fatherName = '',
    grandfatherName = '',
    familyName = '',
  } = value

  // Auto-generate full name whenever any part changes
  const fullName = React.useMemo(() => {
    const parts = [firstName, fatherName, grandfatherName, familyName]
      .filter(Boolean)
      .map(part => part.trim())
    return parts.length > 0 ? parts.join(' ') : ''
  }, [firstName, fatherName, grandfatherName, familyName])

  // Update handler that includes auto-generated fullName
  const handleChange = React.useCallback(
    (field: keyof ArabicName, fieldValue: string) => {
      const updatedValue = {
        firstName,
        fatherName,
        grandfatherName,
        familyName,
        [field]: fieldValue,
      }

      // Auto-generate and include fullName
      const parts = [
        field === 'firstName' ? fieldValue : firstName,
        field === 'fatherName' ? fieldValue : fatherName,
        field === 'grandfatherName' ? fieldValue : grandfatherName,
        field === 'familyName' ? fieldValue : familyName,
      ]
        .filter(Boolean)
        .map(part => part.trim())

      updatedValue.fullName = parts.length > 0 ? parts.join(' ') : ''

      onChange(updatedValue)
    },
    [firstName, fatherName, grandfatherName, familyName, onChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* First Name */}
      <div className='space-y-2'>
        <Label htmlFor='arabic-first-name'>الاسم الأول</Label>
        <Input
          id='arabic-first-name'
          dir='rtl'
          value={firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          disabled={disabled}
          placeholder='محمد'
          className='text-right'
        />
      </div>

      {/* Father's Name */}
      <div className='space-y-2'>
        <Label htmlFor='arabic-father-name'>اسم الأب</Label>
        <Input
          id='arabic-father-name'
          dir='rtl'
          value={fatherName}
          onChange={(e) => handleChange('fatherName', e.target.value)}
          disabled={disabled}
          placeholder='عبدالله'
          className='text-right'
        />
      </div>

      {/* Grandfather's Name */}
      <div className='space-y-2'>
        <Label htmlFor='arabic-grandfather-name'>اسم الجد</Label>
        <Input
          id='arabic-grandfather-name'
          dir='rtl'
          value={grandfatherName}
          onChange={(e) => handleChange('grandfatherName', e.target.value)}
          disabled={disabled}
          placeholder='عبدالعزيز'
          className='text-right'
        />
      </div>

      {/* Family Name */}
      <div className='space-y-2'>
        <Label htmlFor='arabic-family-name'>اسم العائلة</Label>
        <Input
          id='arabic-family-name'
          dir='rtl'
          value={familyName}
          onChange={(e) => handleChange('familyName', e.target.value)}
          disabled={disabled}
          placeholder='القحطاني'
          className='text-right'
        />
      </div>

      {/* Full Name Display (Optional) */}
      {showFullName && fullName && (
        <div className='space-y-2'>
          <Label htmlFor='arabic-full-name'>الاسم الكامل</Label>
          <div
            id='arabic-full-name'
            dir='rtl'
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm text-right',
              'text-muted-foreground',
              disabled && 'opacity-50'
            )}
          >
            {fullName}
          </div>
        </div>
      )}
    </div>
  )
}
