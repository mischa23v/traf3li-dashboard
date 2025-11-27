/**
 * TipTap Rich Text Editor
 * Full-featured legal document editor with RTL support
 * Includes: formatting, tables, links, images, and more
 */

import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  RowsIcon,
  Columns,
  Trash2,
  Minus,
  Pilcrow,
} from 'lucide-react'

/**
 * Props Interface
 */
interface TipTapEditorProps {
  content?: string
  onChange?: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  editable?: boolean
  className?: string
  minHeight?: string
  maxHeight?: string
  locale?: 'ar' | 'en'
}

/**
 * Toolbar Button Component
 */
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              isActive && 'bg-muted text-primary'
            )}
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Toolbar Component
 */
function Toolbar({ editor, locale = 'ar' }: { editor: Editor | null; locale?: 'ar' | 'en' }) {
  if (!editor) return null

  const isRTL = locale === 'ar'

  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt(isRTL ? 'رابط الصورة' : 'Image URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor, isRTL])

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip={isRTL ? 'تراجع' : 'Undo'}
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip={isRTL ? 'إعادة' : 'Redo'}
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Headings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Pilcrow className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            <Pilcrow className="h-4 w-4 me-2" />
            {isRTL ? 'نص عادي' : 'Paragraph'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="h-4 w-4 me-2" />
            {isRTL ? 'عنوان 1' : 'Heading 1'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="h-4 w-4 me-2" />
            {isRTL ? 'عنوان 2' : 'Heading 2'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-4 w-4 me-2" />
            {isRTL ? 'عنوان 3' : 'Heading 3'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip={isRTL ? 'غامق' : 'Bold'}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip={isRTL ? 'مائل' : 'Italic'}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip={isRTL ? 'تسطير' : 'Underline'}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip={isRTL ? 'يتوسطه خط' : 'Strikethrough'}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        tooltip={isRTL ? 'كود' : 'Code'}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        tooltip={isRTL ? 'محاذاة يسار' : 'Align Left'}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        tooltip={isRTL ? 'توسيط' : 'Align Center'}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        tooltip={isRTL ? 'محاذاة يمين' : 'Align Right'}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        tooltip={isRTL ? 'ضبط' : 'Justify'}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        tooltip={isRTL ? 'قائمة نقطية' : 'Bullet List'}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        tooltip={isRTL ? 'قائمة مرقمة' : 'Numbered List'}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        tooltip={isRTL ? 'اقتباس' : 'Blockquote'}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Links */}
      <ToolbarButton
        onClick={addLink}
        isActive={editor.isActive('link')}
        tooltip={isRTL ? 'إضافة رابط' : 'Add Link'}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      {editor.isActive('link') && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          tooltip={isRTL ? 'إزالة الرابط' : 'Remove Link'}
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>
      )}

      {/* Image */}
      <ToolbarButton onClick={addImage} tooltip={isRTL ? 'إضافة صورة' : 'Add Image'}>
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', editor.isActive('table') && 'bg-muted text-primary')}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={insertTable}>
            <TableIcon className="h-4 w-4 me-2" />
            {isRTL ? 'إدراج جدول' : 'Insert Table'}
          </DropdownMenuItem>
          {editor.isActive('table') && (
            <>
              <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
                <RowsIcon className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة صف' : 'Add Row'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <Columns className="h-4 w-4 me-2" />
                {isRTL ? 'إضافة عمود' : 'Add Column'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()}>
                <Minus className="h-4 w-4 me-2" />
                {isRTL ? 'حذف صف' : 'Delete Row'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()}>
                <Minus className="h-4 w-4 me-2" />
                {isRTL ? 'حذف عمود' : 'Delete Column'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 me-2" />
                {isRTL ? 'حذف الجدول' : 'Delete Table'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Horizontal Rule */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        tooltip={isRTL ? 'خط أفقي' : 'Horizontal Rule'}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

/**
 * Bubble Menu Component (appears on text selection)
 */
function EditorBubbleMenu({ editor, locale = 'ar' }: { editor: Editor; locale?: 'ar' | 'en' }) {
  const isRTL = locale === 'ar'

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex items-center gap-1 p-1 bg-background border rounded-lg shadow-lg"
    >
      <Button
        size="icon"
        variant="ghost"
        className={cn('h-7 w-7', editor.isActive('bold') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={cn('h-7 w-7', editor.isActive('italic') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={cn('h-7 w-7', editor.isActive('underline') && 'bg-muted')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </Button>
      <Separator orientation="vertical" className="h-5 mx-1" />
      <Button
        size="icon"
        variant="ghost"
        className={cn('h-7 w-7', editor.isActive('link') && 'bg-muted')}
        onClick={() => {
          const url = window.prompt(isRTL ? 'رابط' : 'URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </Button>
    </BubbleMenu>
  )
}

/**
 * Main TipTap Editor Component
 */
export function TipTapEditor({
  content = '',
  onChange,
  onBlur,
  placeholder,
  editable = true,
  className,
  minHeight = '300px',
  maxHeight = '600px',
  locale = 'ar',
}: TipTapEditorProps) {
  const isRTL = locale === 'ar'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (isRTL ? 'ابدأ الكتابة هنا...' : 'Start typing here...'),
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: isRTL ? 'right' : 'left',
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border p-2 bg-muted font-semibold',
        },
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none p-4',
          isRTL && 'text-right'
        ),
        dir: isRTL ? 'rtl' : 'ltr',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    onBlur: () => {
      onBlur?.()
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  return (
    <div
      className={cn(
        'rounded-lg border bg-background overflow-hidden',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {editable && <Toolbar editor={editor} locale={locale} />}
      {editor && editable && <EditorBubbleMenu editor={editor} locale={locale} />}
      <div
        style={{ minHeight, maxHeight }}
        className="overflow-y-auto"
      >
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: ${isRTL ? 'right' : 'left'};
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          min-height: ${minHeight};
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid hsl(var(--border));
          padding: 0.5rem;
        }
        .ProseMirror th {
          background: hsl(var(--muted));
          font-weight: 600;
        }
        .ProseMirror blockquote {
          border-${isRTL ? 'right' : 'left'}: 3px solid hsl(var(--primary));
          padding-${isRTL ? 'right' : 'left'}: 1rem;
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 1.5rem 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-${isRTL ? 'right' : 'left'}: 1.5rem;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}

export default TipTapEditor
