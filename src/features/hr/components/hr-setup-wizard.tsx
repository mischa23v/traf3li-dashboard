import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Building2, Users, Calendar, Clock, DollarSign, Mail, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Check, Edit, ArrowRight, Sparkles,
  TrendingUp, Briefcase, UserCheck, Shield, FileText, Settings, Plus, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import hrSetupWizardService, {
  type Department,
  type Designation,
  type LeaveType,
  type LeavePolicy,
  type ShiftType,
  type AttendanceRule,
  type SalaryComponent,
  type GOSISettings,
  type WPSSettings,
  type EmailTemplate,
  type CompanySettings,
} from '@/services/hrSetupWizardService'

// ==================== TYPES ====================

interface WizardData {
  // Step 1: Company Information
  companyName: string
  companyNameAr: string
  companyLogo?: File | null
  defaultWorkingDays: string[]
  defaultWorkingHoursStart: string
  defaultWorkingHoursEnd: string
  fiscalYearStart: string
  weekendDays: string[]

  // Step 2: Organizational Structure
  departments: Department[]
  designations: Designation[]

  // Step 3: Leave Configuration
  leaveTypes: LeaveType[]
  leavePolicies: LeavePolicy[]

  // Step 4: Attendance Settings
  shiftTypes: ShiftType[]
  attendanceRules: AttendanceRule[]

  // Step 5: Payroll Setup
  salaryComponents: SalaryComponent[]
  gosiSettings: GOSISettings
  wpsSettings: WPSSettings

  // Step 6: Email Templates
  emailTemplates: EmailTemplate[]

  // Completion
  completed: boolean
}

const STORAGE_KEY = 'hr-setup-wizard-progress'

// ==================== DEFAULT DATA ====================

const DEFAULT_DEPARTMENTS: Department[] = [
  { name: 'Administration', nameAr: 'الإدارة', description: 'إدارة عامة' },
  { name: 'Legal', nameAr: 'الشؤون القانونية', description: 'القسم القانوني' },
  { name: 'Finance', nameAr: 'المالية', description: 'القسم المالي' },
  { name: 'Human Resources', nameAr: 'الموارد البشرية', description: 'قسم الموارد البشرية' },
]

const DEFAULT_DESIGNATIONS: Designation[] = [
  { title: 'Managing Partner', titleAr: 'الشريك الإداري', level: 1 },
  { title: 'Senior Partner', titleAr: 'شريك أول', level: 2 },
  { title: 'Partner', titleAr: 'شريك', level: 3 },
  { title: 'Senior Associate', titleAr: 'محامي أول', level: 4 },
  { title: 'Associate', titleAr: 'محامي', level: 5 },
  { title: 'Junior Associate', titleAr: 'محامي مساعد', level: 6 },
  { title: 'Legal Assistant', titleAr: 'مساعد قانوني', level: 7 },
]

const DEFAULT_LEAVE_TYPES: LeaveType[] = [
  {
    name: 'Annual Leave',
    nameAr: 'إجازة سنوية',
    maxDays: 21,
    applicableAfter: 0,
    carryForward: true,
    maxCarryForward: 5,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#3B82F6'
  },
  {
    name: 'Sick Leave',
    nameAr: 'إجازة مرضية',
    maxDays: 120,
    applicableAfter: 0,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#EF4444'
  },
  {
    name: 'Hajj Leave',
    nameAr: 'إجازة حج',
    maxDays: 15,
    applicableAfter: 0,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#10B981'
  },
  {
    name: 'Marriage Leave',
    nameAr: 'إجازة زواج',
    maxDays: 5,
    applicableAfter: 0,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#F59E0B'
  },
  {
    name: 'Paternity Leave',
    nameAr: 'إجازة والدية',
    maxDays: 3,
    applicableAfter: 0,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#8B5CF6'
  },
  {
    name: 'Bereavement Leave',
    nameAr: 'إجازة وفاة',
    maxDays: 5,
    applicableAfter: 0,
    carryForward: false,
    isPaid: true,
    requiresApproval: true,
    allowNegativeBalance: false,
    color: '#6B7280'
  },
]

const DEFAULT_SHIFT_TYPES: ShiftType[] = [
  {
    name: 'Day Shift',
    nameAr: 'الدوام الصباحي',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    workingHours: 8,
    isDefault: true,
  },
  {
    name: 'Evening Shift',
    nameAr: 'الدوام المسائي',
    startTime: '14:00',
    endTime: '22:00',
    breakDuration: 60,
    workingHours: 8,
    isDefault: false,
  },
]

const DEFAULT_SALARY_COMPONENTS: SalaryComponent[] = [
  {
    name: 'Basic Salary',
    nameAr: 'الراتب الأساسي',
    type: 'earning',
    calculationType: 'fixed',
    taxable: true,
    includedInGOSI: true,
    includedInEOSB: true,
    isDefault: true,
  },
  {
    name: 'Housing Allowance',
    nameAr: 'بدل السكن',
    type: 'earning',
    calculationType: 'percentage',
    percentage: 25,
    taxable: true,
    includedInGOSI: false,
    includedInEOSB: true,
    isDefault: true,
  },
  {
    name: 'Transportation Allowance',
    nameAr: 'بدل النقل',
    type: 'earning',
    calculationType: 'fixed',
    amount: 500,
    taxable: true,
    includedInGOSI: false,
    includedInEOSB: true,
    isDefault: true,
  },
  {
    name: 'GOSI Deduction',
    nameAr: 'خصم التأمينات الاجتماعية',
    type: 'deduction',
    calculationType: 'percentage',
    percentage: 9.75,
    taxable: false,
    includedInGOSI: false,
    includedInEOSB: false,
    isDefault: true,
  },
]

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    name: 'Welcome Email',
    nameAr: 'بريد الترحيب',
    subject: 'Welcome to {company_name}',
    subjectAr: 'مرحباً بك في {company_name}',
    body: 'Dear {employee_name},\n\nWelcome to {company_name}! We are excited to have you on board.\n\nYour employee ID is: {employee_id}\n\nBest regards,\nHR Team',
    bodyAr: 'عزيزي {employee_name}،\n\nمرحباً بك في {company_name}! نحن متحمسون لانضمامك إلى فريقنا.\n\nرقم الموظف الخاص بك: {employee_id}\n\nمع تحياتنا،\nفريق الموارد البشرية',
    type: 'welcome',
    variables: ['company_name', 'employee_name', 'employee_id'],
  },
  {
    name: 'Leave Approval',
    nameAr: 'الموافقة على الإجازة',
    subject: 'Leave Request Approved',
    subjectAr: 'تمت الموافقة على طلب الإجازة',
    body: 'Dear {employee_name},\n\nYour leave request from {leave_start} to {leave_end} has been approved.\n\nLeave Type: {leave_type}\nDuration: {leave_days} days\n\nBest regards,\nHR Team',
    bodyAr: 'عزيزي {employee_name}،\n\nتمت الموافقة على طلب إجازتك من {leave_start} إلى {leave_end}.\n\nنوع الإجازة: {leave_type}\nالمدة: {leave_days} يوم\n\nمع تحياتنا،\nفريق الموارد البشرية',
    type: 'leave_approval',
    variables: ['employee_name', 'leave_start', 'leave_end', 'leave_type', 'leave_days'],
  },
  {
    name: 'Payslip',
    nameAr: 'قسيمة الراتب',
    subject: 'Payslip for {month} {year}',
    subjectAr: 'قسيمة الراتب لشهر {month} {year}',
    body: 'Dear {employee_name},\n\nYour payslip for {month} {year} is ready.\n\nGross Salary: {gross_salary} SAR\nNet Salary: {net_salary} SAR\n\nPlease find the detailed payslip attached.\n\nBest regards,\nHR Team',
    bodyAr: 'عزيزي {employee_name}،\n\nقسيمة راتبك لشهر {month} {year} جاهزة.\n\nإجمالي الراتب: {gross_salary} ريال\nصافي الراتب: {net_salary} ريال\n\nيُرجى الاطلاع على التفاصيل في المرفق.\n\nمع تحياتنا،\nفريق الموارد البشرية',
    type: 'payslip',
    variables: ['employee_name', 'month', 'year', 'gross_salary', 'net_salary'],
  },
]

const defaultWizardData: WizardData = {
  companyName: '',
  companyNameAr: '',
  companyLogo: null,
  defaultWorkingDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  defaultWorkingHoursStart: '09:00',
  defaultWorkingHoursEnd: '17:00',
  fiscalYearStart: '01-01',
  weekendDays: ['friday', 'saturday'],
  departments: DEFAULT_DEPARTMENTS,
  designations: DEFAULT_DESIGNATIONS,
  leaveTypes: DEFAULT_LEAVE_TYPES,
  leavePolicies: [],
  shiftTypes: DEFAULT_SHIFT_TYPES,
  attendanceRules: [
    {
      name: 'Default Attendance Rule',
      nameAr: 'قاعدة الحضور الافتراضية',
      graceTimeLate: 15,
      graceTimeEarly: 15,
      halfDayThreshold: 4,
      markAbsentAfter: 120,
      overtimeEnabled: true,
      minimumOvertimeHours: 1,
    },
  ],
  salaryComponents: DEFAULT_SALARY_COMPONENTS,
  gosiSettings: {
    enabled: true,
    employeeContributionRate: 9.75,
    employerContributionRate: 12,
    minimumWage: 0,
    maximumWage: 45000,
  },
  wpsSettings: {
    enabled: true,
    fileFormat: 'SIF',
  },
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  completed: false,
}

// ==================== COMPONENT ====================

export default function HRSetupWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const totalSteps = 7

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWizardData({ ...defaultWizardData, ...parsed })
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep)
        }
        toast.info('تم استعادة التقدم السابق', {
          description: 'يمكنك متابعة الإعداد من حيث توقفت'
        })
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...wizardData, currentStep }))
  }, [wizardData, currentStep])

  const handleInputChange = (field: keyof WizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('companyLogo', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const skipStep = () => {
    toast.info('تم تخطي الخطوة', {
      description: 'يمكنك إعداد هذا لاحقاً من الإعدادات'
    })
    nextStep()
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const completeSetup = async () => {
    setIsSubmitting(true)
    try {
      // Step 1: Update company settings
      await hrSetupWizardService.updateCompanySettings({
        companyName: wizardData.companyName,
        companyNameAr: wizardData.companyNameAr,
        defaultWorkingDays: wizardData.defaultWorkingDays,
        defaultWorkingHoursStart: wizardData.defaultWorkingHoursStart,
        defaultWorkingHoursEnd: wizardData.defaultWorkingHoursEnd,
        fiscalYearStart: wizardData.fiscalYearStart,
        weekendDays: wizardData.weekendDays,
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
      })

      // Upload logo if provided
      if (wizardData.companyLogo) {
        await hrSetupWizardService.uploadCompanyLogo(wizardData.companyLogo)
      }

      // Step 2: Create departments and designations
      if (wizardData.departments.length > 0) {
        await hrSetupWizardService.createDepartments(wizardData.departments)
      }
      if (wizardData.designations.length > 0) {
        await hrSetupWizardService.createDesignations(wizardData.designations)
      }

      // Step 3: Create leave types and policies
      if (wizardData.leaveTypes.length > 0) {
        await hrSetupWizardService.createLeaveTypes(wizardData.leaveTypes)
      }
      if (wizardData.leavePolicies.length > 0) {
        await hrSetupWizardService.createLeavePolicies(wizardData.leavePolicies)
      }

      // Step 4: Create shift types and attendance rules
      if (wizardData.shiftTypes.length > 0) {
        await hrSetupWizardService.createShiftTypes(wizardData.shiftTypes)
      }
      if (wizardData.attendanceRules.length > 0) {
        await hrSetupWizardService.createAttendanceRules(wizardData.attendanceRules)
      }

      // Step 5: Create salary components and update GOSI/WPS settings
      if (wizardData.salaryComponents.length > 0) {
        await hrSetupWizardService.createSalaryComponents(wizardData.salaryComponents)
      }
      await hrSetupWizardService.updateGOSISettings(wizardData.gosiSettings)
      await hrSetupWizardService.updateWPSSettings(wizardData.wpsSettings)

      // Step 6: Create email templates
      if (wizardData.emailTemplates.length > 0) {
        await hrSetupWizardService.createEmailTemplates(wizardData.emailTemplates)
      }

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)

      toast.success('تم إكمال إعداد نظام الموارد البشرية بنجاح!', {
        description: 'يمكنك الآن البدء في إدارة الموظفين'
      })

      // Navigate to HR overview
      setTimeout(() => {
        navigate({ to: '/dashboard/hr/employees' })
      }, 1500)

    } catch (error: any) {
      console.error('Setup failed:', error)
      toast.error('فشل إكمال الإعداد', {
        description: error.message || 'حدث خطأ أثناء حفظ الإعدادات'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/hr/employees', isActive: false },
    { title: 'معالج إعداد HR', href: '/dashboard/hr/setup-wizard', isActive: true },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      // ==================== STEP 1: COMPANY INFORMATION ====================
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <Building2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مرحباً بك في معالج إعداد الموارد البشرية</h2>
              <p className="text-slate-600">دعنا نبدأ بإعداد معلومات شركتك الأساسية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  اسم الشركة (إنجليزي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  value={wizardData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNameAr" className="text-sm font-medium text-slate-700">
                  اسم الشركة (عربي) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyNameAr"
                  placeholder="اسم الشركة"
                  value={wizardData.companyNameAr}
                  onChange={(e) => handleInputChange('companyNameAr', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="logo" className="text-sm font-medium text-slate-700">
                  شعار الشركة
                </Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg border border-slate-200" />
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, أو SVG (الحد الأقصى 2MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium text-slate-700">
                  أيام العمل الافتراضية <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-7 gap-2">
                  {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                    const dayNames: Record<string, string> = {
                      sunday: 'الأحد',
                      monday: 'الاثنين',
                      tuesday: 'الثلاثاء',
                      wednesday: 'الأربعاء',
                      thursday: 'الخميس',
                      friday: 'الجمعة',
                      saturday: 'السبت',
                    }
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const current = wizardData.defaultWorkingDays
                          if (current.includes(day)) {
                            handleInputChange('defaultWorkingDays', current.filter(d => d !== day))
                          } else {
                            handleInputChange('defaultWorkingDays', [...current, day])
                          }
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          wizardData.defaultWorkingDays.includes(day)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-navy">{dayNames[day]}</span>
                          {wizardData.defaultWorkingDays.includes(day) && (
                            <Check className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workStart" className="text-sm font-medium text-slate-700">
                  ساعة بدء العمل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workStart"
                  type="time"
                  value={wizardData.defaultWorkingHoursStart}
                  onChange={(e) => handleInputChange('defaultWorkingHoursStart', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEnd" className="text-sm font-medium text-slate-700">
                  ساعة انتهاء العمل <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={wizardData.defaultWorkingHoursEnd}
                  onChange={(e) => handleInputChange('defaultWorkingHoursEnd', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="fiscalYearStart" className="text-sm font-medium text-slate-700">
                  بداية السنة المالية (MM-DD) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fiscalYearStart"
                  placeholder="01-01"
                  value={wizardData.fiscalYearStart}
                  onChange={(e) => handleInputChange('fiscalYearStart', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
                <p className="text-xs text-slate-500">مثال: 01-01 للسنة الميلادية، 01-07 للسنة المالية الهجرية</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> يمكنك تعديل هذه الإعدادات لاحقاً من إعدادات النظام
              </p>
            </div>
          </div>
        )

      // ==================== STEP 2: ORGANIZATIONAL STRUCTURE ====================
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">الهيكل التنظيمي</h2>
              <p className="text-slate-600">أنشئ الأقسام والمسميات الوظيفية</p>
            </div>

            {/* Departments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">الأقسام</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleInputChange('departments', [
                      ...wizardData.departments,
                      { name: '', nameAr: '', description: '' }
                    ])
                  }}
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4 me-1" />
                  إضافة قسم
                </Button>
              </div>

              {wizardData.departments.map((dept, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">الاسم (إنجليزي)</Label>
                      <Input
                        placeholder="Department Name"
                        value={dept.name}
                        onChange={(e) => {
                          const newDepts = [...wizardData.departments]
                          newDepts[index].name = e.target.value
                          handleInputChange('departments', newDepts)
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">الاسم (عربي)</Label>
                      <Input
                        placeholder="اسم القسم"
                        value={dept.nameAr}
                        onChange={(e) => {
                          const newDepts = [...wizardData.departments]
                          newDepts[index].nameAr = e.target.value
                          handleInputChange('departments', newDepts)
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">الوصف</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="الوصف"
                          value={dept.description || ''}
                          onChange={(e) => {
                            const newDepts = [...wizardData.departments]
                            newDepts[index].description = e.target.value
                            handleInputChange('departments', newDepts)
                          }}
                          className="rounded-lg border-slate-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleInputChange('departments', wizardData.departments.filter((_, i) => i !== index))
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Designations Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">المسميات الوظيفية</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleInputChange('designations', [
                      ...wizardData.designations,
                      { title: '', titleAr: '', level: wizardData.designations.length + 1 }
                    ])
                  }}
                  className="rounded-xl"
                >
                  <Plus className="w-4 h-4 me-1" />
                  إضافة مسمى وظيفي
                </Button>
              </div>

              {wizardData.designations.map((designation, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">المسمى (إنجليزي)</Label>
                      <Input
                        placeholder="Job Title"
                        value={designation.title}
                        onChange={(e) => {
                          const newDesignations = [...wizardData.designations]
                          newDesignations[index].title = e.target.value
                          handleInputChange('designations', newDesignations)
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">المسمى (عربي)</Label>
                      <Input
                        placeholder="المسمى الوظيفي"
                        value={designation.titleAr}
                        onChange={(e) => {
                          const newDesignations = [...wizardData.designations]
                          newDesignations[index].titleAr = e.target.value
                          handleInputChange('designations', newDesignations)
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">المستوى</Label>
                      <Input
                        type="number"
                        placeholder="1"
                        value={designation.level}
                        onChange={(e) => {
                          const newDesignations = [...wizardData.designations]
                          newDesignations[index].level = parseInt(e.target.value) || 1
                          handleInputChange('designations', newDesignations)
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">&nbsp;</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleInputChange('designations', wizardData.designations.filter((_, i) => i !== index))
                        }}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 me-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>نصيحة:</strong> يمكنك إضافة المزيد من الأقسام والمسميات الوظيفية لاحقاً من إعدادات الهيكل التنظيمي
              </p>
            </div>
          </div>
        )

      // ==================== STEP 3: LEAVE CONFIGURATION ====================
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات الإجازات</h2>
              <p className="text-slate-600">قم بإعداد أنواع الإجازات وسياساتها</p>
            </div>

            <div className="space-y-4">
              {wizardData.leaveTypes.map((leaveType, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: leaveType.color || '#6B7280' }}
                      >
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-navy">{leaveType.nameAr}</div>
                        <div className="text-sm text-slate-500">{leaveType.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy">{leaveType.maxDays} يوم</div>
                      <div className="text-xs text-slate-500">الحد الأقصى</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${leaveType.isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {leaveType.isPaid ? <Check className="w-3 h-3" /> : null}
                      <span>{leaveType.isPaid ? 'مدفوعة' : 'غير مدفوعة'}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${leaveType.carryForward ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>
                      {leaveType.carryForward ? <Check className="w-3 h-3" /> : null}
                      <span>{leaveType.carryForward ? 'قابلة للترحيل' : 'غير قابلة للترحيل'}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${leaveType.requiresApproval ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                      {leaveType.requiresApproval ? <Check className="w-3 h-3" /> : null}
                      <span>{leaveType.requiresApproval ? 'تتطلب موافقة' : 'لا تتطلب موافقة'}</span>
                    </div>
                    {leaveType.carryForward && leaveType.maxCarryForward && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-700">
                        <span>ترحيل حتى {leaveType.maxCarryForward} يوم</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-800">
                <strong>ملاحظة:</strong> جميع أنواع الإجازات متوافقة مع نظام العمل السعودي. يمكنك تخصيصها أو إضافة أنواع جديدة لاحقاً.
              </p>
            </div>
          </div>
        )

      // ==================== STEP 4: ATTENDANCE SETTINGS ====================
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات الحضور</h2>
              <p className="text-slate-600">قم بإعداد الدوامات وقواعد الحضور</p>
            </div>

            {/* Shift Types */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy">أنواع الدوامات</h3>
              {wizardData.shiftTypes.map((shift, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shift.isDefault ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Clock className={`w-5 h-5 ${shift.isDefault ? 'text-emerald-600' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <div className="font-medium text-navy">{shift.nameAr}</div>
                        <div className="text-sm text-slate-500">{shift.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy">
                        {shift.startTime} - {shift.endTime}
                      </div>
                      <div className="text-xs text-slate-500">
                        {shift.workingHours} ساعات ({shift.breakDuration} دقيقة استراحة)
                      </div>
                    </div>
                  </div>
                  {shift.isDefault && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                        الدوام الافتراضي
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Attendance Rules */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy">قواعد الحضور</h3>
              {wizardData.attendanceRules.map((rule, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="mb-4">
                    <div className="font-medium text-navy mb-1">{rule.nameAr}</div>
                    <div className="text-sm text-slate-500">{rule.name}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">فترة السماح للتأخير</div>
                      <div className="font-medium text-navy">{rule.graceTimeLate} دقيقة</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">فترة السماح للمغادرة المبكرة</div>
                      <div className="font-medium text-navy">{rule.graceTimeEarly} دقيقة</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">حد نصف اليوم</div>
                      <div className="font-medium text-navy">{rule.halfDayThreshold} ساعات</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">تسجيل غياب بعد</div>
                      <div className="font-medium text-navy">{rule.markAbsentAfter} دقيقة</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600">العمل الإضافي</div>
                      <div className="font-medium text-navy">
                        {rule.overtimeEnabled ? `مفعّل (الحد الأدنى: ${rule.minimumOvertimeHours} ساعة)` : 'غير مفعّل'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <p className="text-sm text-cyan-800">
                <strong>نصيحة:</strong> يمكنك تخصيص قواعد الحضور لكل قسم أو موظف بشكل منفصل لاحقاً
              </p>
            </div>
          </div>
        )

      // ==================== STEP 5: PAYROLL SETUP ====================
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعداد الرواتب</h2>
              <p className="text-slate-600">قم بإعداد مكونات الراتب والتأمينات</p>
            </div>

            {/* Salary Components */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy">مكونات الراتب</h3>
              {wizardData.salaryComponents.map((component, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        component.type === 'earning' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          component.type === 'earning' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-navy">{component.nameAr}</div>
                        <div className="text-sm text-slate-500">{component.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy">
                        {component.calculationType === 'fixed'
                          ? `${component.amount || 0} ريال`
                          : `${component.percentage || 0}%`
                        }
                      </div>
                      <div className="text-xs text-slate-500">
                        {component.type === 'earning' ? 'استحقاق' : 'خصم'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {component.taxable && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-center">خاضع للضريبة</span>
                    )}
                    {component.includedInGOSI && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-center">ضمن GOSI</span>
                    )}
                    {component.includedInEOSB && (
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-center">ضمن مكافأة</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* GOSI Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">إعدادات التأمينات الاجتماعية (GOSI)</h3>
                <Switch
                  checked={wizardData.gosiSettings.enabled}
                  onCheckedChange={(checked) => {
                    handleInputChange('gosiSettings', {
                      ...wizardData.gosiSettings,
                      enabled: checked
                    })
                  }}
                />
              </div>

              {wizardData.gosiSettings.enabled && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">نسبة مساهمة الموظف (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={wizardData.gosiSettings.employeeContributionRate}
                        onChange={(e) => {
                          handleInputChange('gosiSettings', {
                            ...wizardData.gosiSettings,
                            employeeContributionRate: parseFloat(e.target.value) || 0
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">نسبة مساهمة صاحب العمل (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={wizardData.gosiSettings.employerContributionRate}
                        onChange={(e) => {
                          handleInputChange('gosiSettings', {
                            ...wizardData.gosiSettings,
                            employerContributionRate: parseFloat(e.target.value) || 0
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">الحد الأدنى للراتب (اختياري)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={wizardData.gosiSettings.minimumWage || ''}
                        onChange={(e) => {
                          handleInputChange('gosiSettings', {
                            ...wizardData.gosiSettings,
                            minimumWage: parseFloat(e.target.value) || undefined
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">الحد الأقصى للراتب</Label>
                      <Input
                        type="number"
                        value={wizardData.gosiSettings.maximumWage || ''}
                        onChange={(e) => {
                          handleInputChange('gosiSettings', {
                            ...wizardData.gosiSettings,
                            maximumWage: parseFloat(e.target.value) || undefined
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* WPS Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">إعدادات نظام حماية الأجور (WPS)</h3>
                <Switch
                  checked={wizardData.wpsSettings.enabled}
                  onCheckedChange={(checked) => {
                    handleInputChange('wpsSettings', {
                      ...wizardData.wpsSettings,
                      enabled: checked
                    })
                  }}
                />
              </div>

              {wizardData.wpsSettings.enabled && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">رقم المنشأة في وزارة العمل</Label>
                      <Input
                        placeholder="MOL ID"
                        value={wizardData.wpsSettings.molId || ''}
                        onChange={(e) => {
                          handleInputChange('wpsSettings', {
                            ...wizardData.wpsSettings,
                            molId: e.target.value
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">رقم المنشأة</Label>
                      <Input
                        placeholder="Establishment ID"
                        value={wizardData.wpsSettings.establishmentId || ''}
                        onChange={(e) => {
                          handleInputChange('wpsSettings', {
                            ...wizardData.wpsSettings,
                            establishmentId: e.target.value
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">رمز البنك</Label>
                      <Input
                        placeholder="Bank Code"
                        value={wizardData.wpsSettings.bankCode || ''}
                        onChange={(e) => {
                          handleInputChange('wpsSettings', {
                            ...wizardData.wpsSettings,
                            bankCode: e.target.value
                          })
                        }}
                        className="rounded-lg border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-slate-600">تنسيق الملف</Label>
                      <select
                        value={wizardData.wpsSettings.fileFormat}
                        onChange={(e) => {
                          handleInputChange('wpsSettings', {
                            ...wizardData.wpsSettings,
                            fileFormat: e.target.value as 'SIF' | 'WPS'
                          })
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <option value="SIF">SIF</option>
                        <option value="WPS">WPS</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>ملاحظة:</strong> إعدادات GOSI و WPS متوافقة مع متطلبات المملكة العربية السعودية
              </p>
            </div>
          </div>
        )

      // ==================== STEP 6: EMAIL TEMPLATES ====================
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                <Mail className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">قوالب البريد الإلكتروني</h2>
              <p className="text-slate-600">قوالب جاهزة لإشعارات الموارد البشرية</p>
            </div>

            <div className="space-y-4">
              {wizardData.emailTemplates.map((template, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <div className="font-medium text-navy">{template.nameAr}</div>
                        <div className="text-sm text-slate-500">{template.name}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                      {template.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-xs text-slate-600 mb-1">الموضوع (عربي):</div>
                      <div className="bg-slate-50 p-2 rounded">{template.subjectAr}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">المتغيرات المتاحة:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, vIndex) => (
                          <span key={vIndex} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {`{${variable}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <p className="text-sm text-pink-800">
                <strong>نصيحة:</strong> يمكنك تخصيص هذه القوالب أو إضافة قوالب جديدة من إعدادات البريد الإلكتروني
              </p>
            </div>
          </div>
        )

      // ==================== STEP 7: REVIEW & COMPLETE ====================
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مراجعة وإكمال الإعداد</h2>
              <p className="text-slate-600">راجع جميع الإعدادات قبل إكمال المعالج</p>
            </div>

            <div className="space-y-4">
              {/* Company Info Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      <CardTitle>معلومات الشركة</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">اسم الشركة:</span>
                      <span className="font-medium">{wizardData.companyName} / {wizardData.companyNameAr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ساعات العمل:</span>
                      <span className="font-medium">{wizardData.defaultWorkingHoursStart} - {wizardData.defaultWorkingHoursEnd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">أيام العمل:</span>
                      <span className="font-medium">{wizardData.defaultWorkingDays.length} أيام</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizational Structure Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <CardTitle>الهيكل التنظيمي</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">عدد الأقسام:</span>
                      <span className="font-medium">{wizardData.departments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">عدد المسميات الوظيفية:</span>
                      <span className="font-medium">{wizardData.designations.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Configuration Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <CardTitle>إعدادات الإجازات</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">عدد أنواع الإجازات:</span>
                      <span className="font-medium">{wizardData.leaveTypes.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {wizardData.leaveTypes.map((lt, i) => (
                        <span key={i} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                          {lt.nameAr}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Settings Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cyan-500" />
                      <CardTitle>إعدادات الحضور</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(4)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">عدد أنواع الدوامات:</span>
                      <span className="font-medium">{wizardData.shiftTypes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">قواعد الحضور:</span>
                      <span className="font-medium">{wizardData.attendanceRules.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payroll Settings Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <CardTitle>إعدادات الرواتب</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(5)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">مكونات الراتب:</span>
                      <span className="font-medium">{wizardData.salaryComponents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">GOSI:</span>
                      <span className="font-medium">{wizardData.gosiSettings.enabled ? 'مفعّل' : 'غير مفعّل'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">WPS:</span>
                      <span className="font-medium">{wizardData.wpsSettings.enabled ? 'مفعّل' : 'غير مفعّل'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-pink-500" />
                      <CardTitle>قوالب البريد الإلكتروني</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(6)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">عدد القوالب:</span>
                      <span className="font-medium">{wizardData.emailTemplates.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy mb-2">جاهز للانطلاق!</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    لقد أكملت جميع الإعدادات الأساسية لنظام الموارد البشرية. عند النقر على "إكمال الإعداد"، سيتم تطبيق جميع الإعدادات وسيكون النظام جاهزاً للاستخدام.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إنشاء الهيكل التنظيمي والمسميات الوظيفية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إعداد أنواع الإجازات والسياسات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تكوين الدوامات وقواعد الحضور</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إعداد مكونات الراتب والتأمينات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تفعيل قوالب البريد الإلكتروني</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">
                الخطوة {currentStep} من {totalSteps}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-3"
              indicatorClassName="bg-gradient-to-r from-emerald-500 to-blue-500"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {[...Array(totalSteps)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i + 1)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    currentStep === i + 1
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : currentStep > i + 1
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  aria-label={`الانتقال إلى الخطوة ${i + 1}`}
                >
                  {currentStep > i + 1 ? <Check className="w-4 h-4 mx-auto" /> : i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-slate-100">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4 ms-1" />
                    السابق
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < totalSteps && currentStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={skipStep}
                    className="text-slate-500 hover:text-navy rounded-xl"
                  >
                    تخطي
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4 me-1" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={completeSetup}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإكمال...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        إكمال الإعداد
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
