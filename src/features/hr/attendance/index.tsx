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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Users, UserCheck, UserX, Clock } from 'lucide-react'
import { useTodayAttendance } from '@/hooks/useAttendance'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { attendanceStatuses, attendanceStatusColors } from './data/data'
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

const route = getRouteApi('/_authenticated/dashboard/hr/attendance/')

export function Attendance() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data, isLoading } = useTodayAttendance()

  const formatTime = (time: string | undefined) => {
    if (!time) return '-'
    return format(new Date(time), 'hh:mm a', {
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
              {t('hr.attendance.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('hr.attendance.description')}
            </p>
          </div>
          <Button>
            <Plus className='me-2 h-4 w-4' />
            {t('hr.attendance.manualEntry')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-5'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.attendance.stats.total')}
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data?.summary?.totalEmployees || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.attendance.stats.present')}
              </CardTitle>
              <UserCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-500'>
                {data?.summary?.present || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.attendance.stats.late')}
              </CardTitle>
              <Clock className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-500'>
                {data?.summary?.late || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.attendance.stats.absent')}
              </CardTitle>
              <UserX className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-500'>
                {data?.summary?.absent || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.attendance.stats.onLeave')}
              </CardTitle>
              <Users className='h-4 w-4 text-purple-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-500'>
                {data?.summary?.onLeave || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance Table */}
        {isLoading ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.attendance.todayAttendance')}</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, dd MMMM yyyy', {
                  locale: isArabic ? ar : enUS,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hr.attendance.columns.employee')}</TableHead>
                    <TableHead>{t('hr.attendance.columns.checkIn')}</TableHead>
                    <TableHead>{t('hr.attendance.columns.checkOut')}</TableHead>
                    <TableHead>{t('hr.attendance.columns.workingHours')}</TableHead>
                    <TableHead>{t('hr.attendance.columns.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.attendance?.length ? (
                    data.attendance.map((record: any) => {
                      const status = attendanceStatuses.find(
                        (s) => s.value === record.status
                      )
                      const fullName =
                        record.employee?.fullName ||
                        `${record.employee?.firstName} ${record.employee?.lastName}`
                      const initials = `${record.employee?.firstName?.[0] || ''}${record.employee?.lastName?.[0] || ''}`.toUpperCase()

                      return (
                        <TableRow key={record._id}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage
                                  src={record.employee?.avatar}
                                  alt={fullName}
                                />
                                <AvatarFallback className='text-xs'>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell dir='ltr'>
                            {formatTime(record.checkInTime)}
                          </TableCell>
                          <TableCell dir='ltr'>
                            {formatTime(record.checkOutTime)}
                          </TableCell>
                          <TableCell>
                            {record.workingHours
                              ? `${record.workingHours.toFixed(1)} ${t('hr.attendance.hours')}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(
                                attendanceStatusColors.get(record.status)
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
                      <TableCell colSpan={5} className='h-24 text-center'>
                        {t('hr.attendance.noRecords')}
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
