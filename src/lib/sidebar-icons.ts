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
 * Get Lucide icon component by name
 * Returns undefined if icon not found
 *
 * @param name - Icon name (case-sensitive)
 * @returns Lucide icon component or undefined
 */
export function getIcon(name: string | undefined): LucideIcon | undefined {
  if (!name) return undefined
  return ICON_MAP[name]
}

/**
 * Get Lucide icon component by name with fallback
 * Returns fallback icon if name not found
 *
 * @param name - Icon name (case-sensitive)
 * @param fallback - Fallback icon component
 * @returns Lucide icon component
 */
export function getIconOrFallback(
  name: string | undefined,
  fallback: LucideIcon
): LucideIcon {
  if (!name) return fallback
  return ICON_MAP[name] ?? fallback
}

export default ICON_MAP
