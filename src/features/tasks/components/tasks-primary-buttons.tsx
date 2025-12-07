import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='gap-x-1'
        onClick={() => setOpen('import')}
      >
        <span>استيراد</span> <Download size={18} aria-hidden="true" />
      </Button>
      <Button className='gap-x-1' onClick={() => setOpen('create')}>
        <span>إنشاء</span> <Plus size={18} aria-hidden="true" />
      </Button>
    </div>
  )
}
