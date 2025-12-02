import {
    MoreHorizontal,
    Briefcase,
    ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductivityHero } from '@/components/productivity-hero'

export default function ExecutiveTasksDashboard() {
    // Mock Data
    const tasks = [
        { id: '1', title: 'مراجعة مسودة العقد النهائي', client: 'شركة الإنشاءات', deadline: 'اليوم', priority: 'high', status: 'active' },
        { id: '2', title: 'اجتماع تحضيري للقضية 452', client: 'مجموعة العقارية', deadline: 'غداً', priority: 'medium', status: 'active' },
        { id: '3', title: 'إرسال المطالبة المالية', client: 'مؤسسة النور', deadline: '23 نوفمبر', priority: 'low', status: 'pending' },
    ]

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-['IBM_Plex_Sans_Arabic'] p-6 lg:p-8" dir="rtl">

            {/* MAIN GRID LAYOUT - Single Column */}
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Main Content */}
                <div className="space-y-8">

                    {/* HERO CARD with Real API Data */}
                    <ProductivityHero
                        badge="لوحة المهام"
                        title="المهام"
                        type="tasks"
                    />

                    {/* MAIN TASKS LIST (Matches "Current Subscriptions" style) */}
                    <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                        <div className="p-6 pb-2 flex justify-between items-center">
                            <h3 className="font-bold text-navy text-xl">المهام الحالية</h3>
                            <div className="flex gap-2">
                                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4">النشطة</Button>
                                <Button size="sm" variant="ghost" className="text-slate-500 hover:text-navy rounded-full px-4">المكتملة</Button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-navy text-lg">{task.title}</h4>
                                                    {task.status === 'active' && (
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">نشط</Badge>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-sm">العميل: {task.client}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الأولوية</div>
                                                <div className={`font-bold ${task.priority === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                                                    {task.priority === 'high' ? 'عالية' : 'متوسطة'}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-slate-400 mb-1">الموعد</div>
                                                <div className="font-bold text-navy">{task.deadline}</div>
                                            </div>
                                        </div>
                                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                            عرض التفاصيل
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 pt-0 text-center">
                            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                عرض جميع المهام
                                <ChevronLeft className="h-4 w-4 mr-2" />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
