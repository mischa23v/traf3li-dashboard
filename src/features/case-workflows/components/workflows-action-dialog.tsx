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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateWorkflow, useUpdateWorkflow } from '@/hooks/useCaseWorkflows'
import type { WorkflowTemplate } from '../data/schema'
import { caseCategories, getDefaultStages } from '../data/data'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  caseCategory: z.string().min(1, 'Case category is required'),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  useDefaultStages: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface WorkflowsActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WorkflowTemplate | null
}

export function WorkflowsActionDialog({
  open,
  onOpenChange,
  currentRow,
}: WorkflowsActionDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const isEdit = !!currentRow

  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      caseCategory: '',
      isDefault: false,
      isActive: true,
      useDefaultStages: true,
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        nameAr: currentRow.nameAr,
        description: currentRow.description || '',
        descriptionAr: currentRow.descriptionAr || '',
        caseCategory: currentRow.caseCategory,
        isDefault: currentRow.isDefault,
        isActive: currentRow.isActive,
        useDefaultStages: false,
      })
    } else {
      form.reset({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        caseCategory: '',
        isDefault: false,
        isActive: true,
        useDefaultStages: true,
      })
    }
  }, [currentRow, form])

  const onSubmit = (values: FormValues) => {
    if (isEdit && currentRow) {
      updateWorkflow.mutate(
        {
          id: currentRow._id,
          data: {
            name: values.name,
            nameAr: values.nameAr,
            description: values.description,
            descriptionAr: values.descriptionAr,
            isDefault: values.isDefault,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    } else {
      const defaultStages = values.useDefaultStages
        ? getDefaultStages(values.caseCategory).map((stage, index) => ({
            ...stage,
            description: '',
            descriptionAr: '',
            order: index,
            requirements: [],
            autoTransition: false,
            notifyOnEntry: true,
            notifyOnExit: false,
            allowedActions: [],
            isInitial: stage.isInitial || false,
            isFinal: stage.isFinal || false,
          }))
        : undefined

      createWorkflow.mutate(
        {
          name: values.name,
          nameAr: values.nameAr,
          description: values.description,
          descriptionAr: values.descriptionAr,
          caseCategory: values.caseCategory,
          isDefault: values.isDefault,
          stages: defaultStages,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  const isPending = createWorkflow.isPending || updateWorkflow.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('caseWorkflows.editWorkflow') : t('caseWorkflows.addWorkflow')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('caseWorkflows.editWorkflowDescription')
              : t('caseWorkflows.addWorkflowDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('caseWorkflows.nameEn')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Labor Case Workflow" {...field} />
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
                      <Input placeholder="سير العمل للقضايا العمالية" dir="rtl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="caseCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('caseWorkflows.caseCategory')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('caseWorkflows.selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {caseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {isRTL ? category.labelAr : category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('caseWorkflows.descriptionEn')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Workflow for handling labor cases..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('caseWorkflows.descriptionAr')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="سير العمل للتعامل مع القضايا العمالية..."
                        className="resize-none"
                        dir="rtl"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEdit && (
              <FormField
                control={form.control}
                name="useDefaultStages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('caseWorkflows.useDefaultStages')}
                      </FormLabel>
                      <FormDescription>
                        {t('caseWorkflows.useDefaultStagesDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('caseWorkflows.setAsDefault')}</FormLabel>
                      <FormDescription>
                        {t('caseWorkflows.setAsDefaultDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('caseWorkflows.activeStatus')}</FormLabel>
                      <FormDescription>
                        {t('caseWorkflows.activeStatusDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? t('common.saving')
                  : isEdit
                    ? t('common.saveChanges')
                    : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
