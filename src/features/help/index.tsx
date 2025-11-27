import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HelpCircle, Search, Book, MessageCircle, Phone, Mail,
  ChevronDown, ChevronUp, ExternalLink, FileText, Video,
  Headphones, Clock, CheckCircle, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'
import { cn } from '@/lib/utils'

const categories = [
  {
    id: 'getting-started',
    title: 'البدء',
    titleEn: 'Getting Started',
    icon: Book,
    color: 'bg-blue-100 text-blue-600',
    articles: 8,
  },
  {
    id: 'cases',
    title: 'إدارة القضايا',
    titleEn: 'Case Management',
    icon: FileText,
    color: 'bg-emerald-100 text-emerald-600',
    articles: 12,
  },
  {
    id: 'billing',
    title: 'الفوترة والحسابات',
    titleEn: 'Billing & Accounts',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-600',
    articles: 10,
  },
  {
    id: 'tutorials',
    title: 'دروس تعليمية',
    titleEn: 'Video Tutorials',
    icon: Video,
    color: 'bg-amber-100 text-amber-600',
    articles: 15,
  },
]

const faqs = [
  {
    question: 'كيف أضيف قضية جديدة؟',
    questionEn: 'How do I add a new case?',
    answer: 'يمكنك إضافة قضية جديدة من خلال الذهاب إلى صفحة القضايا والنقر على زر "قضية جديدة". ستظهر لك نافذة لإدخال تفاصيل القضية.',
    answerEn: 'You can add a new case by going to the Cases page and clicking the "New Case" button. A form will appear to enter the case details.',
  },
  {
    question: 'كيف أصدر فاتورة للعميل؟',
    questionEn: 'How do I issue an invoice to a client?',
    answer: 'انتقل إلى قسم المالية > الفواتير، ثم انقر على "فاتورة جديدة". حدد العميل والقضية وأضف البنود المطلوبة.',
    answerEn: 'Go to Finance > Invoices, then click "New Invoice". Select the client and case, then add the required line items.',
  },
  {
    question: 'كيف أتتبع ساعات العمل؟',
    questionEn: 'How do I track billable hours?',
    answer: 'استخدم ميزة تتبع الوقت في قسم المالية. يمكنك بدء المؤقت عند العمل على قضية أو إضافة الوقت يدوياً.',
    answerEn: 'Use the time tracking feature in the Finance section. You can start a timer while working on a case or add time manually.',
  },
  {
    question: 'كيف أضيف عضو فريق جديد؟',
    questionEn: 'How do I add a new team member?',
    answer: 'من قسم فريق العمل، انقر على "إضافة موظف" وأدخل بيانات الموظف الجديد وحدد صلاحياته.',
    answerEn: 'From the Staff section, click "Add Staff" and enter the new employee details and set their permissions.',
  },
  {
    question: 'كيف أستورد بيانات من نظام آخر؟',
    questionEn: 'How do I import data from another system?',
    answer: 'انتقل إلى الإعدادات > استيراد/تصدير، واختر نوع البيانات ثم ارفع ملف Excel أو CSV.',
    answerEn: 'Go to Settings > Import/Export, select the data type, then upload your Excel or CSV file.',
  },
  {
    question: 'هل يدعم النظام اللغة الإنجليزية؟',
    questionEn: 'Does the system support English?',
    answer: 'نعم، يدعم النظام اللغتين العربية والإنجليزية. يمكنك تغيير اللغة من الإعدادات أو من أيقونة اللغة في الشريط العلوي.',
    answerEn: 'Yes, the system supports both Arabic and English. You can change the language from Settings or from the language icon in the top bar.',
  },
]

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'الدردشة المباشرة',
    titleEn: 'Live Chat',
    description: 'تحدث مع فريق الدعم مباشرة',
    descriptionEn: 'Chat with our support team directly',
    available: true,
    action: 'ابدأ المحادثة',
    actionEn: 'Start Chat',
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    titleEn: 'Email Support',
    description: 'support@traf3li.com',
    descriptionEn: 'support@traf3li.com',
    available: true,
    action: 'إرسال بريد',
    actionEn: 'Send Email',
  },
  {
    icon: Phone,
    title: 'الهاتف',
    titleEn: 'Phone Support',
    description: '+966 11 XXX XXXX',
    descriptionEn: '+966 11 XXX XXXX',
    available: true,
    action: 'اتصل الآن',
    actionEn: 'Call Now',
  },
]

export function HelpCenter() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <Header className="bg-emerald-950 shadow-none relative">
        <div className="flex-1" />
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {isRTL ? 'مركز المساعدة' : 'Help Center'}
            </h1>
            <p className="text-slate-500 mb-6">
              {isRTL ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder={isRTL ? 'ابحث في المساعدة...' : 'Search for help...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={cn(
                    "h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform",
                    category.color
                  )}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">
                    {isRTL ? category.title : category.titleEn}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {category.articles} {isRTL ? 'مقال' : 'articles'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إجابات سريعة على الأسئلة الأكثر شيوعاً' : 'Quick answers to commonly asked questions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-start hover:no-underline">
                      <span className="font-medium text-slate-800">
                        {isRTL ? faq.question : faq.questionEn}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {isRTL ? faq.answer : faq.answerEn}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 text-center">
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <method.icon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">
                          {isRTL ? method.title : method.titleEn}
                        </h3>
                        <p className="text-sm text-slate-500 mb-3">
                          {isRTL ? method.description : method.descriptionEn}
                        </p>
                        {method.available && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 mb-3">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                            {isRTL ? 'متاح الآن' : 'Available now'}
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="w-full">
                          {isRTL ? method.action : method.actionEn}
                          <ArrowRight className={cn("h-4 w-4 ms-1", isRTL && "rotate-180")} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Support Hours */}
          <Card className="bg-emerald-950 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {isRTL ? 'دعم على مدار الساعة' : '24/7 Support'}
                    </h3>
                    <p className="text-white/70">
                      {isRTL ? 'فريق الدعم متاح لمساعدتك في أي وقت' : 'Our support team is available to help you anytime'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-5 w-5" />
                  <span>
                    {isRTL ? 'متوسط وقت الرد: 5 دقائق' : 'Average response time: 5 minutes'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Link */}
          <div className="text-center py-4">
            <p className="text-slate-500 mb-3">
              {isRTL ? 'هل تبحث عن معلومات تقنية مفصلة؟' : 'Looking for detailed technical information?'}
            </p>
            <Button variant="outline">
              <Book className="h-4 w-4 me-2" />
              {isRTL ? 'استعرض الوثائق الكاملة' : 'Browse Full Documentation'}
              <ExternalLink className="h-4 w-4 ms-2" />
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}

export default HelpCenter
