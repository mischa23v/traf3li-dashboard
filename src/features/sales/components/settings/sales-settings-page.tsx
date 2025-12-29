/**
 * Sales Settings Page
 *
 * Main sales settings page with tabs for different setting sections.
 * Supports comprehensive configuration of pricing, discounts, commissions, returns, etc.
 */

import { useState, useEffect } from 'react'
import {
  Settings,
  FileText,
  ShoppingCart,
  DollarSign,
  Percent,
  TrendingUp,
  Truck,
  Undo2,
  Receipt,
  FileCheck,
  Hash,
  Save,
  Loader2,
  AlertCircle,
  Download,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useTranslation } from 'react-i18next'
import {
  useSalesSettings,
  useUpdateSalesSettings,
  useExportSalesSettings,
} from '@/hooks/useSalesSettings'
import { DEFAULT_SALES_SETTINGS } from '@/types/salesSettings'
import type { SalesSettings } from '@/types/salesSettings'

// Import section components
import { GeneralSettingsSection } from './general-settings-section'
import { QuoteSettingsSection } from './quote-settings-section'
import { OrderSettingsSection } from './order-settings-section'
import { PricingSettingsSection } from './pricing-settings-section'
import { DiscountSettingsSection } from './discount-settings-section'
import { CommissionSettingsSection } from './commission-settings-section'
import { DeliverySettingsSection } from './delivery-settings-section'
import { ReturnSettingsSection } from './return-settings-section'
import { TaxSettingsSection } from './tax-settings-section'
import { DocumentSettingsSection } from './document-settings-section'
import { SequenceSettingsSection } from './sequence-settings-section'

export function SalesSettingsPage() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const { data: settingsData, isLoading } = useSalesSettings()
  const updateSettingsMutation = useUpdateSalesSettings()
  const exportSettingsMutation = useExportSalesSettings()

  const [formData, setFormData] = useState<SalesSettings>(DEFAULT_SALES_SETTINGS)

  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData)
    }
  }, [settingsData])

  const handleSectionChange = (section: keyof SalesSettings, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync({
      section: 'all',
      data: formData,
    })
  }

  const handleExport = async () => {
    await exportSettingsMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="p-6 lg:p-8 bg-[#f8f9fa] dark:bg-slate-900">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-[600px] w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="p-6 lg:p-8 bg-[#f8f9fa] dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy dark:text-white">
              {isRTL ? 'إعدادات المبيعات' : 'Sales Settings'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isRTL
                ? 'إدارة التسعير والخصومات والعمولات والإرجاع'
                : 'Configure pricing, discounts, commissions, and returns'}
            </p>
          </div>

          {/* Backend Integration Notice */}
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="space-y-2">
                <p dir={isRTL ? 'rtl' : 'ltr'}>
                  <strong>[BACKEND-PENDING]</strong>{' '}
                  {isRTL
                    ? 'هذه الصفحة قيد التطوير. التغييرات ستُحفظ محليًا حتى يتم ربط API.'
                    : 'This page is under development. Changes will be saved locally until the API is connected.'}
                </p>
                <p className="text-xs font-mono" dir="ltr">
                  Required endpoints: GET/PUT /api/settings/sales
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-11 h-auto gap-1 mb-6">
                <TabsTrigger value="general" className="flex flex-col items-center gap-1 py-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'عام' : 'General'}</span>
                </TabsTrigger>
                <TabsTrigger value="quotes" className="flex flex-col items-center gap-1 py-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'العروض' : 'Quotes'}</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex flex-col items-center gap-1 py-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الطلبات' : 'Orders'}</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex flex-col items-center gap-1 py-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'التسعير' : 'Pricing'}</span>
                </TabsTrigger>
                <TabsTrigger value="discounts" className="flex flex-col items-center gap-1 py-2">
                  <Percent className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الخصومات' : 'Discounts'}</span>
                </TabsTrigger>
                <TabsTrigger value="commissions" className="flex flex-col items-center gap-1 py-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'العمولات' : 'Commissions'}</span>
                </TabsTrigger>
                <TabsTrigger value="delivery" className="flex flex-col items-center gap-1 py-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'التسليم' : 'Delivery'}</span>
                </TabsTrigger>
                <TabsTrigger value="returns" className="flex flex-col items-center gap-1 py-2">
                  <Undo2 className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الإرجاع' : 'Returns'}</span>
                </TabsTrigger>
                <TabsTrigger value="tax" className="flex flex-col items-center gap-1 py-2">
                  <Receipt className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'الضرائب' : 'Tax'}</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex flex-col items-center gap-1 py-2">
                  <FileCheck className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'المستندات' : 'Documents'}</span>
                </TabsTrigger>
                <TabsTrigger value="sequences" className="flex flex-col items-center gap-1 py-2">
                  <Hash className="h-4 w-4" />
                  <span className="text-xs">{isRTL ? 'التسلسل' : 'Sequences'}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralSettingsSection
                  settings={formData.general}
                  onChange={(data) => handleSectionChange('general', data)}
                />
              </TabsContent>

              <TabsContent value="quotes">
                <QuoteSettingsSection
                  settings={formData.quotes}
                  onChange={(data) => handleSectionChange('quotes', data)}
                />
              </TabsContent>

              <TabsContent value="orders">
                <OrderSettingsSection
                  settings={formData.orders}
                  onChange={(data) => handleSectionChange('orders', data)}
                />
              </TabsContent>

              <TabsContent value="pricing">
                <PricingSettingsSection
                  settings={formData.pricing}
                  onChange={(data) => handleSectionChange('pricing', data)}
                />
              </TabsContent>

              <TabsContent value="discounts">
                <DiscountSettingsSection
                  settings={formData.discounts}
                  onChange={(data) => handleSectionChange('discounts', data)}
                />
              </TabsContent>

              <TabsContent value="commissions">
                <CommissionSettingsSection
                  settings={formData.commissions}
                  onChange={(data) => handleSectionChange('commissions', data)}
                />
              </TabsContent>

              <TabsContent value="delivery">
                <DeliverySettingsSection
                  settings={formData.delivery}
                  onChange={(data) => handleSectionChange('delivery', data)}
                />
              </TabsContent>

              <TabsContent value="returns">
                <ReturnSettingsSection
                  settings={formData.returns}
                  onChange={(data) => handleSectionChange('returns', data)}
                />
              </TabsContent>

              <TabsContent value="tax">
                <TaxSettingsSection
                  settings={formData.tax}
                  onChange={(data) => handleSectionChange('tax', data)}
                />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentSettingsSection
                  settings={formData.documents}
                  onChange={(data) => handleSectionChange('documents', data)}
                />
              </TabsContent>

              <TabsContent value="sequences">
                <SequenceSettingsSection
                  settings={formData.sequences}
                  onChange={(data) => handleSectionChange('sequences', data)}
                />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={exportSettingsMutation.isPending}
              >
                {exportSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 me-2" />
                )}
                {isRTL ? 'تصدير' : 'Export'}
              </Button>

              <Button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/90"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 ms-2" />
                )}
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
