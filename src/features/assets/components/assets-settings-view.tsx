/**
 * Assets Settings View
 * Comprehensive settings page for asset management configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Save,
  TrendingDown,
  Wrench,
  FolderOpen,
  ShieldCheck,
  Hash,
  Building2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useAssetSettings, useUpdateAssetSettings, useAssetCategories } from '@/hooks/use-assets'
import { useStaff } from '@/hooks/useStaff'
import type { AssetSettings, DepreciationMethod } from '@/types/assets'
import { AssetsSidebar } from './assets-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'assets.assets', href: '/dashboard/assets' },
  { title: 'assets.settings', href: '/dashboard/assets/settings' },
]

const DEPRECIATION_METHODS: { value: DepreciationMethod; label: string; labelEn: string }[] = [
  { value: 'straight_line', label: 'القسط الثابت', labelEn: 'Straight Line' },
  { value: 'double_declining_balance', label: 'الرصيد المتناقص المزدوج', labelEn: 'Double Declining Balance' },
  { value: 'written_down_value', label: 'القيمة المخفضة', labelEn: 'Written Down Value' },
]

const DEPRECIATION_FREQUENCIES = [
  { value: 1, label: 'شهري', labelEn: 'Monthly' },
  { value: 3, label: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 6, label: 'نصف سنوي', labelEn: 'Semi-Annual' },
  { value: 12, label: 'سنوي', labelEn: 'Annual' },
]

const MAINTENANCE_FREQUENCIES = [
  { value: 'weekly', label: 'أسبوعي', labelEn: 'Weekly' },
  { value: 'monthly', label: 'شهري', labelEn: 'Monthly' },
  { value: 'quarterly', label: 'ربع سنوي', labelEn: 'Quarterly' },
  { value: 'semi-annual', label: 'نصف سنوي', labelEn: 'Semi-Annual' },
  { value: 'annual', label: 'سنوي', labelEn: 'Annual' },
]

export function AssetsSettingsView() {
  const { t } = useTranslation()
  const { data: settingsData, isLoading } = useAssetSettings()
  const updateSettingsMutation = useUpdateAssetSettings()
  const { data: assetCategories, isLoading: loadingCategories } = useAssetCategories()
  const { data: staffData } = useStaff()

  // Form state
  const [formData, setFormData] = useState<Partial<AssetSettings> & {
    defaultAssetCategory?: string
    assetNumberingType?: 'auto' | 'manual'
    defaultUsefulLife?: number
    defaultFrequency?: number
    calculateDepreciationOn?: 'purchase_date' | 'start_date'
    autoPostDepreciation?: boolean
    enableMaintenanceReminders?: boolean
    maintenanceReminderDays?: number
    defaultMaintenanceFrequency?: string
    maintenanceAssignee?: string
    trackInsurance?: boolean
    insuranceRenewalReminderDays?: number
  }>({
    assetNamingSeries: 'ASSET-',
    defaultAssetCategory: '',
    assetNumberingType: 'auto',
    defaultDepreciationMethod: 'straight_line',
    defaultUsefulLife: 5,
    defaultFrequency: 12,
    calculateDepreciationOn: 'purchase_date',
    scheduleDateBasedOn: 'purchase_date',
    autoPostDepreciation: false,
    enableDepreciationPosting: false,
    enableMaintenanceReminders: false,
    maintenanceReminderDays: 7,
    defaultMaintenanceFrequency: 'monthly',
    maintenanceAssignee: '',
    trackInsurance: false,
    insuranceRenewalReminderDays: 30,
  })

  // Category management state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // Load settings data
  useEffect(() => {
    if (settingsData) {
      setFormData({
        ...formData,
        ...settingsData,
        calculateDepreciationOn: settingsData.scheduleDateBasedOn || 'purchase_date',
        autoPostDepreciation: settingsData.enableDepreciationPosting || false,
      })
    }
  }, [settingsData])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const updateData: Partial<AssetSettings> = {
        assetNamingSeries: formData.assetNamingSeries,
        defaultDepreciationMethod: formData.defaultDepreciationMethod,
        scheduleDateBasedOn: formData.calculateDepreciationOn,
        enableDepreciationPosting: formData.autoPostDepreciation,
        depreciationScheduleCreation: formData.assetNumberingType === 'auto' ? 'automatic' : 'manual',
      }

      await updateSettingsMutation.mutateAsync(updateData)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const staff = staffData || []

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('assets.badge', 'إدارة الأصول')}
          title={t('assets.settings', 'إعدادات الأصول')}
          type="assets"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  {t('assets.generalSettings', 'الإعدادات العامة')}
                </CardTitle>
                <CardDescription>
                  {t('assets.generalSettingsDesc', 'إعدادات أساسية لإدارة الأصول')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetNamingSeries">
                      <Hash className="w-4 h-4 inline ml-1" />
                      {t('assets.assetNamingSeries', 'سلسلة ترقيم الأصول')}
                    </Label>
                    <Input
                      id="assetNamingSeries"
                      value={formData.assetNamingSeries}
                      onChange={(e) => handleChange('assetNamingSeries', e.target.value)}
                      placeholder="ASSET-"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.namingSeriesHint', 'مثال: ASSET- سيولد ASSET-0001')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assetNumberingType">
                      {t('assets.numberingType', 'نوع الترقيم')}
                    </Label>
                    <Select
                      value={formData.assetNumberingType}
                      onValueChange={(v) => handleChange('assetNumberingType', v as 'auto' | 'manual')}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          {t('assets.autoNumbering', 'تلقائي')} (Auto)
                        </SelectItem>
                        <SelectItem value="manual">
                          {t('assets.manualNumbering', 'يدوي')} (Manual)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultAssetCategory">
                    {t('assets.defaultCategory', 'الفئة الافتراضية')}
                  </Label>
                  <Select
                    value={formData.defaultAssetCategory}
                    onValueChange={(v) => handleChange('defaultAssetCategory', v)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={t('assets.selectDefaultCategory', 'اختر الفئة الافتراضية')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t('assets.noDefault', 'بدون افتراضي')}
                      </SelectItem>
                      {assetCategories?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.nameAr || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Depreciation Settings */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  {t('assets.depreciationSettings', 'إعدادات الإهلاك')}
                </CardTitle>
                <CardDescription>
                  {t('assets.depreciationSettingsDesc', 'تكوين إعدادات الإهلاك الافتراضية')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDepreciationMethod">
                      {t('assets.defaultMethod', 'الطريقة الافتراضية')}
                    </Label>
                    <Select
                      value={formData.defaultDepreciationMethod}
                      onValueChange={(v) => handleChange('defaultDepreciationMethod', v as DepreciationMethod)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPRECIATION_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label} ({method.labelEn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultUsefulLife">
                      {t('assets.defaultUsefulLife', 'العمر الإنتاجي الافتراضي (سنوات)')}
                    </Label>
                    <Input
                      id="defaultUsefulLife"
                      type="number"
                      min="1"
                      value={formData.defaultUsefulLife}
                      onChange={(e) => handleChange('defaultUsefulLife', parseInt(e.target.value) || 5)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFrequency">
                      {t('assets.defaultFrequency', 'تكرار الإهلاك الافتراضي')}
                    </Label>
                    <Select
                      value={formData.defaultFrequency?.toString()}
                      onValueChange={(v) => handleChange('defaultFrequency', parseInt(v))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPRECIATION_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value.toString()}>
                            {freq.label} ({freq.labelEn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calculateDepreciationOn">
                      <Calendar className="w-4 h-4 inline ml-1" />
                      {t('assets.calculateOn', 'احتساب الإهلاك بناءً على')}
                    </Label>
                    <Select
                      value={formData.calculateDepreciationOn}
                      onValueChange={(v) => handleChange('calculateDepreciationOn', v as 'purchase_date' | 'start_date')}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase_date">
                          {t('assets.purchaseDate', 'تاريخ الشراء')}
                        </SelectItem>
                        <SelectItem value="start_date">
                          {t('assets.startDate', 'تاريخ البدء')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoPostDepreciation" className="text-base font-medium">
                      {t('assets.autoPostDepreciation', 'ترحيل الإهلاك تلقائياً')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('assets.autoPostDesc', 'إنشاء قيود اليومية تلقائياً للإهلاك')}
                    </p>
                  </div>
                  <Switch
                    id="autoPostDepreciation"
                    checked={formData.autoPostDepreciation}
                    onCheckedChange={(checked) => handleChange('autoPostDepreciation', checked)}
                  />
                </div>

                <Alert className="rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {t('assets.depreciationAlert', 'ستطبق هذه الإعدادات على جميع الأصول الجديدة بشكل افتراضي')}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Maintenance Settings */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  {t('assets.maintenanceSettings', 'إعدادات الصيانة')}
                </CardTitle>
                <CardDescription>
                  {t('assets.maintenanceSettingsDesc', 'تكوين تذكيرات وجداول الصيانة')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableMaintenanceReminders" className="text-base font-medium">
                      {t('assets.enableReminders', 'تفعيل تذكيرات الصيانة')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('assets.enableRemindersDesc', 'إرسال تذكيرات للصيانة المقررة')}
                    </p>
                  </div>
                  <Switch
                    id="enableMaintenanceReminders"
                    checked={formData.enableMaintenanceReminders}
                    onCheckedChange={(checked) => handleChange('enableMaintenanceReminders', checked)}
                  />
                </div>

                {formData.enableMaintenanceReminders && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceReminderDays">
                          {t('assets.reminderDays', 'أيام التذكير قبل الاستحقاق')}
                        </Label>
                        <Input
                          id="maintenanceReminderDays"
                          type="number"
                          min="1"
                          value={formData.maintenanceReminderDays}
                          onChange={(e) => handleChange('maintenanceReminderDays', parseInt(e.target.value) || 7)}
                          className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('assets.reminderDaysHint', 'سيتم إرسال التذكير قبل X يوم من موعد الصيانة')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultMaintenanceFrequency">
                          {t('assets.defaultMaintenanceFrequency', 'تكرار الصيانة الافتراضي')}
                        </Label>
                        <Select
                          value={formData.defaultMaintenanceFrequency}
                          onValueChange={(v) => handleChange('defaultMaintenanceFrequency', v)}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAINTENANCE_FREQUENCIES.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label} ({freq.labelEn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maintenanceAssignee">
                        <Users className="w-4 h-4 inline ml-1" />
                        {t('assets.maintenanceAssignee', 'المسؤول عن الصيانة')}
                      </Label>
                      <Select
                        value={formData.maintenanceAssignee}
                        onValueChange={(v) => handleChange('maintenanceAssignee', v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder={t('assets.selectAssignee', 'اختر المسؤول')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t('assets.noAssignee', 'بدون مسؤول افتراضي')}
                          </SelectItem>
                          {staff.map((member: any) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Asset Categories */}
            <Card className="rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-emerald-600" />
                      {t('assets.assetCategories', 'فئات الأصول')}
                    </CardTitle>
                    <CardDescription>
                      {t('assets.categoriesDesc', 'إدارة فئات الأصول وإعدادات الإهلاك الخاصة بها')}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingCategory(null)
                      setShowCategoryDialog(true)
                    }}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    {t('assets.addCategory', 'إضافة فئة')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingCategories ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !assetCategories || assetCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('assets.noCategories', 'لا توجد فئات. قم بإضافة فئة جديدة')}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('assets.categoryName', 'اسم الفئة')}</TableHead>
                        <TableHead>{t('assets.depreciationMethod', 'طريقة الإهلاك')}</TableHead>
                        <TableHead>{t('assets.usefulLife', 'العمر الإنتاجي')}</TableHead>
                        <TableHead className="text-left">{t('common.actions', 'إجراءات')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assetCategories.map((category) => (
                        <TableRow key={category._id}>
                          <TableCell className="font-medium">
                            {category.nameAr || category.name}
                            {category.parentCategory && (
                              <Badge variant="outline" className="mr-2">
                                {t('assets.subcategory', 'فئة فرعية')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {DEPRECIATION_METHODS.find((m) => m.value === category.depreciationMethod)?.label}
                          </TableCell>
                          <TableCell>
                            {category.totalNumberOfDepreciations} {t('assets.years', 'سنوات')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category)
                                  setShowCategoryDialog(true)
                                }}
                                className="rounded-lg"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Insurance Settings */}
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  {t('assets.insuranceSettings', 'إعدادات التأمين')}
                </CardTitle>
                <CardDescription>
                  {t('assets.insuranceSettingsDesc', 'تكوين إعدادات تتبع وتذكيرات التأمين')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <Label htmlFor="trackInsurance" className="text-base font-medium">
                      {t('assets.trackInsurance', 'تتبع التأمين')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('assets.trackInsuranceDesc', 'تفعيل تتبع وثائق التأمين للأصول')}
                    </p>
                  </div>
                  <Switch
                    id="trackInsurance"
                    checked={formData.trackInsurance}
                    onCheckedChange={(checked) => handleChange('trackInsurance', checked)}
                  />
                </div>

                {formData.trackInsurance && (
                  <div className="space-y-2">
                    <Label htmlFor="insuranceRenewalReminderDays">
                      {t('assets.renewalReminderDays', 'أيام التذكير قبل التجديد')}
                    </Label>
                    <Input
                      id="insuranceRenewalReminderDays"
                      type="number"
                      min="1"
                      value={formData.insuranceRenewalReminderDays}
                      onChange={(e) => handleChange('insuranceRenewalReminderDays', parseInt(e.target.value) || 30)}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('assets.renewalReminderHint', 'سيتم إرسال تذكير قبل X يوم من انتهاء التأمين')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 ml-2" />
                {updateSettingsMutation.isPending
                  ? t('common.saving', 'جاري الحفظ...')
                  : t('common.save', 'حفظ الإعدادات')}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <AssetsSidebar />
        </div>

        {/* Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? t('assets.editCategory', 'تعديل الفئة')
                  : t('assets.addCategory', 'إضافة فئة جديدة')}
              </DialogTitle>
              <DialogDescription>
                {t('assets.categoryDialogDesc', 'أدخل تفاصيل الفئة وإعدادات الإهلاك الافتراضية')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('assets.categoryNameEn', 'اسم الفئة (إنجليزي)')}</Label>
                <Input placeholder="Category Name" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.categoryNameAr', 'اسم الفئة (عربي)')}</Label>
                <Input placeholder="اسم الفئة" className="rounded-xl" dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.depreciationMethod', 'طريقة الإهلاك')}</Label>
                <Select defaultValue="straight_line">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPRECIATION_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label} ({method.labelEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.usefulLife', 'العمر الإنتاجي (سنوات)')}</Label>
                <Input type="number" min="1" defaultValue="5" className="rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-xl"
              >
                {t('common.cancel', 'إلغاء')}
              </Button>
              <Button
                onClick={() => {
                  // Handle save category
                  setShowCategoryDialog(false)
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 ml-2" />
                {t('common.save', 'حفظ')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
