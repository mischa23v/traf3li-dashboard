import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  Clock,
  XCircle,
  TrendingUp,
  UserCheck,
  Timer,
} from 'lucide-react'
import { CampaignEfficiencyReport } from '@/features/crm/components/reports/campaign-efficiency-report'
import { LeadOwnerEfficiencyReport } from '@/features/crm/components/reports/lead-owner-efficiency-report'
import { FirstResponseTimeReport } from '@/features/crm/components/reports/first-response-time-report'
import { LostOpportunityReport } from '@/features/crm/components/reports/lost-opportunity-report'
import { SalesPipelineAnalyticsReport } from '@/features/crm/components/reports/sales-pipeline-analytics-report'
import { ProspectsEngagedReport } from '@/features/crm/components/reports/prospects-engaged-report'
import { LeadConversionTimeReport } from '@/features/crm/components/reports/lead-conversion-time-report'

function CRMReportsPage() {
  const { t } = useTranslation()

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='p-6 lg:p-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('crm.reports.title', 'CRM Reports')}
          </h1>
          <p className='text-muted-foreground'>
            {t('crm.reports.description', 'Comprehensive CRM analytics and reporting')}
          </p>
        </div>

        <Tabs defaultValue='campaign' className='w-full'>
          <TabsList className='grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-1 mb-6'>
            <TabsTrigger value='campaign' className='flex flex-col items-center gap-1 py-2'>
              <BarChart3 className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.campaign', 'Campaign')}</span>
            </TabsTrigger>
            <TabsTrigger value='lead-owner' className='flex flex-col items-center gap-1 py-2'>
              <Users className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.leadOwner', 'Lead Owner')}</span>
            </TabsTrigger>
            <TabsTrigger value='response-time' className='flex flex-col items-center gap-1 py-2'>
              <Clock className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.responseTime', 'Response')}</span>
            </TabsTrigger>
            <TabsTrigger value='lost' className='flex flex-col items-center gap-1 py-2'>
              <XCircle className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.lost', 'Lost')}</span>
            </TabsTrigger>
            <TabsTrigger value='pipeline' className='flex flex-col items-center gap-1 py-2'>
              <TrendingUp className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.pipeline', 'Pipeline')}</span>
            </TabsTrigger>
            <TabsTrigger value='prospects' className='flex flex-col items-center gap-1 py-2'>
              <UserCheck className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.prospects', 'Prospects')}</span>
            </TabsTrigger>
            <TabsTrigger value='conversion' className='flex flex-col items-center gap-1 py-2'>
              <Timer className='h-4 w-4' />
              <span className='text-xs'>{t('crm.reports.tabs.conversion', 'Conversion')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='campaign'>
            <CampaignEfficiencyReport />
          </TabsContent>

          <TabsContent value='lead-owner'>
            <LeadOwnerEfficiencyReport />
          </TabsContent>

          <TabsContent value='response-time'>
            <FirstResponseTimeReport />
          </TabsContent>

          <TabsContent value='lost'>
            <LostOpportunityReport />
          </TabsContent>

          <TabsContent value='pipeline'>
            <SalesPipelineAnalyticsReport />
          </TabsContent>

          <TabsContent value='prospects'>
            <ProspectsEngagedReport />
          </TabsContent>

          <TabsContent value='conversion'>
            <LeadConversionTimeReport />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/crm/crm-reports')({
  component: CRMReportsPage,
})
