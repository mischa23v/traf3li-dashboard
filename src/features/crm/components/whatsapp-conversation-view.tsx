import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  User,
  Mail,
  MapPin,
  Tag,
  AlertCircle,
  MessageSquare,
  Search,
  Bell,
  Loader2,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { SalesSidebar } from './sales-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useWhatsAppConversation,
  useSendWhatsAppMessage,
  useMarkConversationAsRead,
  useWhatsAppTemplates,
} from '@/hooks/useCrmAdvanced'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  timestamp: string
  direction: 'inbound' | 'outbound'
  status?: 'sent' | 'delivered' | 'read' | 'failed'
  type?: 'text' | 'image' | 'document' | 'template'
}

export function WhatsAppConversationView() {
  const { conversationId } = useParams({ strict: false }) as { conversationId: string }
  const navigate = useNavigate()
  const [messageText, setMessageText] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch conversation data
  const {
    data: conversationData,
    isLoading,
    isError,
    error,
    refetch,
  } = useWhatsAppConversation(conversationId)

  // Fetch templates
  const { data: templatesData } = useWhatsAppTemplates()

  // Mutations
  const sendMessageMutation = useSendWhatsAppMessage()
  const markAsReadMutation = useMarkConversationAsRead()

  // Mark as read when opening conversation
  useEffect(() => {
    if (conversationId && conversationData?.conversation?.unreadCount > 0) {
      markAsReadMutation.mutate(conversationId)
    }
  }, [conversationId, conversationData])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [conversationData?.messages])

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || sendMessageMutation.isPending) return

    const trimmedMessage = messageText.trim()
    setMessageText('')

    sendMessageMutation.mutate(
      {
        conversationId,
        message: trimmedMessage,
        type: 'text',
      },
      {
        onError: () => {
          // Restore message on error
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
    return format(date, 'h:mm a', { locale: arSA })
  }

  // Get message status icon
  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" aria-hidden="true" />
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-slate-400" aria-hidden="true" />
      case 'sent':
        return <Check className="h-4 w-4 text-slate-400" aria-hidden="true" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
    }
  }

  // Transform API data
  const conversation = conversationData?.conversation
  const messages: Message[] = conversationData?.messages || []
  const contact = conversation?.contact
  const templates = templatesData?.slice(0, 5) || []

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

        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              aria-label="بحث"
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="التنبيهات"
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard/crm/whatsapp"
            className="inline-flex items-center text-slate-500 hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4 ms-2" />
            العودة إلى قائمة المحادثات
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div>
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                حدث خطأ أثناء تحميل المحادثة
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || 'تعذر الاتصال بالخادم'}
              </p>
              <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && !isError && conversation && (
          <>
            {/* Hero Section */}
            <ProductivityHero
              badge="CRM"
              title={contact?.name || conversation.phoneNumber}
              type="whatsapp"
              listMode={true}
              hideButtons={true}
            >
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <Phone className="h-4 w-4 ms-2" aria-hidden="true" />
                  اتصال
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  <Video className="h-4 w-4 ms-2" aria-hidden="true" />
                  مكالمة فيديو
                </Button>
                <Badge className="bg-white/10 text-white border-white/20">
                  {conversation.status === 'open' ? 'مفتوح' : conversation.status === 'closed' ? 'مغلق' : 'قيد الانتظار'}
                </Badge>
              </div>
            </ProductivityHero>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chat Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Messages Card */}
                <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact?.avatar} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-navy">
                            {contact?.name || conversation.phoneNumber}
                          </h3>
                          <p className="text-sm text-slate-500" dir="ltr">
                            {conversation.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-navy"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <User className="h-4 w-4 ms-2" />
                            عرض معلومات العميل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="h-4 w-4 ms-2" />
                            إضافة وسم
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <AlertCircle className="h-4 w-4 ms-2" />
                            إغلاق المحادثة
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages Area */}
                    <ScrollArea
                      ref={scrollAreaRef}
                      className="h-[500px] p-6 bg-slate-50/50"
                    >
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">لا توجد رسائل بعد</p>
                          <p className="text-xs text-slate-400 mt-1">ابدأ محادثة جديدة</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => {
                            const isOutbound = message.direction === 'outbound'
                            return (
                              <div
                                key={message.id}
                                className={cn(
                                  'flex',
                                  isOutbound ? 'justify-start' : 'justify-end'
                                )}
                              >
                                <div
                                  className={cn(
                                    'max-w-[70%] rounded-2xl px-4 py-3',
                                    isOutbound
                                      ? 'bg-white border border-slate-200 text-slate-800'
                                      : 'bg-emerald-500 text-white'
                                  )}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                  <div
                                    className={cn(
                                      'flex items-center gap-1 mt-2 text-xs',
                                      isOutbound ? 'text-slate-400' : 'text-emerald-100'
                                    )}
                                  >
                                    <span>{formatMessageTime(message.timestamp)}</span>
                                    {!isOutbound && getMessageStatusIcon(message.status)}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input Area */}
                    <div className="border-t border-slate-100 bg-white p-4">
                      {/* Quick Templates */}
                      {showTemplates && templates.length > 0 && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-xl space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-slate-600">قوالب سريعة</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowTemplates(false)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          {templates.map((template: any) => (
                            <button
                              key={template._id}
                              onClick={() => handleSelectTemplate(template.content || template.name)}
                              className="w-full text-end p-2 rounded-lg bg-white hover:bg-emerald-50 text-sm text-slate-700 border border-slate-200 transition-colors"
                            >
                              {template.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Input Controls */}
                      <div className="flex items-end gap-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-emerald-600"
                            onClick={() => setShowTemplates(!showTemplates)}
                          >
                            <MessageSquare className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-emerald-600"
                          >
                            <Paperclip className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-emerald-600"
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </div>
                        <Textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="اكتب رسالتك..."
                          className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageText.trim() || sendMessageMutation.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 h-11"
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-5 w-5 ms-2" />
                              إرسال
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Info Card */}
                {contact && (
                  <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-navy">
                        معلومات العميل
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {contact.email && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Mail className="h-5 w-5 text-blue-500" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                              <p className="font-medium text-navy">{contact.email}</p>
                            </div>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Phone className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-slate-500">الهاتف</p>
                              <p className="font-medium text-navy" dir="ltr">
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                        )}
                        {contact.location && (
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <MapPin className="h-5 w-5 text-red-500" aria-hidden="true" />
                            <div>
                              <p className="text-xs text-slate-500">الموقع</p>
                              <p className="font-medium text-navy">{contact.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {conversation.tags && conversation.tags.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500 mb-2">الوسوم</p>
                          <div className="flex flex-wrap gap-2">
                            {conversation.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="rounded-full">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <SalesSidebar context="whatsapp" />
            </div>
          </>
        )}
      </Main>
    </>
  )
}
