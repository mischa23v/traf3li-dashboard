import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from '@tanstack/react-router'
import {
  Plus,
  Award,
  TrendingUp,
  Calendar,
  User,
  Trash2,
  Edit,
  BarChart3,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SkillEvaluationDialog } from '@/components/hr/skills/SkillEvaluationDialog'
import {
  useEmployeeSkillMap,
  useRemoveSkillFromEmployee,
  useTrainingRecommendations,
} from '@/hooks/useEmployeeSkillMap'
import { PROFICIENCY_LEVELS, SKILL_CATEGORY_LABELS } from '@/services/skillService'
import type { EmployeeSkillDetail } from '@/services/employeeSkillMapService'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function EmployeeSkillsPage() {
  const { employeeId } = useParams({ strict: false })
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<EmployeeSkillDetail | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Queries
  const { data: skillMap, isLoading } = useEmployeeSkillMap(employeeId || '')
  const { data: recommendations } = useTrainingRecommendations(employeeId || '')

  // Mutations
  const removeSkillMutation = useRemoveSkillFromEmployee()

  const handleEvaluate = (skill: EmployeeSkillDetail) => {
    setSelectedSkill(skill)
    setEvaluationDialogOpen(true)
  }

  const handleRemove = (skill: EmployeeSkillDetail) => {
    setSelectedSkill(skill)
    setDeleteDialogOpen(true)
  }

  const confirmRemove = async () => {
    if (!employeeId || !selectedSkill) return
    await removeSkillMutation.mutateAsync({ employeeId, skillId: selectedSkill.skillId })
    setDeleteDialogOpen(false)
  }

  const getProficiencyColor = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find(p => p.level === level)
    return proficiency?.color || 'gray'
  }

  const getProficiencyLabel = (level: number) => {
    const proficiency = PROFICIENCY_LEVELS.find(p => p.level === level)
    if (!proficiency) return '-'
    return isArabic ? proficiency.ar : proficiency.en
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!skillMap) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              {t('skills.employeeSkills.noDataFound')}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats by category
  const skillsByCategory = skillMap.skillsByCategory || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? skillMap.employeeNameAr : skillMap.employeeName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {skillMap.designation} - {isArabic ? skillMap.departmentNameAr : skillMap.departmentName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('skills.employeeSkills.totalSkills')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillMap.totalSkills}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('skills.employeeSkills.avgProficiency')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillMap.avgProficiency.toFixed(1)}</div>
            <Progress value={(skillMap.avgProficiency / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('skills.employeeSkills.trainings')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skillMap.trainings.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('skills.employeeSkills.completed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('skills.employeeSkills.recommendations')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations?.totalRecommendations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('skills.employeeSkills.trainingSuggestions')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category */}
      {skillsByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('skills.employeeSkills.skillsByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillsByCategory.map((cat) => {
                const categoryLabel = SKILL_CATEGORY_LABELS[cat.category]
                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`bg-${categoryLabel.color}-50 text-${categoryLabel.color}-700 border-${categoryLabel.color}-200`}
                        >
                          {isArabic ? categoryLabel.ar : categoryLabel.en}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {cat.count} {t('skills.employeeSkills.skills')}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {cat.avgProficiency.toFixed(1)}/5
                      </span>
                    </div>
                    <Progress value={(cat.avgProficiency / 5) * 100} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">
            {t('skills.employeeSkills.skillsTab')}
          </TabsTrigger>
          <TabsTrigger value="trainings">
            {t('skills.employeeSkills.trainings')}
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            {t('skills.employeeSkills.recommendations')}
          </TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('skills.employeeSkills.skillsTab')}</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('skills.employeeSkills.addSkill')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('skills.employeeSkills.skill')}</TableHead>
                    <TableHead>{t('skills.employeeSkills.category')}</TableHead>
                    <TableHead>{t('skills.employeeSkills.proficiency')}</TableHead>
                    <TableHead>{t('skills.employeeSkills.lastEvaluation')}</TableHead>
                    <TableHead>{t('skills.employeeSkills.evaluatedBy')}</TableHead>
                    <TableHead className="text-right">{t('skills.employeeSkills.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillMap.skills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t('skills.employeeSkills.noSkillsFound')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    skillMap.skills.map((skill) => {
                      const categoryLabel = SKILL_CATEGORY_LABELS[skill.category]
                      return (
                        <TableRow key={skill.skillId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {isArabic ? skill.skillNameAr : skill.skillName}
                              </div>
                              {skill.certificationId && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Award className="h-3 w-3" />
                                  {t('skills.employeeSkills.certified')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`bg-${categoryLabel.color}-50 text-${categoryLabel.color}-700 border-${categoryLabel.color}-200`}
                            >
                              {isArabic ? categoryLabel.ar : categoryLabel.en}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`bg-${getProficiencyColor(skill.proficiency)}-50 text-${getProficiencyColor(skill.proficiency)}-700 border-${getProficiencyColor(skill.proficiency)}-200`}
                              >
                                {skill.proficiency}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {getProficiencyLabel(skill.proficiency)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {skill.lastEvaluationDate ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {format(
                                  new Date(skill.lastEvaluationDate),
                                  'PP',
                                  { locale: isArabic ? ar : undefined }
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {skill.evaluatedByName ? (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {skill.evaluatedByName}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEvaluate(skill)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {t('skills.employeeSkills.evaluate')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(skill)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trainings Tab */}
        <TabsContent value="trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('skills.employeeSkills.completedTrainings')}</CardTitle>
            </CardHeader>
            <CardContent>
              {skillMap.trainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('skills.employeeSkills.noTrainingsFound')}
                </div>
              ) : (
                <div className="space-y-4">
                  {skillMap.trainings.map((training) => (
                    <div
                      key={training.trainingId}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {isArabic ? training.trainingNameAr : training.trainingName}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(training.completionDate),
                            'PP',
                            { locale: isArabic ? ar : undefined }
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {training.skillsAcquired.map((skillId, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skillMap.skills.find(s => s.skillId === skillId)?.skillName || skillId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {training.certificateIssued && (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('skills.employeeSkills.trainingRecommendations')}</CardTitle>
              <CardDescription>
                {t('skills.employeeSkills.recommendedTrainingsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!recommendations || recommendations.recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('skills.employeeSkills.noRecommendationsFound')}
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.recommendations.map((rec) => (
                    <div key={rec.skillId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">
                            {isArabic ? rec.skillNameAr : rec.skillName}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {isArabic ? rec.reasonAr : rec.reason}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{rec.currentProficiency}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm font-medium">{rec.targetProficiency}</span>
                        </div>
                      </div>
                      {rec.suggestedTrainings.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            {t('skills.employeeSkills.suggestedTrainings')}
                          </div>
                          {rec.suggestedTrainings.map((training, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                            >
                              <div>
                                {isArabic ? training.trainingTitleAr : training.trainingTitle}
                              </div>
                              <Badge
                                variant={
                                  training.priority === 'high'
                                    ? 'destructive'
                                    : training.priority === 'medium'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {training.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluation Dialog */}
      <SkillEvaluationDialog
        open={evaluationDialogOpen}
        onOpenChange={setEvaluationDialogOpen}
        employeeId={employeeId || ''}
        skill={selectedSkill}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('skills.employeeSkills.confirmDeletion')}
            </DialogTitle>
            <DialogDescription>
              {t('skills.employeeSkills.confirmRemoveSkillMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('skills.employeeSkills.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              {t('skills.employeeSkills.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
