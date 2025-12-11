import { useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
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
    { title: t('sidebar.nav.clients'), href: '/dashboard/clients', isActive: true },
    { title: t('sidebar.nav.organizations'), href: '/dashboard/organizations', isActive: false },
    { title: t('sidebar.nav.cases'), href: '/dashboard/cases', isActive: false },
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
  const toggleClientSelection = (clientId: string) => {
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
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t('clients.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="ps-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl gap-2 min-w-[140px]">
                      <Filter className="h-4 w-4" />
                      {selectedStatus
                        ? clientStatuses.find(s => s.value === selectedStatus)?.[isArabic ? 'label' : 'labelEn']
                        : t('clients.columns.status')
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
                      {t('common.all')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {clientStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => handleStatusFilter(status.value)}
                        className={cn(selectedStatus === status.value && 'bg-emerald-50')}
                      >
                        <status.icon className="h-4 w-4 me-2" />
                        {isArabic ? status.label : status.labelEn}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Client Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('clients.noClients')}</h3>
                <p className="text-slate-500 mb-6">{t('clients.startAddingClient')}</p>
                <Link to="/dashboard/clients/new">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 shadow-lg shadow-emerald-500/20">
                    <Plus className="me-2 h-4 w-4" aria-hidden="true" />
                    {t('clients.addNewClient')}
                  </Button>
                </Link>
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-8 w-8 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('clients.noResults')}</h3>
                <p className="text-slate-500">{t('clients.tryDifferentSearch')}</p>
              </div>
            ) : (
              <>
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map((client: Client) => {
                    const displayName = getClientDisplayName(client)
                    const initials = getClientInitials(client)
                    const status = client.status || 'active'
                    const statusColor = clientStatusColors.get(status as any) || clientStatusColors.get('active')
                    const preferredMethod = client.preferredContactMethod || client.preferredContact || 'phone'
                    const contactMethod = contactMethods.find(m => m.value === preferredMethod)
                    const ContactIcon = contactMethod?.icon || Phone
                    const isSelected = selectedClients.has(client._id)

                    return (
                      <div
                        key={client._id}
                        className={cn(
                          "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group relative",
                          isSelected && "ring-2 ring-emerald-500 border-emerald-500"
                        )}
                      >
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <div className="absolute top-4 start-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleClientSelection(client._id)}
                              className="h-5 w-5"
                            />
                          </div>
                        )}

                        {/* Actions Menu */}
                        <div className="absolute top-4 end-4">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentRow(client)
                                  setOpen('view')
                                }}
                              >
                                <Eye className="me-2 h-4 w-4" />
                                {t('common.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentRow(client)
                                  setOpen('edit')
                                }}
                              >
                                <Pencil className="me-2 h-4 w-4" />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentRow(client)
                                  setOpen('delete')
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="me-2 h-4 w-4" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Client Avatar & Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                            {client.clientType === 'company' ? (
                              <Building2 className="h-6 w-6" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 truncate mb-1">
                              {displayName}
                            </h3>
                            {client.clientNumber && (
                              <p className="text-xs text-slate-400 mb-2">#{client.clientNumber}</p>
                            )}
                            <Badge
                              variant="outline"
                              className={cn('capitalize text-xs', statusColor)}
                            >
                              {t(`clients.statuses.${status}`)}
                            </Badge>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span dir="ltr">{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 truncate">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span className="truncate" dir="ltr">{client.email}</span>
                            </div>
                          )}
                          {client.city && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{client.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <ContactIcon className="h-4 w-4" />
                            <span>{t(`clients.contactMethods.${preferredMethod}`)}</span>
                          </div>
                          <Link to={`/dashboard/clients/${client._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              {t('common.viewDetails')}
                              <ChevronLeft className="h-4 w-4 ms-1 rtl:rotate-180" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">
                      {t('dataTable.showing')} {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('dataTable.of')} {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="rounded-xl"
                      >
                        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                      </Button>
                      <span className="text-sm text-slate-600 px-3">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="rounded-xl"
                      >
                        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
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
