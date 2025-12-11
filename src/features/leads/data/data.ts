import { Phone, Mail, MessageCircle, Video, Users } from 'lucide-react'

export const leadStatuses = [
  { value: 'new', label: 'جديد', labelEn: 'New' },
  { value: 'contacted', label: 'تم التواصل', labelEn: 'Contacted' },
  { value: 'qualified', label: 'مؤهل', labelEn: 'Qualified' },
  { value: 'proposal', label: 'عرض سعر', labelEn: 'Proposal' },
  { value: 'negotiation', label: 'تفاوض', labelEn: 'Negotiation' },
  { value: 'won', label: 'تم الكسب', labelEn: 'Won' },
  { value: 'lost', label: 'خسارة', labelEn: 'Lost' },
  { value: 'dormant', label: 'خامل', labelEn: 'Dormant' },
] as const

export const leadStatusColors = new Map([
  ['new', 'bg-blue-50 text-blue-700 border-blue-200'],
  ['contacted', 'bg-purple-50 text-purple-700 border-purple-200'],
  ['qualified', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
  ['proposal', 'bg-orange-50 text-orange-700 border-orange-200'],
  ['negotiation', 'bg-yellow-50 text-yellow-700 border-yellow-200'],
  ['won', 'bg-green-50 text-green-700 border-green-200'],
  ['lost', 'bg-red-50 text-red-700 border-red-200'],
  ['dormant', 'bg-slate-50 text-slate-700 border-slate-200'],
])

export const leadSources = [
  { value: 'website', label: 'الموقع الإلكتروني', labelEn: 'Website' },
  { value: 'referral', label: 'إحالة', labelEn: 'Referral' },
  { value: 'social_media', label: 'وسائل التواصل', labelEn: 'Social Media' },
  { value: 'advertising', label: 'إعلان', labelEn: 'Advertising' },
  { value: 'cold_call', label: 'اتصال مباشر', labelEn: 'Cold Call' },
  { value: 'walk_in', label: 'زيارة شخصية', labelEn: 'Walk-in' },
  { value: 'event', label: 'فعالية', labelEn: 'Event' },
  { value: 'other', label: 'أخرى', labelEn: 'Other' },
] as const

export const contactMethods = [
  { value: 'phone', label: 'هاتف', labelEn: 'Phone', icon: Phone },
  { value: 'email', label: 'بريد إلكتروني', labelEn: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'واتساب', labelEn: 'WhatsApp', icon: MessageCircle },
  { value: 'video', label: 'مكالمة فيديو', labelEn: 'Video Call', icon: Video },
  { value: 'in_person', label: 'شخصياً', labelEn: 'In Person', icon: Users },
] as const
