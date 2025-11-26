import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDuplicateWorkflow } from '@/hooks/useCaseWorkflows'
import type { WorkflowTemplate } from '../data/schema'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
})

type FormValues = z.infer<typeof formSchema>

interface WorkflowsDuplicateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: WorkflowTemplate
}

export function WorkflowsDuplicateDialog({
  open,
  onOpenChange,
  currentRow,
}: WorkflowsDuplicateDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const duplicateWorkflow = useDuplicateWorkflow()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      nameAr: '',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: `${currentRow.name} (Copy)`,
        nameAr: `${currentRow.nameAr} (نسخة)`,
      })
    }
  }, [currentRow, form])

  const onSubmit = (values: FormValues) => {
    duplicateWorkflow.mutate(
      {
        id: currentRow._id,
        name: values.name,
        nameAr: values.nameAr,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('caseWorkflows.duplicateWorkflow')}</DialogTitle>
          <DialogDescription>
            {t('caseWorkflows.duplicateWorkflowDescription', {
              name: isRTL ? currentRow.nameAr : currentRow.name,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('caseWorkflows.nameEn')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('caseWorkflows.nameAr')}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={duplicateWorkflow.isPending}>
                {duplicateWorkflow.isPending ? t('common.saving') : t('common.duplicate')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
