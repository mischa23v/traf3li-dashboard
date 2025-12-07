import { useState } from 'react'
import { Plus, DollarSign, Layers, Search, Bell, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { Badge } from '@/components/ui/badge'
import { useBillingRates, useRateGroups } from '@/hooks/useBillingRates'
import { RatesProvider, useRatesContext } from './components/rates-provider'
import { RatesTable } from './components/rates-table'
import { GroupsTable } from './components/groups-table'
import { RateActionDialog } from './components/rate-action-dialog'
import { GroupActionDialog } from './components/group-action-dialog'
import { RateDeleteDialog } from './components/rate-delete-dialog'
import { GroupDeleteDialog } from './components/group-delete-dialog'
import { RateViewDialog } from './components/rate-view-dialog'
import { GroupViewDialog } from './components/group-view-dialog'
import { useTranslation } from 'react-i18next'
import { SettingsSidebar } from '../settings/components/settings-sidebar'

function BillingRatesContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('rates')
  const {
    open,
    setOpen,
    currentRate,
    setCurrentRate,
    currentGroup,
    setCurrentGroup,
  } = useRatesContext()

  const { data: ratesData, isLoading: ratesLoading } = useBillingRates()
  const { data: groupsData, isLoading: groupsLoading } = useRateGroups()

  const rates = ratesData?.rates || []
  const groups = groupsData?.groups || []

  const handleAddRate = () => {
    setCurrentRate(null)
    setOpen('add-rate')
  }

  const handleAddGroup = () => {
    setCurrentGroup(null)
    setOpen('add-group')
  }

  const handleCloseDialog = () => {
    setOpen(null)
    setCurrentRate(null)
    setCurrentGroup(null)
  }

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.settings', 'الإعدادات'), href: '/dashboard/settings', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Scale className="w-3 h-3 ms-2" />
                  {t('settings.title', 'الإعدادات')}
                </Badge>
                <span className="text-slate-500 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {t('billingRates.title', 'أسعار الفوترة')}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {t('billingRates.description', 'إدارة أسعار الخدمات القانونية ومجموعات الأسعار')}
              </p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'rates' ? (
                <Button
                  onClick={handleAddRate}
                  className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base"
                >
                  <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                  {t('billingRates.addRate', 'إضافة سعر')}
                </Button>
              ) : (
                <Button
                  onClick={handleAddGroup}
                  className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base"
                >
                  <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                  {t('billingRates.addGroup', 'إضافة مجموعة')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
                <TabsTrigger
                  value="rates"
                  className="rounded-xl px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
                >
                  <DollarSign className="h-4 w-4 ms-2" />
                  {t('billingRates.rates', 'الأسعار')}
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="rounded-xl px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white transition-all"
                >
                  <Layers className="h-4 w-4 ms-2" />
                  {t('billingRates.groups', 'المجموعات')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rates" className="space-y-4">
                {ratesLoading ? (
                  <div className="flex h-[400px] items-center justify-center bg-white rounded-2xl border border-slate-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <RatesTable data={rates} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="groups" className="space-y-4">
                {groupsLoading ? (
                  <div className="flex h-[400px] items-center justify-center bg-white rounded-2xl border border-slate-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <GroupsTable data={groups} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <SettingsSidebar context="billing-rates" />
        </div>
      </Main>

      {/* Rate Dialogs */}
      <RateActionDialog
        open={open === 'add-rate' || open === 'edit-rate'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentRate={currentRate}
      />

      <RateViewDialog
        open={open === 'view-rate'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentRate={currentRate}
      />

      <RateDeleteDialog
        open={open === 'delete-rate'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentRate={currentRate}
      />

      {/* Group Dialogs */}
      <GroupActionDialog
        open={open === 'add-group' || open === 'edit-group'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentGroup={currentGroup}
      />

      <GroupViewDialog
        open={open === 'view-group'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentGroup={currentGroup}
      />

      <GroupDeleteDialog
        open={open === 'delete-group'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentGroup={currentGroup}
      />
    </>
  )
}

export default function BillingRates() {
  return (
    <RatesProvider>
      <BillingRatesContent />
    </RatesProvider>
  )
}
