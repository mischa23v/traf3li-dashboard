/**
 * Priority Queue Component
 * Displays prioritized leads with SLA status and quick actions
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  Eye,
  UserPlus,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { usePriorityQueue, useRecordContact } from '@/hooks/useMlScoring'
import type { PriorityQueueItem, PriorityTier, SLAStatus, ContactType } from '@/services/mlScoringApi'

// ==================== TYPES ====================

interface PriorityQueueProps {
  className?: string
  showFilters?: boolean
  limit?: number
}

type FilterType = 'all' | 'mine' | 'unassigned' | 'overdue'

// ==================== CONSTANTS ====================

const TIER_CONFIG: Record<PriorityTier, { bg: string; border: string; text: string; icon: string }> = {
  P1_HOT: { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', icon: '🔥' },
  P2_WARM: { bg: 'bg-orange-50', border: 'border-l-orange-500', text: 'text-orange-700', icon: '☀️' },
  P3_COOL: { bg: 'bg-blue-50', border: 'border-l-blue-500', text: 'text-blue-700', icon: '❄️' },
  P4_NURTURE: { bg: 'bg-emerald-50', border: 'border-l-emerald-500', text: 'text-emerald-700', icon: '🌱' },
}

const SLA_STATUS_CONFIG: Record<SLAStatus, { bg: string; text: string; icon: string }> = {
  on_track: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✅' },
  at_risk: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⚠️' },
  breached: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
}

// ==================== HELPERS ====================

const formatTier = (tier: PriorityTier, isRTL: boolean): string => {
  const labels: Record<PriorityTier, { ar: string; en: string }> = {
    P1_HOT: { ar: 'ساخن', en: 'Hot' },
    P2_WARM: { ar: 'دافئ', en: 'Warm' },
    P3_COOL: { ar: 'بارد', en: 'Cool' },
    P4_NURTURE: { ar: 'رعاية', en: 'Nurture' },
  }
  return isRTL ? labels[tier].ar : labels[tier].en
}

const formatSLAStatus = (status: SLAStatus, isRTL: boolean): string => {
  const labels: Record<SLAStatus, { ar: string; en: string }> = {
    on_track: { ar: 'على المسار', en: 'On Track' },
    at_risk: { ar: 'في خطر', en: 'At Risk' },
    breached: { ar: 'متأخر', en: 'Breached' },
  }
  return isRTL ? labels[status].ar : labels[status].en
}

// ==================== SUB-COMPONENTS ====================

interface QueueItemProps {
  item: PriorityQueueItem
  onContact: (leadId: string, type: ContactType) => void
  isRTL: boolean
}

const QueueItem = ({ item, onContact, isRTL }: QueueItemProps) => {
  const { t } = useTranslation()
  const tierConfig = TIER_CONFIG[item.tier]
  const slaConfig = SLA_STATUS_CONFIG[item.slaStatus]

  return (
    <div
      className={cn(
        'rounded-xl p-4 border-l-4 transition-all hover:shadow-md',
        tierConfig.bg,
        tierConfig.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Lead Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{tierConfig.icon}</span>
            <h4 className="font-bold text-slate-800 truncate">{item.leadName}</h4>
            <Badge className={cn('border-0 rounded-full px-2 text-xs', tierConfig.bg, tierConfig.text)}>
              {formatTier(item.tier, isRTL)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {/* ML Score */}
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{(item.mlProbability * 100).toFixed(0)}%</span>
            </div>

            {/* Expected Value */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span>{item.expectedValue?.toLocaleString() || 0} {isRTL ? 'ر.س' : 'SAR'}</span>
            </div>

            {/* SLA Status */}
            <Badge className={cn('border-0 rounded-full px-2 py-0.5 text-xs', slaConfig.bg, slaConfig.text)}>
              {slaConfig.icon} {formatSLAStatus(item.slaStatus, isRTL)}
            </Badge>

            {/* Time Until SLA */}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className={item.slaStatus === 'breached' ? 'text-red-600 font-medium' : ''}>
                {item.timeUntilSLA}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Contact Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-emerald-100 hover:text-emerald-600"
              onClick={() => onContact(item.leadId, 'call')}
              title={t('mlScoring.actions.call', 'Call')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-blue-100 hover:text-blue-600"
              onClick={() => onContact(item.leadId, 'email')}
              title={t('mlScoring.actions.email', 'Email')}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-purple-100 hover:text-purple-600"
              onClick={() => onContact(item.leadId, 'meeting')}
              title={t('mlScoring.actions.meeting', 'Meeting')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-green-100 hover:text-green-600"
              onClick={() => onContact(item.leadId, 'whatsapp')}
              title={t('mlScoring.actions.whatsapp', 'WhatsApp')}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/crm/leads/${item.leadId}` as any}>
                  <Eye className="w-4 h-4 me-2" />
                  {t('mlScoring.actions.viewDetails', 'View Details')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 me-2" />
                {t('mlScoring.actions.assign', 'Assign to Rep')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function PriorityQueue({ className, showFilters = true, limit = 20 }: PriorityQueueProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [filter, setFilter] = useState<FilterType>('mine')
  const [tierFilter, setTierFilter] = useState<PriorityTier | 'all'>('all')

  const { data, isLoading, isError, error } = usePriorityQueue({
    filterBy: filter,
    tier: tierFilter === 'all' ? undefined : tierFilter,
    limit,
  })

  const recordContactMutation = useRecordContact()

  const handleContact = (leadId: string, contactType: ContactType) => {
    recordContactMutation.mutate({
      leadId,
      data: {
        contactType,
        notes: `Contact initiated from priority queue`,
      },
    })
  }

  const leads = data?.data || []

  return (
    <Card className={cn('rounded-2xl border-slate-100', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-bold text-navy">{t('mlScoring.priorityQueue', 'Priority Queue')}</h2>
            </div>

            {showFilters && (
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                  <SelectTrigger className="w-[130px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('mlScoring.filters.all', 'All')}</SelectItem>
                    <SelectItem value="mine">{t('mlScoring.filters.mine', 'My Leads')}</SelectItem>
                    <SelectItem value="unassigned">{t('mlScoring.filters.unassigned', 'Unassigned')}</SelectItem>
                    <SelectItem value="overdue">{t('mlScoring.filters.overdue', 'Overdue')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as PriorityTier | 'all')}>
                  <SelectTrigger className="w-[120px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('mlScoring.filters.allTiers', 'All Tiers')}</SelectItem>
                    <SelectItem value="P1_HOT">🔥 {t('mlScoring.tiers.hot', 'Hot')}</SelectItem>
                    <SelectItem value="P2_WARM">☀️ {t('mlScoring.tiers.warm', 'Warm')}</SelectItem>
                    <SelectItem value="P3_COOL">❄️ {t('mlScoring.tiers.cool', 'Cool')}</SelectItem>
                    <SelectItem value="P4_NURTURE">🌱 {t('mlScoring.tiers.nurture', 'Nurture')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Stats Row */}
          {!isLoading && leads.length > 0 && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                {leads.length} {t('mlScoring.leads', 'leads')}
              </Badge>
              <span className="text-slate-500">
                {leads.filter((l) => l.slaStatus === 'breached').length} {t('mlScoring.overdue', 'overdue')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{error?.message || t('mlScoring.loadError', 'Failed to load queue')}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && leads.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {t('mlScoring.emptyQueue', 'No leads in queue')}
              </h3>
              <p className="text-slate-500">
                {t('mlScoring.emptyQueueDesc', 'Great job! All leads have been contacted.')}
              </p>
            </div>
          )}

          {/* Queue List */}
          {!isLoading && !isError && leads.length > 0 && (
            <div className="space-y-3">
              {leads.map((item) => (
                <QueueItem key={item.leadId} item={item} onContact={handleContact} isRTL={isRTL} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && leads.length > 0 && leads.length >= limit && (
          <div className="p-4 pt-0 text-center border-t border-slate-100">
            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl">
              {t('mlScoring.viewAll', 'View All Leads')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== SKELETON ====================

export function PriorityQueueSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-100">
      <CardContent className="p-0">
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PriorityQueue
