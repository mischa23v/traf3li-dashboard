import { useSearch } from '@tanstack/react-router'
import { useFollowups, useFollowupStats } from '@/hooks/useFollowups'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { FollowupsProvider } from './components/followups-provider'
import { FollowupsTable } from './components/followups-table'
import { FollowupsPrimaryButtons } from './components/followups-primary-buttons'
import { FollowupsDialogs } from './components/followups-dialogs'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react'

export default function Followups() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/dashboard/followups/' })
  const page = search.page || 1
  const pageSize = search.pageSize || 10

  const { data, isLoading } = useFollowups({
    page,
    limit: pageSize,
    status: search.status,
    priority: search.priority,
    type: search.type,
  })

  const { data: stats } = useFollowupStats()

  return (
    <FollowupsProvider>
      <Header>
        <div className='ms-auto flex items-center space-s-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('followups.pageTitle')}
            </h2>
            <p className='text-muted-foreground'>{t('followups.pageDescription')}</p>
          </div>
          <FollowupsPrimaryButtons />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid gap-4 md:grid-cols-4 mb-6'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-amber-100 dark:bg-amber-900 rounded-lg'>
                    <Clock className='h-5 w-5 text-amber-600' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('followups.pending')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('followups.completed')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-red-100 dark:bg-red-900 rounded-lg'>
                    <AlertTriangle className='h-5 w-5 text-red-600' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('followups.overdue')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                    <Calendar className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {t('followups.dueToday')}
                    </p>
                    <p className='text-2xl font-bold'>{stats.dueToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <FollowupsTable
            data={data?.data || []}
            totalCount={data?.total || 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <FollowupsDialogs />
    </FollowupsProvider>
  )
}
