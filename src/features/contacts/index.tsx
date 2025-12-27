import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useContacts, useDeleteContact, useBulkDeleteContacts } from '@/hooks/useContacts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import {
  Search, Bell, AlertCircle, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2,
  Edit3, X, User, Building2, Phone, Mail, MapPin, Filter,
  UserCheck, UserX, Users, Shield, Briefcase
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ClientsSidebar } from '@/features/clients/components/clients-sidebar'
import { ContactsProvider } from './components/contacts-provider'
import { ContactsDialogs } from './components/contacts-dialogs'
import { contactStatusColors, contactTypes, contactCategories } from './data/data'
import type { Contact } from './data/schema'
import { ROUTES } from '@/constants/routes'

// Main export
export function Contacts() {
  return (
    <ContactsProvider>
      <ContactsListView />
      <ContactsDialogs />
    </ContactsProvider>
  )
}

function ContactsListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')

    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mutations
  const deleteContactMutation = useDeleteContact()
  const bulkDeleteMutation = useBulkDeleteContacts()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}

    if (searchQuery.trim()) {
      f.search = searchQuery.trim()
    }

    if (typeFilter !== 'all') {
      f.type = typeFilter
    }

    if (categoryFilter !== 'all') {
      f.category = categoryFilter
    }

    if (statusFilter !== 'all') {
      f.status = statusFilter
    }

    return f
  }, [searchQuery, typeFilter, categoryFilter, statusFilter])

  // Check if any filter is active
  const hasActiveFilters = searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setStatusFilter('all')
  }, [])

  // Fetch contacts
  const { data: contactsData, isLoading, isError, error, refetch } = useContacts(filters)

  // Transform API data
  const contacts = useMemo(() => {
    if (!contactsData?.data) return []

    return contactsData.data.map((contact: Contact) => ({
      id: contact._id,
      _id: contact._id,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      fullName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || t('contacts.unnamed'),
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      city: contact.city || '',
      type: contact.type,
      category: contact.category,
      status: contact.status,
    }))
  }, [contactsData, t])

  // Selection Handlers
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedContactIds([])
  }, [isSelectionMode])

  const handleSelectContact = useCallback((contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId))
    } else {
      setSelectedContactIds([...selectedContactIds, contactId])
    }
  }, [selectedContactIds])

  const handleDeleteSelected = useCallback(() => {
    if (selectedContactIds.length === 0) return

    if (confirm(t('contacts.deleteMultipleConfirm', { count: selectedContactIds.length }))) {
      bulkDeleteMutation.mutate(selectedContactIds, {
        onSuccess: () => {
          setIsSelectionMode(false)
          setSelectedContactIds([])
        }
      })
    }
  }, [selectedContactIds, t, bulkDeleteMutation])

  // Single contact actions
  const handleViewContact = useCallback((contactId: string) => {
    navigate({ to: ROUTES.dashboard.contacts.detail(contactId) })
  }, [navigate])

  const handleEditContact = useCallback((contactId: string) => {
    navigate({ to: `${ROUTES.dashboard.contacts.detail(contactId)}/edit` })
  }, [navigate])

  const handleDeleteContact = useCallback((contactId: string) => {
    if (confirm(t('contacts.deleteConfirm'))) {
      deleteContactMutation.mutate(contactId)
    }
  }, [t, deleteContactMutation])

  // Get icon for contact type
  const getTypeIcon = useCallback((type: string) => {
    const typeData = contactTypes.find(t => t.value === type)
    if (typeData) {
      const Icon = typeData.icon
      return <Icon className="h-5 w-5" />
    }
    return <User className="h-5 w-5" />
  }, [])

  // Get icon for category
  const getCategoryIcon = useCallback((category: string) => {
    const catData = contactCategories.find(c => c.value === category)
    if (catData) {
      const Icon = catData.icon
      return <Icon className="h-4 w-4" />
    }
    return null
  }, [])

  const topNav = [
    { title: t('contacts.nav.contacts'), href: ROUTES.dashboard.contacts.list, isActive: true },
    { title: t('contacts.nav.clients'), href: ROUTES.dashboard.clients.list, isActive: false },
    { title: t('contacts.nav.organizations'), href: ROUTES.dashboard.organizations.list, isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder={t('common.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD */}
        <ProductivityHero badge={t('contacts.management')} title={t('contacts.title')} type="contacts" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                {/* Row 1: Search and primary filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder={t('contacts.searchPlaceholder')}
                      defaultValue={searchQuery}
                      onChange={(e) => debouncedSetSearch(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Type Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder={t('contacts.columns.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('contacts.allTypes')}</SelectItem>
                      {contactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(`contacts.types.${type.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder={t('contacts.columns.category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('contacts.allCategories')}</SelectItem>
                      {contactCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {t(`contacts.categories.${cat.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder={t('contacts.columns.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('contacts.allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('contacts.statuses.active')}</SelectItem>
                      <SelectItem value="inactive">{t('contacts.statuses.inactive')}</SelectItem>
                      <SelectItem value="archived">{t('contacts.statuses.archived')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4 ms-2" aria-hidden="true" />
                      {t('contacts.clearFilters')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTACTS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">
                  {t('contacts.contactsList')}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {t('contacts.contactCount', { count: contacts.length })}
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-16 w-full" />
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('contacts.errorLoading')}</h3>
                    <p className="text-slate-500 mb-4">{error?.message || t('contacts.connectionError')}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      {t('contacts.retry')}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && contacts.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <User className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('contacts.noContacts')}</h3>
                    <p className="text-slate-500 mb-4">{t('contacts.noContactsDescription')}</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to={ROUTES.dashboard.contacts.new}>
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('contacts.addNewContact')}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Contacts Cards */}
                {!isLoading && !isError && contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedContactIds.includes(contact.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedContactIds.includes(contact.id)}
                            onCheckedChange={() => handleSelectContact(contact.id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                          {getTypeIcon(contact.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-navy text-lg">{contact.fullName}</h4>
                            <Badge
                              variant="outline"
                              className={contactStatusColors.get(contact.status) || ''}
                            >
                              {t(`contacts.statuses.${contact.status}`)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            {contact.company && (
                              <>
                                <Building2 className="h-3 w-3" />
                                <span>{contact.company}</span>
                              </>
                            )}
                            {contact.category && (
                              <>
                                <span className="mx-1">•</span>
                                {getCategoryIcon(contact.category)}
                                <span>{t(`contacts.categories.${contact.category}`)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewContact(contact.id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            {t('contacts.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditContact(contact.id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            {t('contacts.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            {t('contacts.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {/* Email */}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-slate-600" dir="ltr">{contact.email}</span>
                          </div>
                        )}
                        {/* Phone */}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-slate-600" dir="ltr">{contact.phone}</span>
                          </div>
                        )}
                        {/* City */}
                        {contact.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-slate-600">{contact.city}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleViewContact(contact.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                      >
                        {t('contacts.viewDetails')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {contacts.length > 0 && (
                <div className="p-4 pt-0 text-center">
                  <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                    {t('contacts.viewAllContacts')}
                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <ClientsSidebar
            context="contacts"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedContactIds.length}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      </Main>
    </>
  )
}
