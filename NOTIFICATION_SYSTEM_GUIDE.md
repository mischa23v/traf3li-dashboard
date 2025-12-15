# Approval Notifications System - Integration Guide

## Overview

The Approval Notifications System provides a comprehensive notification infrastructure for the traf3li-dashboard, with special focus on finance approval workflows including invoices, time entries, expenses, payments, and budget alerts.

## 📁 File Structure

```
src/
├── types/
│   └── notification.ts                    # Type definitions
├── services/
│   └── notificationService.ts             # API service
├── hooks/
│   └── useNotifications.ts                # React Query hooks
├── components/
│   └── notifications/
│       ├── notification-item.tsx          # Single notification component
│       ├── notification-dropdown.tsx      # Header dropdown
│       ├── notification-bell-new.tsx      # Bell wrapper
│       └── index.ts                       # Exports
├── features/
│   └── notifications/
│       ├── notifications-page.tsx         # Full page view
│       ├── notification-settings-page.tsx # Settings page
│       └── index.tsx                      # Exports
└── routes/
    └── _authenticated/
        ├── dashboard.notifications.index.tsx      # Route: /dashboard/notifications
        └── dashboard.notifications.settings.tsx   # Route: /dashboard/notifications/settings
```

## 🚀 Quick Start

### 1. Add Notification Bell to Header

```tsx
import { NotificationDropdown } from '@/components/notifications'

export function YourFeature() {
  return (
    <Header>
      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </Header>
  )
}
```

### 2. Use Notification Hooks

```tsx
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/useNotifications'

function YourComponent() {
  const { data, isLoading } = useNotifications({ type: 'invoice_approval' })
  const { data: unreadCount } = useUnreadCount()
  const markAsReadMutation = useMarkAsRead()

  return (
    <div>
      {data?.notifications.map((notification) => (
        <div key={notification._id} onClick={() => markAsReadMutation.mutate(notification._id)}>
          {notification.title}
        </div>
      ))}
    </div>
  )
}
```

## 📊 Notification Types

### Finance-Specific Types

- `invoice_approval` - Invoice submitted for approval
- `time_entry_approval` - Time entry submitted for approval
- `expense_approval` - Expense claim submitted for approval
- `payment_received` - Payment received notification
- `invoice_overdue` - Invoice overdue alert
- `budget_alert` - Budget threshold reached

### General Types

- `system` - System notifications
- `task_reminder` - Task reminders
- `hearing_reminder` - Hearing reminders
- `case_update` - Case updates
- `message` - Messages
- `general` - General notifications

## 🔧 Integration Points

### 1. Invoice Approval Workflow

```tsx
import notificationService from '@/services/notificationService'

// When invoice is submitted for approval
async function submitInvoiceForApproval(invoiceId: string, approverId: string) {
  // ... submit invoice logic

  // Create notification
  await notificationService.createNotification({
    userId: approverId,
    type: 'invoice_approval',
    title: 'New Invoice Approval Request',
    titleAr: 'طلب موافقة فاتورة جديدة',
    message: `Invoice #${invoiceNumber} requires your approval`,
    messageAr: `الفاتورة رقم ${invoiceNumber} تحتاج إلى موافقتك`,
    priority: 'high',
    actionUrl: `/dashboard/finance/invoices/${invoiceId}`,
    actionLabel: 'Review Invoice',
    actionLabelAr: 'مراجعة الفاتورة',
    relatedId: invoiceId,
    relatedType: 'invoice',
  })
}
```

### 2. Time Entry Approval

```tsx
// When time entry is submitted
async function submitTimeEntryForApproval(entryId: string, approverId: string) {
  await notificationService.createNotification({
    userId: approverId,
    type: 'time_entry_approval',
    title: 'Time Entry Awaiting Approval',
    titleAr: 'إدخال الوقت في انتظار الموافقة',
    message: `Time entry from ${employeeName} needs review`,
    messageAr: `إدخال الوقت من ${employeeName} يحتاج إلى المراجعة`,
    priority: 'normal',
    actionUrl: `/dashboard/finance/time-tracking/${entryId}`,
    relatedId: entryId,
    relatedType: 'timeEntry',
  })
}
```

### 3. Payment Received

```tsx
// When payment is received
async function notifyPaymentReceived(invoiceId: string, clientUserId: string, amount: number) {
  await notificationService.createNotification({
    userId: clientUserId,
    type: 'payment_received',
    title: 'Payment Received',
    titleAr: 'تم استلام الدفعة',
    message: `Payment of ${amount} SAR has been received`,
    messageAr: `تم استلام دفعة بقيمة ${amount} ريال`,
    priority: 'normal',
    actionUrl: `/dashboard/finance/payments`,
    relatedId: invoiceId,
    relatedType: 'payment',
  })
}
```

### 4. Invoice Overdue Alert

```tsx
// Scheduled job to check overdue invoices
async function checkOverdueInvoices() {
  const overdueInvoices = await getOverdueInvoices()

  for (const invoice of overdueInvoices) {
    await notificationService.createNotification({
      userId: invoice.assignedTo,
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      titleAr: 'فاتورة متأخرة',
      message: `Invoice #${invoice.number} is ${invoice.daysOverdue} days overdue`,
      messageAr: `الفاتورة رقم ${invoice.number} متأخرة ${invoice.daysOverdue} يوم`,
      priority: 'urgent',
      actionUrl: `/dashboard/finance/invoices/${invoice._id}`,
      relatedId: invoice._id,
      relatedType: 'invoice',
    })
  }
}
```

### 5. Budget Alert

```tsx
// When budget threshold is reached
async function notifyBudgetThreshold(projectId: string, managerId: string, percentage: number) {
  await notificationService.createNotification({
    userId: managerId,
    type: 'budget_alert',
    title: 'Budget Alert',
    titleAr: 'تنبيه الميزانية',
    message: `Project budget has reached ${percentage}% of allocated amount`,
    messageAr: `وصلت ميزانية المشروع إلى ${percentage}٪ من المبلغ المخصص`,
    priority: percentage >= 90 ? 'high' : 'normal',
    actionUrl: `/dashboard/finance/projects/${projectId}`,
    relatedId: projectId,
    relatedType: 'project',
  })
}
```

## 🎨 UI Components

### NotificationDropdown

Header dropdown with tabs and filters.

```tsx
<NotificationDropdown className="your-custom-class" />
```

### NotificationItem

Individual notification display.

```tsx
<NotificationItem
  notification={notification}
  onMarkAsRead={(id) => markAsRead(id)}
  onDelete={(id) => deleteNotification(id)}
  onClick={(notif) => navigate(notif.actionUrl)}
  showActions={true}
  compact={false}
/>
```

## 🔌 Available Hooks

### Query Hooks

```tsx
// Get all notifications
const { data, isLoading } = useNotifications({
  type: 'invoice_approval',
  read: false,
  limit: 20,
})

// Get single notification
const { data: notification } = useNotification(id)

// Get unread count
const { data: unreadCount } = useUnreadCount()

// Get notifications by type
const { data } = useNotificationsByType('invoice_approval', { limit: 10 })

// Get notification settings
const { data: settings } = useNotificationSettings()
```

### Mutation Hooks

```tsx
// Mark as read
const markAsRead = useMarkAsRead()
markAsRead.mutate(notificationId)

// Mark multiple as read
const markMultiple = useMarkMultipleAsRead()
markMultiple.mutate([id1, id2, id3])

// Mark all as read
const markAll = useMarkAllAsRead()
markAll.mutate()

// Delete notification
const deleteNotif = useDeleteNotification()
deleteNotif.mutate(notificationId)

// Delete multiple
const deleteMultiple = useDeleteMultipleNotifications()
deleteMultiple.mutate([id1, id2, id3])

// Clear read notifications
const clearRead = useClearReadNotifications()
clearRead.mutate()

// Update settings
const updateSettings = useUpdateNotificationSettings()
updateSettings.mutate({
  emailNotifications: {
    invoiceApproval: true,
    paymentReceived: true,
  },
})
```

## 📱 Pages

### Notifications Page

Route: `/dashboard/notifications`

- View all notifications
- Filter by type (All, Unread, Finance, Cases, System)
- Search notifications
- Filter by priority
- Bulk actions (mark as read, delete)
- Statistics cards

### Settings Page

Route: `/dashboard/notifications/settings`

- Email notification preferences
- Push notification preferences
- In-app notification preferences
- Quiet hours configuration

## 🔔 Real-time Updates

The notification system is designed to work with Socket.IO for real-time updates. The existing `socket-provider` can be extended to listen for notification events:

```tsx
// In socket-provider.tsx
socket.on('notification', (notification) => {
  // Invalidate notification queries
  queryClient.invalidateQueries({ queryKey: ['notifications'] })

  // Show toast notification
  toast({
    title: notification.title,
    description: notification.message,
  })
})
```

## 🎯 Priority Levels

- `urgent` - Red badge, requires immediate attention
- `high` - Orange badge, important notifications
- `normal` - Blue badge, standard notifications
- `low` - Gray badge, informational only

## 🌐 Internationalization

All notification components support Arabic (RTL) and English (LTR):

```tsx
{
  title: "Invoice Approved",
  titleAr: "تمت الموافقة على الفاتورة",
  message: "Your invoice has been approved",
  messageAr: "تمت الموافقة على فاتورتك"
}
```

## 📝 Best Practices

1. **Always provide both English and Arabic text** for title and message
2. **Use appropriate priority levels** based on urgency
3. **Include actionUrl** for navigable notifications
4. **Set relatedId and relatedType** for tracking
5. **Use meaningful action labels** (e.g., "Review Invoice" not "Click here")
6. **Consider notification fatigue** - don't over-notify
7. **Batch similar notifications** when possible
8. **Set expiration dates** for time-sensitive notifications

## 🔗 Backend Integration

The notification system expects these API endpoints:

```
GET    /api/notifications              - Get all notifications
GET    /api/notifications/:id          - Get single notification
GET    /api/notifications/unread-count - Get unread count
POST   /api/notifications              - Create notification (admin)
PATCH  /api/notifications/:id/read     - Mark as read
PATCH  /api/notifications/mark-all-read - Mark all as read
PATCH  /api/notifications/mark-multiple-read - Mark multiple as read
DELETE /api/notifications/:id          - Delete notification
DELETE /api/notifications/bulk-delete  - Delete multiple
DELETE /api/notifications/clear-read   - Clear all read
GET    /api/notifications/settings     - Get settings
PATCH  /api/notifications/settings     - Update settings
```

## 🧪 Testing

```tsx
// Test notification creation
it('should create invoice approval notification', async () => {
  const notification = await notificationService.createNotification({
    userId: 'user123',
    type: 'invoice_approval',
    title: 'Test',
    titleAr: 'اختبار',
    message: 'Test message',
    messageAr: 'رسالة اختبار',
  })

  expect(notification).toBeDefined()
  expect(notification.type).toBe('invoice_approval')
})
```

## 📚 Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Notification Design Patterns](https://www.nngroup.com/articles/push-notification/)

## 🆘 Support

For issues or questions:

1. Check the type definitions in `/src/types/notification.ts`
2. Review the service implementation in `/src/services/notificationService.ts`
3. Examine the hooks in `/src/hooks/useNotifications.ts`
4. Consult the example integration in `/src/features/dashboard/index.tsx`

---

**Version:** 1.0.0
**Last Updated:** December 2025
**Maintained by:** Traf3li Development Team
