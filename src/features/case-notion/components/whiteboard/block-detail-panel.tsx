/**
 * BlockDetailPanel - Side panel for viewing/editing block details
 * Features:
 * - Full text editing
 * - Block type selection
 * - Color and priority settings
 * - Link to case entities (events, tasks, hearings, documents)
 * - Comments
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  Save,
  Trash2,
  Calendar,
  CheckSquare,
  Scale,
  FileText,
  Link2,
  Unlink,
  Palette,
  Flag,
  Type,
  Clock,
  User,
  MessageCircle,
  ChevronDown,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Block, BlockType, RichTextItem } from '../../data/schema'
import {
  blockTypeLabels,
  blockColorLabels,
  blockPriorityLabels,
  partyTypeLabels,
  evidenceTypeLabels,
} from '../../data/schema'

interface BlockDetailPanelProps {
  block: Block | null
  selectedBlockIds?: Set<string>
  blocks?: Block[]
  isOpen: boolean
  onClose: () => void
  onSave: (blockId: string, updates: Partial<Block>) => void
  onDelete: (blockId?: string) => void
  onLinkEvent?: (blockId: string, eventId: string) => void
  onLinkTask?: (blockId: string, taskId: string) => void
  onLinkHearing?: (blockId: string, hearingId: string) => void
  onLinkDocument?: (blockId: string, documentId: string) => void
  onUnlink?: (blockId: string, linkType: 'event' | 'task' | 'hearing' | 'document') => void
  // Available entities to link
  availableEvents?: Array<{ _id: string; title: string; date?: string }>
  availableTasks?: Array<{ _id: string; title: string; dueDate?: string }>
  availableHearings?: Array<{ _id: string; title: string; date?: string }>
  availableDocuments?: Array<{ _id: string; title: string; type?: string }>
  isLoading?: boolean
  readOnly?: boolean
}

export function BlockDetailPanel({
  block,
  selectedBlockIds,
  blocks,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onLinkEvent,
  onLinkTask,
  onLinkHearing,
  onLinkDocument,
  onUnlink,
  availableEvents = [],
  availableTasks = [],
  availableHearings = [],
  availableDocuments = [],
  isLoading,
  readOnly,
}: BlockDetailPanelProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Local state for editing
  const [content, setContent] = useState('')
  const [blockType, setBlockType] = useState<BlockType>('text')
  const [blockColor, setBlockColor] = useState<Block['blockColor']>('default')
  const [priority, setPriority] = useState<Block['priority']>(undefined)
  const [partyType, setPartyType] = useState<Block['partyType']>(undefined)
  const [evidenceType, setEvidenceType] = useState<Block['evidenceType']>(undefined)
  const [eventDate, setEventDate] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState<'event' | 'task' | 'hearing' | 'document' | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync local state with block prop
  useEffect(() => {
    if (block) {
      const text = block.content
        .map((item) => item.text?.content || item.plainText || '')
        .join('')
      setContent(text)
      setBlockType(block.type)
      setBlockColor(block.blockColor || 'default')
      setPriority(block.priority)
      setPartyType(block.partyType)
      setEvidenceType(block.evidenceType)
      setEventDate(block.eventDate || '')
      setHasChanges(false)
    }
  }, [block])

  // Handle save
  const handleSave = useCallback(() => {
    if (!block) return

    const newContent: RichTextItem[] = [
      {
        type: 'text',
        text: { content },
        plainText: content,
      },
    ]

    const updates: Partial<Block> = {
      content: newContent,
      type: blockType,
      blockColor,
      priority,
    }

    // Add type-specific fields
    if (blockType === 'party_statement') {
      updates.partyType = partyType
    }
    if (blockType === 'evidence_item') {
      updates.evidenceType = evidenceType
    }
    if (blockType === 'timeline_entry') {
      updates.eventDate = eventDate
    }

    onSave(block._id, updates)
    setHasChanges(false)
  }, [block, content, blockType, blockColor, priority, partyType, evidenceType, eventDate, onSave])

  // Handle delete
  const handleDelete = useCallback(() => {
    if (selectedBlockIds && selectedBlockIds.size > 1) {
      // Batch delete - don't pass blockId
      onDelete()
    } else if (block) {
      // Single delete
      onDelete(block._id)
    }
    setShowDeleteDialog(false)
    onClose()
  }, [block, selectedBlockIds, onDelete, onClose])

  // Handle link selection
  const handleLink = useCallback(
    (entityId: string) => {
      if (!block || !showLinkDialog) return

      switch (showLinkDialog) {
        case 'event':
          onLinkEvent?.(block._id, entityId)
          break
        case 'task':
          onLinkTask?.(block._id, entityId)
          break
        case 'hearing':
          onLinkHearing?.(block._id, entityId)
          break
        case 'document':
          onLinkDocument?.(block._id, entityId)
          break
      }

      setShowLinkDialog(null)
    },
    [block, showLinkDialog, onLinkEvent, onLinkTask, onLinkHearing, onLinkDocument]
  )

  if (!isOpen || !block) return null

  const colorConfig = blockColorLabels[blockColor || 'default']

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          'absolute top-0 end-0 h-full w-96 bg-white dark:bg-slate-900 border-s border-slate-200 dark:border-slate-700 shadow-xl z-20',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t('whiteboard.blockDetails', 'Block Details')}
          </h3>
          <div className="flex items-center gap-2">
            {hasChanges && !readOnly && (
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 size={14} className="me-1 animate-spin" />
                ) : (
                  <Save size={14} className="me-1" />
                )}
                {t('common.save', 'Save')}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="p-4 space-y-6">
            {/* Multi-select info */}
            {selectedBlockIds && selectedBlockIds.size > 1 ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                    {t('whiteboard.multipleSelected', `${selectedBlockIds.size} items selected`)}
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">
                    {t(
                      'whiteboard.multipleSelectedDescription',
                      'You can delete all selected blocks at once'
                    )}
                  </p>
                  {!readOnly && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full"
                    >
                      <Trash2 size={14} className="me-2" />
                      {t('whiteboard.deleteSelected', 'Delete Selected')}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Content textarea */}
                <div className="space-y-2">
                  <Label>{t('whiteboard.content', 'Content')}</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value)
                      setHasChanges(true)
                    }}
                    placeholder={t('whiteboard.enterContent', 'Enter your notes here...')}
                    className="min-h-[150px] resize-none"
                    disabled={readOnly}
                  />
                </div>

                <Separator />

                {/* Block type */}
                <div className="space-y-2">
                  <Label>{t('whiteboard.blockType', 'Block Type')}</Label>
                  <Select
                value={blockType}
                onValueChange={(value: BlockType) => {
                  setBlockType(value)
                  setHasChanges(true)
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    {isArabic ? blockTypeLabels.text.ar : blockTypeLabels.text.en}
                  </SelectItem>
                  <SelectItem value="heading_1">
                    {isArabic ? blockTypeLabels.heading_1.ar : blockTypeLabels.heading_1.en}
                  </SelectItem>
                  <SelectItem value="heading_2">
                    {isArabic ? blockTypeLabels.heading_2.ar : blockTypeLabels.heading_2.en}
                  </SelectItem>
                  <SelectItem value="todo">
                    {isArabic ? blockTypeLabels.todo.ar : blockTypeLabels.todo.en}
                  </SelectItem>
                  <SelectItem value="party_statement">
                    {isArabic ? blockTypeLabels.party_statement.ar : blockTypeLabels.party_statement.en}
                  </SelectItem>
                  <SelectItem value="evidence_item">
                    {isArabic ? blockTypeLabels.evidence_item.ar : blockTypeLabels.evidence_item.en}
                  </SelectItem>
                  <SelectItem value="legal_citation">
                    {isArabic ? blockTypeLabels.legal_citation.ar : blockTypeLabels.legal_citation.en}
                  </SelectItem>
                  <SelectItem value="timeline_entry">
                    {isArabic ? blockTypeLabels.timeline_entry.ar : blockTypeLabels.timeline_entry.en}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type-specific fields */}
            {blockType === 'party_statement' && (
              <div className="space-y-2">
                <Label>{t('whiteboard.partyType', 'Party Type')}</Label>
                <Select
                  value={partyType || ''}
                  onValueChange={(value: Block['partyType']) => {
                    setPartyType(value || undefined)
                    setHasChanges(true)
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select', 'Select...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(partyTypeLabels).map(([key, labels]) => (
                      <SelectItem key={key} value={key}>
                        {isArabic ? labels.ar : labels.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {blockType === 'evidence_item' && (
              <div className="space-y-2">
                <Label>{t('whiteboard.evidenceType', 'Evidence Type')}</Label>
                <Select
                  value={evidenceType || ''}
                  onValueChange={(value: Block['evidenceType']) => {
                    setEvidenceType(value || undefined)
                    setHasChanges(true)
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select', 'Select...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(evidenceTypeLabels).map(([key, labels]) => (
                      <SelectItem key={key} value={key}>
                        {isArabic ? labels.ar : labels.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {blockType === 'timeline_entry' && (
              <div className="space-y-2">
                <Label>{t('whiteboard.eventDate', 'Event Date')}</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value)
                    setHasChanges(true)
                  }}
                  disabled={readOnly}
                />
              </div>
            )}

            <Separator />

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette size={14} />
                {t('whiteboard.color', 'Color')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(blockColorLabels).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setBlockColor(key as Block['blockColor'])
                      setHasChanges(true)
                    }}
                    disabled={readOnly}
                    className={cn(
                      'w-8 h-8 rounded-lg border-2 transition-all',
                      config.bg,
                      config.border,
                      blockColor === key && 'ring-2 ring-emerald-500 ring-offset-2',
                      readOnly && 'opacity-50 cursor-not-allowed'
                    )}
                    title={isArabic ? config.ar : config.en}
                  />
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flag size={14} />
                {t('whiteboard.priority', 'Priority')}
              </Label>
              <Select
                value={priority || 'none'}
                onValueChange={(value) => {
                  setPriority(value === 'none' ? undefined : (value as Block['priority']))
                  setHasChanges(true)
                }}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none', 'None')}</SelectItem>
                  {Object.entries(blockPriorityLabels).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', config.bg)} />
                        {isArabic ? config.ar : config.en}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Links to case entities */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Link2 size={14} />
                  {t('whiteboard.linkedEntities', 'Linked Entities')}
                </Label>
                <ChevronDown size={14} className="text-slate-500" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                {/* Event link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" />
                    <span className="text-sm">{t('whiteboard.event', 'Event')}</span>
                  </div>
                  {block.linkedEventId ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {availableEvents.find((e) => e._id === block.linkedEventId)?.title || 'Linked'}
                      </Badge>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUnlink?.(block._id, 'event')}
                        >
                          <Unlink size={12} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    !readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowLinkDialog('event')}
                      >
                        <Link2 size={12} className="me-1" />
                        {t('common.link', 'Link')}
                      </Button>
                    )
                  )}
                </div>

                {/* Task link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-500" />
                    <span className="text-sm">{t('whiteboard.task', 'Task')}</span>
                  </div>
                  {block.linkedTaskId ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {availableTasks.find((t) => t._id === block.linkedTaskId)?.title || 'Linked'}
                      </Badge>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUnlink?.(block._id, 'task')}
                        >
                          <Unlink size={12} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    !readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowLinkDialog('task')}
                      >
                        <Link2 size={12} className="me-1" />
                        {t('common.link', 'Link')}
                      </Button>
                    )
                  )}
                </div>

                {/* Hearing link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale size={14} className="text-purple-500" />
                    <span className="text-sm">{t('whiteboard.hearing', 'Hearing')}</span>
                  </div>
                  {block.linkedHearingId ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {availableHearings.find((h) => h._id === block.linkedHearingId)?.title || 'Linked'}
                      </Badge>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUnlink?.(block._id, 'hearing')}
                        >
                          <Unlink size={12} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    !readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowLinkDialog('hearing')}
                      >
                        <Link2 size={12} className="me-1" />
                        {t('common.link', 'Link')}
                      </Button>
                    )
                  )}
                </div>

                {/* Document link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-orange-500" />
                    <span className="text-sm">{t('whiteboard.document', 'Document')}</span>
                  </div>
                  {block.linkedDocumentId ? (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {availableDocuments.find((d) => d._id === block.linkedDocumentId)?.title || 'Linked'}
                      </Badge>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onUnlink?.(block._id, 'document')}
                        >
                          <Unlink size={12} />
                        </Button>
                      )}
                    </div>
                  ) : (
                    !readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowLinkDialog('document')}
                      >
                        <Link2 size={12} className="me-1" />
                        {t('common.link', 'Link')}
                      </Button>
                    )
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Metadata */}
            <div className="space-y-2 text-xs text-slate-500">
              {block.createdAt && (
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>
                    {t('common.created', 'Created')}:{' '}
                    {new Date(block.createdAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              )}
              {block.lastEditedAt && (
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>
                    {t('common.updated', 'Updated')}:{' '}
                    {new Date(block.lastEditedAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              )}
              {block.lastEditedBy && (
                <div className="flex items-center gap-2">
                  <User size={12} />
                  <span>
                    {t('common.editedBy', 'Edited by')}: {block.lastEditedBy}
                  </span>
                </div>
              )}
            </div>

            {/* Delete button */}
            {!readOnly && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 size={14} className="me-2" />
                  {t('whiteboard.deleteBlock', 'Delete Block')}
                </Button>
              </>
            )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBlockIds && selectedBlockIds.size > 1
                ? t('whiteboard.deleteBlocksConfirm', `Delete ${selectedBlockIds.size} Blocks?`)
                : t('whiteboard.deleteBlockConfirm', 'Delete Block?')}
            </DialogTitle>
            <DialogDescription>
              {selectedBlockIds && selectedBlockIds.size > 1
                ? t(
                    'whiteboard.deleteBlocksDescription',
                    'This action cannot be undone. All selected blocks and their content will be permanently deleted.'
                  )
                : t(
                    'whiteboard.deleteBlockDescription',
                    'This action cannot be undone. The block and all its content will be permanently deleted.'
                  )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link selection dialog */}
      <Dialog open={!!showLinkDialog} onOpenChange={() => setShowLinkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showLinkDialog === 'event' && t('whiteboard.linkEvent', 'Link Event')}
              {showLinkDialog === 'task' && t('whiteboard.linkTask', 'Link Task')}
              {showLinkDialog === 'hearing' && t('whiteboard.linkHearing', 'Link Hearing')}
              {showLinkDialog === 'document' && t('whiteboard.linkDocument', 'Link Document')}
            </DialogTitle>
            <DialogDescription>
              {t('whiteboard.selectEntityToLink', 'Select an item to link to this block.')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {showLinkDialog === 'event' &&
                availableEvents.map((event) => (
                  <button
                    key={event._id}
                    className="w-full p-3 text-start rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={() => handleLink(event._id)}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.date && (
                      <div className="text-xs text-slate-500">
                        {new Date(event.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </div>
                    )}
                  </button>
                ))}
              {showLinkDialog === 'task' &&
                availableTasks.map((task) => (
                  <button
                    key={task._id}
                    className="w-full p-3 text-start rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={() => handleLink(task._id)}
                  >
                    <div className="font-medium">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-xs text-slate-500">
                        {new Date(task.dueDate).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </div>
                    )}
                  </button>
                ))}
              {showLinkDialog === 'hearing' &&
                availableHearings.map((hearing) => (
                  <button
                    key={hearing._id}
                    className="w-full p-3 text-start rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={() => handleLink(hearing._id)}
                  >
                    <div className="font-medium">{hearing.title}</div>
                    {hearing.date && (
                      <div className="text-xs text-slate-500">
                        {new Date(hearing.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </div>
                    )}
                  </button>
                ))}
              {showLinkDialog === 'document' &&
                availableDocuments.map((doc) => (
                  <button
                    key={doc._id}
                    className="w-full p-3 text-start rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    onClick={() => handleLink(doc._id)}
                  >
                    <div className="font-medium">{doc.title}</div>
                    {doc.type && <div className="text-xs text-slate-500">{doc.type}</div>}
                  </button>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BlockDetailPanel
