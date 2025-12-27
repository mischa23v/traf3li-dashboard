/**
 * CRM General Settings View
 * Placeholder for CRM general configuration settings
 */

import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.general', href: '/dashboard/crm/settings' },
]

export function GeneralSettingsView() {
  const { t } = useTranslation()

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <ProductivityHero
          badge={t('crm.badge', 'إدارة العملاء')}
          title={t('crm.settings.general', 'General Settings')}
          type="crm"
          hideButtons
        />

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t('crm.settings.general', 'General Settings')}</CardTitle>
            <CardDescription>
              {t('crm.settings.generalDescription', 'Configure general CRM settings')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('common.comingSoon', 'Coming Soon')}</p>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
