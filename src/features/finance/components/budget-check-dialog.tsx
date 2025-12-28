/**
 * Budget Check Dialog
 * Warning dialog displayed when an expense would exceed budget limits
 *
 * Features:
 * - Shows budget availability
 * - Displays warning/error based on control action
 * - Blocks or warns user based on budget settings
 */

import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { BudgetCheckResult } from '@/types/budget'
import { cn } from '@/lib/utils'

interface BudgetCheckDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checkResult: BudgetCheckResult | null
  onProceed?: () => void
  onCancel?: () => void
}

export function BudgetCheckDialog({
  open,
  onOpenChange,
  checkResult,
  onProceed,
  onCancel,
}: BudgetCheckDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (!checkResult) return null

  const { allowed, action, budgetName, budgetNameAr, message, messageAr, warnings, warningsAr } =
    checkResult

  const utilizationPercent =
    checkResult.budgetedAmount > 0
      ? ((checkResult.usedAmount + checkResult.requestedAmount) / checkResult.budgetedAmount) * 100
      : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Determine icon and colors based on action and result
  const getStatusConfig = () => {
    if (!allowed && action === 'stop') {
      return {
        icon: XCircle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: isRTL ? 'تم حظر المصروف' : 'Expense Blocked',
        titleColor: 'text-red-900',
      }
    }

    if (action === 'warn') {
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: isRTL ? 'تحذير من الميزانية' : 'Budget Warning',
        titleColor: 'text-amber-900',
      }
    }

    return {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      title: isRTL ? 'ضمن الميزانية' : 'Within Budget',
      titleColor: 'text-emerald-900',
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full p-2', statusConfig.bgColor)}>
              <StatusIcon className={cn('h-6 w-6', statusConfig.iconColor)} />
            </div>
            <DialogTitle className={statusConfig.titleColor}>{statusConfig.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {isRTL ? messageAr : message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Budget Information */}
          {budgetName && (
            <Card className={cn('border', statusConfig.borderColor, statusConfig.bgColor)}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isRTL ? 'الميزانية' : 'Budget'}
                    </p>
                    <p className="font-semibold">{isRTL ? budgetNameAr : budgetName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'المخصص' : 'Budgeted'}
                      </p>
                      <p className="font-semibold">{formatCurrency(checkResult.budgetedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'المستخدم' : 'Used'}
                      </p>
                      <p className="font-semibold">{formatCurrency(checkResult.usedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'المتاح' : 'Available'}
                      </p>
                      <p className="font-semibold">{formatCurrency(checkResult.availableAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'المبلغ المطلوب' : 'Requested'}
                      </p>
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(checkResult.requestedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Utilization Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">
                        {isRTL ? 'نسبة الاستخدام' : 'Utilization'}
                      </span>
                      <span className="font-semibold">{utilizationPercent.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(utilizationPercent, 100)}
                      className={cn(
                        'h-3',
                        utilizationPercent > 100 && 'bg-red-100',
                        utilizationPercent > 80 && utilizationPercent <= 100 && 'bg-amber-100'
                      )}
                    />
                  </div>

                  {/* Over Budget Amount */}
                  {checkResult.wouldExceedBy && checkResult.wouldExceedBy > 0 && (
                    <div className="rounded-md bg-red-100 p-3 text-red-900">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <div>
                          <p className="font-medium">
                            {isRTL ? 'تجاوز الميزانية بمبلغ' : 'Would exceed budget by'}
                          </p>
                          <p className="text-lg font-bold">
                            {formatCurrency(checkResult.wouldExceedBy)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {warnings && warnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {isRTL ? 'تحذيرات' : 'Warnings'}
              </p>
              <ul className="space-y-1">
                {(isRTL ? warningsAr : warnings)?.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Control Action Badge */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'إجراء التحكم' : 'Control Action'}:
            </p>
            <Badge
              variant={action === 'stop' ? 'destructive' : action === 'warn' ? 'default' : 'secondary'}
            >
              {action === 'stop' && (isRTL ? 'حظر' : 'Stop')}
              {action === 'warn' && (isRTL ? 'تحذير' : 'Warn')}
              {action === 'ignore' && (isRTL ? 'تجاهل' : 'Ignore')}
            </Badge>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>

          {/* Proceed Button - Only show if allowed */}
          {allowed && (
            <Button
              onClick={() => {
                onProceed?.()
                onOpenChange(false)
              }}
              variant={action === 'warn' ? 'default' : 'default'}
            >
              {action === 'warn'
                ? isRTL
                  ? 'المتابعة على أي حال'
                  : 'Proceed Anyway'
                : isRTL
                  ? 'متابعة'
                  : 'Proceed'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
