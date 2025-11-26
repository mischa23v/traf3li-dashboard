import { Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentsContext } from './documents-provider'
import { useTranslation } from 'react-i18next'

export function DocumentsPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useDocumentsContext()

  return (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm' className='hidden sm:flex'>
        <Download className='me-2 h-4 w-4' />
        {t('common.export')}
      </Button>
      <Button onClick={() => setOpen('upload')} size='sm'>
        <Upload className='me-2 h-4 w-4' />
        {t('documents.uploadDocument')}
      </Button>
    </div>
  )
}
