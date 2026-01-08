/**
 * WPS File Generator View
 *
 * Generates compliant WPS (Wage Protection System) SIF files
 * for submission to Saudi banks and Mudad platform.
 *
 * CRITICAL: This is government-regulated. Non-compliance results in fines.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
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
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Bell,
  ChevronLeft,
  Download,
  FileText,
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Eye,
  Upload,
  Shield,
  Clock,
  Info,
  Printer,
  Copy,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { SARIE_BANK_IDS } from '@/constants/saudi-banking'
import {
  validateWPSData,
  generateWPSFile,
  generateWPSFilename,
  downloadWPSFile,
  generateWPSFilePreview,
  getBankNameFromSarieCode,
  getSarieRoutingCode,
  type WPSEmployeeRecord,
  type WPSEstablishmentRecord,
  type WPSGenerationOptions,
  type WPSValidationResult,
  type WPSFilePreview,
} from '@/lib/wps-file-generator'
import { toast } from 'sonner'

// Bank options with SARIE codes
const BANK_OPTIONS = [
  { value: '05', label: 'بنك الإنماء (Alinma Bank)', code: '000000005' },
  { value: '10', label: 'البنك الأهلي السعودي (SNB)', code: '000000010' },
  { value: '15', label: 'بنك البلاد (Bank Albilad)', code: '000000015' },
  { value: '20', label: 'بنك الرياض (Riyad Bank)', code: '000000020' },
  { value: '30', label: 'البنك العربي الوطني (ANB)', code: '000000030' },
  { value: '45', label: 'البنك السعودي البريطاني (SABB)', code: '000000045' },
  { value: '55', label: 'البنك السعودي الفرنسي (BSF)', code: '000000055' },
  { value: '60', label: 'بنك الجزيرة (Bank AlJazira)', code: '000000060' },
  { value: '65', label: 'بنك الخليج الدولي (GIB)', code: '000000065' },
  { value: '80', label: 'مصرف الراجحي (Al Rajhi)', code: '000000080' },
]

// Default establishment template
const DEFAULT_ESTABLISHMENT: WPSEstablishmentRecord = {
  molEstablishmentId: '',
  establishmentName: '',
  bankRoutingCode: '',
  bankAccountIban: '',
}

// Default employee template
const DEFAULT_EMPLOYEE: WPSEmployeeRecord = {
  molPersonId: '',
  nationalId: '',
  employeeName: '',
  bankRoutingCode: '',
  accountNumber: '',
  payStartDate: '',
  payEndDate: '',
  daysInPeriod: 30,
  basicSalary: 0,
  housingAllowance: 0,
  otherEarnings: 0,
  deductions: 0,
  leaveDays: 0,
  leaveDeduction: 0,
}

export function WPSGeneratorView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [activeTab, setActiveTab] = useState('establishment')
  const [establishment, setEstablishment] = useState<WPSEstablishmentRecord>(DEFAULT_ESTABLISHMENT)
  const [employees, setEmployees] = useState<WPSEmployeeRecord[]>([])
  const [salaryMonth, setSalaryMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [validationResult, setValidationResult] = useState<WPSValidationResult | null>(null)
  const [filePreview, setFilePreview] = useState<WPSFilePreview | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<WPSEmployeeRecord>({ ...DEFAULT_EMPLOYEE })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Calculate pay period dates based on salary month
  const payPeriod = useMemo(() => {
    if (!salaryMonth) return { start: '', end: '' }
    const [year, month] = salaryMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of month
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days: endDate.getDate(),
    }
  }, [salaryMonth])

  // Navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
  ]

  // Handle establishment change
  const handleEstablishmentChange = useCallback(
    (field: keyof WPSEstablishmentRecord, value: string) => {
      setEstablishment((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Handle establishment bank selection
  const handleEstablishmentBankChange = useCallback((bankId: string) => {
    const bank = BANK_OPTIONS.find((b) => b.value === bankId)
    if (bank) {
      setEstablishment((prev) => ({
        ...prev,
        bankRoutingCode: bank.code,
      }))
    }
  }, [])

  // Handle employee field change
  const handleEmployeeChange = useCallback(
    (field: keyof WPSEmployeeRecord, value: string | number) => {
      setCurrentEmployee((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Handle employee bank selection
  const handleEmployeeBankChange = useCallback((bankId: string) => {
    const bank = BANK_OPTIONS.find((b) => b.value === bankId)
    if (bank) {
      setCurrentEmployee((prev) => ({
        ...prev,
        bankRoutingCode: bank.code,
      }))
    }
  }, [])

  // Add or update employee
  const handleSaveEmployee = useCallback(() => {
    // Set pay period dates
    const employeeWithDates: WPSEmployeeRecord = {
      ...currentEmployee,
      payStartDate: payPeriod.start,
      payEndDate: payPeriod.end,
      daysInPeriod: payPeriod.days || 30,
    }

    if (editingIndex !== null) {
      setEmployees((prev) => {
        const newList = [...prev]
        newList[editingIndex] = employeeWithDates
        return newList
      })
      setEditingIndex(null)
    } else {
      setEmployees((prev) => [...prev, employeeWithDates])
    }

    setCurrentEmployee({ ...DEFAULT_EMPLOYEE })
    toast.success(editingIndex !== null ? 'تم تحديث بيانات الموظف' : 'تمت إضافة الموظف')
  }, [currentEmployee, editingIndex, payPeriod])

  // Edit employee
  const handleEditEmployee = useCallback((index: number) => {
    setEmployees((prev) => {
      setCurrentEmployee({ ...prev[index] })
      return prev
    })
    setEditingIndex(index)
    setActiveTab('employees')
  }, [])

  // Delete employee
  const handleDeleteEmployee = useCallback((index: number) => {
    setEmployees((prev) => prev.filter((_, i) => i !== index))
    toast.success('تم حذف الموظف')
  }, [])

  // Validate all data
  const handleValidate = useCallback(() => {
    const options: WPSGenerationOptions = {
      salaryMonth,
    }
    const result = validateWPSData(establishment, employees, options)
    setValidationResult(result)

    if (result.isValid) {
      toast.success('البيانات صحيحة ومتوافقة مع متطلبات WPS')
    } else {
      toast.error(`يوجد ${result.errors.length} خطأ في البيانات`)
    }

    return result.isValid
  }, [establishment, employees, salaryMonth])

  // Generate preview
  const handlePreview = useCallback(() => {
    if (!handleValidate()) return

    const options: WPSGenerationOptions = {
      salaryMonth,
    }
    const preview = generateWPSFilePreview(establishment, employees, options)
    setFilePreview(preview)
    setShowPreviewDialog(true)
  }, [establishment, employees, salaryMonth, handleValidate])

  // Download file
  const handleDownload = useCallback(() => {
    if (!handleValidate()) return

    const options: WPSGenerationOptions = {
      salaryMonth,
    }
    downloadWPSFile(establishment, employees, options)
    toast.success('تم تحميل ملف WPS بنجاح')
  }, [establishment, employees, salaryMonth, handleValidate])

  // Copy raw content
  const handleCopyRawContent = useCallback(() => {
    if (filePreview) {
      navigator.clipboard.writeText(filePreview.rawContent)
      toast.success('تم نسخ محتوى الملف')
    }
  }, [filePreview])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate totals
  const totals = useMemo(() => {
    return employees.reduce(
      (acc, emp) => ({
        basicSalary: acc.basicSalary + emp.basicSalary,
        housingAllowance: acc.housingAllowance + emp.housingAllowance,
        otherEarnings: acc.otherEarnings + emp.otherEarnings,
        deductions: acc.deductions + emp.deductions + (emp.leaveDeduction || 0),
        netSalary:
          acc.netSalary +
          emp.basicSalary +
          emp.housingAllowance +
          emp.otherEarnings -
          emp.deductions -
          (emp.leaveDeduction || 0),
      }),
      {
        basicSalary: 0,
        housingAllowance: 0,
        otherEarnings: 0,
        deductions: 0,
        netSalary: 0,
      }
    )
  }, [employees])

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
            to={ROUTES.dashboard.finance.saudiBanking.wps.index}
            className="text-slate-500 hover:text-emerald-600"
          >
            نظام حماية الأجور
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
          <span className="text-navy font-medium">إنشاء ملف WPS</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <FileText className="h-7 w-7 text-emerald-600" />
              مولّد ملفات WPS
            </h1>
            <p className="text-slate-600 mt-1">
              إنشاء ملفات SIF متوافقة مع نظام حماية الأجور السعودي
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-2">
              <AlertTriangle className="h-4 w-4 ms-1" />
              نظام حكومي - الالتزام إلزامي
            </Badge>
          </div>
        </div>

        {/* Warning Alert */}
        <Alert className="border-amber-200 bg-amber-50">
          <Shield className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 font-bold">تنبيه هام</AlertTitle>
          <AlertDescription className="text-amber-700">
            هذا نظام حكومي إلزامي. عدم الالتزام قد يؤدي إلى غرامات مالية وإيقاف الرخصة التجارية.
            تأكد من صحة جميع البيانات قبل رفع الملف للبنك أو منصة مدد.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <Card className="rounded-2xl shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-2">
                  <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger
                      value="establishment"
                      className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6"
                    >
                      <Building2 className="h-4 w-4 ms-2" />
                      بيانات المنشأة
                    </TabsTrigger>
                    <TabsTrigger
                      value="employees"
                      className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6"
                    >
                      <Users className="h-4 w-4 ms-2" />
                      الموظفين ({employees.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="data-[state=active]:bg-navy data-[state=active]:text-white rounded-lg px-6"
                    >
                      <CheckCircle className="h-4 w-4 ms-2" />
                      المراجعة والتحميل
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Establishment Tab */}
                  <TabsContent value="establishment" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-navy font-medium">رقم المنشأة (وزارة العمل)</Label>
                          <Input
                            placeholder="مثال: 1234567890123 (13 رقم)"
                            value={establishment.molEstablishmentId}
                            onChange={(e) =>
                              handleEstablishmentChange('molEstablishmentId', e.target.value)
                            }
                            className="mt-2 rounded-xl"
                            maxLength={13}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            رقم المنشأة المسجل لدى وزارة الموارد البشرية (13 رقم)
                          </p>
                        </div>

                        <div>
                          <Label className="text-navy font-medium">اسم المنشأة</Label>
                          <Input
                            placeholder="اسم الشركة / المؤسسة"
                            value={establishment.establishmentName}
                            onChange={(e) =>
                              handleEstablishmentChange('establishmentName', e.target.value)
                            }
                            className="mt-2 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-navy font-medium">البنك</Label>
                          <Select onValueChange={handleEstablishmentBankChange}>
                            <SelectTrigger className="mt-2 rounded-xl">
                              <SelectValue placeholder="اختر البنك" />
                            </SelectTrigger>
                            <SelectContent>
                              {BANK_OPTIONS.map((bank) => (
                                <SelectItem key={bank.value} value={bank.value}>
                                  {bank.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-navy font-medium">رقم الآيبان (IBAN)</Label>
                          <Input
                            placeholder="SA0000000000000000000000"
                            value={establishment.bankAccountIban}
                            onChange={(e) =>
                              handleEstablishmentChange(
                                'bankAccountIban',
                                e.target.value.toUpperCase()
                              )
                            }
                            className="mt-2 rounded-xl font-mono"
                            maxLength={24}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Salary Month Selection */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <Label className="text-emerald-800 font-bold">شهر الراتب</Label>
                      <Input
                        type="month"
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="mt-2 rounded-xl max-w-xs"
                      />
                      {payPeriod.start && (
                        <p className="text-sm text-emerald-700 mt-2">
                          فترة الدفع: {payPeriod.start} إلى {payPeriod.end} ({payPeriod.days} يوم)
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Employees Tab */}
                  <TabsContent value="employees" className="m-0 space-y-6">
                    {/* Add Employee Form */}
                    <Card className="bg-slate-50 border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Plus className="h-5 w-5 text-emerald-600" />
                          {editingIndex !== null ? 'تعديل موظف' : 'إضافة موظف جديد'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>رقم الهوية/الإقامة (MOL ID)</Label>
                            <Input
                              placeholder="14 رقم"
                              value={currentEmployee.molPersonId}
                              onChange={(e) => handleEmployeeChange('molPersonId', e.target.value)}
                              className="mt-1 rounded-lg"
                              maxLength={14}
                            />
                          </div>
                          <div>
                            <Label>الهوية الوطنية / رقم الإقامة</Label>
                            <Input
                              placeholder="10 أرقام"
                              value={currentEmployee.nationalId}
                              onChange={(e) => handleEmployeeChange('nationalId', e.target.value)}
                              className="mt-1 rounded-lg"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Label>اسم الموظف</Label>
                            <Input
                              placeholder="الاسم الكامل"
                              value={currentEmployee.employeeName}
                              onChange={(e) => handleEmployeeChange('employeeName', e.target.value)}
                              className="mt-1 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>بنك الموظف</Label>
                            <Select onValueChange={handleEmployeeBankChange}>
                              <SelectTrigger className="mt-1 rounded-lg">
                                <SelectValue placeholder="اختر البنك" />
                              </SelectTrigger>
                              <SelectContent>
                                {BANK_OPTIONS.map((bank) => (
                                  <SelectItem key={bank.value} value={bank.value}>
                                    {bank.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>رقم الآيبان (IBAN)</Label>
                            <Input
                              placeholder="SA0000000000000000000000"
                              value={currentEmployee.accountNumber}
                              onChange={(e) =>
                                handleEmployeeChange('accountNumber', e.target.value.toUpperCase())
                              }
                              className="mt-1 rounded-lg font-mono"
                              maxLength={24}
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>الراتب الأساسي</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={currentEmployee.basicSalary || ''}
                              onChange={(e) =>
                                handleEmployeeChange('basicSalary', parseFloat(e.target.value) || 0)
                              }
                              className="mt-1 rounded-lg"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label>بدل السكن</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={currentEmployee.housingAllowance || ''}
                              onChange={(e) =>
                                handleEmployeeChange(
                                  'housingAllowance',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="mt-1 rounded-lg"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label>بدلات أخرى</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={currentEmployee.otherEarnings || ''}
                              onChange={(e) =>
                                handleEmployeeChange(
                                  'otherEarnings',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="mt-1 rounded-lg"
                              min={0}
                            />
                          </div>
                          <div>
                            <Label>الاستقطاعات</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={currentEmployee.deductions || ''}
                              onChange={(e) =>
                                handleEmployeeChange('deductions', parseFloat(e.target.value) || 0)
                              }
                              className="mt-1 rounded-lg"
                              min={0}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          {editingIndex !== null && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingIndex(null)
                                setCurrentEmployee({ ...DEFAULT_EMPLOYEE })
                              }}
                            >
                              إلغاء
                            </Button>
                          )}
                          <Button
                            onClick={handleSaveEmployee}
                            className="bg-emerald-500 hover:bg-emerald-600"
                          >
                            {editingIndex !== null ? 'تحديث' : 'إضافة موظف'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Employees List */}
                    {employees.length > 0 ? (
                      <div className="border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="text-right">#</TableHead>
                              <TableHead className="text-right">الاسم</TableHead>
                              <TableHead className="text-right">الهوية</TableHead>
                              <TableHead className="text-right">البنك</TableHead>
                              <TableHead className="text-right">صافي الراتب</TableHead>
                              <TableHead className="text-right">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {employees.map((emp, index) => {
                              const netSalary =
                                emp.basicSalary +
                                emp.housingAllowance +
                                emp.otherEarnings -
                                emp.deductions -
                                (emp.leaveDeduction || 0)
                              return (
                                <TableRow key={index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell className="font-medium">{emp.employeeName}</TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {emp.nationalId}
                                  </TableCell>
                                  <TableCell>
                                    {getBankNameFromSarieCode(emp.bankRoutingCode)}
                                  </TableCell>
                                  <TableCell
                                    className={netSalary < 1500 ? 'text-red-600' : 'text-emerald-600'}
                                  >
                                    {formatCurrency(netSalary)} ر.س
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditEmployee(index)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteEmployee(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">لم يتم إضافة موظفين بعد</p>
                        <p className="text-sm text-slate-400">أضف موظفين باستخدام النموذج أعلاه</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Review Tab */}
                  <TabsContent value="review" className="m-0 space-y-6">
                    {/* Validation Status */}
                    {validationResult && (
                      <Alert
                        className={
                          validationResult.isValid
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-red-200 bg-red-50'
                        }
                      >
                        {validationResult.isValid ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <AlertTitle
                          className={
                            validationResult.isValid ? 'text-emerald-800' : 'text-red-800'
                          }
                        >
                          {validationResult.isValid ? 'البيانات صحيحة' : 'يوجد أخطاء في البيانات'}
                        </AlertTitle>
                        <AlertDescription>
                          {validationResult.isValid ? (
                            <span className="text-emerald-700">
                              جميع البيانات متوافقة مع متطلبات WPS
                            </span>
                          ) : (
                            <ul className="list-disc list-inside text-red-700 mt-2">
                              {validationResult.errors.slice(0, 5).map((err, i) => (
                                <li key={i}>
                                  {err.employeeName && `${err.employeeName}: `}
                                  {err.message}
                                </li>
                              ))}
                              {validationResult.errors.length > 5 && (
                                <li>و {validationResult.errors.length - 5} أخطاء أخرى...</li>
                              )}
                            </ul>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-slate-50">
                        <CardContent className="pt-4">
                          <p className="text-sm text-slate-500">عدد الموظفين</p>
                          <p className="text-2xl font-bold text-navy">{employees.length}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-emerald-50">
                        <CardContent className="pt-4">
                          <p className="text-sm text-emerald-600">إجمالي الرواتب</p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {formatCurrency(totals.basicSalary + totals.housingAllowance)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-blue-50">
                        <CardContent className="pt-4">
                          <p className="text-sm text-blue-600">البدلات الأخرى</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(totals.otherEarnings)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-50">
                        <CardContent className="pt-4">
                          <p className="text-sm text-orange-600">صافي المبلغ</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {formatCurrency(totals.netSalary)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={handleValidate}
                        className="rounded-xl"
                      >
                        <CheckCircle className="h-4 w-4 ms-2" />
                        التحقق من البيانات
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handlePreview}
                        className="rounded-xl"
                        disabled={employees.length === 0}
                      >
                        <Eye className="h-4 w-4 ms-2" />
                        معاينة الملف
                      </Button>
                      <Button
                        onClick={handleDownload}
                        className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                        disabled={employees.length === 0}
                      >
                        <Download className="h-4 w-4 ms-2" />
                        تحميل ملف WPS
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Info */}
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  معلومات هامة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">الموعد النهائي</p>
                  <p className="text-blue-600">
                    يجب رفع ملف WPS خلال أول 10 أيام من الشهر التالي
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="font-medium text-amber-800">العملة</p>
                  <p className="text-amber-600">جميع المبالغ بالريال السعودي (SAR) فقط</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-emerald-800">صيغة الملف</p>
                  <p className="text-emerald-600">SIF (Salary Information File)</p>
                </div>
              </CardContent>
            </Card>

            {/* Help Links */}
            <Card className="rounded-2xl bg-gradient-to-br from-navy to-navy/90">
              <CardContent className="p-4 text-white">
                <Shield className="h-8 w-8 mb-3 text-emerald-400" />
                <h4 className="font-bold mb-2">نظام حماية الأجور</h4>
                <p className="text-sm text-white/80 mb-3">
                  نظام إلزامي لضمان صرف الرواتب في الوقت المحدد
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    window.open('https://mudad.com.sa', '_blank')
                  }
                >
                  زيارة منصة مدد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                معاينة ملف WPS
              </DialogTitle>
              <DialogDescription>
                {filePreview?.filename}
              </DialogDescription>
            </DialogHeader>

            {filePreview && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-500">المنشأة</p>
                    <p className="font-bold">{filePreview.establishment.name}</p>
                    <p className="text-sm text-slate-600">{filePreview.establishment.bank}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">شهر الراتب</p>
                    <p className="font-bold">{filePreview.summary.salaryMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">إجمالي صافي</p>
                    <p className="font-bold text-emerald-600">
                      {formatCurrency(filePreview.summary.totalNetSalary)} ر.س
                    </p>
                  </div>
                </div>

                {/* Raw Content */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-navy font-medium">محتوى الملف (SIF)</Label>
                    <Button variant="outline" size="sm" onClick={handleCopyRawContent}>
                      <Copy className="h-4 w-4 ms-1" />
                      نسخ
                    </Button>
                  </div>
                  <pre
                    className="p-4 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-xs font-mono"
                    dir="ltr"
                  >
                    {filePreview.rawContent}
                  </pre>
                </div>

                {/* Download Button */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                    إغلاق
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Download className="h-4 w-4 ms-2" />
                    تحميل الملف
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
