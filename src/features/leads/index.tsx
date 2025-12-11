import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Plus, Users, Search as SearchIcon, Bell, Phone, Mail,
  MoreHorizontal, Eye, Trash2, Filter, ChevronLeft,
  TrendingUp, ArrowUpRight, Building2, User,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductivityHero } from '@/components/productivity-hero'
import { useLeads, useDeleteLead, useConvertLead } from '@/hooks/useCrm'
import { leadStatusColors, leadStatuses } from './data/data'
import { cn } from '@/lib/utils'

export function Leads() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const { data, isLoading, isError, error, refetch } = useLeads({
    status: selectedStatus || undefined,
    search: searchQuery || undefined,
  })

  const { mutate: deleteLead } = useDeleteLead()
  const { mutate: convertLead } = useConvertLead()

  const leads = data?.data || []

  const topNav = [
    { title: t('sidebar.nav.leads'), href: '/dashboard/crm/leads', isActive: true },
    { title: t('sidebar.nav.pipeline'), href: '/dashboard/crm/pipeline', isActive: false },
    { title: t('sidebar.nav.referrals'), href: '/dashboard/crm/referrals', isActive: false },
    { title: t('sidebar.nav.activities'), href: '/dashboard/crm/activities', isActive: false },
  ]

  const isEmpty = !isLoading && leads.length === 0 && !searchQuery && !selectedStatus

  const handleCardClick = (leadId: string) => {
    navigate({ to: `/dashboard/crm/leads/${leadId}` })
  }

  const getStatusStripColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'contacted': return 'bg-purple-500'
      case 'qualified': return 'bg-emerald-500'
      case 'proposal': return 'bg-orange-500'
      case 'negotiation': return 'bg-yellow-500'
      case 'won': return 'bg-green-500'
      case 'lost': return 'bg-red-500'
      default: return 'bg-slate-400'
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <SearchIcon className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder={t('common.search')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero badge={t('leads.management')} title={t('leads.title')} type="leads">
          <Link to="/dashboard/crm/leads/new">
            <Button className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl px-6 shadow-lg">
              <Plus className="me-2 h-5 w-5" />
              {t('leads.newLead')}
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[220px]">
                  <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t('leads.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-11 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-xl gap-2 min-w-[160px] border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <span className="truncate">
                        {selectedStatus
                          ? leadStatuses.find(s => s.value === selectedStatus)?.[isArabic ? 'label' : 'labelEn']
                          : t('leads.columns.status')
                        }
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuItem onClick={() => setSelectedStatus(null)} className="rounded-lg">
                      {t('common.all')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {leadStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => setSelectedStatus(status.value)}
                        className={cn("rounded-lg", selectedStatus === status.value && 'bg-emerald-50')}
                      >
                        {isArabic ? status.label : status.labelEn}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-[2rem]" />
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('leads.loadError')}</h3>
                <p className="text-slate-500 mb-6">{error?.message || t('common.serverError')}</p>
                <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                  {t('common.retry')}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {isEmpty && (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('leads.noLeads')}</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">{t('leads.startAddingLead')}</p>
                <Link to="/dashboard/crm/leads/new">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Plus className="me-2 h-5 w-5" />
                    {t('leads.newLead')}
                  </Button>
                </Link>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !isError && !isEmpty && leads.length === 0 && (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('leads.noResults')}</h3>
                <p className="text-slate-500">{t('leads.tryDifferentSearch')}</p>
              </div>
            )}

            {/* Lead Cards */}
            {!isLoading && !isError && leads.length > 0 && (
              <div className="space-y-4">
                {leads.map((lead: any, index: number) => {
                  const status = lead.status || 'new'
                  const statusColor = leadStatusColors.get(status) || leadStatusColors.get('new')
                  const statusStripColor = getStatusStripColor(status)

                  return (
                    <div
                      key={lead._id}
                      onClick={() => handleCardClick(lead._id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className={cn(
                        "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden",
                        "hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer",
                        "animate-in fade-in slide-in-from-bottom-4",
                        "group relative"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0 bottom-0 w-1.5 rounded-s-[2rem]",
                        isArabic ? "right-0" : "left-0",
                        statusStripColor
                      )} />

                      <div className={cn("p-5", isArabic ? "pe-7" : "ps-7")}>
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-slate-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-lg truncate mb-1 group-hover:text-emerald-600 transition-colors">
                                  {lead.displayName || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || '-'}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                  {lead.source?.type && (
                                    <span>{t(`leads.sources.${lead.source.type}`)}</span>
                                  )}
                                  <Badge variant="outline" className={cn('capitalize text-xs', statusColor)}>
                                    {t(`leads.status.${status}`)}
                                  </Badge>
                                </div>
                              </div>

                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                  <DropdownMenuItem
                                    className="rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/crm/leads/${lead._id}` })
                                    }}
                                  >
                                    <Eye className="me-2 h-4 w-4" />
                                    {t('common.view')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="rounded-lg"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      convertLead(lead._id)
                                    }}
                                    disabled={lead.convertedToClient}
                                  >
                                    <ArrowUpRight className="me-2 h-4 w-4" />
                                    {t('leads.convertToClient')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="rounded-lg text-destructive focus:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(t('leads.confirmDelete'))) {
                                        deleteLead(lead._id)
                                      }
                                    }}
                                  >
                                    <Trash2 className="me-2 h-4 w-4" />
                                    {t('common.delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100">
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  <span dir="ltr">{lead.phone}</span>
                                </div>
                              )}
                              {lead.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Mail className="h-4 w-4 text-slate-400" />
                                  <span className="truncate max-w-[200px]" dir="ltr">{lead.email}</span>
                                </div>
                              )}
                              {lead.organizationId && typeof lead.organizationId === 'object' && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600">
                                  <Building2 className="h-4 w-4" />
                                  <span>{lead.organizationId.legalName}</span>
                                </div>
                              )}
                              {lead.contactId && typeof lead.contactId === 'object' && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                  <User className="h-4 w-4" />
                                  <span>{lead.contactId.firstName} {lead.contactId.lastName || ''}</span>
                                </div>
                              )}

                              <div className="ms-auto flex items-center gap-2">
                                {lead.estimatedValue > 0 && (
                                  <span className="text-sm font-bold text-emerald-600">
                                    {lead.estimatedValue.toLocaleString()} {t('common.sar')}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hidden sm:flex h-9 px-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate({ to: `/dashboard/crm/leads/${lead._id}` })
                                  }}
                                >
                                  {t('common.viewDetails')}
                                </Button>
                                <ChevronLeft className={cn(
                                  "h-5 w-5 text-slate-300 sm:hidden",
                                  isArabic ? "rotate-180" : ""
                                )} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-lg text-white mb-4">{t('sidebar.quickActions.title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/dashboard/crm/leads/new">
                  <Button className="bg-white hover:bg-emerald-50 text-emerald-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl w-full">
                    <Plus className="h-7 w-7" />
                    <span className="text-sm font-bold">{t('sidebar.quickActions.create')}</span>
                  </Button>
                </Link>
                <Link to="/dashboard/crm/pipeline">
                  <Button className="bg-white hover:bg-slate-50 text-slate-900 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl w-full">
                    <TrendingUp className="h-7 w-7" />
                    <span className="text-sm font-bold">{t('sidebar.nav.pipeline')}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
