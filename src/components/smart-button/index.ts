/**
 * Smart Button Components - Odoo-style
 * Export all smart button related components and utilities
 */

export { SmartButton } from './smart-button'
export type { SmartButtonProps } from './smart-button'

export { SmartButtonGroup } from './smart-button-group'
export type { SmartButtonGroupProps } from './smart-button-group'

export {
  smartButtonConfigs,
  getSmartButtons,
  getSmartButton,
  resolveNavigationPath,
} from './smart-button-config'
export type { SmartButtonConfig, EntityType } from './smart-button-config'
