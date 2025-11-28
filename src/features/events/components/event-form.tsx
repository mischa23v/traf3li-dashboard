import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Repeat,
  DollarSign,
  Link2,
  CheckCircle,
  ChevronDown,
  Plus,
  Trash2,
  Building,
  Gavel
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
  eventFormSchema,
  type EventFormData,
  type EventType,
  type EventStatus,
  type CourtType,
  type MeetingPlatform,
  type LocationType,
  type AttendeeRole,
  type AttendeeResponseStatus,
  type BillingType,
  type RecurrenceFrequency,
  type RecurrenceEndType
} from '../types/event.types'

interface EventFormProps {
  onSubmit: (data: EventFormData) => Promise<void>
  onCancel?: () => void
  defaultValues?: Partial<EventFormData>
  isLoading?: boolean
}

export function EventForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false
}: EventFormProps) {
  const { t } = useTranslation()
  const [courtSectionOpen, setCourtSectionOpen] = useState(false)
  const [virtualMeetingSectionOpen, setVirtualMeetingSectionOpen] = useState(false)
  const [attendeesSectionOpen, setAttendeesSectionOpen] = useState(false)
  const [recurrenceSectionOpen, setRecurrenceSectionOpen] = useState(false)
  const [billingSectionOpen, setBillingSectionOpen] = useState(false)
  const [linksSectionOpen, setLinksSectionOpen] = useState(false)
  const [completionSectionOpen, setCompletionSectionOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      status: 'scheduled',
      type: 'other',
      locationType: 'physical',
      allDay: false,
      isBillable: true,
      recurringEnabled: false,
      followUpRequired: false,
      currency: 'SAR',
      ...defaultValues
    }
  })

  // Watched values for conditional rendering
  const eventType = watch('type')
  const locationType = watch('locationType')
  const startDate = watch('startDate')
  const isBillable = watch('isBillable')
  const billingType = watch('billingType')
  const recurringEnabled = watch('recurringEnabled')
  const recurringEndType = watch('recurringEndType')

  // Conditional display logic
  const showCourtSection = ['hearing', 'court_date'].includes(eventType || '')
  const showVirtualMeeting =
    locationType === 'virtual' || locationType === 'hybrid'
  const showCompletionSection =
    startDate && new Date(startDate) < new Date()
  const showHourlyRate = billingType === 'hourly'
  const showFixedAmount = billingType === 'fixed_fee'
  const showEndDate = recurringEndType === 'on_date'
  const showMaxOccurrences = recurringEndType === 'after_occurrences'

  // Auto-open court section when hearing/court_date is selected
  useEffect(() => {
    if (showCourtSection && !courtSectionOpen) {
      setCourtSectionOpen(true)
    }
  }, [eventType])

  // Auto-open virtual meeting section when virtual/hybrid is selected
  useEffect(() => {
    if (showVirtualMeeting && !virtualMeetingSectionOpen) {
      setVirtualMeetingSectionOpen(true)
    }
  }, [locationType])

  const onFormSubmit = async (data: EventFormData) => {
    await onSubmit(data)
  }

  // Event types
  const eventTypes: EventType[] = [
    'hearing',
    'court_date',
    'client_meeting',
    'consultation',
    'deadline',
    'deposition',
    'mediation',
    'arbitration',
    'settlement_conference',
    'filing',
    'internal_meeting',
    'training',
    'other'
  ]

  // Event statuses
  const eventStatuses: EventStatus[] = [
    'scheduled',
    'confirmed',
    'tentative',
    'canceled',
    'postponed',
    'completed'
  ]

  // Court types
  const courtTypes: CourtType[] = [
    'general_court',
    'criminal_court',
    'family_court',
    'commercial_court',
    'labor_court',
    'appeal_court',
    'supreme_court',
    'administrative_court',
    'enforcement_court'
  ]

  // Meeting platforms
  const meetingPlatforms: MeetingPlatform[] = [
    'zoom',
    'teams',
    'google_meet',
    'webex',
    'other'
  ]

  // Location types
  const locationTypes: LocationType[] = ['physical', 'virtual', 'hybrid']

  // Billing types
  const billingTypes: BillingType[] = [
    'hourly',
    'fixed_fee',
    'retainer',
    'pro_bono',
    'not_billable'
  ]

  // Recurrence frequencies
  const recurrenceFrequencies: RecurrenceFrequency[] = [
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'yearly'
  ]

  // Recurrence end types
  const recurrenceEndTypes: RecurrenceEndType[] = [
    'never',
    'after_occurrences',
    'on_date'
  ]

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-navy border-b pb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t('events.basicInfo', 'Basic Information')}
        </h3>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t('events.title', 'Event Title')} *</Label>
          <Input
            id="title"
            placeholder={t('events.titlePlaceholder', 'e.g., Court Hearing - Case #123')}
            {...register('title')}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            {t('events.description', 'Description')}
          </Label>
          <Textarea
            id="description"
            placeholder={t(
              'events.descriptionPlaceholder',
              'Enter event description...'
            )}
            rows={3}
            {...register('description')}
          />
        </div>

        {/* Type & Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('events.type', 'Event Type')} *</Label>
            <Select
              value={eventType}
              onValueChange={(v) => setValue('type', v as EventType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('events.selectType', 'Select type')} />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`events.types.${type}`, type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('events.status', 'Status')}</Label>
            <Select
              defaultValue="scheduled"
              onValueChange={(v) => setValue('status', v as EventStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`events.statuses.${status}`, status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              <Calendar className="inline h-4 w-4 ltr:mr-1 rtl:ml-1" />
              {t('events.startDate', 'Start Date')} *
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">
              <Clock className="inline h-4 w-4 ltr:mr-1 rtl:ml-1" />
              {t('events.startTime', 'Start Time')}
            </Label>
            <Input id="startTime" type="time" {...register('startTime')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">{t('events.endDate', 'End Date')}</Label>
            <Input id="endDate" type="date" {...register('endDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">{t('events.endTime', 'End Time')}</Label>
            <Input id="endTime" type="time" {...register('endTime')} />
          </div>
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="allDay"
            checked={watch('allDay')}
            onCheckedChange={(checked) => setValue('allDay', checked)}
          />
          <Label htmlFor="allDay">{t('events.allDay', 'All Day Event')}</Label>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-navy border-b pb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t('events.locationSection', 'Location')}
        </h3>

        <div className="space-y-2">
          <Label>{t('events.locationType', 'Location Type')}</Label>
          <Select
            value={locationType}
            onValueChange={(v) => setValue('locationType', v as LocationType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`events.locationTypes.${type}`, type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(locationType === 'physical' || locationType === 'hybrid') && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationAddress">
                {t('events.locationAddress', 'Address')}
              </Label>
              <Input
                id="locationAddress"
                placeholder={t('events.addressPlaceholder', 'Enter address...')}
                {...register('locationAddress')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationCity">
                {t('events.locationCity', 'City')}
              </Label>
              <Input
                id="locationCity"
                placeholder={t('events.cityPlaceholder', 'Enter city...')}
                {...register('locationCity')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationBuildingName">
                {t('events.buildingName', 'Building Name')}
              </Label>
              <Input
                id="locationBuildingName"
                {...register('locationBuildingName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationRoom">
                {t('events.room', 'Room/Hall')}
              </Label>
              <Input id="locationRoom" {...register('locationRoom')} />
            </div>
          </div>
        )}
      </div>

      {/* Court Section - Show conditionally */}
      {showCourtSection && (
        <Collapsible
          open={courtSectionOpen}
          onOpenChange={setCourtSectionOpen}
          className="bg-amber-50 dark:bg-amber-950/20 rounded-lg"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors">
            <span className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              {t('events.courtSection', 'Court Details')}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${courtSectionOpen ? 'rotate-180' : ''}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('events.courtType', 'Court Type')}</Label>
                <Select
                  onValueChange={(v) => setValue('courtType', v as CourtType)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('events.selectCourtType', 'Select court type')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {courtTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`events.courtTypes.${type}`, type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courtCaseNumber">
                  {t('events.courtCaseNumber', 'Case Number')}
                </Label>
                <Input
                  id="courtCaseNumber"
                  placeholder="e.g., 1234/2024"
                  {...register('courtCaseNumber')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseYear">
                  {t('events.caseYear', 'Case Year')}
                </Label>
                <Input
                  id="caseYear"
                  type="number"
                  placeholder="2024"
                  {...register('caseYear', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="najizCaseNumber">
                  {t('events.najizCaseNumber', 'Najiz Case Number')}
                </Label>
                <Input
                  id="najizCaseNumber"
                  {...register('najizCaseNumber')}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Virtual Meeting Section - Show conditionally */}
      {showVirtualMeeting && (
        <Collapsible
          open={virtualMeetingSectionOpen}
          onOpenChange={setVirtualMeetingSectionOpen}
          className="bg-blue-50 dark:bg-blue-950/20 rounded-lg"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              {t('events.virtualMeeting', 'Virtual Meeting')}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${virtualMeetingSectionOpen ? 'rotate-180' : ''}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('events.platform', 'Platform')}</Label>
                <Select
                  onValueChange={(v) =>
                    setValue('meetingPlatform', v as MeetingPlatform)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('events.selectPlatform', 'Select platform')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingPlatforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {t(`events.platforms.${platform}`, platform)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">
                  {t('events.meetingUrl', 'Meeting URL')}
                </Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  placeholder="https://..."
                  {...register('meetingUrl')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingId">
                  {t('events.meetingId', 'Meeting ID')}
                </Label>
                <Input id="meetingId" {...register('meetingId')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingPassword">
                  {t('events.meetingPassword', 'Password')}
                </Label>
                <Input
                  id="meetingPassword"
                  type="password"
                  {...register('meetingPassword')}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Recurrence Section */}
      <Collapsible
        open={recurrenceSectionOpen}
        onOpenChange={setRecurrenceSectionOpen}
        className="bg-purple-50 dark:bg-purple-950/20 rounded-lg"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
          <span className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            {t('events.recurrenceSection', 'Recurrence')}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${recurrenceSectionOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="recurringEnabled"
              checked={recurringEnabled}
              onCheckedChange={(checked) =>
                setValue('recurringEnabled', checked)
              }
            />
            <Label htmlFor="recurringEnabled">
              {t('events.enableRecurrence', 'Enable Recurrence')}
            </Label>
          </div>

          {recurringEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('events.recurringFrequency', 'Frequency')}</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue('recurringFrequency', v as RecurrenceFrequency)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('events.selectFrequency', 'Select frequency')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceFrequencies.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {t(`events.frequencies.${freq}`, freq)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('events.endType', 'End Type')}</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue('recurringEndType', v as RecurrenceEndType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('events.selectEndType', 'Select end type')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceEndTypes.map((endType) => (
                        <SelectItem key={endType} value={endType}>
                          {t(`events.endTypes.${endType}`, endType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showEndDate && (
                <div className="space-y-2">
                  <Label htmlFor="recurringEndDate">
                    {t('events.recurringEndDate', 'End Date')}
                  </Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    {...register('recurringEndDate')}
                  />
                </div>
              )}

              {showMaxOccurrences && (
                <div className="space-y-2">
                  <Label htmlFor="recurringMaxOccurrences">
                    {t('events.maxOccurrences', 'Number of Occurrences')}
                  </Label>
                  <Input
                    id="recurringMaxOccurrences"
                    type="number"
                    min={1}
                    {...register('recurringMaxOccurrences', {
                      valueAsNumber: true
                    })}
                  />
                </div>
              )}
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Billing Section */}
      <Collapsible
        open={billingSectionOpen}
        onOpenChange={setBillingSectionOpen}
        className="bg-green-50 dark:bg-green-950/20 rounded-lg"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
          <span className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t('events.billingSection', 'Billing')}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${billingSectionOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="isBillable"
              checked={isBillable}
              onCheckedChange={(checked) => setValue('isBillable', checked)}
            />
            <Label htmlFor="isBillable">
              {t('events.isBillable', 'Billable Event')}
            </Label>
          </div>

          {isBillable && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('events.billingType', 'Billing Type')}</Label>
                <Select
                  onValueChange={(v) =>
                    setValue('billingType', v as BillingType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('events.selectBillingType', 'Select billing type')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {billingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`events.billingTypes.${type}`, type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">
                  {t('events.currency', 'Currency')}
                </Label>
                <Select
                  defaultValue="SAR"
                  onValueChange={(v) => setValue('currency', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showHourlyRate && (
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">
                    {t('events.hourlyRate', 'Hourly Rate')}
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('hourlyRate', { valueAsNumber: true })}
                  />
                </div>
              )}

              {showFixedAmount && (
                <div className="space-y-2">
                  <Label htmlFor="fixedAmount">
                    {t('events.fixedAmount', 'Fixed Amount')}
                  </Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register('fixedAmount', { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Links Section */}
      <Collapsible
        open={linksSectionOpen}
        onOpenChange={setLinksSectionOpen}
        className="bg-slate-50 dark:bg-slate-950/20 rounded-lg"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/30 rounded-lg transition-colors">
          <span className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            {t('events.linksSection', 'Links')}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${linksSectionOpen ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskId">
                {t('events.linkedTask', 'Linked Task')}
              </Label>
              <Input
                id="taskId"
                placeholder={t('events.taskIdPlaceholder', 'Task ID...')}
                {...register('taskId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderId">
                {t('events.linkedReminder', 'Linked Reminder')}
              </Label>
              <Input
                id="reminderId"
                placeholder={t('events.reminderIdPlaceholder', 'Reminder ID...')}
                {...register('reminderId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseId">
                {t('events.linkedCase', 'Linked Case')}
              </Label>
              <Input
                id="caseId"
                placeholder={t('events.caseIdPlaceholder', 'Case ID...')}
                {...register('caseId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceId">
                {t('events.linkedInvoice', 'Linked Invoice')}
              </Label>
              <Input
                id="invoiceId"
                placeholder={t('events.invoiceIdPlaceholder', 'Invoice ID...')}
                {...register('invoiceId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">
                {t('events.linkedClient', 'Linked Client')}
              </Label>
              <Input
                id="clientId"
                placeholder={t('events.clientIdPlaceholder', 'Client ID...')}
                {...register('clientId')}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Completion Section - Show after event date */}
      {showCompletionSection && (
        <Collapsible
          open={completionSectionOpen}
          onOpenChange={setCompletionSectionOpen}
          className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-4 font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t('events.completion', 'Completion')}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${completionSectionOpen ? 'rotate-180' : ''}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outcome">
                {t('events.outcome', 'Outcome/Notes')}
              </Label>
              <Textarea
                id="outcome"
                placeholder={t(
                  'events.outcomePlaceholder',
                  'Enter the outcome of the event...'
                )}
                rows={3}
                {...register('outcome')}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="followUpRequired"
                checked={watch('followUpRequired')}
                onCheckedChange={(checked) =>
                  setValue('followUpRequired', checked)
                }
              />
              <Label htmlFor="followUpRequired">
                {t('events.followUpRequired', 'Follow-up Required')}
              </Label>
            </div>

            {watch('followUpRequired') && (
              <div className="space-y-2">
                <Label htmlFor="followUpNotes">
                  {t('events.followUpNotes', 'Follow-up Notes')}
                </Label>
                <Textarea
                  id="followUpNotes"
                  placeholder={t(
                    'events.followUpNotesPlaceholder',
                    'Enter follow-up notes...'
                  )}
                  rows={2}
                  {...register('followUpNotes')}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel', 'Cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-brand-blue hover:bg-blue-600"
        >
          {(isSubmitting || isLoading) && (
            <Loader2 className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
          )}
          {t('events.saveEvent', 'Save Event')}
        </Button>
      </div>
    </form>
  )
}
