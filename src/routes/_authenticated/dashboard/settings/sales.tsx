/**
 * Sales Settings Route
 *
 * Route for comprehensive sales settings page
 */

import { createFileRoute } from '@tanstack/react-router'
import { SalesSettingsPage } from '@/features/sales/components/settings/sales-settings-page'

export const Route = createFileRoute('/_authenticated/dashboard/settings/sales')({
  component: SalesSettingsPage,
})
