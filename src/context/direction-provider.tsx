import { createContext, useContext, useEffect, useState } from 'react'
import { DirectionProvider as RdxDirProvider } from '@radix-ui/react-direction'
import { useTranslation } from 'react-i18next'

export type Direction = 'ltr' | 'rtl'

type DirectionContextType = {
  dir: Direction
}

const DirectionContext = createContext<DirectionContextType | null>(null)

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [dir, setDir] = useState<Direction>(() => 
    i18n.language === 'ar' ? 'rtl' : 'ltr'
  )

  useEffect(() => {
    // Sync direction with i18n language changes
    const updateDirection = (lng: string) => {
      const newDir = lng === 'ar' ? 'rtl' : 'ltr'
      setDir(newDir)
      document.documentElement.setAttribute('dir', newDir)
    }

    // Set initial direction
    updateDirection(i18n.language)

    // Listen to language changes
    i18n.on('languageChanged', updateDirection)

    return () => {
      i18n.off('languageChanged', updateDirection)
    }
  }, [i18n])

  return (
    <DirectionContext.Provider value={{ dir }}>
      <RdxDirProvider dir={dir}>{children}</RdxDirProvider>
    </DirectionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
  const context = useContext(DirectionContext)
  if (!context) {
    throw new Error('useDirection must be used within a DirectionProvider')
  }
  return context
}