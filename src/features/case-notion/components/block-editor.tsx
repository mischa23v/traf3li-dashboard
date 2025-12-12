import { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image,
  Table,
  Link,
  AlertCircle,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Loader2,
  User,
  Scale,
  FileText,
  Clock,
  Bookmark,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useCreateBlock, useUpdateBlock, useDeleteBlock, useMoveBlock } from '@/hooks/useCaseNotion'
import type { Block, BlockType, RichTextItem } from '../data/schema'
import { blockTypeLabels, partyTypeLabels, evidenceTypeLabels } from '../data/schema'

// Block type icons mapping
const blockTypeIcons: Record<BlockType, React.ElementType> = {
  text: Type,
  heading_1: Heading1,
  heading_2: Heading2,
  heading_3: Heading3,
  bulleted_list: List,
  numbered_list: ListOrdered,
  todo: CheckSquare,
  toggle: ChevronRight,
  quote: Quote,
  callout: AlertCircle,
  divider: Minus,
  code: Code,
  table: Table,
  image: Image,
  file: FileText,
  bookmark: Bookmark,
  embed: Link,
  synced_block: Link,
  template: FileText,
  column_list: Table,
  column: Table,
  link_to_page: Link,
  mention: User,
  equation: Type,
  timeline_entry: Clock,
  party_statement: User,
  evidence_item: FileText,
  legal_citation: Scale,
}

interface BlockEditorProps {
  caseId: string
  pageId: string
  blocks: Block[]
  onBlocksChange?: (blocks: Block[]) => void
  readOnly?: boolean
}

interface BlockItemProps {
  caseId: string
  pageId: string
  block: Block
  index: number
  isActive: boolean
  onFocus: () => void
  onBlur: () => void
  onContentChange: (content: RichTextItem[]) => void
  onDelete: () => void
  onAddBlockAfter: (type: BlockType) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onIndent: () => void
  onOutdent: () => void
  isFirst: boolean
  isLast: boolean
  readOnly?: boolean
}

function BlockItem({
  caseId,
  pageId,
  block,
  index,
  isActive,
  onFocus,
  onBlur,
  onContentChange,
  onDelete,
  onAddBlockAfter,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
  isFirst,
  isLast,
  readOnly,
}: BlockItemProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(block.isCollapsed)

  const Icon = blockTypeIcons[block.type] || Type

  // Get plain text from content
  const getPlainText = useCallback(() => {
    return block.content
      .map((item) => item.text?.content || item.plainText || '')
      .join('')
  }, [block.content])

  const [localText, setLocalText] = useState(getPlainText())

  useEffect(() => {
    setLocalText(getPlainText())
  }, [getPlainText])

  // Handle text change with debounce
  const handleTextChange = useCallback(
    (text: string) => {
      setLocalText(text)
      const newContent: RichTextItem[] = [
        {
          type: 'text',
          text: { content: text },
          plainText: text,
        },
      ]
      onContentChange(newContent)
    },
    [onContentChange]
  )

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddBlockAfter('text')
    } else if (e.key === 'Backspace' && localText === '') {
      e.preventDefault()
      onDelete()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        onOutdent()
      } else {
        onIndent()
      }
    }
  }

  // Render different block types
  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading_1':
        return (
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={isArabic ? 'عنوان رئيسي' : 'Heading 1'}
            className="text-3xl font-bold border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[48px]"
            disabled={readOnly}
          />
        )

      case 'heading_2':
        return (
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={isArabic ? 'عنوان فرعي' : 'Heading 2'}
            className="text-2xl font-semibold border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[40px]"
            disabled={readOnly}
          />
        )

      case 'heading_3':
        return (
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={isArabic ? 'عنوان ثالث' : 'Heading 3'}
            className="text-xl font-medium border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[36px]"
            disabled={readOnly}
          />
        )

      case 'bulleted_list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-1">•</span>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'عنصر قائمة' : 'List item'}
              className="flex-1 border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'numbered_list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-0.5 min-w-[20px]">{index + 1}.</span>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'عنصر قائمة' : 'List item'}
              className="flex-1 border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={() => {
                // Handle checkbox toggle
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={readOnly}
            />
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'مهمة' : 'To-do'}
              className={cn(
                'flex-1 border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]',
                block.checked && 'line-through text-slate-400'
              )}
              disabled={readOnly}
            />
          </div>
        )

      case 'toggle':
        return (
          <div>
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
              <Textarea
                ref={textareaRef}
                value={localText}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={isArabic ? 'عنوان قابل للطي' : 'Toggle heading'}
                className="flex-1 border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px] font-medium"
                disabled={readOnly}
              />
            </div>
            {!isCollapsed && block.children && block.children.length > 0 && (
              <div className="ms-6 mt-2 space-y-1">
                {/* Render children blocks */}
              </div>
            )}
          </div>
        )

      case 'quote':
        return (
          <div className="border-s-4 border-slate-300 dark:border-slate-600 ps-4">
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'اقتباس' : 'Quote'}
              className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px] italic text-slate-600 dark:text-slate-400"
              disabled={readOnly}
            />
          </div>
        )

      case 'callout':
        return (
          <div
            className={cn(
              'rounded-lg p-4 flex gap-3',
              block.color === 'red' && 'bg-red-50 dark:bg-red-900/20',
              block.color === 'blue' && 'bg-blue-50 dark:bg-blue-900/20',
              block.color === 'green' && 'bg-emerald-50 dark:bg-emerald-900/20',
              block.color === 'yellow' && 'bg-amber-50 dark:bg-amber-900/20',
              !block.color && 'bg-slate-100 dark:bg-slate-800'
            )}
          >
            <span className="text-xl">{block.icon || '💡'}</span>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'تنبيه' : 'Callout'}
              className="flex-1 border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'divider':
        return <hr className="my-4 border-slate-200 dark:border-slate-700" />

      case 'code':
        return (
          <div className="rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100 overflow-x-auto">
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'كود' : 'Code'}
              className="w-full border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[60px] font-mono text-slate-100"
              disabled={readOnly}
            />
          </div>
        )

      case 'party_statement':
        const partyLabel = block.partyType
          ? isArabic
            ? partyTypeLabels[block.partyType].ar
            : partyTypeLabels[block.partyType].en
          : ''
        return (
          <div
            className={cn(
              'rounded-lg p-4 border-s-4',
              block.partyType === 'plaintiff' && 'bg-blue-50 border-blue-500',
              block.partyType === 'defendant' && 'bg-red-50 border-red-500',
              block.partyType === 'witness' && 'bg-amber-50 border-amber-500',
              block.partyType === 'expert' && 'bg-purple-50 border-purple-500',
              block.partyType === 'judge' && 'bg-slate-50 border-slate-500'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="text-slate-500" />
              <Badge variant="outline" className="text-xs">
                {partyLabel}
              </Badge>
              {block.statementDate && (
                <span className="text-xs text-slate-500">
                  {new Date(block.statementDate).toLocaleDateString(
                    isArabic ? 'ar-SA' : 'en-US'
                  )}
                </span>
              )}
            </div>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'أقوال الطرف...' : 'Party statement...'}
              className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[60px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'evidence_item':
        const evidenceLabel = block.evidenceType
          ? isArabic
            ? evidenceTypeLabels[block.evidenceType].ar
            : evidenceTypeLabels[block.evidenceType].en
          : ''
        return (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-emerald-600" />
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs">
                {evidenceLabel}
              </Badge>
              {block.evidenceSource && (
                <span className="text-xs text-slate-500">{block.evidenceSource}</span>
              )}
            </div>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'وصف الدليل...' : 'Evidence description...'}
              className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[40px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'legal_citation':
        return (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={14} className="text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
                {block.citationType === 'law' && (isArabic ? 'قانون' : 'Law')}
                {block.citationType === 'regulation' && (isArabic ? 'لائحة' : 'Regulation')}
                {block.citationType === 'case_precedent' && (isArabic ? 'سابقة قضائية' : 'Case Precedent')}
                {block.citationType === 'legal_principle' && (isArabic ? 'مبدأ قانوني' : 'Legal Principle')}
              </Badge>
              {block.citationReference && (
                <span className="text-xs text-blue-600 font-mono">
                  {block.citationReference}
                </span>
              )}
            </div>
            <Textarea
              ref={textareaRef}
              value={localText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={isArabic ? 'نص الاستشهاد...' : 'Citation text...'}
              className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[40px]"
              disabled={readOnly}
            />
          </div>
        )

      case 'timeline_entry':
        return (
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex-1 pb-6">
              {block.eventDate && (
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {new Date(block.eventDate).toLocaleDateString(
                      isArabic ? 'ar-SA' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </span>
                </div>
              )}
              <Textarea
                ref={textareaRef}
                value={localText}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={isArabic ? 'وصف الحدث...' : 'Event description...'}
                className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]"
                disabled={readOnly}
              />
            </div>
          </div>
        )

      default:
        return (
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={isArabic ? 'اكتب هنا...' : 'Type here...'}
            className="border-0 p-0 resize-none bg-transparent focus:ring-0 min-h-[24px]"
            disabled={readOnly}
          />
        )
    }
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-1 py-1 rounded-lg transition-colors',
        isActive && 'bg-slate-50 dark:bg-slate-800/50'
      )}
      style={{ paddingInlineStart: `${block.indent * 24}px` }}
    >
      {/* Block controls */}
      {!readOnly && (
        <div
          className={cn(
            'flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
            isActive && 'opacity-100'
          )}
        >
          {/* Add block button */}
          <Popover open={showBlockMenu} onOpenChange={setShowBlockMenu}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-slate-600"
              >
                <Plus size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <div className="grid gap-1">
                {/* Basic blocks */}
                <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">
                  {isArabic ? 'أساسي' : 'Basic'}
                </div>
                {(['text', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list', 'numbered_list', 'todo'] as BlockType[]).map(
                  (type) => {
                    const TypeIcon = blockTypeIcons[type]
                    const label = isArabic
                      ? blockTypeLabels[type].ar
                      : blockTypeLabels[type].en
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => {
                          onAddBlockAfter(type)
                          setShowBlockMenu(false)
                        }}
                      >
                        <TypeIcon size={14} className="me-2 text-slate-500" />
                        {label}
                      </Button>
                    )
                  }
                )}

                {/* Legal blocks */}
                <div className="px-2 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase">
                  {isArabic ? 'قانوني' : 'Legal'}
                </div>
                {(['party_statement', 'evidence_item', 'legal_citation', 'timeline_entry'] as BlockType[]).map(
                  (type) => {
                    const TypeIcon = blockTypeIcons[type]
                    const label = isArabic
                      ? blockTypeLabels[type].ar
                      : blockTypeLabels[type].en
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => {
                          onAddBlockAfter(type)
                          setShowBlockMenu(false)
                        }}
                      >
                        <TypeIcon size={14} className="me-2 text-slate-500" />
                        {label}
                      </Button>
                    )
                  }
                )}

                {/* Advanced blocks */}
                <div className="px-2 py-1 mt-2 text-xs font-semibold text-slate-500 uppercase">
                  {isArabic ? 'متقدم' : 'Advanced'}
                </div>
                {(['quote', 'callout', 'code', 'divider', 'toggle'] as BlockType[]).map(
                  (type) => {
                    const TypeIcon = blockTypeIcons[type]
                    const label = isArabic
                      ? blockTypeLabels[type].ar
                      : blockTypeLabels[type].en
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8"
                        onClick={() => {
                          onAddBlockAfter(type)
                          setShowBlockMenu(false)
                        }}
                      >
                        <TypeIcon size={14} className="me-2 text-slate-500" />
                        {label}
                      </Button>
                    )
                  }
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Drag handle */}
          <div className="h-6 w-6 flex items-center justify-center text-slate-400 cursor-grab">
            <GripVertical size={14} />
          </div>
        </div>
      )}

      {/* Block content */}
      <div className="flex-1 min-w-0">{renderBlockContent()}</div>

      {/* Block actions */}
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                isActive && 'opacity-100'
              )}
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 size={14} className="me-2" />
              {isArabic ? 'حذف' : 'Delete'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy size={14} className="me-2" />
              {isArabic ? 'نسخ' : 'Duplicate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onMoveUp} disabled={isFirst}>
              <ArrowUp size={14} className="me-2" />
              {isArabic ? 'نقل للأعلى' : 'Move up'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveDown} disabled={isLast}>
              <ArrowDown size={14} className="me-2" />
              {isArabic ? 'نقل للأسفل' : 'Move down'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type size={14} className="me-2" />
                {isArabic ? 'تحويل إلى' : 'Turn into'}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                {(['text', 'heading_1', 'heading_2', 'bulleted_list', 'numbered_list', 'todo', 'quote'] as BlockType[]).map(
                  (type) => {
                    const TypeIcon = blockTypeIcons[type]
                    const label = isArabic
                      ? blockTypeLabels[type].ar
                      : blockTypeLabels[type].en
                    return (
                      <DropdownMenuItem key={type}>
                        <TypeIcon size={14} className="me-2" />
                        {label}
                      </DropdownMenuItem>
                    )
                  }
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <MessageCircle size={14} className="me-2" />
              {isArabic ? 'إضافة تعليق' : 'Add comment'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export function BlockEditor({
  caseId,
  pageId,
  blocks,
  onBlocksChange,
  readOnly,
}: BlockEditorProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null)
  const [localBlocks, setLocalBlocks] = useState<Block[]>(blocks)

  // Mutations
  const createBlock = useCreateBlock()
  const updateBlock = useUpdateBlock()
  const deleteBlock = useDeleteBlock()

  useEffect(() => {
    setLocalBlocks(blocks)
  }, [blocks])

  const handleContentChange = useCallback(
    (index: number, content: RichTextItem[]) => {
      const newBlocks = [...localBlocks]
      newBlocks[index] = { ...newBlocks[index], content }
      setLocalBlocks(newBlocks)
      onBlocksChange?.(newBlocks)

      // Debounce the API call
      const block = newBlocks[index]
      updateBlock.mutate({
        caseId,
        pageId,
        blockId: block._id,
        data: { content },
      })
    },
    [localBlocks, caseId, pageId, updateBlock, onBlocksChange]
  )

  const handleAddBlockAfter = useCallback(
    async (index: number, type: BlockType) => {
      const afterBlock = localBlocks[index]
      try {
        const newBlock = await createBlock.mutateAsync({
          caseId,
          pageId,
          data: {
            pageId,
            type,
            afterBlockId: afterBlock?._id,
          },
        })

        const newBlocks = [...localBlocks]
        newBlocks.splice(index + 1, 0, newBlock)
        setLocalBlocks(newBlocks)
        onBlocksChange?.(newBlocks)
        setActiveBlockIndex(index + 1)
      } catch (error) {
        console.error('Failed to create block:', error)
      }
    },
    [localBlocks, caseId, pageId, createBlock, onBlocksChange]
  )

  const handleDeleteBlock = useCallback(
    async (index: number) => {
      const block = localBlocks[index]
      try {
        await deleteBlock.mutateAsync({
          caseId,
          pageId,
          blockId: block._id,
        })

        const newBlocks = localBlocks.filter((_, i) => i !== index)
        setLocalBlocks(newBlocks)
        onBlocksChange?.(newBlocks)
        setActiveBlockIndex(Math.max(0, index - 1))
      } catch (error) {
        console.error('Failed to delete block:', error)
      }
    },
    [localBlocks, caseId, pageId, deleteBlock, onBlocksChange]
  )

  const handleMoveBlock = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= localBlocks.length) return

      const newBlocks = [...localBlocks]
      const [movedBlock] = newBlocks.splice(index, 1)
      newBlocks.splice(newIndex, 0, movedBlock)

      // Update order for all affected blocks
      newBlocks.forEach((block, i) => {
        block.order = i
      })

      setLocalBlocks(newBlocks)
      onBlocksChange?.(newBlocks)
      setActiveBlockIndex(newIndex)
    },
    [localBlocks, onBlocksChange]
  )

  const handleIndent = useCallback(
    (index: number) => {
      const newBlocks = [...localBlocks]
      newBlocks[index] = {
        ...newBlocks[index],
        indent: Math.min((newBlocks[index].indent || 0) + 1, 4),
      }
      setLocalBlocks(newBlocks)
      onBlocksChange?.(newBlocks)
    },
    [localBlocks, onBlocksChange]
  )

  const handleOutdent = useCallback(
    (index: number) => {
      const newBlocks = [...localBlocks]
      newBlocks[index] = {
        ...newBlocks[index],
        indent: Math.max((newBlocks[index].indent || 0) - 1, 0),
      }
      setLocalBlocks(newBlocks)
      onBlocksChange?.(newBlocks)
    },
    [localBlocks, onBlocksChange]
  )

  // Add first block if empty
  const handleAddFirstBlock = useCallback(async () => {
    try {
      const newBlock = await createBlock.mutateAsync({
        caseId,
        pageId,
        data: {
          pageId,
          type: 'text',
        },
      })

      setLocalBlocks([newBlock])
      onBlocksChange?.([newBlock])
      setActiveBlockIndex(0)
    } catch (error) {
      console.error('Failed to create first block:', error)
    }
  }, [caseId, pageId, createBlock, onBlocksChange])

  if (localBlocks.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            {isArabic ? 'ابدأ الكتابة هنا...' : 'Start writing here...'}
          </p>
          {!readOnly && (
            <Button
              variant="outline"
              onClick={handleAddFirstBlock}
              disabled={createBlock.isPending}
            >
              {createBlock.isPending ? (
                <Loader2 size={14} className="me-2 animate-spin" />
              ) : (
                <Plus size={14} className="me-2" />
              )}
              {isArabic ? 'إضافة محتوى' : 'Add content'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0.5 py-4">
      {localBlocks.map((block, index) => (
        <BlockItem
          key={block._id}
          caseId={caseId}
          pageId={pageId}
          block={block}
          index={index}
          isActive={activeBlockIndex === index}
          onFocus={() => setActiveBlockIndex(index)}
          onBlur={() => {}}
          onContentChange={(content) => handleContentChange(index, content)}
          onDelete={() => handleDeleteBlock(index)}
          onAddBlockAfter={(type) => handleAddBlockAfter(index, type)}
          onMoveUp={() => handleMoveBlock(index, 'up')}
          onMoveDown={() => handleMoveBlock(index, 'down')}
          onIndent={() => handleIndent(index)}
          onOutdent={() => handleOutdent(index)}
          isFirst={index === 0}
          isLast={index === localBlocks.length - 1}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

export default BlockEditor
