import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Copy,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { SalaryComponentDialog } from '@/components/hr/payroll/SalaryComponentDialog'
import {
  useSalaryComponents,
  useComponentsStats,
  useDeleteSalaryComponent,
  useDuplicateComponent,
  useToggleComponentStatus,
  useSeedDefaultComponents,
} from '@/hooks/useSalaryComponent'
import type { SalaryComponent, ComponentType } from '@/services/salaryComponentService'
import { toast } from 'sonner'

export default function SalaryComponentsPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ComponentType | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<SalaryComponent | undefined>()

  // Queries
  const { data: componentsData, isLoading } = useSalaryComponents({
    search: searchQuery,
    type: selectedType === 'all' ? undefined : selectedType,
  })
  const { data: stats } = useComponentsStats()

  // Mutations
  const deleteMutation = useDeleteSalaryComponent()
  const duplicateMutation = useDuplicateComponent()
  const toggleStatusMutation = useToggleComponentStatus()
  const seedDefaultsMutation = useSeedDefaultComponents()

  const components = componentsData?.components || []

  // Handlers
  const handleCreate = () => {
    setSelectedComponent(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (component: SalaryComponent) => {
    setSelectedComponent(component)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا المكون؟' : 'Are you sure you want to delete this component?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id)
  }

  const handleToggleStatus = async (id: string) => {
    await toggleStatusMutation.mutateAsync(id)
  }

  const handleSeedDefaults = async () => {
    if (confirm(isArabic ? 'هل تريد إضافة المكونات القياسية السعودية؟' : 'Do you want to add Saudi standard components?')) {
      await seedDefaultsMutation.mutateAsync()
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'مكونات الراتب' : 'Salary Components'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة البدلات والاستقطاعات والمكونات الأخرى للراتب'
              : 'Manage allowances, deductions, and other salary components'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedDefaults}>
            <Upload className="mr-2 h-4 w-4" />
            {isArabic ? 'إضافة المكونات القياسية' : 'Add Defaults'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {isArabic ? 'مكون جديد' : 'New Component'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المكونات' : 'Total Components'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeComponents || 0} {isArabic ? 'نشط' : 'active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الاستحقاقات' : 'Earnings'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.earningComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مكونات الدخل' : 'Income components'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الاستقطاعات' : 'Deductions'}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deductionComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مكونات الخصم' : 'Deduction components'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المعادلات' : 'Formula-based'}
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.formulaBasedComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مبني على معادلات' : 'Based on formulas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as ComponentType | 'all')}>
            <TabsList>
              <TabsTrigger value="all">
                {isArabic ? 'الكل' : 'All'} ({stats?.totalComponents || 0})
              </TabsTrigger>
              <TabsTrigger value="earning">
                {isArabic ? 'الاستحقاقات' : 'Earnings'} ({stats?.earningComponents || 0})
              </TabsTrigger>
              <TabsTrigger value="deduction">
                {isArabic ? 'الاستقطاعات' : 'Deductions'} ({stats?.deductionComponents || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? 'الرمز' : 'Code'}</TableHead>
                      <TableHead>{isArabic ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                      <TableHead>{isArabic ? 'القيمة' : 'Value'}</TableHead>
                      <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {isArabic ? 'لا توجد مكونات' : 'No components found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      components.map((component) => (
                        <TableRow key={component._id}>
                          <TableCell className="font-mono font-semibold">
                            {component.abbr}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {isArabic ? component.nameAr : component.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {isArabic ? component.descriptionAr : component.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={component.type === 'earning' ? 'default' : 'destructive'}>
                              {component.type === 'earning'
                                ? isArabic
                                  ? 'استحقاق'
                                  : 'Earning'
                                : isArabic
                                ? 'استقطاع'
                                : 'Deduction'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {component.amountBasedOnFormula ? (
                              <div className="text-sm">
                                <code className="rounded bg-muted px-1 py-0.5">
                                  {component.formula}
                                </code>
                              </div>
                            ) : (
                              <div className="font-medium">
                                {component.amount?.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={component.isActive ? 'default' : 'secondary'}>
                              {component.isActive
                                ? isArabic
                                  ? 'نشط'
                                  : 'Active'
                                : isArabic
                                ? 'غير نشط'
                                : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  {isArabic ? 'الإجراءات' : 'Actions'}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(component)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(component._id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  {isArabic ? 'نسخ' : 'Duplicate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(component._id)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {component.isActive
                                    ? isArabic
                                      ? 'تعطيل'
                                      : 'Deactivate'
                                    : isArabic
                                    ? 'تفعيل'
                                    : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(component._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {isArabic ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog */}
      <SalaryComponentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        component={selectedComponent}
      />
    </div>
  )
}
