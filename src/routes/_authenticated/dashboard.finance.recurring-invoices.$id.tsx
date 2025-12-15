import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FinanceSidebar } from '@/features/finance/components/finance-sidebar'
import RecurringInvoiceDetails from '@/features/finance/components/recurring-invoice-details'

function RecurringInvoiceDetailsPage() {
  const { id } = Route.useParams()

  return (
    <div className="min-h-screen flex bg-background" dir="rtl">
      <FinanceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <TopNav>
            <div className="flex items-center gap-3 flex-1">
              <DynamicIsland />
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </TopNav>
        </Header>

        <Main>
          <RecurringInvoiceDetails invoiceId={id} />
        </Main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/finance/recurring-invoices/$id')({
  component: RecurringInvoiceDetailsPage,
})
