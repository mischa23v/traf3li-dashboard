import { useRef, useEffect } from 'react'
import { Viewer } from '@pdfme/ui'
import type { Template } from '@pdfme/common'
import { getPlugins } from '@/lib/pdfme/plugins'

interface PdfViewerProps {
  template: Template
  inputs: Record<string, any>[]
  lang?: 'en' | 'ar'
}

export function PdfViewer({ template, inputs, lang = 'ar' }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    viewerRef.current = new Viewer({
      domContainer: containerRef.current,
      template,
      inputs,
      plugins: getPlugins(),
      options: { lang }
    })

    return () => viewerRef.current?.destroy()
  }, [template, inputs, lang])

  return <div ref={containerRef} className="h-full w-full" />
}
