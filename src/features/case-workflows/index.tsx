import { useWorkflows, useWorkflowStatistics } from '@/hooks/useCaseWorkflows'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkflowsProvider } from './components/workflows-provider'
import { WorkflowsTable } from './components/workflows-table'
import { WorkflowsDialogs } from './components/workflows-dialogs'
import { WorkflowsPrimaryButtons } from './components/workflows-primary-buttons'
import { useTranslation } from 'react-i18next'
import { GitBranch, CheckCircle2, Layers, Activity } from 'lucide-react'

export default function CaseWorkflows() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useWorkflows()
  const { data: stats, isLoading: statsLoading } = useWorkflowStatistics()

  const workflows = data?.workflows || []

  return (
    <WorkflowsProvider>
      <Header>
        <div className="ms-auto flex items-center space-x-2 rtl:space-x-reverse">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('caseWorkflows.title')}</h1>
              <p className="text-muted-foreground">{t('caseWorkflows.subtitle')}</p>
            </div>
            <WorkflowsPrimaryButtons />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('caseWorkflows.totalWorkflows')}
              </CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total || workflows.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('caseWorkflows.activeWorkflows')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.active || workflows.filter((w) => w.isActive).length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('caseWorkflows.avgStages')}
              </CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.avgStagesPerWorkflow?.toFixed(1) ||
                    (workflows.length > 0
                      ? (
                          workflows.reduce((acc, w) => acc + (w.stages?.length || 0), 0) /
                          workflows.length
                        ).toFixed(1)
                      : '0')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('caseWorkflows.defaultWorkflows')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {workflows.filter((w) => w.isDefault).length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflows Table */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">{t('common.errorLoading')}</p>
            </CardContent>
          </Card>
        ) : (
          <WorkflowsTable data={workflows} />
        )}
      </Main>

      <WorkflowsDialogs />
    </WorkflowsProvider>
  )
}
