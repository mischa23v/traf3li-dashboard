import { useState, useMemo, useRef } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, ArrowLeft, Briefcase, Trash2, Edit3, Loader2, Mic,
    History, Link as LinkIcon, Flag, Send, Eye, Download, Search, Bell, AlertCircle, X,
    GitBranch, Timer, Target, Play, Pause, TrendingUp, AlertTriangle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    useTask, useDeleteTask, useCompleteTask, useReopenTask, useAddSubtask, useToggleSubtask,
    useAddComment, useUploadTaskAttachment, useDeleteTaskAttachment,
    useAddDependency, useRemoveDependency, useTimeTrackingDetails,
    useStartTimeTracking, useStopTimeTracking, useUpdateOutcome
} from '@/hooks/useTasks'
import { OutcomeType, VOICE_MEMO_TYPES } from '@/services/tasksService'
import tasksService from '@/services/tasksService'
import { API_DOMAIN, API_URL } from '@/lib/api'
import { VoiceMemoRecorder, VoiceMemoPlayer, isVoiceMemo } from './voice-memo-recorder'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function TaskDetailsView() {
    const { taskId } = useParams({ strict: false }) as { taskId: string }
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Subtask state
    const [isAddingSubtask, setIsAddingSubtask] = useState(false)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

    // Comment state
    const [newComment, setNewComment] = useState('')

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch task data
    const { data: taskData, isLoading, isError, error, refetch } = useTask(taskId)

    // Mutations
    const deleteTaskMutation = useDeleteTask()
    const completeTaskMutation = useCompleteTask()
    const reopenTaskMutation = useReopenTask()
    const addSubtaskMutation = useAddSubtask()
    const toggleSubtaskMutation = useToggleSubtask()
    const addCommentMutation = useAddComment()
    const uploadAttachmentMutation = useUploadTaskAttachment()
    const deleteAttachmentMutation = useDeleteTaskAttachment()
    const addDependencyMutation = useAddDependency()
    const removeDependencyMutation = useRemoveDependency()
    const startTimeTrackingMutation = useStartTimeTracking()
    const stopTimeTrackingMutation = useStopTimeTracking()
    const updateOutcomeMutation = useUpdateOutcome()

    // Time tracking details
    const { data: timeTrackingData } = useTimeTrackingDetails(taskId)

    const handleDelete = () => {
        deleteTaskMutation.mutate(taskId, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/list' })
            }
        })
    }

    const handleComplete = () => {
        if (taskData?.status === 'done') {
            reopenTaskMutation.mutate(taskId)
        } else {
            completeTaskMutation.mutate({ id: taskId })
        }
    }

    // Subtask handlers
    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return
        addSubtaskMutation.mutate(
            { taskId, subtask: { title: newSubtaskTitle.trim(), completed: false } },
            {
                onSuccess: () => {
                    setNewSubtaskTitle('')
                    setIsAddingSubtask(false)
                }
            }
        )
    }

    const handleToggleSubtask = (subtaskId: string) => {
        toggleSubtaskMutation.mutate({ taskId, subtaskId })
    }

    // Comment handler
    const handleAddComment = () => {
        if (!newComment.trim()) return
        addCommentMutation.mutate(
            { taskId, text: newComment.trim() },
            {
                onSuccess: () => {
                    setNewComment('')
                }
            }
        )
    }

    // File upload handler
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        uploadAttachmentMutation.mutate(
            { id: taskId, file },
            {
                onSuccess: () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                }
            }
        )
    }

    const handleDeleteAttachment = (attachmentId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
            deleteAttachmentMutation.mutate({ taskId, attachmentId })
        }
    }

    // Helper to get full document URL (handles relative paths)
    const getFullDocumentUrl = (url: string | undefined): string => {
        if (!url) return ''
        // If already a full URL, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url
        }
        // If relative path starting with /, prepend API domain
        if (url.startsWith('/')) {
            return `${API_DOMAIN}${url}`
        }
        // Otherwise assume it needs full API URL
        return `${API_URL}/${url}`
    }

    // Time tracking handlers
    const handleStartTimeTracking = () => {
        startTimeTrackingMutation.mutate(taskId)
    }

    const handleStopTimeTracking = () => {
        stopTimeTrackingMutation.mutate({ taskId })
    }

    // Dependency handler
    const handleRemoveDependency = (dependencyTaskId: string) => {
        if (confirm('هل أنت متأكد من إزالة هذه التبعية؟')) {
            removeDependencyMutation.mutate({ taskId, dependencyTaskId })
        }
    }

    // Outcome handler
    const handleUpdateOutcome = (outcome: OutcomeType) => {
        updateOutcomeMutation.mutate({
            taskId,
            outcome: {
                outcome,
                outcomeDate: new Date().toISOString()
            }
        })
    }

    // Check if time tracking is active
    const isTimeTrackingActive = useMemo(() => {
        if (!taskData?.timeTracking?.sessions) return false
        const sessions = taskData.timeTracking.sessions
        return sessions.some((s: any) => s.startedAt && !s.endedAt)
    }, [taskData])

    // Transform API data
    const task = useMemo(() => {
        if (!taskData) return null
        const t = taskData

        // Calculate completion percentage
        const subtasks = t.subtasks || []
        const completedSubtasks = subtasks.filter((st: any) => st.completed).length
        const completion = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0

        // Type narrow assignedTo
        const assignee = typeof t.assignedTo === 'string'
            ? { name: t.assignedTo, role: 'محامي', avatar: '/avatars/default.png' }
            : {
                name: (t.assignedTo.firstName || '') + ' ' + (t.assignedTo.lastName || '') || 'غير محدد',
                role: t.assignedTo.role || 'محامي',
                avatar: t.assignedTo.avatar || '/avatars/default.png'
            }

        // Type narrow caseId
        const caseInfo = typeof t.caseId === 'string' || !t.caseId
            ? { id: 'N/A', title: 'غير محدد', court: 'غير محدد', _id: typeof t.caseId === 'string' ? t.caseId : null }
            : {
                id: t.caseId.caseNumber || 'N/A',
                title: t.caseId.title || 'غير محدد',
                court: t.caseId.court || 'غير محدد',
                _id: (t.caseId as any)._id || null
            }

        // Type narrow clientId
        const clientInfo = typeof t.clientId === 'string' || !t.clientId
            ? { name: 'غير محدد', type: 'فرد', phone: '', _id: typeof t.clientId === 'string' ? t.clientId : null }
            : {
                name: t.clientId.firstName && t.clientId.lastName
                    ? `${t.clientId.firstName} ${t.clientId.lastName}`
                    : t.clientId.name || 'غير محدد',
                type: t.clientId.type === 'individual' ? 'فرد' : t.clientId.type === 'company' ? 'شركة' : 'فرد',
                phone: t.clientId.phone || '',
                _id: (t.clientId as any)._id || null
            }

        // Type narrow assignedTo for linking
        const assigneeId = typeof t.assignedTo === 'string' ? t.assignedTo : (t.assignedTo as any)?._id || null

        // Map subtasks with proper IDs
        const mappedSubtasks = subtasks.map((st: any, idx: number) => ({
            _id: st._id || `subtask-${idx}`,
            id: idx + 1,
            title: st.title || st.description || 'مهمة فرعية',
            completed: st.completed || st.status === 'completed'
        }))

        // Map comments to display format
        const mappedComments = (t.comments || []).map((c: any) => ({
            id: c._id || c.id,
            user: c.userName || c.user || 'مستخدم',
            avatar: c.userAvatar?.charAt(0) || c.userName?.charAt(0) || 'م',
            text: c.text || c.content || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : ''
        }))

        // Map attachments with voice memo detection and S3 URL handling
        const mappedAttachments = (t.attachments || []).map((a: any) => {
            const fileType = a.fileType || ''
            const isAudioFile = isVoiceMemo(fileType)

            // Determine file type label
            let typeLabel = 'FILE'
            if (fileType.includes('pdf')) typeLabel = 'PDF'
            else if (fileType.includes('word') || a.fileName?.includes('.doc')) typeLabel = 'DOC'
            else if (fileType.includes('excel') || fileType.includes('spreadsheet')) typeLabel = 'XLS'
            else if (fileType.includes('image')) typeLabel = 'IMG'
            else if (isAudioFile) typeLabel = 'AUDIO'

            // Get URL - use downloadUrl for S3, fallback to fileUrl
            const url = a.storageType === 's3' && a.downloadUrl
                ? a.downloadUrl
                : a.fileUrl || a.url

            return {
                _id: a._id || a.id,
                name: a.fileName || a.name || 'ملف',
                type: typeLabel,
                size: a.fileSize ? (a.fileSize / 1024 > 1024
                    ? `${(a.fileSize / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(a.fileSize / 1024)} KB`) : '',
                date: a.uploadedAt ? new Date(a.uploadedAt).toLocaleDateString('ar-SA') : '',
                url,
                isVoiceMemo: isAudioFile,
                storageType: a.storageType || 'local',
                fileKey: a.fileKey
            }
        })

        // Map history/timeline with proper action labels
        const actionLabels: Record<string, string> = {
            'created': 'تم إنشاء المهمة',
            'updated': 'تم تحديث المهمة',
            'status_changed': 'تم تغيير الحالة',
            'assigned': 'تم تعيين المهمة',
            'completed': 'تم إكمال المهمة',
            'reopened': 'تم إعادة فتح المهمة',
            'commented': 'تم إضافة تعليق',
            'attachment_added': 'تم إضافة مرفق'
        }

        const mappedTimeline = (t.history || []).map((h: any, idx: number) => ({
            id: h._id || `history-${idx}`,
            title: h.details || actionLabels[h.action] || h.action || 'نشاط',
            date: h.timestamp ? new Date(h.timestamp).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '',
            status: h.action === 'completed' ? 'completed' :
                    h.action === 'created' ? 'completed' : 'upcoming',
            user: h.userName || ''
        }))

        // Map dependencies
        const dependencies = t.dependencies || { blockedBy: [], blocks: [] }
        const mappedDependencies = {
            blockedBy: (dependencies.blockedBy || []).map((d: any) => ({
                taskId: d.taskId,
                taskTitle: d.taskTitle || 'مهمة',
                status: d.status || 'todo'
            })),
            blocks: (dependencies.blocks || []).map((d: any) => ({
                taskId: d.taskId,
                taskTitle: d.taskTitle || 'مهمة',
                status: d.status || 'todo'
            }))
        }

        // Map outcome
        const outcomeLabels: Record<string, string> = {
            'won': 'فوز',
            'lost': 'خسارة',
            'settled': 'تسوية',
            'dismissed': 'رفض',
            'withdrawn': 'سحب',
            'ongoing': 'جارية',
            'not_applicable': 'غير قابل للتطبيق'
        }
        const mappedOutcome = t.outcome ? {
            outcome: t.outcome.outcome,
            outcomeLabel: outcomeLabels[t.outcome.outcome] || t.outcome.outcome,
            outcomeDate: t.outcome.outcomeDate ? new Date(t.outcome.outcomeDate).toLocaleDateString('ar-SA') : undefined,
            outcomeNotes: t.outcome.outcomeNotes,
            settlementAmount: t.outcome.settlementAmount
        } : null

        // Time tracking info
        const timeTrackingInfo = t.timeTracking ? {
            estimatedMinutes: t.timeTracking.estimatedMinutes || t.estimatedMinutes || 0,
            actualMinutes: t.timeTracking.actualMinutes || t.actualMinutes || 0,
            sessions: t.timeTracking.sessions || []
        } : {
            estimatedMinutes: t.estimatedMinutes || 0,
            actualMinutes: t.actualMinutes || 0,
            sessions: []
        }

        return {
            id: t._id,
            title: t.title || t.description || 'مهمة غير محددة',
            description: t.description || 'لا يوجد وصف',
            status: t.status || 'pending',
            priority: t.priority || 'medium',
            taskType: t.taskType || 'other',
            dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString('ar-SA') : 'غير محدد',
            completion,
            assignee,
            assigneeId,
            client: clientInfo,
            case: caseInfo,
            subtasks: mappedSubtasks,
            comments: mappedComments,
            attachments: mappedAttachments,
            timeline: mappedTimeline,
            dependencies: mappedDependencies,
            outcome: mappedOutcome,
            timeTracking: timeTrackingInfo
        }
    }, [taskData])

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
    ]

    return (
        <>
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

                {/* Breadcrumb / Back Link */}
                <div className="max-w-[1600px] mx-auto mb-6">
                    <Link to="/dashboard/tasks/list" className="inline-flex items-center text-slate-500 hover:text-navy transition-colors">
                        <ArrowLeft className="h-4 w-4 ml-2" />
                        العودة إلى قائمة المهام
                    </Link>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-8">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div className="col-span-12 lg:col-span-4">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المهمة</h3>
                            <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                            <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && !task && (
                    <div className="max-w-[1600px] mx-auto">
                        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">المهمة غير موجودة</h3>
                            <p className="text-slate-500 mb-4">لم يتم العثور على المهمة المطلوبة</p>
                            <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                <Link to="/dashboard/tasks/list">
                                    العودة إلى القائمة
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {!isLoading && !isError && task && (
                    <>
                        {/* Task Hero Content */}
                        <div className="max-w-[1600px] mx-auto bg-emerald-950 rounded-3xl p-8 shadow-xl shadow-emerald-900/20 mb-8 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
                        {/* Abstract Shapes */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between text-white">
                        {/* Main Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 text-emerald-400">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <span className="text-emerald-100 font-medium">{task.case.title}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-slate-300">{task.case.id}</span>
                                <Badge variant="outline" className="mr-2 border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                    {task.id}
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-white">
                                {task.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-emerald-400" />
                                    <span>العميل: <span className="text-white font-medium">{task.client.name}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    <span>تاريخ الاستحقاق: <span className="text-white font-medium">{task.dueDate}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Flag className="h-4 w-4 text-rose-400" />
                                    <span className="text-rose-200 font-bold">الأولوية: {task.priority === 'high' ? 'عالية جداً' : 'عادية'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="flex flex-col gap-4 min-w-[250px]">
                            <div className="flex gap-3">
                                <Link to="/dashboard/tasks/create" search={{ editId: taskId }}>
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                        <Edit3 className="h-4 w-4 ml-2" />
                                        تعديل
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleComplete}
                                    disabled={completeTaskMutation.isPending || reopenTaskMutation.isPending}
                                    className={`flex-1 ${task.status === 'done' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white shadow-lg border-0`}
                                >
                                    {(completeTaskMutation.isPending || reopenTaskMutation.isPending) ? (
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    ) : (
                                        <CheckSquare className="h-4 w-4 ml-2" />
                                    )}
                                    {task.status === 'done' ? 'إعادة فتح' : 'إكمال المهمة'}
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                    <LinkIcon className="h-4 w-4 ml-2" />
                                    نسخ الرابط
                                </Button>
                                {!showDeleteConfirm ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 backdrop-blur-sm"
                                    >
                                        <Trash2 className="h-4 w-4 ml-2" />
                                        حذف
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="border-white/10 text-white hover:bg-white/10"
                                        >
                                            إلغاء
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDelete}
                                            disabled={deleteTaskMutation.isPending}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            {deleteTaskMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'تأكيد الحذف'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-300">نسبة الإنجاز</span>
                                    <span className="text-lg font-bold text-emerald-400">{task.completion}%</span>
                                </div>
                                <Progress value={task.completion} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="max-w-[1600px] mx-auto pb-12">
                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT SIDEBAR (Timeline & Quick Actions) */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">
                            {/* Timeline Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                                <CardHeader className="bg-white border-b border-slate-50 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <History className="h-5 w-5 text-brand-blue" />
                                        الجدول الزمني
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[300px]">
                                        <div className="relative p-6">
                                            {task.timeline.length === 0 ? (
                                                <div className="text-center py-8 text-slate-400">
                                                    <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                                    <p className="text-sm">لا يوجد سجل نشاطات</p>
                                                    <p className="text-xs mt-1">سيظهر السجل هنا عند إجراء تغييرات</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Vertical Line */}
                                                    <div className="absolute top-6 bottom-6 right-[29px] w-0.5 bg-slate-100"></div>

                                                    <div className="space-y-8 relative">
                                                        {task.timeline.map((event, i) => (
                                                            <div key={event.id || i} className="flex gap-4 relative">
                                                                <div className={`
                                                                    w-3 h-3 rounded-full mt-1.5 z-10 ring-4 ring-white
                                                                    ${event.status === 'completed' ? 'bg-emerald-500' :
                                                                        event.status === 'upcoming' ? 'bg-amber-500' : 'bg-slate-300'}
                                                                `}></div>
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-bold text-navy">{event.title}</div>
                                                                    <div className="text-xs text-slate-500 mb-1">
                                                                        {event.date}
                                                                        {event.user && <span className="mr-2">• {event.user}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Assignee Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy">فريق العمل</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Avatar className="h-10 w-10 border border-slate-200">
                                            <AvatarImage src={task.assignee.avatar} />
                                            <AvatarFallback className="bg-brand-blue text-white">AS</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-bold text-navy">{task.assignee.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{task.assignee.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time Tracking Card */}
                            <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-emerald-600" />
                                        تتبع الوقت
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Time Progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">الوقت المقدر</span>
                                            <span className="font-medium text-slate-900">
                                                {task.timeTracking.estimatedMinutes > 0
                                                    ? `${Math.floor(task.timeTracking.estimatedMinutes / 60)} ساعة ${task.timeTracking.estimatedMinutes % 60} دقيقة`
                                                    : 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">الوقت الفعلي</span>
                                            <span className={`font-medium ${
                                                task.timeTracking.estimatedMinutes > 0 && task.timeTracking.actualMinutes > task.timeTracking.estimatedMinutes
                                                    ? 'text-red-600'
                                                    : 'text-emerald-600'
                                            }`}>
                                                {task.timeTracking.actualMinutes > 0
                                                    ? `${Math.floor(task.timeTracking.actualMinutes / 60)} ساعة ${task.timeTracking.actualMinutes % 60} دقيقة`
                                                    : '0 دقيقة'}
                                            </span>
                                        </div>
                                        {task.timeTracking.estimatedMinutes > 0 && (
                                            <Progress
                                                value={Math.min((task.timeTracking.actualMinutes / task.timeTracking.estimatedMinutes) * 100, 100)}
                                                className="h-2 bg-slate-100"
                                                indicatorClassName={
                                                    task.timeTracking.actualMinutes > task.timeTracking.estimatedMinutes
                                                        ? 'bg-red-500'
                                                        : 'bg-emerald-500'
                                                }
                                            />
                                        )}
                                        {task.timeTracking.estimatedMinutes > 0 && task.timeTracking.actualMinutes > task.timeTracking.estimatedMinutes && (
                                            <div className="flex items-center gap-1 text-xs text-red-600">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>تجاوز الوقت المقدر!</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Tracking Button */}
                                    {task.status !== 'done' && task.status !== 'canceled' && (
                                        <Button
                                            onClick={isTimeTrackingActive ? handleStopTimeTracking : handleStartTimeTracking}
                                            disabled={startTimeTrackingMutation.isPending || stopTimeTrackingMutation.isPending}
                                            className={`w-full ${isTimeTrackingActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                        >
                                            {(startTimeTrackingMutation.isPending || stopTimeTrackingMutation.isPending) ? (
                                                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                            ) : isTimeTrackingActive ? (
                                                <Pause className="h-4 w-4 ml-2" />
                                            ) : (
                                                <Play className="h-4 w-4 ml-2" />
                                            )}
                                            {isTimeTrackingActive ? 'إيقاف التتبع' : 'بدء التتبع'}
                                        </Button>
                                    )}

                                    {/* Budget info if available */}
                                    {timeTrackingData && timeTrackingData.budgetAmount && (
                                        <div className="pt-3 border-t border-slate-100">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">الميزانية</span>
                                                <span className="font-medium text-slate-900">
                                                    {timeTrackingData.budgetAmount.toLocaleString('ar-SA')} ر.س
                                                </span>
                                            </div>
                                            {timeTrackingData.budgetUsed !== undefined && (
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-slate-500">المستخدم</span>
                                                    <span className={`font-medium ${timeTrackingData.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        {timeTrackingData.budgetUsed.toLocaleString('ar-SA')} ر.س
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dependencies Card */}
                            {(task.dependencies.blockedBy.length > 0 || task.dependencies.blocks.length > 0) && (
                                <Card className="border border-slate-100 shadow-sm rounded-2xl">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                            <GitBranch className="h-4 w-4 text-purple-600" />
                                            التبعيات
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Blocked By */}
                                        {task.dependencies.blockedBy.length > 0 && (
                                            <div>
                                                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                    محظور بواسطة
                                                </div>
                                                <div className="space-y-2">
                                                    {task.dependencies.blockedBy.map((dep) => (
                                                        <div key={dep.taskId} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-100">
                                                            <Link
                                                                to="/tasks/$taskId"
                                                                params={{ taskId: dep.taskId }}
                                                                className="text-sm text-amber-800 hover:text-amber-900 font-medium truncate flex-1"
                                                            >
                                                                {dep.taskTitle}
                                                            </Link>
                                                            <Badge variant="outline" className={`text-xs mr-2 ${
                                                                dep.status === 'done' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                                                                dep.status === 'in_progress' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                                                'border-slate-300 text-slate-600'
                                                            }`}>
                                                                {dep.status === 'done' ? 'مكتمل' :
                                                                 dep.status === 'in_progress' ? 'قيد التنفيذ' :
                                                                 dep.status === 'todo' ? 'للتنفيذ' : dep.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Blocks */}
                                        {task.dependencies.blocks.length > 0 && (
                                            <div>
                                                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                                                    <Target className="h-3 w-3 text-blue-500" />
                                                    يحظر
                                                </div>
                                                <div className="space-y-2">
                                                    {task.dependencies.blocks.map((dep) => (
                                                        <div key={dep.taskId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                                            <Link
                                                                to="/tasks/$taskId"
                                                                params={{ taskId: dep.taskId }}
                                                                className="text-sm text-blue-800 hover:text-blue-900 font-medium truncate flex-1"
                                                            >
                                                                {dep.taskTitle}
                                                            </Link>
                                                            <Badge variant="outline" className={`text-xs mr-2 ${
                                                                dep.status === 'done' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                                                                dep.status === 'in_progress' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                                                'border-slate-300 text-slate-600'
                                                            }`}>
                                                                {dep.status === 'done' ? 'مكتمل' :
                                                                 dep.status === 'in_progress' ? 'قيد التنفيذ' :
                                                                 dep.status === 'todo' ? 'للتنفيذ' : dep.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* CENTER CONTENT (Tabs & Details) */}
                        <div className="col-span-12 lg:col-span-9">
                            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="border-b border-slate-100 px-6 pt-4">
                                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                                            {['overview', 'subtasks', 'files', 'comments'].map((tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    className="
                                                        data-[state=active]:bg-transparent data-[state=active]:shadow-none 
                                                        data-[state=active]:border-b-2 data-[state=active]:border-brand-blue 
                                                        data-[state=active]:text-brand-blue
                                                        text-slate-500 font-medium text-base pb-4 rounded-none px-2
                                                    "
                                                >
                                                    {tab === 'overview' ? 'نظرة عامة' :
                                                        tab === 'subtasks' ? 'المهام الفرعية' :
                                                            tab === 'files' ? 'المرفقات' : 'التعليقات'}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 min-h-[500px]">
                                        <TabsContent value="overview" className="mt-0 space-y-6">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="text-lg font-bold text-navy">وصف المهمة</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                                            تفاصيل القضية
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">رقم القضية</span>
                                                            <span className="font-medium text-slate-900">{task.case.id}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">المحكمة</span>
                                                            <span className="font-medium text-slate-900">{task.case.court}</span>
                                                        </div>
                                                        {task.case._id ? (
                                                            <Link
                                                                to="/cases/$caseId"
                                                                params={{ caseId: task.case._id }}
                                                                className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <LinkIcon className="h-3 w-3" />
                                                                عرض ملف القضية
                                                            </Link>
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">لا توجد قضية مرتبطة</span>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <User className="w-4 h-4 text-amber-600" />
                                                            بيانات العميل
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">الاسم</span>
                                                            <span className="font-medium text-slate-900">{task.client.name}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-500">الصفة</span>
                                                            <span className="font-medium text-slate-900">{task.client.type}</span>
                                                        </div>
                                                        {task.client._id ? (
                                                            <Link
                                                                to="/clients/$clientId"
                                                                params={{ clientId: task.client._id }}
                                                                className="text-blue-600 text-sm hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <LinkIcon className="h-3 w-3" />
                                                                عرض ملف العميل
                                                            </Link>
                                                        ) : (
                                                            <span className="text-slate-400 text-sm">لا يوجد عميل مرتبط</span>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Outcome Section - For court cases */}
                                            {(task.taskType === 'court_hearing' || task.taskType === 'appeal_deadline' || task.taskType === 'filing_deadline') && (
                                                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                            <Target className="w-4 h-4 text-purple-600" />
                                                            نتيجة المهمة
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {task.outcome ? (
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-slate-500 text-sm">النتيجة</span>
                                                                    <Badge className={`${
                                                                        task.outcome.outcome === 'won' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                        task.outcome.outcome === 'lost' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                        task.outcome.outcome === 'settled' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                                        task.outcome.outcome === 'ongoing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                                        'bg-slate-100 text-slate-800 border-slate-200'
                                                                    }`}>
                                                                        {task.outcome.outcomeLabel}
                                                                    </Badge>
                                                                </div>
                                                                {task.outcome.outcomeDate && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-500">تاريخ النتيجة</span>
                                                                        <span className="font-medium text-slate-900">{task.outcome.outcomeDate}</span>
                                                                    </div>
                                                                )}
                                                                {task.outcome.settlementAmount && (
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-slate-500">مبلغ التسوية</span>
                                                                        <span className="font-medium text-emerald-600">
                                                                            {task.outcome.settlementAmount.toLocaleString('ar-SA')} ر.س
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {task.outcome.outcomeNotes && (
                                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                                        <span className="text-slate-500 text-xs block mb-1">ملاحظات</span>
                                                                        <p className="text-sm text-slate-700">{task.outcome.outcomeNotes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <p className="text-slate-500 text-sm">لم يتم تحديد نتيجة بعد</p>
                                                                {task.status === 'done' && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleUpdateOutcome('won')}
                                                                            disabled={updateOutcomeMutation.isPending}
                                                                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                                        >
                                                                            <TrendingUp className="h-3 w-3 ml-1" />
                                                                            فوز
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleUpdateOutcome('lost')}
                                                                            disabled={updateOutcomeMutation.isPending}
                                                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                                                        >
                                                                            خسارة
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleUpdateOutcome('settled')}
                                                                            disabled={updateOutcomeMutation.isPending}
                                                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                                        >
                                                                            تسوية
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleUpdateOutcome('dismissed')}
                                                                            disabled={updateOutcomeMutation.isPending}
                                                                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                                                                        >
                                                                            رفض
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="subtasks" className="mt-0">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardContent className="p-6 space-y-4">
                                                    {task.subtasks.length === 0 && !isAddingSubtask && (
                                                        <div className="text-center py-8 text-slate-400">
                                                            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                            <p>لا توجد مهام فرعية</p>
                                                        </div>
                                                    )}
                                                    {task.subtasks.map((subtask) => (
                                                        <div key={subtask._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                            <div
                                                                onClick={() => handleToggleSubtask(subtask._id)}
                                                                className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${subtask.completed ? 'bg-brand-blue border-brand-blue text-white' : 'border-slate-300 hover:border-brand-blue'}`}
                                                            >
                                                                {subtask.completed && <CheckSquare className="w-3 h-3" />}
                                                                {toggleSubtaskMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                                            </div>
                                                            <span className={`flex-1 font-medium ${subtask.completed ? 'text-slate-400 line-through' : 'text-navy'}`}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>
                                                    ))}

                                                    {/* Add Subtask Form */}
                                                    {isAddingSubtask ? (
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                                            <div className="w-5 h-5 rounded-md border border-slate-300"></div>
                                                            <Input
                                                                autoFocus
                                                                value={newSubtaskTitle}
                                                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleAddSubtask()
                                                                    if (e.key === 'Escape') {
                                                                        setIsAddingSubtask(false)
                                                                        setNewSubtaskTitle('')
                                                                    }
                                                                }}
                                                                placeholder="عنوان المهمة الفرعية..."
                                                                className="flex-1 h-8 border-0 bg-transparent focus-visible:ring-0 text-navy"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={handleAddSubtask}
                                                                disabled={!newSubtaskTitle.trim() || addSubtaskMutation.isPending}
                                                                className="h-8 bg-brand-blue hover:bg-blue-600"
                                                            >
                                                                {addSubtaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setIsAddingSubtask(false)
                                                                    setNewSubtaskTitle('')
                                                                }}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => setIsAddingSubtask(true)}
                                                            className="w-full justify-start text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded-xl"
                                                        >
                                                            <Plus className="w-5 h-5 ml-2" /> إضافة مهمة فرعية
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="files" className="mt-0 space-y-6">
                                            {/* Voice Memo Recorder Section */}
                                            <VoiceMemoRecorder
                                                taskId={taskId}
                                                onUploadSuccess={() => refetch()}
                                            />

                                            {/* Voice Memos List */}
                                            {task.attachments.filter(a => a.isVoiceMemo).length > 0 && (
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                        <Mic className="h-4 w-4" />
                                                        التسجيلات الصوتية ({task.attachments.filter(a => a.isVoiceMemo).length})
                                                    </h4>
                                                    {task.attachments.filter(a => a.isVoiceMemo).map((memo) => (
                                                        <div key={memo._id} className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <VoiceMemoPlayer
                                                                    audioUrl={getFullDocumentUrl(memo.url)}
                                                                    fileName={memo.name}
                                                                />
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteAttachment(memo._id)}
                                                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Documents Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.webm,.mp3,.wav,.ogg,.m4a"
                                                    className="hidden"
                                                />

                                                {/* Upload New Card */}
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-all group h-[180px]"
                                                >
                                                    {uploadAttachmentMutation.isPending ? (
                                                        <>
                                                            <Loader2 className="h-8 w-8 animate-spin text-brand-blue mb-3" />
                                                            <span className="font-bold text-brand-blue">جاري الرفع...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-brand-blue mb-3 transition-colors">
                                                                <Upload className="h-6 w-6" />
                                                            </div>
                                                            <span className="font-bold text-slate-600 group-hover:text-brand-blue">رفع مستند جديد</span>
                                                            <span className="text-xs text-slate-400 mt-1">PDF, DOCX, Excel, صور</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Empty State - Only show if no documents (excluding voice memos) */}
                                                {task.attachments.filter(a => !a.isVoiceMemo).length === 0 && (
                                                    <div className="col-span-2 flex flex-col items-center justify-center p-8 text-slate-400">
                                                        <FileText className="w-12 h-12 mb-3 opacity-30" />
                                                        <p>لا توجد مرفقات</p>
                                                        <p className="text-xs mt-1">اضغط على رفع مستند لإضافة ملفات</p>
                                                    </div>
                                                )}

                                                {/* Document Cards - from API (excluding voice memos) */}
                                                {task.attachments.filter(a => !a.isVoiceMemo).map((doc) => (
                                                    <div key={doc._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${
                                                                doc.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                doc.type === 'DOC' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                doc.type === 'XLS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                doc.type === 'IMG' ? 'bg-green-50 text-green-600 border-green-100' :
                                                                'bg-slate-50 text-slate-500 border-slate-100'
                                                            }`}>
                                                                {doc.type}
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {doc.url && (
                                                                        <DropdownMenuItem onClick={() => window.open(getFullDocumentUrl(doc.url), '_blank')}>
                                                                            <Eye className="h-4 w-4 ml-2" /> معاينة
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {doc.url && (
                                                                        <DropdownMenuItem onClick={() => {
                                                                            const a = document.createElement('a')
                                                                            a.href = getFullDocumentUrl(doc.url)
                                                                            a.download = doc.name
                                                                            a.click()
                                                                        }}>
                                                                            <Download className="h-4 w-4 ml-2" /> تحميل
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDeleteAttachment(doc._id)}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 ml-2" /> حذف
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-navy text-sm mb-1 line-clamp-1" title={doc.name}>{doc.name}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                {doc.size && <span>{doc.size}</span>}
                                                                {doc.size && doc.date && <span>•</span>}
                                                                {doc.date && <span>{doc.date}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="pt-3 border-t border-slate-50 flex gap-2">
                                                            {doc.url && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 h-8 text-xs"
                                                                    onClick={() => window.open(getFullDocumentUrl(doc.url), '_blank')}
                                                                >
                                                                    معاينة
                                                                </Button>
                                                            )}
                                                            {doc.url && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 hover:text-brand-blue"
                                                                    onClick={() => {
                                                                        const a = document.createElement('a')
                                                                        a.href = getFullDocumentUrl(doc.url)
                                                                        a.download = doc.name
                                                                        a.click()
                                                                    }}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="comments" className="mt-0">
                                            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="space-y-6 mb-6">
                                                        {task.comments.length === 0 && (
                                                            <div className="text-center py-8 text-slate-400">
                                                                <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                                <p>لا توجد تعليقات</p>
                                                                <p className="text-xs mt-1">كن أول من يعلق على هذه المهمة</p>
                                                            </div>
                                                        )}
                                                        {task.comments.map((comment) => (
                                                            <div key={comment.id} className="flex gap-4">
                                                                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-700">{comment.avatar}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl rounded-tr-none">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-bold text-sm text-navy">{comment.user}</span>
                                                                        <span className="text-xs text-slate-400">{comment.time}</span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600">{comment.text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarFallback className="bg-navy text-white">أنا</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 relative">
                                                            <Textarea
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault()
                                                                        handleAddComment()
                                                                    }
                                                                }}
                                                                placeholder="اكتب تعليقاً..."
                                                                className="min-h-[80px] rounded-xl resize-none pr-12 bg-slate-50 border-slate-200 focus:border-brand-blue"
                                                            />
                                                            <Button
                                                                size="icon"
                                                                onClick={handleAddComment}
                                                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                                                className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
                                                            >
                                                                {addCommentMutation.isPending ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Send className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </Card>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </Main>
        </>
    )
}
