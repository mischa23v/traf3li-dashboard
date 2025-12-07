import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Mail, Search, Plus, Star, Trash2, Archive, Tag,
  ChevronLeft, ChevronRight, MoreVertical, Paperclip,
  Clock, Reply, Forward, Inbox, Send, FileText, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { DynamicIsland } from '@/components/dynamic-island'

// Mock email data
const mockEmails = [
  {
    id: '1',
    from: 'أحمد محمد',
    fromEn: 'Ahmed Mohammed',
    email: 'ahmed@example.com',
    subject: 'متابعة القضية رقم 2024/1234',
    subjectEn: 'Follow-up on Case #2024/1234',
    preview: 'السلام عليكم، أرجو إفادتي بآخر مستجدات القضية...',
    previewEn: 'Hello, please update me on the latest case developments...',
    date: '10:30 ص',
    dateEn: '10:30 AM',
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    labels: ['important'],
  },
  {
    id: '2',
    from: 'المحكمة التجارية',
    fromEn: 'Commercial Court',
    email: 'court@moj.gov.sa',
    subject: 'إشعار بموعد جلسة',
    subjectEn: 'Session Date Notification',
    preview: 'نود إعلامكم بأن موعد الجلسة القادمة سيكون في...',
    previewEn: 'We would like to inform you that the next session will be on...',
    date: 'أمس',
    dateEn: 'Yesterday',
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    labels: ['court'],
  },
  {
    id: '3',
    from: 'سارة العتيبي',
    fromEn: 'Sarah Al-Otaibi',
    email: 'sarah@company.com',
    subject: 'طلب استشارة قانونية',
    subjectEn: 'Legal Consultation Request',
    preview: 'أرغب في الحصول على استشارة قانونية بخصوص...',
    previewEn: 'I would like to get legal consultation regarding...',
    date: '2024/11/24',
    dateEn: '2024/11/24',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: [],
  },
  {
    id: '4',
    from: 'نظام تراف إلي',
    fromEn: 'Traf3li System',
    email: 'noreply@traf3li.com',
    subject: 'تقرير أسبوعي',
    subjectEn: 'Weekly Report',
    preview: 'هذا تقريرك الأسبوعي للقضايا والمهام...',
    previewEn: 'This is your weekly report for cases and tasks...',
    date: '2024/11/23',
    dateEn: '2024/11/23',
    isRead: true,
    isStarred: true,
    hasAttachment: true,
    labels: ['system'],
  },
]

const folders = [
  { id: 'inbox', name: 'الوارد', nameEn: 'Inbox', icon: Inbox, count: 12 },
  { id: 'sent', name: 'المرسل', nameEn: 'Sent', icon: Send, count: 0 },
  { id: 'drafts', name: 'المسودات', nameEn: 'Drafts', icon: FileText, count: 3 },
  { id: 'starred', name: 'المميز', nameEn: 'Starred', icon: Star, count: 5 },
  { id: 'spam', name: 'البريد العشوائي', nameEn: 'Spam', icon: AlertCircle, count: 2 },
  { id: 'trash', name: 'المحذوفات', nameEn: 'Trash', icon: Trash2, count: 0 },
]

export function EmailView() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

  const topNav = [
    { title: isRTL ? 'الدردشة' : 'Chat', href: '/dashboard/messages/chat', isActive: false },
    { title: isRTL ? 'البريد الإلكتروني' : 'Email', href: '/dashboard/messages/email', isActive: true },
  ]

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const getLabelBadge = (label: string) => {
    const config: Record<string, { color: string; text: string; textEn: string }> = {
      important: { color: 'bg-red-100 text-red-700', text: 'مهم', textEn: 'Important' },
      court: { color: 'bg-purple-100 text-purple-700', text: 'محكمة', textEn: 'Court' },
      system: { color: 'bg-blue-100 text-blue-700', text: 'نظام', textEn: 'System' },
    }
    const cfg = config[label]
    if (!cfg) return null
    return <Badge key={label} className={`${cfg.color} hover:${cfg.color} text-xs`}>{isRTL ? cfg.text : cfg.textEn}</Badge>
  }

  const selectedEmailData = mockEmails.find(e => e.id === selectedEmail)

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main className="bg-slate-50 p-0">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-64 bg-white border-e border-slate-200 p-4 flex flex-col">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 mb-6">
              <Plus className="h-4 w-4 me-2" aria-hidden="true" />
              {isRTL ? 'إنشاء رسالة' : 'Compose'}
            </Button>

            <nav className="space-y-1 flex-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-navy text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center">
                    <folder.icon className="h-4 w-4 me-3" />
                    {isRTL ? folder.name : folder.nameEn}
                  </span>
                  {folder.count > 0 && (
                    <Badge variant={selectedFolder === folder.id ? 'secondary' : 'outline'} className="text-xs">
                      {folder.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Email List */}
          <div className={`flex-1 flex flex-col ${selectedEmail ? 'hidden md:flex md:w-1/2 lg:w-2/5' : ''}`}>
            {/* Toolbar */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    placeholder={isRTL ? 'بحث في البريد...' : 'Search emails...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-10"
                  />
                </div>
                {selectedEmails.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto">
              {mockEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email.id)}
                  className={`flex items-start gap-3 p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    !email.isRead ? 'bg-blue-50/50' : 'bg-white'
                  } ${selectedEmail === email.id ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <Checkbox
                    checked={selectedEmails.includes(email.id)}
                    onCheckedChange={() => toggleEmailSelection(email.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${email.isStarred ? 'text-amber-500' : 'text-slate-300'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Star className={`h-4 w-4 ${email.isStarred ? 'fill-current' : ''}`} />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${!email.isRead ? 'text-navy' : 'text-slate-600'}`}>
                        {isRTL ? email.from : email.fromEn}
                      </span>
                      <span className="text-xs text-slate-500">
                        {isRTL ? email.date : email.dateEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm ${!email.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                        {isRTL ? email.subject : email.subjectEn}
                      </span>
                      {email.hasAttachment && <Paperclip className="h-3 w-3 text-slate-500" />}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {isRTL ? email.preview : email.previewEn}
                    </p>
                    {email.labels.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {email.labels.map(label => getLabelBadge(label))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {isRTL ? '1-4 من 12' : '1-4 of 12'}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled>
                  {isRTL ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
                </Button>
                <Button variant="outline" size="icon">
                  {isRTL ? <ChevronLeft className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Email Detail */}
          {selectedEmail && selectedEmailData && (
            <div className="flex-1 flex flex-col bg-white border-s border-slate-200">
              {/* Detail Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedEmail(null)}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4 me-1" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4 me-1" aria-hidden="true" />}
                    {isRTL ? 'رجوع' : 'Back'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 me-2" />
                          {isRTL ? 'تمييز بنجمة' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="h-4 w-4 me-2" />
                          {isRTL ? 'إضافة تسمية' : 'Add Label'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-navy mb-2">
                  {isRTL ? selectedEmailData.subject : selectedEmailData.subjectEn}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-bold">
                      {(isRTL ? selectedEmailData.from : selectedEmailData.fromEn).charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-navy">
                        {isRTL ? selectedEmailData.from : selectedEmailData.fromEn}
                      </div>
                      <div className="text-sm text-slate-500">{selectedEmailData.email}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="h-4 w-4 me-1" aria-hidden="true" />
                    {isRTL ? selectedEmailData.date : selectedEmailData.dateEn}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {isRTL ? selectedEmailData.preview : selectedEmailData.previewEn}
                  {'\n\n'}
                  {isRTL
                    ? 'هذا نص تجريبي للرسالة الإلكترونية. يمكنك رؤية المحتوى الكامل للرسالة هنا مع جميع التفاصيل المطلوبة.\n\nمع أطيب التحيات،\nالمرسل'
                    : 'This is a sample email body text. You can see the full content of the email here with all the required details.\n\nBest regards,\nSender'}
                </p>

                {selectedEmailData.hasAttachment && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="font-medium text-navy mb-3">
                      {isRTL ? 'المرفقات' : 'Attachments'}
                    </h4>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <FileText className="h-8 w-8 text-blue-600" aria-hidden="true" />
                        <div>
                          <div className="text-sm font-medium">document.pdf</div>
                          <div className="text-xs text-slate-500">245 KB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-slate-200">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <Reply className="h-4 w-4 me-2" />
                  {isRTL ? 'رد' : 'Reply'}
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedEmail && (
            <div className="hidden md:flex flex-1 items-center justify-center bg-white border-s border-slate-200">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto text-slate-300 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-slate-900">
                  {isRTL ? 'اختر رسالة لعرضها' : 'Select an email to view'}
                </h3>
                <p className="text-slate-500 mt-1">
                  {isRTL ? 'انقر على أي رسالة من القائمة' : 'Click on any email from the list'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}

export default EmailView
