/**
 * Duplicate Detection Panel
 * Shows potential duplicate leads/contacts with merge functionality
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Icons
import {
  Copy,
  Merge,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  User,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
} from 'lucide-react'

// Types
import type { DuplicateMatch } from '@/types/crm-enhanced'

interface DuplicateDetectionPanelProps {
  entityType: 'lead' | 'contact' | 'organization'
  entityId: string
  duplicates?: DuplicateMatch[]
  isLoading?: boolean
  onMerge?: (sourceIds: string[], targetId: string) => Promise<void>
  onDismiss?: (duplicateId: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// MATCH SCORE INDICATOR
// ═══════════════════════════════════════════════════════════════

function MatchScoreIndicator({ score }: { score: number }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-red-600 bg-red-100'
    if (s >= 60) return 'text-orange-600 bg-orange-100'
    if (s >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return isRTL ? 'تطابق عالي' : 'High Match'
    if (s >= 60) return isRTL ? 'تطابق متوسط' : 'Medium Match'
    if (s >= 40) return isRTL ? 'تطابق منخفض' : 'Low Match'
    return isRTL ? 'تطابق ضعيف' : 'Weak Match'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Progress value={score} className="w-16 h-2" />
            <Badge className={cn('text-xs', getScoreColor(score))}>
              {score}%
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getScoreLabel(score)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════
// DUPLICATE CARD
// ═══════════════════════════════════════════════════════════════

function DuplicateCard({
  duplicate,
  isSelected,
  onSelect,
  onDismiss,
}: {
  duplicate: DuplicateMatch
  isSelected: boolean
  onSelect: (id: string) => void
  onDismiss?: (id: string) => void
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={cn(
      'transition-all',
      isSelected && 'ring-2 ring-primary'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(duplicate.lead_id)}
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium truncate">
                  {duplicate.display_name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {duplicate.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {duplicate.email}
                    </span>
                  )}
                  {duplicate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {duplicate.phone}
                    </span>
                  )}
                </div>
              </div>

              <MatchScoreIndicator score={duplicate.match_score} />
            </div>

            {/* Match Reasons (Expandable) */}
            {duplicate.match_reasons.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {isRTL ? 'أسباب التطابق' : 'Match Reasons'}
                  ({duplicate.match_reasons.length})
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {duplicate.match_reasons.map((reason, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1"
                      >
                        <span className="capitalize">{reason.field.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{reason.similarity}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status Badge */}
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {duplicate.status}
              </Badge>
            </div>
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onDismiss(duplicate.lead_id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// MERGE DIALOG
// ═══════════════════════════════════════════════════════════════

function MergeDialog({
  isOpen,
  onClose,
  selectedIds,
  targetId,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  targetId: string
  onConfirm: () => Promise<void>
  isLoading: boolean
}) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'دمج السجلات' : 'Merge Records'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? `سيتم دمج ${selectedIds.length} سجل في السجل الحالي. هذا الإجراء لا يمكن التراجع عنه.`
              : `${selectedIds.length} record(s) will be merged into the current record. This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{isRTL ? 'تحذير' : 'Warning'}</AlertTitle>
          <AlertDescription>
            {isRTL
              ? 'سيتم نقل جميع الأنشطة والملاحظات إلى السجل الرئيسي وحذف السجلات المكررة.'
              : 'All activities and notes will be transferred to the primary record and duplicate records will be deleted.'}
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className={cn('w-4 h-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />}
            {isRTL ? 'تأكيد الدمج' : 'Confirm Merge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function DuplicateDetectionPanel({
  entityType,
  entityId,
  duplicates = [],
  isLoading = false,
  onMerge,
  onDismiss,
  className,
}: DuplicateDetectionPanelProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)
  const [isMerging, setIsMerging] = useState(false)

  // Handle selection toggle
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Handle merge
  const handleMerge = async () => {
    if (!onMerge || selectedIds.length === 0) return

    setIsMerging(true)
    try {
      await onMerge(selectedIds, entityId)
      setSelectedIds([])
      setIsMergeDialogOpen(false)
    } finally {
      setIsMerging(false)
    }
  }

  // No duplicates
  if (!isLoading && duplicates.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-medium">
            {isRTL ? 'لا توجد سجلات مكررة' : 'No Duplicates Found'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? 'هذا السجل فريد ولا يوجد له نسخ مكررة'
              : 'This record is unique with no potential duplicates'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Copy className="w-4 h-4" />
              {isRTL ? 'السجلات المكررة المحتملة' : 'Potential Duplicates'}
              {duplicates.length > 0 && (
                <Badge variant="secondary">{duplicates.length}</Badge>
              )}
            </CardTitle>

            {selectedIds.length > 0 && (
              <Button
                size="sm"
                onClick={() => setIsMergeDialogOpen(true)}
                className="gap-2"
              >
                <Merge className="w-4 h-4" />
                {isRTL ? `دمج (${selectedIds.length})` : `Merge (${selectedIds.length})`}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            duplicates.map((duplicate) => (
              <DuplicateCard
                key={duplicate.lead_id}
                duplicate={duplicate}
                isSelected={selectedIds.includes(duplicate.lead_id)}
                onSelect={handleSelect}
                onDismiss={onDismiss}
              />
            ))
          )}

          {/* Info tooltip */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Info className="w-3 h-3" />
            {isRTL
              ? 'تم اكتشاف التكرارات بناءً على البريد الإلكتروني والهاتف والاسم'
              : 'Duplicates detected based on email, phone, and name similarity'}
          </div>
        </CardContent>
      </Card>

      {/* Merge Dialog */}
      <MergeDialog
        isOpen={isMergeDialogOpen}
        onClose={() => setIsMergeDialogOpen(false)}
        selectedIds={selectedIds}
        targetId={entityId}
        onConfirm={handleMerge}
        isLoading={isMerging}
      />
    </>
  )
}

export default DuplicateDetectionPanel
