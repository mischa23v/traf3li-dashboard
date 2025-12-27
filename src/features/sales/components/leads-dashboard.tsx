import { useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  Plus,
  Users,
  Phone,
  Mail,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  ArrowUpRight,
  GripVertical,
  UserPlus,
  MessageSquare,
  PhoneCall,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import {
  useLeads,
  useLead,
  useLeadStats,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConvertLead,
  useUpdateLeadStage,
  useAddLeadActivity,
} from '@/hooks/useAccounting'
import { useStaff } from '@/hooks/useStaff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSAR } from '@/lib/currency'
import type { LeadStage, LeadSource, Lead, LeadActivity } from '@/services/accountingService'
import { cn } from '@/lib/utils'

// ==================== CONSTANTS ====================

const getStageLabel = (stage: LeadStage, t: any) => t(`sales.leads.stages.${stage}`)

const STAGE_COLORS: Record<LeadStage, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-purple-500',
  qualified: 'bg-emerald-500',
  proposal: 'bg-orange-500',
  negotiation: 'bg-yellow-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
}

const getSourceLabel = (source: LeadSource, t: any) => t(`sales.leads.sources.${source}`)

const getCaseTypes = (t: any) => [
  { value: 'labor', label: t('sales.leads.caseTypes.laborPlural') },
  { value: 'commercial', label: t('sales.leads.caseTypes.commercialPlural') },
  { value: 'civil', label: t('sales.leads.caseTypes.civilPlural') },
  { value: 'criminal', label: t('sales.leads.caseTypes.criminalPlural') },
  { value: 'family', label: t('sales.leads.caseTypes.familyPlural') },
  { value: 'administrative', label: t('sales.leads.caseTypes.administrativePlural') },
  { value: 'other', label: t('sales.leads.caseTypes.other') },
]

const getActivityTypeLabel = (type: string, t: any) => t(`sales.leads.activities.types.${type}`)

// ==================== COMPONENTS ====================

interface LeadCardProps {
  lead: Lead
  onUpdateStage: (leadId: string, stage: LeadStage) => void
  onConvert: (leadId: string) => void
  onDelete: (leadId: string) => void
  onViewDetails: (leadId: string) => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, leadId: string) => void
  onDragEnd?: () => void
}

function LeadCard({
  lead,
  onUpdateStage,
  onConvert,
  onDelete,
  onViewDetails,
  draggable = false,
  onDragStart,
  onDragEnd,
}: LeadCardProps) {
  const { t } = useTranslation()
  const canConvert = ['qualified', 'proposal', 'negotiation'].includes(lead.stage)

  return (
    <Card
      className={cn(
        'p-4 hover:shadow-md transition-all border-slate-200',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, lead._id) : undefined}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {draggable && <GripVertical className="h-4 w-4 text-slate-500" />}
          <div className="flex-1">
            <h4 className="font-semibold text-navy text-sm">
              {lead.firstName} {lead.lastName}
            </h4>
            {lead.company && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Building className="h-3 w-3" aria-hidden="true" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(lead._id)}>
              عرض التفاصيل
            </DropdownMenuItem>
            {canConvert && !lead.convertedToClientId && (
              <DropdownMenuItem onClick={() => onConvert(lead._id)}>
                <ArrowUpRight className="h-4 w-4 ms-2" />
                تحويل إلى عميل
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(lead._id)}
              className="text-red-600"
            >
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-xs text-slate-600">
        {lead.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" aria-hidden="true" />
            <span dir="ltr">{lead.phone}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3" aria-hidden="true" />
            <span dir="ltr">{lead.email}</span>
          </div>
        )}
      </div>

      {lead.estimatedValue && lead.estimatedValue > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">القيمة المتوقعة</span>
            <span className="font-semibold text-emerald-600">
              {formatSAR(lead.estimatedValue)}
            </span>
          </div>
        </div>
      )}

      {lead.expectedCloseDate && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <span>
            {formatDistanceToNow(new Date(lead.expectedCloseDate), {
              addSuffix: true,
              locale: ar,
            })}
          </span>
        </div>
      )}

      {lead.source && (
        <Badge variant="secondary" className="mt-2 text-xs">
          {getSourceLabel(lead.source, t)}
        </Badge>
      )}
    </Card>
  )
}

interface ConvertLeadDialogProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (leadId: string, createCase: boolean, caseType?: string) => void
}

function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  onConfirm,
}: ConvertLeadDialogProps) {
  const { t } = useTranslation()
  const [createCase, setCreateCase] = useState(false)
  const [caseType, setCaseType] = useState('')

  const handleConfirm = () => {
    if (!lead) return
    onConfirm(lead._id, createCase, createCase ? caseType : undefined)
    onOpenChange(false)
    setCreateCase(false)
    setCaseType('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تحويل إلى عميل</DialogTitle>
          <DialogDescription>
            سيتم إنشاء ملف عميل جديد من بيانات العميل المحتمل
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span className="font-medium">
                  {lead.firstName} {lead.lastName}
                </span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  <span dir="ltr">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  <span dir="ltr">{lead.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createCase}
                  onChange={(e) => setCreateCase(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-medium">إنشاء قضية جديدة</span>
              </label>

              {createCase && (
                <div className="space-y-2 me-6">
                  <label className="text-sm text-slate-600">نوع القضية</label>
                  <Select value={caseType} onValueChange={setCaseType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('sales.leads.selectCaseType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getCaseTypes(t).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lead.caseType && (
                    <p className="text-xs text-slate-500">
                      نوع القضية المقترح: {lead.caseType}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
          >
            <ArrowUpRight className="h-4 w-4 ms-2" />
            تحويل الآن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  initialData?: Partial<Lead>
}

function LeadFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: LeadFormDialogProps) {
  const { t } = useTranslation()
  const { data: staffData } = useStaff()
  const staff = staffData?.data || []

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    source: (initialData?.source as LeadSource) || ('website' as LeadSource),
    estimatedValue: initialData?.estimatedValue || 0,
    expectedCloseDate: initialData?.expectedCloseDate || '',
    caseType: initialData?.caseType || '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
    assignedTo: initialData?.assignedTo || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('sales.leads.editLead') : t('sales.leads.newLead')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                اسم العائلة <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الشركة</label>
            <Input
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">المصدر</label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({ ...formData, source: value as LeadSource })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">مسؤول المتابعة</label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t('sales.leads.form.selectStaff')} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member: any) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">القيمة المتوقعة (ر.س)</label>
              <Input
                type="number"
                value={formData.estimatedValue || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">تاريخ الإغلاق المتوقع</label>
              <Input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expectedCloseDate: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">نوع القضية</label>
            <Select
              value={formData.caseType}
              onValueChange={(value) =>
                setFormData({ ...formData, caseType: value })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t('sales.leads.selectCaseType')} />
              </SelectTrigger>
              <SelectContent>
                {getCaseTypes(t).map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ملاحظات</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
              حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ActivityDialogProps {
  leadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (leadId: string, activity: Omit<LeadActivity, '_id' | 'createdBy'>) => void
}

function ActivityDialog({
  leadId,
  open,
  onOpenChange,
  onSubmit,
}: ActivityDialogProps) {
  const { t } = useTranslation()
  const [activityData, setActivityData] = useState({
    type: 'note' as LeadActivity['type'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    outcome: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(leadId, activityData)
    onOpenChange(false)
    setActivityData({
      type: 'note',
      description: '',
      date: new Date().toISOString().split('T')[0],
      outcome: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة نشاط</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع النشاط</label>
            <Select
              value={activityData.type}
              onValueChange={(value) =>
                setActivityData({
                  ...activityData,
                  type: value as LeadActivity['type'],
                })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">مكالمة</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="meeting">اجتماع</SelectItem>
                <SelectItem value="note">ملاحظة</SelectItem>
                <SelectItem value="task">مهمة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">التاريخ</label>
            <Input
              type="date"
              value={activityData.date}
              onChange={(e) =>
                setActivityData({ ...activityData, date: e.target.value })
              }
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              الوصف <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={activityData.description}
              onChange={(e) =>
                setActivityData({ ...activityData, description: e.target.value })
              }
              required
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">النتيجة</label>
            <Input
              value={activityData.outcome}
              onChange={(e) =>
                setActivityData({ ...activityData, outcome: e.target.value })
              }
              className="rounded-xl"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              إضافة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MAIN COMPONENT ====================

export function LeadsDashboard() {
  const { t } = useTranslation()
  const [selectedStage, setSelectedStage] = useState<LeadStage | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline')

  // Hooks
  const filters = useMemo(() => {
    const f: any = {}
    if (selectedStage !== 'all') {
      f.stage = selectedStage
    }
    return f
  }, [selectedStage])

  const { data: leadsData, isLoading } = useLeads(filters)
  const { data: statsData } = useLeadStats()
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()
  const convertLead = useConvertLead()
  const updateLeadStage = useUpdateLeadStage()
  const addLeadActivity = useAddLeadActivity()

  const leads = leadsData?.leads || []
  const stats = statsData || {
    totalLeads: 0,
    byStage: {} as Record<LeadStage, number>,
    bySource: {} as Record<LeadSource, number>,
    conversionRate: 0,
    averageValue: 0,
    totalEstimatedValue: 0,
  }

  // Filter leads by search
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads
    const query = searchQuery.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(query) ||
        lead.lastName.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.company?.toLowerCase().includes(query)
    )
  }, [leads, searchQuery])

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<LeadStage, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    }
    filteredLeads.forEach((lead) => {
      grouped[lead.stage].push(lead)
    })
    return grouped
  }, [filteredLeads])

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault()
    if (draggedLeadId) {
      updateLeadStage.mutate({ id: draggedLeadId, stage })
      setDraggedLeadId(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedLeadId(null)
  }

  // Handlers
  const handleCreateLead = (data: any) => {
    createLead.mutate(data)
  }

  const handleUpdateStage = (leadId: string, stage: LeadStage) => {
    updateLeadStage.mutate({ id: leadId, stage })
  }

  const handleConvert = (leadId: string) => {
    const lead = leads.find((l) => l._id === leadId)
    if (lead) {
      setSelectedLead(lead)
      setShowConvertDialog(true)
    }
  }

  const handleConfirmConvert = (
    leadId: string,
    createCase: boolean,
    caseType?: string
  ) => {
    convertLead.mutate({
      id: leadId,
      data: { createCase, caseType },
    })
  }

  const handleDelete = (leadId: string) => {
    if (confirm(t('sales.leads.deleteConfirm'))) {
      deleteLead.mutate(leadId)
    }
  }

  const handleAddActivity = (
    leadId: string,
    activity: Omit<LeadActivity, '_id' | 'createdBy'>
  ) => {
    addLeadActivity.mutate({ id: leadId, activity })
  }

  const handleViewDetails = (leadId: string) => {
    const lead = leads.find((l) => l._id === leadId)
    if (lead) {
      setSelectedLead(lead)
      setShowActivityDialog(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-navy">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" aria-hidden="true" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">معدل التحويل</p>
              <p className="text-2xl font-bold text-navy">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">القيمة الإجمالية</p>
              <p className="text-2xl font-bold text-navy">
                {formatSAR(stats.totalEstimatedValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">متوسط القيمة</p>
              <p className="text-2xl font-bold text-navy">
                {formatSAR(stats.averageValue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'pipeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('pipeline')}
              className="rounded-xl"
            >
              مسار التحويل
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="rounded-xl"
            >
              قائمة
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <Input
                placeholder={t('sales.leads.searchLeads')}
                defaultValue={searchQuery}
                onChange={(e) => debouncedSetSearch(e.target.value)}
                className="pe-10 rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={() => setShowLeadForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
          >
            <Plus className="h-4 w-4 ms-2" aria-hidden="true" />
            عميل محتمل جديد
          </Button>
        </div>

        {viewMode === 'list' && (
          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={selectedStage === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedStage('all')}
              className="rounded-full"
            >
              الكل ({stats.totalLeads})
            </Button>
            {(Object.keys({ new: '', contacted: '', qualified: '', proposal: '', negotiation: '', won: '', lost: '' }) as LeadStage[]).map((stage) => (
              <Button
                key={stage}
                size="sm"
                variant={selectedStage === stage ? 'default' : 'outline'}
                onClick={() => setSelectedStage(stage as LeadStage)}
                className="rounded-full"
              >
                {getStageLabel(stage, t)} ({stats.byStage[stage as LeadStage] || 0})
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : viewMode === 'pipeline' ? (
        // Pipeline View
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {(Object.keys({ new: '', contacted: '', qualified: '', proposal: '', negotiation: '', won: '', lost: '' }) as LeadStage[]).map((stage) => {
              const stageLeads = leadsByStage[stage as LeadStage]
              const stageValue = stageLeads.reduce(
                (sum, lead) => sum + (lead.estimatedValue || 0),
                0
              )

              return (
                <div key={stage} className="flex-shrink-0 w-80">
                  <div
                    className={cn(
                      'p-3 rounded-t-xl text-white font-semibold flex items-center justify-between',
                      STAGE_COLORS[stage as LeadStage]
                    )}
                  >
                    <span>{label}</span>
                    <Badge className="bg-white/20 text-white border-0">
                      {stageLeads.length}
                    </Badge>
                  </div>

                  {stageValue > 0 && (
                    <div className="bg-slate-100 px-3 py-2 text-sm text-slate-600 border-x border-slate-200">
                      {formatSAR(stageValue)}
                    </div>
                  )}

                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage as LeadStage)}
                    className={cn(
                      'min-h-[500px] p-3 rounded-b-xl border border-t-0 transition-colors space-y-3',
                      draggedLeadId
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    {stageLeads.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        لا يوجد عملاء
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <LeadCard
                          key={lead._id}
                          lead={lead}
                          onUpdateStage={handleUpdateStage}
                          onConvert={handleConvert}
                          onDelete={handleDelete}
                          onViewDetails={handleViewDetails}
                          draggable
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // List View
        <Card className="p-4">
          <div className="space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
                <p className="text-slate-500">لا يوجد عملاء محتملين</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  onUpdateStage={handleUpdateStage}
                  onConvert={handleConvert}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <LeadFormDialog
        open={showLeadForm}
        onOpenChange={setShowLeadForm}
        onSubmit={handleCreateLead}
      />

      <ConvertLeadDialog
        lead={selectedLead}
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        onConfirm={handleConfirmConvert}
      />

      {selectedLead && (
        <ActivityDialog
          leadId={selectedLead._id}
          open={showActivityDialog}
          onOpenChange={setShowActivityDialog}
          onSubmit={handleAddActivity}
        />
      )}
    </div>
  )
}
