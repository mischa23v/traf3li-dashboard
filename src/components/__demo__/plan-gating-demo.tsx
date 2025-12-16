/**
 * Plan Gating Components Demo
 *
 * This file demonstrates all three components working together.
 * Use this as a reference or test page.
 *
 * To view: Add a route that renders this component
 */

import React, { useState } from 'react'
import { PlanGate, useFeatureAccess, usePlanAccess } from '../plan-gate'
import { UpgradePrompt } from '../upgrade-prompt'
import { PlanBadge, PlanIndicator } from '../plan-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import i18n from '@/i18n'

export function PlanGatingDemo() {
  const [modalOpen, setModalOpen] = useState(false)
  const isArabic = i18n.language === 'ar'

  // Hooks demo
  const hasAuditLogs = useFeatureAccess('audit_logs')
  const hasProPlan = usePlanAccess('professional')

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'عرض البوابات المبنية على الخطة' : 'Plan Gating Demo'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic
              ? 'اختبر مكونات التحكم في الوصول بناءً على الخطة'
              : 'Test plan-based access control components'}
          </p>
        </div>
        <PlanBadge showTrial clickable />
      </div>

      <Tabs defaultValue="planbadge" dir={isArabic ? 'rtl' : 'ltr'}>
        <TabsList>
          <TabsTrigger value="planbadge">
            {isArabic ? 'شارات الخطة' : 'Plan Badges'}
          </TabsTrigger>
          <TabsTrigger value="plangate">
            {isArabic ? 'بوابات الخطة' : 'Plan Gates'}
          </TabsTrigger>
          <TabsTrigger value="upgradeprompt">
            {isArabic ? 'مطالبات الترقية' : 'Upgrade Prompts'}
          </TabsTrigger>
          <TabsTrigger value="hooks">
            {isArabic ? 'Hooks' : 'Hooks'}
          </TabsTrigger>
        </TabsList>

        {/* Plan Badge Tab */}
        <TabsContent value="planbadge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'شارات الخطة' : 'Plan Badges'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'عرض الخطة الحالية للمستخدم'
                  : "Display user's current plan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  {isArabic ? 'الأحجام' : 'Sizes'}
                </p>
                <div className="flex items-center gap-3">
                  <PlanBadge size="sm" />
                  <PlanBadge size="md" />
                  <PlanBadge size="lg" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {isArabic ? 'مع مؤشر التجربة' : 'With Trial Indicator'}
                </p>
                <PlanBadge showTrial />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {isArabic ? 'جميع الخطط' : 'All Plans'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <PlanBadge plan="free" />
                  <PlanBadge plan="starter" />
                  <PlanBadge plan="professional" />
                  <PlanBadge plan="enterprise" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  {isArabic ? 'مؤشرات مدمجة' : 'Compact Indicators'}
                </p>
                <div className="flex gap-2">
                  <PlanIndicator plan="free" size="sm" />
                  <PlanIndicator plan="starter" size="md" />
                  <PlanIndicator plan="professional" size="md" />
                  <PlanIndicator plan="enterprise" size="lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Gate Tab */}
        <TabsContent value="plangate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'بوابة بسيطة' : 'Simple Gate'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'إخفاء المحتوى مع مطالبة الترقية الافتراضية'
                  : 'Hide content with default upgrade prompt'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanGate feature="audit_logs">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                  <p className="text-green-900 dark:text-green-100">
                    {isArabic
                      ? '✅ لديك وصول إلى سجلات التدقيق!'
                      : '✅ You have access to Audit Logs!'}
                  </p>
                </div>
              </PlanGate>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'بوابة مع قفل' : 'Gate with Lock'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'عرض معاينة ضبابية للمحتوى'
                  : 'Show blurred preview of content'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanGate feature="advanced_analytics" showLock>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold">
                    {isArabic ? 'تحليلات متقدمة' : 'Advanced Analytics'}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
                      <p className="text-2xl font-bold">1,234</p>
                      <p className="text-sm">{isArabic ? 'المستخدمون' : 'Users'}</p>
                    </div>
                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded">
                      <p className="text-2xl font-bold">5,678</p>
                      <p className="text-sm">{isArabic ? 'الجلسات' : 'Sessions'}</p>
                    </div>
                    <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded">
                      <p className="text-2xl font-bold">$12,345</p>
                      <p className="text-sm">{isArabic ? 'الإيرادات' : 'Revenue'}</p>
                    </div>
                  </div>
                </div>
              </PlanGate>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'بوابة مخفية' : 'Hidden Gate'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'إخفاء تام بدون مطالبة ترقية'
                  : 'Completely hide without upgrade prompt'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanGate feature="sso" fallback={null}>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-900 dark:text-amber-100">
                    {isArabic
                      ? '✅ لديك وصول إلى SSO!'
                      : '✅ You have access to SSO!'}
                  </p>
                </div>
              </PlanGate>
              <p className="text-sm text-muted-foreground mt-2">
                {isArabic
                  ? '(لن ترى أي شيء إذا لم يكن لديك وصول)'
                  : "(You won't see anything if you don't have access)"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Prompt Tab */}
        <TabsContent value="upgradeprompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'بطاقة (افتراضي)' : 'Card (Default)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpgradePrompt
                feature="audit_logs"
                requiredPlan="professional"
                variant="card"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'لافتة' : 'Banner'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpgradePrompt
                feature="api_access"
                requiredPlan="professional"
                variant="banner"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'مضمّن' : 'Inline'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>{isArabic ? 'تسجيل الدخول الموحد' : 'Single Sign-On'}</span>
                <UpgradePrompt
                  feature="sso"
                  requiredPlan="enterprise"
                  variant="inline"
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>{isArabic ? 'الوصول إلى API' : 'API Access'}</span>
                <UpgradePrompt
                  feature="api_access"
                  requiredPlan="professional"
                  variant="inline"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'نافذة منبثقة' : 'Modal'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setModalOpen(true)}>
                {isArabic ? 'فتح النافذة المنبثقة' : 'Open Modal'}
              </Button>
              <UpgradePrompt
                feature="workflow_automation"
                requiredPlan="professional"
                variant="modal"
                open={modalOpen}
                onClose={() => setModalOpen(false)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hooks Tab */}
        <TabsContent value="hooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'استخدام Hooks' : 'Using Hooks'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'استخدم الـ hooks للمنطق الشرطي'
                  : 'Use hooks for conditional logic'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border">
                <code className="text-sm">
                  const hasAuditLogs = useFeatureAccess('audit_logs')
                </code>
                <p className="mt-2">
                  {isArabic ? 'النتيجة: ' : 'Result: '}
                  <span className={hasAuditLogs ? 'text-green-600' : 'text-red-600'}>
                    {hasAuditLogs ? '✅ true' : '❌ false'}
                  </span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded border">
                <code className="text-sm">
                  const hasProPlan = usePlanAccess('professional')
                </code>
                <p className="mt-2">
                  {isArabic ? 'النتيجة: ' : 'Result: '}
                  <span className={hasProPlan ? 'text-green-600' : 'text-red-600'}>
                    {hasProPlan ? '✅ true' : '❌ false'}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                {hasAuditLogs ? (
                  <Button>
                    {isArabic ? 'عرض سجلات التدقيق' : 'View Audit Logs'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    {isArabic ? 'سجلات التدقيق (مقفلة)' : 'Audit Logs (Locked)'}
                  </Button>
                )}

                {hasProPlan && (
                  <Button variant="secondary">
                    {isArabic ? 'ميزات احترافية' : 'Pro Features'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PlanGatingDemo
