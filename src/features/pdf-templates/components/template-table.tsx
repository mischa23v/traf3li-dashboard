import { useTranslation } from 'react-i18next'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { usePdfmeTemplates } from '@/hooks/usePdfme'
import { usePdfTemplatesContext } from './template-provider'
import { DataTable } from '@/components/data-table'
import { usePdfTemplateColumns } from './template-columns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Table as TanstackTable } from '@tanstack/react-table'
import type { PdfmeTemplate } from '@/services/pdfmeService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Template categories for filtering
const templateCategories = [
  { value: 'invoice', label: 'Invoice', labelAr: 'فاتورة' },
  { value: 'contract', label: 'Contract', labelAr: 'عقد' },
  { value: 'receipt', label: 'Receipt', labelAr: 'إيصال' },
  { value: 'report', label: 'Report', labelAr: 'تقرير' },
  { value: 'statement', label: 'Statement', labelAr: 'كشف' },
  { value: 'letter', label: 'Letter', labelAr: 'خطاب' },
  { value: 'certificate', label: 'Certificate', labelAr: 'شهادة' },
  { value: 'custom', label: 'Custom', labelAr: 'مخصص' },
]

// Helper component for URL-based pagination
function UrlBasedPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm font-medium">{t('dataTable.pagination.rowsPerPage', 'Rows per page')}</p>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">
          {t('dataTable.pagination.page', { current: currentPage, total: totalPages })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            {t('dataTable.pagination.first', 'First')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {t('dataTable.pagination.previous', 'Previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {t('dataTable.pagination.next', 'Next')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            {t('dataTable.pagination.last', 'Last')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PdfTemplatesTable() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const search = useSearch({ from: '/_authenticated/dashboard/pdf-templates/' })
  const navigate = useNavigate({ from: '/dashboard/pdf-templates' })
  const { setOpen, setCurrentTemplate } = usePdfTemplatesContext()

  const { data, isLoading } = usePdfmeTemplates({
    category: search.category,
    search: search.search,
    page: search.page || 1,
    limit: search.pageSize || 10,
  })

  const columns = usePdfTemplateColumns()

  // Category options for filter
  const categoryOptions = templateCategories.map((cat) => ({
    value: cat.value,
    label: isRTL ? cat.labelAr : cat.label,
  }))

  // Update URL search params
  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      search: { ...search, ...updates },
    })
  }

  // Toolbar component
  const toolbar = (table: TanstackTable<PdfmeTemplate>) => {
    const hasActiveFilters = !!(search.search || search.category)

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder={t('pdfme.searchTemplates', 'Search templates...')}
            value={search.search || ''}
            onChange={(event) => updateSearch({ search: event.target.value || undefined, page: 1 })}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Select
            value={search.category || 'all'}
            onValueChange={(value) =>
              updateSearch({ category: value === 'all' ? undefined : value, page: 1 })
            }
          >
            <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
              <SelectValue placeholder={t('pdfme.category', 'Category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => updateSearch({ search: undefined, category: undefined, page: 1 })}
              className="h-8 px-2 lg:px-3"
            >
              {t('common.reset', 'Reset')}
              <X className="ms-2 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={[]}
          isLoading={true}
          toolbar={toolbar}
          showPagination={false}
        />
      </div>
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="space-y-4">
        {toolbar({} as TanstackTable<PdfmeTemplate>)}
        <div className="flex flex-col items-center justify-center rounded-md border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('pdfme.noTemplates', 'No templates found. Create your first template to get started.')}
          </p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(data.total / (search.pageSize || 10))

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data.data}
        totalCount={data.total}
        page={data.page}
        pageSize={data.limit}
        isLoading={isLoading}
        toolbar={toolbar}
        showPagination={false}
      />
      <UrlBasedPagination
        currentPage={search.page || 1}
        totalPages={totalPages}
        pageSize={search.pageSize || 10}
        onPageChange={(page) => updateSearch({ page })}
        onPageSizeChange={(pageSize) => updateSearch({ pageSize, page: 1 })}
      />
    </div>
  )
}
