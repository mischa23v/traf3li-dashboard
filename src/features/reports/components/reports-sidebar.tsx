import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
    BarChart2,
    PieChart,
    TrendingUp,
    FileText,
    Download,
    Calendar,
    Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReportsSidebarProps {
    context?: 'overview' | 'financial' | 'performance' | 'custom'
}

export function ReportsSidebar({ context }: ReportsSidebarProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const links = {
        'overview': {
            title: isRTL ? 'نظرة عامة' : 'Overview',
            href: '/dashboard/reports',
            icon: BarChart2
        },
        'financial': {
            title: isRTL ? 'التقارير المالية' : 'Financial Reports',
            href: '/dashboard/reports/financial',
            icon: TrendingUp
        },
        'performance': {
            title: isRTL ? 'تقارير الأداء' : 'Performance Reports',
            href: '/dashboard/reports/performance',
            icon: PieChart
        },
        'custom': {
            title: isRTL ? 'تقارير مخصصة' : 'Custom Reports',
            href: '/dashboard/reports/custom',
            icon: FileText
        }
    }

    return (
        <div className="space-y-6 lg:col-span-1">
            {/* Navigation Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-navy text-lg">
                        {isRTL ? 'القائمة' : 'Menu'}
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
                    {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                </h3>

                <div className="space-y-3 relative z-10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-white/10 rounded-xl h-12"
                    >
                        <Download className="h-4 w-4 me-2 text-emerald-400" aria-hidden="true" />
                        {isRTL ? 'تصدير التقرير الحالي' : 'Export Current Report'}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/10 hover:text-white border border-white/10 rounded-xl h-12"
                    >
                        <Calendar className="h-4 w-4 me-2 text-blue-400" aria-hidden="true" />
                        {isRTL ? 'جدولة تقرير' : 'Schedule Report'}
                    </Button>
                </div>
            </div>

            {/* Filters Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-navy text-lg">
                        {isRTL ? 'تصفية سريعة' : 'Quick Filter'}
                    </h3>
                    <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-navy">
                        {isRTL ? 'هذا الشهر' : 'This Month'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-navy">
                        {isRTL ? 'الربع الحالي' : 'Current Quarter'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-navy">
                        {isRTL ? 'السنة الحالية' : 'Current Year'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
