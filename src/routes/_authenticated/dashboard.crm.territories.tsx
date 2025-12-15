import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MapPin,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Mock data for territories based on Saudi Arabia regions
const mockTerritories = [
  {
    id: '1',
    name: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    parentId: null,
    territoryManager: 'أحمد محمد',
    targetAmount: 10000000,
    achievedAmount: 7500000,
    leadsCount: 450,
    clientsCount: 120,
    children: [
      {
        id: '2',
        name: 'المنطقة الوسطى',
        nameEn: 'Central Region',
        parentId: '1',
        territoryManager: 'محمد علي',
        targetAmount: 4000000,
        achievedAmount: 3200000,
        leadsCount: 180,
        clientsCount: 48,
        children: [
          {
            id: '3',
            name: 'الرياض',
            nameEn: 'Riyadh',
            parentId: '2',
            territoryManager: 'خالد سعود',
            targetAmount: 3000000,
            achievedAmount: 2500000,
            leadsCount: 150,
            clientsCount: 40,
            children: [],
          },
          {
            id: '4',
            name: 'القصيم',
            nameEn: 'Qassim',
            parentId: '2',
            territoryManager: 'عبدالله فهد',
            targetAmount: 500000,
            achievedAmount: 400000,
            leadsCount: 20,
            clientsCount: 5,
            children: [],
          },
          {
            id: '5',
            name: 'حائل',
            nameEn: 'Hail',
            parentId: '2',
            territoryManager: 'سلطان محمد',
            targetAmount: 500000,
            achievedAmount: 300000,
            leadsCount: 10,
            clientsCount: 3,
            children: [],
          },
        ],
      },
      {
        id: '6',
        name: 'المنطقة الغربية',
        nameEn: 'Western Region',
        parentId: '1',
        territoryManager: 'فيصل أحمد',
        targetAmount: 3000000,
        achievedAmount: 2200000,
        leadsCount: 140,
        clientsCount: 38,
        children: [
          {
            id: '7',
            name: 'جدة',
            nameEn: 'Jeddah',
            parentId: '6',
            territoryManager: 'عمر حسن',
            targetAmount: 2000000,
            achievedAmount: 1600000,
            leadsCount: 100,
            clientsCount: 28,
            children: [],
          },
          {
            id: '8',
            name: 'مكة المكرمة',
            nameEn: 'Makkah',
            parentId: '6',
            territoryManager: 'ياسر عبدالرحمن',
            targetAmount: 500000,
            achievedAmount: 400000,
            leadsCount: 25,
            clientsCount: 7,
            children: [],
          },
          {
            id: '9',
            name: 'المدينة المنورة',
            nameEn: 'Madinah',
            parentId: '6',
            territoryManager: 'نايف سعد',
            targetAmount: 500000,
            achievedAmount: 200000,
            leadsCount: 15,
            clientsCount: 3,
            children: [],
          },
        ],
      },
      {
        id: '10',
        name: 'المنطقة الشرقية',
        nameEn: 'Eastern Region',
        parentId: '1',
        territoryManager: 'بندر عبدالله',
        targetAmount: 3000000,
        achievedAmount: 2100000,
        leadsCount: 130,
        clientsCount: 34,
        children: [
          {
            id: '11',
            name: 'الدمام',
            nameEn: 'Dammam',
            parentId: '10',
            territoryManager: 'سامي خالد',
            targetAmount: 1500000,
            achievedAmount: 1200000,
            leadsCount: 70,
            clientsCount: 20,
            children: [],
          },
          {
            id: '12',
            name: 'الخبر',
            nameEn: 'Khobar',
            parentId: '10',
            territoryManager: 'مشعل فهد',
            targetAmount: 1000000,
            achievedAmount: 700000,
            leadsCount: 40,
            clientsCount: 10,
            children: [],
          },
          {
            id: '13',
            name: 'الأحساء',
            nameEn: 'Al-Ahsa',
            parentId: '10',
            territoryManager: 'تركي سلمان',
            targetAmount: 500000,
            achievedAmount: 200000,
            leadsCount: 20,
            clientsCount: 4,
            children: [],
          },
        ],
      },
    ],
  },
]

interface TerritoryNodeProps {
  territory: (typeof mockTerritories)[0]
  level?: number
  isExpanded?: boolean
  onToggle?: () => void
}

function TerritoryNode({ territory, level = 0, isExpanded = true, onToggle }: TerritoryNodeProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [expanded, setExpanded] = useState(isExpanded)
  const hasChildren = territory.children && territory.children.length > 0

  const progressPercentage = Math.round((territory.achievedAmount / territory.targetAmount) * 100)

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors',
          level > 0 && 'border-s-2 border-muted ms-4'
        )}
        style={{ paddingInlineStart: `${level * 16 + 12}px` }}
      >
        {hasChildren ? (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        ) : (
          <div className='w-6' />
        )}

        <MapPin className='h-4 w-4 text-muted-foreground' />

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='font-medium truncate'>{territory.name}</span>
            <span className='text-xs text-muted-foreground'>({territory.nameEn})</span>
          </div>
          <div className='flex items-center gap-4 text-xs text-muted-foreground mt-1'>
            <span className='flex items-center gap-1'>
              <Users className='h-3 w-3' />
              {territory.territoryManager}
            </span>
            <span className='flex items-center gap-1'>
              <Building2 className='h-3 w-3' />
              {territory.clientsCount} عميل
            </span>
            <span className='flex items-center gap-1'>
              <Target className='h-3 w-3' />
              {territory.leadsCount} عميل محتمل
            </span>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-end min-w-[120px]'>
            <div className='text-sm font-medium'>
              {territory.achievedAmount.toLocaleString('ar-SA')} ر.س
            </div>
            <div className='text-xs text-muted-foreground'>
              من {territory.targetAmount.toLocaleString('ar-SA')} ر.س
            </div>
          </div>

          <Badge
            variant={progressPercentage >= 80 ? 'default' : progressPercentage >= 50 ? 'secondary' : 'destructive'}
          >
            {progressPercentage}%
          </Badge>

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
              <DropdownMenuItem>
                <Plus className='h-4 w-4 me-2' />
                إضافة منطقة فرعية
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>
                <Trash2 className='h-4 w-4 me-2' />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className='mt-1'>
          {territory.children.map((child) => (
            <TerritoryNode key={child.id} territory={child as any} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function TerritoriesPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

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
              {t('crm.territories.title', 'المناطق الجغرافية')}
            </h1>
            <p className='text-muted-foreground'>
              {t('crm.territories.description', 'إدارة المناطق الجغرافية والأهداف البيعية')}
            </p>
          </div>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            {t('crm.territories.newTerritory', 'منطقة جديدة')}
          </Button>
        </div>

        {/* Stats */}
        <div className='grid gap-4 md:grid-cols-4 mb-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.territories.stats.totalTerritories', 'إجمالي المناطق')}
              </CardTitle>
              <MapPin className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>13</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.territories.stats.totalTarget', 'الهدف الإجمالي')}
              </CardTitle>
              <Target className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>10M ر.س</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.territories.stats.achieved', 'المحقق')}
              </CardTitle>
              <Target className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>7.5M ر.س</div>
              <p className='text-xs text-muted-foreground'>75% من الهدف</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {t('crm.territories.stats.totalLeads', 'العملاء المحتملين')}
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>450</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className='flex gap-4 mb-6'>
          <div className='relative flex-1'>
            <Search className='absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder={t('crm.territories.search', 'بحث في المناطق...')}
              className='ps-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Territory Tree */}
        <Card>
          <CardHeader>
            <CardTitle>{t('crm.territories.hierarchyTitle', 'التسلسل الهرمي للمناطق')}</CardTitle>
            <CardDescription>
              {t('crm.territories.hierarchyDescription', 'عرض شجري للمناطق الجغرافية مع الأهداف والإنجازات')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockTerritories.map((territory) => (
              <TerritoryNode key={territory.id} territory={territory} />
            ))}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/dashboard/crm/territories')({
  component: TerritoriesPage,
})
