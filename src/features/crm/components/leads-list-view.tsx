import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MoreHorizontal,
  Plus,
  Users,
  TrendingUp,
  Phone,
  Mail,
  ChevronLeft,
  Search,
  Bell,
  AlertCircle,
  UserPlus,
  Filter,
  ArrowUpRight,
  Building2,
  User,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeads, useDeleteLead, useConvertLead } from '@/hooks/useCrm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Lead, LeadStatus } from '@/types/crm'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Status labels are now handled via i18n in the component

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-purple-100 text-purple-700',
  qualified: 'bg-emerald-100 text-emerald-700',
  proposal: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  dormant: 'bg-gray-100 text-gray-700',
}

export function LeadsListView() {
  const { t } = useTranslation()
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (activeStatusTab !== 'all') {
      f.status = activeStatusTab
    }
    return f
  }, [activeStatusTab])

  // Fetch leads
  const { data: leadsData, isLoading, isError, error, refetch } = useLeads(filters)
  const { mutate: deleteLead } = useDeleteLead()
  const { mutate: convertLead } = useConvertLead()

  // Transform API data
  const leads = useMemo(() => {
    if (!leadsData?.data) return []
    return leadsData.data
  }, [leadsData])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedLeadIds([])
  }

  const handleSelectLead = (leadId: string) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter((id) => id !== leadId))
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedLeadIds.length === 0) return

    if (confirm(`هل أنت متأكد من حذف ${selectedLeadIds.length} عميل محتمل؟`)) {
      selectedLeadIds.forEach((id) => {
        deleteLead(id)
      })
      setIsSelectionMode(false)
      setSelectedLeadIds([])
    }
  }

  const topNav = [
    { title: t('sidebar.nav.leads'), href: '/dashboard/crm/leads', isActive: true },
    { title: t('sidebar.nav.pipeline'), href: '/dashboard/crm/pipeline', isActive: false },
    { title: t('sidebar.nav.referrals'), href: '/dashboard/crm/referrals', isActive: false },
    { title: t('sidebar.nav.activities'), href: '/dashboard/crm/activities', isActive: false },
  ]

  const statusTabs = [
    { id: 'all', label: t('common.all') },
    { id: 'new', label: t('leads.status.new') },
    { id: 'contacted', label: t('leads.status.contacted') },
    { id: 'qualified', label: t('leads.status.qualified') },
    { id: 'won', label: t('leads.status.won') },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero badge={t('leads.management')} title={t('leads.title')} type="leads" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* LEADS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">{t('sidebar.nav.leads')}</h3>
                <div className="flex gap-2 flex-wrap">
                  {statusTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      size="sm"
                      onClick={() => setActiveStatusTab(tab.id)}
                      className={
                        activeStatusTab === tab.id
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4'
                      }
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100"
                      >
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </>
                )}

                {/* Error State */}
                {isError && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {t('leads.loadError')}
                    </h3>
                    <p className="text-slate-500 mb-4">
                      {error?.message || t('common.serverError')}
                    </p>
                    <Button
                      onClick={() => refetch()}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {t('common.retry')}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && leads.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Users className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {t('leads.noLeads')}
                    </h3>
                    <p className="text-slate-500 mb-4">{t('leads.startAddingLead')}</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/crm/leads/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('leads.newLead')}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Leads List */}
                {!isLoading &&
                  !isError &&
                  leads.map((lead: Lead) => (
                    <div
                      key={lead._id}
                      className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedLeadIds.includes(lead._id)
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-100 hover:border-emerald-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          {isSelectionMode && (
                            <Checkbox
                              checked={selectedLeadIds.includes(lead._id)}
                              onCheckedChange={() => handleSelectLead(lead._id)}
                              className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          )}
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                            <Users className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-navy text-lg">
                                {lead.displayName}
                              </h4>
                              <Badge
                                className={`${statusColors[lead.status]} border-0 rounded-md px-2`}
                              >
                                {t(`leads.status.${lead.status}`)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm">
                              {lead.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" aria-hidden="true" />
                                  {lead.phone}
                                </span>
                              )}
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" aria-hidden="true" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.organizationId && typeof lead.organizationId === 'object' && (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <Building2 className="h-3 w-3" aria-hidden="true" />
                                  {lead.organizationId.legalName}
                                </span>
                              )}
                              {lead.contactId && typeof lead.contactId === 'object' && (
                                <span className="flex items-center gap-1 text-blue-600">
                                  <User className="h-3 w-3" aria-hidden="true" />
                                  {lead.contactId.firstName} {lead.contactId.lastName || ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 hover:text-navy"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/crm/leads/${lead._id}`}>
                                {t('common.viewDetails')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => convertLead(lead._id)}
                              disabled={lead.convertedToClient}
                            >
                              <ArrowUpRight className="h-4 w-4 ms-2" />
                              {t('leads.convertToClient')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteLead(lead._id)}
                              className="text-red-600"
                            >
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                        <div className="flex items-center gap-6">
                          {lead.estimatedValue > 0 && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">
                                {t('leads.estimatedValue')}
                              </div>
                              <div className="font-bold text-emerald-600">
                                {lead.estimatedValue.toLocaleString('ar-SA')} {t('common.sar')}
                              </div>
                            </div>
                          )}
                          {lead.intake?.caseType && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">
                                {t('leads.caseType')}
                              </div>
                              <div className="font-bold text-navy">
                                {lead.intake.caseType}
                              </div>
                            </div>
                          )}
                          {lead.source?.type && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">{t('leads.source')}</div>
                              <div className="font-bold text-navy">
                                {lead.source.type}
                              </div>
                            </div>
                          )}
                        </div>
                        <Link to={`/dashboard/crm/leads/${lead._id}`}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                            {t('common.viewDetails')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button
                  variant="ghost"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6"
                >
                  {t('leads.viewAllLeads')}
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <SalesSidebar context="leads" />
        </div>
      </Main>
    </>
  )
}
