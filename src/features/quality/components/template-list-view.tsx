/**
 * Quality Inspection Template List View
 * Main templates list page with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  ListChecks,
  Filter,
  Settings2,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useTemplates, useDeleteTemplate, useCreateTemplate } from '@/hooks/use-quality'
import type { QualityInspectionTemplate, InspectionType } from '@/types/quality'
import { QualitySidebar } from './quality-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.quality', href: ROUTES.dashboard.quality.list },
  { title: 'quality.templates', href: ROUTES.dashboard.quality.templates.list },
]

type StatusFilter = 'all' | 'active' | 'inactive'

export function TemplateListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState<InspectionType | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<QualityInspectionTemplate | null>(null)

  // Queries
  const { data: templatesData, isLoading, error } = useTemplates()
  const deleteTemplateMutation = useDeleteTemplate()
  const createTemplateMutation = useCreateTemplate()

  const templates = templatesData || []

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesName = template.name?.toLowerCase().includes(searchLower)
        const matchesNameAr = template.nameAr?.toLowerCase().includes(searchLower)
        const matchesItemCode = template.itemCode?.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesNameAr && !matchesItemCode) return false
      }

      // Status filter
      if (statusFilter !== 'all' && template.status !== statusFilter) return false

      // Inspection type filter (if we add it to template)
      // Currently templates don't have inspectionType, but keeping for future enhancement

      return true
    })
  }, [templates, search, statusFilter])

  // Stats calculations
  const totalTemplates = templates.length
  const activeTemplates = templates.filter((t) => t.status === 'active').length
  const inactiveTemplates = templates.filter((t) => t.status === 'inactive').length
  const totalParameters = templates.reduce((acc, t) => acc + (t.readings?.length || 0), 0)

  // Handlers
  const handleDelete = async () => {
    if (!templateToDelete) return
    try {
      await deleteTemplateMutation.mutateAsync(templateToDelete._id)
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleDuplicate = async (template: QualityInspectionTemplate) => {
    try {
      const newTemplate = {
        name: `${template.name} (نسخة)`,
        nameAr: template.nameAr ? `${template.nameAr} (نسخة)` : undefined,
        itemId: template.itemId,
        itemCode: template.itemCode,
        itemGroup: template.itemGroup,
        readings: template.readings || [],
        isDefault: false,
        status: 'active' as const,
      }
      await createTemplateMutation.mutateAsync(newTemplate)
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'active') {
      return (
        <Badge variant="default" className="bg-emerald-500">
          <CheckCircle2 className="w-3 h-3 ml-1" />
          {t('quality.template.status.active', 'نشط')}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
        <XCircle className="w-3 h-3 ml-1" />
        {t('quality.template.status.inactive', 'غير نشط')}
      </Badge>
    )
  }

  const getInspectionTypeBadge = (type: string) => {
    switch (type) {
      case 'incoming':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {t('quality.inspectionType.incoming', 'فحص وارد')}
          </Badge>
        )
      case 'outgoing':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {t('quality.inspectionType.outgoing', 'فحص صادر')}
          </Badge>
        )
      case 'in_process':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {t('quality.inspectionType.inProcess', 'فحص داخلي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('quality.badge', 'إدارة الجودة')}
          title={t('quality.templates.title', 'قوالب الفحص')}
          type="quality"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalTemplates}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.template.stats.total', 'إجمالي القوالب')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{activeTemplates}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.template.stats.active', 'قوالب نشطة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{inactiveTemplates}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.template.stats.inactive', 'غير نشطة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{totalParameters}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('quality.template.stats.parameters', 'معايير الفحص')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">{t('common.all', 'الكل')}</TabsTrigger>
                    <TabsTrigger value="active">
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                      {t('quality.template.status.active', 'نشط')}
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                      <XCircle className="w-4 h-4 ml-2" />
                      {t('quality.template.status.inactive', 'غير نشط')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Search and Create Button Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          'quality.template.searchPlaceholder',
                          'البحث بالاسم أو رمز الصنف...'
                        )}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to={ROUTES.dashboard.quality.templates.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('quality.template.createTemplate', 'إنشاء قالب')}
                      </Link>
                    </Button>
                  </div>

                  {/* Inspection Type Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <Select
                      value={inspectionTypeFilter}
                      onValueChange={(value) => setInspectionTypeFilter(value as InspectionType | 'all')}
                    >
                      <SelectTrigger className="w-full md:w-[250px] rounded-xl">
                        <Filter className="w-4 h-4 ml-2" />
                        <SelectValue placeholder={t('quality.template.filterByType', 'تصفية حسب نوع الفحص')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                        <SelectItem value="incoming">
                          {t('quality.inspectionType.incoming', 'فحص وارد')}
                        </SelectItem>
                        <SelectItem value="outgoing">
                          {t('quality.inspectionType.outgoing', 'فحص صادر')}
                        </SelectItem>
                        <SelectItem value="in_process">
                          {t('quality.inspectionType.inProcess', 'فحص داخلي')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {(search || inspectionTypeFilter !== 'all') && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearch('')
                          setInspectionTypeFilter('all')
                        }}
                        className="rounded-xl"
                      >
                        {t('common.clearFilters', 'مسح الفلاتر')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">
                    {t('common.error', 'حدث خطأ في تحميل البيانات')}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="p-12 text-center">
                    <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('quality.template.noTemplates', 'لا توجد قوالب فحص')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('quality.template.noTemplatesDesc', 'ابدأ بإنشاء قالب فحص جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.quality.templates.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('quality.template.createTemplate', 'إنشاء قالب')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('quality.template.templateName', 'اسم القالب')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.template.itemCode', 'رمز الصنف')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.template.parametersCount', 'عدد المعايير')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.template.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('quality.template.lastUpdated', 'آخر تحديث')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates.map((template) => (
                          <TableRow
                            key={template._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: `${ROUTES.dashboard.quality.templates.list}/${template._id}` })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  {template.nameAr && (
                                    <div className="text-xs text-muted-foreground">{template.nameAr}</div>
                                  )}
                                  {template.isDefault && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {t('quality.template.default', 'افتراضي')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {template.itemCode ? (
                                <div>
                                  <div className="font-medium font-mono">{template.itemCode}</div>
                                  {template.itemGroup && (
                                    <div className="text-xs text-muted-foreground">{template.itemGroup}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  {t('quality.template.general', 'عام')}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold text-purple-600">
                                  {template.readings?.length || 0}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {t('quality.template.parameters', 'معايير')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(template.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(template.updatedAt)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `${ROUTES.dashboard.quality.templates.list}/${template._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `${ROUTES.dashboard.quality.templates.list}/${template._id}/edit` })
                                    }}
                                  >
                                    <Edit className="w-4 h-4 ml-2" />
                                    {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDuplicate(template)
                                    }}
                                  >
                                    <Copy className="w-4 h-4 ml-2" />
                                    {t('common.duplicate', 'نسخ')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setTemplateToDelete(template)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <QualitySidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('quality.template.deleteConfirmTitle', 'حذف قالب الفحص')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'quality.template.deleteConfirmDesc',
                'هل أنت متأكد من حذف قالب الفحص هذا؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
              {templateToDelete && (
                <div className="mt-2 p-2 bg-muted rounded-lg">
                  <div className="font-medium">{templateToDelete.name}</div>
                  {templateToDelete.nameAr && (
                    <div className="text-sm text-muted-foreground">{templateToDelete.nameAr}</div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
