import { Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'

export function ClientsPrimaryButtons() {
  const { t } = useTranslation()

  return (
    <>
      <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
        <Link to={ROUTES.dashboard.clients.new}>
          <Plus className='ms-2 h-4 w-4' aria-hidden='true' />
          {t('clients.addClient')}
        </Link>
      </Button>
      <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
        <Link to={ROUTES.dashboard.tasks.events.list}>
          <Calendar className="ms-2 h-4 w-4" />
          {t('hero.calendar')}
        </Link>
      </Button>
    </>
  )
}
