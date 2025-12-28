/**
 * Product Barcodes Tab
 * Manage product barcodes with support for multiple barcode types
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Trash2,
  Barcode,
  Loader2,
  AlertCircle,
  Star,
  Scan,
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
import {
  useProductBarcodes,
  useAddBarcode,
  useRemoveBarcode,
} from '@/hooks/useProductEnhanced'
import type { BarcodeType, CreateBarcodeData } from '@/types/product-enhanced'

interface ProductBarcodesTabProps {
  productId: string
  onScanClick?: () => void
}

const BARCODE_TYPES: { value: BarcodeType; label: string; labelAr: string }[] = [
  { value: 'EAN13', label: 'EAN-13', labelAr: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8', labelAr: 'EAN-8' },
  { value: 'UPC', label: 'UPC', labelAr: 'UPC' },
  { value: 'CODE128', label: 'Code 128', labelAr: 'Code 128' },
  { value: 'CODE39', label: 'Code 39', labelAr: 'Code 39' },
  { value: 'QR', label: 'QR Code', labelAr: 'رمز QR' },
]

export function ProductBarcodesTab({ productId, onScanClick }: ProductBarcodesTabProps) {
  const { t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Fetch barcodes
  const { data: barcodes = [], isLoading } = useProductBarcodes(productId)

  // Mutations
  const addMutation = useAddBarcode()
  const removeMutation = useRemoveBarcode()

  // Form state
  const [formData, setFormData] = useState({
    barcode: '',
    type: 'EAN13' as BarcodeType,
    isPrimary: false,
  })

  const handleOpenForm = () => {
    setFormData({
      barcode: '',
      type: 'EAN13' as BarcodeType,
      isPrimary: barcodes.length === 0, // First barcode is primary by default
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async () => {
    const data: CreateBarcodeData = {
      productId,
      barcode: formData.barcode,
      type: formData.type,
      isPrimary: formData.isPrimary,
    }

    addMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false)
      },
    })
  }

  const handleDelete = (barcodeId: string) => {
    removeMutation.mutate(
      { productId, barcodeId },
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
            <Barcode className="h-5 w-5 text-emerald-500" />
            الباركودات
          </CardTitle>
          <div className="flex gap-2">
            {onScanClick && (
              <Button
                variant="outline"
                onClick={onScanClick}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Scan className="h-4 w-4 ms-2" />
                مسح الباركود
              </Button>
            )}
            <Button onClick={handleOpenForm} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 ms-2" />
              إضافة باركود
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {barcodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Barcode className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد باركودات</h3>
            <p className="text-slate-500 mb-4">
              ابدأ بإضافة باركود للمنتج لتسهيل البحث والمسح
            </p>
            <Button onClick={handleOpenForm} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 ms-2" />
              إضافة أول باركود
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الباركود</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>رئيسي</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barcodes.map((barcode) => (
                  <TableRow key={barcode._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-slate-100 rounded font-mono text-sm">
                          {barcode.barcode}
                        </code>
                        {barcode.isPrimary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {barcode.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {barcode.isPrimary ? (
                        <Badge className="bg-yellow-100 text-yellow-700">نعم</Badge>
                      ) : (
                        <span className="text-slate-400">لا</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(barcode._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={barcode.isPrimary && barcodes.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة باركود جديد</DialogTitle>
            <DialogDescription>أدخل معلومات الباركود للمنتج</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">الباركود *</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="مثال: 1234567890123"
                className="font-mono"
              />
              <p className="text-xs text-slate-500">
                أدخل رقم الباركود أو استخدم الماسح الضوئي
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع الباركود *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as BarcodeType })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {BARCODE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                جعل هذا الباركود رئيسي
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.barcode || addMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 ms-2" />
                  إضافة الباركود
                </>
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
              هل أنت متأكد من حذف هذا الباركود؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ms-2" />
                  حذف الباركود
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ProductBarcodesTab
