import { useState } from 'react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  MessageCircle,
  FileText,
  Briefcase,
  Receipt,
  DollarSign,
  Edit,
  Trash2,
  Lock,
  Search,
  Bell,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClient } from '@/hooks/useClients'
import { clientStatusColors, contactMethods } from '../data/data'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProductivityHero } from '@/components/productivity-hero'
import { ClientsSidebar } from '../components/clients-sidebar'

const route = getRouteApi('/_authenticated/dashboard/clients/$clientId')

// Helper to get display name for a client
const getClientDisplayName = (client: any): string => {
  if (client.clientType === 'company') {
    return client.companyName || client.companyNameEnglish || '-'
  }
  return client.fullNameArabic || client.fullNameEnglish ||
         [client.firstName, client.lastName].filter(Boolean).join(' ') || '-'
}

// Helper to get initials
const getClientInitials = (client: any): string => {
  const name = getClientDisplayName(client)
  if (name === '-') return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function ClientDetails() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const dateLocale = isArabic ? ar : enUS
  const { clientId } = route.useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data, isLoading, isError, error, refetch } = useClient(clientId)

  const topNav = [
    { title: t('sidebar.nav.clients'), href: '/dashboard/clients', isActive: true },
    { title: t('sidebar.nav.organizations'), href: '/dashboard/organizations', isActive: false },
    { title: t('sidebar.nav.cases'), href: '/dashboard/cases', isActive: false },
  ]

  // Transform client data
  const client = data?.client
  const relatedData = data?.relatedData || { cases: [], invoices: [], payments: [] }
  const summary = data?.summary || { totalCases: 0, totalInvoices: 0, totalPaid: 0, outstandingBalance: 0 }

  const preferredMethod = client?.preferredContactMethod || client?.preferredContact || 'phone'
  const contactMethod = contactMethods.find((m) => m.value === preferredMethod)
  const ContactIcon = contactMethod?.icon || MessageCircle
  const clientStatus = client?.status || 'active'

  return (
    <>
      {/* Header - Navy with gradient */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
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

        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* Main Content */}
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('clients.notFound')}</h3>
            <p className="text-slate-500 mb-4">{error?.message || t('common.errorOccurred')}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                {t('common.retry')}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/clients">{t('clients.backToClients')}</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !client && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('clients.notFound')}</h3>
            <p className="text-slate-500 mb-4">{t('clients.clientNotFoundDescription')}</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to="/dashboard/clients">{t('clients.backToClients')}</Link>
            </Button>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && client && (
          <>
            {/* Hero Card with Client Info */}
            <ProductivityHero
              badge={t('clients.management')}
              title={getClientDisplayName(client)}
              type="clients"
              listMode={true}
            />

            {/* Client Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
                    {client.clientType === 'company' ? (
                      <Building2 className="h-8 w-8" />
                    ) : (
                      getClientInitials(client)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">{getClientDisplayName(client)}</h2>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', clientStatusColors.get(clientStatus as any))}
                      >
                        {t(`clients.statuses.${clientStatus}`)}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm">
                      {client.clientNumber && <span className="me-2">#{client.clientNumber}</span>}
                      {client.createdAt && (
                        <>
                          <Calendar className="h-3 w-3 inline me-1" />
                          {format(new Date(client.createdAt), 'PPP', { locale: dateLocale })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Edit className="me-2 h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                    <Trash2 className="me-2 h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary Cards - Financial Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{t('clients.summary.creditBalance')}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <p className={cn('text-2xl font-bold', (client.billing?.creditBalance ?? 0) > 0 ? 'text-emerald-600' : 'text-slate-900')}>
                  {(client.billing?.creditBalance ?? 0).toLocaleString()} <span className="text-sm font-normal">{t('common.sar')}</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{t('clients.summary.totalCases')}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{summary.totalCases}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{t('clients.summary.totalPaid')}</span>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.totalPaid.toLocaleString()} <span className="text-sm font-normal">{t('common.sar')}</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{t('clients.summary.outstanding')}</span>
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className={cn('text-2xl font-bold', summary.outstandingBalance > 0 ? 'text-red-600' : 'text-slate-900')}>
                  {summary.outstandingBalance.toLocaleString()} <span className="text-sm font-normal">{t('common.sar')}</span>
                </p>
              </div>
            </div>

            {/* Main Grid - 3 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[500px]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                      <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                        {['overview', 'cases', 'invoices', 'payments'].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="
                              inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                              disabled:pointer-events-none disabled:opacity-50
                              data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm
                              data-[state=inactive]:hover:bg-slate-200
                              flex-1 sm:flex-initial
                            "
                          >
                            {tab === 'overview' ? t('clients.tabs.info') :
                             tab === 'cases' ? t('clients.tabs.cases') :
                             tab === 'invoices' ? t('clients.tabs.invoices') :
                             t('clients.tabs.payments')}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px]">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Contact Information Card */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-600" />
                              {t('clients.form.contactInfo')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {client.phone && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">{t('clients.form.phone')}</p>
                                    <p className="font-medium text-slate-900" dir="ltr">{client.phone}</p>
                                  </div>
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">{t('clients.form.email')}</p>
                                    <p className="font-medium text-slate-900" dir="ltr">{client.email}</p>
                                  </div>
                                </div>
                              )}
                              {client.alternatePhone && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500">{t('clients.form.alternatePhone')}</p>
                                    <p className="font-medium text-slate-900" dir="ltr">{client.alternatePhone}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <ContactIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">{t('clients.form.preferredContactMethod')}</p>
                                  <p className="font-medium text-slate-900">{t(`clients.contactMethods.${preferredMethod}`)}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Identity & Company Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Identity Card - Enhanced for Najiz */}
                          {(client.nationalId || client.iqamaNumber || client.passportNumber || client.gccId) && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-amber-600" />
                                  {t('clients.form.identityInfo')}
                                  {client.isVerified && (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs ms-2">
                                      {t('clients.verified')}
                                    </Badge>
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {/* Identity Type */}
                                {client.identityType && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                      <Lock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">{t('clients.form.identityType')}</p>
                                      <p className="font-medium text-slate-900">{t(`clients.identityTypes.${client.identityType}`)}</p>
                                    </div>
                                  </div>
                                )}
                                {/* National ID */}
                                {client.nationalId && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                      <Lock className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">{t('clients.form.nationalId')}</p>
                                      <p className="font-medium text-slate-900" dir="ltr">{client.nationalId}</p>
                                    </div>
                                  </div>
                                )}
                                {/* Iqama */}
                                {client.iqamaNumber && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                      <Lock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">{t('clients.form.iqamaNumber')}</p>
                                      <p className="font-medium text-slate-900" dir="ltr">{client.iqamaNumber}</p>
                                    </div>
                                  </div>
                                )}
                                {/* GCC ID */}
                                {client.gccId && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                      <Lock className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">{t('clients.form.gccId')}</p>
                                      <p className="font-medium text-slate-900" dir="ltr">{client.gccId}</p>
                                      {client.gccCountry && (
                                        <p className="text-xs text-slate-500">{client.gccCountry}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Passport */}
                                {client.passportNumber && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                      <Lock className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500">{t('clients.form.passportNumber')}</p>
                                      <p className="font-medium text-slate-900" dir="ltr">{client.passportNumber}</p>
                                      {client.passportCountry && (
                                        <p className="text-xs text-slate-500">{client.passportCountry}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Company Card - Enhanced for Najiz */}
                          {(client.companyName || client.crNumber || client.vatNumber) && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-blue-600" />
                                  {t('clients.form.companyInfo')}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {client.companyName && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.companyName')}</span>
                                    <span className="font-medium text-slate-900">{client.companyName}</span>
                                  </div>
                                )}
                                {client.companyNameAr && client.companyNameAr !== client.companyName && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.companyNameAr')}</span>
                                    <span className="font-medium text-slate-900">{client.companyNameAr}</span>
                                  </div>
                                )}
                                {client.crNumber && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.companyRegistration')}</span>
                                    <span className="font-medium text-slate-900" dir="ltr">{client.crNumber}</span>
                                  </div>
                                )}
                                {client.unifiedNumber && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.unifiedNumber')}</span>
                                    <span className="font-medium text-slate-900" dir="ltr">{client.unifiedNumber}</span>
                                  </div>
                                )}
                                {client.vatNumber && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.vatNumber')}</span>
                                    <span className="font-medium text-slate-900" dir="ltr">{client.vatNumber}</span>
                                  </div>
                                )}
                                {client.legalForm && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.legalForm')}</span>
                                    <span className="font-medium text-slate-900">{isArabic ? client.legalFormAr || client.legalForm : client.legalForm}</span>
                                  </div>
                                )}
                                {client.capital && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('clients.form.capital')}</span>
                                    <span className="font-medium text-slate-900">{client.capital.toLocaleString()} {client.capitalCurrency || 'SAR'}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* National Address Card - Saudi Format */}
                        {client.nationalAddress && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                {t('clients.form.nationalAddress')}
                                {client.nationalAddress.isVerified && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs ms-2">
                                    {t('clients.verified')}
                                  </Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {client.nationalAddress.buildingNumber && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.buildingNumber')}</p>
                                    <p className="font-medium text-slate-900">{client.nationalAddress.buildingNumber}</p>
                                  </div>
                                )}
                                {(client.nationalAddress.streetNameAr || client.nationalAddress.streetName) && (
                                  <div className="p-3 rounded-xl bg-slate-50 col-span-2">
                                    <p className="text-xs text-slate-500">{t('clients.form.streetName')}</p>
                                    <p className="font-medium text-slate-900">
                                      {isArabic ? client.nationalAddress.streetNameAr || client.nationalAddress.streetName : client.nationalAddress.streetName || client.nationalAddress.streetNameAr}
                                    </p>
                                  </div>
                                )}
                                {(client.nationalAddress.districtAr || client.nationalAddress.district) && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.district')}</p>
                                    <p className="font-medium text-slate-900">
                                      {isArabic ? client.nationalAddress.districtAr || client.nationalAddress.district : client.nationalAddress.district || client.nationalAddress.districtAr}
                                    </p>
                                  </div>
                                )}
                                {(client.nationalAddress.cityAr || client.nationalAddress.city) && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.city')}</p>
                                    <p className="font-medium text-slate-900">
                                      {isArabic ? client.nationalAddress.cityAr || client.nationalAddress.city : client.nationalAddress.city || client.nationalAddress.cityAr}
                                    </p>
                                  </div>
                                )}
                                {(client.nationalAddress.regionAr || client.nationalAddress.region) && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.region')}</p>
                                    <p className="font-medium text-slate-900">
                                      {isArabic ? client.nationalAddress.regionAr || client.nationalAddress.region : client.nationalAddress.region || client.nationalAddress.regionAr}
                                    </p>
                                  </div>
                                )}
                                {client.nationalAddress.postalCode && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.postalCode')}</p>
                                    <p className="font-medium text-slate-900" dir="ltr">{client.nationalAddress.postalCode}</p>
                                  </div>
                                )}
                                {client.nationalAddress.additionalNumber && (
                                  <div className="p-3 rounded-xl bg-slate-50">
                                    <p className="text-xs text-slate-500">{t('clients.form.additionalNumber')}</p>
                                    <p className="font-medium text-slate-900" dir="ltr">{client.nationalAddress.additionalNumber}</p>
                                  </div>
                                )}
                                {client.nationalAddress.shortAddress && (
                                  <div className="p-3 rounded-xl bg-emerald-50">
                                    <p className="text-xs text-emerald-600">{t('clients.form.shortAddress')}</p>
                                    <p className="font-bold text-emerald-700" dir="ltr">{client.nationalAddress.shortAddress}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Address Card */}
                        {(client.city || client.address) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-600" />
                                {t('clients.form.addressInfo')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                  <MapPin className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">{t('clients.form.address')}</p>
                                  <p className="font-medium text-slate-900">
                                    {(() => {
                                      const addressParts: string[] = []
                                      if (typeof client.address === 'string') {
                                        addressParts.push(client.address)
                                      } else if (client.address) {
                                        if (client.address.street) addressParts.push(client.address.street)
                                        if (client.address.district) addressParts.push(client.address.district)
                                      }
                                      if (client.city && !addressParts.includes(client.city)) addressParts.push(client.city)
                                      if (client.country) addressParts.push(client.country)
                                      return addressParts.filter(Boolean).join('، ') || '-'
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Notes Card */}
                        {(client.notes || client.generalNotes) && (
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-600" />
                                {t('clients.form.notes')}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {client.notes || client.generalNotes}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </TabsContent>

                      {/* Cases Tab */}
                      <TabsContent value="cases" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            {relatedData.cases.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                  <Briefcase className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('clients.noCases')}</h3>
                                <p className="text-slate-500">{t('clients.noCasesDescription')}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {relatedData.cases.map((caseItem: any, index: number) => (
                                  <div
                                    key={caseItem._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">{caseItem.title}</p>
                                        <p className="text-sm text-slate-500">{caseItem.caseNumber}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline">{caseItem.status}</Badge>
                                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Invoices Tab */}
                      <TabsContent value="invoices" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            {relatedData.invoices.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                  <Receipt className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('clients.noInvoices')}</h3>
                                <p className="text-slate-500">{t('clients.noInvoicesDescription')}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {relatedData.invoices.map((invoice: any, index: number) => (
                                  <div
                                    key={invoice._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <Receipt className="h-5 w-5 text-amber-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                                        <p className="text-sm text-slate-500">
                                          {invoice.issueDate && format(new Date(invoice.issueDate), 'PPP', { locale: dateLocale })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-end">
                                      <p className="font-bold text-slate-900">
                                        {invoice.totalAmount?.toLocaleString()} {t('common.sar')}
                                      </p>
                                      <Badge variant="outline" className="mt-1">{invoice.status}</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Payments Tab */}
                      <TabsContent value="payments" className="mt-0">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            {relatedData.payments.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                  <DollarSign className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('clients.noPayments')}</h3>
                                <p className="text-slate-500">{t('clients.noPaymentsDescription')}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {relatedData.payments.map((payment: any, index: number) => (
                                  <div
                                    key={payment._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-emerald-600" />
                                      </div>
                                      <div>
                                        <p className="font-bold text-emerald-600">
                                          {payment.amount?.toLocaleString()} {t('common.sar')}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {payment.date && format(new Date(payment.date), 'PPP', { locale: dateLocale })}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline">{payment.status}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>

              {/* Sidebar - 1 column */}
              <ClientsSidebar context="details" clientId={clientId} />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
