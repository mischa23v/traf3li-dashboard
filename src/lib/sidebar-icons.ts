/**
 * Sidebar Icon Mapping
 * Maps string icon names to Lucide React components
 * Used for dynamic sidebar configuration from API
 */

import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Award,
  Banknote,
  BarChart,
  BarChart2,
  Bell,
  BookOpen,
  Box,
  Brain,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckSquare,
  Clock,
  Cog,
  CreditCard,
  FileCheck,
  FileInput,
  Files,
  FileText,
  FolderOpen,
  GanttChart,
  Gavel,
  GitBranch,
  HelpCircle,
  IdCard,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  List,
  Megaphone,
  Package,
  PenTool,
  PieChart,
  PiggyBank,
  Receipt,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Mapping of icon string names to Lucide components
 * Add new icons here as needed
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Basic section icons
  LayoutDashboard,
  Calendar,
  CalendarClock,
  CheckSquare,
  Briefcase,
  Users,
  BarChart2,

  // Module icons
  Zap,
  Scale,
  TrendingUp,
  Receipt,
  FolderOpen,
  BookOpen,
  Store,
  Landmark,
  ShieldCheck,
  Cog,

  // Item icons
  Bell,
  CalendarDays,
  GanttChart,
  GitBranch,
  Lightbulb,
  Brain,
  Clock,
  AlertTriangle,
  Activity,
  UserPlus,
  Megaphone,
  FileText,
  CreditCard,
  Wallet,
  Shield,
  Files,
  PenTool,
  Gavel,
  FileInput,
  Search,
  Award,
  Banknote,
  BarChart,
  ArrowLeftRight,
  FileCheck,
  List,
  PieChart,
  PiggyBank,
  Building,
  IdCard,
  Box,
  ShoppingCart,
  Building2,
  Package,

  // Footer icons
  Settings,
  HelpCircle,
}

/**
 * Default fallback icon for missing icons
 * HelpCircle is neutral and indicates "unknown"
 */
const DEFAULT_FALLBACK_ICON = HelpCircle

/**
 * Get Lucide icon component by name
 * Returns undefined if icon not found
 * Logs warning in DEV mode for missing icons to help catch API/config mismatches
 *
 * @param name - Icon name (case-sensitive)
 * @returns Lucide icon component or undefined
 */
export function getIcon(name: string | undefined): LucideIcon | undefined {
  if (!name) return undefined

  const icon = ICON_MAP[name]

  // Log warning in DEV mode if icon not found - helps catch API/config mismatches
  if (!icon && import.meta.env.DEV) {
    console.warn(
      `[SidebarIcons] Icon "${name}" not found in ICON_MAP. Add it to sidebar-icons.ts`
    )
  }

  return icon
}

/**
 * Get Lucide icon component by name with fallback
 * Returns fallback icon if name not found
 * Logs warning in DEV mode for missing icons
 *
 * @param name - Icon name (case-sensitive)
 * @param fallback - Fallback icon component (defaults to HelpCircle)
 * @returns Lucide icon component
 */
export function getIconOrFallback(
  name: string | undefined,
  fallback: LucideIcon = DEFAULT_FALLBACK_ICON
): LucideIcon {
  if (!name) return fallback

  const icon = ICON_MAP[name]

  // Log warning in DEV mode if using fallback
  if (!icon && import.meta.env.DEV) {
    console.warn(
      `[SidebarIcons] Icon "${name}" not found, using fallback. Add it to sidebar-icons.ts`
    )
  }

  return icon ?? fallback
}

/**
 * Get Lucide icon component by name, always returns an icon
 * Uses HelpCircle as default fallback - useful for production safety
 *
 * @param name - Icon name (case-sensitive)
 * @returns Lucide icon component (never undefined)
 */
export function getIconSafe(name: string | undefined): LucideIcon {
  return getIconOrFallback(name, DEFAULT_FALLBACK_ICON)
}

export default ICON_MAP
