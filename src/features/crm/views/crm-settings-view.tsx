/**
 * Comprehensive CRM Settings View
 *
 * Main settings page with 10 comprehensive sections:
 * 1. General Settings - currency, language, timezone, date format
 * 2. Lead Settings - sources, scoring rules, assignment, duplicate detection
 * 3. Pipeline Settings - stages, requirements, win/loss reasons
 * 4. Quote Settings - numbering, validity, payment terms, approval
 * 5. Activity Settings - types, reminders, calendar sync
 * 6. Campaign Settings - types, budget defaults, ROI thresholds
 * 7. Referral Settings - programs, commission rates, reward types
 * 8. Email Settings - templates, signature, tracking
 * 9. Notification Settings - email, in-app, SMS notifications
 * 10. Integration Settings - WhatsApp, Calendar, Email provider
 *
 * Features:
 * - Tabbed interface for easy navigation
 * - Full bilingual support (Arabic/English)
 * - Standalone with mock data/state
 * - Follows Sales Settings pattern
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Target,
  GitBranch,
  FileText,
  Calendar,
  Megaphone,
  Users,
  Mail,
  Bell,
  Plug,
  Save,
  Loader2,
  AlertCircle,
  Download,
  Upload,
  Globe,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'

import {
  useCrmSettingsComprehensive,
  useUpdateCrmSettingsComprehensive,
  useExportCrmSettings,
} from '@/hooks/useCrmSettingsComprehensive'
import {
  DEFAULT_COMPREHENSIVE_CRM_SETTINGS,
  type ComprehensiveCrmSettings,
} from '@/types/crmSettingsComprehensive'

// Import section components
import { GeneralCrmSettingsSection } from './crm-settings/general-settings-section'
import { LeadCrmSettingsSection } from './crm-settings/lead-settings-section'
import { PipelineCrmSettingsSection } from './crm-settings/pipeline-settings-section'
import { QuoteCrmSettingsSection } from './crm-settings/quote-settings-section'
import { ActivityCrmSettingsSection } from './crm-settings/activity-settings-section'
import { CampaignCrmSettingsSection } from './crm-settings/campaign-settings-section'
import { ReferralCrmSettingsSection } from './crm-settings/referral-settings-section'
import { EmailCrmSettingsSection } from './crm-settings/email-settings-section'
import { NotificationCrmSettingsSection } from './crm-settings/notification-settings-section'
import { IntegrationCrmSettingsSection } from './crm-settings/integration-settings-section'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'CRM Settings', href: '/dashboard/crm/settings' },
]

export function CrmSettingsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const { data: settingsData, isLoading } = useCrmSettingsComprehensive()
  const updateSettingsMutation = useUpdateCrmSettingsComprehensive()
  const exportSettingsMutation = useExportCrmSettings()

  const [formData, setFormData] = useState<ComprehensiveCrmSettings>(
    DEFAULT_COMPREHENSIVE_CRM_SETTINGS
  )

  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData)
    }
  }, [settingsData])

  const handleSectionChange = (section: keyof ComprehensiveCrmSettings, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync({
      section: 'all',
      data: formData,
    })
  }

  const handleExport = async () => {
    await exportSettingsMutation.mutateAsync()
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
            <Skeleton className="h-[600px] w-full rounded-3xl" />
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
          badge={isRTL ? 'إدارة العملاء' : 'CRM'}
          title={isRTL ? 'إعدادات CRM الشاملة' : 'Comprehensive CRM Settings'}
          type="crm"
          hideButtons
        />

        <div className="max-w-6xl mx-auto">
          {/* Backend Integration Notice */}
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900 rounded-3xl">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="space-y-2">
                <p dir={isRTL ? 'rtl' : 'ltr'}>
                  <strong>[BACKEND-PENDING]</strong>{' '}
                  {isRTL
                    ? 'هذه الصفحة قيد التطوير. التغييرات ستُحفظ محليًا حتى يتم ربط API.'
                    : 'This page is under development. Changes will be saved locally until the API is connected.'}
                </p>
                <p className="text-xs font-mono" dir="ltr">
                  Required endpoints: GET/PUT /api/crm/settings/comprehensive
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-10 h-auto gap-1 mb-6 bg-white dark:bg-slate-800 p-1 rounded-2xl">
                <TabsTrigger
                  value="general"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'عام' : 'General'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="leads"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Target className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'العملاء المحتملين' : 'Leads'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="pipeline"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <GitBranch className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'خط الأنابيب' : 'Pipeline'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quotes"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'العروض' : 'Quotes'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الأنشطة' : 'Activities'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Megaphone className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الحملات' : 'Campaigns'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="referrals"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الإحالات' : 'Referrals'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'البريد' : 'Email'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="flex flex-col items-center gap-1 py-2 data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl"
                >
                  <Plug className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'التكاملات' : 'Integrations'}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralCrmSettingsSection
                  settings={formData.general}
                  onChange={(data) => handleSectionChange('general', data)}
                />
              </TabsContent>

              <TabsContent value="leads">
                <LeadCrmSettingsSection
                  settings={formData.leads}
                  onChange={(data) => handleSectionChange('leads', data)}
                />
              </TabsContent>

              <TabsContent value="pipeline">
                <PipelineCrmSettingsSection
                  settings={formData.pipeline}
                  onChange={(data) => handleSectionChange('pipeline', data)}
                />
              </TabsContent>

              <TabsContent value="quotes">
                <QuoteCrmSettingsSection
                  settings={formData.quotes}
                  onChange={(data) => handleSectionChange('quotes', data)}
                />
              </TabsContent>

              <TabsContent value="activities">
                <ActivityCrmSettingsSection
                  settings={formData.activities}
                  onChange={(data) => handleSectionChange('activities', data)}
                />
              </TabsContent>

              <TabsContent value="campaigns">
                <CampaignCrmSettingsSection
                  settings={formData.campaigns}
                  onChange={(data) => handleSectionChange('campaigns', data)}
                />
              </TabsContent>

              <TabsContent value="referrals">
                <ReferralCrmSettingsSection
                  settings={formData.referrals}
                  onChange={(data) => handleSectionChange('referrals', data)}
                />
              </TabsContent>

              <TabsContent value="email">
                <EmailCrmSettingsSection
                  settings={formData.email}
                  onChange={(data) => handleSectionChange('email', data)}
                />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationCrmSettingsSection
                  settings={formData.notifications}
                  onChange={(data) => handleSectionChange('notifications', data)}
                />
              </TabsContent>

              <TabsContent value="integrations">
                <IntegrationCrmSettingsSection
                  settings={formData.integrations}
                  onChange={(data) => handleSectionChange('integrations', data)}
                />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={exportSettingsMutation.isPending}
                className="rounded-xl"
              >
                {exportSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 me-2" />
                )}
                {isRTL ? 'تصدير الإعدادات' : 'Export Settings'}
              </Button>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl min-w-[150px]"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ms-2" />
                    {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
