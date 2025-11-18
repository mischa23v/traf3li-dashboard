import { useState } from 'react'
import { Search, Filter, Download, Plus, Eye, Edit, Phone, Mail, Building2, User, Users, TrendingUp, Clock, UserCheck, MapPin, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function ClientsDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample clients data
  const clients = [
    {
      id: 'CLT-001',
      name: 'مشاري بن ناهد الرابح',
      company: 'المصنع السعودي للمنتجات المعدنية',
      email: 'mishari@saudimetal.sa',
      phone: '+966 50 123 4567',
      location: 'الرياض',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '15 يناير 2024',
      activeCases: 3,
      totalCases: 8,
      totalRevenue: 185000,
      lastActivity: 'منذ يومين',
      type: 'شركة',
      rating: 5
    },
    {
      id: 'CLT-002',
      name: 'عبدالله بن سعد الغامدي',
      company: 'شركة البناء الحديثة',
      email: 'abdullah@modernbuild.sa',
      phone: '+966 55 234 5678',
      location: 'جدة',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '22 مارس 2024',
      activeCases: 2,
      totalCases: 5,
      totalRevenue: 142000,
      lastActivity: 'منذ أسبوع',
      type: 'شركة',
      rating: 4
    },
    {
      id: 'CLT-003',
      name: 'فاطمة بنت محمد العتيبي',
      company: 'مستشفى النور الطبي',
      email: 'fatima@alnoor-hospital.sa',
      phone: '+966 50 345 6789',
      location: 'الدمام',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '10 فبراير 2024',
      activeCases: 1,
      totalCases: 6,
      totalRevenue: 198000,
      lastActivity: 'منذ 3 أيام',
      type: 'مؤسسة',
      rating: 5
    },
    {
      id: 'CLT-004',
      name: 'خالد بن عبدالرحمن القحطاني',
      company: 'شركة التقنية المتقدمة',
      email: 'khalid@advtech.sa',
      phone: '+966 55 456 7890',
      location: 'الرياض',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '5 أبريل 2024',
      activeCases: 4,
      totalCases: 7,
      totalRevenue: 225000,
      lastActivity: 'اليوم',
      type: 'شركة',
      rating: 5
    },
    {
      id: 'CLT-005',
      name: 'سارة بنت أحمد المطيري',
      company: 'المجموعة التجارية الكبرى',
      email: 'sarah@tradinggroup.sa',
      phone: '+966 50 567 8901',
      location: 'مكة المكرمة',
      status: 'غير نشط',
      statusColor: 'bg-slate-400',
      joinDate: '18 يناير 2024',
      activeCases: 0,
      totalCases: 4,
      totalRevenue: 95000,
      lastActivity: 'منذ 3 أشهر',
      type: 'شركة',
      rating: 3
    },
    {
      id: 'CLT-006',
      name: 'محمد بن يوسف الدوسري',
      company: 'شركة النقل السريع',
      email: 'mohammed@fastship.sa',
      phone: '+966 55 678 9012',
      location: 'الرياض',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '28 فبراير 2024',
      activeCases: 2,
      totalCases: 3,
      totalRevenue: 110000,
      lastActivity: 'منذ 5 أيام',
      type: 'شركة',
      rating: 4
    },
    {
      id: 'CLT-007',
      name: 'نورة بنت خالد الشمري',
      company: 'مركز التدريب الوطني',
      email: 'noura@nationaltraining.sa',
      phone: '+966 50 789 0123',
      location: 'الخبر',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '12 مارس 2024',
      activeCases: 1,
      totalCases: 5,
      totalRevenue: 135000,
      lastActivity: 'منذ يوم',
      type: 'مركز تدريب',
      rating: 5
    },
    {
      id: 'CLT-008',
      name: 'عمر بن فهد العنزي',
      company: 'الشركة الصناعية المتحدة',
      email: 'omar@unitedindustries.sa',
      phone: '+966 55 890 1234',
      location: 'جدة',
      status: 'جديد',
      statusColor: 'bg-blue-500',
      joinDate: '1 نوفمبر 2024',
      activeCases: 1,
      totalCases: 1,
      totalRevenue: 45000,
      lastActivity: 'اليوم',
      type: 'شركة',
      rating: 0
    },
    {
      id: 'CLT-009',
      name: 'ريم بنت عبدالعزيز السعيد',
      company: 'مؤسسة الاستشارات القانونية',
      email: 'reem@legalconsult.sa',
      phone: '+966 50 901 2345',
      location: 'الرياض',
      status: 'غير نشط',
      statusColor: 'bg-slate-400',
      joinDate: '20 يناير 2024',
      activeCases: 0,
      totalCases: 2,
      totalRevenue: 58000,
      lastActivity: 'منذ شهرين',
      type: 'مؤسسة',
      rating: 4
    },
    {
      id: 'CLT-010',
      name: 'سلطان بن راشد الحربي',
      company: 'شركة العقارات الذهبية',
      email: 'sultan@goldenrealestate.sa',
      phone: '+966 55 012 3456',
      location: 'المدينة المنورة',
      status: 'نشط',
      statusColor: 'bg-green-500',
      joinDate: '8 فبراير 2024',
      activeCases: 3,
      totalCases: 6,
      totalRevenue: 175000,
      lastActivity: 'منذ 4 أيام',
      type: 'شركة',
      rating: 5
    }
  ]

  // Filter clients based on active tab
  const filteredClients = clients.filter(client => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return client.status === 'نشط'
    if (activeTab === 'inactive') return client.status === 'غير نشط'
    if (activeTab === 'new') return client.status === 'جديد'
    return true
  }).filter(client => {
    if (!searchQuery) return true
    return client.name.includes(searchQuery) ||
           client.company.includes(searchQuery) ||
           client.email.includes(searchQuery)
  })

  // Calculate statistics
  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'نشط').length
  const inactiveClients = clients.filter(c => c.status === 'غير نشط').length
  const newClients = clients.filter(c => c.status === 'جديد').length

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const totalActiveCases = clients.reduce((sum, c) => sum + c.activeCases, 0)
  const averageRevenuePerClient = totalRevenue / totalClients

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-slate-900">العملاء</h1>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="بحث عن عميل..."
                className="w-80 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              عميل جديد
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        {/* Modern Dashboard Overview */}
        <div className="mb-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Total Clients */}
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-slate-700" />
                  </div>
                  <Badge variant="outline" className="text-xs">إجمالي</Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{totalClients}</div>
                <div className="text-xs text-slate-600">إجمالي العملاء</div>
              </CardContent>
            </Card>

            {/* Active Clients */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-700" />
                  </div>
                  <Badge className="bg-green-600 text-xs">نشط</Badge>
                </div>
                <div className="text-3xl font-bold text-green-900 mb-1">{activeClients}</div>
                <div className="text-xs text-green-700">العملاء النشطون</div>
              </CardContent>
            </Card>

            {/* New Clients */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-700" />
                  </div>
                  <Badge className="bg-blue-600 text-xs">جديد</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-1">{newClients}</div>
                <div className="text-xs text-blue-700">عملاء جدد هذا الشهر</div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-purple-700" />
                  </div>
                  <Badge className="bg-purple-600 text-xs">إيرادات</Badge>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">{formatCurrency(totalRevenue)}</div>
                <div className="text-xs text-purple-700">إجمالي الإيرادات</div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Analytics */}
          <div className="grid grid-cols-3 gap-4">
            {/* Client Status Distribution */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">توزيع العملاء</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">نشط</span>
                      <span className="text-xs font-bold text-slate-900">{activeClients}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{width: `${(activeClients / totalClients) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">جديد</span>
                      <span className="text-xs font-bold text-slate-900">{newClients}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{width: `${(newClients / totalClients) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-600">غير نشط</span>
                      <span className="text-xs font-bold text-slate-900">{inactiveClients}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-slate-400 h-2 rounded-full"
                        style={{width: `${(inactiveClients / totalClients) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">أبرز العملاء</h3>
                <div className="space-y-3">
                  {clients
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 3)
                    .map((client, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{client.name}</div>
                          <div className="text-xs text-slate-500">{formatCurrency(client.totalRevenue)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Cases */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">القضايا النشطة</h3>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{totalActiveCases}</div>
                  <div className="text-xs text-slate-600">قضية نشطة حالياً</div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-600">متوسط الإيرادات لكل عميل</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(averageRevenuePerClient)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            الكل ({totalClients})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            نشط ({activeClients})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            جديد ({newClients})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inactive'
                ? 'border-slate-600 text-slate-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            غير نشط ({inactiveClients})
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                      <User className="h-6 w-6 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{client.name}</h3>
                      <p className="text-xs text-slate-500">{client.id}</p>
                    </div>
                  </div>
                  <Badge className={`${client.statusColor} text-white text-xs`}>
                    {client.status}
                  </Badge>
                </div>

                {/* Company Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-700">{client.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600">{client.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600 truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600">{client.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">القضايا النشطة</div>
                    <div className="text-lg font-bold text-slate-900">{client.activeCases}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">إجمالي القضايا</div>
                    <div className="text-lg font-bold text-slate-900">{client.totalCases}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-slate-600 mb-1">إجمالي الإيرادات</div>
                    <div className="text-lg font-bold text-purple-900">{formatCurrency(client.totalRevenue)}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{client.lastActivity}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      تعديل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد نتائج</h3>
            <p className="text-sm text-slate-500">لم يتم العثور على عملاء مطابقين لبحثك</p>
          </div>
        )}
      </div>
    </div>
  )
}
