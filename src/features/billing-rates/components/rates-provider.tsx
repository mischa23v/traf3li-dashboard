import React, { createContext, useContext, useState } from 'react'
import type { BillingRate, RateGroup } from '../data/schema'

type DialogType = 'add-rate' | 'edit-rate' | 'view-rate' | 'delete-rate' | 'add-group' | 'edit-group' | 'view-group' | 'delete-group' | null

interface RatesContextType {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentRate: BillingRate | null
  setCurrentRate: (rate: BillingRate | null) => void
  currentGroup: RateGroup | null
  setCurrentGroup: (group: RateGroup | null) => void
  activeTab: 'rates' | 'groups'
  setActiveTab: (tab: 'rates' | 'groups') => void
}

const RatesContext = createContext<RatesContextType | null>(null)

interface RatesProviderProps {
  children: React.ReactNode
}

export function RatesProvider({ children }: RatesProviderProps) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRate, setCurrentRate] = useState<BillingRate | null>(null)
  const [currentGroup, setCurrentGroup] = useState<RateGroup | null>(null)
  const [activeTab, setActiveTab] = useState<'rates' | 'groups'>('rates')

  return (
    <RatesContext.Provider
      value={{
        open,
        setOpen,
        currentRate,
        setCurrentRate,
        currentGroup,
        setCurrentGroup,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </RatesContext.Provider>
  )
}

export function useRatesContext() {
  const context = useContext(RatesContext)
  if (!context) {
    throw new Error('useRatesContext must be used within a RatesProvider')
  }
  return context
}
