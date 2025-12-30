import { useTranslation } from 'react-i18next'
import { ContentSection } from '../components/content-section'
import { ModulesForm } from './modules-form'

export function SettingsModules() {
  const { t } = useTranslation()

  return (
    <ContentSection
      title={t('settings.modules.title', 'الوحدات')}
      desc={t('settings.modules.description', 'اختر الوحدات التي تريد عرضها في القائمة الجانبية')}
    >
      <ModulesForm />
    </ContentSection>
  )
}
