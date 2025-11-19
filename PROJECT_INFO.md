# TRAF3LI Dashboard - Complete Project Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routing System](#routing-system)
- [Features & Pages](#features--pages)
- [Design System](#design-system)
- [State Management](#state-management)
- [Internationalization](#internationalization)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Code Organization](#code-organization)

---

## 🚀 Project Overview

**TRAF3LI Dashboard** is a modern, bilingual (Arabic/English) admin dashboard built with React and TypeScript. It features RTL/LTR support, dark/light themes, and follows PDPL (Personal Data Protection Law) compliance principles.

### Key Highlights
- **Name**: TRAF3LI Dashboard
- **Type**: SPA (Single Page Application)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

### Hosting & URLs
- **Frontend URL**: Deployed on Vercel/Netlify
- **API Base URL**: `https://traf3li-api-production.up.railway.app`
- **Local Dev**: `http://localhost:5173`

### Configuration Files
- **Vercel**: `vercel.json` - SPA fallback routing
- **Netlify**: `netlify.toml` - Build & redirect configuration

---

## 🛠 Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Library |
| **TypeScript** | 5.6.3 | Type Safety |
| **Vite** | 6.0.1 | Build Tool & Dev Server |
| **TanStack Router** | 1.87.3 | File-based routing |
| **TanStack Query** | 5.62.8 | Server state management |
| **Zustand** | 5.0.2 | Client state management |

### UI & Styling
| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS** | 3.4.16 - Utility-first styling |
| **Radix UI** | Headless accessible components |
| **shadcn/ui** | Pre-built component library |
| **Lucide React** | Icon library |
| **Recharts** | Chart & visualization library |

### Forms & Validation
| Technology | Purpose |
|-----------|---------|
| **React Hook Form** | 7.54.1 - Form management |
| **Zod** | 3.24.1 - Schema validation |

### Authentication
| Technology | Purpose |
|-----------|---------|
| **Clerk** | Authentication & user management |

### Internationalization
| Technology | Purpose |
|-----------|---------|
| **i18next** | Translation framework |
| **react-i18next** | React bindings for i18next |

### Development & Testing
| Technology | Purpose |
|-----------|---------|
| **ESLint** | Code linting |
| **Playwright** | E2E testing |
| **TypeScript** | Static type checking |

---

## 📁 Project Structure

```
traf3li-dashboard/
├── src/
│   ├── assets/              # Static assets (logos, icons, images)
│   │   ├── brand-icons/     # Brand logos (Slack, Google, etc.)
│   │   ├── custom/          # Custom icons
│   │   └── logo.tsx         # App logo component
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui components (61 components)
│   │   ├── layout/          # Layout components
│   │   │   ├── app-sidebar.tsx         # Main sidebar
│   │   │   ├── authenticated-layout.tsx # Authenticated pages wrapper
│   │   │   ├── header.tsx              # Header component
│   │   │   ├── main.tsx                # Main content wrapper
│   │   │   ├── nav-group.tsx           # Navigation group
│   │   │   ├── nav-item.tsx            # Navigation item
│   │   │   ├── page-wrapper.tsx        # Page container
│   │   │   ├── sidebar-toggle.tsx      # Sidebar toggle button
│   │   │   ├── team-switcher.tsx       # Team selector
│   │   │   ├── top-nav.tsx             # Top navigation
│   │   │   └── data/
│   │   │       └── sidebar-data.ts     # Sidebar navigation config
│   │   ├── data-table/      # Reusable table components
│   │   └── ...              # Other shared components
│   │
│   ├── context/             # React context providers
│   │   ├── direction-provider.tsx    # RTL/LTR direction context
│   │   ├── layout-provider.tsx       # Layout state
│   │   ├── search-provider.tsx       # Global search
│   │   └── theme-provider.tsx        # Dark/light theme
│   │
│   ├── features/            # Feature-based modules (61 files)
│   │   ├── auth/            # Authentication features
│   │   │   ├── sign-in/     # Sign in page & components
│   │   │   ├── sign-up/     # Sign up page & components
│   │   │   ├── otp/         # OTP verification
│   │   │   └── forgot-password/ # Password reset
│   │   ├── dashboard/       # Dashboard feature
│   │   │   ├── index.tsx    # Main dashboard page
│   │   │   └── components/  # Dashboard-specific components
│   │   ├── apps/            # App integrations page
│   │   ├── chats/           # Chat feature
│   │   ├── tasks/           # Task management
│   │   ├── users/           # User management
│   │   ├── settings/        # Settings pages
│   │   │   ├── profile/
│   │   │   ├── account/
│   │   │   ├── appearance/
│   │   │   ├── notifications/
│   │   │   └── display/
│   │   └── errors/          # Error pages
│   │       ├── forbidden.tsx
│   │       ├── general-error.tsx
│   │       ├── not-found.tsx
│   │       └── unauthorized-error.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.ts              # Auth hook
│   │   ├── use-mobile.tsx           # Mobile detection
│   │   ├── use-sidebar-data.ts      # Dynamic sidebar data
│   │   ├── use-sidebar.tsx          # Sidebar state
│   │   ├── use-table-url-state.ts   # Table state in URL
│   │   └── use-toast.ts             # Toast notifications
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts                   # Axios API client
│   │   ├── clerk.ts                 # Clerk configuration
│   │   ├── handle-server-error.ts   # Error handling
│   │   ├── query-client.ts          # TanStack Query setup
│   │   └── utils.ts                 # Helper functions
│   │
│   ├── locales/             # i18n translations
│   │   ├── ar/
│   │   │   └── translation.json     # Arabic translations
│   │   └── en/
│   │       └── translation.json     # English translations
│   │
│   ├── routes/              # File-based routing (TanStack Router)
│   │   ├── __root.tsx               # Root route
│   │   ├── _authenticated/          # Protected routes
│   │   │   ├── route.tsx            # Auth guard
│   │   │   ├── index.tsx            # Dashboard (/)
│   │   │   ├── apps/
│   │   │   │   └── index.tsx        # Apps page (/apps)
│   │   │   ├── chats/
│   │   │   │   └── index.tsx        # Chats page (/chats)
│   │   │   ├── tasks/
│   │   │   │   └── index.tsx        # Tasks page (/tasks)
│   │   │   ├── users/
│   │   │   │   └── index.tsx        # Users page (/users)
│   │   │   ├── settings/
│   │   │   │   ├── index.tsx        # Settings profile
│   │   │   │   ├── account.tsx      # Account settings
│   │   │   │   ├── appearance.tsx   # Appearance settings
│   │   │   │   ├── display.tsx      # Display settings
│   │   │   │   └── notifications.tsx # Notification settings
│   │   │   └── extra-components.tsx
│   │   ├── (auth)/          # Auth routes (no layout)
│   │   │   ├── sign-in.tsx          # Sign in page
│   │   │   ├── sign-up.tsx          # Sign up page
│   │   │   ├── otp.tsx              # OTP verification
│   │   │   └── forgot-password.tsx   # Password reset
│   │   ├── clerk/           # Clerk authentication routes
│   │   └── errors/          # Error pages routes
│   │
│   ├── services/            # API services
│   │   └── authService.ts           # Authentication API calls
│   │
│   ├── stores/              # Zustand stores
│   │   └── auth-store.ts            # Auth state management
│   │
│   ├── styles/              # Global styles
│   │   └── index.css                # Tailwind imports & globals
│   │
│   ├── i18n.ts              # i18n configuration
│   ├── main.tsx             # App entry point
│   └── routeTree.gen.ts     # Auto-generated route tree (719 lines)
│
├── context/                 # Documentation & design
│   ├── design-principles.md # UI/UX design guidelines
│   └── masterplan.md        # Project roadmap & features
│
├── test/                    # Test files
│   └── .env                 # Test environment variables
│
├── .env.example             # Environment variables template
├── CLAUDE.md                # Claude AI instructions
├── README.md                # Project documentation
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── playwright.config.ts     # Playwright E2E config
├── netlify.toml             # Netlify deployment config
└── vercel.json              # Vercel deployment config
```

---

## 🧭 Routing System

### Router: TanStack Router (File-based)

TanStack Router uses a **file-based routing system** where the file structure defines routes automatically.

### Route Structure

#### Root Route
**File**: `src/routes/__root.tsx`
**Purpose**: Provides app-wide layout and context providers
**Features**:
- Theme provider
- Direction provider (RTL/LTR)
- Layout provider
- Search provider
- i18n initialization

#### Public Routes (Unauthenticated)
**Folder**: `src/routes/(auth)/`
**Layout**: No sidebar/header (auth-only layout)

| Route | File | Component | Purpose |
|-------|------|-----------|---------|
| `/sign-in` | `(auth)/sign-in.tsx` | `SignIn` | User login |
| `/sign-up` | `(auth)/sign-up.tsx` | `SignUp` | User registration |
| `/otp` | `(auth)/otp.tsx` | `OTP` | OTP verification |
| `/forgot-password` | `(auth)/forgot-password.tsx` | `ForgotPassword` | Password reset |

#### Protected Routes (Authenticated)
**Folder**: `src/routes/_authenticated/`
**Layout**: Full dashboard layout (sidebar + header)
**Auth Guard**: `src/routes/_authenticated/route.tsx`

| Route | File | Component | Description |
|-------|------|-----------|-------------|
| `/` | `_authenticated/index.tsx` | `Dashboard` | Main dashboard with analytics |
| `/apps` | `_authenticated/apps/index.tsx` | `Apps` | App integrations management |
| `/chats` | `_authenticated/chats/index.tsx` | `Chats` | Chat/messaging interface |
| `/tasks` | `_authenticated/tasks/index.tsx` | `Tasks` | Task management with table |
| `/users` | `_authenticated/users/index.tsx` | `Users` | User management table |
| `/settings` | `_authenticated/settings/index.tsx` | `Settings` (Profile) | Settings layout + profile |
| `/settings/account` | `_authenticated/settings/account.tsx` | `SettingsAccount` | Account settings |
| `/settings/appearance` | `_authenticated/settings/appearance.tsx` | `SettingsAppearance` | Theme & appearance |
| `/settings/display` | `_authenticated/settings/display.tsx` | `SettingsDisplay` | Display preferences |
| `/settings/notifications` | `_authenticated/settings/notifications.tsx` | `SettingsNotifications` | Notification settings |

#### Clerk Routes
**Folder**: `src/routes/clerk/`
**Purpose**: Clerk authentication integration

| Route | File | Purpose |
|-------|------|---------|
| `/clerk/sign-in` | `clerk/(auth)/sign-in.tsx` | Clerk sign-in |
| `/clerk/sign-up` | `clerk/(auth)/sign-up.tsx` | Clerk sign-up |
| `/user-management` | `clerk/_authenticated/user-management.tsx` | Clerk user management |

#### Error Routes
**Folder**: `src/routes/errors/`

| Route | Component | HTTP Status |
|-------|-----------|-------------|
| `/403` | `Forbidden` | 403 Forbidden |
| `/404` | `NotFound` | 404 Not Found |
| `/500` | `GeneralError` | 500 Server Error |
| `/401` | `UnauthorizedError` | 401 Unauthorized |

### URL Search Parameters (Query Params)

#### Apps Page (`/apps`)
```typescript
{
  type?: 'all' | 'connected' | 'notConnected',
  filter?: string,           // Search filter
  sort?: 'asc' | 'desc'      // Sort order
}
```

#### Tasks Page (`/tasks`)
```typescript
{
  page?: number,             // Current page (default: 1)
  pageSize?: number,         // Items per page (default: 10)
  status?: string[],         // Filter by status
  priority?: string[],       // Filter by priority
  filter?: string            // Search filter
}
```

#### Users Page (`/users`)
```typescript
{
  page?: number,             // Current page (default: 1)
  pageSize?: number,         // Items per page (default: 10)
  status?: string[],         // Filter by status
  role?: string[],           // Filter by role
  username?: string          // Username filter
}
```

### Route Generation
The router automatically generates a route tree in:
**File**: `src/routeTree.gen.ts` (719 lines)
**Note**: This file is auto-generated and should not be manually edited.

---

## 🎨 Features & Pages

### 1. Dashboard (`/`)
**File**: `src/features/dashboard/index.tsx`
**Location**: Displays on home page for authenticated users

#### Purpose
Main analytics dashboard showing key metrics and insights

#### Components Used
- `<Header />` - Top navigation
- `<Main />` - Content container
- `<Search />` - Global search
- `<ThemeSwitch />` - Theme toggle
- `<ConfigDrawer />` - Configuration panel
- `<ProfileDropdown />` - User profile menu
- Dashboard-specific cards and charts

#### Features
- Overview statistics
- Recent activity
- Data visualizations (using Recharts)
- Real-time updates via TanStack Query

#### Code Structure
```typescript
// src/features/dashboard/index.tsx
export function Dashboard() {
  return (
    <>
      <Header>
        {/* Top navigation */}
      </Header>
      <Main>
        {/* Dashboard content */}
      </Main>
    </>
  )
}
```

---

### 2. Apps Page (`/apps`)
**File**: `src/features/apps/index.tsx`
**Route**: `/_authenticated/apps/`

#### Purpose
Manage third-party app integrations (Slack, Google, etc.)

#### Features
- Grid view of available apps
- Filter by connection status (All, Connected, Not Connected)
- Search apps by name
- Sort apps (A-Z, Z-A)
- Connect/disconnect apps

#### Search Parameters
```typescript
{
  type: 'all' | 'connected' | 'notConnected',
  filter: string,    // Search term
  sort: 'asc' | 'desc'
}
```

#### Code Location
- **Route**: `src/routes/_authenticated/apps/index.tsx`
- **Feature**: `src/features/apps/index.tsx`
- **Data**: `src/features/apps/data/apps.ts`

#### Component Breakdown
```typescript
// Uses TanStack Router search params
const { filter, type, sort } = route.useSearch()

// Filters apps based on search params
const filteredApps = apps
  .sort((a, b) => sort === 'asc' ? a.name.localeCompare(b.name) : ...)
  .filter(app => appType === 'connected' ? app.connected : ...)
  .filter(app => app.name.toLowerCase().includes(searchTerm))
```

#### UI Components
- `<Input />` - Search filter
- `<Select />` - Type & sort dropdowns
- `<Button />` - Connect/disconnect actions
- App cards with logo, name, description

---

### 3. Tasks Page (`/tasks`)
**File**: `src/features/tasks/index.tsx`
**Route**: `/_authenticated/tasks/`

#### Purpose
Task management with advanced filtering and table view

#### Features
- Paginated data table
- Multi-column filtering (status, priority)
- Search functionality
- Column sorting
- Task CRUD operations
- Task dialogs for create/edit/delete

#### Search Parameters
```typescript
{
  page: number,          // Pagination
  pageSize: number,      // Items per page
  status: string[],      // Multiple status filters
  priority: string[],    // Multiple priority filters
  filter: string         // Search term
}
```

#### Code Location
- **Route**: `src/routes/_authenticated/tasks/index.tsx`
- **Feature**: `src/features/tasks/index.tsx`
- **Components**: `src/features/tasks/components/`
  - `tasks-table.tsx` - Main table
  - `tasks-dialogs.tsx` - CRUD dialogs
  - `tasks-provider.tsx` - Task context
  - `tasks-primary-buttons.tsx` - Action buttons
- **Data**: `src/features/tasks/data/tasks.ts`

#### Component Structure
```typescript
<TasksProvider>
  <Header>
    {/* Top nav */}
  </Header>
  <Main>
    <TasksPrimaryButtons /> {/* Add new task */}
    <TasksTable data={tasks} />
  </Main>
  <TasksDialogs /> {/* Modals */}
</TasksProvider>
```

#### Table Features
Uses custom data table component from `src/components/data-table/`
- Column definitions
- Faceted filters
- Pagination
- Row selection
- Sortable columns

---

### 4. Users Page (`/users`)
**File**: `src/features/users/index.tsx`
**Route**: `/_authenticated/users/`

#### Purpose
User management with role-based access control

#### Features
- User table with filtering
- Status filters (active, inactive, invited, suspended)
- Role-based filtering
- Username search
- Pagination
- User CRUD operations

#### Search Parameters
```typescript
{
  page: number,
  pageSize: number,
  status: ('active' | 'inactive' | 'invited' | 'suspended')[],
  role: string[],
  username: string
}
```

#### Code Location
- **Route**: `src/routes/_authenticated/users/index.tsx`
- **Feature**: `src/features/users/index.tsx`
- **Components**: `src/features/users/components/`
- **Data**: `src/features/users/data/data.ts`

---

### 5. Chats Page (`/chats`)
**File**: `src/features/chats/index.tsx`
**Route**: `/_authenticated/chats/`

#### Purpose
Chat/messaging interface

#### Code Location
- **Route**: `src/routes/_authenticated/chats/index.tsx`
- **Feature**: `src/features/chats/index.tsx`
- **Components**: `src/features/chats/components/`
- **Data**: `src/features/chats/data/`

---

### 6. Settings Pages (`/settings`)
**File**: `src/features/settings/index.tsx`
**Route**: `/_authenticated/settings/`

#### Layout
Settings uses a **sidebar navigation** pattern with nested routes

#### Sidebar Navigation
```typescript
const sidebarNavItems = [
  { title: 'Profile', href: '/settings', icon: <UserCog /> },
  { title: 'Account', href: '/settings/account', icon: <Wrench /> },
  { title: 'Appearance', href: '/settings/appearance', icon: <Palette /> },
  { title: 'Notifications', href: '/settings/notifications', icon: <Bell /> },
  { title: 'Display', href: '/settings/display', icon: <Monitor /> },
]
```

#### Settings Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/settings` | `SettingsProfile` | User profile settings |
| `/settings/account` | `SettingsAccount` | Account management |
| `/settings/appearance` | `SettingsAppearance` | Theme customization |
| `/settings/notifications` | `SettingsNotifications` | Notification preferences |
| `/settings/display` | `SettingsDisplay` | Display options |

#### Code Location
- **Main**: `src/features/settings/index.tsx`
- **Subpages**:
  - `src/features/settings/profile/`
  - `src/features/settings/account/`
  - `src/features/settings/appearance/`
  - `src/features/settings/notifications/`
  - `src/features/settings/display/`

#### Layout Structure
```typescript
<Settings>
  <Header /> {/* Top nav */}
  <Main>
    <h1>Settings</h1>
    <Separator />
    <div className="flex">
      <aside>
        <SidebarNav items={sidebarNavItems} />
      </aside>
      <div>
        <Outlet /> {/* Nested route content */}
      </div>
    </div>
  </Main>
</Settings>
```

---

### 7. Authentication Pages

#### Sign In (`/sign-in`)
**File**: `src/features/auth/sign-in/index.tsx`

#### Sign Up (`/sign-up`)
**File**: `src/features/auth/sign-up/index.tsx`

#### OTP Verification (`/otp`)
**File**: `src/features/auth/otp/index.tsx`

#### Forgot Password (`/forgot-password`)
**File**: `src/features/auth/forgot-password/index.tsx`

#### Code Location
All auth features are in `src/features/auth/`

---

## 🎨 Design System

### Design Methodology

#### 1. Design Tokens
The project uses **Tailwind CSS** with custom theme configuration.

#### Theme Structure
Located in: `src/styles/index.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark theme tokens */
  }
}
```

#### 2. Component Library: shadcn/ui
The project uses **shadcn/ui** - a collection of re-usable components built with:
- **Radix UI** for accessibility
- **Tailwind CSS** for styling
- **TypeScript** for type safety

**Location**: `src/components/ui/` (61 components)

#### Available UI Components
```
accordion.tsx       input.tsx           select.tsx
alert-dialog.tsx    kbd.tsx             separator.tsx
alert.tsx           label.tsx           sheet.tsx
avatar.tsx          menubar.tsx         sidebar.tsx
badge.tsx           navigation-menu.tsx skeleton.tsx
breadcrumb.tsx      pagination.tsx      slider.tsx
button.tsx          popover.tsx         sonner.tsx
calendar.tsx        progress.tsx        switch.tsx
card.tsx            radio-group.tsx     table.tsx
carousel.tsx        resizable.tsx       tabs.tsx
chart.tsx           scroll-area.tsx     textarea.tsx
checkbox.tsx        select.tsx          toast.tsx
collapsible.tsx     separator.tsx       toggle-group.tsx
command.tsx         sheet.tsx           toggle.tsx
context-menu.tsx    sidebar.tsx         tooltip.tsx
dialog.tsx          skeleton.tsx
dropdown-menu.tsx   sonner.tsx
form.tsx            switch.tsx
hover-card.tsx      table.tsx
input-otp.tsx       tabs.tsx
input.tsx           textarea.tsx
```

#### 3. Layout Components
**Location**: `src/components/layout/`

| Component | Purpose |
|-----------|---------|
| `app-sidebar.tsx` | Main application sidebar |
| `authenticated-layout.tsx` | Layout wrapper for protected pages |
| `header.tsx` | Page header with search & actions |
| `main.tsx` | Main content container |
| `nav-group.tsx` | Navigation group with collapsible items |
| `nav-item.tsx` | Individual navigation item |
| `page-wrapper.tsx` | Page container with padding |
| `sidebar-toggle.tsx` | Sidebar collapse/expand button |
| `team-switcher.tsx` | Team/workspace selector |
| `top-nav.tsx` | Top navigation bar |

#### 4. Design Principles
**File**: `context/design-principles.md`

Key principles:
- **Accessibility**: WCAG AA compliance
- **RTL/LTR Support**: Full bidirectional text support
- **Responsive**: Mobile-first design
- **Dark Mode**: System preference support
- **PDPL Compliance**: Data protection compliance

#### 5. Theming System

##### Theme Provider
**File**: `src/context/theme-provider.tsx`

Features:
- Light/Dark/System modes
- localStorage persistence
- System preference detection

Usage:
```typescript
const { theme, setTheme } = useTheme()
```

##### Direction Provider
**File**: `src/context/direction-provider.tsx`

Features:
- RTL/LTR direction support
- Arabic/English language switching
- Document direction attribute management

Usage:
```typescript
const { direction, setDirection } = useDirection()
```

---

### Sidebar Navigation Structure

The sidebar is **dynamically generated** based on user permissions and configuration.

**Data Source**: `src/components/layout/data/sidebar-data.ts`
**Hook**: `src/hooks/use-sidebar-data.ts`
**Component**: `src/components/layout/app-sidebar.tsx`

#### Sidebar Configuration
```typescript
// src/components/layout/data/sidebar-data.ts
export const sidebarData: Sidebar = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navGroups: [
    {
      title: "Platform",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Apps",
          url: "/apps",
          icon: SquareTerminal,
        },
        {
          title: "Chats",
          url: "/chats",
          icon: MessageSquare,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: CheckSquare,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        // ... more items
      ],
    },
    // ... more groups
  ],
}
```

#### Dynamic Sidebar Hook
**File**: `src/hooks/use-sidebar-data.ts`

This hook:
- Fetches user permissions
- Filters sidebar items based on roles
- Adds i18n translations
- Returns customized navigation

---

## 🗂 State Management

### 1. Client State (Zustand)

#### Auth Store
**File**: `src/stores/auth-store.ts`

Manages authentication state:
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
```

#### Usage
```typescript
import { useAuthStore } from '@/stores/auth-store'

const { user, isAuthenticated, login, logout } = useAuthStore()
```

### 2. Server State (TanStack Query)

**File**: `src/lib/query-client.ts`

Configuration:
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      gcTime: 5 * 60 * 1000,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

#### Usage Example
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => api.get('/tasks'),
})
```

### 3. URL State (Search Params)

**Hook**: `src/hooks/use-table-url-state.ts`

Syncs table state (filters, sorting, pagination) with URL params

#### Usage
```typescript
const { page, pageSize, filters, updateFilters } = useTableUrlState()
```

---

## 🌍 Internationalization (i18n)

### Configuration
**File**: `src/i18n.ts`

#### Supported Languages
- **English (en)** - LTR
- **Arabic (ar)** - RTL

#### Translation Files
- `src/locales/en/translation.json`
- `src/locales/ar/translation.json`

#### Setup
```typescript
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
```

#### Usage
```typescript
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()

// Change language
i18n.changeLanguage('ar')

// Translate
<h1>{t('dashboard.title')}</h1>
```

#### RTL/LTR Support
The `DirectionProvider` automatically sets document direction based on language:
- Arabic (`ar`) → RTL
- English (`en`) → LTR

```typescript
// Automatically applied
<html dir="rtl"> {/* for Arabic */}
<html dir="ltr"> {/* for English */}
```

---

## 🔐 Authentication

### Authentication Methods

#### 1. Custom Auth (Primary)
**Service**: `src/services/authService.ts`
**Store**: `src/stores/auth-store.ts`
**API**: `https://traf3li-api-production.up.railway.app`

##### API Endpoints
```typescript
POST /auth/login              // Login
POST /auth/register           // Register
POST /auth/logout             // Logout
POST /auth/refresh-token      // Refresh token
POST /auth/verify-otp         // OTP verification
POST /auth/forgot-password    // Password reset request
POST /auth/reset-password     // Password reset
```

##### Auth Service Methods
```typescript
export const authService = {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: (refreshToken: string) => Promise<TokenResponse>
  verifyOtp: (otp: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
}
```

##### Token Management
- **Access Token**: Stored in memory
- **Refresh Token**: Stored in httpOnly cookie (secure)
- **Auto-refresh**: Before token expiry

#### 2. Clerk (Alternative)
**Library**: `@clerk/tanstack-start`
**Config**: `src/lib/clerk.ts`

Clerk provides:
- Social auth (Google, GitHub, etc.)
- Email/password auth
- Magic links
- Session management
- User profile management

##### Clerk Routes
```
/clerk/sign-in        - Clerk sign in
/clerk/sign-up        - Clerk sign up
/user-management      - User management dashboard
```

---

### Auth Guard

**File**: `src/routes/_authenticated/route.tsx`

Protects all routes under `_authenticated/`:

```typescript
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
```

---

## 🌐 API Integration

### API Client
**File**: `src/lib/api.ts`

#### Axios Instance
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

#### Request Interceptor
```typescript
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

#### Response Interceptor
```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      await refreshToken()
    }
    return Promise.reject(error)
  }
)
```

### Environment Variables
**File**: `.env.example`

```bash
# API Configuration
VITE_API_URL=https://traf3li-api-production.up.railway.app

# Clerk Authentication (optional)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Feature Flags
VITE_ENABLE_CLERK=false
```

---

## 🚀 Deployment

### Frontend Hosting

#### Vercel (Primary)
**Config**: `vercel.json`

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Features:
- Automatic deployments from GitHub
- Preview deployments for PRs
- Edge network (CDN)
- Custom domains

#### Netlify (Alternative)
**Config**: `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Backend API

**Host**: Railway
**URL**: https://traf3li-api-production.up.railway.app

### Build Commands

```bash
# Development
npm run dev             # Start dev server (localhost:5173)

# Production
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:e2e        # Run Playwright E2E tests

# Linting
npm run lint            # ESLint
```

---

## 📦 Code Organization

### File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `app-sidebar.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `handle-server-error.ts`)
- **Types**: `types.ts` or `*.types.ts`
- **Data**: `data.ts` or in `data/` folder

### Import Aliases

Configured in `tsconfig.json`:

```typescript
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
```

### Folder Structure Philosophy

#### Feature-Based Organization
Each feature has its own folder with:
```
features/
  ├── feature-name/
  │   ├── index.tsx           # Main component
  │   ├── components/         # Feature-specific components
  │   ├── data/               # Static data / schemas
  │   ├── hooks/              # Feature-specific hooks
  │   └── types.ts            # TypeScript types
```

#### Shared Code
```
components/
  ├── ui/                     # Reusable UI components (shadcn)
  ├── layout/                 # Layout components
  └── ...                     # Other shared components

lib/
  ├── api.ts                  # API client
  ├── utils.ts                # Utility functions
  └── ...                     # Other libraries

hooks/
  ├── use-auth.ts             # Shared hooks
  └── ...
```

---

## 🎯 Design Patterns & Best Practices

### 1. Component Composition

#### Layout Pattern
```typescript
<Page>
  <Header>
    {/* Top navigation */}
  </Header>
  <Main>
    {/* Page content */}
  </Main>
</Page>
```

#### Provider Pattern
```typescript
<ThemeProvider>
  <DirectionProvider>
    <LayoutProvider>
      <App />
    </LayoutProvider>
  </DirectionProvider>
</ThemeProvider>
```

### 2. Type Safety

All components use TypeScript with strict mode:
```typescript
interface ComponentProps {
  title: string
  description?: string
  onAction: (id: string) => void
}

export function Component({ title, description, onAction }: ComponentProps) {
  // ...
}
```

### 3. Form Handling

Uses React Hook Form + Zod:
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

### 4. Error Handling

**File**: `src/lib/handle-server-error.ts`

Centralized error handling for API calls

### 5. Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

---

## 📊 Data Flow

### Request Flow Example (Tasks Page)

```
User Action
    ↓
Component (Tasks)
    ↓
TanStack Query (useQuery)
    ↓
API Client (axios)
    ↓
Interceptor (add auth token)
    ↓
API Server (Railway)
    ↓
Response
    ↓
Interceptor (handle errors)
    ↓
Query Cache
    ↓
Component Re-render
```

### State Update Flow

```
User Input
    ↓
Event Handler
    ↓
Zustand Action / TanStack Query Mutation
    ↓
State Update
    ↓
Component Re-render
    ↓
UI Update
```

---

## 🧪 Testing

### E2E Testing (Playwright)

**Config**: `playwright.config.ts`

#### Test Commands
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run with UI mode
npm run test:e2e:debug        # Debug mode
```

#### Test Structure
```
test/
  ├── auth.spec.ts            # Authentication tests
  ├── dashboard.spec.ts       # Dashboard tests
  └── ...
```

---

## 🔍 Key Files Reference

### Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `playwright.config.ts` | E2E testing configuration |
| `.env.example` | Environment variables template |
| `vercel.json` | Vercel deployment config |
| `netlify.toml` | Netlify deployment config |

### Core Application Files
| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/i18n.ts` | Internationalization setup |
| `src/routes/__root.tsx` | Root route & providers |
| `src/routeTree.gen.ts` | Auto-generated route tree |

### Key Feature Files
| File | Purpose |
|------|---------|
| `src/features/dashboard/index.tsx` | Main dashboard |
| `src/features/apps/index.tsx` | Apps integration page |
| `src/features/tasks/index.tsx` | Task management |
| `src/features/users/index.tsx` | User management |
| `src/features/settings/index.tsx` | Settings layout |
| `src/features/auth/sign-in/index.tsx` | Sign in page |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `CLAUDE.md` | AI assistant instructions |
| `context/design-principles.md` | Design guidelines |
| `context/masterplan.md` | Project roadmap |

---

## 📝 Summary

### What is TRAF3LI Dashboard?
A modern, bilingual admin dashboard with RTL/LTR support, dark/light themes, and comprehensive user management.

### Tech Stack
React 18 + TypeScript + Vite + TanStack Router + Tailwind CSS + shadcn/ui

### Key Features
- File-based routing (TanStack Router)
- Authentication (Custom + Clerk)
- Internationalization (Arabic/English)
- Dark/Light theme
- RTL/LTR support
- Responsive design
- PDPL compliance
- Accessible (WCAG AA)

### Hosting
- **Frontend**: Vercel/Netlify
- **API**: Railway (https://traf3li-api-production.up.railway.app)

### Page Structure
```
/ (Dashboard)
/apps (App Integrations)
/tasks (Task Management)
/users (User Management)
/chats (Messaging)
/settings (Settings)
  /settings/account
  /settings/appearance
  /settings/notifications
  /settings/display
```

### Design Method
- **Component Library**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS with custom theme
- **Layout**: Sidebar + Header + Main content
- **Patterns**: Component composition, provider pattern, feature-based organization

### Code Structure
- **Features**: Feature-based organization (`src/features/`)
- **Components**: Shared UI components (`src/components/`)
- **Routing**: File-based routes (`src/routes/`)
- **State**: Zustand (client) + TanStack Query (server)
- **Forms**: React Hook Form + Zod validation

---

## 🔗 Quick Links

### Development
- **Dev Server**: `npm run dev` → http://localhost:5173
- **API Base**: https://traf3li-api-production.up.railway.app

### Documentation
- **Design Principles**: `context/design-principles.md`
- **Master Plan**: `context/masterplan.md`
- **README**: `README.md`
- **Claude Instructions**: `CLAUDE.md`

### Important Directories
- **Routes**: `src/routes/`
- **Features**: `src/features/`
- **Components**: `src/components/`
- **Hooks**: `src/hooks/`
- **Stores**: `src/stores/`
- **Services**: `src/services/`
- **Locales**: `src/locales/`

---

**Last Updated**: 2024-11-19
**Maintained By**: TRAF3LI Development Team
