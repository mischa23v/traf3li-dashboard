# TRAF3LI Dashboard Design Principles (ترافعلي)

## I. Core Philosophy for Legal Platform

### Saudi Market Requirements
- [ ] **Arabic-First (RTL)**: All layouts must work perfectly in RTL
- [ ] **Professional & Trustworthy**: Legal platform requires formal, polished design
- [ ] **PDPL Compliance Visual**: Privacy states must be clearly visible
- [ ] **Role-Based Clarity**: User must always know their role (Admin/Lawyer/Client)
- [ ] **Accessibility**: WCAG AA minimum (legal documents must be accessible)

### Technology Stack
- **Framework**: React 19 + TypeScript + TanStack Router
- **UI Library**: Shadcn/ui (35 components installed)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: TanStack Query
- **Language**: i18next (Arabic primary, English secondary)

## II. Color System

### Semantic Colors
- [ ] **Success**: Green (`bg-green-500`) - Case won, payment received
- [ ] **Error/Destructive**: Red (`bg-destructive`) - Case rejected, payment failed
- [ ] **Warning**: Amber (`bg-amber-500`) - Pending review, deadline approaching
- [ ] **Info**: Blue (`bg-blue-500`) - New notification, information

### Legal-Specific Colors
- [ ] **Judgment (Encrypted)**: Red badge/icon to indicate sensitive data
- [ ] **Client Data**: Yellow indicator for PDPL-protected info
- [ ] **Public Data**: Green for non-sensitive information

## III. Typography for Arabic & English

### Type Scale
- [ ] **H1**: `text-4xl font-bold` - Page titles
- [ ] **H2**: `text-3xl font-semibold` - Section headers
- [ ] **H3**: `text-2xl font-semibold` - Card headers
- [ ] **H4**: `text-xl font-medium` - Subsections
- [ ] **Body**: `text-base` - Default

### RTL Considerations
- [ ] **Text Alignment**: `text-right` for Arabic, `text-left` for English
- [ ] **Padding**: Use `ps-` (padding-start) and `pe-` (padding-end) instead of `pl-`/`pr-`
- [ ] **Icons**: May need to flip in RTL (e.g., chevrons)

## IV. Components

### Forms (Critical for Legal Platform)
- [ ] **Labels**: Always visible, never floating placeholders
- [ ] **Required Fields**: Red asterisk `*` or "(مطلوب)"
- [ ] **Error Messages**: Below field, red text with icon
- [ ] **Validation**: Real-time for critical fields

### Tables
- [ ] **Headers**: Sticky on scroll
- [ ] **Sorting**: Visual indicator
- [ ] **Pagination**: Clear controls
- [ ] **Empty State**: Helpful message + action button

### Buttons
- [ ] **Primary**: `variant="default"` - Main actions
- [ ] **Secondary**: `variant="secondary"` - Less important
- [ ] **Destructive**: `variant="destructive"` - Delete, reject
- [ ] **Icon Only**: Must have `aria-label`

## V. Role-Based UI Patterns

### Admin Dashboard
- [ ] Metrics cards, data tables, charts, system settings

### Lawyer Dashboard
- [ ] Case cards, client list, document upload, calendar, time tracker

### Client Dashboard
- [ ] Simplified UI, case status, invoices, messages

## VI. Security & Privacy (PDPL)

### Sensitive Data Display
- [ ] **Encrypted Judgments**: 🔒 Lock icon + "مشفر" badge
- [ ] **National IDs**: Masked (show last 4 digits)
- [ ] **Payment Info**: Never show full card numbers

## VII. Accessibility (WCAG 2.1 AA)

- [ ] **Keyboard Navigation**: Tab through all elements
- [ ] **Focus Indicators**: Visible rings on interactive elements
- [ ] **Color Contrast**: 4.5:1 for text, 3:1 for UI
- [ ] **Alt Text**: All images

## VIII. Arabic/RTL Rules

- [ ] Test every component in both Arabic and English
- [ ] Sidebar on RIGHT in RTL, LEFT in LTR
- [ ] Icons flip direction where needed
- [ ] Use logical properties (ps-/pe- not pl-/pr-)

## IX. Never Do

- [ ] ❌ Use lorem ipsum (use real Arabic content)
- [ ] ❌ Hardcode colors (use Tailwind classes)
- [ ] ❌ Forget RTL testing
- [ ] ❌ Use `!important` in CSS
- [ ] ❌ Show unencrypted sensitive data
- [ ] ❌ Skip accessibility