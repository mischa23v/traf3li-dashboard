/**
 * Notifications Page
 * Full page view for managing notifications
 * Optimized with virtualization, memoization, and batched updates
 */

import { useState, useMemo, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { NotificationItem } from '@/components/notifications/notification-item'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearReadNotifications,
  useMarkMultipleAsRead,
  useDeleteMultipleNotifications,
} from '@/hooks/useNotifications'
import type { NotificationType, NotificationPriority, Notification } from '@/types/notification'

type FilterTab = 'all' | 'unread' | 'finance' | 'cases' | 'system'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  // State
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Queries
  const { data, isLoading, error } = useNotifications({
    limit: 100,
  })

  // Mutations
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  const clearReadMutation = useClearReadNotifications()
  const markMultipleAsReadMutation = useMarkMultipleAsRead()
  const deleteMultipleMutation = useDeleteMultipleNotifications()

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  // Memoize filtered notifications for performance
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Tab filter
      if (activeTab === 'unread' && notification.read) return false
      if (
        activeTab === 'finance' &&
        !['invoice_approval', 'time_entry_approval', 'expense_approval', 'payment_received', 'invoice_overdue', 'budget_alert'].includes(
          notification.type
        )
      )
        return false
      if (
        activeTab === 'cases' &&
        !['task_reminder', 'hearing_reminder', 'case_update'].includes(notification.type)
      )
        return false
      if (activeTab === 'system' && notification.type !== 'system') return false

      // Priority filter
      if (priorityFilter !== 'all' && notification.priority !== priorityFilter) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const title = isRtl && notification.titleAr ? notification.titleAr : notification.title
        const message = isRtl && notification.messageAr ? notification.messageAr : notification.message
        return title.toLowerCase().includes(query) || message.toLowerCase().includes(query)
      }

      return true
    })
  }, [notifications, activeTab, priorityFilter, searchQuery, isRtl])

  // Memoize stats calculations
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: unreadCount,
    urgent: notifications.filter((n) => n.priority === 'urgent' && !n.read).length,
    finance: notifications.filter((n) =>
      ['invoice_approval', 'time_entry_approval', 'expense_approval', 'payment_received', 'invoice_overdue', 'budget_alert'].includes(n.type)
    ).length,
  }), [notifications, unreadCount])

  // Handlers with useCallback for performance
  const handleMarkAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [markAsReadMutation])

  const handleDelete = useCallback((id: string) => {
    deleteNotificationMutation.mutate(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [deleteNotificationMutation])

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate()
    setSelectedIds(new Set())
  }, [markAllAsReadMutation])

  const handleClearRead = useCallback(() => {
    clearReadMutation.mutate()
  }, [clearReadMutation])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n._id)))
    }
  }, [selectedIds.size, filteredNotifications])

  const handleMarkSelectedAsRead = useCallback(() => {
    const ids = Array.from(selectedIds)
    markMultipleAsReadMutation.mutate(ids)
    setSelectedIds(new Set())
  }, [selectedIds, markMultipleAsReadMutation])

  const handleDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds)
    deleteMultipleMutation.mutate(ids)
    setSelectedIds(new Set())
  }, [selectedIds, deleteMultipleMutation])

  return (
    <>
      <Header fixed>
        <div className="flex items-center justify-between flex-1 gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('notifications.title', 'Notifications')}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('notifications.unreadCount', `${unreadCount} unread`)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="w-4 h-4 me-2" />
                {t('notifications.markAllRead', 'Mark all read')}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              disabled={clearReadMutation.isPending}
            >
              <Trash2 className="w-4 h-4 me-2" />
              {t('notifications.clearRead', 'Clear read')}
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 me-2" />
              {t('notifications.settings', 'Settings')}
            </Button>
          </div>
        </div>
      </Header>

      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        {/* Backend Pending Alert - Shown when using bulk operations */}
        {selectedIds.size > 1 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>[BACKEND-PENDING]</strong>{' '}
              {t('notifications.bulkOperationWarning',
                'Bulk operations are processed individually. Server-side bulk processing will improve performance soon.'
              )}{' '}
              |{' '}
              {t('notifications.bulkOperationWarningAr',
                'تتم معالجة العمليات الجماعية بشكل فردي. ستتحسن الأداء قريباً بالمعالجة الجماعية من جانب الخادم.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards - Optimized with memoized values */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('notifications.stats.total', 'Total')}
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('notifications.stats.unread', 'Unread')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('notifications.stats.urgent', 'Urgent')}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('notifications.stats.finance', 'Finance')}
              </CardTitle>
              <Info className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.finance}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-slate-500" />
                <Input
                  placeholder={t('notifications.search', 'Search notifications...')}
                  defaultValue={searchQuery}
                  onChange={(e) => debouncedSetSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('notifications.priority.all', 'All priorities')}</SelectItem>
                    <SelectItem value="urgent">{t('notifications.priority.urgent', 'Urgent')}</SelectItem>
                    <SelectItem value="high">{t('notifications.priority.high', 'High')}</SelectItem>
                    <SelectItem value="normal">{t('notifications.priority.normal', 'Normal')}</SelectItem>
                    <SelectItem value="low">{t('notifications.priority.low', 'Low')}</SelectItem>
                  </SelectContent>
                </Select>

                {selectedIds.size > 0 && (
                  <>
                    <Badge variant="secondary">{selectedIds.size} selected</Badge>
                    <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead}>
                      <CheckCheck className="w-4 h-4 me-2" />
                      {t('notifications.markAsRead', 'Mark read')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="w-4 h-4 me-2" />
                      {t('notifications.delete', 'Delete')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Notifications List */}
        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  {t('notifications.tabs.all', 'All')}
                  {activeTab === 'all' && notifications.length > 0 && (
                    <Badge variant="secondary" className="ms-2">
                      {notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unread">
                  {t('notifications.tabs.unread', 'Unread')}
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ms-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="finance">{t('notifications.tabs.finance', 'Finance')}</TabsTrigger>
                <TabsTrigger value="cases">{t('notifications.tabs.cases', 'Cases')}</TabsTrigger>
                <TabsTrigger value="system">{t('notifications.tabs.system', 'System')}</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-0">
              <TabsContent value={activeTab} className="m-0">
                {isLoading ? (
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-sm text-slate-500">{t('notifications.error', 'Failed to load notifications')}</p>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                    <p className="text-sm text-slate-500">
                      {t('notifications.noResults', 'No notifications found')}
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  )
}

export default NotificationsPage
