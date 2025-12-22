import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Logo } from '@/assets/logo'
import { useWelcome } from '@/hooks/useWelcome'
import {
  Sparkles,
  Rocket,
  BookOpen,
  Shield,
  Users,
  TrendingUp
} from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const { markWelcomeAsSeen, setDontShowAgain: setDontShowAgainPersist, startTour } = useWelcome()

  const features = [
    {
      icon: BookOpen,
      title: t('onboarding.features.caseManagement', 'Case Management'),
      titleAr: 'إدارة القضايا',
      description: t('onboarding.features.caseManagementDesc', 'Organize and track all your legal cases'),
      descriptionAr: 'تنظيم وتتبع جميع قضاياك القانونية'
    },
    {
      icon: Users,
      title: t('onboarding.features.clientManagement', 'Client Management'),
      titleAr: 'إدارة العملاء',
      description: t('onboarding.features.clientManagementDesc', 'Manage clients and contacts'),
      descriptionAr: 'إدارة العملاء وجهات الاتصال'
    },
    {
      icon: TrendingUp,
      title: t('onboarding.features.finance', 'Financial Management'),
      titleAr: 'الإدارة المالية',
      description: t('onboarding.features.financeDesc', 'Track invoices and payments'),
      descriptionAr: 'تتبع الفواتير والمدفوعات'
    },
    {
      icon: Shield,
      title: t('onboarding.features.security', 'Security & Compliance'),
      titleAr: 'الأمان والامتثال',
      description: t('onboarding.features.securityDesc', 'PDPL compliant and secure'),
      descriptionAr: 'متوافق مع نظام حماية البيانات الشخصية وآمن'
    }
  ]

  const handleSkip = () => {
    if (dontShowAgain) {
      setDontShowAgainPersist(true)
    } else {
      markWelcomeAsSeen()
    }
    onOpenChange(false)
  }

  const handleStartTour = () => {
    if (dontShowAgain) {
      setDontShowAgainPersist(true)
    } else {
      markWelcomeAsSeen()
    }
    onOpenChange(false)
    startTour()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
        showCloseButton={false}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 size-32 animate-pulse rounded-full bg-primary" />
            <div className="absolute bottom-10 right-10 size-40 animate-pulse rounded-full bg-primary delay-700" />
          </div>
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-primary/10 shadow-lg">
              <Logo className="size-12 text-primary" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">
              {isRTL ? 'مرحباً بك في ترافِلي' : 'Welcome to Traf3li'}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {isRTL
                ? 'منصتك الشاملة لإدارة مكتبك القانوني بكفاءة واحترافية'
                : 'Your comprehensive platform for managing your legal practice efficiently and professionally'}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-8">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold">
              {isRTL ? 'الميزات الرئيسية' : 'Key Features'}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </div>
                    <h3 className="font-semibold">
                      {isRTL ? feature.titleAr : feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? feature.descriptionAr : feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Rocket className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isRTL ? 'هل أنت مستعد للبدء؟' : 'Ready to Get Started?'}
              </h3>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {isRTL
                ? 'خذ جولة سريعة للتعرف على الميزات الرئيسية أو ابدأ باستكشاف النظام بنفسك'
                : 'Take a quick tour to learn about key features or start exploring on your own'}
            </p>

            <DialogFooter className="flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="w-full sm:w-auto"
              >
                {isRTL ? 'تخطي' : 'Skip'}
              </Button>
              <Button
                onClick={handleStartTour}
                className="w-full sm:w-auto"
              >
                <Rocket className="size-4" />
                {isRTL ? 'ابدأ الجولة التعريفية' : 'Start Quick Tour'}
              </Button>
            </DialogFooter>
          </div>

          {/* Don't Show Again Checkbox */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <Label
              htmlFor="dont-show-again"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              {isRTL ? 'لا تظهر هذه الرسالة مرة أخرى' : "Don't show this again"}
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
