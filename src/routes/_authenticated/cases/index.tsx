import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  FileText,
  Scale,
  CheckCircle,
  XCircle,
  Handshake,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_authenticated/cases/')({
  component: CasesDashboard,
})

function CasesDashboard() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // TODO: Replace with real API data
  const cases = [
    {
      id: 'CASE-2025-001',
      title: 'قضية عمالية - مستحقات نهاية خدمة',
      clientName: 'مشاري الرابح',
      category: 'عمالي',
      court: 'محكمة العمل بالرياض',
      status: 'active',
      outcome: 'ongoing',
      startDate: '15 نوفمبر 2025',
      nextHearing: '25 نوفمبر 2025',
      caseNumber: 'LC-2025-12345',
      source: 'platform',
    },
    {
      id: 'CASE-2025-002',
      title: 'نزاع تجاري - عقد توريد',
      clientName: 'سارة المطيري',
      category: 'تجاري',
      court: 'المحكمة التجارية',
      status: 'active',
      outcome: 'ongoing',
      startDate: '10 نوفمبر 2025',
      nextHearing: '20 نوفمبر 2025',
      caseNumber: 'CC-2025-67890',
      source: 'external',
    },
    {
      id: 'CASE-2025-003',
      title: 'قضية عقارية',
      clientName: 'خالد الشمري',
      category: 'عقارات',
      court: 'محكمة التنفيذ',
      status: 'completed',
      outcome: 'won',
      startDate: '01 أكتوبر 2025',
      nextHearing: null,
      caseNumber: 'RE-2025-11111',
      source: 'platform',
    },
  ]

  const filteredCases = cases.filter((c) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return c.status === 'active'
    if (activeTab === 'completed') return c.status === 'completed'
    if (activeTab === 'won') return c.outcome === 'won'
    if (activeTab === 'lost') return c.outcome === 'lost'
    if (activeTab === 'settled') return c.outcome === 'settled'
    return true
  })

  const activeCases = cases.filter((c) => c.status === 'active').length
  const completedCases = cases.filter((c) => c.status === 'completed').length
  const wonCases = cases.filter((c) => c.outcome === 'won').length
  const lostCases = cases.filter((c) => c.outcome === 'lost').length

  const getStatusBadge = (status: string, outcome: string) => {
    if (status === 'completed') {
      switch (outcome) {
        case 'won':
          return (
            <Badge className='bg-green-500'>
              {isRTL ? 'كسب القضية' : 'Won'}
            </Badge>
          )
        case 'lost':
          return (
            <Badge className='bg-red-500'>
              {isRTL ? 'خسارة القضية' : 'Lost'}
            </Badge>
          )
        case 'settled':
          return (
            <Badge className='bg-blue-500'>
              {isRTL ? 'تسوية' : 'Settled'}
            </Badge>
          )
      }
    }

    switch (status) {
      case 'active':
        return (
          <Badge className='bg-yellow-500'>
            {isRTL ? 'نشطة' : 'Active'}
          </Badge>
        )
      case 'on-hold':
        return (
          <Badge className='bg-gray-500'>
            {isRTL ? 'معلقة' : 'On Hold'}
          </Badge>
        )
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'عمالي':
      case 'labor':
        return <FileText className='h-4 w-4' />
      case 'تجاري':
      case 'commercial':
        return <Scale className='h-4 w-4' />
      default:
        return <FileText className='h-4 w-4' />
    }
  }

  return (
    <div className='min-h-screen'>
      {/* Top Header */}
      <div className='border-b bg-background px-6 py-4'>
        <div className='mx-auto flex max-w-[1800px] items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>
              {isRTL ? 'القضايا' : 'Cases'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isRTL ? 'إدارة ومتابعة جميع القضايا القانونية' : 'Manage and track all legal cases'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='outline'>
              <FileText className='me-2 h-4 w-4' />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
            <Button>
              <Plus className='me-2 h-4 w-4' />
              {isRTL ? 'قضية جديدة' : 'New Case'}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-[1800px] p-6'>
        {/* Summary Cards */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900'>
                  <Clock className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
                </div>
                <Badge className='bg-yellow-500'>{isRTL ? 'نشطة' : 'Active'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{activeCases}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'قضايا نشطة' : 'Active cases'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-background dark:from-green-950/20'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
                  <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <Badge className='bg-green-500'>{isRTL ? 'كسب' : 'Won'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{wonCases}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'قضايا مكتسبة' : 'Won cases'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                  <Handshake className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'منتهية' : 'Completed'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{completedCases}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'قضايا منتهية' : 'Completed cases'}
              </div>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-muted/50 to-background'>
            <CardContent className='p-6'>
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900'>
                  <Scale className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <Badge variant='outline'>{isRTL ? 'الإجمالي' : 'Total'}</Badge>
              </div>
              <div className='mb-1 text-3xl font-bold'>{cases.length}</div>
              <div className='text-xs text-muted-foreground'>
                {isRTL ? 'إجمالي القضايا' : 'Total cases'}
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
                {isRTL ? 'الكل' : 'All'} ({cases.length})
              </Button>
              <Button
                variant={activeTab === 'active' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('active')}
              >
                {isRTL ? 'نشطة' : 'Active'} ({activeCases})
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('completed')}
              >
                {isRTL ? 'منتهية' : 'Completed'} ({completedCases})
              </Button>
              <Button
                variant={activeTab === 'won' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveTab('won')}
              >
                {isRTL ? 'مكتسبة' : 'Won'} ({wonCases})
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder={isRTL ? 'بحث في القضايا...' : 'Search cases...'}
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

        {/* Cases Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='border-b bg-muted/50'>
                  <tr>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'رقم القضية' : 'Case #'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'العنوان' : 'Title'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'العميل' : 'Client'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'المحكمة' : 'Court'}
                    </th>
                    <th className='px-6 py-3 text-start text-xs font-semibold'>
                      {isRTL ? 'الجلسة القادمة' : 'Next Hearing'}
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
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem.id} className='border-b hover:bg-muted/50'>
                      <td className='px-6 py-4'>
                        <div className='font-mono text-sm font-semibold'>{caseItem.caseNumber}</div>
                        <div className='text-xs text-muted-foreground'>{caseItem.id}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-muted'>
                            {getCategoryIcon(caseItem.category)}
                          </div>
                          <div>
                            <div className='text-sm font-semibold'>{caseItem.title}</div>
                            <div className='text-xs text-muted-foreground'>{caseItem.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{caseItem.clientName}</div>
                        <div className='text-xs text-muted-foreground'>
                          {caseItem.source === 'platform' ? (isRTL ? 'من المنصة' : 'Platform') : (isRTL ? 'خارجي' : 'External')}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm'>{caseItem.court}</div>
                      </td>
                      <td className='px-6 py-4'>
                        {caseItem.nextHearing ? (
                          <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-muted-foreground' />
                            <div className='text-sm'>{caseItem.nextHearing}</div>
                          </div>
                        ) : (
                          <div className='text-xs text-muted-foreground'>
                            {isRTL ? 'لا توجد جلسات' : 'No hearings'}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        {getStatusBadge(caseItem.status, caseItem.outcome)}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-1'>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <Edit className='h-4 w-4' />
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
              ? `عرض ${filteredCases.length} من ${cases.length} قضية`
              : `Showing ${filteredCases.length} of ${cases.length} cases`}
          </div>
        </div>
      </div>
    </div>
  )
}
