import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { useEffect, useCallback, useMemo } from 'react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Button } from '@/components/ui/button'
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon, AlignRight, AlignCenter, AlignLeft, AlignJustify,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote, Image as ImageIcon,
    Link as LinkIcon, Unlink, Undo, Redo, Highlighter, Palette, Table as TableIcon,
    Plus, Trash2, Code, Minus, Rows3, Columns3, ListTodo, Subscript as SubscriptIcon, Superscript as SuperscriptIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface TipTapEditorProps {
    content?: string
    contentJson?: any
    onChange?: (html: string, json: any) => void
    placeholder?: string
    editable?: boolean
    dir?: 'rtl' | 'ltr'
    className?: string
    minHeight?: string
    maxCharacters?: number
    showCharacterCount?: boolean
}

// Predefined colors for text and highlight
const TEXT_COLORS = [
    { name: 'أسود', color: '#000000' },
    { name: 'أحمر', color: '#ef4444' },
    { name: 'أخضر', color: '#22c55e' },
    { name: 'أزرق', color: '#3b82f6' },
    { name: 'برتقالي', color: '#f97316' },
    { name: 'بنفسجي', color: '#8b5cf6' },
    { name: 'وردي', color: '#ec4899' },
    { name: 'رمادي', color: '#6b7280' },
]

const HIGHLIGHT_COLORS = [
    { name: 'أصفر', color: '#fef08a' },
    { name: 'أخضر', color: '#bbf7d0' },
    { name: 'أزرق', color: '#bfdbfe' },
    { name: 'وردي', color: '#fbcfe8' },
    { name: 'برتقالي', color: '#fed7aa' },
    { name: 'بنفسجي', color: '#ddd6fe' },
]

export const TipTapEditor = ({
    content = '',
    contentJson,
    onChange,
    placeholder = 'اكتب هنا...',
    editable = true,
    dir = 'rtl',
    className,
    minHeight = '200px',
    maxCharacters,
    showCharacterCount = false
}: TipTapEditorProps) => {
    // Memoize extensions to prevent duplicate registration on re-renders
    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3]
            }
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right', 'justify'],
            defaultAlignment: dir === 'rtl' ? 'right' : 'left',
        }),
        Image.configure({
            inline: true,
            allowBase64: true,
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                target: '_blank',
                rel: 'noopener noreferrer',
            },
        }),
        Placeholder.configure({
            placeholder,
            emptyEditorClass: 'is-editor-empty',
        }),
        Underline.configure({}),
        TextStyle.configure({}),
        Color.configure({}),
        Highlight.configure({
            multicolor: true,
        }),
        CharacterCount.configure({
            limit: maxCharacters,
        }),
        Table.configure({
            resizable: true,
            HTMLAttributes: {
                class: 'tiptap-table',
            },
        }),
        TableRow.configure({}),
        TableHeader.configure({}),
        TableCell.configure({}),
        TaskList.configure({}),
        TaskItem.configure({
            nested: true,
        }),
        Subscript.configure({}),
        Superscript.configure({}),
    ], [dir, placeholder, maxCharacters])

    const editor = useEditor({
        immediatelyRender: false, // Required for SSR safety
        extensions,
        content: contentJson || content,
        editable,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML(), editor.getJSON())
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none',
                dir: dir,
                style: `min-height: ${minHeight}; text-align: ${dir === 'rtl' ? 'right' : 'left'};`
            }
        }
    })

    // Update content when contentJson or content changes (for edit mode)
    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            const currentContent = editor.getJSON()
            const newContent = contentJson || content

            // Only update if content is different to avoid cursor jumping
            if (newContent && JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
                // Use setTimeout to avoid update during render
                setTimeout(() => {
                    if (editor && !editor.isDestroyed) {
                        editor.commands.setContent(newContent, false)
                    }
                }, 0)
            }
        }
    }, [editor, contentJson, content])

    const addImage = useCallback(() => {
        const url = window.prompt('رابط الصورة:')
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    const addLink = useCallback(() => {
        if (!editor) return

        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('الرابط:', previousUrl)

        if (url === null) return

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const removeLink = useCallback(() => {
        if (editor) {
            editor.chain().focus().unsetLink().run()
        }
    }, [editor])

    const insertTable = useCallback(() => {
        if (editor) {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
    }, [editor])

    if (!editor) return null

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void
        isActive?: boolean
        disabled?: boolean
        children: React.ReactNode
        title?: string
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={cn(
                'h-8 w-8',
                isActive && 'bg-slate-200 text-slate-900',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            {children}
        </Button>
    )

    const ToolbarDivider = () => (
        <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
    )

    return (
        <div className={cn('tiptap-editor border rounded-lg overflow-hidden', className)} dir={dir}>
            {/* Toolbar */}
            {editable && (
                <div className="toolbar flex gap-1 p-2 border-b bg-slate-50 flex-wrap">
                    {/* Text Formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="عريض (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="مائل (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="تسطير (Ctrl+U)"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="يتوسطه خط"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="كود"
                    >
                        <Code className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        title="نص سفلي"
                    >
                        <SubscriptIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        title="نص علوي"
                    >
                        <SuperscriptIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Text Color */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="لون النص">
                                <Palette className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[120px]">
                            {TEXT_COLORS.map((c) => (
                                <DropdownMenuItem
                                    key={c.color}
                                    onClick={() => editor.chain().focus().setColor(c.color).run()}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: c.color }} />
                                    <span>{c.name}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().unsetColor().run()}>
                                إزالة اللون
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Highlight Color */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="تظليل النص">
                                <Highlighter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[120px]">
                            {HIGHLIGHT_COLORS.map((c) => (
                                <DropdownMenuItem
                                    key={c.color}
                                    onClick={() => editor.chain().focus().toggleHighlight({ color: c.color }).run()}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-4 h-4 rounded border" style={{ backgroundColor: c.color }} />
                                    <span>{c.name}</span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
                                إزالة التظليل
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ToolbarDivider />

                    {/* Text Alignment */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        title="محاذاة لليمين"
                    >
                        <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="توسيط"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="محاذاة لليسار"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        title="ضبط"
                    >
                        <AlignJustify className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Headings */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="عنوان 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="عنوان 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="عنوان 3"
                    >
                        <Heading3 className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="قائمة نقطية"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="قائمة مرقمة"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive('taskList')}
                        title="قائمة مهام"
                    >
                        <ListTodo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="اقتباس"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="خط أفقي"
                    >
                        <Minus className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarDivider />

                    {/* Table */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-8 w-8', editor.isActive('table') && 'bg-slate-200')}
                                title="جدول"
                            >
                                <TableIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px]">
                            <DropdownMenuItem onClick={insertTable} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>إدراج جدول</span>
                            </DropdownMenuItem>
                            {editor.isActive('table') && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                                        className="flex items-center gap-2"
                                    >
                                        <Columns3 className="h-4 w-4" />
                                        <span>إضافة عمود</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().addRowAfter().run()}
                                        className="flex items-center gap-2"
                                    >
                                        <Rows3 className="h-4 w-4" />
                                        <span>إضافة صف</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteColumn().run()}
                                        className="flex items-center gap-2 text-red-600"
                                    >
                                        <Columns3 className="h-4 w-4" />
                                        <span>حذف عمود</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteRow().run()}
                                        className="flex items-center gap-2 text-red-600"
                                    >
                                        <Rows3 className="h-4 w-4" />
                                        <span>حذف صف</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => editor.chain().focus().deleteTable().run()}
                                        className="flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>حذف الجدول</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ToolbarDivider />

                    {/* Image and Link */}
                    <ToolbarButton onClick={addImage} title="إضافة صورة">
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={addLink}
                        isActive={editor.isActive('link')}
                        title="إضافة رابط"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </ToolbarButton>
                    {editor.isActive('link') && (
                        <ToolbarButton onClick={removeLink} title="إزالة الرابط">
                            <Unlink className="h-4 w-4" />
                        </ToolbarButton>
                    )}

                    <ToolbarDivider />

                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="تراجع (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="إعادة (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            )}

            {/* Bubble Menu - appears when selecting text */}
            {editor && editable && (
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="bg-white shadow-lg border rounded-lg p-1 flex gap-1"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn('h-8 w-8', editor.isActive('bold') && 'bg-slate-200')}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn('h-8 w-8', editor.isActive('italic') && 'bg-slate-200')}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={cn('h-8 w-8', editor.isActive('underline') && 'bg-slate-200')}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={cn('h-8 w-8', editor.isActive('strike') && 'bg-slate-200')}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-slate-200 self-center mx-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
                        className={cn('h-8 w-8', editor.isActive('highlight') && 'bg-slate-200')}
                    >
                        <Highlighter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={addLink}
                        className={cn('h-8 w-8', editor.isActive('link') && 'bg-slate-200')}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    {editor.isActive('link') && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeLink}
                            className="h-8 w-8"
                        >
                            <Unlink className="h-4 w-4" />
                        </Button>
                    )}
                </BubbleMenu>
            )}

            {/* Floating Menu - appears on empty lines */}
            {editor && editable && (
                <FloatingMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    className="bg-white shadow-lg border rounded-lg p-1 flex gap-1"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn('h-8 w-8', editor.isActive('heading', { level: 1 }) && 'bg-slate-200')}
                        title="عنوان 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn('h-8 w-8', editor.isActive('heading', { level: 2 }) && 'bg-slate-200')}
                        title="عنوان 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn('h-8 w-8', editor.isActive('bulletList') && 'bg-slate-200')}
                        title="قائمة نقطية"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn('h-8 w-8', editor.isActive('orderedList') && 'bg-slate-200')}
                        title="قائمة مرقمة"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={cn('h-8 w-8', editor.isActive('taskList') && 'bg-slate-200')}
                        title="قائمة مهام"
                    >
                        <ListTodo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={cn('h-8 w-8', editor.isActive('blockquote') && 'bg-slate-200')}
                        title="اقتباس"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="h-8 w-8"
                        title="إدراج جدول"
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={addImage}
                        className="h-8 w-8"
                        title="إدراج صورة"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </FloatingMenu>
            )}

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="p-4"
            />

            {/* Character Count */}
            {showCharacterCount && (
                <div className="px-4 py-2 border-t bg-slate-50 text-xs text-slate-500 flex justify-between">
                    <span>
                        {editor.storage.characterCount.characters()} حرف
                        {maxCharacters && ` / ${maxCharacters}`}
                    </span>
                    <span>{editor.storage.characterCount.words()} كلمة</span>
                </div>
            )}

            <style>{`
                .tiptap-editor .ProseMirror {
                    outline: none;
                    direction: ${dir};
                    text-align: ${dir === 'rtl' ? 'right' : 'left'};
                }

                .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: ${dir === 'rtl' ? 'right' : 'left'};
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }

                .tiptap-editor .ProseMirror ul,
                .tiptap-editor .ProseMirror ol {
                    padding-${dir === 'rtl' ? 'right' : 'left'}: 1.5rem;
                    padding-${dir === 'rtl' ? 'left' : 'right'}: 0;
                }

                .tiptap-editor .ProseMirror h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .tiptap-editor .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .tiptap-editor .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .tiptap-editor .ProseMirror blockquote {
                    border-${dir === 'rtl' ? 'right' : 'left'}: 3px solid #e2e8f0;
                    padding-${dir === 'rtl' ? 'right' : 'left'}: 1rem;
                    margin: 1rem 0;
                    color: #64748b;
                }

                .tiptap-editor .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                }

                .tiptap-editor .ProseMirror a {
                    color: #3b82f6;
                    text-decoration: underline;
                }

                .tiptap-editor .ProseMirror p {
                    margin-bottom: 0.75rem;
                }

                .tiptap-editor .ProseMirror code {
                    background-color: #f1f5f9;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    font-size: 0.875em;
                }

                .tiptap-editor .ProseMirror pre {
                    background-color: #1e293b;
                    color: #e2e8f0;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                }

                .tiptap-editor .ProseMirror pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                }

                .tiptap-editor .ProseMirror hr {
                    border: none;
                    border-top: 2px solid #e2e8f0;
                    margin: 1.5rem 0;
                }

                /* Table Styles */
                .tiptap-editor .ProseMirror table {
                    border-collapse: collapse;
                    margin: 1rem 0;
                    width: 100%;
                    table-layout: fixed;
                    overflow: hidden;
                }

                .tiptap-editor .ProseMirror td,
                .tiptap-editor .ProseMirror th {
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 0.75rem;
                    vertical-align: top;
                    box-sizing: border-box;
                    position: relative;
                    min-width: 100px;
                }

                .tiptap-editor .ProseMirror th {
                    font-weight: 600;
                    background-color: #f8fafc;
                    text-align: ${dir === 'rtl' ? 'right' : 'left'};
                }

                .tiptap-editor .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(59, 130, 246, 0.1);
                    pointer-events: none;
                }

                .tiptap-editor .ProseMirror .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: -2px;
                    width: 4px;
                    background-color: #3b82f6;
                    pointer-events: none;
                }

                .tiptap-editor .ProseMirror.resize-cursor {
                    cursor: col-resize;
                }

                /* Highlight mark */
                .tiptap-editor .ProseMirror mark {
                    border-radius: 0.125rem;
                    padding: 0.125rem 0;
                }

                /* Task List Styles */
                .tiptap-editor .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding-${dir === 'rtl' ? 'right' : 'left'}: 0.5rem;
                }

                .tiptap-editor .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }

                .tiptap-editor .ProseMirror ul[data-type="taskList"] li > label {
                    flex-shrink: 0;
                    margin-top: 0.25rem;
                }

                .tiptap-editor .ProseMirror ul[data-type="taskList"] li > div {
                    flex: 1;
                }

                .tiptap-editor .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
                    width: 1rem;
                    height: 1rem;
                    cursor: pointer;
                    accent-color: #3b82f6;
                    border-radius: 0.25rem;
                }

                .tiptap-editor .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
                    text-decoration: line-through;
                    color: #9ca3af;
                }

                /* Subscript and Superscript */
                .tiptap-editor .ProseMirror sub {
                    font-size: 0.75em;
                    vertical-align: sub;
                }

                .tiptap-editor .ProseMirror sup {
                    font-size: 0.75em;
                    vertical-align: super;
                }
            `}</style>
        </div>
    )
}

export default TipTapEditor
