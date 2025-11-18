import { useState } from 'react'
import { Search, Filter, Calendar, Clock, Scale, Plus, Eye, Edit, AlertCircle, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'

interface Case {
  id: string
  plaintiff: string
  defendant: string
  nextHearingDate: string
  nextHearingTime: string
  nextHearingHijri: string
  hearingType: string
  nextEvent: string
  nextTask: string
  nextTaskDue: string
  status: string
  statusColor: string
  statusUpdate: string
  court: string
  lawyer: string
  daysUntil?: number
}

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyMyCases, setShowOnlyMyCases] = useState(false)

  const todayCases: Case[] = [
    {
      id: '4772077905',
      plaintiff: 'مشاري بن ناهد الرابح',
      defendant: 'المصنع السعودي للمنتجات المعدنية',
      nextHearingDate: '17 نوفمبر 2025',
      nextHearingTime: '10:35 صباحاً',
      nextHearingHijri: '١٤٤٧/٠٥/٢٦',
      hearingType: 'جلسة مرافعة',
      nextEvent: 'اجتماع مع العميل',
      nextTask: 'تحضير المستندات',
      nextTaskDue: '25 نوفمبر',
      status: 'قيد النظر',
      statusColor: 'bg-blue-500',
      statusUpdate: 'تم الإنشاء في 13 نوفمبر، 6:03 صباحاً',
      court: 'المحكمة العمالية - الرياض',
      lawyer: 'أحمد المحامي'
    }
  ]

  const ongoingCases: Case[] = [
    {
      id: '4772100238',
      plaintiff: 'خالد بن عبدالرحمن القحطاني',
      defendant: 'شركة التقنية المتقدمة',
      nextHearingDate: '25 نوفمبر 2025',
      nextHearingTime: '11:00 صباحاً',
      nextHearingHijri: '١٤٤٧/٠٥/٢٤',
      hearingType: 'جلسة مرافعة',
      nextEvent: 'جلسة شهود',
      nextTask: 'جمع الشهادات',
      nextTaskDue: '23 نوفمبر',
      status: 'قيد النظر',
      statusColor: 'bg-blue-500',
      statusUpdate: 'تم التحديث في 10 نوفمبر، 3:15 مساءً',
      court: 'المحكمة العمالية - الدمام',
      lawyer: 'أحمد المحامي',
      daysUntil: 8
    }
  ]

  const currentCases = activeTab === 'today' ? todayCases : ongoingCases

  const totalCases = todayCases.length + ongoingCases.length
  const todayHearings = todayCases.length
  const urgentCases = ongoingCases.filter(c => c.daysUntil !== undefined && c.daysUntil <= 5).length

  return (
    <>
      <Header>
        <div className='flex items-center gap-6 flex-1'>
          <h1 className="text-xl font-bold">القضايا</h1>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في القضايا..."
              className="w-80 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            تصفية
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            قضية جديدة
          </Button>
          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main dir="rtl">
        <div className="mb-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Total Cases */}
            <Card className="bg-gradient-to-br from-muted to-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Scale className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">إجمالي</Badge>
                </div>
                <div className="text-3xl font-bold mb-1">{totalCases}</div>
                <div className="text-xs text-muted-foreground">إجمالي القضايا</div>
              </CardContent>
            </Card>

            {/* Today's Hearings */}
            <Card className="bg-gradient-to-br from-green-50 to-card dark:from-green-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-700 dark:text-green-400" />
                  </div>
                  <Badge className="bg-green-600 text-xs">اليوم</Badge>
                </div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">{todayHearings}</div>
                <div className="text-xs text-green-700 dark:text-green-400">جلسات اليوم</div>
              </CardContent>
            </Card>

            {/* Urgent Cases */}
            <Card className="bg-gradient-to-br from-red-50 to-card dark:from-red-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
                  </div>
                  <Badge variant="destructive" className="text-xs">عاجل</Badge>
                </div>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">{urgentCases}</div>
                <div className="text-xs text-red-700 dark:text-red-400">خلال 5 أيام</div>
              </CardContent>
            </Card>

            {/* Ongoing Cases */}
            <Card className="bg-gradient-to-br from-blue-50 to-card dark:from-blue-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <Badge className="bg-blue-600 text-xs">نشط</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{ongoingCases.length}</div>
                <div className="text-xs text-blue-700 dark:text-blue-400">القضايا الجارية</div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Analytics */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">توزيع الحالات</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">قيد النظر</span>
                      <span className="text-xs font-bold">
                        {currentCases.filter(c => c.status === 'قيد النظر').length}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{width: `${(currentCases.filter(c => c.status === 'قيد النظر').length / currentCases.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Timeline */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">الجدول الزمني</h3>
                <div className="space-y-3">
                  {ongoingCases.filter(c => c.daysUntil !== undefined).slice(0, 3).map((case_, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-muted flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold">{case_.daysUntil}</div>
                          <div className="text-[8px] text-muted-foreground">يوم</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{case_.plaintiff}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{case_.court}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lawyer Workload */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-4">توزيع القضايا</h3>
                <div className="space-y-3">
                  {Object.entries(
                    [...todayCases, ...ongoingCases].reduce((acc: Record<string, number>, case_) => {
                      acc[case_.lawyer] = (acc[case_.lawyer] || 0) + 1
                      return acc
                    }, {})
                  ).map(([lawyer, count], idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-muted flex items-center justify-center">
                        <span className="text-xs font-bold">{count}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium">{lawyer}</div>
                        <div className="text-[10px] text-muted-foreground">{count} قضية</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-card rounded-lg border mb-6">
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'today' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('today')}
                className="rounded-full"
              >
                جلسات اليوم ({todayCases.length})
              </Button>
              <Button
                variant={activeTab === 'ongoing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('ongoing')}
                className="rounded-full"
              >
                القضايا الجارية ({ongoingCases.length})
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-muted border-b">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">نوع القضية</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="labor">عمالية</SelectItem>
                    <SelectItem value="commercial">تجارية</SelectItem>
                    <SelectItem value="civil">مدنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">المحامي المسؤول</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="ahmed">أحمد المحامي</SelectItem>
                    <SelectItem value="sara">سارة المحامية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block text-right">الحالة</label>
                <Select>
                  <SelectTrigger className="w-full text-right" dir="rtl">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="review">قيد النظر</SelectItem>
                    <SelectItem value="closed">مغلقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyMyCases}
                    onChange={(e) => setShowOnlyMyCases(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">قضاياي فقط</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button size="sm">تطبيق</Button>
              <Button size="sm" variant="outline">مسح</Button>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground w-[100px]">رقم القضية</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground min-w-[180px]">المدعي</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground min-w-[200px]">المدعى عليه</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">التاريخ والوقت</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">نوع الجلسة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground w-[100px]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCases.map((case_) => (
                    <tr
                      key={case_.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">{case_.id}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-right">{case_.plaintiff}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-right">{case_.defendant}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-sm font-medium">{case_.nextHearingDate}</span>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-sm text-muted-foreground">{case_.nextHearingTime}</span>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="text-xs text-muted-foreground">{case_.nextHearingHijri} هـ</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">{case_.hearingType}</div>
                          <div className="text-xs text-muted-foreground">{case_.court}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Badge className={case_.statusColor}>{case_.status}</Badge>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
      </Main>
    </>
  )
}
