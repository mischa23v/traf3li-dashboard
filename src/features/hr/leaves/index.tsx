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
import { Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useLeaveRequests, useLeaveStats } from '@/hooks/useLeaves'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { leaveTypes, leaveStatuses, leaveStatusColors, leaveTypeColors } from './data/data'
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

const route = getRouteApi('/_authenticated/dashboard/hr/leaves/')

export function Leaves() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const search = route.useSearch()

  const { data, isLoading } = useLeaveRequests({
    status: search.status?.[0],
    leaveType: search.leaveType?.[0],
  })

  const { data: stats } = useLeaveStats()

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: isArabic ? ar : enUS,
    })
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
              {t('hr.leaves.title')}
            </h2>
            <p className='text-muted-foreground'>{t('hr.leaves.description')}</p>
          </div>
          <Button>
            <Plus className='me-2 h-4 w-4' />
            {t('hr.leaves.requestLeave')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.leaves.stats.pending')}
              </CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.byStatus?.find((s: any) => s._id === 'pending')?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.leaves.stats.approved')}
              </CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.byStatus?.find((s: any) => s._id === 'approved')?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.leaves.stats.rejected')}
              </CardTitle>
              <XCircle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.byStatus?.find((s: any) => s._id === 'rejected')?.count || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.leaves.stats.onLeaveToday')}
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.onLeaveToday?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        {isLoading ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.leaves.recentRequests')}</CardTitle>
              <CardDescription>
                {t('hr.leaves.recentRequestsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hr.leaves.columns.employee')}</TableHead>
                    <TableHead>{t('hr.leaves.columns.leaveType')}</TableHead>
                    <TableHead>{t('hr.leaves.columns.startDate')}</TableHead>
                    <TableHead>{t('hr.leaves.columns.endDate')}</TableHead>
                    <TableHead>{t('hr.leaves.columns.days')}</TableHead>
                    <TableHead>{t('hr.leaves.columns.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.length ? (
                    data.data.map((leave: any) => {
                      const leaveType = leaveTypes.find(
                        (t) => t.value === leave.leaveType
                      )
                      const status = leaveStatuses.find(
                        (s) => s.value === leave.status
                      )
                      return (
                        <TableRow key={leave._id}>
                          <TableCell>
                            {leave.employee?.fullName ||
                              `${leave.employee?.firstName} ${leave.employee?.lastName}`}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(
                                leaveTypeColors.get(leave.leaveType)
                              )}
                            >
                              {isArabic ? leaveType?.label : leaveType?.labelEn}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(leave.startDate)}</TableCell>
                          <TableCell>{formatDate(leave.endDate)}</TableCell>
                          <TableCell>{leave.totalDays}</TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(
                                leaveStatusColors.get(leave.status)
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
                        {t('hr.leaves.noLeaves')}
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
