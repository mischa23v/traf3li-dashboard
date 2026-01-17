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
import type { SidebarItem, SidebarModule } from '@/types/sidebar'
import type { NavItem, NavCollapsible } from './types'

/**
 * Helper to translate text - if it's a translation key (contains '.'), translate it
 */
function useTranslateText() {
  const { t } = useTranslation()
  return (text: string | undefined): string => {
    if (!text) return ''
    if (text.includes('.')) {
      return t(text)
    }
    return text
  }
}

/**
 * Transform SidebarItem to NavItem format
 * Note: Labels contain translation keys that will be translated by NavGroup
 */
function toNavItem(item: SidebarItem): NavItem {
  return {
    title: item.label, // Translation key - will be translated by consuming component
    url: item.path,
    icon: getIcon(item.icon),
    badge: item.badge?.toString(),
  }
}

/**
 * Transform SidebarModule to NavCollapsible format
 * Note: Labels contain translation keys that will be translated by NavGroup
 */
function toNavCollapsible(module: SidebarModule): NavCollapsible {
  return {
    title: module.label, // Translation key - will be translated by NavGroup
    icon: getIcon(module.icon),
    items: module.items.map((item) => ({
      title: item.label, // Translation key - will be translated by NavGroup
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
  const translateText = useTranslateText()
  const navItems = useMemo(() => items.map(toNavItem), [items])
  const translatedLabel = translateText(label)

  return (
    <SidebarGroup>
      {translatedLabel && <SidebarGroupLabel>{translatedLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = location.pathname === item.url
          const translatedTitle = translateText(item.title)
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={translatedTitle}>
                <Link to={item.url as string}>
                  {item.icon && <item.icon />}
                  <span>{translatedTitle}</span>
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
 * NavGroup handles translation internally
 */
function ModulesSection({
  modules,
  label,
}: {
  modules: SidebarModule[]
  label?: string
}) {
  // Transform all modules to collapsible items under single group
  // NavGroup component handles translation of titles internally
  const navItems = useMemo(
    () => modules.map(toNavCollapsible) as NavItem[],
    [modules]
  )

  return (
    <NavGroup title={label ?? 'sidebar.nav.sections.modules'} items={navItems} />
  )
}

/**
 * Other Section - Settings, Help items in main content area
 */
function OtherSection({
  items,
  label,
}: {
  items: SidebarItem[]
  label?: string
}) {
  const location = useLocation()
  const translateText = useTranslateText()
  const navItems = useMemo(() => items.map(toNavItem), [items])
  const translatedLabel = translateText(label)

  return (
    <SidebarGroup>
      {translatedLabel && <SidebarGroupLabel>{translatedLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = location.pathname === item.url
          const translatedTitle = translateText(item.title)
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={translatedTitle}>
                <Link to={item.url as string}>
                  {item.icon && <item.icon />}
                  <span>{translatedTitle}</span>
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
 * AppSidebar - Main sidebar component
 *
 * Renders three sections:
 * 1. Basic - Always visible items (Overview, Calendar, Tasks, etc.)
 * 2. Modules - Collapsible module groups (filtered by firm type)
 * 3. Other - Settings and Help in main content area
 *
 * All labels use translation keys that are resolved by the section components.
 */
export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const sidebarData = useSidebarData()
  const { sections } = sidebarData

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Basic Section - Always visible */}
        <BasicSection
          items={sections.basic.items}
          label={sections.basic.label}
        />

        {/* Modules Section - Collapsible groups filtered by firm type */}
        <ModulesSection
          modules={sections.modules.items}
          label={sections.modules.label}
        />

        {/* Other Section - Settings, Help */}
        <OtherSection
          items={sections.other.items}
          label={sections.other.label}
        />
      </SidebarContent>
      <SidebarFooter>
        {/* User section only */}
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
