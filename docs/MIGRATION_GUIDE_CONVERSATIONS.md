# Migration Guide: Deprecated Conversation Hooks
# دليل الترحيل: دوال المحادثات المهجورة

## Overview | نظرة عامة

This guide helps you migrate from deprecated hooks in `useConversations.ts` to their modern replacements.

يساعدك هذا الدليل في الترحيل من الدوال المهجورة في `useConversations.ts` إلى البدائل الحديثة.

---

## Deprecated Hooks | الدوال المهجورة

### 1. `useConversation()` → `useSingleConversation()`

**Status | الحالة:** ⚠️ DEPRECATED | مهجورة

**Reason | السبب:** Renamed for clarity | تم إعادة التسمية للوضوح

#### Migration | الترحيل

**Before | قبل:**
```typescript
import { useConversation } from '@/hooks/useConversations'

function Component() {
  const { data, isLoading } = useConversation(sellerID, buyerID)
  // ...
}
```

**After | بعد:**
```typescript
import { useSingleConversation } from '@/hooks/useConversations'

function Component() {
  const { data, isLoading } = useSingleConversation(sellerID, buyerID)
  // ...
}
```

---

### 2. `useMarkAsRead()` → Socket-based Approach

**Status | الحالة:** ⚠️ DEPRECATED | مهجورة

**Reason | السبب:** REST API approach replaced with real-time socket communication for better performance and instant updates.

تم استبدال نهج REST API بالاتصال الفوري عبر السوكت لأداء أفضل وتحديثات فورية.

#### Migration | الترحيل

**Before | قبل:**
```typescript
import { useMarkAsRead } from '@/hooks/useConversations'

function ChatComponent() {
  const markAsReadMutation = useMarkAsRead()

  const handleMarkAsRead = (conversationId: string) => {
    markAsReadMutation.mutate(conversationId)
  }

  // ...
}
```

**After | بعد:**
```typescript
import { useEffect } from 'react'
import socketService from '@/services/socketService'
import { useAuthStore } from '@/stores/auth-store'

function ChatComponent() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    // Listen for read receipts
    // الاستماع لإشعارات القراءة
    socketService.onMessageRead((data) => {
      console.log('Messages read by:', data.userId)
      // Update UI to show read status
      // تحديث الواجهة لإظهار حالة القراءة
    })

    // Cleanup
    return () => {
      socketService.offMessageRead()
    }
  }, [])

  const handleMarkAsRead = (conversationId: string) => {
    if (!user) return

    // Mark messages as read via socket
    // تعليم الرسائل كمقروءة عبر السوكت
    socketService.markAsRead({
      conversationId,
      userId: user._id
    })
  }

  // ...
}
```

#### Benefits of Socket-based Approach | فوائد النهج القائم على السوكت

| Feature | English | العربية |
|---------|---------|---------|
| **Real-time** | Instant updates without polling | تحديثات فورية بدون استعلام متكرر |
| **Performance** | Reduced server load and API calls | تقليل الحمل على الخادم واستدعاءات API |
| **User Experience** | All participants see read status immediately | جميع المشاركين يرون حالة القراءة فوراً |
| **Scalability** | Better handling of concurrent users | معالجة أفضل للمستخدمين المتزامنين |

---

## Socket Service API Reference | مرجع واجهة برمجة خدمة السوكت

### Mark Messages as Read | تعليم الرسائل كمقروءة

```typescript
socketService.markAsRead({
  conversationId: string,  // Conversation ID | معرف المحادثة
  userId: string          // Current user ID | معرف المستخدم الحالي
})
```

### Listen for Read Receipts | الاستماع لإشعارات القراءة

```typescript
socketService.onMessageRead((data: { userId: string }) => {
  // Called when someone marks messages as read
  // يتم الاستدعاء عندما يقوم شخص بتعليم الرسائل كمقروءة
})
```

### Remove Read Receipt Listener | إزالة مستمع إشعارات القراءة

```typescript
socketService.offMessageRead()
```

---

## Complete Example | مثال كامل

Here's a complete example of a chat component using the socket-based approach:

فيما يلي مثال كامل لمكون دردشة يستخدم النهج القائم على السوكت:

```typescript
import { useState, useEffect } from 'react'
import socketService from '@/services/socketService'
import { useAuthStore } from '@/stores/auth-store'
import { useSingleConversation } from '@/hooks/useConversations'

interface ChatProps {
  sellerID: string
  buyerID: string
}

export function Chat({ sellerID, buyerID }: ChatProps) {
  const user = useAuthStore((state) => state.user)
  const { data: conversation, isLoading } = useSingleConversation(sellerID, buyerID)
  const [readByOther, setReadByOther] = useState(false)

  useEffect(() => {
    if (!conversation) return

    const conversationId = conversation.conversationID

    // Join conversation room
    // الانضمام إلى غرفة المحادثة
    socketService.joinConversation(conversationId)

    // Listen for read receipts
    // الاستماع لإشعارات القراءة
    socketService.onMessageRead((data) => {
      if (data.userId !== user?._id) {
        setReadByOther(true)
      }
    })

    // Mark messages as read when conversation opens
    // تعليم الرسائل كمقروءة عند فتح المحادثة
    if (user) {
      socketService.markAsRead({
        conversationId,
        userId: user._id
      })
    }

    // Cleanup
    return () => {
      socketService.leaveConversation(conversationId)
      socketService.offMessageRead()
    }
  }, [conversation, user])

  if (isLoading) {
    return <div>Loading... | جاري التحميل...</div>
  }

  return (
    <div>
      <h2>Chat | الدردشة</h2>
      {readByOther && (
        <span>✓✓ Read | مقروءة</span>
      )}
      {/* Chat UI */}
    </div>
  )
}
```

---

## Testing the Migration | اختبار الترحيل

After migrating, ensure that:

بعد الترحيل، تأكد من:

- [ ] Read receipts appear in real-time | تظهر إشعارات القراءة في الوقت الفعلي
- [ ] Multiple users in the same conversation see updates instantly | يرى عدة مستخدمين في نفس المحادثة التحديثات فوراً
- [ ] Socket connections are cleaned up properly | يتم تنظيف اتصالات السوكت بشكل صحيح
- [ ] No console warnings about deprecated hooks | لا توجد تحذيرات في وحدة التحكم حول الدوال المهجورة
- [ ] Performance is improved (fewer API calls) | تحسن الأداء (استدعاءات API أقل)

---

## Troubleshooting | استكشاف الأخطاء وإصلاحها

### Socket not connecting | السوكت لا يتصل

**Check | تحقق من:**
1. Socket service is initialized: `socketService.connect(userId)`
2. User is authenticated
3. WebSocket URL is correct in environment variables

### Read receipts not working | إشعارات القراءة لا تعمل

**Check | تحقق من:**
1. Conversation is joined: `socketService.joinConversation(conversationId)`
2. Event listener is attached: `socketService.onMessageRead(callback)`
3. User ID is correct when calling `markAsRead()`
4. Socket connection is active: `socketService.isConnected()`

### Memory leaks | تسريبات الذاكرة

**Solution | الحل:**
Always clean up socket listeners in the useEffect cleanup function:

```typescript
useEffect(() => {
  // Setup listeners

  return () => {
    socketService.offMessageRead()
    socketService.leaveConversation(conversationId)
  }
}, [conversationId])
```

---

## Support | الدعم

If you encounter issues during migration, please:

إذا واجهت مشاكل أثناء الترحيل، يرجى:

1. Check the console for detailed deprecation warnings
   - تحقق من وحدة التحكم للحصول على تحذيرات مفصلة
2. Review the socket service documentation: `/src/services/socketService.ts`
   - راجع توثيق خدمة السوكت
3. Check existing examples in: `/src/features/messages/`
   - تحقق من الأمثلة الموجودة في

---

## Timeline | الجدول الزمني

- **Current | الحالي:** Deprecated hooks still work but show warnings
  - الدوال المهجورة لا تزال تعمل ولكنها تظهر تحذيرات
- **Next Release | الإصدار القادم:** Deprecation warnings become errors
  - تحذيرات الإهجار تصبح أخطاء
- **Future Release | إصدار مستقبلي:** Deprecated hooks removed completely
  - الدوال المهجورة تتم إزالتها بالكامل

**Action Required | إجراء مطلوب:** Migrate before the next major release
- قم بالترحيل قبل الإصدار الرئيسي القادم
