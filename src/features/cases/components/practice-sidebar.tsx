import { useState } from 'react'
import {
    Clock, Bell, CheckCircle2, MapPin, Calendar as CalendarIcon,
    Zap, Plus, CheckSquare, Trash2, List, X, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface PracticeSidebarProps {
    context?: 'clients' | 'organizations' | 'cases' | 'workflows' | 'documents' | 'followups' | 'contacts'
    isSelectionMode?: boolean
    onToggleSelectionMode?: () => void
    selectedCount?: number
    onDeleteSelected?: () => void
}

export function PracticeSidebar({
    context = 'clients',
    isSelectionMode = false,
    onToggleSelectionMode,
    selectedCount = 0,
    onDeleteSelected
}: PracticeSidebarProps) {
    const [activeTab, setActiveTab] = useState<'calendar' | 'notifications'>('calendar')

    const links = {
        clients: {
            create: '/dashboard/clients/new',
            viewAll: '/dashboard/clients'
        },
        organizations: {
            create: '/dashboard/organizations/new',
            viewAll: '/dashboard/organizations'
        },
        cases: {
            create: '/dashboard/cases/new',
            viewAll: '/dashboard/cases'
        },
        workflows: {
            create: '/dashboard/case-workflows/new',
            viewAll: '/dashboard/case-workflows'
        },
        documents: {
            create: '/dashboard/documents/new',
            viewAll: '/dashboard/documents'
        },
        followups: {
            create: '/dashboard/followups/new',
            viewAll: '/dashboard/followups'
        },
        contacts: {
            create: '/dashboard/contacts/new',
            viewAll: '/dashboard/contacts'
        }
    }

    const currentLinks = links[context] || links.clients

    return (
        <div className="space-y-8 lg:col-span-1">

            {/* QUICK ACTIONS WIDGET */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-lg text-white">إجراءات سريعة</h3>
                </div>

                {/* Content */}
                <div className="relative z-10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Create Button - White + Green Text + Glow */}
                    <Button asChild className="bg-white hover:bg-emerald-50 text-emerald-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0">
                        <Link to={currentLinks.create}>
                            <Plus className="h-7 w-7" />
                            <span className="text-sm font-bold">إنشاء</span>
                        </Link>
                    </Button>

                    {/* Select Button - White + Dark Text + Glow */}
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg",
                            isSelectionMode
                                ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400 shadow-emerald-500/20"
                                : "bg-white hover:bg-slate-50 text-emerald-950 shadow-white/10"
                        )}
                        onClick={onToggleSelectionMode}
                    >
                        {isSelectionMode ? <X className="h-6 w-6" /> : <CheckSquare className="h-6 w-6" />}
                        <span className="text-sm font-bold">{isSelectionMode ? 'إلغاء' : 'تحديد'}</span>
                    </Button>

                    {/* Delete Button - White + Red Text + Glow */}
                    <Button
                        variant="ghost"
                        className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10"
                        onClick={onDeleteSelected}
                        disabled={!isSelectionMode || selectedCount === 0}
                    >
                        <Trash2 className="h-6 w-6" />
                        <span className="text-sm font-bold">
                            {selectedCount > 0 ? `حذف (${selectedCount})` : 'حذف'}
                        </span>
                    </Button>

                    {/* View All Button - White + Dark Text + Glow */}
                    <Button asChild variant="ghost" className="bg-white hover:bg-slate-50 text-emerald-950 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10">
                        <Link to={currentLinks.viewAll}>
                            <List className="h-6 w-6" />
                            <span className="text-sm font-bold">عرض جميع</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* MERGED CALENDAR & AGENDA WIDGET */}
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-lg shadow-emerald-900/20 group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Decorative Lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex bg-[#033a2d] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'calendar'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التقويم
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'notifications'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التنبيهات
                        </button>
                    </div>
                    {activeTab === 'calendar' && (
                        <Badge className="bg-emerald-500/20 text-emerald-100 border-0 rounded-full px-3 hover:bg-emerald-500/30">نوفمبر</Badge>
                    )}
                </div>

                {/* Inner White Container */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 relative z-10 min-h-[300px] border border-white/5 shadow-inner">
                    {activeTab === 'calendar' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Calendar Strip */}
                            <div className="grid grid-cols-5 gap-2 text-center mb-8">
                                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, i) => (
                                    <div key={i} className={`rounded-xl p-2 transition-all duration-200 cursor-pointer ${i === 1 ? 'bg-[#022c22] text-white shadow-lg shadow-emerald-900/20 scale-105' : 'hover:bg-white text-slate-500'}`}>
                                        <div className={`text-[10px] mb-1 ${i === 1 ? 'text-emerald-200' : ''}`}>{day}</div>
                                        <div className="font-bold text-lg">{19 + i}</div>
                                        {i === 1 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline / Agenda */}
                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute top-2 bottom-2 right-[3.5rem] w-[2px] bg-slate-200"></div>

                                {/* Event 1 */}
                                <div className="flex gap-4 relative group">
                                    <div className="w-14 text-center shrink-0 pt-1">
                                        <div className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">09:00</div>
                                        <div className="text-[10px] text-slate-400">صباحاً</div>
                                    </div>
                                    <div className="absolute right-[3.25rem] top-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                                    <div className="flex-1 bg-white rounded-xl p-3 border-r-4 border-emerald-500 shadow-sm hover:shadow-md transition-all">
                                        <div className="font-bold text-slate-800 text-sm mb-1">جلسة مرافعة</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            المحكمة العامة
                                        </div>
                                    </div>
                                </div>

                                {/* Event 2 */}
                                <div className="flex gap-4 relative group">
                                    <div className="w-14 text-center shrink-0 pt-1">
                                        <div className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">02:00</div>
                                        <div className="text-[10px] text-slate-400">مساءً</div>
                                    </div>
                                    <div className="absolute right-[3.25rem] top-2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                                    <div className="flex-1 bg-white rounded-xl p-3 border-r-4 border-purple-500 shadow-sm hover:shadow-md transition-all">
                                        <div className="font-bold text-slate-800 text-sm mb-1">غداء عمل</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            مطعم الشرفة
                                        </div>
                                    </div>
                                </div>

                                {/* Event 3 */}
                                <div className="flex gap-4 relative group">
                                    <div className="w-14 text-center shrink-0 pt-1">
                                        <div className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">04:30</div>
                                        <div className="text-[10px] text-slate-400">مساءً</div>
                                    </div>
                                    <div className="absolute right-[3.25rem] top-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                                    <div className="flex-1 bg-white rounded-xl p-3 border-r-4 border-blue-500 shadow-sm hover:shadow-md transition-all">
                                        <div className="font-bold text-slate-800 text-sm mb-1">مراجعة العقود</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            المكتب الرئيسي
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full mt-6 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 group">
                                <span>عرض الجدول الكامل</span>
                                <ChevronRight className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">تذكير جديد</p>
                                        <p className="text-xs text-slate-500 mt-1">لديك اجتماع في تمام الساعة 2:00 مساءً</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                عرض كل التنبيهات
                            </Button>
                        </div>
                    )}
                </div>
            </div>


        </div>
    )
}
