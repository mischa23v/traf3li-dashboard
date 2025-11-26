import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientsContext } from './clients-provider'
import { useTranslation } from 'react-i18next'

export function ClientsPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useClientsContext()

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
      <Button onClick={() => setOpen('add')} size='sm'>
        <Plus className='me-2 h-4 w-4' />
        {t('clients.addClient')}
      </Button>
    </div>
  )
}
