import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Award } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { useCreateSkill, useUpdateSkill } from '@/hooks/useSkill'
import type { Skill, SkillCategory, ProficiencyLevel } from '@/services/skillService'
import { SKILL_CATEGORY_LABELS, PROFICIENCY_LEVELS } from '@/services/skillService'
import { toast } from 'sonner'

interface SkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill?: Skill
}

export function SkillDialog({ open, onOpenChange, skill }: SkillDialogProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const createMutation = useCreateSkill()
  const updateMutation = useUpdateSkill()

  // Form state
  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [category, setCategory] = useState<SkillCategory>('technical')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [requiresCertification, setRequiresCertification] = useState(false)
  const [certificationName, setCertificationName] = useState('')
  const [certificationNameAr, setCertificationNameAr] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([])

  // Initialize form when skill changes
  useEffect(() => {
    if (skill) {
      setName(skill.name)
      setNameAr(skill.nameAr)
      setCategory(skill.category)
      setDescription(skill.description)
      setDescriptionAr(skill.descriptionAr)
      setRequiresCertification(skill.requiresCertification)
      setCertificationName(skill.certificationName || '')
      setCertificationNameAr(skill.certificationNameAr || '')
      setIsActive(skill.isActive)
      setProficiencyLevels(skill.proficiencyLevels || [])
    } else {
      // Reset form
      setName('')
      setNameAr('')
      setCategory('technical')
      setDescription('')
      setDescriptionAr('')
      setRequiresCertification(false)
      setCertificationName('')
      setCertificationNameAr('')
      setIsActive(true)
      // Set default proficiency levels
      setProficiencyLevels(
        PROFICIENCY_LEVELS.map((p) => ({
          level: p.level,
          name: p.en,
          nameAr: p.ar,
          description: p.description,
        }))
      )
    }
  }, [skill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !nameAr.trim()) {
      toast.error(t('hr.dialogs.skill.skillNameRequired'))
      return
    }

    try {
      const data = {
        name: name.trim(),
        nameAr: nameAr.trim(),
        category,
        description: description.trim(),
        descriptionAr: descriptionAr.trim(),
        requiresCertification,
        certificationName: certificationName.trim() || undefined,
        certificationNameAr: certificationNameAr.trim() || undefined,
        isActive,
        proficiencyLevels,
      }

      if (skill) {
        await updateMutation.mutateAsync({ skillId: skill._id, data })
        toast.success(t('hr.dialogs.skill.skillUpdated'))
      } else {
        await createMutation.mutateAsync(data)
        toast.success(t('hr.dialogs.skill.skillCreated'))
      }

      onOpenChange(false)
    } catch (error) {
      toast.error(t('hr.dialogs.skill.error'))
    }
  }

  const updateProficiencyLevel = (level: number, field: keyof ProficiencyLevel, value: string) => {
    setProficiencyLevels(
      proficiencyLevels.map((p) =>
        p.level === level ? { ...p, [field]: value } : p
      )
    )
  }

  const addProficiencyLevel = () => {
    const maxLevel = Math.max(...proficiencyLevels.map((p) => p.level), 0)
    setProficiencyLevels([
      ...proficiencyLevels,
      {
        level: maxLevel + 1,
        name: `Level ${maxLevel + 1}`,
        nameAr: `المستوى ${maxLevel + 1}`,
        description: '',
      },
    ])
  }

  const removeProficiencyLevel = (level: number) => {
    setProficiencyLevels(proficiencyLevels.filter((p) => p.level !== level))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {skill
              ? t('hr.dialogs.skill.editTitle')
              : t('hr.dialogs.skill.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('hr.dialogs.skill.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('hr.dialogs.skill.skillNameEN')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('hr.dialogs.skill.skillNameENPlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">
                  {t('hr.dialogs.skill.skillNameAR')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nameAr"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder={t('hr.dialogs.skill.skillNameARPlaceholder')}
                  required
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                {t('hr.dialogs.skill.category')}
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as SkillCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SKILL_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {isArabic ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('hr.dialogs.skill.descriptionEN')}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('hr.dialogs.skill.descriptionENPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">
                  {t('hr.dialogs.skill.descriptionAR')}
                </Label>
                <Textarea
                  id="descriptionAr"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={t('hr.dialogs.skill.descriptionARPlaceholder')}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>
          </div>

          {/* Certification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requiresCertification">
                  {t('hr.dialogs.skill.requiresCertification')}
                </Label>
                <div className="text-sm text-muted-foreground">
                  {t('hr.dialogs.skill.requiresCertificationDescription')}
                </div>
              </div>
              <Switch
                id="requiresCertification"
                checked={requiresCertification}
                onCheckedChange={setRequiresCertification}
              />
            </div>

            {requiresCertification && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-amber-200">
                <div className="space-y-2">
                  <Label htmlFor="certificationName">
                    {t('hr.dialogs.skill.certificationNameEN')}
                  </Label>
                  <Input
                    id="certificationName"
                    value={certificationName}
                    onChange={(e) => setCertificationName(e.target.value)}
                    placeholder={t('hr.dialogs.skill.certificationNameENPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificationNameAr">
                    {t('hr.dialogs.skill.certificationNameAR')}
                  </Label>
                  <Input
                    id="certificationNameAr"
                    value={certificationNameAr}
                    onChange={(e) => setCertificationNameAr(e.target.value)}
                    placeholder={t('hr.dialogs.skill.certificationNameARPlaceholder')}
                    dir="rtl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Proficiency Levels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>
                {t('hr.dialogs.skill.proficiencyLevels')}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProficiencyLevel}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('hr.dialogs.skill.addLevel')}
              </Button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {proficiencyLevels
                .sort((a, b) => a.level - b.level)
                .map((proficiency) => (
                  <div
                    key={proficiency.level}
                    className="grid grid-cols-12 gap-2 items-start p-3 border rounded-lg"
                  >
                    <div className="col-span-1 flex items-center justify-center h-10">
                      <Badge variant="outline">{proficiency.level}</Badge>
                    </div>
                    <div className="col-span-5 space-y-1">
                      <Input
                        value={proficiency.name}
                        onChange={(e) =>
                          updateProficiencyLevel(proficiency.level, 'name', e.target.value)
                        }
                        placeholder="Level name"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={proficiency.nameAr}
                        onChange={(e) =>
                          updateProficiencyLevel(proficiency.level, 'nameAr', e.target.value)
                        }
                        placeholder="اسم المستوى"
                        className="h-8 text-sm"
                        dir="rtl"
                      />
                    </div>
                    <div className="col-span-5">
                      <Textarea
                        value={proficiency.description}
                        onChange={(e) =>
                          updateProficiencyLevel(proficiency.level, 'description', e.target.value)
                        }
                        placeholder="Description..."
                        className="h-16 text-sm resize-none"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center h-10">
                      {proficiencyLevels.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProficiencyLevel(proficiency.level)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">
                {t('hr.dialogs.skill.active')}
              </Label>
              <div className="text-sm text-muted-foreground">
                {t('hr.dialogs.skill.activeDescription')}
              </div>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('hr.dialogs.skill.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {skill
                ? t('hr.dialogs.skill.update')
                : t('hr.dialogs.skill.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'outline' }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded ${
        variant === 'outline'
          ? 'border border-gray-300 bg-white text-gray-700'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      {children}
    </span>
  )
}
