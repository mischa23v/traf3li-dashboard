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
  const { i18n, t } = useTranslation()
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
            {t('companies.management.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('companies.management.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CompanySwitcher />
          <Button onClick={handleAddCompany}>
            <Plus className={cn('h-4 w-4', isArabic ? 'ml-2' : 'mr-2')} />
            {t('companies.management.addCompany')}
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
                {t('companies.management.addNewCompany')}
              </DialogTitle>
              <DialogDescription>
                {t('companies.management.enterDetails')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t('companies.management.nameEnglish')}
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
                  {t('companies.management.nameArabic')}
                </Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">{t('companies.management.code')}</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">{t('companies.management.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('companies.management.active')}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t('companies.management.inactive')}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {t('companies.management.suspended')}
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
                {t('companies.management.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? t('companies.management.adding')
                  : t('companies.management.add')}
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
              <DialogTitle>{t('companies.management.editCompany')}</DialogTitle>
              <DialogDescription>
                {t('companies.management.updateDetails')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  {t('companies.management.nameEnglish')}
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
                  {t('companies.management.nameArabic')}
                </Label>
                <Input
                  id="edit-nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-code">{t('companies.management.code')}</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">{t('companies.management.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t('companies.management.active')}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t('companies.management.inactive')}
                    </SelectItem>
                    <SelectItem value="suspended">
                      {t('companies.management.suspended')}
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
                {t('companies.management.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending
                  ? t('companies.management.updating')
                  : t('companies.management.update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dir={isArabic ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('companies.management.deleteCompany')}</DialogTitle>
            <DialogDescription>
              {t('companies.management.deleteConfirmation')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('companies.management.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t('companies.management.deleting')
                : t('companies.management.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
