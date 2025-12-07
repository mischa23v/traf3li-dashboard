import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function ClientsPrimaryButtons() {
  const { t } = useTranslation()

  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Download className='me-2 h-4 w-4' aria-hidden='true' />
        {t('common.export')}
      </Button>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Upload className='me-2 h-4 w-4' aria-hidden='true' />
        {t('common.import')}
      </Button>
      <Button asChild size='sm'>
        <Link to='/dashboard/clients/new'>
          <Plus className='me-2 h-4 w-4' aria-hidden='true' />
          {t('clients.addClient')}
        </Link>
      </Button>
    </div>
  )
}
