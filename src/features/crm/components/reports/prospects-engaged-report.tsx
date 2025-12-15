import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowRight,
  Download,
  FileText,
  Filter,
  Users,
  Activity,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  MoreHorizontal,
  UserPlus,
  Calendar,
  Send,
  XCircle,
  Loader2,
} from 'lucide-react'
import { useLeads } from '@/hooks/useCrm'

interface ProspectEngagedFilters {
  daysSinceContact: number
  minInteractions: number
  leadSource: string
  assignedTo: string
  startDate: string
  endDate: string
}

interface BulkAction {
  type: 'assign' | 'campaign' | 'followup' | 'disqualify'
  leadIds: string[]
}

export function ProspectsEngagedReport() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [filters, setFilters] = useState<ProspectEngagedFilters>({
    daysSinceContact: 60,
    minInteractions: 1,
    leadSource: 'all',
    assignedTo: 'all',
    startDate: '',
    endDate: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [bulkActionType, setBulkActionType] = useState<string>('')

  // Fetch leads with filters
  // In production, this would filter for engaged but not converted leads
  const { data: leadsData, isLoading } = useLeads({
    convertedToClient: false,
    sortBy: 'lastContactedAt',
    sortOrder: 'desc',
  })

  // Filter engaged prospects (those with recent activity but not converted)
  const engagedProspects = useMemo(() => {
    if (!leadsData?.data) return []

    return leadsData.data.filter((lead: any) => {
      // Must have had contact
      if (!lead.lastContactedAt) return false

      // Calculate days since contact
      const daysSince = lead.daysSinceContact || 0

      // Apply filters
      if (daysSince > filters.daysSinceContact) return false
      if (lead.activityCount < filters.minInteractions) return false

      // Source filter
      if (filters.leadSource !== 'all' && lead.source?.type !== filters.leadSource) {
        return false
      }

      // Assigned to filter
      if (filters.assignedTo !== 'all' && lead.assignedTo !== filters.assignedTo) {
        return false
      }

      // Date range filters
      if (filters.startDate && lead.lastContactedAt < filters.startDate) return false
      if (filters.endDate && lead.lastContactedAt > filters.endDate) return false

      return true
    })
  }, [leadsData, filters])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = engagedProspects.length
    const highValue = engagedProspects.filter(l => l.estimatedValue > 50000).length
    const needsFollowup = engagedProspects.filter(l =>
      l.daysSinceContact && l.daysSinceContact > 30
    ).length
    const totalValue = engagedProspects.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    const avgInteractions = total > 0
      ? Math.round(engagedProspects.reduce((sum, l) => sum + l.activityCount, 0) / total)
      : 0

    return {
      total,
      highValue,
      needsFollowup,
      totalValue,
      avgInteractions,
    }
  }, [engagedProspects])

  // Handle export
  const handleExport = (format: 'csv' | 'pdf') => {
    // Implementation would call export API
    console.log(`Exporting ${engagedProspects.length} prospects as ${format}`)
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.length === engagedProspects.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(engagedProspects.map(l => l._id))
    }
  }

  // Handle select one
  const handleSelectOne = (leadId: string) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId))
    } else {
      setSelectedLeads([...selectedLeads, leadId])
    }
  }

  // Handle bulk actions
  const handleBulkAction = (actionType: string) => {
    if (selectedLeads.length === 0) return

    setBulkActionType(actionType)
    // Implementation would open appropriate dialog/modal
    console.log(`Bulk action ${actionType} for ${selectedLeads.length} leads`)
  }

  // Get lead score color
  const getLeadScoreColor = (score: number = 0) => {
    if (score >= 80) return 'bg-green-100 text-green-700'
    if (score >= 60) return 'bg-blue-100 text-blue-700'
    if (score >= 40) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  // Get days since contact color
  const getDaysSinceContactColor = (days: number = 0) => {
    if (days <= 7) return 'text-green-600'
    if (days <= 30) return 'text-blue-600'
    if (days <= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <span>{isArabic ? 'إدارة العملاء' : 'CRM'}</span>
          <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
          <span>{isArabic ? 'التقارير' : 'Reports'}</span>
          <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
          <span className="text-foreground">
            {isArabic ? 'العملاء المحتملين المتفاعلين غير المحولين' : 'Prospects Engaged Not Converted'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
            {isArabic ? 'فلترة' : 'Filter'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{isArabic ? 'الأيام منذ آخر اتصال' : 'Days Since Contact'}</Label>
                <Input
                  type="number"
                  min="1"
                  value={filters.daysSinceContact}
                  onChange={(e) => setFilters({ ...filters, daysSinceContact: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? 'الحد الأدنى للتفاعلات' : 'Min Interactions'}</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minInteractions}
                  onChange={(e) => setFilters({ ...filters, minInteractions: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? 'مصدر العميل' : 'Lead Source'}</Label>
                <Select
                  value={filters.leadSource}
                  onValueChange={(value) => setFilters({ ...filters, leadSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'جميع المصادر' : 'All Sources'}</SelectItem>
                    <SelectItem value="website">{isArabic ? 'الموقع الإلكتروني' : 'Website'}</SelectItem>
                    <SelectItem value="referral">{isArabic ? 'إحالة' : 'Referral'}</SelectItem>
                    <SelectItem value="social">{isArabic ? 'وسائل التواصل' : 'Social Media'}</SelectItem>
                    <SelectItem value="ads">{isArabic ? 'إعلانات' : 'Advertising'}</SelectItem>
                    <SelectItem value="cold_call">{isArabic ? 'اتصال بارد' : 'Cold Call'}</SelectItem>
                    <SelectItem value="event">{isArabic ? 'حدث' : 'Event'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? 'مسؤول المبيعات' : 'Sales Person'}</Label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'الجميع' : 'All'}</SelectItem>
                    {/* In production, map through actual sales team members */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isArabic ? 'إجمالي العملاء' : 'Total Prospects'}
                </p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isArabic ? 'قيمة عالية' : 'High Value'}
                </p>
                <p className="text-2xl font-bold text-emerald-600">{summary.highValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isArabic ? 'بحاجة لمتابعة' : 'Needs Follow-up'}
                </p>
                <p className="text-2xl font-bold text-orange-600">{summary.needsFollowup}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isArabic ? 'متوسط التفاعلات' : 'Avg Interactions'}
                </p>
                <p className="text-2xl font-bold">{summary.avgInteractions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isArabic ? 'القيمة الإجمالية' : 'Total Value'}
                </p>
                <p className="text-xl font-bold">
                  {summary.totalValue.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} {isArabic ? 'ر.س' : 'SAR'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedLeads.length === engagedProspects.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="font-medium">
                  {isArabic ? `تم تحديد ${selectedLeads.length} عميل` : `${selectedLeads.length} selected`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('assign')}
                >
                  <UserPlus className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {isArabic ? 'تعيين' : 'Assign'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('campaign')}
                >
                  <Send className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {isArabic ? 'إضافة لحملة' : 'Add to Campaign'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('followup')}
                >
                  <Calendar className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {isArabic ? 'جدولة متابعة' : 'Schedule Follow-up'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleBulkAction('disqualify')}
                >
                  <XCircle className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {isArabic ? 'استبعاد' : 'Disqualify'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prospects Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'العملاء المحتملين المتفاعلين' : 'Engaged Prospects'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === engagedProspects.length && engagedProspects.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>{isArabic ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{isArabic ? 'الشركة' : 'Company'}</TableHead>
                <TableHead>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                <TableHead>{isArabic ? 'الهاتف' : 'Phone'}</TableHead>
                <TableHead>{isArabic ? 'المصدر' : 'Source'}</TableHead>
                <TableHead>{isArabic ? 'آخر نشاط' : 'Last Activity'}</TableHead>
                <TableHead>{isArabic ? 'الأيام منذ الاتصال' : 'Days Since Contact'}</TableHead>
                <TableHead>{isArabic ? 'التفاعلات' : 'Interactions'}</TableHead>
                <TableHead>{isArabic ? 'التقييم' : 'Score'}</TableHead>
                <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagedProspects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                    {isArabic ? 'لا توجد عملاء محتملين متفاعلين' : 'No engaged prospects found'}
                  </TableCell>
                </TableRow>
              ) : (
                engagedProspects.map((lead: any) => (
                  <TableRow key={lead._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead._id)}
                        onCheckedChange={() => handleSelectOne(lead._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{lead.displayName}</TableCell>
                    <TableCell>
                      {typeof lead.organizationId === 'object' && lead.organizationId?.legalName ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {lead.organizationId.legalName}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.email ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {lead.email}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {lead.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {lead.source?.type || (isArabic ? 'غير محدد' : 'Unknown')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.lastContactedAt ? (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-slate-400" />
                          {new Date(lead.lastContactedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getDaysSinceContactColor(lead.daysSinceContact)}`}>
                        {lead.daysSinceContact || 0} {isArabic ? 'يوم' : 'days'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {lead.activityCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLeadScoreColor(lead.qualification?.score)}>
                        {lead.qualification?.score || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <UserPlus className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {isArabic ? 'تعيين' : 'Assign'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {isArabic ? 'جدولة متابعة' : 'Schedule Follow-up'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {isArabic ? 'إضافة لحملة' : 'Add to Campaign'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {isArabic ? 'استبعاد' : 'Mark Disqualified'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
