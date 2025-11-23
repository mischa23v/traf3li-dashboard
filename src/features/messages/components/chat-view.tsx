import { useState } from 'react'
import {
    Search, Phone, Video, Paperclip, Send,
    Mic, FileText, Check,
    MoreVertical, Download, Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function ChatView() {
    const [activeChat, setActiveChat] = useState('1')

    const contacts = [
        { id: '1', name: 'أحمد المحامي', role: 'مستشار قانوني', avatar: '', status: 'online', unread: 2, lastMsg: 'تم تحديث ملف القضية، يرجى المراجعة', time: '10:30 ص' },
        { id: '2', name: 'سارة محمد', role: 'سكرتيرة', avatar: '', status: 'offline', unread: 0, lastMsg: 'هل تم تأكيد موعد الغد؟', time: 'أمس' },
        { id: '3', name: 'شركة الإنشاءات', role: 'عميل', avatar: '', status: 'online', unread: 5, lastMsg: 'أرسلنا المستندات المطلوبة', time: 'أمس' },
        { id: '4', name: 'خالد العتيبي', role: 'محامي متدرب', avatar: '', status: 'away', unread: 0, lastMsg: 'شكراً لك أستاذ', time: '20 نوفمبر' },
    ]

    const messages = [
        { id: 1, sender: 'other', text: 'السلام عليكم، هل اطلعت على مسودة العقد؟', time: '10:15 ص', status: 'read' },
        { id: 2, sender: 'me', text: 'وعليكم السلام، نعم قمت بمراجعتها ولدي بعض الملاحظات البسيطة.', time: '10:20 ص', status: 'read' },
        { id: 3, sender: 'other', text: 'ممتاز، يرجى إرسالها لي لتعديل النسخة النهائية.', time: '10:22 ص', status: 'read' },
        { id: 4, sender: 'me', text: 'سأقوم بإرسال الملف المرفق الآن.', time: '10:25 ص', status: 'read' },
        { id: 5, sender: 'me', type: 'file', fileName: 'ملاحظات_العقد_النهائي.pdf', fileSize: '2.4 MB', time: '10:25 ص', status: 'delivered' },
        { id: 6, sender: 'other', text: 'تم الاستلام، شكراً لك.', time: '10:30 ص', status: 'read' },
    ]

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'الدردشة', href: '/dashboard/messages/chat', isActive: true },
        { title: 'البريد الإلكتروني', href: '/dashboard/messages/email', isActive: false },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">

                    {/* RIGHT SIDEBAR (Contacts) */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-navy">المحادثات</h2>
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                                    3 رسائل جديدة
                                </div>
                            </div>
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث في المحادثات..."
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-12 pl-4 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                />
                            </div>
                        </div>

                        {/* Contacts List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        onClick={() => setActiveChat(contact.id)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex gap-4 items-start group ${activeChat === contact.id
                                            ? 'bg-navy text-white shadow-lg shadow-navy/20'
                                            : 'hover:bg-slate-50 text-navy'
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${activeChat === contact.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-navy'
                                                }`}>
                                                {contact.name.charAt(0)}
                                            </div>
                                            {contact.status === 'online' && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold truncate">{contact.name}</h4>
                                                <span className={`text-xs ${activeChat === contact.id ? 'text-blue-200' : 'text-slate-400'}`}>{contact.time}</span>
                                            </div>
                                            <p className={`text-sm truncate ${activeChat === contact.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {contact.lastMsg}
                                            </p>
                                        </div>
                                        {contact.unread > 0 && (
                                            <div className="shrink-0 flex flex-col items-end justify-center h-full">
                                                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                                    {contact.unread}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CHAT AREA */}
                    <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">

                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center text-lg font-bold">
                                        أ
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy text-lg">أحمد المحامي</h3>
                                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        متصل الآن
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full">
                                    <Phone className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full">
                                    <Video className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-1' : 'order-2'}`}>
                                            {msg.type === 'file' ? (
                                                <div className={`p-4 rounded-2xl flex items-center gap-4 ${msg.sender === 'me'
                                                    ? 'bg-navy text-white rounded-tl-none shadow-lg shadow-navy/10'
                                                    : 'bg-white text-navy border border-slate-100 rounded-tr-none shadow-sm'
                                                    }`}>
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{msg.fileName}</div>
                                                        <div className="text-xs opacity-70">{msg.fileSize}</div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="mr-auto text-white hover:bg-white/20 rounded-full">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me'
                                                    ? 'bg-navy text-white rounded-tl-none shadow-lg shadow-navy/10'
                                                    : 'bg-white text-navy border border-slate-100 rounded-tr-none shadow-sm'
                                                    }`}>
                                                    {msg.text}
                                                </div>
                                            )}
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                <span>{msg.time}</span>
                                                {msg.sender === 'me' && (
                                                    msg.status === 'read' ? <Check className="h-3 w-3 text-emerald-500" /> : <Check className="h-3 w-3" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-end gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy transition-all">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full h-10 w-10 shrink-0">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <textarea
                                    placeholder="اكتب رسالتك هنا..."
                                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 max-h-32 min-h-[44px] text-sm"
                                    rows={1}
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full h-10 w-10">
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-10 w-10 shadow-lg shadow-emerald-500/20">
                                        <Send className="h-4 w-4 ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </Main>
        </>
    )
}
