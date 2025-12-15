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
import RecurringInvoiceForm from '@/features/finance/components/recurring-invoice-form'

function NewRecurringInvoice() {
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
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">فاتورة متكررة جديدة</h1>
              <p className="text-muted-foreground mt-1">
                إنشاء فاتورة متكررة للأتمتة التلقائية
              </p>
            </div>

            <RecurringInvoiceForm />
          </div>
        </Main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/finance/recurring-invoices/new')({
  component: NewRecurringInvoice,
})
