import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, DollarSign, FileText, CheckCircle, Clock } from 'lucide-react'
import { usePayrolls } from '@/hooks/usePayroll'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { payrollStatuses, payrollStatusColors, months } from './data/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const route = getRouteApi('/_authenticated/dashboard/hr/payroll/')

export function Payroll() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data, isLoading } = usePayrolls()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (month: number) => {
    const monthData = months.find((m) => m.value === month)
    return isArabic ? monthData?.label : monthData?.labelEn
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('hr.payroll.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('hr.payroll.description')}
            </p>
          </div>
          <Button>
            <Plus className='me-2 h-4 w-4' />
            {t('hr.payroll.generatePayroll')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.payroll.stats.total')}
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{data?.data?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.payroll.stats.pending')}
              </CardTitle>
              <Clock className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-500'>
                {data?.data?.filter((p: any) => p.status === 'pending_approval')
                  .length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.payroll.stats.completed')}
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-500'>
                {data?.data?.filter((p: any) => p.status === 'completed')
                  .length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.payroll.stats.totalPaid')}
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(
                  data?.data
                    ?.filter((p: any) => p.status === 'completed')
                    .reduce((acc: number, p: any) => acc + p.totalNet, 0) || 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        {isLoading ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.payroll.payrollHistory')}</CardTitle>
              <CardDescription>
                {t('hr.payroll.payrollHistoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hr.payroll.columns.payrollId')}</TableHead>
                    <TableHead>{t('hr.payroll.columns.period')}</TableHead>
                    <TableHead>{t('hr.payroll.columns.employees')}</TableHead>
                    <TableHead>{t('hr.payroll.columns.totalGross')}</TableHead>
                    <TableHead>{t('hr.payroll.columns.totalNet')}</TableHead>
                    <TableHead>{t('hr.payroll.columns.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.length ? (
                    data.data.map((payroll: any) => {
                      const status = payrollStatuses.find(
                        (s) => s.value === payroll.status
                      )
                      return (
                        <TableRow key={payroll._id}>
                          <TableCell className='font-mono'>
                            {payroll.payrollId}
                          </TableCell>
                          <TableCell>
                            {getMonthName(payroll.periodMonth)}{' '}
                            {payroll.periodYear}
                          </TableCell>
                          <TableCell>{payroll.items?.length || 0}</TableCell>
                          <TableCell>
                            {formatCurrency(payroll.totalGross)}
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {formatCurrency(payroll.totalNet)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(
                                payrollStatusColors.get(payroll.status)
                              )}
                            >
                              {isArabic ? status?.label : status?.labelEn}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center'>
                        {t('hr.payroll.noPayrolls')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
