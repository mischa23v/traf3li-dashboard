import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  CheckSquare,
  Bell,
  Edit,
  Plus,
  Trash2,
  Zap,
  ArrowRightCircle,
  ArrowLeftCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import type { PipelineStage, PipelineAutoAction, AutoActionType, AutoActionTrigger } from '@/types/crm'

interface PipelineAutomationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage: PipelineStage
  onSave: (autoActions: PipelineAutoAction[]) => Promise<void>
  isLoading?: boolean
}

const ACTION_TYPES: { value: AutoActionType; label: string; labelAr: string; icon: any; color: string }[] = [
  { value: 'send_email', label: 'Send Email', labelAr: 'إرسال بريد', icon: Mail, color: 'bg-blue-100 text-blue-700' },
  { value: 'create_task', label: 'Create Task', labelAr: 'إنشاء مهمة', icon: CheckSquare, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'notify_user', label: 'Notify User', labelAr: 'إشعار المستخدم', icon: Bell, color: 'bg-amber-100 text-amber-700' },
  { value: 'update_field', label: 'Update Field', labelAr: 'تحديث حقل', icon: Edit, color: 'bg-purple-100 text-purple-700' },
]

const TRIGGER_TYPES: { value: AutoActionTrigger; label: string; labelAr: string; icon: any }[] = [
  { value: 'enter', label: 'On Enter', labelAr: 'عند الدخول', icon: ArrowRightCircle },
  { value: 'exit', label: 'On Exit', labelAr: 'عند الخروج', icon: ArrowLeftCircle },
  { value: 'stay', label: 'While In Stage', labelAr: 'أثناء البقاء', icon: Clock },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', labelAr: 'منخفضة' },
  { value: 'normal', label: 'Normal', labelAr: 'عادية' },
  { value: 'high', label: 'High', labelAr: 'عالية' },
  { value: 'urgent', label: 'Urgent', labelAr: 'عاجلة' },
]

export function PipelineAutomationDialog({
  open,
  onOpenChange,
  stage,
  onSave,
  isLoading,
}: PipelineAutomationDialogProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [autoActions, setAutoActions] = useState<PipelineAutoAction[]>(
    stage.autoActions || []
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newAction, setNewAction] = useState<PipelineAutoAction>({
    trigger: 'enter',
    action: 'send_email',
    config: {},
  })

  const handleAddAction = () => {
    setAutoActions([...autoActions, { ...newAction }])
    setNewAction({
      trigger: 'enter',
      action: 'send_email',
      config: {},
    })
  }

  const handleRemoveAction = (index: number) => {
    setAutoActions(autoActions.filter((_, i) => i !== index))
  }

  const handleUpdateAction = (index: number, updates: Partial<PipelineAutoAction>) => {
    setAutoActions(
      autoActions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      )
    )
  }

  const handleSave = async () => {
    await onSave(autoActions)
    onOpenChange(false)
  }

  const renderActionConfig = (action: PipelineAutoAction, index: number) => {
    switch (action.action) {
      case 'send_email':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'إرسال إلى' : 'Send To'}
              </label>
              <Select
                value={action.config.to || 'lead_owner'}
                onValueChange={(value) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, to: value },
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_owner">{isRTL ? 'مالك العميل' : 'Lead Owner'}</SelectItem>
                  <SelectItem value="lead_email">{isRTL ? 'بريد العميل' : 'Lead Email'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'الموضوع' : 'Subject'}
              </label>
              <Input
                placeholder={isRTL ? 'عميل جديد: {{entityName}}' : 'New Lead: {{entityName}}'}
                className="rounded-xl"
                value={action.config.subject || ''}
                onChange={(e) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, subject: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'الرسالة' : 'Message'}
              </label>
              <Textarea
                placeholder={isRTL ? 'تم نقل العميل إلى مرحلة {{stageName}}' : 'Lead moved to {{stageName}} stage'}
                className="rounded-xl min-h-[80px]"
                value={action.config.message || ''}
                onChange={(e) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, message: e.target.value },
                  })
                }
              />
            </div>
            <p className="text-xs text-slate-500">
              {isRTL
                ? 'المتغيرات المتاحة: {{entityName}}, {{stageName}}, {{userName}}'
                : 'Available variables: {{entityName}}, {{stageName}}, {{userName}}'}
            </p>
          </div>
        )

      case 'create_task':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'عنوان المهمة' : 'Task Title'}
              </label>
              <Input
                placeholder={isRTL ? 'متابعة {{entityName}}' : 'Follow up with {{entityName}}'}
                className="rounded-xl"
                value={action.config.title || ''}
                onChange={(e) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, title: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'تعيين إلى' : 'Assign To'}
                </label>
                <Select
                  value={action.config.assignedTo || 'lead_owner'}
                  onValueChange={(value) =>
                    handleUpdateAction(index, {
                      config: { ...action.config, assignedTo: value },
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_owner">{isRTL ? 'مالك العميل' : 'Lead Owner'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'الاستحقاق خلال (أيام)' : 'Due In (Days)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  className="rounded-xl"
                  value={action.config.dueInDays || 1}
                  onChange={(e) =>
                    handleUpdateAction(index, {
                      config: { ...action.config, dueInDays: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'الأولوية' : 'Priority'}
              </label>
              <Select
                value={action.config.priority || 'normal'}
                onValueChange={(value) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, priority: value },
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'notify_user':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'إشعار' : 'Notify'}
              </label>
              <Select
                value={action.config.userId || 'lead_owner'}
                onValueChange={(value) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, userId: value },
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_owner">{isRTL ? 'مالك العميل' : 'Lead Owner'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'عنوان الإشعار' : 'Notification Title'}
              </label>
              <Input
                placeholder={isRTL ? 'عميل جديد في المرحلة' : 'New lead in stage'}
                className="rounded-xl"
                value={action.config.title || ''}
                onChange={(e) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, title: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )

      case 'update_field':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'الحقل' : 'Field'}
                </label>
                <Select
                  value={action.config.field || 'tags'}
                  onValueChange={(value) =>
                    handleUpdateAction(index, {
                      config: { ...action.config, field: value },
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tags">{isRTL ? 'الوسوم' : 'Tags'}</SelectItem>
                    <SelectItem value="priority">{isRTL ? 'الأولوية' : 'Priority'}</SelectItem>
                    <SelectItem value="status">{isRTL ? 'الحالة' : 'Status'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'العملية' : 'Operation'}
                </label>
                <Select
                  value={action.config.operation || 'set'}
                  onValueChange={(value) =>
                    handleUpdateAction(index, {
                      config: { ...action.config, operation: value as 'set' | 'append' | 'remove' },
                    })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">{isRTL ? 'تعيين' : 'Set'}</SelectItem>
                    <SelectItem value="append">{isRTL ? 'إضافة' : 'Append'}</SelectItem>
                    <SelectItem value="remove">{isRTL ? 'إزالة' : 'Remove'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {isRTL ? 'القيمة' : 'Value'}
              </label>
              <Input
                placeholder={isRTL ? 'القيمة' : 'Value'}
                className="rounded-xl"
                value={action.config.value?.toString() || ''}
                onChange={(e) =>
                  handleUpdateAction(index, {
                    config: { ...action.config, value: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getActionTypeInfo = (actionType: AutoActionType) => {
    return ACTION_TYPES.find((t) => t.value === actionType)
  }

  const getTriggerTypeInfo = (trigger: AutoActionTrigger) => {
    return TRIGGER_TYPES.find((t) => t.value === trigger)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            {isRTL ? 'أتمتة المرحلة' : 'Stage Automation'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? `تكوين الإجراءات التلقائية لمرحلة "${stage.nameAr || stage.name}"`
              : `Configure automatic actions for "${stage.name}" stage`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Existing Actions */}
          {autoActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">
                {isRTL ? 'الإجراءات المكونة' : 'Configured Actions'}
              </h4>
              {autoActions.map((action, index) => {
                const actionInfo = getActionTypeInfo(action.action)
                const triggerInfo = getTriggerTypeInfo(action.trigger)
                const ActionIcon = actionInfo?.icon || Zap
                const TriggerIcon = triggerInfo?.icon || ArrowRightCircle

                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${actionInfo?.color} border-0 rounded-lg px-3 py-1`}>
                          <ActionIcon className="h-4 w-4 me-1 inline" />
                          {isRTL ? actionInfo?.labelAr : actionInfo?.label}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                          <TriggerIcon className="h-3 w-3 me-1 inline" />
                          {isRTL ? triggerInfo?.labelAr : triggerInfo?.label}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveAction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {renderActionConfig(action, index)}
                  </div>
                )
              })}
            </div>
          )}

          {/* Add New Action */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-4">
            <h4 className="font-medium text-slate-700">
              {isRTL ? 'إضافة إجراء جديد' : 'Add New Action'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'المشغل' : 'Trigger'}
                </label>
                <Select
                  value={newAction.trigger}
                  onValueChange={(value: AutoActionTrigger) =>
                    setNewAction({ ...newAction, trigger: value })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" />
                          {isRTL ? t.labelAr : t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isRTL ? 'نوع الإجراء' : 'Action Type'}
                </label>
                <Select
                  value={newAction.action}
                  onValueChange={(value: AutoActionType) =>
                    setNewAction({ ...newAction, action: value, config: {} })
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" />
                          {isRTL ? t.labelAr : t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={handleAddAction}
            >
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'إضافة إجراء' : 'Add Action'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
