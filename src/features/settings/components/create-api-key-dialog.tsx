import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarIcon, Key, Loader2, Shield, Clock } from 'lucide-react'
import { useCreateApiKey } from '@/hooks/useApiKeys'
import { API_KEY_SCOPES } from '@/services/apiKeysService'
import { CreatedKeyDisplay } from '@/components/api-key-display'

interface CreateApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateApiKeyDialog({ open, onOpenChange }: CreateApiKeyDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const createMutation = useCreateApiKey()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expiryDate, setExpiryDate] = useState<Date>(addDays(new Date(), 30))
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !createdKey) {
      setName('')
      setDescription('')
      setExpiryDate(addDays(new Date(), 30))
      setSelectedScopes([])
    }
  }, [open, createdKey])

  // Calculate expiry days
  const expiryDays = Math.max(
    1,
    Math.min(90, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  )

  const handleToggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || selectedScopes.length === 0) {
      return
    }

    const result = await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      expiryDays,
      scopes: selectedScopes,
    })

    if (result?.fullKey) {
      setCreatedKey(result.fullKey)
    }
  }

  const handleClose = () => {
    setCreatedKey(null)
    onOpenChange(false)
  }

  // If key was created, show it
  if (createdKey) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-500" />
              {t('apiKeys.keyCreated')}
            </DialogTitle>
            <DialogDescription>
              {t('apiKeys.keyCreatedDescription')}
            </DialogDescription>
          </DialogHeader>
          <CreatedKeyDisplay apiKey={createdKey} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            {t('apiKeys.createNewKey')}
          </DialogTitle>
          <DialogDescription>
            {t('apiKeys.createKeyDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Key Name */}
          <div className="space-y-2">
            <Label htmlFor="key-name">
              {t('apiKeys.keyName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('apiKeys.keyNamePlaceholder')}
              required
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {t('apiKeys.keyNameHint')}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="key-description">
              {t('apiKeys.keyDescription')}
            </Label>
            <Textarea
              id="key-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('apiKeys.keyDescriptionPlaceholder')}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>
              {t('apiKeys.expiryDate')} <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !expiryDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  {expiryDate ? (
                    format(expiryDate, 'PPP', { locale: isRTL ? ar : undefined })
                  ) : (
                    <span>{t('apiKeys.selectDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={(date) => date && setExpiryDate(date)}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const maxDate = addDays(today, 90)
                    return date < today || date > maxDate
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {t('apiKeys.expiresIn', { days: expiryDays })}
              </span>
            </div>
          </div>

          {/* Quick Expiry Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpiryDate(addDays(new Date(), 1))}
            >
              {t('apiKeys.1day')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpiryDate(addDays(new Date(), 7))}
            >
              {t('apiKeys.7days')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpiryDate(addDays(new Date(), 30))}
            >
              {t('apiKeys.30days')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setExpiryDate(addDays(new Date(), 90))}
            >
              {t('apiKeys.90days')}
            </Button>
          </div>

          {/* Permissions/Scopes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <Label>
                {t('apiKeys.permissions')} <span className="text-red-500">*</span>
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('apiKeys.permissionsHint')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border p-4 max-h-[300px] overflow-y-auto">
              {API_KEY_SCOPES.map((scope) => (
                <div key={scope.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={scope.value}
                    checked={selectedScopes.includes(scope.value)}
                    onCheckedChange={() => handleToggleScope(scope.value)}
                  />
                  <label
                    htmlFor={scope.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {isRTL ? scope.labelAr : scope.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedScopes.length === 0 && (
              <p className="text-xs text-red-500">
                {t('apiKeys.selectAtLeastOnePermission')}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || selectedScopes.length === 0 || createMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
                  {t('apiKeys.creating')}
                </>
              ) : (
                <>
                  <Key className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  {t('apiKeys.createKey')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
