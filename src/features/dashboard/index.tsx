// import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  Briefcase,
  Users,
  Scale,
  DollarSign,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ChevronLeft,
  GraduationCap,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  useDashboardStats,
  useDashboardHeroStats,
  useTodayEvents,
  useFinancialSummary,
  useRecentMessages,
} from '@/hooks/useDashboard'

export function Dashboard() {
  // const { t } = useTranslation()

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: heroStats, isLoading: heroLoading } = useDashboardHeroStats()
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents()
  const { data: financialSummary, isLoading: financialLoading } = useFinancialSummary()
  const { data: recentMessages, isLoading: messagesLoading } = useRecentMessages(3)

  const topNav = [
    {
      title: 'الرئيسية',
      href: 'dashboard/overview',
      isActive: true,
      disabled: false,
    },
    {
      title: 'التقويم',
      href: 'dashboard/calendar',
      isActive: false,
      disabled: true,
    },
    {
      title: 'المهام',
      href: 'dashboard/tasks',
      isActive: false,
      disabled: true,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center space-x-4'>
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* ===== Main ===== */}
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden">

        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-start">
              <h1 className="text-3xl font-bold leading-tight">مساء الخير، مشاري 👋</h1>
              {heroLoading ? (
                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <p className="text-slate-300 text-lg">
                  لديك <span className="text-white font-bold">{heroStats?.upcomingSessions || 0} جلسات</span>، <span className="text-white font-bold">{heroStats?.urgentTasks || 0} مهام عاجلة</span>، و <span className="text-white font-bold">{heroStats?.newMessages || 0} رسائل جديدة</span>.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0">
                <Plus className="ml-2 h-5 w-5" />
                قضية جديدة
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-11 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                <FileText className="ml-2 h-5 w-5" />
                فاتورة جديدة
              </Button>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
            </div>
          ) : statsError ? (
            <div className="col-span-full flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-5 w-5 ml-2" />
              <span>فشل تحميل الإحصائيات</span>
            </div>
          ) : (
            <>
              {/* Revenue */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">الإيرادات (هذا الشهر)</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.revenue.current.toLocaleString('ar-SA')} ر.س</div>
                  <p className={`text-xs flex items-center mt-1 font-bold ${stats?.revenue.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.revenue.percentageChange >= 0 ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                    {Math.abs(stats?.revenue.percentageChange || 0)}% من الشهر الماضي
                  </p>
                </CardContent>
              </Card>

              {/* Active Cases */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">القضايا النشطة</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Scale className="h-5 w-5 text-brand-blue" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.activeCases.total || 0} قضية</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {stats?.activeCases.requiresAction || 0} قضايا تتطلب إجراء
                  </p>
                </CardContent>
              </Card>

              {/* New Clients */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">العملاء الجدد</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">+{stats?.newClients.total || 0} عملاء</div>
                  <p className="text-xs text-purple-600 flex items-center mt-1 font-bold">
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                    +{stats?.newClients.thisWeek || 0} هذا الأسبوع
                  </p>
                </CardContent>
              </Card>

              {/* Unread Messages */}
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">الرسائل غير المقروءة</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">{stats?.unreadMessages.total || 0} رسائل</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    من {stats?.unreadMessages.uniqueClients || 0} عملاء مختلفين
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* RIGHT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Schedule / Calendar */}
            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-50">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-navy">جدول اليوم</CardTitle>
                  <CardDescription>الثلاثاء، 19 نوفمبر 2025</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                  عرض التقويم الكامل
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : !todayEvents || todayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Scale className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">لا توجد مواعيد اليوم</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {todayEvents.map((event) => (
                      <Link
                        key={event._id}
                        to="/tasks/$taskId"
                        params={{ taskId: event._id }}
                        className="flex items-center p-6 hover:bg-slate-50/80 transition-colors group cursor-pointer block"
                      >
                        <div className="w-20 font-bold text-slate-600 text-sm">{event.time}</div>
                        <div className={`w-1.5 h-12 rounded-full bg-${event.color}-500 mr-4 ml-2`}></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-navy text-lg group-hover:text-brand-blue transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {event.location}</span>
                            <span className={`bg-${event.color}-50 text-${event.color}-700 px-2 py-0.5 rounded-md font-bold`}>
                              {event.type === 'session' ? 'جلسة' : event.type === 'meeting' ? 'اجتماع' : 'موعد نهائي'}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-brand-blue">
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jobs & Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-brand-blue" />
                    فرص وظيفية جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-navy">مستشار قانوني (عقود)</h4>
                          <p className="text-xs text-slate-500 mt-1">شركة تقنية كبرى - الرياض</p>
                        </div>
                        <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-lg shadow-sm">جديد</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">دوام جزئي</span>
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">عن بعد</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full text-brand-blue hover:bg-blue-50 rounded-xl">تصفح جميع الفرص</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    التدريب والتطوير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <h4 className="font-bold text-navy">دورة صياغة العقود التجارية</h4>
                      <p className="text-xs text-slate-500 mt-1">مركز التدريب العدلي</p>
                      <div className="mt-3 w-full bg-white rounded-full h-2 overflow-hidden">
                        <div className="bg-purple-500 h-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-purple-600 font-bold mt-2 text-left">75% مكتمل</p>
                    </div>
                    <Button variant="ghost" className="w-full text-purple-600 hover:bg-purple-50 rounded-xl">متابعة التدريب</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* LEFT COLUMN (1/3) */}
          <div className="space-y-8">

            {/* Finance Summary */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  الملخص المالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600">
                          <ArrowDownRight className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-bold">الدخل المتوقع</p>
                          <p className="font-bold text-navy">{financialSummary?.expectedIncome.toLocaleString('ar-SA') || 0} ر.س</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-600">الفواتير المستحقة</h4>
                      {!financialSummary?.pendingInvoices || financialSummary.pendingInvoices.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">لا توجد فواتير مستحقة</p>
                      ) : (
                        financialSummary.pendingInvoices.map((inv) => (
                          <div key={inv._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-bold text-navy">{inv.clientName}</p>
                              <p className={`text-xs font-bold ${inv.isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                                {inv.isOverdue ? 'متأخر' : 'يستحق'} {new Date(inv.dueDate).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <span className="font-bold text-slate-700">{inv.amount.toLocaleString('ar-SA')}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <Button className="w-full bg-navy text-white hover:bg-navy/90 rounded-xl">الذهاب للمالية</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  الرسائل الأخيرة
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600">عرض الكل</Button>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                  </div>
                ) : !recentMessages || recentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">لا توجد رسائل حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentMessages.map((chat) => (
                      <div key={chat._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                          </Avatar>
                          {chat.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-sm text-navy truncate">{chat.name}</h5>
                            <span className="text-[10px] text-slate-400">{chat.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{chat.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </Main>
    </>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}