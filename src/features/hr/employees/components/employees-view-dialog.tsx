import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useEmployeesContext } from './employees-provider'
import {
  departments,
  employmentTypes,
  employeeStatuses,
  employeeStatusColors,
  departmentColors,
  genders,
  maritalStatuses,
} from '../data/data'

export function EmployeesViewDialog() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { open, setOpen, currentRow, setCurrentRow } = useEmployeesContext()

  const handleClose = () => {
    setOpen(null)
    setCurrentRow(null)
  }

  if (!currentRow) return null

  const fullName = `${currentRow.firstName} ${currentRow.lastName}`
  const initials = `${currentRow.firstName[0] || ''}${currentRow.lastName[0] || ''}`.toUpperCase()
  const department = departments.find((d) => d.value === currentRow.department)
  const employmentType = employmentTypes.find(
    (t) => t.value === currentRow.employmentType
  )
  const status = employeeStatuses.find((s) => s.value === currentRow.status)
  const gender = genders.find((g) => g.value === currentRow.gender)
  const maritalStatus = maritalStatuses.find(
    (m) => m.value === currentRow.maritalStatus
  )

  const formatDate = (date: string | undefined) => {
    if (!date) return '-'
    return format(new Date(date), 'dd MMM yyyy', {
      locale: isArabic ? ar : enUS,
    })
  }

  return (
    <Dialog open={open === 'view'} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('hr.employees.viewEmployee')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className='h-[60vh]'>
          <div className='space-y-6 pe-4'>
            {/* Header */}
            <div className='flex items-start gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={currentRow.avatar} alt={fullName} />
                <AvatarFallback className='text-lg'>{initials}</AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <h3 className='text-xl font-semibold'>{fullName}</h3>
                <p className='text-muted-foreground'>{currentRow.position}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  <Badge
                    variant='outline'
                    className={cn(employeeStatusColors.get(currentRow.status))}
                  >
                    {isArabic ? status?.label : status?.labelEn}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={cn(departmentColors.get(currentRow.department))}
                  >
                    {isArabic ? department?.label : department?.labelEn}
                  </Badge>
                </div>
              </div>
              <div className='text-end'>
                <div className='font-mono text-sm text-muted-foreground'>
                  {currentRow.employeeId}
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Info */}
            <div>
              <h4 className='mb-3 font-semibold'>
                {t('hr.employees.sections.contact')}
              </h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.email')}:
                  </span>
                  <span className='ms-2' dir='ltr'>
                    {currentRow.email}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.phone')}:
                  </span>
                  <span className='ms-2' dir='ltr'>
                    {currentRow.phone}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Work Info */}
            <div>
              <h4 className='mb-3 font-semibold'>
                {t('hr.employees.sections.work')}
              </h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.department')}:
                  </span>
                  <span className='ms-2'>
                    {isArabic ? department?.label : department?.labelEn}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.position')}:
                  </span>
                  <span className='ms-2'>{currentRow.position}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.employmentType')}:
                  </span>
                  <span className='ms-2'>
                    {isArabic ? employmentType?.label : employmentType?.labelEn}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.hireDate')}:
                  </span>
                  <span className='ms-2'>{formatDate(currentRow.hireDate)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Info */}
            <div>
              <h4 className='mb-3 font-semibold'>
                {t('hr.employees.sections.personal')}
              </h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.gender')}:
                  </span>
                  <span className='ms-2'>
                    {isArabic ? gender?.label : gender?.labelEn}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.maritalStatus')}:
                  </span>
                  <span className='ms-2'>
                    {maritalStatus
                      ? isArabic
                        ? maritalStatus.label
                        : maritalStatus.labelEn
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.dateOfBirth')}:
                  </span>
                  <span className='ms-2'>
                    {formatDate(currentRow.dateOfBirth)}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.nationality')}:
                  </span>
                  <span className='ms-2'>{currentRow.nationality || '-'}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('hr.employees.fields.nationalId')}:
                  </span>
                  <span className='ms-2' dir='ltr'>
                    {currentRow.nationalId || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            {(currentRow.bankName || currentRow.iban) && (
              <>
                <Separator />
                <div>
                  <h4 className='mb-3 font-semibold'>
                    {t('hr.employees.sections.bank')}
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('hr.employees.fields.bankName')}:
                      </span>
                      <span className='ms-2'>{currentRow.bankName || '-'}</span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('hr.employees.fields.iban')}:
                      </span>
                      <span className='ms-2' dir='ltr'>
                        {currentRow.iban || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Emergency Contact */}
            {currentRow.emergencyContact && (
              <>
                <Separator />
                <div>
                  <h4 className='mb-3 font-semibold'>
                    {t('hr.employees.sections.emergency')}
                  </h4>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('hr.employees.fields.emergencyName')}:
                      </span>
                      <span className='ms-2'>
                        {currentRow.emergencyContact.name}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('hr.employees.fields.emergencyRelation')}:
                      </span>
                      <span className='ms-2'>
                        {currentRow.emergencyContact.relationship}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>
                        {t('hr.employees.fields.emergencyPhone')}:
                      </span>
                      <span className='ms-2' dir='ltr'>
                        {currentRow.emergencyContact.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
