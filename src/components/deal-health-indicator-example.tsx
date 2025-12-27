/**
 * DealHealthIndicator Usage Examples
 *
 * This file demonstrates how to use the DealHealthIndicator component
 * in various scenarios and modes.
 */

import { DealHealthIndicator, DealHealthFactor } from './deal-health-indicator'

// Example 1: Compact Mode (Default)
export function CompactExample() {
  return (
    <div className="flex gap-4 flex-wrap">
      <DealHealthIndicator grade="A" score={95} />
      <DealHealthIndicator grade="B" score={85} />
      <DealHealthIndicator grade="C" score={75} />
      <DealHealthIndicator grade="D" score={65} />
      <DealHealthIndicator grade="F" score={45} />
    </div>
  )
}

// Example 2: Compact Mode with Tooltip and Factors
export function CompactWithFactorsExample() {
  const factors: DealHealthFactor[] = [
    { name: 'Client Engagement', score: 90, weight: 0.3 },
    { name: 'Payment History', score: 95, weight: 0.25 },
    { name: 'Response Time', score: 88, weight: 0.2 },
    { name: 'Documentation Quality', score: 92, weight: 0.15 },
    { name: 'Communication', score: 85, weight: 0.1 },
  ]

  return (
    <div className="flex gap-4">
      <DealHealthIndicator
        grade="A"
        score={91}
        factors={factors}
        mode="compact"
        showTooltip={true}
      />
    </div>
  )
}

// Example 3: Compact Mode without Tooltip
export function CompactWithoutTooltipExample() {
  return (
    <DealHealthIndicator
      grade="B"
      score={82}
      mode="compact"
      showTooltip={false}
    />
  )
}

// Example 4: Full Mode with All Features
export function FullModeExample() {
  const factors: DealHealthFactor[] = [
    { name: 'Client Engagement', score: 90, weight: 0.3 },
    { name: 'Payment History', score: 95, weight: 0.25 },
    { name: 'Response Time', score: 88, weight: 0.2 },
    { name: 'Documentation Quality', score: 92, weight: 0.15 },
    { name: 'Communication', score: 85, weight: 0.1 },
  ]

  return (
    <div className="max-w-md">
      <DealHealthIndicator
        grade="A"
        score={91}
        factors={factors}
        mode="full"
      />
    </div>
  )
}

// Example 5: Full Mode without Factors
export function FullModeSimpleExample() {
  return (
    <div className="max-w-md">
      <DealHealthIndicator
        grade="C"
        score={73}
        mode="full"
      />
    </div>
  )
}

// Example 6: All Grades in Full Mode
export function AllGradesFullModeExample() {
  const createFactors = (baseScore: number): DealHealthFactor[] => [
    { name: 'Client Engagement', score: baseScore + 2, weight: 0.3 },
    { name: 'Payment History', score: baseScore - 3, weight: 0.25 },
    { name: 'Response Time', score: baseScore + 5, weight: 0.2 },
    { name: 'Documentation Quality', score: baseScore - 1, weight: 0.15 },
    { name: 'Communication', score: baseScore + 1, weight: 0.1 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DealHealthIndicator
        grade="A"
        score={95}
        factors={createFactors(95)}
        mode="full"
      />
      <DealHealthIndicator
        grade="B"
        score={85}
        factors={createFactors(85)}
        mode="full"
      />
      <DealHealthIndicator
        grade="C"
        score={75}
        factors={createFactors(75)}
        mode="full"
      />
      <DealHealthIndicator
        grade="D"
        score={65}
        factors={createFactors(65)}
        mode="full"
      />
      <DealHealthIndicator
        grade="F"
        score={45}
        factors={createFactors(45)}
        mode="full"
      />
    </div>
  )
}

// Example 7: In a Table/List Context
export function TableContextExample() {
  const deals = [
    { id: 1, name: 'Deal A', grade: 'A' as const, score: 92 },
    { id: 2, name: 'Deal B', grade: 'B' as const, score: 84 },
    { id: 3, name: 'Deal C', grade: 'C' as const, score: 76 },
    { id: 4, name: 'Deal D', grade: 'D' as const, score: 63 },
    { id: 5, name: 'Deal F', grade: 'F' as const, score: 48 },
  ]

  return (
    <div className="space-y-2">
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="flex items-center justify-between p-4 rounded-lg border bg-white"
        >
          <span className="font-medium">{deal.name}</span>
          <DealHealthIndicator
            grade={deal.grade}
            score={deal.score}
            mode="compact"
          />
        </div>
      ))}
    </div>
  )
}

// Example 8: RTL (Arabic) Context
export function RTLExample() {
  const factors: DealHealthFactor[] = [
    { name: 'تفاعل العميل', score: 90, weight: 0.3 },
    { name: 'تاريخ الدفع', score: 95, weight: 0.25 },
    { name: 'وقت الاستجابة', score: 88, weight: 0.2 },
    { name: 'جودة التوثيق', score: 92, weight: 0.15 },
    { name: 'التواصل', score: 85, weight: 0.1 },
  ]

  return (
    <div className="max-w-md" dir="rtl">
      <DealHealthIndicator
        grade="A"
        score={91}
        factors={factors}
        mode="full"
      />
    </div>
  )
}

// Example 9: Custom Styling
export function CustomStyledExample() {
  return (
    <div className="flex gap-4">
      <DealHealthIndicator
        grade="A"
        score={95}
        mode="compact"
        className="shadow-lg ring-2 ring-green-200"
      />
      <DealHealthIndicator
        grade="B"
        score={85}
        mode="compact"
        className="shadow-lg ring-2 ring-blue-200"
      />
    </div>
  )
}

// Example 10: Without Score
export function WithoutScoreExample() {
  return (
    <div className="flex gap-4">
      <DealHealthIndicator grade="A" mode="compact" />
      <DealHealthIndicator grade="B" mode="compact" />
      <DealHealthIndicator grade="C" mode="compact" />
    </div>
  )
}
