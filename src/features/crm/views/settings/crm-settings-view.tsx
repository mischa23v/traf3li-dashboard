/**
 * CRM General Settings View
 *
 * Features:
 * - Lead Settings (auto-assignment, scoring, pipeline)
 * - Opportunity Settings (probability by stage, weighted value)
 * - Quote Settings (number format, validity, signature)
 * - Activity Settings (placeholder - coming soon)
 * - Notification Settings (placeholder - coming soon)
 * - RTL and Arabic support
 * - Sticky save button footer
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  Loader2,
  AlertCircle,
  Target,
  TrendingUp,
  FileText,
  Bell,
  Calendar,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import {
  crmSettingsService,
  type LeadSettings,
  type OpportunitySettings,
  type QuoteSettings,
} from '@/services/crmSettingsService'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.general', href: '/dashboard/crm/settings/general' },
]

// Mock pipeline stages for opportunity probability settings
const MOCK_PIPELINE_STAGES = [
  { id: '1', name: 'Qualification', nameAr: 'التأهيل' },
  { id: '2', name: 'Needs Analysis', nameAr: 'تحليل الاحتياجات' },
  { id: '3', name: 'Proposal', nameAr: 'العرض' },
  { id: '4', name: 'Negotiation', nameAr: 'التفاوض' },
  { id: '5', name: 'Closed Won', nameAr: 'مغلقة - فوز' },
  { id: '6', name: 'Closed Lost', nameAr: 'مغلقة - خسارة' },
]

// Default probabilities by stage
const DEFAULT_PROBABILITIES: Record<string, number> = {
  '1': 10,
  '2': 25,
  '3': 50,
  '4': 75,
  '5': 100,
  '6': 0,
}

interface CrmSettingsFormData {
  // Lead Settings
  autoAssignEnabled: boolean
  leadScoringEnabled: boolean
  defaultPipeline: string

  // Opportunity Settings
  probabilityByStage: Record<string, number>
  weightedValueEnabled: boolean

  // Quote Settings
  quoteNumberPrefix: string
  defaultValidityDays: number
  requireSignature: boolean

  // Activity Settings (placeholder)
  defaultReminderTime: string
  workingHoursStart: string
  workingHoursEnd: string

  // Notification Settings (placeholder)
  notifyLeadAssigned: boolean
  notifyLeadStatusChange: boolean
  notifyQuoteAccepted: boolean
  notifyTaskDue: boolean
}

export function CrmSettingsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<CrmSettingsFormData>({
    // Lead Settings defaults
    autoAssignEnabled: false,
    leadScoringEnabled: false,
    defaultPipeline: '',

    // Opportunity Settings defaults
    probabilityByStage: DEFAULT_PROBABILITIES,
    weightedValueEnabled: true,

    // Quote Settings defaults
    quoteNumberPrefix: 'QT-',
    defaultValidityDays: 30,
    requireSignature: false,

    // Activity Settings defaults
    defaultReminderTime: '15min',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',

    // Notification Settings defaults
    notifyLeadAssigned: false,
    notifyLeadStatusChange: false,
    notifyQuoteAccepted: false,
    notifyTaskDue: false,
  })

  // Load settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)

      // Load all settings in parallel
      const [leadSettings, opportunitySettings, quoteSettings] =
        await Promise.all([
          crmSettingsService.getLeadSettings(),
          crmSettingsService.getOpportunitySettings(),
          crmSettingsService.getQuoteSettings(),
        ])

      setFormData((prev) => ({
        ...prev,
        // Lead Settings
        autoAssignEnabled: leadSettings.autoAssignEnabled || false,
        leadScoringEnabled: false, // Not in backend yet
        defaultPipeline: '', // Not in backend yet

        // Opportunity Settings
        probabilityByStage:
          opportunitySettings.probabilityByStage || DEFAULT_PROBABILITIES,
        weightedValueEnabled: opportunitySettings.requireProbability || true,

        // Quote Settings
        quoteNumberPrefix: quoteSettings.numberPrefix || 'QT-',
        defaultValidityDays: quoteSettings.expiryDays || 30,
        requireSignature: quoteSettings.requireApproval || false,
      }))
    } catch (error: any) {
      toast.error(t('errors.loadFailed', 'Failed to load settings'))
      console.error('Load settings error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save settings
  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Update all settings in parallel
      await Promise.all([
        // Lead Settings
        crmSettingsService.updateLeadSettings({
          autoAssignEnabled: formData.autoAssignEnabled,
        }),

        // Opportunity Settings
        crmSettingsService.updateOpportunitySettings({
          probabilityByStage: formData.probabilityByStage,
          requireProbability: formData.weightedValueEnabled,
        }),

        // Quote Settings
        crmSettingsService.updateQuoteSettings({
          numberPrefix: formData.quoteNumberPrefix,
          expiryDays: formData.defaultValidityDays,
          requireApproval: formData.requireSignature,
        }),
      ])

      toast.success(t('common.saveSuccess', 'Settings saved successfully'))
    } catch (error: any) {
      toast.error(t('errors.saveFailed', 'Failed to save settings'))
      console.error('Save settings error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Update field helper
  const updateField = <K extends keyof CrmSettingsFormData>(
    field: K,
    value: CrmSettingsFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Update probability for specific stage
  const updateStageProbability = (stageId: string, probability: number) => {
    setFormData((prev) => ({
      ...prev,
      probabilityByStage: {
        ...prev.probabilityByStage,
        [stageId]: Math.min(100, Math.max(0, probability)),
      },
    }))
  }

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
        >
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl pb-24"
      >
        <ProductivityHero
          badge={t('crm.badge', 'إدارة العملاء')}
          title={t('crm.settings.general', 'الإعدادات العامة')}
          type="crm"
          hideButtons
        />

        <div className="space-y-6 max-w-5xl">
          {/* Lead Settings Section */}
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {t('crm.settings.leadSettings', 'Lead Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'crm.settings.leadSettingsDesc',
                      'Configure lead assignment and scoring'
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Auto-assignment */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-assign" className="text-base font-medium">
                    {t('crm.settings.autoAssignment', 'Auto-assignment Enabled')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'crm.settings.autoAssignmentDesc',
                      'Automatically assign new leads to team members'
                    )}
                  </p>
                </div>
                <Switch
                  id="auto-assign"
                  checked={formData.autoAssignEnabled}
                  onCheckedChange={(checked) =>
                    updateField('autoAssignEnabled', checked)
                  }
                />
              </div>

              {/* Lead Scoring - Placeholder */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl opacity-50">
                <div className="space-y-0.5">
                  <Label htmlFor="lead-scoring" className="text-base font-medium">
                    {t('crm.settings.leadScoring', 'Lead Scoring Enabled')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'crm.settings.leadScoringDesc',
                      'Enable lead scoring based on engagement'
                    )}
                  </p>
                </div>
                <Switch id="lead-scoring" disabled />
              </div>

              {/* Default Pipeline - Placeholder */}
              <div className="space-y-2 opacity-50">
                <Label htmlFor="default-pipeline">
                  {t('crm.settings.defaultPipeline', 'Default Pipeline')}
                </Label>
                <Select disabled>
                  <SelectTrigger id="default-pipeline" className="rounded-xl">
                    <SelectValue
                      placeholder={t(
                        'crm.settings.selectPipeline',
                        'Select pipeline'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Pipeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert className="rounded-xl border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  {t(
                    'crm.settings.leadSettingsNote',
                    'Lead scoring and default pipeline features are coming soon.'
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Opportunity Settings Section */}
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {t('crm.settings.opportunitySettings', 'Opportunity Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'crm.settings.opportunitySettingsDesc',
                      'Configure probability and value calculations'
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Probability by Stage Table */}
              <div className="space-y-2">
                <Label>
                  {t('crm.settings.probabilityByStage', 'Probability by Stage')}
                </Label>
                <div className="rounded-xl border bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('crm.settings.stage', 'Stage')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('crm.settings.probability', 'Probability (%)')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PIPELINE_STAGES.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell className="font-medium">
                            {isRTL ? stage.nameAr : stage.name}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={formData.probabilityByStage[stage.id] || 0}
                              onChange={(e) =>
                                updateStageProbability(
                                  stage.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-24 rounded-lg text-right ml-auto"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Weighted Value Calculation */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="space-y-0.5">
                  <Label htmlFor="weighted-value" className="text-base font-medium">
                    {t(
                      'crm.settings.weightedValue',
                      'Weighted Value Calculation'
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'crm.settings.weightedValueDesc',
                      'Calculate opportunity value based on stage probability'
                    )}
                  </p>
                </div>
                <Switch
                  id="weighted-value"
                  checked={formData.weightedValueEnabled}
                  onCheckedChange={(checked) =>
                    updateField('weightedValueEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Settings Section */}
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {t('crm.settings.quoteSettings', 'Quote Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'crm.settings.quoteSettingsDesc',
                      'Configure quote numbering and validation'
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quote Number Format */}
              <div className="space-y-2">
                <Label htmlFor="quote-prefix">
                  {t('crm.settings.quoteNumberFormat', 'Quote Number Prefix')}
                </Label>
                <Input
                  id="quote-prefix"
                  value={formData.quoteNumberPrefix}
                  onChange={(e) =>
                    updateField('quoteNumberPrefix', e.target.value)
                  }
                  placeholder="QT-"
                  className="rounded-xl max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {t(
                    'crm.settings.quoteNumberFormatExample',
                    'Example: QT-0001, QT-0002'
                  )}
                </p>
              </div>

              {/* Default Validity Period */}
              <div className="space-y-2">
                <Label htmlFor="validity-days">
                  {t('crm.settings.defaultValidity', 'Default Validity Period')}
                </Label>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input
                    id="validity-days"
                    type="number"
                    min={1}
                    max={365}
                    value={formData.defaultValidityDays}
                    onChange={(e) =>
                      updateField('defaultValidityDays', parseInt(e.target.value) || 30)
                    }
                    className="rounded-xl"
                  />
                  <span className="text-sm text-muted-foreground">
                    {t('common.days', 'days')}
                  </span>
                </div>
              </div>

              {/* Require Signature */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="space-y-0.5">
                  <Label htmlFor="require-signature" className="text-base font-medium">
                    {t('crm.settings.requireSignature', 'Require Signature')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'crm.settings.requireSignatureDesc',
                      'Require approval signature for quotes'
                    )}
                  </p>
                </div>
                <Switch
                  id="require-signature"
                  checked={formData.requireSignature}
                  onCheckedChange={(checked) =>
                    updateField('requireSignature', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Settings Section - Placeholder */}
          <Card className="rounded-3xl border-0 shadow-sm opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {t('crm.settings.activitySettings', 'Activity Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'crm.settings.activitySettingsDesc',
                      'Configure reminders and working hours'
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default Reminder Time */}
              <div className="space-y-2">
                <Label htmlFor="reminder-time">
                  {t('crm.settings.defaultReminderTime', 'Default Reminder Time')}
                </Label>
                <Select disabled>
                  <SelectTrigger id="reminder-time" className="rounded-xl max-w-xs">
                    <SelectValue placeholder="15 minutes before" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">15 minutes before</SelectItem>
                    <SelectItem value="30min">30 minutes before</SelectItem>
                    <SelectItem value="1hr">1 hour before</SelectItem>
                    <SelectItem value="1day">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Working Hours */}
              <div className="space-y-2">
                <Label>{t('crm.settings.workingHours', 'Working Hours')}</Label>
                <div className="flex items-center gap-4 max-w-md">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="start-time" className="text-xs text-muted-foreground">
                      {t('common.start', 'Start')}
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      disabled
                      value="09:00"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="end-time" className="text-xs text-muted-foreground">
                      {t('common.end', 'End')}
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      disabled
                      value="17:00"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Alert className="rounded-xl border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-900">
                  {t(
                    'crm.settings.activitySettingsNote',
                    'Activity settings features are coming soon.'
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Notification Settings Section - Placeholder */}
          <Card className="rounded-3xl border-0 shadow-sm opacity-60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {t('crm.settings.notificationSettings', 'Notification Settings')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'crm.settings.notificationSettingsDesc',
                      'Configure email notifications for CRM events'
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Triggers */}
              <div className="space-y-3">
                <Label>
                  {t('crm.settings.emailTriggers', 'Email Notification Triggers')}
                </Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <Label htmlFor="notify-lead-assigned" className="text-sm font-normal">
                      {t('crm.settings.notifyLeadAssigned', 'Lead assigned')}
                    </Label>
                    <Switch id="notify-lead-assigned" disabled />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <Label htmlFor="notify-lead-status" className="text-sm font-normal">
                      {t('crm.settings.notifyLeadStatusChange', 'Lead status change')}
                    </Label>
                    <Switch id="notify-lead-status" disabled />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <Label htmlFor="notify-quote" className="text-sm font-normal">
                      {t(
                        'crm.settings.notifyQuoteAcceptedRejected',
                        'Quote accepted/rejected'
                      )}
                    </Label>
                    <Switch id="notify-quote" disabled />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <Label htmlFor="notify-task-due" className="text-sm font-normal">
                      {t('crm.settings.notifyTaskDue', 'Task due reminder')}
                    </Label>
                    <Switch id="notify-task-due" disabled />
                  </div>
                </div>
              </div>

              <Alert className="rounded-xl border-pink-200 bg-pink-50">
                <Info className="h-4 w-4 text-pink-600" />
                <AlertDescription className="text-sm text-pink-900">
                  {t(
                    'crm.settings.notificationSettingsNote',
                    'Email notification features are coming soon.'
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Save Button Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/80 backdrop-blur-lg">
          <div className="container flex items-center justify-end gap-4 p-4">
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving', 'Saving...')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save', 'Save Settings')}
                </>
              )}
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}
