/**
 * Product Suppliers Tab
 * Manage product suppliers with purchase prices and lead times
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit3, Trash2, Users, Loader2, AlertCircle, Star } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import type { ProductSupplier } from '@/types/product-enhanced'

interface ProductSuppliersTabProps {
  productId: string
  suppliers?: ProductSupplier[]
  onAdd?: (supplier: Omit<ProductSupplier, 'supplierId'>) => void
  onUpdate?: (supplierId: string, supplier: Partial<ProductSupplier>) => void
  onDelete?: (supplierId: string) => void
}

export function ProductSuppliersTab({
  productId,
  suppliers = [],
  onAdd,
  onUpdate,
  onDelete,
}: ProductSuppliersTabProps) {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<ProductSupplier | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierProductCode: '',
    purchasePrice: 0,
    currency: 'SAR',
    leadTimeDays: 0,
    minimumOrderQuantity: 1,
    isPrimary: false,
  })

  const handleOpenForm = (supplier?: ProductSupplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        supplierName: supplier.supplierName,
        supplierProductCode: supplier.supplierProductCode || '',
        purchasePrice: supplier.purchasePrice,
        currency: supplier.currency,
        leadTimeDays: supplier.leadTimeDays || 0,
        minimumOrderQuantity: supplier.minimumOrderQuantity || 1,
        isPrimary: supplier.isPrimary,
      })
    } else {
      setEditingSupplier(null)
      setFormData({
        supplierName: '',
        supplierProductCode: '',
        purchasePrice: 0,
        currency: 'SAR',
        leadTimeDays: 0,
        minimumOrderQuantity: 1,
        isPrimary: suppliers.length === 0, // First supplier is primary
      })
    }
    setIsFormOpen(true)
  }

  const handleSubmit = () => {
    if (editingSupplier && onUpdate) {
      onUpdate(editingSupplier.supplierId, formData)
    } else if (onAdd) {
      onAdd(formData as any)
    }
    setIsFormOpen(false)
  }

  const handleDelete = (supplierId: string) => {
    if (onDelete) {
      onDelete(supplierId)
    }
    setDeleteConfirmId(null)
  }

  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            الموردون
          </CardTitle>
          <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 ms-2" />
            إضافة مورد
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد موردون</h3>
            <p className="text-slate-500 mb-4">ابدأ بإضافة موردين للمنتج</p>
            <Button onClick={() => handleOpenForm()} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 ms-2" />
              إضافة أول مورد
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المورد</TableHead>
                  <TableHead>كود المنتج</TableHead>
                  <TableHead>سعر الشراء</TableHead>
                  <TableHead>وقت التوريد</TableHead>
                  <TableHead>الحد الأدنى للطلب</TableHead>
                  <TableHead>رئيسي</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{supplier.supplierName}</span>
                        {supplier.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.supplierProductCode ? (
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {supplier.supplierProductCode}
                        </code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-emerald-600">
                        {supplier.purchasePrice.toLocaleString('ar-SA')} {supplier.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      {supplier.leadTimeDays ? `${supplier.leadTimeDays} يوم` : '-'}
                    </TableCell>
                    <TableCell>{supplier.minimumOrderQuantity || '-'}</TableCell>
                    <TableCell>
                      {supplier.isPrimary ? (
                        <Badge className="bg-yellow-100 text-yellow-700">نعم</Badge>
                      ) : (
                        <span className="text-slate-400">لا</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(supplier)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(supplier.supplierId)}
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
            <DialogTitle>{editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? 'قم بتحديث معلومات المورد'
                : 'أضف مورد جديد مع أسعار الشراء ووقت التوريد'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">اسم المورد *</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="مثال: شركة التوريد المتحدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierProductCode">كود المنتج عند المورد</Label>
              <Input
                id="supplierProductCode"
                value={formData.supplierProductCode}
                onChange={(e) =>
                  setFormData({ ...formData, supplierProductCode: e.target.value })
                }
                placeholder="اختياري"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">سعر الشراء *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="SAR"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">وقت التوريد (أيام)</Label>
                <Input
                  id="leadTimeDays"
                  type="number"
                  value={formData.leadTimeDays}
                  onChange={(e) =>
                    setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrderQuantity">الحد الأدنى للطلب</Label>
                <Input
                  id="minimumOrderQuantity"
                  type="number"
                  value={formData.minimumOrderQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumOrderQuantity: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrimary: checked === true })
                }
              />
              <Label htmlFor="isPrimary" className="font-normal cursor-pointer">
                جعل هذا المورد رئيسي
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.supplierName || !formData.purchasePrice}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {editingSupplier ? 'حفظ التعديلات' : 'إضافة المورد'}
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
              هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              <Trash2 className="h-4 w-4 ms-2" />
              حذف المورد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ProductSuppliersTab
