/**
 * Sales Quotas Settings View
 * Configure and manage sales quotas and targets
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Save,
  Loader2,
  Plus,
  Target,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  Info,
  AlertTriangle,
  CheckCircle2,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { ROUTES } from '@/constants/routes'
import { QuotaProgressWidget, QuotaLeaderboard, QuotaComparison } from '@/features/crm/components/quota-progress-widget'
import type { SalesQuota } from '@/types/crm-enhanced'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'crm.crm', href: ROUTES.dashboard.crm.leads.list },
  { title: 'crm.settings.quotas', href: '/dashboard/crm/settings/quotas' },
]

// Mock data
const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'أحمد محمد', nameEn: 'Ahmed Mohamed', avatar: '/avatars/ahmed.jpg' },
  { id: '2', name: 'سارة علي', nameEn: 'Sara Ali', avatar: '/avatars/sara.jpg' },
  { id: '3', name: 'محمد خالد', nameEn: 'Mohamed Khaled', avatar: '/avatars/mohamed.jpg' },
  { id: '4', name: 'فاطمة حسن', nameEn: 'Fatima Hassan', avatar: '/avatars/fatima.jpg' },
]

const MOCK_QUOTAS: SalesQuota[] = [
  {
    id: '1',
    user_id: '1',
    period: 'monthly',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    target: 150000,
    achieved: 125000,
  },
  {
    id: '2',
    user_id: '2',
    period: 'monthly',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    target: 120000,
    achieved: 135000,
  },
  {
    id: '3',
    user_id: '3',
    period: 'monthly',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    target: 100000,
    achieved: 78000,
  },
  {
    id: '4',
    user_id: '4',
    period: 'monthly',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    target: 80000,
    achieved: 45000,
  },
]

const MOCK_PERIODS = [
  { label: 'Q1', target: 400000, achieved: 380000 },
  { label: 'Q2', target: 450000, achieved: 425000 },
  { label: 'Q3', target: 500000, achieved: 520000 },
  { label: 'Q4', target: 550000, achieved: 280000 },
]

interface QuotaFormData {
  id?: string
  user_id: string
  period: 'monthly' | 'quarterly' | 'yearly'
  target: number
}

export function QuotasSettingsView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [isLoading, setIsLoading] = useState(true)
  const [quotas, setQuotas] = useState<SalesQuota[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [quotaToDelete, setQuotaToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<QuotaFormData>({
    user_id: '',
    period: 'monthly',
    target: 100000,
  })

  // Global settings
  const [settings, setSettings] = useState({
    quotasEnabled: true,
    showLeaderboard: true,
    allowSelfReporting: false,
    notifyOnAchievement: true,
    defaultPeriod: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
  })

  // Load data
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuotas(MOCK_QUOTAS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get user name
  const getUserName = (userId: string) => {
    const user = MOCK_TEAM_MEMBERS.find((u) => u.id === userId)
    return user ? (isRTL ? user.name : user.nameEn) : 'Unknown'
  }

  // Save quota
  const saveQuota = async () => {
    if (!formData.user_id || formData.target <= 0) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (formData.id) {
        // Update existing
        setQuotas((prev) =>
          prev.map((q) =>
            q.id === formData.id
              ? { ...q, target: formData.target, period: formData.period }
              : q
          )
        )
        toast.success(isRTL ? 'تم تحديث الحصة بنجاح' : 'Quota updated successfully')
      } else {
        // Create new
        const newQuota: SalesQuota = {
          id: `quota_${Date.now()}`,
          user_id: formData.user_id,
          period: formData.period,
          start_date: new Date().toISOString(),
          end_date: getEndDate(formData.period),
          target: formData.target,
          achieved: 0,
        }
        setQuotas((prev) => [...prev, newQuota])
        toast.success(isRTL ? 'تم إنشاء الحصة بنجاح' : 'Quota created successfully')
      }

      setIsDialogOpen(false)
      setFormData({ user_id: '', period: 'monthly', target: 100000 })
    } finally {
      setIsSaving(false)
    }
  }

  // Get end date based on period
  const getEndDate = (period: 'monthly' | 'quarterly' | 'yearly') => {
    const now = new Date()
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        return new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString()
      case 'yearly':
        return new Date(now.getFullYear(), 11, 31).toISOString()
    }
  }

  // Delete quota
  const deleteQuota = () => {
    if (!quotaToDelete) return
    setQuotas((prev) => prev.filter((q) => q.id !== quotaToDelete))
    setQuotaToDelete(null)
    setIsDeleteDialogOpen(false)
    toast.success(isRTL ? 'تم حذف الحصة بنجاح' : 'Quota deleted successfully')
  }

  // Open edit dialog
  const openEditDialog = (quota: SalesQuota) => {
    setFormData({
      id: quota.id,
      user_id: quota.user_id,
      period: quota.period,
      target: quota.target,
    })
    setIsDialogOpen(true)
  }

  // Calculate team totals
  const teamTarget = quotas.reduce((sum, q) => sum + q.target, 0)
  const teamAchieved = quotas.reduce((sum, q) => sum + q.achieved, 0)
  const teamProgress = teamTarget > 0 ? (teamAchieved / teamTarget) * 100 : 0

  // Prepare leaderboard data
  const leaderboardData = quotas.map((quota) => ({
    ...quota,
    user_name: getUserName(quota.user_id),
  }))

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
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
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
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl pb-24"
      >
        <ProductivityHero
          badge={isRTL ? 'إدارة العملاء' : 'CRM'}
          title={isRTL ? 'حصص المبيعات' : 'Sales Quotas'}
          type="crm"
          hideButtons
        />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="rounded-xl">
            <TabsTrigger value="overview">
              {isRTL ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="quotas">
              {isRTL ? 'الحصص' : 'Quotas'}
            </TabsTrigger>
            <TabsTrigger value="settings">
              {isRTL ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Team Summary */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {isRTL ? 'ملخص الفريق' : 'Team Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isRTL ? 'الهدف الإجمالي' : 'Total Target'}
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(teamTarget)}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isRTL ? 'المحقق' : 'Achieved'}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(teamAchieved)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isRTL ? 'نسبة الإنجاز' : 'Achievement Rate'}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {teamProgress.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={teamProgress} className="mt-6 h-3" />
              </CardContent>
            </Card>

            {/* Widgets Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <QuotaLeaderboard
                quotas={leaderboardData}
                className="rounded-3xl border-0 shadow-sm"
              />
              <QuotaComparison
                periods={MOCK_PERIODS}
                className="rounded-3xl border-0 shadow-sm"
              />
            </div>
          </TabsContent>

          {/* Quotas Tab */}
          <TabsContent value="quotas" className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {isRTL ? 'حصص الفريق' : 'Team Quotas'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRTL
                    ? 'إدارة أهداف المبيعات لكل عضو في الفريق'
                    : 'Manage sales targets for each team member'}
                </p>
              </div>
              <Button
                onClick={() => {
                  setFormData({ user_id: '', period: 'monthly', target: 100000 })
                  setIsDialogOpen(true)
                }}
                className="rounded-xl"
              >
                <Plus className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'إضافة حصة' : 'Add Quota'}
              </Button>
            </div>

            {/* Quotas Table */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'العضو' : 'Member'}</TableHead>
                      <TableHead>{isRTL ? 'الفترة' : 'Period'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'الهدف' : 'Target'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'المحقق' : 'Achieved'}</TableHead>
                      <TableHead>{isRTL ? 'التقدم' : 'Progress'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotas.map((quota) => {
                      const progress = (quota.achieved / quota.target) * 100
                      const isAchieved = quota.achieved >= quota.target
                      const isAtRisk = progress < 50

                      return (
                        <TableRow key={quota.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              {getUserName(quota.user_id)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {quota.period === 'monthly' && (isRTL ? 'شهري' : 'Monthly')}
                              {quota.period === 'quarterly' && (isRTL ? 'ربع سنوي' : 'Quarterly')}
                              {quota.period === 'yearly' && (isRTL ? 'سنوي' : 'Yearly')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(quota.target)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quota.achieved)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-32">
                              <Progress value={Math.min(progress, 100)} className="h-2" />
                              <span className="text-xs text-muted-foreground w-12">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isAchieved ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className={cn('w-3 h-3', isRTL ? 'ml-1' : 'mr-1')} />
                                {isRTL ? 'محقق' : 'Achieved'}
                              </Badge>
                            ) : isAtRisk ? (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className={cn('w-3 h-3', isRTL ? 'ml-1' : 'mr-1')} />
                                {isRTL ? 'متأخر' : 'Behind'}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700">
                                <TrendingUp className={cn('w-3 h-3', isRTL ? 'ml-1' : 'mr-1')} />
                                {isRTL ? 'جاري' : 'In Progress'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => openEditDialog(quota)}>
                                  <Edit className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {isRTL ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setQuotaToDelete(quota.id)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                                  {isRTL ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>
                      {isRTL ? 'إعدادات الحصص' : 'Quota Settings'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL
                        ? 'تكوين إعدادات حصص المبيعات العامة'
                        : 'Configure general sales quota settings'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable Quotas */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'تفعيل الحصص' : 'Enable Quotas'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'تفعيل نظام حصص المبيعات'
                        : 'Enable the sales quota system'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.quotasEnabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, quotasEnabled: checked }))
                    }
                  />
                </div>

                {/* Show Leaderboard */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'عرض قائمة المتصدرين' : 'Show Leaderboard'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'عرض ترتيب أعضاء الفريق حسب الإنجاز'
                        : 'Display team member ranking by achievement'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.showLeaderboard}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, showLeaderboard: checked }))
                    }
                  />
                </div>

                {/* Notify on Achievement */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">
                      {isRTL ? 'إشعار عند الإنجاز' : 'Notify on Achievement'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'إرسال إشعار عند تحقيق الحصة'
                        : 'Send notification when quota is achieved'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyOnAchievement}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, notifyOnAchievement: checked }))
                    }
                  />
                </div>

                {/* Default Period */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl">
                  <Label className="text-base font-medium">
                    {isRTL ? 'الفترة الافتراضية' : 'Default Period'}
                  </Label>
                  <Select
                    value={settings.defaultPeriod}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        defaultPeriod: value as 'monthly' | 'quarterly' | 'yearly',
                      }))
                    }
                  >
                    <SelectTrigger className="w-48 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">
                        {isRTL ? 'شهري' : 'Monthly'}
                      </SelectItem>
                      <SelectItem value="quarterly">
                        {isRTL ? 'ربع سنوي' : 'Quarterly'}
                      </SelectItem>
                      <SelectItem value="yearly">
                        {isRTL ? 'سنوي' : 'Yearly'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Info Alert */}
            <Alert className="rounded-xl border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                {isRTL
                  ? 'يتم حساب إنجاز الحصص تلقائياً من الصفقات المغلقة. يمكنك أيضاً تحديث القيم يدوياً.'
                  : 'Quota achievements are automatically calculated from closed deals. You can also update values manually.'}
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </Main>

      {/* Quota Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id
                ? (isRTL ? 'تعديل الحصة' : 'Edit Quota')
                : (isRTL ? 'إضافة حصة جديدة' : 'Add New Quota')}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'حدد هدف المبيعات لعضو الفريق'
                : 'Set the sales target for a team member'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Team Member */}
            <div className="space-y-2">
              <Label>{isRTL ? 'عضو الفريق' : 'Team Member'}</Label>
              <Select
                value={formData.user_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, user_id: value }))
                }
                disabled={!!formData.id}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder={isRTL ? 'اختر عضو' : 'Select member'} />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {isRTL ? member.name : member.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الفترة' : 'Period'}</Label>
              <Select
                value={formData.period}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    period: value as 'monthly' | 'quarterly' | 'yearly',
                  }))
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{isRTL ? 'شهري' : 'Monthly'}</SelectItem>
                  <SelectItem value="quarterly">{isRTL ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
                  <SelectItem value="yearly">{isRTL ? 'سنوي' : 'Yearly'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الهدف (ريال)' : 'Target (SAR)'}</Label>
              <Input
                type="number"
                min={0}
                value={formData.target}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, target: parseInt(e.target.value) || 0 }))
                }
                className="rounded-lg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={saveQuota} disabled={isSaving}>
              {isSaving && <Loader2 className={cn('w-4 h-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />}
              {formData.id ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إضافة' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this quota? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={deleteQuota}>
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default QuotasSettingsView
