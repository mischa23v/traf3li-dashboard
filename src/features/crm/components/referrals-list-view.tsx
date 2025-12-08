import { useState, useMemo } from 'react'
import {
  MoreHorizontal,
  Plus,
  Users,
  Link as LinkIcon,
  Search,
  Bell,
  AlertCircle,
  ChevronLeft,
  Star,
  DollarSign,
  UserCheck,
  TrendingUp,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useReferrals, useDeleteReferral, useReferralStats } from '@/hooks/useCrm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Referral, ReferralType, ReferralStatus } from '@/types/crm'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

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

export function ReferralsListView() {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedReferralIds, setSelectedReferralIds] = useState<string[]>([])

  // API Filters
  const filters = useMemo(() => {
    const f: any = {}
    if (activeStatusTab !== 'all') {
      f.status = activeStatusTab
    }
    return f
  }, [activeStatusTab])

  // Fetch referrals
  const { data: referralsData, isLoading, isError, error, refetch } = useReferrals(filters)
  const { data: statsData } = useReferralStats()
  const { mutate: deleteReferral } = useDeleteReferral()

  // Transform API data
  const referrals = useMemo(() => {
    if (!referralsData?.data) return []
    return referralsData.data
  }, [referralsData])

  const stats = statsData?.stats

  // Selection Handlers
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedReferralIds([])
  }

  const handleSelectReferral = (referralId: string) => {
    if (selectedReferralIds.includes(referralId)) {
      setSelectedReferralIds(selectedReferralIds.filter((id) => id !== referralId))
    } else {
      setSelectedReferralIds([...selectedReferralIds, referralId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedReferralIds.length === 0) return

    if (confirm(`هل أنت متأكد من حذف ${selectedReferralIds.length} مصدر إحالة؟`)) {
      selectedReferralIds.forEach((id) => {
        deleteReferral(id)
      })
      setIsSelectionMode(false)
      setSelectedReferralIds([])
    }
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: true },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
  ]

  const statusTabs = [
    { id: 'all', label: 'الكل' },
    { id: 'active', label: 'نشط' },
    { id: 'inactive', label: 'غير نشط' },
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
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO CARD */}
        <ProductivityHero badge="إدارة مصادر الإحالة" title="الإحالات" type="referrals" />

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
                </div>
                <span className="text-slate-600">مصادر الإحالة</span>
              </div>
              <p className="text-2xl font-bold text-navy">{stats.totalReferrers}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-slate-600">إحالات ناجحة</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.successfulReferrals}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-slate-600">عمولات مستحقة</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalFeesOwed?.toLocaleString('ar-SA')} ر.س
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-slate-600">معدل التحويل</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avgConversionRate}%
              </p>
            </div>
          </div>
        )}

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            {/* REFERRALS LIST */}
            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-navy text-xl">مصادر الإحالة</h3>
                <div className="flex gap-2">
                  {statusTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      size="sm"
                      onClick={() => setActiveStatusTab(tab.id)}
                      className={
                        activeStatusTab === tab.id
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4'
                      }
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Loading State */}
                {isLoading && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100"
                      >
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-12 h-12 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Error State */}
                {isError && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      حدث خطأ أثناء تحميل مصادر الإحالة
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
                )}

                {/* Empty State */}
                {!isLoading && !isError && referrals.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                        <LinkIcon className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      لا يوجد مصادر إحالة
                    </h3>
                    <p className="text-slate-500 mb-4">ابدأ بإضافة مصدر إحالة جديد</p>
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                      <Link to="/dashboard/crm/referrals/new">
                        <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                        مصدر إحالة جديد
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Success State - Referrals List */}
                {!isLoading &&
                  !isError &&
                  referrals.map((referral: Referral) => (
                    <div
                      key={referral._id}
                      className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedReferralIds.includes(referral._id)
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-100 hover:border-emerald-200'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4 items-center">
                          {isSelectionMode && (
                            <Checkbox
                              checked={selectedReferralIds.includes(referral._id)}
                              onCheckedChange={() => handleSelectReferral(referral._id)}
                              className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                          )}
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                            <LinkIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-navy text-lg">
                                {referral.nameAr || referral.name}
                              </h4>
                              <Badge
                                className={`${statusColors[referral.status]} border-0 rounded-md px-2`}
                              >
                                {statusLabels[referral.status]}
                              </Badge>
                              {referral.priority === 'vip' && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            <p className="text-slate-500 text-sm">
                              {typeLabels[referral.type]}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-slate-500 hover:text-navy"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/crm/referrals/${referral._id}`}>
                                عرض التفاصيل
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteReferral(referral._id)}
                              className="text-red-600"
                            >
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">
                              الإحالات
                            </div>
                            <div className="font-bold text-navy">
                              {referral.totalReferrals}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">ناجحة</div>
                            <div className="font-bold text-emerald-600">
                              {referral.successfulReferrals}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">
                              معدل التحويل
                            </div>
                            <div className="font-bold text-blue-600">
                              {referral.conversionRate}%
                            </div>
                          </div>
                          {referral.outstandingFees > 0 && (
                            <div className="text-center">
                              <div className="text-xs text-slate-500 mb-1">
                                مستحق
                              </div>
                              <div className="font-bold text-orange-600">
                                {referral.outstandingFees.toLocaleString('ar-SA')} ر.س
                              </div>
                            </div>
                          )}
                        </div>
                        <Link to={`/dashboard/crm/referrals/${referral._id}`}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                            عرض التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-4 pt-0 text-center">
                <Button
                  variant="ghost"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6"
                >
                  عرض جميع مصادر الإحالة
                  <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN (Widgets) */}
          <SalesSidebar context="referrals" />
        </div>
      </Main>
    </>
  )
}
