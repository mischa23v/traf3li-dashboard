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

// Task type icons (SVG paths)
const taskTypeIcons: Record<string, string> = {
    'court_hearing': '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    'filing_deadline': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'appeal_deadline': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    'document_drafting': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    'contract_review': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>',
    'client_meeting': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'client_call': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    'consultation': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'najiz_procedure': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    'legal_research': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'enforcement_followup': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'notarization': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    'billing_task': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'administrative': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    'follow_up': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'general': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    'other': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
}

/**
 * Task Report Template Component
 * Premium printable/PDF-ready task report with company branding
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
            'urgent': 'عاجلة',
            'critical': 'حرج'
        }

        // Task type labels
        const taskTypeLabels: Record<string, string> = {
            'court_hearing': 'جلسة محكمة',
            'filing_deadline': 'موعد تقديم',
            'appeal_deadline': 'موعد استئناف',
            'document_drafting': 'صياغة مستندات',
            'contract_review': 'مراجعة عقد',
            'client_meeting': 'اجتماع عميل',
            'client_call': 'مكالمة عميل',
            'consultation': 'استشارة',
            'najiz_procedure': 'إجراء ناجز',
            'legal_research': 'بحث قانوني',
            'enforcement_followup': 'متابعة تنفيذ',
            'notarization': 'توثيق',
            'billing_task': 'مهمة فوترة',
            'administrative': 'إدارية',
            'follow_up': 'متابعة',
            'other': 'أخرى',
            'general': 'عامة'
        }

        // Client type labels
        const clientTypeLabels: Record<string, string> = {
            'individual': 'فرد',
            'company': 'شركة',
            'government': 'جهة حكومية'
        }

        const completedSubtasks = task.subtasks.filter(s => s.completed).length
        const totalSubtasks = task.subtasks.length

        // Format current date
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'islamic-umalqura'
        })

        const gregorianDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Check if case/client data exists
        const hasCase = task.case._id && task.case.id !== 'غير محدد'
        const hasClient = task.client._id && task.client.name !== 'غير محدد'

        // Time tracking percentage
        const timePercentage = task.timeTracking.estimatedMinutes > 0
            ? Math.min(100, Math.round((task.timeTracking.actualMinutes / task.timeTracking.estimatedMinutes) * 100))
            : 0

        return (
            <div
                ref={ref}
                className={className}
                style={{
                    fontFamily: "'IBM Plex Sans Arabic', 'Segoe UI', sans-serif",
                    direction: 'rtl',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '0',
                    background: 'white',
                    color: '#1e293b'
                }}
            >
                {/* PREMIUM HEADER WITH GRADIENT ACCENT */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                    padding: '32px 40px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.05,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                        {/* Company Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" style={{ height: '60px', maxWidth: '180px', objectFit: 'contain' }} />
                            ) : (
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>⚖️</div>
                            )}
                            <div>
                                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                                    {companySettings?.name || 'مكتب المحاماة'}
                                </h1>
                                {companySettings?.licenseNumber && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                                        رخصة رقم: {companySettings.licenseNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Report Type Badge */}
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            padding: '16px 24px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            textAlign: 'center'
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>وثيقة رسمية</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700' }}>تقرير المهمة</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '11px', opacity: 0.7 }}>
                                {gregorianDate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div style={{ padding: '32px 40px' }}>

                    {/* TASK TITLE SECTION */}
                    <div style={{
                        marginBottom: '32px',
                        paddingBottom: '24px',
                        borderBottom: '2px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            {/* Task Type Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: taskTypeIcons[task.taskType] || taskTypeIcons['general'] }} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#10b981',
                                        fontWeight: '600',
                                        background: '#ecfdf5',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                    }}>
                                        {taskTypeLabels[task.taskType] || task.taskType}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: task.priority === 'critical' || task.priority === 'urgent' ? '#dc2626' : task.priority === 'high' ? '#d97706' : '#64748b',
                                        fontWeight: '600',
                                        background: task.priority === 'critical' || task.priority === 'urgent' ? '#fef2f2' : task.priority === 'high' ? '#fffbeb' : '#f1f5f9',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                    }}>
                                        الأولوية: {priorityLabels[task.priority] || task.priority}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: task.status === 'done' ? '#10b981' : task.status === 'in_progress' ? '#3b82f6' : task.status === 'blocked' ? '#dc2626' : '#64748b',
                                        fontWeight: '600',
                                        background: task.status === 'done' ? '#ecfdf5' : task.status === 'in_progress' ? '#eff6ff' : task.status === 'blocked' ? '#fef2f2' : '#f1f5f9',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                    }}>
                                        {statusLabels[task.status] || task.status}
                                    </span>
                                </div>
                                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a', lineHeight: 1.3 }}>
                                    {task.title}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* KEY METRICS ROW */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                        marginBottom: '32px'
                    }}>
                        {/* Due Date */}
                        <div style={{
                            background: '#fef2f2',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #fecaca'
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#991b1b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>تاريخ الاستحقاق</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>{task.dueDate}</p>
                        </div>

                        {/* Assignee */}
                        <div style={{
                            background: '#eff6ff',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #bfdbfe'
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#1e40af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>المسؤول</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#1d4ed8' }}>{task.assignee.name}</p>
                        </div>

                        {/* Progress */}
                        <div style={{
                            background: '#ecfdf5',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #a7f3d0'
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>نسبة الإنجاز</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#059669' }}>{task.completion}%</p>
                        </div>

                        {/* Subtasks */}
                        <div style={{
                            background: '#faf5ff',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'center',
                            border: '1px solid #e9d5ff'
                        }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#6b21a8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>المهام الفرعية</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#7c3aed' }}>{completedSubtasks}/{totalSubtasks}</p>
                        </div>
                    </div>

                    {/* DESCRIPTION SECTION */}
                    {task.description && task.description !== 'لا يوجد وصف' && (
                        <div style={{
                            marginBottom: '32px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{
                                margin: '0 0 16px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: '#0f172a',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </span>
                                وصف المهمة
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.8 }}>
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* TWO COLUMN LAYOUT - Case & Client */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        {/* Case Info */}
                        <div style={{
                            background: hasCase ? '#f8fafc' : '#fafafa',
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${hasCase ? '#e2e8f0' : '#f0f0f0'}`
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: hasCase ? '#0f172a' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: hasCase ? '#3b82f6' : '#d1d5db',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </span>
                                بيانات القضية
                            </h3>
                            {hasCase ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>رقم القضية</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{task.case.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>عنوان القضية</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{task.case.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>المحكمة</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{task.case.court}</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>لا توجد قضية مرتبطة</p>
                                </div>
                            )}
                        </div>

                        {/* Client Info */}
                        <div style={{
                            background: hasClient ? '#f8fafc' : '#fafafa',
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${hasClient ? '#e2e8f0' : '#f0f0f0'}`
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: hasClient ? '#0f172a' : '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: hasClient ? '#10b981' : '#d1d5db',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </span>
                                بيانات العميل
                            </h3>
                            {hasClient ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>اسم العميل</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{task.client.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>نوع العميل</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{clientTypeLabels[task.client.type] || task.client.type}</span>
                                    </div>
                                    {task.client.phone && task.client.phone !== 'غير محدد' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>رقم الهاتف</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', direction: 'ltr' }}>{task.client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>لا يوجد عميل مرتبط</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TIME TRACKING SECTION */}
                    {(task.timeTracking.estimatedMinutes > 0 || task.timeTracking.actualMinutes > 0) && (
                        <div style={{
                            marginBottom: '32px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: '#f59e0b',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </span>
                                تتبع الوقت
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>الوقت المقدر</p>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                                        {task.timeTracking.estimatedMinutes > 0 ? formatTime(task.timeTracking.estimatedMinutes) : '—'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>الوقت الفعلي</p>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: timePercentage > 100 ? '#dc2626' : '#10b981' }}>
                                        {task.timeTracking.actualMinutes > 0 ? formatTime(task.timeTracking.actualMinutes) : '—'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>نسبة الاستهلاك</p>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: timePercentage > 100 ? '#dc2626' : timePercentage > 80 ? '#f59e0b' : '#10b981' }}>
                                        {task.timeTracking.estimatedMinutes > 0 ? `${timePercentage}%` : '—'}
                                    </p>
                                </div>
                            </div>
                            {task.timeTracking.estimatedMinutes > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            background: timePercentage > 100 ? '#dc2626' : timePercentage > 80 ? '#f59e0b' : '#10b981',
                                            width: `${Math.min(100, timePercentage)}%`,
                                            height: '100%',
                                            borderRadius: '10px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUBTASKS SECTION */}
                    {totalSubtasks > 0 && (
                        <div style={{
                            marginBottom: '32px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        width: '28px',
                                        height: '28px',
                                        background: '#8b5cf6',
                                        borderRadius: '8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <polyline points="9 11 12 14 22 4"/>
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                        </svg>
                                    </span>
                                    المهام الفرعية
                                </span>
                                <span style={{
                                    background: completedSubtasks === totalSubtasks ? '#10b981' : '#64748b',
                                    color: 'white',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {completedSubtasks}/{totalSubtasks} مكتمل
                                </span>
                            </h3>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ background: '#e2e8f0', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                                        width: `${task.completion}%`,
                                        height: '100%',
                                        borderRadius: '10px',
                                        minWidth: task.completion > 0 ? '8px' : '0'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {task.subtasks.map((subtask, index) => (
                                    <div key={subtask._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        background: 'white',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            background: subtask.completed ? '#10b981' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {subtask.completed && (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            )}
                                        </span>
                                        <span style={{
                                            fontSize: '13px',
                                            color: subtask.completed ? '#64748b' : '#0f172a',
                                            textDecoration: subtask.completed ? 'line-through' : 'none',
                                            flex: 1
                                        }}>
                                            {subtask.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OUTCOME SECTION */}
                    {task.outcome && (
                        <div style={{
                            marginBottom: '32px',
                            background: task.outcome.outcome === 'won' ? '#ecfdf5' : task.outcome.outcome === 'lost' ? '#fef2f2' : '#f8fafc',
                            borderRadius: '12px',
                            padding: '24px',
                            border: `1px solid ${task.outcome.outcome === 'won' ? '#a7f3d0' : task.outcome.outcome === 'lost' ? '#fecaca' : '#e2e8f0'}`
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: task.outcome.outcome === 'won' ? '#10b981' : task.outcome.outcome === 'lost' ? '#ef4444' : '#6366f1',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <circle cx="12" cy="8" r="7"/>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                    </svg>
                                </span>
                                نتيجة المهمة
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: task.outcome.settlementAmount ? '1fr 1fr' : '1fr', gap: '24px' }}>
                                <div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: '#64748b' }}>النتيجة</span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: task.outcome.outcome === 'won' ? '#059669' : task.outcome.outcome === 'lost' ? '#dc2626' : '#0f172a'
                                            }}>
                                                {task.outcome.outcomeLabel}
                                            </span>
                                        </div>
                                        {task.outcome.outcomeDate && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', color: '#64748b' }}>تاريخ النتيجة</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{task.outcome.outcomeDate}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {task.outcome.settlementAmount && (
                                    <div style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>مبلغ التسوية</p>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                                            {task.outcome.settlementAmount.toLocaleString('ar-SA')} <span style={{ fontSize: '14px' }}>ر.س</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            {task.outcome.outcomeNotes && (
                                <div style={{ marginTop: '16px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>ملاحظات</p>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>{task.outcome.outcomeNotes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ATTACHMENTS SECTION */}
                    {task.attachments.length > 0 && (
                        <div style={{
                            marginBottom: '32px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{
                                margin: '0 0 20px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '28px',
                                    height: '28px',
                                    background: '#ec4899',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                    </svg>
                                </span>
                                المرفقات ({task.attachments.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                {task.attachments.map((attachment) => {
                                    const typeConfig: Record<string, { bg: string; text: string; icon: string }> = {
                                        'PDF': { bg: '#fef2f2', text: '#dc2626', icon: 'PDF' },
                                        'DOC': { bg: '#eff6ff', text: '#2563eb', icon: 'DOC' },
                                        'DOCX': { bg: '#eff6ff', text: '#2563eb', icon: 'DOC' },
                                        'XLS': { bg: '#ecfdf5', text: '#059669', icon: 'XLS' },
                                        'XLSX': { bg: '#ecfdf5', text: '#059669', icon: 'XLS' },
                                        'IMG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' },
                                        'PNG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' },
                                        'JPG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' }
                                    }
                                    const config = typeConfig[attachment.type.toUpperCase()] || { bg: '#f1f5f9', text: '#64748b', icon: 'FILE' }

                                    return (
                                        <div key={attachment._id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            background: 'white',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <span style={{
                                                background: config.bg,
                                                color: config.text,
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                letterSpacing: '0.5px'
                                            }}>{config.icon}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#0f172a', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {attachment.name}
                                                </p>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>{attachment.size}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* PREMIUM FOOTER */}
                <div style={{
                    background: '#f8fafc',
                    padding: '24px 40px',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                                تم إنشاء هذا التقرير إلكترونياً بتاريخ {gregorianDate}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                                رقم المرجع: {task.id.slice(-8).toUpperCase()}
                            </p>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                {companySettings?.name || 'مكتب المحاماة'}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
                                © {new Date().getFullYear()} جميع الحقوق محفوظة
                            </p>
                        </div>
                    </div>
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

        // Labels
        const statusLabels: Record<string, string> = {
            'backlog': 'قائمة الانتظار',
            'todo': 'للتنفيذ',
            'in_progress': 'قيد التنفيذ',
            'in_review': 'قيد المراجعة',
            'done': 'مكتمل',
            'blocked': 'معلق'
        }

        const priorityLabels: Record<string, string> = {
            'low': 'منخفضة',
            'medium': 'متوسطة',
            'high': 'عالية',
            'urgent': 'عاجلة',
            'critical': 'حرج'
        }

        const taskTypeLabels: Record<string, string> = {
            'court_hearing': 'جلسة محكمة',
            'filing_deadline': 'موعد تقديم',
            'appeal_deadline': 'موعد استئناف',
            'document_drafting': 'صياغة مستندات',
            'contract_review': 'مراجعة عقد',
            'client_meeting': 'اجتماع عميل',
            'client_call': 'مكالمة عميل',
            'consultation': 'استشارة',
            'najiz_procedure': 'إجراء ناجز',
            'legal_research': 'بحث قانوني',
            'enforcement_followup': 'متابعة تنفيذ',
            'notarization': 'توثيق',
            'billing_task': 'مهمة فوترة',
            'administrative': 'إدارية',
            'follow_up': 'متابعة',
            'other': 'أخرى',
            'general': 'عامة'
        }

        const clientTypeLabels: Record<string, string> = {
            'individual': 'فرد',
            'company': 'شركة',
            'government': 'جهة حكومية'
        }

        const completedSubtasks = task.subtasks.filter(s => s.completed).length
        const totalSubtasks = task.subtasks.length
        const gregorianDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        const hasCase = task.case._id && task.case.id !== 'غير محدد'
        const hasClient = task.client._id && task.client.name !== 'غير محدد'
        const timePercentage = task.timeTracking.estimatedMinutes > 0
            ? Math.min(100, Math.round((task.timeTracking.actualMinutes / task.timeTracking.estimatedMinutes) * 100))
            : 0

        // SVG Icons for task types
        const taskTypeIconsSvg: Record<string, string> = {
            'court_hearing': '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
            'filing_deadline': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
            'general': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        }

        const getTaskIcon = (type: string) => taskTypeIconsSvg[type] || taskTypeIconsSvg['general']

        // Generate subtasks HTML
        const subtasksHtml = task.subtasks.length > 0 ? `
            <div style="margin-bottom: 32px; background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; justify-content: space-between;">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 28px; height: 28px; background: #8b5cf6; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        </span>
                        المهام الفرعية
                    </span>
                    <span style="background: ${completedSubtasks === totalSubtasks ? '#10b981' : '#64748b'}; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">${completedSubtasks}/${totalSubtasks} مكتمل</span>
                </h3>
                <div style="margin-bottom: 20px;">
                    <div style="background: #e2e8f0; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); width: ${task.completion}%; height: 100%; border-radius: 10px;${task.completion > 0 ? ' min-width: 8px;' : ''}"></div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${task.subtasks.map(subtask => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <span style="width: 24px; height: 24px; border-radius: 6px; background: ${subtask.completed ? '#10b981' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${subtask.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                            </span>
                            <span style="font-size: 13px; color: ${subtask.completed ? '#64748b' : '#0f172a'}; text-decoration: ${subtask.completed ? 'line-through' : 'none'}; flex: 1;">${subtask.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''

        // Generate outcome HTML
        const outcomeHtml = task.outcome ? `
            <div style="margin-bottom: 32px; background: ${task.outcome.outcome === 'won' ? '#ecfdf5' : task.outcome.outcome === 'lost' ? '#fef2f2' : '#f8fafc'}; border-radius: 12px; padding: 24px; border: 1px solid ${task.outcome.outcome === 'won' ? '#a7f3d0' : task.outcome.outcome === 'lost' ? '#fecaca' : '#e2e8f0'};">
                <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 28px; height: 28px; background: ${task.outcome.outcome === 'won' ? '#10b981' : task.outcome.outcome === 'lost' ? '#ef4444' : '#6366f1'}; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                    </span>
                    نتيجة المهمة
                </h3>
                <div style="display: grid; grid-template-columns: ${task.outcome.settlementAmount ? '1fr 1fr' : '1fr'}; gap: 24px;">
                    <div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 13px; color: #64748b;">النتيجة</span>
                                <span style="font-size: 13px; font-weight: 700; color: ${task.outcome.outcome === 'won' ? '#059669' : task.outcome.outcome === 'lost' ? '#dc2626' : '#0f172a'};">${task.outcome.outcomeLabel}</span>
                            </div>
                            ${task.outcome.outcomeDate ? `
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 13px; color: #64748b;">تاريخ النتيجة</span>
                                <span style="font-size: 13px; font-weight: 600; color: #0f172a;">${task.outcome.outcomeDate}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ${task.outcome.settlementAmount ? `
                    <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
                        <p style="margin: 0; font-size: 12px; color: #64748b;">مبلغ التسوية</p>
                        <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #059669;">${task.outcome.settlementAmount.toLocaleString('ar-SA')} <span style="font-size: 14px;">ر.س</span></p>
                    </div>
                    ` : ''}
                </div>
                ${task.outcome.outcomeNotes ? `
                <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 12px; color: #64748b; margin-bottom: 8px;">ملاحظات</p>
                    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">${task.outcome.outcomeNotes}</p>
                </div>
                ` : ''}
            </div>
        ` : ''

        // Generate attachments HTML
        const attachmentsHtml = task.attachments.length > 0 ? `
            <div style="margin-bottom: 32px; background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 28px; height: 28px; background: #ec4899; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    </span>
                    المرفقات (${task.attachments.length})
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    ${task.attachments.map(attachment => {
                        const typeConfig: Record<string, { bg: string; text: string; icon: string }> = {
                            'PDF': { bg: '#fef2f2', text: '#dc2626', icon: 'PDF' },
                            'DOC': { bg: '#eff6ff', text: '#2563eb', icon: 'DOC' },
                            'DOCX': { bg: '#eff6ff', text: '#2563eb', icon: 'DOC' },
                            'XLS': { bg: '#ecfdf5', text: '#059669', icon: 'XLS' },
                            'XLSX': { bg: '#ecfdf5', text: '#059669', icon: 'XLS' },
                            'IMG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' },
                            'PNG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' },
                            'JPG': { bg: '#faf5ff', text: '#7c3aed', icon: 'IMG' }
                        }
                        const config = typeConfig[attachment.type.toUpperCase()] || { bg: '#f1f5f9', text: '#64748b', icon: 'FILE' }
                        return `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <span style="background: ${config.bg}; color: ${config.text}; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${config.icon}</span>
                                <div style="flex: 1; min-width: 0;">
                                    <p style="margin: 0; font-size: 13px; color: #0f172a; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${attachment.name}</p>
                                    <p style="margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;">${attachment.size}</p>
                                </div>
                            </div>
                        `
                    }).join('')}
                </div>
            </div>
        ` : ''

        // Time tracking HTML
        const timeTrackingHtml = (task.timeTracking.estimatedMinutes > 0 || task.timeTracking.actualMinutes > 0) ? `
            <div style="margin-bottom: 32px; background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <h3 style="margin: 0 0 20px 0; font-size: 14px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                    <span style="width: 28px; height: 28px; background: #f59e0b; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </span>
                    تتبع الوقت
                </h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px;">
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #64748b;">الوقت المقدر</p>
                        <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a;">${task.timeTracking.estimatedMinutes > 0 ? formatTime(task.timeTracking.estimatedMinutes) : '—'}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #64748b;">الوقت الفعلي</p>
                        <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: ${timePercentage > 100 ? '#dc2626' : '#10b981'};">${task.timeTracking.actualMinutes > 0 ? formatTime(task.timeTracking.actualMinutes) : '—'}</p>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #64748b;">نسبة الاستهلاك</p>
                        <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: ${timePercentage > 100 ? '#dc2626' : timePercentage > 80 ? '#f59e0b' : '#10b981'};">${task.timeTracking.estimatedMinutes > 0 ? `${timePercentage}%` : '—'}</p>
                    </div>
                </div>
                ${task.timeTracking.estimatedMinutes > 0 ? `
                <div style="margin-top: 20px;">
                    <div style="background: #e2e8f0; border-radius: 10px; height: 10px; overflow: hidden;">
                        <div style="background: ${timePercentage > 100 ? '#dc2626' : timePercentage > 80 ? '#f59e0b' : '#10b981'}; width: ${Math.min(100, timePercentage)}%; height: 100%; border-radius: 10px;"></div>
                    </div>
                </div>
                ` : ''}
            </div>
        ` : ''

        // QR Code URL
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`TASK:${task.id.slice(-8).toUpperCase()}`)}&bgcolor=ffffff`

        // Firm address
        const firmAddress = companySettings?.address || ''

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
                        background: #64748b;
                        padding: 20px;
                        font-size: 12px;
                        line-height: 1.5;
                        color: #1e293b;
                    }
                    @media print {
                        body { background: white; padding: 0; }
                        .container { box-shadow: none !important; }
                        @page { margin: 10mm; size: A4; }
                        .print-colors { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                    .container {
                        max-width: 210mm;
                        margin: 0 auto;
                        background: white;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- PROFESSIONAL HEADER -->
                    <div class="print-colors" style="background: #0f172a; padding: 20px 28px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <!-- Company Info -->
                            <div style="display: flex; align-items: center; gap: 16px;">
                                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; max-width: 140px; object-fit: contain;" />` : `<div style="width: 50px; height: 50px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid rgba(255,255,255,0.2);">⚖️</div>`}
                                <div>
                                    <h1 style="margin: 0; font-size: 18px; font-weight: 700;">${companySettings?.name || 'مكتب المحاماة'}</h1>
                                    ${companySettings?.licenseNumber ? `<p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.8;">رخصة رقم: ${companySettings.licenseNumber}</p>` : ''}
                                    ${firmAddress ? `<p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.7;">${firmAddress}</p>` : ''}
                                </div>
                            </div>
                            <!-- QR Code -->
                            <div style="text-align: center;">
                                <img src="${qrCodeUrl}" alt="QR Code" style="width: 70px; height: 70px; border-radius: 8px; border: 2px solid rgba(255,255,255,0.2); background: white;" />
                                <p style="margin: 6px 0 0 0; font-size: 10px; opacity: 0.8;">${gregorianDate}</p>
                            </div>
                        </div>
                    </div>

                    <!-- MAIN CONTENT -->
                    <div style="padding: 24px 28px;">

                        <!-- TASK HEADER WITH PROGRESS -->
                        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
                            <!-- Badges Row -->
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
                                <span class="print-colors" style="font-size: 11px; color: #374151; font-weight: 600; background: #f3f4f6; padding: 4px 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${taskTypeLabels[task.taskType] || task.taskType}</span>
                                <span class="print-colors" style="font-size: 11px; color: ${task.priority === 'critical' || task.priority === 'urgent' ? '#991b1b' : task.priority === 'high' ? '#92400e' : '#374151'}; font-weight: 600; background: ${task.priority === 'critical' || task.priority === 'urgent' ? '#fef2f2' : task.priority === 'high' ? '#fffbeb' : '#f3f4f6'}; padding: 4px 10px; border-radius: 4px; border: 1px solid ${task.priority === 'critical' || task.priority === 'urgent' ? '#fecaca' : task.priority === 'high' ? '#fde68a' : '#e5e7eb'};">الأولوية: ${priorityLabels[task.priority] || task.priority}</span>
                                <span class="print-colors" style="font-size: 11px; color: ${task.status === 'done' ? '#065f46' : task.status === 'in_progress' ? '#1e40af' : '#374151'}; font-weight: 600; background: ${task.status === 'done' ? '#ecfdf5' : task.status === 'in_progress' ? '#eff6ff' : '#f3f4f6'}; padding: 4px 10px; border-radius: 4px; border: 1px solid ${task.status === 'done' ? '#a7f3d0' : task.status === 'in_progress' ? '#bfdbfe' : '#e5e7eb'};">${statusLabels[task.status] || task.status}</span>
                            </div>
                            <!-- Title -->
                            <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.4;">${task.title}</h2>
                            <!-- Progress Bar -->
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="flex: 1; background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
                                    <div class="print-colors" style="background: #0f172a; width: ${task.completion}%; height: 100%; border-radius: 4px;"></div>
                                </div>
                                <span style="font-size: 13px; font-weight: 700; color: #0f172a; min-width: 45px;">${task.completion}%</span>
                            </div>
                        </div>

                        <!-- KEY INFO GRID - Professional Neutral Colors -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">تاريخ الاستحقاق</p>
                                <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${task.dueDate}</p>
                            </div>
                            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">المسؤول</p>
                                <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${task.assignee.name}</p>
                            </div>
                            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">نسبة الإنجاز</p>
                                <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${task.completion}%</p>
                            </div>
                            <div style="background: #f8fafc; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">المهام الفرعية</p>
                                <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 700; color: #0f172a;">${completedSubtasks}/${totalSubtasks}</p>
                            </div>
                        </div>

                        <!-- DESCRIPTION -->
                        ${task.description && task.description !== 'لا يوجد وصف' ? `
                        <div style="margin-bottom: 20px; background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                            <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                <span style="width: 6px; height: 6px; background: #0f172a; border-radius: 50%;"></span>
                                وصف المهمة
                            </h3>
                            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.7;">${task.description}</p>
                        </div>
                        ` : ''}

                        <!-- CASE & CLIENT - Side by Side -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                            <!-- Case Info -->
                            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                                <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: ${hasCase ? '#0f172a' : '#9ca3af'}; display: flex; align-items: center; gap: 8px;">
                                    <span style="width: 6px; height: 6px; background: ${hasCase ? '#0f172a' : '#d1d5db'}; border-radius: 50%;"></span>
                                    بيانات القضية
                                </h3>
                                ${hasCase ? `
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 11px; color: #64748b;">رقم القضية</span>
                                        <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${task.case.id}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-size: 11px; color: #64748b;">المحكمة</span>
                                        <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${task.case.court}</span>
                                    </div>
                                </div>
                                ` : `<p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center; padding: 12px 0;">لا توجد قضية مرتبطة</p>`}
                            </div>
                            <!-- Client Info -->
                            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                                <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: ${hasClient ? '#0f172a' : '#9ca3af'}; display: flex; align-items: center; gap: 8px;">
                                    <span style="width: 6px; height: 6px; background: ${hasClient ? '#0f172a' : '#d1d5db'}; border-radius: 50%;"></span>
                                    بيانات العميل
                                </h3>
                                ${hasClient ? `
                                <div style="display: flex; flex-direction: column; gap: 8px;">
                                    <div style="display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
                                        <span style="font-size: 11px; color: #64748b;">اسم العميل</span>
                                        <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${task.client.name}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span style="font-size: 11px; color: #64748b;">نوع العميل</span>
                                        <span style="font-size: 11px; font-weight: 600; color: #0f172a;">${clientTypeLabels[task.client.type] || task.client.type}</span>
                                    </div>
                                </div>
                                ` : `<p style="margin: 0; font-size: 11px; color: #9ca3af; text-align: center; padding: 12px 0;">لا يوجد عميل مرتبط</p>`}
                            </div>
                        </div>

                        <!-- SUBTASKS -->
                        ${totalSubtasks > 0 ? `
                        <div style="margin-bottom: 20px; background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <h3 style="margin: 0; font-size: 12px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                                    <span style="width: 6px; height: 6px; background: #0f172a; border-radius: 50%;"></span>
                                    المهام الفرعية
                                </h3>
                                <span class="print-colors" style="background: #0f172a; color: white; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 600;">${completedSubtasks}/${totalSubtasks}</span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                ${task.subtasks.map(subtask => `
                                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0;">
                                        <span class="print-colors" style="width: 18px; height: 18px; border-radius: 4px; background: ${subtask.completed ? '#0f172a' : '#e5e7eb'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            ${subtask.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                                        </span>
                                        <span style="font-size: 11px; color: ${subtask.completed ? '#64748b' : '#0f172a'}; text-decoration: ${subtask.completed ? 'line-through' : 'none'};">${subtask.title}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- TIME TRACKING removed from print report for single-page fit - available in task details view -->
                    </div>

                    <!-- PROFESSIONAL FOOTER -->
                    <div class="print-colors" style="background: #f8fafc; padding: 16px 28px; border-top: 2px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <img src="${qrCodeUrl}" alt="QR Code" style="width: 70px; height: 70px; border-radius: 6px; border: 1px solid #e2e8f0;" />
                                <div>
                                    <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: 600;">رقم المرجع</p>
                                    <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; letter-spacing: 1px;">${task.id.slice(-8).toUpperCase()}</p>
                                    <p style="margin: 6px 0 0 0; font-size: 9px; color: #94a3b8;">تم إنشاء التقرير: ${gregorianDate}</p>
                                </div>
                            </div>
                            <div style="text-align: left; border-right: 2px solid #e2e8f0; padding-right: 20px;">
                                <p style="margin: 0; font-size: 12px; color: #0f172a; font-weight: 700;">${companySettings?.name || 'مكتب المحاماة'}</p>
                                ${firmAddress ? `<p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b;">${firmAddress}</p>` : ''}
                                <p style="margin: 4px 0 0 0; font-size: 9px; color: #94a3b8;">&copy; ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
                            </div>
                        </div>
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
