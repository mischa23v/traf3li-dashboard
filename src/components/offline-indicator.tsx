import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const { t } = useTranslation()
  const { isOffline } = useOnlineStatus()

  if (!isOffline) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-amber-500 text-white',
        'border-b border-amber-600',
        'shadow-md',
        'animate-in slide-in-from-top duration-300'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="h-5 w-5" aria-hidden="true" />
          <span className="font-medium">
            {t('offline.noConnection', 'No internet connection')}
          </span>
        </div>
      </div>
    </div>
  )
}
