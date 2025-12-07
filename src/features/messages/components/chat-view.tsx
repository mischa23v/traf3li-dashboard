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
    }, [activeChat])

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
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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
                                {conversations && conversations.length > 0 && (
                                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                                        {conversations.length} محادثة
                                    </div>
                                )}
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
                            {loadingConversations ? (
                                <div className="flex items-center justify-center h-32">
                                    <Loader2 className="h-8 w-8 animate-spin text-navy" />
                                </div>
                            ) : conversationsError ? (
                                <div className="text-center text-red-500 p-4">
                                    فشل تحميل المحادثات
                                </div>
                            ) : !conversations || conversations.length === 0 ? (
                                <div className="text-center text-slate-400 p-8">
                                    <p className="text-sm">لا توجد محادثات</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {conversations.map((conversation) => {
                                        const isSeller = conversation.sellerID._id === user?._id
                                        const otherParty = isSeller ? conversation.buyerID : conversation.sellerID
                                        const unreadCount = getUnreadCount(conversation)

                                        return (
                                            <div
                                                key={conversation._id}
                                                onClick={() => setActiveChat(conversation.conversationID)}
                                                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex gap-4 items-start group ${activeChat === conversation.conversationID
                                                    ? 'bg-navy text-white shadow-lg shadow-navy/20'
                                                    : 'hover:bg-slate-50 text-navy'
                                                    }`}
                                            >
                                                <div className="relative shrink-0">
                                                    {otherParty.image ? (
                                                        <img
                                                            src={otherParty.image}
                                                            alt={otherParty.username}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${activeChat === conversation.conversationID ? 'bg-white/10 text-white' : 'bg-slate-100 text-navy'
                                                            }`}>
                                                            {otherParty.username.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h4 className="font-bold truncate">{otherParty.username}</h4>
                                                        <span className={`text-xs ${activeChat === conversation.conversationID ? 'text-blue-200' : 'text-slate-400'}`}>
                                                            {formatTime(conversation.updatedAt)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm truncate ${activeChat === conversation.conversationID ? 'text-blue-100' : 'text-slate-500'}`}>
                                                        {conversation.lastMessage || 'لا توجد رسائل'}
                                                    </p>
                                                </div>
                                                {unreadCount > 0 && (
                                                    <div className="shrink-0 flex flex-col items-end justify-center h-full">
                                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                                            {unreadCount}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN CHAT AREA */}
                    <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative">

                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                            {otherUser ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {otherUser.image ? (
                                                <img
                                                    src={otherUser.image}
                                                    alt={otherUser.username}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center text-lg font-bold">
                                                    {otherUser.username.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-navy text-lg">{otherUser.username}</h3>
                                            {otherUser.email && (
                                                <div className="text-sm text-slate-500">{otherUser.email}</div>
                                            )}
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
                                </>
                            ) : (
                                <div className="text-slate-400">حدد محادثة</div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-navy" />
                                </div>
                            ) : !activeChat ? (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <p>حدد محادثة للبدء</p>
                                </div>
                            ) : !messages || messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <p>لا توجد رسائل. ابدأ المحادثة!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg) => {
                                        const isMyMessage = msg.userID._id === user?._id
                                        const isRead = msg.readBy.length > 1 // More than just sender

                                        return (
                                            <div key={msg._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] ${isMyMessage ? 'order-1' : 'order-2'}`}>
                                                    {msg.attachments && msg.attachments.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {msg.description && (
                                                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMyMessage
                                                                    ? 'bg-navy text-white rounded-tl-none shadow-lg shadow-navy/10'
                                                                    : 'bg-white text-navy border border-slate-100 rounded-tr-none shadow-sm'
                                                                    }`}>
                                                                    {msg.description}
                                                                </div>
                                                            )}
                                                            {msg.attachments.map((attachment, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`p-4 rounded-2xl flex items-center gap-4 ${isMyMessage
                                                                        ? 'bg-navy text-white rounded-tl-none shadow-lg shadow-navy/10'
                                                                        : 'bg-white text-navy border border-slate-100 rounded-tr-none shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMyMessage ? 'bg-white/10' : 'bg-slate-100'
                                                                        }`}>
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-bold text-sm truncate">{attachment.originalName}</div>
                                                                        <div className="text-xs opacity-70">{formatFileSize(attachment.size)}</div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className={`${isMyMessage ? 'text-white hover:bg-white/20' : 'text-navy hover:bg-slate-100'} rounded-full`}
                                                                        onClick={() => window.open(attachment.url, '_blank')}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMyMessage
                                                            ? 'bg-navy text-white rounded-tl-none shadow-lg shadow-navy/10'
                                                            : 'bg-white text-navy border border-slate-100 rounded-tr-none shadow-sm'
                                                            }`}>
                                                            {msg.description}
                                                            {msg.isEdited && (
                                                                <span className="text-xs opacity-70 ml-2">(معدلة)</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isMyMessage && (
                                                            isRead ? <Check className="h-3 w-3 text-emerald-500" /> : <Check className="h-3 w-3" />
                                                        )}
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
                        <div className="p-4 bg-white border-t border-slate-100">
                            {selectedFiles.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-2">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="bg-slate-100 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4" />
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                            <button
                                                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== idx))}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-end gap-3 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy transition-all">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-navy rounded-full h-10 w-10 shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!activeChat}
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <textarea
                                    placeholder="اكتب رسالتك هنا..."
                                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 max-h-32 min-h-[44px] text-sm"
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
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy rounded-full h-10 w-10">
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-10 w-10 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                        onClick={handleSendMessage}
                                        disabled={!activeChat || (!messageText.trim() && selectedFiles.length === 0) || sendMessageMutation.isPending}
                                    >
                                        {sendMessageMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 ml-0.5" />
                                        )}
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
