import { useState } from 'react'
import { Mail, FileSignature, FileText, Settings } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { SmtpConfigForm } from './smtp-config-form'
import { EmailTemplatesList } from './email-templates-list'
import { EmailSignaturesManager } from './email-signatures-manager'

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('smtp')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">إعدادات البريد الإلكتروني</h1>
        <p className="text-slate-500">
          إدارة إعدادات البريد الإلكتروني وقوالب الرسائل والتوقيعات
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="smtp" className="gap-2">
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">إعدادات SMTP</span>
            <span className="sm:hidden">SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">القوالب</span>
            <span className="sm:hidden">القوالب</span>
          </TabsTrigger>
          <TabsTrigger value="signatures" className="gap-2">
            <FileSignature className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">التوقيعات</span>
            <span className="sm:hidden">التوقيع</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-6">
          <SmtpConfigForm />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplatesList />
        </TabsContent>

        <TabsContent value="signatures" className="space-y-6">
          <EmailSignaturesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
