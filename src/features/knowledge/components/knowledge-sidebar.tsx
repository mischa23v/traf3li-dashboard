import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
    Scale,
    Gavel,
    FileText,
    Search,
    BookOpen,
    Bookmark
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KnowledgeSidebarProps {
    context?: 'laws' | 'judgments' | 'forms'
}

export function KnowledgeSidebar({ context }: KnowledgeSidebarProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const links = {
        'laws': {
            title: isRTL ? 'الأنظمة واللوائح' : 'Laws & Regulations',
            href: '/dashboard/knowledge/laws',
            icon: Scale
        },
        'judgments': {
            title: isRTL ? 'الأحكام القضائية' : 'Judicial Judgments',
            href: '/dashboard/knowledge/judgments',
            icon: Gavel
        },
        'forms': {
            title: isRTL ? 'النماذج والصيغ' : 'Forms & Templates',
            href: '/dashboard/knowledge/forms',
            icon: FileText
        }
    }

    return (
        <div className="space-y-6 lg:col-span-1">
            {/* Navigation Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-navy text-lg">
                        {isRTL ? 'المكتبة القانونية' : 'Legal Library'}
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

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-navy to-navy/90 rounded-3xl p-6 text-white shadow-lg shadow-navy/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>

                <h3 className="font-bold text-lg mb-4 relative z-10">
                    {isRTL ? 'أدوات البحث' : 'Research Tools'}
                </h3>

                <div className="space-y-3 relative z-10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-white/10 rounded-xl h-12"
                    >
                        <Search className="h-4 w-4 me-2 text-emerald-400" />
                        {isRTL ? 'بحث متقدم' : 'Advanced Search'}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-white/10 rounded-xl h-12"
                    >
                        <Bookmark className="h-4 w-4 me-2 text-blue-400" />
                        {isRTL ? 'المحفوظات' : 'Saved Items'}
                    </Button>
                </div>
            </div>

            {/* Stats Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-navy text-lg mb-4">
                    {isRTL ? 'إحصائيات المكتبة' : 'Library Stats'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-navy mb-1">2.5k</div>
                        <div className="text-xs text-slate-500">{isRTL ? 'وثيقة' : 'Documents'}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">150</div>
                        <div className="text-xs text-emerald-600/80">{isRTL ? 'جديد هذا الشهر' : 'New This Month'}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
