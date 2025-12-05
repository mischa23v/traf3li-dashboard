import { Plus, Download, Upload, UserMinus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { usePermissions } from '@/hooks/use-permissions'
import { useStaffContext } from './staff-provider'
import { EditGate, AdminGate } from '@/components/permission-gate'

export function StaffPrimaryButtons() {
  const { t } = useTranslation()
  const { isAdminOrOwner, canEdit } = usePermissions()
  const { showDeparted, setShowDeparted } = useStaffContext()

  return (
    <div className='flex gap-2'>
      {/* Toggle Departed Employees - Admin Only */}
      <AdminGate>
        <Button
          variant={showDeparted ? 'default' : 'outline'}
          size='sm'
          className='hidden sm:flex'
          onClick={() => setShowDeparted(!showDeparted)}
        >
          {showDeparted ? (
            <>
              <Users className='me-2 h-4 w-4' />
              الفريق النشط
            </>
          ) : (
            <>
              <UserMinus className='me-2 h-4 w-4' />
              الموظفين المغادرين
            </>
          )}
        </Button>
      </AdminGate>

      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Download className='me-2 h-4 w-4' />
        {t('common.export')}
      </Button>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Upload className='me-2 h-4 w-4' />
        {t('common.import')}
      </Button>

      <EditGate module="team">
        <Button asChild size='sm'>
          <Link to='/dashboard/staff/new'>
            <Plus className='me-2 h-4 w-4' />
            {t('staff.addStaff')}
          </Link>
        </Button>
      </EditGate>
    </div>
  )
}
