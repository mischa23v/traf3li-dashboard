import { useState, useMemo } from 'react'
import { ROUTES } from '@/constants/routes'
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
          <span>{t('crm.title')}</span>
          <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
          <span>{t('crm.reports')}</span>
          <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
          <span className="text-foreground">
            {t('crm.prospectsEngagedReport.title')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
            {t('crm.prospectsEngagedReport.filter')}
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
                <Label>{t('crm.prospectsEngagedReport.daysSinceContact')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={filters.daysSinceContact}
                  onChange={(e) => setFilters({ ...filters, daysSinceContact: parseInt(e.target.value) || 60 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('crm.prospectsEngagedReport.minInteractions')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minInteractions}
                  onChange={(e) => setFilters({ ...filters, minInteractions: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('crm.prospectsEngagedReport.leadSource')}</Label>
                <Select
                  value={filters.leadSource}
                  onValueChange={(value) => setFilters({ ...filters, leadSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('crm.prospectsEngagedReport.allSources')}</SelectItem>
                    <SelectItem value="website">{t('crm.leadSources.website')}</SelectItem>
                    <SelectItem value="referral">{t('crm.leadSources.referral')}</SelectItem>
                    <SelectItem value="social">{t('crm.leadSources.socialMedia')}</SelectItem>
                    <SelectItem value="ads">{t('crm.leadSources.advertising')}</SelectItem>
                    <SelectItem value="cold_call">{t('crm.leadSources.coldCall')}</SelectItem>
                    <SelectItem value="event">{t('crm.leadSources.event')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('crm.prospectsEngagedReport.salesPerson')}</Label>
                <Select
                  value={filters.assignedTo}
                  onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('crm.prospectsEngagedReport.all')}</SelectItem>
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
                  {t('crm.prospectsEngagedReport.totalProspects')}
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
                  {t('crm.prospectsEngagedReport.highValue')}
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
                  {t('crm.prospectsEngagedReport.needsFollowup')}
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
                  {t('crm.prospectsEngagedReport.avgInteractions')}
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
                  {t('crm.prospectsEngagedReport.totalValue')}
                </p>
                <p className="text-xl font-bold">
                  {summary.totalValue.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} {t('crm.prospectsEngagedReport.sar')}
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
                  {isArabic ? t('crm.prospectsEngagedReport.selectedArabic', { count: selectedLeads.length }) : t('crm.prospectsEngagedReport.selected', { count: selectedLeads.length })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('assign')}
                >
                  <UserPlus className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {t('crm.prospectsEngagedReport.assign')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('campaign')}
                >
                  <Send className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {t('crm.prospectsEngagedReport.addToCampaign')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('followup')}
                >
                  <Calendar className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {t('crm.prospectsEngagedReport.scheduleFollowup')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleBulkAction('disqualify')}
                >
                  <XCircle className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                  {t('crm.prospectsEngagedReport.disqualify')}
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
            {t('crm.prospectsEngagedReport.engagedProspects')}
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
                <TableHead>{t('crm.prospectsEngagedReport.name')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.company')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.email')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.phone')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.source')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.lastActivity')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.daysSinceContact')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.interactions')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.score')}</TableHead>
                <TableHead>{t('crm.prospectsEngagedReport.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {engagedProspects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                    {t('crm.prospectsEngagedReport.noEngagedProspects')}
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
                        {lead.source?.type || t('crm.prospectsEngagedReport.unknown')}
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
                        {lead.daysSinceContact || 0} {t('crm.prospectsEngagedReport.days')}
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
                            {t('crm.prospectsEngagedReport.assign')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {t('crm.prospectsEngagedReport.scheduleFollowup')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {t('crm.prospectsEngagedReport.addToCampaign')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className={`h-4 w-4 ${isArabic ? 'ms-2' : 'me-2'}`} />
                            {t('crm.prospectsEngagedReport.markDisqualified')}
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
