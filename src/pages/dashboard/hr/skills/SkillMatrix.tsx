import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Download,
  Filter,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useSkillMatrix,
  useExportSkillMatrix,
  useDepartmentSkillSummary,
} from '@/hooks/useEmployeeSkillMap'
import { PROFICIENCY_LEVELS } from '@/services/skillService'
import { SKILL_CATEGORY_LABELS } from '@/services/skillService'

export default function SkillMatrixPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>()

  // Queries
  const { data: matrix, isLoading } = useSkillMatrix(selectedDepartment)
  const { data: summary } = useDepartmentSkillSummary(selectedDepartment || '')
  const exportMutation = useExportSkillMatrix()

  const handleExport = async () => {
    const blob = await exportMutation.mutateAsync(selectedDepartment)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skill-matrix-${selectedDepartment || 'all'}-${new Date().toISOString()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'مصفوفة المهارات' : 'Skill Matrix'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? 'عرض شامل لمهارات الموظفين حسب القسم'
              : 'Comprehensive view of employee skills by department'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={!matrix}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Department Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={selectedDepartment || 'all'}
              onValueChange={(value) => setSelectedDepartment(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'كل الأقسام' : 'All Departments'}
                </SelectItem>
                {/* Add department options from API */}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي الموظفين' : 'Total Employees'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي المهارات' : 'Total Skills'}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSkills}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'متوسط الكفاءة' : 'Avg Proficiency'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgProficiency.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'من 5' : 'out of 5'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'فجوات المهارات' : 'Skill Gaps'}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.skillGaps.length}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'تحتاج إلى تطوير' : 'need development'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Skills */}
      {summary && summary.topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'أهم المهارات' : 'Top Skills'}</CardTitle>
            <CardDescription>
              {isArabic
                ? 'المهارات الأكثر شيوعاً في القسم'
                : 'Most common skills in the department'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topSkills.slice(0, 5).map((skill) => (
                <div key={skill.skillId} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{skill.skillName}</div>
                    <div className="text-sm text-muted-foreground">
                      {skill.employeeCount} {isArabic ? 'موظف' : 'employees'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {skill.avgProficiency.toFixed(1)}/5
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${getProficiencyColor(Math.round(skill.avgProficiency))}-500`}
                        style={{ width: `${(skill.avgProficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'مصفوفة المهارات' : 'Skill Matrix'}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? 'كفاءة كل موظف في المهارات المختلفة'
              : 'Employee proficiency across different skills'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : matrix ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium sticky left-0 bg-white z-10">
                      {isArabic ? 'الموظف' : 'Employee'}
                    </th>
                    {matrix.skills.map((skill) => (
                      <th
                        key={skill.skillId}
                        className="text-center p-3 font-medium min-w-[100px]"
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="truncate cursor-help">
                                {isArabic ? skill.skillNameAr : skill.skillName}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {isArabic ? skill.skillNameAr : skill.skillName}
                                </div>
                                <div className="text-xs">
                                  {isArabic
                                    ? SKILL_CATEGORY_LABELS[skill.category].ar
                                    : SKILL_CATEGORY_LABELS[skill.category].en}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.employees.map((employee) => (
                    <tr key={employee.employeeId} className="border-b hover:bg-gray-50">
                      <td className="p-3 sticky left-0 bg-white">
                        <div>
                          <div className="font-medium">
                            {isArabic ? employee.employeeNameAr : employee.employeeName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.designation}
                          </div>
                        </div>
                      </td>
                      {matrix.skills.map((skill) => {
                        const proficiency = employee.skills[skill.skillId]
                        return (
                          <td key={skill.skillId} className="p-3 text-center">
                            {proficiency ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className={`bg-${getProficiencyColor(proficiency)}-50 text-${getProficiencyColor(proficiency)}-700 border-${getProficiencyColor(proficiency)}-200 cursor-help`}
                                    >
                                      {proficiency}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm">
                                      {getProficiencyLabel(proficiency)}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {matrix.employees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {isArabic ? 'لا توجد بيانات' : 'No data available'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isArabic ? 'اختر قسماً لعرض المصفوفة' : 'Select a department to view the matrix'}
            </div>
          )}

          {/* Legend */}
          {matrix && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium mb-3">
                {isArabic ? 'مستويات الكفاءة' : 'Proficiency Levels'}
              </div>
              <div className="flex flex-wrap gap-4">
                {PROFICIENCY_LEVELS.map((level) => (
                  <div key={level.level} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`bg-${level.color}-50 text-${level.color}-700 border-${level.color}-200`}
                    >
                      {level.level}
                    </Badge>
                    <span className="text-sm">
                      {isArabic ? level.ar : level.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
