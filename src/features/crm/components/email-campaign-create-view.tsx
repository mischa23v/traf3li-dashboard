import { useState } from 'react'
import {
  ArrowRight,
  Save,
  Mail,
  Users,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Plus,
  X,
  Send,
  Eye,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'
import { SalesSidebar } from './sales-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateEmailCampaign, useSegments, useEmailTemplates } from '@/hooks/useCrmAdvanced'
import { cn } from '@/lib/utils'

export function EmailCampaignCreateView() {
  const navigate = useNavigate()
  const createCampaignMutation = useCreateEmailCampaign()
  const { data: segmentsData } = useSegments()
  const { data: templatesData } = useEmailTemplates()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',

    // Content
    templateId: '',
    htmlContent: '',
    textContent: '',

    // Recipients
    recipientType: 'segment', // 'segment' | 'manual' | 'all'
    segmentIds: [] as string[],
    manualEmails: [] as string[],

    // Scheduling
    sendType: 'immediate', // 'immediate' | 'scheduled'
    scheduledDate: '',
    scheduledTime: '',
    timezone: 'Asia/Riyadh',

    // Options
    trackOpens: true,
    trackClicks: true,
    allowUnsubscribe: true,

    // Advanced
    attachments: [] as string[],
    customHeaders: {} as Record<string, string>,
    tags: [] as string[],
  })

  const [emailInput, setEmailInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      if (!formData.manualEmails.includes(emailInput.trim())) {
        handleChange('manualEmails', [...formData.manualEmails, emailInput.trim()])
        setEmailInput('')
      }
    }
  }

  const removeEmail = (email: string) => {
    handleChange('manualEmails', formData.manualEmails.filter(e => e !== email))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const campaignData: any = {
      name: formData.name,
      subject: formData.subject,
      preheader: formData.preheader || undefined,
      fromName: formData.fromName,
      fromEmail: formData.fromEmail,
      replyTo: formData.replyTo || formData.fromEmail,

      // Content
      templateId: formData.templateId || undefined,
      htmlContent: formData.htmlContent,
      textContent: formData.textContent || undefined,

      // Recipients
      recipients: {
        type: formData.recipientType,
        segmentIds: formData.segmentIds.length > 0 ? formData.segmentIds : undefined,
        emails: formData.manualEmails.length > 0 ? formData.manualEmails : undefined,
      },

      // Scheduling
      scheduling: {
        type: formData.sendType,
        scheduledFor: formData.sendType === 'scheduled' && formData.scheduledDate
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime || '09:00'}`)
          : undefined,
        timezone: formData.timezone,
      },

      // Options
      options: {
        trackOpens: formData.trackOpens,
        trackClicks: formData.trackClicks,
        allowUnsubscribe: formData.allowUnsubscribe,
      },

      // Advanced
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    createCampaignMutation.mutate(campaignData, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.crm.emailMarketing.list })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'خط المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'التسويق عبر البريد', href: ROUTES.dashboard.crm.emailMarketing.list, isActive: true },
    { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD */}
        <ProductivityHero badge="CRM" title="إنشاء حملة بريد إلكتروني" type="email-marketing" listMode={true} hideButtons={true}>
          <Link to={ROUTES.dashboard.crm.emailMarketing.list}>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </ProductivityHero>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Info Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      اسم الحملة
                    </label>
                    <Input
                      placeholder="حملة العروض الصيفية"
                      className="rounded-xl"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      عنوان الرسالة
                    </label>
                    <Input
                      placeholder="عروض حصرية لك - خصم حتى 50%"
                      className="rounded-xl"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      نص المعاينة (Preheader)
                    </label>
                    <Input
                      placeholder="نص قصير يظهر في معاينة البريد..."
                      className="rounded-xl"
                      value={formData.preheader}
                      onChange={(e) => handleChange('preheader', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        اسم المرسل
                      </label>
                      <Input
                        placeholder="شركة الأمل القانونية"
                        className="rounded-xl"
                        value={formData.fromName}
                        onChange={(e) => handleChange('fromName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        بريد المرسل
                      </label>
                      <Input
                        type="email"
                        placeholder="info@example.com"
                        className="rounded-xl"
                        dir="ltr"
                        value={formData.fromEmail}
                        onChange={(e) => handleChange('fromEmail', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      بريد الرد (Reply-To)
                    </label>
                    <Input
                      type="email"
                      placeholder="reply@example.com"
                      className="rounded-xl"
                      dir="ltr"
                      value={formData.replyTo}
                      onChange={(e) => handleChange('replyTo', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    محتوى الرسالة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      قالب البريد الإلكتروني
                    </label>
                    <Select value={formData.templateId} onValueChange={(v) => handleChange('templateId', v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="اختر قالب أو اترك فارغاً للكتابة اليدوية" />
                      </SelectTrigger>
                      <SelectContent>
                        {templatesData?.data?.map((template: any) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      محتوى HTML
                    </label>
                    <Textarea
                      placeholder="<h1>مرحباً بك</h1><p>محتوى الرسالة هنا...</p>"
                      className="min-h-[200px] rounded-xl font-mono text-sm"
                      dir="ltr"
                      value={formData.htmlContent}
                      onChange={(e) => handleChange('htmlContent', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      محتوى نصي بديل (Plain Text)
                    </label>
                    <Textarea
                      placeholder="نسخة نصية من الرسالة للأجهزة التي لا تدعم HTML..."
                      className="min-h-[100px] rounded-xl"
                      value={formData.textContent}
                      onChange={(e) => handleChange('textContent', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recipients Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المستلمون
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      نوع المستلمين
                    </label>
                    <Select value={formData.recipientType} onValueChange={(v) => handleChange('recipientType', v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المشتركين</SelectItem>
                        <SelectItem value="segment">شرائح محددة</SelectItem>
                        <SelectItem value="manual">إدخال يدوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.recipientType === 'segment' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        اختر الشرائح
                      </label>
                      <Select
                        value={formData.segmentIds[0] || ''}
                        onValueChange={(v) => {
                          if (!formData.segmentIds.includes(v)) {
                            handleChange('segmentIds', [...formData.segmentIds, v])
                          }
                        }}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر شريحة..." />
                        </SelectTrigger>
                        <SelectContent>
                          {segmentsData?.data?.map((segment: any) => (
                            <SelectItem key={segment._id} value={segment._id}>
                              {segment.name} ({segment.subscriberCount || 0} مشترك)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.segmentIds.map(id => {
                          const segment = segmentsData?.data?.find((s: any) => s._id === id)
                          return (
                            <Badge key={id} variant="secondary" className="gap-1 px-3 py-1">
                              {segment?.name || id}
                              <button
                                type="button"
                                onClick={() => handleChange('segmentIds', formData.segmentIds.filter(sid => sid !== id))}
                                className="hover:text-red-500 me-1"
                              >
                                <X className="w-3 h-3" aria-hidden="true" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {formData.recipientType === 'manual' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        عناوين البريد الإلكتروني
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.manualEmails.map(email => (
                          <Badge key={email} variant="secondary" className="gap-1 px-3 py-1">
                            {email}
                            <button
                              type="button"
                              onClick={() => removeEmail(email)}
                              className="hover:text-red-500 me-1"
                            >
                              <X className="w-3 h-3" aria-hidden="true" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          className="rounded-xl flex-1"
                          dir="ltr"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addEmail()
                            }
                          }}
                        />
                        <Button type="button" variant="outline" onClick={addEmail} className="rounded-xl">
                          <Plus className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Scheduling Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    الجدولة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      وقت الإرسال
                    </label>
                    <Select value={formData.sendType} onValueChange={(v) => handleChange('sendType', v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">إرسال فوري</SelectItem>
                        <SelectItem value="scheduled">جدولة للإرسال لاحقاً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.sendType === 'scheduled' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          التاريخ
                        </label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={formData.scheduledDate}
                          onChange={(e) => handleChange('scheduledDate', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                          الوقت
                        </label>
                        <Input
                          type="time"
                          className="rounded-xl"
                          value={formData.scheduledTime}
                          onChange={(e) => handleChange('scheduledTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Options Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    خيارات متقدمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <label className="text-sm font-medium text-slate-700">
                      تتبع فتح الرسائل
                    </label>
                    <Switch
                      checked={formData.trackOpens}
                      onCheckedChange={(checked) => handleChange('trackOpens', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <label className="text-sm font-medium text-slate-700">
                      تتبع النقرات
                    </label>
                    <Switch
                      checked={formData.trackClicks}
                      onCheckedChange={(checked) => handleChange('trackClicks', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <label className="text-sm font-medium text-slate-700">
                      السماح بإلغاء الاشتراك
                    </label>
                    <Switch
                      checked={formData.allowUnsubscribe}
                      onCheckedChange={(checked) => handleChange('allowUnsubscribe', checked)}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">الوسوم</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 me-1">
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="أضف وسم..."
                        className="rounded-xl flex-1"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addTag} className="rounded-xl">
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Link to={ROUTES.dashboard.crm.emailMarketing.list}>
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      حفظ الحملة
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Widgets */}
          <SalesSidebar context="email-marketing" />
        </div>
      </Main>
    </>
  )
}
