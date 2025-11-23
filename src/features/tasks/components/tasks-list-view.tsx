import { TasksSidebar } from './tasks-sidebar'
import { useState, useMemo } from 'react'
import {
    MoreHorizontal, Plus,
    Briefcase, Smartphone, Shield,
    ChevronLeft, Search, Bell, AlertCircle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTasks } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'

export function TasksListView() {
    const [activeStatusTab, setActiveStatusTab] = useState('active')

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeStatusTab === 'active') {
            f.status = 'active'
        } else if (activeStatusTab === 'completed') {
            f.status = 'completed'
        }
        return f
    }, [activeStatusTab])

    // Fetch tasks
    const { data: tasksData, isLoading, isError, error, refetch } = useTasks(filters)

    // Transform API data
    const tasks = useMemo(() => {
        if (!tasksData?.tasks) return []

        return tasksData.tasks.map((task: any) => ({
            id: task._id,
            title: task.title || task.description || 'مهمة غير محددة',
            client: task.caseId?.clientId?.name || task.clientId?.name || 'غير محدد',
            deadline: task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) : 'غير محدد',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            _id: task._id,
        }))
    }, [tasksData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    ]

    return (
        <>
            {/* ... Header ... */}
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

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar />

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD (Matches "App Promo" style) */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <h2 className="text-3xl font-bold mb-4 leading-tight">المساعد الذكي للمهام القانونية بين يديك</h2>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    قم بإدارة قضاياك، تابع المواعيد النهائية، واحصل على تحليلات ذكية لأدائك المهني في مكان واحد.
                                </p>
                                <div className="flex gap-3">
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0">
                                        <Link to="/dashboard/tasks/new">
                                            <Plus className="ml-2 h-5 w-5" />
                                            مهمة جديدة
                                        </Link>
                                    </Button>
                                    <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 rounded-xl font-bold shadow-lg border-0 transition-all hover:scale-105">
                                        <Smartphone className="ml-2 h-5 w-5" />
                                        تحميل التطبيق
                                    </Button>
                                </div>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Shield className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <Briefcase className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* MAIN TASKS LIST (Matches "Current Subscriptions" style) */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">المهام الحالية</h3>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveStatusTab('active')}
                                        className={activeStatusTab === 'active' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        النشطة
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setActiveStatusTab('completed')}
                                        className={activeStatusTab === 'completed' ? "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4" : "bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full px-4"}
                                    >
                                        المكتملة
                                    </Button>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المهام</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && tasks.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Briefcase className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد مهام</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة مهمة جديدة</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/tasks/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                مهمة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Tasks List */}
                                {!isLoading && !isError && tasks.map((task) => (
                                    <div key={task.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                    <Briefcase className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{task.title}</h4>
                                                        {task.status === 'active' && (
                                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">نشط</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">العميل: {task.client}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الأولوية</div>
                                                    <div className={`font-bold ${task.priority === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {task.priority === 'high' ? 'عالية' : 'متوسطة'}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الموعد</div>
                                                    <div className="font-bold text-navy">{task.deadline}</div>
                                                </div>
                                            </div>
                                            <Link to={`/tasks/${task.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع المهام
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </Main>
        </>
    )
}
