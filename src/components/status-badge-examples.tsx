/**
 * StatusBadge Component - Usage Examples
 *
 * This file demonstrates how to use the StatusBadge component
 * across different parts of the application.
 */

import { StatusBadge, getStatusLabel, getStatusesForType } from './status-badge'

// Example 1: Basic Lead Status Badge
export function LeadStatusExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Lead Statuses</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="new" type="lead" />
        <StatusBadge status="contacted" type="lead" />
        <StatusBadge status="qualified" type="lead" />
        <StatusBadge status="proposal" type="lead" />
        <StatusBadge status="negotiation" type="lead" />
        <StatusBadge status="won" type="lead" />
        <StatusBadge status="lost" type="lead" />
        <StatusBadge status="dormant" type="lead" />
      </div>
    </div>
  )
}

// Example 2: Quote Status Badges
export function QuoteStatusExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Quote Statuses</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="draft" type="quote" />
        <StatusBadge status="sent" type="quote" />
        <StatusBadge status="viewed" type="quote" />
        <StatusBadge status="accepted" type="quote" />
        <StatusBadge status="rejected" type="quote" />
        <StatusBadge status="expired" type="quote" />
        <StatusBadge status="revised" type="quote" />
      </div>
    </div>
  )
}

// Example 3: Campaign Status Badges
export function CampaignStatusExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Campaign Statuses</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="draft" type="campaign" />
        <StatusBadge status="scheduled" type="campaign" />
        <StatusBadge status="active" type="campaign" />
        <StatusBadge status="paused" type="campaign" />
        <StatusBadge status="completed" type="campaign" />
        <StatusBadge status="cancelled" type="campaign" />
      </div>
    </div>
  )
}

// Example 4: Client Credit Status Badges
export function CreditStatusExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Client Credit Statuses</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="good" type="credit" />
        <StatusBadge status="warning" type="credit" />
        <StatusBadge status="hold" type="credit" />
        <StatusBadge status="blacklisted" type="credit" />
      </div>
    </div>
  )
}

// Example 5: Contact Conflict Status Badges
export function ConflictStatusExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Contact Conflict Statuses</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="not_checked" type="conflict" />
        <StatusBadge status="clear" type="conflict" />
        <StatusBadge status="potential_conflict" type="conflict" />
        <StatusBadge status="confirmed_conflict" type="conflict" />
      </div>
    </div>
  )
}

// Example 6: Different Sizes
export function SizeVariantsExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Size Variants</h3>
      <div className="flex items-center gap-3">
        <StatusBadge status="new" type="lead" size="sm" />
        <StatusBadge status="contacted" type="lead" size="md" />
        <StatusBadge status="qualified" type="lead" size="lg" />
      </div>
    </div>
  )
}

// Example 7: Custom Labels
export function CustomLabelExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Custom Labels</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="new" type="lead" label="Brand New Lead" />
        <StatusBadge status="won" type="lead" label="Successfully Converted" />
        <StatusBadge status="accepted" type="quote" label="Client Approved" />
      </div>
    </div>
  )
}

// Example 8: With Custom Classes
export function CustomClassExample() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Custom Styling</h3>
      <div className="flex flex-wrap gap-2">
        <StatusBadge
          status="won"
          type="lead"
          className="font-bold shadow-md"
        />
        <StatusBadge
          status="active"
          type="campaign"
          className="rounded-full"
        />
      </div>
    </div>
  )
}

// Example 9: Using in a Table
export function TableExample() {
  const leads = [
    { id: 1, name: 'John Doe', status: 'new' },
    { id: 2, name: 'Jane Smith', status: 'contacted' },
    { id: 3, name: 'Bob Johnson', status: 'won' },
    { id: 4, name: 'Alice Brown', status: 'lost' },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Table Usage</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-start">Name</th>
            <th className="p-2 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="p-2">{lead.name}</td>
              <td className="p-2">
                <StatusBadge status={lead.status} type="lead" size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Example 10: Using Helper Functions
export function HelperFunctionsExample() {
  // Get all statuses for a type
  const leadStatuses = getStatusesForType('lead')

  // Get status label in specific language
  const englishLabel = getStatusLabel('new', 'lead', 'en')
  const arabicLabel = getStatusLabel('new', 'lead', 'ar')

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Helper Functions</h3>
      <div className="space-y-2">
        <p>All lead statuses: {leadStatuses.join(', ')}</p>
        <p>English label: {englishLabel}</p>
        <p>Arabic label: {arabicLabel}</p>
      </div>
    </div>
  )
}

// Example 11: Complete Dashboard Example
export function DashboardExample() {
  return (
    <div className="space-y-4">
      <LeadStatusExample />
      <QuoteStatusExample />
      <CampaignStatusExample />
      <CreditStatusExample />
      <ConflictStatusExample />
      <SizeVariantsExample />
      <CustomLabelExample />
      <CustomClassExample />
      <TableExample />
      <HelperFunctionsExample />
    </div>
  )
}
