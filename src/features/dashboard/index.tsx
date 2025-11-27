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
      <Header className="bg-emerald-950 shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-emerald-200 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="بحث..." className="h-11 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" aria-label="الإشعارات" className="relative rounded-full text-emerald-200 hover:bg-white/10 hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-emerald-950"></span>
          </Button>
          <LanguageSwitcher className="text-emerald-200 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-emerald-200 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-emerald-200 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-emerald-200 hover:bg-white/10 hover:text-white" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      {/* ===== Main ===== */}
      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden">

        {/* HERO BANNER */}
        <div className="bg-emerald-950 rounded-2xl p-6 lg:p-8 relative overflow-hidden text-white group">
          <div className="absolute -bottom-32 -start-32 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-30 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Decorative Icons */}
            <div className="hidden lg:flex items-center justify-center w-48 h-48 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl" />
              <div className="absolute w-32 h-32 bg-emerald-900/50 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6">
                <Scale className="w-16 h-16 text-teal-400" />
              </div>
              <div className="absolute w-32 h-32 bg-emerald-900/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6">
                <Briefcase className="w-16 h-16 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1 space-y-3 text-center lg:text-end">
              <h1 className="text-2xl lg:text-3xl font-bold leading-relaxed">مساء الخير، مشاري</h1>
              {heroLoading ? (
                <div className="flex items-center justify-center lg:justify-end gap-2 text-emerald-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                <p className="text-emerald-200 text-lg leading-relaxed">
                  لديك <span className="text-white font-bold">{heroStats?.upcomingSessions || 0} جلسات</span>، <span className="text-white font-bold">{heroStats?.urgentTasks || 0} مهام عاجلة</span>، و <span className="text-white font-bold">{heroStats?.newMessages || 0} رسائل جديدة</span>.
                </p>
              )}
              <div className="flex flex-wrap justify-center lg:justify-end gap-3 pt-3">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-6 font-bold hover:scale-105 transition-all duration-300 border-0 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-950">
                  <Plus className="ms-2 h-5 w-5" />
                  قضية جديدة
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-11 px-6 font-bold backdrop-blur-md border border-white/20 transition-all duration-300">
                  <FileText className="ms-2 h-5 w-5" />
                  فاتورة جديدة
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : statsError ? (
            <div className="col-span-full flex items-center justify-center py-12 text-red-600">
              <AlertCircle className="h-5 w-5 ms-2" />
              <span>فشل تحميل الإحصائيات</span>
            </div>
          ) : (
            <>
              {/* Revenue */}
              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">الإيرادات (هذا الشهر)</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats?.revenue.current.toLocaleString('ar-SA')} ر.س</div>
                  <p className={`text-xs flex items-center mt-1 font-bold ${(stats?.revenue.percentageChange ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(stats?.revenue.percentageChange ?? 0) >= 0 ? <ArrowUpRight className="h-3 w-3 ms-1" /> : <ArrowDownRight className="h-3 w-3 ms-1" />}
                    {Math.abs(stats?.revenue.percentageChange ?? 0)}% من الشهر الماضي
                  </p>
                </CardContent>
              </Card>

              {/* Active Cases */}
              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">القضايا النشطة</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Scale className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats?.activeCases.total || 0} قضية</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {stats?.activeCases.requiresAction || 0} قضايا تتطلب إجراء
                  </p>
                </CardContent>
              </Card>

              {/* New Clients */}
              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">العملاء الجدد</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">+{stats?.newClients.total || 0} عملاء</div>
                  <p className="text-xs text-blue-600 flex items-center mt-1 font-bold">
                    <ArrowUpRight className="h-3 w-3 ms-1" />
                    +{stats?.newClients.thisWeek || 0} هذا الأسبوع
                  </p>
                </CardContent>
              </Card>

              {/* Unread Messages */}
              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-500">الرسائل غير المقروءة</CardTitle>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats?.unreadMessages.total || 0} رسائل</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
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
            <Card className="rounded-2xl border-slate-200 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold text-slate-800">جدول اليوم</CardTitle>
                  <CardDescription className="text-slate-500">الثلاثاء، 19 نوفمبر 2025</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 h-11">
                  عرض التقويم الكامل
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
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
                        <div className={`w-1.5 h-12 rounded-full bg-emerald-500 me-4 ms-2`}></div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{event.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {event.location}</span>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                              {event.type === 'session' ? 'جلسة' : event.type === 'meeting' ? 'اجتماع' : 'موعد نهائي'}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" aria-label="عرض التفاصيل" className="text-slate-300 group-hover:text-emerald-600">
                          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Jobs & Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                    فرص وظيفية جديدة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">مستشار قانوني (عقود)</h4>
                          <p className="text-xs text-slate-500 mt-1">شركة تقنية كبرى - الرياض</p>
                        </div>
                        <span className="bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg">جديد</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">دوام جزئي</span>
                        <span className="text-xs font-bold text-slate-600 bg-white px-2 py-1 rounded-lg">عن بعد</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full text-emerald-600 hover:bg-emerald-50 rounded-xl h-11">تصفح جميع الفرص</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 hover:border-slate-300 transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    التدريب والتطوير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-slate-800">دورة صياغة العقود التجارية</h4>
                      <p className="text-xs text-slate-500 mt-1">مركز التدريب العدلي</p>
                      <div className="mt-3 w-full bg-white rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-blue-600 font-bold mt-2 text-start">75% مكتمل</p>
                    </div>
                    <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50 rounded-xl h-11">متابعة التدريب</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* LEFT COLUMN (1/3) */}
          <div className="space-y-8">

            {/* Finance Summary */}
            <Card className="rounded-2xl border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  الملخص المالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <ArrowDownRight className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-bold">الدخل المتوقع</p>
                          <p className="font-bold text-slate-800">{financialSummary?.expectedIncome.toLocaleString('ar-SA') || 0} ر.س</p>
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
                              <p className="text-sm font-bold text-slate-800">{inv.clientName}</p>
                              <p className={`text-xs font-bold ${inv.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                {inv.isOverdue ? 'متأخر' : 'يستحق'} {new Date(inv.dueDate).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <span className="font-bold text-slate-700">{inv.amount.toLocaleString('ar-SA')}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <Button className="w-full bg-emerald-950 text-white hover:bg-emerald-900 rounded-xl h-11">الذهاب للمالية</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  الرسائل الأخيرة
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:bg-emerald-50">عرض الكل</Button>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
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
                          {chat.isOnline && <span className="absolute bottom-0 end-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-sm text-slate-800 truncate">{chat.name}</h5>
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