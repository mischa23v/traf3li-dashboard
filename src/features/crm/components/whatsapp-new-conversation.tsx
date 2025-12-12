import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Search, Bell, ArrowRight, Phone, MessageSquare, Send,
  Loader2, FileText, User, Clock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useWhatsAppTemplates,
  useSendWhatsAppMessage,
} from '@/hooks/useCrmAdvanced'
import { useLeads } from '@/hooks/useCrm'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function WhatsAppNewConversation() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'template'>('text')
  const [messageText, setMessageText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedLead, setSelectedLead] = useState('')

  // Fetch data
  const { data: templatesData } = useWhatsAppTemplates()
  const { data: leadsData } = useLeads({})
  const sendMessageMutation = useSendWhatsAppMessage()

  const templates = templatesData || []
  const leads = leadsData?.data || []

  // Handle lead selection
  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId)
    const lead = leads.find((l: any) => l._id === leadId)
    if (lead?.phone) {
      setPhoneNumber(lead.phone)
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!phoneNumber.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف')
      return
    }

    if (messageType === 'text' && !messageText.trim()) {
      toast.error('الرجاء إدخال نص الرسالة')
      return
    }

    if (messageType === 'template' && !selectedTemplate) {
      toast.error('الرجاء اختيار قالب')
      return
    }

    const messageData: any = {
      phoneNumber: phoneNumber.replace(/\s/g, ''),
      type: messageType,
    }

    if (messageType === 'text') {
      messageData.message = messageText
    } else {
      messageData.templateName = selectedTemplate
    }

    sendMessageMutation.mutate(messageData, {
      onSuccess: () => {
        toast.success('تم إرسال الرسالة بنجاح')
        navigate({ to: '/dashboard/crm/whatsapp' })
      },
      onError: (error: any) => {
        toast.error(error.message || 'فشل في إرسال الرسالة')
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'واتساب', href: '/dashboard/crm/whatsapp', isActive: true },
    { title: 'التسويق بالبريد', href: '/dashboard/crm/email-marketing', isActive: false },
  ]

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <div className="relative hidden md:block min-w-0">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
            <Bell className="h-5 w-5" />
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="h-10 px-4 text-slate-600 hover:text-navy hover:bg-white rounded-xl"
          >
            <Link to="/dashboard/crm/whatsapp">
              <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" aria-hidden="true" />
              العودة للمحادثات
            </Link>
          </Button>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageSquare className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">محادثة جديدة</h1>
            <p className="text-slate-500 text-sm">ابدأ محادثة واتساب جديدة مع عميل</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {/* Select from Leads */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">اختيار من العملاء المحتملين</Label>
                  <Select value={selectedLead} onValueChange={handleLeadSelect}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10">
                      <User className="h-5 w-5 ms-2 text-slate-400" aria-hidden="true" />
                      <SelectValue placeholder="اختر عميل محتمل (اختياري)" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead: any) => (
                        <SelectItem key={lead._id} value={lead._id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lead.name || lead.email}</span>
                            {lead.phone && (
                              <span className="text-xs text-slate-500" dir="ltr">{lead.phone}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-xs text-slate-400 font-medium">أو أدخل الرقم يدوياً</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                    <Input
                      type="tel"
                      dir="ltr"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="966XXXXXXXXX"
                      className="h-14 ps-12 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10 text-left"
                    />
                  </div>
                  <p className="text-xs text-slate-500">أدخل الرقم مع رمز الدولة (مثال: 966501234567)</p>
                </div>

                {/* Message Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">نوع الرسالة</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMessageType('text')}
                      className={`p-4 rounded-2xl border-2 transition-all text-start ${
                        messageType === 'text'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-200 bg-white'
                      }`}
                    >
                      <MessageSquare className={`h-6 w-6 mb-2 ${
                        messageType === 'text' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                      <p className={`font-bold ${messageType === 'text' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        رسالة نصية
                      </p>
                      <p className="text-xs text-slate-500 mt-1">إرسال رسالة نصية مخصصة</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageType('template')}
                      className={`p-4 rounded-2xl border-2 transition-all text-start ${
                        messageType === 'template'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-200 bg-white'
                      }`}
                    >
                      <FileText className={`h-6 w-6 mb-2 ${
                        messageType === 'template' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                      <p className={`font-bold ${messageType === 'template' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        قالب معتمد
                      </p>
                      <p className="text-xs text-slate-500 mt-1">استخدام قالب واتساب معتمد</p>
                    </button>
                  </div>
                </div>

                {/* Text Message */}
                {messageType === 'text' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-navy">نص الرسالة *</Label>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="min-h-[150px] rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>الحد الأقصى: 1024 حرف</span>
                      <span>{messageText.length}/1024</span>
                    </div>
                  </div>
                )}

                {/* Template Selection */}
                {messageType === 'template' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-navy">اختر القالب *</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10">
                        <FileText className="h-5 w-5 ms-2 text-slate-400" aria-hidden="true" />
                        <SelectValue placeholder="اختر قالب" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template: any) => (
                          <SelectItem key={template._id || template.id} value={template.name}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              <Badge className={`text-xs ${
                                template.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {template.status === 'approved' ? 'معتمد' : template.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && (
                      <p className="text-xs text-amber-600">لا توجد قوالب متاحة. يرجى إنشاء قالب أولاً.</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: '/dashboard/crm/whatsapp' })}
                    className="h-12 px-6 rounded-xl"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5 ms-2 rtl:-scale-x-100" aria-hidden="true" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy">نصائح هامة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">نافذة الـ 24 ساعة</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      يمكنك إرسال رسائل نصية فقط خلال 24 ساعة من آخر رسالة من العميل
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-emerald-50 rounded-xl">
                  <FileText className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">القوالب المعتمدة</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      استخدم القوالب المعتمدة للتواصل مع العملاء الجدد
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
                  <Phone className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">صيغة الرقم</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      تأكد من إدخال الرقم بصيغة دولية (مثل: 966501234567)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Contacts */}
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy">آخر العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                {leads.slice(0, 5).map((lead: any) => (
                  <button
                    key={lead._id}
                    onClick={() => handleLeadSelect(lead._id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-start"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {(lead.name || lead.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy text-sm truncate">{lead.name || lead.email}</p>
                      {lead.phone && (
                        <p className="text-xs text-slate-500" dir="ltr">{lead.phone}</p>
                      )}
                    </div>
                  </button>
                ))}
                {leads.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">لا يوجد عملاء محتملين</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
