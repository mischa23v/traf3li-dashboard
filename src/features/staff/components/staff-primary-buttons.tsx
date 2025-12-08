import { MailPlus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { EditGate } from '@/components/permission-gate'
import { useStaffContext } from './staff-provider'

export function StaffPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useStaffContext()

  return (
    <>
      <EditGate module="team">
        <Button
          onClick={() => setOpen('add')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm"
        >
          <MailPlus className='ms-2 h-4 w-4' aria-hidden='true' />
          {t('staff.invite.title')}
        </Button>
      </EditGate>
      <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
        <Link to="/dashboard/tasks/events">
          <Calendar className="ms-2 h-4 w-4" />
          {t('hero.calendar')}
        </Link>
      </Button>
    </>
  )
}
