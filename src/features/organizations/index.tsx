import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { ProductivityHero } from '@/components/productivity-hero'
import { useOrganizations, useDeleteOrganization, useBulkDeleteOrganizations } from '@/hooks/useOrganizations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import {
  Search, Bell, AlertCircle, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2,
  Edit3, X, Building2, Phone, Mail, MapPin, Globe
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
import { OrganizationsProvider } from './components/organizations-provider'
import { OrganizationsDialogs } from './components/organizations-dialogs'
import { organizationStatusColors, organizationTypes, organizationStatuses } from './data/data'
import type { Organization } from '@/services/organizationsService'

export function Organizations() {
  return (
    <OrganizationsProvider>
      <OrganizationsListView />
      <OrganizationsDialogs />
    </OrganizationsProvider>
  )
}

function OrganizationsListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mutations
  const deleteOrgMutation = useDeleteOrganization()
  const bulkDeleteMutation = useBulkDeleteOrganizations()

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (searchQuery.trim()) f.search = searchQuery.trim()
    if (typeFilter !== 'all') f.type = typeFilter
    if (statusFilter !== 'all') f.status = statusFilter
    return f
  }, [searchQuery, typeFilter, statusFilter])

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
  }

  // Fetch organizations
  const { data: orgsData, isLoading, isError, error, refetch } = useOrganizations(filters)

  // Transform API data
  const organizations = useMemo(() => {
    if (!orgsData) return []
    const dataArray = orgsData.data || orgsData
    if (!Array.isArray(dataArray)) return []

    return dataArray.map((org: Organization) => ({
      id: org._id,
      _id: org._id,
      name: org.name || org.legalName || '',
      nameAr: org.nameAr || org.legalNameAr || '',
      displayName: i18n.language === 'ar' ? (org.nameAr || org.legalNameAr || org.name || org.legalName || 'منظمة') : (org.name || org.legalName || 'Organization'),
      email: org.email || '',
      phone: org.phone || '',
      website: org.website || '',
      city: org.city || '',
      type: org.type || 'company',
      status: org.status || 'active',
      industry: org.industry || '',
      commercialRegistration: org.commercialRegistration || '',
    }))
  }, [orgsData, i18n.language])

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedOrgIds([])
  }

  const handleSelectOrg = (orgId: string) => {
    if (selectedOrgIds.includes(orgId)) {
      setSelectedOrgIds(selectedOrgIds.filter(id => id !== orgId))
    } else {
      setSelectedOrgIds([...selectedOrgIds, orgId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedOrgIds.length === 0) return
    if (confirm(t('organizations.deleteMultipleConfirm', { count: selectedOrgIds.length }))) {
      bulkDeleteMutation.mutate(selectedOrgIds, {
        onSuccess: () => {
          setIsSelectionMode(false)
          setSelectedOrgIds([])
        }
      })
    }
  }

  // Single organization actions
  const handleViewOrg = (orgId: string) => {
    navigate({ to: '/dashboard/organizations/$organizationId', params: { organizationId: orgId } })
  }

  const handleEditOrg = (orgId: string) => {
    navigate({ to: '/dashboard/organizations/$organizationId/edit', params: { organizationId: orgId } })
  }

  const handleDeleteOrg = (orgId: string) => {
    if (confirm(t('organizations.deleteConfirm'))) {
      deleteOrgMutation.mutate(orgId)
    }
  }

  // Get icon for organization type
  const getTypeIcon = (type: string) => {
    const typeData = organizationTypes.find(t => t.value === type)
    if (typeData) {
      const Icon = typeData.icon
      return <Icon className="h-5 w-5" />
    }
    return <Building2 className="h-5 w-5" />
  }

  const topNav = [
    { title: t('contacts.nav.contacts'), href: '/dashboard/contacts', isActive: false },
    { title: t('contacts.nav.clients'), href: '/dashboard/clients', isActive: false },
    { title: t('contacts.nav.organizations'), href: '/dashboard/organizations', isActive: true },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        <ProductivityHero badge={t('organizations.management', 'إدارة المنظمات')} title={t('organizations.title', 'المنظمات')} type="organizations" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                    <Input
                      type="text"
                      placeholder={t('organizations.searchPlaceholder', 'البحث عن منظمة...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pe-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder={t('organizations.type', 'النوع')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('organizations.allTypes', 'جميع الأنواع')}</SelectItem>
                      {organizationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(`organizations.types.${type.value}`, type.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                      <SelectValue placeholder={t('organizations.status', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('organizations.allStatuses', 'جميع الحالات')}</SelectItem>
                      {organizationStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {t(`organizations.statuses.${status.value}`, status.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4 ms-2" aria-hidden="true" />
                      {t('organizations.clearFilters', 'مسح الفلاتر')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN ORGANIZATIONS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">
                  {t('organizations.organizationsList', 'قائمة المنظمات')}
                </h3>
                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                  {t('organizations.organizationCount', { count: organizations.length }, `${organizations.length} منظمة`)}
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('organizations.errorLoading', 'خطأ في تحميل المنظمات')}</h3>
                    <p className="text-slate-500 mb-4">{error?.message || t('organizations.connectionError', 'تعذر الاتصال بالخادم')}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                      {t('organizations.retry', 'إعادة المحاولة')}
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && organizations.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('organizations.noOrganizations', 'لا توجد منظمات')}</h3>
                    <p className="text-slate-500 mb-4">{t('organizations.noOrganizationsDescription', 'ابدأ بإضافة منظمة جديدة')}</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/organizations/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        {t('organizations.addNewOrganization', 'إضافة منظمة جديدة')}
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Organization Cards */}
                {!isLoading && !isError && organizations.map((org) => (
                  <div
                    key={org.id}
                    className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedOrgIds.includes(org.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedOrgIds.includes(org.id)}
                            onCheckedChange={() => handleSelectOrg(org.id)}
                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        )}
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                          {getTypeIcon(org.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-navy text-lg">{org.displayName}</h4>
                            <Badge
                              variant="outline"
                              className={organizationStatusColors.get(org.status) || ''}
                            >
                              {t(`organizations.statuses.${org.status}`, org.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            {org.industry && (
                              <>
                                <span>{org.industry}</span>
                                <span className="mx-1">•</span>
                              </>
                            )}
                            <span>{t(`organizations.types.${org.type}`, org.type)}</span>
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
                          <DropdownMenuItem onClick={() => handleViewOrg(org.id)}>
                            <Eye className="h-4 w-4 ms-2" aria-hidden="true" />
                            {t('organizations.viewDetails', 'عرض التفاصيل')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrg(org.id)}>
                            <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                            {t('organizations.edit', 'تعديل')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteOrg(org.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />
                            {t('organizations.delete', 'حذف')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div className="flex items-center gap-6">
                        {org.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-slate-600" dir="ltr">{org.email}</span>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-slate-600" dir="ltr">{org.phone}</span>
                          </div>
                        )}
                        {org.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-slate-600">{org.city}</span>
                          </div>
                        )}
                        {org.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-500" />
                            <span className="text-sm text-slate-600" dir="ltr">{org.website}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleViewOrg(org.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                      >
                        {t('organizations.viewDetails', 'عرض التفاصيل')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {organizations.length > 0 && (
                <div className="p-4 pt-0 text-center">
                  <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                    {t('organizations.viewAllOrganizations', 'عرض جميع المنظمات')}
                    <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <ClientsSidebar
            context="organizations"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedOrgIds.length}
            onDeleteSelected={handleDeleteSelected}
          />
        </div>
      </Main>
    </>
  )
}
