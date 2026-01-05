import { forwardRef } from 'react'
import { useCompanySettings } from '@/hooks/useBillingSettings'
import { API_DOMAIN } from '@/lib/api'

// Task type from task-details-view
interface TaskReport {
    id: string
    title: string
    description: string
    status: string
    priority: string
    taskType: string
    dueDate: string
    completion: number
    assignee: {
        name: string
        role: string
        avatar: string
    }
    client: {
        name: string
        type: string
        phone: string
        _id: string | null
    }
    case: {
        id: string
        title: string
        court: string
        _id: string | null
    }
    subtasks: Array<{
        _id: string
        id: number
        title: string
        completed: boolean
    }>
    attachments: Array<{
        _id: string
        name: string
        type: string
        size: string
        date: string
    }>
    timeTracking: {
        estimatedMinutes: number
        actualMinutes: number
    }
    outcome?: {
        outcome: string
        outcomeLabel: string
        outcomeDate?: string
        outcomeNotes?: string
        settlementAmount?: number
    } | null
}

interface TaskReportTemplateProps {
    task: TaskReport
    language?: 'ar' | 'en' | 'both'
    className?: string
}

/**
 * Task Report Template Component
 * Printable/PDF-ready task report with company branding
 */
export const TaskReportTemplate = forwardRef<HTMLDivElement, TaskReportTemplateProps>(
    ({ task, language = 'ar', className }, ref) => {
        const { data: companySettings } = useCompanySettings()

        const showArabic = language === 'ar' || language === 'both'

        // Format minutes to hours
        const formatTime = (minutes: number) => {
            if (minutes < 60) return `${minutes} دقيقة`
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            if (mins === 0) return `${hours} ساعة`
            return `${hours} ساعة و ${mins} دقيقة`
        }

        // Get logo URL
        const logoUrl = companySettings?.logo
            ? (companySettings.logo.startsWith('http') ? companySettings.logo : `${API_DOMAIN}${companySettings.logo}`)
            : null

        // Status labels
        const statusLabels: Record<string, string> = {
            'backlog': 'قائمة الانتظار',
            'todo': 'للتنفيذ',
            'in_progress': 'قيد التنفيذ',
            'in_review': 'قيد المراجعة',
            'done': 'مكتمل',
            'blocked': 'معلق'
        }

        // Priority labels
        const priorityLabels: Record<string, string> = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة'
        }

        // Task type labels
        const taskTypeLabels: Record<string, string> = {
            'court_hearing': 'جلسة محكمة',
            'filing_deadline': 'موعد تقديم',
            'client_meeting': 'اجتماع عميل',
            'document_review': 'مراجعة مستندات',
            'research': 'بحث قانوني',
            'appeal_deadline': 'موعد استئناف',
            'consultation': 'استشارة',
            'contract_review': 'مراجعة عقد',
            'case_preparation': 'تحضير قضية',
            'general': 'عامة',
            'other': 'أخرى'
        }

        // Priority colors
        const getPriorityColor = (priority: string) => {
            switch (priority) {
                case 'urgent': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
                case 'high': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' }
                case 'medium': return { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' }
                default: return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
            }
        }

        // Status colors
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'done': return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
                case 'in_progress': return { bg: '#dbeafe', text: '#2563eb', border: '#bfdbfe' }
                case 'blocked': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
                default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }
            }
        }

        const priorityColor = getPriorityColor(task.priority)
        const statusColor = getStatusColor(task.status)
        const completedSubtasks = task.subtasks.filter(s => s.completed).length
        const totalSubtasks = task.subtasks.length

        // Format current date
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        return (
            <div
                ref={ref}
                className={className}
                style={{
                    fontFamily: "'IBM Plex Sans Arabic', 'Segoe UI', sans-serif",
                    direction: 'rtl',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '40px',
                    background: 'white',
                    color: '#0f172a'
                }}
            >
                {/* HEADER */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '3px solid #10b981',
                    paddingBottom: '20px',
                    marginBottom: '30px'
                }}>
                    {/* Company Info */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ height: '50px', maxWidth: '150px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '20px'
                                }}>⚖️</div>
                            )}
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>
                                    {companySettings?.name || 'مكتب المحاماة'}
                                </h1>
                            </div>
                        </div>
                        {companySettings?.address && (
                            <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>
                                📍 {companySettings.address}{companySettings.city ? `, ${companySettings.city}` : ''}
                            </p>
                        )}
                        {companySettings?.phone && (
                            <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>
                                📞 {companySettings.phone}
                            </p>
                        )}
                        {companySettings?.email && (
                            <p style={{ margin: '4px 0', fontSize: '12px', color: '#64748b' }}>
                                ✉️ {companySettings.email}
                            </p>
                        )}
                    </div>

                    {/* Report Badge */}
                    <div style={{ textAlign: 'left' }}>
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            padding: '12px 20px'
                        }}>
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>تقرير المهمة</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                📅 {currentDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TASK TITLE BANNER */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.8 }}>عنوان المهمة</p>
                            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>{task.title}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{
                                background: priorityColor.bg,
                                color: priorityColor.text,
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {priorityLabels[task.priority] || task.priority}
                            </span>
                            <span style={{
                                background: statusColor.bg,
                                color: statusColor.text,
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {statusLabels[task.status] || task.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* INFO GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    {/* Task Info */}
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '14px',
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                            معلومات المهمة
                        </h3>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b', width: '40%' }}>نوع المهمة:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '500' }}>{taskTypeLabels[task.taskType] || task.taskType}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>تاريخ الاستحقاق:</td>
                                    <td style={{ padding: '8px 0', color: '#dc2626', fontWeight: '500' }}>{task.dueDate}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>المسؤول:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '500' }}>{task.assignee.name}</td>
                                </tr>
                                {task.timeTracking.estimatedMinutes > 0 && (
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b' }}>الوقت المقدر:</td>
                                        <td style={{ padding: '8px 0', color: '#0f172a' }}>{formatTime(task.timeTracking.estimatedMinutes)}</td>
                                    </tr>
                                )}
                                {task.timeTracking.actualMinutes > 0 && (
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b' }}>الوقت الفعلي:</td>
                                        <td style={{ padding: '8px 0', color: '#0f172a' }}>{formatTime(task.timeTracking.actualMinutes)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Case & Client Info */}
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '14px',
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span>
                            القضية والعميل
                        </h3>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b', width: '40%' }}>رقم القضية:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '500' }}>{task.case.id}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>عنوان القضية:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a' }}>{task.case.title}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>المحكمة:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a' }}>{task.case.court}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>اسم العميل:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '500' }}>{task.client.name}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b' }}>نوع العميل:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a' }}>{task.client.type}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>📝 وصف المهمة</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.8' }}>
                        {task.description}
                    </p>
                </div>

                {/* SUBTASKS */}
                {totalSubtasks > 0 && (
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '14px',
                            color: '#0f172a',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>✅ المهام الفرعية</span>
                            <span style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>{completedSubtasks}/{totalSubtasks} مكتمل</span>
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {task.subtasks.map((subtask) => (
                                <div key={subtask._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px',
                                    background: 'white',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ color: subtask.completed ? '#10b981' : '#e2e8f0', fontSize: '18px' }}>
                                        {subtask.completed ? '☑️' : '⬜'}
                                    </span>
                                    <span style={{
                                        color: subtask.completed ? '#64748b' : '#0f172a',
                                        textDecoration: subtask.completed ? 'line-through' : 'none'
                                    }}>
                                        {subtask.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Progress Bar */}
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                                <span style={{ color: '#64748b' }}>نسبة الإنجاز</span>
                                <span style={{ color: '#10b981', fontWeight: '600' }}>{task.completion}%</span>
                            </div>
                            <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                    width: `${task.completion}%`,
                                    height: '100%',
                                    borderRadius: '10px'
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OUTCOME (if exists) */}
                {task.outcome && (
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0f172a' }}>🎯 نتيجة المهمة</h3>
                        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', color: '#64748b', width: '30%' }}>النتيجة:</td>
                                    <td style={{ padding: '8px 0', color: '#0f172a', fontWeight: '500' }}>{task.outcome.outcomeLabel}</td>
                                </tr>
                                {task.outcome.outcomeDate && (
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b' }}>تاريخ النتيجة:</td>
                                        <td style={{ padding: '8px 0', color: '#0f172a' }}>{task.outcome.outcomeDate}</td>
                                    </tr>
                                )}
                                {task.outcome.settlementAmount && (
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b' }}>مبلغ التسوية:</td>
                                        <td style={{ padding: '8px 0', color: '#10b981', fontWeight: '600' }}>
                                            {task.outcome.settlementAmount.toLocaleString('ar-SA')} ر.س
                                        </td>
                                    </tr>
                                )}
                                {task.outcome.outcomeNotes && (
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b', verticalAlign: 'top' }}>ملاحظات:</td>
                                        <td style={{ padding: '8px 0', color: '#475569' }}>{task.outcome.outcomeNotes}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ATTACHMENTS */}
                {task.attachments.length > 0 && (
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#0f172a' }}>
                            📎 المرفقات ({task.attachments.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {task.attachments.map((attachment) => {
                                const typeColors: Record<string, { bg: string; text: string }> = {
                                    'PDF': { bg: '#fef2f2', text: '#dc2626' },
                                    'DOC': { bg: '#eff6ff', text: '#2563eb' },
                                    'XLS': { bg: '#f0fdf4', text: '#16a34a' },
                                    'IMG': { bg: '#f0fdf4', text: '#16a34a' }
                                }
                                const colors = typeColors[attachment.type] || { bg: '#f1f5f9', text: '#64748b' }

                                return (
                                    <div key={attachment._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <span style={{
                                            background: colors.bg,
                                            color: colors.text,
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: '600'
                                        }}>{attachment.type}</span>
                                        <span style={{ flex: 1, color: '#0f172a', fontSize: '13px' }}>{attachment.name}</span>
                                        <span style={{ color: '#64748b', fontSize: '12px' }}>{attachment.size}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <div style={{
                    borderTop: '2px solid #e2e8f0',
                    paddingTop: '20px',
                    textAlign: 'center'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                        تم إنشاء هذا التقرير إلكترونياً من نظام إدارة المهام
                    </p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                        © {new Date().getFullYear()} {companySettings?.name || 'مكتب المحاماة'} - جميع الحقوق محفوظة
                    </p>
                </div>
            </div>
        )
    }
)

TaskReportTemplate.displayName = 'TaskReportTemplate'

/**
 * Hook for using the task report template with print functionality
 */
export function useTaskReport() {
    const { data: companySettings } = useCompanySettings()

    const generateTaskReportHtml = (task: TaskReport) => {
        // Format minutes to hours
        const formatTime = (minutes: number) => {
            if (minutes < 60) return `${minutes} دقيقة`
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            if (mins === 0) return `${hours} ساعة`
            return `${hours} ساعة و ${mins} دقيقة`
        }

        // Get logo URL
        const logoUrl = companySettings?.logo
            ? (companySettings.logo.startsWith('http') ? companySettings.logo : `${API_DOMAIN}${companySettings.logo}`)
            : null

        // Status labels
        const statusLabels: Record<string, string> = {
            'backlog': 'قائمة الانتظار',
            'todo': 'للتنفيذ',
            'in_progress': 'قيد التنفيذ',
            'in_review': 'قيد المراجعة',
            'done': 'مكتمل',
            'blocked': 'معلق'
        }

        // Priority labels
        const priorityLabels: Record<string, string> = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة'
        }

        // Task type labels
        const taskTypeLabels: Record<string, string> = {
            'court_hearing': 'جلسة محكمة',
            'filing_deadline': 'موعد تقديم',
            'client_meeting': 'اجتماع عميل',
            'document_review': 'مراجعة مستندات',
            'research': 'بحث قانوني',
            'appeal_deadline': 'موعد استئناف',
            'consultation': 'استشارة',
            'contract_review': 'مراجعة عقد',
            'case_preparation': 'تحضير قضية',
            'general': 'عامة',
            'other': 'أخرى'
        }

        // Priority colors
        const getPriorityStyle = (priority: string) => {
            switch (priority) {
                case 'urgent': return 'background: #fef2f2; color: #dc2626;'
                case 'high': return 'background: #fef3c7; color: #d97706;'
                case 'medium': return 'background: #dbeafe; color: #2563eb;'
                default: return 'background: #f0fdf4; color: #16a34a;'
            }
        }

        // Status colors
        const getStatusStyle = (status: string) => {
            switch (status) {
                case 'done': return 'background: #f0fdf4; color: #16a34a;'
                case 'in_progress': return 'background: #dbeafe; color: #2563eb;'
                case 'blocked': return 'background: #fef2f2; color: #dc2626;'
                default: return 'background: #f1f5f9; color: #475569;'
            }
        }

        const completedSubtasks = task.subtasks.filter(s => s.completed).length
        const totalSubtasks = task.subtasks.length
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Generate subtasks HTML
        const subtasksHtml = task.subtasks.length > 0 ? `
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a; display: flex; justify-content: space-between; align-items: center;">
                    <span>✅ المهام الفرعية</span>
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${completedSubtasks}/${totalSubtasks} مكتمل</span>
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${task.subtasks.map(subtask => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: white; border-radius: 8px;">
                            <span style="color: ${subtask.completed ? '#10b981' : '#e2e8f0'}; font-size: 18px;">${subtask.completed ? '☑️' : '⬜'}</span>
                            <span style="color: ${subtask.completed ? '#64748b' : '#0f172a'}; text-decoration: ${subtask.completed ? 'line-through' : 'none'};">${subtask.title}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
                        <span style="color: #64748b;">نسبة الإنجاز</span>
                        <span style="color: #10b981; font-weight: 600;">${task.completion}%</span>
                    </div>
                    <div style="background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #10b981, #34d399); width: ${task.completion}%; height: 100%; border-radius: 10px;"></div>
                    </div>
                </div>
            </div>
        ` : ''

        // Generate outcome HTML
        const outcomeHtml = task.outcome ? `
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a;">🎯 نتيجة المهمة</h3>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tbody>
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; width: 30%;">النتيجة:</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${task.outcome.outcomeLabel}</td>
                        </tr>
                        ${task.outcome.outcomeDate ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">تاريخ النتيجة:</td>
                            <td style="padding: 8px 0; color: #0f172a;">${task.outcome.outcomeDate}</td>
                        </tr>
                        ` : ''}
                        ${task.outcome.settlementAmount ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b;">مبلغ التسوية:</td>
                            <td style="padding: 8px 0; color: #10b981; font-weight: 600;">${task.outcome.settlementAmount.toLocaleString('ar-SA')} ر.س</td>
                        </tr>
                        ` : ''}
                        ${task.outcome.outcomeNotes ? `
                        <tr>
                            <td style="padding: 8px 0; color: #64748b; vertical-align: top;">ملاحظات:</td>
                            <td style="padding: 8px 0; color: #475569;">${task.outcome.outcomeNotes}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        ` : ''

        // Generate attachments HTML
        const attachmentsHtml = task.attachments.length > 0 ? `
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a;">📎 المرفقات (${task.attachments.length})</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${task.attachments.map(attachment => {
                        const typeColors: Record<string, string> = {
                            'PDF': 'background: #fef2f2; color: #dc2626;',
                            'DOC': 'background: #eff6ff; color: #2563eb;',
                            'XLS': 'background: #f0fdf4; color: #16a34a;',
                            'IMG': 'background: #f0fdf4; color: #16a34a;'
                        }
                        const colorStyle = typeColors[attachment.type] || 'background: #f1f5f9; color: #64748b;'
                        return `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <span style="${colorStyle} padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">${attachment.type}</span>
                                <span style="flex: 1; color: #0f172a; font-size: 13px;">${attachment.name}</span>
                                <span style="color: #64748b; font-size: 12px;">${attachment.size}</span>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        ` : ''

        return `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>تقرير المهمة - ${task.title}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'IBM Plex Sans Arabic', 'Segoe UI', sans-serif;
                        direction: rtl;
                        background: #94a3b8;
                        padding: 20px;
                    }
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        .container { box-shadow: none !important; }
                    }
                    @page { margin: 0.5cm; }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- HEADER -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; max-width: 150px; object-fit: contain;" />` : `
                                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #0f172a, #1e3a5f); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">⚖️</div>
                                `}
                                <div>
                                    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${companySettings?.name || 'مكتب المحاماة'}</h1>
                                </div>
                            </div>
                            ${companySettings?.address ? `<p style="margin: 4px 0; font-size: 12px; color: #64748b;">📍 ${companySettings.address}${companySettings.city ? `, ${companySettings.city}` : ''}</p>` : ''}
                            ${companySettings?.phone ? `<p style="margin: 4px 0; font-size: 12px; color: #64748b;">📞 ${companySettings.phone}</p>` : ''}
                            ${companySettings?.email ? `<p style="margin: 4px 0; font-size: 12px; color: #64748b;">✉️ ${companySettings.email}</p>` : ''}
                        </div>
                        <div style="text-align: left;">
                            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 20px;">
                                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #10b981;">تقرير المهمة</p>
                                <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">📅 ${currentDate}</p>
                            </div>
                        </div>
                    </div>

                    <!-- TASK TITLE BANNER -->
                    <div style="background: linear-gradient(135deg, #0f172a, #1e3a5f); border-radius: 16px; padding: 24px; margin-bottom: 24px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                            <div>
                                <p style="margin: 0 0 8px 0; font-size: 12px; opacity: 0.8;">عنوان المهمة</p>
                                <h2 style="margin: 0; font-size: 22px; font-weight: bold;">${task.title}</h2>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <span style="${getPriorityStyle(task.priority)} padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    ${priorityLabels[task.priority] || task.priority}
                                </span>
                                <span style="${getStatusStyle(task.status)} padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    ${statusLabels[task.status] || task.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- INFO GRID -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                            <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>
                                معلومات المهمة
                            </h3>
                            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; width: 40%;">نوع المهمة:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${taskTypeLabels[task.taskType] || task.taskType}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">تاريخ الاستحقاق:</td>
                                        <td style="padding: 8px 0; color: #dc2626; font-weight: 500;">${task.dueDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">المسؤول:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${task.assignee.name}</td>
                                    </tr>
                                    ${task.timeTracking.estimatedMinutes > 0 ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">الوقت المقدر:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${formatTime(task.timeTracking.estimatedMinutes)}</td>
                                    </tr>
                                    ` : ''}
                                    ${task.timeTracking.actualMinutes > 0 ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">الوقت الفعلي:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${formatTime(task.timeTracking.actualMinutes)}</td>
                                    </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                        <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
                            <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></span>
                                القضية والعميل
                            </h3>
                            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; width: 40%;">رقم القضية:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${task.case.id}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">عنوان القضية:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${task.case.title}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">المحكمة:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${task.case.court}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">اسم العميل:</td>
                                        <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${task.client.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b;">نوع العميل:</td>
                                        <td style="padding: 8px 0; color: #0f172a;">${task.client.type}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- DESCRIPTION -->
                    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #0f172a;">📝 وصف المهمة</h3>
                        <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.8;">${task.description}</p>
                    </div>

                    <!-- SUBTASKS -->
                    ${subtasksHtml}

                    <!-- OUTCOME -->
                    ${outcomeHtml}

                    <!-- ATTACHMENTS -->
                    ${attachmentsHtml}

                    <!-- FOOTER -->
                    <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                            تم إنشاء هذا التقرير إلكترونياً من نظام إدارة المهام
                        </p>
                        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                            © ${new Date().getFullYear()} ${companySettings?.name || 'مكتب المحاماة'} - جميع الحقوق محفوظة
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    }

    const print = (task: TaskReport) => {
        const html = generateTaskReportHtml(task)
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(html)
            printWindow.document.close()
            printWindow.focus()
            // Auto-trigger print dialog after a short delay
            setTimeout(() => {
                printWindow.print()
            }, 500)
        }
    }

    const preview = (task: TaskReport) => {
        const html = generateTaskReportHtml(task)
        const previewWindow = window.open('', '_blank')
        if (previewWindow) {
            previewWindow.document.write(html)
            previewWindow.document.close()
        }
    }

    return {
        print,
        preview,
        generateTaskReportHtml
    }
}
