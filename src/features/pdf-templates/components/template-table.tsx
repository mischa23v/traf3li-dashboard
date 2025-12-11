import { useTranslation } from 'react-i18next'
import { useSearch } from '@tanstack/react-router'
import { usePdfmeTemplates } from '@/hooks/usePdfme'
import { usePdfTemplatesContext } from './template-provider'
import { DataTable } from '@/components/data-table'
import { getColumns } from './template-columns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DataTableFacetedFilter } from '@/components/data-table'
import type { Table as TanstackTable } from '@tanstack/react-table'
import type { PdfmeTemplate } from '@/services/pdfmeService'

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

export function PdfTemplatesTable() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const search = useSearch({ from: '/_authenticated/dashboard/pdf-templates/' })
  const { setOpen, setCurrentTemplate } = usePdfTemplatesContext()

  const { data, isLoading } = usePdfmeTemplates({
    category: search.category,
    search: search.search,
    page: search.page || 1,
    limit: search.pageSize || 10,
  })

  const columns = getColumns(t, setOpen, setCurrentTemplate)

  // Category options for filter
  const categoryOptions = templateCategories.map((cat) => ({
    value: cat.value,
    label: isRTL ? cat.labelAr : cat.label,
  }))

  // Toolbar component
  const toolbar = (table: TanstackTable<PdfmeTemplate>) => {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder={t('pdfme.searchTemplates', 'Search templates...')}
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn('category') && (
            <DataTableFacetedFilter
              column={table.getColumn('category')}
              title={t('pdfme.category', 'Category')}
              options={categoryOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
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
      <DataTable
        columns={columns}
        data={[]}
        isLoading={true}
        toolbar={toolbar}
        showPagination={false}
      />
    )
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {t('pdfme.noTemplates', 'No templates found. Create your first template to get started.')}
        </p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data.data}
      totalCount={data.total}
      page={data.page}
      pageSize={data.limit}
      isLoading={isLoading}
      toolbar={toolbar}
      showPagination={true}
    />
  )
}
