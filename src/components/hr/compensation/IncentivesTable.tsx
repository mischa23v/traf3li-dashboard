import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import type { EmployeeIncentive, IncentiveStatus } from '@/services/employeeIncentiveService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// Get status badge variant
const getStatusVariant = (
  status: IncentiveStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved':
    case 'processed':
      return 'default'
    case 'pending_approval':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

interface IncentivesTableProps {
  incentives: EmployeeIncentive[]
  isLoading: boolean
  selectedIncentives: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onEdit: (incentive: EmployeeIncentive) => void
  onDelete: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  formatCurrency: (amount: number, currency?: string) => string
}

export function IncentivesTable({
  incentives,
  isLoading,
  selectedIncentives,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  formatCurrency,
}: IncentivesTableProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Get localized field value
  const getLocalizedValue = (value: string, valueAr?: string) => {
    return isArabic && valueAr ? valueAr : value
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', {
      locale: isArabic ? ar : undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <input
              type="checkbox"
              checked={selectedIncentives.length === incentives.length && incentives.length > 0}
              onChange={onToggleSelectAll}
              className="rounded"
            />
          </TableHead>
          <TableHead>{t('hr.incentives.table.employee', 'Employee')}</TableHead>
          <TableHead>{t('hr.incentives.table.type', 'Type')}</TableHead>
          <TableHead>{t('hr.incentives.table.amount', 'Amount')}</TableHead>
          <TableHead>{t('hr.incentives.table.reason', 'Reason')}</TableHead>
          <TableHead>{t('hr.incentives.table.payrollDate', 'Payroll Date')}</TableHead>
          <TableHead>{t('hr.incentives.table.status', 'Status')}</TableHead>
          <TableHead className="text-right">
            {t('hr.incentives.table.actions', 'Actions')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incentives.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              {t('hr.incentives.noIncentives', 'No incentives found')}
            </TableCell>
          </TableRow>
        ) : (
          incentives.map((incentive) => (
            <TableRow key={incentive._id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIncentives.includes(incentive._id)}
                  onChange={() => onToggleSelect(incentive._id)}
                  className="rounded"
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {getLocalizedValue(incentive.employeeName, incentive.employeeNameAr)}
                  </div>
                  {incentive.employeeNumber && (
                    <div className="text-sm text-muted-foreground">
                      {incentive.employeeNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {t(`hr.compensation.incentives.types.${incentive.incentiveType}`)}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(incentive.incentiveAmount, incentive.currency)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {getLocalizedValue(incentive.incentiveReason, incentive.incentiveReasonAr)}
              </TableCell>
              <TableCell>{formatDate(incentive.payrollDate)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(incentive.status)}>
                  {t(`hr.compensation.incentives.statuses.${incentive.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {t('hr.incentives.actions', 'Actions')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {incentive.status === 'draft' && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(incentive)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('hr.incentives.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {incentive.status === 'pending_approval' && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove(incentive._id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('hr.incentives.approve', 'Approve')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onReject(incentive._id)}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {t('hr.incentives.reject', 'Reject')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(incentive._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('hr.incentives.delete', 'Delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
