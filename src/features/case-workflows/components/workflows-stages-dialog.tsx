import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  useWorkflow,
  useAddStage,
  useUpdateStage,
  useDeleteStage,
} from '@/hooks/useCaseWorkflows'
import type { WorkflowTemplate, WorkflowStage } from '../data/schema'
import { stageColors, requirementTypes } from '../data/data'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  X,
} from 'lucide-react'

const stageFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().min(1, 'Arabic name is required'),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  durationDays: z.coerce.number().optional(),
  autoTransition: z.boolean().default(false),
  notifyOnEntry: z.boolean().default(true),
  notifyOnExit: z.boolean().default(false),
  isInitial: z.boolean().default(false),
  isFinal: z.boolean().default(false),
})

type StageFormValues = z.infer<typeof stageFormSchema>

interface WorkflowsStagesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: WorkflowTemplate
}

export function WorkflowsStagesDialog({
  open,
  onOpenChange,
  currentRow,
}: WorkflowsStagesDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const { data: workflow, isLoading } = useWorkflow(currentRow._id)
  const addStage = useAddStage()
  const updateStage = useUpdateStage()
  const deleteStage = useDeleteStage()

  const [editingStage, setEditingStage] = useState<WorkflowStage | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema) as any,
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      color: '#3B82F6',
      durationDays: undefined,
      autoTransition: false,
      notifyOnEntry: true,
      notifyOnExit: false,
      isInitial: false,
      isFinal: false,
    },
  })

  const stages = workflow?.stages || currentRow.stages || []

  const resetForm = () => {
    form.reset({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      color: '#3B82F6',
      durationDays: undefined,
      autoTransition: false,
      notifyOnEntry: true,
      notifyOnExit: false,
      isInitial: false,
      isFinal: false,
    })
    setEditingStage(null)
    setShowAddForm(false)
  }

  const handleEditStage = (stage: WorkflowStage) => {
    setEditingStage(stage)
    setShowAddForm(true)
    form.reset({
      name: stage.name,
      nameAr: stage.nameAr,
      description: stage.description || '',
      descriptionAr: stage.descriptionAr || '',
      color: stage.color,
      durationDays: stage.durationDays,
      autoTransition: stage.autoTransition,
      notifyOnEntry: stage.notifyOnEntry,
      notifyOnExit: stage.notifyOnExit,
      isInitial: stage.isInitial,
      isFinal: stage.isFinal,
    })
  }

  const handleDeleteStage = (stageId: string) => {
    deleteStage.mutate({
      workflowId: currentRow._id,
      stageId,
    })
  }

  const onSubmit = (values: StageFormValues) => {
    if (editingStage?._id) {
      updateStage.mutate(
        {
          workflowId: currentRow._id,
          stageId: editingStage._id,
          data: values,
        },
        {
          onSuccess: () => {
            resetForm()
          },
        }
      )
    } else {
      addStage.mutate(
        {
          workflowId: currentRow._id,
          data: {
            ...values,
            order: stages.length,
            requirements: [],
            allowedActions: [],
          },
        },
        {
          onSuccess: () => {
            resetForm()
          },
        }
      )
    }
  }

  const toggleExpanded = (stageId: string) => {
    const newExpanded = new Set(expandedStages)
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId)
    } else {
      newExpanded.add(stageId)
    }
    setExpandedStages(newExpanded)
  }

  const isPending = addStage.isPending || updateStage.isPending || deleteStage.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('caseWorkflows.manageStages')}</DialogTitle>
          <DialogDescription>
            {t('caseWorkflows.manageStagesDescription', {
              name: isRTL ? currentRow.nameAr : currentRow.name,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stages List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{t('caseWorkflows.stagesList')}</h4>
              <Button
                size="sm"
                onClick={() => {
                  resetForm()
                  setShowAddForm(true)
                }}
                disabled={showAddForm}
              >
                <Plus className="h-4 w-4 me-1" />
                {t('caseWorkflows.addStage')}
              </Button>
            </div>

            <ScrollArea className="h-[400px] pe-4">
              <div className="space-y-2">
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => (
                    <Collapsible
                      key={stage._id || index}
                      open={expandedStages.has(stage._id || String(index))}
                      onOpenChange={() => toggleExpanded(stage._id || String(index))}
                    >
                      <div className="rounded-lg border bg-card">
                        <div className="flex items-center gap-2 p-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: stage.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {isRTL ? stage.nameAr : stage.name}
                              </span>
                              {stage.isInitial && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {t('caseWorkflows.initial')}
                                </Badge>
                              )}
                              {stage.isFinal && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {t('caseWorkflows.final')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditStage(stage)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => stage._id && handleDeleteStage(stage._id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {expandedStages.has(stage._id || String(index)) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                            <Separator />
                            {stage.description && (
                              <p className="text-muted-foreground">
                                {isRTL ? stage.descriptionAr : stage.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {stage.durationDays && (
                                <Badge variant="secondary" className="text-xs">
                                  {stage.durationDays} {t('common.days')}
                                </Badge>
                              )}
                              {stage.autoTransition && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('caseWorkflows.autoTransition')}
                                </Badge>
                              )}
                              {stage.notifyOnEntry && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('caseWorkflows.notifyOnEntry')}
                                </Badge>
                              )}
                            </div>
                            {stage.requirements && stage.requirements.length > 0 && (
                              <div className="pt-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {t('caseWorkflows.requirements')}:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {stage.requirements.map((req, ri) => (
                                    <Badge key={ri} variant="outline" className="text-xs">
                                      {req.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}

                {stages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('caseWorkflows.noStages')}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  {editingStage ? t('caseWorkflows.editStage') : t('caseWorkflows.addStage')}
                </h4>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px] pe-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('caseWorkflows.nameEn')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Case Intake" {...field} />
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
                              <Input placeholder="استلام القضية" dir="rtl" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('caseWorkflows.color')}</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {stageColors.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  field.value === color.value
                                    ? 'border-foreground scale-110'
                                    : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => field.onChange(color.value)}
                                title={isRTL ? color.labelAr : color.label}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('caseWorkflows.descriptionEn')}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Initial case intake..."
                                className="resize-none"
                                rows={2}
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
                                placeholder="استلام القضية الأولي..."
                                className="resize-none"
                                dir="rtl"
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="durationDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('caseWorkflows.estimatedDuration')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="7"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('caseWorkflows.estimatedDurationDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isInitial"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">
                                {t('caseWorkflows.initialStage')}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFinal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">
                                {t('caseWorkflows.finalStage')}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="autoTransition"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">
                                {t('caseWorkflows.autoTransition')}
                              </FormLabel>
                              <FormDescription className="text-xs">
                                {t('caseWorkflows.autoTransitionDescription')}
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
                        name="notifyOnEntry"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">
                                {t('caseWorkflows.notifyOnEntry')}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notifyOnExit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm">
                                {t('caseWorkflows.notifyOnExit')}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending
                          ? t('common.saving')
                          : editingStage
                            ? t('common.saveChanges')
                            : t('caseWorkflows.addStage')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </ScrollArea>
            </div>
          )}

          {!showAddForm && (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <p>{t('caseWorkflows.selectStageToEdit')}</p>
                <Button
                  variant="link"
                  onClick={() => {
                    resetForm()
                    setShowAddForm(true)
                  }}
                >
                  {t('caseWorkflows.orAddNewStage')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
