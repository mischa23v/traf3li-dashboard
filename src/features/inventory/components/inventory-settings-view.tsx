import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Save,
  Loader2,
  Warehouse,
  BarChart3,
  Barcode,
  Layers,
  Tags,
  Settings2,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { InventorySidebar } from './inventory-sidebar'
import {
  useInventorySettings,
  useUpdateInventorySettings,
  useWarehouses,
  useItemGroups,
  useUnitsOfMeasure,
} from '@/hooks/use-inventory'
import type { ValuationMethod } from '@/types/inventory'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'

interface InventorySettingsFormData {
  // General Settings
  defaultWarehouse?: string
  defaultValuationMethod: ValuationMethod
  autoCreateSerialAndBatch: boolean
  allowNegativeStock: boolean

  // Stock Levels
  defaultReorderLevel: number
  defaultReorderQuantity: number
  lowStockWarningThreshold: number
  enableAutomaticReorder: boolean

  // Barcodes
  enableBarcodeScanning: boolean
  barcodeFormat: string
  printBarcodeLabels: boolean
  showBarcodeField: boolean

  // Naming
  itemNamingSeries?: string
  batchNamingSeries?: string

  // Stock Freeze
  stockFrozenUpTo?: string
}

export function InventorySettingsView() {
  const { t } = useTranslation()
  const { data: settingsData, isLoading } = useInventorySettings()
  const updateSettingsMutation = useUpdateInventorySettings()
  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses()
  const { data: itemGroups, isLoading: loadingItemGroups } = useItemGroups()
  const { data: uoms, isLoading: loadingUoms } = useUnitsOfMeasure()

  const [formData, setFormData] = useState<InventorySettingsFormData>({
    defaultWarehouse: undefined,
    defaultValuationMethod: 'fifo',
    autoCreateSerialAndBatch: false,
    allowNegativeStock: false,
    defaultReorderLevel: 10,
    defaultReorderQuantity: 50,
    lowStockWarningThreshold: 20,
    enableAutomaticReorder: false,
    enableBarcodeScanning: true,
    barcodeFormat: 'EAN13',
    printBarcodeLabels: true,
    showBarcodeField: true,
    itemNamingSeries: 'ITEM-',
    batchNamingSeries: 'BATCH-',
    stockFrozenUpTo: undefined,
  })

  useEffect(() => {
    if (settingsData) {
      setFormData({
        defaultWarehouse: settingsData.defaultWarehouse,
        defaultValuationMethod: settingsData.defaultValuationMethod || 'fifo',
        autoCreateSerialAndBatch: settingsData.autoCreateSerialAndBatch ?? false,
        allowNegativeStock: settingsData.allowNegativeStock ?? false,
        // @ts-ignore - Extended settings
        defaultReorderLevel: settingsData.defaultReorderLevel ?? 10,
        // @ts-ignore - Extended settings
        defaultReorderQuantity: settingsData.defaultReorderQuantity ?? 50,
        // @ts-ignore - Extended settings
        lowStockWarningThreshold: settingsData.lowStockWarningThreshold ?? 20,
        // @ts-ignore - Extended settings
        enableAutomaticReorder: settingsData.enableAutomaticReorder ?? false,
        // @ts-ignore - Extended settings
        enableBarcodeScanning: settingsData.enableBarcodeScanning ?? true,
        // @ts-ignore - Extended settings
        barcodeFormat: settingsData.barcodeFormat ?? 'EAN13',
        // @ts-ignore - Extended settings
        printBarcodeLabels: settingsData.printBarcodeLabels ?? true,
        showBarcodeField: settingsData.showBarcodeField ?? true,
        itemNamingSeries: settingsData.itemNamingSeries || 'ITEM-',
        batchNamingSeries: settingsData.batchNamingSeries || 'BATCH-',
        stockFrozenUpTo: settingsData.stockFrozenUpTo,
      })
    }
  }, [settingsData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync(formData)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 border-e bg-white p-6 overflow-y-auto">
          <InventorySidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside className="hidden lg:block w-80 border-e bg-white p-6 overflow-y-auto">
        <InventorySidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-navy">
                {t('inventory.settings.title', 'إعدادات المخزون')}
              </h1>
              <p className="text-slate-500">
                {t('inventory.settings.description', 'تخصيص المستودعات، التقييم، والمخزون')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.general', 'الإعدادات العامة')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'inventory.settings.generalDescription',
                      'إعدادات المستودع الافتراضي وطريقة التقييم'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultWarehouse">
                        {t('inventory.settings.defaultWarehouse', 'المستودع الافتراضي')}
                      </Label>
                      <Select
                        value={formData.defaultWarehouse || ''}
                        onValueChange={(value) => handleSelectChange('defaultWarehouse', value)}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('inventory.settings.selectWarehouse', 'اختر المستودع')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses?.map((warehouse) => (
                            <SelectItem key={warehouse._id} value={warehouse._id}>
                              {warehouse.nameAr || warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultValuationMethod">
                        {t('inventory.settings.valuationMethod', 'طريقة التقييم الافتراضية')}
                      </Label>
                      <Select
                        value={formData.defaultValuationMethod}
                        onValueChange={(value) =>
                          handleSelectChange('defaultValuationMethod', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fifo">
                            FIFO - {t('inventory.settings.fifo', 'الوارد أولاً صادر أولاً')}
                          </SelectItem>
                          <SelectItem value="moving_average">
                            {t('inventory.settings.movingAverage', 'المتوسط المتحرك')}
                          </SelectItem>
                          <SelectItem value="lifo">
                            LIFO - {t('inventory.settings.lifo', 'الوارد أخيراً صادر أولاً')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.autoCreateSerial', 'إنشاء الأرقام التسلسلية تلقائياً')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.autoCreateSerialDesc',
                          'إنشاء أرقام تسلسلية ودفعات تلقائياً'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoCreateSerialAndBatch}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('autoCreateSerialAndBatch', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.allowNegativeStock', 'السماح بالمخزون السالب')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.allowNegativeStockDesc',
                          'السماح بإصدار أكثر من الكمية المتاحة'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowNegativeStock}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('allowNegativeStock', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Stock Levels Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.stockLevels', 'مستويات المخزون')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'inventory.settings.stockLevelsDescription',
                      'تحديد مستويات إعادة الطلب والتنبيهات'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultReorderLevel">
                        {t('inventory.settings.defaultReorderLevel', 'مستوى إعادة الطلب الافتراضي')}
                      </Label>
                      <Input
                        id="defaultReorderLevel"
                        name="defaultReorderLevel"
                        type="number"
                        value={formData.defaultReorderLevel}
                        onChange={handleChange}
                        min="0"
                      />
                      <p className="text-xs text-slate-500">
                        {t('inventory.settings.reorderLevelHint', 'الكمية التي يتم عندها تنبيه إعادة الطلب')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultReorderQuantity">
                        {t('inventory.settings.defaultReorderQty', 'كمية إعادة الطلب الافتراضية')}
                      </Label>
                      <Input
                        id="defaultReorderQuantity"
                        name="defaultReorderQuantity"
                        type="number"
                        value={formData.defaultReorderQuantity}
                        onChange={handleChange}
                        min="0"
                      />
                      <p className="text-xs text-slate-500">
                        {t('inventory.settings.reorderQtyHint', 'الكمية المقترحة للطلب')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lowStockWarningThreshold">
                        {t('inventory.settings.lowStockThreshold', 'حد التنبيه للمخزون المنخفض')}
                      </Label>
                      <Input
                        id="lowStockWarningThreshold"
                        name="lowStockWarningThreshold"
                        type="number"
                        value={formData.lowStockWarningThreshold}
                        onChange={handleChange}
                        min="0"
                      />
                      <p className="text-xs text-slate-500">
                        {t('inventory.settings.lowStockHint', 'النسبة المئوية لتنبيه المخزون المنخفض')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.enableAutoReorder', 'تفعيل إعادة الطلب التلقائي')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.enableAutoReorderDesc',
                          'إنشاء طلبات شراء تلقائياً عند الوصول لمستوى إعادة الطلب'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableAutomaticReorder}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enableAutomaticReorder', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Barcode Settings */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Barcode className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.barcodes', 'الباركود')}
                  </CardTitle>
                  <CardDescription>
                    {t('inventory.settings.barcodesDescription', 'إعدادات الباركود والمسح الضوئي')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.enableBarcodeScanning', 'تفعيل المسح الضوئي للباركود')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.enableBarcodeScanningDesc',
                          'السماح بمسح الباركود في حركات المخزون'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableBarcodeScanning}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('enableBarcodeScanning', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcodeFormat">
                      {t('inventory.settings.barcodeFormat', 'تنسيق الباركود')}
                    </Label>
                    <Select
                      value={formData.barcodeFormat}
                      onValueChange={(value) => handleSelectChange('barcodeFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EAN13">EAN-13 (13 رقم)</SelectItem>
                        <SelectItem value="EAN8">EAN-8 (8 أرقام)</SelectItem>
                        <SelectItem value="UPC">UPC (12 رقم)</SelectItem>
                        <SelectItem value="CODE128">Code 128</SelectItem>
                        <SelectItem value="CODE39">Code 39</SelectItem>
                        <SelectItem value="QR">QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.printBarcodeLabels', 'طباعة ملصقات الباركود')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.printBarcodeLabelsDesc',
                          'تفعيل خيار طباعة ملصقات الباركود'
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={formData.printBarcodeLabels}
                      onCheckedChange={(checked) =>
                        handleSwitchChange('printBarcodeLabels', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <Label>
                        {t('inventory.settings.showBarcodeField', 'إظهار حقل الباركود')}
                      </Label>
                      <p className="text-sm text-slate-500">
                        {t('inventory.settings.showBarcodeFieldDesc', 'إظهار حقل الباركود في نموذج الصنف')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.showBarcodeField}
                      onCheckedChange={(checked) => handleSwitchChange('showBarcodeField', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Units of Measure */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.unitsOfMeasure', 'وحدات القياس')}
                  </CardTitle>
                  <CardDescription>
                    {t('inventory.settings.uomDescription', 'إدارة وحدات القياس المستخدمة في المخزون')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUoms ? (
                    <Skeleton className="h-32 w-full" />
                  ) : !uoms || uoms.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {t('inventory.settings.noUoms', 'لا توجد وحدات قياس')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-64 overflow-y-auto rounded-xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-end">
                                {t('inventory.settings.uomName', 'الاسم')}
                              </TableHead>
                              <TableHead className="text-end">
                                {t('inventory.settings.uomNameEn', 'الاسم (EN)')}
                              </TableHead>
                              <TableHead className="text-end">
                                {t('inventory.settings.status', 'الحالة')}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uoms.map((uom) => (
                              <TableRow key={uom._id}>
                                <TableCell>{uom.nameAr || uom.name}</TableCell>
                                <TableCell dir="ltr">{uom.name}</TableCell>
                                <TableCell>
                                  {uom.enabled ? (
                                    <Badge className="bg-green-100 text-green-700">
                                      {t('inventory.settings.active', 'نشط')}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      {t('inventory.settings.inactive', 'غير نشط')}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.uomManagementHint',
                          'لإدارة وحدات القياس، انتقل إلى صفحة الإعدادات المتقدمة'
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Item Groups */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.itemGroups', 'مجموعات الأصناف')}
                  </CardTitle>
                  <CardDescription>
                    {t('inventory.settings.itemGroupsDescription', 'تصنيف وتنظيم الأصناف في مجموعات')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingItemGroups ? (
                    <Skeleton className="h-32 w-full" />
                  ) : !itemGroups || itemGroups.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {t('inventory.settings.noItemGroups', 'لا توجد مجموعات أصناف')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-64 overflow-y-auto rounded-xl border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-end">
                                {t('inventory.settings.groupName', 'الاسم')}
                              </TableHead>
                              <TableHead className="text-end">
                                {t('inventory.settings.groupType', 'النوع')}
                              </TableHead>
                              <TableHead className="text-end">
                                {t('inventory.settings.parentGroup', 'المجموعة الأم')}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itemGroups.map((group) => (
                              <TableRow key={group._id}>
                                <TableCell>{group.nameAr || group.name}</TableCell>
                                <TableCell>
                                  {group.isGroup ? (
                                    <Badge variant="outline">
                                      {t('inventory.settings.group', 'مجموعة')}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      {t('inventory.settings.item', 'صنف')}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                  {group.parentGroup || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.itemGroupsHint',
                          'لإدارة مجموعات الأصناف، انتقل إلى صفحة الإعدادات المتقدمة'
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Warehouses Management Link */}
              <Card className="border-0 shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5 text-brand-blue" />
                    {t('inventory.settings.warehousesManagement', 'إدارة المستودعات')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'inventory.settings.warehousesDescription',
                      'عرض وإدارة جميع المستودعات في النظام'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium">
                        {t('inventory.settings.totalWarehouses', 'إجمالي المستودعات')}:{' '}
                        {warehouses?.length || 0}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t(
                          'inventory.settings.warehousesHint',
                          'انقر للانتقال إلى صفحة إدارة المستودعات'
                        )}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to={ROUTES.dashboard.inventory.warehouses.list}>
                        <Warehouse className="h-4 w-4 ml-2" />
                        {t('inventory.settings.manageWarehouses', 'إدارة المستودعات')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-brand-blue hover:bg-brand-blue/90"
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ms-2" aria-hidden="true" />
                  )}
                  {t('inventory.settings.saveChanges', 'حفظ التغييرات')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
