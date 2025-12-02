import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function ContactsPrimaryButtons() {
  const { t } = useTranslation()

  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Download className='me-2 h-4 w-4' />
        {t('common.export')}
      </Button>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Upload className='me-2 h-4 w-4' />
        {t('common.import')}
      </Button>
      <Button asChild size='sm'>
        <Link to='/dashboard/contacts/new'>
          <Plus className='me-2 h-4 w-4' />
          {t('contacts.addContact')}
        </Link>
      </Button>
    </div>
  )
}
