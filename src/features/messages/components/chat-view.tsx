import { useState, useRef, useEffect } from 'react'
import {
    Search, Phone, Video, Paperclip, Send,
    Mic, FileText, Check,
    MoreVertical, Download, Bell, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import {
    GosiCard,
    GosiButton,
    GosiInput
} from '@/components/ui/gosi-ui'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useChat'
import { useAuthStore } from '@/stores/auth-store'

export function ChatView() {
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const [messageText, setMessageText] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const user = useAuthStore((state) => state.user)

    // Fetch conversations and messages
    const { data: conversations, isLoading: loadingConversations, error: conversationsError } = useConversations()
    const { data: messages, isLoading: loadingMessages } = useMessages(activeChat)
    const sendMessageMutation = useSendMessage()
    const markAsReadMutation = useMarkAsRead()

    // Auto-select first conversation
    useEffect(() => {
        if (conversations && conversations.length > 0 && !activeChat) {
            setActiveChat(conversations[0].conversationID)
        }
    }, [conversations, activeChat])

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (activeChat) {
            markAsReadMutation.mutate(activeChat)
        }
    }, [activeChat, markAsReadMutation])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Get active conversation details
    const activeConversation = conversations?.find(c => c.conversationID === activeChat)

    // Get the other user in the conversation
    const getOtherUser = () => {
        if (!activeConversation || !user) return null
        const isSeller = activeConversation.sellerID._id === user._id
        return isSeller ? activeConversation.buyerID : activeConversation.sellerID
    }

    const otherUser = getOtherUser()

    // Handle sending message
    const handleSendMessage = async () => {
        if (!activeChat || (!messageText.trim() && selectedFiles.length === 0)) return

        try {
            await sendMessageMutation.mutateAsync({
                conversationID: activeChat,
                description: messageText.trim() || undefined,
                files: selectedFiles.length > 0 ? selectedFiles : undefined
            })
            setMessageText('')
            setSelectedFiles([])
        } catch (error) {
        }
    }

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files))
        }
    }

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    // Count unread messages for a conversation
    const getUnreadCount = (conversation: any) => {
        if (!user) return 0
        // This is a simplified count - you may need to adjust based on your backend logic
        return 0
    }

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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">

                    {/* RIGHT SIDEBAR (Contacts) */}
                    <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden h-full">
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-slate-50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-navy tracking-tight">المحادثات</h2>
                                {conversations && conversations.length > 0 && (
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                                        {conversations.length}
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="بحث في المحادثات..."
                                    className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50/50 pe-12 ps-4 text-sm focus:outline-none focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Contacts List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {loadingConversations ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                </div>
                            ) : conversationsError ? (
                                <div className="text-center text-red-500 p-4 bg-red-50 rounded-2xl m-2 text-sm">
                                    فشل تحميل المحادثات
                                </div>
                            ) : !conversations || conversations.length === 0 ? (
                                <div className="text-center text-slate-500 p-8">
                                    <p className="text-sm">لا توجد محادثات</p>
                                </div>
                            ) : (
                                <>
                                    {conversations.map((conversation) => {
                                        const isSeller = conversation.sellerID._id === user?._id
                                        const otherParty = isSeller ? conversation.buyerID : conversation.sellerID
                                        const unreadCount = getUnreadCount(conversation)
                                        const isActive = activeChat === conversation.conversationID

                                        return (
                                            <div
                                                key={conversation._id}
                                                onClick={() => setActiveChat(conversation.conversationID)}
                                                className={`p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 flex gap-4 items-center group relative overflow-hidden ${isActive
                                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-500'
                                                    : 'hover:bg-slate-50 text-slate-700 hover:text-navy'
                                                    }`}
                                            >
                                                <div className="relative shrink-0">
                                                    {otherParty.image ? (
                                                        <img
                                                            src={otherParty.image}
                                                            alt={otherParty.username}
                                                            className={`w-12 h-12 rounded-2xl object-cover ring-2 ${isActive ? 'ring-white/30' : 'ring-white shadow-sm'}`}
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ring-2 ${isActive ? 'bg-white/20 text-white ring-white/30' : 'bg-slate-100 text-slate-500 ring-white'
                                                            }`}>
                                                            {otherParty.username.charAt(0)}
                                                        </div>
                                                    )}
                                                    {/* Online Indicator (Mock) */}
                                                    <span className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 ${isActive ? 'border-emerald-600 bg-emerald-300' : 'border-white bg-green-500'}`}></span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className={`font-bold truncate text-base ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                            {otherParty.username}
                                                        </h4>
                                                        <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                            {formatTime(conversation.updatedAt)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate font-medium ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                                                        {conversation.lastMessage || 'لا توجد رسائل'}
                                                    </p>
                                                </div>

                                                {unreadCount > 0 && (
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${isActive ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'}`}>
                                                        {unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </div>

                    {/* MAIN CHAT AREA */}
                    <div className="lg:col-span-8 xl:col-span-9 bg-[#FDFDFD] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden relative">

                        {/* Chat Header */}
                        <div className="p-4 md:p-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 sticky top-0">
                            {otherUser ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {otherUser.image ? (
                                                <img
                                                    src={otherUser.image}
                                                    alt={otherUser.username}
                                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-slate-50"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20">
                                                    {otherUser.username.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-navy text-lg leading-tight">{otherUser.username}</h3>
                                            {otherUser.email && (
                                                <div className="text-xs text-slate-400 font-medium">{otherUser.email}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <GosiButton variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl w-10 h-10">
                                            <Phone className="h-5 w-5" aria-hidden="true" />
                                        </GosiButton>
                                        <GosiButton variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl w-10 h-10">
                                            <Video className="h-5 w-5" />
                                        </GosiButton>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <GosiButton variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-50 rounded-xl w-10 h-10">
                                            <MoreVertical className="h-5 w-5" />
                                        </GosiButton>
                                    </div>
                                </>
                            ) : (
                                <div className="text-slate-400 font-medium animate-pulse">اختر محادثة من القائمة...</div>
                            )}
                        </div>

                        {/* Messages Area - with pattern background */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative">
                            {/* Subtle Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full relative z-10">
                                    <div className="bg-white p-4 rounded-full shadow-lg border border-slate-100">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                    </div>
                                </div>
                            ) : !activeChat ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 relative z-10 gap-4">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
                                        <Send className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <p className="font-medium">حدد محادثة للبدء في المراسلة</p>
                                </div>
                            ) : !messages || messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 relative z-10 gap-4">
                                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner">
                                        <Mic className="w-8 h-8 text-emerald-300" />
                                    </div>
                                    <p className="font-medium">لا توجد رسائل. ابدأ المحادثة الآن!</p>
                                </div>
                            ) : (
                                <div className="relative z-10 space-y-6 flex flex-col">
                                    {messages.map((msg, index) => {
                                        const isMyMessage = msg.userID._id === user?._id
                                        const isRead = msg.readBy.length > 1

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex w-full group ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                                style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}ms forwards`, opacity: 0 }}
                                            >
                                                <div className={`max-w-[75%] md:max-w-[60%] flex gap-3 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {/* Avatar for valid messages */}
                                                    <div className="shrink-0 self-end mb-1">
                                                        {isMyMessage ? (
                                                            // Maybe no avatar for me, or small one
                                                            null
                                                        ) : (
                                                            otherUser?.image ?
                                                                <img src={otherUser.image} className="w-8 h-8 rounded-xl object-cover shadow-sm ring-2 ring-white" alt="" />
                                                                : <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-white">{otherUser?.username.charAt(0)}</div>
                                                        )}
                                                    </div>

                                                    <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                        {msg.attachments && msg.attachments.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {msg.description && (
                                                                    <div className={`px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${isMyMessage
                                                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none'
                                                                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                                                        }`}>
                                                                        {msg.description}
                                                                    </div>
                                                                )}
                                                                {msg.attachments.map((attachment, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`p-3 rounded-2xl flex items-center gap-3 overflow-hidden ${isMyMessage
                                                                            ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                                                                            : 'bg-white text-navy border border-slate-100 rounded-bl-none shadow-sm'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMyMessage ? 'bg-white/20' : 'bg-slate-100'
                                                                            }`}>
                                                                            <FileText className="h-5 w-5" aria-hidden="true" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="font-bold text-xs truncate max-w-[150px]">{attachment.originalName}</div>
                                                                            <div className="text-[10px] opacity-70">{formatFileSize(attachment.size)}</div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className={`${isMyMessage ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-navy hover:bg-slate-50'} rounded-full h-8 w-8`}
                                                                            onClick={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
                                                                        >
                                                                            <Download className="h-4 w-4" aria-hidden="true" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className={`px-5 py-3.5 rounded-[1.5rem] text-[15px] leading-relaxed shadow-sm transition-all hover:shadow-md hover:scale-[1.01] duration-200 ${isMyMessage
                                                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-none'
                                                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                                                                }`}>
                                                                {msg.description}
                                                                {msg.isEdited && (
                                                                    <span className="text-[10px] opacity-70 ms-2 italic">(معدلة)</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-slate-400 px-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                            <span>{formatTime(msg.createdAt)}</span>
                                                            {isMyMessage && (
                                                                isRead ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white border-t border-slate-50 relative z-20">
                            {selectedFiles.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 flex items-center gap-3 text-sm shadow-sm group">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[150px] font-medium text-slate-700">{file.name}</span>
                                                <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                                            >
                                                <span className="sr-only">remove</span>
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-2 p-1.5 bg-slate-50/80 rounded-[2rem] border border-slate-200/60 focus-within:border-emerald-200 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white transition-all duration-300 shadow-sm">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                />
                                <GosiButton
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-full h-11 w-11 shrink-0 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!activeChat}
                                >
                                    <Paperclip className="h-5 w-5" />
                                </GosiButton>

                                <textarea
                                    placeholder="اكتب رسالتك هنا..."
                                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3.5 max-h-32 min-h-[48px] text-sm text-slate-700 placeholder:text-slate-400"
                                    rows={1}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    disabled={!activeChat}
                                />

                                <div className="flex items-center gap-1 shrink-0 pb-0.5 pe-0.5">
                                    <GosiButton variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full h-10 w-10 transition-all">
                                        <Mic className="h-5 w-5" />
                                    </GosiButton>
                                    <GosiButton
                                        className="bg-navy hover:bg-emerald-600 text-white rounded-full h-11 w-11 shadow-lg shadow-navy/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all duration-300 hover:scale-105 active:scale-95 m-0.5"
                                        onClick={handleSendMessage}
                                        disabled={!activeChat || (!messageText.trim() && selectedFiles.length === 0) || sendMessageMutation.isPending}
                                    >
                                        {sendMessageMutation.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5 ms-0.5" aria-hidden="true" />
                                        )}
                                    </GosiButton>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </Main>
        </>
    )
}
