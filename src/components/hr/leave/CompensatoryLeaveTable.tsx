import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import type {
  CompensatoryLeaveRequest,
  CompensatoryLeaveStatus,
} from '@/services/compensatoryLeaveService'
import { WORK_REASON_LABELS } from '@/services/compensatoryLeaveService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import {
  Eye,
  Trash2,
  Edit3,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

// Status configuration
const getStatusConfig = (
  t: any
): Record<CompensatoryLeaveStatus, { label: string; variant: any; icon: any }> => ({
  draft: {
    label: t('hr.leave.compensatory.status.draft', 'Draft'),
    variant: 'secondary',
    icon: Edit3,
  },
  pending_approval: {
    label: t('hr.leave.compensatory.status.pendingApproval', 'Pending Approval'),
    variant: 'warning',
    icon: Clock,
  },
  approved: {
    label: t('hr.leave.compensatory.status.approved', 'Approved'),
    variant: 'success',
    icon: CheckCircle,
  },
  rejected: {
    label: t('hr.leave.compensatory.status.rejected', 'Rejected'),
    variant: 'destructive',
    icon: XCircle,
  },
  expired: {
    label: t('hr.leave.compensatory.status.expired', 'Expired'),
    variant: 'outline',
    icon: AlertTriangle,
  },
  used: {
    label: t('hr.leave.compensatory.status.used', 'Used'),
    variant: 'default',
    icon: CheckCircle,
  },
  cancelled: {
    label: t('hr.leave.compensatory.status.cancelled', 'Cancelled'),
    variant: 'outline',
    icon: X,
  },
})

// Get expiry badge variant
const getExpiryBadgeVariant = (validUntil: string) => {
  const daysUntilExpiry = differenceInDays(new Date(validUntil), new Date())
  if (daysUntilExpiry < 0) return 'destructive'
  if (daysUntilExpiry <= 7) return 'warning'
  if (daysUntilExpiry <= 30) return 'default'
  return 'secondary'
}

interface CompensatoryLeaveTableProps {
  requests: CompensatoryLeaveRequest[]
  isLoading: boolean
  isError: boolean
  hasActiveFilters: boolean
  isSelectionMode: boolean
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onClearFilters: () => void
  onRefetch: () => void
  onDelete: (id: string) => void
}

export function CompensatoryLeaveTable({
  requests,
  isLoading,
  isError,
  hasActiveFilters,
  isSelectionMode,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onClearFilters,
  onRefetch,
  onDelete,
}: CompensatoryLeaveTableProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()
  const STATUS_CONFIG = getStatusConfig(t)

  const isAllSelected = requests.length > 0 && selectedIds.length === requests.length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">
          <p>{t('common.errorLoadingData', 'Error loading data')}</p>
          <Button variant="outline" className="mt-4" onClick={onRefetch}>
            {t('common.retry', 'Retry')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('hr.leave.compensatory.noRequests', 'No compensatory leave requests')}</p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={onClearFilters}>
              {t('common.clearFilters', 'Clear Filters')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {isSelectionMode && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onSelectAll}
                    aria-label={t('common.selectAll', 'Select All')}
                  />
                </TableHead>
              )}
              <TableHead>{t('hr.leave.compensatory.requestId', 'Request ID')}</TableHead>
              <TableHead>{t('common.employee', 'Employee')}</TableHead>
              <TableHead>{t('common.department', 'Department')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.reason', 'Reason')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.workDate', 'Work Date')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.hours', 'Hours')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.daysEarned', 'Days Earned')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.balance', 'Balance')}</TableHead>
              <TableHead>{t('hr.leave.compensatory.validUntil', 'Valid Until')}</TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status]
              const StatusIcon = statusConfig.icon
              const daysUntilExpiry = differenceInDays(
                new Date(request.validUntil),
                new Date()
              )

              return (
                <TableRow key={request._id}>
                  {isSelectionMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(request._id)}
                        onCheckedChange={(checked) =>
                          onSelectOne(request._id, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{request.requestId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {isRTL ? request.employeeNameAr : request.employeeName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.employeeNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isRTL
                      ? request.departmentNameAr || request.departmentName
                      : request.departmentName || request.departmentNameAr}
                  </TableCell>
                  <TableCell>
                    {isRTL
                      ? WORK_REASON_LABELS[request.reason]?.ar || request.reason
                      : WORK_REASON_LABELS[request.reason]?.en || request.reason}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.workFromDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {request.hoursWorked} {t('hr.leave.compensatory.hoursUnit', 'hours')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {request.leaveDaysEarned} {t('hr.leave.compensatory.daysUnit', 'days')}
                  </TableCell>
                  <TableCell>
                    {request.daysRemaining} {t('hr.leave.compensatory.daysUnit', 'days')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getExpiryBadgeVariant(request.validUntil)}>
                      {daysUntilExpiry < 0
                        ? t('hr.leave.compensatory.expired', 'Expired')
                        : `${daysUntilExpiry} ${t('hr.leave.compensatory.daysUnit', 'days')}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant as any}>
                      <StatusIcon className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: ROUTES.dashboard.hr.leave.compensatory.detail(request._id),
                            })
                          }
                        >
                          <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('common.viewDetails', 'View Details')}
                        </DropdownMenuItem>
                        {request.status === 'draft' && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate({
                                  to: ROUTES.dashboard.hr.leave.compensatory.edit(request._id),
                                })
                              }
                            >
                              <Edit3 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('common.edit', 'Edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDelete(request._id)}
                            >
                              <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('common.delete', 'Delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
