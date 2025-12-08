/**
 * AccessMatrixManager Component
 * Admin UI for managing role-based sidebar and page access
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAccessMatrix,
  useAllSidebarItems,
  useAllPageAccess,
  useBulkUpdateRoleAccess,
} from '@/hooks/useUIAccess'
import { USER_ROLES } from '@/types/uiAccess'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Check,
  X,
  Save,
  RefreshCw,
  Search,
  Shield,
  LayoutGrid,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AccessMatrixManagerProps {
  className?: string
}

interface PendingChanges {
  [role: string]: {
    sidebar?: Record<string, boolean>
    pages?: Record<string, boolean>
  }
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function MatrixSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              {USER_ROLES.slice(0, 5).map((_, i) => (
                <TableHead key={i}><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                {USER_ROLES.slice(0, 5).map((_, i) => (
                  <TableCell key={i}><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ACCESS TOGGLE BUTTON
// ═══════════════════════════════════════════════════════════════

function AccessToggle({
  isAllowed,
  isChanged,
  isSystem,
  onToggle,
}: {
  isAllowed: boolean
  isChanged: boolean
  isSystem: boolean
  onToggle: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            disabled={isSystem}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              isSystem && 'cursor-not-allowed opacity-50',
              !isSystem && 'cursor-pointer hover:scale-110',
              isAllowed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
              isChanged && 'ring-2 ring-yellow-400 ring-offset-2'
            )}
          >
            {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isSystem ? 'نظام - لا يمكن التعديل' : isAllowed ? 'مسموح' : 'ممنوع'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function AccessMatrixManager({ className }: AccessMatrixManagerProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [activeTab, setActiveTab] = useState<'sidebar' | 'pages'>('sidebar')
  const [searchQuery, setSearchQuery] = useState('')
  const [changes, setChanges] = useState<PendingChanges>({})

  const { data: matrix, isLoading: matrixLoading, refetch } = useAccessMatrix()
  const { data: sidebarItems, isLoading: sidebarLoading } = useAllSidebarItems()
  const { data: pages, isLoading: pagesLoading } = useAllPageAccess()
  const bulkUpdate = useBulkUpdateRoleAccess()

  const isLoading = matrixLoading || sidebarLoading || pagesLoading

  // Calculate if there are pending changes
  const hasChanges = useMemo(() => Object.keys(changes).length > 0, [changes])

  // Filter items based on search
  const filteredSidebarItems = useMemo(() => {
    if (!sidebarItems) return []
    if (!searchQuery) return sidebarItems
    const query = searchQuery.toLowerCase()
    return sidebarItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.nameAr?.toLowerCase().includes(query) ||
        item.label?.toLowerCase().includes(query) ||
        item.path?.toLowerCase().includes(query)
    )
  }, [sidebarItems, searchQuery])

  const filteredPages = useMemo(() => {
    if (!pages) return []
    if (!searchQuery) return pages
    const query = searchQuery.toLowerCase()
    return pages.filter(
      (page) =>
        page.name?.toLowerCase().includes(query) ||
        page.nameAr?.toLowerCase().includes(query) ||
        page.path?.toLowerCase().includes(query) ||
        page.routePattern?.toLowerCase().includes(query)
    )
  }, [pages, searchQuery])

  // Get current value (with pending changes)
  const getValue = (type: 'sidebar' | 'pages', itemId: string, role: string): boolean => {
    // Check pending changes first
    const changeKey = type === 'sidebar' ? 'sidebar' : 'pages'
    if (changes[role]?.[changeKey]?.[itemId] !== undefined) {
      return changes[role][changeKey][itemId]
    }
    // Fall back to matrix value
    return matrix?.[type]?.[itemId]?.roles?.[role] ?? false
  }

  // Check if value has been changed
  const isChanged = (type: 'sidebar' | 'pages', itemId: string, role: string): boolean => {
    const changeKey = type === 'sidebar' ? 'sidebar' : 'pages'
    return changes[role]?.[changeKey]?.[itemId] !== undefined
  }

  // Handle toggle
  const handleToggle = (type: 'sidebar' | 'pages', itemId: string, role: string) => {
    const currentValue = getValue(type, itemId, role)
    const changeKey = type === 'sidebar' ? 'sidebar' : 'pages'

    setChanges((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [changeKey]: {
          ...prev[role]?.[changeKey],
          [itemId]: !currentValue,
        },
      },
    }))
  }

  // Save all changes
  const handleSave = async () => {
    try {
      const promises = Object.entries(changes).map(([role, data]) =>
        bulkUpdate.mutateAsync({ role, updates: data })
      )
      await Promise.all(promises)
      setChanges({})
      toast.success('تم حفظ التغييرات بنجاح')
      refetch()
    } catch (error) {
      toast.error('فشل حفظ التغييرات')
    }
  }

  // Discard changes
  const handleDiscard = () => {
    setChanges({})
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            مصفوفة الصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MatrixSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('accessMatrix.title', 'مصفوفة الصلاحيات')}
            </CardTitle>
            <CardDescription>
              {t('accessMatrix.description', 'تحكم في صلاحيات الوصول لكل دور')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={bulkUpdate.isPending}
            >
              <RefreshCw className={cn('me-2 h-4 w-4', bulkUpdate.isPending && 'animate-spin')} />
              {t('common.refresh')}
            </Button>
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                >
                  {t('common.discard')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={bulkUpdate.isPending}
                >
                  <Save className="me-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Warning for pending changes */}
        {hasChanges && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{t('accessMatrix.unsavedChanges', 'لديك تغييرات غير محفوظة')}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sidebar' | 'pages')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="sidebar" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                {t('accessMatrix.sidebar', 'القوائم الجانبية')}
                <Badge variant="secondary">{sidebarItems?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pages" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('accessMatrix.pages', 'الصفحات')}
                <Badge variant="secondary">{pages?.length || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>

          {/* Sidebar Matrix */}
          <TabsContent value="sidebar">
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky start-0 bg-muted/50 min-w-[200px]">
                      {t('accessMatrix.menuItem', 'عنصر القائمة')}
                    </TableHead>
                    {USER_ROLES.map((role) => (
                      <TableHead key={role.value} className="text-center min-w-[80px]">
                        <span className="text-xs">{isArabic ? role.label : role.labelEn}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSidebarItems.map((item) => (
                    <TableRow key={item.itemId} className="hover:bg-muted/50">
                      <TableCell className="sticky start-0 bg-background">
                        <div>
                          <span className="font-medium">
                            {isArabic ? (item.nameAr || item.label) : (item.labelEn || item.name)}
                          </span>
                          <p className="text-xs text-muted-foreground">{item.path}</p>
                        </div>
                      </TableCell>
                      {USER_ROLES.map((role) => (
                        <TableCell key={role.value} className="text-center">
                          <AccessToggle
                            isAllowed={getValue('sidebar', item.itemId, role.value)}
                            isChanged={isChanged('sidebar', item.itemId, role.value)}
                            isSystem={false}
                            onToggle={() => handleToggle('sidebar', item.itemId, role.value)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Pages Matrix */}
          <TabsContent value="pages">
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky start-0 bg-muted/50 min-w-[200px]">
                      {t('accessMatrix.page', 'الصفحة')}
                    </TableHead>
                    {USER_ROLES.map((role) => (
                      <TableHead key={role.value} className="text-center min-w-[80px]">
                        <span className="text-xs">{isArabic ? role.label : role.labelEn}</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.pageId} className="hover:bg-muted/50">
                      <TableCell className="sticky start-0 bg-background">
                        <div>
                          <span className="font-medium">
                            {isArabic ? (page.nameAr || page.name) : (page.nameEn || page.name)}
                          </span>
                          <p className="text-xs text-muted-foreground">{page.routePattern || page.path}</p>
                          {page.isSystem && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {t('accessMatrix.system', 'نظام')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {USER_ROLES.map((role) => (
                        <TableCell key={role.value} className="text-center">
                          <AccessToggle
                            isAllowed={getValue('pages', page.pageId, role.value)}
                            isChanged={isChanged('pages', page.pageId, role.value)}
                            isSystem={page.isSystem}
                            onToggle={() => handleToggle('pages', page.pageId, role.value)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AccessMatrixManager
