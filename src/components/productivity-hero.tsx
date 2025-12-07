import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
    Calendar as CalendarIcon,
    Plus,
    ListTodo,
    AlertCircle,
    CalendarRange,
    Bell,
    CheckSquare,
    ArrowRight,
    List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/stat-card'
import { useDueTodayTasks, useOverdueTasks, useUpcomingTasks } from '@/hooks/useTasks'
import { useReminderStats } from '@/hooks/useRemindersAndEvents'

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
    backUrl?: string;
    /** When true, shows "Go to List" button instead of "Create New" button */
    listMode?: boolean;
}

export function ProductivityHero({ badge, title, type = 'tasks', hideButtons = false, children, stats, backUrl, listMode = false }: ProductivityHeroProps) {
    const { t } = useTranslation()

    // Fetch Stats (only if stats prop is not provided)
    const { data: dueTodayTasks } = useDueTodayTasks()
    const { data: overdueTasks } = useOverdueTasks()
    const { data: upcomingTasks } = useUpcomingTasks(14) // Next 14 days
    const { data: reminderStats } = useReminderStats()

    // Calculate counts
    const tasksDueTodayCount = Array.isArray(dueTodayTasks) ? dueTodayTasks.length : 0
    const overdueTasksCount = Array.isArray(overdueTasks) ? overdueTasks.length : 0
    const upcomingTasksCount = Array.isArray(upcomingTasks) ? upcomingTasks.length : 0
    const pendingRemindersCount = reminderStats?.pending || 0

    // Button config for "Go to List" mode (used in detail/create pages)
    const listButtonConfig: Record<string, { label: string; href: string }> = {
        tasks: { label: t('hero.list.tasks'), href: '/dashboard/tasks/list' },
        reminders: { label: t('hero.list.reminders'), href: '/dashboard/tasks/reminders' },
        events: { label: t('hero.list.events'), href: '/dashboard/tasks/events' },
        employees: { label: t('hero.list.employees'), href: '/dashboard/hr/employees' },
        salaries: { label: t('hero.list.salaries'), href: '/dashboard/hr/salaries' },
        payroll: { label: t('hero.list.payroll'), href: '/dashboard/hr/payroll' },
        leaves: { label: t('hero.list.leaves'), href: '/dashboard/hr/leaves' },
        attendance: { label: t('hero.list.attendance'), href: '/dashboard/hr/attendance' },
        evaluations: { label: t('hero.list.evaluations'), href: '/dashboard/hr/evaluations' },
        grievances: { label: t('hero.list.grievances'), href: '/dashboard/hr/grievances' },
        'organizational-structure': { label: t('hero.list.organizationalStructure'), href: '/dashboard/hr/organizational-structure' },
        'job-positions': { label: t('hero.list.jobPositions'), href: '/dashboard/hr/job-positions' },
        'succession-planning': { label: t('hero.list.successionPlanning'), href: '/dashboard/hr/succession-planning' },
        'compensation': { label: t('hero.list.compensation'), href: '/dashboard/hr/compensation' },
        'reports': { label: t('hero.list.reports'), href: '/dashboard/hr/reports' },
        'hr-reports': { label: t('hero.list.hrReports'), href: '/dashboard/hr/reports' },
        'finance-reports': { label: t('hero.list.financeReports'), href: '/dashboard/finance/reports' },
        'tasks-reports': { label: t('hero.list.tasksReports'), href: '/dashboard/tasks/reports' },
        'crm-reports': { label: t('hero.list.crmReports'), href: '/dashboard/crm/reports' },
        'sales-reports': { label: t('hero.list.salesReports'), href: '/dashboard/sales/reports' },
    }

    const buttonConfig: Record<string, { label: string; href: string }> = {
        tasks: { label: t('hero.new.task'), href: '/dashboard/tasks/new' },
        reminders: { label: t('hero.new.reminder'), href: '/dashboard/tasks/reminders/new' },
        events: { label: t('hero.new.event'), href: '/dashboard/tasks/events/new' },
        clients: { label: t('hero.new.client'), href: '/dashboard/clients/new' },
        contacts: { label: t('hero.new.contact'), href: '/dashboard/contacts/new' },
        organizations: { label: t('hero.new.organization'), href: '/dashboard/organizations/new' },
        staff: { label: t('hero.new.employee'), href: '/dashboard/staff/new' },
        leads: { label: t('hero.new.lead'), href: '/dashboard/crm/leads/new' },
        pipeline: { label: t('hero.new.deal'), href: '/dashboard/crm/pipeline/new' },
        referrals: { label: t('hero.new.referral'), href: '/dashboard/crm/referrals/new' },
        activities: { label: t('hero.new.activity'), href: '/dashboard/crm/activities/new' },
        cases: { label: t('hero.new.case'), href: '/dashboard/cases/new' },
        documents: { label: t('hero.new.document'), href: '/dashboard/documents/new' },
        invoices: { label: t('hero.new.invoice'), href: '/dashboard/finance/invoices/new' },
        expenses: { label: t('hero.new.expense'), href: '/dashboard/finance/expenses/new' },
        payments: { label: t('hero.new.payment'), href: '/dashboard/finance/payments/new' },
        transactions: { label: t('hero.new.transaction'), href: '/dashboard/finance/transactions/new' },
        'time-entries': { label: t('hero.new.timeEntry'), href: '/dashboard/finance/time-entries/new' },
        'time-tracking': { label: t('hero.new.timeEntry'), href: '/dashboard/finance/time-tracking/new' },
        employees: { label: t('hero.new.employee'), href: '/dashboard/hr/employees/new' },
        salaries: { label: t('hero.new.salary'), href: '/dashboard/hr/salaries/new' },
        payroll: { label: t('hero.new.payrollRun'), href: '/dashboard/hr/payroll/new' },
        leaves: { label: t('hero.new.leave'), href: '/dashboard/hr/leaves/new' },
        attendance: { label: t('hero.new.attendanceRecord'), href: '/dashboard/hr/attendance/new' },
        evaluations: { label: t('hero.new.evaluation'), href: '/dashboard/hr/evaluations/new' },
        grievances: { label: t('hero.new.grievance'), href: '/dashboard/hr/grievances/new' },
        'organizational-structure': { label: t('hero.new.unit'), href: '/dashboard/hr/organizational-structure/new' },
        'job-positions': { label: t('hero.new.position'), href: '/dashboard/hr/job-positions/new' },
        'succession-planning': { label: t('hero.new.successionPlan'), href: '/dashboard/hr/succession-planning/new' },
        'compensation': { label: t('hero.new.compensationRecord'), href: '/dashboard/hr/compensation/new' },
        'reports': { label: t('hero.new.report'), href: '/dashboard/hr/reports/new' },
        'hr-reports': { label: t('hero.new.hrReport'), href: '/dashboard/hr/reports/new' },
        'finance-reports': { label: t('hero.new.financeReport'), href: '/dashboard/finance/reports/new' },
        'tasks-reports': { label: t('hero.new.productivityReport'), href: '/dashboard/tasks/reports/new' },
        'crm-reports': { label: t('hero.new.crmReport'), href: '/dashboard/crm/reports/new' },
        'sales-reports': { label: t('hero.new.salesReport'), href: '/dashboard/sales/reports/new' },
        laws: { label: t('hero.new.law'), href: '/dashboard/knowledge/laws/new' },
        judgments: { label: t('hero.new.judgment'), href: '/dashboard/knowledge/judgments/new' },
        forms: { label: t('hero.new.form'), href: '/dashboard/knowledge/forms/new' },
        jobs: { label: t('hero.new.service'), href: '/dashboard/jobs/new' },
    }

    const currentButtonConfig = buttonConfig[type]
    const displayTitle = title || t('hero.productivity')

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
                                {backUrl && (
                                    <Link to={backUrl} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                        <ArrowRight className="w-6 h-6 text-white" />
                                    </Link>
                                )}
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <CheckSquare className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                    {displayTitle}
                                </h1>
                            </div>
                        </div>

                        {children ? (
                            <div className="flex gap-3">
                                {children}
                            </div>
                        ) : !hideButtons && (listMode ? listButtonConfig[type] : currentButtonConfig) && (
                            <div className="flex gap-3">
                                {listMode ? (
                                    // List mode: Show "Go to List" button
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                                        <Link to={listButtonConfig[type]?.href || '/dashboard/tasks/list'}>
                                            <List className="ms-2 h-4 w-4" />
                                            {listButtonConfig[type]?.label || 'القائمة'}
                                        </Link>
                                    </Button>
                                ) : (
                                    // Default mode: Show "Create New" button
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                                        <Link to={currentButtonConfig.href}>
                                            <Plus className="ms-2 h-4 w-4" />
                                            {currentButtonConfig.label}
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
                                    <Link to="/dashboard/tasks/events">
                                        <CalendarIcon className="ms-2 h-4 w-4" />
                                        {t('hero.calendar')}
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
                                        label={t('hero.stats.todaysTasks')}
                                        value={tasksDueTodayCount}
                                        icon={ListTodo}
                                        status="normal"
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label={t('hero.stats.overdue')}
                                        value={overdueTasksCount}
                                        icon={AlertCircle}
                                        status={overdueTasksCount > 0 ? "attention" : "zero"}
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label={t('hero.stats.upcomingEvents')}
                                        value={upcomingTasksCount}
                                        icon={CalendarRange}
                                        status="normal"
                                        className="py-3 px-4"
                                    />
                                    <StatCard
                                        label={t('hero.stats.reminders')}
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
