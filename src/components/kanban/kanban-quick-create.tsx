/**
 * Kanban Quick Create Component
 * Features:
 * - Inline form for quick card creation
 * - Title input with auto-focus
 * - Optional assignee selector
 * - Cancel/Save buttons
 * - Enter to save, Escape to cancel
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface KanbanQuickCreateProps {
  onSubmit: (title: string) => void
  onCancel: () => void
  isRTL?: boolean
}

export function KanbanQuickCreate({
  onSubmit,
  onCancel,
  isRTL = false,
}: KanbanQuickCreateProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmedTitle = title.trim()
    if (trimmedTitle) {
      onSubmit(trimmedTitle)
      setTitle('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="bg-white p-3 rounded-xl border-2 border-emerald-300 shadow-sm">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('kanban.quickCreate.placeholder', 'أدخل عنوان البطاقة...')}
        className="mb-2 border-slate-300 focus:border-emerald-400"
        dir={isRTL ? 'rtl' : 'ltr'}
      />

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-600 hover:text-slate-900"
        >
          <X className="h-4 w-4 ms-1" />
          {t('kanban.quickCreate.cancel', 'إلغاء')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Check className="h-4 w-4 ms-1" />
          {t('kanban.quickCreate.add', 'إضافة')}
        </Button>
      </div>
    </div>
  )
}
