import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { useSidebarData } from '@/hooks/use-sidebar-data'
import { getIcon } from '@/lib/sidebar-icons'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { Link, useLocation } from '@tanstack/react-router'
import type { SidebarItem, SidebarModule, RecentItem } from '@/types/sidebar'
import type { NavItem, NavCollapsible } from './types'

/**
 * Transform SidebarItem to NavItem format
 * Maps string icon names to Lucide components
 */
function toNavItem(item: SidebarItem): NavItem {
  return {
    title: item.label,
    url: item.path,
    icon: getIcon(item.icon),
    badge: item.badge?.toString(),
  }
}

/**
 * Transform SidebarModule to NavCollapsible format
 */
function toNavCollapsible(module: SidebarModule): NavCollapsible {
  return {
    title: module.label,
    icon: getIcon(module.icon),
    items: module.items.map((item) => ({
      title: item.label,
      url: item.path,
      icon: getIcon(item.icon),
      badge: item.badge?.toString(),
    })),
  }
}

/**
 * Basic Section - Always visible, flat items
 */
function BasicSection({
  items,
  label,
}: {
  items: SidebarItem[]
  label?: string
}) {
  const location = useLocation()
  const navItems = useMemo(() => items.map(toNavItem), [items])

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = location.pathname === item.url
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link to={item.url as string}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

/**
 * Recents Section - Shows recently visited pages
 * Only renders if there are recent items
 */
function RecentsSection({
  items,
  label,
  labelAr,
}: {
  items: RecentItem[]
  label: string
  labelAr?: string
}) {
  const { i18n } = useTranslation()
  const location = useLocation()
  const isArabic = i18n.language === 'ar'
  const displayLabel = isArabic && labelAr ? labelAr : label

  if (items.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{displayLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = getIcon(item.icon)
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                <Link to={item.path}>
                  {Icon && <Icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

/**
 * Modules Section - Collapsible module groups under single "Modules" label
 */
function ModulesSection({
  modules,
  label,
  labelAr,
}: {
  modules: SidebarModule[]
  label?: string
  labelAr?: string
}) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const displayLabel = isArabic && labelAr ? labelAr : label

  // Transform all modules to collapsible items under single group
  const navItems = useMemo(
    () => modules.map(toNavCollapsible) as NavItem[],
    [modules]
  )

  return (
    <NavGroup title={displayLabel ?? 'Modules'} items={navItems} />
  )
}

/**
 * Footer Section - Settings, Help icons
 */
function FooterSection({ items }: { items: SidebarItem[] }) {
  const { i18n } = useTranslation()
  const location = useLocation()
  const isArabic = i18n.language === 'ar'

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = location.pathname === item.path
        const Icon = getIcon(item.icon)
        const label = isArabic ? item.labelAr : item.label
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
              <Link to={item.path}>
                {Icon && <Icon />}
                <span>{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/**
 * AppSidebar - Main sidebar component
 *
 * Renders four sections:
 * 1. Basic - Always visible items (Overview, Calendar, Tasks, etc.)
 * 2. Recents - Recently visited pages (conditional)
 * 3. Modules - Collapsible module groups (filtered by firm type)
 * 4. Footer - Settings and Help in footer area
 */
export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { i18n } = useTranslation()
  const sidebarData = useSidebarData()
  const { sections } = sidebarData
  const isArabic = i18n.language === 'ar'

  // Get localized labels
  const basicLabel = isArabic
    ? sections.basic.labelAr
    : sections.basic.label
  const recentsLabel = isArabic
    ? sections.recents.labelAr
    : sections.recents.label

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Basic Section - Always visible */}
        <BasicSection
          items={sections.basic.items}
          label={basicLabel}
        />

        {/* Recents Section - Only if there are recents */}
        <RecentsSection
          items={sections.recents.items}
          label={recentsLabel ?? 'Recents'}
          labelAr={sections.recents.labelAr}
        />

        {/* Modules Section - Collapsible groups filtered by firm type */}
        <ModulesSection
          modules={sections.modules.items}
          label={sections.modules.label}
          labelAr={sections.modules.labelAr}
        />
      </SidebarContent>
      <SidebarFooter>
        {/* Footer Items - Settings, Help */}
        <FooterSection items={sections.footer.items} />
        {/* User section */}
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
