import { useRef, useEffect } from 'react'
import { Designer } from '@pdfme/ui'
import type { Template } from '@pdfme/common'
import { BLANK_PDF } from '@pdfme/common'
import { getPlugins } from '@/lib/pdfme/plugins'
import { fonts, themeConfig } from '@/lib/pdfme/config'
import { Button } from '@/components/ui/button'

interface PdfDesignerProps {
  template?: Template
  onSave?: (template: Template) => void
  onCancel?: () => void
  lang?: 'en' | 'ar'
}

const translations = {
  en: {
    save: 'Save',
    cancel: 'Cancel',
  },
  ar: {
    save: 'حفظ',
    cancel: 'إلغاء',
  },
}

export function PdfDesigner({
  template,
  onSave,
  onCancel,
  lang = 'ar'
}: PdfDesignerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const designerRef = useRef<Designer | null>(null)

  const t = translations[lang]

  useEffect(() => {
    if (!containerRef.current) return

    const defaultTemplate: Template = {
      basePdf: BLANK_PDF,
      schemas: [[]],
    }

    designerRef.current = new Designer({
      domContainer: containerRef.current,
      template: template || defaultTemplate,
      plugins: getPlugins(),
      options: {
        font: fonts,
        theme: themeConfig,
        lang,
      },
    })

    return () => {
      designerRef.current?.destroy()
      designerRef.current = null
    }
  }, [template, lang])

  const handleSave = () => {
    if (designerRef.current && onSave) {
      const currentTemplate = designerRef.current.getTemplate()
      onSave(currentTemplate)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end gap-2 p-4 border-b">
        <Button onClick={handleSave} variant="default">
          {t.save}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={handleCancel}>
            {t.cancel}
          </Button>
        )}
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
