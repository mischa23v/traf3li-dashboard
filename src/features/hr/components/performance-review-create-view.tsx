import { HRSidebar } from './hr-sidebar'
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { useNavigate } from '@tanstack/react-router'
import { useCreatePerformanceReview, useReviewTemplates } from '@/hooks/usePerformanceReviews'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search, Bell, ArrowRight, User, Building, Users, Briefcase,
  Calendar, ChevronDown, FileText, Star, Target, Plus, Trash2,
  Info, CheckCircle, BarChart3, UserCheck, MessageCircle, Scale
} from 'lucide-react'
import type { ReviewType } from '@/services/performanceReviewService'

// Office types
const OFFICE_TYPES = [
  {
    id: 'solo',
    icon: User,
    title: 'فردي',
    titleEn: 'Solo',
    description: 'محامي مستقل',
    fields: ['basic', 'goals'],
  },
  {
    id: 'small',
    icon: Building,
    title: 'مكتب صغير',
    titleEn: 'Small Office',
    description: '2-5 موظفين',
    fields: ['basic', 'goals', 'competencies'],
  },
  {
    id: 'medium',
    icon: Users,
    title: 'مكتب متوسط',
    titleEn: 'Medium Office',
    description: '6-20 موظف',
    fields: ['basic', 'goals', 'competencies', 'kpis', 'feedback360'],
  },
  {
    id: 'firm',
    icon: Briefcase,
    title: 'شركة محاماة',
    titleEn: 'Law Firm',
    description: '20+ موظف',
    fields: ['basic', 'goals', 'competencies', 'kpis', 'feedback360', 'attorneyMetrics', 'calibration'],
  },
]

// Review types
const REVIEW_TYPES: Array<{ value: ReviewType; label: string; description: string }> = [
  { value: 'annual', label: 'سنوي', description: 'تقييم سنوي شامل' },
  { value: 'mid_year', label: 'نصف سنوي', description: 'مراجعة منتصف العام' },
  { value: 'quarterly', label: 'ربع سنوي', description: 'تقييم ربع سنوي' },
  { value: 'probation', label: 'فترة التجربة', description: 'تقييم نهاية فترة التجربة' },
  { value: 'project', label: 'مشروع', description: 'تقييم بعد انتهاء مشروع' },
  { value: 'ad_hoc', label: 'استثنائي', description: 'تقييم استثنائي' },
]

// Default competencies
const DEFAULT_COMPETENCIES = [
  { id: 'comm', name: 'التواصل', nameAr: 'التواصل', category: 'core' as const },
  { id: 'teamwork', name: 'العمل الجماعي', nameAr: 'العمل الجماعي', category: 'core' as const },
  { id: 'problem', name: 'حل المشكلات', nameAr: 'حل المشكلات', category: 'core' as const },
  { id: 'quality', name: 'جودة العمل', nameAr: 'جودة العمل', category: 'core' as const },
  { id: 'legal', name: 'المعرفة القانونية', nameAr: 'المعرفة القانونية', category: 'legal' as const },
  { id: 'client', name: 'خدمة العملاء', nameAr: 'خدمة العملاء', category: 'client_service' as const },
]

export function PerformanceReviewCreateView() {
  const navigate = useNavigate()
  const createMutation = useCreatePerformanceReview()
  const { data: templates } = useReviewTemplates()

  // Form state
  const [officeType, setOfficeType] = useState<string>('medium')
  const [reviewType, setReviewType] = useState<ReviewType>('annual')

  // Basic fields
  const [employeeId, setEmployeeId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selfAssessmentDueDate, setSelfAssessmentDueDate] = useState('')

  // Goals
  const [goals, setGoals] = useState<Array<{ title: string; titleAr: string; description: string; targetMetric: string; weight: number }>>([])
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalDescription, setNewGoalDescription] = useState('')
  const [newGoalTarget, setNewGoalTarget] = useState('')
  const [newGoalWeight, setNewGoalWeight] = useState(20)

  // KPIs
  const [kpis, setKpis] = useState<Array<{ name: string; nameAr: string; target: number; unit: string; weight: number }>>([])
  const [newKpiName, setNewKpiName] = useState('')
  const [newKpiTarget, setNewKpiTarget] = useState('')
  const [newKpiUnit, setNewKpiUnit] = useState('')
  const [newKpiWeight, setNewKpiWeight] = useState(10)

  // 360 Feedback
  const [include360Feedback, setInclude360Feedback] = useState(false)
  const [feedbackProviders, setFeedbackProviders] = useState<Array<{ providerId: string; providerName: string; relationship: string }>>([])

  // Attorney metrics
  const [isAttorney, setIsAttorney] = useState(false)

  // Advanced sections
  const [isGoalsOpen, setIsGoalsOpen] = useState(true)
  const [isCompetenciesOpen, setIsCompetenciesOpen] = useState(false)
  const [isKpisOpen, setIsKpisOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isAttorneyMetricsOpen, setIsAttorneyMetricsOpen] = useState(false)

  // Selected competencies
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(['comm', 'teamwork', 'quality'])

  const selectedOffice = OFFICE_TYPES.find((o) => o.id === officeType)
  const hasField = (field: string) => selectedOffice?.fields.includes(field)

  // Add goal
  const addGoal = () => {
    if (!newGoalTitle) return
    setGoals([...goals, {
      title: newGoalTitle,
      titleAr: newGoalTitle,
      description: newGoalDescription,
      targetMetric: newGoalTarget,
      weight: newGoalWeight,
    }])
    setNewGoalTitle('')
    setNewGoalDescription('')
    setNewGoalTarget('')
    setNewGoalWeight(20)
  }

  // Remove goal
  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index))
  }

  // Add KPI
  const addKpi = () => {
    if (!newKpiName || !newKpiTarget) return
    setKpis([...kpis, {
      name: newKpiName,
      nameAr: newKpiName,
      target: parseFloat(newKpiTarget),
      unit: newKpiUnit,
      weight: newKpiWeight,
    }])
    setNewKpiName('')
    setNewKpiTarget('')
    setNewKpiUnit('')
    setNewKpiWeight(10)
  }

  // Remove KPI
  const removeKpi = (index: number) => {
    setKpis(kpis.filter((_, i) => i !== index))
  }

  // Toggle competency
  const toggleCompetency = (compId: string) => {
    if (selectedCompetencies.includes(compId)) {
      setSelectedCompetencies(selectedCompetencies.filter(id => id !== compId))
    } else {
      setSelectedCompetencies([...selectedCompetencies, compId])
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        employeeId,
        reviewType,
        reviewPeriod: {
          startDate,
          endDate,
          reviewDueDate: dueDate,
          selfAssessmentDueDate,
        },
        templateId: templateId || undefined,
        goals: goals.map(g => ({
          title: g.title,
          titleAr: g.titleAr,
          description: g.description,
          targetMetric: g.targetMetric,
          weight: g.weight,
          comments: '',
          evidence: [],
        })),
        kpis: kpis.map(k => ({
          name: k.name,
          nameAr: k.nameAr,
          target: k.target,
          unit: k.unit,
          weight: k.weight,
        })),
        include360Feedback,
        feedbackProviders: include360Feedback ? feedbackProviders.map(p => ({
          providerId: p.providerId,
          providerName: p.providerName,
          providerNameAr: p.providerName,
          relationship: p.relationship as 'peer' | 'subordinate' | 'client' | 'cross_functional',
        })) : undefined,
      })
      navigate({ to: '/dashboard/hr/performance' })
    } catch {
      // Error is handled by mutation's onError callback
    }
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الموظفين', href: '/dashboard/hr/employees', isActive: false },
    { title: 'تقييم الأداء', href: '/dashboard/hr/performance', isActive: true },
  ]

  return (
    <>
      {/* Header */}
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
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

        {/* HERO CARD */}
        <ProductivityHero badge="الموارد البشرية" title="تقييم أداء جديد" type="performance" />

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* MAIN FORM CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">

              {/* Office Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {OFFICE_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = officeType === type.id
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-transparent bg-white hover:border-emerald-200'
                } rounded-2xl`}
                onClick={() => setOfficeType(type.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-navy'}`}>
                    {type.title}
                  </h3>
                  <p className="text-sm text-slate-500">{type.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Review Type */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-600" />
              نوع التقييم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {REVIEW_TYPES.map((type) => {
                const isSelected = reviewType === type.value
                return (
                  <button
                    key={type.value}
                    onClick={() => setReviewType(type.value)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <span className={`font-bold block ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {type.label}
                    </span>
                    <span className="text-xs text-slate-500">{type.description}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Employee & Period */}
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              معلومات الموظف وفترة التقييم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="startDate">بداية الفترة *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">نهاية الفترة *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="selfAssessmentDueDate">موعد التقييم الذاتي</Label>
                <Input
                  id="selfAssessmentDueDate"
                  type="date"
                  value={selfAssessmentDueDate}
                  onChange={(e) => setSelfAssessmentDueDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              {templates && templates.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="templateId">قالب التقييم</Label>
                  <Select value={templateId} onValueChange={setTemplateId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="اختر قالب (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.nameAr || template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Goals Section */}
        {hasField('goals') && (
          <Collapsible open={isGoalsOpen} onOpenChange={setIsGoalsOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      الأهداف
                      {goals.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {goals.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isGoalsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {/* Existing Goals */}
                  {goals.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {goals.map((goal, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-navy">{goal.title}</span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                {goal.weight}%
                              </span>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-slate-500 mt-1">{goal.description}</p>
                            )}
                            {goal.targetMetric && (
                              <p className="text-sm text-emerald-600 mt-1">الهدف: {goal.targetMetric}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGoal(index)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Goal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="goalTitle">عنوان الهدف</Label>
                      <Input
                        id="goalTitle"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="مثال: زيادة عدد القضايا الناجحة"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalTarget">مقياس الهدف</Label>
                      <Input
                        id="goalTarget"
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        placeholder="مثال: 20 قضية ناجحة"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="goalDescription">وصف الهدف</Label>
                      <Textarea
                        id="goalDescription"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        placeholder="وصف تفصيلي للهدف..."
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalWeight">الوزن (%)</Label>
                      <Input
                        id="goalWeight"
                        type="number"
                        min={5}
                        max={100}
                        value={newGoalWeight}
                        onChange={(e) => setNewGoalWeight(parseInt(e.target.value) || 0)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={addGoal}
                        disabled={!newGoalTitle}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                      >
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        إضافة هدف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Competencies Section */}
        {hasField('competencies') && (
          <Collapsible open={isCompetenciesOpen} onOpenChange={setIsCompetenciesOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      الكفاءات
                      {selectedCompetencies.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {selectedCompetencies.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isCompetenciesOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_COMPETENCIES.map((comp) => {
                      const isSelected = selectedCompetencies.includes(comp.id)
                      return (
                        <button
                          key={comp.id}
                          onClick={() => toggleCompetency(comp.id)}
                          className={`p-3 rounded-xl border-2 transition-all text-end ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-200 hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {comp.nameAr}
                            </span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <span className={`text-xs ${
                            comp.category === 'core' ? 'text-blue-600' :
                            comp.category === 'legal' ? 'text-purple-600' :
                            'text-amber-600'
                          }`}>
                            {comp.category === 'core' ? 'أساسية' :
                             comp.category === 'legal' ? 'قانونية' :
                             'خدمة العملاء'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* KPIs Section */}
        {hasField('kpis') && (
          <Collapsible open={isKpisOpen} onOpenChange={setIsKpisOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      مؤشرات الأداء الرئيسية (KPIs)
                      {kpis.length > 0 && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                          {kpis.length}
                        </span>
                      )}
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isKpisOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  {/* Existing KPIs */}
                  {kpis.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {kpis.map((kpi, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-navy">{kpi.name}</span>
                            <span className="text-emerald-600">الهدف: {kpi.target} {kpi.unit}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                              {kpi.weight}%
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKpi(index)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New KPI */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="space-y-2">
                      <Label htmlFor="kpiName">اسم المؤشر</Label>
                      <Input
                        id="kpiName"
                        value={newKpiName}
                        onChange={(e) => setNewKpiName(e.target.value)}
                        placeholder="مثال: نسبة القضايا الناجحة"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kpiTarget">الهدف</Label>
                      <Input
                        id="kpiTarget"
                        type="number"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        placeholder="85"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kpiUnit">الوحدة</Label>
                      <Input
                        id="kpiUnit"
                        value={newKpiUnit}
                        onChange={(e) => setNewKpiUnit(e.target.value)}
                        placeholder="%"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kpiWeight">الوزن (%)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="kpiWeight"
                          type="number"
                          min={5}
                          max={100}
                          value={newKpiWeight}
                          onChange={(e) => setNewKpiWeight(parseInt(e.target.value) || 0)}
                          className="rounded-xl"
                        />
                        <Button
                          onClick={addKpi}
                          disabled={!newKpiName || !newKpiTarget}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                        >
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* 360 Feedback Section */}
        {hasField('feedback360') && (
          <Collapsible open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      تقييم 360 درجة
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isFeedbackOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">تفعيل تقييم 360 درجة</p>
                      <p className="text-sm text-slate-500">
                        جمع تقييمات من الزملاء والمرؤوسين والعملاء
                      </p>
                    </div>
                    <Switch
                      checked={include360Feedback}
                      onCheckedChange={setInclude360Feedback}
                    />
                  </div>
                  {include360Feedback && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-700">
                        <Info className="w-4 h-4 inline ms-1" aria-hidden="true" />
                        يمكنك إضافة مقدمي التقييم بعد إنشاء التقييم
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Attorney Metrics Section */}
        {hasField('attorneyMetrics') && (
          <Collapsible open={isAttorneyMetricsOpen} onOpenChange={setIsAttorneyMetricsOpen}>
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      مقاييس المحامين
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isAttorneyMetricsOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-navy">الموظف محامي</p>
                      <p className="text-sm text-slate-500">
                        تفعيل مقاييس خاصة بأداء المحامين (القضايا، الفواتير، جودة العمل القانوني)
                      </p>
                    </div>
                    <Switch
                      checked={isAttorney}
                      onCheckedChange={setIsAttorney}
                    />
                  </div>
                  {isAttorney && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-700">
                        <Info className="w-4 h-4 inline ms-1" aria-hidden="true" />
                        سيتم تضمين مقاييس: أداء القضايا، ساعات الفوترة، جودة العمل القانوني، تطوير الممارسة
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Saudi Labor Law Info */}
        <Card className="border-none shadow-sm bg-blue-50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="font-bold text-blue-800 mb-1">نظام العمل السعودي - تقييم الأداء</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• المادة 80: يجب أن يكون التقييم موضوعياً ومبنياً على معايير واضحة</li>
                  <li>• المادة 81: يحق للموظف الاطلاع على نتائج تقييمه والاعتراض عليها</li>
                  <li>• التقييم يجب أن يكون دورياً ومنتظماً ويتضمن فرصاً للتطوير</li>
                  <li>• يجب توثيق جميع التقييمات والاحتفاظ بها في ملف الموظف</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard/hr/performance' })}
                  className="rounded-xl"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!employeeId || !endDate || !dueDate || createMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 shadow-lg shadow-emerald-500/20"
                >
                  {createMutation.isPending ? (
                    <>جاري الإنشاء...</>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ms-2" />
                      إنشاء التقييم
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <HRSidebar context="evaluations" />
        </div>
      </Main>
    </>
  )
}
