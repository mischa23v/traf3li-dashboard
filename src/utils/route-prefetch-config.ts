import { ROUTES } from '@/constants/routes'

/**
 * Configuration for route prefetching strategies
 *
 * This file defines which routes should be prefetched proactively
 * to improve navigation performance for commonly accessed pages.
 */

/**
 * Routes that should be prefetched after initial page load
 * These are typically the most commonly accessed routes in your application
 */
export const HIGH_PRIORITY_ROUTES = [
  ROUTES.dashboard.cases.list,
  ROUTES.dashboard.clients.list,
  ROUTES.dashboard.contacts.list,
  ROUTES.dashboard.calendar,
] as const

/**
 * Routes that should be prefetched when the user is idle
 * These are less frequently accessed but still important routes
 */
export const LOW_PRIORITY_ROUTES = [
  ROUTES.dashboard.billingRates.list,
  ROUTES.dashboard.cases.pipeline,
  ROUTES.dashboard.cases.pipelineBoard,
] as const

/**
 * Routes grouped by feature area for batch prefetching
 */
export const ROUTE_GROUPS = {
  cases: [
    ROUTES.dashboard.cases.list,
    ROUTES.dashboard.cases.new,
    ROUTES.dashboard.cases.pipeline,
  ],
  crm: [
    ROUTES.dashboard.clients.list,
    ROUTES.dashboard.contacts.list,
  ],
  billing: [
    ROUTES.dashboard.billingRates.list,
  ],
} as const
