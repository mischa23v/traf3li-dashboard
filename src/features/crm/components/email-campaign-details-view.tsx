import { useState } from 'react'
import {
  Mail,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Clock,
  ArrowLeft,
  Send,
  Pause,
  Play,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Eye,
  MousePointer,
  XCircle,
  UserX,
  CheckCircle,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { sanitizeHtml } from '@/utils/sanitize'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmailCampaign, useCampaignAnalytics, useSendCampaign, usePauseCampaign, useResumeCampaign } from '@/hooks/useCrmAdvanced'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search, Bell } from 'lucide-react'
import type { CampaignStatus } from '@/types/crm-advanced'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalesSidebar } from './sales-sidebar'

const statusLabels: Record<CampaignStatus, string> = {
  draft: 'مسودة',
  scheduled: 'مجدولة',
  sending: 'جارٍ الإرسال',
  sent: 'تم الإرسال',
  paused: 'متوقفة',
  cancelled: 'ملغاة',
}

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-amber-100 text-amber-700',
  sent: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function EmailCampaignDetailsView() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch campaign data
  const { data: campaignData, isLoading, isError, error, refetch } = useEmailCampaign(campaignId)
  const { data: analyticsData } = useCampaignAnalytics(campaignId)

  // Mutations
  const sendCampaignMutation = useSendCampaign()
  const pauseCampaignMutation = usePauseCampaign()
  const resumeCampaignMutation = useResumeCampaign()

  const handleSend = () => {
    if (confirm('هل تريد إرسال هذه الحملة الآن؟')) {
      sendCampaignMutation.mutate(campaignId)
    }
  }

  const handlePause = () => {
    pauseCampaignMutation.mutate(campaignId)
  }

  const handleResume = () => {
    resumeCampaignMutation.mutate(campaignId)
  }

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
      // TODO: Implement delete mutation
      navigate({ to: ROUTES.dashboard.crm.emailMarketing.list })
    }
  }

  // Transform API data
  const campaign = campaignData?.data
  const analytics = analyticsData?.data || campaign?.analytics

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'خط المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'التسويق عبر البريد', href: ROUTES.dashboard.crm.emailMarketing.list, isActive: true },
    { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
  ]

  // Calculate metrics
  const metrics = analytics ? {
    deliveryRate: analytics.sent > 0 ? (analytics.delivered / analytics.sent) * 100 : 0,
    openRate: analytics.sent > 0 ? (analytics.opened / analytics.sent) * 100 : 0,
    clickRate: analytics.sent > 0 ? (analytics.clicked / analytics.sent) * 100 : 0,
    bounceRate: analytics.sent > 0 ? (analytics.bounced / analytics.sent) * 100 : 0,
    unsubscribeRate: analytics.sent > 0 ? (analytics.unsubscribed / analytics.sent) * 100 : 0,
  } : null

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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="التنبيهات"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to={ROUTES.dashboard.crm.emailMarketing.list}
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة الحملات
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
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
        {isError && (
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                حدث خطأ أثناء تحميل بيانات الحملة
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || 'تعذر الاتصال بالخادم'}
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !campaign && (
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                الحملة غير موجودة
              </h3>
              <p className="text-slate-500 mb-4">
                لم يتم العثور على الحملة المطلوبة
              </p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link to={ROUTES.dashboard.crm.emailMarketing.list}>العودة إلى القائمة</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && campaign && (
          <>
            {/* Campaign Hero Content */}
            <ProductivityHero badge="CRM" title={campaign.name} type="email-marketing" listMode={true} hideButtons={true}>
              <div className="flex flex-wrap gap-3">
                <Badge className={statusColors[campaign.status as CampaignStatus]}>
                  {statusLabels[campaign.status as CampaignStatus]}
                </Badge>

                {campaign.status === 'draft' && (
                  <>
                    <Link to={ROUTES.dashboard.crm.emailMarketing.new} search={{ editId: campaignId }}>
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                      >
                        <Edit3 className="h-4 w-4 ms-2" aria-hidden="true" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSend}
                      disabled={sendCampaignMutation.isPending}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-0"
                    >
                      {sendCampaignMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4 ms-2" aria-hidden="true" />
                      )}
                      إرسال الآن
                    </Button>
                  </>
                )}

                {campaign.status === 'sending' && (
                  <Button
                    onClick={handlePause}
                    disabled={pauseCampaignMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg border-0"
                  >
                    {pauseCampaignMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                    ) : (
                      <Pause className="h-4 w-4 ms-2" aria-hidden="true" />
                    )}
                    إيقاف مؤقت
                  </Button>
                )}

                {campaign.status === 'paused' && (
                  <Button
                    onClick={handleResume}
                    disabled={resumeCampaignMutation.isPending}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-0"
                  >
                    {resumeCampaignMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4 ms-2" aria-hidden="true" />
                    )}
                    استئناف
                  </Button>
                )}

                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    aria-label="حذف"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="border-white/10 text-white hover:bg-white/10"
                    >
                      إلغاء
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      تأكيد
                    </Button>
                  </div>
                )}
              </div>
            </ProductivityHero>

            {/* Analytics Cards - Full Width */}
            {analytics && analytics.sent > 0 && metrics && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Send className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">تم الإرسال</p>
                        <p className="text-2xl font-bold text-navy">{analytics.sent}</p>
                      </div>
                    </div>
                    <Progress value={100} className="h-1" />
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">تم التسليم</p>
                        <p className="text-2xl font-bold text-navy">{analytics.delivered}</p>
                      </div>
                    </div>
                    <Progress value={metrics.deliveryRate} className="h-1" />
                    <p className="text-xs text-slate-500 mt-1">{metrics.deliveryRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">معدل الفتح</p>
                        <p className="text-2xl font-bold text-navy">{analytics.opened}</p>
                      </div>
                    </div>
                    <Progress value={metrics.openRate} className="h-1" />
                    <p className="text-xs text-slate-500 mt-1">{metrics.openRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-orange-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">معدل النقر</p>
                        <p className="text-2xl font-bold text-navy">{analytics.clicked}</p>
                      </div>
                    </div>
                    <Progress value={metrics.clickRate} className="h-1" />
                    <p className="text-xs text-slate-500 mt-1">{metrics.clickRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">الارتداد</p>
                        <p className="text-2xl font-bold text-navy">{analytics.bounced}</p>
                      </div>
                    </div>
                    <Progress value={metrics.bounceRate} className="h-1 bg-red-100" />
                    <p className="text-xs text-slate-500 mt-1">{metrics.bounceRate.toFixed(1)}%</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CENTER CONTENT (Tabs & Details) */}
              <div className="lg:col-span-2">
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <div className="border-b border-slate-100 px-6 pt-4">
                      <TabsList className="bg-transparent h-auto p-0 gap-6">
                        {['overview', 'content', 'recipients', 'history'].map(
                          (tab) => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="
                                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                data-[state=active]:border-b-2 data-[state=active]:border-emerald-500
                                data-[state=active]:text-emerald-600
                                text-slate-500 font-medium text-base pb-4 rounded-none px-2
                              "
                            >
                              {tab === 'overview'
                                ? 'نظرة عامة'
                                : tab === 'content'
                                  ? 'المحتوى'
                                  : tab === 'recipients'
                                    ? 'المستلمون'
                                    : 'السجل'}
                            </TabsTrigger>
                          )
                        )}
                      </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Campaign Info */}
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              معلومات الحملة
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">الموضوع</p>
                                <p className="font-medium text-navy">{campaign.subject}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">المرسل</p>
                                <p className="font-medium text-navy">
                                  {campaign.fromName} ({campaign.fromEmail})
                                </p>
                              </div>
                            </div>

                            {campaign.scheduledFor && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">موعد الإرسال</p>
                                <p className="font-medium text-navy flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                  {format(new Date(campaign.scheduledFor), 'd MMMM yyyy, h:mm a', { locale: ar })}
                                </p>
                              </div>
                            )}

                            {campaign.sentAt && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">تاريخ الإرسال</p>
                                <p className="font-medium text-navy flex items-center gap-2">
                                  <Send className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                  {format(new Date(campaign.sentAt), 'd MMMM yyyy, h:mm a', { locale: ar })}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="content" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              محتوى الرسالة
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {campaign.htmlContent && (
                              <div className="p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-2">معاينة HTML</p>
                                <div
                                  className="prose max-w-none bg-white p-4 rounded-lg border border-slate-200"
                                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(campaign.htmlContent) }}
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="recipients" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                              <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                              قائمة المستلمين
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center p-8">
                              <p className="text-slate-500">
                                عدد المستلمين: {campaign.recipientCount || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="history" className="mt-0 space-y-6">
                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                          <CardHeader>
                            <CardTitle className="text-lg font-bold text-navy">
                              سجل الإرسال
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center p-8">
                              <p className="text-slate-500">لا يوجد سجل متاح</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>

              {/* SIDEBAR */}
              <SalesSidebar context="email-marketing" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
