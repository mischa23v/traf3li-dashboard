import { useState, useEffect } from 'react'
import {
  Server, Mail, Lock, User, Send, Loader2, Eye, EyeOff, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  useSmtpConfig,
  useUpdateSmtpConfig,
  useTestSmtpConnection,
  useSendTestEmail
} from '@/hooks/useEmailSettings'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function SmtpConfigForm() {
  const { data: smtpConfig, isLoading } = useSmtpConfig()
  const updateMutation = useUpdateSmtpConfig()
  const testConnectionMutation = useTestSmtpConnection()
  const sendTestEmailMutation = useSendTestEmail()

  const [showPassword, setShowPassword] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    secure: 'TLS' as 'TLS' | 'SSL' | 'NONE',
    username: '',
    password: '',
    senderName: '',
    senderEmail: '',
    replyToEmail: '',
    isActive: true,
  })

  useEffect(() => {
    if (smtpConfig) {
      setFormData({
        host: smtpConfig.host || '',
        port: smtpConfig.port || 587,
        secure: smtpConfig.secure || 'TLS',
        username: smtpConfig.username || '',
        password: '',
        senderName: smtpConfig.senderName || '',
        senderEmail: smtpConfig.senderEmail || '',
        replyToEmail: smtpConfig.replyToEmail || '',
        isActive: smtpConfig.isActive ?? true,
      })
    }
  }, [smtpConfig])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 0 : value
    }))
  }

  const handleSecureChange = (value: string) => {
    setFormData(prev => ({ ...prev, secure: value as 'TLS' | 'SSL' | 'NONE' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Only include password if it's been changed
    const dataToSubmit = { ...formData }
    if (!dataToSubmit.password) {
      delete dataToSubmit.password
    }
    await updateMutation.mutateAsync(dataToSubmit)
  }

  const handleTestConnection = async () => {
    await testConnectionMutation.mutateAsync({
      host: formData.host,
      port: formData.port,
      secure: formData.secure,
      username: formData.username,
      password: formData.password,
    })
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) return
    await sendTestEmailMutation.mutateAsync({
      recipientEmail: testEmail,
      subject: 'بريد تجريبي - Test Email',
      body: 'هذا بريد إلكتروني تجريبي من نظام ترافلي لإدارة الفواتير.\n\nThis is a test email from Trafeli Invoice Management System.',
    })
    setShowTestDialog(false)
    setTestEmail('')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP Server Configuration */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              إعدادات خادم البريد (SMTP)
            </CardTitle>
            <CardDescription>
              قم بإعداد خادم البريد الإلكتروني لإرسال الفواتير والإشعارات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">عنوان الخادم (Host)</Label>
                <Input
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="smtp.gmail.com"
                  dir="ltr"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">المنفذ (Port)</Label>
                <Input
                  id="port"
                  name="port"
                  type="number"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="587"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secure">نوع التشفير</Label>
              <Select value={formData.secure} onValueChange={handleSecureChange}>
                <SelectTrigger id="secure">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TLS">TLS (موصى به)</SelectItem>
                  <SelectItem value="SSL">SSL</SelectItem>
                  <SelectItem value="NONE">بدون تشفير</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    dir="ltr"
                    className="pe-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    dir="ltr"
                    className="pe-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute start-2 top-1/2 -translate-y-1/2 h-7 px-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {smtpConfig?.password && !formData.password && (
                  <p className="text-xs text-slate-500">
                    اترك الحقل فارغاً للإبقاء على كلمة المرور الحالية
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={
                  !formData.host ||
                  !formData.username ||
                  (!formData.password && !smtpConfig?.password) ||
                  testConnectionMutation.isPending
                }
              >
                {testConnectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                ) : testConnectionMutation.isSuccess ? (
                  <CheckCircle2 className="h-4 w-4 ms-2 text-green-600" aria-hidden="true" />
                ) : (
                  <Server className="h-4 w-4 ms-2" aria-hidden="true" />
                )}
                اختبار الاتصال
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sender Information */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-blue" aria-hidden="true" />
              معلومات المرسل
            </CardTitle>
            <CardDescription>
              المعلومات التي تظهر في رسائل البريد المرسلة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">اسم المرسل</Label>
                <Input
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="شركة ترافلي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">بريد المرسل</Label>
                <Input
                  id="senderEmail"
                  name="senderEmail"
                  type="email"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  placeholder="info@company.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyToEmail">بريد الرد (اختياري)</Label>
              <Input
                id="replyToEmail"
                name="replyToEmail"
                type="email"
                value={formData.replyToEmail}
                onChange={handleChange}
                placeholder="support@company.com"
                dir="ltr"
              />
              <p className="text-xs text-slate-500">
                البريد الإلكتروني الذي يتم الرد عليه عند استلام الرسائل
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">تفعيل إرسال البريد</Label>
                <p className="text-sm text-slate-500">
                  السماح بإرسال رسائل البريد الإلكتروني
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, isActive: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowTestDialog(true)}
            disabled={!smtpConfig || !formData.isActive}
          >
            <Send className="h-4 w-4 ms-2" aria-hidden="true" />
            إرسال بريد تجريبي
          </Button>
          <Button
            type="submit"
            className="bg-brand-blue hover:bg-brand-blue/90"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 ms-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 ms-2" aria-hidden="true" />
            )}
            حفظ الإعدادات
          </Button>
        </div>
      </form>

      {/* Test Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إرسال بريد تجريبي</DialogTitle>
            <DialogDescription>
              أدخل البريد الإلكتروني لإرسال رسالة تجريبية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">البريد الإلكتروني</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTestDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSendTestEmail}
              disabled={!testEmail || sendTestEmailMutation.isPending}
            >
              {sendTestEmailMutation.isPending ? (
                <Loader2 className="h-4 w-4 ms-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 ms-2" aria-hidden="true" />
              )}
              إرسال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
