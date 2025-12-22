import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface ApiKeyDisplayProps {
  apiKey: string
  className?: string
  showLabel?: boolean
}

export function ApiKeyDisplay({ apiKey, className, showLabel = true }: ApiKeyDisplayProps) {
  const { t } = useTranslation()
  const [isRevealed, setIsRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  // Mask the key (show first 7 and last 4 characters)
  const getMaskedKey = () => {
    if (apiKey.length <= 11) return apiKey
    const prefix = apiKey.substring(0, 7)
    const suffix = apiKey.substring(apiKey.length - 4)
    return `${prefix}${'•'.repeat(32)}${suffix}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy API key:', err)
    }
  }

  const toggleReveal = () => {
    setIsRevealed(!isRevealed)
    // Auto-hide after 10 seconds when revealed
    if (!isRevealed) {
      setTimeout(() => setIsRevealed(false), 10000)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <label className="text-sm font-medium text-muted-foreground">
          {t('apiKeys.apiKey')}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2">
          <code className="text-sm font-mono break-all">
            {isRevealed ? apiKey : getMaskedKey()}
          </code>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleReveal}
          className="shrink-0"
          title={isRevealed ? t('apiKeys.hide') : t('apiKeys.reveal')}
        >
          {isRevealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="shrink-0"
          title={t('apiKeys.copy')}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isRevealed && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('apiKeys.revealWarning')}
        </p>
      )}
    </div>
  )
}

interface CreatedKeyDisplayProps {
  apiKey: string
  onClose: () => void
}

/**
 * Special component to display newly created API key
 * Shows warning that it will only be displayed once
 */
export function CreatedKeyDisplay({ apiKey, onClose }: CreatedKeyDisplayProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy API key:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <div className="shrink-0 text-amber-600 dark:text-amber-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
              {t('apiKeys.saveKeyWarningTitle')}
            </h4>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {t('apiKeys.saveKeyWarning')}
            </p>
          </div>
        </div>
      </div>

      {/* API Key Display */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t('apiKeys.yourApiKey')}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
            <code className="text-sm font-mono break-all text-green-900 dark:text-green-100">
              {apiKey}
            </code>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className={cn(
              'shrink-0',
              copied && 'border-green-500 bg-green-50 dark:bg-green-900/20'
            )}
            title={t('apiKeys.copy')}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Copy Status */}
      {copied && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          <span>{t('apiKeys.copiedToClipboard')}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={onClose} disabled={!copied}>
          {copied ? t('common.done') : t('apiKeys.copyBeforeClosing')}
        </Button>
      </div>
    </div>
  )
}
