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
import { ROUTES } from '@/constants/routes'

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

    // Only fetch stats if not provided via props (reduces API calls)
    const shouldFetchStats = !stats || stats.length === 0

    // Fetch Stats (only if stats prop is not provided)
    const { data: dueTodayTasks } = useDueTodayTasks(shouldFetchStats)
    const { data: overdueTasks } = useOverdueTasks(shouldFetchStats)
    const { data: upcomingTasks } = useUpcomingTasks(14, shouldFetchStats)
    const { data: reminderStats } = useReminderStats(shouldFetchStats ? undefined : { enabled: false })

    // Calculate counts
    const tasksDueTodayCount = Array.isArray(dueTodayTasks) ? dueTodayTasks.length : 0
    const overdueTasksCount = Array.isArray(overdueTasks) ? overdueTasks.length : 0
    const upcomingTasksCount = Array.isArray(upcomingTasks) ? upcomingTasks.length : 0
    const pendingRemindersCount = reminderStats?.pending || 0

    // Button config for "Go to List" mode (used in detail/create pages)
    const listButtonConfig: Record<string, { label: string; href: string }> = {
        tasks: { label: t('hero.list.tasks'), href: ROUTES.dashboard.tasks.list },
        reminders: { label: t('hero.list.reminders'), href: ROUTES.dashboard.tasks.reminders.list },
        events: { label: t('hero.list.events'), href: ROUTES.dashboard.tasks.events.list },
        activities: { label: t('hero.list.activities'), href: ROUTES.dashboard.crm.activities.list },
        leads: { label: t('hero.list.leads'), href: ROUTES.dashboard.crm.leads.list },
        referrals: { label: t('hero.list.referrals'), href: ROUTES.dashboard.crm.referrals.list },
        pipeline: { label: t('hero.list.pipeline'), href: ROUTES.dashboard.crm.pipeline },
        employees: { label: t('hero.list.employees'), href: ROUTES.dashboard.hr.employees.list },
        salaries: { label: t('hero.list.salaries'), href: '/dashboard/hr/salaries' }, // TODO: Add to ROUTES
        payroll: { label: t('hero.list.payroll'), href: ROUTES.dashboard.hr.payroll.list },
        leaves: { label: t('hero.list.leaves'), href: ROUTES.dashboard.hr.leave.list },
        attendance: { label: t('hero.list.attendance'), href: ROUTES.dashboard.hr.attendance.list },
        evaluations: { label: t('hero.list.evaluations'), href: '/dashboard/hr/evaluations' }, // TODO: Add to ROUTES
        grievances: { label: t('hero.list.grievances'), href: ROUTES.dashboard.hr.grievances.list },
        'organizational-structure': { label: t('hero.list.organizationalStructure'), href: ROUTES.dashboard.hr.organizationalStructure.list },
        'job-positions': { label: t('hero.list.jobPositions'), href: ROUTES.dashboard.hr.jobPositions.list },
        'succession-planning': { label: t('hero.list.successionPlanning'), href: ROUTES.dashboard.hr.successionPlanning.list },
        'compensation': { label: t('hero.list.compensation'), href: ROUTES.dashboard.hr.compensation.list },
        'reports': { label: t('hero.list.reports'), href: ROUTES.dashboard.hr.reports.list },
        'biometric': { label: t('hero.list.biometric'), href: ROUTES.dashboard.hr.biometric.list },
        'hr-reports': { label: t('hero.list.hrReports'), href: ROUTES.dashboard.hr.reports.list },
        'finance-reports': { label: t('hero.list.financeReports'), href: ROUTES.dashboard.finance.reports.list },
        'tasks-reports': { label: t('hero.list.tasksReports'), href: ROUTES.dashboard.tasks.reports.list },
        'crm-reports': { label: t('hero.list.crmReports'), href: ROUTES.dashboard.crm.reports.list },
        'sales-reports': { label: t('hero.list.salesReports'), href: ROUTES.dashboard.sales.reports.list },
        'email-marketing': { label: t('hero.list.campaigns'), href: ROUTES.dashboard.crm.emailMarketing.list },
        'lead-scoring': { label: t('hero.list.leads'), href: ROUTES.dashboard.crm.leads.list },
        'whatsapp': { label: t('hero.list.leads'), href: ROUTES.dashboard.crm.leads.list },
    }

    const buttonConfig: Record<string, { label: string; href: string }> = {
        tasks: { label: t('hero.new.task'), href: ROUTES.dashboard.tasks.new },
        reminders: { label: t('hero.new.reminder'), href: ROUTES.dashboard.tasks.reminders.new },
        events: { label: t('hero.new.event'), href: ROUTES.dashboard.tasks.events.new },
        clients: { label: t('hero.new.client'), href: ROUTES.dashboard.clients.new },
        contacts: { label: t('hero.new.contact'), href: ROUTES.dashboard.contacts.new },
        organizations: { label: t('hero.new.organization'), href: ROUTES.dashboard.organizations.new },
        staff: { label: t('hero.new.employee'), href: ROUTES.dashboard.staff.new },
        leads: { label: t('hero.new.lead'), href: ROUTES.dashboard.crm.leads.new },
        pipeline: { label: t('hero.new.lead'), href: ROUTES.dashboard.crm.leads.new },
        referrals: { label: t('hero.new.referral'), href: ROUTES.dashboard.crm.referrals.new },
        activities: { label: t('hero.new.activity'), href: ROUTES.dashboard.crm.activities.new },
        'email-marketing': { label: t('hero.new.campaign'), href: ROUTES.dashboard.crm.emailMarketing.new },
        'lead-scoring': { label: t('hero.new.lead'), href: ROUTES.dashboard.crm.leads.new },
        'whatsapp': { label: t('hero.new.lead'), href: ROUTES.dashboard.crm.leads.new },
        cases: { label: t('hero.new.case'), href: ROUTES.dashboard.cases.new },
        documents: { label: t('hero.new.document'), href: '/dashboard/documents/new' }, // TODO: Add to ROUTES
        invoices: { label: t('hero.new.invoice'), href: ROUTES.dashboard.finance.invoices.new },
        expenses: { label: t('hero.new.expense'), href: ROUTES.dashboard.finance.expenses.new },
        payments: { label: t('hero.new.payment'), href: ROUTES.dashboard.finance.payments.new },
        transactions: { label: t('hero.new.transaction'), href: '/dashboard/finance/transactions/new' }, // TODO: Add to ROUTES
        'time-entries': { label: t('hero.new.timeEntry'), href: ROUTES.dashboard.finance.timeTracking.new },
        'time-tracking': { label: t('hero.new.timeEntry'), href: ROUTES.dashboard.finance.timeTracking.new },
        employees: { label: t('hero.new.employee'), href: ROUTES.dashboard.hr.employees.new },
        salaries: { label: t('hero.new.salary'), href: '/dashboard/hr/salaries/new' }, // TODO: Add to ROUTES
        payroll: { label: t('hero.new.payrollRun'), href: ROUTES.dashboard.hr.payroll.new },
        leaves: { label: t('hero.new.leave'), href: ROUTES.dashboard.hr.leave.new },
        attendance: { label: t('hero.new.attendanceRecord'), href: ROUTES.dashboard.hr.attendance.new },
        evaluations: { label: t('hero.new.evaluation'), href: '/dashboard/hr/evaluations/new' }, // TODO: Add to ROUTES
        grievances: { label: t('hero.new.grievance'), href: ROUTES.dashboard.hr.grievances.new },
        'organizational-structure': { label: t('hero.new.unit'), href: ROUTES.dashboard.hr.organizationalStructure.new },
        'job-positions': { label: t('hero.new.position'), href: ROUTES.dashboard.hr.jobPositions.new },
        'succession-planning': { label: t('hero.new.successionPlan'), href: ROUTES.dashboard.hr.successionPlanning.new },
        'compensation': { label: t('hero.new.compensationRecord'), href: ROUTES.dashboard.hr.compensation.new },
        'reports': { label: t('hero.new.report'), href: ROUTES.dashboard.hr.reports.new },
        'biometric': { label: t('hero.new.device'), href: ROUTES.dashboard.hr.biometric.new },
        'hr-reports': { label: t('hero.new.hrReport'), href: ROUTES.dashboard.hr.reports.new },
        'finance-reports': { label: t('hero.new.financeReport'), href: ROUTES.dashboard.finance.reports.new },
        'tasks-reports': { label: t('hero.new.productivityReport'), href: ROUTES.dashboard.tasks.reports.new },
        'crm-reports': { label: t('hero.new.crmReport'), href: ROUTES.dashboard.crm.reports.new },
        'sales-reports': { label: t('hero.new.salesReport'), href: ROUTES.dashboard.sales.reports.new },
        laws: { label: t('hero.new.law'), href: '/dashboard/knowledge/laws/new' }, // TODO: Add to ROUTES
        judgments: { label: t('hero.new.judgment'), href: '/dashboard/knowledge/judgments/new' }, // TODO: Add to ROUTES
        forms: { label: t('hero.new.form'), href: '/dashboard/knowledge/forms/new' }, // TODO: Add to ROUTES
        jobs: { label: t('hero.new.service'), href: '/dashboard/jobs/new' }, // TODO: Add to ROUTES
    }

    const currentButtonConfig = buttonConfig[type]
    const displayTitle = title || t('hero.productivity')

    return (
        <div className="bg-[#022c22] rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] max-h-[180px] lg:max-h-[190px] xl:max-h-[220px]">
            {/* Subtle Animated Gradient Background - reduced opacity for clarity */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: 'linear-gradient(-45deg, #022c22, #064e3b, #022c22, #0f766e)',
                        backgroundSize: '400% 400%',
                        animation: 'gradientShift 20s ease infinite'
                    }}
                />
                <style>{`
                    @keyframes gradientShift {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
            </div>
            {/* Background Pattern - reduced opacity */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-wave.png"
                    alt=""
                    className="w-full h-full object-cover opacity-25 mix-blend-overlay"
                />
            </div>
            {/* Subtle accent glow - reduced blur for clarity */}
            <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -me-32 -mt-32 pointer-events-none"></div>

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
                                        <Link to={listButtonConfig[type]?.href || ROUTES.dashboard.tasks.list}>
                                            <List className="ms-2 h-4 w-4" />
                                            {listButtonConfig[type]?.label || 'القائمة'}
                                        </Link>
                                    </Button>
                                ) : (
                                    // Default mode: Show "Create New" button
                                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm">
                                        <Link to={currentButtonConfig.href}>
                                            <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                                            {currentButtonConfig.label}
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm">
                                    <Link to={ROUTES.dashboard.tasks.events.list}>
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
