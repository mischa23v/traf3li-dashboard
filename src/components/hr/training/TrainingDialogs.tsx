import { z } from 'zod'
import { GenericFormDialog } from '@/components/generic-form-dialog'
import type { FormSectionConfig } from '@/components/generic-form-dialog'

// ==================== APPROVE TRAINING DIALOG ====================

const approveTrainingSchema = z.object({
  comments: z.string().optional(),
})

type ApproveTrainingData = z.infer<typeof approveTrainingSchema>

interface ApproveTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ApproveTrainingData) => Promise<void>
  isLoading?: boolean
}

export function ApproveTrainingDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: ApproveTrainingDialogProps) {
  const sections: FormSectionConfig[] = [
    {
      fields: [
        {
          name: 'comments',
          type: 'textarea',
          label: 'Comments',
          labelAr: 'ملاحظات',
          placeholder: 'Any approval comments...',
          placeholderAr: 'أي ملاحظات على الاعتماد...',
          rows: 4,
          colSpan: 2,
        },
      ],
      columns: 2,
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Approve Training Request"
      titleAr="اعتماد طلب التدريب"
      schema={approveTrainingSchema}
      sections={sections}
      onSubmit={onSubmit}
      isLoading={isLoading}
      mode="edit"
      submitLabel="Approve"
      submitLabelAr="اعتماد"
      maxWidth="md"
    />
  )
}

// ==================== REJECT TRAINING DIALOG ====================

const rejectTrainingSchema = z.object({
  reason: z.string().min(1, { message: 'يرجى توضيح سبب الرفض' }),
})

type RejectTrainingData = z.infer<typeof rejectTrainingSchema>

interface RejectTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RejectTrainingData) => Promise<void>
  isLoading?: boolean
}

export function RejectTrainingDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: RejectTrainingDialogProps) {
  const sections: FormSectionConfig[] = [
    {
      fields: [
        {
          name: 'reason',
          type: 'textarea',
          label: 'Rejection Reason',
          labelAr: 'سبب الرفض',
          placeholder: 'Please explain the reason for rejection...',
          placeholderAr: 'يرجى توضيح سبب الرفض...',
          required: true,
          rows: 4,
          colSpan: 2,
        },
      ],
      columns: 2,
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reject Training Request"
      titleAr="رفض طلب التدريب"
      schema={rejectTrainingSchema}
      sections={sections}
      onSubmit={onSubmit}
      isLoading={isLoading}
      mode="edit"
      submitLabel="Reject"
      submitLabelAr="رفض"
      maxWidth="md"
    />
  )
}

// ==================== COMPLETE TRAINING DIALOG ====================

const completeTrainingSchema = z.object({
  finalScore: z.number().min(0).max(100).optional(),
  finalGrade: z.string().optional(),
})

type CompleteTrainingData = z.infer<typeof completeTrainingSchema>

interface CompleteTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CompleteTrainingData) => Promise<void>
  isLoading?: boolean
}

export function CompleteTrainingDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CompleteTrainingDialogProps) {
  const sections: FormSectionConfig[] = [
    {
      fields: [
        {
          name: 'finalScore',
          type: 'number',
          label: 'Final Score',
          labelAr: 'الدرجة النهائية',
          placeholder: '0',
          placeholderAr: '0',
          min: 0,
          max: 100,
          step: 1,
        },
        {
          name: 'finalGrade',
          type: 'text',
          label: 'Grade',
          labelAr: 'التقدير',
          placeholder: 'e.g., Excellent',
          placeholderAr: 'مثال: ممتاز',
        },
      ],
      columns: 2,
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Complete Training"
      titleAr="إكمال التدريب"
      schema={completeTrainingSchema}
      sections={sections}
      onSubmit={onSubmit}
      isLoading={isLoading}
      mode="edit"
      submitLabel="Complete"
      submitLabelAr="إكمال"
      maxWidth="md"
    />
  )
}

// ==================== TRAINING EVALUATION DIALOG ====================

const trainingEvaluationSchema = z.object({
  overallSatisfaction: z.number().min(1).max(5),
  contentRelevance: z.number().min(1).max(5),
  contentQuality: z.number().min(1).max(5),
  instructorKnowledge: z.number().min(1).max(5),
  instructorEffectiveness: z.number().min(1).max(5),
  materialsQuality: z.number().min(1).max(5),
  recommendToOthers: z.number().min(1).max(5),
  whatWasGood: z.string().optional(),
  whatCouldImprove: z.string().optional(),
  additionalComments: z.string().optional(),
})

type TrainingEvaluationData = z.infer<typeof trainingEvaluationSchema>

interface TrainingEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TrainingEvaluationData) => Promise<void>
  isLoading?: boolean
}

export function TrainingEvaluationDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: TrainingEvaluationDialogProps) {
  const sections: FormSectionConfig[] = [
    {
      title: 'Ratings',
      titleAr: 'التقييمات',
      fields: [
        {
          name: 'overallSatisfaction',
          type: 'number',
          label: 'Overall Satisfaction (1-5)',
          labelAr: 'الرضا العام (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'contentRelevance',
          type: 'number',
          label: 'Content Relevance (1-5)',
          labelAr: 'صلة المحتوى (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'contentQuality',
          type: 'number',
          label: 'Content Quality (1-5)',
          labelAr: 'جودة المحتوى (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'instructorKnowledge',
          type: 'number',
          label: 'Instructor Knowledge (1-5)',
          labelAr: 'معرفة المدرب (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'instructorEffectiveness',
          type: 'number',
          label: 'Instructor Effectiveness (1-5)',
          labelAr: 'فعالية المدرب (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'materialsQuality',
          type: 'number',
          label: 'Materials Quality (1-5)',
          labelAr: 'جودة المواد (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
        {
          name: 'recommendToOthers',
          type: 'number',
          label: 'Recommend to Others (1-5)',
          labelAr: 'التوصية للآخرين (1-5)',
          min: 1,
          max: 5,
          step: 1,
          required: true,
          defaultValue: 3,
        },
      ],
      columns: 2,
    },
    {
      title: 'Feedback',
      titleAr: 'الملاحظات',
      fields: [
        {
          name: 'whatWasGood',
          type: 'textarea',
          label: 'What did you like?',
          labelAr: 'ما الذي أعجبك؟',
          rows: 3,
          colSpan: 2,
        },
        {
          name: 'whatCouldImprove',
          type: 'textarea',
          label: 'What could be improved?',
          labelAr: 'ما الذي يمكن تحسينه؟',
          rows: 3,
          colSpan: 2,
        },
        {
          name: 'additionalComments',
          type: 'textarea',
          label: 'Additional Comments',
          labelAr: 'ملاحظات إضافية',
          rows: 3,
          colSpan: 2,
        },
      ],
      columns: 2,
    },
  ]

  return (
    <GenericFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Training Evaluation"
      titleAr="تقييم التدريب"
      description="Please rate your training experience"
      descriptionAr="يرجى تقييم تجربتك في التدريب"
      schema={trainingEvaluationSchema}
      sections={sections}
      defaultValues={{
        overallSatisfaction: 3,
        contentRelevance: 3,
        contentQuality: 3,
        instructorKnowledge: 3,
        instructorEffectiveness: 3,
        materialsQuality: 3,
        recommendToOthers: 3,
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
      mode="create"
      submitLabel="Submit Evaluation"
      submitLabelAr="إرسال التقييم"
      maxWidth="2xl"
    />
  )
}

// Export types for use in parent components
export type {
  ApproveTrainingData,
  RejectTrainingData,
  CompleteTrainingData,
  TrainingEvaluationData,
}
