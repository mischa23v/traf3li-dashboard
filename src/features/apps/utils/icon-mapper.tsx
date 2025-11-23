import {
  IconTelegram,
  IconNotion,
  IconFigma,
  IconTrello,
  IconSlack,
  IconZoom,
  IconStripe,
  IconGmail,
  IconMedium,
  IconSkype,
  IconDocker,
  IconGithub,
  IconGitlab,
  IconDiscord,
  IconWhatsapp,
} from '@/assets/brand-icons'

const iconMap: Record<string, React.ReactNode> = {
  telegram: <IconTelegram />,
  notion: <IconNotion />,
  figma: <IconFigma />,
  trello: <IconTrello />,
  slack: <IconSlack />,
  zoom: <IconZoom />,
  stripe: <IconStripe />,
  gmail: <IconGmail />,
  medium: <IconMedium />,
  skype: <IconSkype />,
  docker: <IconDocker />,
  github: <IconGithub />,
  gitlab: <IconGitlab />,
  discord: <IconDiscord />,
  whatsapp: <IconWhatsapp />,
}

export const getAppIcon = (iconName: string): React.ReactNode => {
  const normalizedName = iconName.toLowerCase()
  return iconMap[normalizedName] || <IconNotion /> // Default icon
}
