import { useState, useMemo, useRef, useCallback } from 'react'
import {
    FileText, Calendar, CheckSquare, Clock, MoreHorizontal, Plus, Upload,
    User, Briefcase, Trash2, Edit3, Loader2, Mic,
    History, Link as LinkIcon, Send, Eye, Download, Search, Bell, AlertCircle, X,
    Timer, Play, Pause, AlertTriangle, Target, TrendingUp
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import {
    useTask, useDeleteTask, useCompleteTask, useReopenTask, useAddSubtask, useToggleSubtask,
    useAddComment, useUploadTaskAttachment, useDeleteTaskAttachment,
    useAddDependency, useRemoveDependency, useTimeTrackingDetails,
    useStartTimeTracking, useStopTimeTracking, useUpdateOutcome,
    useDocuments, useDeleteDocument
} from '@/hooks/useTasks'
import { OutcomeType, VOICE_MEMO_TYPES } from '@/services/tasksService'
import tasksService from '@/services/tasksService'
import { API_DOMAIN, API_URL } from '@/lib/api'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { VoiceMemoRecorder, VoiceMemoPlayer, isVoiceMemo } from './voice-memo-recorder'
import { DocumentEditorDialog } from './document-editor-dialog'
import { AttachmentVersionsDialog } from './attachment-versions-dialog'
import type { Attachment } from '@/services/tasksService'
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
import { ProductivityHero } from '@/components/productivity-hero'
import { TasksSidebar } from './tasks-sidebar'

export function TaskDetailsView() {
    const { taskId } = useParams({ strict: false }) as { taskId: string }
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showRemoveDependencyConfirm, setShowRemoveDependencyConfirm] = useState(false)
    const [showDeleteDocumentConfirm, setShowDeleteDocumentConfirm] = useState(false)
    const [showDeleteAttachmentConfirm, setShowDeleteAttachmentConfirm] = useState(false)
    const [dependencyToRemove, setDependencyToRemove] = useState<string | null>(null)
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null)

    // Subtask state
    const [isAddingSubtask, setIsAddingSubtask] = useState(false)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

    // Comment state
    const [newComment, setNewComment] = useState('')

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Document editor state
    const [isDocumentEditorOpen, setIsDocumentEditorOpen] = useState(false)
    const [editingDocumentId, setEditingDocumentId] = useState<string | undefined>(undefined)

    // Attachment versions dialog state
    const [versionsAttachment, setVersionsAttachment] = useState<Attachment | null>(null)

    // Fetch task data
    const { data: taskData, isLoading, isError, error, refetch } = useTask(taskId)

    // Force refresh task data - removes stale cache and refetches
    const forceRefreshTask = useCallback(async () => {
        // Remove the query from cache to ensure fresh data
        await queryClient.removeQueries({ queryKey: ['tasks', taskId] })
        // Refetch the task data
        await queryClient.refetchQueries({ queryKey: ['tasks', taskId] })
    }, [queryClient, taskId])

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

    // TipTap Documents
    const { data: documentsData, refetch: refetchDocuments, isLoading: isLoadingDocuments } = useDocuments(taskId)
    const deleteDocumentMutation = useDeleteDocument()

    // Debug Render
    console.log(`[${new Date().toISOString()}] 🖼️ TaskDetailsView Render. Documents count:`, documentsData?.documents?.length)

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
    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return
        addSubtaskMutation.mutate(
            { taskId, subtask: { title: newSubtaskTitle.trim(), completed: false } },
            {
                onSuccess: async () => {
                    setNewSubtaskTitle('')
                    setIsAddingSubtask(false)
                }
            }
        )
    }

    const handleToggleSubtask = (subtaskId: string) => {
        toggleSubtaskMutation.mutate(
            { taskId, subtaskId },
            {
                onSuccess: async () => {
                    // Cache update handled by hook
                }
            }
        )
    }

    // Comment handler
    const handleAddComment = () => {
        if (!newComment.trim()) return
        addCommentMutation.mutate(
            { taskId, text: newComment.trim() },
            {
                onSuccess: async () => {
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
                onSuccess: async () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                    }
                }
            }
        )
    }
    const handleStartTimeTracking = () => {
        startTimeTrackingMutation.mutate(taskId)
    }

    const handleStopTimeTracking = () => {
        stopTimeTrackingMutation.mutate({ taskId })
    }

    // Dependency handler
    const handleRemoveDependency = (dependencyTaskId: string) => {
        setDependencyToRemove(dependencyTaskId)
        setShowRemoveDependencyConfirm(true)
    }

    const confirmRemoveDependency = () => {
        if (dependencyToRemove) {
            removeDependencyMutation.mutate({ taskId, dependencyTaskId: dependencyToRemove }, {
                onSuccess: () => {
                    setShowRemoveDependencyConfirm(false)
                    setDependencyToRemove(null)
                }
            })
        }
    }

    const handleUpdateOutcome = (outcome: OutcomeType) => {
        updateOutcomeMutation.mutate({
            taskId,
            outcome: {
                outcome,
                outcomeDate: new Date().toISOString()
            }
        })
    }

    const getFullDocumentUrl = (url: string) => {
        if (!url) return ''
        if (url.startsWith('http')) return url
        return `${API_DOMAIN}${url}`
    }

    const handleOpenDocumentEditor = (documentId?: string) => {
        setEditingDocumentId(documentId)
        setIsDocumentEditorOpen(true)
    }

    const handleCloseDocumentEditor = () => {
        setIsDocumentEditorOpen(false)
        setEditingDocumentId(undefined)
    }

    const handleDeleteDocument = (documentId: string) => {
        setDocumentToDelete(documentId)
        setShowDeleteDocumentConfirm(true)
    }

    const confirmDeleteDocument = () => {
        if (documentToDelete) {
            deleteDocumentMutation.mutate(
                { taskId, documentId: documentToDelete },
                {
                    onSuccess: () => {
                        setShowDeleteDocumentConfirm(false)
                        setDocumentToDelete(null)
                    }
                }
            )
        }
    }

    const handlePreviewAttachment = (attachmentId: string, fileName: string, url: string, storageType?: string) => {
        const fullUrl = getFullDocumentUrl(url)
        window.open(fullUrl, '_blank')
    }

    const handleDownloadAttachment = (attachmentId: string, fileName: string, url: string, storageType?: string) => {
        const fullUrl = getFullDocumentUrl(url)
        const link = document.createElement('a')
        link.href = fullUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDeleteAttachment = (attachmentId: string) => {
        setAttachmentToDelete(attachmentId)
        setShowDeleteAttachmentConfirm(true)
    }

    const confirmDeleteAttachment = () => {
        if (attachmentToDelete) {
            deleteAttachmentMutation.mutate(
                { taskId, attachmentId: attachmentToDelete },
                {
                    onSuccess: () => {
                        setShowDeleteAttachmentConfirm(false)
                        setAttachmentToDelete(null)
                    }
                }
            )
        }
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
        const assignee = !t.assignedTo
            ? { name: 'غير محدد', role: 'محامي', avatar: '/avatars/default.png' }
            : typeof t.assignedTo === 'string'
                ? { name: t.assignedTo, role: 'محامي', avatar: '/avatars/default.png' }
                : {
                    name: ((t.assignedTo.firstName || '') + ' ' + (t.assignedTo.lastName || '')).trim() || 'غير محدد',
                    role: t.assignedTo.role || 'محامي',
                    avatar: t.assignedTo.avatar || '/avatars/default.png'
                }

        // Type narrow caseId
        const caseInfo = typeof t.caseId === 'string' || !t.caseId
            ? { id: 'غير محدد', title: 'غير محدد', court: 'غير محدد', _id: typeof t.caseId === 'string' ? t.caseId : null }
            : {
                id: t.caseId.caseNumber || 'غير محدد',
                title: t.caseId.title || 'غير محدد',
                court: t.caseId.court || 'غير محدد',
                _id: (t.caseId as any)._id || null
            }

        // Type narrow clientId
        const clientInfo = typeof t.clientId === 'string' || !t.clientId
            ? { name: 'غير محدد', type: 'فرد', phone: '', _id: typeof t.clientId === 'string' ? t.clientId : null }
            : {
                name: (t.clientId as any).fullName || (t.clientId as any).name || 'غير محدد',
                type: (t.clientId as any).type === 'company' ? 'شركة' : 'فرد',
                phone: (t.clientId as any).phone || '',
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
                fileType, // Add fileType for filtering
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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy" aria-hidden="true"></span>
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

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                            <div>
                                <Skeleton className="h-96 w-full rounded-2xl" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {isError && (
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
                )}

                {/* Empty State */}
                {!isLoading && !isError && !task && (
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
                )}

                {/* Success State */}
                {!isLoading && !isError && task && (
                    <>
                        {/* HERO CARD - Same as task list/create */}
                        <ProductivityHero badge="إدارة المهام" title={task.title} type="tasks" backUrl="/dashboard/tasks/list" />

                        {/* MAIN GRID LAYOUT - Same as task list/create */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* RIGHT COLUMN (Main Content) */}
                            <div className="lg:col-span-2 space-y-8">
                                    <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden min-h-[600px]">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="border-b border-slate-100 px-4 sm:px-6 py-4">
                                                <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 w-full sm:w-auto">
                                                    {['overview', 'files', 'comments'].map((tab) => (
                                                        <TabsTrigger
                                                            key={tab}
                                                            value={tab}
                                                            className="
                                                                inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 sm:px-4 py-2 text-sm font-medium ring-offset-white transition-all
                                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                                                                disabled:pointer-events-none disabled:opacity-50
                                                                data-[state=active]:bg-emerald-950 data-[state=active]:text-white data-[state=active]:shadow-sm
                                                                data-[state=inactive]:hover:bg-slate-200
                                                                flex-1 sm:flex-initial
                                                            "
                                                        >
                                                            {tab === 'overview' ? 'نظرة عامة' :
                                                                tab === 'files' ? 'المرفقات' : 'التعليقات'}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                            </div>

                                            <div className="p-4 sm:p-6 bg-slate-50/50 min-h-[400px] sm:min-h-[500px]">
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

                                                    {/* Subtasks Section - Moved from separate tab */}
                                                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                                                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                                                المهام الفرعية
                                                                {task.subtasks.length > 0 && (
                                                                    <Badge variant="secondary" className="mr-2 bg-slate-100 text-slate-600">
                                                                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                                                    </Badge>
                                                                )}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3">
                                                            {task.subtasks.length === 0 && !isAddingSubtask && (
                                                                <div className="text-center py-6 text-slate-400">
                                                                    <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                                    <p className="text-sm">لا توجد مهام فرعية</p>
                                                                </div>
                                                            )}
                                                            {task.subtasks.map((subtask) => (
                                                                <div key={subtask._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                                                    <div
                                                                        onClick={() => handleToggleSubtask(subtask._id)}
                                                                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${subtask.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-500'}`}
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
                                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
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
                                                                        className="h-8 bg-emerald-600 hover:bg-emerald-700"
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
                                                                    className="w-full justify-start text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                                >
                                                                    <Plus className="w-5 h-5 ml-2" /> إضافة مهمة فرعية
                                                                </Button>
                                                            )}
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
                                                                        to="/dashboard/cases/$caseId"
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
                                                                        to="/dashboard/clients/$clientId"
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
                                                                            <Badge className={`${task.outcome.outcome === 'won' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
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

                                                <TabsContent value="files" className="mt-0 space-y-6">
                                                    {/* Voice Memo Recorder Section */}
                                                    <VoiceMemoRecorder
                                                        taskId={taskId}
                                                        onUploadSuccess={() => {
                                                            // Cache update handled by hook
                                                        }}
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

                                                        {/* Create Document Card (Text Editor) */}
                                                        <div
                                                            onClick={() => handleOpenDocumentEditor()}
                                                            className="border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group h-[180px]"
                                                        >
                                                            <div className="w-12 h-12 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-500 group-hover:text-emerald-600 mb-3 transition-colors">
                                                                <Edit3 className="h-6 w-6" />
                                                            </div>
                                                            <span className="font-bold text-slate-600 group-hover:text-emerald-600">إنشاء مستند</span>
                                                            <span className="text-xs text-slate-400 mt-1">محرر نصوص متقدم</span>
                                                        </div>

                                                        {/* Empty State - Only show if no documents (excluding voice memos) */}
                                                        {task.attachments.filter(a => !a.isVoiceMemo).length === 0 && (
                                                            <div className="col-span-2 flex flex-col items-center justify-center p-8 text-slate-400">
                                                                <FileText className="w-12 h-12 mb-3 opacity-30" />
                                                                <p>لا توجد مرفقات</p>
                                                                <p className="text-xs mt-1">اضغط على رفع مستند لإضافة ملفات</p>
                                                            </div>
                                                        )}

                                                        {/* Document Cards - from API (excluding voice memos and TipTap docs) */}
                                                        {task.attachments.filter(a => !a.isVoiceMemo && a.fileType !== 'tiptap-json' && !a.name?.endsWith('.html')).map((doc) => (
                                                            <div key={doc._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                                                <div className="flex justify-between items-start">
                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border ${doc.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' :
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
                                                                            <DropdownMenuItem onClick={() => handlePreviewAttachment(doc._id, doc.name, doc.url, doc.storageType)}>
                                                                                <Eye className="h-4 w-4 ml-2" /> معاينة
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleDownloadAttachment(doc._id, doc.name, doc.url, doc.storageType)}>
                                                                                <Download className="h-4 w-4 ml-2" /> تحميل
                                                                            </DropdownMenuItem>
                                                                            {doc.storageType === 's3' && (
                                                                                <DropdownMenuItem
                                                                                    onClick={() => {
                                                                                        // Find the original attachment from taskData
                                                                                        const attachment = taskData?.attachments?.find((a: Attachment) => a._id === doc._id)
                                                                                        if (attachment) {
                                                                                            setVersionsAttachment(attachment)
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <History className="h-4 w-4 ml-2" /> سجل النسخ
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
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex-1 h-8 text-xs"
                                                                        onClick={() => handlePreviewAttachment(doc._id, doc.name, doc.url, doc.storageType)}
                                                                    >
                                                                        معاينة
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-400 hover:text-brand-blue"
                                                                        onClick={() => handleDownloadAttachment(doc._id, doc.name, doc.url, doc.storageType)}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* TipTap Documents Section */}
                                                        {documentsData?.documents && documentsData.documents.length > 0 && (
                                                            <>
                                                                <div className="col-span-full mt-4 mb-2">
                                                                    <h4 className="text-sm font-semibold text-slate-600">المستندات النصية</h4>
                                                                </div>
                                                                {documentsData.documents.map((doc) => (
                                                                    <div key={doc._id} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all group relative h-[180px] flex flex-col justify-between">
                                                                        <div className="flex justify-between items-start">
                                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                                                TXT
                                                                            </div>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 text-slate-400 hover:text-navy">
                                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end">
                                                                                    <DropdownMenuItem onClick={() => handleOpenDocumentEditor(doc._id)}>
                                                                                        <Edit3 className="h-4 w-4 ml-2" /> تحرير
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem
                                                                                        onClick={() => handleDeleteDocument(doc._id)}
                                                                                        className="text-red-600 focus:text-red-600"
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4 ml-2" /> حذف
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-bold text-navy text-sm mb-1 line-clamp-1" title={doc.title || doc.fileName}>
                                                                                {doc.title || doc.fileName?.replace('.html', '') || 'مستند'}
                                                                            </h4>
                                                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                                <span>{new Date(doc.createdAt || (doc as any).uploadedAt || (doc as any).lastEditedAt || new Date()).toLocaleDateString('ar-SA')}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="pt-3 border-t border-emerald-50 flex gap-2">
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="flex-1 h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                                                onClick={() => handleOpenDocumentEditor(doc._id)}
                                                                            >
                                                                                <Edit3 className="h-3 w-3 ml-1" />
                                                                                تحرير
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
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

                            {/* LEFT SIDEBAR - Quick Actions & Calendar */}
                            <TasksSidebar
                                context="tasks"
                                taskId={taskId}
                                isTaskCompleted={task.status === 'done'}
                                onCompleteTask={handleComplete}
                                onDeleteTask={() => setShowDeleteConfirm(true)}
                                isCompletePending={completeTaskMutation.isPending || reopenTaskMutation.isPending}
                                isDeletePending={deleteTaskMutation.isPending}
                            />
                        </div>
                    </>
                )}
            </Main>

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && task && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                            هل أنت متأكد من حذف هذه المهمة؟
                        </h3>
                        <p className="text-slate-500 text-center mb-6">
                            سيتم حذف المهمة "{task.title}" نهائياً ولا يمكن استرجاعها.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 rounded-xl"
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    handleDelete()
                                }}
                                disabled={deleteTaskMutation.isPending}
                                className="px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleteTaskMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 ml-2" />
                                )}
                                حذف المهمة
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Editor Dialog */}
            <DocumentEditorDialog
                open={isDocumentEditorOpen}
                onOpenChange={handleCloseDocumentEditor}
                taskId={taskId}
                documentId={editingDocumentId}
                onSuccess={async () => {
                    // Cache update handled by hook
                }}
            />

            {/* Attachment Versions Dialog */}
            {versionsAttachment && (
                <AttachmentVersionsDialog
                    open={!!versionsAttachment}
                    onOpenChange={(open) => !open && setVersionsAttachment(null)}
                    taskId={taskId}
                    attachment={versionsAttachment}
                />
            )}

            {/* Remove Dependency Confirmation Dialog */}
            <ConfirmDialog
                open={showRemoveDependencyConfirm}
                onOpenChange={setShowRemoveDependencyConfirm}
                title="إزالة التبعية"
                desc="هل أنت متأكد من إزالة هذه التبعية؟"
                confirmText="إزالة"
                cancelBtnText="إلغاء"
                destructive
                handleConfirm={confirmRemoveDependency}
                isLoading={removeDependencyMutation.isPending}
            />

            {/* Delete Document Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDocumentConfirm}
                onOpenChange={setShowDeleteDocumentConfirm}
                title="حذف المستند"
                desc="هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelBtnText="إلغاء"
                destructive
                handleConfirm={confirmDeleteDocument}
                isLoading={deleteDocumentMutation.isPending}
            />

            {/* Delete Attachment Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteAttachmentConfirm}
                onOpenChange={setShowDeleteAttachmentConfirm}
                title="حذف المرفق"
                desc="هل أنت متأكد من حذف هذا المرفق؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelBtnText="إلغاء"
                destructive
                handleConfirm={confirmDeleteAttachment}
                isLoading={deleteAttachmentMutation.isPending}
            />
        </>
    )
}
