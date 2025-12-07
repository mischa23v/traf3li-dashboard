import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateExpenseClaim, useUpdateExpenseClaim, useExpenseClaim, useMileageRates } from '@/hooks/useExpenseClaims'
import { useEmployees } from '@/hooks/useHR'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  Search, Bell, ArrowRight, User, Building2,
  CheckCircle, ChevronDown, Users, DollarSign, FileText,
  Receipt, Plus, Trash2, Plane, Utensils, Hotel, Car,
  Paperclip, Upload, Calculator, Shield, Clock
} from 'lucide-react'
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_TYPE_LABELS,
  TRAVEL_CLASS_LABELS,
  type ExpenseType,
  type ExpenseCategory,
  type TravelClass,
  type VehicleType,
  type CreateExpenseClaimData,
} from '@/services/expenseClaimsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

interface LineItem {
  id: string
  category: ExpenseCategory
  description: string
  descriptionAr?: string
  expenseDate: string
  vendor?: string
  vendorAr?: string
  amount: number
  vatAmount?: number
  currency: string
  isBillable: boolean
  clientId?: string
  caseId?: string
  projectCode?: string
  notes?: string
}

export function ExpenseClaimsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingClaim, isLoading: isLoadingClaim } = useExpenseClaim(editId || '')
  const createMutation = useCreateExpenseClaim()
  const updateMutation = useUpdateExpenseClaim()
  const { data: mileageRates } = useMileageRates()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Basic Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [costCenter, setCostCenter] = useState('')

  // Form State - Claim Details
  const [claimTitle, setClaimTitle] = useState('')
  const [claimTitleAr, setClaimTitleAr] = useState('')
  const [expenseType, setExpenseType] = useState<ExpenseType>('reimbursement')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([])

  // Travel Details
  const [includeTravelDetails, setIncludeTravelDetails] = useState(false)
  const [tripPurpose, setTripPurpose] = useState('')
  const [tripPurposeAr, setTripPurposeAr] = useState('')
  const [departureCity, setDepartureCity] = useState('')
  const [arrivalCity, setArrivalCity] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  // Mileage Claim
  const [includeMileage, setIncludeMileage] = useState(false)
  const [vehicleType, setVehicleType] = useState<VehicleType>('personal_car')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [mileageJourneys, setMileageJourneys] = useState<Array<{
    id: string
    journeyDate: string
    fromLocation: string
    toLocation: string
    purpose: string
    distanceKm: number
    roundTrip: boolean
  }>>([])

  // Notes
  const [employeeNotes, setEmployeeNotes] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const vatTotal = lineItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0)
  const grandTotal = subtotal + vatTotal

  // Calculate mileage total
  const totalDistance = mileageJourneys.reduce((sum, j) => sum + (j.roundTrip ? j.distanceKm * 2 : j.distanceKm), 0)
  const mileageRate = mileageRates?.[vehicleType] || 0.5
  const mileageAmount = totalDistance * mileageRate

  // Populate form when editing
  useEffect(() => {
    if (existingClaim && isEditMode) {
      setEmployeeId(existingClaim.employeeId || '')
      setEmployeeName(existingClaim.employeeName || '')
      setEmployeeNameAr(existingClaim.employeeNameAr || '')
      setEmployeeNumber(existingClaim.employeeNumber || '')
      setDepartment(existingClaim.department || '')
      setJobTitle(existingClaim.jobTitle || '')
      setCostCenter(existingClaim.costCenter || '')
      setClaimTitle(existingClaim.claimTitle || '')
      setClaimTitleAr(existingClaim.claimTitleAr || '')
      setExpenseType(existingClaim.expenseType)
      setPeriodStart(existingClaim.claimPeriod?.startDate?.split('T')[0] || '')
      setPeriodEnd(existingClaim.claimPeriod?.endDate?.split('T')[0] || '')
      setDescription(existingClaim.description || '')
      setDescriptionAr(existingClaim.descriptionAr || '')

      if (existingClaim.lineItems && existingClaim.lineItems.length > 0) {
        setLineItems(existingClaim.lineItems.map(li => ({
          id: li.lineItemId,
          category: li.category,
          description: li.description,
          descriptionAr: li.descriptionAr,
          expenseDate: li.expenseDate?.split('T')[0] || '',
          vendor: li.vendor,
          vendorAr: li.vendorAr,
          amount: li.amount,
          vatAmount: li.vatAmount,
          currency: li.currency || 'SAR',
          isBillable: li.isBillable || false,
          clientId: li.clientId,
          caseId: li.caseId,
          projectCode: li.projectCode,
          notes: li.notes,
        })))
      }

      setEmployeeNotes(existingClaim.notes?.employeeNotes || '')
    }
  }, [existingClaim, isEditMode])

  // Handle employee selection
  const handleEmployeeSelect = (selectedEmployeeId: string) => {
    setEmployeeId(selectedEmployeeId)
    const employee = employeesData?.employees?.find(e => e._id === selectedEmployeeId)
    if (employee) {
      setEmployeeName(employee.personalInfo?.fullNameEnglish || '')
      setEmployeeNameAr(employee.personalInfo?.fullNameArabic || '')
      setEmployeeNumber(employee.employeeId || '')
      setDepartment(employee.employment?.departmentName || '')
      setJobTitle(employee.employment?.jobTitle || '')
    }
  }

  // Add new line item
  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}`,
      category: 'other',
      description: '',
      expenseDate: '',
      amount: 0,
      currency: 'SAR',
      isBillable: false,
    }
    setLineItems([...lineItems, newItem])
  }

  // Update line item
  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  // Remove line item
  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  // Add mileage journey
  const addMileageJourney = () => {
    setMileageJourneys([...mileageJourneys, {
      id: `journey_${Date.now()}`,
      journeyDate: '',
      fromLocation: '',
      toLocation: '',
      purpose: '',
      distanceKm: 0,
      roundTrip: false,
    }])
  }

  // Update mileage journey
  const updateMileageJourney = (id: string, updates: Partial<typeof mileageJourneys[0]>) => {
    setMileageJourneys(mileageJourneys.map(j =>
      j.id === id ? { ...j, ...updates } : j
    ))
  }

  // Remove mileage journey
  const removeMileageJourney = (id: string) => {
    setMileageJourneys(mileageJourneys.filter(j => j.id !== id))
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateExpenseClaimData = {
      employeeId,
      employeeName,
      employeeNameAr,
      employeeNumber,
      department,
      jobTitle,
      costCenter: costCenter || undefined,
      claimTitle,
      claimTitleAr: claimTitleAr || undefined,
      expenseType,
      claimPeriod: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      description: description || undefined,
      descriptionAr: descriptionAr || undefined,
      lineItems: lineItems.map(li => ({
        category: li.category,
        description: li.description,
        descriptionAr: li.descriptionAr,
        expenseDate: li.expenseDate,
        vendor: li.vendor,
        vendorAr: li.vendorAr,
        amount: li.amount,
        vatAmount: li.vatAmount,
        currency: li.currency,
        isBillable: li.isBillable,
        clientId: li.clientId,
        caseId: li.caseId,
        projectCode: li.projectCode,
        notes: li.notes,
      })),
      travelDetails: includeTravelDetails ? {
        tripPurpose,
        tripPurposeAr,
        departureCity,
        arrivalCity,
        departureDate,
        returnDate,
        tripDays: Math.ceil((new Date(returnDate).getTime() - new Date(departureDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      } : undefined,
      mileageClaim: includeMileage ? {
        journeys: mileageJourneys.map(j => ({
          journeyDate: j.journeyDate,
          fromLocation: j.fromLocation,
          toLocation: j.toLocation,
          purpose: j.purpose,
          distanceKm: j.distanceKm,
          roundTrip: j.roundTrip,
        })),
        totalDistance,
        ratePerKm: mileageRate,
        vehicleType,
        vehiclePlate: vehiclePlate || undefined,
      } : undefined,
      notes: {
        employeeNotes: employeeNotes || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        claimId: editId,
        data: {
          claimTitle,
          claimTitleAr,
          description,
          descriptionAr,
          claimPeriod: { startDate: periodStart, endDate: periodEnd },
          lineItems: data.lineItems,
          notes: { employeeNotes },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/expense-claims' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'مطالبات النفقات', href: '/dashboard/hr/expense-claims', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<string, React.ReactNode> = {
      travel: <Plane className="w-4 h-4" />,
      meals: <Utensils className="w-4 h-4" />,
      accommodation: <Hotel className="w-4 h-4" />,
      transportation: <Car className="w-4 h-4" />,
      mileage: <Car className="w-4 h-4" />,
    }
    return icons[category] || <Receipt className="w-4 h-4" />
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل مطالبة النفقات' : 'مطالبة نفقات جديدة'}
          type="employees"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white"
                onClick={() => navigate({ to: '/dashboard/hr/expense-claims' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل مطالبة النفقات' : 'مطالبة نفقات جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات مطالبة النفقات' : 'إنشاء مطالبة نفقات جديدة'}
                </p>
              </div>
            </div>

            {/* OFFICE TYPE SELECTOR */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  نوع المكتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OFFICE_TYPES.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setOfficeType(option.value as OfficeType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        officeType === option.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <option.icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium block">{option.labelAr}</span>
                      <span className="text-xs opacity-75">{option.descriptionAr}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* EMPLOYEE SELECTION - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  بيانات الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اختر الموظف <span className="text-red-500">*</span>
                    </Label>
                    <Select value={employeeId} onValueChange={handleEmployeeSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesData?.employees?.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.personalInfo?.fullNameArabic || emp.personalInfo?.fullNameEnglish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">القسم</Label>
                    <Input
                      value={department}
                      readOnly
                      placeholder="القسم"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CLAIM DETAILS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  تفاصيل المطالبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      عنوان المطالبة <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={claimTitleAr}
                      onChange={(e) => setClaimTitleAr(e.target.value)}
                      placeholder="عنوان المطالبة بالعربية"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Claim Title</Label>
                    <Input
                      value={claimTitle}
                      onChange={(e) => setClaimTitle(e.target.value)}
                      placeholder="Claim title in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">نوع المطالبة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setExpenseType(key as ExpenseType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          expenseType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      فترة المطالبة من <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      إلى <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LINE ITEMS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    بنود المصروفات
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 ms-1" />
                    إضافة بند
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>لا توجد بنود مصروفات</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 rounded-xl"
                      onClick={addLineItem}
                    >
                      <Plus className="w-4 h-4 ms-1" />
                      إضافة بند جديد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-200 text-slate-700">
                              بند {index + 1}
                            </Badge>
                            {getCategoryIcon(item.category)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">الفئة</Label>
                            <Select
                              value={item.category}
                              onValueChange={(v) => updateLineItem(item.id, { category: v as ExpenseCategory })}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">تاريخ المصروف</Label>
                            <Input
                              type="date"
                              value={item.expenseDate}
                              onChange={(e) => updateLineItem(item.id, { expenseDate: e.target.value })}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">المورد / الجهة</Label>
                            <Input
                              value={item.vendor || ''}
                              onChange={(e) => updateLineItem(item.id, { vendor: e.target.value })}
                              placeholder="اسم المورد"
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-sm">الوصف</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                              placeholder="وصف المصروف"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">المبلغ</Label>
                              <Input
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => updateLineItem(item.id, { amount: Number(e.target.value) })}
                                placeholder="0.00"
                                className="rounded-xl"
                                min={0}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">ضريبة القيمة المضافة</Label>
                              <Input
                                type="number"
                                value={item.vatAmount || ''}
                                onChange={(e) => updateLineItem(item.id, { vatAmount: Number(e.target.value) })}
                                placeholder="0.00"
                                className="rounded-xl"
                                min={0}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isBillable}
                              onCheckedChange={(checked) => updateLineItem(item.id, { isBillable: checked })}
                            />
                            <Label className="text-sm text-slate-600">قابل للفوترة</Label>
                          </div>
                          <div className="text-sm font-bold text-navy">
                            الإجمالي: {(item.amount + (item.vatAmount || 0)).toLocaleString('ar-SA')} ر.س
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Totals */}
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-slate-600">المجموع الفرعي</p>
                          <p className="text-lg font-bold text-navy">{subtotal.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">ضريبة القيمة المضافة</p>
                          <p className="text-lg font-bold text-navy">{vatTotal.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                        <div>
                          <p className="text-sm text-emerald-600 font-medium">الإجمالي الكلي</p>
                          <p className="text-xl font-bold text-emerald-700">{grandTotal.toLocaleString('ar-SA')} ر.س</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* TRAVEL DETAILS - Advanced */}
            <Collapsible open={openSections.includes('travel')} onOpenChange={() => toggleSection('travel')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-blue-500" />
                        تفاصيل السفر
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {includeTravelDetails && (
                          <Badge className="bg-blue-100 text-blue-700">مفعّل</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('travel') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-700">تضمين تفاصيل السفر</p>
                          <p className="text-xs text-blue-600">إضافة معلومات الرحلة والإقامة</p>
                        </div>
                      </div>
                      <Switch
                        checked={includeTravelDetails}
                        onCheckedChange={setIncludeTravelDetails}
                      />
                    </div>

                    {includeTravelDetails && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">الغرض من السفر</Label>
                            <Input
                              value={tripPurposeAr}
                              onChange={(e) => setTripPurposeAr(e.target.value)}
                              placeholder="الغرض من الرحلة"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">Trip Purpose</Label>
                            <Input
                              value={tripPurpose}
                              onChange={(e) => setTripPurpose(e.target.value)}
                              placeholder="Trip purpose in English"
                              className="h-11 rounded-xl"
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">مدينة المغادرة</Label>
                            <Input
                              value={departureCity}
                              onChange={(e) => setDepartureCity(e.target.value)}
                              placeholder="مدينة المغادرة"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">مدينة الوصول</Label>
                            <Input
                              value={arrivalCity}
                              onChange={(e) => setArrivalCity(e.target.value)}
                              placeholder="مدينة الوصول"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">تاريخ المغادرة</Label>
                            <Input
                              type="date"
                              value={departureDate}
                              onChange={(e) => setDepartureDate(e.target.value)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">تاريخ العودة</Label>
                            <Input
                              type="date"
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="h-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* MILEAGE CLAIM - Advanced */}
            <Collapsible open={openSections.includes('mileage')} onOpenChange={() => toggleSection('mileage')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Car className="w-5 h-5 text-teal-500" />
                        مطالبة المسافات
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {includeMileage && (
                          <Badge className="bg-teal-100 text-teal-700">مفعّل</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('mileage') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-100">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="font-medium text-teal-700">تضمين مطالبة المسافات</p>
                          <p className="text-xs text-teal-600">حساب تعويض المسافات المقطوعة</p>
                        </div>
                      </div>
                      <Switch
                        checked={includeMileage}
                        onCheckedChange={setIncludeMileage}
                      />
                    </div>

                    {includeMileage && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">نوع المركبة</Label>
                            <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType)}>
                              <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="personal_car">سيارة شخصية</SelectItem>
                                <SelectItem value="company_car">سيارة الشركة</SelectItem>
                                <SelectItem value="rental">سيارة مستأجرة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">رقم اللوحة (اختياري)</Label>
                            <Input
                              value={vehiclePlate}
                              onChange={(e) => setVehiclePlate(e.target.value)}
                              placeholder="رقم لوحة السيارة"
                              className="h-11 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-navy font-medium">الرحلات</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMileageJourney}
                            className="rounded-xl"
                          >
                            <Plus className="w-4 h-4 ms-1" />
                            إضافة رحلة
                          </Button>
                        </div>

                        {mileageJourneys.map((journey, index) => (
                          <div key={journey.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                            <div className="flex items-center justify-between mb-4">
                              <Badge className="bg-slate-200 text-slate-700">رحلة {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMileageJourney(journey.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm">التاريخ</Label>
                                <Input
                                  type="date"
                                  value={journey.journeyDate}
                                  onChange={(e) => updateMileageJourney(journey.id, { journeyDate: e.target.value })}
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">من</Label>
                                <Input
                                  value={journey.fromLocation}
                                  onChange={(e) => updateMileageJourney(journey.id, { fromLocation: e.target.value })}
                                  placeholder="نقطة الانطلاق"
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">إلى</Label>
                                <Input
                                  value={journey.toLocation}
                                  onChange={(e) => updateMileageJourney(journey.id, { toLocation: e.target.value })}
                                  placeholder="الوجهة"
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">المسافة (كم)</Label>
                                <Input
                                  type="number"
                                  value={journey.distanceKm || ''}
                                  onChange={(e) => updateMileageJourney(journey.id, { distanceKm: Number(e.target.value) })}
                                  className="rounded-xl"
                                  min={0}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={journey.roundTrip}
                                  onCheckedChange={(checked) => updateMileageJourney(journey.id, { roundTrip: checked })}
                                />
                                <Label className="text-sm text-slate-600">ذهاب وعودة</Label>
                              </div>
                              <Input
                                value={journey.purpose}
                                onChange={(e) => updateMileageJourney(journey.id, { purpose: e.target.value })}
                                placeholder="الغرض من الرحلة"
                                className="rounded-xl flex-1"
                              />
                            </div>
                          </div>
                        ))}

                        {mileageJourneys.length > 0 && (
                          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-slate-600">إجمالي المسافة</p>
                                <p className="text-lg font-bold text-navy">{totalDistance.toLocaleString('ar-SA')} كم</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">معدل الكيلومتر</p>
                                <p className="text-lg font-bold text-navy">{mileageRate.toFixed(2)} ر.س</p>
                              </div>
                              <div>
                                <p className="text-sm text-teal-600 font-medium">المبلغ المستحق</p>
                                <p className="text-xl font-bold text-teal-700">{mileageAmount.toLocaleString('ar-SA')} ر.س</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* NOTES - Advanced */}
            <Collapsible open={openSections.includes('notes')} onOpenChange={() => toggleSection('notes')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">الوصف</Label>
                      <Textarea
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder="وصف المطالبة بالعربية..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Description</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Claim description in English..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات إضافية</Label>
                      <Textarea
                        value={employeeNotes}
                        onChange={(e) => setEmployeeNotes(e.target.value)}
                        placeholder="ملاحظات إضافية..."
                        className="rounded-xl min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* POLICY INFO */}
            <Card className="rounded-3xl shadow-sm border-slate-100 bg-blue-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  سياسة النفقات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <Paperclip className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">الإيصالات:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>مطلوبة لجميع المصروفات أكثر من 100 ريال</li>
                        <li>يجب أن تتضمن الرقم الضريبي للمورد</li>
                        <li>صور واضحة ومقروءة</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">مدة التقديم:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>خلال 30 يوم من تاريخ المصروف</li>
                        <li>المطالبات المتأخرة تحتاج موافقة استثنائية</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">الحدود:</p>
                      <ul className="list-disc list-inside me-4 mt-1 space-y-1">
                        <li>الوجبات: حتى 150 ريال/يوم</li>
                        <li>الفنادق: حسب السياسة</li>
                        <li>المسافات: {mileageRates?.personal_car || 0.5} ريال/كم</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/hr/expense-claims' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !claimTitle || !periodStart || !periodEnd || lineItems.length === 0 || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تقديم المطالبة'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="employees" />
        </div>
      </Main>
    </>
  )
}
