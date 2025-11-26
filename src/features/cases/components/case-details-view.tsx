import { useState, useMemo } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Calendar,
  Clock,
  MoreHorizontal,
  Plus,
  Upload,
  User,
  AlertCircle,
  CheckCircle2,
  Scale,
  Building,
  Phone,
  ArrowLeft,
  Gavel,
  Shield,
  Briefcase,
  FileCheck,
  AlertTriangle,
  Download,
  Eye,
  History,
  Bell,
  MapPin,
  DollarSign,
  Search,
  Edit,
  Trash2,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  useCase,
  useAddCaseNote,
  useAddCaseHearing,
  useUpdateCaseStatus,
} from '@/hooks/useCasesAndClients'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type {
  Case,
  CaseStatus,
  CaseCategory,
  ClientRef,
  LawyerRef,
  CaseDocument,
  CaseHearing,
  CaseNote,
  Claim,
  TimelineEvent,
} from '@/services/casesService'

// Helper functions
const getClientName = (c: Case): string => {
  if (c.clientName) return c.clientName
  if (c.clientId && typeof c.clientId === 'object') {
    const client = c.clientId as ClientRef
    return client.name || client.firstName || client.username || 'غير محدد'
  }
  return 'غير محدد'
}

const getLawyerName = (c: Case): string => {
  if (c.lawyerId && typeof c.lawyerId === 'object') {
    const lawyer = c.lawyerId as LawyerRef
    if (lawyer.firstName && lawyer.lastName) {
      return `${lawyer.firstName} ${lawyer.lastName}`
    }
    return lawyer.username || 'غير محدد'
  }
  return 'غير محدد'
}

const getDefendantName = (c: Case): string => {
  if (c.laborCaseDetails?.company?.name) return c.laborCaseDetails.company.name
  return 'غير محدد'
}

export function CaseDetailsView() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false)
  const [hearingDate, setHearingDate] = useState('')
  const [hearingLocation, setHearingLocation] = useState('')
  const [hearingNotes, setHearingNotes] = useState('')

  const { caseId } = useParams({ strict: false }) as { caseId: string }

  const { data: caseData, isLoading, isError, error, refetch } = useCase(caseId)
  const addNoteMutation = useAddCaseNote()
  const addHearingMutation = useAddCaseHearing()
  const updateStatusMutation = useUpdateCaseStatus()

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.cases', 'القضايا'), href: '/dashboard/cases', isActive: true },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('cases.notSpecified', 'غير محدد')
    return new Date(dateString).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return t('cases.notSpecified', 'غير محدد')
    return new Date(dateString).toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusLabel = (status: CaseStatus): string => {
    const labels: Record<CaseStatus, string> = {
      active: t('cases.status.active', 'نشطة'),
      closed: t('cases.status.closed', 'مغلقة'),
      appeal: t('cases.status.appeal', 'استئناف'),
      settlement: t('cases.status.settlement', 'تسوية'),
      'on-hold': t('cases.status.onHold', 'معلقة'),
      completed: t('cases.status.completed', 'مكتملة'),
      won: t('cases.status.won', 'فائزة'),
      lost: t('cases.status.lost', 'خاسرة'),
      settled: t('cases.status.settled', 'تمت التسوية'),
    }
    return labels[status] || status
  }

  const getCategoryLabel = (category: CaseCategory): string => {
    const labels: Record<CaseCategory, string> = {
      labor: t('cases.category.labor', 'عمالية'),
      commercial: t('cases.category.commercial', 'تجارية'),
      civil: t('cases.category.civil', 'مدنية'),
      criminal: t('cases.category.criminal', 'جنائية'),
      family: t('cases.category.family', 'أحوال شخصية'),
      administrative: t('cases.category.administrative', 'إدارية'),
      other: t('cases.category.other', 'أخرى'),
    }
    return labels[category] || category
  }

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500'
      case 'settlement':
      case 'settled':
        return 'bg-amber-500'
      case 'appeal':
        return 'bg-purple-500'
      case 'closed':
      case 'completed':
        return 'bg-green-500'
      case 'won':
        return 'bg-emerald-500'
      case 'lost':
        return 'bg-red-500'
      case 'on-hold':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    await addNoteMutation.mutateAsync({
      id: caseId,
      data: { text: noteText },
    })
    setNoteText('')
    setIsAddNoteOpen(false)
  }

  const handleAddHearing = async () => {
    if (!hearingDate || !hearingLocation) return
    await addHearingMutation.mutateAsync({
      id: caseId,
      data: {
        date: hearingDate,
        location: hearingLocation,
        notes: hearingNotes,
      },
    })
    setHearingDate('')
    setHearingLocation('')
    setHearingNotes('')
    setIsAddHearingOpen(false)
  }

  const handleStatusChange = async (status: CaseStatus) => {
    await updateStatusMutation.mutateAsync({ id: caseId, status })
  }

  // Calculate total claims amount
  const totalClaimsAmount = useMemo(() => {
    if (!caseData?.claims) return 0
    return caseData.claims.reduce((sum, claim) => sum + claim.amount, 0)
  }, [caseData])

  // Calculate days until next hearing
  const daysUntilHearing = useMemo(() => {
    if (!caseData?.nextHearing) return null
    const diff = new Date(caseData.nextHearing).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [caseData])

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

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
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

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="bg-navy rounded-3xl p-8">
              <Skeleton className="h-8 w-3/4 mb-4 bg-white/20" />
              <Skeleton className="h-6 w-1/2 bg-white/20" />
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <span>
                  {t('cases.loadError', 'حدث خطأ أثناء تحميل القضية')}: {error?.message || t('common.unknownError', 'خطأ غير معروف')}
                </span>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  {t('common.retry', 'إعادة المحاولة')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !caseData && (
          <div className="text-center py-12 bg-white rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Briefcase className="h-8 w-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-navy mb-2">{t('cases.notFound', 'لم يتم العثور على القضية')}</h4>
            <p className="text-slate-500 mb-4">{t('cases.notFoundDescription', 'القضية المطلوبة غير موجودة أو تم حذفها')}</p>
            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
              <Link to="/dashboard/cases">
                <ArrowLeft className="ml-2 h-4 w-4" />
                {t('cases.backToCases', 'العودة إلى القضايا')}
              </Link>
            </Button>
          </div>
        )}

        {/* Success State - Case Data */}
        {!isLoading && !isError && caseData && (
          <>
            {/* HERO BANNER */}
            <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link to="/dashboard/cases">
                      <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 rounded-full h-8 w-8 p-0 mr-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                      <Scale className="h-4 w-4 text-brand-blue" />
                    </div>
                    <span className="text-blue-200 font-medium">{getCategoryLabel(caseData.category)}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-slate-300">{caseData.court || t('cases.notSpecified', 'غير محدد')}</span>
                    <span
                      className={`px-3 py-1 ${getStatusColor(caseData.status)} text-white rounded-full text-xs font-medium`}
                    >
                      {getStatusLabel(caseData.status)}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{caseData.title}</h1>
                  <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                    {caseData.judge && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>{t('cases.judge', 'القاضي')}: {caseData.judge}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{t('cases.startDate', 'تاريخ البدء')}: {formatDate(caseData.startDate)}</span>
                    </div>
                    {caseData.nextHearing && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-100 font-bold">
                          {t('cases.nextHearing', 'الجلسة القادمة')}: {formatDate(caseData.nextHearing)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Card in Hero */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[300px]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300">{t('cases.progress', 'نسبة الإنجاز')}</span>
                    <span className="text-2xl font-bold text-brand-blue">{caseData.progress}%</span>
                  </div>
                  <Progress
                    value={caseData.progress}
                    className="h-2 bg-white/10 mb-6"
                    indicatorClassName="bg-brand-blue"
                  />
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div className="text-center flex-1">
                      <div className="text-xs text-slate-400 mb-1">{t('cases.claimAmount', 'المطالبة')}</div>
                      <div className="font-bold text-lg">{formatCurrency(caseData.claimAmount)} {t('common.sar', 'ر.س')}</div>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div className="text-center flex-1">
                      <div className="text-xs text-slate-400 mb-1">{t('cases.expectedWin', 'المتوقع')}</div>
                      <div className="font-bold text-lg text-emerald-400">{formatCurrency(caseData.expectedWinAmount)} {t('common.sar', 'ر.س')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT SIDEBAR */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Timeline Card */}
                <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                  <div className="bg-navy p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue blur-[40px] opacity-30"></div>
                    <h3 className="text-lg font-bold relative z-10 mb-1 flex items-center gap-2">
                      <History className="h-5 w-5 text-brand-blue" />
                      {t('cases.timeline', 'الجدول الزمني')}
                    </h3>
                  </div>
                  <CardContent className="p-0 flex-1 bg-slate-50/50">
                    <ScrollArea className="h-[350px] p-6">
                      <div className="relative">
                        <div className="absolute top-2 bottom-2 right-[5px] w-0.5 bg-slate-200"></div>
                        <div className="space-y-6 relative">
                          {caseData.timeline && caseData.timeline.length > 0 ? (
                            caseData.timeline.map((event: TimelineEvent, i: number) => (
                              <div key={i} className="flex gap-4 relative">
                                <div
                                  className={`
                                    w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white shrink-0
                                    ${event.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}
                                  `}
                                ></div>
                                <div className="flex-1">
                                  <div className="text-sm font-bold text-navy">{event.event}</div>
                                  <div className="text-xs text-slate-500 mb-1">{formatShortDate(event.date)}</div>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 h-5 bg-white border-slate-200 text-slate-600"
                                  >
                                    {event.type === 'court'
                                      ? t('cases.eventType.court', 'جلسة')
                                      : event.type === 'filing'
                                        ? t('cases.eventType.filing', 'تقديم')
                                        : event.type === 'deadline'
                                          ? t('cases.eventType.deadline', 'موعد نهائي')
                                          : t('cases.eventType.general', 'عام')}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-400">
                              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">{t('cases.noTimeline', 'لا توجد أحداث')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Parties Card */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-navy">{t('cases.parties', 'أطراف القضية')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {/* Plaintiff */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        {getClientName(caseData).charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-navy">{getClientName(caseData)}</div>
                        <div className="text-xs text-green-600 font-medium">{t('cases.plaintiff', 'المدعي')} ({t('cases.ourClient', 'موكلنا')})</div>
                        {caseData.clientPhone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Phone className="h-3 w-3" />
                            {caseData.clientPhone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Defendant */}
                    {(caseData.laborCaseDetails?.company || getDefendantName(caseData) !== 'غير محدد') && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                          {getDefendantName(caseData).charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-navy">{getDefendantName(caseData)}</div>
                          <div className="text-xs text-amber-600 font-medium">{t('cases.defendant', 'المدعى عليه')}</div>
                          {caseData.laborCaseDetails?.company?.registrationNumber && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Building className="h-3 w-3" />
                              {t('cases.crNumber', 'س.ت')}: {caseData.laborCaseDetails.company.registrationNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg rounded-2xl bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-navy">{t('cases.quickActions', 'إجراءات سريعة')}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <Select value={caseData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('cases.changeStatus', 'تغيير الحالة')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('cases.status.active', 'نشطة')}</SelectItem>
                        <SelectItem value="on-hold">{t('cases.status.onHold', 'معلقة')}</SelectItem>
                        <SelectItem value="appeal">{t('cases.status.appeal', 'استئناف')}</SelectItem>
                        <SelectItem value="settlement">{t('cases.status.settlement', 'تسوية')}</SelectItem>
                        <SelectItem value="closed">{t('cases.status.closed', 'مغلقة')}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="h-4 w-4 ml-2" />
                          {t('cases.addNote', 'إضافة ملاحظة')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('cases.addNote', 'إضافة ملاحظة')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder={t('cases.notePlaceholder', 'اكتب ملاحظتك هنا...')}
                            rows={4}
                          />
                          <Button
                            onClick={handleAddNote}
                            disabled={addNoteMutation.isPending}
                            className="w-full bg-brand-blue"
                          >
                            {addNoteMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                            {t('common.add', 'إضافة')}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>

              {/* CENTER CONTENT (Tabs & Details) */}
              <div className="lg:col-span-9 flex flex-col gap-6">
                {/* Tabs Toolbar */}
                <div className="bg-white p-2 rounded-[20px] border border-slate-100 shadow-sm overflow-x-auto">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-slate-50 p-1 rounded-xl h-auto w-full justify-start gap-2">
                      {['overview', 'hearings', 'documents', 'claims', 'notes'].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="
                            rounded-lg px-6 py-2 text-sm font-bold transition-all
                            data-[state=active]:bg-white data-[state=active]:text-brand-blue data-[state=active]:shadow-sm
                            text-slate-500 hover:text-navy
                          "
                        >
                          {tab === 'overview'
                            ? t('cases.tabs.overview', 'نظرة عامة')
                            : tab === 'hearings'
                              ? t('cases.tabs.hearings', 'الجلسات')
                              : tab === 'documents'
                                ? t('cases.tabs.documents', 'المستندات')
                                : tab === 'claims'
                                  ? t('cases.tabs.claims', 'المطالبات')
                                  : t('cases.tabs.notes', 'الملاحظات')}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Tab Content Area */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 min-h-[500px]">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue">
                            <Gavel className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">{t('cases.caseStatus', 'حالة القضية')}</div>
                            <div className="font-bold text-navy">{getStatusLabel(caseData.status)}</div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Shield className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">{t('cases.outcome', 'النتيجة')}</div>
                            <div className="font-bold text-navy">
                              {caseData.outcome === 'ongoing'
                                ? t('cases.outcomeValues.ongoing', 'جارية')
                                : caseData.outcome === 'won'
                                  ? t('cases.outcomeValues.won', 'فائزة')
                                  : caseData.outcome === 'lost'
                                    ? t('cases.outcomeValues.lost', 'خاسرة')
                                    : t('cases.outcomeValues.settled', 'تسوية')}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <AlertTriangle className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-slate-500">{t('cases.nextHearing', 'الجلسة القادمة')}</div>
                            <div className="font-bold text-navy">
                              {daysUntilHearing !== null ? (
                                daysUntilHearing > 0 ? (
                                  <span>{t('cases.inDays', 'بعد {{days}} أيام', { days: daysUntilHearing })}</span>
                                ) : daysUntilHearing === 0 ? (
                                  <span className="text-red-600">{t('cases.today', 'اليوم')}</span>
                                ) : (
                                  <span className="text-slate-400">{t('cases.passed', 'انتهت')}</span>
                                )
                              ) : (
                                t('cases.notSpecified', 'غير محدد')
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {caseData.description && (
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <h4 className="font-bold text-navy mb-3">{t('cases.description', 'وصف القضية')}</h4>
                          <p className="text-slate-600 leading-relaxed">{caseData.description}</p>
                        </div>
                      )}

                      {/* Case Info */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-navy mb-4">{t('cases.caseInfo', 'معلومات القضية')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-slate-500 mb-1">{t('cases.caseNumber', 'رقم القضية')}</div>
                            <div className="font-bold text-navy">{caseData.caseNumber || t('cases.notSpecified', 'غير محدد')}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500 mb-1">{t('cases.court', 'المحكمة')}</div>
                            <div className="font-bold text-navy">{caseData.court || t('cases.notSpecified', 'غير محدد')}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500 mb-1">{t('cases.judge', 'القاضي')}</div>
                            <div className="font-bold text-navy">{caseData.judge || t('cases.notSpecified', 'غير محدد')}</div>
                          </div>
                          <div>
                            <div className="text-sm text-slate-500 mb-1">{t('cases.lawyer', 'المحامي')}</div>
                            <div className="font-bold text-navy">{getLawyerName(caseData)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hearings Tab */}
                  {activeTab === 'hearings' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-navy">{t('cases.hearings', 'الجلسات')}</h3>
                        <Dialog open={isAddHearingOpen} onOpenChange={setIsAddHearingOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-brand-blue hover:bg-blue-600 text-white">
                              <Plus className="h-4 w-4 ml-2" />
                              {t('cases.addHearing', 'إضافة جلسة')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('cases.addHearing', 'إضافة جلسة')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>{t('cases.hearingDate', 'تاريخ الجلسة')} *</Label>
                                <Input
                                  type="datetime-local"
                                  value={hearingDate}
                                  onChange={(e) => setHearingDate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('cases.hearingLocation', 'المكان')} *</Label>
                                <Input
                                  value={hearingLocation}
                                  onChange={(e) => setHearingLocation(e.target.value)}
                                  placeholder={t('cases.hearingLocationPlaceholder', 'المحكمة العمالية - قاعة 5')}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t('cases.hearingNotes', 'ملاحظات')}</Label>
                                <Textarea
                                  value={hearingNotes}
                                  onChange={(e) => setHearingNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <Button
                                onClick={handleAddHearing}
                                disabled={addHearingMutation.isPending || !hearingDate || !hearingLocation}
                                className="w-full bg-brand-blue"
                              >
                                {addHearingMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                                {t('common.add', 'إضافة')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {caseData.hearings && caseData.hearings.length > 0 ? (
                        caseData.hearings.map((hearing: CaseHearing, i: number) => (
                          <div
                            key={i}
                            className={`rounded-2xl p-6 border ${
                              new Date(hearing.date) > new Date()
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-slate-50 border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={
                                      new Date(hearing.date) > new Date()
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-0'
                                        : 'bg-slate-400 text-white border-0'
                                    }
                                  >
                                    {new Date(hearing.date) > new Date()
                                      ? t('cases.upcoming', 'قادمة')
                                      : hearing.attended
                                        ? t('cases.attended', 'حضور')
                                        : t('cases.missed', 'فائتة')}
                                  </Badge>
                                </div>
                                <h4 className="text-lg font-bold text-navy mb-1">{hearing.location}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span>{formatDate(hearing.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span>
                                      {new Date(hearing.date).toLocaleTimeString('ar-SA', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {hearing.notes && (
                                  <p className="text-sm text-slate-500 mt-2">{hearing.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t('cases.noHearings', 'لا توجد جلسات مسجلة')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Documents Tab */}
                  {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Upload New Card */}
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-all group h-[180px]">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-brand-blue mb-3 transition-colors">
                          <Upload className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-slate-600 group-hover:text-brand-blue">
                          {t('cases.uploadDocument', 'رفع مستند جديد')}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG</span>
                      </div>

                      {caseData.documents && caseData.documents.length > 0 ? (
                        caseData.documents.map((doc: CaseDocument, i: number) => (
                          <div
                            key={i}
                            className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                {doc.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 ml-2" /> {t('common.preview', 'معاينة')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 ml-2" /> {t('common.download', 'تحميل')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div>
                              <h4 className="font-bold text-navy text-sm mb-1 line-clamp-1" title={doc.filename}>
                                {doc.filename}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{(doc.size / 1024).toFixed(0)} KB</span>
                                <span>•</span>
                                <span>{formatShortDate(doc.uploadedAt)}</span>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-slate-200 flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-white border-slate-200 hover:bg-slate-50">
                                {t('common.preview', 'معاينة')}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 text-slate-400">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t('cases.noDocuments', 'لا توجد مستندات')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claims Tab */}
                  {activeTab === 'claims' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-navy">{t('cases.claims', 'المطالبات')}</h3>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                          <Plus className="h-4 w-4 ml-2" />
                          {t('cases.addClaim', 'إضافة مطالبة')}
                        </Button>
                      </div>

                      {caseData.claims && caseData.claims.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {caseData.claims.map((claim: Claim, i: number) => (
                              <div
                                key={i}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                      <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-navy">{claim.type}</h4>
                                      {claim.period && <div className="text-xs text-slate-500">{claim.period}</div>}
                                    </div>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                                    {claim.type}
                                  </Badge>
                                </div>
                                {claim.description && (
                                  <p className="text-sm text-slate-500 mb-3">{claim.description}</p>
                                )}
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                                  <div className="text-lg font-bold text-navy">
                                    {formatCurrency(claim.amount)} {t('common.sar', 'ر.س')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total Summary */}
                          <div className="bg-navy rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-navy/20">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <Scale className="h-6 w-6 text-brand-blue" />
                              </div>
                              <div>
                                <div className="text-blue-200 text-sm mb-1">{t('cases.totalClaims', 'إجمالي المطالبات')}</div>
                                <div className="font-bold text-xl">{caseData.claims.length} {t('cases.items', 'بنود')}</div>
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-blue-200 text-sm mb-1">{t('cases.totalAmount', 'المبلغ الكلي')}</div>
                              <div className="font-bold text-3xl text-emerald-400">
                                {formatCurrency(totalClaimsAmount)} {t('common.sar', 'ر.س')}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t('cases.noClaims', 'لا توجد مطالبات')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-navy">{t('cases.notes', 'الملاحظات')}</h3>
                        <Button
                          size="sm"
                          className="bg-brand-blue hover:bg-blue-600 text-white"
                          onClick={() => setIsAddNoteOpen(true)}
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          {t('cases.addNote', 'إضافة ملاحظة')}
                        </Button>
                      </div>

                      {caseData.notes && caseData.notes.length > 0 ? (
                        caseData.notes.map((note: CaseNote, i: number) => (
                          <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <MessageSquare className="h-4 w-4" />
                                </div>
                                <span className="text-xs text-slate-500">{formatDate(note.date)}</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 ml-2" /> {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 ml-2" /> {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-slate-700 pr-10">{note.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t('cases.noNotes', 'لا توجد ملاحظات')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
