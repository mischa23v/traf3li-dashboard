/**
 * Units of Measure List View
 * Manage units of measure for products
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Edit3,
  Trash2,
  Ruler,
  Loader2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { ROUTES } from '@/constants/routes'
import {
  useUnitsOfMeasure,
  useCreateUom,
  useUpdateUom,
  useDeleteUom,
} from '@/hooks/useProductEnhanced'
import type { UnitOfMeasure, UomCategory, CreateUomData, UpdateUomData } from '@/types/product-enhanced'

const UOM_CATEGORIES: { value: UomCategory; label: string }[] = [
  { value: 'quantity', label: 'كمية' },
  { value: 'weight', label: 'وزن' },
  { value: 'volume', label: 'حجم' },
  { value: 'length', label: 'طول' },
  { value: 'time', label: 'وقت' },
  { value: 'area', label: 'مساحة' },
]

export function UnitsOfMeasureList() {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<UomCategory | 'all'>('all')

  // Fetch UOMs
  const { data: uomsData, isLoading } = useUnitsOfMeasure({
    category: filterCategory !== 'all' ? filterCategory : undefined,
    search: searchTerm,
  })
  const uoms = uomsData?.data || []

  // Mutations
  const createMutation = useCreateUom()
  const updateMutation = useUpdateUom()
  const deleteMutation = useDeleteUom()

  // Form state
  const [formData, setFormData] = useState<CreateUomData>({
    code: '',
    name: '',
    nameAr: '',
    symbol: '',
    symbolAr: '',
    category: 'quantity',
    baseUnit: '',
    conversionToBase: undefined,
    isActive: true,
  })

  const handleOpenForm = (uom?: UnitOfMeasure) => {
    if (uom) {
      setEditingUom(uom)
      setFormData({
        code: uom.code,
        name: uom.name,
        nameAr: uom.nameAr,
        symbol: uom.symbol,
        symbolAr: uom.symbolAr || '',
        category: uom.category,
        baseUnit: uom.baseUnit || '',
        conversionToBase: uom.conversionToBase,
        isActive: uom.isActive,
      })
    } else {
      setEditingUom(null)
      setFormData({
        code: '',
        name: '',
        nameAr: '',
        symbol: '',
        symbolAr: '',
        category: 'quantity',
        baseUnit: '',
        conversionToBase: undefined,
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editingUom) {
      updateMutation.mutate(
        { uomId: editingUom._id, data: formData as UpdateUomData },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingUom(null)
          },
        }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleDelete = (uomId: string) => {
    deleteMutation.mutate(uomId, {
      onSuccess: () => {
        setDeleteConfirmId(null)
      },
    })
  }

  const topNav = [
    { title: 'نظرة عامة', href: ROUTES.dashboard.home, isActive: false },
    { title: 'إدارة علاقات العملاء', href: ROUTES.dashboard.crm.products.list, isActive: true },
  ]

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
          badge="إدارة المنتجات"
          title="وحدات القياس"
          type="crm"
          listMode={true}
        />

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                <Ruler className="h-5 w-5 text-emerald-500" />
                وحدات القياس
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 w-full sm:w-64"
                  />
                </div>
                <Select
                  value={filterCategory}
                  onValueChange={(value) => setFilterCategory(value as UomCategory | 'all')}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="h-4 w-4 me-2" />
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الفئات</SelectItem>
                    {UOM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto">
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة وحدة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : uoms.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <Ruler className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد وحدات قياس</h3>
                <p className="text-slate-500 mb-4">ابدأ بإضافة وحدات القياس للمنتجات</p>
                <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة أول وحدة
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الكود</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الرمز</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>الوحدة الأساسية</TableHead>
                      <TableHead>معامل التحويل</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uoms.map((uom) => (
                      <TableRow key={uom._id}>
                        <TableCell className="font-mono text-sm">{uom.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-navy">{uom.nameAr}</p>
                            <p className="text-sm text-slate-500" dir="ltr">
                              {uom.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{uom.symbolAr || uom.symbol}</p>
                            {uom.symbolAr && uom.symbol !== uom.symbolAr && (
                              <p className="text-sm text-slate-500" dir="ltr">
                                {uom.symbol}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {UOM_CATEGORIES.find((c) => c.value === uom.category)?.label ||
                              uom.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{uom.baseUnit || '-'}</TableCell>
                        <TableCell>{uom.conversionToBase || '-'}</TableCell>
                        <TableCell>
                          {uom.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700">نشط</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">غير نشط</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenForm(uom)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(uom._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </Main>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingUom ? 'تعديل وحدة القياس' : 'إضافة وحدة قياس جديدة'}
            </DialogTitle>
            <DialogDescription>
              {editingUom
                ? 'قم بتحديث معلومات وحدة القياس'
                : 'أضف وحدة قياس جديدة للمنتجات'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="KG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as UomCategory })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UOM_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم (إنجليزي) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kilogram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم (عربي) *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="كيلوجرام"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">الرمز (إنجليزي) *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbolAr">الرمز (عربي)</Label>
                <Input
                  id="symbolAr"
                  value={formData.symbolAr}
                  onChange={(e) => setFormData({ ...formData, symbolAr: e.target.value })}
                  placeholder="كجم"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUnit">الوحدة الأساسية</Label>
                <Input
                  id="baseUnit"
                  value={formData.baseUnit}
                  onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                  placeholder="g"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionToBase">معامل التحويل</Label>
                <Input
                  id="conversionToBase"
                  type="number"
                  step="0.001"
                  value={formData.conversionToBase || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conversionToBase: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                الوحدة نشطة
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.code ||
                !formData.name ||
                !formData.nameAr ||
                !formData.symbol ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>{editingUom ? 'حفظ التعديلات' : 'إضافة الوحدة'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه الوحدة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ms-2" />
                  حذف الوحدة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UnitsOfMeasureList
