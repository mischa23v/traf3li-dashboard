# ActivityTimeline Component

A comprehensive, feature-rich timeline component for displaying CRM activities with filtering, pagination, and expandable cards. Fully supports RTL layout and Arabic labels.

## Features

- ✅ **Vertical Timeline Layout** - Clean, chronological display with connecting lines
- ✅ **Activity Type Icons** - Color-coded icons for different activity types
- ✅ **Expandable Cards** - Collapsible cards to show/hide detailed information
- ✅ **Type Filtering** - Filter activities by type with multi-select dropdown
- ✅ **Load More Pagination** - Infinite scroll-style pagination
- ✅ **RTL Support** - Full right-to-left layout support
- ✅ **Arabic Labels** - Complete Arabic translations
- ✅ **User Avatars** - Display activity performer information
- ✅ **Entity Links** - Navigate to related entities (leads, clients, etc.)
- ✅ **Rich Activity Data** - Display call, email, meeting, and task details
- ✅ **Loading States** - Skeleton loaders during data fetch
- ✅ **Empty States** - Contextual messages when no data available
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Accessibility** - ARIA labels and semantic HTML

## Activity Type Colors

The component uses the following color scheme (as per specification):

| Type      | Color  | Icon        | Arabic Label      |
|-----------|--------|-------------|-------------------|
| call      | Blue   | Phone       | مكالمة            |
| email     | Green  | Mail        | بريد إلكتروني     |
| meeting   | Purple | Calendar    | اجتماع            |
| task      | Orange | CheckSquare | مهمة              |
| note      | Gray   | StickyNote  | ملاحظة            |
| whatsapp  | Green  | MessageSquare | واتساب          |

## Props

```typescript
interface ActivityTimelineProps {
  // Required
  activities: CrmActivity[]          // Array of activities to display

  // Optional
  isLoading?: boolean                 // Show loading skeleton
  hasMore?: boolean                   // Show "Load More" button
  onLoadMore?: () => void             // Load more callback
  onActivityClick?: (activity: CrmActivity) => void  // Activity click handler
  filterTypes?: string[]              // Pre-filter by activity types
  showFilter?: boolean                // Show/hide filter dropdown (default: true)
  emptyMessage?: string               // Custom empty state message
  className?: string                  // Additional CSS classes
}
```

## Usage Examples

### Basic Usage

```tsx
import { ActivityTimeline } from '@/components/activity-timeline'
import type { CrmActivity } from '@/types/crm'

function MyComponent() {
  const activities: CrmActivity[] = [...] // Your activities data

  return <ActivityTimeline activities={activities} />
}
```

### With Pagination

```tsx
function MyComponent() {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const activities = data?.pages.flatMap((page) => page.data) || []

  return (
    <ActivityTimeline
      activities={activities}
      isLoading={isLoading}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
    />
  )
}
```

### With Click Handler

```tsx
import { useNavigate } from '@tanstack/react-router'

function MyComponent() {
  const navigate = useNavigate()

  const handleActivityClick = (activity: CrmActivity) => {
    navigate({
      to: `/dashboard/crm/activities/$activityId`,
      params: { activityId: activity._id },
    })
  }

  return (
    <ActivityTimeline
      activities={activities}
      onActivityClick={handleActivityClick}
    />
  )
}
```

### With Pre-filtered Types

```tsx
function CallsOnlyTimeline() {
  return (
    <ActivityTimeline
      activities={activities}
      filterTypes={['call', 'whatsapp']} // Show only calls and WhatsApp
    />
  )
}
```

### Without Filter

```tsx
function SimpleTimeline() {
  return (
    <ActivityTimeline
      activities={activities}
      showFilter={false}  // Hide filter dropdown
    />
  )
}
```

### Custom Empty Message

```tsx
function CustomTimeline() {
  return (
    <ActivityTimeline
      activities={[]}
      emptyMessage="No recent activities. Start logging activities to see them here."
    />
  )
}
```

## Activity Card Details

Each activity card displays:

### Header Section
- **Activity Type Badge** - Color-coded badge with activity type
- **Title** - Activity title (or auto-generated from type)
- **Description Preview** - Truncated description (first 120 characters)
- **User Avatar** - Performer's avatar and name
- **Date/Time** - Relative time (e.g., "2 hours ago")
- **Status Badge** - Current status (scheduled, in_progress, completed, cancelled)

### Related Entity Section
- **Entity Link** - Clickable link to related entity (lead, client, contact, case, organization)
- **Entity Icon** - Icon representing the entity type

### Expandable Section (when applicable)
- **Full Description** - Complete activity description
- **Call Data** - Direction, phone number, duration, outcome
- **Email Data** - Subject, from, to
- **Meeting Data** - Type, location, scheduled time
- **Task Data** - Due date, priority
- **Tags** - Activity tags
- **Outcome Notes** - Notes about the activity outcome

## Activity Data Structure

The component expects activities to follow the `CrmActivity` type from `@/types/crm`:

```typescript
interface CrmActivity {
  _id: string
  activityId: string
  lawyerId: string
  type: ActivityType
  entityType: ActivityEntityType
  entityId: string
  entityName?: string
  title: string
  titleAr?: string
  description?: string

  // Type-specific data
  callData?: {
    direction: 'inbound' | 'outbound'
    phoneNumber?: string
    duration?: number
    outcome?: string
  }
  emailData?: {
    subject?: string
    from?: string
    to?: string[]
    isIncoming?: boolean
  }
  meetingData?: {
    meetingType?: 'in_person' | 'video' | 'phone' | 'court' | 'consultation'
    location?: string
    scheduledStart?: string
    scheduledEnd?: string
    agenda?: string
  }
  taskData?: {
    dueDate?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  }

  // Performer
  performedBy: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }

  // Status
  status: ActivityStatus
  scheduledAt?: string
  completedAt?: string
  outcomeNotes?: string

  // Meta
  tags?: string[]
  isPrivate?: boolean
  createdAt: string
  updatedAt: string
}
```

## Styling

The component uses Tailwind CSS and follows the project's design system. All colors are theme-aware and support dark mode (if enabled in your project).

### Customization

You can customize the appearance by:

1. **Adding custom classes** via the `className` prop
2. **Modifying color constants** in the component file
3. **Overriding Tailwind classes** in your CSS

## RTL Support

The component automatically detects the current language using `react-i18next` and applies RTL layout when Arabic is selected:

- Timeline flows right-to-left
- Icons and text are properly aligned
- Date formats use Arabic locale
- All labels display in Arabic

## Accessibility

The component follows WCAG AA guidelines:

- Semantic HTML with proper landmarks
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus indicators

## Performance

The component is optimized for performance:

- **Memoized components** - Prevents unnecessary re-renders
- **Lazy loading** - Only renders visible items (when used with virtualization)
- **Optimized filters** - Uses `useMemo` for filtered data
- **Collapsible content** - Reduces initial DOM size

## Integration with Backend

### Fetching Activities

```tsx
import { useQuery } from '@tanstack/react-query'
import { activityService } from '@/services/crmService'

function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['activities', { entityType: 'lead', entityId: leadId }],
    queryFn: () => activityService.getActivities({ entityType: 'lead', entityId: leadId }),
  })

  return (
    <ActivityTimeline
      activities={data?.data || []}
      isLoading={isLoading}
    />
  )
}
```

### With Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { activityService } from '@/services/crmService'

function InfiniteActivitiesTimeline() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['activities-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      activityService.getActivities({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination
      return page < pages ? page + 1 : undefined
    },
  })

  const activities = data?.pages.flatMap((page) => page.data) || []

  return (
    <ActivityTimeline
      activities={activities}
      isLoading={isLoading || isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={fetchNextPage}
    />
  )
}
```

## Related Components

- `ActivityFeed` - Simpler activity list without timeline styling
- `ActivityList` - Task/reminder activity list
- `EmptyState` - Used internally for empty states

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Activities not displaying

- Check that `activities` array is not empty
- Verify the data structure matches `CrmActivity` type
- Check browser console for TypeScript errors

### Filter not working

- Ensure `showFilter` is not set to `false`
- Verify activity types are valid `ActivityType` values

### Load More not showing

- Set `hasMore` prop to `true`
- Provide `onLoadMore` callback function

### RTL layout issues

- Verify `react-i18next` is properly configured
- Check that language is set to 'ar' for Arabic

## License

This component is part of the Traf3li Dashboard project.
