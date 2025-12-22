import { useNavigate } from '@tanstack/react-router'
import { Sparkles, ArrowLeft, PlayCircle, BookOpen, Video, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 mb-6">
            <Sparkles className="w-12 h-12 text-emerald-600" />
          </div>

          <h1 className="text-4xl font-bold text-navy mb-4">
            {userName ? `مرحباً ${userName}!` : 'مرحباً بك!'}
            <br />
            <span className="text-2xl font-normal text-slate-600">
              {userName ? `Welcome ${userName}!` : 'Welcome!'}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {companyName ? (
              <>
                نحن سعداء بانضمام <span className="font-semibold text-emerald-600">{companyName}</span> إلى منصة ترافلي!
                <br />
                <span className="text-lg">
                  We're excited to have <span className="font-semibold text-emerald-600">{companyName}</span> join the Traf3li platform!
                </span>
              </>
            ) : (
              <>
                نحن سعداء بانضمامك إلى منصة ترافلي - منصتك الشاملة لإدارة الأعمال
                <br />
                <span className="text-lg">
                  We're excited to have you join Traf3li - your all-in-one business management platform
                </span>
              </>
            )}
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
                ابدأ الإعداد
                <br />
                <span className="text-lg font-normal text-slate-600">Start Setup</span>
              </CardTitle>
              <CardDescription className="text-base">
                دعنا نساعدك في إعداد حسابك في 5 دقائق فقط
                <br />
                <span className="text-sm">Let us help you set up your account in just 5 minutes</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={onStartWizard}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg w-full"
              >
                <PlayCircle className="w-5 h-5 me-2" />
                ابدأ الآن
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                سنقوم بإرشادك خلال الخطوات الأساسية
                <br />
                We'll guide you through the essential steps
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
                استكشف أولاً
                <br />
                <span className="text-lg font-normal text-slate-600">Explore First</span>
              </CardTitle>
              <CardDescription className="text-base">
                تخطي الإعداد واستكشف النظام بنفسك
                <br />
                <span className="text-sm">Skip setup and explore the system yourself</span>
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
                تخطي الآن
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                يمكنك إكمال الإعداد لاحقاً من الإعدادات
                <br />
                You can complete setup later from settings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Help Resources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-navy mb-4 text-center">
            مصادر المساعدة
            <br />
            <span className="text-base font-normal text-slate-600">Help Resources</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Documentation */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">التوثيق</h4>
                <p className="text-xs text-slate-600">دليل شامل لاستخدام النظام</p>
                <p className="text-xs text-slate-400">Comprehensive system guide</p>
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">فيديوهات تعليمية</h4>
                <p className="text-xs text-slate-600">شروحات مصورة خطوة بخطوة</p>
                <p className="text-xs text-slate-400">Step-by-step video guides</p>
              </div>
            </div>

            {/* Support */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-navy mb-1">الدعم الفني</h4>
                <p className="text-xs text-slate-600">فريقنا جاهز لمساعدتك</p>
                <p className="text-xs text-slate-400">Our team is ready to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-4">
            ما الذي يمكنك فعله مع ترافلي؟
            <br />
            What can you do with Traf3li?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              إدارة الموارد البشرية
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              المحاسبة والمالية
            </span>
            <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
              إدارة علاقات العملاء
            </span>
            <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              إدارة القضايا القانونية
            </span>
            <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
              التقارير والتحليلات
            </span>
            <span className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium">
              وأكثر من ذلك بكثير...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
