import { useState, useEffect, useRef } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useParams } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Bell, AlertCircle, MessageSquare, Send, MoreHorizontal,
  ArrowRight, Phone, Mail, User, Clock, CheckCheck, Check,
  Paperclip, Smile, Loader2, Image, FileText, Video, Mic
} from 'lucide-react'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
  useWhatsAppConversation,
  useWhatsAppTemplates,
  useSendWhatsAppMessage,
} from '@/hooks/useCrmAdvanced'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

interface Message {
  _id: string
  direction: 'incoming' | 'outgoing'
  content: string
  messageType: string
  status?: string
  timestamp: string
  mediaUrl?: string
}

export function WhatsAppConversationView() {
  const { conversationId } = useParams({ from: '/_authenticated/dashboard/crm/whatsapp/$conversationId' })
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [messageText, setMessageText] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch data
  const { data: conversationData, isLoading, isError, error } = useWhatsAppConversation(conversationId)
  const { data: templatesData } = useWhatsAppTemplates()
  const sendMessageMutation = useSendWhatsAppMessage()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [conversationData?.messages])

  // Handle send message
  const handleSendMessage = async () => {
    if (sendMessageMutation.isPending) return

    const trimmedMessage = messageText.trim()
    setMessageText('')

    sendMessageMutation.mutate(
      {
        conversationId,
        message: trimmedMessage || 'Test message',
        type: 'text',
      },
      {
        onError: () => {
          setMessageText(trimmedMessage)
        },
      }
    )
  }

  // Handle template selection
  const handleSelectTemplate = (templateContent: string) => {
    setMessageText(templateContent)
    setShowTemplates(false)
  }

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return format(date, 'h:mm a', { locale: isRTL ? arSA : enUS })
  }

  // Get message status icon
  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      case 'sent':
        return <Check className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
    }
  }

  // Transform API data
  const conversation = conversationData?.conversation
  const messages: Message[] = conversationData?.messages || []
  const contact = conversation?.contact
  const templates = templatesData?.slice(0, 5) || []

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'واتساب', href: ROUTES.dashboard.crm.whatsapp.list, isActive: true },
    { title: 'التسويق بالبريد', href: ROUTES.dashboard.crm.emailMarketing.list, isActive: false },
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
        {/* Back Button & Conversation Header */}
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="h-10 px-4 text-slate-600 hover:text-navy hover:bg-white rounded-xl"
          >
            <Link to={ROUTES.dashboard.crm.whatsapp.list}>
              <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" aria-hidden="true" />
              العودة للمحادثات
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-16 w-2/3 rounded-2xl" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">خطأ في تحميل المحادثة</h3>
            <p className="text-slate-500 mb-4">{error?.message || 'حدث خطأ في الاتصال'}</p>
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
              <Link to={ROUTES.dashboard.crm.whatsapp.list}>العودة للمحادثات</Link>
            </Button>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <CardHeader className="border-b border-slate-100 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
                        {contact?.name?.charAt(0) || conversation?.phoneNumber?.charAt(0) || 'W'}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy text-lg">
                          {contact?.name || conversation?.phoneNumber || 'محادثة واتساب'}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {conversation?.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-lg px-3 py-1 ${
                        conversation?.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700'
                          : conversation?.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {conversation?.status === 'open' ? 'مفتوحة' :
                         conversation?.status === 'pending' ? 'قيد الانتظار' : 'مغلقة'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-navy">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>إغلاق المحادثة</DropdownMenuItem>
                          <DropdownMenuItem>تعيين لموظف</DropdownMenuItem>
                          <DropdownMenuItem>ربط بعميل محتمل</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="p-0">
                  <ScrollArea
                    ref={scrollAreaRef}
                    className="h-[calc(100vh-400px)] min-h-[400px] p-6"
                  >
                    {/* WhatsApp Background Pattern */}
                    <div className="absolute inset-0 bg-[#ECE5DD] opacity-30 pointer-events-none" />

                    <div className="relative space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-emerald-500" aria-hidden="true" />
                          </div>
                          <p className="text-slate-500">لا توجد رسائل بعد</p>
                          <p className="text-sm text-slate-400 mt-1">ابدأ المحادثة بإرسال رسالة</p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={message._id || index}
                            className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                message.direction === 'outgoing'
                                  ? 'bg-emerald-500 text-white rounded-br-sm'
                                  : 'bg-white text-slate-800 rounded-bl-sm'
                              }`}
                            >
                              {/* Media Preview */}
                              {message.mediaUrl && (
                                <div className="mb-2">
                                  {message.messageType === 'image' && (
                                    <img
                                      src={message.mediaUrl}
                                      alt="صورة"
                                      className="rounded-lg max-w-full h-auto"
                                    />
                                  )}
                                  {message.messageType === 'video' && (
                                    <div className="flex items-center gap-2 p-3 bg-black/10 rounded-lg">
                                      <Video className="h-5 w-5" />
                                      <span className="text-sm">فيديو</span>
                                    </div>
                                  )}
                                  {message.messageType === 'document' && (
                                    <div className="flex items-center gap-2 p-3 bg-black/10 rounded-lg">
                                      <FileText className="h-5 w-5" />
                                      <span className="text-sm">مستند</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Message Content */}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                              {/* Timestamp & Status */}
                              <div className={`flex items-center gap-1.5 mt-1 ${
                                message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                              }`}>
                                <span className={`text-xs ${
                                  message.direction === 'outgoing' ? 'text-emerald-100' : 'text-slate-400'
                                }`}>
                                  {formatMessageTime(message.timestamp)}
                                </span>
                                {message.direction === 'outgoing' && (
                                  <span className="text-emerald-100">
                                    {getMessageStatusIcon(message.status)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t border-slate-100 p-4 bg-white">
                    {/* Templates Dropdown */}
                    {showTemplates && templates.length > 0 && (
                      <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-2 font-medium">القوالب السريعة:</p>
                        <div className="flex flex-wrap gap-2">
                          {templates.map((template: any) => (
                            <Button
                              key={template.id}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                              onClick={() => handleSelectTemplate(template.name)}
                            >
                              {template.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-end gap-3">
                      {/* Attachment Buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                          onClick={() => setShowTemplates(!showTemplates)}
                        >
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl hidden sm:flex"
                        >
                          <Image className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Message Input */}
                      <Textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm"
                      />

                      {/* Send Button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMessageMutation.isPending}
                        className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-5 w-5 ms-2 rtl:-scale-x-100" />
                            إرسال
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Contact Info */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                      {contact?.name?.charAt(0) || conversation?.phoneNumber?.charAt(0) || 'W'}
                    </div>
                    <CardTitle className="text-xl font-bold text-white">
                      {contact?.name || 'عميل واتساب'}
                    </CardTitle>
                    <p className="text-emerald-100 text-sm mt-1">{conversation?.phoneNumber}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {contact?.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                        <p className="font-medium text-navy text-sm">{contact.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-500">رقم الهاتف</p>
                      <p className="font-medium text-navy text-sm" dir="ltr">{conversation?.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-slate-500">آخر نشاط</p>
                      <p className="font-medium text-navy text-sm">
                        {conversation?.lastMessageAt
                          ? format(new Date(conversation.lastMessageAt), 'd MMMM yyyy', { locale: arSA })
                          : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start rounded-xl h-11 text-sm">
                    <User className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                    إنشاء عميل محتمل
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-11 text-sm">
                    <MessageSquare className="h-4 w-4 ms-2 text-emerald-500" aria-hidden="true" />
                    إرسال قالب
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-11 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200">
                    <Clock className="h-4 w-4 ms-2" aria-hidden="true" />
                    إغلاق المحادثة
                  </Button>
                </CardContent>
              </Card>

              {/* Conversation Stats */}
              <Card className="rounded-2xl border-slate-100 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-navy">إحصائيات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-navy">{messages.length}</p>
                      <p className="text-xs text-slate-500">إجمالي الرسائل</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <p className="text-2xl font-bold text-navy">
                        {messages.filter(m => m.direction === 'incoming').length}
                      </p>
                      <p className="text-xs text-slate-500">رسائل واردة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Main>
    </>
  )
}
