import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Briefcase, Plus, Edit2, Trash2, CheckCircle, Calendar, Building2, TrendingUp, Lock } from 'lucide-react'
import { WorkHistoryDialog } from './WorkHistoryDialog'
import type { ExternalWorkHistory, InternalWorkHistory, ChangeType } from '@/services/hrService'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

interface WorkHistorySectionProps {
  externalWorkHistory: ExternalWorkHistory[]
  internalWorkHistory: InternalWorkHistory[]
  onAddExternal?: (history: Omit<ExternalWorkHistory, 'historyId'>) => void
  onEditExternal?: (historyId: string, history: Omit<ExternalWorkHistory, 'historyId'>) => void
  onDeleteExternal?: (historyId: string) => void
  readOnly?: boolean
}

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  joined: 'التحق',
  promoted: 'ترقية',
  transferred: 'نقل',
  redesignated: 'تغيير مسمى',
  demoted: 'تخفيض',
}

const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  joined: 'bg-blue-100 text-blue-700 border-blue-200',
  promoted: 'bg-green-100 text-green-700 border-green-200',
  transferred: 'bg-purple-100 text-purple-700 border-purple-200',
  redesignated: 'bg-amber-100 text-amber-700 border-amber-200',
  demoted: 'bg-red-100 text-red-700 border-red-200',
}

export function WorkHistorySection({
  externalWorkHistory,
  internalWorkHistory,
  onAddExternal,
  onEditExternal,
  onDeleteExternal,
  readOnly = false,
}: WorkHistorySectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<ExternalWorkHistory | null>(null)

  const handleAdd = () => {
    setSelectedHistory(null)
    setDialogOpen(true)
  }

  const handleEdit = (history: ExternalWorkHistory) => {
    setSelectedHistory(history)
    setDialogOpen(true)
  }

  const handleSave = (historyData: Omit<ExternalWorkHistory, 'historyId'>) => {
    if (selectedHistory && onEditExternal) {
      onEditExternal(selectedHistory.historyId, historyData)
    } else if (onAddExternal) {
      onAddExternal(historyData)
    }
    setDialogOpen(false)
    setSelectedHistory(null)
  }

  const handleDelete = (historyId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخبرة الوظيفية؟')) {
      onDeleteExternal?.(historyId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: arSA })
    } catch {
      return dateString
    }
  }

  return (
    <>
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            الخبرات الوظيفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="external" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="external">الخبرات الخارجية</TabsTrigger>
              <TabsTrigger value="internal">السجل الوظيفي الداخلي</TabsTrigger>
            </TabsList>

            {/* External Work History Tab */}
            <TabsContent value="external" className="mt-0">
              <div className="space-y-4">
                {!readOnly && (
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl w-full"
                  >
                    <Plus className="w-4 h-4 ms-1" />
                    إضافة خبرة خارجية
                  </Button>
                )}

                {externalWorkHistory && externalWorkHistory.length > 0 ? (
                  <div className="space-y-4">
                    {externalWorkHistory.map((history) => (
                      <div
                        key={history.historyId}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-navy">{history.companyNameAr}</h3>
                                <p className="text-sm text-slate-500" dir="ltr">{history.companyName}</p>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 me-4">
                              <div>
                                <span className="text-xs text-slate-500">المسمى الوظيفي:</span>
                                <p className="text-sm font-medium text-slate-900">{history.designationAr}</p>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500">المدة:</span>
                                <p className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {history.totalExperience}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500">من:</span>
                                <p className="text-sm font-medium text-slate-900">{formatDate(history.fromDate)}</p>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500">إلى:</span>
                                <p className="text-sm font-medium text-slate-900">{formatDate(history.toDate)}</p>
                              </div>
                              {history.salary && (
                                <div>
                                  <span className="text-xs text-slate-500">الراتب:</span>
                                  <p className="text-sm font-medium text-slate-900">
                                    {history.salary.toLocaleString('ar-SA')} {history.currency || 'SAR'}
                                  </p>
                                </div>
                              )}
                              {history.contactPerson && (
                                <div>
                                  <span className="text-xs text-slate-500">المرجع:</span>
                                  <p className="text-sm font-medium text-slate-900">{history.contactPerson}</p>
                                </div>
                              )}
                              {history.contactPhone && (
                                <div>
                                  <span className="text-xs text-slate-500">هاتف المرجع:</span>
                                  <p className="text-sm font-medium text-slate-900 flex items-center gap-1" dir="ltr">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    {history.contactPhone}
                                  </p>
                                </div>
                              )}
                              {history.reasonForLeaving && (
                                <div className="col-span-2">
                                  <span className="text-xs text-slate-500">سبب ترك العمل:</span>
                                  <p className="text-sm font-medium text-slate-900">{history.reasonForLeaving}</p>
                                </div>
                              )}
                            </div>

                            {/* Verification Badge */}
                            <div className="mt-3">
                              <Badge
                                className={
                                  history.verified
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                }
                              >
                                {history.verified ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 ms-1" />
                                    تم التحقق
                                  </>
                                ) : (
                                  'لم يتم التحقق'
                                )}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          {!readOnly && (
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(history)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(history.historyId)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-medium">لا توجد خبرات خارجية</p>
                    {!readOnly && (
                      <p className="text-sm mt-1">اضغط على "إضافة خبرة خارجية" لإضافة خبرات سابقة</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Internal Work History Tab */}
            <TabsContent value="internal" className="mt-0">
              {internalWorkHistory && internalWorkHistory.length > 0 ? (
                <div className="space-y-4">
                  {internalWorkHistory.map((history) => (
                    <div
                      key={history.historyId}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-navy">{history.designationAr}</h3>
                            <Badge className={CHANGE_TYPE_COLORS[history.changeType]}>
                              {CHANGE_TYPE_LABELS[history.changeType]}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                            <div>
                              <span className="text-xs text-slate-500">القسم:</span>
                              <p className="text-sm font-medium text-slate-900">{history.departmentName}</p>
                            </div>
                            {history.branch && (
                              <div>
                                <span className="text-xs text-slate-500">الفرع:</span>
                                <p className="text-sm font-medium text-slate-900">{history.branch}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-slate-500">من:</span>
                              <p className="text-sm font-medium text-slate-900">{formatDate(history.fromDate)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">إلى:</span>
                              <p className="text-sm font-medium text-slate-900">{formatDate(history.toDate)}</p>
                            </div>
                            {history.remarks && (
                              <div className="col-span-2">
                                <span className="text-xs text-slate-500">ملاحظات:</span>
                                <p className="text-sm font-medium text-slate-900">{history.remarks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="font-medium">لا يوجد سجل وظيفي داخلي</p>
                  <p className="text-sm mt-1">سيتم تعبئة هذا القسم تلقائياً عند الترقيات والنقل</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog */}
      <WorkHistoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workHistory={selectedHistory}
        onSave={handleSave}
      />
    </>
  )
}
