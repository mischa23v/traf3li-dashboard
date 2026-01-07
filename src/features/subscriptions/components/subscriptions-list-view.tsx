/**
 * Subscriptions List View Component
 *
 * API Endpoints:
 * - GET /subscriptions - Fetch subscriptions with filters
 * - GET /subscriptions/stats - Fetch subscription statistics
 * - POST /subscriptions/:id/pause - Pause subscription
 * - POST /subscriptions/:id/resume - Resume subscription
 * - POST /subscriptions/:id/cancel - Cancel subscription
 * - DELETE /subscriptions/:id - Delete subscription
 *
 * All error messages are bilingual (English | Arabic)
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '@/components/layout/main';
import { ROUTES } from '@/constants/routes';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitch } from '@/components/theme-switch';
import { ConfigDrawer } from '@/components/config-drawer';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Link, useNavigate } from '@tanstack/react-router';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ProductivityHero } from '@/components/productivity-hero';
import {
  useSubscriptions,
  useSubscriptionStats,
  useDeleteSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
  useActivateSubscription,
} from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { TopNav } from '@/components/layout/top-nav';
import { DynamicIsland } from '@/components/dynamic-island';
import {
  Search,
  Bell,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  Filter,
  X,
  Clock,
  AlertTriangle,
  User,
  RefreshCw,
  Loader2,
  Pause,
  Play,
  Ban,
  CreditCard,
  TrendingUp,
  FileText,
  Repeat,
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import {
  GosiCard,
  GosiCardContent,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton,
} from '@/components/ui/gosi-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionFilters,
} from '@/features/subscriptions/types/subscription-types';
import {
  getStatusLabel,
  getStatusColor,
  getBillingPeriodLabel,
  formatSubscriptionAmount,
  getDaysUntilBilling,
  needsAttention,
} from '@/services/subscriptionService';

export function SubscriptionsListView() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language as 'ar' | 'en';
  const isRtl = lang === 'ar';

  // State
  const [activeStatusTab, setActiveStatusTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [billingPeriodFilter, setBillingPeriodFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);

  // Build filters
  const filters = useMemo((): SubscriptionFilters => {
    const f: SubscriptionFilters = {
      page: 1,
      limit: 100, // Fetch more, paginate client-side for simplicity
    };

    // Status filter
    if (activeStatusTab === 'active') {
      f.status = ['active', 'trial'];
    } else if (activeStatusTab === 'paused') {
      f.status = 'paused';
    } else if (activeStatusTab === 'past_due') {
      f.status = 'past_due';
    } else if (activeStatusTab === 'cancelled') {
      f.status = ['cancelled', 'expired'];
    }

    // Search
    if (searchQuery.trim()) {
      f.search = searchQuery.trim();
    }

    // Billing period
    if (billingPeriodFilter !== 'all') {
      f.billingPeriod = billingPeriodFilter as any;
    }

    return f;
  }, [activeStatusTab, searchQuery, billingPeriodFilter]);

  // Fetch data
  const { data: subscriptionsData, isLoading, isError, refetch } = useSubscriptions(filters);
  const { data: statsData, isLoading: statsLoading } = useSubscriptionStats();

  // Mutations
  const deleteMutation = useDeleteSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();
  const activateMutation = useActivateSubscription();

  // Data processing
  const subscriptions = subscriptionsData?.data || [];
  const displayedSubscriptions = subscriptions.slice(0, visibleCount);
  const hasMore = subscriptions.length > visibleCount;

  // Handlers
  const handleDelete = (id: string) => {
    if (confirm(t('subscriptions.confirmDelete', 'Are you sure you want to delete this subscription?'))) {
      deleteMutation.mutate(id);
    }
  };

  const handlePause = (id: string) => {
    pauseMutation.mutate({ id });
  };

  const handleResume = (id: string) => {
    resumeMutation.mutate(id);
  };

  const handleCancel = (id: string, atPeriodEnd: boolean = true) => {
    if (confirm(t('subscriptions.confirmCancel', 'Are you sure you want to cancel this subscription?'))) {
      cancelMutation.mutate({ id, atPeriodEnd });
    }
  };

  const handleActivate = (id: string) => {
    activateMutation.mutate(id);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedSubscriptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedSubscriptions.map((s) => s._id));
    }
  };

  // Helper to get client name
  const getClientName = (subscription: Subscription): string => {
    if (!subscription.clientId) return t('common.unknown', 'Unknown');
    if (typeof subscription.clientId === 'string') return subscription.clientId;
    return subscription.clientId.fullName || subscription.clientId.name || subscription.clientId.email || t('common.unknown', 'Unknown');
  };

  // Helper to get plan name
  const getPlanName = (subscription: Subscription): string => {
    if (!subscription.planId) return t('common.unknown', 'Unknown');
    if (typeof subscription.planId === 'string') return subscription.planId;
    return lang === 'ar' && subscription.planId.nameAr ? subscription.planId.nameAr : subscription.planId.name;
  };

  // Status tabs with counts
  const statusTabs = [
    { key: 'active', label: t('subscriptions.status.active', 'Active'), count: statsData?.active || 0 },
    { key: 'paused', label: t('subscriptions.status.paused', 'Paused'), count: statsData?.paused || 0 },
    { key: 'past_due', label: t('subscriptions.status.pastDue', 'Past Due'), count: statsData?.pastDue || 0 },
    { key: 'cancelled', label: t('subscriptions.status.cancelled', 'Cancelled'), count: statsData?.cancelled || 0 },
    { key: 'all', label: t('common.all', 'All'), count: statsData?.total || 0 },
  ];

  // Top nav items
  const topNavItems = [
    { title: t('nav.dashboard', 'Dashboard'), url: ROUTES.dashboard.home, isActive: false },
    { title: t('nav.finance', 'Finance'), url: ROUTES.dashboard.finance.overview, isActive: false },
    { title: t('nav.subscriptions', 'Subscriptions'), url: ROUTES.dashboard.finance.subscriptions.list, isActive: true },
  ];

  return (
    <>
      {/* Header */}
      <Header>
        <TopNav links={topNavItems} />
        <div className="flex items-center gap-2 md:gap-4 ms-auto">
          <DynamicIsland />
          <LanguageSwitcher />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        {/* Productivity Hero with Stats */}
        <ProductivityHero
          title={t('subscriptions.title', 'Subscriptions')}
          subtitle={t('subscriptions.subtitle', 'Manage recurring client subscriptions')}
          stats={[
            {
              label: t('subscriptions.stats.mrr', 'MRR'),
              value: statsLoading ? '...' : formatSubscriptionAmount(statsData?.mrr || 0, 'SAR', lang),
              icon: TrendingUp,
              trend: '+12%',
            },
            {
              label: t('subscriptions.stats.active', 'Active'),
              value: statsLoading ? '...' : String(statsData?.active || 0),
              icon: Repeat,
            },
            {
              label: t('subscriptions.stats.trial', 'Trial'),
              value: statsLoading ? '...' : String(statsData?.trial || 0),
              icon: Clock,
            },
            {
              label: t('subscriptions.stats.pastDue', 'Past Due'),
              value: statsLoading ? '...' : String(statsData?.pastDue || 0),
              icon: AlertTriangle,
              variant: (statsData?.pastDue || 0) > 0 ? 'danger' : undefined,
            },
          ]}
          actions={
            <Link to={ROUTES.dashboard.finance.subscriptions.new}>
              <GosiButton size="lg">
                <Plus className="h-4 w-4 me-2" />
                {t('subscriptions.newSubscription', 'New Subscription')}
              </GosiButton>
            </Link>
          }
        />

        {/* Filter Bar */}
        <div className="flex flex-col gap-4 mt-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.key}
                variant={activeStatusTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveStatusTab(tab.key);
                  setVisibleCount(10);
                }}
                className="gap-2"
              >
                {tab.label}
                <Badge variant="secondary" className="ms-1">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <GosiInput
                placeholder={t('subscriptions.searchPlaceholder', 'Search subscriptions...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Billing Period Filter */}
            <GosiSelect value={billingPeriodFilter} onValueChange={setBillingPeriodFilter}>
              <GosiSelectTrigger className="w-full md:w-[180px]">
                <GosiSelectValue placeholder={t('subscriptions.billingPeriod', 'Billing Period')} />
              </GosiSelectTrigger>
              <GosiSelectContent>
                <GosiSelectItem value="all">{t('common.all', 'All')}</GosiSelectItem>
                <GosiSelectItem value="monthly">{t('subscriptions.periods.monthly', 'Monthly')}</GosiSelectItem>
                <GosiSelectItem value="quarterly">{t('subscriptions.periods.quarterly', 'Quarterly')}</GosiSelectItem>
                <GosiSelectItem value="annually">{t('subscriptions.periods.annually', 'Annually')}</GosiSelectItem>
              </GosiSelectContent>
            </GosiSelect>

            {/* Refresh Button */}
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Plans Link */}
            <Link to={ROUTES.dashboard.finance.subscriptionPlans.list}>
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                {t('subscriptions.managePlans', 'Manage Plans')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="mt-6 space-y-3">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <GosiCard key={i}>
                <GosiCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </GosiCardContent>
              </GosiCard>
            ))
          ) : isError ? (
            // Error State
            <GosiCard>
              <GosiCardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-medium text-destructive">
                  {t('common.errorLoading', 'Error loading data')}
                </p>
                <Button variant="outline" onClick={() => refetch()} className="mt-4">
                  <RefreshCw className="h-4 w-4 me-2" />
                  {t('common.retry', 'Retry')}
                </Button>
              </GosiCardContent>
            </GosiCard>
          ) : displayedSubscriptions.length === 0 ? (
            // Empty State
            <GosiCard>
              <GosiCardContent className="p-8 text-center">
                <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">
                  {t('subscriptions.noSubscriptions', 'No subscriptions found')}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t('subscriptions.createFirst', 'Create your first subscription to get started')}
                </p>
                <Link to={ROUTES.dashboard.finance.subscriptions.new}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 me-2" />
                    {t('subscriptions.newSubscription', 'New Subscription')}
                  </Button>
                </Link>
              </GosiCardContent>
            </GosiCard>
          ) : (
            // Subscriptions Cards
            <>
              {displayedSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription._id}
                  subscription={subscription}
                  lang={lang}
                  onView={() => navigate({ to: ROUTES.dashboard.finance.subscriptions.detail(subscription._id) })}
                  onEdit={() => navigate({ to: ROUTES.dashboard.finance.subscriptions.edit(subscription._id) })}
                  onPause={() => handlePause(subscription._id)}
                  onResume={() => handleResume(subscription._id)}
                  onCancel={() => handleCancel(subscription._id)}
                  onActivate={() => handleActivate(subscription._id)}
                  onDelete={() => handleDelete(subscription._id)}
                  clientName={getClientName(subscription)}
                  planName={getPlanName(subscription)}
                  isSelected={selectedIds.includes(subscription._id)}
                  onToggleSelect={() => toggleSelection(subscription._id)}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="text-center pt-4">
                  <Button variant="outline" onClick={handleLoadMore}>
                    {t('common.loadMore', 'Load More')} ({subscriptions.length - visibleCount} {t('common.remaining', 'remaining')})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Main>
    </>
  );
}

// ==================== SUBSCRIPTION CARD COMPONENT ====================

interface SubscriptionCardProps {
  subscription: Subscription;
  lang: 'ar' | 'en';
  clientName: string;
  planName: string;
  onView: () => void;
  onEdit: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onActivate: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function SubscriptionCard({
  subscription,
  lang,
  clientName,
  planName,
  onView,
  onEdit,
  onPause,
  onResume,
  onCancel,
  onActivate,
  onDelete,
  isSelected,
  onToggleSelect,
}: SubscriptionCardProps) {
  const { t } = useTranslation();
  const isRtl = lang === 'ar';
  const dateLocale = lang === 'ar' ? arSA : enUS;

  const daysUntilBilling = getDaysUntilBilling(subscription.nextBillingDate);
  const attention = needsAttention(subscription);

  // Hours usage progress
  const hoursProgress = subscription.includedHours
    ? Math.min((subscription.usedHours / subscription.includedHours) * 100, 100)
    : 0;

  return (
    <GosiCard className={`transition-all hover:shadow-md ${attention ? 'border-warning' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <GosiCardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="hidden md:block"
          />

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={ROUTES.dashboard.finance.subscriptions.detail(subscription._id)}
                className="font-semibold text-lg hover:underline truncate"
              >
                {subscription.subscriptionNumber}
              </Link>
              <Badge className={getStatusColor(subscription.status)}>
                {getStatusLabel(subscription.status, lang)}
              </Badge>
              {subscription.autoRenew && (
                <Badge variant="outline" className="gap-1">
                  <Repeat className="h-3 w-3" />
                  {t('subscriptions.autoRenew', 'Auto-Renew')}
                </Badge>
              )}
              {attention && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t('subscriptions.needsAttention', 'Needs Attention')}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {clientName}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                {planName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {getBillingPeriodLabel(subscription.billingPeriod, lang)}
              </span>
            </div>

            {/* Hours Usage (if applicable) */}
            {subscription.includedHours && subscription.includedHours > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('subscriptions.hoursUsed', 'Hours Used')}</span>
                  <span>
                    {subscription.usedHours} / {subscription.includedHours} {t('subscriptions.hours', 'hours')}
                  </span>
                </div>
                <Progress value={hoursProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Amount and Billing Info */}
          <div className="flex flex-col items-end gap-1 text-end">
            <span className="text-xl font-bold">
              {formatSubscriptionAmount(subscription.amount, subscription.currency, lang)}
            </span>
            <span className="text-xs text-muted-foreground">
              {subscription.status === 'active' || subscription.status === 'trial' ? (
                <>
                  {t('subscriptions.nextBilling', 'Next Billing')}: {format(new Date(subscription.nextBillingDate), 'PP', { locale: dateLocale })}
                  {daysUntilBilling <= 7 && daysUntilBilling > 0 && (
                    <span className="text-warning ms-1">
                      ({daysUntilBilling} {t('common.days', 'days')})
                    </span>
                  )}
                </>
              ) : (
                <>
                  {t('subscriptions.started', 'Started')}: {format(new Date(subscription.startDate), 'PP', { locale: dateLocale })}
                </>
              )}
            </span>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 me-2" />
                {t('common.view', 'View')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit3 className="h-4 w-4 me-2" />
                {t('common.edit', 'Edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {subscription.status === 'draft' && (
                <DropdownMenuItem onClick={onActivate}>
                  <Play className="h-4 w-4 me-2" />
                  {t('subscriptions.activate', 'Activate')}
                </DropdownMenuItem>
              )}

              {(subscription.status === 'active' || subscription.status === 'trial') && (
                <DropdownMenuItem onClick={onPause}>
                  <Pause className="h-4 w-4 me-2" />
                  {t('subscriptions.pause', 'Pause')}
                </DropdownMenuItem>
              )}

              {subscription.status === 'paused' && (
                <DropdownMenuItem onClick={onResume}>
                  <Play className="h-4 w-4 me-2" />
                  {t('subscriptions.resume', 'Resume')}
                </DropdownMenuItem>
              )}

              {(subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'paused') && (
                <DropdownMenuItem onClick={onCancel} className="text-destructive">
                  <Ban className="h-4 w-4 me-2" />
                  {t('subscriptions.cancel', 'Cancel')}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 me-2" />
                {t('common.delete', 'Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GosiCardContent>
    </GosiCard>
  );
}

export default SubscriptionsListView;
