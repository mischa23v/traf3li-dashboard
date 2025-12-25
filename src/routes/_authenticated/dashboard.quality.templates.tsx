import { createFileRoute } from '@tanstack/react-router'

/**
 * Quality Inspection Templates Route
 * Placeholder for managing quality inspection templates
 */
function QualityTemplatesView() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quality Inspection Templates</h1>
      <p className="text-muted-foreground">
        This page will display and manage quality inspection templates.
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/quality/templates')({
  component: QualityTemplatesView,
})
