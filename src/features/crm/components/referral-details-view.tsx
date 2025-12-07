import { useState } from 'react'
import {
  FileText,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Trash2,
  Edit3,
  Loader2,
  Search,
  Bell,
  AlertCircle,
  Phone,
  Mail,
  DollarSign,
  Gift,
  Users,
  CheckCircle2,
  Link as LinkIcon,
  Star,
  Building,
  TrendingUp,
  Percent,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useReferral, useDeleteReferral, useUpdateReferral, useRecordReferralPayment } from '@/hooks/useCrm'
import { ProductivityHero } from '@/components/productivity-hero'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import type { ReferralStatus, ReferralType, ReferredLead } from '@/types/crm'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { SalesSidebar } from './sales-sidebar'

const statusLabels: Record<ReferralStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط',
  archived: 'مؤرشف',
}

const statusColors: Record<ReferralStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-700',
  archived: 'bg-red-100 text-red-700',
}

const typeLabels: Record<ReferralType, string> = {
  client: 'عميل',
  lawyer: 'محامي',
  law_firm: 'مكتب محاماة',
  contact: 'جهة اتصال',
  employee: 'موظف',
  partner: 'شريك',
  organization: 'منظمة',
  other: 'آخر',
}

const feeTypeLabels: Record<string, string> = {
  percentage: 'نسبة مئوية',
  fixed: 'مبلغ ثابت',
  tiered: 'متدرج',
  none: 'لا يوجد',
}

const leadStatusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  converted: 'تم التحويل',
  lost: 'خسارة',
}

export function ReferralDetailsView() {
  const { referralId } = useParams({ strict: false }) as { referralId: string }
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch referral data
  const { data: referralData, isLoading, isError, error, refetch } = useReferral(referralId)

  // Mutations
  const deleteReferralMutation = useDeleteReferral()
  const updateReferralMutation = useUpdateReferral()

  const handleDelete = () => {
    deleteReferralMutation.mutate(referralId, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/referrals' })
      },
    })
  }

  const handleStatusChange = (status: ReferralStatus) => {
    updateReferralMutation.mutate({ referralId, data: { status } })
  }

  // Transform API data
  const referral = referralData?.referral

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: true },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
  ]

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
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/crm/referrals"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة مصادر الإحالة
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
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                حدث خطأ أثناء تحميل بيانات مصدر الإحالة
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
        {!isLoading && !isError && !referral && (
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <LinkIcon className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                مصدر الإحالة غير موجود
              </h3>
              <p className="text-slate-500 mb-4">
                لم يتم العثور على مصدر الإحالة المطلوب
              </p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                <Link to="/dashboard/crm/referrals">العودة إلى القائمة</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && referral && (
          <>
            {/* Referral Hero Content */}
            <ProductivityHero badge="إدارة مصادر الإحالة" title={referral.nameAr || referral.name} type="referrals" listMode={true} hideButtons={true}>
              <div className="flex flex-wrap gap-3">
                <Link to={`/dashboard/crm/referrals/${referralId}/edit`}>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    <Edit3 className="h-4 w-4 ms-2" />
                    تعديل
                  </Button>
                </Link>
                <Select
                  value={referral.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as ReferralStatus)
                  }
                >
                  <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="تغيير الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
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
                      disabled={deleteReferralMutation.isPending}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleteReferralMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'تأكيد'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ProductivityHero>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CENTER CONTENT (Tabs & Details) */}
                <div className="lg:col-span-2">
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[500px]">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <div className="border-b border-slate-100 px-6 pt-4">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                          {['overview', 'leads', 'payments', 'notes'].map((tab) => (
                            <TabsTrigger
                              key={tab}
                              value={tab}
                              className="
                                data-[state=active]:bg-transparent data-[state=active]:shadow-none
                                data-[state=active]:border-b-2 data-[state=active]:border-purple-500
                                data-[state=active]:text-purple-600
                                text-slate-500 font-medium text-base pb-4 rounded-none px-2
                              "
                            >
                              {tab === 'overview'
                                ? 'نظرة عامة'
                                : tab === 'leads'
                                  ? 'العملاء المحالين'
                                  : tab === 'payments'
                                    ? 'الدفعات'
                                    : 'الملاحظات'}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="p-6 bg-slate-50/50 min-h-[400px]">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                          {/* Contact Info */}
                          {referral.externalSource && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                              <CardHeader>
                                <CardTitle className="text-lg font-bold text-navy">
                                  معلومات التواصل
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {referral.externalSource.name && (
                                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                    <User className="h-5 w-5 text-purple-500" />
                                    <div>
                                      <p className="text-xs text-slate-500">الاسم</p>
                                      <p className="font-medium text-navy">{referral.externalSource.name}</p>
                                    </div>
                                  </div>
                                )}
                                {referral.externalSource.phone && (
                                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-green-500" />
                                    <div>
                                      <p className="text-xs text-slate-500">الهاتف</p>
                                      <p className="font-medium text-navy" dir="ltr">{referral.externalSource.phone}</p>
                                    </div>
                                  </div>
                                )}
                                {referral.externalSource.email && (
                                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue-500" />
                                    <div>
                                      <p className="text-xs text-slate-500">البريد</p>
                                      <p className="font-medium text-navy">{referral.externalSource.email}</p>
                                    </div>
                                  </div>
                                )}
                                {referral.externalSource.company && (
                                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                    <Building className="h-5 w-5 text-orange-500" />
                                    <div>
                                      <p className="text-xs text-slate-500">الشركة</p>
                                      <p className="font-medium text-navy">{referral.externalSource.company}</p>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">تاريخ الإنشاء</p>
                              <p className="text-lg font-bold text-navy">
                                {format(new Date(referral.createdAt), 'dd/MM/yyyy', { locale: ar })}
                              </p>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">إجمالي العمولات</p>
                              <p className="text-lg font-bold text-green-600">
                                {(referral.totalFeesOwed || 0).toLocaleString('ar-SA')} ر.س
                              </p>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">الأولوية</p>
                              <Badge className={
                                referral.priority === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                                  referral.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    referral.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                      'bg-slate-100 text-slate-700'
                              }>
                                {referral.priority === 'vip' ? 'VIP' :
                                  referral.priority === 'high' ? 'عالي' :
                                    referral.priority === 'normal' ? 'عادي' : 'منخفض'}
                              </Badge>
                            </Card>
                            <Card className="border-none shadow-sm bg-white rounded-2xl p-4">
                              <p className="text-xs text-slate-500 mb-1">التقييم</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= (referral.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                                  />
                                ))}
                              </div>
                            </Card>
                          </div>
                        </TabsContent>

                        <TabsContent value="leads" className="mt-0 space-y-4">
                          {referral.referredLeads && referral.referredLeads.length > 0 ? (
                            referral.referredLeads.map((lead: ReferredLead, index: number) => (
                              <Card key={lead.leadId || index} className="border-none shadow-sm bg-white rounded-2xl p-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                      <Users className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-navy">عميل محتمل #{index + 1}</p>
                                      <Badge className={
                                        lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                                          lead.status === 'lost' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                      }>
                                        {leadStatusLabels[lead.status]}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-left">
                                    {lead.caseValue && (
                                      <p className="text-sm text-slate-500">
                                        قيمة: {lead.caseValue.toLocaleString('ar-SA')} ر.س
                                      </p>
                                    )}
                                    {lead.feeAmount && (
                                      <p className="text-sm font-bold text-green-600">
                                        عمولة: {lead.feeAmount.toLocaleString('ar-SA')} ر.س
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500">لا توجد إحالات بعد</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="payments" className="mt-0 space-y-4">
                          {referral.feePayments && referral.feePayments.length > 0 ? (
                            referral.feePayments.map((payment, index: number) => (
                              <Card key={index} className="border-none shadow-sm bg-white rounded-2xl p-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-green-600 text-lg">
                                        {payment.amount.toLocaleString('ar-SA')} ر.س
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        {format(new Date(payment.date), 'dd MMMM yyyy', { locale: ar })}
                                      </p>
                                    </div>
                                  </div>
                                  {payment.method && (
                                    <Badge variant="outline">{payment.method}</Badge>
                                  )}
                                </div>
                                {payment.notes && (
                                  <p className="mt-3 text-sm text-slate-600 pe-13">{payment.notes}</p>
                                )}
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-12">
                              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500">لا توجد دفعات بعد</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader>
                              <CardTitle className="text-lg font-bold text-navy">
                                الملاحظات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {referral.notes || 'لا توجد ملاحظات'}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Tags */}
                          {referral.tags && referral.tags.length > 0 && (
                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden mt-6">
                              <CardHeader>
                                <CardTitle className="text-lg font-bold text-navy">
                                  الوسوم
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {referral.tags.map((tag: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="rounded-full">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </Card>
                </div>

                {/* SIDEBAR */}
                <SalesSidebar context="referrals" />
              </div>
          </>
        )}
      </Main>
    </>
  )
}
