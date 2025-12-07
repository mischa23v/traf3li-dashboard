import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateAssetAssignment, useUpdateAssetAssignment, useAssetAssignment } from '@/hooks/useAssetAssignment'
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
  CheckCircle, ChevronDown, Users, Package, Laptop,
  Smartphone, Monitor, Car, Key, Wrench, Settings,
  Shield, FileText, DollarSign, MapPin, Calendar,
  Tag, Barcode, Briefcase
} from 'lucide-react'
import {
  ASSET_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  WORK_TYPE_LABELS,
  OWNERSHIP_TYPE_LABELS,
  type AssetType,
  type AssetCategory,
  type AssetCondition,
  type AssignmentType,
  type WorkType,
  type OwnershipType,
  type CreateAssetAssignmentData,
} from '@/services/assetAssignmentService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function AssetAssignmentCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingAssignment, isLoading: isLoadingAssignment } = useAssetAssignment(editId || '')
  const createMutation = useCreateAssetAssignment()
  const updateMutation = useUpdateAssetAssignment()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Employee Info
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [workType, setWorkType] = useState<WorkType>('on_site')

  // Form State - Asset Info (Basic)
  const [assetTag, setAssetTag] = useState('')
  const [assetNumber, setAssetNumber] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetNameAr, setAssetNameAr] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('laptop')
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('IT_equipment')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [conditionAtAssignment, setConditionAtAssignment] = useState<AssetCondition>('new')
  const [conditionNotes, setConditionNotes] = useState('')

  // Form State - Assignment Details (Basic)
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('permanent')
  const [assignedDate, setAssignedDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [indefiniteAssignment, setIndefiniteAssignment] = useState(false)
  const [assignmentPurpose, setAssignmentPurpose] = useState('')

  // Form State - Advanced: Specifications
  const [processor, setProcessor] = useState('')
  const [ram, setRam] = useState('')
  const [storage, setStorage] = useState('')
  const [screenSize, setScreenSize] = useState('')
  const [operatingSystem, setOperatingSystem] = useState('')
  const [imei, setImei] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [color, setColor] = useState('')

  // Form State - Advanced: Value & Warranty
  const [purchasePrice, setPurchasePrice] = useState<number>(0)
  const [currentValue, setCurrentValue] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')
  const [ownership, setOwnership] = useState<OwnershipType>('company_owned')

  // Form State - Advanced: Location & Project
  const [primaryLocation, setPrimaryLocation] = useState('')
  const [mobileAsset, setMobileAsset] = useState(false)
  const [homeUseAllowed, setHomeUseAllowed] = useState(false)
  const [internationalTravelAllowed, setInternationalTravelAllowed] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [returnAfterProject, setReturnAfterProject] = useState(false)

  // Form State - Advanced: Accessories
  const [accessories, setAccessories] = useState<Array<{
    id: string
    accessoryType: string
    description: string
    serialNumber?: string
    quantity: number
  }>>([])

  // Form State - Notes
  const [employeeNotes, setEmployeeNotes] = useState('')
  const [itNotes, setItNotes] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

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
    if (existingAssignment && isEditMode) {
      setEmployeeId(existingAssignment.employeeId || '')
      setEmployeeName(existingAssignment.employeeName || '')
      setEmployeeNameAr(existingAssignment.employeeNameAr || '')
      setEmployeeNumber(existingAssignment.employeeNumber || '')
      setDepartment(existingAssignment.department || '')
      setJobTitle(existingAssignment.jobTitle || '')
      setEmail(existingAssignment.email || '')
      setPhone(existingAssignment.phone || '')
      setWorkType(existingAssignment.workType || 'on_site')

      setAssetTag(existingAssignment.assetTag || '')
      setAssetNumber(existingAssignment.assetNumber || '')
      setSerialNumber(existingAssignment.serialNumber || '')
      setAssetName(existingAssignment.assetName || '')
      setAssetNameAr(existingAssignment.assetNameAr || '')
      setAssetType(existingAssignment.assetType)
      setAssetCategory(existingAssignment.assetCategory)
      setBrand(existingAssignment.brand || '')
      setModel(existingAssignment.model || '')
      setConditionAtAssignment(existingAssignment.conditionAtAssignment)
      setConditionNotes(existingAssignment.conditionNotes || '')

      setAssignmentType(existingAssignment.assignmentType)
      setAssignedDate(existingAssignment.assignedDate?.split('T')[0] || '')
      setExpectedReturnDate(existingAssignment.expectedReturnDate?.split('T')[0] || '')
      setIndefiniteAssignment(existingAssignment.indefiniteAssignment || false)
      setAssignmentPurpose(existingAssignment.assignmentPurpose || '')

      if (existingAssignment.specifications) {
        setProcessor(existingAssignment.specifications.processor || '')
        setRam(existingAssignment.specifications.ram || '')
        setStorage(existingAssignment.specifications.storage || '')
        setScreenSize(existingAssignment.specifications.screenSize || '')
        setOperatingSystem(existingAssignment.specifications.operatingSystem || '')
        setImei(existingAssignment.specifications.imei || '')
        setPhoneNumber(existingAssignment.specifications.phoneNumber || '')
        setColor(existingAssignment.specifications.color || '')
      }

      setPurchasePrice(existingAssignment.purchasePrice || 0)
      setCurrentValue(existingAssignment.currentValue || 0)
      setCurrency(existingAssignment.currency || 'SAR')
      setOwnership(existingAssignment.ownership || 'company_owned')

      if (existingAssignment.assignmentLocation) {
        setPrimaryLocation(existingAssignment.assignmentLocation.primaryLocation || '')
        setMobileAsset(existingAssignment.assignmentLocation.mobileAsset || false)
        setHomeUseAllowed(existingAssignment.assignmentLocation.homeUseAllowed || false)
        setInternationalTravelAllowed(existingAssignment.assignmentLocation.internationalTravelAllowed || false)
      }

      if (existingAssignment.notes) {
        setEmployeeNotes(existingAssignment.notes.employeeNotes || '')
        setItNotes(existingAssignment.notes.itNotes || '')
        setAdminNotes(existingAssignment.notes.adminNotes || '')
        setSpecialInstructions(existingAssignment.notes.specialInstructions || '')
      }
    }
  }, [existingAssignment, isEditMode])

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
      setEmail(employee.contactInfo?.workEmail || employee.contactInfo?.personalEmail || '')
      setPhone(employee.contactInfo?.mobileNumber || '')
    }
  }

  // Add accessory
  const addAccessory = () => {
    setAccessories([...accessories, {
      id: `acc_${Date.now()}`,
      accessoryType: '',
      description: '',
      quantity: 1,
    }])
  }

  // Update accessory
  const updateAccessory = (id: string, updates: Partial<typeof accessories[0]>) => {
    setAccessories(accessories.map(acc =>
      acc.id === id ? { ...acc, ...updates } : acc
    ))
  }

  // Remove accessory
  const removeAccessory = (id: string) => {
    setAccessories(accessories.filter(acc => acc.id !== id))
  }

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateAssetAssignmentData = {
      employeeId,
      employeeName,
      employeeNameAr: employeeNameAr || undefined,
      employeeNumber: employeeNumber || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
      email: email || undefined,
      phone: phone || undefined,
      workType: workType || undefined,

      assetTag,
      assetNumber: assetNumber || undefined,
      serialNumber: serialNumber || undefined,
      assetName,
      assetNameAr: assetNameAr || undefined,
      assetType,
      assetCategory,
      brand: brand || undefined,
      model: model || undefined,
      conditionAtAssignment,
      conditionNotes: conditionNotes || undefined,
      purchasePrice: purchasePrice || undefined,
      currentValue: currentValue || undefined,
      currency: currency || undefined,
      ownership: ownership || undefined,

      specifications: (processor || ram || storage || screenSize || operatingSystem || imei || phoneNumber || color) ? {
        processor: processor || undefined,
        ram: ram || undefined,
        storage: storage || undefined,
        screenSize: screenSize || undefined,
        operatingSystem: operatingSystem || undefined,
        imei: imei || undefined,
        phoneNumber: phoneNumber || undefined,
        color: color || undefined,
      } : undefined,

      assignmentType,
      assignedDate,
      expectedReturnDate: !indefiniteAssignment && expectedReturnDate ? expectedReturnDate : undefined,
      indefiniteAssignment,
      assignmentPurpose: assignmentPurpose || undefined,

      projectAssignment: projectName ? {
        projectId: `proj_${Date.now()}`,
        projectName,
        projectStartDate: assignedDate,
        returnAfterProject,
      } : undefined,

      assignmentLocation: primaryLocation ? {
        primaryLocation,
        mobileAsset,
        homeUseAllowed,
        internationalTravelAllowed,
      } : undefined,

      accessories: accessories.length > 0 ? accessories.map(acc => ({
        accessoryType: acc.accessoryType,
        description: acc.description,
        serialNumber: acc.serialNumber,
        quantity: acc.quantity,
        returned: false,
      })) : undefined,

      notes: (employeeNotes || itNotes || adminNotes || specialInstructions) ? {
        employeeNotes: employeeNotes || undefined,
        itNotes: itNotes || undefined,
        adminNotes: adminNotes || undefined,
        specialInstructions: specialInstructions || undefined,
      } : undefined,
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        assignmentId: editId,
        data: {
          assetName,
          assetNameAr,
          conditionAtAssignment,
          conditionNotes,
          assignmentType,
          expectedReturnDate: !indefiniteAssignment && expectedReturnDate ? expectedReturnDate : undefined,
          assignmentPurpose,
          notes: {
            employeeNotes: employeeNotes || undefined,
            itNotes: itNotes || undefined,
            adminNotes: adminNotes || undefined,
            specialInstructions: specialInstructions || undefined,
          },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/asset-assignment' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الأصول والمعدات', href: '/dashboard/hr/asset-assignment', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  const getAssetTypeIcon = (type: AssetType) => {
    const icons: Record<string, React.ReactNode> = {
      laptop: <Laptop className="w-5 h-5" />,
      desktop: <Monitor className="w-5 h-5" />,
      mobile_phone: <Smartphone className="w-5 h-5" />,
      tablet: <Smartphone className="w-5 h-5" />,
      monitor: <Monitor className="w-5 h-5" />,
      vehicle: <Car className="w-5 h-5" />,
      access_card: <Key className="w-5 h-5" />,
      keys: <Key className="w-5 h-5" />,
      tools: <Wrench className="w-5 h-5" />,
    }
    return icons[type] || <Package className="w-5 h-5" />
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
          title={isEditMode ? 'تعديل تخصيص الأصل' : 'تخصيص أصل جديد'}
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
                onClick={() => navigate({ to: '/dashboard/hr/asset-assignment' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل تخصيص الأصل' : 'تخصيص أصل جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات تخصيص الأصل' : 'تخصيص أصل أو معدة لموظف'}
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
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">المسمى الوظيفي</Label>
                    <Input
                      value={jobTitle}
                      readOnly
                      placeholder="المسمى الوظيفي"
                      className="h-11 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">نوع العمل</Label>
                    <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WORK_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ASSET INFO - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-500" />
                  معلومات الأصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اسم الأصل بالعربية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={assetNameAr}
                      onChange={(e) => setAssetNameAr(e.target.value)}
                      placeholder="مثال: حاسب محمول ديل"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Asset Name</Label>
                    <Input
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="e.g. Dell Laptop"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      رقم الأصل (Tag) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value)}
                      placeholder="AST-2025-001"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الرقم التسلسلي</Label>
                    <Input
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="SN123456789"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">رقم الموديل</Label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Latitude 5520"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">نوع الأصل</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(ASSET_TYPE_LABELS).slice(0, 6).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAssetType(key as AssetType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          assetType === key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        {getAssetTypeIcon(key as AssetType)}
                        <span className="text-xs mt-1 block">{label.ar}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الفئة</Label>
                    <Select value={assetCategory} onValueChange={(v) => setAssetCategory(v as AssetCategory)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSET_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">العلامة التجارية</Label>
                    <Input
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Dell, HP, Apple..."
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الحالة عند التخصيص</Label>
                    <Select value={conditionAtAssignment} onValueChange={(v) => setConditionAtAssignment(v as AssetCondition)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSET_CONDITION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ASSIGNMENT DETAILS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-500" />
                  تفاصيل التخصيص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">نوع التخصيص</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(ASSIGNMENT_TYPE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAssignmentType(key as AssignmentType)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          assignmentType === key
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
                      تاريخ التخصيص <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={assignedDate}
                      onChange={(e) => setAssignedDate(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">تاريخ الإرجاع المتوقع</Label>
                    <Input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      disabled={indefiniteAssignment}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Switch
                    checked={indefiniteAssignment}
                    onCheckedChange={setIndefiniteAssignment}
                  />
                  <div>
                    <p className="font-medium text-navy">تخصيص غير محدد المدة</p>
                    <p className="text-xs text-slate-500">الأصل مخصص للموظف حتى إشعار آخر</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">الغرض من التخصيص</Label>
                  <Textarea
                    value={assignmentPurpose}
                    onChange={(e) => setAssignmentPurpose(e.target.value)}
                    placeholder="وصف الغرض من تخصيص هذا الأصل للموظف..."
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* SPECIFICATIONS - Advanced */}
            <Collapsible open={openSections.includes('specs')} onOpenChange={() => toggleSection('specs')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        المواصفات الفنية
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {(processor || ram || storage) && (
                          <Badge className="bg-blue-100 text-blue-700">تم الإدخال</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('specs') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">أدخل المواصفات الفنية للأجهزة التقنية</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">المعالج</Label>
                        <Input
                          value={processor}
                          onChange={(e) => setProcessor(e.target.value)}
                          placeholder="Intel Core i7-1265U"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">الذاكرة (RAM)</Label>
                        <Input
                          value={ram}
                          onChange={(e) => setRam(e.target.value)}
                          placeholder="16 GB"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">التخزين</Label>
                        <Input
                          value={storage}
                          onChange={(e) => setStorage(e.target.value)}
                          placeholder="512 GB SSD"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">حجم الشاشة</Label>
                        <Input
                          value={screenSize}
                          onChange={(e) => setScreenSize(e.target.value)}
                          placeholder="15.6 inch"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">نظام التشغيل</Label>
                        <Input
                          value={operatingSystem}
                          onChange={(e) => setOperatingSystem(e.target.value)}
                          placeholder="Windows 11 Pro"
                          className="h-11 rounded-xl"
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اللون</Label>
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="أسود / فضي"
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    {(assetType === 'mobile_phone' || assetType === 'tablet') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">IMEI</Label>
                          <Input
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                            placeholder="123456789012345"
                            className="h-11 rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم الهاتف</Label>
                          <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+966 5X XXX XXXX"
                            className="h-11 rounded-xl"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* VALUE & OWNERSHIP - Advanced */}
            <Collapsible open={openSections.includes('value')} onOpenChange={() => toggleSection('value')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-500" />
                        القيمة والملكية
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {purchasePrice > 0 && (
                          <Badge className="bg-teal-100 text-teal-700">{purchasePrice.toLocaleString('ar-SA')} ر.س</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('value') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">سعر الشراء</Label>
                        <Input
                          type="number"
                          value={purchasePrice || ''}
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl"
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">القيمة الحالية</Label>
                        <Input
                          type="number"
                          value={currentValue || ''}
                          onChange={(e) => setCurrentValue(Number(e.target.value))}
                          placeholder="0"
                          className="h-11 rounded-xl"
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">العملة</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                            <SelectItem value="EUR">يورو (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">نوع الملكية</Label>
                      <Select value={ownership} onValueChange={(v) => setOwnership(v as OwnershipType)}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(OWNERSHIP_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* LOCATION & PROJECT - Advanced */}
            <Collapsible open={openSections.includes('location')} onOpenChange={() => toggleSection('location')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-500" />
                        الموقع والمشروع
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('location') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">الموقع الأساسي</Label>
                      <Input
                        value={primaryLocation}
                        onChange={(e) => setPrimaryLocation(e.target.value)}
                        placeholder="المقر الرئيسي - الرياض"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                        <Switch
                          checked={mobileAsset}
                          onCheckedChange={setMobileAsset}
                        />
                        <Label className="text-sm">أصل متنقل</Label>
                      </div>
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                        <Switch
                          checked={homeUseAllowed}
                          onCheckedChange={setHomeUseAllowed}
                        />
                        <Label className="text-sm">مسموح بالاستخدام المنزلي</Label>
                      </div>
                      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                        <Switch
                          checked={internationalTravelAllowed}
                          onCheckedChange={setInternationalTravelAllowed}
                        />
                        <Label className="text-sm">مسموح بالسفر الدولي</Label>
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">اسم المشروع (إن وجد)</Label>
                        <Input
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          placeholder="اسم المشروع المرتبط بالتخصيص"
                          className="h-11 rounded-xl"
                        />
                      </div>
                      {projectName && (
                        <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl">
                          <Switch
                            checked={returnAfterProject}
                            onCheckedChange={setReturnAfterProject}
                          />
                          <Label className="text-sm">إرجاع الأصل بعد انتهاء المشروع</Label>
                        </div>
                      )}
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
                        <FileText className="w-5 h-5 text-amber-500" />
                        الملاحظات
                      </CardTitle>
                      <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('notes') && "rotate-180")} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات حالة الأصل</Label>
                      <Textarea
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="ملاحظات عن حالة الأصل عند التخصيص..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">تعليمات خاصة</Label>
                      <Textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="تعليمات خاصة للموظف..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">ملاحظات تقنية (IT)</Label>
                        <Textarea
                          value={itNotes}
                          onChange={(e) => setItNotes(e.target.value)}
                          placeholder="ملاحظات فنية..."
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-navy font-medium">ملاحظات إدارية</Label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="ملاحظات إدارية..."
                          className="rounded-xl min-h-[60px]"
                        />
                      </div>
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
                  سياسة استخدام الأصول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>الموظف مسؤول عن الحفاظ على الأصل في حالة جيدة</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>يجب الإبلاغ فوراً عن أي تلف أو فقدان</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>الأصل للاستخدام المهني فقط ما لم يُصرح بخلاف ذلك</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>يجب إرجاع الأصل عند انتهاء الخدمة أو بناءً على الطلب</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate({ to: '/dashboard/hr/asset-assignment' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!employeeId || !assetTag || !assetName || !assignedDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ms-2" />
                    {isEditMode ? 'حفظ التعديلات' : 'تخصيص الأصل'}
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
