import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useCreateAttendanceRecord, useCheckIn, useCheckOut } from '@/hooks/useAttendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, User, Building, Users, Briefcase,
  Clock, Calendar, MapPin, LogIn, LogOut, ChevronDown,
  Fingerprint, Smartphone, Monitor, CreditCard, FileText, Settings,
  Info, CheckCircle
} from 'lucide-react'
import type { CheckMethod, LocationType, AttendanceStatus } from '@/services/attendanceService'

// Office types
const OFFICE_TYPES = [
  {
    id: 'solo',
    icon: User,
    title: 'فردي',
    titleEn: 'Solo',
    description: 'محامي مستقل',
    fields: ['basic'],
  },
  {
    id: 'small',
    icon: Building,
    title: 'مكتب صغير',
    titleEn: 'Small Office',
    description: '2-5 موظفين',
    fields: ['basic', 'location'],
  },
  {
    id: 'medium',
    icon: Users,
    title: 'مكتب متوسط',
    titleEn: 'Medium Office',
    description: '6-20 موظف',
    fields: ['basic', 'location', 'shifts', 'breaks'],
  },
  {
    id: 'firm',
    icon: Briefcase,
    title: 'شركة محاماة',
    titleEn: 'Law Firm',
    description: '20+ موظف',
    fields: ['basic', 'location', 'shifts', 'breaks', 'biometric', 'compliance'],
  },
]

// Check methods
const CHECK_METHODS: Array<{ value: CheckMethod; label: string; icon: typeof Fingerprint }> = [
  { value: 'biometric', label: 'بصمة', icon: Fingerprint },
  { value: 'mobile', label: 'تطبيق الجوال', icon: Smartphone },
  { value: 'web', label: 'الويب', icon: Monitor },
  { value: 'card_swipe', label: 'بطاقة', icon: CreditCard },
  { value: 'manual', label: 'يدوي', icon: FileText },
]

// Location types
const LOCATION_TYPES: Array<{ value: LocationType; label: string }> = [
  { value: 'office', label: 'المكتب' },
  { value: 'remote', label: 'عن بعد' },
  { value: 'client_site', label: 'موقع العميل' },
  { value: 'court', label: 'المحكمة' },
  { value: 'field', label: 'ميداني' },
  { value: 'other', label: 'آخر' },
]

export function AttendanceRecordCreateView() {
  const navigate = useNavigate()
  const createMutation = useCreateAttendanceRecord()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  // Form state
  const [officeType, setOfficeType] = useState<string>('medium')
  const [recordType, setRecordType] = useState<'full' | 'check_in' | 'check_out'>('full')

  // Basic fields
  const [employeeId, setEmployeeId] = useState('')
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0])

  // Check-in
  const [checkInTime, setCheckInTime] = useState('')
  const [checkInMethod, setCheckInMethod] = useState<CheckMethod>('manual')
  const [checkInLocation, setCheckInLocation] = useState<LocationType>('office')
  const [checkInNotes, setCheckInNotes] = useState('')

  // Check-out
  const [checkOutTime, setCheckOutTime] = useState('')
  const [checkOutMethod, setCheckOutMethod] = useState<CheckMethod>('manual')
  const [checkOutLocation, setCheckOutLocation] = useState<LocationType>('office')
  const [checkOutNotes, setCheckOutNotes] = useState('')

  // Status
  const [status, setStatus] = useState<AttendanceStatus>('present')

  // Advanced
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isShiftOpen, setIsShiftOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)

  // Location details
  const [officeName, setOfficeName] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')

  // Shift details
  const [shiftName, setShiftName] = useState('')
  const [scheduledCheckIn, setScheduledCheckIn] = useState('08:00')
  const [scheduledCheckOut, setScheduledCheckOut] = useState('17:00')

  // Notes
  const [employeeNotes, setEmployeeNotes] = useState('')
  const [managerNotes, setManagerNotes] = useState('')

  const selectedOffice = OFFICE_TYPES.find((o) => o.id === officeType)
  const hasField = (field: string) => selectedOffice?.fields.includes(field)

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (recordType === 'check_in') {
        await checkInMutation.mutateAsync({
          employeeId,
          method: checkInMethod,
          location: { type: checkInLocation },
          notes: checkInNotes,
        })
      } else if (recordType === 'check_out') {
        await checkOutMutation.mutateAsync({
          employeeId,
          method: checkOutMethod,
          location: { type: checkOutLocation },
          notes: checkOutNotes,
        })
      } else {
        await createMutation.mutateAsync({
          employeeId,
          workDate,
          checkIn: checkInTime ? {
            time: `${workDate}T${checkInTime}:00`,
            method: checkInMethod,
            location: { type: checkInLocation },
            notes: checkInNotes,
          } : undefined,
          checkOut: checkOutTime ? {
            time: `${workDate}T${checkOutTime}:00`,
            method: checkOutMethod,
            location: { type: checkOutLocation },
            notes: checkOutNotes,
          } : undefined,
          status,
          notes: {
            employeeNotes,
            managerNotes,
          },
        })
      }
      navigate({ to: '/dashboard/hr/attendance' })
    } catch {
      // Error is handled by mutation's onError callback
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'الحضور', href: '/dashboard/hr/attendance', isActive: true },
    { title: 'الإجازات', href: '/dashboard/hr/leaves', isActive: false },
  ]

  const isPending = createMutation.isPending || checkInMutation.isPending || checkOutMutation.isPending

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder="بحث..." aria-label="بحث" className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD */}
        <ProductivityHero badge="الموارد البشرية" title="تسجيل حضور جديد" type="attendance" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* MAIN FORM CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">

              {/* Office Type Selector */}
              <div className="space-y-4">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  نوع المكتب
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OFFICE_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = officeType === type.id
                    return (
                      <button
                        key={type.id}
                        className={`p-4 rounded-2xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-emerald-200'
                        }`}
                        onClick={() => setOfficeType(type.id)}
                      >
                        <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className={`font-bold text-sm ${isSelected ? 'text-emerald-700' : 'text-navy'}`}>
                          {type.title}
                        </h4>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Record Type */}
              <div className="space-y-4">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  نوع التسجيل
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setRecordType('full')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recordType === 'full'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-5 h-5 ${recordType === 'full' ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span className={`font-bold ${recordType === 'full' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        تسجيل كامل
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">تسجيل وقت الحضور والانصراف معاً</p>
                  </button>
                  <button
                    onClick={() => setRecordType('check_in')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recordType === 'check_in'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <LogIn className={`w-5 h-5 ${recordType === 'check_in' ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span className={`font-bold ${recordType === 'check_in' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        تسجيل حضور
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">تسجيل وقت الحضور فقط</p>
                  </button>
                  <button
                    onClick={() => setRecordType('check_out')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recordType === 'check_out'
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <LogOut className={`w-5 h-5 ${recordType === 'check_out' ? 'text-red-600' : 'text-slate-500'}`} />
                      <span className={`font-bold ${recordType === 'check_out' ? 'text-red-700' : 'text-slate-700'}`}>
                        تسجيل انصراف
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">تسجيل وقت الانصراف فقط</p>
                  </button>
                </div>
              </div>

              {/* Employee & Date */}
              <div className="space-y-4">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  معلومات الموظف
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">الموظف *</Label>
                    <Select value={employeeId} onValueChange={setEmployeeId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emp-001">أحمد محمد العلي</SelectItem>
                        <SelectItem value="emp-002">فاطمة عبدالله السعيد</SelectItem>
                        <SelectItem value="emp-003">خالد إبراهيم الشمري</SelectItem>
                        <SelectItem value="emp-004">نورة سعد القحطاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {recordType === 'full' && (
                    <div className="space-y-2">
                      <Label htmlFor="workDate">تاريخ العمل *</Label>
                      <Input
                        id="workDate"
                        type="date"
                        value={workDate}
                        onChange={(e) => setWorkDate(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  )}
                  {recordType === 'full' && (
                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">حاضر</SelectItem>
                          <SelectItem value="late">متأخر</SelectItem>
                          <SelectItem value="half_day">نصف يوم</SelectItem>
                          <SelectItem value="absent">غائب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-in Section */}
              {(recordType === 'full' || recordType === 'check_in') && (
                <div className="space-y-4">
                  <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-emerald-600" />
                    تسجيل الحضور
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">وقت الحضور *</Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>طريقة التسجيل</Label>
                      <div className="flex gap-2 flex-wrap">
                        {CHECK_METHODS.map((method) => {
                          const Icon = method.icon
                          const isSelected = checkInMethod === method.value
                          return (
                            <button
                              key={method.value}
                              onClick={() => setCheckInMethod(method.value)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-200 hover:border-emerald-200 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{method.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {hasField('location') && (
                      <div className="space-y-2">
                        <Label>موقع الحضور</Label>
                        <Select value={checkInLocation} onValueChange={(v) => setCheckInLocation(v as LocationType)}>
                          <SelectTrigger className="rounded-xl">
                            <MapPin className="w-4 h-4 ms-2" aria-hidden="true" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATION_TYPES.map((loc) => (
                              <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {recordType === 'check_in' && (
                    <div className="space-y-2">
                      <Label htmlFor="checkInNotes">ملاحظات</Label>
                      <Textarea
                        id="checkInNotes"
                        value={checkInNotes}
                        onChange={(e) => setCheckInNotes(e.target.value)}
                        placeholder="أي ملاحظات على الحضور..."
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Check-out Section */}
              {(recordType === 'full' || recordType === 'check_out') && (
                <div className="space-y-4">
                  <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-red-600" />
                    تسجيل الانصراف
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">وقت الانصراف *</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>طريقة التسجيل</Label>
                      <div className="flex gap-2 flex-wrap">
                        {CHECK_METHODS.map((method) => {
                          const Icon = method.icon
                          const isSelected = checkOutMethod === method.value
                          return (
                            <button
                              key={method.value}
                              onClick={() => setCheckOutMethod(method.value)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-red-500 bg-red-50 text-red-700'
                                  : 'border-slate-200 hover:border-red-200 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{method.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {hasField('location') && (
                      <div className="space-y-2">
                        <Label>موقع الانصراف</Label>
                        <Select value={checkOutLocation} onValueChange={(v) => setCheckOutLocation(v as LocationType)}>
                          <SelectTrigger className="rounded-xl">
                            <MapPin className="w-4 h-4 ms-2" aria-hidden="true" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATION_TYPES.map((loc) => (
                              <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {recordType === 'check_out' && (
                    <div className="space-y-2">
                      <Label htmlFor="checkOutNotes">ملاحظات</Label>
                      <Textarea
                        id="checkOutNotes"
                        value={checkOutNotes}
                        onChange={(e) => setCheckOutNotes(e.target.value)}
                        placeholder="أي ملاحظات على الانصراف..."
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Location Details (Collapsible) */}
              {hasField('location') && recordType === 'full' && (
                <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                        <span className="font-bold text-navy">تفاصيل الموقع</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="officeName">اسم المكتب/الموقع</Label>
                        <Input
                          id="officeName"
                          value={officeName}
                          onChange={(e) => setOfficeName(e.target.value)}
                          placeholder="المكتب الرئيسي"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeAddress">العنوان</Label>
                        <Input
                          id="officeAddress"
                          value={officeAddress}
                          onChange={(e) => setOfficeAddress(e.target.value)}
                          placeholder="الرياض، حي العليا"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Shift Details (Collapsible) */}
              {hasField('shifts') && recordType === 'full' && (
                <Collapsible open={isShiftOpen} onOpenChange={setIsShiftOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-navy">تفاصيل الدوام</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isShiftOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shiftName">اسم الوردية</Label>
                        <Select value={shiftName} onValueChange={setShiftName}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر الوردية" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">دوام عادي</SelectItem>
                            <SelectItem value="morning">الفترة الصباحية</SelectItem>
                            <SelectItem value="evening">الفترة المسائية</SelectItem>
                            <SelectItem value="flexible">مرن</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledCheckIn">وقت الحضور المجدول</Label>
                        <Input
                          id="scheduledCheckIn"
                          type="time"
                          value={scheduledCheckIn}
                          onChange={(e) => setScheduledCheckIn(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scheduledCheckOut">وقت الانصراف المجدول</Label>
                        <Input
                          id="scheduledCheckOut"
                          type="time"
                          value={scheduledCheckOut}
                          onChange={(e) => setScheduledCheckOut(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Notes (Collapsible) */}
              {recordType === 'full' && (
                <Collapsible open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-navy">الملاحظات</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isNotesOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeNotes">ملاحظات الموظف</Label>
                        <Textarea
                          id="employeeNotes"
                          value={employeeNotes}
                          onChange={(e) => setEmployeeNotes(e.target.value)}
                          placeholder="ملاحظات من الموظف..."
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="managerNotes">ملاحظات المدير</Label>
                        <Textarea
                          id="managerNotes"
                          value={managerNotes}
                          onChange={(e) => setManagerNotes(e.target.value)}
                          placeholder="ملاحظات من المدير..."
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Labor Law Info */}
              {hasField('compliance') && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-800 mb-1">نظام العمل السعودي - ساعات العمل</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• المادة 98: لا تزيد ساعات العمل عن 8 ساعات يومياً أو 48 ساعة أسبوعياً (6 ساعات في رمضان)</li>
                        <li>• المادة 101: فترة راحة لا تقل عن 30 دقيقة بعد 5 ساعات عمل متواصلة</li>
                        <li>• المادة 106: لا يجوز تشغيل العامل أكثر من 12 ساعة عمل إضافي أسبوعياً</li>
                        <li>• المادة 107: أجر الساعة الإضافية = الأجر العادي + 50%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/hr/attendance' })}
                  className="rounded-xl"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!employeeId || isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 shadow-lg shadow-emerald-500/20"
                >
                  {isPending ? (
                    <>جاري الحفظ...</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ms-2" />
                      {recordType === 'check_in' ? 'تسجيل الحضور' :
                       recordType === 'check_out' ? 'تسجيل الانصراف' : 'حفظ السجل'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar context="attendance" />
        </div>
      </Main>
    </>
  )
}
