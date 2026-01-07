/**
 * Subscription Create View Component
 *
 * Form for creating new client subscriptions
 * Following the pattern from create-task-view.tsx
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GosiButton, GosiCard, GosiCardContent } from '@/components/ui/gosi-ui';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  User,
  CreditCard,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Repeat,
} from 'lucide-react';

// Hooks
import { useCreateSubscription, useSubscriptionPlans } from '@/hooks/useSubscriptions';
import { useClients } from '@/hooks/useCasesAndClients';

// Types & Utils
import { ROUTES } from '@/constants/routes';
import type { CreateSubscriptionData, BillingPeriod, SubscriptionCurrency } from '@/features/subscriptions/types/subscription-types';
import { getBillingPeriodLabel, formatSubscriptionAmount } from '@/services/subscriptionService';

// Form Schema
const subscriptionFormSchema = z.object({
  planId: z.string().min(1, 'Plan is required'),
  clientId: z.string().min(1, 'Client is required'),
  caseId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  amount: z.number().optional(),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED']).optional(),
  includedHours: z.number().optional(),
  hourlyRateAfter: z.number().optional(),
  autoRenew: z.boolean().default(true),
  autoInvoice: z.boolean().default(true),
  skipTrial: z.boolean().default(false),
  notes: z.string().optional(),
  notesAr: z.string().optional(),
  internalNotes: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

export function SubscriptionCreateView() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'ar' | 'en';
  const isRtl = lang === 'ar';

  // Fetch data
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans({ isActive: true });
  const { data: clientsData, isLoading: clientsLoading } = useClients();

  // Mutation
  const createMutation = useCreateSubscription();

  // Form
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      planId: '',
      clientId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      autoRenew: true,
      autoInvoice: true,
      skipTrial: false,
    },
  });

  const selectedPlanId = form.watch('planId');
  const selectedPlan = useMemo(() => {
    if (!selectedPlanId || !plansData?.data) return null;
    return plansData.data.find((p) => p._id === selectedPlanId);
  }, [selectedPlanId, plansData]);

  // Submit handler
  const onSubmit = (data: SubscriptionFormData) => {
    const payload: CreateSubscriptionData = {
      planId: data.planId,
      clientId: data.clientId,
      startDate: data.startDate,
      ...(data.caseId && { caseId: data.caseId }),
      ...(data.endDate && { endDate: data.endDate }),
      ...(data.amount && { amount: data.amount }),
      ...(data.currency && { currency: data.currency }),
      ...(data.includedHours && { includedHours: data.includedHours }),
      ...(data.hourlyRateAfter && { hourlyRateAfter: data.hourlyRateAfter }),
      autoRenew: data.autoRenew,
      autoInvoice: data.autoInvoice,
      skipTrial: data.skipTrial,
      ...(data.notes && { notes: data.notes }),
      ...(data.notesAr && { notesAr: data.notesAr }),
      ...(data.internalNotes && { internalNotes: data.internalNotes }),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.finance.subscriptions.list });
      },
    });
  };

  // Top nav
  const topNavItems = [
    { title: t('nav.dashboard', 'Dashboard'), url: ROUTES.dashboard.home, isActive: false },
    { title: t('nav.finance', 'Finance'), url: ROUTES.dashboard.finance.overview, isActive: false },
    { title: t('nav.subscriptions', 'Subscriptions'), url: ROUTES.dashboard.finance.subscriptions.list, isActive: false },
    { title: t('subscriptions.new', 'New Subscription'), url: '#', isActive: true },
  ];

  const plans = plansData?.data || [];
  const clients = clientsData?.data || [];

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
        <div className="flex items-center gap-4 mb-6">
          <Link to={ROUTES.dashboard.finance.subscriptions.list}>
            <Button variant="ghost" size="icon">
              {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t('subscriptions.createSubscription', 'Create Subscription')}</h1>
            <p className="text-muted-foreground">
              {t('subscriptions.createDescription', 'Set up a new recurring subscription for a client')}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Plan Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {t('subscriptions.selectPlan', 'Select Plan')}
                    </CardTitle>
                    <CardDescription>
                      {t('subscriptions.selectPlanDescription', 'Choose a subscription plan for this client')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subscriptions.plan', 'Plan')} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('subscriptions.selectPlanPlaceholder', 'Select a plan...')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plansLoading ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : plans.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                  {t('subscriptions.noPlansAvailable', 'No plans available')}
                                </div>
                              ) : (
                                plans.map((plan) => (
                                  <SelectItem key={plan._id} value={plan._id}>
                                    <div className="flex items-center justify-between gap-4">
                                      <span>{lang === 'ar' && plan.nameAr ? plan.nameAr : plan.name}</span>
                                      <span className="text-muted-foreground">
                                        {formatSubscriptionAmount(plan.amount, plan.currency, lang)} / {getBillingPeriodLabel(plan.billingPeriod, lang)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Plan Preview */}
                    {selectedPlan && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t('subscriptions.amount', 'Amount')}:</span>
                            <span className="font-medium ms-2">
                              {formatSubscriptionAmount(selectedPlan.amount, selectedPlan.currency, lang)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('subscriptions.billingPeriod', 'Billing Period')}:</span>
                            <span className="font-medium ms-2">
                              {getBillingPeriodLabel(selectedPlan.billingPeriod, lang)}
                            </span>
                          </div>
                          {selectedPlan.includedHours && (
                            <div>
                              <span className="text-muted-foreground">{t('subscriptions.includedHours', 'Included Hours')}:</span>
                              <span className="font-medium ms-2">{selectedPlan.includedHours}</span>
                            </div>
                          )}
                          {selectedPlan.trialDays && (
                            <div>
                              <span className="text-muted-foreground">{t('subscriptions.trialDays', 'Trial Days')}:</span>
                              <span className="font-medium ms-2">{selectedPlan.trialDays}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Client Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('subscriptions.clientDetails', 'Client Details')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subscriptions.client', 'Client')} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('subscriptions.selectClientPlaceholder', 'Select a client...')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientsLoading ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : clients.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                  {t('subscriptions.noClientsAvailable', 'No clients available')}
                                </div>
                              ) : (
                                clients.map((client: any) => (
                                  <SelectItem key={client._id} value={client._id}>
                                    {client.fullName || client.name || client.email}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Billing Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {t('subscriptions.billingDates', 'Billing Dates')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('subscriptions.startDate', 'Start Date')} *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('subscriptions.endDate', 'End Date')}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              {t('subscriptions.endDateDescription', 'Leave empty for ongoing subscription')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {t('common.notes', 'Notes')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subscriptions.clientNotes', 'Client Notes (English)')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('subscriptions.notesPlaceholder', 'Notes visible to client...')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notesAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subscriptions.clientNotesAr', 'Client Notes (Arabic)')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('subscriptions.notesPlaceholderAr', 'ملاحظات مرئية للعميل...')}
                              dir="rtl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="internalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subscriptions.internalNotes', 'Internal Notes')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('subscriptions.internalNotesPlaceholder', 'Internal notes (not visible to client)...')}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Repeat className="h-5 w-5" />
                      {t('subscriptions.settings', 'Settings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="autoRenew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>{t('subscriptions.autoRenew', 'Auto Renew')}</FormLabel>
                            <FormDescription className="text-xs">
                              {t('subscriptions.autoRenewDescription', 'Automatically renew subscription')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoInvoice"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>{t('subscriptions.autoInvoice', 'Auto Invoice')}</FormLabel>
                            <FormDescription className="text-xs">
                              {t('subscriptions.autoInvoiceDescription', 'Generate invoices automatically')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {selectedPlan?.trialDays && selectedPlan.trialDays > 0 && (
                      <FormField
                        control={form.control}
                        name="skipTrial"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('subscriptions.skipTrial', 'Skip Trial')}</FormLabel>
                              <FormDescription className="text-xs">
                                {t('subscriptions.skipTrialDescription', 'Start billing immediately')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Summary Card */}
                {selectedPlan && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('subscriptions.summary', 'Summary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('subscriptions.plan', 'Plan')}:</span>
                        <span className="font-medium">{lang === 'ar' && selectedPlan.nameAr ? selectedPlan.nameAr : selectedPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('subscriptions.amount', 'Amount')}:</span>
                        <span className="font-medium">{formatSubscriptionAmount(selectedPlan.amount, selectedPlan.currency, lang)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('subscriptions.billing', 'Billing')}:</span>
                        <span className="font-medium">{getBillingPeriodLabel(selectedPlan.billingPeriod, lang)}</span>
                      </div>
                      {selectedPlan.setupFee && selectedPlan.setupFee > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>{t('subscriptions.setupFee', 'Setup Fee')}:</span>
                          <span>{formatSubscriptionAmount(selectedPlan.setupFee, selectedPlan.currency, lang)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <GosiButton
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 me-2 animate-spin" />
                        {t('common.saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 me-2" />
                        {t('subscriptions.createSubscription', 'Create Subscription')}
                      </>
                    )}
                  </GosiButton>
                  <Link to={ROUTES.dashboard.finance.subscriptions.list} className="w-full">
                    <Button variant="outline" className="w-full">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </Main>
    </>
  );
}

export default SubscriptionCreateView;
