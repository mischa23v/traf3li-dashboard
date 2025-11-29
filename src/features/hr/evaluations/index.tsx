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
import { Progress } from '@/components/ui/progress'
import { Plus, ClipboardCheck, Star, Clock, Target } from 'lucide-react'
import { useEvaluations, useEvaluationStats } from '@/hooks/useEvaluations'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  evaluationTypes,
  evaluationStatuses,
  performanceLevels,
  evaluationStatusColors,
  performanceLevelColors,
} from './data/data'
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

const route = getRouteApi('/_authenticated/dashboard/hr/evaluations/')

export function Evaluations() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { data, isLoading } = useEvaluations()
  const { data: stats } = useEvaluationStats()

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
              {t('hr.evaluations.title')}
            </h2>
            <p className='text-muted-foreground'>
              {t('hr.evaluations.description')}
            </p>
          </div>
          <Button>
            <Plus className='me-2 h-4 w-4' />
            {t('hr.evaluations.createEvaluation')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.evaluations.stats.total')}
              </CardTitle>
              <ClipboardCheck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.evaluations.stats.pending')}
              </CardTitle>
              <Clock className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-500'>
                {stats?.pending?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.evaluations.stats.avgScore')}
              </CardTitle>
              <Star className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {stats?.avgScore ? `${stats.avgScore.toFixed(1)}%` : '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('hr.evaluations.stats.completed')}
              </CardTitle>
              <Target className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-500'>
                {stats?.byStatus?.find((s: any) => s._id === 'completed')
                  ?.count || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluations Table */}
        {isLoading ? (
          <Skeleton className='h-96 w-full' />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('hr.evaluations.recentEvaluations')}</CardTitle>
              <CardDescription>
                {t('hr.evaluations.recentEvaluationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hr.evaluations.columns.employee')}</TableHead>
                    <TableHead>{t('hr.evaluations.columns.type')}</TableHead>
                    <TableHead>{t('hr.evaluations.columns.period')}</TableHead>
                    <TableHead>{t('hr.evaluations.columns.score')}</TableHead>
                    <TableHead>
                      {t('hr.evaluations.columns.performance')}
                    </TableHead>
                    <TableHead>{t('hr.evaluations.columns.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.length ? (
                    data.data.map((evaluation: any) => {
                      const evalType = evaluationTypes.find(
                        (t) => t.value === evaluation.evaluationType
                      )
                      const status = evaluationStatuses.find(
                        (s) => s.value === evaluation.status
                      )
                      const perfLevel = performanceLevels.find(
                        (p) => p.value === evaluation.performanceLevel
                      )

                      return (
                        <TableRow key={evaluation._id}>
                          <TableCell>
                            {evaluation.employee?.fullName ||
                              `${evaluation.employee?.firstName} ${evaluation.employee?.lastName}`}
                          </TableCell>
                          <TableCell>
                            {isArabic ? evalType?.label : evalType?.labelEn}
                          </TableCell>
                          <TableCell>
                            {formatDate(evaluation.periodStart)} -{' '}
                            {formatDate(evaluation.periodEnd)}
                          </TableCell>
                          <TableCell>
                            {evaluation.overallScore ? (
                              <div className='flex items-center gap-2'>
                                <Progress
                                  value={evaluation.overallScore}
                                  className='h-2 w-20'
                                />
                                <span className='text-sm'>
                                  {evaluation.overallScore.toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {perfLevel ? (
                              <Badge
                                className={cn(
                                  'text-white',
                                  performanceLevelColors.get(
                                    evaluation.performanceLevel
                                  )
                                )}
                              >
                                {isArabic ? perfLevel.label : perfLevel.labelEn}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className={cn(
                                evaluationStatusColors.get(evaluation.status)
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
                        {t('hr.evaluations.noEvaluations')}
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
