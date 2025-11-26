import { Plus, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useInvoiceTemplates, useSetDefaultTemplate } from '@/hooks/useInvoiceTemplates'
import { TemplatesProvider, useTemplatesContext } from './components/templates-provider'
import { TemplatesTable } from './components/templates-table'
import { TemplateActionDialog } from './components/template-action-dialog'
import { TemplateDeleteDialog } from './components/template-delete-dialog'
import { TemplateViewDialog } from './components/template-view-dialog'
import { TemplateDuplicateDialog } from './components/template-duplicate-dialog'
import { useTranslation } from 'react-i18next'

function InvoiceTemplatesContent() {
  const { t } = useTranslation()
  const {
    open,
    setOpen,
    currentTemplate,
    setCurrentTemplate,
  } = useTemplatesContext()

  const { data, isLoading } = useInvoiceTemplates()
  const setDefaultMutation = useSetDefaultTemplate()

  const templates = data?.data || []

  const handleAdd = () => {
    setCurrentTemplate(null)
    setOpen('add')
  }

  const handleCloseDialog = () => {
    setOpen(null)
    setCurrentTemplate(null)
  }

  const handleSetDefault = () => {
    if (currentTemplate) {
      setDefaultMutation.mutate(currentTemplate._id, {
        onSuccess: () => {
          setOpen(null)
          setCurrentTemplate(null)
        },
      })
    }
  }

  return (
    <>
      <Header>
        <Search />
        <div className="ms-auto flex items-center space-x-4 rtl:space-x-reverse">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('invoiceTemplates.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('invoiceTemplates.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="me-2 h-4 w-4" />
              {t('invoiceTemplates.import')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="me-2 h-4 w-4" />
              {t('invoiceTemplates.export')}
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="me-2 h-4 w-4" />
              {t('invoiceTemplates.addTemplate')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <TemplatesTable data={templates} />
        )}
      </Main>

      {/* Dialogs */}
      <TemplateActionDialog
        open={open === 'add' || open === 'edit'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateViewDialog
        open={open === 'view'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateDeleteDialog
        open={open === 'delete'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      <TemplateDuplicateDialog
        open={open === 'duplicate'}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        currentTemplate={currentTemplate}
      />

      {/* Set as default confirmation */}
      {open === 'settings' && currentTemplate && (
        <TemplateDeleteDialog
          open={false}
          onOpenChange={() => {}}
          currentTemplate={null}
        />
      )}
    </>
  )
}

export default function InvoiceTemplates() {
  return (
    <TemplatesProvider>
      <InvoiceTemplatesContent />
    </TemplatesProvider>
  )
}
