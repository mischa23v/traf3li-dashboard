import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useWelcome } from '@/hooks/useWelcome'
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Rocket,
  ExternalLink,
  PartyPopper
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStartChecklistProps {
  className?: string
}

export function QuickStartChecklist({ className }: QuickStartChecklistProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const { checklist, completeChecklistItem } = useWelcome()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const completedItems = checklist.filter(item => item.completed).length
  const totalItems = checklist.length
  const progress = (completedItems / totalItems) * 100
  const isComplete = completedItems === totalItems

  const handleItemClick = (item: typeof checklist[0]) => {
    if (!item.completed) {
      completeChecklistItem(item.id)
    }
    if (item.link) {
      navigate({ to: item.link })
    }
  }

  if (isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 z-50 w-full max-w-md animate-in slide-in-from-bottom-4 duration-500',
        isRTL ? 'left-6' : 'right-6',
        className
      )}
    >
      <div className="relative mx-4 overflow-hidden rounded-lg border bg-card shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
          <div className="absolute top-0 right-0 size-32 animate-pulse rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {isComplete ? (
                  <PartyPopper className="size-5" />
                ) : (
                  <Rocket className="size-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold leading-none">
                  {isRTL ? 'البدء السريع' : 'Quick Start'}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isRTL
                    ? `${completedItems} من ${totalItems} مكتملة`
                    : `${completedItems} of ${totalItems} completed`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isRTL ? 'طي/توسيع' : 'Collapse/Expand'}
              >
                {isCollapsed ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsDismissed(true)}
                aria-label={isRTL ? 'إغلاق' : 'Dismiss'}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        {!isCollapsed && (
          <div className="max-h-80 overflow-y-auto p-4">
            {isComplete ? (
              <div className="py-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PartyPopper className="size-8" />
                  </div>
                </div>
                <h4 className="mb-2 text-lg font-semibold">
                  {isRTL ? 'أحسنت!' : 'Great Job!'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'لقد أكملت جميع المهام الأساسية. أنت الآن جاهز لاستخدام النظام بالكامل!'
                    : "You've completed all essential tasks. You're now ready to use the system fully!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'group w-full rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5',
                      item.completed && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {item.completed ? (
                          <CheckCircle2 className="size-5 text-primary" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            item.completed && 'text-muted-foreground line-through'
                          )}
                        >
                          {isRTL ? item.titleAr : item.title}
                        </p>
                      </div>
                      {item.link && !item.completed && (
                        <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer message when collapsed */}
        {isCollapsed && !isComplete && (
          <div className="border-t p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {isRTL
                ? 'انقر للتوسيع ورؤية المهام المتبقية'
                : 'Click to expand and see remaining tasks'}
            </p>
          </div>
        )}

        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      </div>
    </div>
  )
}
