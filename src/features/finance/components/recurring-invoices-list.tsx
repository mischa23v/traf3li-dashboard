import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  Pause,
  Play,
  Ban,
  Copy,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Zap,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useRecurringInvoices,
  useRecurringInvoiceStats,
  useDeleteRecurringInvoice,
  usePauseRecurringInvoice,
  useResumeRecurringInvoice,
  useCancelRecurringInvoice,
  useGenerateFromRecurring,
  useDuplicateRecurringInvoice,
} from '@/hooks/useFinance'
import { useClients } from '@/hooks/useCasesAndClients'
import { FinanceSidebar } from './finance-sidebar'
import { ProductivityHero } from '@/components/productivity-hero'
import { getFrequencyLabel, getStatusLabel, getStatusColor } from '@/services/recurringInvoiceService'
import type { RecurringInvoice } from '@/services/recurringInvoiceService'

export default function RecurringInvoicesList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedFrequency, setSelectedFrequency] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<RecurringInvoice | null>(null)

  // Fetch clients for filter
  const { data: clientsData } = useClients()
  const { data: stats } = useRecurringInvoiceStats()

  // Mutations
  const { mutate: deleteInvoice } = useDeleteRecurringInvoice()
  const { mutate: pauseInvoice } = usePauseRecurringInvoice()
  const { mutate: resumeInvoice } = useResumeRecurringInvoice()
  const { mutate: cancelInvoice } = useCancelRecurringInvoice()
  const { mutate: generateInvoice } = useGenerateFromRecurring()
  const { mutate: duplicateInvoice } = useDuplicateRecurringInvoice()

  // API Filters
  const filters = useMemo(() => {
    const f: any = { page: currentPage, limit: itemsPerPage }
    if (activeTab !== 'all') {
      f.status = activeTab
    }
    if (selectedClient && selectedClient !== 'all') f.clientId = selectedClient
    if (selectedFrequency && selectedFrequency !== 'all') f.frequency = selectedFrequency
    if (searchQuery) f.search = searchQuery
    return f
  }, [activeTab, currentPage, itemsPerPage, selectedClient, selectedFrequency, searchQuery])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedClient && selectedClient !== 'all') count++
    if (selectedFrequency && selectedFrequency !== 'all') count++
    return count
  }, [selectedClient, selectedFrequency])

  // Clear all filters
  const clearFilters = () => {
    setSelectedClient('')
    setSelectedFrequency('')
    setCurrentPage(1)
  }

  // Fetch data
  const { data: recurringData, isLoading, isError, error, refetch } = useRecurringInvoices(filters)

  // Transform API data
  const recurringInvoices = useMemo(() => {
    if (!recurringData) return []
    const invoiceArray = recurringData.data ?? []
    return invoiceArray
  }, [recurringData])

  // Filter Logic (client-side search is handled by API)
  const filteredInvoices = recurringInvoices

  // Calculate statistics
  const displayStats = useMemo(() => {
    if (!stats) return { total: 0, active: 0, paused: 0, totalMonthlyRecurring: 0 }
    return stats
  }, [stats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDelete = (invoice: RecurringInvoice) => {
    setSelectedInvoice(invoice)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedInvoice) {
      deleteInvoice(selectedInvoice._id)
      setDeleteDialogOpen(false)
      setSelectedInvoice(null)
    }
  }

  const handlePause = (id: string) => {
    pauseInvoice(id)
  }

  const handleResume = (id: string) => {
    resumeInvoice(id)
  }

  const handleCancel = (id: string) => {
    cancelInvoice(id)
  }

  const handleGenerate = (id: string) => {
    generateInvoice(id)
  }

  const handleDuplicate = (invoice: RecurringInvoice) => {
    duplicateInvoice({
      id: invoice._id,
      name: `${invoice.name} (نسخة)`,
      nameAr: invoice.nameAr ? `${invoice.nameAr} (نسخة)` : undefined,
    })
  }

  return (
    <>
      <div className="min-h-screen flex bg-background" dir="rtl">
        <FinanceSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header>
            <TopNav>
              <div className="flex items-center gap-3 flex-1">
                <DynamicIsland />
              </div>

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
              </div>
            </TopNav>
          </Header>

          <Main>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">الفواتير المتكررة</h1>
                  <p className="text-muted-foreground mt-1">
                    إدارة الفواتير التلقائية والاشتراكات
                  </p>
                </div>
                <Link to="/dashboard/finance/recurring-invoices/new">
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    فاتورة متكررة جديدة
                  </Button>
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">الإجمالي</p>
                        <p className="text-2xl font-bold">{displayStats.total}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">نشط</p>
                        <p className="text-2xl font-bold text-green-600">{displayStats.active}</p>
                      </div>
                      <Zap className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">متوقف</p>
                        <p className="text-2xl font-bold text-yellow-600">{displayStats.paused}</p>
                      </div>
                      <Pause className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">الإيراد الشهري</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(displayStats.totalMonthlyRecurring || 0)}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters & Tabs */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث بالاسم أو العميل..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Popover open={showFilters} onOpenChange={setShowFilters}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        تصفية
                        {activeFilterCount > 0 && (
                          <Badge variant="secondary" className="mr-2">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">تصفية</h3>
                          {activeFilterCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="h-auto p-0 text-xs"
                            >
                              مسح الكل
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">العميل</label>
                          <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger>
                              <SelectValue placeholder="كل العملاء" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">كل العملاء</SelectItem>
                              {clientsData?.clients?.map((client: any) => (
                                <SelectItem key={client._id} value={client._id}>
                                  {client.name ||
                                    `${client.firstName} ${client.lastName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">التكرار</label>
                          <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                            <SelectTrigger>
                              <SelectValue placeholder="كل الأنواع" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">كل الأنواع</SelectItem>
                              <SelectItem value="weekly">أسبوعياً</SelectItem>
                              <SelectItem value="biweekly">كل أسبوعين</SelectItem>
                              <SelectItem value="monthly">شهرياً</SelectItem>
                              <SelectItem value="quarterly">ربع سنوي</SelectItem>
                              <SelectItem value="annually">سنوياً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">الكل</TabsTrigger>
                  <TabsTrigger value="active">نشط</TabsTrigger>
                  <TabsTrigger value="paused">متوقف</TabsTrigger>
                  <TabsTrigger value="completed">مكتمل</TabsTrigger>
                  <TabsTrigger value="cancelled">ملغي</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Invoices List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isError ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive">حدث خطأ أثناء تحميل البيانات</p>
                  </CardContent>
                </Card>
              ) : filteredInvoices.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">لا توجد فواتير متكررة</h3>
                    <p className="text-muted-foreground mb-4">
                      ابدأ بإنشاء فاتورة متكررة لأتمتة الفواتير الخاصة بك
                    </p>
                    <Link to="/dashboard/finance/recurring-invoices/new">
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        فاتورة متكررة جديدة
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice) => {
                      const clientName =
                        typeof invoice.clientId === 'object'
                          ? invoice.clientId.name ||
                            `${invoice.clientId.firstName} ${invoice.clientId.lastName}`
                          : 'عميل غير محدد'

                      return (
                        <Card key={invoice._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{invoice.name}</h3>
                                  <Badge className={getStatusColor(invoice.status)}>
                                    {getStatusLabel(invoice.status)}
                                  </Badge>
                                  <Badge variant="outline">
                                    {getFrequencyLabel(invoice.frequency)}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">العميل</p>
                                    <p className="font-medium">{clientName}</p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground">المبلغ</p>
                                    <p className="font-medium text-lg">
                                      {formatCurrency(invoice.total)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground">الفاتورة التالية</p>
                                    <p className="font-medium">
                                      {formatDate(invoice.nextGenerationDate)}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground">تم الإنشاء</p>
                                    <p className="font-medium">
                                      {invoice.timesGenerated} مرة
                                      {invoice.maxGenerations &&
                                        ` من ${invoice.maxGenerations}`}
                                    </p>
                                  </div>
                                </div>

                                {invoice.notes && (
                                  <p className="text-sm text-muted-foreground mt-3">
                                    {invoice.notes}
                                  </p>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate({
                                        to: '/dashboard/finance/recurring-invoices/$id',
                                        params: { id: invoice._id },
                                      })
                                    }
                                  >
                                    <Eye className="h-4 w-4 ml-2" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>

                                  {invoice.status === 'active' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleGenerate(invoice._id)}>
                                        <Zap className="h-4 w-4 ml-2" />
                                        إنشاء فاتورة الآن
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handlePause(invoice._id)}>
                                        <Pause className="h-4 w-4 ml-2" />
                                        إيقاف مؤقت
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {invoice.status === 'paused' && (
                                    <DropdownMenuItem onClick={() => handleResume(invoice._id)}>
                                      <Play className="h-4 w-4 ml-2" />
                                      استئناف
                                    </DropdownMenuItem>
                                  )}

                                  {(invoice.status === 'active' || invoice.status === 'paused') && (
                                    <DropdownMenuItem onClick={() => handleCancel(invoice._id)}>
                                      <Ban className="h-4 w-4 ml-2" />
                                      إلغاء
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                                    <Copy className="h-4 w-4 ml-2" />
                                    نسخ
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleDelete(invoice)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 ml-2" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {recurringData && recurringData.pages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        عرض {(currentPage - 1) * itemsPerPage + 1} إلى{' '}
                        {Math.min(currentPage * itemsPerPage, recurringData.total)} من{' '}
                        {recurringData.total} نتيجة
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        <span className="text-sm">
                          صفحة {currentPage} من {recurringData.pages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(recurringData.pages, p + 1))
                          }
                          disabled={currentPage === recurringData.pages}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الفاتورة المتكررة "{selectedInvoice?.name}" بشكل نهائي. هذا الإجراء لا
              يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
