import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  UserCheck,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Target,
  DollarSign,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Award,
  Phone,
  Mail,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data for sales persons
const mockSalesPersons = [
  {
    id: '1',
    name: 'محمد أحمد السعدي',
    nameEn: 'Mohammed Ahmed',
    email: 'mohammed@lawfirm.sa',
    phone: '+966 55 123 4567',
    image: null,
    parentId: null,
    territory: 'المنطقة الوسطى',
    commissionRate: 5,
    targetAmount: 2000000,
    achievedAmount: 1650000,
    leadsAssigned: 45,
    leadsConverted: 18,
    casesWon: 15,
    casesLost: 3,
    totalCommission: 82500,
    rank: 1,
    isActive: true,
    subordinates: [
      {
        id: '2',
        name: 'خالد سعود العتيبي',
        nameEn: 'Khalid Saud',
        email: 'khalid@lawfirm.sa',
        phone: '+966 55 234 5678',
        image: null,
        parentId: '1',
        territory: 'الرياض',
        commissionRate: 4,
        targetAmount: 1000000,
        achievedAmount: 720000,
        leadsAssigned: 25,
        leadsConverted: 10,
        casesWon: 8,
        casesLost: 2,
        totalCommission: 28800,
        rank: 3,
        isActive: true,
        subordinates: [],
      },
      {
        id: '3',
        name: 'عبدالله فهد المالكي',
        nameEn: 'Abdullah Fahad',
        email: 'abdullah@lawfirm.sa',
        phone: '+966 55 345 6789',
        image: null,
        parentId: '1',
        territory: 'القصيم',
        commissionRate: 4,
        targetAmount: 500000,
        achievedAmount: 380000,
        leadsAssigned: 15,
        leadsConverted: 6,
        casesWon: 5,
        casesLost: 1,
        totalCommission: 15200,
        rank: 5,
        isActive: true,
        subordinates: [],
      },
    ],
  },
  {
    id: '4',
    name: 'فاطمة علي الشمري',
    nameEn: 'Fatima Ali',
    email: 'fatima@lawfirm.sa',
    phone: '+966 55 456 7890',
    image: null,
    parentId: null,
    territory: 'المنطقة الغربية',
    commissionRate: 5,
    targetAmount: 1500000,
    achievedAmount: 1380000,
    leadsAssigned: 38,
    leadsConverted: 16,
    casesWon: 14,
    casesLost: 2,
    totalCommission: 69000,
    rank: 2,
    isActive: true,
    subordinates: [
      {
        id: '5',
        name: 'عمر حسن الغامدي',
        nameEn: 'Omar Hassan',
        email: 'omar@lawfirm.sa',
        phone: '+966 55 567 8901',
        image: null,
        parentId: '4',
        territory: 'جدة',
        commissionRate: 4,
        targetAmount: 800000,
        achievedAmount: 640000,
        leadsAssigned: 20,
        leadsConverted: 8,
        casesWon: 7,
        casesLost: 1,
        totalCommission: 25600,
        rank: 4,
        isActive: true,
        subordinates: [],
      },
    ],
  },
  {
    id: '6',
    name: 'سارة محمد القحطاني',
    nameEn: 'Sara Mohammed',
    email: 'sara@lawfirm.sa',
    phone: '+966 55 678 9012',
    image: null,
    parentId: null,
    territory: 'المنطقة الشرقية',
    commissionRate: 5,
    targetAmount: 1200000,
    achievedAmount: 850000,
    leadsAssigned: 30,
    leadsConverted: 12,
    casesWon: 10,
    casesLost: 2,
    totalCommission: 42500,
    rank: 6,
    isActive: true,
    subordinates: [],
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
}

function SalesPersonsPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'table' | 'cards'>('table')

  // Flatten for table view
  const flattenedSalesPersons = mockSalesPersons.flatMap((sp) => [sp, ...sp.subordinates])

  const filteredSalesPersons = flattenedSalesPersons.filter(
    (sp) =>
      sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.territory.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate totals
  const totalTarget = flattenedSalesPersons.reduce((sum, sp) => sum + sp.targetAmount, 0)
  const totalAchieved = flattenedSalesPersons.reduce((sum, sp) => sum + sp.achievedAmount, 0)
  const totalCommission = flattenedSalesPersons.reduce((sum, sp) => sum + sp.totalCommission, 0)
  const totalLeads = flattenedSalesPersons.reduce((sum, sp) => sum + sp.leadsAssigned, 0)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='p-6 lg:p-8'>
        {/* Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('crm.salesPersons.title', 'فريق المبيعات')}
            </h1>
            <p className='text-muted-foreground'>
              {t('crm.salesPersons.description', 'إدارة فريق المبيعات والعمولات والأهداف')}
            </p>
          </div>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            {t('crm.salesPersons.newSalesPerson', 'إضافة موظف مبيعات')}
          </Button>
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.salesPersons.stats.totalTeam', 'حجم الفريق')}
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{flattenedSalesPersons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.salesPersons.stats.totalTarget', 'الهدف الإجمالي')}
              </CardTitle>
              <Target className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(totalTarget / 1000000).toFixed(1)}M ر.س
              </div>
              <Progress
                value={(totalAchieved / totalTarget) * 100}
                className='mt-2 h-1'
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.salesPersons.stats.totalCommission', 'إجمالي العمولات')}
              </CardTitle>
              <DollarSign className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalCommission.toLocaleString('ar-SA')} ر.س
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.salesPersons.stats.totalLeads', 'العملاء المحتملين')}
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{totalLeads}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className='flex gap-4 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={t('crm.salesPersons.search', 'بحث في فريق المبيعات...')}
              className='ps-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'cards')}>
            <TabsList>
              <TabsTrigger value='table'>جدول</TabsTrigger>
              <TabsTrigger value='cards'>بطاقات</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table View */}
        {view === 'table' && (
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('crm.salesPersons.table.name', 'الاسم')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.territory', 'المنطقة')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.target', 'الهدف')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.achieved', 'المحقق')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.progress', 'التقدم')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.leads', 'العملاء')}</TableHead>
                    <TableHead>{t('crm.salesPersons.table.commission', 'العمولة')}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesPersons
                    .sort((a, b) => a.rank - b.rank)
                    .map((sp, index) => {
                      const progress = Math.round((sp.achievedAmount / sp.targetAmount) * 100)
                      return (
                        <TableRow key={sp.id}>
                          <TableCell>
                            {sp.rank <= 3 && (
                              <Badge
                                variant={sp.rank === 1 ? 'default' : 'secondary'}
                                className={
                                  sp.rank === 1
                                    ? 'bg-yellow-500'
                                    : sp.rank === 2
                                      ? 'bg-gray-400'
                                      : 'bg-amber-600'
                                }
                              >
                                <Award className='h-3 w-3 me-1' />
                                {sp.rank}
                              </Badge>
                            )}
                            {sp.rank > 3 && <span className='text-muted-foreground'>{sp.rank}</span>}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage src={sp.image || undefined} />
                                <AvatarFallback>{getInitials(sp.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className='font-medium'>{sp.name}</div>
                                <div className='text-xs text-muted-foreground'>{sp.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{sp.territory}</TableCell>
                          <TableCell>{sp.targetAmount.toLocaleString('ar-SA')} ر.س</TableCell>
                          <TableCell>{sp.achievedAmount.toLocaleString('ar-SA')} ر.س</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Progress value={progress} className='h-2 w-20' />
                              <span className='text-xs'>{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm'>
                              <span className='text-green-600'>{sp.leadsConverted}</span>
                              <span className='text-muted-foreground'> / {sp.leadsAssigned}</span>
                            </div>
                          </TableCell>
                          <TableCell className='font-medium text-green-600'>
                            {sp.totalCommission.toLocaleString('ar-SA')} ر.س
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-8 w-8'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem>
                                  <Eye className='h-4 w-4 me-2' />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className='h-4 w-4 me-2' />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='text-destructive'>
                                  <Trash2 className='h-4 w-4 me-2' />
                                  حذف
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
        )}

        {/* Cards View */}
        {view === 'cards' && (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredSalesPersons
              .sort((a, b) => a.rank - b.rank)
              .map((sp) => {
                const progress = Math.round((sp.achievedAmount / sp.targetAmount) * 100)
                return (
                  <Card key={sp.id}>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-12 w-12'>
                            <AvatarImage src={sp.image || undefined} />
                            <AvatarFallback>{getInitials(sp.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className='text-base'>{sp.name}</CardTitle>
                            <CardDescription>{sp.territory}</CardDescription>
                          </div>
                        </div>
                        {sp.rank <= 3 && (
                          <Badge
                            className={
                              sp.rank === 1
                                ? 'bg-yellow-500'
                                : sp.rank === 2
                                  ? 'bg-gray-400'
                                  : 'bg-amber-600'
                            }
                          >
                            <Award className='h-3 w-3 me-1' />
                            #{sp.rank}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Mail className='h-3 w-3' />
                          {sp.email}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-sm text-muted-foreground' dir='ltr'>
                        <Phone className='h-3 w-3' />
                        {sp.phone}
                      </div>

                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>الهدف</span>
                          <span className='font-medium'>{sp.targetAmount.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                        <Progress value={progress} />
                        <div className='flex justify-between text-xs text-muted-foreground'>
                          <span>المحقق: {sp.achievedAmount.toLocaleString('ar-SA')} ر.س</span>
                          <span>{progress}%</span>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 pt-2 border-t'>
                        <div>
                          <div className='text-xs text-muted-foreground'>التحويلات</div>
                          <div className='text-lg font-semibold'>
                            <span className='text-green-600'>{sp.leadsConverted}</span>
                            <span className='text-muted-foreground text-sm'> / {sp.leadsAssigned}</span>
                          </div>
                        </div>
                        <div>
                          <div className='text-xs text-muted-foreground'>العمولة</div>
                          <div className='text-lg font-semibold text-green-600'>
                            {sp.totalCommission.toLocaleString('ar-SA')} ر.س
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/crm/sales-persons')({
  component: SalesPersonsPage,
})
