/**
 * Company Management Page
 * Example page showing how to use the multi-company system
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CompanyTreeView } from './company-tree-view'
import { CompanySwitcher } from './company-switcher'
import {
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/hooks/useCompanies'
import { useCompanyContext } from '@/contexts/CompanyContext'
import type { CreateCompanyData, UpdateCompanyData } from '@/services/companyService'

export function CompanyManagementPage() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { accessibleCompanies, canManageCompany } = useCompanyContext()

  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()

  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedFirmId, setSelectedFirmId] = React.useState<string | null>(null)
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState<CreateCompanyData>({
    name: '',
    nameAr: '',
    code: '',
    status: 'active',
    parentFirmId: null,
  })

  // Handle add company
  const handleAddCompany = () => {
    setFormData({
      name: '',
      nameAr: '',
      code: '',
      status: 'active',
      parentFirmId: selectedParentId,
    })
    setShowAddDialog(true)
  }

  const handleAddChildCompany = (parentId: string) => {
    setSelectedParentId(parentId)
    setFormData({
      name: '',
      nameAr: '',
      code: '',
      status: 'active',
      parentFirmId: parentId,
    })
    setShowAddDialog(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      setShowAddDialog(false)
      setSelectedParentId(null)
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  // Handle edit company
  const handleEditCompany = (firmId: string) => {
    const company = accessibleCompanies.find((c) => c._id === firmId)
    if (company) {
      setSelectedFirmId(firmId)
      setFormData({
        name: company.name,
        nameAr: company.nameAr,
        code: company.code,
        status: company.status,
        parentFirmId: company.parentFirmId,
      })
      setShowEditDialog(true)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFirmId) return

    try {
      await updateMutation.mutateAsync({
        id: selectedFirmId,
        data: formData,
      })
      setShowEditDialog(false)
      setSelectedFirmId(null)
    } catch (error) {
      console.error('Failed to update company:', error)
    }
  }

  // Handle delete company
  const handleDeleteCompany = (firmId: string) => {
    setSelectedFirmId(firmId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedFirmId) return

    try {
      await deleteMutation.mutateAsync(selectedFirmId)
      setShowDeleteDialog(false)
      setSelectedFirmId(null)
    } catch (error) {
      console.error('Failed to delete company:', error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'إدارة الشركات' : 'Company Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? 'إدارة الهيكل التنظيمي للشركات والصلاحيات'
              : 'Manage company structure and permissions'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CompanySwitcher />
          <Button onClick={handleAddCompany}>
            <Plus className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
            {isArabic ? 'إضافة شركة' : 'Add Company'}
          </Button>
        </div>
      </div>

      {/* Company Tree */}
      <CompanyTreeView
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
        onAddChild={handleAddChildCompany}
        canEdit={true}
        canDelete={true}
        canAddChild={true}
      />

      {/* Add Company Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir={isArabic ? 'rtl' : 'ltr'}>
          <form onSubmit={handleSubmitAdd}>
            <DialogHeader>
              <DialogTitle>
                {isArabic ? 'إضافة شركة جديدة' : 'Add New Company'}
              </DialogTitle>
              <DialogDescription>
                {isArabic
                  ? 'أدخل بيانات الشركة الجديدة'
                  : 'Enter the details of the new company'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nameAr">
                  {isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">{isArabic ? 'الرمز' : 'Code'}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">{isArabic ? 'الحالة' : 'Status'}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {isArabic ? 'نشط' : 'Active'}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {isArabic ? 'غير نشط' : 'Inactive'}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {isArabic ? 'معلق' : 'Suspended'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? isArabic
                    ? 'جاري الإضافة...'
                    : 'Adding...'
                  : isArabic
                  ? 'إضافة'
                  : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent dir={isArabic ? 'rtl' : 'ltr'}>
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>{isArabic ? 'تعديل الشركة' : 'Edit Company'}</DialogTitle>
              <DialogDescription>
                {isArabic ? 'تعديل بيانات الشركة' : 'Update company details'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  {isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-nameAr">
                  {isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </Label>
                <Input
                  id="edit-nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-code">{isArabic ? 'الرمز' : 'Code'}</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">{isArabic ? 'الحالة' : 'Status'}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {isArabic ? 'نشط' : 'Active'}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {isArabic ? 'غير نشط' : 'Inactive'}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {isArabic ? 'معلق' : 'Suspended'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? isArabic
                    ? 'جاري التحديث...'
                    : 'Updating...'
                  : isArabic
                  ? 'تحديث'
                  : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isArabic ? 'حذف الشركة' : 'Delete Company'}</DialogTitle>
            <DialogDescription>
              {isArabic
                ? 'هل أنت متأكد من حذف هذه الشركة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this company? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? isArabic
                  ? 'جاري الحذف...'
                  : 'Deleting...'
                : isArabic
                ? 'حذف'
                : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
