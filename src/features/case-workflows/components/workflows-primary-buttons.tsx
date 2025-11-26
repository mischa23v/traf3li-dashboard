import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkflowsContext } from './workflows-provider'
import { useTranslation } from 'react-i18next'

export function WorkflowsPrimaryButtons() {
  const { t } = useTranslation()
  const { setOpen } = useWorkflowsContext()

  return (
    <Button onClick={() => setOpen('add')}>
      <Plus className="h-4 w-4 me-2" />
      {t('caseWorkflows.addWorkflow')}
    </Button>
  )
}
