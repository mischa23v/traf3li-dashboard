import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Module Visibility Store
 *
 * Stores which sidebar modules are visible/hidden.
 * Persisted to localStorage so settings survive page reloads.
 */

// Define the available modules that can be toggled
export type ToggleableModule =
  | 'hr'           // Human Resources
  | 'finance'      // Finance/Accounting
  | 'sales'        // Sales/CRM
  | 'inventory'    // Inventory Management
  | 'buying'       // Purchasing
  | 'assets'       // Asset Management
  | 'support'      // Help Desk/Support
  | 'library'      // Knowledge Library
  | 'excellence'   // Excellence/Reputation

// Module metadata for the settings UI
export interface ModuleInfo {
  key: ToggleableModule
  titleKey: string       // i18n key for the title
  descriptionKey: string // i18n key for the description
  icon: string           // Lucide icon name
  navGroupKey: string    // Sidebar nav group key to filter
}

// All toggleable modules with their metadata
export const TOGGLEABLE_MODULES: ModuleInfo[] = [
  {
    key: 'hr',
    titleKey: 'modules.hr.title',
    descriptionKey: 'modules.hr.description',
    icon: 'UserCog',
    navGroupKey: 'sidebar.nav.hrGroup',
  },
  {
    key: 'finance',
    titleKey: 'modules.finance.title',
    descriptionKey: 'modules.finance.description',
    icon: 'DollarSign',
    navGroupKey: 'sidebar.nav.financeGroup',
  },
  {
    key: 'sales',
    titleKey: 'modules.sales.title',
    descriptionKey: 'modules.sales.description',
    icon: 'TrendingUp',
    navGroupKey: 'sidebar.nav.salesGroup',
  },
  {
    key: 'inventory',
    titleKey: 'modules.inventory.title',
    descriptionKey: 'modules.inventory.description',
    icon: 'Package',
    navGroupKey: 'sidebar.nav.inventoryGroup',
  },
  {
    key: 'buying',
    titleKey: 'modules.buying.title',
    descriptionKey: 'modules.buying.description',
    icon: 'ShoppingCart',
    navGroupKey: 'sidebar.nav.buyingGroup',
  },
  {
    key: 'assets',
    titleKey: 'modules.assets.title',
    descriptionKey: 'modules.assets.description',
    icon: 'Building2',
    navGroupKey: 'sidebar.nav.assetsGroup',
  },
  {
    key: 'support',
    titleKey: 'modules.support.title',
    descriptionKey: 'modules.support.description',
    icon: 'Headphones',
    navGroupKey: 'sidebar.nav.supportGroup',
  },
  {
    key: 'library',
    titleKey: 'modules.library.title',
    descriptionKey: 'modules.library.description',
    icon: 'BookOpen',
    navGroupKey: 'sidebar.nav.libraryGroup',
  },
  {
    key: 'excellence',
    titleKey: 'modules.excellence.title',
    descriptionKey: 'modules.excellence.description',
    icon: 'Star',
    navGroupKey: 'sidebar.nav.excellenceGroup',
  },
]

interface ModuleVisibilityState {
  // Map of module key to visibility (true = visible, false = hidden)
  visibility: Record<ToggleableModule, boolean>

  // Actions
  setModuleVisibility: (module: ToggleableModule, visible: boolean) => void
  toggleModule: (module: ToggleableModule) => void
  isModuleVisible: (module: ToggleableModule) => boolean
  isNavGroupVisible: (navGroupKey: string) => boolean
  resetToDefaults: () => void
}

// Default: all modules visible
const defaultVisibility: Record<ToggleableModule, boolean> = {
  hr: true,
  finance: true,
  sales: true,
  inventory: true,
  buying: true,
  assets: true,
  support: true,
  library: true,
  excellence: true,
}

export const useModuleVisibilityStore = create<ModuleVisibilityState>()(
  persist(
    (set, get) => ({
      visibility: { ...defaultVisibility },

      setModuleVisibility: (module, visible) => {
        set((state) => ({
          visibility: {
            ...state.visibility,
            [module]: visible,
          },
        }))
      },

      toggleModule: (module) => {
        set((state) => ({
          visibility: {
            ...state.visibility,
            [module]: !state.visibility[module],
          },
        }))
      },

      isModuleVisible: (module) => {
        return get().visibility[module] ?? true
      },

      isNavGroupVisible: (navGroupKey) => {
        const moduleInfo = TOGGLEABLE_MODULES.find(m => m.navGroupKey === navGroupKey)
        if (!moduleInfo) return true // If not a toggleable module, always show
        return get().visibility[moduleInfo.key] ?? true
      },

      resetToDefaults: () => {
        set({ visibility: { ...defaultVisibility } })
      },
    }),
    {
      name: 'module-visibility',
      version: 1,
    }
  )
)
