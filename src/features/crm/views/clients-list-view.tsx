import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  FileText,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/services/clientsService'
import { ROUTES } from '@/constants/routes'

// Industry options for filter
const industryOptions = [
  { label: 'All Industries', labelAr: 'كل الصناعات', value: '' },
  { label: 'Legal', labelAr: 'قانوني', value: 'legal' },
  { label: 'Technology', labelAr: 'تقنية', value: 'technology' },
  { label: 'Healthcare', labelAr: 'رعاية صحية', value: 'healthcare' },
  { label: 'Finance', labelAr: 'مالية', value: 'finance' },
  { label: 'Real Estate', labelAr: 'عقارات', value: 'real_estate' },
  { label: 'Construction', labelAr: 'بناء', value: 'construction' },
  { label: 'Retail', labelAr: 'تجزئة', value: 'retail' },
  { label: 'Manufacturing', labelAr: 'تصنيع', value: 'manufacturing' },
  { label: 'Other', labelAr: 'أخرى', value: 'other' },
]

// Status options for filter
const statusOptions = [
  { label: 'All Status', labelAr: 'كل الحالات', value: '' },
  { label: 'Active', labelAr: 'نشط', value: 'active' },
  { label: 'Inactive', labelAr: 'غير نشط', value: 'inactive' },
  { label: 'Pending', labelAr: 'قيد الانتظار', value: 'pending' },
  { label: 'Archived', labelAr: 'مؤرشف', value: 'archived' },
]

export function ClientsListView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 })

  // Build filters for API
  const filters = useMemo(() => {
    return {
      search: searchQuery || undefined,
      status: statusFilter || undefined,
      industry: industryFilter || undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }
  }, [searchQuery, statusFilter, industryFilter, pagination])

  // Fetch clients
  const { data: clientsData, isLoading, isError, error } = useClients(filters)

  const clients = clientsData?.data || []
  const totalCount = clientsData?.pagination?.total || 0

  // Get client display name
  const getClientName = (client: Client) => {
    if (client.clientType === 'company') {
      return isRTL
        ? client.companyNameAr || client.companyName || client.companyNameEnglish || '-'
        : client.companyNameEnglish || client.companyName || client.companyNameAr || '-'
    }
    return isRTL
      ? client.fullNameArabic || client.fullNameEnglish || `${client.firstName || ''} ${client.lastName || ''}`.trim() || '-'
      : client.fullNameEnglish || client.fullNameArabic || `${client.firstName || ''} ${client.lastName || ''}`.trim() || '-'
  }

  // Get contact person for company clients
  const getContactPerson = (client: Client) => {
    if (client.clientType === 'company') {
      return isRTL
        ? client.authorizedPersonAr || client.authorizedPerson || '-'
        : client.authorizedPerson || client.authorizedPersonAr || '-'
    }
    return null
  }

  // Get industry badge
  const getIndustryBadge = (client: Client) => {
    const industry = client.practiceAreas?.[0]
    if (!industry) return null

    const industryOption = industryOptions.find(opt => opt.value === industry)
    return isRTL ? industryOption?.labelAr : industryOption?.label
  }

  // Get status variant
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'archived':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  // Get status label
  const getStatusLabel = (status?: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    if (!statusOption) return status || '-'
    return isRTL ? statusOption.labelAr : statusOption.label
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1">
              {isRTL ? 'العملاء' : 'Clients'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isRTL ? 'إدارة العملاء' : 'Client Management'}
          </h1>
          <p className="text-emerald-50">
            {isRTL
              ? 'إدارة وتتبع جميع عملائك في مكان واحد'
              : 'Manage and track all your clients in one place'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-navy">
              {isRTL ? 'قائمة العملاء' : 'Clients List'}
            </h2>
            <p className="text-slate-500 mt-1">
              {isRTL ? `${totalCount} عميل` : `${totalCount} client(s)`}
            </p>
          </div>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
            <Link to={ROUTES.dashboard.clients.new}>
              <Plus className={isRTL ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
              {isRTL ? 'عميل جديد' : 'New Client'}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث عن عميل...' : 'Search clients...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {isRTL ? option.labelAr : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Industry Filter */}
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder={isRTL ? 'الصناعة' : 'Industry'} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {isRTL ? option.labelAr : option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-slate-100 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-red-100 shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {isRTL ? 'فشل تحميل العملاء' : 'Failed to load clients'}
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || (isRTL ? 'حدث خطأ في الخادم' : 'A server error occurred')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && clients.length === 0 && (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {isRTL ? 'لا يوجد عملاء' : 'No clients found'}
              </h3>
              <p className="text-slate-500 mb-4">
                {isRTL
                  ? 'ابدأ بإضافة عميل جديد'
                  : 'Get started by adding a new client'}
              </p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                <Link to={ROUTES.dashboard.clients.new}>
                  <Plus className={isRTL ? 'ms-2 h-4 w-4' : 'me-2 h-4 w-4'} />
                  {isRTL ? 'إضافة عميل' : 'Add Client'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Clients Cards Grid */}
        {!isLoading && !isError && clients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Link
                key={client._id}
                to={ROUTES.dashboard.crm.clients.detail(client._id)}
                className="group"
              >
                <Card className="h-full border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                          {client.clientType === 'company' ? (
                            <Building2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <User className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>

                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                            {getClientName(client)}
                          </h3>
                          {client.clientType === 'company' && getContactPerson(client) && (
                            <p className="text-sm text-slate-500 truncate mt-1">
                              {getContactPerson(client)}
                            </p>
                          )}
                          {client.clientNumber && (
                            <p className="text-xs text-slate-400 mt-1">
                              #{client.clientNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge variant={getStatusVariant(client.status)} className="flex-shrink-0">
                        {getStatusLabel(client.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate" dir="ltr">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span dir="ltr">{client.phone}</span>
                        </div>
                      )}
                      {(client.city || client.region) && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {[client.city, client.region].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Industry Badge */}
                    {getIndustryBadge(client) && (
                      <div className="pt-2 border-t border-slate-100">
                        <Badge variant="outline" className="text-xs">
                          {getIndustryBadge(client)}
                        </Badge>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">
                            {isRTL ? 'العروض' : 'Quotes'}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {client.totalPaid || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">
                            {isRTL ? 'الإيرادات' : 'Revenue'}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {client.totalPaid
                              ? `${client.totalPaid.toLocaleString()} ${client.billingCurrency || 'SAR'}`
                              : '0 SAR'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && clients.length > 0 && totalCount > pagination.pageSize && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              {isRTL
                ? `عرض ${pagination.pageIndex * pagination.pageSize + 1} - ${Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} من ${totalCount}`
                : `Showing ${pagination.pageIndex * pagination.pageSize + 1} - ${Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} of ${totalCount}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
                disabled={pagination.pageIndex === 0}
              >
                {isRTL ? 'السابق' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
                disabled={(pagination.pageIndex + 1) * pagination.pageSize >= totalCount}
              >
                {isRTL ? 'التالي' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Named export
export { ClientsListView as default }
