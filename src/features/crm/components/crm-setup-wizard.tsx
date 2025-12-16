import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Target, GitBranch, XCircle, MapPin, Users, UserCheck, Calendar,
  Mail, Hash, UserPlus, Briefcase, CheckCircle2, ChevronRight, ChevronLeft,
  Loader2, Check, Edit, ArrowRight, Sparkles, TrendingUp, Clock, Phone
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// Types for wizard data
interface LeadSource {
  name: string
  nameAr: string
  utmSource?: string
  utmMedium?: string
  enabled: boolean
}

interface SalesStage {
  name: string
  nameAr: string
  order: number
  probability: number
  color: string
  type: 'open' | 'won' | 'lost'
  requiresConflictCheck?: boolean
  requiresQualification?: boolean
}

interface LostReason {
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'
}

interface Territory {
  name: string
  nameAr: string
  parentName?: string
  isGroup: boolean
  level: number
}

interface CustomerGroup {
  name: string
  nameAr: string
  parentName?: string
}

interface SalesPerson {
  name: string
  employeeId?: string
  userId?: string
  commissionRate: number
  territoryNames: string[]
}

interface WorkingHours {
  enabled: boolean
  start: string
  end: string
}

interface WizardData {
  // Step 1: Welcome & Enable CRM
  crmEnabled: boolean
  industry?: string
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '500+'

  // Step 2: Lead Sources
  leadSources: LeadSource[]

  // Step 3: Sales Stages
  salesStages: SalesStage[]

  // Step 4: Lost Reasons
  lostReasons: LostReason[]

  // Step 5: Territory Setup
  territoryEnabled: boolean
  territories: Territory[]

  // Step 6: Customer Groups
  customerGroups: CustomerGroup[]

  // Step 7: Sales Team
  salesTeamEnabled: boolean
  salesPersons: SalesPerson[]

  // Step 8: Appointment Settings
  appointmentEnabled: boolean
  appointmentDuration: number
  allowedDurations: number[]
  advanceBookingDays: number
  workingHours: {
    sunday: WorkingHours
    monday: WorkingHours
    tuesday: WorkingHours
    wednesday: WorkingHours
    thursday: WorkingHours
    friday: WorkingHours
    saturday: WorkingHours
  }
  agentList: string[]

  // Step 9: Communication Settings
  autoLogEmails: boolean
  autoLogCalls: boolean
  autoLogWhatsApp: boolean
  carryForwardCommunication: boolean
  updateTimestampOnCommunication: boolean

  // Step 10: Naming Convention
  leadPrefix: string
  casePrefix: string
  quotePrefix: string
  campaignNamingBy: 'name' | 'series'

  // Step 11: First Lead
  firstLead: {
    firstName: string
    lastName: string
    email: string
    phone: string
    companyName?: string
    sourceId?: string
  }

  // Step 12: First Case
  firstCase: {
    title: string
    caseType: string
    description?: string
    estimatedValue?: number
  }

  // Completion
  completed: boolean
}

const STORAGE_KEY = 'crm-setup-wizard-progress'

// Default values
const DEFAULT_LEAD_SOURCES: LeadSource[] = [
  { name: 'Website', nameAr: 'الموقع الإلكتروني', utmSource: 'website', enabled: true },
  { name: 'Referral', nameAr: 'إحالة', utmSource: 'referral', enabled: true },
  { name: 'Social Media', nameAr: 'وسائل التواصل الاجتماعي', utmSource: 'social', enabled: true },
  { name: 'Advertisement', nameAr: 'إعلان', utmSource: 'ads', enabled: true },
  { name: 'Walk-in', nameAr: 'زيارة مباشرة', utmSource: 'walkin', enabled: true },
  { name: 'Phone Call', nameAr: 'مكالمة هاتفية', utmSource: 'phone', enabled: true },
  { name: 'Email Campaign', nameAr: 'حملة بريد إلكتروني', utmSource: 'email', enabled: true },
  { name: 'Event', nameAr: 'فعالية', utmSource: 'event', enabled: true },
]

const DEFAULT_SALES_STAGES: SalesStage[] = [
  { name: 'Intake', nameAr: 'الاستقبال', order: 1, probability: 10, color: '#6B7280', type: 'open' },
  { name: 'Conflict Check', nameAr: 'فحص التعارض', order: 2, probability: 20, color: '#F59E0B', type: 'open', requiresConflictCheck: true },
  { name: 'Qualified', nameAr: 'مؤهل', order: 3, probability: 40, color: '#3B82F6', type: 'open', requiresQualification: true },
  { name: 'Proposal Sent', nameAr: 'تم إرسال العرض', order: 4, probability: 60, color: '#8B5CF6', type: 'open' },
  { name: 'Negotiation', nameAr: 'التفاوض', order: 5, probability: 80, color: '#EC4899', type: 'open' },
  { name: 'Won', nameAr: 'تم الفوز', order: 6, probability: 100, color: '#10B981', type: 'won' },
  { name: 'Lost', nameAr: 'خسارة', order: 7, probability: 0, color: '#EF4444', type: 'lost' },
]

const DEFAULT_LOST_REASONS: LostReason[] = [
  { reason: 'Price too high', reasonAr: 'السعر مرتفع جداً', category: 'price' },
  { reason: 'Chose competitor', reasonAr: 'اختار منافساً', category: 'competitor' },
  { reason: 'Budget constraints', reasonAr: 'قيود الميزانية', category: 'price' },
  { reason: 'Timing not right', reasonAr: 'التوقيت غير مناسب', category: 'timing' },
  { reason: 'Scope mismatch', reasonAr: 'عدم تطابق النطاق', category: 'scope' },
  { reason: 'No response', reasonAr: 'لا يوجد رد', category: 'relationship' },
  { reason: 'Internal decision', reasonAr: 'قرار داخلي', category: 'internal' },
  { reason: 'Other', reasonAr: 'أخرى', category: 'other' },
]

const DEFAULT_TERRITORIES_SA: Territory[] = [
  { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', isGroup: true, level: 0 },
  { name: 'Riyadh Region', nameAr: 'منطقة الرياض', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Makkah Region', nameAr: 'منطقة مكة المكرمة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Eastern Region', nameAr: 'المنطقة الشرقية', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Madinah Region', nameAr: 'منطقة المدينة المنورة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Riyadh City', nameAr: 'مدينة الرياض', isGroup: false, level: 2, parentName: 'Riyadh Region' },
  { name: 'Jeddah', nameAr: 'جدة', isGroup: false, level: 2, parentName: 'Makkah Region' },
  { name: 'Dammam', nameAr: 'الدمام', isGroup: false, level: 2, parentName: 'Eastern Region' },
]

const DEFAULT_CUSTOMER_GROUPS: CustomerGroup[] = [
  { name: 'Individual', nameAr: 'فرد' },
  { name: 'Commercial', nameAr: 'تجاري' },
  { name: 'Government', nameAr: 'حكومي' },
  { name: 'Non-Profit', nameAr: 'غير ربحي' },
  { name: 'VIP', nameAr: 'كبار العملاء' },
]

const defaultWizardData: WizardData = {
  crmEnabled: true,
  industry: undefined,
  companySize: undefined,
  leadSources: DEFAULT_LEAD_SOURCES,
  salesStages: DEFAULT_SALES_STAGES,
  lostReasons: DEFAULT_LOST_REASONS,
  territoryEnabled: true,
  territories: DEFAULT_TERRITORIES_SA,
  customerGroups: DEFAULT_CUSTOMER_GROUPS,
  salesTeamEnabled: false,
  salesPersons: [],
  appointmentEnabled: true,
  appointmentDuration: 30,
  allowedDurations: [15, 30, 45, 60],
  advanceBookingDays: 30,
  workingHours: {
    sunday: { enabled: true, start: '09:00', end: '17:00' },
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
  },
  agentList: [],
  autoLogEmails: true,
  autoLogCalls: true,
  autoLogWhatsApp: true,
  carryForwardCommunication: true,
  updateTimestampOnCommunication: true,
  leadPrefix: 'LEAD',
  casePrefix: 'CASE',
  quotePrefix: 'QT',
  campaignNamingBy: 'series',
  firstLead: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    sourceId: '',
  },
  firstCase: {
    title: '',
    caseType: '',
    description: '',
    estimatedValue: undefined,
  },
  completed: false,
}

export default function CRMSetupWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>(defaultWizardData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 13

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
      // TODO: Implement API calls to save CRM settings
      // This would include:
      // 1. Create lead sources
      // 2. Create sales stages
      // 3. Create lost reasons
      // 4. Create territories
      // 5. Create customer groups
      // 6. Create sales persons
      // 7. Update CRM settings
      // 8. Create first lead (if provided)
      // 9. Create first case (if provided)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)

      toast.success('تم إكمال إعداد نظام CRM بنجاح!', {
        description: 'يمكنك الآن البدء في إدارة العملاء المحتملين والحالات'
      })

      // Navigate to CRM overview
      setTimeout(() => {
        navigate({ to: '/dashboard/crm/leads' })
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
    { title: 'نظرة عامة', href: '/dashboard/crm/leads', isActive: false },
    { title: 'معالج إعداد CRM', href: '/dashboard/crm/setup-wizard', isActive: true },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مرحباً بك في معالج إعداد CRM</h2>
              <p className="text-slate-600">دعنا نبدأ بإعداد نظام إدارة علاقات العملاء لمكتبك القانوني</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-6">
                <div>
                  <Label htmlFor="crmEnabled" className="text-base font-medium text-navy">
                    تفعيل نظام CRM
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    تمكين إدارة العملاء المحتملين والحالات والفرص البيعية
                  </p>
                </div>
                <Switch
                  id="crmEnabled"
                  checked={wizardData.crmEnabled}
                  onCheckedChange={(checked) => handleInputChange('crmEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium text-slate-700">
                  مجال العمل
                </Label>
                <select
                  id="industry"
                  value={wizardData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">اختر مجال العمل</option>
                  <option value="law-firm">مكتب محاماة</option>
                  <option value="legal-consultancy">استشارات قانونية</option>
                  <option value="corporate-legal">قانوني مؤسسي</option>
                  <option value="arbitration">تحكيم</option>
                  <option value="notary">توثيق</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-sm font-medium text-slate-700">
                  حجم المكتب
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['1-10', '11-50', '51-200', '201-500', '500+'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleInputChange('companySize', size)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        wizardData.companySize === size
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-navy">{size}</span>
                        {wizardData.companySize === size && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 text-right mt-1">موظف</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>ملاحظة:</strong> سيتم إعداد نظام CRM متكامل يشمل إدارة العملاء المحتملين، الحالات، العروض، والتقارير
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مصادر العملاء المحتملين</h2>
              <p className="text-slate-600">حدد من أين يأتي عملاؤك المحتملون</p>
            </div>

            <div className="space-y-4">
              {wizardData.leadSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex-1">
                    <div className="font-medium text-navy">{source.nameAr}</div>
                    <div className="text-sm text-slate-500">{source.name}</div>
                    {source.utmSource && (
                      <div className="text-xs text-slate-400 mt-1">UTM: {source.utmSource}</div>
                    )}
                  </div>
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={(checked) => {
                      const newSources = [...wizardData.leadSources]
                      newSources[index].enabled = checked
                      handleInputChange('leadSources', newSources)
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>نصيحة:</strong> يمكنك إضافة مصادر إضافية لاحقاً من إعدادات CRM
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <GitBranch className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مراحل المبيعات</h2>
              <p className="text-slate-600">حدد المراحل التي تمر بها الحالة من البداية حتى الفوز أو الخسارة</p>
            </div>

            <div className="space-y-3">
              {wizardData.salesStages.map((stage, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.order}
                      </div>
                      <div>
                        <div className="font-medium text-navy">{stage.nameAr}</div>
                        <div className="text-sm text-slate-500">{stage.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy">{stage.probability}%</div>
                      <div className="text-xs text-slate-500">احتمالية الفوز</div>
                    </div>
                  </div>
                  {(stage.requiresConflictCheck || stage.requiresQualification) && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex gap-2 text-xs text-slate-600">
                        {stage.requiresConflictCheck && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded">يتطلب فحص تعارض</span>
                        )}
                        {stage.requiresQualification && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">يتطلب تأهيل</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-800">
                <strong>ملاحظة:</strong> يمكنك تخصيص المراحل وإضافة مزيد منها لاحقاً
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">أسباب الخسارة</h2>
              <p className="text-slate-600">تتبع أسباب خسارة الحالات لتحسين معدل النجاح</p>
            </div>

            <div className="space-y-3">
              {wizardData.lostReasons.map((reason, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-navy">{reason.reasonAr}</div>
                      <div className="text-sm text-slate-500">{reason.reason}</div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      reason.category === 'price' ? 'bg-red-100 text-red-700' :
                      reason.category === 'competitor' ? 'bg-orange-100 text-orange-700' :
                      reason.category === 'timing' ? 'bg-yellow-100 text-yellow-700' :
                      reason.category === 'scope' ? 'bg-green-100 text-green-700' :
                      reason.category === 'relationship' ? 'bg-blue-100 text-blue-700' :
                      reason.category === 'internal' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {reason.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                <strong>فائدة:</strong> تتبع أسباب الخسارة يساعدك على فهم نقاط الضعف وتحسين استراتيجية المبيعات
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                <MapPin className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">المناطق الجغرافية</h2>
              <p className="text-slate-600">نظّم عملاءك حسب المواقع الجغرافية</p>
            </div>

            <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-4">
              <div>
                <Label htmlFor="territoryEnabled" className="text-base font-medium text-navy">
                  تفعيل إدارة المناطق
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  تنظيم العملاء والحالات حسب المناطق الجغرافية
                </p>
              </div>
              <Switch
                id="territoryEnabled"
                checked={wizardData.territoryEnabled}
                onCheckedChange={(checked) => handleInputChange('territoryEnabled', checked)}
              />
            </div>

            {wizardData.territoryEnabled && (
              <div className="space-y-3">
                <h3 className="font-medium text-navy mb-3">المناطق المحددة مسبقاً (السعودية)</h3>
                {wizardData.territories.map((territory, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-xl p-3"
                    style={{ marginRight: `${territory.level * 20}px` }}
                  >
                    <div className="flex items-center gap-2">
                      {territory.isGroup && (
                        <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-navy text-sm">{territory.nameAr}</div>
                        <div className="text-xs text-slate-500">{territory.name}</div>
                      </div>
                      {territory.isGroup && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">مجموعة</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm text-indigo-800">
                <strong>نصيحة:</strong> يمكنك تخصيص الهيكل الهرمي للمناطق لاحقاً حسب تنظيم مكتبك
              </p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 mb-4">
                <Users className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">مجموعات العملاء</h2>
              <p className="text-slate-600">صنّف عملاءك إلى مجموعات لتحليل أفضل</p>
            </div>

            <div className="space-y-3">
              {wizardData.customerGroups.map((group, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-navy">{group.nameAr}</div>
                      <div className="text-sm text-slate-500">{group.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm text-teal-800">
                <strong>فائدة:</strong> مجموعات العملاء تساعدك على تخصيص الأسعار والخدمات لكل فئة
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                <UserCheck className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">فريق المبيعات</h2>
              <p className="text-slate-600">إعداد فريق المبيعات والعمولات</p>
            </div>

            <div className="flex items-center justify-between bg-pink-50 rounded-xl p-4">
              <div>
                <Label htmlFor="salesTeamEnabled" className="text-base font-medium text-navy">
                  تفعيل إدارة فريق المبيعات
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  تتبع أداء المحامين والعمولات
                </p>
              </div>
              <Switch
                id="salesTeamEnabled"
                checked={wizardData.salesTeamEnabled}
                onCheckedChange={(checked) => handleInputChange('salesTeamEnabled', checked)}
              />
            </div>

            {wizardData.salesTeamEnabled && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600 text-center">
                    سيتم إعداد أعضاء فريق المبيعات من خلال إعدادات CRM بعد إكمال المعالج
                  </p>
                </div>
              </div>
            )}

            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
              <p className="text-sm text-pink-800">
                <strong>ملاحظة:</strong> يمكنك إضافة المحامين والموظفين إلى فريق المبيعات وتحديد العمولات لاحقاً
              </p>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                <Calendar className="w-8 h-8 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات المواعيد</h2>
              <p className="text-slate-600">قم بإعداد نظام حجز الاستشارات</p>
            </div>

            <div className="flex items-center justify-between bg-cyan-50 rounded-xl p-4">
              <div>
                <Label htmlFor="appointmentEnabled" className="text-base font-medium text-navy">
                  تفعيل حجز المواعيد
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  السماح للعملاء بحجز استشارات
                </p>
              </div>
              <Switch
                id="appointmentEnabled"
                checked={wizardData.appointmentEnabled}
                onCheckedChange={(checked) => handleInputChange('appointmentEnabled', checked)}
              />
            </div>

            {wizardData.appointmentEnabled && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      مدة الموعد الافتراضية
                    </Label>
                    <select
                      value={wizardData.appointmentDuration}
                      onChange={(e) => handleInputChange('appointmentDuration', parseInt(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value={15}>15 دقيقة</option>
                      <option value={30}>30 دقيقة</option>
                      <option value={45}>45 دقيقة</option>
                      <option value={60}>60 دقيقة</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الحجز المسبق (أيام)
                    </Label>
                    <Input
                      type="number"
                      value={wizardData.advanceBookingDays}
                      onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value))}
                      className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">ساعات العمل</Label>
                  {Object.entries(wizardData.workingHours).map(([day, hours]) => {
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
                      <div key={day} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-3">
                        <Switch
                          checked={hours.enabled}
                          onCheckedChange={(checked) => {
                            handleInputChange('workingHours', {
                              ...wizardData.workingHours,
                              [day]: { ...hours, enabled: checked }
                            })
                          }}
                        />
                        <span className="w-20 text-sm font-medium text-navy">{dayNames[day]}</span>
                        {hours.enabled && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={hours.start}
                              onChange={(e) => {
                                handleInputChange('workingHours', {
                                  ...wizardData.workingHours,
                                  [day]: { ...hours, start: e.target.value }
                                })
                              }}
                              className="rounded-lg border-slate-200 text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <Input
                              type="time"
                              value={hours.end}
                              onChange={(e) => {
                                handleInputChange('workingHours', {
                                  ...wizardData.workingHours,
                                  [day]: { ...hours, end: e.target.value }
                                })
                              }}
                              className="rounded-lg border-slate-200 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <p className="text-sm text-cyan-800">
                <strong>نصيحة:</strong> يمكنك تخصيص ساعات العمل لكل محامي بشكل منفصل لاحقاً
              </p>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إعدادات التواصل</h2>
              <p className="text-slate-600">تتبع جميع التواصلات مع العملاء تلقائياً</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Label htmlFor="autoLogEmails" className="text-sm font-medium text-slate-700">
                      تسجيل البريد الإلكتروني تلقائياً
                    </Label>
                    <p className="text-xs text-slate-500">تسجيل جميع الرسائل الإلكترونية</p>
                  </div>
                </div>
                <Switch
                  id="autoLogEmails"
                  checked={wizardData.autoLogEmails}
                  onCheckedChange={(checked) => handleInputChange('autoLogEmails', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <Label htmlFor="autoLogCalls" className="text-sm font-medium text-slate-700">
                      تسجيل المكالمات تلقائياً
                    </Label>
                    <p className="text-xs text-slate-500">تسجيل جميع المكالمات الهاتفية</p>
                  </div>
                </div>
                <Switch
                  id="autoLogCalls"
                  checked={wizardData.autoLogCalls}
                  onCheckedChange={(checked) => handleInputChange('autoLogCalls', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <Label htmlFor="autoLogWhatsApp" className="text-sm font-medium text-slate-700">
                      تسجيل رسائل واتساب تلقائياً
                    </Label>
                    <p className="text-xs text-slate-500">تسجيل محادثات واتساب</p>
                  </div>
                </div>
                <Switch
                  id="autoLogWhatsApp"
                  checked={wizardData.autoLogWhatsApp}
                  onCheckedChange={(checked) => handleInputChange('autoLogWhatsApp', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div>
                  <Label htmlFor="carryForwardCommunication" className="text-sm font-medium text-slate-700">
                    نقل سجل التواصل
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    نسخ سجل التواصل عند الانتقال بين المراحل
                  </p>
                </div>
                <Switch
                  id="carryForwardCommunication"
                  checked={wizardData.carryForwardCommunication}
                  onCheckedChange={(checked) => handleInputChange('carryForwardCommunication', checked)}
                />
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
                <div>
                  <Label htmlFor="updateTimestampOnCommunication" className="text-sm font-medium text-slate-700">
                    تحديث الطابع الزمني
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    تحديث وقت آخر نشاط عند التواصل
                  </p>
                </div>
                <Switch
                  id="updateTimestampOnCommunication"
                  checked={wizardData.updateTimestampOnCommunication}
                  onCheckedChange={(checked) => handleInputChange('updateTimestampOnCommunication', checked)}
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>فائدة:</strong> التسجيل التلقائي يساعدك على تتبع جميع التواصلات دون عناء
              </p>
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
                <Hash className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">تسمية المستندات</h2>
              <p className="text-slate-600">حدد كيفية ترقيم وتسمية السجلات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="leadPrefix" className="text-sm font-medium text-slate-700">
                  بادئة العملاء المحتملين
                </Label>
                <Input
                  id="leadPrefix"
                  placeholder="LEAD"
                  value={wizardData.leadPrefix}
                  onChange={(e) => handleInputChange('leadPrefix', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500">مثال: {wizardData.leadPrefix}-2024-0001</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="casePrefix" className="text-sm font-medium text-slate-700">
                  بادئة الحالات
                </Label>
                <Input
                  id="casePrefix"
                  placeholder="CASE"
                  value={wizardData.casePrefix}
                  onChange={(e) => handleInputChange('casePrefix', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500">مثال: {wizardData.casePrefix}-2024-0001</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotePrefix" className="text-sm font-medium text-slate-700">
                  بادئة العروض
                </Label>
                <Input
                  id="quotePrefix"
                  placeholder="QT"
                  value={wizardData.quotePrefix}
                  onChange={(e) => handleInputChange('quotePrefix', e.target.value)}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500">مثال: {wizardData.quotePrefix}-2024-0001</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                تسمية الحملات
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('campaignNamingBy', 'name')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wizardData.campaignNamingBy === 'name'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy">بالاسم</h3>
                    {wizardData.campaignNamingBy === 'name' && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 text-right">
                    استخدام اسم الحملة مباشرة
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('campaignNamingBy', 'series')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wizardData.campaignNamingBy === 'series'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy">بالرقم التسلسلي</h3>
                    {wizardData.campaignNamingBy === 'series' && (
                      <Check className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 text-right">
                    ترقيم تلقائي للحملات
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-sm text-violet-800">
                <strong>ملاحظة:</strong> يمكنك تغيير هذه الإعدادات لاحقاً من إعدادات CRM
              </p>
            </div>
          </div>
        )

      case 11:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إنشاء أول عميل محتمل</h2>
              <p className="text-slate-600">أضف عميلك المحتمل الأول (اختياري)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                  الاسم الأول
                </Label>
                <Input
                  id="firstName"
                  placeholder="محمد"
                  value={wizardData.firstLead.firstName}
                  onChange={(e) => handleInputChange('firstLead', {
                    ...wizardData.firstLead,
                    firstName: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                  اسم العائلة
                </Label>
                <Input
                  id="lastName"
                  placeholder="أحمد"
                  value={wizardData.firstLead.lastName}
                  onChange={(e) => handleInputChange('firstLead', {
                    ...wizardData.firstLead,
                    lastName: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={wizardData.firstLead.email}
                  onChange={(e) => handleInputChange('firstLead', {
                    ...wizardData.firstLead,
                    email: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  رقم الجوال
                </Label>
                <Input
                  id="phone"
                  placeholder="+966 50 123 4567"
                  value={wizardData.firstLead.phone}
                  onChange={(e) => handleInputChange('firstLead', {
                    ...wizardData.firstLead,
                    phone: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-slate-700">
                  اسم الشركة (اختياري)
                </Label>
                <Input
                  id="companyName"
                  placeholder="اسم الشركة"
                  value={wizardData.firstLead.companyName}
                  onChange={(e) => handleInputChange('firstLead', {
                    ...wizardData.firstLead,
                    companyName: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                <strong>نصيحة:</strong> يمكنك تخطي هذه الخطوة وإضافة العملاء المحتملين لاحقاً
              </p>
            </div>
          </div>
        )

      case 12:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy mb-2">إنشاء أول حالة</h2>
              <p className="text-slate-600">أضف حالتك الأولى (اختياري)</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="caseTitle" className="text-sm font-medium text-slate-700">
                  عنوان الحالة
                </Label>
                <Input
                  id="caseTitle"
                  placeholder="مثال: قضية تجارية - نزاع عقد"
                  value={wizardData.firstCase.title}
                  onChange={(e) => handleInputChange('firstCase', {
                    ...wizardData.firstCase,
                    title: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseType" className="text-sm font-medium text-slate-700">
                  نوع الحالة
                </Label>
                <select
                  id="caseType"
                  value={wizardData.firstCase.caseType}
                  onChange={(e) => handleInputChange('firstCase', {
                    ...wizardData.firstCase,
                    caseType: e.target.value
                  })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">اختر نوع الحالة</option>
                  <option value="commercial">تجاري</option>
                  <option value="civil">مدني</option>
                  <option value="criminal">جنائي</option>
                  <option value="labor">عمالي</option>
                  <option value="family">أحوال شخصية</option>
                  <option value="administrative">إداري</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseDescription" className="text-sm font-medium text-slate-700">
                  الوصف (اختياري)
                </Label>
                <Textarea
                  id="caseDescription"
                  placeholder="وصف موجز للحالة..."
                  value={wizardData.firstCase.description}
                  onChange={(e) => handleInputChange('firstCase', {
                    ...wizardData.firstCase,
                    description: e.target.value
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedValue" className="text-sm font-medium text-slate-700">
                  القيمة التقديرية (ريال سعودي)
                </Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  placeholder="50000"
                  value={wizardData.firstCase.estimatedValue || ''}
                  onChange={(e) => handleInputChange('firstCase', {
                    ...wizardData.firstCase,
                    estimatedValue: parseFloat(e.target.value) || undefined
                  })}
                  className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>نصيحة:</strong> يمكنك تخطي هذه الخطوة وإضافة الحالات لاحقاً
              </p>
            </div>
          </div>
        )

      case 13:
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
              {/* CRM Settings Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <CardTitle>إعدادات CRM</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">تفعيل CRM:</span>
                      <span className="font-medium">{wizardData.crmEnabled ? 'مفعّل' : 'غير مفعّل'}</span>
                    </div>
                    {wizardData.industry && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">مجال العمل:</span>
                        <span className="font-medium">{wizardData.industry}</span>
                      </div>
                    )}
                    {wizardData.companySize && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">حجم المكتب:</span>
                        <span className="font-medium">{wizardData.companySize} موظف</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Sources Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-500" />
                      <CardTitle>مصادر العملاء المحتملين</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(2)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {wizardData.leadSources.filter(s => s.enabled).map((source, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                        {source.nameAr}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sales Stages Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-5 h-5 text-purple-500" />
                      <CardTitle>مراحل المبيعات</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {wizardData.salesStages.map((stage, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: stage.color }}
                        >
                          {stage.order}
                        </div>
                        {index < wizardData.salesStages.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Territories Summary */}
              {wizardData.territoryEnabled && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-indigo-500" />
                        <CardTitle>المناطق الجغرافية</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => goToStep(5)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">عدد المناطق:</span>
                        <span className="font-medium">{wizardData.territories.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appointments Summary */}
              {wizardData.appointmentEnabled && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-cyan-500" />
                        <CardTitle>المواعيد</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => goToStep(8)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">مدة الموعد:</span>
                        <span className="font-medium">{wizardData.appointmentDuration} دقيقة</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">الحجز المسبق:</span>
                        <span className="font-medium">{wizardData.advanceBookingDays} يوم</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Naming Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-violet-500" />
                      <CardTitle>التسمية</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => goToStep(10)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">العملاء المحتملين:</span>
                      <span className="font-medium">{wizardData.leadPrefix}-2024-0001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">الحالات:</span>
                      <span className="font-medium">{wizardData.casePrefix}-2024-0001</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">العروض:</span>
                      <span className="font-medium">{wizardData.quotePrefix}-2024-0001</span>
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
                    لقد أكملت جميع الإعدادات الأساسية لنظام CRM. عند النقر على "إكمال الإعداد"، سيتم تطبيق جميع الإعدادات وسيكون نظام CRM جاهزاً للاستخدام.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إنشاء مصادر العملاء المحتملين</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إعداد مراحل المبيعات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تكوين المناطق الجغرافية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>إعداد نظام المواعيد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تفعيل التسجيل التلقائي للتواصلات</span>
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
