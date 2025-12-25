/**
 * Job Card Details View
 * Comprehensive view for a single job card with time logs, materials, and real-time timer
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  ClipboardList,
  History,
  BarChart3,
  PlayCircle,
  Timer,
  User,
  Calendar,
  Layers,
  Box,
  Plus,
  FileText,
  TrendingUp,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import {
  useJobCard,
  useStartJobCard,
  useCompleteJobCard,
} from '@/hooks/use-manufacturing'
import type { JobCardStatus } from '@/types/manufacturing'
import { ManufacturingSidebar } from './manufacturing-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.manufacturing', href: '/dashboard/manufacturing' },
]

export function JobCardDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { jobCardId } = useParams({ from: '/_authenticated/dashboard/manufacturing/job-cards/$jobCardId' })

  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showAddTimeLogDialog, setShowAddTimeLogDialog] = useState(false)
  const [completedQty, setCompletedQty] = useState(0)
  const [timeLogData, setTimeLogData] = useState({
    fromTime: '',
    toTime: '',
    completedQty: 0,
    remarks: '',
  })

  // Timer state for work in progress
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const { data: jobCard, isLoading, error } = useJobCard(jobCardId)
  const startJobCardMutation = useStartJobCard()
  const completeJobCardMutation = useCompleteJobCard()

  // Timer effect
  useEffect(() => {
    if (jobCard?.status === 'work_in_progress' && jobCard.startedTime) {
      setIsTimerRunning(true)
      const startTime = new Date(jobCard.startedTime).getTime()

      const interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setElapsedTime(elapsed)
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setIsTimerRunning(false)
      setElapsedTime(0)
    }
  }, [jobCard?.status, jobCard?.startedTime])

  // Initialize completedQty when jobCard loads
  useEffect(() => {
    if (jobCard) {
      setCompletedQty(jobCard.completedQty || 0)
    }
  }, [jobCard])

  const handleStart = async () => {
    try {
      await startJobCardMutation.mutateAsync(jobCardId)
    } catch (error) {
      console.error('Failed to start job card:', error)
    }
  }

  const handlePause = async () => {
    // In a real implementation, this would call a pause mutation
    // For now, we'll just show a message
    console.log('Pause functionality not yet implemented')
  }

  const handleComplete = async () => {
    try {
      await completeJobCardMutation.mutateAsync({
        id: jobCardId,
        completedQty,
      })
      setShowCompleteDialog(false)
    } catch (error) {
      console.error('Failed to complete job card:', error)
    }
  }

  const handleAddTimeLog = () => {
    // In a real implementation, this would add a time log entry
    console.log('Add time log:', timeLogData)
    setShowAddTimeLogDialog(false)
    setTimeLogData({
      fromTime: '',
      toTime: '',
      completedQty: 0,
      remarks: '',
    })
  }

  const getStatusBadge = (status: JobCardStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('manufacturing.status.completed', 'مكتمل')}
          </Badge>
        )
      case 'work_in_progress':
        return (
          <Badge variant="default" className="bg-blue-500">
            <PlayCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.status.workInProgress', 'قيد العمل')}
          </Badge>
        )
      case 'open':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-600">
            <Clock className="w-3 h-3 ml-1" />
            {t('manufacturing.status.open', 'مفتوح')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('manufacturing.status.cancelled', 'ملغى')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-600">
            {t('manufacturing.status.draft', 'مسودة')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  const formatDateOnly = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium'
    }).format(new Date(date))
  }

  const calculateDuration = (fromTime: string, toTime: string) => {
    const start = new Date(fromTime).getTime()
    const end = new Date(toTime).getTime()
    const durationMs = end - start
    const minutes = Math.floor(durationMs / 60000)
    return minutes
  }

  // Calculate progress
  const completionPercentage = jobCard
    ? Math.min(Math.round((jobCard.completedQty / jobCard.forQuantity) * 100), 100)
    : 0

  // Calculate total time spent
  const totalTimeSpent = jobCard?.timeLogs?.reduce((sum, log) => {
    return sum + calculateDuration(log.fromTime, log.toTime)
  }, 0) || 0

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !jobCard) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('manufacturing.jobCardNotFound', 'بطاقة العمل غير موجودة')}
              </h3>
              <Button onClick={() => navigate({ to: '/dashboard/manufacturing/job-cards' })} className="rounded-xl">
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('manufacturing.backToList', 'العودة للقائمة')}
              </Button>
            </CardContent>
          </Card>
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

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('manufacturing.badge', 'التصنيع')}
          title={jobCard.jobCardNumber}
          type="manufacturing"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Job Card Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {jobCard.jobCardNumber}
                      </span>
                      {getStatusBadge(jobCard.status)}
                    </div>

                    <h1 className="text-2xl font-bold">
                      {jobCard.operation}
                    </h1>

                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.workOrder', 'أمر العمل')}: </span>
                          <span className="font-medium">{jobCard.workOrderNumber || jobCard.workOrderId}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.workstation', 'محطة العمل')}: </span>
                          <span className="font-medium">{jobCard.workstation || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.item', 'الصنف')}: </span>
                          <span className="font-medium">{jobCard.itemName || jobCard.itemCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-muted-foreground">{t('manufacturing.targetQty', 'الكمية المستهدفة')}: </span>
                          <span className="font-medium">{jobCard.forQuantity}</span>
                        </div>
                      </div>

                      {jobCard.employee && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground">{t('manufacturing.employee', 'الموظف')}: </span>
                            <span className="font-medium">{jobCard.employeeName || jobCard.employee}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Timer */}
                  <div className="flex flex-col gap-2">
                    {/* Timer Display */}
                    {isTimerRunning && (
                      <Card className="rounded-2xl bg-blue-50 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Timer className="w-6 h-6 mx-auto text-blue-600 mb-2 animate-pulse" />
                          <div className="text-3xl font-bold text-blue-600 font-mono">
                            {formatTime(elapsedTime)}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {t('manufacturing.timeElapsed', 'الوقت المنقضي')}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    {jobCard.status === 'open' && (
                      <Button
                        className="rounded-xl"
                        onClick={handleStart}
                        disabled={startJobCardMutation.isPending}
                      >
                        <Play className="w-4 h-4 ml-2" />
                        {t('manufacturing.start', 'بدء')}
                      </Button>
                    )}

                    {jobCard.status === 'work_in_progress' && (
                      <>
                        <Button
                          variant="outline"
                          className="rounded-xl"
                          onClick={handlePause}
                        >
                          <Pause className="w-4 h-4 ml-2" />
                          {t('manufacturing.pause', 'إيقاف مؤقت')}
                        </Button>

                        <Dialog open={showAddTimeLogDialog} onOpenChange={setShowAddTimeLogDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl">
                              <Plus className="w-4 h-4 ml-2" />
                              {t('manufacturing.addTimeLog', 'إضافة سجل وقت')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('manufacturing.addTimeLog', 'إضافة سجل وقت')}</DialogTitle>
                              <DialogDescription>
                                {t('manufacturing.addTimeLogDesc', 'أضف سجل وقت جديد لهذه بطاقة العمل')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="fromTime">{t('manufacturing.fromTime', 'من الوقت')}</Label>
                                <Input
                                  id="fromTime"
                                  type="datetime-local"
                                  value={timeLogData.fromTime}
                                  onChange={(e) => setTimeLogData({ ...timeLogData, fromTime: e.target.value })}
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="toTime">{t('manufacturing.toTime', 'إلى الوقت')}</Label>
                                <Input
                                  id="toTime"
                                  type="datetime-local"
                                  value={timeLogData.toTime}
                                  onChange={(e) => setTimeLogData({ ...timeLogData, toTime: e.target.value })}
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="completedQtyLog">{t('manufacturing.completedQty', 'الكمية المكتملة')}</Label>
                                <Input
                                  id="completedQtyLog"
                                  type="number"
                                  min="0"
                                  value={timeLogData.completedQty}
                                  onChange={(e) => setTimeLogData({ ...timeLogData, completedQty: parseFloat(e.target.value) || 0 })}
                                  className="rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="remarks">{t('manufacturing.remarks', 'ملاحظات')}</Label>
                                <Textarea
                                  id="remarks"
                                  value={timeLogData.remarks}
                                  onChange={(e) => setTimeLogData({ ...timeLogData, remarks: e.target.value })}
                                  className="rounded-xl"
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddTimeLogDialog(false)} className="rounded-xl">
                                {t('common.cancel', 'إلغاء')}
                              </Button>
                              <Button onClick={handleAddTimeLog} className="rounded-xl">
                                {t('common.add', 'إضافة')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                          <AlertDialogTrigger asChild>
                            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="w-4 h-4 ml-2" />
                              {t('manufacturing.complete', 'إكمال')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('manufacturing.completeJobCard', 'إكمال بطاقة العمل')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('manufacturing.completeJobCardDesc', 'أدخل الكمية المكتملة لهذه بطاقة العمل')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Label htmlFor="completedQty">{t('manufacturing.completedQty', 'الكمية المكتملة')}</Label>
                              <Input
                                id="completedQty"
                                type="number"
                                min="0"
                                max={jobCard.forQuantity}
                                value={completedQty}
                                onChange={(e) => setCompletedQty(parseFloat(e.target.value) || 0)}
                                className="rounded-xl mt-2"
                              />
                              <p className="text-sm text-muted-foreground mt-2">
                                {t('manufacturing.targetQty', 'الكمية المستهدفة')}: {jobCard.forQuantity}
                              </p>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleComplete}
                                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                disabled={completeJobCardMutation.isPending}
                              >
                                {t('manufacturing.complete', 'إكمال')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.progress', 'التقدم')}
                    </span>
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{completionPercentage}%</div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-2">
                    {jobCard.completedQty} / {jobCard.forQuantity}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.timeSpent', 'الوقت المستغرق')}
                    </span>
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {totalTimeSpent}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {t('manufacturing.minutes', 'دقيقة')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('manufacturing.efficiency', 'الكفاءة')}
                    </span>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {jobCard.timeInMins && totalTimeSpent > 0
                      ? Math.round((jobCard.timeInMins / totalTimeSpent) * 100)
                      : '-'}
                    {jobCard.timeInMins && totalTimeSpent > 0 ? '%' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {t('manufacturing.planned', 'المخطط')}: {jobCard.timeInMins || '-'} {t('manufacturing.minutes', 'دقيقة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('manufacturing.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="timeLogs" className="rounded-lg">
                      <Clock className="w-4 h-4 ml-2" />
                      {t('manufacturing.timeLogs', 'سجلات الوقت')}
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-lg">
                      <Package className="w-4 h-4 ml-2" />
                      {t('manufacturing.materials', 'المواد')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-4">{t('manufacturing.jobCardDetails', 'تفاصيل بطاقة العمل')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.status', 'الحالة')}</span>
                              <span>{getStatusBadge(jobCard.status)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.workOrder', 'أمر العمل')}</span>
                              <span className="font-mono text-sm">{jobCard.workOrderNumber || jobCard.workOrderId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.operation', 'العملية')}</span>
                              <span className="font-medium">{jobCard.operation}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.workstation', 'محطة العمل')}</span>
                              <span className="font-medium">{jobCard.workstation || '-'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.item', 'الصنف')}</span>
                              <span className="font-medium">{jobCard.itemName || jobCard.itemCode}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.targetQuantity', 'الكمية المستهدفة')}</span>
                              <span className="font-medium">{jobCard.forQuantity}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('manufacturing.completedQty', 'الكمية المكتملة')}</span>
                              <span className="font-medium text-emerald-600">{jobCard.completedQty}</span>
                            </div>
                            {jobCard.employee && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.employee', 'الموظف')}</span>
                                <span className="font-medium">{jobCard.employeeName || jobCard.employee}</span>
                              </div>
                            )}
                            {jobCard.startedTime && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.startedTime', 'وقت البدء')}</span>
                                <span className="text-sm">{formatDate(jobCard.startedTime)}</span>
                              </div>
                            )}
                            {jobCard.completedTime && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.completedTime', 'وقت الإكمال')}</span>
                                <span className="text-sm">{formatDate(jobCard.completedTime)}</span>
                              </div>
                            )}
                            {jobCard.timeInMins && (
                              <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">{t('manufacturing.plannedTime', 'الوقت المخطط')}</span>
                                <span className="font-medium">{jobCard.timeInMins} {t('manufacturing.minutes', 'دقيقة')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {jobCard.remarks && (
                        <div>
                          <h3 className="font-medium mb-2">{t('manufacturing.remarks', 'ملاحظات')}</h3>
                          <Card className="rounded-xl bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm">{jobCard.remarks}</p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Time Logs Tab */}
                  <TabsContent value="timeLogs" className="mt-0">
                    {!jobCard.timeLogs || jobCard.timeLogs.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('manufacturing.noTimeLogs', 'لا توجد سجلات وقت')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('manufacturing.fromTime', 'من الوقت')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.toTime', 'إلى الوقت')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.duration', 'المدة')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.completedQty', 'الكمية المكتملة')}</TableHead>
                            <TableHead className="text-right">{t('manufacturing.remarks', 'ملاحظات')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobCard.timeLogs.map((log, index) => {
                            const duration = calculateDuration(log.fromTime, log.toTime)
                            return (
                              <TableRow key={index}>
                                <TableCell className="text-sm">{formatDate(log.fromTime)}</TableCell>
                                <TableCell className="text-sm">{formatDate(log.toTime)}</TableCell>
                                <TableCell className="font-medium">
                                  {duration} {t('manufacturing.minutes', 'دقيقة')}
                                </TableCell>
                                <TableCell className="text-emerald-600">{log.completedQty}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {log.remarks || '-'}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Materials Tab */}
                  <TabsContent value="materials" className="mt-0">
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {t('manufacturing.noMaterialsConsumed', 'لا توجد مواد مستهلكة')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('manufacturing.materialsConsumedDesc', 'سيتم عرض المواد المستهلكة أثناء هذه العملية هنا')}
                      </p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <ManufacturingSidebar />
        </div>
      </Main>
    </>
  )
}
