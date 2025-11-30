import { useState } from 'react'
import {
  ArrowRight, Save, User,
  FileText, Loader2, Plus, X, Phone, Mail,
  Building, DollarSign, Users,
  ChevronDown, ChevronUp, Percent, Star,
  Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { CrmSidebar } from './crm-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { useCreateReferral } from '@/hooks/useCrm'
import type { ReferralType, ReferralStatus, FeeType } from '@/types/crm'

const TYPE_OPTIONS: { value: ReferralType; label: string }[] = [
  { value: 'client', label: 'عميل' },
  { value: 'lawyer', label: 'محامي' },
  { value: 'law_firm', label: 'مكتب محاماة' },
  { value: 'contact', label: 'جهة اتصال' },
  { value: 'employee', label: 'موظف' },
  { value: 'partner', label: 'شريك' },
  { value: 'organization', label: 'منظمة' },
  { value: 'other', label: 'آخر' },
]

const STATUS_OPTIONS: { value: ReferralStatus; label: string }[] = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
]

const FEE_TYPE_OPTIONS: { value: FeeType; label: string }[] = [
  { value: 'none', label: 'لا يوجد' },
  { value: 'percentage', label: 'نسبة مئوية' },
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'tiered', label: 'متدرج' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'منخفض' },
  { value: 'normal', label: 'عادي' },
  { value: 'high', label: 'عالي' },
  { value: 'vip', label: 'VIP' },
]

export function CreateReferralView() {
  const navigate = useNavigate()
  const createReferralMutation = useCreateReferral()

  // Form state
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    nameAr: '',
    type: 'client' as ReferralType,
    status: 'active' as ReferralStatus,
    priority: 'normal' as 'low' | 'normal' | 'high' | 'vip',
    // External source info
    externalName: '',
    externalEmail: '',
    externalPhone: '',
    externalCompany: '',
    // Fee agreement
    hasFeeAgreement: false,
    feeType: 'none' as FeeType,
    feePercentage: 0,
    feeFixedAmount: 0,
    // Other
    notes: '',
    tags: [] as string[],
  })

  // Tags input
  const [tagInput, setTagInput] = useState('')

  // Section toggles
  const [showFeeAgreement, setShowFeeAgreement] = useState(false)
  const [showExternalSource, setShowExternalSource] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

    const referralData = {
      name: formData.name,
      nameAr: formData.nameAr || undefined,
      type: formData.type,
      status: formData.status,
      priority: formData.priority,
      // External source
      ...(showExternalSource && (formData.externalName || formData.externalEmail || formData.externalPhone || formData.externalCompany) && {
        externalSource: {
          name: formData.externalName || undefined,
          email: formData.externalEmail || undefined,
          phone: formData.externalPhone || undefined,
          company: formData.externalCompany || undefined,
        },
      }),
      // Fee agreement
      hasFeeAgreement: formData.hasFeeAgreement,
      feeType: formData.hasFeeAgreement ? formData.feeType : 'none',
      ...(formData.hasFeeAgreement && formData.feeType === 'percentage' && {
        feePercentage: formData.feePercentage,
      }),
      ...(formData.hasFeeAgreement && formData.feeType === 'fixed' && {
        feeFixedAmount: formData.feeFixedAmount,
      }),
      // Other
      notes: formData.notes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    createReferralMutation.mutate(referralData, {
      onSuccess: () => {
        navigate({ to: '/dashboard/crm/referrals' })
      }
    })
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: '/dashboard/crm/leads', isActive: false },
    { title: 'مسار المبيعات', href: '/dashboard/crm/pipeline', isActive: false },
    { title: 'الإحالات', href: '/dashboard/crm/referrals', isActive: true },
    { title: 'سجل الأنشطة', href: '/dashboard/crm/activities', isActive: false },
  ]

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* HERO CARD */}
            <ProductivityHero badge="إدارة مصادر الإحالة" title="إضافة مصدر إحالة جديد" type="referrals" hideButtons={true}>
              <Link to="/dashboard/crm/referrals">
                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </ProductivityHero>

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-500" />
                    المعلومات الأساسية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم (بالإنجليزية) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ahmed Law Firm"
                        className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                        dir="ltr"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الاسم (بالعربية)
                      </label>
                      <Input
                        placeholder="مكتب أحمد للمحاماة"
                        className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                        value={formData.nameAr}
                        onChange={(e) => handleChange('nameAr', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        النوع <span className="text-red-500">*</span>
                      </label>
                      <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-purple-500">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        الحالة
                      </label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-purple-500">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        الأولوية
                      </label>
                      <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-purple-500">
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <label className="text-sm font-medium text-slate-700">
                    الوسوم
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أضف وسم..."
                      className="rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500 flex-1"
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
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* External Source Section */}
                <Collapsible open={showExternalSource} onOpenChange={setShowExternalSource}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <Building className="w-5 h-5 text-purple-500" />
                          معلومات التواصل (اختياري)
                        </h3>
                        {showExternalSource ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-500" />
                              اسم جهة الاتصال
                            </label>
                            <Input
                              placeholder="أحمد محمد"
                              className="rounded-xl"
                              value={formData.externalName}
                              onChange={(e) => handleChange('externalName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Building className="w-4 h-4 text-purple-500" />
                              الشركة
                            </label>
                            <Input
                              placeholder="اسم الشركة"
                              className="rounded-xl"
                              value={formData.externalCompany}
                              onChange={(e) => handleChange('externalCompany', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              الهاتف
                            </label>
                            <Input
                              placeholder="+966 5x xxx xxxx"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.externalPhone}
                              onChange={(e) => handleChange('externalPhone', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              البريد الإلكتروني
                            </label>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              className="rounded-xl"
                              dir="ltr"
                              value={formData.externalEmail}
                              onChange={(e) => handleChange('externalEmail', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Fee Agreement Section */}
                <Collapsible open={showFeeAgreement} onOpenChange={setShowFeeAgreement}>
                  <div className="border-t border-slate-100 pt-6">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          اتفاقية العمولة
                        </h3>
                        {showFeeAgreement ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="hasFeeAgreement"
                            checked={formData.hasFeeAgreement}
                            onCheckedChange={(checked) => handleChange('hasFeeAgreement', checked === true)}
                          />
                          <label htmlFor="hasFeeAgreement" className="text-sm font-medium text-slate-700">
                            يوجد اتفاقية عمولة
                          </label>
                        </div>

                        {formData.hasFeeAgreement && (
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-700">نوع العمولة</label>
                              <Select value={formData.feeType} onValueChange={(value) => handleChange('feeType', value)}>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FEE_TYPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {formData.feeType === 'percentage' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <Percent className="w-4 h-4 text-blue-500" />
                                  نسبة العمولة (%)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="10"
                                  className="rounded-xl"
                                  value={formData.feePercentage || ''}
                                  onChange={(e) => handleChange('feePercentage', parseInt(e.target.value) || 0)}
                                />
                                <p className="text-xs text-slate-500">
                                  ستُحسب العمولة كنسبة من قيمة القضية
                                </p>
                              </div>
                            )}

                            {formData.feeType === 'fixed' && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  مبلغ العمولة الثابت (ر.س)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="1000"
                                  className="rounded-xl"
                                  value={formData.feeFixedAmount || ''}
                                  onChange={(e) => handleChange('feeFixedAmount', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            )}

                            {formData.feeType === 'tiered' && (
                              <p className="text-sm text-slate-500 p-3 bg-yellow-50 rounded-xl">
                                العمولة المتدرجة: يمكن تعديل تفاصيل الشرائح لاحقاً من صفحة التفاصيل
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {/* Notes */}
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    ملاحظات
                  </label>
                  <Textarea
                    placeholder="أي ملاحظات إضافية عن مصدر الإحالة..."
                    className="min-h-[120px] rounded-xl border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Link to="/dashboard/crm/referrals">
                    <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                      إلغاء
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-purple-500/20"
                    disabled={createReferralMutation.isPending}
                  >
                    {createReferralMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        حفظ مصدر الإحالة
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <CrmSidebar />
        </div>
      </Main>
    </>
  )
}
