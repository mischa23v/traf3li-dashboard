import { createFileRoute, useParams } from '@tanstack/react-router'
import CaseNotion from '@/features/case-notion'

function CaseNotionPage() {
  const { caseId, pageId } = useParams({
    from: '/_authenticated/dashboard/cases/$caseId/notion/$pageId',
  })
  return <CaseNotion caseId={caseId} pageId={pageId} />
}

export const Route = createFileRoute(
  '/_authenticated/dashboard/cases/$caseId/notion/$pageId'
)({
  component: CaseNotionPage,
})
