/**
 * Billing History Component
 * Displays invoice history with filters and pagination
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { useBillingHistory, useDownloadInvoice, usePayInvoice } from '@/hooks/useBilling'
import type { Invoice, BillingHistoryFilters } from '@/services/billingService'

export function BillingHistory() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [filters, setFilters] = useState<BillingHistoryFilters>({
    page: 1,
    limit: 10,
    status: undefined,
  })

  const { data, isLoading } = useBillingHistory(filters)
  const downloadMutation = useDownloadInvoice()
  const payMutation = usePayInvoice()

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as Invoice['status']),
      page: 1,
    }))
  }

  const handleDownload = async (invoiceId: string) => {
    await downloadMutation.mutateAsync(invoiceId)
  }

  const handlePay = async (invoiceId: string) => {
    if (confirm(t('billing.invoice.confirmPay'))) {
      await payMutation.mutateAsync(invoiceId)
    }
  }

  if (isLoading) {
    return <BillingHistorySkeleton />
  }

  const invoices = data?.invoices || []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('billing.history.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('billing.history.description')}</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('billing.history.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('billing.history.allStatuses')}</SelectItem>
              <SelectItem value="paid">{t('billing.invoice.status.paid')}</SelectItem>
              <SelectItem value="open">{t('billing.invoice.status.open')}</SelectItem>
              <SelectItem value="draft">{t('billing.invoice.status.draft')}</SelectItem>
              <SelectItem value="uncollectible">
                {t('billing.invoice.status.uncollectible')}
              </SelectItem>
              <SelectItem value="void">{t('billing.invoice.status.void')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>{t('billing.history.noInvoices')}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('billing.history.invoice')}</TableHead>
                    <TableHead>{t('billing.history.date')}</TableHead>
                    <TableHead>{t('billing.history.amount')}</TableHead>
                    <TableHead>{t('billing.history.status')}</TableHead>
                    <TableHead>{t('billing.history.plan')}</TableHead>
                    <TableHead className="text-end">{t('billing.history.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString(
                          isRTL ? 'ar-SA' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {invoice.currency}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="capitalize">{invoice.plan}</TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePay(invoice._id)}
                              disabled={payMutation.isPending}
                            >
                              <CreditCard className="h-3 w-3 me-2" />
                              {t('billing.invoice.pay')}
                            </Button>
                          )}
                          {invoice.status === 'paid' && invoice.downloadUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(invoice._id)}
                              disabled={downloadMutation.isPending}
                            >
                              <Download className="h-3 w-3 me-2" />
                              {t('billing.invoice.download')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {invoices.map((invoice) => (
              <Card key={invoice._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {invoice.invoiceNumber}
                    </CardTitle>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('billing.history.date')}</p>
                      <p className="font-medium">
                        {new Date(invoice.createdAt).toLocaleDateString(
                          isRTL ? 'ar-SA' : 'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('billing.history.amount')}</p>
                      <p className="font-medium">
                        {invoice.amount.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {invoice.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('billing.history.plan')}</p>
                      <p className="font-medium capitalize">{invoice.plan}</p>
                    </div>
                    {invoice.paymentMethod && (
                      <div>
                        <p className="text-muted-foreground">{t('billing.history.paymentMethod')}</p>
                        <p className="font-medium">
                          {invoice.paymentMethod.type} •••• {invoice.paymentMethod.last4}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {invoice.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handlePay(invoice._id)}
                        disabled={payMutation.isPending}
                        className="flex-1"
                      >
                        <CreditCard className="h-3 w-3 me-2" />
                        {t('billing.invoice.pay')}
                      </Button>
                    )}
                    {invoice.status === 'paid' && invoice.downloadUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(invoice._id)}
                        disabled={downloadMutation.isPending}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 me-2" />
                        {t('billing.invoice.download')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('billing.history.showing', {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {t('billing.history.page', {
                    current: pagination.page,
                    total: pagination.pages,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  const { t } = useTranslation()

  const statusConfig = {
    paid: {
      label: t('billing.invoice.status.paid'),
      variant: 'default' as const,
      icon: CheckCircle2,
      className: 'bg-green-500 hover:bg-green-600',
    },
    open: {
      label: t('billing.invoice.status.open'),
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    draft: {
      label: t('billing.invoice.status.draft'),
      variant: 'outline' as const,
      icon: FileText,
      className: '',
    },
    uncollectible: {
      label: t('billing.invoice.status.uncollectible'),
      variant: 'destructive' as const,
      icon: AlertCircle,
      className: '',
    },
    void: {
      label: t('billing.invoice.status.void'),
      variant: 'secondary' as const,
      icon: XCircle,
      className: '',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('gap-1', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function BillingHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
