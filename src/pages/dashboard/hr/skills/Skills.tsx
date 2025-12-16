import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Award,
  Code,
  Heart,
  Languages,
  Scale,
  Briefcase,
  Building,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { SkillDialog } from '@/components/hr/skills/SkillDialog'
import {
  useSkills,
  useSkillStats,
  useDeleteSkill,
  useBulkDeleteSkills,
  useExportSkills,
} from '@/hooks/useSkill'
import type { Skill, SkillCategory } from '@/services/skillService'
import { SKILL_CATEGORY_LABELS } from '@/services/skillService'

const categoryIcons = {
  technical: Code,
  soft_skill: Heart,
  language: Languages,
  legal: Scale,
  management: Briefcase,
  industry: Building,
}

export default function SkillsPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>()
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Queries
  const { data: skillsData, isLoading } = useSkills({
    search: searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    isActive: true,
  })
  const { data: stats } = useSkillStats()

  // Mutations
  const deleteMutation = useDeleteSkill()
  const bulkDeleteMutation = useBulkDeleteSkills()
  const exportMutation = useExportSkills()

  const skills = skillsData?.data || []

  // Handlers
  const handleCreate = () => {
    setSelectedSkill(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذه المهارة؟' : 'Are you sure you want to delete this skill?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSkills.length === 0) return
    if (confirm(isArabic ? `هل تريد حذف ${selectedSkills.length} مهارة؟` : `Delete ${selectedSkills.length} skills?`)) {
      await bulkDeleteMutation.mutateAsync(selectedSkills)
      setSelectedSkills([])
    }
  }

  const handleExport = async () => {
    const blob = await exportMutation.mutateAsync({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skills-${new Date().toISOString()}.xlsx`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const toggleSelectSkill = (id: string) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([])
    } else {
      setSelectedSkills(skills.map(s => s._id))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {isArabic ? 'إدارة المهارات' : 'Skills Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? 'إدارة قاعدة بيانات المهارات والكفاءات'
              : 'Manage skill master data and competencies'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة مهارة' : 'Add Skill'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي المهارات' : 'Total Skills'}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSkills}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSkills} {isArabic ? 'نشط' : 'active'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'المهارات التقنية' : 'Technical Skills'}
              </CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byCategory.find(c => c.category === 'technical')?.count || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'يتطلب شهادة' : 'Requires Certification'}
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.skillsRequiringCertification}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'الأكثر طلباً' : 'Most Demanded'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostDemandedSkills.length}</div>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'مهارات متقدمة' : 'trending skills'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'البحث في المهارات...' : 'Search skills...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as SkillCategory | 'all')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'كل الفئات' : 'All Categories'}
                </SelectItem>
                {Object.entries(SKILL_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {isArabic ? label.ar : label.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSkills.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isArabic ? `حذف (${selectedSkills.length})` : `Delete (${selectedSkills.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedSkills.length === skills.length && skills.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>{isArabic ? 'اسم المهارة' : 'Skill Name'}</TableHead>
                  <TableHead>{isArabic ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{isArabic ? 'الوصف' : 'Description'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'مستويات' : 'Levels'}</TableHead>
                  <TableHead className="text-center">{isArabic ? 'شهادة' : 'Certification'}</TableHead>
                  <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isArabic ? 'لا توجد مهارات' : 'No skills found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  skills.map((skill) => {
                    const CategoryIcon = categoryIcons[skill.category]
                    const categoryLabel = SKILL_CATEGORY_LABELS[skill.category]
                    return (
                      <TableRow key={skill._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill._id)}
                            onChange={() => toggleSelectSkill(skill._id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {isArabic ? skill.nameAr : skill.name}
                              </div>
                              {!skill.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  {isArabic ? 'غير نشط' : 'Inactive'}
                                </Badge>
                              )}
                            </div>
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
                        <TableCell className="max-w-md truncate">
                          {isArabic ? skill.descriptionAr : skill.description}
                        </TableCell>
                        <TableCell className="text-center">
                          {skill.proficiencyLevels.length}
                        </TableCell>
                        <TableCell className="text-center">
                          {skill.requiresCertification ? (
                            <Award className="h-4 w-4 text-amber-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {isArabic ? 'الإجراءات' : 'Actions'}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(skill)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {isArabic ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(skill._id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isArabic ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <SkillDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        skill={selectedSkill}
      />
    </div>
  )
}
