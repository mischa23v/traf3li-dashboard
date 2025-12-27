import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
    HelpCircle,
    MessageCircle,
    Book,
    FileText,
    Video,
    LifeBuoy,
    Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'

interface HelpSidebarProps {
    context?: 'center' | 'tickets' | 'docs'
}

export function HelpSidebar({ context }: HelpSidebarProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const links = {
        'center': {
            title: isRTL ? 'مركز المساعدة' : 'Help Center',
            href: ROUTES.dashboard.help,
            icon: HelpCircle
        },
        'tickets': {
            title: isRTL ? 'تذاكر الدعم' : 'Support Tickets',
            href: '/dashboard/help/tickets', // TODO: Add to ROUTES
            icon: Ticket
        },
        'docs': {
            title: isRTL ? 'الوثائق' : 'Documentation',
            href: '/dashboard/help/docs', // TODO: Add to ROUTES
            icon: Book
        }
    }

    return (
        <div className="space-y-6 lg:col-span-1">
            {/* Navigation Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-navy text-lg">
                        {isRTL ? 'الدعم والمساعدة' : 'Support & Help'}
                    </h3>
                </div>
                <div className="p-2 space-y-1">
                    {Object.entries(links).map(([key, link]) => {
                        const isActive = context === key
                        const Icon = link.icon
                        return (
                            <Link
                                key={key}
                                to={link.href as any}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-navy text-white shadow-md shadow-navy/20"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-emerald-600"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{link.title}</span>
                                {isActive && (
                                    <div className={cn(
                                        "ms-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                    )} />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Contact Widget */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors duration-500"></div>

                <h3 className="font-bold text-lg mb-2 relative z-10">
                    {isRTL ? 'هل تحتاج مساعدة عاجلة؟' : 'Need Urgent Help?'}
                </h3>
                <p className="text-emerald-50 text-sm mb-4 relative z-10">
                    {isRTL ? 'فريق الدعم متاح 24/7 لمساعدتك' : 'Our support team is available 24/7 to assist you.'}
                </p>

                <Button
                    className="w-full bg-white text-emerald-600 hover:bg-emerald-50 border-0 rounded-xl h-10 font-bold shadow-sm relative z-10"
                >
                    <MessageCircle className="h-4 w-4 me-2" />
                    {isRTL ? 'تحدث معنا الآن' : 'Chat With Us'}
                </Button>
            </div>

            {/* Resources Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-navy text-lg mb-4">
                    {isRTL ? 'مصادر مفيدة' : 'Useful Resources'}
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Video className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-navy text-sm">{isRTL ? 'دروس فيديو' : 'Video Tutorials'}</div>
                            <div className="text-xs text-slate-500">{isRTL ? 'تعلم كيفية استخدام النظام' : 'Learn how to use the system'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <FileText className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="font-bold text-navy text-sm">{isRTL ? 'دليل المستخدم' : 'User Guide'}</div>
                            <div className="text-xs text-slate-500">{isRTL ? 'شرح مفصل للميزات' : 'Detailed feature explanation'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
