import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmployeesContext } from './employees-provider'
import { useTranslation } from 'react-i18next'

export function EmployeesPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useEmployeesContext()

  return (
    <Button onClick={() => setOpen('create')}>
      <Plus className='me-2 h-4 w-4' />
      {t('hr.employees.addEmployee')}
    </Button>
  )
}
