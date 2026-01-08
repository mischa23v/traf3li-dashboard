/**
 * Iqama Expiry Alerts View
 *
 * Monitors and alerts on expiring Iqama (residency permits) for non-Saudi employees.
 * CRITICAL: Expired Iqamas result in significant fines and employment violations.
 *
 * Penalties (as of 2024):
 * - First offense: SAR 15,000
 * - Second offense: SAR 25,000
 * - Third offense: SAR 100,000 + deportation
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
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GosiCard,
  GosiCardHeader,
  GosiCardTitle,
  GosiCardContent,
  GosiInput,
  GosiSelect,
  GosiSelectTrigger,
  GosiSelectContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  Search,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Download,
  RefreshCw,
  Bell,
  Shield,
  FileWarning,
  CreditCard,
  Mail,
  Phone,
  Building2,
  Filter,
  SortAsc,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { toast } from 'sonner'

// Iqama status types
type IqamaStatus = 'expired' | 'critical' | 'warning' | 'valid'

// Employee with Iqama data
interface EmployeeIqama {
  id: string
  name: string
  nameAr: string
  nationality: string
  iqamaNumber: string
  iqamaExpiryDate: string
  daysUntilExpiry: number
  status: IqamaStatus
  profession: string
  department: string
  phone: string
  email: string
}

// Mock data - In production, this would come from API
const MOCK_EMPLOYEES: EmployeeIqama[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    nationality: 'Egyptian',
    iqamaNumber: '2456789012',
    iqamaExpiryDate: '2024-01-20',
    daysUntilExpiry: -5,
    status: 'expired',
    profession: 'Software Engineer',
    department: 'IT',
    phone: '+966551234567',
    email: 'ahmed.hassan@company.com',
  },
  {
    id: '2',
    name: 'Mohammad Ali',
    nameAr: 'محمد علي',
    nationality: 'Pakistani',
    iqamaNumber: '2567890123',
    iqamaExpiryDate: '2024-01-30',
    daysUntilExpiry: 5,
    status: 'critical',
    profession: 'Accountant',
    department: 'Finance',
    phone: '+966552345678',
    email: 'mohammad.ali@company.com',
  },
  {
    id: '3',
    name: 'Raj Kumar',
    nameAr: 'راج كومار',
    nationality: 'Indian',
    iqamaNumber: '2678901234',
    iqamaExpiryDate: '2024-02-15',
    daysUntilExpiry: 21,
    status: 'warning',
    profession: 'Project Manager',
    department: 'Operations',
    phone: '+966553456789',
    email: 'raj.kumar@company.com',
  },
  {
    id: '4',
    name: 'John Smith',
    nameAr: 'جون سميث',
    nationality: 'British',
    iqamaNumber: '2789012345',
    iqamaExpiryDate: '2024-02-28',
    daysUntilExpiry: 34,
    status: 'warning',
    profession: 'Consultant',
    department: 'Business Dev',
    phone: '+966554567890',
    email: 'john.smith@company.com',
  },
  {
    id: '5',
    name: 'Ali Reza',
    nameAr: 'علي رضا',
    nationality: 'Iranian',
    iqamaNumber: '2890123456',
    iqamaExpiryDate: '2024-06-30',
    daysUntilExpiry: 156,
    status: 'valid',
    profession: 'Designer',
    department: 'Marketing',
    phone: '+966555678901',
    email: 'ali.reza@company.com',
  },
  {
    id: '6',
    name: 'Omar Farooq',
    nameAr: 'عمر فاروق',
    nationality: 'Jordanian',
    iqamaNumber: '2901234567',
    iqamaExpiryDate: '2024-12-15',
    daysUntilExpiry: 320,
    status: 'valid',
    profession: 'HR Manager',
    department: 'HR',
    phone: '+966556789012',
    email: 'omar.farooq@company.com',
  },
]

// Penalty structure
const IQAMA_PENALTIES = {
  firstOffense: 15000,
  secondOffense: 25000,
  thirdOffense: 100000,
}

export function IqamaAlertsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
  ]

  // Filter and sort employees
  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nameAr.includes(searchQuery) ||
        emp.iqamaNumber.includes(searchQuery)

      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
      const matchesDepartment =
        departmentFilter === 'all' || emp.department === departmentFilter

      return matchesSearch && matchesStatus && matchesDepartment
    }).sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }, [searchQuery, statusFilter, departmentFilter])

  // Statistics
  const stats = useMemo(() => {
    const expired = MOCK_EMPLOYEES.filter((e) => e.status === 'expired').length
    const critical = MOCK_EMPLOYEES.filter((e) => e.status === 'critical').length
    const warning = MOCK_EMPLOYEES.filter((e) => e.status === 'warning').length
    const valid = MOCK_EMPLOYEES.filter((e) => e.status === 'valid').length
    const total = MOCK_EMPLOYEES.length

    return { expired, critical, warning, valid, total }
  }, [])

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(MOCK_EMPLOYEES.map((e) => e.department))]
  }, [])

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: IqamaStatus, daysUntilExpiry: number) => {
    switch (status) {
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3 ms-1" />
            منتهية ({Math.abs(daysUntilExpiry)} يوم)
          </Badge>
        )
      case 'critical':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <AlertTriangle className="h-3 w-3 ms-1" />
            حرجة ({daysUntilExpiry} يوم)
          </Badge>
        )
      case 'warning':
        return (
          <Badge className="bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3 ms-1" />
            تحذير ({daysUntilExpiry} يوم)
          </Badge>
        )
      case 'valid':
        return (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3 w-3 ms-1" />
            سارية
          </Badge>
        )
    }
  }

  // Get row class based on status
  const getRowClass = (status: IqamaStatus) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 hover:bg-red-100'
      case 'critical':
        return 'bg-orange-50 hover:bg-orange-100'
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100'
      default:
        return ''
    }
  }

  // Send reminder
  const handleSendReminder = (employee: EmployeeIqama) => {
    toast.success(`تم إرسال تذكير إلى ${employee.name}`)
  }

  // Export data
  const handleExport = () => {
    toast.success('جاري تصدير البيانات...')
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
          <Link
            to={ROUTES.dashboard.finance.saudiBanking.compliance.index}
            className="text-slate-500 hover:text-emerald-600"
          >
            الامتثال
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
          <span className="text-navy font-medium">تنبيهات انتهاء الإقامة</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-emerald-600" />
              تنبيهات انتهاء الإقامة
            </h1>
            <p className="text-slate-600 mt-1">
              متابعة صلاحية إقامات الموظفين غير السعوديين
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl" onClick={handleExport}>
              <Download className="h-4 w-4 ms-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Critical Alert */}
        {(stats.expired > 0 || stats.critical > 0) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">تنبيه عاجل!</AlertTitle>
            <AlertDescription className="text-red-700">
              {stats.expired > 0 && (
                <span className="block">
                  يوجد {stats.expired} إقامة منتهية الصلاحية. الغرامة المتوقعة:{' '}
                  {formatCurrency(stats.expired * IQAMA_PENALTIES.firstOffense)}
                </span>
              )}
              {stats.critical > 0 && (
                <span className="block">
                  يوجد {stats.critical} إقامة ستنتهي خلال 7 أيام. يرجى اتخاذ إجراء فوري.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">منتهية</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">حرجة (7 أيام)</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-l-4 border-l-amber-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">تحذير (30 يوم)</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.warning}</p>
                </div>
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-l-4 border-l-emerald-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-500">سارية</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.valid}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-2xl">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="بحث بالاسم أو رقم الإقامة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 rounded-xl"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="h-4 w-4 ms-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="expired">منتهية</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="valid">سارية</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Building2 className="h-4 w-4 ms-2" />
                  <SelectValue placeholder="القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-navy" />
              سجل الإقامات ({filteredEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">الجنسية</TableHead>
                  <TableHead className="text-right">رقم الإقامة</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className={getRowClass(emp.status)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.nameAr}</p>
                        <p className="text-sm text-slate-500">{emp.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{emp.nationality}</TableCell>
                    <TableCell className="font-mono">{emp.iqamaNumber}</TableCell>
                    <TableCell>{formatDate(emp.iqamaExpiryDate)}</TableCell>
                    <TableCell>
                      {getStatusBadge(emp.status, emp.daysUntilExpiry)}
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(emp)}
                          title="إرسال تذكير"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="اتصال">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="بريد إلكتروني">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">لا توجد نتائج مطابقة للبحث</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penalty Information */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-red-600" />
              معلومات الغرامات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-800">المخالفة الأولى</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(IQAMA_PENALTIES.firstOffense)}
                </p>
                <p className="text-sm text-amber-700 mt-1">لكل إقامة منتهية</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="font-bold text-orange-800">المخالفة الثانية</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(IQAMA_PENALTIES.secondOffense)}
                </p>
                <p className="text-sm text-orange-700 mt-1">لكل إقامة منتهية</p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <p className="font-bold text-red-800">المخالفة الثالثة</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(IQAMA_PENALTIES.thirdOffense)}
                </p>
                <p className="text-sm text-red-700 mt-1">+ ترحيل الموظف</p>
              </div>
            </div>

            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Shield className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-700">
                يجب تجديد الإقامة قبل انتهائها بـ 90 يوماً على الأقل لتجنب أي تأخير في المعاملات.
                يمكن التجديد عبر منصة أبشر أو مكاتب الجوازات.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
