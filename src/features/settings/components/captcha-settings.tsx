/**
 * CAPTCHA Settings Component
 * Admin configuration for CAPTCHA protection on login and other forms
 * Supports reCAPTCHA v2/v3 and hCaptcha
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { toast } from '@/hooks/use-toast'
import {
  getCaptchaSettings,
  updateCaptchaSettings,
} from '@/services/captchaService'
import type { CaptchaSettings } from '@/components/auth/captcha-config'
import {
  CaptchaProvider,
  CaptchaMode,
  CAPTCHA_PROVIDER_LABELS,
  CAPTCHA_MODE_LABELS,
} from '@/components/auth/captcha-config'

export function CaptchaSettingsComponent() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Local state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<CaptchaSettings | null>(null)
  const [showSecrets, setShowSecrets] = useState(false)

  // Form state
  const [enabled, setEnabled] = useState(false)
  const [provider, setProvider] = useState<CaptchaProvider>('recaptcha-v3')
  const [mode, setMode] = useState<CaptchaMode>('invisible')
  const [threshold, setThreshold] = useState(0.5)
  const [requireAfterFailedAttempts, setRequireAfterFailedAttempts] = useState(3)
  const [alwaysForNewDevices, setAlwaysForNewDevices] = useState(false)
  const [riskScoreThreshold, setRiskScoreThreshold] = useState(50)
  const [recaptchaV2SiteKey, setRecaptchaV2SiteKey] = useState('')
  const [recaptchaV3SiteKey, setRecaptchaV3SiteKey] = useState('')
  const [hcaptchaSiteKey, setHcaptchaSiteKey] = useState('')

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const data = await getCaptchaSettings()
      setSettings(data)

      // Update form state
      setEnabled(data.enabled)
      setProvider(data.provider)
      setMode(data.mode)
      setThreshold(data.threshold)
      setRequireAfterFailedAttempts(data.requireAfterFailedAttempts)
      setAlwaysForNewDevices(data.alwaysForNewDevices)
      setRiskScoreThreshold(data.riskScoreThreshold)
      setRecaptchaV2SiteKey(data.recaptchaV2SiteKey || '')
      setRecaptchaV3SiteKey(data.recaptchaV3SiteKey || '')
      setHcaptchaSiteKey(data.hcaptchaSiteKey || '')
    } catch (error) {
      console.error('Failed to load CAPTCHA settings:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL
          ? 'فشل تحميل إعدادات CAPTCHA'
          : 'Failed to load CAPTCHA settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const updatedSettings: Partial<CaptchaSettings> = {
        enabled,
        provider,
        mode,
        threshold,
        requireAfterFailedAttempts,
        alwaysForNewDevices,
        riskScoreThreshold,
        recaptchaV2SiteKey: recaptchaV2SiteKey || undefined,
        recaptchaV3SiteKey: recaptchaV3SiteKey || undefined,
        hcaptchaSiteKey: hcaptchaSiteKey || undefined,
      }

      await updateCaptchaSettings(updatedSettings)

      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL
          ? 'تم حفظ إعدادات CAPTCHA بنجاح'
          : 'CAPTCHA settings saved successfully',
      })

      // Reload settings
      await loadSettings()
    } catch (error) {
      console.error('Failed to save CAPTCHA settings:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL
          ? 'فشل حفظ إعدادات CAPTCHA'
          : 'Failed to save CAPTCHA settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-full' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-primary' />
            <CardTitle>
              {isRTL ? 'إعدادات CAPTCHA' : 'CAPTCHA Settings'}
            </CardTitle>
          </div>
          <CardDescription>
            {isRTL
              ? 'تكوين حماية CAPTCHA لنماذج تسجيل الدخول والتسجيل'
              : 'Configure CAPTCHA protection for login and registration forms'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enable/Disable CAPTCHA */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex-1'>
              <Label htmlFor='captcha-enabled' className='text-base font-medium'>
                {isRTL ? 'تفعيل CAPTCHA' : 'Enable CAPTCHA'}
              </Label>
              <p className='text-sm text-muted-foreground'>
                {isRTL
                  ? 'تفعيل حماية CAPTCHA لتسجيل الدخول'
                  : 'Enable CAPTCHA protection for login'}
              </p>
            </div>
            <Switch
              id='captcha-enabled'
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              <Separator />

              {/* Provider Selection */}
              <div className='space-y-2'>
                <Label htmlFor='captcha-provider'>
                  {isRTL ? 'مزود CAPTCHA' : 'CAPTCHA Provider'}
                </Label>
                <Select
                  value={provider}
                  onValueChange={(value) => setProvider(value as CaptchaProvider)}
                >
                  <SelectTrigger id='captcha-provider'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='recaptcha-v2'>
                      {CAPTCHA_PROVIDER_LABELS['recaptcha-v2']}
                    </SelectItem>
                    <SelectItem value='recaptcha-v3'>
                      {CAPTCHA_PROVIDER_LABELS['recaptcha-v3']}
                    </SelectItem>
                    <SelectItem value='hcaptcha'>
                      {CAPTCHA_PROVIDER_LABELS['hcaptcha']}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mode Selection (only for v2 and hCaptcha) */}
              {provider !== 'recaptcha-v3' && (
                <div className='space-y-2'>
                  <Label htmlFor='captcha-mode'>
                    {isRTL ? 'وضع CAPTCHA' : 'CAPTCHA Mode'}
                  </Label>
                  <Select
                    value={mode}
                    onValueChange={(value) => setMode(value as CaptchaMode)}
                  >
                    <SelectTrigger id='captcha-mode'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='checkbox'>
                        {CAPTCHA_MODE_LABELS['checkbox']}
                      </SelectItem>
                      <SelectItem value='invisible'>
                        {CAPTCHA_MODE_LABELS['invisible']}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Site Keys */}
              <Separator />
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='text-base font-medium'>
                    {isRTL ? 'مفاتيح الموقع' : 'Site Keys'}
                  </Label>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <>
                        <EyeOff className='mr-2 h-4 w-4' />
                        {isRTL ? 'إخفاء' : 'Hide'}
                      </>
                    ) : (
                      <>
                        <Eye className='mr-2 h-4 w-4' />
                        {isRTL ? 'إظهار' : 'Show'}
                      </>
                    )}
                  </Button>
                </div>

                {/* reCAPTCHA v2 Site Key */}
                <div className='space-y-2'>
                  <Label htmlFor='recaptcha-v2-key'>
                    {isRTL ? 'مفتاح موقع reCAPTCHA v2' : 'reCAPTCHA v2 Site Key'}
                  </Label>
                  <Input
                    id='recaptcha-v2-key'
                    type={showSecrets ? 'text' : 'password'}
                    value={recaptchaV2SiteKey}
                    onChange={(e) => setRecaptchaV2SiteKey(e.target.value)}
                    placeholder={isRTL ? 'أدخل مفتاح الموقع' : 'Enter site key'}
                  />
                </div>

                {/* reCAPTCHA v3 Site Key */}
                <div className='space-y-2'>
                  <Label htmlFor='recaptcha-v3-key'>
                    {isRTL ? 'مفتاح موقع reCAPTCHA v3' : 'reCAPTCHA v3 Site Key'}
                  </Label>
                  <Input
                    id='recaptcha-v3-key'
                    type={showSecrets ? 'text' : 'password'}
                    value={recaptchaV3SiteKey}
                    onChange={(e) => setRecaptchaV3SiteKey(e.target.value)}
                    placeholder={isRTL ? 'أدخل مفتاح الموقع' : 'Enter site key'}
                  />
                </div>

                {/* hCaptcha Site Key */}
                <div className='space-y-2'>
                  <Label htmlFor='hcaptcha-key'>
                    {isRTL ? 'مفتاح موقع hCaptcha' : 'hCaptcha Site Key'}
                  </Label>
                  <Input
                    id='hcaptcha-key'
                    type={showSecrets ? 'text' : 'password'}
                    value={hcaptchaSiteKey}
                    onChange={(e) => setHcaptchaSiteKey(e.target.value)}
                    placeholder={isRTL ? 'أدخل مفتاح الموقع' : 'Enter site key'}
                  />
                </div>

                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    {isRTL
                      ? 'يمكنك الحصول على مفاتيح API من لوحة تحكم مزود CAPTCHA الخاص بك'
                      : 'You can get API keys from your CAPTCHA provider dashboard'}
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Trigger Settings */}
              <div className='space-y-4'>
                <Label className='text-base font-medium'>
                  {isRTL ? 'إعدادات التفعيل' : 'Trigger Settings'}
                </Label>

                {/* Failed Attempts Threshold */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='failed-attempts'>
                      {isRTL
                        ? 'عدد المحاولات الفاشلة قبل عرض CAPTCHA'
                        : 'Failed attempts before showing CAPTCHA'}
                    </Label>
                    <span className='text-sm font-medium'>{requireAfterFailedAttempts}</span>
                  </div>
                  <Slider
                    id='failed-attempts'
                    min={1}
                    max={10}
                    step={1}
                    value={[requireAfterFailedAttempts]}
                    onValueChange={([value]) => setRequireAfterFailedAttempts(value)}
                  />
                </div>

                {/* Risk Score Threshold */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='risk-threshold'>
                      {isRTL
                        ? 'حد درجة المخاطر (0-100)'
                        : 'Risk score threshold (0-100)'}
                    </Label>
                    <span className='text-sm font-medium'>{riskScoreThreshold}</span>
                  </div>
                  <Slider
                    id='risk-threshold'
                    min={0}
                    max={100}
                    step={5}
                    value={[riskScoreThreshold]}
                    onValueChange={([value]) => setRiskScoreThreshold(value)}
                  />
                </div>

                {/* Always for New Devices */}
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='flex-1'>
                    <Label htmlFor='new-devices' className='font-medium'>
                      {isRTL ? 'دائماً للأجهزة الجديدة' : 'Always for new devices'}
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      {isRTL
                        ? 'عرض CAPTCHA دائماً للأجهزة غير المعروفة'
                        : 'Always show CAPTCHA for unrecognized devices'}
                    </p>
                  </div>
                  <Switch
                    id='new-devices'
                    checked={alwaysForNewDevices}
                    onCheckedChange={setAlwaysForNewDevices}
                  />
                </div>

                {/* reCAPTCHA v3 Threshold */}
                {provider === 'recaptcha-v3' && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='recaptcha-threshold'>
                        {isRTL
                          ? 'حد رeCAPTCHA v3 (0.0-1.0)'
                          : 'reCAPTCHA v3 threshold (0.0-1.0)'}
                      </Label>
                      <span className='text-sm font-medium'>{threshold.toFixed(1)}</span>
                    </div>
                    <Slider
                      id='recaptcha-threshold'
                      min={0}
                      max={1}
                      step={0.1}
                      value={[threshold]}
                      onValueChange={([value]) => setThreshold(value)}
                    />
                    <p className='text-xs text-muted-foreground'>
                      {isRTL
                        ? 'درجة أعلى = أمان أكثر، درجة أقل = تجربة مستخدم أفضل'
                        : 'Higher score = more security, lower score = better UX'}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Save Button */}
          <div className='flex justify-end gap-2'>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className='min-w-[120px]'
            >
              {isSaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {isRTL ? 'حفظ' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            {isRTL ? 'معلومات CAPTCHA' : 'CAPTCHA Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          <div>
            <h4 className='font-medium mb-2'>
              {isRTL ? 'متى يتم عرض CAPTCHA:' : 'When CAPTCHA is shown:'}
            </h4>
            <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
              <li>
                {isRTL
                  ? 'بعد عدد محدد من محاولات تسجيل الدخول الفاشلة'
                  : 'After a specified number of failed login attempts'}
              </li>
              <li>
                {isRTL
                  ? 'دائماً للأجهزة الجديدة (إذا تم تفعيله)'
                  : 'Always for new devices (if enabled)'}
              </li>
              <li>
                {isRTL
                  ? 'عندما تكون درجة المخاطر أعلى من الحد المحدد'
                  : 'When risk score exceeds the threshold'}
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium mb-2'>
              {isRTL ? 'أنواع CAPTCHA:' : 'CAPTCHA Types:'}
            </h4>
            <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
              <li>
                <strong>reCAPTCHA v2:</strong>{' '}
                {isRTL
                  ? 'التحقق التقليدي بالنقر على مربع الاختيار'
                  : 'Traditional checkbox verification'}
              </li>
              <li>
                <strong>reCAPTCHA v3:</strong>{' '}
                {isRTL
                  ? 'تحقق غير مرئي يعتمد على درجة المخاطر'
                  : 'Invisible verification based on risk score'}
              </li>
              <li>
                <strong>hCaptcha:</strong>{' '}
                {isRTL
                  ? 'بديل يركز على الخصوصية لـ reCAPTCHA'
                  : 'Privacy-focused alternative to reCAPTCHA'}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CaptchaSettingsComponent
