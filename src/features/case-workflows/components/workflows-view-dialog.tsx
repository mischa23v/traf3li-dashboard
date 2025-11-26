import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { WorkflowTemplate } from '../data/schema'
import { getCaseCategoryInfo, getRequirementTypeInfo } from '../data/data'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'

interface WorkflowsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: WorkflowTemplate
}

export function WorkflowsViewDialog({
  open,
  onOpenChange,
  currentRow,
}: WorkflowsViewDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const dateLocale = isRTL ? ar : enUS
  const category = getCaseCategoryInfo(currentRow.caseCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRTL ? currentRow.nameAr : currentRow.name}
            {currentRow.isDefault && (
              <Badge variant="default" className="ms-2">
                {t('caseWorkflows.default')}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRTL ? currentRow.descriptionAr : currentRow.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pe-4">
            {/* Workflow Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('caseWorkflows.caseCategory')}</span>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span className="font-medium">{isRTL ? category.labelAr : category.label}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('caseWorkflows.status')}</span>
                <Badge variant={currentRow.isActive ? 'default' : 'secondary'}>
                  {currentRow.isActive ? t('caseWorkflows.active') : t('caseWorkflows.inactive')}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('common.createdAt')}</span>
                <span className="font-medium">
                  {format(new Date(currentRow.createdAt), 'PPP', { locale: dateLocale })}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">{t('common.updatedAt')}</span>
                <span className="font-medium">
                  {format(new Date(currentRow.updatedAt), 'PPP', { locale: dateLocale })}
                </span>
              </div>
            </div>

            <Separator />

            {/* Stages */}
            <div>
              <h4 className="font-semibold mb-4">{t('caseWorkflows.stages')} ({currentRow.stages.length})</h4>
              <div className="space-y-3">
                {currentRow.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => (
                    <div
                      key={stage._id || index}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                        style={{ backgroundColor: stage.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {isRTL ? stage.nameAr : stage.name}
                          </span>
                          {stage.isInitial && (
                            <Badge variant="outline" className="text-xs">
                              {t('caseWorkflows.initialStage')}
                            </Badge>
                          )}
                          {stage.isFinal && (
                            <Badge variant="outline" className="text-xs">
                              {t('caseWorkflows.finalStage')}
                            </Badge>
                          )}
                        </div>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? stage.descriptionAr : stage.description}
                          </p>
                        )}
                        {stage.durationDays && (
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {t('caseWorkflows.estimatedDuration')}: {stage.durationDays} {t('common.days')}
                          </span>
                        )}

                        {/* Stage Requirements */}
                        {stage.requirements && stage.requirements.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {t('caseWorkflows.requirements')}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {stage.requirements.map((req, reqIndex) => {
                                const reqInfo = getRequirementTypeInfo(req.type)
                                const ReqIcon = reqInfo.icon
                                return (
                                  <Badge
                                    key={req._id || reqIndex}
                                    variant={req.isRequired ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    <ReqIcon className="h-3 w-3 me-1" />
                                    {req.name}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Stage Features */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {stage.autoTransition && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {t('caseWorkflows.autoTransition')}
                            </span>
                          )}
                          {stage.notifyOnEntry && (
                            <span className="flex items-center gap-1">
                              <Circle className="h-3 w-3 text-blue-500" />
                              {t('caseWorkflows.notifyOnEntry')}
                            </span>
                          )}
                        </div>
                      </div>
                      {index < currentRow.stages.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Transitions */}
            {currentRow.transitions && currentRow.transitions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-4">
                    {t('caseWorkflows.transitions')} ({currentRow.transitions.length})
                  </h4>
                  <div className="space-y-2">
                    {currentRow.transitions.map((transition, index) => {
                      const fromStage = currentRow.stages.find((s) => s._id === transition.fromStageId)
                      const toStage = currentRow.stages.find((s) => s._id === transition.toStageId)
                      return (
                        <div
                          key={transition._id || index}
                          className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50"
                        >
                          <Badge variant="outline" style={{ borderColor: fromStage?.color }}>
                            {isRTL ? fromStage?.nameAr : fromStage?.name}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" style={{ borderColor: toStage?.color }}>
                            {isRTL ? toStage?.nameAr : toStage?.name}
                          </Badge>
                          {transition.requiresApproval && (
                            <Badge variant="secondary" className="ms-auto text-xs">
                              {t('caseWorkflows.requiresApproval')}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
