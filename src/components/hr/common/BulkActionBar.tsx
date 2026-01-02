import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  onCancel: () => void
  onApprove?: () => void
  onReject?: () => void
  showApproveReject?: boolean
  children?: React.ReactNode
}

export function BulkActionBar({
  selectedCount,
  onCancel,
  onApprove,
  onReject,
  showApproveReject = true,
  children,
}: BulkActionBarProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (selectedCount === 0) return null

  return (
    <Card className="bg-muted">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {selectedCount} {t('common.selected', 'selected')}
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {t('common.cancelSelection', 'Cancel Selection')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {children}
          {showApproveReject && onApprove && (
            <Button variant="default" size="sm" onClick={onApprove}>
              <CheckCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('common.approve', 'Approve')}
            </Button>
          )}
          {showApproveReject && onReject && (
            <Button variant="destructive" size="sm" onClick={onReject}>
              <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('common.reject', 'Reject')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
