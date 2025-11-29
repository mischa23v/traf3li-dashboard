import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEmployeesContext } from './employees-provider'
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees'
import {
  createEmployeeSchema,
  type CreateEmployeeInput,
} from '../data/schema'
import {
  departments,
  employmentTypes,
  genders,
  maritalStatuses,
} from '../data/data'

export function EmployeesActionDialog() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { open, setOpen, currentRow, setCurrentRow } = useEmployeesContext()
  const isEdit = open === 'edit'

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      firstNameAr: '',
      lastNameAr: '',
      email: '',
      phone: '',
      gender: undefined,
      department: undefined,
      position: '',
      hireDate: '',
      employmentType: 'full_time',
      nationality: '',
      nationalId: '',
      dateOfBirth: '',
      maritalStatus: undefined,
      bankName: '',
      bankAccountNumber: '',
      iban: '',
    },
  })

  useEffect(() => {
    if (isEdit && currentRow) {
      form.reset({
        firstName: currentRow.firstName,
        lastName: currentRow.lastName,
        firstNameAr: currentRow.firstNameAr || '',
        lastNameAr: currentRow.lastNameAr || '',
        email: currentRow.email,
        phone: currentRow.phone,
        gender: currentRow.gender,
        department: currentRow.department,
        position: currentRow.position,
        hireDate: currentRow.hireDate?.split('T')[0] || '',
        employmentType: currentRow.employmentType,
        nationality: currentRow.nationality || '',
        nationalId: currentRow.nationalId || '',
        dateOfBirth: currentRow.dateOfBirth?.split('T')[0] || '',
        maritalStatus: currentRow.maritalStatus,
        bankName: currentRow.bankName || '',
        bankAccountNumber: currentRow.bankAccountNumber || '',
        iban: currentRow.iban || '',
      })
    } else {
      form.reset()
    }
  }, [isEdit, currentRow, form])

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      if (isEdit && currentRow) {
        await updateMutation.mutateAsync({
          employeeId: currentRow._id,
          data,
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      handleClose()
    } catch (error) {
      // Error handled in mutation
    }
  }

  const handleClose = () => {
    setOpen(null)
    setCurrentRow(null)
    form.reset()
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open === 'create' || open === 'edit'} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('hr.employees.editEmployee')
              : t('hr.employees.addEmployee')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('hr.employees.editEmployeeDesc')
              : t('hr.employees.addEmployeeDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className='h-[60vh] pe-4'>
              <div className='grid gap-4 py-4'>
                {/* Basic Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.firstName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.lastName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.email')}</FormLabel>
                        <FormControl>
                          <Input type='email' dir='ltr' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.phone')}</FormLabel>
                        <FormControl>
                          <Input dir='ltr' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.gender')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('hr.employees.fields.selectGender')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender.value} value={gender.value}>
                                {isArabic ? gender.label : gender.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='maritalStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.maritalStatus')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('hr.employees.fields.selectMaritalStatus')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {isArabic ? status.label : status.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Work Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='department'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.department')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('hr.employees.fields.selectDepartment')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {isArabic ? dept.label : dept.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='position'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.position')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='employmentType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.employmentType')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t('hr.employees.fields.selectEmploymentType')}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employmentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {isArabic ? type.label : type.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='hireDate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.hireDate')}</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Personal Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='nationality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.nationality')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='nationalId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.nationalId')}</FormLabel>
                        <FormControl>
                          <Input dir='ltr' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='dateOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('hr.employees.fields.dateOfBirth')}</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bank Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='bankName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.bankName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='iban'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('hr.employees.fields.iban')}</FormLabel>
                        <FormControl>
                          <Input dir='ltr' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className='mt-4'>
              <Button type='button' variant='outline' onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? t('common.saving')
                  : isEdit
                    ? t('common.save')
                    : t('common.add')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
