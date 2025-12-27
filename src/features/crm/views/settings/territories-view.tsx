/**
 * Territories Settings View
 *
 * Features:
 * - Tree view showing territory hierarchy with expand/collapse
 * - Side panel for create/edit with bilingual fields
 * - Saudi regions and cities criteria
 * - User or Team assignment toggle
 * - Active/Inactive toggle
 * - Delete with confirmation
 * - RTL and Arabic support
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  MapPin,
  Building2,
  Users,
  User,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { territoryService } from '@/services/crmSettingsService'
import { salesTeamService } from '@/services/crmSettingsService'
import { UserPicker } from '@/components/user-picker'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.territories', href: '/dashboard/crm/settings/territories' },
]

// Saudi regions for dropdown
const SAUDI_REGIONS = [
  'Riyadh',
  'Makkah',
  'Madinah',
  'Eastern Province',
  'Asir',
  'Tabuk',
  'Hail',
  'Northern Borders',
  'Jazan',
  'Najran',
  'Al Bahah',
  'Al Jawf',
  'Qassim',
]

// Major Saudi cities for dropdown
const SAUDI_CITIES = [
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Taif',
  'Tabuk',
  'Buraidah',
  'Khamis Mushait',
  'Hofuf',
  'Mubarraz',
  'Najran',
  'Jizan',
  'Yanbu',
  'Al Kharj',
  'Abha',
  'Arar',
  'Sakaka',
]

// Territory interface (inline as requested)
interface Territory {
  id: string
  name: string
  nameAr?: string
  code: string
  parentId?: string
  children?: Territory[]
  regions?: string[]
  cities?: string[]
  assignedUserId?: string
  assignedTeamId?: string
  isActive: boolean
}

// Form data interface
interface TerritoryFormData {
  name: string
  nameAr: string
  code: string
  parentId?: string
  regions: string[]
  cities: string[]
  assignedUserId?: string
  assignedTeamId?: string
  assignmentType: 'user' | 'team'
  isActive: boolean
}

// Team interface for team picker
interface Team {
  id: string
  name: string
  nameAr: string
  isActive: boolean
}

// Territory Tree Node Component
interface TerritoryNodeProps {
  territory: Territory
  level: number
  onEdit: (territory: Territory) => void
  onDelete: (territory: Territory) => void
  isRTL: boolean
  allTerritories: Territory[]
}

function TerritoryNode({
  territory,
  level,
  onEdit,
  onDelete,
  isRTL,
  allTerritories,
}: TerritoryNodeProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = territory.children && territory.children.length > 0

  // Get assigned user or team name (mock for now - in real app, fetch from backend)
  const getAssignmentName = () => {
    if (territory.assignedUserId) {
      return `User: ${territory.assignedUserId.substring(0, 8)}...`
    }
    if (territory.assignedTeamId) {
      return `Team: ${territory.assignedTeamId.substring(0, 8)}...`
    }
    return t('crm.territories.unassigned', 'Unassigned')
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-3 p-3 bg-white border rounded-xl hover:shadow-sm transition-all mb-2',
          level > 0 && isRTL && `mr-${level * 6}`,
          level > 0 && !isRTL && `ml-${level * 6}`
        )}
        style={{
          marginInlineStart: level > 0 ? `${level * 1.5}rem` : 0,
        }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                {isOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="w-5" />
        )}

        {/* Territory Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
          <MapPin className="w-4 h-4 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {isRTL ? territory.nameAr || territory.name : territory.name}
            </p>
            <Badge variant="outline" className="text-xs">
              {territory.code}
            </Badge>
            {!territory.isActive && (
              <Badge variant="outline" className="text-xs text-red-600">
                {t('common.inactive', 'Inactive')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {territory.assignedUserId ? (
                <User className="w-3 h-3" />
              ) : territory.assignedTeamId ? (
                <Users className="w-3 h-3" />
              ) : null}
              {getAssignmentName()}
            </p>
            {territory.regions && territory.regions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {territory.regions.length} {t('crm.territories.regions', 'regions')}
              </p>
            )}
            {territory.cities && territory.cities.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {territory.cities.length} {t('crm.territories.cities', 'cities')}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(territory)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(territory)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="space-y-2">
          {territory.children!.map((child) => (
            <TerritoryNode
              key={child.id}
              territory={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              isRTL={isRTL}
              allTerritories={allTerritories}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Component
export function TerritoriesView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const queryClient = useQueryClient()

  // State
  const [territories, setTerritories] = useState<Territory[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null)
  const [deleteTerritory, setDeleteTerritory] = useState<Territory | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState<TerritoryFormData>({
    name: '',
    nameAr: '',
    code: '',
    parentId: undefined,
    regions: [],
    cities: [],
    assignedUserId: undefined,
    assignedTeamId: undefined,
    assignmentType: 'user',
    isActive: true,
  })

  // Fetch territories and teams
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [territoriesResponse, teamsResponse] = await Promise.all([
        territoryService.getTerritories(),
        salesTeamService.getTeams({ isActive: true }),
      ])
      setTerritories(territoriesResponse.data || [])
      setTeams(teamsResponse.data || [])
    } catch (error) {
      toast.error(t('errors.loadFailed', 'Failed to load data'))
    } finally {
      setIsLoading(false)
    }
  }

  // Build tree structure
  const territoryTree = useMemo(() => {
    const buildTree = (parentId?: string): Territory[] => {
      return territories
        .filter((t) => t.parentId === parentId)
        .map((t) => ({
          ...t,
          children: buildTree(t.id),
        }))
    }
    return buildTree(undefined)
  }, [territories])

  // Handle create new
  const handleCreate = () => {
    setEditingTerritory(null)
    setFormData({
      name: '',
      nameAr: '',
      code: '',
      parentId: undefined,
      regions: [],
      cities: [],
      assignedUserId: undefined,
      assignedTeamId: undefined,
      assignmentType: 'user',
      isActive: true,
    })
    setIsSheetOpen(true)
  }

  // Handle edit
  const handleEdit = (territory: Territory) => {
    setEditingTerritory(territory)
    setFormData({
      name: territory.name,
      nameAr: territory.nameAr || '',
      code: territory.code,
      parentId: territory.parentId,
      regions: territory.regions || [],
      cities: territory.cities || [],
      assignedUserId: territory.assignedUserId,
      assignedTeamId: territory.assignedTeamId,
      assignmentType: territory.assignedUserId ? 'user' : 'team',
      isActive: territory.isActive,
    })
    setIsSheetOpen(true)
  }

  // Handle save
  const handleSave = async () => {
    if (!formData.name || !formData.nameAr || !formData.code) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      const data = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.code,
        type: 'geographic' as const,
        parentId: formData.parentId,
        isActive: formData.isActive,
      }

      if (editingTerritory) {
        await territoryService.updateTerritory(editingTerritory.id, data)
        toast.success(t('common.updateSuccess', 'Updated successfully'))
      } else {
        await territoryService.createTerritory(data)
        toast.success(t('common.createSuccess', 'Created successfully'))
      }

      setIsSheetOpen(false)
      loadData()
    } catch (error) {
      toast.error(
        t(
          editingTerritory ? 'errors.updateFailed' : 'errors.createFailed',
          editingTerritory ? 'Failed to update' : 'Failed to create'
        )
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTerritory) return

    try {
      await territoryService.deleteTerritory(deleteTerritory.id)
      toast.success(t('common.deleteSuccess', 'Deleted successfully'))
      setDeleteTerritory(null)
      loadData()
    } catch (error) {
      toast.error(t('errors.deleteFailed', 'Failed to delete'))
    }
  }

  // Get flat list of territories for parent dropdown (excluding current and its descendants)
  const availableParents = useMemo(() => {
    if (!editingTerritory) return territories

    const getDescendantIds = (id: string): string[] => {
      const children = territories.filter((t) => t.parentId === id)
      return [id, ...children.flatMap((child) => getDescendantIds(child.id))]
    }

    const excludedIds = getDescendantIds(editingTerritory.id)
    return territories.filter((t) => !excludedIds.includes(t.id))
  }, [territories, editingTerritory])

  // Handle multi-select for regions
  const handleRegionToggle = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }

  // Handle multi-select for cities
  const handleCityToggle = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((c) => c !== city)
        : [...prev.cities, city],
    }))
  }

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
            title={t('crm.settings.territories', 'المناطق')}
            type="crm"
            hideButtons
          />
          <Button
            onClick={handleCreate}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            {t('crm.territories.createTerritory', 'Create Territory')}
          </Button>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t('crm.territories.title', 'Territory Hierarchy')}</CardTitle>
            <CardDescription>
              {t(
                'crm.territories.description',
                'Manage your sales territories and assignments'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {territoryTree.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">
                  {t('crm.territories.noTerritories', 'No territories yet. Create your first one!')}
                </p>
              </div>
            ) : (
              territoryTree.map((territory) => (
                <TerritoryNode
                  key={territory.id}
                  territory={territory}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={setDeleteTerritory}
                  isRTL={isRTL}
                  allTerritories={territories}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingTerritory
                  ? t('crm.territories.editTerritory', 'Edit Territory')
                  : t('crm.territories.createTerritory', 'Create Territory')}
              </SheetTitle>
              <SheetDescription>
                {t(
                  'crm.territories.formDescription',
                  'Configure territory details and assignments'
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Name (English) */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('crm.territories.nameEn', 'Name (English)')}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('crm.territories.nameEnPlaceholder', 'e.g., Central Region')}
                  dir="ltr"
                  className="rounded-lg"
                />
              </div>

              {/* Name (Arabic) */}
              <div className="space-y-2">
                <Label htmlFor="nameAr">
                  {t('crm.territories.nameAr', 'Name (Arabic)')}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={t('crm.territories.nameArPlaceholder', 'مثال: المنطقة الوسطى')}
                  dir="rtl"
                  className="rounded-lg"
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">
                  {t('crm.territories.code', 'Territory Code')}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder={t('crm.territories.codePlaceholder', 'e.g., RYD-01')}
                  className="rounded-lg"
                />
              </div>

              {/* Parent Territory */}
              <div className="space-y-2">
                <Label htmlFor="parent">
                  {t('crm.territories.parentTerritory', 'Parent Territory')}
                </Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue
                      placeholder={t('crm.territories.selectParent', 'Select parent territory')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('crm.territories.noParent', 'No Parent (Top Level)')}
                    </SelectItem>
                    {availableParents.map((territory) => (
                      <SelectItem key={territory.id} value={territory.id}>
                        {isRTL ? territory.nameAr || territory.name : territory.name} (
                        {territory.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Regions */}
              <div className="space-y-2">
                <Label>{t('crm.territories.regions', 'Regions')}</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {SAUDI_REGIONS.map((region) => (
                    <div key={region} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`region-${region}`}
                        checked={formData.regions.includes(region)}
                        onChange={() => handleRegionToggle(region)}
                        className="rounded"
                      />
                      <label htmlFor={`region-${region}`} className="text-sm cursor-pointer">
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div className="space-y-2">
                <Label>{t('crm.territories.cities', 'Cities')}</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {SAUDI_CITIES.map((city) => (
                    <div key={city} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`city-${city}`}
                        checked={formData.cities.includes(city)}
                        onChange={() => handleCityToggle(city)}
                        className="rounded"
                      />
                      <label htmlFor={`city-${city}`} className="text-sm cursor-pointer">
                        {city}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Type Toggle */}
              <div className="space-y-3">
                <Label>{t('crm.territories.assignTo', 'Assign To')}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.assignmentType === 'user' ? 'default' : 'outline'}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        assignmentType: 'user',
                        assignedTeamId: undefined,
                      })
                    }
                    className="flex-1 rounded-lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('crm.territories.user', 'User')}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.assignmentType === 'team' ? 'default' : 'outline'}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        assignmentType: 'team',
                        assignedUserId: undefined,
                      })
                    }
                    className="flex-1 rounded-lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {t('crm.territories.team', 'Team')}
                  </Button>
                </div>

                {/* User Picker */}
                {formData.assignmentType === 'user' && (
                  <div className="space-y-2">
                    <UserPicker
                      value={formData.assignedUserId || ''}
                      onChange={(value) =>
                        setFormData({ ...formData, assignedUserId: value as string })
                      }
                      mode="single"
                      placeholder={t('crm.territories.selectUser', 'Select user')}
                      fetchUsers={true}
                    />
                  </div>
                )}

                {/* Team Picker */}
                {formData.assignmentType === 'team' && (
                  <div className="space-y-2">
                    <Select
                      value={formData.assignedTeamId || 'none'}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          assignedTeamId: value === 'none' ? undefined : value,
                        })
                      }
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue
                          placeholder={t('crm.territories.selectTeam', 'Select team')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('crm.territories.noTeam', 'No Team')}
                        </SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {isRTL ? team.nameAr || team.name : team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>{t('crm.territories.active', 'Active')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('crm.territories.activeDescription', 'Enable or disable this territory')}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="rounded-xl"
                disabled={isSaving}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save', 'Save')}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteTerritory !== null}
          onOpenChange={(open) => !open && setDeleteTerritory(null)}
        >
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('common.confirmDelete', 'Confirm Delete')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  'crm.territories.deleteConfirm',
                  'Are you sure you want to delete this territory? This action cannot be undone.'
                )}
                {deleteTerritory && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <p className="font-medium">
                      {isRTL
                        ? deleteTerritory.nameAr || deleteTerritory.name
                        : deleteTerritory.name}{' '}
                      ({deleteTerritory.code})
                    </p>
                  </div>
                )}
                {deleteTerritory?.children && deleteTerritory.children.length > 0 && (
                  <p className="mt-2 text-red-600 text-sm font-medium">
                    {t(
                      'crm.territories.deleteWarning',
                      'Warning: This territory has child territories that will also be affected.'
                    )}
                  </p>
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
      </Main>
    </>
  )
}
