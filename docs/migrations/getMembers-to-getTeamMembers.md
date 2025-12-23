# Migration Guide: getMembers() → getTeamMembers()
# دليل الترحيل: من getMembers() إلى getTeamMembers()

**Status | الحالة:** ✅ All components already migrated | تم ترحيل جميع المكونات

**Date | التاريخ:** December 2024

---

## English Version

### Overview

The `firmService.getMembers()` method has been deprecated in favor of `firmService.getTeamMembers()`. This migration provides richer data structures, better filtering capabilities, and improved metadata support.

### Why Migrate?

#### getMembers() (Deprecated)
```typescript
// ❌ OLD - Deprecated
const members = await firmService.getMembers(firmId)
// Returns: FirmMember[]
```

**Limitations:**
- Returns only array of members
- No metadata (total count, active/departed counts)
- No filtering options (can't show/hide departed members)
- Simple data structure

#### getTeamMembers() (Current)
```typescript
// ✅ NEW - Recommended
const result = await firmService.getTeamMembers(firmId, { showDeparted: true })
// Returns: { members: FirmMember[], total: number, activeCount?: number, departedCount?: number }
```

**Advantages:**
- Richer response structure with metadata
- Built-in filtering (showDeparted option)
- Returns total counts (total, active, departed)
- More maintainable and extensible

### Migration Steps

#### 1. Update Service Calls

**Before:**
```typescript
const members = await firmService.getMembers(firmId)
```

**After:**
```typescript
const { members, total, activeCount, departedCount } = await firmService.getTeamMembers(firmId)
// Or with departed members:
const { members } = await firmService.getTeamMembers(firmId, { showDeparted: true })
```

#### 2. Update React Query Hooks

**Before:**
```typescript
const { data: members } = useQuery({
  queryKey: ['team', firmId],
  queryFn: () => firmService.getMembers(firmId),
})
```

**After:**
```typescript
const { data } = useQuery({
  queryKey: ['team', firmId],
  queryFn: () => firmService.getTeamMembers(firmId),
})
const members = data?.members || []
const total = data?.total || 0
```

#### 3. Update Component Usage

**Before:**
```typescript
// In component
const members = await firmService.getMembers(firmId)
setMembers(members)
setTotal(members.length)
```

**After:**
```typescript
// In component
const { members, total, activeCount, departedCount } = await firmService.getTeamMembers(firmId)
setMembers(members)
setTotal(total)
setActiveCount(activeCount)
setDepartedCount(departedCount)
```

### Error Handling

Both methods use the same error handling pattern, but update your error messages to be bilingual:

```typescript
try {
  const { members } = await firmService.getTeamMembers(firmId)
  // Success
} catch (error: any) {
  toast.error(
    error.message ||
    'Failed to load team members | فشل تحميل أعضاء الفريق'
  )
}
```

### Example: Complete Hook Migration

```typescript
// ❌ OLD
export const useStaff = (firmId: string) => {
  return useQuery({
    queryKey: ['staff', firmId],
    queryFn: () => firmService.getMembers(firmId),
  })
}

// ✅ NEW
export const useStaff = (firmId: string, showDeparted = false) => {
  return useQuery({
    queryKey: ['staff', firmId, showDeparted],
    queryFn: async () => {
      const result = await firmService.getTeamMembers(firmId, { showDeparted })
      return result.members || []
    },
  })
}
```

### Status Check

All current usages have been migrated. To verify:

```bash
# Search for any remaining usages
grep -r "firmService.getMembers(" src/

# Should only show the deprecated method definition in firmService.ts
```

### Current Migration Status

✅ **Completed** - All components are using `getTeamMembers()`

Files verified:
- `/src/hooks/useStaff.ts` - ✅ Using `getTeamMembers()`
- `/src/features/staff/components/staff-departure-dialog.tsx` - ✅ Using other firm services correctly
- `/src/features/staff/components/staff-reinstate-dialog.tsx` - ✅ Using other firm services correctly
- `/src/stores/permissions-store.ts` - ✅ Using `getMyPermissions()` correctly

No action required. All components are already migrated.

### Removal Timeline

- **Now:** Method marked as deprecated with bilingual warnings
- **Q1 2025:** Method will be removed entirely
- **Action Required:** None - migration complete

---

## النسخة العربية

### نظرة عامة

تم إهمال الدالة `firmService.getMembers()` لصالح `firmService.getTeamMembers()`. يوفر هذا الترحيل هياكل بيانات أغنى، وقدرات تصفية أفضل، ودعم محسّن للبيانات الوصفية.

### لماذا الترحيل؟

#### getMembers() (قديمة)
```typescript
// ❌ القديمة - لا تستخدم
const members = await firmService.getMembers(firmId)
// ترجع: FirmMember[]
```

**القيود:**
- ترجع فقط مصفوفة من الأعضاء
- لا توجد بيانات وصفية (العدد الإجمالي، عدد النشطين/المغادرين)
- لا توجد خيارات تصفية (لا يمكن إظهار/إخفاء الأعضاء المغادرين)
- هيكل بيانات بسيط

#### getTeamMembers() (الحالية)
```typescript
// ✅ الجديدة - موصى بها
const result = await firmService.getTeamMembers(firmId, { showDeparted: true })
// ترجع: { members: FirmMember[], total: number, activeCount?: number, departedCount?: number }
```

**المزايا:**
- هيكل استجابة أغنى مع البيانات الوصفية
- تصفية مدمجة (خيار showDeparted)
- إرجاع العدد الإجمالي (الكل، النشط، المغادر)
- أسهل للصيانة وقابل للتوسيع

### خطوات الترحيل

#### 1. تحديث استدعاءات الخدمة

**قبل:**
```typescript
const members = await firmService.getMembers(firmId)
```

**بعد:**
```typescript
const { members, total, activeCount, departedCount } = await firmService.getTeamMembers(firmId)
// أو مع الأعضاء المغادرين:
const { members } = await firmService.getTeamMembers(firmId, { showDeparted: true })
```

#### 2. تحديث خطافات React Query

**قبل:**
```typescript
const { data: members } = useQuery({
  queryKey: ['team', firmId],
  queryFn: () => firmService.getMembers(firmId),
})
```

**بعد:**
```typescript
const { data } = useQuery({
  queryKey: ['team', firmId],
  queryFn: () => firmService.getTeamMembers(firmId),
})
const members = data?.members || []
const total = data?.total || 0
```

#### 3. تحديث استخدام المكون

**قبل:**
```typescript
// في المكون
const members = await firmService.getMembers(firmId)
setMembers(members)
setTotal(members.length)
```

**بعد:**
```typescript
// في المكون
const { members, total, activeCount, departedCount } = await firmService.getTeamMembers(firmId)
setMembers(members)
setTotal(total)
setActiveCount(activeCount)
setDepartedCount(departedCount)
```

### معالجة الأخطاء

كلا الطريقتين تستخدمان نفس نمط معالجة الأخطاء، لكن قم بتحديث رسائل الخطأ لتكون ثنائية اللغة:

```typescript
try {
  const { members } = await firmService.getTeamMembers(firmId)
  // نجح
} catch (error: any) {
  toast.error(
    error.message ||
    'Failed to load team members | فشل تحميل أعضاء الفريق'
  )
}
```

### مثال: ترحيل خطاف كامل

```typescript
// ❌ القديم
export const useStaff = (firmId: string) => {
  return useQuery({
    queryKey: ['staff', firmId],
    queryFn: () => firmService.getMembers(firmId),
  })
}

// ✅ الجديد
export const useStaff = (firmId: string, showDeparted = false) => {
  return useQuery({
    queryKey: ['staff', firmId, showDeparted],
    queryFn: async () => {
      const result = await firmService.getTeamMembers(firmId, { showDeparted })
      return result.members || []
    },
  })
}
```

### التحقق من الحالة

تم ترحيل جميع الاستخدامات الحالية. للتحقق:

```bash
# ابحث عن أي استخدامات متبقية
grep -r "firmService.getMembers(" src/

# يجب أن يُظهر فقط تعريف الدالة القديمة في firmService.ts
```

### حالة الترحيل الحالية

✅ **مكتمل** - جميع المكونات تستخدم `getTeamMembers()`

الملفات التي تم التحقق منها:
- `/src/hooks/useStaff.ts` - ✅ تستخدم `getTeamMembers()`
- `/src/features/staff/components/staff-departure-dialog.tsx` - ✅ تستخدم خدمات المكتب الأخرى بشكل صحيح
- `/src/features/staff/components/staff-reinstate-dialog.tsx` - ✅ تستخدم خدمات المكتب الأخرى بشكل صحيح
- `/src/stores/permissions-store.ts` - ✅ تستخدم `getMyPermissions()` بشكل صحيح

لا حاجة لاتخاذ أي إجراء. تم ترحيل جميع المكونات بالفعل.

### الجدول الزمني للإزالة

- **الآن:** تم وضع علامة على الدالة كقديمة مع تحذيرات ثنائية اللغة
- **الربع الأول 2025:** سيتم إزالة الدالة بالكامل
- **الإجراء المطلوب:** لا شيء - اكتمل الترحيل

---

## API Reference

### getTeamMembers()

```typescript
firmService.getTeamMembers(
  firmId: string,
  options?: { showDeparted?: boolean }
): Promise<{
  members: FirmMember[]
  total: number
  activeCount?: number
  departedCount?: number
}>
```

**Parameters | المعاملات:**
- `firmId` - Firm identifier | معرف المكتب
- `options.showDeparted` - Include departed members | تضمين الأعضاء المغادرين

**Returns | الإرجاع:**
- `members` - Array of team members | مصفوفة أعضاء الفريق
- `total` - Total count of members | العدد الإجمالي للأعضاء
- `activeCount` - Count of active members | عدد الأعضاء النشطين
- `departedCount` - Count of departed members | عدد الأعضاء المغادرين

**Example | مثال:**
```typescript
// Get active members only
const { members, total, activeCount } = await firmService.getTeamMembers(firmId)

// Get all members including departed
const { members, total, activeCount, departedCount } = await firmService.getTeamMembers(
  firmId,
  { showDeparted: true }
)
```

---

## Support | الدعم

For questions or issues:
- Create an issue in the project repository
- Contact the development team

للأسئلة أو المشكلات:
- أنشئ مشكلة في مستودع المشروع
- اتصل بفريق التطوير
