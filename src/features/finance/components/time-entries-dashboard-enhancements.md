# Time Entries Dashboard - Approval Workflow Enhancements

This document describes the changes needed to add approval workflow functionality to the existing `time-entries-dashboard.tsx` component.

## 1. Add New Imports

Add these imports at the top of the file after the existing imports:

```typescript
import { useSubmitTimeEntryForApproval } from '@/hooks/useFinance'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
```

## 2. Update the Data Transformation (around line 89-105)

Replace the current `timeEntries` useMemo with this enhanced version:

```typescript
const timeEntries = useMemo(() => {
    if (!entriesData?.data) return []
    return entriesData.data.map((entry: any) => ({
        id: entry._id,
        date: new Date(entry.date).toLocaleDateString('ar-SA'),
        client: entry.clientId?.name || entry.clientId?.firstName + ' ' + entry.clientId?.lastName || 'عميل غير محدد',
        caseNumber: entry.caseId?.caseNumber || 'غير محدد',
        task: entry.description || 'مهمة غير محددة',
        hours: entry.hours || 0,
        rate: entry.hourlyRate || 0,
        amount: entry.totalAmount || (entry.hours * entry.hourlyRate) || 0,

        // Enhanced: Add approval status fields
        approvalStatus: entry.approvalStatus || entry.status || 'draft',
        submittedAt: entry.submittedAt,
        approvedAt: entry.approvedAt,
        approvedBy: entry.approvedBy?.firstName + ' ' + entry.approvedBy?.lastName,
        rejectedAt: entry.rejectedAt,
        rejectedBy: entry.rejectedBy?.firstName + ' ' + entry.rejectedBy?.lastName,
        rejectionReason: entry.rejectionReason,
        changesRequested: entry.changesRequested,

        // Original status for billing
        status: entry.isBilled ? 'billed' : entry.isBillable ? 'unbilled' : 'non-billable',
        lawyer: entry.userId?.firstName + ' ' + entry.userId?.lastName || 'غير محدد',
        billable: entry.isBillable,
        _id: entry._id,
    }))
}, [entriesData])
```

## 3. Add State and Mutations (after line 36)

Add these state variables and mutations:

```typescript
const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
const [selectedEntryForSubmit, setSelectedEntryForSubmit] = useState<string | null>(null)
const [submitNotes, setSubmitNotes] = useState('')

// Approval mutation
const submitForApprovalMutation = useSubmitTimeEntryForApproval()

// Submit handler
const handleSubmitForApproval = useCallback((id: string) => {
    submitForApprovalMutation.mutate(id, {
        onSuccess: () => {
            setSubmitDialogOpen(false)
            setSubmitNotes('')
            setSelectedEntryForSubmit(null)
            refetch()
        }
    })
}, [submitForApprovalMutation, refetch])
```

## 4. Update the Status Badge (around line 319-325)

Replace the current status badge with this enhanced version that shows approval status:

```typescript
<Badge variant="outline" className={`${
    entry.approvalStatus === 'submitted' ? 'text-blue-600 border-blue-200 bg-blue-50' :
    entry.approvalStatus === 'approved' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
    entry.approvalStatus === 'rejected' ? 'text-red-600 border-red-200 bg-red-50' :
    entry.approvalStatus === 'draft' ? 'text-slate-600 border-slate-200 bg-slate-50' :
    entry.status === 'unbilled' ? 'text-amber-600 border-amber-200 bg-amber-50' :
    entry.status === 'billed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
    'text-slate-600 border-slate-200 bg-slate-50'
} border px-2 rounded-md`}>
    {entry.approvalStatus === 'submitted' ? 'معلق' :
     entry.approvalStatus === 'approved' ? 'تمت الموافقة' :
     entry.approvalStatus === 'rejected' ? 'مرفوض' :
     entry.approvalStatus === 'draft' ? 'مسودة' :
     entry.status === 'unbilled' ? 'غير مفوتر' :
     entry.status === 'billed' ? 'تم الفوترة' : 'غير قابل للفوترة'}
</Badge>
```

## 5. Add Rejection Reason Display (after the task description, around line 333)

Add this after the client/case info div:

```typescript
{entry.rejectionReason && (
    <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-xs font-semibold text-red-900 mb-1">سبب الرفض:</p>
            <p className="text-sm text-red-700">{entry.rejectionReason}</p>
            {entry.rejectedBy && (
                <p className="text-xs text-red-600 mt-1">
                    تم الرفض بواسطة {entry.rejectedBy} - {new Date(entry.rejectedAt).toLocaleString('ar-SA')}
                </p>
            )}
        </div>
    </div>
)}

{entry.changesRequested && (
    <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900 mb-1">تعديلات مطلوبة:</p>
            <p className="text-sm text-amber-700">{entry.changesRequested}</p>
        </div>
    </div>
)}
```

## 6. Update the Dropdown Menu (around line 342-350)

Replace the current dropdown menu with this enhanced version:

```typescript
<DropdownMenuContent align="end">
    {entry.approvalStatus === 'draft' && (
        <>
            <DropdownMenuItem onPress={() => {
                setSelectedEntryForSubmit(entry.id)
                setSubmitDialogOpen(true)
            }}>
                <Check className="h-4 w-4 me-2" />
                إرسال للموافقة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </>
    )}
    {(entry.approvalStatus === 'rejected' || entry.changesRequested) && (
        <>
            <DropdownMenuItem onPress={() => {
                setSelectedEntryForSubmit(entry.id)
                setSubmitDialogOpen(true)
            }}>
                <Check className="h-4 w-4 me-2" />
                إعادة الإرسال للموافقة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
        </>
    )}
    <DropdownMenuItem asChild>
        <Link to="/dashboard/finance/time-tracking/$entryId" params={{ entryId: entry.id }}>
            عرض التفاصيل
        </Link>
    </DropdownMenuItem>
    {entry.approvalStatus === 'draft' || entry.approvalStatus === 'rejected' ? (
        <DropdownMenuItem>تعديل السجل</DropdownMenuItem>
    ) : (
        <DropdownMenuItem disabled className="text-slate-400">
            تعديل السجل (مغلق)
        </DropdownMenuItem>
    )}
    {entry.approvalStatus === 'approved' && !entry.isBilled && (
        <DropdownMenuItem>إنشاء فاتورة</DropdownMenuItem>
    )}
    {entry.approvalStatus === 'draft' && (
        <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
    )}
</DropdownMenuContent>
```

## 7. Add Submit Dialog (at the end, before the closing fragment)

Add this dialog component before the final `</>`

```typescript
{/* Submit for Approval Dialog */}
<Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
    <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
            <DialogTitle>إرسال السجل للموافقة</DialogTitle>
            <DialogDescription>
                سيتم إرسال هذا السجل إلى المدير للموافقة. يمكنك إضافة ملاحظات إضافية (اختياري).
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Textarea
                placeholder="ملاحظات إضافية (اختياري)..."
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                rows={3}
                className="resize-none"
            />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => {
                setSubmitDialogOpen(false)
                setSubmitNotes('')
                setSelectedEntryForSubmit(null)
            }}>
                إلغاء
            </Button>
            <Button
                onClick={() => selectedEntryForSubmit && handleSubmitForApproval(selectedEntryForSubmit)}
                disabled={!selectedEntryForSubmit || submitForApprovalMutation.isPending}
            >
                {submitForApprovalMutation.isPending && (
                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                )}
                إرسال للموافقة
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

## 8. Add Missing Icons Import

Make sure these icons are imported at the top:

```typescript
import { MessageSquare, Loader2 } from 'lucide-react'
```

## Summary of Changes

1. ✅ Added approval status fields to data transformation
2. ✅ Enhanced status badge to show approval states
3. ✅ Added rejection reason display
4. ✅ Added changes requested display
5. ✅ Updated dropdown menu with submit/resubmit options
6. ✅ Added submit for approval dialog
7. ✅ Disabled editing for approved entries
8. ✅ Added visual feedback for different approval states

These changes enable employees to:
- Submit time entries for approval
- View approval status on each entry
- See rejection reasons
- Resubmit rejected or changed entries
- Understand which entries can be edited
