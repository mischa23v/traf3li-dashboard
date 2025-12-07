import { useTranslation } from 'react-i18next'
import {
  Star, Award, TrendingUp, Users, ThumbsUp,
  MessageSquare, Calendar, Target, Zap, Crown,
  Medal, Shield, CheckCircle, Clock, Search, Bell, Scale
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { Badge } from '@/components/ui/badge'
import { ReputationSidebar } from './components/reputation-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock reputation data
const reputationData = {
  overallScore: 4.8,
  totalReviews: 127,
  totalCases: 245,
  successRate: 92,
  responseTime: '2 ساعات',
  responseTimeEn: '2 hours',
  level: 'خبير',
  levelEn: 'Expert',
  nextLevel: 'محترف',
  nextLevelEn: 'Professional',
  progressToNextLevel: 75,
  pointsToNextLevel: 250,
}

const recentReviews = [
  {
    id: '1',
    clientName: 'أحمد محمد',
    clientNameEn: 'Ahmed Mohammed',
    rating: 5,
    comment: 'محامٍ ممتاز، تعامل احترافي وسريع في إنجاز القضية',
    commentEn: 'Excellent lawyer, professional and quick in handling the case',
    date: '2024-11-20',
    caseType: 'تجاري',
    caseTypeEn: 'Commercial',
  },
  {
    id: '2',
    clientName: 'سارة العتيبي',
    clientNameEn: 'Sarah Al-Otaibi',
    rating: 5,
    comment: 'خدمة رائعة وتواصل مستمر طوال فترة القضية',
    commentEn: 'Great service and continuous communication throughout the case',
    date: '2024-11-18',
    caseType: 'عمالي',
    caseTypeEn: 'Labor',
  },
  {
    id: '3',
    clientName: 'خالد الشمري',
    clientNameEn: 'Khaled Al-Shammari',
    rating: 4,
    comment: 'محامٍ كفء ومتمكن من عمله',
    commentEn: 'Competent lawyer who knows his work well',
    date: '2024-11-15',
    caseType: 'مدني',
    caseTypeEn: 'Civil',
  },
]

const stats = [
  {
    icon: CheckCircle,
    label: 'قضايا مكتملة',
    labelEn: 'Completed Cases',
    value: 245,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    icon: ThumbsUp,
    label: 'نسبة النجاح',
    labelEn: 'Success Rate',
    value: '92%',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Clock,
    label: 'متوسط وقت الرد',
    labelEn: 'Avg Response Time',
    value: '2h',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    icon: Users,
    label: 'عملاء راضون',
    labelEn: 'Satisfied Clients',
    value: 189,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

const ratingBreakdown = [
  { stars: 5, count: 98, percentage: 77 },
  { stars: 4, count: 21, percentage: 17 },
  { stars: 3, count: 6, percentage: 5 },
  { stars: 2, count: 2, percentage: 1 },
  { stars: 1, count: 0, percentage: 0 },
]

export function ReputationOverview() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.reputation', 'السمعة'), href: '/dashboard/reputation', isActive: true },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
      />
    ))
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
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
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <ProductivityHero
          badge="التميز المهني"
          title="التقييمات والسمعة"
          type="reputation"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Main Score Card */}
            <Card className="bg-gradient-to-br from-navy to-navy/90 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{reputationData.overallScore}</div>
                        <div className="flex justify-center mt-1">
                          {renderStars(Math.round(reputationData.overallScore))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 px-3 py-1 rounded-full text-xs font-medium shadow-lg shadow-emerald-500/30">
                      {isRTL ? reputationData.level : reputationData.levelEn}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 text-center md:text-start">
                    <h2 className="text-2xl font-bold mb-2">
                      {isRTL ? 'أداء متميز!' : 'Outstanding Performance!'}
                    </h2>
                    <p className="text-white/70 mb-4">
                      {isRTL
                        ? `لديك ${reputationData.totalReviews} تقييم من ${reputationData.totalCases} قضية`
                        : `You have ${reputationData.totalReviews} reviews from ${reputationData.totalCases} cases`}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{isRTL ? 'التقدم نحو المستوى التالي' : 'Progress to next level'}</span>
                        <span>{reputationData.progressToNextLevel}%</span>
                      </div>
                      <Progress value={reputationData.progressToNextLevel} className="h-2 bg-white/20" />
                      <p className="text-xs text-white/60">
                        {isRTL
                          ? `${reputationData.pointsToNextLevel} نقطة للوصول إلى مستوى ${reputationData.nextLevel}`
                          : `${reputationData.pointsToNextLevel} points to reach ${reputationData.nextLevelEn} level`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="border-slate-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-navy">{stat.value}</div>
                        <div className="text-xs text-slate-500">{isRTL ? stat.label : stat.labelEn}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rating Breakdown */}
              <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isRTL ? 'توزيع التقييمات' : 'Rating Breakdown'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ratingBreakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{item.stars}</span>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      </div>
                      <Progress value={item.percentage} className="flex-1 h-2" />
                      <span className="text-sm text-slate-500 w-12 text-end">{item.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {isRTL ? 'أحدث التقييمات' : 'Recent Reviews'}
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    {isRTL ? 'عرض الكل' : 'View All'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-bold shrink-0">
                        {(isRTL ? review.clientName : review.clientNameEn).charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-navy">
                            {isRTL ? review.clientName : review.clientNameEn}
                          </span>
                          <span className="text-xs text-slate-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {isRTL ? review.caseType : review.caseTypeEn}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {isRTL ? review.comment : review.commentEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <ReputationSidebar context="overview" />
        </div>
      </Main>
    </>
  )
}

export default ReputationOverview
