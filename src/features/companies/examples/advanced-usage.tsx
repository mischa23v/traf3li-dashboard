/**
 * Advanced Multi-Company Usage Examples
 * Demonstrates complex scenarios and best practices
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { CompanySwitcher } from '../components/company-switcher'

// ==================== EXAMPLE 1: CONSOLIDATED DASHBOARD ====================

export function ConsolidatedDashboard() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    activeCompany,
    selectedCompanyIds,
    isMultiSelectMode,
    toggleMultiSelect,
  } = useCompanyContext()

  // Fetch stats for selected companies
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', selectedCompanyIds],
    queryFn: async () => {
      // Mock API call - replace with your actual API
      return {
        totalRevenue: 150000,
        totalEmployees: 120,
        totalCustomers: 450,
        growth: 15.5,
      }
    },
    enabled: selectedCompanyIds.length > 0,
  })

  return (
    <div className="space-y-6">
      {/* Header with company switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'لوحة المعلومات' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isMultiSelectMode
              ? isArabic
                ? `عرض موحد لـ ${selectedCompanyIds.length} شركات`
                : `Consolidated view of ${selectedCompanyIds.length} companies`
              : activeCompany?.nameAr || activeCompany?.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={toggleMultiSelect}
          >
            {isMultiSelectMode
              ? isArabic
                ? 'تعطيل العرض الموحد'
                : 'Disable Consolidated View'
              : isArabic
              ? 'تفعيل العرض الموحد'
              : 'Enable Consolidated View'}
          </Button>
          <CompanySwitcher />
        </div>
      </div>

      {/* Multi-select indicator */}
      {isMultiSelectMode && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {isArabic
                  ? `البيانات من ${selectedCompanyIds.length} شركات`
                  : `Data from ${selectedCompanyIds.length} companies`}
              </span>
            </div>
            <Badge variant="secondary">
              {isArabic ? 'عرض موحد' : 'Consolidated'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isArabic ? 'الإيرادات' : 'Revenue'}
          value={`$${stats?.totalRevenue.toLocaleString() || 0}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={stats?.growth}
        />
        <StatCard
          title={isArabic ? 'الموظفون' : 'Employees'}
          value={stats?.totalEmployees || 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title={isArabic ? 'العملاء' : 'Customers'}
          value={stats?.totalCustomers || 0}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title={isArabic ? 'النمو' : 'Growth'}
          value={`${stats?.growth || 0}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={stats?.growth}
        />
      </div>
    </div>
  )
}

// ==================== EXAMPLE 2: CROSS-COMPANY REPORTS ====================

export function CrossCompanyReports() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    selectedCompanyIds,
    accessibleCompanies,
    isMultiSelectMode,
    selectCompany,
    deselectCompany,
  } = useCompanyContext()

  // Fetch report data for selected companies
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', 'comparison', selectedCompanyIds],
    queryFn: async () => {
      // Mock API call
      return selectedCompanyIds.map((id) => ({
        companyId: id,
        revenue: Math.random() * 100000,
        expenses: Math.random() * 50000,
        profit: Math.random() * 50000,
      }))
    },
    enabled: selectedCompanyIds.length > 0,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'مقارنة الشركات' : 'Company Comparison'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Company selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">
              {isArabic ? 'اختر الشركات للمقارنة' : 'Select Companies to Compare'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {accessibleCompanies.map((company) => {
                const isSelected = selectedCompanyIds.includes(company._id)
                return (
                  <Button
                    key={company._id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      isSelected
                        ? deselectCompany(company._id)
                        : selectCompany(company._id)
                    }
                  >
                    {isArabic ? company.nameAr || company.name : company.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Comparison table */}
          {reportData && reportData.length > 0 && (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">
                      {isArabic ? 'الشركة' : 'Company'}
                    </th>
                    <th className="p-2 text-right font-medium">
                      {isArabic ? 'الإيرادات' : 'Revenue'}
                    </th>
                    <th className="p-2 text-right font-medium">
                      {isArabic ? 'المصروفات' : 'Expenses'}
                    </th>
                    <th className="p-2 text-right font-medium">
                      {isArabic ? 'الربح' : 'Profit'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => {
                    const company = accessibleCompanies.find(
                      (c) => c._id === row.companyId
                    )
                    return (
                      <tr key={row.companyId} className="border-b">
                        <td className="p-2">
                          {isArabic
                            ? company?.nameAr || company?.name
                            : company?.name}
                        </td>
                        <td className="p-2 text-right">
                          ${row.revenue.toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          ${row.expenses.toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-medium">
                          ${row.profit.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== EXAMPLE 3: PARENT-CHILD HIERARCHY ====================

export function HierarchicalView() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    activeCompany,
    accessibleCompanies,
    canAccessCompany,
  } = useCompanyContext()

  // Get child companies
  const childCompanies = accessibleCompanies.filter(
    (c) => c.parentCompanyId === activeCompany?._id
  )

  // Fetch aggregated data
  const { data: aggregatedData } = useQuery({
    queryKey: ['hierarchy-data', activeCompany?._id],
    queryFn: async () => {
      // Mock API call - get data for parent and all children
      return {
        parent: {
          revenue: 500000,
          employees: 50,
        },
        children: childCompanies.map((child) => ({
          companyId: child._id,
          revenue: Math.random() * 100000,
          employees: Math.floor(Math.random() * 20),
        })),
      }
    },
    enabled: !!activeCompany,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'العرض الهرمي' : 'Hierarchical View'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Parent company */}
          <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {isArabic
                      ? activeCompany?.nameAr || activeCompany?.name
                      : activeCompany?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'الشركة الرئيسية' : 'Parent Company'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'الإيرادات' : 'Revenue'}
                </p>
                <p className="text-lg font-semibold">
                  ${aggregatedData?.parent.revenue.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Child companies */}
          {childCompanies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'الشركات الفرعية' : 'Child Companies'} (
                {childCompanies.length})
              </h4>
              {childCompanies.map((child) => {
                const childData = aggregatedData?.children.find(
                  (d) => d.companyId === child._id
                )
                return (
                  <div
                    key={child._id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {isArabic ? child.nameAr || child.name : child.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {child.code}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${childData?.revenue.toFixed(0) || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {childData?.employees || 0}{' '}
                          {isArabic ? 'موظف' : 'employees'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {childCompanies.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {isArabic ? 'لا توجد شركات فرعية' : 'No child companies'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== HELPER COMPONENTS ====================

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p
            className={cn(
              'text-xs',
              trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
            )}
          >
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== EXAMPLE 4: PERMISSION-BASED RENDERING ====================

export function PermissionBasedUI() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const {
    activeCompanyId,
    canManageCompany,
    getCompanyAccess,
    hasRole,
  } = useCompanyContext()

  const access = getCompanyAccess(activeCompanyId!)
  const isAdmin = hasRole(activeCompanyId!, 'admin')
  const canManage = canManageCompany(activeCompanyId!)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isArabic ? 'الصلاحيات والأدوار' : 'Permissions & Roles'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show user's role */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {isArabic ? 'دورك' : 'Your Role'}
          </p>
          <Badge variant="secondary" className="capitalize">
            {access?.role || 'No access'}
          </Badge>
        </div>

        {/* Admin-only section */}
        {isAdmin && (
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <h4 className="font-medium mb-2">
              {isArabic ? 'قسم المسؤولين فقط' : 'Admin Only Section'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isArabic
                ? 'هذا المحتوى متاح للمسؤولين فقط'
                : 'This content is only visible to admins'}
            </p>
          </div>
        )}

        {/* Manager/Admin actions */}
        {canManage && (
          <div className="flex gap-2">
            <Button size="sm">
              {isArabic ? 'تعديل الإعدادات' : 'Edit Settings'}
            </Button>
            <Button size="sm" variant="outline">
              {isArabic ? 'إدارة المستخدمين' : 'Manage Users'}
            </Button>
          </div>
        )}

        {/* Read-only notice */}
        {!canManage && (
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? 'ليس لديك صلاحيات الإدارة لهذه الشركة'
              : "You don't have management permissions for this company"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
