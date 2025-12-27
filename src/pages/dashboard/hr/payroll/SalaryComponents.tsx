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
    if (confirm(t('hr.payroll.components.deleteConfirm'))) {
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
    if (confirm(t('hr.payroll.components.seedDefaultsConfirm'))) {
      await seedDefaultsMutation.mutateAsync()
    }
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t('hr.payroll.components.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('hr.payroll.components.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeedDefaults}>
            <Upload className="mr-2 h-4 w-4" />
            {t('hr.payroll.components.addDefaults')}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t('hr.payroll.components.newComponent')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.payroll.components.stats.totalComponents')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeComponents || 0} {t('hr.payroll.components.stats.active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.payroll.components.stats.earnings')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.earningComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.payroll.components.stats.incomeComponents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.payroll.components.stats.deductions')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deductionComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.payroll.components.stats.deductionComponents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('hr.payroll.components.stats.formulaBased')}
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.formulaBasedComponents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('hr.payroll.components.stats.basedOnFormulas')}
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
                  placeholder={t('common.search')}
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
                {t('common.all')} ({stats?.totalComponents || 0})
              </TabsTrigger>
              <TabsTrigger value="earning">
                {t('hr.payroll.components.tabs.earnings')} ({stats?.earningComponents || 0})
              </TabsTrigger>
              <TabsTrigger value="deduction">
                {t('hr.payroll.components.tabs.deductions')} ({stats?.deductionComponents || 0})
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
                      <TableHead>{t('hr.payroll.components.table.code')}</TableHead>
                      <TableHead>{t('hr.payroll.components.table.name')}</TableHead>
                      <TableHead>{t('hr.payroll.components.table.type')}</TableHead>
                      <TableHead>{t('hr.payroll.components.table.value')}</TableHead>
                      <TableHead>{t('hr.payroll.components.table.status')}</TableHead>
                      <TableHead className="text-right">{t('hr.payroll.components.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {t('hr.payroll.components.noComponents')}
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
                                {i18n.language === 'ar' ? component.nameAr : component.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {i18n.language === 'ar' ? component.descriptionAr : component.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={component.type === 'earning' ? 'default' : 'destructive'}>
                              {component.type === 'earning'
                                ? t('hr.payroll.components.type.earning')
                                : t('hr.payroll.components.type.deduction')}
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
                                {component.amount?.toLocaleString()} {t('common.currency.sar')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={component.isActive ? 'default' : 'secondary'}>
                              {component.isActive
                                ? t('common.status.active')
                                : t('common.status.inactive')}
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
                                  {t('hr.payroll.components.table.actions')}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(component)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('common.actions.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(component._id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  {t('hr.payroll.components.actions.duplicate')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(component._id)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  {component.isActive
                                    ? t('hr.payroll.components.actions.deactivate')
                                    : t('hr.payroll.components.actions.activate')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(component._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('common.actions.delete')}
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
