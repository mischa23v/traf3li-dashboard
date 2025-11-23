import { useState } from 'react'
import {
    FileText, Check, Calendar, User,
    DollarSign, Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function StatementGenerator() {
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // Mock Data
    const clients = [
        { id: '1', name: 'مشاري الرابح', company: 'شركة الرابح القابضة' },
        { id: '2', name: 'سارة المطيري', company: 'مؤسسة الإعمار' },
        { id: '3', name: 'محمد الدوسري', company: 'مجموعة الدوسري' },
    ]

    const invoices = [
        {
            id: 'INV-2025-001',
            date: '15 نوفمبر 2025',
            description: 'استشارة قانونية - قضية تجارية',
            amount: 2500,
            status: 'unpaid',
            type: 'invoice'
        },
        {
            id: 'INV-2025-002',
            date: '12 نوفمبر 2025',
            description: 'صياغة عقود عمل',
            amount: 1800,
            status: 'unpaid',
            type: 'invoice'
        },
        {
            id: 'EXP-2025-001',
            date: '10 نوفمبر 2025',
            description: 'رسوم محكمة',
            amount: 500,
            status: 'unpaid',
            type: 'expense'
        },
        {
            id: 'INV-2025-003',
            date: '08 نوفمبر 2025',
            description: 'تمثيل قضائي - الجلسة الأولى',
            amount: 3500,
            status: 'unpaid',
            type: 'invoice'
        },
        {
            id: 'INV-2025-004',
            date: '05 نوفمبر 2025',
            description: 'مراجعة لوائح داخلية',
            amount: 1200,
            status: 'unpaid',
            type: 'invoice'
        }
    ]

    // Logic
    const handleToggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedItems.length === invoices.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(invoices.map(inv => inv.id))
        }
    }

    const selectedInvoices = invoices.filter(inv => selectedItems.includes(inv.id))
    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-['IBM_Plex_Sans_Arabic'] p-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Section - Contained Navy Card */}
                <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                    <FileText className="w-3 h-3 ml-2" />
                                    كشف حساب جديد
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                إنشاء كشف حساب مجمع
                            </h1>
                            <p className="text-blue-200/80">دمج عدة فواتير ومصروفات في كشف حساب واحد للعميل</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Selection Area */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Client Selector */}
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <label className="text-sm font-medium text-slate-700 mb-2 block">اختر العميل</label>
                                <Select value={selectedClient} onValueChange={setSelectedClient}>
                                    <SelectTrigger className="w-full h-12 text-right bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="ابحث عن عميل..." />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span>{client.name}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-slate-400 text-xs">{client.company}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Invoices List */}
                        {selectedClient && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-bold text-[#022c22]">الفواتير والمصروفات المستحقة</h3>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedItems.length === invoices.length && invoices.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <label htmlFor="select-all" className="text-sm text-slate-600 cursor-pointer">تحديد الكل</label>
                                    </div>
                                </div>

                                {invoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer group ${selectedItems.includes(invoice.id)
                                            ? 'border-brand-blue ring-1 ring-brand-blue shadow-md'
                                            : 'border-slate-100 hover:border-blue-200 shadow-sm'
                                            }`}
                                        onClick={() => handleToggleItem(invoice.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                checked={selectedItems.includes(invoice.id)}
                                                onCheckedChange={() => handleToggleItem(invoice.id)}
                                                className="data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue"
                                            />

                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${invoice.type === 'invoice' ? 'bg-blue-50 text-brand-blue' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {invoice.type === 'invoice' ? <Receipt className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-[#022c22]">{invoice.description}</h4>
                                                    <span className="font-bold text-lg text-[#022c22]">{formatCurrency(invoice.amount)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-slate-500">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{invoice.id}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {invoice.date}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                        غير مدفوع
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden sticky top-6">
                            <CardHeader className="bg-[#022c22] text-white p-6">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    ملخص الكشف
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">عدد العناصر المحددة</span>
                                        <span className="font-bold text-[#022c22]">{selectedItems.length}</span>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        {selectedInvoices.map(inv => (
                                            <div key={inv.id} className="flex justify-between text-xs text-slate-500">
                                                <span className="truncate max-w-[180px]">{inv.description}</span>
                                                <span>{formatCurrency(inv.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-800 font-bold">الإجمالي الكلي</span>
                                        <span className="text-2xl font-bold text-brand-blue">{formatCurrency(totalAmount)}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-brand-blue hover:bg-blue-600 text-white h-12 rounded-xl text-lg shadow-lg shadow-blue-500/20"
                                    disabled={selectedItems.length === 0}
                                >
                                    <Check className="w-5 h-5 ml-2" />
                                    إنشاء الكشف
                                </Button>

                                <p className="text-xs text-center text-slate-400">
                                    سيتم إنشاء ملف PDF وإرسال نسخة إلى العميل تلقائياً
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
