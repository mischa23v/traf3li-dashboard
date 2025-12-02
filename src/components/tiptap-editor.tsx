import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import {
    Bold, Italic, Strikethrough, AlignRight, AlignCenter, AlignLeft,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote, Image as ImageIcon,
    Link as LinkIcon, Undo, Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TipTapEditorProps {
    content?: string
    contentJson?: any
    onChange?: (html: string, json: any) => void
    placeholder?: string
    editable?: boolean
    dir?: 'rtl' | 'ltr'
    className?: string
    minHeight?: string
}

export const TipTapEditor = ({
    content = '',
    contentJson,
    onChange,
    placeholder = 'اكتب هنا...',
    editable = true,
    dir = 'rtl',
    className,
    minHeight = '200px'
}: TipTapEditorProps) => {
    const editor = useEditor({
        extensions: [
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
        ],
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

    if (!editor) return null

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title
    }: {
        onClick: () => void
        isActive?: boolean
        children: React.ReactNode
        title?: string
    }) => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClick}
            title={title}
            className={cn(
                'h-8 w-8',
                isActive && 'bg-slate-200 text-slate-900'
            )}
        >
            {children}
        </Button>
    )

    const addImage = () => {
        const url = window.prompt('رابط الصورة:')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const addLink = () => {
        const url = window.prompt('الرابط:')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    return (
        <div className={cn('tiptap-editor border rounded-lg overflow-hidden', className)} dir={dir}>
            {/* Toolbar */}
            {editable && (
                <div className="toolbar flex gap-1 p-2 border-b bg-slate-50 flex-wrap">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="عريض"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="مائل"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="يتوسطه خط"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

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

                    <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

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

                    <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

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
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="اقتباس"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                    <ToolbarButton onClick={addImage} title="إضافة صورة">
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton onClick={addLink} title="إضافة رابط">
                        <LinkIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        title="تراجع"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        title="إعادة"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent
                editor={editor}
                className="p-4"
            />

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
            `}</style>
        </div>
    )
}

export default TipTapEditor
