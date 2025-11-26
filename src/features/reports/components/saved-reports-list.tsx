import { useState } from 'react'
import { format } from 'date-fns'
import {
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { useSavedReports, useDeleteSavedReport } from '@/hooks/useReports'
import { reportTypes } from '../data/data'
import type { SavedReport, ReportType } from '@/services/reportsService'

interface SavedReportsListProps {
  onRunReport: (report: SavedReport) => void
  onEditReport: (report: SavedReport) => void
}

export function SavedReportsList({ onRunReport, onEditReport }: SavedReportsListProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SavedReport | null>(null)

  const { data, isLoading } = useSavedReports({ search })
  const deleteMutation = useDeleteSavedReport()

  const reports = data?.data || []

  const getReportTypeInfo = (type: ReportType) => {
    return reportTypes.find((r) => r.value === type)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget._id)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder={t('reports.searchReports')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('reports.noSavedReports')}</h3>
            <p className="text-muted-foreground">
              {t('reports.noSavedReportsDescription')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const typeInfo = getReportTypeInfo(report.type)
            const TypeIcon = typeInfo?.icon || FileText

            return (
              <Card key={report._id} className="hover:border-primary transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-primary/10 ${typeInfo?.color}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? typeInfo?.labelAr : typeInfo?.label}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRunReport(report)}>
                          <Play className="me-2 h-4 w-4" />
                          {t('reports.run')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditReport(report)}>
                          <Edit className="me-2 h-4 w-4" />
                          {t('reports.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(report)}
                          className="text-destructive"
                        >
                          <Trash2 className="me-2 h-4 w-4" />
                          {t('reports.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {report.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {report.config.period}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.config.format}
                    </Badge>
                    {report.config.isScheduled && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="me-1 h-3 w-3" />
                        {t('reports.scheduled')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.lastRun
                        ? format(new Date(report.lastRun), 'MMM d, yyyy')
                        : t('reports.neverRun')}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => onRunReport(report)}
                    >
                      <Play className="me-1 h-3 w-3" />
                      {t('reports.run')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reports.deleteReportTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reports.deleteReportDescription', { name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
