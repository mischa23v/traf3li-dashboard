import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast as sonnerToast } from 'sonner'

interface OnlineStatus {
  isOnline: boolean
  isOffline: boolean
}

export function useOnlineStatus(): OnlineStatus {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      sonnerToast.success(t('offline.backOnline', 'Back online'))
    }

    const handleOffline = () => {
      setIsOnline(false)
      sonnerToast.warning(t('offline.noConnection', 'No internet connection'))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [t])

  return {
    isOnline,
    isOffline: !isOnline,
  }
}
