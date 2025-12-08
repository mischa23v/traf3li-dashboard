/**
 * DecisionLogs Component
 * UI for viewing permission decision audit logs
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDecisionLogs, useDecisionStats } from '@/hooks/useEnterprisePermissions'
import type { PermissionDecision, DecisionLogFilters, DecisionResult } from '@/types/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  History,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

// ==================== TYPES ====================

interface DecisionLogsProps {
  userId?: string
  resourceType?: string
  className?: string
}

// ==================== HELPERS ====================

const resultConfig: Record<DecisionResult, { icon: React.ElementType; color: string; bgColor: string }> = {
  allow: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
  deny: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  not_applicable: { icon: MinusCircle, color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

// ==================== COMPONENTS ====================

function LogsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  trend?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
            {trend && (
              <p className="text-xs text-green-600">{trend}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DecisionRow({
  decision,
  onClick,
}: {
  decision: PermissionDecision
  onClick: () => void
}) {
  const { t, i18n } = useTranslation()
  const config = resultConfig[decision.result]
  const Icon = config.icon

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn('p-1 rounded', config.bgColor)}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
          <span className="font-medium">{t(`permissions.results.${decision.result}`)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{decision.userName || decision.userId}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{decision.action}</Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {decision.resource.entityType}
          {decision.resource.entityId && decision.resource.entityId !== '*' && (
            <span className="text-muted-foreground/60">:{decision.resource.entityId.slice(0, 8)}...</span>
          )}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(decision.timestamp), {
            addSuffix: true,
            locale: i18n.language === 'ar' ? ar : undefined,
          })}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">{decision.evaluationTimeMs}ms</span>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}

function DecisionDetails({
  decision,
  open,
  onOpenChange,
}: {
  decision: PermissionDecision | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation()

  if (!decision) return null

  const config = resultConfig[decision.result]
  const Icon = config.icon

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('permissions.decisionDetails')}
          </SheetTitle>
          <SheetDescription>
            {format(new Date(decision.timestamp), 'PPpp', {
              locale: i18n.language === 'ar' ? ar : undefined,
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Result */}
          <div className="flex items-center gap-3 p-4 rounded-lg border">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <p className="font-bold text-lg">{t(`permissions.results.${decision.result}`)}</p>
              <p className="text-sm text-muted-foreground">
                {t(`permissions.reasons.${decision.reason}`)}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div>
            <Label className="text-xs text-muted-foreground">{t('permissions.user')}</Label>
            <div className="mt-1 p-3 rounded-lg bg-muted">
              <p className="font-medium">{decision.userName || decision.userId}</p>
              <p className="text-xs text-muted-foreground">{decision.userId}</p>
            </div>
          </div>

          {/* Action */}
          <div>
            <Label className="text-xs text-muted-foreground">{t('permissions.action')}</Label>
            <div className="mt-1">
              <Badge>{decision.action}</Badge>
            </div>
          </div>

          {/* Resource */}
          <div>
            <Label className="text-xs text-muted-foreground">{t('permissions.resource')}</Label>
            <div className="mt-1 p-3 rounded-lg bg-muted space-y-1">
              <p><span className="text-muted-foreground">{t('permissions.type')}:</span> {decision.resource.type}</p>
              {decision.resource.module && (
                <p><span className="text-muted-foreground">{t('permissions.module')}:</span> {decision.resource.module}</p>
              )}
              {decision.resource.entityType && (
                <p><span className="text-muted-foreground">{t('permissions.entityType')}:</span> {decision.resource.entityType}</p>
              )}
              {decision.resource.entityId && (
                <p><span className="text-muted-foreground">{t('permissions.entityId')}:</span> {decision.resource.entityId}</p>
              )}
            </div>
          </div>

          {/* Matched Policies */}
          {decision.matchedPolicies.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">{t('permissions.matchedPolicies')}</Label>
              <div className="mt-1 space-y-1">
                {decision.matchedPolicies.map((policyId) => (
                  <Badge key={policyId} variant="outline" className="me-1">
                    {policyId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Context */}
          {Object.keys(decision.context).length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">{t('permissions.context')}</Label>
              <pre className="mt-1 p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                {JSON.stringify(decision.context, null, 2)}
              </pre>
            </div>
          )}

          {/* Performance */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{t('permissions.evaluationTime')}</Label>
              <p className="font-medium">{decision.evaluationTimeMs}ms</p>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{t('permissions.cacheHit')}</Label>
              <p className="font-medium">{decision.cachehit ? t('common.yes') : t('common.no')}</p>
            </div>
          </div>

          {/* Request Info */}
          {(decision.ipAddress || decision.userAgent) && (
            <div>
              <Label className="text-xs text-muted-foreground">{t('permissions.requestInfo')}</Label>
              <div className="mt-1 p-3 rounded-lg bg-muted text-xs space-y-1">
                {decision.ipAddress && <p>IP: {decision.ipAddress}</p>}
                {decision.userAgent && <p className="truncate">UA: {decision.userAgent}</p>}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ==================== MAIN COMPONENT ====================

export function DecisionLogs({
  userId,
  resourceType,
  className,
}: DecisionLogsProps) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<DecisionLogFilters>({
    userId,
    resourceType,
    limit: 50,
  })
  const [resultFilter, setResultFilter] = useState<'all' | DecisionResult>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDecision, setSelectedDecision] = useState<PermissionDecision | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: logsData, isLoading, refetch, isFetching } = useDecisionLogs({
    ...filters,
    result: resultFilter !== 'all' ? resultFilter : undefined,
  })
  const { data: stats } = useDecisionStats()

  const decisions = logsData?.decisions || []

  const handleViewDetails = (decision: PermissionDecision) => {
    setSelectedDecision(decision)
    setDetailsOpen(true)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title={t('permissions.totalDecisions')}
            value={stats.total || 0}
            icon={Activity}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            title={t('permissions.allowedDecisions')}
            value={stats.allowed || 0}
            icon={CheckCircle2}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title={t('permissions.deniedDecisions')}
            value={stats.denied || 0}
            icon={XCircle}
            color="bg-red-100 text-red-600"
          />
          <StatCard
            title={t('permissions.avgEvaluationTime')}
            value={`${stats.avgEvaluationTimeMs || 0}ms`}
            icon={Clock}
            color="bg-purple-100 text-purple-600"
          />
        </div>
      )}

      {/* Logs Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {t('permissions.decisionLogs')}
              </CardTitle>
              <CardDescription>{t('permissions.decisionLogsDescription')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('me-2 h-4 w-4', isFetching && 'animate-spin')} />
              {t('common.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('permissions.searchLogs')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select
              value={resultFilter}
              onValueChange={(value: 'all' | DecisionResult) => setResultFilter(value)}
            >
              <SelectTrigger className="w-40">
                <Filter className="me-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="allow">{t('permissions.results.allow')}</SelectItem>
                <SelectItem value="deny">{t('permissions.results.deny')}</SelectItem>
                <SelectItem value="not_applicable">{t('permissions.results.not_applicable')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <LogsSkeleton />
          ) : decisions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('permissions.noDecisionLogs')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('permissions.result')}</TableHead>
                  <TableHead>{t('permissions.user')}</TableHead>
                  <TableHead>{t('permissions.action')}</TableHead>
                  <TableHead>{t('permissions.resource')}</TableHead>
                  <TableHead>{t('permissions.time')}</TableHead>
                  <TableHead>{t('permissions.duration')}</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.map((decision) => (
                  <DecisionRow
                    key={decision.id}
                    decision={decision}
                    onClick={() => handleViewDetails(decision)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Decision Details Sheet */}
      <DecisionDetails
        decision={selectedDecision}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}

export default DecisionLogs
