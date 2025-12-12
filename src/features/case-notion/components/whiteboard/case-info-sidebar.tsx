/**
 * CaseInfoSidebar - Left sidebar showing case information for whiteboard view
 * Features:
 * - Case summary
 * - Upcoming events
 * - Tasks
 * - Hearings
 * - Documents
 * - Drag items to create linked blocks
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  CheckSquare,
  Scale,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  User,
  AlertCircle,
  Briefcase,
  Users,
  Hash,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface CaseInfo {
  _id: string
  caseNumber?: string
  title: string
  titleAr?: string
  status?: string
  client?: {
    _id: string
    name: string
    nameAr?: string
  }
  opposingParty?: string
}

interface Event {
  _id: string
  title: string
  titleAr?: string
  date: string
  type?: string
  status?: string
}

interface Task {
  _id: string
  title: string
  titleAr?: string
  dueDate?: string
  priority?: string
  status?: string
  assignee?: string
}

interface Hearing {
  _id: string
  title: string
  titleAr?: string
  date: string
  court?: string
  status?: string
}

interface Document {
  _id: string
  title: string
  titleAr?: string
  type?: string
  createdAt?: string
}

interface CaseInfoSidebarProps {
  caseInfo?: CaseInfo
  events?: Event[]
  tasks?: Task[]
  hearings?: Hearing[]
  documents?: Document[]
  isLoading?: boolean
  onCreateBlockFromEvent?: (event: Event) => void
  onCreateBlockFromTask?: (task: Task) => void
  onCreateBlockFromHearing?: (hearing: Hearing) => void
  onCreateBlockFromDocument?: (document: Document) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function CaseInfoSidebar({
  caseInfo,
  events = [],
  tasks = [],
  hearings = [],
  documents = [],
  isLoading,
  onCreateBlockFromEvent,
  onCreateBlockFromTask,
  onCreateBlockFromHearing,
  onCreateBlockFromDocument,
  collapsed,
  onToggleCollapse,
}: CaseInfoSidebarProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [expandedSections, setExpandedSections] = useState({
    events: true,
    tasks: true,
    hearings: true,
    documents: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Filter upcoming events (next 30 days)
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= thirtyDaysFromNow
  })

  // Filter pending tasks
  const pendingTasks = tasks.filter(
    (task) => task.status !== 'completed' && task.status !== 'cancelled'
  )

  // Filter upcoming hearings
  const upcomingHearings = hearings.filter((hearing) => {
    const hearingDate = new Date(hearing.date)
    return hearingDate >= new Date()
  })

  if (collapsed) {
    return (
      <div className="w-12 h-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleCollapse}>
          <ChevronRight size={16} />
        </Button>
        <div className="flex flex-col gap-3 items-center">
          <div className="relative">
            <Calendar size={18} className="text-blue-500" />
            {upcomingEvents.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {upcomingEvents.length}
              </span>
            )}
          </div>
          <div className="relative">
            <CheckSquare size={18} className="text-emerald-500" />
            {pendingTasks.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-emerald-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {pendingTasks.length}
              </span>
            )}
          </div>
          <div className="relative">
            <Scale size={18} className="text-purple-500" />
            {upcomingHearings.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {upcomingHearings.length}
              </span>
            )}
          </div>
          <FileText size={18} className="text-orange-500" />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-72 h-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700 p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="w-72 h-full bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
          {t('whiteboard.caseInfo', 'Case Information')}
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleCollapse}>
          <ChevronRight size={14} className="rotate-180 rtl:rotate-0" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Case summary */}
          {caseInfo && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-slate-500" />
                <span className="font-medium text-sm truncate">
                  {isArabic ? caseInfo.titleAr || caseInfo.title : caseInfo.title}
                </span>
              </div>
              {caseInfo.caseNumber && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Hash size={12} />
                  <span className="font-mono">{caseInfo.caseNumber}</span>
                </div>
              )}
              {caseInfo.client && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={12} />
                  <span>
                    {isArabic
                      ? caseInfo.client.nameAr || caseInfo.client.name
                      : caseInfo.client.name}
                  </span>
                </div>
              )}
              {caseInfo.status && (
                <Badge variant="outline" className="text-xs">
                  {caseInfo.status}
                </Badge>
              )}
            </div>
          )}

          {/* Events section */}
          <Collapsible open={expandedSections.events} onOpenChange={() => toggleSection('events')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                <span className="font-medium text-sm">
                  {t('whiteboard.events', 'Events')}
                </span>
                {upcomingEvents.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {upcomingEvents.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-500 transition-transform',
                  !expandedSections.events && '-rotate-90 rtl:rotate-90'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-1">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {t('whiteboard.noUpcomingEvents', 'No upcoming events')}
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="group p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => onCreateBlockFromEvent?.(event)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'event', data: event }))
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isArabic ? event.titleAr || event.title : event.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Clock size={10} />
                          <span>
                            {new Date(event.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                      <Plus
                        size={14}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 shrink-0"
                      />
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Tasks section */}
          <Collapsible open={expandedSections.tasks} onOpenChange={() => toggleSection('tasks')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
              <div className="flex items-center gap-2">
                <CheckSquare size={14} className="text-emerald-500" />
                <span className="font-medium text-sm">
                  {t('whiteboard.tasks', 'Tasks')}
                </span>
                {pendingTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {pendingTasks.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-500 transition-transform',
                  !expandedSections.tasks && '-rotate-90 rtl:rotate-90'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-1">
              {pendingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {t('whiteboard.noPendingTasks', 'No pending tasks')}
                </p>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="group p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => onCreateBlockFromTask?.(task)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'task', data: task }))
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isArabic ? task.titleAr || task.title : task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.priority && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1 py-0',
                                task.priority === 'high' && 'border-orange-300 text-orange-600',
                                task.priority === 'urgent' && 'border-red-300 text-red-600'
                              )}
                            >
                              {task.priority}
                            </Badge>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-slate-500">
                              {new Date(task.dueDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Plus
                        size={14}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 shrink-0"
                      />
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Hearings section */}
          <Collapsible
            open={expandedSections.hearings}
            onOpenChange={() => toggleSection('hearings')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
              <div className="flex items-center gap-2">
                <Scale size={14} className="text-purple-500" />
                <span className="font-medium text-sm">
                  {t('whiteboard.hearings', 'Hearings')}
                </span>
                {upcomingHearings.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {upcomingHearings.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-500 transition-transform',
                  !expandedSections.hearings && '-rotate-90 rtl:rotate-90'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-1">
              {upcomingHearings.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {t('whiteboard.noUpcomingHearings', 'No upcoming hearings')}
                </p>
              ) : (
                upcomingHearings.map((hearing) => (
                  <div
                    key={hearing._id}
                    className="group p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => onCreateBlockFromHearing?.(hearing)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'hearing', data: hearing }))
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isArabic ? hearing.titleAr || hearing.title : hearing.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Clock size={10} />
                          <span>
                            {new Date(hearing.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                          {hearing.court && (
                            <>
                              <span>-</span>
                              <span>{hearing.court}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Plus
                        size={14}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 shrink-0"
                      />
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Documents section */}
          <Collapsible
            open={expandedSections.documents}
            onOpenChange={() => toggleSection('documents')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-orange-500" />
                <span className="font-medium text-sm">
                  {t('whiteboard.documents', 'Documents')}
                </span>
                {documents.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {documents.length}
                  </Badge>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'text-slate-500 transition-transform',
                  !expandedSections.documents && '-rotate-90 rtl:rotate-90'
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-1">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  {t('whiteboard.noDocuments', 'No documents')}
                </p>
              ) : (
                documents.slice(0, 10).map((doc) => (
                  <div
                    key={doc._id}
                    className="group p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    onClick={() => onCreateBlockFromDocument?.(doc)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'document', data: doc }))
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isArabic ? doc.titleAr || doc.title : doc.title}
                        </p>
                        {doc.type && (
                          <Badge variant="outline" className="text-[10px] mt-1">
                            {doc.type}
                          </Badge>
                        )}
                      </div>
                      <Plus
                        size={14}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 shrink-0"
                      />
                    </div>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <p className="text-xs text-slate-500 text-center">
          {t('whiteboard.dragHint', 'Click or drag items to add them as blocks')}
        </p>
      </div>
    </div>
  )
}

export default CaseInfoSidebar
