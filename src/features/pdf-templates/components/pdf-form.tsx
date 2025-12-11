import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Form } from '@pdfme/ui'
import type { Template } from '@pdfme/common'
import { getPlugins } from '@/lib/pdfme/plugins'

interface PdfFormProps {
  template: Template
  inputs?: Record<string, any>[]
  onInputsChange?: (inputs: Record<string, any>[]) => void
  lang?: 'en' | 'ar'
}

export interface PdfFormRef {
  getInputs: () => Record<string, any>[]
}

export const PdfForm = forwardRef<PdfFormRef, PdfFormProps>(
  ({ template, inputs = [{}], onInputsChange, lang = 'ar' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const formRef = useRef<Form | null>(null)
    // Store callback in ref to avoid recreating form when callback changes
    const onInputsChangeRef = useRef(onInputsChange)

    // Keep callback ref up to date
    useEffect(() => {
      onInputsChangeRef.current = onInputsChange
    }, [onInputsChange])

    useImperativeHandle(ref, () => ({
      getInputs: () => formRef.current?.getInputs() || []
    }))

    useEffect(() => {
      if (!containerRef.current) return

      formRef.current = new Form({
        domContainer: containerRef.current,
        template,
        inputs,
        plugins: getPlugins(),
        options: { lang }
      })

      return () => {
        // CRITICAL: Always destroy form instance to prevent memory leaks
        formRef.current?.destroy()
        formRef.current = null
      }
    }, [template, inputs, lang])

    return <div ref={containerRef} className="h-full w-full" />
  }
)

PdfForm.displayName = 'PdfForm'
