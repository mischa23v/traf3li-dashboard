import { Link } from '@tanstack/react-router'
import {
    Calendar as CalendarIcon,
    Plus,
    ListTodo,
    AlertCircle,
    CalendarRange,
    Bell,
    CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { useDueTodayTasks, useOverdueTasks } from '@/hooks/useTasks'
import { useUpcomingEvents, useReminderStats } from '@/hooks/useRemindersAndEvents'

interface StatItem {
    label: string;
    value: string | number;
    icon: any; // LucideIcon
    status?: 'normal' | 'attention' | 'zero';
    trend?: string;
}

interface ProductivityHeroProps {
    badge: string;
    title?: string;
    type?: string;
    hideButtons?: boolean;
    children?: React.ReactNode;
    stats?: StatItem[];
}

export function ProductivityHero({ badge, title = 'الإنتاجية', type = 'tasks', hideButtons = false, children, stats }: ProductivityHeroProps) {
    // Fetch Stats (only if stats prop is not provided)
    const { data: dueTodayTasks } = useDueTodayTasks()
    const { data: overdueTasks } = useOverdueTasks()
    const { data: upcomingEvents } = useUpcomingEvents(7) // Next 7 days
    const { data: reminderStats } = useReminderStats()

    // Calculate counts
    const tasksDueTodayCount = Array.isArray(dueTodayTasks) ? dueTodayTasks.length : 0
    const overdueTasksCount = Array.isArray(overdueTasks) ? overdueTasks.length : 0
    const upcomingEventsCount = Array.isArray(upcomingEvents) ? upcomingEvents.length : 0
    const pendingRemindersCount = reminderStats?.pending || 0

    const buttonConfig: Record<string, { label: string; href: string }> = {
        tasks: { label: 'مهمة جديدة', href: '/dashboard/tasks/new' },
        reminders: { label: 'تذكير جديد', href: '/dashboard/tasks/reminders/new' },
        events: { label: 'حدث جديد', href: '/dashboard/tasks/events/new' },
        clients: { label: 'عميل جديد', href: '/dashboard/clients/new' },
        contacts: { label: 'جهة اتصال جديدة', href: '/dashboard/contacts/new' },
        organizations: { label: 'منظمة جديدة', href: '/dashboard/organizations/new' },
        staff: { label: 'موظف جديد', href: '/dashboard/staff/new' },
        leads: { label: 'عميل محتمل جديد', href: '/dashboard/crm/leads/new' },
        pipeline: { label: 'صفقة جديدة', href: '/dashboard/crm/pipeline/new' },
        referrals: { label: 'إحالة جديدة', href: '/dashboard/crm/referrals/new' },
        activities: { label: 'نشاط جديد', href: '/dashboard/crm/activities/new' },
        cases: { label: 'قضية جديدة', href: '/dashboard/cases/new' },
        documents: { label: 'مستند جديد', href: '/dashboard/documents/new' },
        invoices: { label: 'فاتورة جديدة', href: '/dashboard/finance/invoices/new' },
        expenses: { label: 'مصروف جديد', href: '/dashboard/finance/expenses/new' },
        payments: { label: 'دفعة جديدة', href: '/dashboard/finance/payments/new' },
        transactions: { label: 'معاملة جديدة', href: '/dashboard/finance/transactions/new' },
        'time-entries': { label: 'سجل وقت جديد', href: '/dashboard/finance/time-entries/new' },
        employees: { label: 'موظف جديد', href: '/dashboard/hr/employees/new' },
        laws: { label: 'قانون جديد', href: '/dashboard/knowledge/laws/new' },
        judgments: { label: 'حكم جديد', href: '/dashboard/knowledge/judgments/new' },
        forms: { label: 'نموذج جديد', href: '/dashboard/knowledge/forms/new' },
        jobs: { label: 'خدمة جديدة', href: '/dashboard/jobs/new' },
    }

    const currentButtonConfig = buttonConfig[type]

    return (
        <div className="bg-[#022c22] rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-wave.png"
                    alt="Background Pattern"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
                    {/* Left Side: Title & Actions */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-medium">
                                <ListTodo className="w-3 h-3" />
                                <span className="text-white">{badge}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <CheckSquare className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        {children ? (
                            <div className="flex gap-3">
                                {children}
                            </div>
                        ) : !hideButtons && currentButtonConfig && (
                            <div className="flex gap-3">
                                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                                    <Link to={currentButtonConfig.href}>
                                        <Plus className="ml-2 h-4 w-4" />
                                        {currentButtonConfig.label}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
                                    <Link to="/dashboard/tasks/events">
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        التقويم
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Stats Grid */}
                    <div className="xl:col-span-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {stats ? (
                                stats.map((stat, index) => (
                                    <StatCard
                                        key={index}
                                        label={stat.label}
                                        value={stat.value}
                                        icon={stat.icon}
                                        status={stat.status || 'normal'}
                                        trend={stat.trend}
                                        className="py-3 px-4"
                                    />
                                ))
                            ) : (
                                <>
                                    <StatCard
                                        label="مهام اليوم"
                                        value={tasksDueTodayCount}
                                        icon={ListTodo}
                                        status="normal"
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label="متأخرة"
                                        value={overdueTasksCount}
                                        icon={AlertCircle}
                                        status={overdueTasksCount > 0 ? "attention" : "zero"}
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label="أحداث قادمة"
                                        value={upcomingEventsCount}
                                        icon={CalendarRange}
                                        status="normal"
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label="تذكيرات"
                                        value={pendingRemindersCount}
                                        icon={Bell}
                                        status="normal"
                                        className="py-3 px-4"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
