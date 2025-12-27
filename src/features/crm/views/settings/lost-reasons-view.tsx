/**
 * Lost Reasons Settings View
 *
 * Features:
 * - Grouped by category with drag-and-drop reordering
 * - Inline add/edit functionality
 * - Delete with confirmation
 * - Active/Inactive toggle
 * - Usage count display
 * - RTL and Arabic support
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Loader2,
  FolderPlus,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import {
  lostReasonService,
  type LostReason,
  type CreateLostReasonData,
} from '@/services/crmSettingsService'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.lostReasons', href: '/dashboard/crm/settings/lost-reasons' },
]

// Category labels with colors
const CATEGORY_LABELS: Record<
  'price' | 'competitor' | 'timing' | 'no_response' | 'other',
  { en: string; ar: string; color: string }
> = {
  price: {
    en: 'Price',
    ar: 'السعر',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  competitor: {
    en: 'Competitor',
    ar: 'المنافس',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  timing: {
    en: 'Timing',
    ar: 'التوقيت',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  no_response: {
    en: 'No Response',
    ar: 'عدم الاستجابة',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  other: {
    en: 'Other',
    ar: 'أخرى',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
}

// Sortable Reason Item Component
interface SortableReasonItemProps {
  reason: LostReason
  isEditing: boolean
  editForm: Partial<CreateLostReasonData>
  onEdit: (reason: LostReason) => void
  onSave: (id: string) => void
  onCancel: () => void
  onChange: (field: keyof CreateLostReasonData, value: any) => void
  onDelete: (reason: LostReason) => void
  onToggleActive: (id: string, isActive: boolean) => void
  isRTL: boolean
}

function SortableReasonItem({
  reason,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onToggleActive,
  isRTL,
}: SortableReasonItemProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reason.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 bg-white border rounded-xl hover:shadow-sm transition-all',
        isDragging && 'shadow-lg z-50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editForm.reason || ''}
              onChange={(e) => onChange('reason', e.target.value)}
              placeholder={t('crm.lostReasons.reasonEn', 'Reason (English)')}
              className="rounded-lg"
              dir="ltr"
            />
            <Input
              value={editForm.reasonAr || ''}
              onChange={(e) => onChange('reasonAr', e.target.value)}
              placeholder={t('crm.lostReasons.reasonAr', 'السبب (عربي)')}
              className="rounded-lg"
              dir="rtl"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">
                {isRTL ? reason.reasonAr || reason.reason : reason.reason}
              </p>
              {!reason.isActive && (
                <Badge variant="outline" className="text-xs">
                  {t('common.inactive', 'Inactive')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? reason.reason : reason.reasonAr || reason.reason}
            </p>
          </div>
        )}
      </div>

      {/* Usage Count */}
      {!isEditing && reason.usageCount !== undefined && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" />
          <span>{reason.usageCount}</span>
        </div>
      )}

      {/* Active Toggle */}
      {!isEditing && (
        <Switch
          checked={reason.isActive}
          onCheckedChange={(checked) => onToggleActive(reason.id, checked)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSave(reason.id)}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(reason)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(reason)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// Category Section Component
interface CategorySectionProps {
  category: keyof typeof CATEGORY_LABELS
  reasons: LostReason[]
  editingId: string | null
  editForm: Partial<CreateLostReasonData>
  onEdit: (reason: LostReason) => void
  onSave: (id: string) => void
  onCancel: () => void
  onChange: (field: keyof CreateLostReasonData, value: any) => void
  onDelete: (reason: LostReason) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onAdd: (category: string) => void
  isAdding: boolean
  addForm: Partial<CreateLostReasonData>
  onAddChange: (field: keyof CreateLostReasonData, value: any) => void
  onSaveNew: () => void
  onCancelAdd: () => void
  isRTL: boolean
}

function CategorySection({
  category,
  reasons,
  editingId,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onToggleActive,
  onAdd,
  isAdding,
  addForm,
  onAddChange,
  onSaveNew,
  onCancelAdd,
  isRTL,
}: CategorySectionProps) {
  const { t } = useTranslation()
  const categoryInfo = CATEGORY_LABELS[category]

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={cn('px-3 py-1', categoryInfo.color)} variant="outline">
              {isRTL ? categoryInfo.ar : categoryInfo.en}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {reasons.length} {t('crm.lostReasons.reasons', 'reasons')}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAdd(category)}
            className="rounded-lg"
          >
            <Plus className="w-4 h-4 ml-1" />
            {t('crm.lostReasons.addReason', 'Add Reason')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <SortableContext
          items={reasons.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {reasons.map((reason) => (
            <SortableReasonItem
              key={reason.id}
              reason={reason}
              isEditing={editingId === reason.id}
              editForm={editForm}
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
              onChange={onChange}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              isRTL={isRTL}
            />
          ))}
        </SortableContext>

        {/* Add New Form */}
        {isAdding && (
          <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl space-y-2">
            <Input
              value={addForm.reason || ''}
              onChange={(e) => onAddChange('reason', e.target.value)}
              placeholder={t('crm.lostReasons.reasonEn', 'Reason (English)')}
              className="rounded-lg bg-white"
              dir="ltr"
              autoFocus
            />
            <Input
              value={addForm.reasonAr || ''}
              onChange={(e) => onAddChange('reasonAr', e.target.value)}
              placeholder={t('crm.lostReasons.reasonAr', 'السبب (عربي)')}
              className="rounded-lg bg-white"
              dir="rtl"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelAdd}
                className="rounded-lg"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                size="sm"
                onClick={onSaveNew}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                disabled={!addForm.reason || !addForm.reasonAr}
              >
                <Check className="w-4 h-4 ml-1" />
                {t('common.save', 'Save')}
              </Button>
            </div>
          </div>
        )}

        {reasons.length === 0 && !isAdding && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t('crm.lostReasons.noReasons', 'No reasons in this category')}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Component
export function LostReasonsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const queryClient = useQueryClient()

  // State
  const [reasons, setReasons] = useState<LostReason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<CreateLostReasonData>>({})
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<Partial<CreateLostReasonData>>({})
  const [deleteReason, setDeleteReason] = useState<LostReason | null>(null)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch lost reasons
  useEffect(() => {
    loadReasons()
  }, [])

  const loadReasons = async () => {
    try {
      setIsLoading(true)
      const response = await lostReasonService.getLostReasons()
      setReasons(response.data || [])
    } catch (error) {
      toast.error(t('errors.loadFailed', 'Failed to load lost reasons'))
    } finally {
      setIsLoading(false)
    }
  }

  // Group reasons by category
  const groupedReasons = useMemo(() => {
    const grouped: Record<string, LostReason[]> = {
      price: [],
      competitor: [],
      timing: [],
      no_response: [],
      other: [],
    }

    reasons.forEach((reason) => {
      if (grouped[reason.category]) {
        grouped[reason.category].push(reason)
      }
    })

    // Sort by order within each category
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.order - b.order)
    })

    return grouped
  }, [reasons])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeReason = reasons.find((r) => r.id === active.id)
    const overReason = reasons.find((r) => r.id === over.id)

    if (!activeReason || !overReason) return

    // Update order optimistically
    const updatedReasons = [...reasons]
    const activeIndex = updatedReasons.findIndex((r) => r.id === active.id)
    const overIndex = updatedReasons.findIndex((r) => r.id === over.id)

    // If in different categories, update category
    if (activeReason.category !== overReason.category) {
      updatedReasons[activeIndex] = {
        ...activeReason,
        category: overReason.category,
        order: overIndex,
      }
    } else {
      // Reorder within same category
      const [removed] = updatedReasons.splice(activeIndex, 1)
      updatedReasons.splice(overIndex, 0, removed)
    }

    setReasons(updatedReasons)

    // Send reorder request to backend
    try {
      const reorderData = updatedReasons.map((reason, index) => ({
        lostReasonId: reason.id,
        order: index,
      }))
      await lostReasonService.reorderLostReasons(reorderData)
      toast.success(t('common.reorderSuccess', 'Reordered successfully'))
    } catch (error) {
      toast.error(t('errors.reorderFailed', 'Failed to reorder'))
      loadReasons() // Reload on error
    }
  }

  // Edit handlers
  const handleEdit = (reason: LostReason) => {
    setEditingId(reason.id)
    setEditForm({
      reason: reason.reason,
      reasonAr: reason.reasonAr,
      category: reason.category,
    })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm.reason || !editForm.reasonAr) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      await lostReasonService.updateLostReason(id, editForm)
      toast.success(t('common.updateSuccess', 'Updated successfully'))
      setEditingId(null)
      setEditForm({})
      loadReasons()
    } catch (error) {
      toast.error(t('errors.updateFailed', 'Failed to update'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleEditChange = (field: keyof CreateLostReasonData, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  // Add handlers
  const handleAdd = (category: string) => {
    setAddingToCategory(category)
    setAddForm({ category: category as any })
  }

  const handleSaveNew = async () => {
    if (!addForm.reason || !addForm.reasonAr || !addForm.category) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      await lostReasonService.createLostReason(addForm as CreateLostReasonData)
      toast.success(t('common.createSuccess', 'Created successfully'))
      setAddingToCategory(null)
      setAddForm({})
      loadReasons()
    } catch (error) {
      toast.error(t('errors.createFailed', 'Failed to create'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelAdd = () => {
    setAddingToCategory(null)
    setAddForm({})
  }

  const handleAddChange = (field: keyof CreateLostReasonData, value: any) => {
    setAddForm((prev) => ({ ...prev, [field]: value }))
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deleteReason) return

    try {
      await lostReasonService.deleteLostReason(deleteReason.id)
      toast.success(t('common.deleteSuccess', 'Deleted successfully'))
      setDeleteReason(null)
      loadReasons()
    } catch (error) {
      toast.error(t('errors.deleteFailed', 'Failed to delete'))
    }
  }

  // Toggle active handler
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await lostReasonService.updateLostReason(id, { isActive })
      toast.success(
        t(
          isActive ? 'common.activatedSuccess' : 'common.deactivatedSuccess',
          isActive ? 'Activated successfully' : 'Deactivated successfully'
        )
      )
      loadReasons()
    } catch (error) {
      toast.error(t('errors.updateFailed', 'Failed to update'))
    }
  }

  const activeDragReason = activeId
    ? reasons.find((r) => r.id === activeId)
    : null

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
        >
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <div className="flex items-center justify-between">
          <ProductivityHero
            badge={t('crm.badge', 'إدارة العملاء')}
            title={t('crm.settings.lostReasons', 'أسباب الخسارة')}
            type="crm"
            hideButtons
          />
          <Button
            onClick={() => setShowCategoryDialog(true)}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <FolderPlus className="w-4 h-4 ml-2" />
            {t('crm.lostReasons.createCategory', 'Create Category')}
          </Button>
        </div>

        <div className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {Object.entries(CATEGORY_LABELS).map(([category]) => {
              const categoryKey = category as keyof typeof CATEGORY_LABELS
              const categoryReasons = groupedReasons[categoryKey] || []

              return (
                <CategorySection
                  key={category}
                  category={categoryKey}
                  reasons={categoryReasons}
                  editingId={editingId}
                  editForm={editForm}
                  onEdit={handleEdit}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onChange={handleEditChange}
                  onDelete={(reason) => setDeleteReason(reason)}
                  onToggleActive={handleToggleActive}
                  onAdd={handleAdd}
                  isAdding={addingToCategory === category}
                  addForm={addForm}
                  onAddChange={handleAddChange}
                  onSaveNew={handleSaveNew}
                  onCancelAdd={handleCancelAdd}
                  isRTL={isRTL}
                />
              )
            })}

            <DragOverlay>
              {activeDragReason ? (
                <div className="rotate-2 opacity-80">
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-lg">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {isRTL
                          ? activeDragReason.reasonAr || activeDragReason.reason
                          : activeDragReason.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteReason !== null}
          onOpenChange={(open) => !open && setDeleteReason(null)}
        >
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('common.confirmDelete', 'Confirm Delete')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  'crm.lostReasons.deleteConfirm',
                  'Are you sure you want to delete this lost reason?'
                )}
                {deleteReason && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <p className="font-medium">
                      {isRTL
                        ? deleteReason.reasonAr || deleteReason.reason
                        : deleteReason.reason}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                {t('common.cancel', 'Cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>
                {t('crm.lostReasons.createCategory', 'Create New Category')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  'crm.lostReasons.categoryNote',
                  'Note: Category management will be available in a future update. Current categories: Price, Competitor, Timing, No Response, Other.'
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
                className="rounded-xl"
              >
                {t('common.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
