/**
 * GOSI (General Organization for Social Insurance) Dashboard View
 *
 * Displays GOSI compliance status, contribution summaries, and regulatory deadlines.
 * CRITICAL: Non-compliance results in significant fines.
 */

import { useState, useMemo } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  GosiCard,
  GosiCardHeader,
  GosiCardTitle,
  GosiCardContent,
  GosiButton,
} from '@/components/ui/gosi-ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  Banknote,
  PieChart,
  ArrowUpRight,
  Info,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import {
  GOSI_RATES,
  GOSI_SALARY_CONSTRAINTS,
  calculateGOSIContribution,
} from '@/constants/saudi-banking'

// Mock data for demonstration
const MOCK_SUMMARY = {
  totalEmployees: 45,
  saudiEmployees: 12,
  nonSaudiEmployees: 33,
  reformEmployees: 3, // Employees hired after July 2024
  currentMonthContributions: 28500,
  previousMonthContributions: 27800,
  yearToDateContributions: 285000,
  complianceStatus: 'compliant' as const,
  lastSubmissionDate: '2024-01-10',
  nextDeadline: '2024-02-15',
  daysUntilDeadline: 5,
}

const MOCK_MONTHLY_BREAKDOWN = [
  { month: '2024-01', employees: 45, contributions: 28500, status: 'paid' },
  { month: '2023-12', employees: 44, contributions: 27800, status: 'paid' },
  { month: '2023-11', employees: 44, contributions: 27800, status: 'paid' },
  { month: '2023-10', employees: 43, contributions: 27200, status: 'paid' },
  { month: '2023-09', employees: 42, contributions: 26500, status: 'paid' },
  { month: '2023-08', employees: 42, contributions: 26500, status: 'paid' },
]

export function GOSIDashboardView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
  ]

  // Calculate rate breakdown
  const rateBreakdown = useMemo(() => {
    const saudiLegacy = {
      employer: GOSI_RATES.SAUDI.EMPLOYER.LEGACY,
      employee: GOSI_RATES.SAUDI.EMPLOYEE.LEGACY,
      total: GOSI_RATES.SAUDI.EMPLOYER.LEGACY + GOSI_RATES.SAUDI.EMPLOYEE.LEGACY,
    }
    const saudiReform = {
      employer: GOSI_RATES.SAUDI.EMPLOYER.REFORM,
      employee: GOSI_RATES.SAUDI.EMPLOYEE.REFORM,
      total: GOSI_RATES.SAUDI.EMPLOYER.REFORM + GOSI_RATES.SAUDI.EMPLOYEE.REFORM,
    }
    const nonSaudi = {
      employer: GOSI_RATES.NON_SAUDI.EMPLOYER,
      employee: GOSI_RATES.NON_SAUDI.EMPLOYEE,
      total: GOSI_RATES.NON_SAUDI.EMPLOYER + GOSI_RATES.NON_SAUDI.EMPLOYEE,
    }
    return { saudiLegacy, saudiReform, nonSaudi }
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format month
  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
  }

  // Compliance status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-700">مدفوع</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">معلق</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700">متأخر</Badge>
      default:
        return null
    }
  }

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
          <span className="text-navy font-medium">التأمينات الاجتماعية (GOSI)</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Shield className="h-7 w-7 text-emerald-600" />
              لوحة التأمينات الاجتماعية
            </h1>
            <p className="text-slate-600 mt-1">
              متابعة الاشتراكات والمساهمات وحالة الامتثال
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4 ms-2" />
              تحديث البيانات
            </Button>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
              <Link to={ROUTES.dashboard.finance.saudiBanking.gosi.calculator}>
                <Calculator className="h-4 w-4 ms-2" />
                حاسبة GOSI
              </Link>
            </Button>
          </div>
        </div>

        {/* Deadline Alert */}
        {MOCK_SUMMARY.daysUntilDeadline <= 7 && (
          <Alert className="border-amber-200 bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 font-bold">موعد التسديد قريب!</AlertTitle>
            <AlertDescription className="text-amber-700">
              يجب تسديد اشتراكات GOSI قبل {MOCK_SUMMARY.nextDeadline}. تبقى{' '}
              {MOCK_SUMMARY.daysUntilDeadline} أيام.
              <br />
              <span className="text-sm">
                التأخير يؤدي إلى غرامة 2% شهرياً من المبلغ المستحق.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Employees */}
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">إجمالي الموظفين</p>
                  <p className="text-3xl font-bold text-navy mt-1">{MOCK_SUMMARY.totalEmployees}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-emerald-600">{MOCK_SUMMARY.saudiEmployees} سعودي</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-blue-600">{MOCK_SUMMARY.nonSaudiEmployees} غير سعودي</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Month Contributions */}
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">اشتراكات الشهر الحالي</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    {formatCurrency(MOCK_SUMMARY.currentMonthContributions)}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+2.5% من الشهر السابق</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Banknote className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Year to Date */}
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">إجمالي السنة</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {formatCurrency(MOCK_SUMMARY.yearToDateContributions)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">منذ بداية السنة المالية</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">حالة الامتثال</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-600">ملتزم</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    آخر تسديد: {MOCK_SUMMARY.lastSubmissionDate}
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 py-1">متوافق</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Breakdown */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-navy" />
                  سجل الاشتراكات الشهرية
                </CardTitle>
                <CardDescription>آخر 6 أشهر من اشتراكات GOSI</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الشهر</TableHead>
                      <TableHead className="text-right">عدد الموظفين</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_MONTHLY_BREAKDOWN.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{formatMonth(row.month)}</TableCell>
                        <TableCell>{row.employees}</TableCell>
                        <TableCell className="text-emerald-600">
                          {formatCurrency(row.contributions)}
                        </TableCell>
                        <TableCell>{getStatusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Rate Information */}
          <div className="space-y-4">
            {/* Current Rates Card */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  نسب الاشتراكات الحالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saudi Legacy */}
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-emerald-800 mb-2">السعوديين (قبل يوليو 2024)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-emerald-600">صاحب العمل:</span>
                      <span className="font-bold ms-1">{rateBreakdown.saudiLegacy.employer}%</span>
                    </div>
                    <div>
                      <span className="text-emerald-600">الموظف:</span>
                      <span className="font-bold ms-1">{rateBreakdown.saudiLegacy.employee}%</span>
                    </div>
                  </div>
                </div>

                {/* Saudi Reform */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">السعوديين (بعد يوليو 2024)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600">صاحب العمل:</span>
                      <span className="font-bold ms-1">{rateBreakdown.saudiReform.employer}%</span>
                    </div>
                    <div>
                      <span className="text-blue-600">الموظف:</span>
                      <span className="font-bold ms-1">{rateBreakdown.saudiReform.employee}%</span>
                    </div>
                  </div>
                </div>

                {/* Non-Saudi */}
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800 mb-2">غير السعوديين</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-orange-600">صاحب العمل:</span>
                      <span className="font-bold ms-1">{rateBreakdown.nonSaudi.employer}%</span>
                    </div>
                    <div>
                      <span className="text-orange-600">الموظف:</span>
                      <span className="font-bold ms-1">{rateBreakdown.nonSaudi.employee}%</span>
                    </div>
                  </div>
                </div>

                {/* Salary Limits */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-700 mb-2">حدود الراتب</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>الحد الأدنى: {formatCurrency(GOSI_SALARY_CONSTRAINTS.MIN_SALARY)}</p>
                    <p>الحد الأقصى: {formatCurrency(GOSI_SALARY_CONSTRAINTS.MAX_SALARY)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl bg-gradient-to-br from-navy to-navy/90">
              <CardContent className="p-4 text-white">
                <Shield className="h-8 w-8 mb-3 text-emerald-400" />
                <h4 className="font-bold mb-2">إجراءات سريعة</h4>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={ROUTES.dashboard.finance.saudiBanking.gosi.calculator}>
                      <Calculator className="h-4 w-4 ms-2" />
                      حساب الاشتراكات
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://gosi.gov.sa', '_blank')}
                  >
                    <ArrowUpRight className="h-4 w-4 ms-2" />
                    بوابة GOSI
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 ms-2" />
                    تصدير التقرير
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
