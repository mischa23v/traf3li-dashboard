import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslation } from 'react-i18next'
import {
  HelpCircle, Search, Book, MessageCircle, Phone, Mail,
  ChevronDown, ChevronUp, ExternalLink, FileText, Video,
  Headphones, Clock, CheckCircle, ArrowRight, Bell
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
import { TopNav } from '@/components/layout/top-nav'
import { Badge } from '@/components/ui/badge'
import { HelpSidebar } from './components/help-sidebar'

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
  const { i18n, t } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )


  const topNav = [
    { title: isRTL ? 'مركز المساعدة' : 'Help Center', href: '/dashboard/help', isActive: true },
    { title: isRTL ? 'تذاكر الدعم' : 'Support Tickets', href: '/dashboard/help/tickets', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

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
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* HERO BANNER */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <HelpCircle className="w-3 h-3 ms-2" />
                  {isRTL ? 'مركز المساعدة' : 'Help Center'}
                </Badge>
                <span className="text-slate-500 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">
                {isRTL ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                {isRTL ? 'ابحث في قاعدة المعرفة أو تواصل مع فريق الدعم' : 'Search our knowledge base or contact support'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Main Content --- */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" aria-hidden="true" />
              <Input
                placeholder={isRTL ? 'ابحث في المساعدة...' : 'Search for help...'}
                defaultValue={searchQuery}
                onChange={(e) => debouncedSetSearch(e.target.value)}
                className="ps-12 h-14 text-lg rounded-2xl border-slate-200 shadow-sm bg-white"
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-100">
                  <CardContent className="p-6 text-center">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform",
                      category.color
                    )}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-bold text-navy mb-1 text-lg">
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
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy">
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
                    <AccordionItem key={index} value={`item-${index}`} className="border-slate-100">
                      <AccordionTrigger className="text-start hover:no-underline hover:text-emerald-600 transition-colors">
                        <span className="font-medium text-navy">
                          {isRTL ? faq.question : faq.questionEn}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed">
                        {isRTL ? faq.answer : faq.answerEn}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <div>
              <h2 className="text-xl font-bold text-navy mb-4">
                {isRTL ? 'تواصل معنا' : 'Contact Us'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-slate-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 text-emerald-600">
                          <method.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-navy mb-1">
                            {isRTL ? method.title : method.titleEn}
                          </h3>
                          <p className="text-sm text-slate-500 mb-3">
                            {isRTL ? method.description : method.descriptionEn}
                          </p>
                          {method.available && (
                            <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 mb-3">
                              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                              {isRTL ? 'متاح الآن' : 'Available now'}
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="w-full border-slate-200">
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
          </div>

          {/* Sidebar */}
          <HelpSidebar context="center" />
        </div>
      </Main>
    </>
  )
}

export default HelpCenter
