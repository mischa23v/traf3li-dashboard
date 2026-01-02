import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import {
  COMPENSATORY_STATUS_LABELS,
  WORK_REASON_LABELS,
} from '@/services/compensatoryLeaveService'

interface CompensatoryLeaveFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  reasonFilter: string
  onReasonChange: (value: string) => void
  yearFilter: string
  onYearChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  yearOptions: number[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function CompensatoryLeaveFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  reasonFilter,
  onReasonChange,
  yearFilter,
  onYearChange,
  sortBy,
  onSortByChange,
  yearOptions,
  hasActiveFilters,
  onClearFilters,
}: CompensatoryLeaveFiltersProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('common.searchAndFilter', 'Search & Filter')}</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('common.clearFilters', 'Clear Filters')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`}
            />
            <Input
              placeholder={t(
                'hr.leave.compensatory.searchPlaceholder',
                'Search by employee or number...'
              )}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={isRTL ? 'pr-9' : 'pl-9'}
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.status', 'Status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allStatuses', 'All Statuses')}</SelectItem>
              {Object.keys(COMPENSATORY_STATUS_LABELS).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`hr.leave.compensatory.statusFilter.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reasonFilter} onValueChange={onReasonChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('hr.leave.compensatory.reason', 'Reason')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('hr.leave.compensatory.allReasons', 'All Reasons')}</SelectItem>
              {Object.keys(WORK_REASON_LABELS).map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {t(`hr.leave.compensatory.workReason.${reason}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={onYearChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.year', 'Year')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allYears', 'All Years')}</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('common.sortBy', 'Sort By')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workFromDate">
                {t('hr.leave.compensatory.workDate', 'Work Date')}
              </SelectItem>
              <SelectItem value="leaveDaysEarned">
                {t('hr.leave.compensatory.daysEarned', 'Days Earned')}
              </SelectItem>
              <SelectItem value="validUntil">
                {t('hr.leave.compensatory.expiryDate', 'Expiry Date')}
              </SelectItem>
              <SelectItem value="createdAt">
                {t('hr.leave.compensatory.requestDate', 'Request Date')}
              </SelectItem>
              <SelectItem value="employeeName">
                {t('common.employeeName', 'Employee Name')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
