import { useState } from 'react'
import { Plus, DollarSign, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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

  return (
    <>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4 rtl:space-x-reverse">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('billingRates.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('billingRates.description')}
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'rates' ? (
              <Button onClick={handleAddRate}>
                <Plus className="me-2 h-4 w-4" />
                {t('billingRates.addRate')}
              </Button>
            ) : (
              <Button onClick={handleAddGroup}>
                <Plus className="me-2 h-4 w-4" />
                {t('billingRates.addGroup')}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('billingRates.rates')}
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              {t('billingRates.groups')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            {ratesLoading ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <RatesTable data={rates} />
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {groupsLoading ? (
              <div className="flex h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <GroupsTable data={groups} />
            )}
          </TabsContent>
        </Tabs>
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
