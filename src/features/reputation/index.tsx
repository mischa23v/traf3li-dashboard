import { useTranslation } from 'react-i18next'
import {
  Star, Award, TrendingUp, Users, ThumbsUp,
  MessageSquare, Calendar, Target, Zap, Crown,
  Medal, Shield, CheckCircle, Clock
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
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const topNav = [
    { title: isRTL ? 'نظرة عامة' : 'Overview', href: '/dashboard/reputation/overview', isActive: true },
    { title: isRTL ? 'شاراتي' : 'My Badges', href: '/dashboard/reputation/badges', isActive: false },
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
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main className="bg-slate-50">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {isRTL ? 'التقييمات والسمعة' : 'Ratings & Reputation'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRTL ? 'عرض تقييماتك وسمعتك المهنية' : 'View your ratings and professional reputation'}
            </p>
          </div>

          {/* Main Score Card */}
          <Card className="bg-gradient-to-br from-navy to-navy/90 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Score Circle */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{reputationData.overallScore}</div>
                      <div className="flex justify-center mt-1">
                        {renderStars(Math.round(reputationData.overallScore))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 px-3 py-1 rounded-full text-xs font-medium">
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
              <Card key={index}>
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
            <Card>
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
            <Card className="lg:col-span-2">
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
                  <div key={review.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
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
                        <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
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
      </Main>
    </>
  )
}

export default ReputationOverview
