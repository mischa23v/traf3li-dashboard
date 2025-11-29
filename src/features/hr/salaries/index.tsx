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
import { Plus, DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react'
import { useSalaries, useSalaryStats } from '@/hooks/useSalaries'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { salaryStatuses } from './data/data'
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

const route = getRouteApi('/_authenticated/dashboard/hr/salaries/')

export function Salaries() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data, isLoading } = useSalaries({ status: 'active' })
  const { data: stats } = useSalaryStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
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
              {t('hr.salaries.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('hr.salaries.description')}
            </p>
          </div>
          <Button>
            <Plus className='me-2 h-4 w-4' />
            {t('hr.salaries.addSalary')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.salaries.stats.totalPayroll')}
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(stats?.totalPayroll || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.salaries.stats.avgSalary')}
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {formatCurrency(stats?.avgSalary || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.salaries.stats.totalAllowances')}
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-500'>
                {formatCurrency(stats?.totalAllowances || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.salaries.stats.totalDeductions')}
              </CardTitle>
              <TrendingDown className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-500'>
                {formatCurrency(stats?.totalDeductions || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salaries Table */}
        {isLoading ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.salaries.activeSalaries')}</CardTitle>
              <CardDescription>
                {t('hr.salaries.activeSalariesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hr.salaries.columns.employee')}</TableHead>
                    <TableHead>{t('hr.salaries.columns.basicSalary')}</TableHead>
                    <TableHead>{t('hr.salaries.columns.allowances')}</TableHead>
                    <TableHead>{t('hr.salaries.columns.deductions')}</TableHead>
                    <TableHead>{t('hr.salaries.columns.netSalary')}</TableHead>
                    <TableHead>{t('hr.salaries.columns.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.length ? (
                    data.data.map((salary: any) => {
                      const status = salaryStatuses.find(
                        (s) => s.value === salary.status
                      )
                      return (
                        <TableRow key={salary._id}>
                          <TableCell>
                            {salary.employee?.fullName ||
                              `${salary.employee?.firstName} ${salary.employee?.lastName}`}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(salary.basicSalary)}
                          </TableCell>
                          <TableCell className='text-green-600'>
                            +{formatCurrency(salary.totalAllowances)}
                          </TableCell>
                          <TableCell className='text-red-600'>
                            -{formatCurrency(salary.totalDeductions)}
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {formatCurrency(salary.netSalary)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(status?.color)}
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
                        {t('hr.salaries.noSalaries')}
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
