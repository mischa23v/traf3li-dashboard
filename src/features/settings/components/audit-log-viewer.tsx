/**
 * Audit Log Viewer Component
 * Enterprise-grade audit log viewer with comprehensive filtering and export capabilities
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Download,
  FileText,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  AlertCircle,
  User,
  Shield,
  Database,
  FileEdit,
  Trash2,
  LogIn,
  Settings,
  UserPlus,
  Lock,
  Unlock,
  Mail,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { AuditLog } from '@/services/auditLogService'

// ==================== MOCK DATA ====================

const MOCK_TEAM_MEMBERS = [
  { id: 'user-1', name: 'Ahmed Al-Saud', nameAr: 'أحمد السعود', email: 'ahmed@traf3li.com' },
  { id: 'user-2', name: 'Sara Al-Otaibi', nameAr: 'سارة العتيبي', email: 'sara@traf3li.com' },
  { id: 'user-3', name: 'Mohammed Al-Qahtani', nameAr: 'محمد القحطاني', email: 'mohammed@traf3li.com' },
  { id: 'user-4', name: 'Fatima Al-Harbi', nameAr: 'فاطمة الحربي', email: 'fatima@traf3li.com' },
]

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    _id: '1',
    action: 'create',
    entityType: 'case',
    entityId: 'case-123',
    userId: 'user-1',
    userEmail: 'ahmed@traf3li.com',
    userRole: 'lawyer',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    status: 'success',
    severity: 'low',
    details: { caseNumber: 'C-2024-001', title: 'Commercial Dispute Case' },
  },
  {
    _id: '2',
    action: 'update',
    entityType: 'invoice',
    entityId: 'inv-456',
    userId: 'user-2',
    userEmail: 'sara@traf3li.com',
    userRole: 'accountant',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    status: 'success',
    severity: 'low',
    details: { invoiceNumber: 'INV-2024-045', amount: 15000 },
    changes: {
      before: { status: 'draft', amount: 12000 },
      after: { status: 'sent', amount: 15000 },
      fields: ['status', 'amount'],
    },
  },
  {
    _id: '3',
    action: 'delete',
    entityType: 'client',
    entityId: 'client-789',
    userId: 'user-1',
    userEmail: 'ahmed@traf3li.com',
    userRole: 'lawyer',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'success',
    severity: 'high',
    details: { clientName: 'ABC Corporation', reason: 'Duplicate entry' },
  },
  {
    _id: '4',
    action: 'login',
    entityType: 'auth',
    userId: 'user-3',
    userEmail: 'mohammed@traf3li.com',
    userRole: 'partner',
    ipAddress: '192.168.1.102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    status: 'success',
    severity: 'low',
    details: { method: 'email', mfaUsed: true },
  },
  {
    _id: '5',
    action: 'login',
    entityType: 'auth',
    userId: 'unknown',
    userEmail: 'attacker@malicious.com',
    ipAddress: '203.0.113.45',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    status: 'failure',
    severity: 'critical',
    details: { method: 'email', reason: 'Invalid credentials', attempts: 5 },
  },
  {
    _id: '6',
    action: 'update',
    entityType: 'settings',
    entityId: 'firm-settings',
    userId: 'user-1',
    userEmail: 'ahmed@traf3li.com',
    userRole: 'owner',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    status: 'success',
    severity: 'medium',
    details: { setting: 'security_policy', description: 'Updated password requirements' },
    changes: {
      before: { minLength: 8, requireSpecialChars: false },
      after: { minLength: 12, requireSpecialChars: true },
      fields: ['minLength', 'requireSpecialChars'],
    },
  },
  {
    _id: '7',
    action: 'create',
    entityType: 'user',
    entityId: 'user-4',
    userId: 'user-1',
    userEmail: 'ahmed@traf3li.com',
    userRole: 'owner',
    ipAddress: '192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    status: 'success',
    severity: 'medium',
    details: { newUser: 'fatima@traf3li.com', role: 'paralegal' },
  },
  {
    _id: '8',
    action: 'export',
    entityType: 'invoice',
    userId: 'user-2',
    userEmail: 'sara@traf3li.com',
    userRole: 'accountant',
    ipAddress: '192.168.1.101',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    status: 'success',
    severity: 'low',
    details: { format: 'pdf', count: 25, dateRange: '2024-01-01 to 2024-01-31' },
  },
]

// ==================== CONSTANTS ====================

const ACTION_TYPES = [
  { value: 'all', labelEn: 'All Actions', labelAr: 'جميع الإجراءات' },
  { value: 'create', labelEn: 'Create', labelAr: 'إنشاء' },
  { value: 'update', labelEn: 'Update', labelAr: 'تحديث' },
  { value: 'delete', labelEn: 'Delete', labelAr: 'حذف' },
  { value: 'login', labelEn: 'Login', labelAr: 'تسجيل دخول' },
  { value: 'logout', labelEn: 'Logout', labelAr: 'تسجيل خروج' },
  { value: 'export', labelEn: 'Export', labelAr: 'تصدير' },
  { value: 'import', labelEn: 'Import', labelAr: 'استيراد' },
]

const RESOURCE_TYPES = [
  { value: 'all', labelEn: 'All Resources', labelAr: 'جميع الموارد' },
  { value: 'case', labelEn: 'Cases', labelAr: 'القضايا' },
  { value: 'client', labelEn: 'Clients', labelAr: 'العملاء' },
  { value: 'invoice', labelEn: 'Invoices', labelAr: 'الفواتير' },
  { value: 'user', labelEn: 'Users', labelAr: 'المستخدمون' },
  { value: 'auth', labelEn: 'Authentication', labelAr: 'المصادقة' },
  { value: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات' },
]

// ==================== COMPONENT ====================

export function AuditLogViewer() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [resourceFilter, setResourceFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const itemsPerPage = 10

  // Mock data - in real app, this would come from API
  const auditLogs = MOCK_AUDIT_LOGS

  // Filtered logs
  const filteredLogs = useMemo(() => {
    let filtered = [...auditLogs]

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter((log) => log.userId === userFilter)
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter((log) => log.entityType === resourceFilter)
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= dateRange.from!)
    }
    if (dateRange.to) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= dateRange.to!)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          log.entityType.toLowerCase().includes(query) ||
          log.userEmail?.toLowerCase().includes(query) ||
          log.ipAddress?.toLowerCase().includes(query) ||
          JSON.stringify(log.details || {}).toLowerCase().includes(query)
      )
    }

    return filtered
  }, [auditLogs, userFilter, actionFilter, resourceFilter, dateRange, searchQuery])

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExportCSV = () => {
    // In real app, this would call the API
    console.log('Exporting to CSV...')
    // Create CSV content
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address']
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.userEmail || 'Unknown',
      log.action,
      log.entityType,
      log.status || 'N/A',
      log.ipAddress || 'N/A',
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
  }

  const handleExportPDF = () => {
    // In real app, this would call the API
    console.log('Exporting to PDF...')
  }

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setUserFilter('all')
    setActionFilter('all')
    setResourceFilter('all')
    setDateRange({})
    setCurrentPage(1)
  }

  // Helper functions
  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      create: <UserPlus className="h-4 w-4" />,
      update: <FileEdit className="h-4 w-4" />,
      delete: <Trash2 className="h-4 w-4" />,
      login: <LogIn className="h-4 w-4" />,
      logout: <Unlock className="h-4 w-4" />,
      export: <Download className="h-4 w-4" />,
      import: <Database className="h-4 w-4" />,
    }
    return icons[action] || <Settings className="h-4 w-4" />
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-700 border-green-200',
      update: 'bg-blue-100 text-blue-700 border-blue-200',
      delete: 'bg-red-100 text-red-700 border-red-200',
      login: 'bg-purple-100 text-purple-700 border-purple-200',
      logout: 'bg-gray-100 text-gray-700 border-gray-200',
      export: 'bg-amber-100 text-amber-700 border-amber-200',
      import: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    }
    return colors[action] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const getStatusBadge = (status?: string) => {
    if (status === 'success') {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          {t('audit.status.success', 'Success')}
        </Badge>
      )
    }
    if (status === 'failure') {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          {t('audit.status.failure', 'Failed')}
        </Badge>
      )
    }
    return <Badge variant="outline">{t('audit.status.unknown', 'Unknown')}</Badge>
  }

  const getSeverityBadge = (severity?: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-50 text-blue-600 border-blue-200',
      medium: 'bg-amber-50 text-amber-600 border-amber-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      critical: 'bg-red-50 text-red-600 border-red-200',
    }
    return (
      <Badge className={colors[severity || 'low'] || 'bg-slate-50 text-slate-600'}>
        {t(`audit.severity.${severity}`, severity)}
      </Badge>
    )
  }

  const getUserName = (userId: string) => {
    const user = MOCK_TEAM_MEMBERS.find((u) => u.id === userId)
    if (!user) return t('audit.unknownUser', 'Unknown User')
    return isRTL ? user.nameAr : user.name
  }

  const getUserInitials = (userId: string) => {
    const user = MOCK_TEAM_MEMBERS.find((u) => u.id === userId)
    if (!user) return '?'
    const name = isRTL ? user.nameAr : user.name
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: isRTL ? ar : enUS,
    })
  }

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-navy flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                {t('audit.title', 'Audit Logs')}
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {t('audit.subtitle', 'View and export comprehensive system activity logs')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 me-2" />
                {t('audit.exportCsv', 'CSV')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4 me-2" />
                {t('audit.exportPdf', 'PDF')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder={t('audit.searchPlaceholder', 'Search logs...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 border-slate-200"
              />
            </div>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder={t('audit.filterUser', 'User')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('audit.allUsers', 'All Users')}</SelectItem>
                {MOCK_TEAM_MEMBERS.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {isRTL ? user.nameAr : user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder={t('audit.filterAction', 'Action')} />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {isRTL ? action.labelAr : action.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Resource Filter */}
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder={t('audit.filterResource', 'Resource')} />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((resource) => (
                  <SelectItem key={resource.value} value={resource.value}>
                    {isRTL ? resource.labelAr : resource.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-start font-normal border-slate-200',
                    !dateRange.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="me-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')} -{' '}
                        {dateRange.to.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')
                    )
                  ) : (
                    <span>{t('audit.selectDateRange', 'Select date range')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range as { from?: Date; to?: Date })
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {(searchQuery ||
              userFilter !== 'all' ||
              actionFilter !== 'all' ||
              resourceFilter !== 'all' ||
              dateRange.from) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-900"
              >
                {t('audit.clearFilters', 'Clear Filters')}
              </Button>
            )}

            <div className="ms-auto text-sm text-slate-600">
              {t('audit.showing', 'Showing')} {filteredLogs.length} {t('audit.results', 'results')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="p-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {t('audit.loadError', 'Failed to load audit logs. Please try again.')}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-navy mb-2">
                {t('audit.noLogs', 'No audit logs found')}
              </h4>
              <p className="text-slate-500">
                {t('audit.noLogsDescription', 'Try adjusting your filters or date range')}
              </p>
            </div>
          )}

          {/* Success State - Table */}
          {!isLoading && !isError && paginatedLogs.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>{t('audit.timestamp', 'Timestamp')}</TableHead>
                    <TableHead>{t('audit.user', 'User')}</TableHead>
                    <TableHead>{t('audit.action', 'Action')}</TableHead>
                    <TableHead>{t('audit.resource', 'Resource')}</TableHead>
                    <TableHead>{t('audit.status', 'Status')}</TableHead>
                    <TableHead>{t('audit.severity', 'Severity')}</TableHead>
                    <TableHead>{t('audit.ipAddress', 'IP Address')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <>
                      <TableRow
                        key={log._id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => toggleRowExpansion(log._id!)}
                      >
                        <TableCell>
                          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                            {expandedRows.has(log._id!) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <div>
                              <div
                                className="text-sm font-medium text-slate-900"
                                title={formatFullDate(log.timestamp)}
                              >
                                {formatTimestamp(log.timestamp)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {getUserInitials(log.userId)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {getUserName(log.userId)}
                              </div>
                              <div className="text-xs text-slate-500">{log.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('border', getActionColor(log.action))}>
                            <span className="me-1">{getActionIcon(log.action)}</span>
                            {t(`audit.actions.${log.action}`, log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-700 font-medium">
                            {t(`audit.resources.${log.entityType}`, log.entityType)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {log.ipAddress || 'N/A'}
                          </code>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row Details */}
                      {expandedRows.has(log._id!) && (
                        <TableRow className="bg-slate-50">
                          <TableCell colSpan={8} className="p-6">
                            <div className="space-y-4">
                              <h5 className="font-semibold text-navy mb-3">
                                {t('audit.details', 'Details')}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Details */}
                                {log.details && (
                                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <h6 className="text-sm font-semibold text-slate-700 mb-2">
                                      {t('audit.eventDetails', 'Event Details')}
                                    </h6>
                                    <pre className="text-xs text-slate-600 overflow-x-auto">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* Changes */}
                                {log.changes && (
                                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                                    <h6 className="text-sm font-semibold text-slate-700 mb-2">
                                      {t('audit.changes', 'Changes')}
                                    </h6>
                                    <div className="space-y-2 text-xs">
                                      {log.changes.fields && log.changes.fields.length > 0 && (
                                        <div>
                                          <span className="font-medium text-slate-700">
                                            {t('audit.fieldsChanged', 'Fields changed')}:
                                          </span>{' '}
                                          <span className="text-slate-600">
                                            {log.changes.fields.join(', ')}
                                          </span>
                                        </div>
                                      )}
                                      {log.changes.before && (
                                        <div>
                                          <span className="font-medium text-red-700">
                                            {t('audit.before', 'Before')}:
                                          </span>
                                          <pre className="text-slate-600 mt-1">
                                            {JSON.stringify(log.changes.before, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {log.changes.after && (
                                        <div>
                                          <span className="font-medium text-green-700">
                                            {t('audit.after', 'After')}:
                                          </span>
                                          <pre className="text-slate-600 mt-1">
                                            {JSON.stringify(log.changes.after, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Technical Info */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                  <h6 className="text-sm font-semibold text-slate-700 mb-2">
                                    {t('audit.technicalInfo', 'Technical Information')}
                                  </h6>
                                  <div className="space-y-1 text-xs text-slate-600">
                                    <div>
                                      <span className="font-medium">{t('audit.method', 'Method')}:</span>{' '}
                                      {log.method || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('audit.endpoint', 'Endpoint')}:</span>{' '}
                                      {log.endpoint || 'N/A'}
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('audit.userAgent', 'User Agent')}:</span>{' '}
                                      <span className="break-all">{log.userAgent || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium">{t('audit.entityId', 'Entity ID')}:</span>{' '}
                                      {log.entityId || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {t('audit.page', 'Page')} {currentPage} {t('audit.of', 'of')} {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-200"
                >
                  {t('audit.previous', 'Previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-200"
                >
                  {t('audit.next', 'Next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
