/**
 * Variant Generator Dialog
 * Auto-generate all variant combinations from attributes
 * Supports Arabic and English with RTL layout
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGenerateVariants } from '@/hooks/useProductEnhanced'
import type { VariantAttribute, VariantAttributeValue, VariantDisplayType } from '@/types/product-enhanced'

interface VariantGeneratorDialogProps {
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VariantGeneratorDialog({
  productId,
  open,
  onOpenChange,
}: VariantGeneratorDialogProps) {
  const { t } = useTranslation()
  const generateMutation = useGenerateVariants()

  // Attributes state
  const [attributes, setAttributes] = useState<VariantAttribute[]>([])
  const [currentAttribute, setCurrentAttribute] = useState({
    name: '',
    nameAr: '',
    displayType: 'dropdown' as VariantDisplayType,
    values: [] as Omit<VariantAttributeValue, '_id'>[],
  })
  const [currentValue, setCurrentValue] = useState('')
  const [currentValueAr, setCurrentValueAr] = useState('')

  // Calculate total combinations
  const totalCombinations = attributes.reduce(
    (acc, attr) => acc * (attr.values.length || 1),
    1
  )

  const handleAddValue = () => {
    if (!currentValue.trim()) return

    const newValue: Omit<VariantAttributeValue, '_id'> = {
      value: currentValue,
      valueAr: currentValueAr || undefined,
    }

    setCurrentAttribute({
      ...currentAttribute,
      values: [...currentAttribute.values, newValue],
    })
    setCurrentValue('')
    setCurrentValueAr('')
  }

  const handleRemoveValue = (index: number) => {
    setCurrentAttribute({
      ...currentAttribute,
      values: currentAttribute.values.filter((_, i) => i !== index),
    })
  }

  const handleAddAttribute = () => {
    if (!currentAttribute.name.trim() || currentAttribute.values.length === 0) return

    const newAttribute: VariantAttribute = {
      _id: `temp-${Date.now()}`,
      name: currentAttribute.name,
      nameAr: currentAttribute.nameAr,
      displayType: currentAttribute.displayType,
      values: currentAttribute.values.map((v, i) => ({
        _id: `value-${i}`,
        ...v,
      })),
    }

    setAttributes([...attributes, newAttribute])
    setCurrentAttribute({
      name: '',
      nameAr: '',
      displayType: 'dropdown',
      values: [],
    })
  }

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleGenerate = () => {
    if (attributes.length === 0) return

    generateMutation.mutate(
      { productId, attributes },
      {
        onSuccess: () => {
          onOpenChange(false)
          setAttributes([])
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            توليد المتغيرات تلقائياً
          </DialogTitle>
          <DialogDescription>
            حدد الصفات (مثل: اللون، المقاس) وقيمها لتوليد جميع المتغيرات تلقائياً
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Attributes */}
          {attributes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">الصفات المضافة:</h4>
              {attributes.map((attr, index) => (
                <div
                  key={attr._id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-navy">{attr.nameAr || attr.name}</p>
                      {attr.nameAr && attr.name !== attr.nameAr && (
                        <p className="text-sm text-slate-500" dir="ltr">
                          {attr.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttribute(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {attr.values.map((value, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {value.valueAr || value.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Attribute */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900">إضافة صفة جديدة:</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attrName">اسم الصفة (إنجليزي) *</Label>
                <Input
                  id="attrName"
                  value={currentAttribute.name}
                  onChange={(e) =>
                    setCurrentAttribute({ ...currentAttribute, name: e.target.value })
                  }
                  placeholder="Size"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attrNameAr">اسم الصفة (عربي)</Label>
                <Input
                  id="attrNameAr"
                  value={currentAttribute.nameAr}
                  onChange={(e) =>
                    setCurrentAttribute({ ...currentAttribute, nameAr: e.target.value })
                  }
                  placeholder="المقاس"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayType">نوع العرض</Label>
              <Select
                value={currentAttribute.displayType}
                onValueChange={(value) =>
                  setCurrentAttribute({
                    ...currentAttribute,
                    displayType: value as VariantDisplayType,
                  })
                }
              >
                <SelectTrigger id="displayType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropdown">قائمة منسدلة</SelectItem>
                  <SelectItem value="buttons">أزرار</SelectItem>
                  <SelectItem value="color">ألوان</SelectItem>
                  <SelectItem value="images">صور</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Values */}
            <div className="space-y-2">
              <Label>القيم *</Label>
              {currentAttribute.values.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentAttribute.values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {value.valueAr || value.value}
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(index)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Value (EN)"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddValue()
                    }
                  }}
                />
                <Input
                  placeholder="القيمة (AR)"
                  value={currentValueAr}
                  onChange={(e) => setCurrentValueAr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddValue()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddValue}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddAttribute}
              disabled={!currentAttribute.name || currentAttribute.values.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 ms-2" />
              إضافة الصفة
            </Button>
          </div>

          {/* Preview */}
          {totalCombinations > 1 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">معاينة</h4>
              </div>
              <p className="text-sm text-purple-700">
                سيتم توليد <strong>{totalCombinations}</strong> متغير بناءً على الصفات المحددة
              </p>
              {totalCombinations > 100 && (
                <div className="flex items-center gap-2 mt-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-xs">تحذير: عدد كبير من المتغيرات. قد يستغرق وقتاً أطول.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={attributes.length === 0 || generateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ms-2" />
                توليد {totalCombinations} متغير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default VariantGeneratorDialog
