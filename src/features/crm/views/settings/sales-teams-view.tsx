/**
 * Sales Teams Settings View
 *
 * Features:
 * - Card/Grid view of teams
 * - Create/Edit teams with bilingual support
 * - Manage team members with roles (leader/member)
 * - User search and assignment
 * - RTL and Arabic support
 * - Performance indicators (placeholder when not available)
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Crown,
  UserPlus,
  X,
  AlertCircle,
  Loader2,
  TrendingUp,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import {
  salesTeamService,
  type SalesTeam,
  type SalesTeamMember,
  type CreateSalesTeamData,
  type AddMemberData,
} from '@/services/crmSettingsService'
import { UserPicker } from '@/components/user-picker'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.salesTeams', href: '/dashboard/crm/settings/sales-teams' },
]

// Team Card Component
interface TeamCardProps {
  team: SalesTeam
  onEdit: (team: SalesTeam) => void
  onDelete: (team: SalesTeam) => void
  isRTL: boolean
}

function TeamCard({ team, onEdit, onDelete, isRTL }: TeamCardProps) {
  const { t } = useTranslation()
  const memberCount = team.members?.length || 0
  const leaderMember = team.members?.find((m) => m.role === 'leader')

  return (
    <Card
      className="group rounded-3xl border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onEdit(team)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">
                {isRTL ? team.nameAr || team.name : team.name}
              </CardTitle>
              {!team.isActive && (
                <Badge variant="outline" className="text-xs mt-1">
                  {t('common.inactive', 'Inactive')}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(team)
              }}
              className="h-8 w-8 p-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(team)
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {isRTL ? team.descriptionAr || team.description : team.description}
          </p>
        )}

        {/* Team Leader */}
        {leaderMember && (
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              {t('crm.salesTeams.leader', 'Team Leader')}:
            </span>
            <span className="text-xs font-medium">{leaderMember.userName}</span>
          </div>
        )}

        {/* Member Count */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {memberCount} {t('crm.salesTeams.members', 'members')}
            </span>
          </div>

          {/* Performance Placeholder */}
          <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" />
            <span>--</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Team Detail Modal Component
interface TeamDetailModalProps {
  team: SalesTeam | null
  isOpen: boolean
  onClose: () => void
  onSave: (team: SalesTeam) => void
  isRTL: boolean
}

function TeamDetailModal({
  team,
  isOpen,
  onClose,
  onSave,
  isRTL,
}: TeamDetailModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<CreateSalesTeamData>>({})
  const [members, setMembers] = useState<SalesTeamMember[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'leader' | 'member'>('member')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form when team changes
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        nameAr: team.nameAr,
        description: team.description,
        descriptionAr: team.descriptionAr,
        isActive: team.isActive,
      })
      setMembers(team.members || [])
    } else {
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        isActive: true,
      })
      setMembers([])
    }
    setSelectedUserId('')
    setSelectedRole('member')
  }, [team])

  const handleSave = async () => {
    if (!formData.name || !formData.nameAr) {
      toast.error(t('errors.fillRequired', 'Please fill all required fields'))
      return
    }

    try {
      setIsSaving(true)
      let savedTeam: SalesTeam

      if (team) {
        // Update existing team
        savedTeam = await salesTeamService.updateTeam(team.id, formData)
      } else {
        // Create new team
        savedTeam = await salesTeamService.createTeam(
          formData as CreateSalesTeamData
        )
      }

      toast.success(
        t(
          team ? 'common.updateSuccess' : 'common.createSuccess',
          team ? 'Updated successfully' : 'Created successfully'
        )
      )
      onSave(savedTeam)
      onClose()
    } catch (error) {
      toast.error(
        t(
          team ? 'errors.updateFailed' : 'errors.createFailed',
          team ? 'Failed to update' : 'Failed to create'
        )
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId || !team) return

    try {
      const data: AddMemberData = {
        userId: selectedUserId,
        role: selectedRole,
      }
      const updatedTeam = await salesTeamService.addMember(team.id, data)
      setMembers(updatedTeam.members || [])
      setSelectedUserId('')
      setSelectedRole('member')
      toast.success(t('crm.salesTeams.memberAdded', 'Member added successfully'))
    } catch (error) {
      toast.error(t('errors.addMemberFailed', 'Failed to add member'))
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!team) return

    try {
      const updatedTeam = await salesTeamService.removeMember(team.id, userId)
      setMembers(updatedTeam.members || [])
      toast.success(
        t('crm.salesTeams.memberRemoved', 'Member removed successfully')
      )
    } catch (error) {
      toast.error(t('errors.removeMemberFailed', 'Failed to remove member'))
    }
  }

  const getUserInitials = (userName: string) => {
    const parts = userName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {team
              ? t('crm.salesTeams.editTeam', 'Edit Sales Team')
              : t('crm.salesTeams.createTeam', 'Create Sales Team')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'crm.salesTeams.teamDescription',
              'Manage team information and members'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Team Name */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('crm.salesTeams.nameEn', 'Team Name (English)')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t(
                  'crm.salesTeams.namePlaceholder',
                  'Enter team name'
                )}
                dir="ltr"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameAr">
                {t('crm.salesTeams.nameAr', 'اسم الفريق (عربي)')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="nameAr"
                value={formData.nameAr || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nameAr: e.target.value })
                }
                placeholder={t('crm.salesTeams.nameArPlaceholder', 'أدخل اسم الفريق')}
                dir="rtl"
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {t('crm.salesTeams.descriptionEn', 'Description (English)')}
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t(
                  'crm.salesTeams.descriptionPlaceholder',
                  'Enter team description'
                )}
                dir="ltr"
                className="rounded-lg min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionAr">
                {t('crm.salesTeams.descriptionAr', 'الوصف (عربي)')}
              </Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr || ''}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionAr: e.target.value })
                }
                placeholder={t(
                  'crm.salesTeams.descriptionArPlaceholder',
                  'أدخل وصف الفريق'
                )}
                dir="rtl"
                className="rounded-lg min-h-20"
              />
            </div>
          </div>

          {/* Members List (only for existing teams) */}
          {team && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('crm.salesTeams.members', 'Team Members')}</Label>
                <Badge variant="secondary">
                  {members.length} {t('crm.salesTeams.members', 'members')}
                </Badge>
              </div>

              {/* Add Member Section */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <Label>{t('crm.salesTeams.addMember', 'Add Member')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <UserPicker
                      value={selectedUserId}
                      onChange={(value) => setSelectedUserId(value as string)}
                      mode="single"
                      placeholder={t('crm.salesTeams.selectUser', 'Select user')}
                      fetchUsers={true}
                      className="rounded-lg"
                    />
                  </div>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) =>
                      setSelectedRole(value as 'leader' | 'member')
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">
                        {t('crm.salesTeams.leader', 'Leader')}
                      </SelectItem>
                      <SelectItem value="member">
                        {t('crm.salesTeams.member', 'Member')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId}
                  size="sm"
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  {t('crm.salesTeams.addMember', 'Add Member')}
                </Button>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {t('crm.salesTeams.noMembers', 'No members yet')}
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-xl hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {getUserInitials(member.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.userId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            member.role === 'leader' ? 'default' : 'secondary'
                          }
                          className={cn(
                            'text-xs',
                            member.role === 'leader' &&
                              'bg-amber-100 text-amber-700 border-amber-200'
                          )}
                        >
                          {member.role === 'leader' && (
                            <Crown className="w-3 h-3 mr-1" />
                          )}
                          {t(
                            `crm.salesTeams.${member.role}`,
                            member.role === 'leader' ? 'Leader' : 'Member'
                          )}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
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
            {isSaving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            {t('common.save', 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Component
export function SalesTeamsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const queryClient = useQueryClient()

  // State
  const [teams, setTeams] = useState<SalesTeam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<SalesTeam | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteTeam, setDeleteTeam] = useState<SalesTeam | null>(null)

  // Fetch teams
  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      setIsLoading(true)
      const response = await salesTeamService.getTeams()
      setTeams(response.data || [])
    } catch (error) {
      toast.error(t('errors.loadFailed', 'Failed to load sales teams'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTeam = () => {
    setSelectedTeam(null)
    setIsModalOpen(true)
  }

  const handleEditTeam = (team: SalesTeam) => {
    setSelectedTeam(team)
    setIsModalOpen(true)
  }

  const handleSaveTeam = (team: SalesTeam) => {
    loadTeams()
  }

  const handleDeleteTeam = async () => {
    if (!deleteTeam) return

    try {
      await salesTeamService.deleteTeam(deleteTeam.id)
      toast.success(t('common.deleteSuccess', 'Deleted successfully'))
      setDeleteTeam(null)
      loadTeams()
    } catch (error) {
      toast.error(t('errors.deleteFailed', 'Failed to delete'))
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
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
            title={t('crm.settings.salesTeams', 'فرق المبيعات')}
            type="crm"
            hideButtons
          />
          <Button
            onClick={handleCreateTeam}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            {t('crm.salesTeams.createTeam', 'Create Team')}
          </Button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {t('crm.salesTeams.noTeams', 'No sales teams yet')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t(
                  'crm.salesTeams.noTeamsDescription',
                  'Create your first sales team to get started'
                )}
              </p>
              <Button
                onClick={handleCreateTeam}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                {t('crm.salesTeams.createTeam', 'Create Team')}
              </Button>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEditTeam}
                onDelete={(team) => setDeleteTeam(team)}
                isRTL={isRTL}
              />
            ))
          )}
        </div>

        {/* Team Detail Modal */}
        <TeamDetailModal
          team={selectedTeam}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTeam}
          isRTL={isRTL}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteTeam !== null}
          onOpenChange={(open) => !open && setDeleteTeam(null)}
        >
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('common.confirmDelete', 'Confirm Delete')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t(
                  'crm.salesTeams.deleteConfirm',
                  'Are you sure you want to delete this sales team? This action cannot be undone.'
                )}
                {deleteTeam && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <p className="font-medium">
                      {isRTL
                        ? deleteTeam.nameAr || deleteTeam.name
                        : deleteTeam.name}
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
                onClick={handleDeleteTeam}
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
