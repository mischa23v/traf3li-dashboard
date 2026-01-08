/**
 * GOSI Calculator View
 *
 * Calculate GOSI (General Organization for Social Insurance) contributions
 * for Saudi and non-Saudi employees based on current regulations.
 *
 * CRITICAL: Accurate calculations are essential for compliance.
 * Rates last updated: July 2024 GOSI Reform
 */

import { useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  GosiCard,
  GosiCardHeader,
  GosiCardTitle,
  GosiCardContent,
  GosiInput,
  GosiLabel,
  GosiSelect,
  GosiSelectTrigger,
  GosiSelectContent,
  GosiButton,
} from '@/components/ui/gosi-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  ChevronLeft,
  Calculator,
  Plus,
  Trash2,
  Download,
  Shield,
  AlertTriangle,
  Info,
  Users,
  Building2,
  Printer,
  RefreshCw,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import {
  GOSI_RATES,
  SANED_RATES,
  GOSI_SALARY_CONSTRAINTS,
  calculateGOSIContribution,
} from '@/constants/saudi-banking'
import { toast } from 'sonner'

// Employee entry for calculation
interface EmployeeEntry {
  id: string
  name: string
  nationality: 'saudi' | 'non_saudi'
  basicSalary: number
  housingAllowance: number
  isReformEmployee: boolean // Hired after July 3, 2024
}

// Calculation result
interface CalculationResult {
  employee: EmployeeEntry
  totalSalary: number
  cappedSalary: number
  employerContribution: number
  employeeContribution: number
  totalContribution: number
  sanedEmployer: number
  sanedEmployee: number
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Default employee template
function createDefaultEmployee(): EmployeeEntry {
  return {
    id: generateId(),
    name: '',
    nationality: 'saudi',
    basicSalary: 0,
    housingAllowance: 0,
    isReformEmployee: false,
  }
}

export function GOSICalculatorView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [employees, setEmployees] = useState<EmployeeEntry[]>([createDefaultEmployee()])
  const [includeSaned, setIncludeSaned] = useState(true)

  // Navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
  ]

  // Add employee
  const handleAddEmployee = useCallback(() => {
    setEmployees((prev) => [...prev, createDefaultEmployee()])
  }, [])

  // Remove employee
  const handleRemoveEmployee = useCallback((id: string) => {
    setEmployees((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev))
  }, [])

  // Update employee
  const handleUpdateEmployee = useCallback(
    (id: string, field: keyof EmployeeEntry, value: string | number | boolean) => {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp))
      )
    },
    []
  )

  // Calculate contributions for all employees
  const calculations = useMemo((): CalculationResult[] => {
    return employees.map((emp) => {
      const totalSalary = emp.basicSalary + emp.housingAllowance
      const cappedSalary = Math.min(
        Math.max(totalSalary, GOSI_SALARY_CONSTRAINTS.MIN_SALARY),
        GOSI_SALARY_CONSTRAINTS.MAX_SALARY
      )

      let employerRate: number
      let employeeRate: number

      if (emp.nationality === 'saudi') {
        if (emp.isReformEmployee) {
          employerRate = GOSI_RATES.SAUDI.EMPLOYER.REFORM
          employeeRate = GOSI_RATES.SAUDI.EMPLOYEE.REFORM
        } else {
          employerRate = GOSI_RATES.SAUDI.EMPLOYER.LEGACY
          employeeRate = GOSI_RATES.SAUDI.EMPLOYEE.LEGACY
        }
      } else {
        employerRate = GOSI_RATES.NON_SAUDI.EMPLOYER
        employeeRate = GOSI_RATES.NON_SAUDI.EMPLOYEE
      }

      const employerContribution = (cappedSalary * employerRate) / 100
      const employeeContribution = (cappedSalary * employeeRate) / 100

      // SANED (unemployment insurance) - only for Saudis
      let sanedEmployer = 0
      let sanedEmployee = 0
      if (emp.nationality === 'saudi' && includeSaned) {
        sanedEmployer = (cappedSalary * SANED_RATES.EMPLOYER) / 100
        sanedEmployee = (cappedSalary * SANED_RATES.EMPLOYEE) / 100
      }

      return {
        employee: emp,
        totalSalary,
        cappedSalary,
        employerContribution: employerContribution + sanedEmployer,
        employeeContribution: employeeContribution + sanedEmployee,
        totalContribution:
          employerContribution + employeeContribution + sanedEmployer + sanedEmployee,
        sanedEmployer,
        sanedEmployee,
      }
    })
  }, [employees, includeSaned])

  // Calculate totals
  const totals = useMemo(() => {
    return calculations.reduce(
      (acc, calc) => ({
        totalSalaries: acc.totalSalaries + calc.totalSalary,
        employerTotal: acc.employerTotal + calc.employerContribution,
        employeeTotal: acc.employeeTotal + calc.employeeContribution,
        grandTotal: acc.grandTotal + calc.totalContribution,
        saudiCount:
          acc.saudiCount + (calc.employee.nationality === 'saudi' ? 1 : 0),
        nonSaudiCount:
          acc.nonSaudiCount + (calc.employee.nationality === 'non_saudi' ? 1 : 0),
      }),
      {
        totalSalaries: 0,
        employerTotal: 0,
        employeeTotal: 0,
        grandTotal: 0,
        saudiCount: 0,
        nonSaudiCount: 0,
      }
    )
  }, [calculations])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Reset form
  const handleReset = useCallback(() => {
    setEmployees([createDefaultEmployee()])
    toast.success('تم إعادة تعيين الحاسبة')
  }, [])

  // Copy results
  const handleCopyResults = useCallback(() => {
    const text = `
ملخص حساب GOSI
================
عدد الموظفين: ${employees.length}
- سعوديين: ${totals.saudiCount}
- غير سعوديين: ${totals.nonSaudiCount}

إجمالي الرواتب: ${formatCurrency(totals.totalSalaries)}

الاشتراكات:
- حصة صاحب العمل: ${formatCurrency(totals.employerTotal)}
- حصة الموظفين: ${formatCurrency(totals.employeeTotal)}
- الإجمالي: ${formatCurrency(totals.grandTotal)}
    `.trim()

    navigator.clipboard.writeText(text)
    toast.success('تم نسخ النتائج')
  }, [employees.length, totals])

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to={ROUTES.dashboard.finance.saudiBanking.index}
            className="text-slate-500 hover:text-emerald-600"
          >
            الخدمات المصرفية
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
          <Link
            to={ROUTES.dashboard.finance.saudiBanking.gosi.index}
            className="text-slate-500 hover:text-emerald-600"
          >
            التأمينات الاجتماعية
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
          <span className="text-navy font-medium">حاسبة الاشتراكات</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Calculator className="h-7 w-7 text-emerald-600" />
              حاسبة اشتراكات GOSI
            </h1>
            <p className="text-slate-600 mt-1">
              احسب اشتراكات التأمينات الاجتماعية للموظفين بدقة
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 ms-2" />
              إعادة تعيين
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={handleCopyResults}>
              <Copy className="h-4 w-4 ms-2" />
              نسخ النتائج
            </Button>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800 font-bold">معلومات هامة</AlertTitle>
          <AlertDescription className="text-blue-700">
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              <li>
                الموظفين المعينين بعد 3 يوليو 2024 يخضعون لنظام التقاعد الجديد (11% صاحب عمل،
                11% موظف)
              </li>
              <li>الحد الأقصى للراتب الخاضع للاشتراك: {formatCurrency(GOSI_SALARY_CONSTRAINTS.MAX_SALARY)}</li>
              <li>تشمل الحسابات التأمين ضد التعطل (ساند) للسعوديين فقط</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Entry Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-navy" />
                    بيانات الموظفين
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="saned"
                        checked={includeSaned}
                        onCheckedChange={setIncludeSaned}
                      />
                      <Label htmlFor="saned" className="text-sm">
                        تضمين ساند
                      </Label>
                    </div>
                    <Button
                      onClick={handleAddEmployee}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="h-4 w-4 ms-1" />
                      إضافة موظف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.map((emp, index) => (
                  <div
                    key={emp.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-navy">موظف #{index + 1}</span>
                      {employees.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveEmployee(emp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm">الاسم</Label>
                        <Input
                          placeholder="اسم الموظف"
                          value={emp.name}
                          onChange={(e) =>
                            handleUpdateEmployee(emp.id, 'name', e.target.value)
                          }
                          className="mt-1 rounded-lg"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">الجنسية</Label>
                        <Select
                          value={emp.nationality}
                          onValueChange={(v) =>
                            handleUpdateEmployee(emp.id, 'nationality', v)
                          }
                        >
                          <SelectTrigger className="mt-1 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saudi">سعودي</SelectItem>
                            <SelectItem value="non_saudi">غير سعودي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">الراتب الأساسي</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={emp.basicSalary || ''}
                          onChange={(e) =>
                            handleUpdateEmployee(
                              emp.id,
                              'basicSalary',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="mt-1 rounded-lg"
                          min={0}
                        />
                      </div>

                      <div>
                        <Label className="text-sm">بدل السكن</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={emp.housingAllowance || ''}
                          onChange={(e) =>
                            handleUpdateEmployee(
                              emp.id,
                              'housingAllowance',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="mt-1 rounded-lg"
                          min={0}
                        />
                      </div>
                    </div>

                    {emp.nationality === 'saudi' && (
                      <div className="mt-3 flex items-center gap-2">
                        <Switch
                          id={`reform-${emp.id}`}
                          checked={emp.isReformEmployee}
                          onCheckedChange={(checked) =>
                            handleUpdateEmployee(emp.id, 'isReformEmployee', checked)
                          }
                        />
                        <Label htmlFor={`reform-${emp.id}`} className="text-sm text-slate-600">
                          معين بعد 3 يوليو 2024 (نظام التقاعد الجديد)
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  نتائج الحساب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">الجنسية</TableHead>
                      <TableHead className="text-right">الراتب الخاضع</TableHead>
                      <TableHead className="text-right">حصة صاحب العمل</TableHead>
                      <TableHead className="text-right">حصة الموظف</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculations.map((calc) => (
                      <TableRow key={calc.employee.id}>
                        <TableCell className="font-medium">
                          {calc.employee.name || `موظف ${employees.indexOf(calc.employee) + 1}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              calc.employee.nationality === 'saudi'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                            }
                          >
                            {calc.employee.nationality === 'saudi' ? 'سعودي' : 'غير سعودي'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(calc.cappedSalary)}</TableCell>
                        <TableCell className="text-orange-600">
                          {formatCurrency(calc.employerContribution)}
                        </TableCell>
                        <TableCell className="text-blue-600">
                          {formatCurrency(calc.employeeContribution)}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {formatCurrency(calc.totalContribution)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={2} className="font-bold">
                        الإجمالي ({employees.length} موظف)
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(totals.totalSalaries)}
                      </TableCell>
                      <TableCell className="font-bold text-orange-600">
                        {formatCurrency(totals.employerTotal)}
                      </TableCell>
                      <TableCell className="font-bold text-blue-600">
                        {formatCurrency(totals.employeeTotal)}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 text-lg">
                        {formatCurrency(totals.grandTotal)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">ملخص الاشتراكات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm text-orange-600">حصة صاحب العمل</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatCurrency(totals.employerTotal)}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600">حصة الموظفين</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(totals.employeeTotal)}
                  </p>
                </div>

                <Separator />

                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-emerald-600">إجمالي الاشتراكات</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {formatCurrency(totals.grandTotal)}
                  </p>
                </div>

                <div className="text-sm text-slate-500 space-y-1">
                  <p>
                    <span className="text-emerald-600">{totals.saudiCount}</span> سعودي •{' '}
                    <span className="text-blue-600">{totals.nonSaudiCount}</span> غير سعودي
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rate Reference */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  مرجع النسب
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-emerald-800">السعوديين (قديم)</p>
                  <p className="text-emerald-600">
                    صاحب العمل: {GOSI_RATES.SAUDI.EMPLOYER.LEGACY}% • الموظف:{' '}
                    {GOSI_RATES.SAUDI.EMPLOYEE.LEGACY}%
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">السعوديين (جديد 2024)</p>
                  <p className="text-blue-600">
                    صاحب العمل: {GOSI_RATES.SAUDI.EMPLOYER.REFORM}% • الموظف:{' '}
                    {GOSI_RATES.SAUDI.EMPLOYEE.REFORM}%
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">غير السعوديين</p>
                  <p className="text-orange-600">
                    صاحب العمل: {GOSI_RATES.NON_SAUDI.EMPLOYER}% • الموظف:{' '}
                    {GOSI_RATES.NON_SAUDI.EMPLOYEE}%
                  </p>
                </div>

                {includeSaned && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-800">ساند (للسعوديين)</p>
                    <p className="text-purple-600">
                      صاحب العمل: {SANED_RATES.EMPLOYER}% • الموظف: {SANED_RATES.EMPLOYEE}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="rounded-2xl bg-gradient-to-br from-navy to-navy/90">
              <CardContent className="p-4 text-white">
                <Shield className="h-8 w-8 mb-3 text-emerald-400" />
                <h4 className="font-bold mb-3">إجراءات سريعة</h4>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 ms-2" />
                    طباعة التقرير
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('https://gosi.gov.sa', '_blank')}
                  >
                    <Building2 className="h-4 w-4 ms-2" />
                    بوابة GOSI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
