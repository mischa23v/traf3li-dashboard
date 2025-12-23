/**
 * Score Explanation Component
 * Displays SHAP-based feature explanations and sales-friendly recommendations
 */

import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Loader2,
  AlertCircle,
  Siren,
  Clock,
  Calendar,
  Sprout,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useScoreExplanation } from '@/hooks/useMlScoring'
import type { SHAPExplanation, SalesExplanation } from '@/services/mlScoringApi'

// ==================== TYPES ====================

interface ScoreExplanationProps {
  leadId: string
  className?: string
}

interface ScoreExplanationContentProps {
  shap: SHAPExplanation
  salesExplanation: SalesExplanation
  className?: string
}

type UrgencyLevel = 'immediate' | 'soon' | 'scheduled' | 'nurture'

// ==================== CONSTANTS ====================

const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { bg: string; text: string; border: string; icon: typeof Siren; label: { ar: string; en: string } }
> = {
  immediate: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: Siren,
    label: { ar: 'إجراء فوري مطلوب', en: 'Immediate Action Required' },
  },
  soon: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Clock,
    label: { ar: 'متابعة قريباً', en: 'Follow Up Soon' },
  },
  scheduled: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Calendar,
    label: { ar: 'جدولة المتابعة', en: 'Schedule Follow-Up' },
  },
  nurture: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: Sprout,
    label: { ar: 'إضافة لحملة الرعاية', en: 'Add to Nurture Campaign' },
  },
}

// ==================== HELPERS ====================

const formatFeatureName = (name: string, isRTL: boolean): string => {
  // Feature name translations
  const translations: Record<string, { ar: string; en: string }> = {
    engagementVelocity: { ar: 'سرعة التفاعل', en: 'Engagement Velocity' },
    responseSpeedPercentile: { ar: 'سرعة الاستجابة', en: 'Response Speed' },
    meetingReliability: { ar: 'موثوقية الاجتماعات', en: 'Meeting Reliability' },
    urgencySignal: { ar: 'إشارة الاستعجال', en: 'Urgency Signal' },
    activitiesLast7d: { ar: 'أنشطة آخر 7 أيام', en: 'Activities Last 7 Days' },
    activityTrend: { ar: 'اتجاه النشاط', en: 'Activity Trend' },
    sourceConversionRate: { ar: 'معدل تحويل المصدر', en: 'Source Conversion Rate' },
    budgetScore: { ar: 'درجة الميزانية', en: 'Budget Score' },
    authorityScore: { ar: 'درجة الصلاحية', en: 'Authority Score' },
    needScore: { ar: 'درجة الحاجة', en: 'Need Score' },
    timelineScore: { ar: 'درجة الجدول الزمني', en: 'Timeline Score' },
  }

  const translation = translations[name]
  if (translation) {
    return isRTL ? translation.ar : translation.en
  }

  // Fallback: convert camelCase to readable format
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace('_', ' ')
}

// ==================== SUB-COMPONENTS ====================

interface FactorBarProps {
  feature: string
  impact: number
  isPositive: boolean
  isRTL: boolean
}

const FactorBar = ({ feature, impact, isPositive, isRTL }: FactorBarProps) => {
  const width = Math.min(Math.abs(impact) * 200, 100)
  const impactPercent = (impact * 100).toFixed(1)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-32 truncate">{formatFeatureName(feature, isRTL)}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 flex items-center justify-end pe-2',
              isPositive ? 'bg-emerald-500' : 'bg-red-500'
            )}
            style={{ width: `${width}%` }}
          >
            <span className="text-[10px] font-medium text-white">
              {isPositive ? '+' : ''}
              {impactPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function ScoreExplanation({ leadId, className }: ScoreExplanationProps) {
  const { data, isLoading, isError, error } = useScoreExplanation(leadId)

  if (isLoading) {
    return <ScoreExplanationSkeleton />
  }

  if (isError) {
    return (
      <Card className={cn('rounded-2xl border-slate-100', className)}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600">{error?.message || 'Failed to load explanation'}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data?.data) {
    return (
      <Card className={cn('rounded-2xl border-slate-100', className)}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No explanation available</p>
        </CardContent>
      </Card>
    )
  }

  return <ScoreExplanationContent shap={data.data.shap} salesExplanation={data.data.salesExplanation} className={className} />
}

export function ScoreExplanationContent({ shap, salesExplanation, className }: ScoreExplanationContentProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const urgencyConfig = URGENCY_CONFIG[salesExplanation?.urgencyLevel || 'scheduled']
  const UrgencyIcon = urgencyConfig.icon

  return (
    <Card className={cn('rounded-2xl border-slate-100 overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Urgency Banner */}
        <div className={cn('p-4 border-b flex items-center gap-3', urgencyConfig.bg, urgencyConfig.border)}>
          <UrgencyIcon className={cn('w-6 h-6', urgencyConfig.text)} />
          <span className={cn('font-bold', urgencyConfig.text)}>
            {isRTL ? urgencyConfig.label.ar : urgencyConfig.label.en}
          </span>
        </div>

        <div className="p-5 space-y-6">
          {/* Sales-Friendly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strengths */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {t('mlScoring.keyStrengths', 'Key Strengths')}
              </h4>
              <ul className="space-y-2">
                {salesExplanation?.keyStrengths?.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>{strength}</span>
                  </li>
                )) || <li className="text-sm text-slate-400">{t('mlScoring.noStrengths', 'No strengths identified')}</li>}
              </ul>
            </div>

            {/* Key Weaknesses */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {t('mlScoring.areasOfConcern', 'Areas of Concern')}
              </h4>
              <ul className="space-y-2">
                {salesExplanation?.keyWeaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                )) || <li className="text-sm text-slate-400">{t('mlScoring.noConcerns', 'No concerns identified')}</li>}
              </ul>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-bold text-blue-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              {t('mlScoring.recommendedActions', 'Recommended Actions')}
            </h4>
            <ol className="space-y-2">
              {salesExplanation?.recommendedActions?.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-blue-700">
                  <Badge variant="outline" className="shrink-0 rounded-full border-blue-300 text-blue-600 px-2 py-0">
                    {i + 1}
                  </Badge>
                  <span>{action}</span>
                </li>
              )) || <li className="text-sm text-blue-400">{t('mlScoring.noActions', 'No actions recommended')}</li>}
            </ol>
          </div>

          {/* SHAP Waterfall Chart */}
          {shap && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                {t('mlScoring.factorImpact', 'Factor Impact Analysis')}
              </h4>

              {/* Base Value */}
              <div className="flex items-center gap-2 text-sm text-slate-500 p-2 bg-slate-50 rounded-lg">
                <span>{t('mlScoring.baseValue', 'Base Value')}:</span>
                <span className="font-bold text-slate-700">{(shap.baseValue * 100).toFixed(1)}%</span>
              </div>

              {/* Positive Factors */}
              {shap.topPositiveFactors && shap.topPositiveFactors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    {t('mlScoring.positiveFactors', 'Positive Factors')}
                  </h5>
                  {shap.topPositiveFactors.map((factor, i) => (
                    <FactorBar key={`pos-${i}`} feature={factor.feature} impact={factor.impact} isPositive={true} isRTL={isRTL} />
                  ))}
                </div>
              )}

              {/* Negative Factors */}
              {shap.topNegativeFactors && shap.topNegativeFactors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-red-600 uppercase tracking-wide">
                    {t('mlScoring.negativeFactors', 'Negative Factors')}
                  </h5>
                  {shap.topNegativeFactors.map((factor, i) => (
                    <FactorBar
                      key={`neg-${i}`}
                      feature={factor.feature}
                      impact={factor.impact}
                      isPositive={false}
                      isRTL={isRTL}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== SKELETON ====================

export function ScoreExplanationSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-100 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b bg-slate-50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScoreExplanation
