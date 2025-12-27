import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { HRSidebar } from './hr-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  useCreatePromotion,
  useUpdatePromotion,
  usePromotion,
} from '@/hooks/useEmployeePromotion'
import { useEmployees } from '@/hooks/useHR'
import { cn } from '@/lib/utils'
import {
  Search,
  Bell,
  Loader2,
  CheckCircle,
  Award,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  Briefcase,
  FileText,
  Users,
} from 'lucide-react'
import type { CreatePromotionInput, PromotionDetail } from '@/services/employeePromotionService'
import { PromotionProperty } from '@/services/employeePromotionService'
import type { Employee } from '@/services/hrService'

export function PromotionCreateView() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { promotionId?: string }
  const promotionId = params?.promotionId
  const isEditMode = !!promotionId

  const { data: existingPromotion, isLoading: isLoadingPromotion } = usePromotion(promotionId || '')
  const { data: employeesData } = useEmployees()
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [promotionDate, setPromotionDate] = useState(new Date().toISOString().split('T')[0])
  const [effectiveDate, setEffectiveDate] = useState('')

  // New position details
  const [newDepartmentId, setNewDepartmentId] = useState('')
  const [newDepartmentName, setNewDepartmentName] = useState('')
  const [newDepartmentNameAr, setNewDepartmentNameAr] = useState('')
  const [newDesignation, setNewDesignation] = useState('')
  const [newDesignationAr, setNewDesignationAr] = useState('')
  const [newGrade, setNewGrade] = useState('')
  const [newSalary, setNewSalary] = useState<number>(0)
  const [newBranch, setNewBranch] = useState('')

  // Reason and justification
  const [reason, setReason] = useState('')
  const [reasonAr, setReasonAr] = useState('')
  const [justification, setJustification] = useState('')
  const [justificationAr, setJustificationAr] = useState('')
  const [performanceRating, setPerformanceRating] = useState<number>(0)

  // Notification
  const [notifyEmployee, setNotifyEmployee] = useState(true)

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Populate selected employee data when selected
  useEffect(() => {
    if (selectedEmployeeId && employeesData?.employees) {
      const employee = employeesData.employees.find((e: Employee) => e._id === selectedEmployeeId)
      if (employee) {
        setSelectedEmployee(employee)
        // Pre-fill with current employee data
        setNewDepartmentId(employee.employment?.departmentId || '')
        setNewDepartmentName(employee.employment?.departmentName || '')
        setNewDesignation(employee.employment?.jobTitle || '')
        setNewDesignationAr(employee.employment?.jobTitleArabic || '')
        setNewSalary(employee.compensation?.basicSalary || 0)
      }
    }
  }, [selectedEmployeeId, employeesData])

  // Populate form when editing
  useEffect(() => {
    if (existingPromotion && isEditMode) {
      setSelectedEmployeeId(existingPromotion.employeeId)
      setPromotionDate(existingPromotion.promotionDate.split('T')[0])
      setEffectiveDate(existingPromotion.effectiveDate.split('T')[0])
      setNewDepartmentId(existingPromotion.newDepartmentId || '')
      setNewDepartmentName(existingPromotion.newDepartmentName || '')
      setNewDepartmentNameAr(existingPromotion.newDepartmentNameAr || '')
      setNewDesignation(existingPromotion.newDesignation)
      setNewDesignationAr(existingPromotion.newDesignationAr || '')
      setNewGrade(existingPromotion.newGrade || '')
      setNewSalary(existingPromotion.newSalary)
      setNewBranch(existingPromotion.newBranch || '')
      setReason(existingPromotion.reason)
      setReasonAr(existingPromotion.reasonAr || '')
      setJustification(existingPromotion.justification || '')
      setJustificationAr(existingPromotion.justificationAr || '')
      setPerformanceRating(existingPromotion.performanceRating || 0)
      setNotifyEmployee(existingPromotion.notifyEmployee)
    }
  }, [existingPromotion, isEditMode])

  // Calculate promotion details
  const promotionDetails = useMemo((): PromotionDetail[] => {
    if (!selectedEmployee) return []

    const details: PromotionDetail[] = []

    // Department change
    if (newDepartmentName && newDepartmentName !== selectedEmployee.employment?.departmentName) {
      details.push({
        property: PromotionProperty.DEPARTMENT,
        currentValue: selectedEmployee.employment?.departmentName || 'غير محدد',
        newValue: newDepartmentName,
      })
    }

    // Designation change
    if (newDesignation && newDesignation !== selectedEmployee.employment?.jobTitle) {
      details.push({
        property: PromotionProperty.DESIGNATION,
        currentValue: selectedEmployee.employment?.jobTitle || 'غير محدد',
        newValue: newDesignation,
      })
    }

    // Grade change
    if (newGrade) {
      details.push({
        property: PromotionProperty.GRADE,
        currentValue: 'N/A',
        newValue: newGrade,
      })
    }

    // Salary change
    if (newSalary && newSalary !== selectedEmployee.compensation?.basicSalary) {
      details.push({
        property: PromotionProperty.SALARY,
        currentValue: String(selectedEmployee.compensation?.basicSalary || 0),
        newValue: String(newSalary),
      })
    }

    return details
  }, [selectedEmployee, newDepartmentName, newDesignation, newGrade, newSalary])

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!selectedEmployeeId) {
      errors.employee = 'يرجى اختيار الموظف / Please select an employee'
    }
    if (!promotionDate) {
      errors.promotionDate = 'يرجى إدخال تاريخ الترقية / Please enter promotion date'
    }
    if (!effectiveDate) {
      errors.effectiveDate = 'يرجى إدخال تاريخ السريان / Please enter effective date'
    }
    if (!newDesignation) {
      errors.newDesignation = 'يرجى إدخال المسمى الوظيفي الجديد / Please enter new designation'
    }
    if (!newSalary || newSalary <= 0) {
      errors.newSalary = 'يرجى إدخال الراتب الجديد / Please enter new salary'
    }
    if (selectedEmployee && newSalary <= (selectedEmployee.compensation?.basicSalary || 0)) {
      errors.newSalary =
        'يجب أن يكون الراتب الجديد أكبر من الراتب الحالي / New salary must be higher than current salary'
    }
    if (!reason) {
      errors.reason = 'يرجى إدخال سبب الترقية / Please enter promotion reason'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedEmployee) {
      return
    }

    setIsSubmitting(true)

    const promotionData: CreatePromotionInput = {
      employeeId: selectedEmployeeId,
      employeeNumber: selectedEmployee.employeeNumber,
      employeeName: selectedEmployee.personalInfo?.fullNameEnglish || selectedEmployee.personalInfo?.fullNameArabic || '',
      employeeNameAr: selectedEmployee.personalInfo?.fullNameArabic,
      promotionDate,
      effectiveDate,
      previousDepartmentId: selectedEmployee.employment?.departmentId,
      previousDepartmentName: selectedEmployee.employment?.departmentName,
      previousDepartmentNameAr: selectedEmployee.employment?.departmentName,
      previousDesignation: selectedEmployee.employment?.jobTitle || 'غير محدد',
      previousDesignationAr: selectedEmployee.employment?.jobTitleArabic,
      previousSalary: selectedEmployee.compensation?.basicSalary || 0,
      newDepartmentId: newDepartmentId || selectedEmployee.employment?.departmentId,
      newDepartmentName: newDepartmentName || selectedEmployee.employment?.departmentName,
      newDepartmentNameAr: newDepartmentNameAr || selectedEmployee.employment?.departmentName,
      newDesignation,
      newDesignationAr: newDesignationAr || newDesignation,
      newGrade,
      newSalary,
      newBranch,
      promotionDetails,
      reason,
      reasonAr: reasonAr || reason,
      justification,
      justificationAr: justificationAr || justification,
      performanceRating,
      notifyEmployee,
      officeId: 'default', // This should come from user's office context
    }

    try {
      if (isEditMode && promotionId) {
        await updateMutation.mutateAsync({ id: promotionId, data: promotionData })
      } else {
        await createMutation.mutateAsync(promotionData)
      }
      navigate({ to: ROUTES.dashboard.hr.promotions.list })
    } catch (error) {
      console.error('Failed to save promotion:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate salary increase
  const salaryIncrease = useMemo(() => {
    if (!selectedEmployee?.compensation?.basicSalary || !newSalary) return null
    const increase = newSalary - selectedEmployee.compensation.basicSalary
    const percentage = ((increase / selectedEmployee.compensation.basicSalary) * 100).toFixed(1)
    return { increase, percentage }
  }, [selectedEmployee, newSalary])

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الترقيات', href: ROUTES.dashboard.hr.promotions.list, isActive: true },
  ]

  if (isLoadingPromotion && isEditMode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل الترقية' : 'ترقية موظف جديدة'}
          type="promotions"
        />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  اختيار الموظف / Select Employee
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="employee">الموظف / Employee *</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                    disabled={isEditMode}
                  >
                    <SelectTrigger
                      className={cn(
                        'mt-1',
                        validationErrors.employee && 'border-red-500'
                      )}
                    >
                      <SelectValue placeholder="اختر الموظف / Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeesData?.employees?.map((employee: Employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.personalInfo?.fullNameArabic || employee.personalInfo?.fullNameEnglish} -{' '}
                          {employee.employeeNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.employee && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.employee}</p>
                  )}
                </div>

                {/* Current Employee Info Display */}
                {selectedEmployee && (
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-bold text-navy">المعلومات الحالية / Current Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">المسمى الوظيفي:</span>
                        <span className="font-medium ms-2">
                          {selectedEmployee.employment?.jobTitleArabic || selectedEmployee.employment?.jobTitle}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">القسم:</span>
                        <span className="font-medium ms-2">
                          {selectedEmployee.employment?.departmentName || 'غير محدد'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">الراتب الأساسي:</span>
                        <span className="font-medium ms-2 text-emerald-600">
                          {selectedEmployee.compensation?.basicSalary?.toLocaleString()} ريال
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                  التواريخ / Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promotionDate">تاريخ الترقية / Promotion Date *</Label>
                  <Input
                    type="date"
                    id="promotionDate"
                    value={promotionDate}
                    onChange={(e) => setPromotionDate(e.target.value)}
                    className={cn('mt-1', validationErrors.promotionDate && 'border-red-500')}
                  />
                  {validationErrors.promotionDate && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.promotionDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="effectiveDate">تاريخ السريان / Effective Date *</Label>
                  <Input
                    type="date"
                    id="effectiveDate"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className={cn('mt-1', validationErrors.effectiveDate && 'border-red-500')}
                  />
                  {validationErrors.effectiveDate && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.effectiveDate}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* New Position Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-500" />
                  الوظيفة الجديدة / New Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newDesignationAr">المسمى الوظيفي (عربي) *</Label>
                    <Input
                      id="newDesignationAr"
                      value={newDesignationAr}
                      onChange={(e) => setNewDesignationAr(e.target.value)}
                      className={cn('mt-1', validationErrors.newDesignation && 'border-red-500')}
                      placeholder="مثال: مدير قسم"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newDesignation">المسمى الوظيفي (English)</Label>
                    <Input
                      id="newDesignation"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="mt-1"
                      placeholder="e.g., Department Manager"
                    />
                    {validationErrors.newDesignation && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.newDesignation}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newDepartmentNameAr">القسم (عربي)</Label>
                    <Input
                      id="newDepartmentNameAr"
                      value={newDepartmentNameAr}
                      onChange={(e) => setNewDepartmentNameAr(e.target.value)}
                      className="mt-1"
                      placeholder="القسم الجديد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newDepartmentName">القسم (English)</Label>
                    <Input
                      id="newDepartmentName"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="mt-1"
                      placeholder="New Department"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newGrade">الدرجة / Grade</Label>
                  <Input
                    id="newGrade"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="mt-1"
                    placeholder="مثال: الدرجة 5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  الراتب الجديد / New Salary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newSalary">الراتب الأساسي الجديد (ريال) *</Label>
                  <Input
                    type="number"
                    id="newSalary"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className={cn('mt-1', validationErrors.newSalary && 'border-red-500')}
                    min="0"
                    step="100"
                  />
                  {validationErrors.newSalary && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.newSalary}</p>
                  )}
                </div>

                {salaryIncrease && (
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">الزيادة / Increase</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {salaryIncrease.increase.toLocaleString()} ريال
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-600">النسبة / Percentage</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {salaryIncrease.percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reason & Justification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  السبب والمبرر / Reason & Justification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reasonAr">سبب الترقية (عربي) *</Label>
                  <Textarea
                    id="reasonAr"
                    value={reasonAr}
                    onChange={(e) => setReasonAr(e.target.value)}
                    className={cn('mt-1', validationErrors.reason && 'border-red-500')}
                    placeholder="مثال: تميز في الأداء وتحقيق الأهداف"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="reason">سبب الترقية (English)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Outstanding performance and goal achievement"
                    rows={3}
                  />
                  {validationErrors.reason && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.reason}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="justificationAr">المبرر التفصيلي (عربي)</Label>
                  <Textarea
                    id="justificationAr"
                    value={justificationAr}
                    onChange={(e) => setJustificationAr(e.target.value)}
                    className="mt-1"
                    placeholder="تفاصيل إضافية للترقية..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="performanceRating">تقييم الأداء (1-5)</Label>
                  <Input
                    type="number"
                    id="performanceRating"
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(Number(e.target.value))}
                    className="mt-1"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-500" />
                  الإشعارات / Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifyEmployee">إشعار الموظف / Notify Employee</Label>
                    <p className="text-sm text-slate-500 mt-1">
                      إرسال إشعار للموظف عند الموافقة على الترقية
                    </p>
                  </div>
                  <Switch
                    id="notifyEmployee"
                    checked={notifyEmployee}
                    onCheckedChange={setNotifyEmployee}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 ms-2" />
                    {isEditMode ? 'تحديث الترقية' : 'حفظ الترقية'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.hr.promotions.list })}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-emerald-500" />
                    ملخص الترقية / Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">الموظف</p>
                    <p className="font-medium">
                      {selectedEmployee.personalInfo?.fullNameArabic}
                    </p>
                  </div>
                  {promotionDetails.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">التغييرات</p>
                      <div className="space-y-2">
                        {promotionDetails.map((detail, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded p-2 text-sm"
                          >
                            <p className="font-medium text-navy">{detail.property}</p>
                            <p className="text-slate-600">
                              من: {detail.currentValue} → إلى: {detail.newValue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {salaryIncrease && (
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">الزيادة في الراتب</p>
                      <p className="text-xl font-bold text-emerald-600">
                        +{salaryIncrease.increase.toLocaleString()} ريال
                      </p>
                      <p className="text-sm text-emerald-600">({salaryIncrease.percentage}%)</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Saudi Labor Law Compliance Note */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-5 w-5" />
                  ملاحظات قانونية
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>• يجب توثيق التغييرات في العقد</p>
                <p>• تحديث بيانات التأمينات الاجتماعية</p>
                <p>• إشعار الموظف كتابياً بالترقية</p>
                <p>• مراجعة الحقوق والمزايا الجديدة</p>
              </CardContent>
            </Card>
          </div>
        </form>
      </Main>
    </>
  )
}
