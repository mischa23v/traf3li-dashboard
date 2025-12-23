/**
 * ML Score Card Component
 * Displays ML lead scoring information with visual indicators
 */

import { useTranslation } from 'react-i18next'
import { RefreshCw, TrendingUp, Clock, User, Target, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { MLScore, PriorityTier } from '@/services/mlScoringApi'

// ==================== TYPES ====================

interface MLScoreCardProps {
  score: MLScore
  onRecalculate?: () => void
  isRecalculating?: boolean
  showDetails?: boolean
  className?: string
}

// ==================== CONSTANTS ====================

const TIER_CONFIG: Record<PriorityTier, { bg: string; border: string; text: string; icon: string; label: { ar: string; en: string } }> = {
  P1_HOT: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: '🔥',
    label: { ar: 'ساخن - أولوية 1', en: 'Hot - Priority 1' },
  },
  P2_WARM: {
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-700',
    icon: '☀️',
    label: { ar: 'دافئ - أولوية 2', en: 'Warm - Priority 2' },
  },
  P3_COOL: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
    icon: '❄️',
    label: { ar: 'بارد - أولوية 3', en: 'Cool - Priority 3' },
  },
  P4_NURTURE: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-700',
    icon: '🌱',
    label: { ar: 'رعاية - أولوية 4', en: 'Nurture - Priority 4' },
  },
}

// ==================== HELPERS ====================

const getProbabilityColor = (probability: number): string => {
  if (probability >= 70) return '#22c55e' // Green
  if (probability >= 50) return '#f59e0b' // Amber
  if (probability >= 30) return '#f97316' // Orange
  return '#ef4444' // Red
}

const getProbabilityBgColor = (probability: number): string => {
  if (probability >= 70) return 'bg-emerald-100 text-emerald-700'
  if (probability >= 50) return 'bg-amber-100 text-amber-700'
  if (probability >= 30) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

const formatTimeUntil = (deadline: string, isRTL: boolean): string => {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff < 0) return isRTL ? 'متأخر!' : 'Overdue!'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return isRTL ? `${days} يوم ${remainingHours} ساعة` : `${days}d ${remainingHours}h`
  }
  return isRTL ? `${hours} ساعة ${minutes} دقيقة` : `${hours}h ${minutes}m`
}

const normalizeValue = (value: number, min = 0, max = 100): number => {
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)
}

// ==================== SUB-COMPONENTS ====================

interface FeatureBarProps {
  label: string
  value: number
  maxValue?: number
}

const FeatureBar = ({ label, value, maxValue = 100 }: FeatureBarProps) => {
  const normalizedValue = normalizeValue(value, 0, maxValue)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-700 w-10 text-end">{value.toFixed(0)}</span>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function MLScoreCard({ score, onRecalculate, isRecalculating = false, showDetails = true, className }: MLScoreCardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const tierConfig = TIER_CONFIG[score.salesPriority.tier]
  const probability = score.mlScore.probability * 100
  const probabilityColor = getProbabilityColor(probability)

  return (
    <Card className={cn('rounded-2xl border-slate-100 overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header with Tier Badge */}
        <div className={cn('p-4 border-b-2', tierConfig.bg, tierConfig.border)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{tierConfig.icon}</span>
              <span className={cn('font-bold', tierConfig.text)}>
                {isRTL ? tierConfig.label.ar : tierConfig.label.en}
              </span>
            </div>
            <Badge className={cn('border-0 rounded-full px-3', getProbabilityBgColor(probability))}>
              {probability.toFixed(0)}% {isRTL ? 'تحويل' : 'Conversion'}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Main Score Circle */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={probabilityColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${probability * 2.64} 264`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{probability.toFixed(0)}%</span>
                <span className="text-xs text-slate-500">{t('mlScoring.conversion', 'Conversion')}</span>
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-slate-200">
              <Target className="w-3 h-3 me-1" />
              {t('mlScoring.confidence', 'Confidence')}: {(score.mlScore.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Expected Value & SLA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{t('mlScoring.expectedValue', 'Expected Value')}</span>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {score.salesPriority.expectedValue?.toLocaleString() || 0}{' '}
                <span className="text-xs font-normal">{isRTL ? 'ر.س' : 'SAR'}</span>
              </p>
            </div>

            {score.salesPriority.slaDeadline && (
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{t('mlScoring.slaDeadline', 'SLA Deadline')}</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatTimeUntil(score.salesPriority.slaDeadline, isRTL)}</p>
              </div>
            )}
          </div>

          {/* Assigned To */}
          {score.salesPriority.assignedTo && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">{t('mlScoring.assignedTo', 'Assigned to')}:</span>
              <span className="text-sm font-medium text-slate-800">{score.salesPriority.assignedTo}</span>
            </div>
          )}

          {/* Key Features */}
          {showDetails && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {t('mlScoring.keyIndicators', 'Key Indicators')}
              </h4>
              <div className="space-y-2">
                <FeatureBar
                  label={t('mlScoring.features.engagement', 'Engagement')}
                  value={score.features.engagementVelocity * 20}
                />
                <FeatureBar
                  label={t('mlScoring.features.responseSpeed', 'Response Speed')}
                  value={score.features.responseSpeedPercentile}
                />
                <FeatureBar
                  label={t('mlScoring.features.meetingReliability', 'Meeting Reliability')}
                  value={score.features.meetingReliability * 100}
                />
                <FeatureBar
                  label={t('mlScoring.features.activityTrend', 'Activity Trend')}
                  value={normalizeValue(score.features.activityTrend, -10, 10)}
                />
              </div>
            </div>
          )}

          {/* Recalculate Button */}
          {onRecalculate && (
            <Button
              variant="outline"
              onClick={onRecalculate}
              disabled={isRecalculating}
              className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className={cn('w-4 h-4 me-2', isRecalculating && 'animate-spin')} />
              {t('mlScoring.refreshScore', 'Refresh Score')}
            </Button>
          )}

          {/* Model Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
            <span>
              {t('mlScoring.model', 'Model')}: {score.mlScore.modelVersion || 'v1.0.0'}
            </span>
            <span>
              {t('mlScoring.lastScored', 'Last scored')}: {new Date(score.mlScore.lastScoredAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== SKELETON ====================

export function MLScoreCardSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-100 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b-2 bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex justify-center">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MLScoreCard
