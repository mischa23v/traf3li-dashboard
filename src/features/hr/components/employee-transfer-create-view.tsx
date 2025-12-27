import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import {
  useCreateEmployeeTransfer,
  useUpdateEmployeeTransfer,
  useEmployeeTransfer,
} from '@/hooks/useEmployeeTransfer'
import { useEmployees } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Bell,
  ArrowRight,
  User,
  Building2,
  Calendar,
  CheckCircle,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  TRANSFER_TYPE_LABELS,
  type TransferType,
  type CreateEmployeeTransferData,
} from '@/services/employeeTransferService'

export function EmployeeTransferCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingTransfer, isLoading: isLoadingTransfer } = useEmployeeTransfer(editId || '')
  const createMutation = useCreateEmployeeTransfer()
  const updateMutation = useUpdateEmployeeTransfer()
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Form State
  const [employeeId, setEmployeeId] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transferType, setTransferType] = useState<TransferType>('internal')

  // From
  const [fromBranch, setFromBranch] = useState('')
  const [fromDepartmentId, setFromDepartmentId] = useState('')
  const [fromDepartmentName, setFromDepartmentName] = useState('')
  const [fromDesignation, setFromDesignation] = useState('')
  const [fromReportingManager, setFromReportingManager] = useState('')

  // To
  const [toBranch, setToBranch] = useState('')
  const [toDepartmentId, setToDepartmentId] = useState('')
  const [toDepartmentName, setToDepartmentName] = useState('')
  const [toDesignation, setToDesignation] = useState('')
  const [toReportingManager, setToReportingManager] = useState('')

  // Reason
  const [reason, setReason] = useState('')
  const [reasonAr, setReasonAr] = useState('')

  // External Transfer
  const [newCompany, setNewCompany] = useState('')
  const [createNewEmployeeId, setCreateNewEmployeeId] = useState(false)

  // Handover
  const [handoverRequired, setHandoverRequired] = useState(false)
  const [handoverItems, setHandoverItems] = useState<Array<{ item: string; itemAr?: string }>>([])

  // Notification
  const [notifyEmployee, setNotifyEmployee] = useState(true)

  // Load existing data for edit mode
  useEffect(() => {
    if (isEditMode && existingTransfer) {
      setEmployeeId(existingTransfer.employeeId)
      setTransferDate(existingTransfer.transferDate.split('T')[0])
      setEffectiveDate(existingTransfer.effectiveDate.split('T')[0])
      setEndDate(existingTransfer.endDate ? existingTransfer.endDate.split('T')[0] : '')
      setTransferType(existingTransfer.transferType)

      setFromBranch(existingTransfer.fromBranch || '')
      setFromDepartmentId(existingTransfer.fromDepartmentId || '')
      setFromDepartmentName(existingTransfer.fromDepartmentName || '')
      setFromDesignation(existingTransfer.fromDesignation || '')
      setFromReportingManager(existingTransfer.fromReportingManager || '')

      setToBranch(existingTransfer.toBranch || '')
      setToDepartmentId(existingTransfer.toDepartmentId || '')
      setToDepartmentName(existingTransfer.toDepartmentName || '')
      setToDesignation(existingTransfer.toDesignation || '')
      setToReportingManager(existingTransfer.toReportingManager || '')

      setReason(existingTransfer.reason)
      setReasonAr(existingTransfer.reasonAr || '')
      setNewCompany(existingTransfer.newCompany || '')
      setCreateNewEmployeeId(existingTransfer.createNewEmployeeId)
      setHandoverRequired(existingTransfer.handoverRequired)
      setNotifyEmployee(existingTransfer.notifyEmployee)

      if (existingTransfer.handoverChecklist) {
        setHandoverItems(
          existingTransfer.handoverChecklist.map((item) => ({
            item: item.item,
            itemAr: item.itemAr,
          }))
        )
      }
    }
  }, [isEditMode, existingTransfer])

  // Auto-populate employee data
  useEffect(() => {
    if (employeeId && employeesData?.employees) {
      const selectedEmployee = employeesData.employees.find((emp) => emp._id === employeeId)
      if (selectedEmployee) {
        setFromDepartmentId(selectedEmployee.employment.departmentId || '')
        setFromDepartmentName(selectedEmployee.employment.departmentName || '')
        setFromDesignation(selectedEmployee.employment.jobTitle || '')
        setFromReportingManager(selectedEmployee.employment.managerName || '')
      }
    }
  }, [employeeId, employeesData])

  const handleAddHandoverItem = () => {
    setHandoverItems([...handoverItems, { item: '', itemAr: '' }])
  }

  const handleRemoveHandoverItem = (index: number) => {
    setHandoverItems(handoverItems.filter((_, i) => i !== index))
  }

  const handleUpdateHandoverItem = (index: number, field: 'item' | 'itemAr', value: string) => {
    const updated = [...handoverItems]
    updated[index][field] = value
    setHandoverItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId || !transferDate || !effectiveDate || !reason) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const data: CreateEmployeeTransferData = {
      employeeId,
      transferDate,
      effectiveDate,
      endDate: endDate || undefined,
      transferType,
      fromBranch: fromBranch || undefined,
      fromDepartmentId: fromDepartmentId || undefined,
      fromDepartmentName: fromDepartmentName || undefined,
      fromDesignation: fromDesignation || undefined,
      fromReportingManager: fromReportingManager || undefined,
      toBranch: toBranch || undefined,
      toDepartmentId: toDepartmentId || undefined,
      toDepartmentName: toDepartmentName || undefined,
      toDesignation: toDesignation || undefined,
      toReportingManager: toReportingManager || undefined,
      reason,
      reasonAr: reasonAr || undefined,
      newCompany: transferType === 'external' ? newCompany || undefined : undefined,
      createNewEmployeeId: transferType === 'external' ? createNewEmployeeId : undefined,
      handoverRequired,
      handoverChecklist: handoverRequired ? handoverItems.filter((item) => item.item) : undefined,
      notifyEmployee,
    }

    if (isEditMode && editId) {
      updateMutation.mutate(
        { id: editId, data },
        {
          onSuccess: () => navigate({ to: ROUTES.dashboard.hr.employeeTransfers.list }),
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate({ to: ROUTES.dashboard.hr.employeeTransfers.list }),
      })
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'نقل الموظفين', href: ROUTES.dashboard.hr.employeeTransfers.list, isActive: true },
  ]

  if (isEditMode && isLoadingTransfer) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa]">
          <Card className="rounded-2xl border-slate-100">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
              <p className="mt-4 text-slate-500">جاري تحميل البيانات...</p>
            </CardContent>
          </Card>
        </Main>
      </>
    )
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
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
          title={isEditMode ? 'تعديل طلب النقل' : 'طلب نقل جديد'}
          type="employees"
          listMode={false}
        />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Employee Selection */}
              <Card className="rounded-2xl border-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    معلومات الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employee">اختر الموظف *</Label>
                    <Select value={employeeId} onValueChange={setEmployeeId} required>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="اختر موظف..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesData?.employees.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.personalInfo.fullNameArabic} - {emp.employeeNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transferType">نوع النقل *</Label>
                      <Select
                        value={transferType}
                        onValueChange={(value) => setTransferType(value as TransferType)}
                        required
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRANSFER_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label.ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card className="rounded-2xl border-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    التواريخ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="transferDate">تاريخ النقل *</Label>
                      <Input
                        id="transferDate"
                        type="date"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="effectiveDate">تاريخ السريان *</Label>
                      <Input
                        id="effectiveDate"
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    {transferType === 'temporary' && (
                      <div>
                        <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Transfer Details */}
              <Card className="rounded-2xl border-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-emerald-500" />
                    تفاصيل النقل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* From */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium">من</h4>
                      <div>
                        <Label>الفرع</Label>
                        <Input
                          value={fromBranch}
                          onChange={(e) => setFromBranch(e.target.value)}
                          placeholder="الفرع الحالي"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>القسم</Label>
                        <Input
                          value={fromDepartmentName}
                          onChange={(e) => setFromDepartmentName(e.target.value)}
                          placeholder="القسم الحالي"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>المسمى الوظيفي</Label>
                        <Input
                          value={fromDesignation}
                          onChange={(e) => setFromDesignation(e.target.value)}
                          placeholder="المسمى الحالي"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* To */}
                    <div className="space-y-4 p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-medium text-emerald-700">إلى</h4>
                      <div>
                        <Label>الفرع</Label>
                        <Input
                          value={toBranch}
                          onChange={(e) => setToBranch(e.target.value)}
                          placeholder="الفرع الجديد"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>القسم</Label>
                        <Input
                          value={toDepartmentName}
                          onChange={(e) => setToDepartmentName(e.target.value)}
                          placeholder="القسم الجديد"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>المسمى الوظيفي</Label>
                        <Input
                          value={toDesignation}
                          onChange={(e) => setToDesignation(e.target.value)}
                          placeholder="المسمى الجديد"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reason */}
              <Card className="rounded-2xl border-slate-100">
                <CardHeader>
                  <CardTitle>سبب النقل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reason">السبب (English) *</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter transfer reason..."
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reasonAr">السبب (العربية)</Label>
                    <Textarea
                      id="reasonAr"
                      value={reasonAr}
                      onChange={(e) => setReasonAr(e.target.value)}
                      placeholder="أدخل سبب النقل بالعربية..."
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* External Transfer */}
              {transferType === 'external' && (
                <Card className="rounded-2xl border-slate-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      نقل خارجي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newCompany">الشركة الجديدة</Label>
                      <Input
                        id="newCompany"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="اسم الشركة الجديدة"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={createNewEmployeeId}
                        onCheckedChange={setCreateNewEmployeeId}
                        id="createNewId"
                      />
                      <Label htmlFor="createNewId">إنشاء رقم موظف جديد</Label>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Handover */}
              <Card className="rounded-2xl border-slate-100">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      التسليم
                    </div>
                    <Switch checked={handoverRequired} onCheckedChange={setHandoverRequired} />
                  </CardTitle>
                </CardHeader>
                {handoverRequired && (
                  <CardContent className="space-y-4">
                    {handoverItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={item.item}
                          onChange={(e) => handleUpdateHandoverItem(index, 'item', e.target.value)}
                          placeholder="Handover item (English)"
                          className="rounded-xl"
                        />
                        <Input
                          value={item.itemAr}
                          onChange={(e) => handleUpdateHandoverItem(index, 'itemAr', e.target.value)}
                          placeholder="عنصر التسليم (عربي)"
                          className="rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveHandoverItem(index)}
                          className="rounded-xl flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHandoverItem}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 ms-1" />
                      إضافة عنصر
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* Submit */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={notifyEmployee} onCheckedChange={setNotifyEmployee} id="notify" />
                  <Label htmlFor="notify">إشعار الموظف</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: ROUTES.dashboard.hr.employeeTransfers.list })}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ms-1 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 ms-1" />
                        {isEditMode ? 'تحديث' : 'إنشاء'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <HRSidebar />
            </div>
          </div>
        </form>
      </Main>
    </>
  )
}
