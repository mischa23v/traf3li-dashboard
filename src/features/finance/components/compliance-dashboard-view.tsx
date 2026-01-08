/**
 * Compliance Dashboard View
 *
 * Central dashboard for monitoring all Saudi regulatory compliance:
 * - GOSI (General Organization for Social Insurance)
 * - WPS (Wage Protection System)
 * - Nitaqat (Saudization)
 * - Iqama Management
 * - Labor Law Compliance
 *
 * CRITICAL: Non-compliance results in significant fines and business penalties.
 */

import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  FileText,
  CreditCard,
  Banknote,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Download,
  Bell,
  Target,
  Award,
  PieChart,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { NITAQAT_BANDS } from '@/constants/saudi-banking'
import { toast } from 'sonner'

// Compliance status types
type ComplianceStatus = 'compliant' | 'warning' | 'critical' | 'non_compliant'

// Mock compliance data
const MOCK_COMPLIANCE = {
  overall: {
    score: 85,
    status: 'compliant' as ComplianceStatus,
    lastUpdated: '2024-01-15',
  },
  gosi: {
    status: 'compliant' as ComplianceStatus,
    lastPayment: '2024-01-10',
    nextDeadline: '2024-02-15',
    daysUntilDeadline: 30,
    amountDue: 28500,
  },
  wps: {
    status: 'compliant' as ComplianceStatus,
    lastSubmission: '2024-01-08',
    nextDeadline: '2024-02-10',
    daysUntilDeadline: 25,
    employeesProcessed: 45,
  },
  nitaqat: {
    band: 'green' as keyof typeof NITAQAT_BANDS,
    saudizationRate: 32,
    requiredRate: 25,
    saudiEmployees: 15,
    totalEmployees: 47,
    status: 'compliant' as ComplianceStatus,
  },
  iqama: {
    total: 32,
    expired: 1,
    expiringSoon: 3,
    valid: 28,
    status: 'warning' as ComplianceStatus,
  },
  upcomingDeadlines: [
    {
      id: '1',
      title: 'تسديد اشتراكات GOSI',
      date: '2024-02-15',
      daysLeft: 30,
      type: 'gosi',
      priority: 'medium',
    },
    {
      id: '2',
      title: 'رفع ملف WPS',
      date: '2024-02-10',
      daysLeft: 25,
      type: 'wps',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'تجديد إقامة - أحمد حسن',
      date: '2024-01-20',
      daysLeft: -5,
      type: 'iqama',
      priority: 'critical',
    },
    {
      id: '4',
      title: 'تجديد إقامة - محمد علي',
      date: '2024-01-30',
      daysLeft: 5,
      type: 'iqama',
      priority: 'high',
    },
    {
      id: '5',
      title: 'تقرير نطاقات الربع سنوي',
      date: '2024-03-31',
      daysLeft: 75,
      type: 'nitaqat',
      priority: 'low',
    },
  ],
}

export function ComplianceDashboardView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Navigation
  const topNav = [
    { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
    { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
    { title: 'الخدمات المصرفية', href: '/dashboard/finance/saudi-banking', isActive: true },
  ]

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get status color classes
  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'compliant':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle,
        }
      case 'warning':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: AlertTriangle,
        }
      case 'critical':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: AlertTriangle,
        }
      case 'non_compliant':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: AlertCircle,
        }
    }
  }

  // Get Nitaqat band color
  const getNitaqatColor = (band: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      platinum: { bg: 'bg-slate-700', text: 'text-white' },
      green_high: { bg: 'bg-emerald-600', text: 'text-white' },
      green_medium: { bg: 'bg-emerald-500', text: 'text-white' },
      green_low: { bg: 'bg-emerald-400', text: 'text-white' },
      yellow: { bg: 'bg-amber-400', text: 'text-slate-900' },
      red_low: { bg: 'bg-red-400', text: 'text-white' },
      red_high: { bg: 'bg-red-600', text: 'text-white' },
    }
    return colors[band] || { bg: 'bg-slate-200', text: 'text-slate-700' }
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">حرج</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700">مرتفع</Badge>
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-700">متوسط</Badge>
      case 'low':
        return <Badge className="bg-slate-100 text-slate-700">منخفض</Badge>
      default:
        return null
    }
  }

  // Calculate critical items count
  const criticalCount = MOCK_COMPLIANCE.upcomingDeadlines.filter(
    (d) => d.priority === 'critical' || d.priority === 'high'
  ).length

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            to={ROUTES.dashboard.finance.saudiBanking.index}
            className="text-slate-500 hover:text-emerald-600"
          >
            الخدمات المصرفية
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-400" />
          <span className="text-navy font-medium">لوحة الامتثال</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Shield className="h-7 w-7 text-emerald-600" />
              لوحة الامتثال التنظيمي
            </h1>
            <p className="text-slate-600 mt-1">
              متابعة شاملة للالتزام بالأنظمة السعودية
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="py-2 px-4">
              آخر تحديث: {formatDate(MOCK_COMPLIANCE.overall.lastUpdated)}
            </Badge>
            <Button variant="outline" className="rounded-xl">
              <RefreshCw className="h-4 w-4 ms-2" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Critical Alert */}
        {criticalCount > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800 font-bold">
              انتباه! يوجد {criticalCount} عناصر تتطلب إجراء فوري
            </AlertTitle>
            <AlertDescription className="text-red-700">
              راجع المواعيد النهائية القادمة واتخذ الإجراءات اللازمة لتجنب الغرامات.
            </AlertDescription>
          </Alert>
        )}

        {/* Overall Score & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Overall Compliance Score */}
          <Card className="rounded-2xl lg:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="fill-none stroke-slate-100"
                      strokeWidth="12"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="fill-none stroke-emerald-500"
                      strokeWidth="12"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={
                        2 * Math.PI * 48 * (1 - MOCK_COMPLIANCE.overall.score / 100)
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-navy">
                      {MOCK_COMPLIANCE.overall.score}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">درجة الامتثال الإجمالية</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-emerald-600">ملتزم</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    أنت في وضع جيد. حافظ على الالتزام.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GOSI Status */}
          <Card className="rounded-2xl">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <Banknote className="h-6 w-6 text-emerald-600" />
                <Badge className="bg-emerald-100 text-emerald-700">ملتزم</Badge>
              </div>
              <p className="font-bold text-navy">GOSI</p>
              <p className="text-sm text-slate-500">التأمينات الاجتماعية</p>
              <p className="text-xs text-slate-400 mt-2">
                الموعد القادم: {MOCK_COMPLIANCE.gosi.daysUntilDeadline} يوم
              </p>
            </CardContent>
          </Card>

          {/* WPS Status */}
          <Card className="rounded-2xl">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <Badge className="bg-emerald-100 text-emerald-700">ملتزم</Badge>
              </div>
              <p className="font-bold text-navy">WPS</p>
              <p className="text-sm text-slate-500">حماية الأجور</p>
              <p className="text-xs text-slate-400 mt-2">
                الموعد القادم: {MOCK_COMPLIANCE.wps.daysUntilDeadline} يوم
              </p>
            </CardContent>
          </Card>

          {/* Iqama Status */}
          <Card className="rounded-2xl">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <CreditCard className="h-6 w-6 text-orange-600" />
                <Badge className="bg-amber-100 text-amber-700">تحذير</Badge>
              </div>
              <p className="font-bold text-navy">الإقامات</p>
              <p className="text-sm text-slate-500">{MOCK_COMPLIANCE.iqama.total} إقامة</p>
              <p className="text-xs text-red-500 mt-2">
                {MOCK_COMPLIANCE.iqama.expired} منتهية • {MOCK_COMPLIANCE.iqama.expiringSoon} قريبة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Detailed Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nitaqat Section */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  نطاقات (السعودة)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`px-4 py-2 rounded-lg ${getNitaqatColor(MOCK_COMPLIANCE.nitaqat.band).bg} ${getNitaqatColor(MOCK_COMPLIANCE.nitaqat.band).text}`}
                      >
                        <Award className="h-5 w-5 inline ms-1" />
                        النطاق الأخضر
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">ملتزم</Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>نسبة السعودة الحالية</span>
                          <span className="font-bold text-emerald-600">
                            {MOCK_COMPLIANCE.nitaqat.saudizationRate}%
                          </span>
                        </div>
                        <Progress
                          value={MOCK_COMPLIANCE.nitaqat.saudizationRate}
                          className="h-3"
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>النسبة المطلوبة</span>
                        <span>{MOCK_COMPLIANCE.nitaqat.requiredRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {MOCK_COMPLIANCE.nitaqat.saudiEmployees}
                        </p>
                        <p className="text-sm text-slate-600">سعودي</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {MOCK_COMPLIANCE.nitaqat.totalEmployees -
                            MOCK_COMPLIANCE.nitaqat.saudiEmployees}
                        </p>
                        <p className="text-sm text-slate-600">غير سعودي</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GOSI Quick Link */}
              <Card className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <Link to={ROUTES.dashboard.finance.saudiBanking.gosi.index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <Banknote className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-navy">التأمينات الاجتماعية</p>
                          <p className="text-sm text-slate-500">
                            المستحق: {formatCurrency(MOCK_COMPLIANCE.gosi.amountDue)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* WPS Quick Link */}
              <Card className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <Link to={ROUTES.dashboard.finance.saudiBanking.wps.generate}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-navy">مولّد ملفات WPS</p>
                          <p className="text-sm text-slate-500">
                            {MOCK_COMPLIANCE.wps.employeesProcessed} موظف
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Iqama Quick Link */}
              <Card className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <Link to={ROUTES.dashboard.finance.saudiBanking.compliance.iqamaAlerts}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                          <CreditCard className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-bold text-navy">تنبيهات الإقامات</p>
                          <p className="text-sm text-red-500">
                            {MOCK_COMPLIANCE.iqama.expired + MOCK_COMPLIANCE.iqama.expiringSoon}{' '}
                            تحتاج انتباه
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Calculator Quick Link */}
              <Card className="rounded-2xl hover:shadow-md transition-shadow cursor-pointer">
                <Link to={ROUTES.dashboard.finance.saudiBanking.gosi.calculator}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <PieChart className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-navy">حاسبة GOSI</p>
                          <p className="text-sm text-slate-500">حساب الاشتراكات</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>

          {/* Right Column - Deadlines */}
          <div className="space-y-4">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-navy" />
                  المواعيد النهائية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_COMPLIANCE.upcomingDeadlines
                  .sort((a, b) => a.daysLeft - b.daysLeft)
                  .map((deadline) => (
                    <div
                      key={deadline.id}
                      className={`p-3 rounded-lg border ${
                        deadline.daysLeft < 0
                          ? 'bg-red-50 border-red-200'
                          : deadline.daysLeft <= 7
                            ? 'bg-orange-50 border-orange-200'
                            : deadline.daysLeft <= 30
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-navy text-sm">{deadline.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(deadline.date)}
                          </p>
                        </div>
                        <div className="text-left">
                          {getPriorityBadge(deadline.priority)}
                          <p
                            className={`text-xs mt-1 ${
                              deadline.daysLeft < 0 ? 'text-red-600 font-bold' : 'text-slate-500'
                            }`}
                          >
                            {deadline.daysLeft < 0
                              ? `متأخر ${Math.abs(deadline.daysLeft)} يوم`
                              : `${deadline.daysLeft} يوم`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* External Links */}
            <Card className="rounded-2xl bg-gradient-to-br from-navy to-navy/90">
              <CardContent className="p-4 text-white">
                <Shield className="h-8 w-8 mb-3 text-emerald-400" />
                <h4 className="font-bold mb-3">روابط مفيدة</h4>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://gosi.gov.sa', '_blank')}
                  >
                    <Building2 className="h-4 w-4 ms-2" />
                    بوابة التأمينات
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://mudad.com.sa', '_blank')}
                  >
                    <FileText className="h-4 w-4 ms-2" />
                    منصة مدد
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://mol.gov.sa', '_blank')}
                  >
                    <Users className="h-4 w-4 ms-2" />
                    وزارة الموارد البشرية
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open('https://absher.sa', '_blank')}
                  >
                    <CreditCard className="h-4 w-4 ms-2" />
                    أبشر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
