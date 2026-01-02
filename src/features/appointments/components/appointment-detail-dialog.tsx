/**
 * Appointment Detail Dialog
 * Shared dialog component for displaying appointment details
 * Used in both calendar view and appointments page
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Phone,
  MapPin,
  Video,
  User,
  FileText,
  Trash2,
  Pencil,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useCancelAppointment,
  useConfirmAppointment,
  useCompleteAppointment,
} from '@/hooks/useAppointments'

// Types
export interface AppointmentDetail {
  id: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  date: string
  startTime: string
  endTime: string
  type: 'consultation' | 'follow_up' | 'case_review' | 'initial_meeting' | 'other'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  locationType?: 'in_person' | 'video' | 'phone'
  location?: string
  notes?: string
  subject?: string
}

interface AppointmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentDetail | null
  onEdit?: (appointment: AppointmentDetail) => void
  onReschedule?: (appointment: AppointmentDetail) => void
  onDelete?: (appointment: AppointmentDetail) => void
}

// Status configuration
const STATUS_CONFIG = {
  pending: { labelAr: 'معلق', labelEn: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed: { labelAr: 'مجدول', labelEn: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

// Type configuration
const TYPE_CONFIG = {
  consultation: { labelAr: 'استشارة', labelEn: 'Consultation', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  follow_up: { labelAr: 'متابعة', labelEn: 'Follow Up', color: 'bg-green-100 text-green-700 border-green-200' },
  case_review: { labelAr: 'مراجعة قضية', labelEn: 'Case Review', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  initial_meeting: { labelAr: 'اجتماع أولي', labelEn: 'Initial Meeting', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  other: { labelAr: 'أخرى', labelEn: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

// Location type icons
const LOCATION_ICONS = {
  in_person: MapPin,
  video: Video,
  phone: Phone,
}

const LOCATION_LABELS = {
  in_person: { ar: 'حضوري', en: 'In Person' },
  video: { ar: 'فيديو', en: 'Video' },
  phone: { ar: 'هاتفي', en: 'Phone' },
}

// Mask email for privacy
function maskEmail(email: string): string {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(local.length - 1, 4))
  const [domainName, ext] = domain.split('.')
  const maskedDomain = domainName.charAt(0) + '*'.repeat(Math.max(domainName.length - 1, 3))
  return `${maskedLocal}@${maskedDomain}.${ext}`
}

// Mask phone for privacy
function maskPhone(phone: string): string {
  if (!phone) return ''
  // Keep first 4 and last 3 digits, mask the middle
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.length <= 7) return phone
  const firstPart = cleaned.slice(0, 4)
  const lastPart = cleaned.slice(-3)
  const middleLength = cleaned.length - 7
  return `${firstPart}${'*'.repeat(middleLength)}${lastPart}`
}

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onEdit,
  onReschedule,
  onDelete,
}: AppointmentDetailDialogProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  const cancelMutation = useCancelAppointment()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!appointment) return null

  // Safely get config with fallbacks for unknown types/statuses
  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending
  const typeConfig = TYPE_CONFIG[appointment.type] || TYPE_CONFIG.other
  const LocationIcon = appointment.locationType ? LOCATION_ICONS[appointment.locationType] : MapPin
  const locationLabel = appointment.locationType
    ? LOCATION_LABELS[appointment.locationType]
    : null

  // Format date
  const appointmentDate = appointment.date ? new Date(appointment.date) : null
  const formattedDate = appointmentDate
    ? format(appointmentDate, 'EEEE، d MMMM yyyy', { locale })
    : ''

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(appointment)
      return
    }

    setIsDeleting(true)
    try {
      await cancelMutation.mutateAsync({ id: appointment.id })
      toast.success(isRtl ? 'تم حذف الموعد' : 'Appointment deleted')
      onOpenChange(false)
    } catch (error) {
      toast.error(isRtl ? 'فشل حذف الموعد' : 'Failed to delete appointment')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment)
    }
  }

  const handleReschedule = () => {
    if (onReschedule) {
      onReschedule(appointment)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {appointment.clientName}
                </DialogTitle>
                {/* Status badges */}
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn('text-xs font-medium border', typeConfig.color)}>
                    {isRtl ? typeConfig.labelAr : typeConfig.labelEn}
                  </Badge>
                  <Badge className={cn('text-xs font-medium border', statusConfig.color)}>
                    {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full -mt-2 -me-2 hover:bg-slate-100"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-4 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3 text-slate-600">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <span className="text-sm">{formattedDate}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 text-slate-600">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-sm" dir="ltr">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>

          {/* Email */}
          {appointment.clientEmail && (
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-5 h-5 text-slate-400" />
              <span className="text-sm" dir="ltr">
                {maskEmail(appointment.clientEmail)}
              </span>
            </div>
          )}

          {/* Phone */}
          {appointment.clientPhone && (
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-5 h-5 text-slate-400" />
              <span className="text-sm" dir="ltr">
                {maskPhone(appointment.clientPhone)}
              </span>
            </div>
          )}

          {/* Location Type */}
          {locationLabel && (
            <div className="flex items-center gap-3 text-slate-600">
              <LocationIcon className="w-5 h-5 text-slate-400" />
              <span className="text-sm">
                {isRtl ? locationLabel.ar : locationLabel.en}
              </span>
            </div>
          )}

          {/* Subject/Notes */}
          {(appointment.subject || appointment.notes) && (
            <div className="bg-slate-50 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    {isRtl ? 'الموضوع:' : 'Subject:'}
                  </span>
                  <p className="text-sm text-slate-600 mt-1">
                    {appointment.subject || appointment.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="p-4 flex items-center justify-center gap-3">
          {/* Reschedule */}
          <Button
            variant="outline"
            onClick={handleReschedule}
            className="flex-1 rounded-xl h-11 gap-2 border-slate-200 hover:bg-slate-50"
            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
          >
            <RefreshCw className="w-4 h-4" />
            {isRtl ? 'إعادة جدولة' : 'Reschedule'}
          </Button>

          {/* Edit */}
          <Button
            variant="outline"
            onClick={handleEdit}
            className="flex-1 rounded-xl h-11 gap-2 border-slate-200 hover:bg-slate-50"
            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
          >
            <Pencil className="w-4 h-4" />
            {isRtl ? 'تعديل' : 'Edit'}
          </Button>

          {/* Delete */}
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 rounded-xl h-11 gap-2 bg-red-500 hover:bg-red-600"
            disabled={isDeleting || appointment.status === 'completed'}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isRtl ? 'حذف' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentDetailDialog
