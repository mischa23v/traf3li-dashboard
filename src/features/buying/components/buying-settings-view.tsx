/**
 * Buying Settings View
 * Settings page for Buying/Procurement module configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  Building2,
  Clock,
  DollarSign,
  FileText,
  UserCheck,
  ShoppingCart,
  Mail,
  Link as LinkIcon,
  Loader2,
  AlertTriangle,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'

import { useBuyingSettings, useUpdateBuyingSettings } from '@/hooks/use-buying'
import { BuyingSidebar } from './buying-sidebar'

// Extended settings interface to include additional fields
interface ExtendedBuyingSettings {
  // General Settings
  defaultSupplierGroup?: string
  defaultPaymentTerms?: string
  defaultPaymentTermsDays?: number
  defaultCurrency?: string
  purchaseOrderNamingSeries?: string

  // Approval Workflow
  requirePOApproval?: boolean
  approvalThresholdAmount?: number
  defaultApprovers?: string[]

  // Supplier Settings
  autoBlockSuppliers?: boolean
  lateDeliveryThreshold?: number
  enableSupplierScorecard?: boolean

  // Email Templates
  poEmailTemplate?: string
  rfqEmailTemplate?: string

  // Integration
  linkToInventory?: boolean
  linkToAccounting?: boolean

  // Existing fields from BuyingSettings
  defaultTaxTemplate?: string
  defaultBuyingPriceList?: string
  overDeliveryAllowance?: number
  underDeliveryAllowance?: number
  supplierNamingSeries?: string
  purchaseReceiptNamingSeries?: string
  purchaseInvoiceNamingSeries?: string
  maintainSameRate?: boolean
  allowMultiplePOs?: boolean
}

export function BuyingSettingsView() {
  const { t } = useTranslation()
  const { data: settingsData, isLoading } = useBuyingSettings()
  const updateSettingsMutation = useUpdateBuyingSettings()

  const [settings, setSettings] = useState<ExtendedBuyingSettings>({
    // General Settings
    defaultSupplierGroup: '',
    defaultPaymentTerms: '',
    defaultPaymentTermsDays: 30,
    defaultCurrency: 'SAR',
    purchaseOrderNamingSeries: 'PO-',

    // Approval Workflow
    requirePOApproval: false,
    approvalThresholdAmount: 10000,
    defaultApprovers: [],

    // Supplier Settings
    autoBlockSuppliers: false,
    lateDeliveryThreshold: 7,
    enableSupplierScorecard: false,

    // Email Templates
    poEmailTemplate: 'default_po_template',
    rfqEmailTemplate: 'default_rfq_template',

    // Integration
    linkToInventory: true,
    linkToAccounting: true,

    // Existing fields
    defaultTaxTemplate: '',
    defaultBuyingPriceList: '',
    overDeliveryAllowance: 5,
    underDeliveryAllowance: 5,
    supplierNamingSeries: 'SUP-',
    purchaseReceiptNamingSeries: 'PR-',
    purchaseInvoiceNamingSeries: 'PI-',
    maintainSameRate: true,
    allowMultiplePOs: true,
  })

  // Load settings from API
  useEffect(() => {
    if (settingsData) {
      setSettings((prev) => ({
        ...prev,
        ...settingsData,
      }))
    }
  }, [settingsData])

  const handleInputChange = (field: keyof ExtendedBuyingSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateSettingsMutation.mutateAsync(settings)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const topNav = [
    { title: t('buying.overview', 'نظرة عامة'), href: '/dashboard/buying', isActive: false },
    { title: t('buying.settings', 'إعدادات المشتريات'), href: '/dashboard/buying/settings', isActive: true },
  ]

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </Header>

        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
          <ProductivityHero
            badge={t('buying.badge', 'المشتريات')}
            title={t('buying.settings', 'إعدادات المشتريات')}
            type="buying"
            listMode={true}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
        {/* HERO CARD - Full width */}
        <ProductivityHero
          badge={t('buying.badge', 'المشتريات')}
          title={t('buying.settings', 'إعدادات المشتريات')}
          type="buying"
          listMode={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.generalSettings', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t('buying.generalSettingsDesc', 'إعدادات افتراضية لوحدة المشتريات')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultSupplierGroup" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.defaultSupplierGroup', 'مجموعة الموردين الافتراضية')}
                      </Label>
                      <Select
                        value={settings.defaultSupplierGroup}
                        onValueChange={(v) => handleInputChange('defaultSupplierGroup', v)}
                      >
                        <SelectTrigger id="defaultSupplierGroup" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder={t('buying.selectSupplierGroup', 'اختر مجموعة الموردين')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">{t('buying.general', 'عام')}</SelectItem>
                          <SelectItem value="rawMaterials">{t('buying.rawMaterials', 'مواد خام')}</SelectItem>
                          <SelectItem value="services">{t('buying.services', 'خدمات')}</SelectItem>
                          <SelectItem value="hardware">{t('buying.hardware', 'معدات')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultPaymentTermsDays" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.defaultPaymentTerms', 'شروط الدفع الافتراضية (أيام)')}
                      </Label>
                      <Input
                        id="defaultPaymentTermsDays"
                        type="number"
                        min="0"
                        placeholder="30"
                        value={settings.defaultPaymentTermsDays || ''}
                        onChange={(e) => handleInputChange('defaultPaymentTermsDays', parseInt(e.target.value))}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultCurrency" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.defaultCurrency', 'العملة الافتراضية')}
                      </Label>
                      <Select
                        value={settings.defaultCurrency}
                        onValueChange={(v) => handleInputChange('defaultCurrency', v)}
                      >
                        <SelectTrigger id="defaultCurrency" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">{t('buying.currencySAR', 'ريال سعودي (SAR)')}</SelectItem>
                          <SelectItem value="USD">{t('buying.currencyUSD', 'دولار أمريكي (USD)')}</SelectItem>
                          <SelectItem value="EUR">{t('buying.currencyEUR', 'يورو (EUR)')}</SelectItem>
                          <SelectItem value="AED">{t('buying.currencyAED', 'درهم إماراتي (AED)')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purchaseOrderNamingSeries" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.poNamingSeries', 'سلسلة ترقيم أوامر الشراء')}
                      </Label>
                      <Input
                        id="purchaseOrderNamingSeries"
                        placeholder="PO-"
                        value={settings.purchaseOrderNamingSeries || ''}
                        onChange={(e) => handleInputChange('purchaseOrderNamingSeries', e.target.value)}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Workflow */}
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.approvalWorkflow', 'سير عمل الاعتماد')}
                  </CardTitle>
                  <CardDescription>
                    {t('buying.approvalWorkflowDesc', 'إعدادات اعتماد أوامر الشراء')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePOApproval" className="text-sm font-medium text-slate-700">
                        {t('buying.requirePOApproval', 'يتطلب اعتماد أمر الشراء')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('buying.requirePOApprovalDesc', 'تفعيل عملية الاعتماد لأوامر الشراء')}
                      </p>
                    </div>
                    <Switch
                      id="requirePOApproval"
                      checked={settings.requirePOApproval}
                      onCheckedChange={(checked) => handleInputChange('requirePOApproval', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="approvalThresholdAmount" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.approvalThreshold', 'حد المبلغ للاعتماد')}
                      </Label>
                      <Input
                        id="approvalThresholdAmount"
                        type="number"
                        min="0"
                        placeholder="10000"
                        value={settings.approvalThresholdAmount || ''}
                        onChange={(e) => handleInputChange('approvalThresholdAmount', parseFloat(e.target.value))}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={!settings.requirePOApproval}
                      />
                      <p className="text-xs text-slate-500">
                        {t('buying.approvalThresholdDesc', 'الأوامر فوق هذا المبلغ تحتاج لاعتماد')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultApprovers" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.defaultApprovers', 'المعتمدين الافتراضيين')}
                      </Label>
                      <Input
                        id="defaultApprovers"
                        placeholder={t('buying.defaultApproversPlaceholder', 'أدخل قائمة المعتمدين')}
                        value={settings.defaultApprovers?.join(', ') || ''}
                        onChange={(e) => handleInputChange('defaultApprovers', e.target.value.split(',').map(s => s.trim()))}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={!settings.requirePOApproval}
                      />
                      <p className="text-xs text-slate-500">
                        {t('buying.defaultApproversDesc', 'افصل بين الأسماء بفاصلة')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Settings */}
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.supplierSettings', 'إعدادات الموردين')}
                  </CardTitle>
                  <CardDescription>
                    {t('buying.supplierSettingsDesc', 'إعدادات تتعلق بإدارة الموردين')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoBlockSuppliers" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />
                        {t('buying.autoBlockSuppliers', 'حظر الموردين تلقائياً عند التأخير')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('buying.autoBlockSuppliersDesc', 'حظر تلقائي للموردين المتأخرين في التسليم')}
                      </p>
                    </div>
                    <Switch
                      id="autoBlockSuppliers"
                      checked={settings.autoBlockSuppliers}
                      onCheckedChange={(checked) => handleInputChange('autoBlockSuppliers', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="lateDeliveryThreshold" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.lateDeliveryThreshold', 'حد التأخير في التسليم (أيام)')}
                      </Label>
                      <Input
                        id="lateDeliveryThreshold"
                        type="number"
                        min="0"
                        placeholder="7"
                        value={settings.lateDeliveryThreshold || ''}
                        onChange={(e) => handleInputChange('lateDeliveryThreshold', parseInt(e.target.value))}
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                        disabled={!settings.autoBlockSuppliers}
                      />
                      <p className="text-xs text-slate-500">
                        {t('buying.lateDeliveryThresholdDesc', 'عدد الأيام قبل اعتبار التسليم متأخر')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableSupplierScorecard" className="text-sm font-medium text-slate-700">
                            {t('buying.enableSupplierScorecard', 'تفعيل بطاقة تقييم الموردين')}
                          </Label>
                          <p className="text-xs text-slate-500">
                            {t('buying.enableSupplierScorecardDesc', 'تقييم أداء الموردين')}
                          </p>
                        </div>
                        <Switch
                          id="enableSupplierScorecard"
                          checked={settings.enableSupplierScorecard}
                          onCheckedChange={(checked) => handleInputChange('enableSupplierScorecard', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Templates */}
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <Mail className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.emailTemplates', 'قوالب البريد الإلكتروني')}
                  </CardTitle>
                  <CardDescription>
                    {t('buying.emailTemplatesDesc', 'قوالب الرسائل المرسلة للموردين')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="poEmailTemplate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.poEmailTemplate', 'قالب بريد أمر الشراء')}
                      </Label>
                      <Select
                        value={settings.poEmailTemplate}
                        onValueChange={(v) => handleInputChange('poEmailTemplate', v)}
                      >
                        <SelectTrigger id="poEmailTemplate" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default_po_template">{t('buying.defaultTemplate', 'القالب الافتراضي')}</SelectItem>
                          <SelectItem value="formal_po_template">{t('buying.formalTemplate', 'القالب الرسمي')}</SelectItem>
                          <SelectItem value="simple_po_template">{t('buying.simpleTemplate', 'القالب البسيط')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rfqEmailTemplate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                        {t('buying.rfqEmailTemplate', 'قالب بريد طلب عرض السعر')}
                      </Label>
                      <Select
                        value={settings.rfqEmailTemplate}
                        onValueChange={(v) => handleInputChange('rfqEmailTemplate', v)}
                      >
                        <SelectTrigger id="rfqEmailTemplate" className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default_rfq_template">{t('buying.defaultTemplate', 'القالب الافتراضي')}</SelectItem>
                          <SelectItem value="formal_rfq_template">{t('buying.formalTemplate', 'القالب الرسمي')}</SelectItem>
                          <SelectItem value="simple_rfq_template">{t('buying.simpleTemplate', 'القالب البسيط')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Settings */}
              <Card className="rounded-3xl border-slate-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                    {t('buying.integration', 'الربط مع الوحدات الأخرى')}
                  </CardTitle>
                  <CardDescription>
                    {t('buying.integrationDesc', 'ربط وحدة المشتريات مع الوحدات الأخرى')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <Label htmlFor="linkToInventory" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" aria-hidden="true" />
                        {t('buying.linkToInventory', 'الربط مع وحدة المخزون')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('buying.linkToInventoryDesc', 'تحديث المخزون تلقائياً عند استلام المشتريات')}
                      </p>
                    </div>
                    <Switch
                      id="linkToInventory"
                      checked={settings.linkToInventory}
                      onCheckedChange={(checked) => handleInputChange('linkToInventory', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="space-y-0.5">
                      <Label htmlFor="linkToAccounting" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" aria-hidden="true" />
                        {t('buying.linkToAccounting', 'الربط مع وحدة المحاسبة')}
                      </Label>
                      <p className="text-xs text-slate-500">
                        {t('buying.linkToAccountingDesc', 'إنشاء قيود محاسبية تلقائياً للمشتريات')}
                      </p>
                    </div>
                    <Switch
                      id="linkToAccounting"
                      checked={settings.linkToAccounting}
                      onCheckedChange={(checked) => handleInputChange('linkToAccounting', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pb-8">
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[160px] rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      {t('common.saving', 'جاري الحفظ...')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" aria-hidden="true" />
                      {t('buying.saveSettings', 'حفظ الإعدادات')}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <BuyingSidebar />
        </div>
      </Main>
    </>
  )
}
