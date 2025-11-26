import { Plus, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrganizationsContext } from './organizations-provider'
import { useTranslation } from 'react-i18next'

export function OrganizationsPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useOrganizationsContext()

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
        {t('organizations.addOrganization')}
      </Button>
    </div>
  )
}
