/**
 * ActivityTimeline Component - Usage Example
 * This file demonstrates how to use the ActivityTimeline component
 */

import { useState } from 'react'
import { ActivityTimeline } from './activity-timeline'
import type { CrmActivity } from '@/types/crm'

export function ActivityTimelineExample() {
  const [page, setPage] = useState(1)
  const [activities, setActivities] = useState<CrmActivity[]>([
    {
      _id: '1',
      activityId: 'ACT-001',
      lawyerId: 'LAW-123',
      type: 'call',
      entityType: 'lead',
      entityId: 'LEAD-001',
      entityName: 'محمد أحمد',
      title: 'مكالمة متابعة',
      description: 'تمت مناقشة تفاصيل القضية والاتفاق على موعد الاجتماع القادم',
      callData: {
        direction: 'outbound',
        phoneNumber: '+966501234567',
        duration: 180, // 3 minutes
        outcome: 'تم الاتصال',
      },
      performedBy: {
        _id: 'USER-001',
        firstName: 'أحمد',
        lastName: 'السعيد',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      status: 'completed',
      scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['متابعة', 'عاجل'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      activityId: 'ACT-002',
      lawyerId: 'LAW-123',
      type: 'email',
      entityType: 'client',
      entityId: 'CLIENT-001',
      entityName: 'شركة النور للتجارة',
      title: 'إرسال العقد للمراجعة',
      description: 'تم إرسال مسودة العقد للعميل للمراجعة والموافقة',
      emailData: {
        subject: 'مسودة العقد - للمراجعة',
        from: 'lawyer@example.com',
        to: ['client@example.com'],
        isIncoming: false,
      },
      performedBy: {
        _id: 'USER-002',
        firstName: 'فاطمة',
        lastName: 'الزهراني',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      status: 'completed',
      scheduledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      tags: ['عقد', 'مراجعة'],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      activityId: 'ACT-003',
      lawyerId: 'LAW-123',
      type: 'meeting',
      entityType: 'lead',
      entityId: 'LEAD-002',
      entityName: 'سارة محمد',
      title: 'اجتماع استشاري',
      description: 'اجتماع استشاري لمناقشة القضية والخطوات القادمة',
      meetingData: {
        meetingType: 'in_person',
        location: 'المكتب الرئيسي - الرياض',
        scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        scheduledEnd: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        agenda: 'مناقشة تفاصيل القضية وتحديد الخطوات القانونية',
      },
      performedBy: {
        _id: 'USER-001',
        firstName: 'أحمد',
        lastName: 'السعيد',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tags: ['استشارة', 'مهم'],
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '4',
      activityId: 'ACT-004',
      lawyerId: 'LAW-123',
      type: 'whatsapp',
      entityType: 'contact',
      entityId: 'CONTACT-001',
      entityName: 'خالد العتيبي',
      title: 'رسالة واتساب',
      description: 'تأكيد موعد الاجتماع وإرسال الموقع',
      performedBy: {
        _id: 'USER-003',
        firstName: 'نورة',
        lastName: 'الدوسري',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      status: 'completed',
      scheduledAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      tags: ['تأكيد'],
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      _id: '5',
      activityId: 'ACT-005',
      lawyerId: 'LAW-123',
      type: 'task',
      entityType: 'case',
      entityId: 'CASE-001',
      entityName: 'قضية العقد التجاري #12345',
      title: 'مراجعة المستندات',
      description: 'مراجعة جميع المستندات المطلوبة للقضية والتأكد من اكتمالها',
      taskData: {
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 days
        priority: 'high',
        status: 'in_progress',
      },
      performedBy: {
        _id: 'USER-002',
        firstName: 'فاطمة',
        lastName: 'الزهراني',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      status: 'in_progress',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['مراجعة', 'مستندات'],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '6',
      activityId: 'ACT-006',
      lawyerId: 'LAW-123',
      type: 'note',
      entityType: 'lead',
      entityId: 'LEAD-003',
      entityName: 'عبدالله القحطاني',
      title: 'ملاحظة متابعة',
      description: 'العميل مهتم بالخدمات ولكن يحتاج لمزيد من الوقت للتفكير. يفضل التواصل بعد أسبوعين.',
      performedBy: {
        _id: 'USER-001',
        firstName: 'أحمد',
        lastName: 'السعيد',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      status: 'completed',
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      tags: ['متابعة'],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ])

  const handleLoadMore = () => {
    // Simulate loading more activities
    setPage((prev) => prev + 1)
    // In a real app, this would fetch more data from the API
  }

  const handleActivityClick = (activity: CrmActivity) => {
    console.log('Activity clicked:', activity)
    // Navigate to activity detail page or open a modal
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Activity Timeline Example</h1>

      <ActivityTimeline
        activities={activities}
        isLoading={false}
        hasMore={page < 3} // Simulate pagination
        onLoadMore={handleLoadMore}
        onActivityClick={handleActivityClick}
        showFilter={true}
        emptyMessage="No activities found"
      />
    </div>
  )
}

/**
 * USAGE NOTES:
 *
 * 1. Basic Usage:
 *    <ActivityTimeline activities={activities} />
 *
 * 2. With Loading State:
 *    <ActivityTimeline activities={activities} isLoading={true} />
 *
 * 3. With Pagination:
 *    <ActivityTimeline
 *      activities={activities}
 *      hasMore={true}
 *      onLoadMore={handleLoadMore}
 *    />
 *
 * 4. With Click Handler:
 *    <ActivityTimeline
 *      activities={activities}
 *      onActivityClick={(activity) => console.log(activity)}
 *    />
 *
 * 5. With Pre-filtered Types:
 *    <ActivityTimeline
 *      activities={activities}
 *      filterTypes={['call', 'email']}
 *    />
 *
 * 6. Without Filter:
 *    <ActivityTimeline
 *      activities={activities}
 *      showFilter={false}
 *    />
 *
 * 7. Custom Empty Message:
 *    <ActivityTimeline
 *      activities={[]}
 *      emptyMessage="No activities to display"
 *    />
 */
