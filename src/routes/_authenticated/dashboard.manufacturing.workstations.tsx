import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Factory } from 'lucide-react'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
  { title: 'Workstations', href: '/dashboard/manufacturing/workstations' },
]

function WorkstationsView() {
  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge="Manufacturing"
          title="Workstations"
          type="manufacturing"
        />

        <Card className="rounded-3xl">
          <CardContent className="p-12 text-center">
            <Factory className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Workstations - Coming Soon
            </h3>
            <p className="text-muted-foreground">
              This feature is under development and will be available soon.
            </p>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/manufacturing/workstations')({
  component: WorkstationsView,
})
