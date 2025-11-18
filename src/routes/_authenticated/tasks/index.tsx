import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  Circle,
  PlayCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Tag,
  Edit,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/tasks/')({
  component: TasksDashboard,
})

function TasksDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const tasks = [
    {
      id: 'TSK-001',
      title: 'مراجعة مسودة العقد',
      description: 'مراجعة العقد التجاري للعميل مشاري الرابح',
      priority: 'high',
      status: 'in-progress',
      dueDate: '20 نوفمبر 2025',
      assignedTo: 'أحمد السالم',
      caseNumber: 'CASE-2025-001',
      tags: ['عقود', 'عاجل'],
      recurring: false,
    },
    {
      id: 'TSK-002',
      title: 'إعداد مذكرة دفاع',
      description: 'إعداد مذكرة الدفاع للقضية العمالية',
      priority: 'high',
      status: 'todo',
      dueDate: '22 نوفمبر 2025',
      assignedTo: 'سارة المحمد',
      caseNumber: 'CASE-2025-002',
      tags: ['مرافعات', 'عمالي'],
      recurring: false,
    },
    {
      id: 'TSK-003',
      title: 'متابعة مع المحكمة',
      description: 'الاستعلام عن موعد الجلسة القادمة',
      priority: 'medium',
      status: 'todo',
      dueDate: '25 نوفمبر 2025',
      assignedTo: 'أحمد السالم',
      caseNumber: 'CASE-2025-001',
      tags: ['متابعة'],
      recurring: true,
    },
    {
      id: 'TSK-004',
      title: 'إرسال الفاتورة للعميل',
      description: 'إرسال فاتورة الأتعاب للعميل خالد الشمري',
      priority: 'low',
      status: 'done',
      dueDate: '15 نوفمبر 2025',
      assignedTo: 'سارة المحمد',
      caseNumber: null,
      tags: ['فوترة'],
      recurring: false,
    },
  ]

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true
    if (activeTab === 'todo') return task.status === 'todo'
    if (activeTab === 'in-progress') return task.status === 'in-progress'
    if (activeTab === 'done') return task.status === 'done'
    if (activeTab === 'high') return task.priority === 'high'
    return true
  })

  const todoTasks = tasks.filter((t) => t.status === 'todo').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high').length

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className='bg-red-500'>
            {isRTL ? 'عالية' : 'High'}
          </Badge>
        )
      case 'medium':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'متوسطة' : 'Medium'}
          </Badge>
        )
      case 'low':
        return (
          <Badge className='bg-green-500'>
            {isRTL ? 'منخفضة' : 'Low'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return (
          <Badge variant='outline' className='border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/20'>
            {isRTL ? 'للقيام بها' : 'To Do'}
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/20'>
            {isRTL ? 'قيد التنفيذ' : 'In Progress'}
          </Badge>
        )
      case 'done':
        return (
          <Badge variant='outline' className='border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20'>
            {isRTL ? 'مكتملة' : 'Done'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle className='h-5 w-5 text-gray-500' />
      case 'in-progress':
        return <PlayCircle className='h-5 w-5 text-blue-500' />
      case 'done':
        return <CheckCircle className='h-5 w-5 text-green-500' />
      default:
        return null
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'المهام' : 'Tasks'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'إدارة ومتابعة المهام والمواعيد' : 'Manage and track tasks and deadlines'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <FileText className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'مهمة جديدة' : 'New Task'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-gray-50 to-background dark:from-gray-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900'>
                  <Circle className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'للقيام بها' : 'To Do'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{todoTasks}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مهام جديدة' : 'New tasks'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <PlayCircle className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge className='bg-blue-500'>{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{inProgressTasks}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مهام نشطة' : 'Active tasks'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge className='bg-green-500'>{isRTL ? 'مكتملة' : 'Done'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{doneTasks}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مهام منجزة' : 'Completed tasks'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-red-50 to-background dark:from-red-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
                  <AlertTriangle className='h-5 w-5 text-red-600 dark:text-red-400' />
                </div>
                <Badge className='bg-red-500'>{isRTL ? 'عاجلة' : 'High Priority'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{highPriorityTasks}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'مهام عاجلة' : 'Urgent tasks'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('all')}
              >
                {isRTL ? 'الكل' : 'All'} ({tasks.length})
              </Button>
              <Button
                variant={activeTab === 'todo' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('todo')}
              >
                {isRTL ? 'للقيام بها' : 'To Do'} ({todoTasks})
              </Button>
              <Button
                variant={activeTab === 'in-progress' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('in-progress')}
              >
                {isRTL ? 'قيد التنفيذ' : 'In Progress'} ({inProgressTasks})
              </Button>
              <Button
                variant={activeTab === 'done' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('done')}
              >
                {isRTL ? 'مكتملة' : 'Done'} ({doneTasks})
              </Button>
              <Button
                variant={activeTab === 'high' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('high')}
              >
                {isRTL ? 'عاجلة' : 'High Priority'} ({highPriorityTasks})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في المهام...' : 'Search tasks...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='ps-10'
                />
              </div>
              <Button variant='outline' size='sm'>
                <Filter className='me-2 h-4 w-4' />
                {isRTL ? 'فلاتر' : 'Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='border-b bg-muted/50'>
                  <tr>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'المهمة' : 'Task'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'القضية' : 'Case'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'المسؤول' : 'Assigned To'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'الموعد' : 'Due Date'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'الأولوية' : 'Priority'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'الحالة' : 'Status'}
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-semibold'>
                      {isRTL ? 'إجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className='border-b hover:bg-muted/50'>
                      <td className='px-6 py-4'>
                        <div className='flex items-start gap-3'>
                          {getStatusIcon(task.status)}
                          <div>
                            <div className='mb-1 font-semibold'>{task.title}</div>
                            <div className='text-xs text-muted-foreground'>{task.description}</div>
                            {task.tags.length > 0 && (
                              <div className='mt-2 flex flex-wrap gap-1'>
                                {task.tags.map((tag, index) => (
                                  <Badge key={index} variant='outline' className='text-xs'>
                                    <Tag className='me-1 h-3 w-3' />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {task.caseNumber ? (
                          <div className='font-mono text-sm'>{task.caseNumber}</div>
                        ) : (
                          <div className='text-xs text-muted-foreground'>
                            {isRTL ? 'لا توجد قضية' : 'No case'}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{task.assignedTo}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <div className='text-sm'>{task.dueDate}</div>
                        </div>
                        {task.recurring && (
                          <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                            <Clock className='h-3 w-3' />
                            {isRTL ? 'متكررة' : 'Recurring'}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        {getStatusBadge(task.status)}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-1'>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Trash2 className='h-4 w-4 text-destructive' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {isRTL
              ? `عرض ${filteredTasks.length} من ${tasks.length} مهمة`
              : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
          </div>
        </div>
      </div>
    </div>
  )
}
