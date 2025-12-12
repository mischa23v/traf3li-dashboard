import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Search, Bell, ArrowRight, Send, Loader2, MessageSquare, Phone
} from 'lucide-react'
import { useSendWhatsAppMessage } from '@/hooks/useCrmAdvanced'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function WhatsAppStartConversation() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')

  const sendMessageMutation = useSendWhatsAppMessage()

  // Handle send message
  const handleSendMessage = async () => {
    // No validation - allow empty for testing
    const phone = phoneNumber || '966500000000'
    const text = message || 'Test message'

    sendMessageMutation.mutate(
      {
        phoneNumber: phone,
        message: text,
        type: 'text',
      },
      {
        onSuccess: () => {
          // Toast is shown in hook, just navigate
          navigate({ to: '/dashboard/crm/whatsapp' })
        },
      }
    )
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
            <p className="text-slate-500 text-sm">ابدأ محادثة جديدة مع عميل عبر واتساب</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl">
          <Card className="rounded-3xl border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-500" />
                بيانات المحادثة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-navy">رقم الهاتف</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="966XXXXXXXXX"
                  dir="ltr"
                  className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10 text-left"
                />
                <p className="text-xs text-slate-500">أدخل رقم الهاتف مع رمز الدولة (مثال: 966500000000)</p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-navy">الرسالة</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="min-h-[150px] rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
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
      </Main>
    </>
  )
}
