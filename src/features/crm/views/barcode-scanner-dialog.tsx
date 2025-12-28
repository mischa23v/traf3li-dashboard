/**
 * Barcode Scanner Dialog
 * Scan barcode to lookup products
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Scan,
  Search,
  Loader2,
  Package,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useLookupByBarcode } from '@/hooks/useProductEnhanced'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/constants/routes'

interface BarcodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductSelect?: (productId: string, variantId?: string) => void
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onProductSelect,
}: BarcodeScannerDialogProps) {
  const { t } = useTranslation()
  const [barcode, setBarcode] = useState('')
  const [searchBarcode, setSearchBarcode] = useState('')

  // Lookup query
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useLookupByBarcode(searchBarcode, searchBarcode.length > 0)

  const handleSearch = () => {
    setSearchBarcode(barcode)
  }

  const handleSelect = () => {
    if (result && onProductSelect) {
      onProductSelect(result.productId, result.variantId)
      onOpenChange(false)
    }
  }

  const handleReset = () => {
    setBarcode('')
    setSearchBarcode('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) {
          handleReset()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-blue-500" />
            مسح الباركود
          </DialogTitle>
          <DialogDescription>
            امسح أو أدخل الباركود للبحث عن المنتج
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scanner Input */}
          <div className="space-y-2">
            <Label htmlFor="barcode">الباركود</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                placeholder="امسح أو أدخل الباركود..."
                className="font-mono flex-1"
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={!barcode || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          {searchBarcode && (
            <div className="min-h-[200px]">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )}

              {isError && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    لم يتم العثور على المنتج
                  </h3>
                  <p className="text-slate-500 mb-4">
                    لا يوجد منتج مرتبط بالباركود: <code className="font-mono">{searchBarcode}</code>
                  </p>
                  <Button variant="outline" onClick={handleReset}>
                    بحث جديد
                  </Button>
                </div>
              )}

              {!isLoading && !isError && result && (
                <div className="space-y-4">
                  {/* Success Message */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">
                      تم العثور على المنتج بنجاح!
                    </span>
                  </div>

                  {/* Product Card */}
                  <div className="p-4 border border-slate-200 rounded-lg bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Package className="h-8 w-8 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-navy mb-1">
                          {result.product.nameAr || result.product.name}
                        </h3>
                        {result.product.name && result.product.name !== result.product.nameAr && (
                          <p className="text-sm text-slate-500 mb-2" dir="ltr">
                            {result.product.name}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            <span className="text-slate-500">الكود:</span> {result.product.code}
                          </Badge>
                          {result.product.pricing && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                              {result.product.pricing.basePrice.toLocaleString('ar-SA')}{' '}
                              {result.product.pricing.currency}
                            </Badge>
                          )}
                        </div>

                        {/* Variant Info */}
                        {result.variant && (
                          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-medium text-blue-900 mb-1">المتغير:</p>
                            <p className="text-sm text-blue-700">
                              {result.variant.nameAr || result.variant.name}
                            </p>
                            {result.variant.attributes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.variant.attributes.map((attr, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {attr.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Link
                            to={`/dashboard/crm/products/${result.productId}`}
                            target="_blank"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 ms-1" />
                              فتح المنتج
                            </Button>
                          </Link>
                          {onProductSelect && (
                            <Button
                              size="sm"
                              onClick={handleSelect}
                              className="bg-emerald-500 hover:bg-emerald-600"
                            >
                              اختيار المنتج
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={handleReset} className="w-full">
                    بحث عن باركود آخر
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BarcodeScannerDialog
