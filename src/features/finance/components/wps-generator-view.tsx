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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  GosiSelectItem,
  GosiSelectValue,
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
            <GosiCard>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <GosiCardHeader>
                  <TabsList className="bg-slate-100/80 p-1.5 rounded-2xl backdrop-blur-sm">
                    <TabsTrigger
                      value="establishment"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 rounded-xl px-6 py-3 font-bold transition-all duration-300"
                    >
                      <Building2 className="h-4 w-4 ms-2" />
                      بيانات المنشأة
                    </TabsTrigger>
                    <TabsTrigger
                      value="employees"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 rounded-xl px-6 py-3 font-bold transition-all duration-300"
                    >
                      <Users className="h-4 w-4 ms-2" />
                      الموظفين ({employees.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="review"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 rounded-xl px-6 py-3 font-bold transition-all duration-300"
                    >
                      <CheckCircle className="h-4 w-4 ms-2" />
                      المراجعة والتحميل
                    </TabsTrigger>
                  </TabsList>
                </GosiCardHeader>

                <GosiCardContent>
                  {/* Establishment Tab */}
                  <TabsContent value="establishment" className="m-0 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <GosiLabel>رقم المنشأة (وزارة العمل)</GosiLabel>
                          <GosiInput
                            placeholder="مثال: 1234567890123 (13 رقم)"
                            value={establishment.molEstablishmentId}
                            onChange={(e) =>
                              handleEstablishmentChange('molEstablishmentId', e.target.value)
                            }
                            maxLength={13}
                          />
                          <p className="text-xs text-slate-500 mt-2 ms-1">
                            رقم المنشأة المسجل لدى وزارة الموارد البشرية (13 رقم)
                          </p>
                        </div>

                        <div>
                          <GosiLabel>اسم المنشأة</GosiLabel>
                          <GosiInput
                            placeholder="اسم الشركة / المؤسسة"
                            value={establishment.establishmentName}
                            onChange={(e) =>
                              handleEstablishmentChange('establishmentName', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <GosiLabel>البنك</GosiLabel>
                          <GosiSelect onValueChange={handleEstablishmentBankChange}>
                            <GosiSelectTrigger>
                              <SelectValue placeholder="اختر البنك" />
                            </GosiSelectTrigger>
                            <GosiSelectContent>
                              {BANK_OPTIONS.map((bank) => (
                                <SelectItem key={bank.value} value={bank.value}>
                                  {bank.label}
                                </SelectItem>
                              ))}
                            </GosiSelectContent>
                          </GosiSelect>
                        </div>

                        <div>
                          <GosiLabel>رقم الآيبان (IBAN)</GosiLabel>
                          <GosiInput
                            placeholder="SA0000000000000000000000"
                            value={establishment.bankAccountIban}
                            onChange={(e) =>
                              handleEstablishmentChange(
                                'bankAccountIban',
                                e.target.value.toUpperCase()
                              )
                            }
                            className="font-mono"
                            maxLength={24}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Salary Month Selection */}
                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50">
                      <GosiLabel className="text-emerald-800">شهر الراتب</GosiLabel>
                      <GosiInput
                        type="month"
                        value={salaryMonth}
                        onChange={(e) => setSalaryMonth(e.target.value)}
                        className="max-w-xs bg-white"
                      />
                      {payPeriod.start && (
                        <p className="text-sm text-emerald-700 mt-3 font-medium">
                          فترة الدفع: {payPeriod.start} إلى {payPeriod.end} ({payPeriod.days} يوم)
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Employees Tab */}
                  <TabsContent value="employees" className="m-0 space-y-8">
                    {/* Add Employee Form */}
                    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Plus className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {editingIndex !== null ? 'تعديل موظف' : 'إضافة موظف جديد'}
                          </h3>
                          <p className="text-sm text-slate-500">أدخل بيانات الموظف للملف</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <GosiLabel>رقم الهوية/الإقامة (MOL ID)</GosiLabel>
                            <GosiInput
                              placeholder="14 رقم"
                              value={currentEmployee.molPersonId}
                              onChange={(e) => handleEmployeeChange('molPersonId', e.target.value)}
                              maxLength={14}
                            />
                          </div>
                          <div>
                            <GosiLabel>الهوية الوطنية / رقم الإقامة</GosiLabel>
                            <GosiInput
                              placeholder="10 أرقام"
                              value={currentEmployee.nationalId}
                              onChange={(e) => handleEmployeeChange('nationalId', e.target.value)}
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <GosiLabel>اسم الموظف</GosiLabel>
                            <GosiInput
                              placeholder="الاسم الكامل"
                              value={currentEmployee.employeeName}
                              onChange={(e) => handleEmployeeChange('employeeName', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <GosiLabel>بنك الموظف</GosiLabel>
                            <GosiSelect onValueChange={handleEmployeeBankChange}>
                              <GosiSelectTrigger>
                                <SelectValue placeholder="اختر البنك" />
                              </GosiSelectTrigger>
                              <GosiSelectContent>
                                {BANK_OPTIONS.map((bank) => (
                                  <SelectItem key={bank.value} value={bank.value}>
                                    {bank.label}
                                  </SelectItem>
                                ))}
                              </GosiSelectContent>
                            </GosiSelect>
                          </div>
                          <div>
                            <GosiLabel>رقم الآيبان (IBAN)</GosiLabel>
                            <GosiInput
                              placeholder="SA0000000000000000000000"
                              value={currentEmployee.accountNumber}
                              onChange={(e) =>
                                handleEmployeeChange('accountNumber', e.target.value.toUpperCase())
                              }
                              className="font-mono"
                              maxLength={24}
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <GosiLabel>الراتب الأساسي</GosiLabel>
                            <GosiInput
                              type="number"
                              placeholder="0"
                              value={currentEmployee.basicSalary || ''}
                              onChange={(e) =>
                                handleEmployeeChange('basicSalary', parseFloat(e.target.value) || 0)
                              }
                              min={0}
                            />
                          </div>
                          <div>
                            <GosiLabel>بدل السكن</GosiLabel>
                            <GosiInput
                              type="number"
                              placeholder="0"
                              value={currentEmployee.housingAllowance || ''}
                              onChange={(e) =>
                                handleEmployeeChange(
                                  'housingAllowance',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min={0}
                            />
                          </div>
                          <div>
                            <GosiLabel>بدلات أخرى</GosiLabel>
                            <GosiInput
                              type="number"
                              placeholder="0"
                              value={currentEmployee.otherEarnings || ''}
                              onChange={(e) =>
                                handleEmployeeChange(
                                  'otherEarnings',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min={0}
                            />
                          </div>
                          <div>
                            <GosiLabel>الاستقطاعات</GosiLabel>
                            <GosiInput
                              type="number"
                              placeholder="0"
                              value={currentEmployee.deductions || ''}
                              onChange={(e) =>
                                handleEmployeeChange('deductions', parseFloat(e.target.value) || 0)
                              }
                              min={0}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
                          {editingIndex !== null && (
                            <GosiButton
                              variant="outline"
                              onClick={() => {
                                setEditingIndex(null)
                                setCurrentEmployee({ ...DEFAULT_EMPLOYEE })
                              }}
                            >
                              إلغاء
                            </GosiButton>
                          )}
                          <GosiButton onClick={handleSaveEmployee}>
                            {editingIndex !== null ? 'تحديث' : 'إضافة موظف'}
                          </GosiButton>
                        </div>
                      </div>
                    </div>

                    {/* Employees List */}
                    {employees.length > 0 ? (
                      <div className="space-y-3">
                        {employees.map((emp, index) => {
                          const netSalary =
                            emp.basicSalary +
                            emp.housingAllowance +
                            emp.otherEarnings -
                            emp.deductions -
                            (emp.leaveDeduction || 0)
                          const isLowSalary = netSalary < 1500
                          return (
                            <div
                              key={index}
                              className="group relative bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                            >
                              {/* Priority Strip */}
                              <div
                                className={`absolute start-0 top-0 bottom-0 w-1.5 ${
                                  isLowSalary ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                              />
                              <div className="p-5 ps-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{emp.employeeName || `موظف #${index + 1}`}</p>
                                      <p className="text-sm text-slate-500 font-mono">{emp.nationalId}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-left">
                                      <p className="text-xs text-slate-400">البنك</p>
                                      <p className="text-sm font-medium text-slate-600">
                                        {getBankNameFromSarieCode(emp.bankRoutingCode)}
                                      </p>
                                    </div>
                                    <div className="text-left">
                                      <p className="text-xs text-slate-400">صافي الراتب</p>
                                      <p className={`text-lg font-bold ${isLowSalary ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(netSalary)} ر.س
                                      </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
                                        onClick={() => handleEditEmployee(index)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleDeleteEmployee(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-bold text-lg">لم يتم إضافة موظفين بعد</p>
                        <p className="text-sm text-slate-400 mt-1">أضف موظفين باستخدام النموذج أعلاه</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Review Tab */}
                  <TabsContent value="review" className="m-0 space-y-8">
                    {/* Validation Status */}
                    {validationResult && (
                      <div
                        className={`p-6 rounded-2xl border-2 ${
                          validationResult.isValid
                            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                            : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100/50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              validationResult.isValid ? 'bg-emerald-100' : 'bg-red-100'
                            }`}
                          >
                            {validationResult.isValid ? (
                              <CheckCircle className="h-6 w-6 text-emerald-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-bold text-lg ${
                                validationResult.isValid ? 'text-emerald-800' : 'text-red-800'
                              }`}
                            >
                              {validationResult.isValid ? 'البيانات صحيحة' : 'يوجد أخطاء في البيانات'}
                            </h4>
                            {validationResult.isValid ? (
                              <p className="text-emerald-700 mt-1">
                                جميع البيانات متوافقة مع متطلبات WPS
                              </p>
                            ) : (
                              <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                                {validationResult.errors.slice(0, 5).map((err, i) => (
                                  <li key={i}>
                                    {err.employeeName && `${err.employeeName}: `}
                                    {err.message}
                                  </li>
                                ))}
                                {validationResult.errors.length > 5 && (
                                  <li className="font-medium">و {validationResult.errors.length - 5} أخطاء أخرى...</li>
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50">
                        <p className="text-sm text-slate-500 font-medium">عدد الموظفين</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{employees.length}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                        <p className="text-sm text-emerald-600 font-medium">إجمالي الرواتب</p>
                        <p className="text-3xl font-bold text-emerald-700 mt-1">
                          {formatCurrency(totals.basicSalary + totals.housingAllowance)}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                        <p className="text-sm text-blue-600 font-medium">البدلات الأخرى</p>
                        <p className="text-3xl font-bold text-blue-700 mt-1">
                          {formatCurrency(totals.otherEarnings)}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50">
                        <p className="text-sm text-orange-600 font-medium">صافي المبلغ</p>
                        <p className="text-3xl font-bold text-orange-700 mt-1">
                          {formatCurrency(totals.netSalary)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      <GosiButton variant="outline" onClick={handleValidate}>
                        <CheckCircle className="h-4 w-4 ms-2" />
                        التحقق من البيانات
                      </GosiButton>
                      <GosiButton
                        variant="outline"
                        onClick={handlePreview}
                        disabled={employees.length === 0}
                      >
                        <Eye className="h-4 w-4 ms-2" />
                        معاينة الملف
                      </GosiButton>
                      <GosiButton
                        onClick={handleDownload}
                        disabled={employees.length === 0}
                        size="lg"
                      >
                        <Download className="h-4 w-4 ms-2" />
                        تحميل ملف WPS
                      </GosiButton>
                    </div>
                  </TabsContent>
                </GosiCardContent>
              </Tabs>
            </GosiCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <GosiCard>
              <GosiCardHeader>
                <GosiCardTitle>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  معلومات هامة
                </GosiCardTitle>
              </GosiCardHeader>
              <GosiCardContent className="space-y-4 text-sm">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                  <p className="font-bold text-blue-800">الموعد النهائي</p>
                  <p className="text-blue-600 mt-1">
                    يجب رفع ملف WPS خلال أول 10 أيام من الشهر التالي
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                  <p className="font-bold text-amber-800">العملة</p>
                  <p className="text-amber-600 mt-1">جميع المبالغ بالريال السعودي (SAR) فقط</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                  <p className="font-bold text-emerald-800">صيغة الملف</p>
                  <p className="text-emerald-600 mt-1">SIF (Salary Information File)</p>
                </div>
              </GosiCardContent>
            </GosiCard>

            {/* Help Links */}
            <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-emerald-400" />
              </div>
              <h4 className="font-bold text-xl mb-2">نظام حماية الأجور</h4>
              <p className="text-sm text-white/70 mb-4">
                نظام إلزامي لضمان صرف الرواتب في الوقت المحدد
              </p>
              <GosiButton
                variant="secondary"
                className="w-full"
                onClick={() => window.open('https://mudad.com.sa', '_blank')}
              >
                زيارة منصة مدد
              </GosiButton>
            </div>
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
