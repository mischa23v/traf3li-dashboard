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
  '/dashboard/cases',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/calendar',
] as const

/**
 * Routes that should be prefetched when the user is idle
 * These are less frequently accessed but still important routes
 */
export const LOW_PRIORITY_ROUTES = [
  '/dashboard/billing-rates',
  '/dashboard/cases/pipeline',
  '/dashboard/cases/pipeline/board',
] as const

/**
 * Routes grouped by feature area for batch prefetching
 */
export const ROUTE_GROUPS = {
  cases: [
    '/dashboard/cases',
    '/dashboard/cases/new',
    '/dashboard/cases/pipeline',
  ],
  crm: [
    '/dashboard/clients',
    '/dashboard/contacts',
  ],
  billing: [
    '/dashboard/billing-rates',
  ],
} as const
