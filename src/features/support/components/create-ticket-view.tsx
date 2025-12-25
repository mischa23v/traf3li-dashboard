/**
 * Create Ticket View
 * Comprehensive support ticket creation form
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Save,
  Loader2,
  X,
  Plus,
  Headphones,
  User,
  FileText,
  AlertCircle,
  Tag as TagIcon,
  Paperclip,
  Upload,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { SupportSidebar } from './support-sidebar'
import { useCreateTicket } from '@/hooks/use-support'
import { useClients } from '@/hooks/useClients'
import { useTeamMembers } from '@/hooks/useUsers'
import { cn } from '@/lib/utils'
import type { TicketType, TicketPriority, TicketStatus } from '@/types/support'

// ==================== CONSTANTS ====================

const TICKET_TYPES: { value: TicketType; label: string; labelEn: string; color: string }[] = [
  { value: 'question', label: 'سؤال', labelEn: 'Question', color: 'bg-blue-100 text-blue-700' },
  { value: 'problem', label: 'مشكلة', labelEn: 'Problem', color: 'bg-orange-100 text-orange-700' },
  { value: 'feature_request', label: 'طلب ميزة', labelEn: 'Feature Request', color: 'bg-purple-100 text-purple-700' },
  { value: 'incident', label: 'حادثة', labelEn: 'Incident', color: 'bg-red-100 text-red-700' },
  { value: 'service_request', label: 'طلب خدمة', labelEn: 'Service Request', color: 'bg-emerald-100 text-emerald-700' },
]

const PRIORITY_OPTIONS: { value: TicketPriority; label: string; labelEn: string; dotColor: string }[] = [
  { value: 'low', label: 'منخفضة', labelEn: 'Low', dotColor: 'bg-slate-400' },
  { value: 'medium', label: 'متوسطة', labelEn: 'Medium', dotColor: 'bg-blue-500' },
  { value: 'high', label: 'عالية', labelEn: 'High', dotColor: 'bg-orange-500' },
  { value: 'urgent', label: 'عاجلة', labelEn: 'Urgent', dotColor: 'bg-red-500' },
]

const STATUS_OPTIONS: { value: TicketStatus; label: string; labelEn: string }[] = [
  { value: 'open', label: 'مفتوحة', labelEn: 'Open' },
  { value: 'replied', label: 'تم الرد', labelEn: 'Replied' },
  { value: 'resolved', label: 'تم الحل', labelEn: 'Resolved' },
  { value: 'closed', label: 'مغلقة', labelEn: 'Closed' },
  { value: 'on_hold', label: 'معلقة', labelEn: 'On Hold' },
]

// ==================== COMPONENT ====================

export function CreateTicketView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createTicket, isPending } = useCreateTicket()
  const { data: clientsData } = useClients()
  const { data: teamData } = useTeamMembers()

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    ticketType: 'question' as TicketType,
    priority: 'medium' as TicketPriority,
    status: 'open' as TicketStatus,
    clientId: '',
    assignedTo: '',
    tags: [] as string[],
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag))
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.subject.trim()) {
      return
    }

    if (!formData.description.trim()) {
      return
    }

    // Build ticket data
    const ticketData = {
      subject: formData.subject,
      description: formData.description,
      ticketType: formData.ticketType,
      priority: formData.priority,
      clientId: formData.clientId || undefined,
      assignedTo: formData.assignedTo || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    createTicket(ticketData, {
      onSuccess: () => {
        navigate({ to: '/dashboard/support' })
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الدعم الفني', href: '/dashboard/support', isActive: true },
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
        <ProductivityHero
          badge="الدعم الفني"
          title="إنشاء تذكرة دعم"
          type="support"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>

              {/* BASIC INFO CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الموضوع <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="أدخل موضوع التذكرة"
                      className="rounded-xl border-slate-200"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      الوصف <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="اشرح المشكلة أو الطلب بالتفصيل..."
                      className="min-h-[120px] rounded-xl border-slate-200"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* TYPE & PRIORITY CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    النوع والأولوية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Ticket Type */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">نوع التذكرة</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {TICKET_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleChange('ticketType', type.value)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                            formData.ticketType === type.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 hover:border-slate-300 text-slate-600"
                          )}
                        >
                          <span className="text-xs font-medium">{type.label}</span>
                          <span className="text-xs text-slate-500">{type.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">الأولوية</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => handleChange('priority', v as TicketPriority)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(p => (
                            <SelectItem key={p.value} value={p.value}>
                              <div className="flex items-center gap-2">
                                <span className={cn("w-2 h-2 rounded-full", p.dotColor)} />
                                {p.label} ({p.labelEn})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">الحالة</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => handleChange('status', v as TicketStatus)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label} ({s.labelEn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ASSIGNMENT CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-500" />
                    العميل والتعيين
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer/Client */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">العميل / جهة الاتصال</Label>
                      <Select
                        value={formData.clientId}
                        onValueChange={(v) => handleChange('clientId', v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="اختر العميل (اختياري)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- بدون عميل --</SelectItem>
                          {(clientsData?.data ?? clientsData?.clients ?? [])?.map((client: any) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.nameAr || client.name || client.fullName || client.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">تعيين إلى</Label>
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(v) => handleChange('assignedTo', v)}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="اختر المستخدم (اختياري)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- غير معين --</SelectItem>
                          {(teamData?.users ?? [])?.map((user: any) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.fullNameAr || user.fullName || user.name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* TAGS CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TagIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    الوسوم
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tags Display */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1 rounded-lg">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {/* Add Tag */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف وسماً..."
                      className="rounded-xl border-slate-200 flex-1"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTag}
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ATTACHMENTS CARD */}
              <Card className="border-slate-200 mb-6 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    المرفقات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      اسحب الملفات هنا أو انقر للتحميل
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, JPG, PNG (حتى 10 ميجابايت)
                    </p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Link to="/dashboard/support">
                  <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy rounded-xl">
                    <X className="ms-2 h-4 w-4" aria-hidden="true" />
                    إلغاء
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={isPending || !formData.subject.trim() || !formData.description.trim()}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      حفظ التذكرة
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Widgets */}
          <SupportSidebar />
        </div>
      </Main>
    </>
  )
}
