import { useState, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Bell, ArrowRight, Users, Send,
  Loader2, FileText, Calendar, Clock, CheckCircle2,
  Megaphone, Target, BarChart3
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
  useCreateWhatsAppBroadcast,
} from '@/hooks/useCrmAdvanced'
import { useLeads } from '@/hooks/useCrm'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function WhatsAppNewConversation() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Form state
  const [broadcastName, setBroadcastName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )


  // Fetch data
  const { data: templatesData } = useWhatsAppTemplates()
  const { data: leadsData } = useLeads({})
  const createBroadcastMutation = useCreateWhatsAppBroadcast()

  const templates = templatesData || []
  const leads = leadsData?.data || []

  // Filter leads with phone numbers
  const leadsWithPhone = useMemo(() => {
    return leads.filter((lead: any) => lead.phone)
  }, [leads])

  // Search filter
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leadsWithPhone
    const query = searchQuery.toLowerCase()
    return leadsWithPhone.filter((lead: any) =>
      (lead.name?.toLowerCase().includes(query)) ||
      (lead.email?.toLowerCase().includes(query)) ||
      (lead.phone?.includes(query))
    )
  }, [leadsWithPhone, searchQuery])

  // Toggle recipient selection
  const toggleRecipient = (leadId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  // Select all filtered leads
  const selectAll = () => {
    const allIds = filteredLeads.map((lead: any) => lead._id)
    setSelectedRecipients(prev => {
      const newSelection = new Set([...prev, ...allIds])
      return Array.from(newSelection)
    })
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedRecipients([])
  }

  // Handle create broadcast
  const handleCreateBroadcast = async () => {
    // Get template details
    const template = selectedTemplateData
    const templateName = template?.name || selectedTemplate || 'test-template'
    const language = template?.language || 'ar'

    const broadcastData: any = {
      name: broadcastName || `بث ${new Date().toLocaleDateString('ar-SA')}`,
      type: 'template',
      template: {
        templateId: template?._id || template?.id,
        templateName: templateName,
        language: language,
        variables: [
          { position: 1, type: 'dynamic', fieldName: 'firstName' }
        ],
      },
      audienceType: 'custom',
    }

    if (scheduleType === 'scheduled' && scheduledDate && scheduledTime) {
      broadcastData.scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)
    }

    createBroadcastMutation.mutate(broadcastData, {
      onSuccess: () => {
        toast.success('تم إنشاء حملة البث بنجاح')
        navigate({ to: ROUTES.dashboard.crm.whatsapp.list })
      },
      onError: (error: any) => {
        toast.error(error.message || 'فشل في إنشاء حملة البث')
      },
    })
  }

  // Get selected template details
  const selectedTemplateData = useMemo(() => {
    return templates.find((t: any) => (t._id || t.id) === selectedTemplate)
  }, [templates, selectedTemplate])

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
        {/* Back Button */}
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

        {/* Page Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Megaphone className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">حملة بث واتساب</h1>
            <p className="text-slate-500 text-sm">إنشاء حملة تسويقية جديدة عبر واتساب</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  تفاصيل الحملة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Broadcast Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">اسم الحملة</Label>
                  <Input
                    value={broadcastName}
                    onChange={(e) => setBroadcastName(e.target.value)}
                    placeholder="مثال: حملة العيد الوطني"
                    className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">القالب المعتمد *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10">
                      <FileText className="h-5 w-5 ms-2 text-slate-400" aria-hidden="true" />
                      <SelectValue placeholder="اختر قالب معتمد من واتساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: any) => (
                        <SelectItem key={template._id || template.id} value={template._id || template.id}>
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
                  {selectedTemplateData && (
                    <div className="p-4 bg-slate-50 rounded-xl mt-2">
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {selectedTemplateData.content || selectedTemplateData.body || 'معاينة غير متاحة'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-navy">موعد الإرسال</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleType('now')}
                      className={`p-4 rounded-2xl border-2 transition-all text-start ${
                        scheduleType === 'now'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-200 bg-white'
                      }`}
                    >
                      <Send className={`h-6 w-6 mb-2 ${
                        scheduleType === 'now' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                      <p className={`font-bold ${scheduleType === 'now' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        إرسال الآن
                      </p>
                      <p className="text-xs text-slate-500 mt-1">سيتم إرسال الحملة فوراً</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleType('scheduled')}
                      className={`p-4 rounded-2xl border-2 transition-all text-start ${
                        scheduleType === 'scheduled'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-200 bg-white'
                      }`}
                    >
                      <Calendar className={`h-6 w-6 mb-2 ${
                        scheduleType === 'scheduled' ? 'text-emerald-600' : 'text-slate-400'
                      }`} />
                      <p className={`font-bold ${scheduleType === 'scheduled' ? 'text-emerald-700' : 'text-slate-700'}`}>
                        جدولة الإرسال
                      </p>
                      <p className="text-xs text-slate-500 mt-1">اختر موعد إرسال الحملة</p>
                    </button>
                  </div>
                </div>

                {/* Scheduled Date/Time */}
                {scheduleType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-navy">التاريخ</Label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-navy">الوقت</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipients Selection */}
            <Card className="rounded-3xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    المستلمين ({selectedRecipients.length} مختار)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAll}
                      className="text-xs rounded-lg"
                    >
                      تحديد الكل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-xs rounded-lg"
                    >
                      إلغاء التحديد
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                  <Input
                    defaultValue={searchQuery}
                    onChange={(e) => debouncedSetSearch(e.target.value)}
                    placeholder="البحث عن عميل..."
                    className="h-12 ps-12 rounded-xl bg-slate-50 border-0 hover:bg-slate-100 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                {/* Recipients List */}
                <ScrollArea className="h-[300px] rounded-xl border border-slate-100">
                  <div className="p-2 space-y-1">
                    {filteredLeads.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                        <p>لا يوجد عملاء بأرقام هاتف</p>
                      </div>
                    ) : (
                      filteredLeads.map((lead: any) => (
                        <label
                          key={lead._id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            selectedRecipients.includes(lead._id)
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <Checkbox
                            checked={selectedRecipients.includes(lead._id)}
                            onCheckedChange={() => toggleRecipient(lead._id)}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {(lead.name || lead.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-navy text-sm truncate">{lead.name || lead.email}</p>
                            <p className="text-xs text-slate-500" dir="ltr">{lead.phone}</p>
                          </div>
                          {selectedRecipients.includes(lead._id) && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <p className="text-xs text-slate-500">
                  يتم عرض العملاء الذين لديهم أرقام هواتف فقط ({leadsWithPhone.length} عميل متاح)
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate({ to: ROUTES.dashboard.crm.whatsapp.list })}
                className="h-12 px-6 rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateBroadcast}
                disabled={createBroadcastMutation.isPending}
                className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                {createBroadcastMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Megaphone className="h-5 w-5 ms-2" aria-hidden="true" />
                    {scheduleType === 'now' ? 'إرسال الحملة' : 'جدولة الحملة'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Summary */}
            <Card className="rounded-2xl border-slate-100 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm">ملخص الحملة</p>
                    <p className="font-bold text-xl">{selectedRecipients.length} مستلم</p>
                  </div>
                </div>
                <div className="h-px bg-white/20"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100">القالب</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {selectedTemplateData?.name || 'لم يتم الاختيار'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100">الجدولة</span>
                    <span className="font-medium">
                      {scheduleType === 'now' ? 'فوري' : scheduledDate || 'لم يحدد'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy">نصائح هامة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">القوالب المعتمدة</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      يجب استخدام قوالب معتمدة من واتساب للحملات التسويقية
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-emerald-50 rounded-xl">
                  <Target className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">استهداف دقيق</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      اختر العملاء المهتمين لتحقيق أعلى معدل تفاعل
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-amber-50 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">أفضل الأوقات</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      أفضل أوقات الإرسال: 9-11 صباحاً و 7-9 مساءً
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
