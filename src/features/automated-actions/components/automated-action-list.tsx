/**
 * Automated Action List Component
 * Display and manage automated actions
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Zap,
  Copy,
  Trash2,
  MoreHorizontal,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  History,
  Edit,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useAutomatedActions,
  useToggleAutomatedAction,
  useDeleteAutomatedAction,
  useDuplicateAutomatedAction,
  useAutomatedActionLogs,
} from '@/hooks/useAutomatedActions'
import { TRIGGER_CONFIGS, ACTION_TYPE_CONFIGS, type AutomatedAction } from '@/types/automatedAction'

interface AutomatedActionListProps {
  className?: string
  onEdit?: (action: AutomatedAction) => void
  onCreate?: () => void
}

export function AutomatedActionList({
  className,
  onEdit,
  onCreate,
}: AutomatedActionListProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [logsDialogOpen, setLogsDialogOpen] = React.useState(false)
  const [selectedAction, setSelectedAction] = React.useState<AutomatedAction | null>(null)

  const { data: actionsData, isLoading } = useAutomatedActions()
  const toggleAction = useToggleAutomatedAction()
  const deleteAction = useDeleteAutomatedAction()
  const duplicateAction = useDuplicateAutomatedAction()
  const { data: logsData } = useAutomatedActionLogs(
    selectedAction?._id || '',
    undefined,
    !!selectedAction
  )

  const getTriggerConfig = (trigger: string) =>
    TRIGGER_CONFIGS.find((t) => t.value === trigger)

  const getActionTypeConfig = (actionType: string) =>
    ACTION_TYPE_CONFIGS.find((a) => a.value === actionType)

  const handleViewLogs = (action: AutomatedAction) => {
    setSelectedAction(action)
    setLogsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const actions = actionsData?.actions || []

  return (
    <div className={cn('space-y-4', className)}>
      {/* Coming Soon Alert - [BACKEND-PENDING] */}
      <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          {isArabic ? '[قيد الانتظار] قريباً | [BACKEND-PENDING] Coming Soon' : '[BACKEND-PENDING] Coming Soon | [قيد الانتظار] قريباً'}
        </AlertTitle>
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          {isArabic ? (
            <>
              هذه الميزة قيد التطوير حالياً. واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.
              <br />
              <span className="text-sm">
                [BACKEND-PENDING] This feature is currently under development. The automated actions backend API is not yet implemented.
              </span>
            </>
          ) : (
            <>
              [BACKEND-PENDING] This feature is currently under development. The automated actions backend API is not yet implemented.
              <br />
              <span className="text-sm">
                [قيد الانتظار] هذه الميزة قيد التطوير حالياً. واجهة برمجة التطبيقات الخلفية للإجراءات التلقائية غير مطبقة بعد.
              </span>
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {isArabic ? 'الإجراءات التلقائية' : 'Automated Actions'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? 'أتمتة سير العمل بناءً على أحداث معينة'
              : 'Automate workflows based on specific events'}
          </p>
        </div>
        {onCreate && (
          <Button onClick={onCreate} disabled title={isArabic ? '[قيد الانتظار] قريباً - الميزة قيد التطوير' : '[BACKEND-PENDING] Coming Soon - Feature under development'}>
            <Plus className="h-4 w-4 me-2" />
            {isArabic ? 'إجراء جديد' : 'New Action'}
          </Button>
        )}
      </div>

      {/* Actions List */}
      {actions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {isArabic
                ? 'لا توجد إجراءات تلقائية'
                : 'No automated actions yet'}
            </p>
            {onCreate && (
              <Button onClick={onCreate} disabled title={isArabic ? '[قيد الانتظار] قريباً - الميزة قيد التطوير' : '[BACKEND-PENDING] Coming Soon - Feature under development'}>
                <Plus className="h-4 w-4 me-2" />
                {isArabic ? 'إنشاء إجراء' : 'Create Action'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{isArabic ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{isArabic ? 'النموذج' : 'Model'}</TableHead>
                <TableHead>{isArabic ? 'المشغّل' : 'Trigger'}</TableHead>
                <TableHead>{isArabic ? 'الإجراء' : 'Action'}</TableHead>
                <TableHead>{isArabic ? 'التشغيلات' : 'Runs'}</TableHead>
                <TableHead>{isArabic ? 'آخر تشغيل' : 'Last Run'}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => {
                const triggerConfig = getTriggerConfig(action.trigger)
                const actionTypeConfig = getActionTypeConfig(action.action_type)

                return (
                  <TableRow key={action._id}>
                    <TableCell>
                      <Switch
                        checked={action.isActive}
                        onCheckedChange={() => toggleAction.mutate(action._id)}
                        disabled={toggleAction.isPending}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {isArabic ? action.nameAr : action.name}
                        </p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {isArabic
                              ? action.descriptionAr || action.description
                              : action.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{action.model_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {triggerConfig && (
                          <>
                            <span>
                              {isArabic
                                ? triggerConfig.labelAr
                                : triggerConfig.label}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {actionTypeConfig && (
                          <span>
                            {isArabic
                              ? actionTypeConfig.labelAr
                              : actionTypeConfig.label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{action.run_count}</span>
                        {action.error_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {action.error_count} {isArabic ? 'خطأ' : 'errors'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {action.last_run ? (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(action.last_run), 'PPp', {
                            locale: isArabic ? ar : enUS,
                          })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(action)}>
                              <Edit className="h-4 w-4 me-2" />
                              {isArabic ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleViewLogs(action)}>
                            <History className="h-4 w-4 me-2" />
                            {isArabic ? 'سجل التشغيل' : 'View Logs'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateAction.mutate(action._id)}>
                            <Copy className="h-4 w-4 me-2" />
                            {isArabic ? 'نسخ' : 'Duplicate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteAction.mutate(action._id)}
                          >
                            <Trash2 className="h-4 w-4 me-2" />
                            {isArabic ? 'حذف' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {isArabic ? 'سجل التشغيل' : 'Execution Logs'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction && (isArabic ? selectedAction.nameAr : selectedAction.name)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-96">
            {logsData?.logs && logsData.logs.length > 0 ? (
              <div className="space-y-2">
                {logsData.logs.map((log) => (
                  <div
                    key={log._id}
                    className={cn(
                      'p-3 rounded-lg border',
                      log.status === 'success' && 'bg-green-50 dark:bg-green-950/20',
                      log.status === 'failed' && 'bg-red-50 dark:bg-red-950/20',
                      log.status === 'skipped' && 'bg-gray-50 dark:bg-gray-950/20'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {log.status === 'failed' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        {log.status === 'skipped' && (
                          <AlertTriangle className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="font-medium text-sm">
                          {log.record_name || log.record_id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.execution_time_ms}ms
                        <span>•</span>
                        {format(new Date(log.executed_at), 'PPp', {
                          locale: isArabic ? ar : enUS,
                        })}
                      </div>
                    </div>
                    {log.error_message && (
                      <p className="mt-2 text-sm text-red-600">{log.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <History className="h-8 w-8 mb-2" />
                <p>{isArabic ? 'لا توجد سجلات' : 'No logs yet'}</p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsDialogOpen(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AutomatedActionList
