/**
 * Subscription Detail View Component
 *
 * Displays comprehensive subscription information including:
 * - Client and plan details
 * - Billing information
 * - Hours usage (if applicable)
 * - Invoice history
 * - Activity log
 *
 * API Endpoints:
 * - GET /subscriptions/:id - Fetch subscription details
 * - GET /subscriptions/:id/hours-usage - Get hours usage
 * - GET /subscriptions/:id/invoices - Get related invoices
 * - POST /subscriptions/:id/generate-invoice - Generate invoice
 * - Various action endpoints (pause, resume, cancel, etc.)
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

// Layout
import { Main } from '@/components/layout/main';
import { Header } from '@/components/layout/header';
import { TopNav } from '@/components/layout/top-nav';
import { DynamicIsland } from '@/components/dynamic-island';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitch } from '@/components/theme-switch';
import { ConfigDrawer } from '@/components/config-drawer';
import { ProfileDropdown } from '@/components/profile-dropdown';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  GosiCard,
  GosiCardContent,
  GosiButton,
  GosiIconBox,
} from '@/components/ui/gosi-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  Pause,
  Play,
  Ban,
  RefreshCw,
  Calendar,
  CreditCard,
  User,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  Receipt,
  AlertCircle,
  Repeat,
  Building,
  Mail,
  Phone,
} from 'lucide-react';

// Hooks
import {
  useSubscription,
  useSubscriptionHoursUsage,
  useSubscriptionInvoices,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
  useActivateSubscription,
  useRenewSubscription,
  useGenerateSubscriptionInvoice,
  useDeleteSubscription,
} from '@/hooks/useSubscriptions';

// Types & Utils
import { ROUTES } from '@/constants/routes';
import type { Subscription, SubscriptionHistoryEntry } from '@/features/subscriptions/types/subscription-types';
import {
  getStatusLabel,
  getStatusColor,
  getBillingPeriodLabel,
  getPlanTypeLabel,
  formatSubscriptionAmount,
  getDaysUntilBilling,
  needsAttention,
  calculateMRR,
} from '@/services/subscriptionService';

export function SubscriptionDetailView() {
  const { subscriptionId } = useParams({ strict: false }) as { subscriptionId: string };
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ar' | 'en';
  const isRtl = lang === 'ar';
  const dateLocale = lang === 'ar' ? arSA : enUS;

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch data
  const { data: subscription, isLoading, isError, refetch } = useSubscription(subscriptionId);
  const { data: hoursUsage } = useSubscriptionHoursUsage(subscriptionId);
  const { data: invoices } = useSubscriptionInvoices(subscriptionId);

  // Mutations
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();
  const activateMutation = useActivateSubscription();
  const renewMutation = useRenewSubscription();
  const generateInvoiceMutation = useGenerateSubscriptionInvoice();
  const deleteMutation = useDeleteSubscription();

  // Handlers
  const handlePause = () => {
    pauseMutation.mutate({ id: subscriptionId });
  };

  const handleResume = () => {
    resumeMutation.mutate(subscriptionId);
  };

  const handleCancel = (atPeriodEnd: boolean) => {
    cancelMutation.mutate({ id: subscriptionId, atPeriodEnd });
    setShowCancelDialog(false);
  };

  const handleActivate = () => {
    activateMutation.mutate(subscriptionId);
  };

  const handleRenew = () => {
    renewMutation.mutate(subscriptionId);
  };

  const handleGenerateInvoice = () => {
    generateInvoiceMutation.mutate(subscriptionId);
  };

  const handleDelete = () => {
    if (confirm(t('subscriptions.confirmDelete', 'Are you sure you want to delete this subscription?'))) {
      deleteMutation.mutate(subscriptionId, {
        onSuccess: () => {
          navigate({ to: ROUTES.dashboard.finance.subscriptions.list });
        },
      });
    }
  };

  // Derived values
  const getClientInfo = () => {
    if (!subscription?.clientId) return null;
    if (typeof subscription.clientId === 'string') return { name: subscription.clientId };
    return subscription.clientId;
  };

  const getPlanInfo = () => {
    if (!subscription?.planId) return null;
    if (typeof subscription.planId === 'string') return { name: subscription.planId };
    return subscription.planId;
  };

  const clientInfo = getClientInfo();
  const planInfo = getPlanInfo();

  const daysUntilBilling = subscription ? getDaysUntilBilling(subscription.nextBillingDate) : 0;
  const attention = subscription ? needsAttention(subscription) : false;

  // Hours progress
  const hoursProgress = subscription?.includedHours
    ? Math.min((subscription.usedHours / subscription.includedHours) * 100, 100)
    : 0;
  const hoursRemaining = subscription?.includedHours
    ? Math.max(subscription.includedHours - subscription.usedHours, 0)
    : 0;

  // Top nav
  const topNavItems = [
    { title: t('nav.dashboard', 'Dashboard'), url: ROUTES.dashboard.home, isActive: false },
    { title: t('nav.finance', 'Finance'), url: ROUTES.dashboard.finance.overview, isActive: false },
    { title: t('nav.subscriptions', 'Subscriptions'), url: ROUTES.dashboard.finance.subscriptions.list, isActive: false },
    { title: subscription?.subscriptionNumber || '...', url: '#', isActive: true },
  ];

  // Loading state
  if (isLoading) {
    return (
      <>
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
        <Main>
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </Main>
      </>
    );
  }

  // Error state
  if (isError || !subscription) {
    return (
      <>
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
        <Main>
          <GosiCard>
            <GosiCardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium text-destructive">
                {t('subscriptions.notFound', 'Subscription not found')}
              </p>
              <Link to={ROUTES.dashboard.finance.subscriptions.list}>
                <Button variant="outline" className="mt-4">
                  {isRtl ? <ArrowRight className="h-4 w-4 ms-2" /> : <ArrowLeft className="h-4 w-4 me-2" />}
                  {t('common.backToList', 'Back to List')}
                </Button>
              </Link>
            </GosiCardContent>
          </GosiCard>
        </Main>
      </>
    );
  }

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

      <Main>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.dashboard.finance.subscriptions.list}>
              <Button variant="ghost" size="icon">
                {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{subscription.subscriptionNumber}</h1>
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
              <p className="text-muted-foreground mt-1">
                {t('subscriptions.created', 'Created')}: {format(new Date(subscription.createdAt), 'PPP', { locale: dateLocale })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {subscription.status === 'draft' && (
              <GosiButton onClick={handleActivate} disabled={activateMutation.isPending}>
                <Play className="h-4 w-4 me-2" />
                {t('subscriptions.activate', 'Activate')}
              </GosiButton>
            )}

            {(subscription.status === 'active' || subscription.status === 'trial') && (
              <>
                <Button variant="outline" onClick={handleGenerateInvoice} disabled={generateInvoiceMutation.isPending}>
                  <Receipt className="h-4 w-4 me-2" />
                  {t('subscriptions.generateInvoice', 'Generate Invoice')}
                </Button>
                <Button variant="outline" onClick={handlePause} disabled={pauseMutation.isPending}>
                  <Pause className="h-4 w-4 me-2" />
                  {t('subscriptions.pause', 'Pause')}
                </Button>
              </>
            )}

            {subscription.status === 'paused' && (
              <GosiButton onClick={handleResume} disabled={resumeMutation.isPending}>
                <Play className="h-4 w-4 me-2" />
                {t('subscriptions.resume', 'Resume')}
              </GosiButton>
            )}

            <Link to={ROUTES.dashboard.finance.subscriptions.edit(subscriptionId)}>
              <Button variant="outline">
                <Edit3 className="h-4 w-4 me-2" />
                {t('common.edit', 'Edit')}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
                {subscription.status === 'expired' && (
                  <DropdownMenuItem onClick={handleRenew}>
                    <RefreshCw className="h-4 w-4 me-2" />
                    {t('subscriptions.renew', 'Renew')}
                  </DropdownMenuItem>
                )}
                {(subscription.status === 'active' || subscription.status === 'trial' || subscription.status === 'paused') && (
                  <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-destructive">
                    <Ban className="h-4 w-4 me-2" />
                    {t('subscriptions.cancel', 'Cancel')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 me-2" />
                  {t('common.delete', 'Delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Amount */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('subscriptions.amount', 'Amount')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatSubscriptionAmount(subscription.amount, subscription.currency, lang)}
              </div>
              <p className="text-xs text-muted-foreground">
                {getBillingPeriodLabel(subscription.billingPeriod, lang)}
              </p>
            </CardContent>
          </Card>

          {/* MRR */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('subscriptions.mrr', 'MRR')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatSubscriptionAmount(subscription.mrr || calculateMRR(subscription.amount, subscription.billingPeriod), subscription.currency, lang)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('subscriptions.monthlyRecurring', 'Monthly Recurring Revenue')}
              </p>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('subscriptions.nextBilling', 'Next Billing')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(subscription.nextBillingDate), 'PP', { locale: dateLocale })}
              </div>
              <p className={`text-xs ${daysUntilBilling <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                {daysUntilBilling > 0
                  ? `${daysUntilBilling} ${t('common.daysLeft', 'days left')}`
                  : t('subscriptions.billingDue', 'Billing due')}
              </p>
            </CardContent>
          </Card>

          {/* Hours (if applicable) */}
          {subscription.includedHours && subscription.includedHours > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('subscriptions.hoursRemaining', 'Hours Remaining')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {hoursRemaining} / {subscription.includedHours}
                </div>
                <Progress value={hoursProgress} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('subscriptions.totalInvoiced', 'Total Invoiced')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatSubscriptionAmount(subscription.totalInvoiced || 0, subscription.currency, lang)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('subscriptions.paid', 'Paid')}: {formatSubscriptionAmount(subscription.totalPaid || 0, subscription.currency, lang)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('common.overview', 'Overview')}</TabsTrigger>
            <TabsTrigger value="invoices">{t('subscriptions.invoices', 'Invoices')}</TabsTrigger>
            <TabsTrigger value="history">{t('subscriptions.history', 'History')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t('subscriptions.clientInfo', 'Client Information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {clientInfo && (
                    <>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{clientInfo.fullName || clientInfo.name || t('common.unknown', 'Unknown')}</span>
                      </div>
                      {clientInfo.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{clientInfo.email}</span>
                        </div>
                      )}
                      {typeof subscription.clientId !== 'string' && subscription.clientId?._id && (
                        <Link to={ROUTES.dashboard.clients.detail(subscription.clientId._id)}>
                          <Button variant="link" className="p-0 h-auto">
                            {t('subscriptions.viewClient', 'View Client Profile')} →
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Plan Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('subscriptions.planInfo', 'Plan Information')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {planInfo && (
                    <>
                      <div className="font-medium text-lg">
                        {lang === 'ar' && planInfo.nameAr ? planInfo.nameAr : planInfo.name}
                      </div>
                      {planInfo.planType && (
                        <Badge variant="outline">
                          {getPlanTypeLabel(planInfo.planType, lang)}
                        </Badge>
                      )}
                      {planInfo.description && (
                        <p className="text-sm text-muted-foreground">
                          {lang === 'ar' && planInfo.descriptionAr ? planInfo.descriptionAr : planInfo.description}
                        </p>
                      )}
                      {typeof subscription.planId !== 'string' && subscription.planId?._id && (
                        <Link to={ROUTES.dashboard.finance.subscriptionPlans.detail(subscription.planId._id)}>
                          <Button variant="link" className="p-0 h-auto">
                            {t('subscriptions.viewPlan', 'View Plan Details')} →
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Billing Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('subscriptions.billingDetails', 'Billing Details')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('subscriptions.startDate', 'Start Date')}</p>
                    <p className="font-medium">{format(new Date(subscription.startDate), 'PP', { locale: dateLocale })}</p>
                  </div>
                  {subscription.endDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('subscriptions.endDate', 'End Date')}</p>
                      <p className="font-medium">{format(new Date(subscription.endDate), 'PP', { locale: dateLocale })}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">{t('subscriptions.lastBilling', 'Last Billing')}</p>
                    <p className="font-medium">
                      {subscription.lastBillingDate
                        ? format(new Date(subscription.lastBillingDate), 'PP', { locale: dateLocale })
                        : t('common.na', 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('subscriptions.autoRenew', 'Auto Renew')}</p>
                    <p className="font-medium">
                      {subscription.autoRenew ? t('common.yes', 'Yes') : t('common.no', 'No')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {(subscription.notes || subscription.notesAr) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.notes', 'Notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">
                    {lang === 'ar' && subscription.notesAr ? subscription.notesAr : subscription.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  {t('subscriptions.relatedInvoices', 'Related Invoices')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices && invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice: any) => (
                      <div key={invoice._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.issueDate || invoice.createdAt), 'PP', { locale: dateLocale })}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="font-medium">
                            {formatSubscriptionAmount(invoice.totalAmount || invoice.amount, subscription.currency, lang)}
                          </p>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {t('subscriptions.noInvoices', 'No invoices generated yet')}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t('subscriptions.activityHistory', 'Activity History')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription.history && subscription.history.length > 0 ? (
                  <div className="space-y-4">
                    {subscription.history.map((entry: SubscriptionHistoryEntry, index: number) => (
                      <div key={entry._id || index} className="flex gap-3">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{entry.details || entry.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), 'PPp', { locale: dateLocale })}
                            {entry.userName && ` • ${entry.userName}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {t('subscriptions.noHistory', 'No activity history')}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('subscriptions.cancelSubscription', 'Cancel Subscription')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('subscriptions.cancelDescription', 'Choose when to cancel this subscription.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
              <Button variant="outline" onClick={() => handleCancel(true)}>
                {t('subscriptions.cancelAtPeriodEnd', 'Cancel at Period End')}
              </Button>
              <Button variant="destructive" onClick={() => handleCancel(false)}>
                {t('subscriptions.cancelImmediately', 'Cancel Immediately')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  );
}

export default SubscriptionDetailView;
