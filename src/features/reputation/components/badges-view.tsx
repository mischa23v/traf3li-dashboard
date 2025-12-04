import { useTranslation } from 'react-i18next'
import {
  Star, Award, Trophy, Shield, Zap, Crown, Medal,
  Target, Users, CheckCircle,
  Lock, Unlock, Search, Bell
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { Button } from '@/components/ui/button'
import { ReputationSidebar } from './reputation-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'

// Mock badges data
const earnedBadges = [
  {
    id: '1',
    name: 'محامي نجم',
    nameEn: 'Star Lawyer',
    description: 'حصلت على 50 تقييم 5 نجوم',
    descriptionEn: 'Received 50 five-star ratings',
    icon: Star,
    color: 'bg-amber-500',
    earnedAt: '2024-10-15',
    rarity: 'legendary',
  },
  {
    id: '2',
    name: 'سرعة الاستجابة',
    nameEn: 'Quick Responder',
    description: 'متوسط وقت استجابة أقل من ساعة',
    descriptionEn: 'Average response time under 1 hour',
    icon: Zap,
    color: 'bg-blue-500',
    earnedAt: '2024-09-20',
    rarity: 'epic',
  },
  {
    id: '3',
    name: 'خبير القضايا التجارية',
    nameEn: 'Commercial Expert',
    description: 'أكملت 100 قضية تجارية بنجاح',
    descriptionEn: 'Completed 100 commercial cases successfully',
    icon: Trophy,
    color: 'bg-emerald-500',
    earnedAt: '2024-08-10',
    rarity: 'epic',
  },
  {
    id: '4',
    name: 'موثوق',
    nameEn: 'Trusted',
    description: 'حافظت على تقييم 4.5+ لمدة 6 أشهر',
    descriptionEn: 'Maintained 4.5+ rating for 6 months',
    icon: Shield,
    color: 'bg-purple-500',
    earnedAt: '2024-07-01',
    rarity: 'rare',
  },
  {
    id: '5',
    name: 'بداية قوية',
    nameEn: 'Strong Start',
    description: 'أكملت أول 10 قضايا بنجاح',
    descriptionEn: 'Completed first 10 cases successfully',
    icon: Medal,
    color: 'bg-cyan-500',
    earnedAt: '2024-03-15',
    rarity: 'common',
  },
]

const lockedBadges = [
  {
    id: '6',
    name: 'أسطورة المحاماة',
    nameEn: 'Legal Legend',
    description: 'أكمل 500 قضية بنسبة نجاح 95%+',
    descriptionEn: 'Complete 500 cases with 95%+ success rate',
    icon: Crown,
    color: 'bg-slate-400',
    progress: 49,
    requirement: '245/500 قضية',
    requirementEn: '245/500 cases',
    rarity: 'legendary',
  },
  {
    id: '7',
    name: 'محبوب العملاء',
    nameEn: 'Client Favorite',
    description: 'احصل على 200 تقييم إيجابي',
    descriptionEn: 'Get 200 positive reviews',
    icon: Users,
    color: 'bg-slate-400',
    progress: 63,
    requirement: '127/200 تقييم',
    requirementEn: '127/200 reviews',
    rarity: 'epic',
  },
  {
    id: '8',
    name: 'المثابر',
    nameEn: 'Persistent',
    description: 'حافظ على النشاط لمدة سنة متواصلة',
    descriptionEn: 'Stay active for 1 consecutive year',
    icon: Target,
    color: 'bg-slate-400',
    progress: 83,
    requirement: '10/12 شهر',
    requirementEn: '10/12 months',
    rarity: 'rare',
  },
]

const rarityColors: Record<string, { bg: string; text: string; label: string; labelEn: string }> = {
  common: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'عادي', labelEn: 'Common' },
  rare: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'نادر', labelEn: 'Rare' },
  epic: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'ملحمي', labelEn: 'Epic' },
  legendary: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'أسطوري', labelEn: 'Legendary' },
}

export function BadgesView() {
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const topNav = [
    { title: t('nav.overview', 'نظرة عامة'), href: '/dashboard/overview', isActive: false },
    { title: t('nav.reputation', 'السمعة'), href: '/dashboard/reputation', isActive: true },
  ]

  const getRarityBadge = (rarity: string) => {
    const config = rarityColors[rarity] || rarityColors.common
    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {isRTL ? config.label : config.labelEn}
      </Badge>
    )
  }

  return (
    <>
      <Header className="bg-navy">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search', 'بحث...')}
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={isRTL ? 'السمعة' : 'Reputation'}
          title={isRTL ? 'الشارات' : 'Badges'}
          type="reputation"
          stats={[
            { label: isRTL ? 'شارات مكتسبة' : 'Badges Earned', value: earnedBadges.length, icon: Award, status: 'normal' },
            { label: isRTL ? 'أسطوري' : 'Legendary', value: 2, icon: Crown, status: 'normal' },
            { label: isRTL ? 'ملحمي' : 'Epic', value: 2, icon: Trophy, status: 'normal' },
            { label: isRTL ? 'قيد الفتح' : 'In Progress', value: lockedBadges.length, icon: Lock, status: 'normal' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Earned Badges */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Unlock className="h-5 w-5 text-emerald-500" />
                {isRTL ? 'الشارات المكتسبة' : 'Earned Badges'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {earnedBadges.map((badge) => (
                  <Card key={badge.id} className="hover:shadow-lg transition-shadow group border-slate-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-16 w-16 rounded-xl ${badge.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-black/10`}>
                          <badge.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-navy">
                              {isRTL ? badge.name : badge.nameEn}
                            </h3>
                            {getRarityBadge(badge.rarity)}
                          </div>
                          <p className="text-sm text-slate-500 mb-2">
                            {isRTL ? badge.description : badge.descriptionEn}
                          </p>
                          <div className="flex items-center text-xs text-slate-400">
                            <CheckCircle className="h-3 w-3 me-1 text-emerald-500" />
                            {isRTL ? 'حصلت عليها في' : 'Earned on'} {badge.earnedAt}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Locked Badges */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-slate-400" />
                {isRTL ? 'شارات قيد الفتح' : 'Badges In Progress'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedBadges.map((badge) => (
                  <Card key={badge.id} className="opacity-75 hover:opacity-100 transition-opacity border-slate-100 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-16 w-16 rounded-xl ${badge.color} flex items-center justify-center shrink-0 relative shadow-inner`}>
                          <badge.icon className="h-8 w-8 text-white/50" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-600">
                              {isRTL ? badge.name : badge.nameEn}
                            </h3>
                            {getRarityBadge(badge.rarity)}
                          </div>
                          <p className="text-sm text-slate-500 mb-3">
                            {isRTL ? badge.description : badge.descriptionEn}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">{isRTL ? 'التقدم' : 'Progress'}</span>
                              <span className="text-slate-600 font-medium">{badge.progress}%</span>
                            </div>
                            <Progress value={badge.progress} className="h-2" />
                            <div className="text-xs text-slate-400">
                              {isRTL ? badge.requirement : badge.requirementEn}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Achievement Levels */}
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle>{isRTL ? 'مستويات الإنجاز' : 'Achievement Levels'}</CardTitle>
                <CardDescription>
                  {isRTL ? 'كلما زادت شاراتك، ارتفع مستواك' : 'The more badges you earn, the higher your level'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="h-12 w-12 mx-auto bg-slate-200 rounded-full flex items-center justify-center mb-2">
                      <Medal className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="font-medium text-slate-700">{isRTL ? 'مبتدئ' : 'Beginner'}</div>
                    <div className="text-xs text-slate-500">0-5 {isRTL ? 'شارات' : 'badges'}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="h-12 w-12 mx-auto bg-blue-200 rounded-full flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="font-medium text-blue-700">{isRTL ? 'متقدم' : 'Advanced'}</div>
                    <div className="text-xs text-blue-500">6-15 {isRTL ? 'شارات' : 'badges'}</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-700">{isRTL ? 'أنت هنا' : 'You are here'}</Badge>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg opacity-60">
                    <div className="h-12 w-12 mx-auto bg-purple-200 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="font-medium text-slate-700">{isRTL ? 'خبير' : 'Expert'}</div>
                    <div className="text-xs text-slate-500">16-30 {isRTL ? 'شارات' : 'badges'}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg opacity-60">
                    <div className="h-12 w-12 mx-auto bg-amber-200 rounded-full flex items-center justify-center mb-2">
                      <Crown className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="font-medium text-slate-700">{isRTL ? 'أسطورة' : 'Legend'}</div>
                    <div className="text-xs text-slate-500">30+ {isRTL ? 'شارات' : 'badges'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <ReputationSidebar context="badges" />
        </div>
      </Main>
    </>
  )
}

export default BadgesView
