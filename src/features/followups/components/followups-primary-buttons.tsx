import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFollowupsContext } from './followups-provider'
import { useTranslation } from 'react-i18next'

export function FollowupsPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useFollowupsContext()

  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Download className='me-2 h-4 w-4' />
        {t('common.export')}
      </Button>
      <Button onClick={() => setOpen('add')} size='sm'>
        <Plus className='me-2 h-4 w-4' />
        {t('followups.addFollowup')}
      </Button>
    </div>
  )
}
