import { useState } from 'react'
import { Search, Filter, Download, Plus, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Building2, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function TransactionsDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample transactions data
  const transactions = [
    {
      id: 'TRX-2025-001',
      type: 'دخل',
      typeEn: 'income',
      description: 'دفعة من عميل - مشاري الرابح',
      client: 'مشاري بن ناهد الرابح',
      company: 'المصنع السعودي للمنتجات المعدنية',
      amount: 45000,
      date: '18 نوفمبر 2025',
      time: '10:30 صباحاً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'فاتورة',
      paymentMethod: 'تحويل بنكي',
      reference: 'INV-2025-001'
    },
    {
      id: 'TRX-2025-002',
      type: 'دخل',
      typeEn: 'income',
      description: 'دفعة من عميل - عبدالله الغامدي',
      client: 'عبدالله بن سعد الغامدي',
      company: 'شركة البناء الحديثة',
      amount: 38000,
      date: '16 نوفمبر 2025',
      time: '02:15 مساءً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'فاتورة',
      paymentMethod: 'تحويل بنكي',
      reference: 'INV-2025-002'
    },
    {
      id: 'TRX-2025-003',
      type: 'مصروف',
      typeEn: 'expense',
      description: 'رسوم المحكمة - قضية 4772088016',
      client: '-',
      company: 'وزارة العدل',
      amount: 2500,
      date: '15 نوفمبر 2025',
      time: '11:00 صباحاً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'رسوم قانونية',
      paymentMethod: 'نقداً',
      reference: 'EXP-2025-015'
    },
    {
      id: 'TRX-2025-004',
      type: 'دخل',
      typeEn: 'income',
      description: 'دفعة من عميل - فاطمة العتيبي',
      client: 'فاطمة بنت محمد العتيبي',
      company: 'مستشفى النور الطبي',
      amount: 52000,
      date: '14 نوفمبر 2025',
      time: '03:45 مساءً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'فاتورة',
      paymentMethod: 'شيك',
      reference: 'INV-2025-003'
    },
    {
      id: 'TRX-2025-005',
      type: 'مصروف',
      typeEn: 'expense',
      description: 'اشتراك برنامج قانوني',
      client: '-',
      company: 'شركة البرمجيات القانونية',
      amount: 1200,
      date: '12 نوفمبر 2025',
      time: '09:00 صباحاً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'اشتراكات',
      paymentMethod: 'بطاقة ائتمان',
      reference: 'EXP-2025-014'
    },
    {
      id: 'TRX-2025-006',
      type: 'مصروف',
      typeEn: 'expense',
      description: 'رسوم استشارات خبير',
      client: '-',
      company: 'مكتب الاستشارات المتخصصة',
      amount: 5000,
      date: '10 نوفمبر 2025',
      time: '01:30 مساءً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'خدمات مهنية',
      paymentMethod: 'تحويل بنكي',
      reference: 'EXP-2025-013'
    },
    {
      id: 'TRX-2025-007',
      type: 'دخل',
      typeEn: 'income',
      description: 'دفعة مقدمة - خالد القحطاني',
      client: 'خالد بن عبدالرحمن القحطاني',
      company: 'شركة التقنية المتقدمة',
      amount: 30000,
      date: '8 نوفمبر 2025',
      time: '10:00 صباحاً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'دفعة مقدمة',
      paymentMethod: 'تحويل بنكي',
      reference: 'ADV-2025-001'
    },
    {
      id: 'TRX-2025-008',
      type: 'مصروف',
      typeEn: 'expense',
      description: 'إيجار المكتب - نوفمبر',
      client: '-',
      company: 'شركة العقارات التجارية',
      amount: 8000,
      date: '1 نوفمبر 2025',
      time: '08:00 صباحاً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'إيجار',
      paymentMethod: 'تحويل بنكي',
      reference: 'EXP-2025-012'
    },
    {
      id: 'TRX-2025-009',
      type: 'دخل',
      typeEn: 'income',
      description: 'دفعة من عميل - نورة الشمري',
      client: 'نورة بنت خالد الشمري',
      company: 'مركز التدريب الوطني',
      amount: 35000,
      date: '30 أكتوبر 2025',
      time: '04:20 مساءً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'فاتورة',
      paymentMethod: 'تحويل بنكي',
      reference: 'INV-2025-007'
    },
    {
      id: 'TRX-2025-010',
      type: 'مصروف',
      typeEn: 'expense',
      description: 'مصاريف إدارية متنوعة',
      client: '-',
      company: 'متنوع',
      amount: 1500,
      date: '28 أكتوبر 2025',
      time: '12:00 ظهراً',
      status: 'مكتمل',
      statusColor: 'bg-green-500',
      category: 'مصاريف إدارية',
      paymentMethod: 'نقداً',
      reference: 'EXP-2025-011'
    }
  ]

  // Filter transactions
  const filteredTransactions = transactions.filter(trx => {
    if (activeTab === 'all') return true
    if (activeTab === 'income') return trx.typeEn === 'income'
    if (activeTab === 'expense') return trx.typeEn === 'expense'
    return true
  }).filter(trx => {
    if (!searchQuery) return true
    return trx.description.includes(searchQuery) ||
           trx.client.includes(searchQuery) ||
           trx.company.includes(searchQuery) ||
           trx.id.includes(searchQuery)
  })

  // Calculate statistics
  const totalIncome = transactions.filter(t => t.typeEn === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.typeEn === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalIncome - totalExpense
  const incomeCount = transactions.filter(t => t.typeEn === 'income').length
  const expenseCount = transactions.filter(t => t.typeEn === 'expense').length

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
            <h1 className="text-xl font-bold text-slate-900">المعاملات</h1>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="بحث في المعاملات..."
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
              معاملة جديدة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        {/* Dashboard Overview */}
        <div className="mb-6">
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Total Income */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5 text-green-700" />
                  </div>
                  <Badge className="bg-green-600 text-xs">دخل</Badge>
                </div>
                <div className="text-3xl font-bold text-green-900 mb-1">{formatCurrency(totalIncome)}</div>
                <div className="text-xs text-green-700">إجمالي الدخل</div>
              </CardContent>
            </Card>

            {/* Total Expense */}
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-red-700" />
                  </div>
                  <Badge variant="destructive" className="text-xs">مصروف</Badge>
                </div>
                <div className="text-3xl font-bold text-red-900 mb-1">{formatCurrency(totalExpense)}</div>
                <div className="text-xs text-red-700">إجمالي المصروفات</div>
              </CardContent>
            </Card>

            {/* Net Balance */}
            <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-slate-700" />
                  </div>
                  <Badge variant="outline" className="text-xs">صافي</Badge>
                </div>
                <div className={`text-3xl font-bold mb-1 ${netBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(netBalance)}
                </div>
                <div className="text-xs text-slate-600">الرصيد الصافي</div>
              </CardContent>
            </Card>

            {/* Transaction Count */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-700" />
                  </div>
                  <Badge className="bg-blue-600 text-xs">إجمالي</Badge>
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-1">{transactions.length}</div>
                <div className="text-xs text-blue-700">إجمالي المعاملات</div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Analytics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Income vs Expense Distribution */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">توزيع المعاملات</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-slate-600">معاملات الدخل</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{incomeCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{width: `${(incomeCount / transactions.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-slate-600">معاملات المصروفات</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{expenseCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{width: `${(expenseCount / transactions.length) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">ملخص النشاط</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">نسبة التحصيل</span>
                    <span className="text-sm font-bold text-slate-900">
                      {((totalIncome / (totalIncome + totalExpense)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">متوسط قيمة المعاملة</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency((totalIncome + totalExpense) / transactions.length)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">أعلى معاملة دخل</span>
                    <span className="text-sm font-bold text-green-900">
                      {formatCurrency(Math.max(...transactions.filter(t => t.typeEn === 'income').map(t => t.amount)))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">أعلى معاملة مصروف</span>
                    <span className="text-sm font-bold text-red-900">
                      {formatCurrency(Math.max(...transactions.filter(t => t.typeEn === 'expense').map(t => t.amount)))}
                    </span>
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
            الكل ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'income'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            الدخل ({incomeCount})
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'expense'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            المصروفات ({expenseCount})
          </button>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left Side - Transaction Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      transaction.typeEn === 'income'
                        ? 'bg-gradient-to-br from-green-100 to-green-50'
                        : 'bg-gradient-to-br from-red-100 to-red-50'
                    }`}>
                      {transaction.typeEn === 'income' ? (
                        <ArrowDownRight className="h-6 w-6 text-green-700" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-red-700" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-900">{transaction.description}</h3>
                        <Badge className={transaction.typeEn === 'income' ? 'bg-green-600' : 'bg-red-600'} variant="default">
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{transaction.company}</span>
                        </div>
                        {transaction.client !== '-' && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{transaction.client}</span>
                          </div>
                        )}
                        <span>•</span>
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Amount & Details */}
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <div className={`text-xl font-bold ${
                        transaction.typeEn === 'income' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {transaction.typeEn === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {transaction.date} • {transaction.time}
                      </div>
                    </div>
                    <Badge className={transaction.statusColor} variant="default">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد معاملات</h3>
            <p className="text-sm text-slate-500">لم يتم العثور على معاملات مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </div>
  )
}
