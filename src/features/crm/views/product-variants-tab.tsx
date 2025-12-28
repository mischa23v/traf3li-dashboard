/**
 * Product Variants Tab
 * Manage product variants with attributes, pricing, and stock
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  AlertCircle,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/hooks/useProductEnhanced'
import type { ProductVariant, CreateVariantData, UpdateVariantData } from '@/types/product-enhanced'

interface ProductVariantsTabProps {
  productId: string
  onGenerateClick?: () => void
}

export function ProductVariantsTab({ productId, onGenerateClick }: ProductVariantsTabProps) {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch variants
  const { data: variants = [], isLoading } = useProductVariants(productId)

  // Mutations
  const createMutation = useCreateVariant()
  const updateMutation = useUpdateVariant()
  const deleteMutation = useDeleteVariant()

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    nameAr: '',
    priceAdjustment: 0,
    costPrice: 0,
    barcode: '',
    stockQuantity: 0,
    isActive: true,
  })

  const handleOpenForm = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant)
      setFormData({
        sku: variant.sku,
        name: variant.name,
        nameAr: variant.nameAr || '',
        priceAdjustment: variant.priceAdjustment,
        costPrice: variant.costPrice || 0,
        barcode: variant.barcode || '',
        stockQuantity: variant.stockQuantity || 0,
        isActive: variant.isActive,
      })
    } else {
      setEditingVariant(null)
      setFormData({
        sku: '',
        name: '',
        nameAr: '',
        priceAdjustment: 0,
        costPrice: 0,
        barcode: '',
        stockQuantity: 0,
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editingVariant) {
      // Update existing variant
      const data: UpdateVariantData = {
        sku: formData.sku,
        name: formData.name,
        nameAr: formData.nameAr,
        priceAdjustment: formData.priceAdjustment,
        costPrice: formData.costPrice,
        barcode: formData.barcode,
        stockQuantity: formData.stockQuantity,
        isActive: formData.isActive,
      }
      updateMutation.mutate(
        { productId, variantId: editingVariant._id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setEditingVariant(null)
          },
        }
      )
    } else {
      // Create new variant
      const data: CreateVariantData = {
        productId,
        sku: formData.sku,
        name: formData.name,
        nameAr: formData.nameAr,
        attributes: [], // Would be filled from attribute selector
        priceAdjustment: formData.priceAdjustment,
        costPrice: formData.costPrice,
        barcode: formData.barcode,
        stockQuantity: formData.stockQuantity,
        isActive: formData.isActive,
      }
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleDelete = (variantId: string) => {
    deleteMutation.mutate(
      { productId, variantId },
      {
        onSuccess: () => {
          setDeleteConfirmId(null)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" />
            متغيرات المنتج
          </CardTitle>
          <div className="flex gap-2">
            {onGenerateClick && (
              <Button
                variant="outline"
                onClick={onGenerateClick}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 ms-2" />
                توليد تلقائي
              </Button>
            )}
            <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 ms-2" />
              إضافة متغير
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد متغيرات</h3>
            <p className="text-slate-500 mb-4">
              ابدأ بإضافة متغيرات للمنتج (مثل: المقاسات، الألوان، إلخ)
            </p>
            <Button
              onClick={() => handleOpenForm()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 ms-2" />
              إضافة أول متغير
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الصفات</TableHead>
                  <TableHead>تعديل السعر</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant._id}>
                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-navy">{variant.nameAr || variant.name}</p>
                        {variant.nameAr && variant.name !== variant.nameAr && (
                          <p className="text-sm text-slate-500" dir="ltr">
                            {variant.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {variant.attributes.map((attr, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {attr.value}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          variant.priceAdjustment > 0
                            ? 'text-emerald-600'
                            : variant.priceAdjustment < 0
                              ? 'text-red-600'
                              : 'text-slate-500'
                        }
                      >
                        {variant.priceAdjustment > 0 && '+'}
                        {variant.priceAdjustment}
                      </span>
                    </TableCell>
                    <TableCell>{variant.costPrice || '-'}</TableCell>
                    <TableCell>{variant.stockQuantity || 0}</TableCell>
                    <TableCell>
                      {variant.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700">نشط</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">غير نشط</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(variant)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(variant._id)}
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'تعديل المتغير' : 'إضافة متغير جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingVariant
                ? 'قم بتحديث معلومات المتغير'
                : 'أضف متغير جديد للمنتج مع الصفات والأسعار'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="مثال: PROD-001-BLU-L"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">الباركود</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="اختياري"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم (إنجليزي) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Large Blue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم (عربي)</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="كبير أزرق"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceAdjustment">تعديل السعر</Label>
                <Input
                  id="priceAdjustment"
                  type="number"
                  step="0.01"
                  value={formData.priceAdjustment}
                  onChange={(e) =>
                    setFormData({ ...formData, priceAdjustment: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">التكلفة</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">المخزون</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
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
                المتغير نشط
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>{editingVariant ? 'حفظ التعديلات' : 'إضافة المتغير'}</>
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
              هل أنت متأكد من حذف هذا المتغير؟ لا يمكن التراجع عن هذا الإجراء.
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
                  حذف المتغير
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ProductVariantsTab
