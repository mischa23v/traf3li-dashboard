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

      // Set up input change listener if callback is provided
      if (onInputsChange) {
        const handleChange = () => {
          const currentInputs = formRef.current?.getInputs()
          if (currentInputs) {
            onInputsChange(currentInputs)
          }
        }

        // PDFMe Form doesn't have a built-in change event, so we poll or
        // the parent can call getInputs when needed via ref
        // For now, we'll let the parent control when to get inputs via ref
      }

      return () => {
        formRef.current?.destroy()
      }
    }, [template, lang])

    return <div ref={containerRef} className="h-full w-full" />
  }
)

PdfForm.displayName = 'PdfForm'
