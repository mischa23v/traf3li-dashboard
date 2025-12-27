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
import { useCreateOrganizationalUnit, useUpdateOrganizationalUnit, useOrganizationalUnit, useOrganizationalUnits } from '@/hooks/useOrganizationalStructure'
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
  CheckCircle, ChevronDown, Users, Network,
  Calendar, MapPin, TreeDeciduous, Wallet,
  Target, Shield, Phone, LayoutGrid, Layers
} from 'lucide-react'
import {
  UNIT_TYPE_LABELS,
  COST_CENTER_TYPE_LABELS,
  APPROVAL_AUTHORITY_LABELS,
  type UnitType,
  type CostCenterType,
  type ApprovalAuthorityLevel,
  type CreateOrganizationalUnitData,
} from '@/services/organizationalStructureService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '2-5 موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '6-20 موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '20+ موظف', icon: Building2 },
]

export function OrganizationalStructureCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingUnit, isLoading: isLoadingUnit } = useOrganizationalUnit(editId || '')
  const createMutation = useCreateOrganizationalUnit()
  const updateMutation = useUpdateOrganizationalUnit()

  // Fetch parent units for selection
  const { data: unitsData } = useOrganizationalUnits({ status: 'active' })
  // Fetch employees for manager selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Basic Info
  const [unitCode, setUnitCode] = useState('')
  const [unitName, setUnitName] = useState('')
  const [unitNameAr, setUnitNameAr] = useState('')
  const [unitType, setUnitType] = useState<UnitType>('department')
  const [parentUnitId, setParentUnitId] = useState('')

  // Description
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [mission, setMission] = useState('')
  const [missionAr, setMissionAr] = useState('')
  const [vision, setVision] = useState('')
  const [visionAr, setVisionAr] = useState('')

  // Leadership
  const [managerId, setManagerId] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerNameAr, setManagerNameAr] = useState('')

  // Headcount
  const [approvedHeadcount, setApprovedHeadcount] = useState<number>(0)
  const [currentHeadcount, setCurrentHeadcount] = useState<number>(0)
  const [fullTimeEmployees, setFullTimeEmployees] = useState<number>(0)
  const [partTimeEmployees, setPartTimeEmployees] = useState<number>(0)
  const [contractors, setContractors] = useState<number>(0)

  // Budget
  const [annualBudget, setAnnualBudget] = useState<number>(0)
  const [salaryBudget, setSalaryBudget] = useState<number>(0)
  const [operationalBudget, setOperationalBudget] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')

  // Cost Center
  const [costCenterCode, setCostCenterCode] = useState('')
  const [costCenterName, setCostCenterName] = useState('')
  const [costCenterNameAr, setCostCenterNameAr] = useState('')
  const [costCenterType, setCostCenterType] = useState<CostCenterType>('cost_center')

  // Location
  const [location, setLocation] = useState('')
  const [locationAr, setLocationAr] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Saudi Arabia')
  const [workingHours, setWorkingHours] = useState('')

  // Contact
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [extension, setExtension] = useState('')

  // Compliance
  const [laborLawCompliant, setLaborLawCompliant] = useState(true)
  const [saudizationCompliant, setSaudizationCompliant] = useState(true)
  const [healthSafetyCompliant, setHealthSafetyCompliant] = useState(true)

  // Approval Authority
  const [financialApproval, setFinancialApproval] = useState<ApprovalAuthorityLevel>('none')
  const [financialLimit, setFinancialLimit] = useState<number>(0)
  const [hiringApproval, setHiringApproval] = useState(false)
  const [terminationApproval, setTerminationApproval] = useState(false)
  const [leaveApproval, setLeaveApproval] = useState(false)

  // Dates
  const [establishedDate, setEstablishedDate] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0])

  // Notes
  const [notes, setNotes] = useState('')
  const [notesAr, setNotesAr] = useState('')

  // Toggle section
  const toggleSection = (section: string) => {
    if (openSections.includes(section)) {
      setOpenSections(openSections.filter(s => s !== section))
    } else {
      setOpenSections([...openSections, section])
    }
  }

  // Populate form when editing
  useEffect(() => {
    if (existingUnit && isEditMode) {
      setUnitCode(existingUnit.unitCode || '')
      setUnitName(existingUnit.unitName || '')
      setUnitNameAr(existingUnit.unitNameAr || '')
      setUnitType(existingUnit.unitType)
      setParentUnitId(existingUnit.parentUnitId || '')
      setDescription(existingUnit.description || '')
      setDescriptionAr(existingUnit.descriptionAr || '')
      setMission(existingUnit.mission || '')
      setMissionAr(existingUnit.missionAr || '')
      setVision(existingUnit.vision || '')
      setVisionAr(existingUnit.visionAr || '')
      setManagerId(existingUnit.managerId || '')
      setManagerName(existingUnit.managerName || '')
      setManagerNameAr(existingUnit.managerNameAr || '')

      if (existingUnit.headcount) {
        setApprovedHeadcount(existingUnit.headcount.approvedHeadcount || 0)
        setCurrentHeadcount(existingUnit.headcount.currentHeadcount || 0)
        setFullTimeEmployees(existingUnit.headcount.fullTimeEmployees || 0)
        setPartTimeEmployees(existingUnit.headcount.partTimeEmployees || 0)
        setContractors(existingUnit.headcount.contractors || 0)
      }

      if (existingUnit.budget) {
        setAnnualBudget(existingUnit.budget.annualBudget || 0)
        setSalaryBudget(existingUnit.budget.salaryBudget || 0)
        setOperationalBudget(existingUnit.budget.operationalBudget || 0)
        setCurrency(existingUnit.budget.currency || 'SAR')
      }

      if (existingUnit.costCenter) {
        setCostCenterCode(existingUnit.costCenter.costCenterCode || '')
        setCostCenterName(existingUnit.costCenter.costCenterName || '')
        setCostCenterNameAr(existingUnit.costCenter.costCenterNameAr || '')
        setCostCenterType(existingUnit.costCenter.costCenterType || 'cost_center')
      }

      setLocation(existingUnit.location || '')
      setLocationAr(existingUnit.locationAr || '')
      setAddress(existingUnit.address || '')
      setCity(existingUnit.city || '')
      setCountry(existingUnit.country || 'Saudi Arabia')
      setWorkingHours(existingUnit.workingHours || '')
      setEmail(existingUnit.email || '')
      setPhone(existingUnit.phone || '')
      setExtension(existingUnit.extension || '')

      if (existingUnit.compliance) {
        setLaborLawCompliant(existingUnit.compliance.laborLawCompliant)
        setSaudizationCompliant(existingUnit.compliance.saudizationCompliant)
        setHealthSafetyCompliant(existingUnit.compliance.healthSafetyCompliant)
      }

      if (existingUnit.approvalAuthority) {
        setFinancialApproval(existingUnit.approvalAuthority.financialApproval || 'none')
        setFinancialLimit(existingUnit.approvalAuthority.financialLimit || 0)
        setHiringApproval(existingUnit.approvalAuthority.hiringApproval || false)
        setTerminationApproval(existingUnit.approvalAuthority.terminationApproval || false)
        setLeaveApproval(existingUnit.approvalAuthority.leaveApproval || false)
      }

      setEstablishedDate(existingUnit.establishedDate?.split('T')[0] || '')
      setEffectiveDate(existingUnit.effectiveDate?.split('T')[0] || '')
      setNotes(existingUnit.notes || '')
      setNotesAr(existingUnit.notesAr || '')
    }
  }, [existingUnit, isEditMode])

  // Handle manager selection
  const handleManagerSelect = (selectedManagerId: string) => {
    setManagerId(selectedManagerId)
    const employee = employeesData?.employees?.find(e => e._id === selectedManagerId)
    if (employee) {
      setManagerName(employee.personalInfo?.fullNameEnglish || '')
      setManagerNameAr(employee.personalInfo?.fullNameArabic || '')
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateOrganizationalUnitData = {
      unitCode,
      unitName,
      unitNameAr: unitNameAr || undefined,
      unitType,
      parentUnitId: parentUnitId || undefined,
      description: description || undefined,
      descriptionAr: descriptionAr || undefined,
      mission: mission || undefined,
      missionAr: missionAr || undefined,
      vision: vision || undefined,
      visionAr: visionAr || undefined,
      managerId: managerId || undefined,
      managerName: managerName || undefined,
      managerNameAr: managerNameAr || undefined,
      headcount: {
        approvedHeadcount,
        currentHeadcount,
        vacancies: approvedHeadcount - currentHeadcount,
        fullTimeEmployees,
        partTimeEmployees,
        contractors,
        temporaryWorkers: 0,
        interns: 0,
      },
      budget: annualBudget > 0 ? {
        annualBudget,
        salaryBudget,
        operationalBudget,
        currency,
      } : undefined,
      costCenter: costCenterCode ? {
        costCenterCode,
        costCenterName: costCenterName || undefined,
        costCenterNameAr: costCenterNameAr || undefined,
        costCenterType,
      } : undefined,
      location: location || undefined,
      locationAr: locationAr || undefined,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      workingHours: workingHours || undefined,
      email: email || undefined,
      phone: phone || undefined,
      extension: extension || undefined,
      compliance: {
        laborLawCompliant,
        saudizationCompliant,
        healthSafetyCompliant,
      },
      approvalAuthority: {
        financialApproval,
        financialLimit: financialLimit || undefined,
        hiringApproval,
        terminationApproval,
        leaveApproval,
        procurementApproval: false,
        contractApproval: false,
        travelApproval: false,
        overtimeApproval: false,
      },
      establishedDate: establishedDate || undefined,
      effectiveDate: effectiveDate || undefined,
      notes: notes || undefined,
      notesAr: notesAr || undefined,
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        unitId: editId,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: ROUTES.dashboard.hr.employees.list, isActive: false },
    { title: 'الهيكل التنظيمي', href: ROUTES.dashboard.hr.organizationalStructure.list, isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <ProductivityHero
          badge="الموارد البشرية"
          title={isEditMode ? 'تعديل الوحدة التنظيمية' : 'إنشاء وحدة تنظيمية'}
          type="organizational-structure"
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
                onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل الوحدة التنظيمية' : 'إنشاء وحدة تنظيمية جديدة'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات الوحدة' : 'إضافة وحدة للهيكل التنظيمي'}
                </p>
              </div>
            </div>

            {/* OFFICE TYPE SELECTOR */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
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

            {/* BASIC INFO - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-emerald-500" />
                  البيانات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رمز الوحدة <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      placeholder="مثال: DEP-001"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      الوحدة الأب
                    </Label>
                    <Select value={parentUnitId || '__none__'} onValueChange={(value) => setParentUnitId(value === '__none__' ? '' : value)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الوحدة الأب (اختياري)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">لا يوجد (وحدة رئيسية)</SelectItem>
                        {unitsData?.data?.filter(u => u._id !== editId).map((unit) => (
                          <SelectItem key={unit._id} value={unit._id}>
                            {unit.unitNameAr || unit.unitName} ({unit.unitCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اسم الوحدة بالعربية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={unitNameAr}
                      onChange={(e) => setUnitNameAr(e.target.value)}
                      placeholder="اسم الوحدة"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Unit Name</Label>
                    <Input
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="Unit name in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UNIT TYPE - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-500" />
                  نوع الوحدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    نوع الوحدة التنظيمية <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(UNIT_TYPE_LABELS).slice(0, 8).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setUnitType(key as UnitType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          unitType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                  {Object.entries(UNIT_TYPE_LABELS).length > 8 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {Object.entries(UNIT_TYPE_LABELS).slice(8).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setUnitType(key as UnitType)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            unitType === key
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          <span className="text-sm font-medium">{label.ar}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* LEADERSHIP - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  القيادة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">مدير الوحدة</Label>
                    <Select value={managerId} onValueChange={handleManagerSelect}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر المدير" />
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
                    <Label className="text-navy font-medium">اسم المدير</Label>
                    <Input
                      value={managerNameAr || managerName}
                      readOnly
                      placeholder="اسم المدير"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HEADCOUNT - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  العدد الوظيفي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">العدد المعتمد</Label>
                    <Input
                      type="number"
                      value={approvedHeadcount}
                      onChange={(e) => setApprovedHeadcount(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">العدد الحالي</Label>
                    <Input
                      type="number"
                      value={currentHeadcount}
                      onChange={(e) => setCurrentHeadcount(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">دوام كامل</Label>
                    <Input
                      type="number"
                      value={fullTimeEmployees}
                      onChange={(e) => setFullTimeEmployees(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">دوام جزئي</Label>
                    <Input
                      type="number"
                      value={partTimeEmployees}
                      onChange={(e) => setPartTimeEmployees(parseInt(e.target.value) || 0)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DATES - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ التأسيس</Label>
                    <Input
                      type="date"
                      value={establishedDate}
                      onChange={(e) => setEstablishedDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ السريان</Label>
                    <Input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* DESCRIPTION - Advanced */}
            <Collapsible open={openSections.includes('description')} onOpenChange={() => toggleSection('description')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-blue-500" />
                        الوصف والرسالة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('description') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">الوصف بالعربية</Label>
                      <Textarea
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        placeholder="وصف الوحدة التنظيمية..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Description</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Unit description..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الرسالة</Label>
                        <Textarea
                          value={missionAr}
                          onChange={(e) => setMissionAr(e.target.value)}
                          placeholder="رسالة الوحدة..."
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الرؤية</Label>
                        <Textarea
                          value={visionAr}
                          onChange={(e) => setVisionAr(e.target.value)}
                          placeholder="رؤية الوحدة..."
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* BUDGET - Advanced */}
            <Collapsible open={openSections.includes('budget')} onOpenChange={() => toggleSection('budget')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-amber-500" />
                        الميزانية
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {annualBudget > 0 && (
                          <Badge className="bg-amber-100 text-amber-700">{annualBudget.toLocaleString()} {currency}</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('budget') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الميزانية السنوية</Label>
                        <Input
                          type="number"
                          value={annualBudget}
                          onChange={(e) => setAnnualBudget(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">ميزانية الرواتب</Label>
                        <Input
                          type="number"
                          value={salaryBudget}
                          onChange={(e) => setSalaryBudget(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الميزانية التشغيلية</Label>
                        <Input
                          type="number"
                          value={operationalBudget}
                          onChange={(e) => setOperationalBudget(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">العملة</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SAR">ريال سعودي</SelectItem>
                            <SelectItem value="USD">دولار أمريكي</SelectItem>
                            <SelectItem value="EUR">يورو</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* COST CENTER - Advanced */}
            <Collapsible open={openSections.includes('costCenter')} onOpenChange={() => toggleSection('costCenter')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-purple-500" />
                        مركز التكلفة
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('costCenter') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">رمز مركز التكلفة</Label>
                        <Input
                          value={costCenterCode}
                          onChange={(e) => setCostCenterCode(e.target.value)}
                          placeholder="مثال: CC-001"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">نوع المركز</Label>
                        <Select value={costCenterType} onValueChange={(v) => setCostCenterType(v as CostCenterType)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(COST_CENTER_TYPE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اسم مركز التكلفة بالعربية</Label>
                        <Input
                          value={costCenterNameAr}
                          onChange={(e) => setCostCenterNameAr(e.target.value)}
                          placeholder="اسم المركز"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Cost Center Name</Label>
                        <Input
                          value={costCenterName}
                          onChange={(e) => setCostCenterName(e.target.value)}
                          placeholder="Cost center name"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* LOCATION - Advanced */}
            <Collapsible open={openSections.includes('location')} onOpenChange={() => toggleSection('location')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" aria-hidden="true" />
                        الموقع والعنوان
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('location') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الموقع بالعربية</Label>
                        <Input
                          value={locationAr}
                          onChange={(e) => setLocationAr(e.target.value)}
                          placeholder="اسم الموقع"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">Location</Label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location name"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">العنوان</Label>
                      <Input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="العنوان الكامل"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المدينة</Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="المدينة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الدولة</Label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="الدولة"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">ساعات العمل</Label>
                        <Input
                          value={workingHours}
                          onChange={(e) => setWorkingHours(e.target.value)}
                          placeholder="مثال: 8:00 - 17:00"
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* CONTACT - Advanced */}
            <Collapsible open={openSections.includes('contact')} onOpenChange={() => toggleSection('contact')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                        معلومات الاتصال
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('contact') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">البريد الإلكتروني</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">رقم الهاتف</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+966 XX XXX XXXX"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">التحويلة</Label>
                        <Input
                          value={extension}
                          onChange={(e) => setExtension(e.target.value)}
                          placeholder="123"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* COMPLIANCE - Advanced */}
            <Collapsible open={openSections.includes('compliance')} onOpenChange={() => toggleSection('compliance')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        الامتثال والالتزام
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('compliance') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">الامتثال لنظام العمل</span>
                        <Switch checked={laborLawCompliant} onCheckedChange={setLaborLawCompliant} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">الامتثال للسعودة</span>
                        <Switch checked={saudizationCompliant} onCheckedChange={setSaudizationCompliant} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">الصحة والسلامة</span>
                        <Switch checked={healthSafetyCompliant} onCheckedChange={setHealthSafetyCompliant} />
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* APPROVAL AUTHORITY - Advanced */}
            <Collapsible open={openSections.includes('approval')} onOpenChange={() => toggleSection('approval')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" />
                        صلاحيات الاعتماد
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('approval') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">مستوى الاعتماد المالي</Label>
                        <Select value={financialApproval} onValueChange={(v) => setFinancialApproval(v as ApprovalAuthorityLevel)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(APPROVAL_AUTHORITY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الحد الأقصى للاعتماد</Label>
                        <Input
                          type="number"
                          value={financialLimit}
                          onChange={(e) => setFinancialLimit(parseInt(e.target.value) || 0)}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">اعتماد التوظيف</span>
                        <Switch checked={hiringApproval} onCheckedChange={setHiringApproval} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">اعتماد الفصل</span>
                        <Switch checked={terminationApproval} onCheckedChange={setTerminationApproval} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm text-slate-700">اعتماد الإجازات</span>
                        <Switch checked={leaveApproval} onCheckedChange={setLeaveApproval} />
                      </div>
                    </div>
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
                        <Layers className="w-5 h-5 text-gray-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات بالعربية</Label>
                      <Textarea
                        value={notesAr}
                        onChange={(e) => setNotesAr(e.target.value)}
                        placeholder="ملاحظات إضافية..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        className="rounded-xl min-h-[80px]"
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.hr.organizationalStructure.list })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'إنشاء الوحدة'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Widgets) */}
          <HRSidebar context="organizational-structure" />
        </div>
      </Main>
    </>
  )
}
