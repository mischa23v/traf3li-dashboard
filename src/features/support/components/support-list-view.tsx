/**
 * Support List View
 * Main support/helpdesk tickets list page
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Headphones,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

import { useTickets, useDeleteTicket, useSupportStats } from '@/hooks/use-support'
import type { Ticket, TicketFilters, TicketStatus, TicketPriority } from '@/types/support'
import { SupportSidebar } from './support-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: ROUTES.dashboard.home },
  { title: 'sidebar.nav.support', href: ROUTES.dashboard.support.list },
]

export function SupportListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null)

  // Build filters
  const filters: TicketFilters = useMemo(() => {
    const f: TicketFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    if (priorityFilter !== 'all') f.priority = priorityFilter
    return f
  }, [search, statusFilter, priorityFilter])

  // Queries
  const { data: ticketsData, isLoading, error } = useTickets(filters)
  const { data: statsData } = useSupportStats()
  const deleteTicketMutation = useDeleteTicket()

  const tickets = ticketsData?.tickets || []
  const stats = statsData

  // Handlers
  const handleDelete = async () => {
    if (!ticketToDelete) return
    await deleteTicketMutation.mutateAsync(ticketToDelete._id)
    setDeleteDialogOpen(false)
    setTicketToDelete(null)
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-blue-500"><Clock className="w-3 h-3 ml-1" />{t('support.status.open', 'مفتوح')}</Badge>
      case 'replied':
        return <Badge variant="secondary"><MessageSquare className="w-3 h-3 ml-1" />{t('support.status.replied', 'تم الرد')}</Badge>
      case 'resolved':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('support.status.resolved', 'تم الحل')}</Badge>
      case 'closed':
        return <Badge variant="outline"><XCircle className="w-3 h-3 ml-1" />{t('support.status.closed', 'مغلق')}</Badge>
      case 'on_hold':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3 ml-1" />{t('support.status.onHold', 'قيد الانتظار')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">{t('support.priority.urgent', 'عاجل')}</Badge>
      case 'high':
        return <Badge variant="default" className="bg-orange-500">{t('support.priority.high', 'عالي')}</Badge>
      case 'medium':
        return <Badge variant="secondary">{t('support.priority.medium', 'متوسط')}</Badge>
      case 'low':
        return <Badge variant="outline">{t('support.priority.low', 'منخفض')}</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('support.badge', 'الدعم الفني')}
          title={t('support.title', 'التذاكر والدعم')}
          type="support"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{stats?.totalTickets || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('support.stats.totalTickets', 'إجمالي التذاكر')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats?.openTickets || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('support.stats.openTickets', 'تذاكر مفتوحة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{stats?.resolvedTickets || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('support.stats.resolvedTickets', 'تذاكر محلولة')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{stats?.slaComplianceRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">{t('support.stats.slaCompliance', 'التزام SLA')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('support.searchPlaceholder', 'البحث في التذاكر...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pr-10 rounded-xl"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('support.filterByStatus', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="open">{t('support.status.open', 'مفتوح')}</SelectItem>
                      <SelectItem value="replied">{t('support.status.replied', 'تم الرد')}</SelectItem>
                      <SelectItem value="resolved">{t('support.status.resolved', 'تم الحل')}</SelectItem>
                      <SelectItem value="closed">{t('support.status.closed', 'مغلق')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}>
                    <SelectTrigger className="w-full md:w-40 rounded-xl">
                      <SelectValue placeholder={t('support.filterByPriority', 'الأولوية')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      <SelectItem value="urgent">{t('support.priority.urgent', 'عاجل')}</SelectItem>
                      <SelectItem value="high">{t('support.priority.high', 'عالي')}</SelectItem>
                      <SelectItem value="medium">{t('support.priority.medium', 'متوسط')}</SelectItem>
                      <SelectItem value="low">{t('support.priority.low', 'منخفض')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Link to={ROUTES.dashboard.support.create}>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('support.createTicket', 'إنشاء تذكرة')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">
                    {t('common.error', 'حدث خطأ في تحميل البيانات')}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-12 text-center">
                    <Headphones className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('support.noTickets', 'لا توجد تذاكر')}</h3>
                    <p className="text-muted-foreground mb-4">{t('support.noTicketsDesc', 'ابدأ بإنشاء تذكرة جديدة')}</p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.support.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('support.createTicket', 'إنشاء تذكرة')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('support.ticketNumber', 'رقم التذكرة')}</TableHead>
                        <TableHead className="text-right">{t('support.subject', 'الموضوع')}</TableHead>
                        <TableHead className="text-right">{t('support.priority', 'الأولوية')}</TableHead>
                        <TableHead className="text-right">{t('support.status', 'الحالة')}</TableHead>
                        <TableHead className="text-right w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow
                          key={ticket._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate({ to: ROUTES.dashboard.support.detail(ticket._id) })}
                        >
                          <TableCell className="font-mono text-sm">{ticket.ticketNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-sm text-muted-foreground">{ticket.raisedByName || ticket.raisedBy}</div>
                          </TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: ROUTES.dashboard.support.detail(ticket._id) })
                                }}>
                                  <Eye className="w-4 h-4 ml-2" />
                                  {t('common.view', 'عرض')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  navigate({ to: `${ROUTES.dashboard.support.detail(ticket._id)}/edit` })
                                }}>
                                  <Edit className="w-4 h-4 ml-2" />
                                  {t('common.edit', 'تعديل')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setTicketToDelete(ticket)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  {t('common.delete', 'حذف')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <SupportSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('support.deleteConfirmTitle', 'حذف التذكرة')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('support.deleteConfirmDesc', 'هل أنت متأكد من حذف هذه التذكرة؟ لا يمكن التراجع عن هذا الإجراء.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
