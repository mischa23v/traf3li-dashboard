/**
 * Upgrade Modal Store
 * Global state management for plan upgrade modal using Zustand
 */

import { create } from 'zustand'

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise'

interface UpgradeStore {
  // State
  isOpen: boolean
  triggerFeature: string | null
  recommendedPlan: PlanType | null

  // Actions
  openUpgradeModal: (feature?: string, recommendedPlan?: PlanType) => void
  closeUpgradeModal: () => void
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  // Initial State
  isOpen: false,
  triggerFeature: null,
  recommendedPlan: null,

  /**
   * Open Upgrade Modal
   * @param feature - Optional feature name that triggered the modal
   * @param recommendedPlan - Optional recommended plan for the feature
   */
  openUpgradeModal: (feature?: string, recommendedPlan?: PlanType) => {
    set({
      isOpen: true,
      triggerFeature: feature || null,
      recommendedPlan: recommendedPlan || null,
    })
  },

  /**
   * Close Upgrade Modal
   */
  closeUpgradeModal: () => {
    set({
      isOpen: false,
      triggerFeature: null,
      recommendedPlan: null,
    })
  },
}))

/**
 * Selectors for easy access to specific state
 */
export const selectIsOpen = (state: UpgradeStore) => state.isOpen
export const selectTriggerFeature = (state: UpgradeStore) => state.triggerFeature
export const selectRecommendedPlan = (state: UpgradeStore) =>
  state.recommendedPlan
