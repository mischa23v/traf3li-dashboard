import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { IncentiveType, IncentiveStatus } from '@/services/employeeIncentiveService'
import {
  incentiveTypeLabels,
  incentiveStatusLabels,
} from '@/services/employeeIncentiveService'

interface IncentiveFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedType: IncentiveType | 'all'
  onTypeChange: (value: IncentiveType | 'all') => void
  selectedStatus: IncentiveStatus | 'all'
  onStatusChange: (value: IncentiveStatus | 'all') => void
}

export function IncentiveFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}: IncentiveFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('hr.incentives.search', 'Search...')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Select
          value={selectedType}
          onValueChange={(v) => onTypeChange(v as IncentiveType | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('hr.incentives.incentiveType', 'Incentive Type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('hr.incentives.all', 'All')}</SelectItem>
            {Object.entries(incentiveTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {t(`hr.compensation.incentives.types.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(v) => onStatusChange(v as IncentiveStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('hr.incentives.status', 'Status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('hr.incentives.all', 'All')}</SelectItem>
            {Object.entries(incentiveStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {t(`hr.compensation.incentives.statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
