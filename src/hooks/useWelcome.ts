import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TourStep {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  target?: string
  action?: string
}

interface ChecklistItem {
  id: string
  title: string
  titleAr: string
  completed: boolean
  link?: string
}

interface WelcomeState {
  // Welcome modal state
  hasSeenWelcome: boolean
  dontShowWelcomeAgain: boolean
  markWelcomeAsSeen: () => void
  setDontShowAgain: (value: boolean) => void
  resetWelcome: () => void

  // Tour state
  isTourActive: boolean
  currentTourStep: number
  tourSteps: TourStep[]
  startTour: () => void
  nextTourStep: () => void
  previousTourStep: () => void
  skipTour: () => void
  completeTour: () => void

  // Checklist state
  checklist: ChecklistItem[]
  completeChecklistItem: (id: string) => void
  resetChecklist: () => void
}

const defaultTourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    titleAr: 'نظرة عامة على لوحة التحكم',
    description: 'View your key metrics, recent activities, and quick actions all in one place.',
    descriptionAr: 'اعرض مقاييسك الرئيسية والأنشطة الأخيرة والإجراءات السريعة في مكان واحد.',
    target: 'dashboard',
    action: 'overview'
  },
  {
    id: 'cases',
    title: 'Manage Cases',
    titleAr: 'إدارة القضايا',
    description: 'Create, track, and manage all your legal cases with ease.',
    descriptionAr: 'إنشاء وتتبع وإدارة جميع قضاياك القانونية بسهولة.',
    target: 'cases',
    action: 'case-management'
  },
  {
    id: 'clients',
    title: 'Client Management',
    titleAr: 'إدارة العملاء',
    description: 'Keep track of your clients, contacts, and organizations.',
    descriptionAr: 'تتبع عملائك وجهات الاتصال والمؤسسات.',
    target: 'clients',
    action: 'client-management'
  },
  {
    id: 'finance',
    title: 'Financial Overview',
    titleAr: 'النظرة المالية',
    description: 'Manage invoices, payments, expenses, and track your time.',
    descriptionAr: 'إدارة الفواتير والمدفوعات والمصروفات وتتبع وقتك.',
    target: 'finance',
    action: 'finance-management'
  },
  {
    id: 'documents',
    title: 'Document Management',
    titleAr: 'إدارة المستندات',
    description: 'Store, organize, and access all your legal documents securely.',
    descriptionAr: 'قم بتخزين وتنظيم والوصول إلى جميع مستنداتك القانونية بشكل آمن.',
    target: 'documents',
    action: 'document-management'
  }
]

const defaultChecklist: ChecklistItem[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    titleAr: 'أكمل ملفك الشخصي',
    completed: false,
    link: '/settings/profile'
  },
  {
    id: 'first-case',
    title: 'Create your first case',
    titleAr: 'إنشاء قضيتك الأولى',
    completed: false,
    link: '/cases'
  },
  {
    id: 'add-client',
    title: 'Add your first client',
    titleAr: 'إضافة عميلك الأول',
    completed: false,
    link: '/clients'
  },
  {
    id: 'upload-document',
    title: 'Upload a document',
    titleAr: 'تحميل مستند',
    completed: false,
    link: '/documents'
  },
  {
    id: 'invite-team',
    title: 'Invite team members',
    titleAr: 'دعوة أعضاء الفريق',
    completed: false,
    link: '/settings/team'
  }
]

export const useWelcome = create<WelcomeState>()(
  persist(
    (set, get) => ({
      // Welcome modal state
      hasSeenWelcome: false,
      dontShowWelcomeAgain: false,

      markWelcomeAsSeen: () => set({ hasSeenWelcome: true }),

      setDontShowAgain: (value: boolean) =>
        set({ dontShowWelcomeAgain: value, hasSeenWelcome: true }),

      resetWelcome: () =>
        set({ hasSeenWelcome: false, dontShowWelcomeAgain: false }),

      // Tour state
      isTourActive: false,
      currentTourStep: 0,
      tourSteps: defaultTourSteps,

      startTour: () => set({ isTourActive: true, currentTourStep: 0 }),

      nextTourStep: () => {
        const { currentTourStep, tourSteps } = get()
        if (currentTourStep < tourSteps.length - 1) {
          set({ currentTourStep: currentTourStep + 1 })
        } else {
          get().completeTour()
        }
      },

      previousTourStep: () => {
        const { currentTourStep } = get()
        if (currentTourStep > 0) {
          set({ currentTourStep: currentTourStep - 1 })
        }
      },

      skipTour: () => set({ isTourActive: false, currentTourStep: 0 }),

      completeTour: () => set({ isTourActive: false, currentTourStep: 0 }),

      // Checklist state
      checklist: defaultChecklist,

      completeChecklistItem: (id: string) => {
        const { checklist } = get()
        set({
          checklist: checklist.map(item =>
            item.id === id ? { ...item, completed: true } : item
          )
        })
      },

      resetChecklist: () => set({ checklist: defaultChecklist })
    }),
    {
      name: 'welcome-storage',
      version: 1
    }
  )
)
