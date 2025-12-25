/**
 * Create RFQ (Request for Quotation) View
 * Form for creating new RFQs in the Buying module
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Plus,
  Trash2,
  FileQuestion,
  Calendar,
  Loader2,
  Building2,
  Package,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Checkbox } from '@/components/ui/checkbox'

import { useCreateRfq, useSuppliers } from '@/hooks/use-buying'
import { useItems } from '@/hooks/use-inventory'
import { BuyingSidebar } from './buying-sidebar'

interface RfqItem {
  tempId: string
  itemId: string
  itemName: string
  quantity: number
  uom: string
  requiredDate: string
}

interface RfqFormData {
  transactionDate: string
  requiredDate: string
  suppliers: string[]
  items: RfqItem[]
  message: string
  terms: string
}

export function CreateRfqView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createRfqMutation = useCreateRfq()

  // Fetch suppliers and items
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers()
  const { data: itemsData, isLoading: isLoadingItems } = useItems()

  const suppliers = suppliersData?.data || []
  const items = itemsData?.data || []

  const [formData, setFormData] = useState<RfqFormData>({
    transactionDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
    suppliers: [],
    items: [],
    message: '',
    terms: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSupplierToggle = (supplierId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      suppliers: checked
        ? [...prev.suppliers, supplierId]
        : prev.suppliers.filter((id) => id !== supplierId),
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          tempId: crypto.randomUUID(),
          itemId: '',
          itemName: '',
          quantity: 1,
          uom: 'Units',
          requiredDate: formData.requiredDate,
        },
      ],
    }))
  }

  const removeItem = (tempId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.tempId !== tempId),
    }))
  }

  const updateItem = (tempId: string, field: keyof RfqItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleItemSelect = (tempId: string, itemId: string) => {
    const selectedItem = items.find((i) => i._id === itemId)
    if (selectedItem) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.tempId === tempId
            ? {
                ...item,
                itemId,
                itemName: selectedItem.name,
                uom: selectedItem.defaultUom || 'Units',
              }
            : item
        ),
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.requiredDate) {
      newErrors.requiredDate = t('buying.rfq.errors.requiredDate', 'Required date is required')
    }
    if (formData.suppliers.length === 0) {
      newErrors.suppliers = t('buying.rfq.errors.suppliers', 'At least one supplier is required')
    }
    if (formData.items.length === 0) {
      newErrors.items = t('buying.rfq.errors.items', 'At least one item is required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      await createRfqMutation.mutateAsync({
        transactionDate: formData.transactionDate,
        requiredDate: formData.requiredDate,
        supplierIds: formData.suppliers,
        items: formData.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          uom: item.uom,
          requiredDate: item.requiredDate,
        })),
        message: formData.message,
        terms: formData.terms,
      })
      navigate({ to: '/dashboard/buying/rfq' })
    } catch (error) {
      console.error('Failed to create RFQ:', error)
    }
  }

  const topNavItems = [
    { title: t('buying.nav.suppliers', 'Suppliers'), href: '/dashboard/buying', isActive: false },
    { title: t('buying.nav.purchaseOrders', 'Purchase Orders'), href: '/dashboard/buying/purchase-orders', isActive: false },
    { title: t('buying.nav.rfq', 'RFQ'), href: '/dashboard/buying/rfq', isActive: true },
  ]

  return (
    <>
      <Header>
        <TopNav links={topNavItems} />
        <DynamicIsland />
      </Header>

      <BuyingSidebar />

      <Main>
        <ProductivityHero
          icon={FileQuestion}
          title={t('buying.rfq.create.title', 'Create RFQ')}
          subtitle={t('buying.rfq.create.subtitle', 'Request for Quotation')}
        />

        <div className="space-y-6 p-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {t('buying.rfq.basicInfo', 'Basic Information')}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionDate">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  {t('buying.rfq.transactionDate', 'Transaction Date')}
                </Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, transactionDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredDate">
                  <Calendar className="mr-2 inline h-4 w-4" />
                  {t('buying.rfq.requiredDate', 'Required By')} *
                </Label>
                <Input
                  id="requiredDate"
                  type="date"
                  value={formData.requiredDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requiredDate: e.target.value }))}
                  className={errors.requiredDate ? 'border-red-500' : ''}
                />
                {errors.requiredDate && (
                  <p className="text-sm text-red-500">{errors.requiredDate}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Select Suppliers */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              <Building2 className="mr-2 inline h-5 w-5" />
              {t('buying.rfq.selectSuppliers', 'Select Suppliers')} *
            </h3>
            {errors.suppliers && (
              <p className="mb-2 text-sm text-red-500">{errors.suppliers}</p>
            )}
            {isLoadingSuppliers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <div key={supplier._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`supplier-${supplier._id}`}
                      checked={formData.suppliers.includes(supplier._id)}
                      onCheckedChange={(checked) =>
                        handleSupplierToggle(supplier._id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`supplier-${supplier._id}`} className="cursor-pointer">
                      {supplier.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Items */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                <Package className="mr-2 inline h-5 w-5" />
                {t('buying.rfq.items', 'Items')} *
              </h3>
              <Button onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t('buying.rfq.addItem', 'Add Item')}
              </Button>
            </div>
            {errors.items && (
              <p className="mb-2 text-sm text-red-500">{errors.items}</p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('buying.rfq.item', 'Item')}</TableHead>
                  <TableHead>{t('buying.rfq.quantity', 'Quantity')}</TableHead>
                  <TableHead>{t('buying.rfq.uom', 'UOM')}</TableHead>
                  <TableHead>{t('buying.rfq.requiredDate', 'Required Date')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {t('buying.rfq.noItems', 'No items added. Click "Add Item" to add items.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell>
                        <select
                          className="w-full rounded border p-2"
                          value={item.itemId}
                          onChange={(e) => handleItemSelect(item.tempId, e.target.value)}
                        >
                          <option value="">{t('buying.rfq.selectItem', 'Select Item')}</option>
                          {items.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.uom}
                          onChange={(e) => updateItem(item.tempId, 'uom', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.requiredDate}
                          onChange={(e) => updateItem(item.tempId, 'requiredDate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.tempId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Message & Terms */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              {t('buying.rfq.messageTerms', 'Message & Terms')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">
                  {t('buying.rfq.message', 'Message for Supplier')}
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder={t('buying.rfq.messagePlaceholder', 'Enter message for suppliers...')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">
                  {t('buying.rfq.terms', 'Terms & Conditions')}
                </Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))}
                  placeholder={t('buying.rfq.termsPlaceholder', 'Enter terms and conditions...')}
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard/buying/rfq' })}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRfqMutation.isPending}
            >
              {createRfqMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('buying.rfq.create.submit', 'Create RFQ')}
            </Button>
          </div>
        </div>
      </Main>
    </>
  )
}
