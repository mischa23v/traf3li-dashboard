import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Package } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Card, CardContent } from '@/components/ui/card'
import { SubcontractingSidebar } from '@/features/subcontracting/components'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'subcontracting.subcontracting', href: '/dashboard/subcontracting' },
  { title: 'subcontracting.receipts', href: '/dashboard/subcontracting/receipts' },
]

function SubcontractingReceiptsView() {
  const { t } = useTranslation()

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge={t('subcontracting.badge', 'التصنيع الخارجي')}
          title={t('subcontracting.receipts', 'إيصالات الاستلام')}
          type="subcontracting"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                    <Package className="w-8 h-8 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-navy">
                    {t('subcontracting.receiptsPlaceholder', 'إيصالات الاستلام')}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {t('subcontracting.receiptsDescription', 'سيتم عرض قائمة بإيصالات استلام البضائع المصنعة خارجياً هنا.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <SubcontractingSidebar />
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/subcontracting/receipts')({
  component: SubcontractingReceiptsView,
})
