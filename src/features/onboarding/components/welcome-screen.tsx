import { useNavigate } from '@tanstack/react-router'
import { Sparkles, ArrowLeft, PlayCircle, BookOpen, Video, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export interface WelcomeScreenProps {
  userName?: string
  companyName?: string
  onStartWizard: () => void
  onSkipWizard: () => void
}

export default function WelcomeScreen({
  userName,
  companyName,
  onStartWizard,
  onSkipWizard,
}: WelcomeScreenProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-6">
            <Sparkles className="w-12 h-12 text-emerald-600" />
          </div>

          <h1 className="text-4xl font-bold text-navy mb-4">
            {userName ? t('onboarding.welcomeScreen.welcomeUser', { userName }) : t('onboarding.welcomeScreen.welcomeGuest')}
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {companyName ? t('onboarding.welcomeScreen.excitedCompany', { companyName }) : t('onboarding.welcomeScreen.excitedGeneral')}
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Start Setup */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-xl transition-all cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy mb-2">
                {t('onboarding.welcomeScreen.startSetup')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('onboarding.welcomeScreen.startSetupDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={onStartWizard}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg w-full"
              >
                <PlayCircle className="w-5 h-5 me-2" />
                {t('onboarding.welcomeScreen.startNow')}
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                {t('onboarding.welcomeScreen.guideYou')}
              </p>
            </CardContent>
          </Card>

          {/* Explore First */}
          <Card className="border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-500 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <ArrowLeft className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-navy mb-2">
                {t('onboarding.welcomeScreen.exploreFirst')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('onboarding.welcomeScreen.exploreFirstDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={onSkipWizard}
                size="lg"
                variant="outline"
                className="rounded-xl w-full border-2 hover:bg-slate-50"
              >
                <ArrowLeft className="w-5 h-5 me-2" />
                {t('onboarding.welcomeScreen.skipNow')}
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                {t('onboarding.welcomeScreen.setupLater')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Resources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-navy mb-4 text-center">
            {t('onboarding.welcomeScreen.helpResources')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Documentation */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">{t('onboarding.welcomeScreen.documentation')}</h4>
                <p className="text-xs text-slate-600">{t('onboarding.welcomeScreen.documentationDesc')}</p>
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">{t('onboarding.welcomeScreen.videoTutorials')}</h4>
                <p className="text-xs text-slate-600">{t('onboarding.welcomeScreen.videoTutorialsDesc')}</p>
              </div>
            </div>

            {/* Support */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">{t('onboarding.welcomeScreen.support')}</h4>
                <p className="text-xs text-slate-600">{t('onboarding.welcomeScreen.supportDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            {t('onboarding.welcomeScreen.whatCanYouDo')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.hr')}
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.accounting')}
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.crm')}
            </span>
            <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.legalCases')}
            </span>
            <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.reports')}
            </span>
            <span className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">
              {t('onboarding.welcomeScreen.platformFeatures.more')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
