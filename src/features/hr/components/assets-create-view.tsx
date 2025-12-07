import { HRSidebar } from './hr-sidebar'
import { useState, useEffect } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCreateAsset, useUpdateAsset, useAsset } from '@/hooks/useAssets'
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
  CheckCircle, ChevronDown, Users, Package,
  Calendar, Laptop, Smartphone, Car, Monitor,
  Key, Wrench, Shield, MapPin, FileText, DollarSign
} from 'lucide-react'
import {
  ASSET_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  CONDITION_LABELS,
  OWNERSHIP_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  type AssetType,
  type AssetCategory,
  type AssetCondition,
  type OwnershipType,
  type AssignmentType,
  type CreateAssetAssignmentData,
} from '@/services/assetsService'

type OfficeType = 'solo' | 'small' | 'medium' | 'firm'

const OFFICE_TYPES = [
  { value: 'solo', labelAr: 'محامي فردي', descriptionAr: 'محامي مستقل', icon: User },
  { value: 'small', labelAr: 'مكتب صغير', descriptionAr: '٢-٥ موظفين', icon: Users },
  { value: 'medium', labelAr: 'مكتب متوسط', descriptionAr: '٦-٢٠ موظف', icon: Building2 },
  { value: 'firm', labelAr: 'شركة محاماة', descriptionAr: '٢٠+ موظف', icon: Building2 },
]

export function AssetsCreateView() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as { editId?: string }
  const editId = searchParams?.editId
  const isEditMode = !!editId

  const { data: existingAsset, isLoading: isLoadingAsset } = useAsset(editId || '')
  const createMutation = useCreateAsset()
  const updateMutation = useUpdateAsset()

  // Fetch employees for selection
  const { data: employeesData } = useEmployees({ status: 'active' })

  // Office Type
  const [officeType, setOfficeType] = useState<OfficeType>('solo')

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<string[]>([])

  // Form State - Asset Info
  const [assetTag, setAssetTag] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetNameAr, setAssetNameAr] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('laptop')
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('IT_equipment')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [conditionAtAssignment, setConditionAtAssignment] = useState<AssetCondition>('good')
  const [conditionNotes, setConditionNotes] = useState('')

  // Value & Ownership
  const [purchasePrice, setPurchasePrice] = useState<number>(0)
  const [currentValue, setCurrentValue] = useState<number>(0)
  const [currency, setCurrency] = useState('SAR')
  const [ownership, setOwnership] = useState<OwnershipType>('company_owned')

  // Warranty
  const [hasWarranty, setHasWarranty] = useState(false)
  const [warrantyProvider, setWarrantyProvider] = useState('')
  const [warrantyEndDate, setWarrantyEndDate] = useState('')
  const [warrantyNumber, setWarrantyNumber] = useState('')

  // Insurance
  const [insured, setInsured] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [policyEndDate, setPolicyEndDate] = useState('')
  const [coverageAmount, setCoverageAmount] = useState<number>(0)

  // Employee
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeNameAr, setEmployeeNameAr] = useState('')
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [department, setDepartment] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Assignment Details
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('permanent')
  const [assignedDate, setAssignedDate] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [indefiniteAssignment, setIndefiniteAssignment] = useState(true)
  const [assignmentPurpose, setAssignmentPurpose] = useState('')
  const [assignmentPurposeCategory, setAssignmentPurposeCategory] = useState<'job_requirement' | 'project' | 'training' | 'replacement' | 'temporary_need'>('job_requirement')

  // Location
  const [primaryLocation, setPrimaryLocation] = useState('')
  const [mobileAsset, setMobileAsset] = useState(false)
  const [homeUseAllowed, setHomeUseAllowed] = useState(false)
  const [internationalTravelAllowed, setInternationalTravelAllowed] = useState(false)

  // Specifications (IT Equipment)
  const [processor, setProcessor] = useState('')
  const [ram, setRam] = useState('')
  const [storage, setStorage] = useState('')
  const [screenSize, setScreenSize] = useState('')
  const [operatingSystem, setOperatingSystem] = useState('')

  // Mobile Device
  const [imei, setImei] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [simCardNumber, setSimCardNumber] = useState('')

  // Vehicle
  const [licensePlate, setLicensePlate] = useState('')
  const [chassisNumber, setChassisNumber] = useState('')
  const [engineNumber, setEngineNumber] = useState('')
  const [vehicleYear, setVehicleYear] = useState<number>(new Date().getFullYear())

  // Notes
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

  // Set category based on asset type
  useEffect(() => {
    const categoryMap: Partial<Record<AssetType, AssetCategory>> = {
      laptop: 'IT_equipment',
      desktop: 'IT_equipment',
      monitor: 'IT_equipment',
      keyboard: 'IT_equipment',
      mouse: 'IT_equipment',
      headset: 'IT_equipment',
      printer: 'office_equipment',
      scanner: 'office_equipment',
      mobile_phone: 'mobile_devices',
      tablet: 'mobile_devices',
      vehicle: 'vehicle',
      access_card: 'security_items',
      id_badge: 'security_items',
      keys: 'security_items',
      tools: 'tools',
      furniture: 'furniture',
      software_license: 'software',
    }
    if (categoryMap[assetType]) {
      setAssetCategory(categoryMap[assetType]!)
    }
  }, [assetType])

  // Populate form when editing
  useEffect(() => {
    if (existingAsset && isEditMode) {
      setAssetTag(existingAsset.assetTag || '')
      setAssetName(existingAsset.assetName || '')
      setAssetNameAr(existingAsset.assetNameAr || '')
      setSerialNumber(existingAsset.serialNumber || '')
      setModelNumber(existingAsset.modelNumber || '')
      setAssetType(existingAsset.assetType)
      setAssetCategory(existingAsset.assetCategory)
      setBrand(existingAsset.brand || '')
      setModel(existingAsset.model || '')
      setConditionAtAssignment(existingAsset.conditionAtAssignment)
      setConditionNotes(existingAsset.conditionNotes || '')
      setPurchasePrice(existingAsset.purchasePrice || 0)
      setCurrentValue(existingAsset.currentValue || 0)
      setCurrency(existingAsset.currency || 'SAR')
      setOwnership(existingAsset.ownership)
      setHasWarranty(existingAsset.warranty?.hasWarranty || false)
      setWarrantyProvider(existingAsset.warranty?.warrantyProvider || '')
      setWarrantyEndDate(existingAsset.warranty?.warrantyEndDate?.split('T')[0] || '')
      setWarrantyNumber(existingAsset.warranty?.warrantyNumber || '')
      setInsured(existingAsset.insurance?.insured || false)
      setInsuranceProvider(existingAsset.insurance?.insuranceProvider || '')
      setPolicyNumber(existingAsset.insurance?.policyNumber || '')
      setPolicyEndDate(existingAsset.insurance?.policyEndDate?.split('T')[0] || '')
      setCoverageAmount(existingAsset.insurance?.coverageAmount || 0)
      setEmployeeId(existingAsset.employeeId || '')
      setEmployeeName(existingAsset.employeeName || '')
      setEmployeeNameAr(existingAsset.employeeNameAr || '')
      setEmployeeNumber(existingAsset.employeeNumber || '')
      setDepartment(existingAsset.department || '')
      setJobTitle(existingAsset.jobTitle || '')
      setAssignmentType(existingAsset.assignmentType)
      setAssignedDate(existingAsset.assignedDate?.split('T')[0] || '')
      setExpectedReturnDate(existingAsset.expectedReturnDate?.split('T')[0] || '')
      setIndefiniteAssignment(existingAsset.indefiniteAssignment)
      setAssignmentPurpose(existingAsset.assignmentPurpose || '')
      setAssignmentPurposeCategory(existingAsset.assignmentPurposeCategory || 'job_requirement')
      setPrimaryLocation(existingAsset.assignmentLocation?.primaryLocation || '')
      setMobileAsset(existingAsset.assignmentLocation?.mobileAsset || false)
      setHomeUseAllowed(existingAsset.assignmentLocation?.homeUseAllowed || false)
      setInternationalTravelAllowed(existingAsset.assignmentLocation?.internationalTravelAllowed || false)
      setProcessor(existingAsset.specifications?.processor || '')
      setRam(existingAsset.specifications?.ram || '')
      setStorage(existingAsset.specifications?.storage || '')
      setScreenSize(existingAsset.specifications?.screenSize || '')
      setOperatingSystem(existingAsset.specifications?.operatingSystem || '')
      setImei(existingAsset.specifications?.imei || '')
      setPhoneNumber(existingAsset.specifications?.phoneNumber || '')
      setSimCardNumber(existingAsset.specifications?.simCardNumber || '')
      setLicensePlate(existingAsset.specifications?.licensePlate || '')
      setChassisNumber(existingAsset.specifications?.chassisNumber || '')
      setEngineNumber(existingAsset.specifications?.engineNumber || '')
      setVehicleYear(existingAsset.specifications?.vehicleYear || new Date().getFullYear())
      setEmployeeNotes(existingAsset.notes?.employeeNotes || '')
      setItNotes(existingAsset.notes?.itNotes || '')
      setAdminNotes(existingAsset.notes?.adminNotes || '')
      setSpecialInstructions(existingAsset.notes?.specialInstructions || '')
    }
  }, [existingAsset, isEditMode])

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

  // Handle submit
  const handleSubmit = async () => {
    const data: CreateAssetAssignmentData = {
      assetTag,
      assetName,
      assetNameAr: assetNameAr || undefined,
      serialNumber: serialNumber || undefined,
      modelNumber: modelNumber || undefined,
      assetType,
      assetCategory,
      brand: brand || undefined,
      model: model || undefined,
      conditionAtAssignment,
      conditionNotes: conditionNotes || undefined,
      purchasePrice: purchasePrice || undefined,
      currentValue: currentValue || undefined,
      currency,
      ownership,
      warranty: hasWarranty ? {
        hasWarranty: true,
        warrantyProvider: warrantyProvider || undefined,
        warrantyEndDate: warrantyEndDate || undefined,
        warrantyNumber: warrantyNumber || undefined,
        expired: warrantyEndDate ? new Date(warrantyEndDate) < new Date() : false,
      } : undefined,
      insurance: insured ? {
        insured: true,
        insuranceProvider: insuranceProvider || undefined,
        policyNumber: policyNumber || undefined,
        policyEndDate: policyEndDate || undefined,
        coverageAmount: coverageAmount || undefined,
        expired: policyEndDate ? new Date(policyEndDate) < new Date() : false,
      } : undefined,
      employeeId,
      employeeName,
      employeeNameAr: employeeNameAr || undefined,
      employeeNumber: employeeNumber || undefined,
      department: department || undefined,
      jobTitle: jobTitle || undefined,
      assignmentType,
      assignedDate,
      expectedReturnDate: expectedReturnDate || undefined,
      indefiniteAssignment,
      assignmentPurpose: assignmentPurpose || undefined,
      assignmentPurposeCategory,
      assignmentLocation: {
        primaryLocation: primaryLocation || 'المكتب الرئيسي',
        mobileAsset,
        homeUseAllowed,
        internationalTravelAllowed,
      },
      specifications: {
        processor: processor || undefined,
        ram: ram || undefined,
        storage: storage || undefined,
        screenSize: screenSize || undefined,
        operatingSystem: operatingSystem || undefined,
        imei: imei || undefined,
        phoneNumber: phoneNumber || undefined,
        simCardNumber: simCardNumber || undefined,
        licensePlate: licensePlate || undefined,
        chassisNumber: chassisNumber || undefined,
        engineNumber: engineNumber || undefined,
        vehicleYear: vehicleYear || undefined,
      },
      notes: {
        employeeNotes: employeeNotes || undefined,
        itNotes: itNotes || undefined,
        adminNotes: adminNotes || undefined,
        specialInstructions: specialInstructions || undefined,
      },
    }

    if (isEditMode && editId) {
      await updateMutation.mutateAsync({
        assignmentId: editId,
        data: {
          assetName,
          assetNameAr,
          conditionNotes,
          currentValue,
          warranty: hasWarranty ? {
            hasWarranty: true,
            warrantyProvider,
            warrantyEndDate,
            warrantyNumber,
            expired: warrantyEndDate ? new Date(warrantyEndDate) < new Date() : false,
          } : undefined,
          insurance: insured ? {
            insured: true,
            insuranceProvider,
            policyNumber,
            policyEndDate,
            coverageAmount,
            expired: policyEndDate ? new Date(policyEndDate) < new Date() : false,
          } : undefined,
          assignmentType,
          expectedReturnDate,
          assignmentPurpose,
          assignmentLocation: {
            primaryLocation,
            mobileAsset,
            homeUseAllowed,
          },
          notes: { employeeNotes, itNotes, adminNotes, specialInstructions },
        },
      })
    } else {
      await createMutation.mutateAsync(data)
    }

    navigate({ to: '/dashboard/hr/assets' })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الأصول', href: '/dashboard/hr/assets', isActive: true },
  ]

  const isPending = createMutation.isPending || updateMutation.isPending

  const getTypeIcon = (type: AssetType) => {
    const icons: Record<string, React.ReactNode> = {
      laptop: <Laptop className="w-5 h-5" />,
      desktop: <Monitor className="w-5 h-5" />,
      mobile_phone: <Smartphone className="w-5 h-5" />,
      vehicle: <Car className="w-5 h-5" />,
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
        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
          title={isEditMode ? 'تعديل الأصل' : 'تخصيص أصل جديد'}
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
                onClick={() => navigate({ to: '/dashboard/hr/assets' })}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  {isEditMode ? 'تعديل الأصل' : 'تخصيص أصل جديد'}
                </h1>
                <p className="text-slate-500">
                  {isEditMode ? 'تعديل بيانات الأصل' : 'تخصيص أصل لموظف'}
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
                      رمز الأصل <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={assetTag}
                      onChange={(e) => setAssetTag(e.target.value)}
                      placeholder="AST-001"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الرقم التسلسلي</Label>
                    <Input
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="الرقم التسلسلي"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">
                      اسم الأصل بالعربية <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={assetNameAr}
                      onChange={(e) => setAssetNameAr(e.target.value)}
                      placeholder="اسم الأصل"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Asset Name</Label>
                    <Input
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder="Asset name in English"
                      className="h-11 rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">
                    نوع الأصل <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {(['laptop', 'desktop', 'mobile_phone', 'tablet', 'monitor', 'vehicle', 'access_card', 'keys', 'tools', 'other'] as AssetType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAssetType(type)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                          assetType === type
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        {getTypeIcon(type)}
                        <span className="text-xs font-medium">{ASSET_TYPE_LABELS[type]?.ar}</span>
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
                      placeholder="مثال: Apple, Dell, HP"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الموديل</Label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="رقم الموديل"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">حالة الأصل</Label>
                    <Select value={conditionAtAssignment} onValueChange={(v) => setConditionAtAssignment(v as AssetCondition)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">الملكية</Label>
                    <Select value={ownership} onValueChange={(v) => setOwnership(v as OwnershipType)}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OWNERSHIP_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label.ar}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMPLOYEE SELECTION - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" />
                  الموظف المستلم
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
              </CardContent>
            </Card>

            {/* ASSIGNMENT DETAILS - Basic */}
            <Card className="rounded-3xl shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
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
                      className="h-11 rounded-xl"
                      disabled={indefiniteAssignment}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Switch
                    checked={indefiniteAssignment}
                    onCheckedChange={setIndefiniteAssignment}
                  />
                  <Label className="text-slate-700">تخصيص دائم (بدون تاريخ إرجاع)</Label>
                </div>
              </CardContent>
            </Card>

            {/* ===================== ADVANCED SECTIONS (Collapsible) ===================== */}

            {/* VALUE & WARRANTY - Advanced */}
            <Collapsible open={openSections.includes('value')} onOpenChange={() => toggleSection('value')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-500" />
                        القيمة والضمان
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {(purchasePrice > 0 || hasWarranty) && (
                          <Badge className="bg-teal-100 text-teal-700">مُعبأ</Badge>
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
                          placeholder="0.00"
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
                          placeholder="0.00"
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

                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <div>
                          <p className="font-medium text-emerald-700">الضمان</p>
                          <p className="text-xs text-emerald-600">هل الأصل مشمول بالضمان؟</p>
                        </div>
                      </div>
                      <Switch
                        checked={hasWarranty}
                        onCheckedChange={setHasWarranty}
                      />
                    </div>

                    {hasWarranty && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">مقدم الضمان</Label>
                          <Input
                            value={warrantyProvider}
                            onChange={(e) => setWarrantyProvider(e.target.value)}
                            placeholder="اسم الشركة"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">تاريخ انتهاء الضمان</Label>
                          <Input
                            type="date"
                            value={warrantyEndDate}
                            onChange={(e) => setWarrantyEndDate(e.target.value)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم الضمان</Label>
                          <Input
                            value={warrantyNumber}
                            onChange={(e) => setWarrantyNumber(e.target.value)}
                            placeholder="رقم شهادة الضمان"
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* INSURANCE - Advanced */}
            <Collapsible open={openSections.includes('insurance')} onOpenChange={() => toggleSection('insurance')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        التأمين
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {insured && (
                          <Badge className="bg-blue-100 text-blue-700">مؤمن</Badge>
                        )}
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('insurance') && "rotate-180")} />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-blue-700">التأمين على الأصل</p>
                          <p className="text-xs text-blue-600">هل الأصل مؤمن عليه؟</p>
                        </div>
                      </div>
                      <Switch
                        checked={insured}
                        onCheckedChange={setInsured}
                      />
                    </div>

                    {insured && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">شركة التأمين</Label>
                          <Input
                            value={insuranceProvider}
                            onChange={(e) => setInsuranceProvider(e.target.value)}
                            placeholder="اسم شركة التأمين"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم البوليصة</Label>
                          <Input
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            placeholder="رقم بوليصة التأمين"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">تاريخ انتهاء التأمين</Label>
                          <Input
                            type="date"
                            value={policyEndDate}
                            onChange={(e) => setPolicyEndDate(e.target.value)}
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">مبلغ التغطية</Label>
                          <Input
                            type="number"
                            value={coverageAmount || ''}
                            onChange={(e) => setCoverageAmount(Number(e.target.value))}
                            placeholder="0.00"
                            className="h-11 rounded-xl"
                            min={0}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* SPECIFICATIONS - Advanced (for IT Equipment) */}
            {(assetCategory === 'IT_equipment' || assetCategory === 'mobile_devices') && (
              <Collapsible open={openSections.includes('specs')} onOpenChange={() => toggleSection('specs')}>
                <Card className="rounded-3xl shadow-sm border-slate-100">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Laptop className="w-5 h-5 text-purple-500" />
                          المواصفات التقنية
                        </CardTitle>
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('specs') && "rotate-180")} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {(assetType === 'laptop' || assetType === 'desktop') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">المعالج</Label>
                            <Input
                              value={processor}
                              onChange={(e) => setProcessor(e.target.value)}
                              placeholder="مثال: Intel Core i7-12700H"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">الذاكرة (RAM)</Label>
                            <Input
                              value={ram}
                              onChange={(e) => setRam(e.target.value)}
                              placeholder="مثال: 16GB DDR5"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">التخزين</Label>
                            <Input
                              value={storage}
                              onChange={(e) => setStorage(e.target.value)}
                              placeholder="مثال: 512GB SSD"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">حجم الشاشة</Label>
                            <Input
                              value={screenSize}
                              onChange={(e) => setScreenSize(e.target.value)}
                              placeholder="مثال: 15.6 بوصة"
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-navy font-medium">نظام التشغيل</Label>
                            <Input
                              value={operatingSystem}
                              onChange={(e) => setOperatingSystem(e.target.value)}
                              placeholder="مثال: Windows 11 Pro, macOS Sonoma"
                              className="h-11 rounded-xl"
                            />
                          </div>
                        </div>
                      )}

                      {(assetType === 'mobile_phone' || assetType === 'tablet') && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">IMEI</Label>
                            <Input
                              value={imei}
                              onChange={(e) => setImei(e.target.value)}
                              placeholder="رقم IMEI"
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
                          <div className="space-y-2">
                            <Label className="text-navy font-medium">رقم الشريحة</Label>
                            <Input
                              value={simCardNumber}
                              onChange={(e) => setSimCardNumber(e.target.value)}
                              placeholder="رقم شريحة SIM"
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
            )}

            {/* VEHICLE SPECS - Advanced (for Vehicles) */}
            {assetType === 'vehicle' && (
              <Collapsible open={openSections.includes('vehicle')} onOpenChange={() => toggleSection('vehicle')}>
                <Card className="rounded-3xl shadow-sm border-slate-100">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Car className="w-5 h-5 text-emerald-500" />
                          بيانات المركبة
                        </CardTitle>
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", openSections.includes('vehicle') && "rotate-180")} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم اللوحة</Label>
                          <Input
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            placeholder="أ ب ج 1234"
                            className="h-11 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم الهيكل</Label>
                          <Input
                            value={chassisNumber}
                            onChange={(e) => setChassisNumber(e.target.value)}
                            placeholder="VIN"
                            className="h-11 rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">رقم المحرك</Label>
                          <Input
                            value={engineNumber}
                            onChange={(e) => setEngineNumber(e.target.value)}
                            placeholder="رقم المحرك"
                            className="h-11 rounded-xl"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-navy font-medium">سنة الصنع</Label>
                          <Input
                            type="number"
                            value={vehicleYear}
                            onChange={(e) => setVehicleYear(Number(e.target.value))}
                            className="h-11 rounded-xl"
                            min={1990}
                            max={new Date().getFullYear() + 1}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* LOCATION & USAGE - Advanced */}
            <Collapsible open={openSections.includes('location')} onOpenChange={() => toggleSection('location')}>
              <Card className="rounded-3xl shadow-sm border-slate-100">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-amber-500" />
                        الموقع والاستخدام
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
                        placeholder="مثال: المكتب الرئيسي - الرياض"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">أصل متنقل</p>
                          <p className="text-xs text-slate-500">يمكن نقله خارج المكتب</p>
                        </div>
                        <Switch
                          checked={mobileAsset}
                          onCheckedChange={setMobileAsset}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">الاستخدام المنزلي</p>
                          <p className="text-xs text-slate-500">مسموح بأخذه للمنزل</p>
                        </div>
                        <Switch
                          checked={homeUseAllowed}
                          onCheckedChange={setHomeUseAllowed}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-700">السفر الدولي</p>
                          <p className="text-xs text-slate-500">مسموح به دولياً</p>
                        </div>
                        <Switch
                          checked={internationalTravelAllowed}
                          onCheckedChange={setInternationalTravelAllowed}
                        />
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
                      <Label className="text-navy font-medium">ملاحظات حالة الأصل</Label>
                      <Textarea
                        value={conditionNotes}
                        onChange={(e) => setConditionNotes(e.target.value)}
                        placeholder="أي ملاحظات عن حالة الأصل عند التخصيص..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">ملاحظات تقنية (IT)</Label>
                      <Textarea
                        value={itNotes}
                        onChange={(e) => setItNotes(e.target.value)}
                        placeholder="ملاحظات الفريق التقني..."
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-navy font-medium">تعليمات خاصة</Label>
                      <Textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="أي تعليمات خاصة للموظف..."
                        className="rounded-xl min-h-[80px]"
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
                onClick={() => navigate({ to: '/dashboard/hr/assets' })}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!assetTag || !assetName || !employeeId || !assignedDate || isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8"
              >
                {isPending ? (
                  <>جاري الحفظ...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
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
