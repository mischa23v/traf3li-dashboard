/**
 * Tags Settings View
 *
 * Features:
 * - Grid of tags with color indicators and usage counts
 * - Filter by entity type (All, Lead, Contact, Client, Campaign)
 * - Create, edit, and delete tags
 * - Color picker with preset colors
 * - Merge multiple tags
 * - RTL and Arabic support
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Tag as TagIcon,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Loader2,
  GitMerge,
} from 'lucide-react'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import tagsService, { type Tag, type CreateTagData } from '@/services/tagsService'
import { ROUTES } from '@/constants/routes'

// Map CRM entity types to the existing service types
interface CrmTag {
  id: string
  name: string
  color: string
  entityType: 'lead' | 'contact' | 'client' | 'campaign' | 'all'
  usageCount: number
  nameAr?: string
}

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.tags', href: '/dashboard/crm/settings/tags' },
]

// Entity type options with colors
const ENTITY_TYPES = [
  { value: 'all', label: 'All', labelAr: 'الكل', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'lead', label: 'Lead', labelAr: 'عميل محتمل', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'contact', label: 'Contact', labelAr: 'جهة اتصال', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'client', label: 'Client', labelAr: 'عميل', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'campaign', label: 'Campaign', labelAr: 'حملة', color: 'bg-orange-100 text-orange-700 border-orange-200' },
] as const

// Preset colors for tag color picker
const PRESET_COLORS = [
  { value: '#EF4444', label: 'Red', labelAr: 'أحمر' },
  { value: '#F97316', label: 'Orange', labelAr: 'برتقالي' },
  { value: '#EAB308', label: 'Yellow', labelAr: 'أصفر' },
  { value: '#22C55E', label: 'Green', labelAr: 'أخضر' },
  { value: '#3B82F6', label: 'Blue', labelAr: 'أزرق' },
  { value: '#A855F7', label: 'Purple', labelAr: 'بنفسجي' },
  { value: '#EC4899', label: 'Pink', labelAr: 'وردي' },
  { value: '#6B7280', label: 'Gray', labelAr: 'رمادي' },
] as const

// Map service entity types to CRM entity types
function mapServiceToCrmEntityType(serviceType: string): CrmTag['entityType'] {
  const mapping: Record<string, CrmTag['entityType']> = {
    case: 'lead',
    contact: 'contact',
    client: 'client',
    document: 'campaign',
    all: 'all',
  }
  return mapping[serviceType] || 'all'
}

// Map CRM entity types to service entity types
function mapCrmToServiceEntityType(crmType: CrmTag['entityType']): string {
  const mapping: Record<CrmTag['entityType'], string> = {
    lead: 'case',
    contact: 'contact',
    client: 'client',
    campaign: 'document',
    all: 'all',
  }
  return mapping[crmType]
}

// Convert service Tag to CrmTag
function convertToCrmTag(tag: Tag): CrmTag {
  return {
    id: tag._id,
    name: tag.name,
    nameAr: tag.nameAr,
    color: tag.color,
    entityType: mapServiceToCrmEntityType(tag.entityType),
    usageCount: tag.usageCount,
  }
}

// Tag Card Component
interface TagCardProps {
  tag: CrmTag
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (tag: CrmTag) => void
  onDelete: (tag: CrmTag) => void
  isRTL: boolean
  selectionMode: boolean
}

function TagCard({
  tag,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isRTL,
  selectionMode,
}: TagCardProps) {
  const { t } = useTranslation()
  const entityTypeInfo = ENTITY_TYPES.find((et) => et.value === tag.entityType)

  return (
    <Card
      className={cn(
        'rounded-2xl border transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-emerald-500'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox for selection mode */}
          {selectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(tag.id)}
              className="mt-1"
            />
          )}

          {/* Color Indicator */}
          <div
            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: tag.color }}
          />

          {/* Tag Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {isRTL ? tag.nameAr || tag.name : tag.name}
                </h3>
                {tag.nameAr && (
                  <p className="text-xs text-muted-foreground truncate">
                    {isRTL ? tag.name : tag.nameAr}
                  </p>
                )}
              </div>

              {/* Actions Dropdown */}
              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl">
                    <DropdownMenuItem
                      onClick={() => onEdit(tag)}
                      className="rounded-lg cursor-pointer"
                    >
                      <Pencil className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                      {t('common.edit', 'Edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(tag)}
                      className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                      {t('common.delete', 'Delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Entity Type Badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn('px-2 py-0.5 text-xs', entityTypeInfo?.color)} variant="outline">
                {isRTL ? entityTypeInfo?.labelAr : entityTypeInfo?.label}
              </Badge>

              {/* Usage Count */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>{tag.usageCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Color Picker Component
interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  isRTL: boolean
}

function ColorPicker({ value, onChange, isRTL }: ColorPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Label>{t('crm.tags.color', 'Color')}</Label>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'relative w-full h-10 rounded-lg border-2 transition-all hover:scale-105',
              value === color.value ? 'border-slate-900 ring-2 ring-slate-300' : 'border-slate-200'
            )}
            style={{ backgroundColor: color.value }}
            title={isRTL ? color.labelAr : color.label}
          >
            {value === color.value && (
              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Tag Form Dialog Component
interface TagFormDialogProps {
  isOpen: boolean
  onClose: () => void
  tag: CrmTag | null
  onSave: (data: CreateTagData) => Promise<void>
  isRTL: boolean
}

function TagFormDialog({ isOpen, onClose, tag, onSave, isRTL }: TagFormDialogProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CreateTagData>({
    name: '',
    nameAr: '',
    color: PRESET_COLORS[0].value,
    entityType: 'all',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        nameAr: tag.nameAr,
        color: tag.color,
        entityType: mapCrmToServiceEntityType(tag.entityType),
      })
    } else {
      setFormData({
        name: '',
        nameAr: '',
        color: PRESET_COLORS[0].value,
        entityType: 'all',
      })
    }
  }, [tag, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tag
              ? t('crm.tags.editTag', 'Edit Tag')
              : t('crm.tags.createTag', 'Create Tag')}
          </DialogTitle>
          <DialogDescription>
            {tag
              ? t('crm.tags.editTagDesc', 'Update tag details')
              : t('crm.tags.createTagDesc', 'Create a new tag for organizing your CRM data')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('crm.tags.nameEn', 'Name (English)')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('crm.tags.namePlaceholder', 'Enter tag name')}
              className="rounded-lg"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameAr">{t('crm.tags.nameAr', 'Name (Arabic)')}</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder={t('crm.tags.nameArPlaceholder', 'أدخل اسم الوسم')}
              className="rounded-lg"
              dir="rtl"
            />
          </div>

          <ColorPicker
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            isRTL={isRTL}
          />

          <div className="space-y-2">
            <Label htmlFor="entityType">{t('crm.tags.entityType', 'Entity Type')}</Label>
            <Select
              value={mapServiceToCrmEntityType(formData.entityType || 'all')}
              onValueChange={(value) =>
                setFormData({ ...formData, entityType: mapCrmToServiceEntityType(value as CrmTag['entityType']) })
              }
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={cn('px-2 py-1 text-xs rounded', type.color)}>
                        {isRTL ? type.labelAr : type.label}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
              disabled={isSaving}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className={cn('w-4 h-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />}
              {tag ? t('common.update', 'Update') : t('common.create', 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Merge Tags Dialog Component
interface MergeTagsDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedTags: CrmTag[]
  onMerge: (primaryId: string, secondaryIds: string[]) => Promise<void>
  isRTL: boolean
}

function MergeTagsDialog({
  isOpen,
  onClose,
  selectedTags,
  onMerge,
  isRTL,
}: MergeTagsDialogProps) {
  const { t } = useTranslation()
  const [primaryTagId, setPrimaryTagId] = useState<string>('')
  const [isMerging, setIsMerging] = useState(false)

  useEffect(() => {
    if (selectedTags.length > 0) {
      setPrimaryTagId(selectedTags[0].id)
    }
  }, [selectedTags])

  const handleMerge = async () => {
    if (!primaryTagId) {
      toast.error(t('errors.selectPrimaryTag', 'Please select a tag to keep'))
      return
    }

    const secondaryIds = selectedTags
      .filter((tag) => tag.id !== primaryTagId)
      .map((tag) => tag.id)

    if (secondaryIds.length === 0) {
      toast.error(t('errors.noTagsToMerge', 'No tags selected to merge'))
      return
    }

    try {
      setIsMerging(true)
      await onMerge(primaryTagId, secondaryIds)
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-blue-600" />
            {t('crm.tags.mergeTags', 'Merge Tags')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <p>{t('crm.tags.mergeDesc', 'Select which tag to keep. All usages of the other tags will be replaced with the selected tag.')}</p>

              <div className="space-y-2">
                <Label>{t('crm.tags.selectTagToKeep', 'Select tag to keep')}</Label>
                <Select value={primaryTagId} onValueChange={setPrimaryTagId}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{isRTL ? tag.nameAr || tag.name : tag.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({tag.usageCount} {t('crm.tags.uses', 'uses')})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  {t('crm.tags.mergeWarning', 'This action cannot be undone. The other tags will be deleted.')}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={isMerging}>
            {t('common.cancel', 'Cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleMerge}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
            disabled={isMerging}
          >
            {isMerging && <Loader2 className={cn('w-4 h-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />}
            {t('crm.tags.merge', 'Merge Tags')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Main Component
export function TagsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [tags, setTags] = useState<CrmTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<CrmTag | null>(null)
  const [deleteTag, setDeleteTag] = useState<CrmTag | null>(null)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)

  // Fetch tags
  useEffect(() => {
    loadTags()
  }, [selectedEntityType])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      const filters = selectedEntityType !== 'all' ? { entityType: mapCrmToServiceEntityType(selectedEntityType as CrmTag['entityType']) } : undefined
      const response = await tagsService.getTags(filters)
      setTags(response.data.map(convertToCrmTag))
    } catch (error) {
      toast.error(t('errors.loadFailed', 'Failed to load tags'))
    } finally {
      setIsLoading(false)
    }
  }

  // Filtered tags
  const filteredTags = useMemo(() => {
    if (selectedEntityType === 'all') {
      return tags
    }
    return tags.filter((tag) => tag.entityType === selectedEntityType || tag.entityType === 'all')
  }, [tags, selectedEntityType])

  // Selection mode
  const selectionMode = selectedTagIds.length > 0

  // Handle tag selection
  const handleSelectTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    )
  }

  // Handle create tag
  const handleCreateTag = () => {
    setEditingTag(null)
    setFormDialogOpen(true)
  }

  // Handle edit tag
  const handleEditTag = (tag: CrmTag) => {
    setEditingTag(tag)
    setFormDialogOpen(true)
  }

  // Handle save tag
  const handleSaveTag = async (data: CreateTagData) => {
    try {
      if (editingTag) {
        await tagsService.updateTag(editingTag.id, data)
        toast.success(t('common.updateSuccess', 'Tag updated successfully'))
      } else {
        await tagsService.createTag(data)
        toast.success(t('common.createSuccess', 'Tag created successfully'))
      }
      setFormDialogOpen(false)
      setEditingTag(null)
      loadTags()
    } catch (error) {
      toast.error(
        editingTag
          ? t('errors.updateFailed', 'Failed to update tag')
          : t('errors.createFailed', 'Failed to create tag')
      )
      throw error
    }
  }

  // Handle delete tag
  const handleDeleteTag = async () => {
    if (!deleteTag) return

    try {
      await tagsService.deleteTag(deleteTag.id)
      toast.success(t('common.deleteSuccess', 'Tag deleted successfully'))
      setDeleteTag(null)
      loadTags()
    } catch (error) {
      toast.error(t('errors.deleteFailed', 'Failed to delete tag'))
    }
  }

  // Handle merge tags
  const handleMergeTags = async (primaryId: string, secondaryIds: string[]) => {
    try {
      // Assume mergeTags method exists in the service
      const mergeFunction = (tagsService as any).mergeTags
      if (typeof mergeFunction === 'function') {
        await mergeFunction(primaryId, secondaryIds)
        toast.success(t('common.mergeSuccess', 'Tags merged successfully'))
        setMergeDialogOpen(false)
        setSelectedTagIds([])
        loadTags()
      } else {
        throw new Error('Merge tags method not available')
      }
    } catch (error) {
      toast.error(t('errors.mergeFailed', 'Failed to merge tags'))
      throw error
    }
  }

  // Clear selection
  const handleClearSelection = () => {
    setSelectedTagIds([])
  }

  // Open merge dialog
  const handleOpenMergeDialog = () => {
    if (selectedTagIds.length < 2) {
      toast.error(t('errors.selectAtLeastTwo', 'Please select at least 2 tags to merge'))
      return
    }
    setMergeDialogOpen(true)
  }

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <ProductivityHero
            badge={t('crm.badge', 'إدارة العملاء')}
            title={t('crm.settings.tags', 'الوسوم')}
            type="crm"
            hideButtons
          />
          <Button
            onClick={handleCreateTag}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('crm.tags.createTag', 'Create Tag')}
          </Button>
        </div>

        {/* Filters and Actions */}
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Entity Type Tabs */}
              <Tabs value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <TabsList className="rounded-xl">
                  {ENTITY_TYPES.map((type) => (
                    <TabsTrigger key={type.value} value={type.value} className="rounded-lg">
                      {isRTL ? type.labelAr : type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Selection Actions */}
              {selectionMode && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1.5">
                    {selectedTagIds.length} {t('crm.tags.selected', 'selected')}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenMergeDialog}
                    className="rounded-lg"
                    disabled={selectedTagIds.length < 2}
                  >
                    <GitMerge className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t('crm.tags.merge', 'Merge')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearSelection}
                    className="rounded-lg"
                  >
                    <X className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t('common.clear', 'Clear')}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Tags Grid */}
            {filteredTags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTagIds.includes(tag.id)}
                    onSelect={handleSelectTag}
                    onEdit={handleEditTag}
                    onDelete={(tag) => setDeleteTag(tag)}
                    isRTL={isRTL}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('crm.tags.noTags', 'No tags found')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('crm.tags.noTagsDesc', 'Create your first tag to start organizing your CRM data')}
                </p>
                <Button onClick={handleCreateTag} className="rounded-xl">
                  <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('crm.tags.createTag', 'Create Tag')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tag Form Dialog */}
        <TagFormDialog
          isOpen={formDialogOpen}
          onClose={() => {
            setFormDialogOpen(false)
            setEditingTag(null)
          }}
          tag={editingTag}
          onSave={handleSaveTag}
          isRTL={isRTL}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteTag !== null}
          onOpenChange={(open) => !open && setDeleteTag(null)}
        >
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('common.confirmDelete', 'Confirm Delete')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('crm.tags.deleteConfirm', 'Are you sure you want to delete this tag?')}
                {deleteTag && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: deleteTag.color }}
                      />
                      <p className="font-medium">
                        {isRTL ? deleteTag.nameAr || deleteTag.name : deleteTag.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deleteTag.usageCount} {t('crm.tags.usages', 'usages')}
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
                onClick={handleDeleteTag}
                className="rounded-xl bg-red-600 hover:bg-red-700"
              >
                {t('common.delete', 'Delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Merge Tags Dialog */}
        <MergeTagsDialog
          isOpen={mergeDialogOpen}
          onClose={() => setMergeDialogOpen(false)}
          selectedTags={selectedTags}
          onMerge={handleMergeTags}
          isRTL={isRTL}
        />
      </Main>
    </>
  )
}
