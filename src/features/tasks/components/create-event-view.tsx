import { useState } from 'react'
import {
    ArrowRight, Save, Calendar, Clock,
    MapPin, Users, FileText, Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link, useNavigate } from '@tanstack/react-router'
import { TasksSidebar } from './tasks-sidebar'
import { useCreateEvent } from '@/hooks/useRemindersAndEvents'

export function CreateEventView() {
    const navigate = useNavigate()
    const createEventMutation = useCreateEvent()

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        date: '',
        time: '',
        location: '',
        attendees: '',
        description: ''
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const attendeesList = formData.attendees
            ? formData.attendees.split(',').map(a => a.trim()).filter(Boolean)
            : []

        const eventData = {
            title: formData.title,
            type: formData.type,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            attendees: attendeesList,
            description: formData.description,
        }

        createEventMutation.mutate(eventData, {
            onSuccess: () => {
                navigate({ to: '/dashboard/tasks/events' })
            }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: false },
        { title: 'التذكيرات', href: '/dashboard/tasks/reminders', isActive: false },
        { title: 'الأحداث', href: '/dashboard/tasks/events', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* Sidebar Widgets */}
                    <TasksSidebar />

                    {/* Main Form Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* HERO CARD */}
                        <div className="bg-emerald-950 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <Link to="/dashboard/tasks/events">
                                        <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <h2 className="text-3xl font-bold leading-tight">إنشاء فعالية جديدة</h2>
                                </div>
                                <p className="text-emerald-200 text-lg mb-8 leading-relaxed">
                                    أضف جلسة، اجتماع، أو فعالية جديدة إلى الجدول لتنظيم وقتك بكفاءة.
                                </p>
                            </div>
                            {/* Abstract Visual Decoration */}
                            <div className="hidden md:block relative w-64 h-64">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                                <div className="absolute inset-4 bg-emerald-950 rounded-2xl border border-white/10 flex items-center justify-center transform rotate-6 shadow-2xl">
                                    <Calendar className="h-24 w-24 text-emerald-400" />
                                </div>
                                <div className="absolute inset-4 bg-emerald-950/80 rounded-2xl border border-white/10 flex items-center justify-center transform -rotate-6 backdrop-blur-sm">
                                    <MapPin className="h-24 w-24 text-teal-400" />
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                عنوان الفعالية
                                            </label>
                                            <Input
                                                placeholder="مثال: جلسة مرافعة"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-blue-500" />
                                                نوع الفعالية
                                            </label>
                                            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                                <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500">
                                                    <SelectValue placeholder="اختر النوع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="court">جلسة محكمة</SelectItem>
                                                    <SelectItem value="meeting">اجتماع</SelectItem>
                                                    <SelectItem value="workshop">ورشة عمل</SelectItem>
                                                    <SelectItem value="online">اجتماع عن بعد</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                التاريخ
                                            </label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                value={formData.date}
                                                onChange={(e) => handleChange('date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                الوقت
                                            </label>
                                            <Input
                                                type="time"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                required
                                                value={formData.time}
                                                onChange={(e) => handleChange('time', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                الموقع
                                            </label>
                                            <Input
                                                placeholder="مثال: المحكمة العامة - القاعة 4"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={formData.location}
                                                onChange={(e) => handleChange('location', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                الحضور
                                            </label>
                                            <Input
                                                placeholder="أدخل أسماء الحضور مفصولة بفاصلة"
                                                className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                value={formData.attendees}
                                                onChange={(e) => handleChange('attendees', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            تفاصيل إضافية
                                        </label>
                                        <Textarea
                                            placeholder="أدخل جدول الأعمال أو ملاحظات..."
                                            className="min-h-[120px] rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                    <Link to="/dashboard/tasks/events">
                                        <Button type="button" variant="ghost" className="text-slate-500 hover:text-navy">
                                            إلغاء
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white min-w-[140px] rounded-xl shadow-lg shadow-blue-500/20"
                                        disabled={createEventMutation.isPending}
                                    >
                                        {createEventMutation.isPending ? (
                                            <span className="flex items-center gap-2">
                                                جاري الحفظ...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                حفظ الفعالية
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}
