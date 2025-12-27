import { useState } from 'react'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientsDialogs } from './components/clients-dialogs'
import { ClientsPrimaryButtons } from './components/clients-primary-buttons'
import { ClientsProvider, useClientsContext } from './components/clients-provider'
import { useClients } from '@/hooks/useClients'
import { useTranslation } from 'react-i18next'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ROUTES } from '@/constants/routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Users,
  Search as SearchIcon,
  Bell,
  Phone,
  Mail,
  Building2,
  MapPin,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductivityHero } from '@/components/productivity-hero'
import { clientStatusColors, clientStatuses, contactMethods } from './data/data'
import { type Client } from './data/schema'
import { cn } from '@/lib/utils'

const route = getRouteApi('/_authenticated/dashboard/clients/')

// Helper to get display name for a client
const getClientDisplayName = (client: Client): string => {
  if (client.clientType === 'individual' || !client.clientType) {
    return client.fullNameArabic || client.fullNameEnglish ||
           [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
  }
  return client.companyName || client.companyNameEnglish || '-'
}

// Helper to get initials
const getClientInitials = (client: Client): string => {
  const name = getClientDisplayName(client)
  if (name === '-') return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Status strip colors for the left edge
const getStatusStripColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500'
    case 'inactive': return 'bg-slate-400'
    case 'archived': return 'bg-amber-500'
    case 'pending': return 'bg-blue-500'
    default: return 'bg-emerald-500'
  }
}

export function Clients() {
  return (
    <ClientsProvider>
      <ClientsContent />
      <ClientsDialogs />
    </ClientsProvider>
  )
}

function ClientsContent() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const routerNavigate = useNavigate()
  const { setOpen, setCurrentRow } = useClientsContext()

  // Local state
  const [searchQuery, setSearchQuery] = useState(search.fullName || '')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(search.status?.[0] || null)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Fetch clients data from API
  const { data, isLoading } = useClients({
    page: search.page,
    limit: search.pageSize || 12,
    status: selectedStatus || undefined,
    search: searchQuery || undefined,
  })

  const clients = data?.data || []
  const pagination = data?.pagination

  const topNav = [
    { title: t('sidebar.nav.clients'), href: ROUTES.dashboard.clients.list, isActive: true },
    { title: t('sidebar.nav.organizations'), href: ROUTES.dashboard.organizations.list, isActive: false },
    { title: t('sidebar.nav.cases'), href: ROUTES.dashboard.cases.list, isActive: false },
  ]

  const isEmpty = !isLoading && clients.length === 0 && !searchQuery && !selectedStatus

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    navigate({
      search: (prev) => ({
        ...prev,
        fullName: value || undefined,
        page: undefined,
      }),
    })
  }

  // Handle status filter
  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status)
    navigate({
      search: (prev) => ({
        ...prev,
        status: status ? [status] : undefined,
        page: undefined,
      }),
    })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage > 1 ? newPage : undefined,
      }),
    })
  }

  // Handle client selection
  const toggleClientSelection = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (isSelectionMode) {
      setSelectedClients(new Set())
    }
  }

  // Handle card click - navigate to details
  const handleCardClick = (clientId: string) => {
    if (!isSelectionMode) {
      routerNavigate({ to: ROUTES.dashboard.clients.detail(clientId) })
    }
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
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

      {/* Main Content */}
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Hero Card - Always visible */}
        <ProductivityHero badge={t('clients.management')} title={t('clients.title')} type="clients" hideButtons={true}>
          <ClientsPrimaryButtons />
        </ProductivityHero>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Bar - Flexbox Wrap Architecture */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[220px]">
                  <SearchIcon className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t('clients.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="ps-11 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl gap-2 min-w-[160px] border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all"
                    >
                      <Filter className="h-4 w-4 text-slate-500" />
                      <span className="truncate">
                        {selectedStatus
                          ? clientStatuses.find(s => s.value === selectedStatus)?.[isArabic ? 'label' : 'labelEn']
                          : t('clients.columns.status')
                        }
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl">
                    <DropdownMenuItem onClick={() => handleStatusFilter(null)} className="rounded-lg">
                      {t('common.all')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {clientStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => handleStatusFilter(status.value)}
                        className={cn("rounded-lg", selectedStatus === status.value && 'bg-emerald-50')}
                      >
                        <status.icon className="h-4 w-4 me-2" />
                        {isArabic ? status.label : status.labelEn}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Client Type Filter (Optional - for future) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl gap-2 min-w-[140px] border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all"
                    >
                      <User className="h-4 w-4 text-slate-500" />
                      <span>{t('clients.columns.type')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem className="rounded-lg">{t('common.all')}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg">
                      <User className="h-4 w-4 me-2" />
                      {t('clients.types.individual')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Building2 className="h-4 w-4 me-2" />
                      {t('clients.types.company')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Client Cards - Clean Slate Variant */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-[2rem]" />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('clients.noClients')}</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">{t('clients.startAddingClient')}</p>
                <Link to={ROUTES.dashboard.clients.new}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5">
                    <Plus className="me-2 h-5 w-5" aria-hidden="true" />
                    {t('clients.addNewClient')}
                  </Button>
                </Link>
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-10 w-10 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('clients.noResults')}</h3>
                <p className="text-slate-500">{t('clients.tryDifferentSearch')}</p>
              </div>
            ) : (
              <>
                {/* Cards List - Floating Islands */}
                <div className="space-y-4">
                  {clients.map((client: Client, index: number) => {
                    const displayName = getClientDisplayName(client)
                    const initials = getClientInitials(client)
                    const status = client.status || 'active'
                    const statusColor = clientStatusColors.get(status as any) || clientStatusColors.get('active')
                    const statusStripColor = getStatusStripColor(status)
                    const preferredMethod = client.preferredContactMethod || client.preferredContact || 'phone'
                    const contactMethod = contactMethods.find(m => m.value === preferredMethod)
                    const ContactIcon = contactMethod?.icon || Phone
                    const isSelected = selectedClients.has(client._id)

                    return (
                      <div
                        key={client._id}
                        onClick={() => handleCardClick(client._id)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={cn(
                          // Base styles
                          "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden",
                          // Hover: Lift & Glow effect
                          "hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer",
                          // Animation
                          "animate-in fade-in slide-in-from-bottom-4",
                          // Selection state
                          isSelected && "ring-2 ring-emerald-500 border-emerald-500",
                          // Group for child hover states
                          "group relative"
                        )}
                      >
                        {/* Status Strip - Vertical Color Bar */}
                        <div className={cn(
                          "absolute top-0 bottom-0 w-1.5 rounded-s-[2rem]",
                          isArabic ? "right-0" : "left-0",
                          statusStripColor
                        )} />

                        <div className={cn("p-5", isArabic ? "pe-7" : "ps-7")}>
                          <div className="flex items-start gap-4">
                            {/* Selection Checkbox */}
                            {isSelectionMode && (
                              <div
                                className="pt-1"
                                onClick={(e) => toggleClientSelection(client._id, e)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="h-5 w-5 rounded-lg"
                                />
                              </div>
                            )}

                            {/* Icon Box - Soft Slate */}
                            <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                              {client.clientType === 'company' ? (
                                <Building2 className="h-6 w-6 text-slate-600" />
                              ) : (
                                <span className="text-lg font-bold text-slate-600">{initials}</span>
                              )}
                            </div>

                            {/* Client Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  {/* Title - Hero of the Card */}
                                  <h3 className="font-bold text-slate-900 text-lg truncate mb-1 group-hover:text-emerald-600 transition-colors">
                                    {displayName}
                                  </h3>
                                  {/* Metadata */}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                    {client.clientNumber && (
                                      <span className="font-mono">#{client.clientNumber}</span>
                                    )}
                                    {client.clientType && (
                                      <span className="flex items-center gap-1">
                                        {client.clientType === 'company' ? (
                                          <Building2 className="h-3.5 w-3.5" />
                                        ) : (
                                          <User className="h-3.5 w-3.5" />
                                        )}
                                        {t(`clients.types.${client.clientType}`)}
                                      </span>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={cn('capitalize text-xs', statusColor)}
                                    >
                                      {t(`clients.statuses.${status}`)}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Actions Menu */}
                                <div className="flex items-center gap-2">
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
                                          setCurrentRow(client)
                                          setOpen('view')
                                        }}
                                      >
                                        <Eye className="me-2 h-4 w-4" />
                                        {t('common.view')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="rounded-lg"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setCurrentRow(client)
                                          setOpen('edit')
                                        }}
                                      >
                                        <Pencil className="me-2 h-4 w-4" />
                                        {t('common.edit')}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="rounded-lg text-destructive focus:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setCurrentRow(client)
                                          setOpen('delete')
                                        }}
                                      >
                                        <Trash2 className="me-2 h-4 w-4" />
                                        {t('common.delete')}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {/* Contact Info Row */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-slate-100">
                                {client.phone && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span dir="ltr">{client.phone}</span>
                                  </div>
                                )}
                                {client.email && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="truncate max-w-[200px]" dir="ltr">{client.email}</span>
                                  </div>
                                )}
                                {client.city && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span>{client.city}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                  <ContactIcon className="h-4 w-4" />
                                  <span>{t(`clients.contactMethods.${preferredMethod}`)}</span>
                                </div>

                                {/* View Details Button - Soft Tint */}
                                <div className="ms-auto flex items-center gap-2">
                                  {/* Desktop: Soft Tint Button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden sm:flex h-9 px-4 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      routerNavigate({ to: ROUTES.dashboard.clients.detail(client._id) })
                                    }}
                                  >
                                    {t('common.viewDetails')}
                                  </Button>
                                  {/* Mobile: Chevron Indicator */}
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

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">
                      {t('dataTable.showing')} <span className="font-medium text-slate-900">{((pagination.page - 1) * pagination.limit) + 1}</span> - <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> {t('dataTable.of')} <span className="font-medium text-slate-900">{pagination.total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="h-10 w-10 rounded-xl p-0"
                      >
                        <ChevronRight className={cn("h-4 w-4", isArabic ? "" : "rotate-180")} />
                      </Button>
                      <div className="flex items-center gap-1 px-3">
                        <span className="text-sm font-medium text-slate-900">{pagination.page}</span>
                        <span className="text-sm text-slate-400">/</span>
                        <span className="text-sm text-slate-500">{pagination.totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="h-10 w-10 rounded-xl p-0"
                      >
                        <ChevronLeft className={cn("h-4 w-4", isArabic ? "" : "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <ClientsSidebar
            context="clients"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={toggleSelectionMode}
            selectedCount={selectedClients.size}
            onDeleteSelected={() => {
              // Handle bulk delete
              console.log('Delete selected:', Array.from(selectedClients))
            }}
          />
        </div>
      </Main>
    </>
  )
}
