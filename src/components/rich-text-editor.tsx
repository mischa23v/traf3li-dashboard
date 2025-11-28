import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { cn } from '@/lib/utils'
import './rich-text-editor.css'

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minHeight?: string
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minHeight = '200px'
}: RichTextEditorProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const editorRef = useRef<ClassicEditor | null>(null)

  const defaultPlaceholder = isRTL ? 'ابدأ الكتابة هنا...' : 'Start typing...'

  const editorConfig = {
    language: {
      ui: isRTL ? 'ar' : 'en',
      content: isRTL ? 'ar' : 'en'
    },
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'blockQuote',
      'insertTable',
      '|',
      'undo',
      'redo'
    ],
    placeholder: placeholder || defaultPlaceholder,
    heading: {
      options: isRTL
        ? [
            { model: 'paragraph' as const, title: 'فقرة', class: 'ck-heading_paragraph' },
            {
              model: 'heading1' as const,
              view: 'h1',
              title: 'عنوان 1',
              class: 'ck-heading_heading1'
            },
            {
              model: 'heading2' as const,
              view: 'h2',
              title: 'عنوان 2',
              class: 'ck-heading_heading2'
            },
            {
              model: 'heading3' as const,
              view: 'h3',
              title: 'عنوان 3',
              class: 'ck-heading_heading3'
            }
          ]
        : [
            { model: 'paragraph' as const, title: 'Paragraph', class: 'ck-heading_paragraph' },
            {
              model: 'heading1' as const,
              view: 'h1',
              title: 'Heading 1',
              class: 'ck-heading_heading1'
            },
            {
              model: 'heading2' as const,
              view: 'h2',
              title: 'Heading 2',
              class: 'ck-heading_heading2'
            },
            {
              model: 'heading3' as const,
              view: 'h3',
              title: 'Heading 3',
              class: 'ck-heading_heading3'
            }
          ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
  }

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value || '')
    }
  }, [value])

  return (
    <div
      className={cn(
        'rich-editor-wrapper rounded-md border border-input bg-background',
        isRTL && 'rtl',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ '--editor-min-height': minHeight } as React.CSSProperties}
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value || ''}
        disabled={disabled}
        onReady={(editor) => {
          editorRef.current = editor
          // Set RTL direction on the editable element
          const editable = editor.ui.view.editable.element
          if (editable) {
            editable.dir = isRTL ? 'rtl' : 'ltr'
            editable.style.textAlign = isRTL ? 'right' : 'left'
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData()
          onChange(data)
        }}
      />
    </div>
  )
}

export default RichTextEditor
