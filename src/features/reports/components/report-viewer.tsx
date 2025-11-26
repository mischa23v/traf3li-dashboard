import { useState } from 'react'
import {
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Table as TableIcon,
  BarChart2,
  PieChart,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useExportReport } from '@/hooks/useReports'
import {
  reportTypes,
  periodOptions,
  exportFormatOptions,
  quickDateRanges,
} from '../data/data'
import type {
  ReportType,
  ReportConfig,
  RevenueReport,
  CaseReport,
  ClientReport,
  StaffReport,
  TimeTrackingReport,
  BillingReport,
  CollectionsReport,
} from '@/services/reportsService'

type ReportData =
  | RevenueReport
  | CaseReport
  | ClientReport
  | StaffReport
  | TimeTrackingReport
  | BillingReport
  | CollectionsReport

interface ReportViewerProps {
  reportType: ReportType
  config: Partial<ReportConfig>
  data?: ReportData
  isLoading: boolean
  onConfigChange: (config: Partial<ReportConfig>) => void
  onRefresh: () => void
}

export function ReportViewer({
  reportType,
  config,
  data,
  isLoading,
  onConfigChange,
  onRefresh,
}: ReportViewerProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const exportMutation = useExportReport()

  const currentReportType = reportTypes.find((r) => r.value === reportType)
  const ReportIcon = currentReportType?.icon || BarChart2

  const handleExport = (format: 'pdf' | 'xlsx' | 'csv') => {
    exportMutation.mutate({ reportType, config, format })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(num)
  }

  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  // Render summary cards based on report type
  const renderSummaryCards = () => {
    if (!data) return null

    switch (reportType) {
      case 'revenue': {
        const revenueData = data as RevenueReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalRevenue')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueData.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalBilled')}</div>
                <div className="text-2xl font-bold">{formatCurrency(revenueData.totalBilled)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalCollected')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(revenueData.totalCollected)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.outstanding')}</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(revenueData.outstandingAmount)}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'cases': {
        const caseData = data as CaseReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalCases')}</div>
                <div className="text-2xl font-bold">{formatNumber(caseData.totalCases)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.openCases')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(caseData.openCases)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.closedCases')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(caseData.closedCases)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.avgDuration')}</div>
                <div className="text-2xl font-bold">
                  {caseData.averageDuration} {t('reports.days')}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'clients': {
        const clientData = data as ClientReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalClients')}</div>
                <div className="text-2xl font-bold">{formatNumber(clientData.totalClients)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.activeClients')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(clientData.activeClients)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.newClients')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(clientData.newClients)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.inactiveClients')}</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(clientData.inactiveClients)}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'staff': {
        const staffData = data as StaffReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalStaff')}</div>
                <div className="text-2xl font-bold">{formatNumber(staffData.totalStaff)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.activeStaff')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(staffData.activeStaff)}
                </div>
              </CardContent>
            </Card>
            {staffData.staffByRole.slice(0, 2).map((role) => (
              <Card key={role.role}>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">{role.role}</div>
                  <div className="text-2xl font-bold">{formatNumber(role.count)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
      case 'time-tracking': {
        const timeData = data as TimeTrackingReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalHours')}</div>
                <div className="text-2xl font-bold">{formatNumber(timeData.totalHours)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.billableHours')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(timeData.billableHours)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.utilizationRate')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercent(timeData.utilizationRate)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.avgHourlyRate')}</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(timeData.averageHourlyRate)}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'billing': {
        const billingData = data as BillingReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalInvoices')}</div>
                <div className="text-2xl font-bold">{formatNumber(billingData.totalInvoices)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalAmount')}</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(billingData.totalAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.paidAmount')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(billingData.paidAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.overdueAmount')}</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(billingData.overdueAmount)}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      case 'collections': {
        const collectionsData = data as CollectionsReport
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.totalOutstanding')}</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(collectionsData.totalOutstanding)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.currentDue')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(collectionsData.currentDue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.overdue90Plus')}</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(collectionsData.overdue90Plus)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{t('reports.collectionRate')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercent(collectionsData.collectionRate)}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      default:
        return null
    }
  }

  // Render data table based on report type
  const renderDataTable = () => {
    if (!data) return null

    switch (reportType) {
      case 'revenue': {
        const revenueData = data as RevenueReport
        return (
          <Tabs defaultValue="byPeriod">
            <TabsList>
              <TabsTrigger value="byPeriod">{t('reports.byPeriod')}</TabsTrigger>
              <TabsTrigger value="byClient">{t('reports.byClient')}</TabsTrigger>
              <TabsTrigger value="byPracticeArea">{t('reports.byPracticeArea')}</TabsTrigger>
              <TabsTrigger value="byStaff">{t('reports.byStaff')}</TabsTrigger>
            </TabsList>
            <TabsContent value="byPeriod">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.period')}</TableHead>
                    <TableHead className="text-end">{t('reports.billed')}</TableHead>
                    <TableHead className="text-end">{t('reports.collected')}</TableHead>
                    <TableHead className="text-end">{t('reports.outstanding')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.revenueByPeriod.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.period}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.billed)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.collected)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.outstanding)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="byClient">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.client')}</TableHead>
                    <TableHead className="text-end">{t('reports.billed')}</TableHead>
                    <TableHead className="text-end">{t('reports.collected')}</TableHead>
                    <TableHead className="text-end">{t('reports.outstanding')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.revenueByClient.map((row) => (
                    <TableRow key={row.clientId}>
                      <TableCell>{row.clientName}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.billed)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.collected)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.outstanding)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="byPracticeArea">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.practiceArea')}</TableHead>
                    <TableHead className="text-end">{t('reports.billed')}</TableHead>
                    <TableHead className="text-end">{t('reports.collected')}</TableHead>
                    <TableHead className="text-end">{t('reports.percentage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.revenueByPracticeArea.map((row) => (
                    <TableRow key={row.practiceArea}>
                      <TableCell>{row.practiceArea}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.billed)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.collected)}</TableCell>
                      <TableCell className="text-end">{formatPercent(row.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="byStaff">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.staff')}</TableHead>
                    <TableHead className="text-end">{t('reports.billed')}</TableHead>
                    <TableHead className="text-end">{t('reports.collected')}</TableHead>
                    <TableHead className="text-end">{t('reports.hours')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.revenueByStaff.map((row) => (
                    <TableRow key={row.staffId}>
                      <TableCell>{row.staffName}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.billed)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.collected)}</TableCell>
                      <TableCell className="text-end">{formatNumber(row.hours)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )
      }
      case 'cases': {
        const caseData = data as CaseReport
        return (
          <Tabs defaultValue="byStatus">
            <TabsList>
              <TabsTrigger value="byStatus">{t('reports.byStatus')}</TabsTrigger>
              <TabsTrigger value="byType">{t('reports.byType')}</TabsTrigger>
              <TabsTrigger value="topCases">{t('reports.topCases')}</TabsTrigger>
            </TabsList>
            <TabsContent value="byStatus">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.status')}</TableHead>
                    <TableHead className="text-end">{t('reports.count')}</TableHead>
                    <TableHead className="text-end">{t('reports.percentage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseData.casesByStatus.map((row) => (
                    <TableRow key={row.status}>
                      <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-end">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-end">{formatPercent(row.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="byType">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.type')}</TableHead>
                    <TableHead className="text-end">{t('reports.count')}</TableHead>
                    <TableHead className="text-end">{t('reports.percentage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseData.casesByType.map((row) => (
                    <TableRow key={row.type}>
                      <TableCell>{row.type}</TableCell>
                      <TableCell className="text-end">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-end">{formatPercent(row.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="topCases">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.caseNumber')}</TableHead>
                    <TableHead>{t('reports.client')}</TableHead>
                    <TableHead>{t('reports.status')}</TableHead>
                    <TableHead className="text-end">{t('reports.revenue')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caseData.topCasesByRevenue.map((row) => (
                    <TableRow key={row.caseId}>
                      <TableCell className="font-mono">{row.caseNumber}</TableCell>
                      <TableCell>{row.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-end">{formatCurrency(row.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )
      }
      case 'staff': {
        const staffData = data as StaffReport
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.name')}</TableHead>
                <TableHead>{t('reports.role')}</TableHead>
                <TableHead className="text-end">{t('reports.billableHours')}</TableHead>
                <TableHead className="text-end">{t('reports.utilization')}</TableHead>
                <TableHead className="text-end">{t('reports.billed')}</TableHead>
                <TableHead className="text-end">{t('reports.casesHandled')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffData.performanceMetrics.map((row) => (
                <TableRow key={row.staffId}>
                  <TableCell className="font-medium">{row.staffName}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell className="text-end">{formatNumber(row.billableHours)}</TableCell>
                  <TableCell className="text-end">{formatPercent(row.utilizationRate)}</TableCell>
                  <TableCell className="text-end">{formatCurrency(row.totalBilled)}</TableCell>
                  <TableCell className="text-end">{formatNumber(row.casesHandled)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }
      case 'collections': {
        const collectionsData = data as CollectionsReport
        return (
          <Tabs defaultValue="aging">
            <TabsList>
              <TabsTrigger value="aging">{t('reports.agingSummary')}</TabsTrigger>
              <TabsTrigger value="debtors">{t('reports.topDebtors')}</TabsTrigger>
            </TabsList>
            <TabsContent value="aging">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.ageRange')}</TableHead>
                    <TableHead className="text-end">{t('reports.count')}</TableHead>
                    <TableHead className="text-end">{t('reports.amount')}</TableHead>
                    <TableHead className="text-end">{t('reports.percentage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsData.agingSummary.map((row) => (
                    <TableRow key={row.range}>
                      <TableCell>{row.range}</TableCell>
                      <TableCell className="text-end">{formatNumber(row.count)}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.amount)}</TableCell>
                      <TableCell className="text-end">{formatPercent(row.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="debtors">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.client')}</TableHead>
                    <TableHead className="text-end">{t('reports.totalDue')}</TableHead>
                    <TableHead className="text-end">{t('reports.overdueDays')}</TableHead>
                    <TableHead>{t('reports.lastPayment')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collectionsData.topDebtors.map((row) => (
                    <TableRow key={row.clientId}>
                      <TableCell className="font-medium">{row.clientName}</TableCell>
                      <TableCell className="text-end">{formatCurrency(row.totalDue)}</TableCell>
                      <TableCell className="text-end">{formatNumber(row.overdueDays)}</TableCell>
                      <TableCell>{row.lastPaymentDate || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )
      }
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            {t('reports.noDataAvailable')}
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-primary/10 ${currentReportType?.color}`}>
                <ReportIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isRTL ? currentReportType?.labelAr : currentReportType?.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? currentReportType?.descriptionAr : currentReportType?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Select
                value={config.period || 'monthly'}
                onValueChange={(value) =>
                  onConfigChange({ ...config, period: value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom' })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <Calendar className="me-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {isRTL ? period.labelAr : period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={handleExport}>
                <SelectTrigger className="w-[120px]">
                  <Download className="me-2 h-4 w-4" />
                  <SelectValue placeholder={t('reports.export')} />
                </SelectTrigger>
                <SelectContent>
                  {exportFormatOptions.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {isRTL ? format.labelAr : format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Date Filters */}
      <div className="flex flex-wrap gap-2">
        {quickDateRanges.slice(0, 6).map((range) => (
          <Button
            key={range.value}
            variant="outline"
            size="sm"
            onClick={() => {
              const { start, end } = range.getRange()
              onConfigChange({
                ...config,
                period: 'custom',
                startDate: start.toISOString(),
                endDate: end.toISOString(),
              })
            }}
          >
            {isRTL ? range.labelAr : range.label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Report Content */}
      {!isLoading && data && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="h-4 w-4 me-1" />
                {t('reports.tableView')}
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                <BarChart2 className="h-4 w-4 me-1" />
                {t('reports.chartView')}
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 me-1" />
              {t('reports.filters')}
            </Button>
          </div>

          {/* Data Display */}
          <Card>
            <CardContent className="p-4">
              {viewMode === 'table' ? (
                renderDataTable()
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('reports.chartComingSoon')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !data && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t('reports.noData')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('reports.noDataDescription')}
            </p>
            <Button onClick={onRefresh}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t('reports.generateReport')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
