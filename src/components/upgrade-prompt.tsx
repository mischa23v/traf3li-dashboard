/**
 * UpgradePrompt - Beautiful upgrade prompt component
 * Shows which feature requires upgrade and provides CTA to upgrade
 *
 * Supports multiple variants:
 * - modal: Full modal dialog
 * - card: Standalone card
 * - banner: Horizontal banner
 * - inline: Compact inline message
 */

import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { Plan, PLAN_FEATURES } from './plan-gate'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Plan metadata for display
const PLAN_META: Record<Plan, {
  nameAr: string
  nameEn: string
  color: string
  icon: React.ReactNode
  features: { ar: string; en: string }[]
}> = {
  free: {
    nameAr: 'المجانية',
    nameEn: 'Free',
    color: 'bg-gray-500',
    icon: <Lock className="size-4" />,
    features: [
      { ar: 'الميزات الأساسية', en: 'Basic features' },
      { ar: 'حتى 3 مستخدمين', en: 'Up to 3 users' },
    ],
  },
  starter: {
    nameAr: 'المبتدئة',
    nameEn: 'Starter',
    color: 'bg-blue-500',
    icon: <Sparkles className="size-4" />,
    features: [
      { ar: 'جميع ميزات المجانية', en: 'All Free features' },
      { ar: 'حتى 10 مستخدمين', en: 'Up to 10 users' },
      { ar: 'تصدير البيانات', en: 'Data export' },
      { ar: 'قوالب فواتير مخصصة', en: 'Custom invoice templates' },
    ],
  },
  professional: {
    nameAr: 'الاحترافية',
    nameEn: 'Professional',
    color: 'bg-purple-500',
    icon: <Crown className="size-4" />,
    features: [
      { ar: 'جميع ميزات المبتدئة', en: 'All Starter features' },
      { ar: 'مستخدمين غير محدودين', en: 'Unlimited users' },
      { ar: 'سجلات التدقيق', en: 'Audit logs' },
      { ar: 'تقارير متقدمة', en: 'Advanced reports' },
      { ar: 'أتمتة العمليات', en: 'Workflow automation' },
      { ar: 'دعم ذو أولوية', en: 'Priority support' },
    ],
  },
  enterprise: {
    nameAr: 'المؤسسية',
    nameEn: 'Enterprise',
    color: 'bg-amber-500',
    icon: <Crown className="size-4" />,
    features: [
      { ar: 'جميع ميزات الاحترافية', en: 'All Professional features' },
      { ar: 'دعم مخصص 24/7', en: 'Dedicated 24/7 support' },
      { ar: 'تكاملات مخصصة', en: 'Custom integrations' },
      { ar: 'مدير حساب مخصص', en: 'Dedicated account manager' },
      { ar: 'تسجيل دخول موحد (SSO)', en: 'Single Sign-On (SSO)' },
      { ar: 'تحليلات متقدمة للموارد البشرية', en: 'Advanced HR analytics' },
    ],
  },
}

// Feature-specific benefits
const FEATURE_BENEFITS: Record<string, { ar: string; en: string }[]> = {
  audit_logs: [
    { ar: 'تتبع جميع التغييرات والإجراءات', en: 'Track all changes and actions' },
    { ar: 'معرفة من فعل ماذا ومتى', en: 'Know who did what and when' },
    { ar: 'الامتثال والأمان', en: 'Compliance and security' },
  ],
  advanced_analytics: [
    { ar: 'رؤى أعمق حول عملك', en: 'Deeper insights into your business' },
    { ar: 'تقارير قابلة للتخصيص', en: 'Customizable reports' },
    { ar: 'تصور البيانات', en: 'Data visualization' },
  ],
  workflow_automation: [
    { ar: 'وفر الوقت بأتمتة المهام المتكررة', en: 'Save time by automating repetitive tasks' },
    { ar: 'قلل الأخطاء البشرية', en: 'Reduce human errors' },
    { ar: 'حسّن الكفاءة', en: 'Improve efficiency' },
  ],
  api_access: [
    { ar: 'تكامل مع أدواتك المفضلة', en: 'Integrate with your favorite tools' },
    { ar: 'بناء حلول مخصصة', en: 'Build custom solutions' },
    { ar: 'أتمتة سير العمل', en: 'Automate workflows' },
  ],
}

interface UpgradePromptProps {
  /** Feature being accessed */
  feature?: string
  /** Plan required for this feature */
  requiredPlan?: Plan
  /** Visual variant */
  variant?: 'modal' | 'card' | 'banner' | 'inline'
  /** Callback when upgrade button is clicked */
  onUpgrade?: () => void
  /** Callback when modal/banner is closed */
  onClose?: () => void
  /** Whether to show the modal (only for modal variant) */
  open?: boolean
  /** Custom className */
  className?: string
}

export function UpgradePrompt({
  feature,
  requiredPlan = 'professional',
  variant = 'card',
  onUpgrade,
  onClose,
  open = true,
  className,
}: UpgradePromptProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [isOpen, setIsOpen] = useState(open)
  const isArabic = i18n.language === 'ar'

  const currentPlan = user?.plan || 'free'
  const currentPlanMeta = PLAN_META[currentPlan]
  const requiredPlanMeta = PLAN_META[requiredPlan]

  // Get feature name from feature key
  const getFeatureName = () => {
    if (!feature) return null

    // Convert feature key to readable name
    const featureNames: Record<string, { ar: string; en: string }> = {
      audit_logs: { ar: 'سجلات التدقيق', en: 'Audit Logs' },
      advanced_analytics: { ar: 'التحليلات المتقدمة', en: 'Advanced Analytics' },
      custom_reports: { ar: 'التقارير المخصصة', en: 'Custom Reports' },
      workflow_automation: { ar: 'أتمتة العمليات', en: 'Workflow Automation' },
      api_access: { ar: 'الوصول إلى API', en: 'API Access' },
      priority_support: { ar: 'الدعم ذو الأولوية', en: 'Priority Support' },
      performance_reviews: { ar: 'تقييمات الأداء', en: 'Performance Reviews' },
      succession_planning: { ar: 'التخطيط للخلافة', en: 'Succession Planning' },
      advanced_billing: { ar: 'الفوترة المتقدمة', en: 'Advanced Billing' },
      sso: { ar: 'تسجيل الدخول الموحد', en: 'Single Sign-On' },
    }

    return featureNames[feature] || { ar: feature, en: feature }
  }

  const featureName = getFeatureName()
  const featureBenefits = feature ? FEATURE_BENEFITS[feature] : null

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Navigate to pricing/billing page
      navigate({ to: '/dashboard/settings/billing' })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Content component used across all variants
  const Content = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn('space-y-4', compact && 'space-y-2')}>
      {/* Feature Name */}
      {featureName && !compact && (
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-muted-foreground" />
          <span className="text-lg font-semibold">
            {isArabic ? featureName.ar : featureName.en}
          </span>
        </div>
      )}

      {/* Current vs Required Plan */}
      <div className={cn('flex items-center gap-3', compact && 'gap-2')}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {currentPlanMeta.icon}
            {isArabic ? currentPlanMeta.nameAr : currentPlanMeta.nameEn}
          </Badge>
        </div>
        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-2">
          <Badge className={cn('gap-1', requiredPlanMeta.color, 'text-white border-0')}>
            {requiredPlanMeta.icon}
            {isArabic ? requiredPlanMeta.nameAr : requiredPlanMeta.nameEn}
          </Badge>
        </div>
      </div>

      {/* Feature Benefits */}
      {featureBenefits && !compact && (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-muted-foreground">
            {isArabic ? 'فوائد هذه الميزة:' : 'Benefits of this feature:'}
          </p>
          <ul className="space-y-1.5">
            {featureBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-green-500 shrink-0 mt-0.5" />
                <span>{isArabic ? benefit.ar : benefit.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Plan Features */}
      {!compact && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground">
            {isArabic
              ? `ما تحصل عليه مع ${requiredPlanMeta.nameAr}:`
              : `What you get with ${requiredPlanMeta.nameEn}:`}
          </p>
          <ul className="space-y-1.5">
            {requiredPlanMeta.features.slice(0, 4).map((feat, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{isArabic ? feat.ar : feat.en}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  // Modal Variant
  if (variant === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={className}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="size-5 text-amber-500" />
              {isArabic ? 'الترقية مطلوبة' : 'Upgrade Required'}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? `هذه الميزة متاحة في الخطة ${requiredPlanMeta.nameAr}`
                : `This feature is available on the ${requiredPlanMeta.nameEn} plan`}
            </DialogDescription>
          </DialogHeader>
          <Content />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleUpgrade}>
              <Crown className="size-4" />
              {isArabic ? 'الترقية الآن' : 'Upgrade Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Banner Variant
  if (variant === 'banner') {
    if (!isOpen) return null

    return (
      <Alert className={cn('border-amber-500 bg-amber-50 dark:bg-amber-950/20', className)}>
        <Crown className="size-4 text-amber-500" />
        <AlertTitle className="flex items-center justify-between">
          <span>
            {isArabic ? 'الترقية مطلوبة' : 'Upgrade Required'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 -me-2"
            onClick={handleClose}
          >
            <X className="size-4" />
          </Button>
        </AlertTitle>
        <AlertDescription>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {isArabic
                ? `هذه الميزة متاحة في الخطة ${requiredPlanMeta.nameAr}`
                : `This feature is available on the ${requiredPlanMeta.nameEn} plan`}
            </div>
            <Button size="sm" onClick={handleUpgrade}>
              {isArabic ? 'الترقية الآن' : 'Upgrade Now'}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Inline Variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 text-sm text-muted-foreground', className)}>
        <Lock className="size-4 shrink-0" />
        <span>
          {isArabic
            ? `متاح في ${requiredPlanMeta.nameAr}`
            : `Available on ${requiredPlanMeta.nameEn}`}
        </span>
        <Button size="sm" variant="outline" onClick={handleUpgrade}>
          <Crown className="size-3" />
          {isArabic ? 'ترقية' : 'Upgrade'}
        </Button>
      </div>
    )
  }

  // Card Variant (default)
  return (
    <Card className={cn('max-w-lg mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-5 text-amber-500" />
          {isArabic ? 'الترقية مطلوبة' : 'Upgrade Required'}
        </CardTitle>
        <CardDescription>
          {isArabic
            ? `هذه الميزة متاحة في الخطة ${requiredPlanMeta.nameAr}`
            : `This feature is available on the ${requiredPlanMeta.nameEn} plan`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Content />
      </CardContent>
      <CardFooter className="flex gap-2">
        {onClose && (
          <Button variant="outline" onClick={handleClose} className="flex-1">
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
        )}
        <Button onClick={handleUpgrade} className="flex-1">
          <Crown className="size-4" />
          {isArabic ? 'الترقية الآن' : 'Upgrade Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}
