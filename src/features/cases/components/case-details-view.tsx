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
  ClipboardList,
  PenLine,
  FilePlus,
  FileX,
  Settings,
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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  useUpdateCaseNote,
  useDeleteCaseNote,
  useAddCaseHearing,
  useUpdateCaseHearing,
  useDeleteCaseHearing,
  useAddCaseClaim,
  useUpdateCaseClaim,
  useDeleteCaseClaim,
  useAddCaseTimelineEvent,
  useUpdateCaseTimelineEvent,
  useDeleteCaseTimelineEvent,
  useUploadCaseDocument,
  useDownloadCaseDocument,
  useDeleteCaseDocument,
  useUpdateCaseStatus,
  useCaseAuditHistory,
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
  AuditLogEntry,
} from '@/services/casesService'
import { ProductivityHero } from '@/components/productivity-hero'

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

  // Note states
  const [noteText, setNoteText] = useState('')
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CaseNote | null>(null)
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)

  // Hearing states
  const [isAddHearingOpen, setIsAddHearingOpen] = useState(false)
  const [hearingDate, setHearingDate] = useState('')
  const [hearingLocation, setHearingLocation] = useState('')
  const [hearingNotes, setHearingNotes] = useState('')
  const [editingHearing, setEditingHearing] = useState<CaseHearing | null>(null)
  const [isEditHearingOpen, setIsEditHearingOpen] = useState(false)
  const [deleteHearingId, setDeleteHearingId] = useState<string | null>(null)

  // Claim states
  const [isAddClaimOpen, setIsAddClaimOpen] = useState(false)
  const [claimType, setClaimType] = useState('')
  const [claimAmount, setClaimAmount] = useState('')
  const [claimPeriod, setClaimPeriod] = useState('')
  const [claimDescription, setClaimDescription] = useState('')
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null)
  const [isEditClaimOpen, setIsEditClaimOpen] = useState(false)
  const [deleteClaimId, setDeleteClaimId] = useState<string | null>(null)

  // Timeline states
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false)
  const [timelineEvent, setTimelineEvent] = useState('')
  const [timelineDate, setTimelineDate] = useState('')
  const [timelineType, setTimelineType] = useState<'court' | 'filing' | 'deadline' | 'general'>('general')
  const [timelineStatus, setTimelineStatus] = useState<'upcoming' | 'completed'>('upcoming')
  const [editingTimeline, setEditingTimeline] = useState<TimelineEvent | null>(null)
  const [isEditTimelineOpen, setIsEditTimelineOpen] = useState(false)
  const [deleteTimelineId, setDeleteTimelineId] = useState<string | null>(null)

  // Document states
  const [documentSubTab, setDocumentSubTab] = useState<'general' | 'judgments'>('general')
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState<string>('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)

  const { caseId } = useParams({ strict: false }) as { caseId: string }

  // Queries
  const { data: caseData, isLoading, isError, error, refetch } = useCase(caseId)
  const { data: auditHistory } = useCaseAuditHistory(caseId)

  // Note mutations
  const addNoteMutation = useAddCaseNote()
  const updateNoteMutation = useUpdateCaseNote()
  const deleteNoteMutation = useDeleteCaseNote()

  // Hearing mutations
  const addHearingMutation = useAddCaseHearing()
  const updateHearingMutation = useUpdateCaseHearing()
  const deleteHearingMutation = useDeleteCaseHearing()

  // Claim mutations
  const addClaimMutation = useAddCaseClaim()
  const updateClaimMutation = useUpdateCaseClaim()
  const deleteClaimMutation = useDeleteCaseClaim()

  // Timeline mutations
  const addTimelineMutation = useAddCaseTimelineEvent()
  const updateTimelineMutation = useUpdateCaseTimelineEvent()
  const deleteTimelineMutation = useDeleteCaseTimelineEvent()

  // Document mutations
  const uploadDocMutation = useUploadCaseDocument()
  const downloadDocMutation = useDownloadCaseDocument()
  const deleteDocMutation = useDeleteCaseDocument()

  // Status mutation
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
    const caseDetails = caseData?.data
    await addHearingMutation.mutateAsync({
      id: caseId,
      data: {
        date: hearingDate,
        location: hearingLocation,
        notes: hearingNotes,
      },
      // Pass case info for calendar event creation
      caseInfo: caseDetails ? {
        title: caseDetails.title,
        caseNumber: caseDetails.caseNumber,
      } : undefined,
    })
    setHearingDate('')
    setHearingLocation('')
    setHearingNotes('')
    setIsAddHearingOpen(false)
  }

  const handleAddClaim = async () => {
    if (!claimType.trim() || !claimAmount) return
    await addClaimMutation.mutateAsync({
      id: caseId,
      data: {
        type: claimType,
        amount: parseFloat(claimAmount),
        period: claimPeriod || undefined,
        description: claimDescription || undefined,
      },
    })
    setClaimType('')
    setClaimAmount('')
    setClaimPeriod('')
    setClaimDescription('')
    setIsAddClaimOpen(false)
  }

  const handleStatusChange = async (status: CaseStatus) => {
    await updateStatusMutation.mutateAsync({ id: caseId, status })
  }

  // Note handlers
  const handleEditNote = (note: CaseNote) => {
    setEditingNote(note)
    setNoteText(note.text)
    setIsEditNoteOpen(true)
  }

  const handleUpdateNote = async () => {
    if (!editingNote?._id || !noteText.trim()) return
    await updateNoteMutation.mutateAsync({
      caseId,
      noteId: editingNote._id,
      data: { text: noteText },
    })
    setNoteText('')
    setEditingNote(null)
    setIsEditNoteOpen(false)
  }

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return
    await deleteNoteMutation.mutateAsync({ caseId, noteId: deleteNoteId })
    setDeleteNoteId(null)
  }

  // Hearing handlers
  const handleEditHearing = (hearing: CaseHearing) => {
    setEditingHearing(hearing)
    setHearingDate(hearing.date ? new Date(hearing.date).toISOString().slice(0, 16) : '')
    setHearingLocation(hearing.location)
    setHearingNotes(hearing.notes || '')
    setIsEditHearingOpen(true)
  }

  const handleUpdateHearing = async () => {
    if (!editingHearing?._id || !hearingDate || !hearingLocation) return
    await updateHearingMutation.mutateAsync({
      caseId,
      hearingId: editingHearing._id,
      data: {
        date: hearingDate,
        location: hearingLocation,
        notes: hearingNotes,
      },
    })
    setHearingDate('')
    setHearingLocation('')
    setHearingNotes('')
    setEditingHearing(null)
    setIsEditHearingOpen(false)
  }

  const handleDeleteHearing = async () => {
    if (!deleteHearingId) return
    await deleteHearingMutation.mutateAsync({ caseId, hearingId: deleteHearingId })
    setDeleteHearingId(null)
  }

  // Claim handlers
  const handleEditClaim = (claim: Claim) => {
    setEditingClaim(claim)
    setClaimType(claim.type)
    setClaimAmount(claim.amount.toString())
    setClaimPeriod(claim.period || '')
    setClaimDescription(claim.description || '')
    setIsEditClaimOpen(true)
  }

  const handleUpdateClaim = async () => {
    if (!editingClaim?._id || !claimType || !claimAmount) return
    await updateClaimMutation.mutateAsync({
      caseId,
      claimId: editingClaim._id,
      data: {
        type: claimType,
        amount: parseFloat(claimAmount),
        period: claimPeriod || undefined,
        description: claimDescription || undefined,
      },
    })
    setClaimType('')
    setClaimAmount('')
    setClaimPeriod('')
    setClaimDescription('')
    setEditingClaim(null)
    setIsEditClaimOpen(false)
  }

  const handleDeleteClaim = async () => {
    if (!deleteClaimId) return
    await deleteClaimMutation.mutateAsync({ caseId, claimId: deleteClaimId })
    setDeleteClaimId(null)
  }

  // Timeline handlers
  const handleAddTimeline = async () => {
    if (!timelineEvent.trim() || !timelineDate) return
    await addTimelineMutation.mutateAsync({
      caseId,
      data: {
        event: timelineEvent,
        date: timelineDate,
        type: timelineType,
        status: timelineStatus,
      },
    })
    setTimelineEvent('')
    setTimelineDate('')
    setTimelineType('general')
    setTimelineStatus('upcoming')
    setIsAddTimelineOpen(false)
  }

  const handleEditTimeline = (event: TimelineEvent) => {
    setEditingTimeline(event)
    setTimelineEvent(event.event)
    setTimelineDate(event.date ? event.date.split('T')[0] : '')
    setTimelineType(event.type)
    setTimelineStatus(event.status)
    setIsEditTimelineOpen(true)
  }

  const handleUpdateTimeline = async () => {
    if (!editingTimeline?._id || !timelineEvent.trim() || !timelineDate) return
    await updateTimelineMutation.mutateAsync({
      caseId,
      eventId: editingTimeline._id,
      data: {
        event: timelineEvent,
        date: timelineDate,
        type: timelineType,
        status: timelineStatus,
      },
    })
    setTimelineEvent('')
    setTimelineDate('')
    setTimelineType('general')
    setTimelineStatus('upcoming')
    setEditingTimeline(null)
    setIsEditTimelineOpen(false)
  }

  const handleDeleteTimeline = async () => {
    if (!deleteTimelineId) return
    await deleteTimelineMutation.mutateAsync({ caseId, eventId: deleteTimelineId })
    setDeleteTimelineId(null)
  }

  // Document handlers
  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadCategory) return
    await uploadDocMutation.mutateAsync({
      caseId,
      file: uploadFile,
      category: uploadCategory as any,
      description: uploadDescription || undefined,
    })
    setUploadFile(null)
    setUploadCategory('')
    setUploadDescription('')
    setIsUploadDocOpen(false)
  }

  const handleDownloadDocument = (docId: string) => {
    downloadDocMutation.mutate({ caseId, docId })
  }

  const handleDeleteDocument = async () => {
    if (!deleteDocId) return
    await deleteDocMutation.mutateAsync({ caseId, docId: deleteDocId })
    setDeleteDocId(null)
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
            <ProductivityHero badge={getCategoryLabel(caseData.category)} title={caseData.title} type="cases" hideButtons={true}>
              <div className="flex gap-3">
                <Link to="/dashboard/cases">
                  <Button
                    variant="ghost"
                    className="bg-white/10 text-white hover:bg-white/20 rounded-xl h-10 px-4"
                  >
                    <ArrowLeft className="h-4 w-4 ml-2" />
                    {t('cases.backToCases', 'العودة إلى القضايا')}
                  </Button>
                </Link>
              </div>
            </ProductivityHero>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT SIDEBAR */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Timeline Card */}
                <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden flex flex-col">
                  <div className="bg-navy p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue blur-[40px] opacity-30"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                        <History className="h-5 w-5 text-brand-blue" />
                        {t('cases.timeline', 'الجدول الزمني')}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={() => setIsAddTimelineOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-0 flex-1 bg-slate-50/50">
                    <ScrollArea className="h-[350px] p-6">
                      <div className="relative">
                        <div className="absolute top-2 bottom-2 right-[5px] w-0.5 bg-slate-200"></div>
                        <div className="space-y-6 relative">
                          {caseData.timeline && caseData.timeline.length > 0 ? (
                            caseData.timeline.map((event: TimelineEvent, i: number) => (
                              <div key={event._id || i} className="flex gap-4 relative group">
                                <div
                                  className={`
                                    w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white shrink-0
                                    ${event.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}
                                  `}
                                ></div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="text-sm font-bold text-navy">{event.event}</div>
                                      <div className="text-xs text-slate-500 mb-1">{formatShortDate(event.date)}</div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditTimeline(event)}>
                                          <Edit className="h-4 w-4 ml-2" /> {t('common.edit', 'تعديل')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => event._id && setDeleteTimelineId(event._id)}
                                        >
                                          <Trash2 className="h-4 w-4 ml-2" /> {t('common.delete', 'حذف')}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
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
                      {['overview', 'hearings', 'documents', 'claims', 'notes', 'history'].map((tab) => (
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
                                  : tab === 'notes'
                                    ? t('cases.tabs.notes', 'الملاحظات')
                                    : t('cases.tabs.history', 'سجل التغييرات')}
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
                            key={hearing._id || i}
                            className={`rounded-2xl p-6 border ${new Date(hearing.date) > new Date()
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-navy">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditHearing(hearing)}>
                                    <Edit className="h-4 w-4 ml-2" /> {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => hearing._id && setDeleteHearingId(hearing._id)}
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" /> {t('common.delete', 'حذف')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                    <div className="space-y-6">
                      {/* Document Sub-tabs Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setDocumentSubTab('general')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${documentSubTab === 'general'
                              ? 'bg-white text-navy shadow-sm'
                              : 'text-slate-500 hover:text-navy'
                              }`}
                          >
                            <FileText className="h-4 w-4 inline-block ml-2" />
                            {t('cases.documents.general', 'مستندات عامة')}
                          </button>
                          <button
                            onClick={() => setDocumentSubTab('judgments')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${documentSubTab === 'judgments'
                              ? 'bg-white text-navy shadow-sm'
                              : 'text-slate-500 hover:text-navy'
                              }`}
                          >
                            <Gavel className="h-4 w-4 inline-block ml-2" />
                            {t('cases.documents.judgments', 'الأحكام')}
                          </button>
                        </div>

                        {/* Upload Button */}
                        <Dialog open={isUploadDocOpen} onOpenChange={setIsUploadDocOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-brand-blue hover:bg-blue-600 text-white">
                              <Upload className="h-4 w-4 ml-2" />
                              {t('cases.uploadDocument', 'رفع مستند')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{t('cases.uploadDocument', 'رفع مستند جديد')}</DialogTitle>
                              <DialogDescription>
                                {t('cases.uploadDocumentDescription', 'اختر الملف ونوع المستند للرفع')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* File Drop Zone */}
                              <div
                                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-all"
                                onClick={() => document.getElementById('file-upload')?.click()}
                              >
                                {uploadFile ? (
                                  <div className="space-y-2">
                                    <FileCheck className="h-10 w-10 mx-auto text-emerald-500" />
                                    <p className="font-medium text-navy">{uploadFile.name}</p>
                                    <p className="text-sm text-slate-500">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <Upload className="h-10 w-10 mx-auto text-slate-400" />
                                    <p className="text-slate-500">{t('cases.dropFileHere', 'اضغط لاختيار ملف')}</p>
                                    <p className="text-xs text-slate-400">PDF, DOCX, JPG, PNG (max 50MB)</p>
                                  </div>
                                )}
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
                                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                />
                              </div>

                              {/* Document Type */}
                              <div className="space-y-2">
                                <Label>{t('cases.documentType', 'نوع المستند')}</Label>
                                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('cases.selectDocumentType', 'اختر نوع المستند')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="contract">{t('cases.docTypes.contract', 'عقد')}</SelectItem>
                                    <SelectItem value="evidence">{t('cases.docTypes.evidence', 'دليل / مستند داعم')}</SelectItem>
                                    <SelectItem value="correspondence">{t('cases.docTypes.correspondence', 'مراسلات')}</SelectItem>
                                    <SelectItem value="pleading">{t('cases.docTypes.pleading', 'لائحة / مذكرة')}</SelectItem>
                                    <SelectItem value="judgment">{t('cases.docTypes.judgment', 'حكم قضائي')}</SelectItem>
                                    <SelectItem value="other">{t('cases.docTypes.other', 'أخرى')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Description */}
                              <div className="space-y-2">
                                <Label>{t('cases.documentDescription', 'وصف المستند (اختياري)')}</Label>
                                <Textarea
                                  value={uploadDescription}
                                  onChange={(e) => setUploadDescription(e.target.value)}
                                  placeholder={t('cases.documentDescriptionPlaceholder', 'وصف مختصر للمستند...')}
                                  rows={2}
                                />
                              </div>

                              {/* Bucket Info */}
                              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                                <p className="text-slate-600">
                                  {uploadCategory === 'judgment' ? (
                                    <>
                                      <Shield className="h-4 w-4 inline-block ml-1 text-amber-500" />
                                      {t('cases.judgmentBucketInfo', 'سيتم حفظ الحكم في مخزن الأحكام المشفر')}
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="h-4 w-4 inline-block ml-1 text-blue-500" />
                                      {t('cases.generalBucketInfo', 'سيتم حفظ المستند في المخزن الآمن')}
                                    </>
                                  )}
                                </p>
                              </div>

                              {/* Upload Button */}
                              <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600"
                                disabled={!uploadFile || !uploadCategory || uploadDocMutation.isPending}
                                onClick={handleUploadDocument}
                              >
                                {uploadDocMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    {t('common.uploading', 'جاري الرفع...')}
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 ml-2" />
                                    {t('cases.uploadDocument', 'رفع المستند')}
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Document Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                          const filteredDocs = caseData.documents?.filter(
                            (doc: CaseDocument) => documentSubTab === 'judgments'
                              ? doc.bucket === 'judgments' || doc.category === 'judgment'
                              : doc.bucket === 'general' || doc.bucket !== 'judgments'
                          ) || []

                          if (filteredDocs.length === 0) {
                            return (
                              <div className="col-span-full text-center py-12 text-slate-400">
                                {documentSubTab === 'judgments' ? (
                                  <>
                                    <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('cases.noJudgments', 'لا توجد أحكام مسجلة')}</p>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('cases.noDocuments', 'لا توجد مستندات')}</p>
                                  </>
                                )}
                              </div>
                            )
                          }

                          return filteredDocs.map((doc: CaseDocument, i: number) => (
                            <div
                              key={doc._id || i}
                              className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between ${doc.category === 'judgment' || doc.bucket === 'judgments'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-slate-50 border-slate-100'
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${doc.category === 'judgment' || doc.bucket === 'judgments'
                                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                                  : 'bg-white border-slate-200 text-slate-500'
                                  }`}>
                                  {doc.category === 'judgment' ? (
                                    <Gavel className="h-5 w-5" />
                                  ) : (
                                    doc.type?.split('/')[1]?.toUpperCase()?.slice(0, 4) || 'FILE'
                                  )}
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
                                    <DropdownMenuItem
                                      onClick={() => doc._id && handleDownloadDocument(doc._id)}
                                    >
                                      <Download className="h-4 w-4 ml-2" /> {t('common.download', 'تحميل')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => doc._id && setDeleteDocId(doc._id)}
                                    >
                                      <Trash2 className="h-4 w-4 ml-2" /> {t('common.delete', 'حذف')}
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
                                {doc.description && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.description}</p>
                                )}
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
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Claims Tab */}
                  {activeTab === 'claims' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-navy">{t('cases.claims', 'المطالبات')}</h3>
                        <Dialog open={isAddClaimOpen} onOpenChange={setIsAddClaimOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                              <Plus className="h-4 w-4 ml-2" />
                              {t('cases.addClaim', 'إضافة مطالبة')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('cases.addClaim', 'إضافة مطالبة')}</DialogTitle>
                              <DialogDescription>
                                {t('cases.addClaimDescription', 'أضف مطالبة جديدة للقضية')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="claimType">{t('cases.claimType', 'نوع المطالبة')}</Label>
                                <Select value={claimType} onValueChange={setClaimType}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('cases.selectClaimType', 'اختر نوع المطالبة')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="أجور متأخرة">{t('cases.claimTypes.wages', 'أجور متأخرة')}</SelectItem>
                                    <SelectItem value="مكافأة نهاية الخدمة">{t('cases.claimTypes.endOfService', 'مكافأة نهاية الخدمة')}</SelectItem>
                                    <SelectItem value="بدل إجازات">{t('cases.claimTypes.vacation', 'بدل إجازات')}</SelectItem>
                                    <SelectItem value="بدل سكن">{t('cases.claimTypes.housing', 'بدل سكن')}</SelectItem>
                                    <SelectItem value="بدل نقل">{t('cases.claimTypes.transport', 'بدل نقل')}</SelectItem>
                                    <SelectItem value="تعويض فصل تعسفي">{t('cases.claimTypes.wrongfulTermination', 'تعويض فصل تعسفي')}</SelectItem>
                                    <SelectItem value="أخرى">{t('cases.claimTypes.other', 'أخرى')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="claimAmount">{t('cases.claimAmount', 'المبلغ (ر.س)')}</Label>
                                <Input
                                  id="claimAmount"
                                  type="number"
                                  value={claimAmount}
                                  onChange={(e) => setClaimAmount(e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="claimPeriod">{t('cases.claimPeriod', 'الفترة (اختياري)')}</Label>
                                <Input
                                  id="claimPeriod"
                                  value={claimPeriod}
                                  onChange={(e) => setClaimPeriod(e.target.value)}
                                  placeholder={t('cases.claimPeriodPlaceholder', 'مثال: يناير 2024 - مارس 2024')}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="claimDescription">{t('cases.claimDescription', 'الوصف (اختياري)')}</Label>
                                <Textarea
                                  id="claimDescription"
                                  value={claimDescription}
                                  onChange={(e) => setClaimDescription(e.target.value)}
                                  placeholder={t('cases.claimDescriptionPlaceholder', 'تفاصيل إضافية عن المطالبة...')}
                                  rows={3}
                                />
                              </div>
                              <Button
                                onClick={handleAddClaim}
                                disabled={addClaimMutation.isPending || !claimType || !claimAmount}
                                className="w-full bg-emerald-500 hover:bg-emerald-600"
                              >
                                {addClaimMutation.isPending && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                                {t('common.add', 'إضافة')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {caseData.claims && caseData.claims.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {caseData.claims.map((claim: Claim, i: number) => (
                              <div
                                key={claim._id || i}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group relative"
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
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-navy">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditClaim(claim)}>
                                        <Edit className="h-4 w-4 ml-2" /> {t('common.edit', 'تعديل')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => claim._id && setDeleteClaimId(claim._id)}
                                      >
                                        <Trash2 className="h-4 w-4 ml-2" /> {t('common.delete', 'حذف')}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
                          <div key={note._id || i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
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
                                  <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                    <Edit className="h-4 w-4 ml-2" /> {t('common.edit', 'تعديل')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => note._id && setDeleteNoteId(note._id)}
                                  >
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

                  {/* Audit History Tab */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-navy flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-brand-blue" />
                          {t('cases.auditHistory.title', 'سجل التغييرات')}
                        </h3>
                        <Badge variant="outline" className="text-slate-500">
                          {auditHistory?.logs?.length || 0} {t('cases.auditHistory.entries', 'سجل')}
                        </Badge>
                      </div>

                      {/* Audit History Timeline */}
                      {auditHistory?.logs && auditHistory.logs.length > 0 ? (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute top-4 bottom-4 right-6 w-0.5 bg-gradient-to-b from-brand-blue via-slate-200 to-slate-100"></div>

                          <div className="space-y-4">
                            {auditHistory.logs.map((log: AuditLogEntry, index: number) => {
                              const getActionIcon = () => {
                                switch (log.action) {
                                  case 'create':
                                    return <FilePlus className="h-4 w-4" />
                                  case 'update':
                                    return <PenLine className="h-4 w-4" />
                                  case 'delete':
                                    return <FileX className="h-4 w-4" />
                                  case 'view':
                                    return <Eye className="h-4 w-4" />
                                  default:
                                    return <Settings className="h-4 w-4" />
                                }
                              }

                              const getActionColor = () => {
                                switch (log.action) {
                                  case 'create':
                                    return 'bg-green-100 text-green-600 border-green-200'
                                  case 'update':
                                    return 'bg-blue-100 text-blue-600 border-blue-200'
                                  case 'delete':
                                    return 'bg-red-100 text-red-600 border-red-200'
                                  case 'view':
                                    return 'bg-slate-100 text-slate-600 border-slate-200'
                                  default:
                                    return 'bg-slate-100 text-slate-600 border-slate-200'
                                }
                              }

                              const getResourceLabel = () => {
                                switch (log.resource) {
                                  case 'case':
                                    return t('cases.auditHistory.resources.case', 'القضية')
                                  case 'document':
                                    return t('cases.auditHistory.resources.document', 'مستند')
                                  case 'hearing':
                                    return t('cases.auditHistory.resources.hearing', 'جلسة')
                                  case 'note':
                                    return t('cases.auditHistory.resources.note', 'ملاحظة')
                                  case 'claim':
                                    return t('cases.auditHistory.resources.claim', 'مطالبة')
                                  case 'timeline':
                                    return t('cases.auditHistory.resources.timeline', 'حدث')
                                  default:
                                    return log.resource
                                }
                              }

                              const getActionLabel = () => {
                                switch (log.action) {
                                  case 'create':
                                    return t('cases.auditHistory.actions.create', 'إنشاء')
                                  case 'update':
                                    return t('cases.auditHistory.actions.update', 'تحديث')
                                  case 'delete':
                                    return t('cases.auditHistory.actions.delete', 'حذف')
                                  case 'view':
                                    return t('cases.auditHistory.actions.view', 'عرض')
                                  default:
                                    return log.action
                                }
                              }

                              const getUserName = () => {
                                if (typeof log.userId === 'object' && log.userId) {
                                  if (log.userId.firstName && log.userId.lastName) {
                                    return `${log.userId.firstName} ${log.userId.lastName}`
                                  }
                                  return log.userId.username || t('cases.auditHistory.unknownUser', 'مستخدم غير معروف')
                                }
                                return t('cases.auditHistory.unknownUser', 'مستخدم غير معروف')
                              }

                              return (
                                <div key={log._id || index} className="flex gap-4 relative">
                                  {/* Timeline dot */}
                                  <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10
                                    ${getActionColor()} border-2 shadow-sm
                                  `}>
                                    {getActionIcon()}
                                  </div>

                                  {/* Content card */}
                                  <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`${getActionColor()} font-medium`}>
                                          {getActionLabel()} {getResourceLabel()}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(log.timestamp).toLocaleDateString('ar-SA', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                      <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold">
                                        {getUserName().charAt(0)}
                                      </div>
                                      <span className="font-medium">{getUserName()}</span>
                                    </div>

                                    {/* Changes details */}
                                    {log.changes && (log.changes.before || log.changes.after) && (
                                      <div className="mt-3 pt-3 border-t border-slate-200">
                                        <div className="text-xs text-slate-500 mb-2 font-medium">
                                          {t('cases.auditHistory.changes', 'التغييرات')}:
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {log.changes.before && Object.keys(log.changes.before).length > 0 && (
                                            <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                                              <div className="text-xs text-red-600 font-medium mb-2 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                {t('cases.auditHistory.before', 'قبل')}
                                              </div>
                                              <div className="space-y-1">
                                                {Object.entries(log.changes.before).map(([key, value]) => (
                                                  <div key={key} className="text-xs">
                                                    <span className="text-slate-500">{key}:</span>{' '}
                                                    <span className="text-slate-700 font-medium">
                                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {log.changes.after && Object.keys(log.changes.after).length > 0 && (
                                            <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
                                              <div className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                {t('cases.auditHistory.after', 'بعد')}
                                              </div>
                                              <div className="space-y-1">
                                                {Object.entries(log.changes.after).map(([key, value]) => (
                                                  <div key={key} className="text-xs">
                                                    <span className="text-slate-500">{key}:</span>{' '}
                                                    <span className="text-slate-700 font-medium">
                                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{t('cases.auditHistory.noHistory', 'لا يوجد سجل تغييرات')}</p>
                          <p className="text-sm mt-2">{t('cases.auditHistory.noHistoryDesc', 'سيتم تسجيل جميع التغييرات على هذه القضية هنا')}</p>
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

      {/* Edit Note Dialog */}
      <Dialog open={isEditNoteOpen} onOpenChange={setIsEditNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cases.editNote', 'تعديل الملاحظة')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t('cases.noteTextPlaceholder', 'نص الملاحظة...')}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNoteOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleUpdateNote}
              disabled={updateNoteMutation.isPending}
              className="bg-brand-blue"
            >
              {updateNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.save', 'حفظ')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cases.deleteNoteConfirm', 'حذف الملاحظة')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteNoteMessage', 'هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Hearing Dialog */}
      <Dialog open={isEditHearingOpen} onOpenChange={setIsEditHearingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cases.editHearing', 'تعديل الجلسة')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('cases.hearingDate', 'التاريخ والوقت')}</Label>
              <Input
                type="datetime-local"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('cases.location', 'المكان')}</Label>
              <Input
                value={hearingLocation}
                onChange={(e) => setHearingLocation(e.target.value)}
                placeholder={t('cases.locationPlaceholder', 'مثال: المحكمة العمالية - القاعة 5')}
              />
            </div>
            <div>
              <Label>{t('cases.notes', 'ملاحظات')}</Label>
              <Textarea
                value={hearingNotes}
                onChange={(e) => setHearingNotes(e.target.value)}
                placeholder={t('cases.hearingNotesPlaceholder', 'ملاحظات إضافية...')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditHearingOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleUpdateHearing}
              disabled={updateHearingMutation.isPending}
              className="bg-brand-blue"
            >
              {updateHearingMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.save', 'حفظ')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hearing Confirmation */}
      <AlertDialog open={!!deleteHearingId} onOpenChange={() => setDeleteHearingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cases.deleteHearingConfirm', 'حذف الجلسة')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteHearingMessage', 'هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Claim Dialog */}
      <Dialog open={isEditClaimOpen} onOpenChange={setIsEditClaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cases.editClaim', 'تعديل المطالبة')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('cases.claimType', 'نوع المطالبة')}</Label>
              <Select value={claimType} onValueChange={setClaimType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cases.selectClaimType', 'اختر نوع المطالبة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="أجور متأخرة">{t('cases.claimTypes.wages', 'أجور متأخرة')}</SelectItem>
                  <SelectItem value="مكافأة نهاية الخدمة">{t('cases.claimTypes.endOfService', 'مكافأة نهاية الخدمة')}</SelectItem>
                  <SelectItem value="بدل إجازات">{t('cases.claimTypes.vacationAllowance', 'بدل إجازات')}</SelectItem>
                  <SelectItem value="تعويض فصل تعسفي">{t('cases.claimTypes.terminationCompensation', 'تعويض فصل تعسفي')}</SelectItem>
                  <SelectItem value="أخرى">{t('cases.claimTypes.other', 'أخرى')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('cases.amount', 'المبلغ')}</Label>
              <Input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>{t('cases.period', 'الفترة')} ({t('common.optional', 'اختياري')})</Label>
              <Input
                value={claimPeriod}
                onChange={(e) => setClaimPeriod(e.target.value)}
                placeholder={t('cases.periodPlaceholder', 'مثال: يناير 2024 - مارس 2024')}
              />
            </div>
            <div>
              <Label>{t('cases.description', 'الوصف')} ({t('common.optional', 'اختياري')})</Label>
              <Textarea
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                placeholder={t('cases.claimDescriptionPlaceholder', 'وصف المطالبة...')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditClaimOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleUpdateClaim}
              disabled={updateClaimMutation.isPending}
              className="bg-brand-blue"
            >
              {updateClaimMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.save', 'حفظ')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Claim Confirmation */}
      <AlertDialog open={!!deleteClaimId} onOpenChange={() => setDeleteClaimId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cases.deleteClaimConfirm', 'حذف المطالبة')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteClaimMessage', 'هل أنت متأكد من حذف هذه المطالبة؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClaim}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Document Confirmation */}
      <AlertDialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cases.deleteDocConfirm', 'حذف المستند')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteDocMessage', 'هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Timeline Event Dialog */}
      <Dialog open={isAddTimelineOpen} onOpenChange={setIsAddTimelineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cases.addTimelineEvent', 'إضافة حدث جديد')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('cases.eventName', 'اسم الحدث')}</Label>
              <Input
                value={timelineEvent}
                onChange={(e) => setTimelineEvent(e.target.value)}
                placeholder={t('cases.eventNamePlaceholder', 'مثال: تقديم المذكرة')}
              />
            </div>
            <div>
              <Label>{t('cases.eventDate', 'التاريخ')}</Label>
              <Input
                type="date"
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('cases.eventType', 'نوع الحدث')}</Label>
              <Select value={timelineType} onValueChange={(v) => setTimelineType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="court">{t('cases.eventType.court', 'جلسة')}</SelectItem>
                  <SelectItem value="filing">{t('cases.eventType.filing', 'تقديم')}</SelectItem>
                  <SelectItem value="deadline">{t('cases.eventType.deadline', 'موعد نهائي')}</SelectItem>
                  <SelectItem value="general">{t('cases.eventType.general', 'عام')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('cases.eventStatus', 'الحالة')}</Label>
              <Select value={timelineStatus} onValueChange={(v) => setTimelineStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">{t('cases.upcoming', 'قادم')}</SelectItem>
                  <SelectItem value="completed">{t('cases.completed', 'مكتمل')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTimelineOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleAddTimeline}
              disabled={addTimelineMutation.isPending}
              className="bg-brand-blue"
            >
              {addTimelineMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.add', 'إضافة')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timeline Event Dialog */}
      <Dialog open={isEditTimelineOpen} onOpenChange={setIsEditTimelineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cases.editTimelineEvent', 'تعديل الحدث')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('cases.eventName', 'اسم الحدث')}</Label>
              <Input
                value={timelineEvent}
                onChange={(e) => setTimelineEvent(e.target.value)}
                placeholder={t('cases.eventNamePlaceholder', 'مثال: تقديم المذكرة')}
              />
            </div>
            <div>
              <Label>{t('cases.eventDate', 'التاريخ')}</Label>
              <Input
                type="date"
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
              />
            </div>
            <div>
              <Label>{t('cases.eventType', 'نوع الحدث')}</Label>
              <Select value={timelineType} onValueChange={(v) => setTimelineType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="court">{t('cases.eventType.court', 'جلسة')}</SelectItem>
                  <SelectItem value="filing">{t('cases.eventType.filing', 'تقديم')}</SelectItem>
                  <SelectItem value="deadline">{t('cases.eventType.deadline', 'موعد نهائي')}</SelectItem>
                  <SelectItem value="general">{t('cases.eventType.general', 'عام')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('cases.eventStatus', 'الحالة')}</Label>
              <Select value={timelineStatus} onValueChange={(v) => setTimelineStatus(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">{t('cases.upcoming', 'قادم')}</SelectItem>
                  <SelectItem value="completed">{t('cases.completed', 'مكتمل')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTimelineOpen(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleUpdateTimeline}
              disabled={updateTimelineMutation.isPending}
              className="bg-brand-blue"
            >
              {updateTimelineMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('common.save', 'حفظ')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Timeline Event Confirmation */}
      <AlertDialog open={!!deleteTimelineId} onOpenChange={() => setDeleteTimelineId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cases.deleteTimelineConfirm', 'حذف الحدث')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteTimelineMessage', 'هل أنت متأكد من حذف هذا الحدث؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTimeline}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
