import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
    Download,
    Upload,
    History,
    FileSpreadsheet,
    Database,
    CloudCog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataExportSidebarProps {
    context?: 'export' | 'import' | 'history'
}

export function DataExportSidebar({ context }: DataExportSidebarProps) {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    const links = {
        'export': {
            title: isRTL ? 'تصدير البيانات' : 'Export Data',
            href: '/dashboard/data-export',
            icon: Download
        },
        'import': {
            title: isRTL ? 'استيراد البيانات' : 'Import Data',
            href: '/dashboard/data-export/import',
            icon: Upload
        },
        'history': {
            title: isRTL ? 'سجل العمليات' : 'Job History',
            href: '/dashboard/data-export/history',
            icon: History
        }
    }

    return (
        <div className="space-y-6 lg:col-span-1">
            {/* Navigation Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-navy text-lg">
                        {isRTL ? 'إدارة البيانات' : 'Data Management'}
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

            {/* Storage Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Database className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-navy text-sm">
                            {isRTL ? 'مساحة التخزين' : 'Storage Usage'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {isRTL ? 'المساحة المستخدمة للنسخ الاحتياطي' : 'Space used for backups'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">2.5 GB</span>
                        <span className="text-slate-500">10 GB</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[25%] rounded-full" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {isRTL ? 'تم استخدام 25% من المساحة المتاحة' : '25% of available space used'}
                    </p>
                </div>
            </div>

            {/* Auto Backup Widget */}
            <div className="bg-gradient-to-br from-navy to-navy/90 rounded-3xl p-6 text-white shadow-lg shadow-navy/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400">
                        <CloudCog className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">
                            {isRTL ? 'النسخ الاحتياطي التلقائي' : 'Auto Backup'}
                        </h3>
                        <p className="text-xs text-slate-300">
                            {isRTL ? 'مفعل يومياً الساعة 12:00 ص' : 'Enabled daily at 12:00 AM'}
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-center text-white hover:bg-white/10 hover:text-white border border-white/10 rounded-xl h-10 relative z-10"
                >
                    {isRTL ? 'إعدادات النسخ الاحتياطي' : 'Backup Settings'}
                </Button>
            </div>
        </div>
    )
}
