import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Download, Send, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useInvoices } from './hooks/use-invoices';

// Types
interface Invoice {
  _id: string;
  invoiceNumber: string;
  caseId: string | {
    _id: string;
    caseNumber: string;
    title: string;
  };
  clientId: string | {
    _id: string;
    fullName: string;
    email: string;
  };
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoicesPage() {
  // Fetch invoices
  const { data: invoices = [], isLoading, error } = useInvoices();

  // Status badge component
  const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'secondary' as const },
      sent: { label: 'مرسلة', variant: 'default' as const },
      paid: { label: 'مدفوعة', variant: 'default' as const },
      overdue: { label: 'متأخرة', variant: 'destructive' as const },
      cancelled: { label: 'ملغاة', variant: 'outline' as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Mock invoices data for display
  const mockInvoices: Invoice[] = [
    {
      _id: '1',
      invoiceNumber: 'INV-001',
      caseId: { _id: '1', caseNumber: 'CASE-2025-001', title: 'Commercial Dispute' },
      clientId: { _id: '1', fullName: 'Ahmed Al-Rashid', email: 'ahmed@example.com' },
      amount: 5000,
      status: 'paid',
      dueDate: '2025-12-31',
      issuedDate: '2025-11-01',
      items: [],
      createdAt: '2025-11-01',
      updatedAt: '2025-11-01',
    },
    {
      _id: '2',
      invoiceNumber: 'INV-002',
      caseId: { _id: '2', caseNumber: 'CASE-2025-002', title: 'Employment Case' },
      clientId: { _id: '2', fullName: 'Sarah Al-Saud', email: 'sarah@example.com' },
      amount: 3500,
      status: 'sent',
      dueDate: '2025-12-25',
      issuedDate: '2025-11-10',
      items: [],
      createdAt: '2025-11-10',
      updatedAt: '2025-11-10',
    },
  ];

  // Use mock data for now (replace with real data when backend is ready)
  const displayInvoices = invoices.length > 0 ? invoices : mockInvoices;

  // Calculate statistics
  const stats = {
    total: displayInvoices.length,
    paid: displayInvoices.filter((inv) => inv.status === 'paid').length,
    pending: displayInvoices.filter((inv) => inv.status === 'sent').length,
    overdue: displayInvoices.filter((inv) => inv.status === 'overdue').length,
    totalAmount: displayInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidAmount: displayInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0),
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>خطأ في تحميل الفواتير</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground">إدارة فواتير العملاء</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          فاتورة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>إجمالي الفواتير</CardDescription>
            <CardTitle className="text-4xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>فواتير مدفوعة</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {stats.paid}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>فواتير معلقة</CardDescription>
            <CardTitle className="text-4xl text-yellow-600">
              {stats.pending}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>فواتير متأخرة</CardDescription>
            <CardTitle className="text-4xl text-red-600">
              {stats.overdue}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>إجمالي المبالغ</CardDescription>
            <CardTitle className="text-3xl">
              {stats.totalAmount.toLocaleString('ar-SA')} ر.س
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>المبالغ المحصلة</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {stats.paidAmount.toLocaleString('ar-SA')} ر.س
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>
            جميع الفواتير المُصدرة للعملاء
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {displayInvoices.map((invoice) => (
                <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof invoice.clientId === 'object' ? invoice.clientId.fullName : 'N/A'} • {typeof invoice.caseId === 'object' ? invoice.caseId.caseNumber : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: ar })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{invoice.amount.toLocaleString('ar-SA')} ر.س</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
