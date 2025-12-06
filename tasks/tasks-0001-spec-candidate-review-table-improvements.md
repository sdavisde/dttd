# Task List: Candidate Review Table Improvements

**Source Spec**: `0001-spec-candidate-review-table-improvements.md`
**Status**: Sub-tasks generated, ready for implementation
**Last Updated**: 2025-11-02

---

## Relevant Files

### Existing Files to Modify
- `app/(public)/review-candidate/page.tsx` - Add URL param handling for deep linking
- `app/(public)/review-candidate/components/CandidateReviewTable.tsx` - Add new modals, controls, legend, state management
- `app/(public)/review-candidate/components/CandidateTable.tsx` - Add Actions column, integrate with new hook, make responsive
- `app/(public)/review-candidate/components/CandidateActions.tsx` - Update action visibility logic per new workflow
- `app/(public)/review-candidate/components/CandidateDetailSheet.tsx` - Minor updates for new action handlers
- `components/candidates/status-chip.tsx` - Update color mapping to use Badge `color` prop per FR-1
- `actions/candidates.ts` - Add approve/reject actions with proper status transitions
- `actions/emails.ts` - Add new email notification functions

### New Files to Create
- `app/(public)/review-candidate/components/CandidateTableControls.tsx` - Search, filter, sort, pagination UI
- `app/(public)/review-candidate/components/CandidateTableActions.tsx` - Inline action buttons for table rows
- `app/(public)/review-candidate/components/CandidateCard.tsx` - Mobile card layout component
- `app/(public)/review-candidate/components/StatusLegend.tsx` - Always-visible status reference below table
- `app/(public)/review-candidate/components/AcceptCandidateModal.tsx` - Accept + send forms combined modal with preview
- `app/(public)/review-candidate/components/RejectCandidateModal.tsx` - Reject with archive + optional notification modal
- `app/(public)/review-candidate/components/EmailPreviewModal.tsx` - Generic email preview modal (optional but recommended)
- `hooks/use-candidate-review-table.ts` - Table state management hook (search, filter, sort, pagination)
- `components/email/CandidateFormsCompletedEmail.tsx` - Email when candidate completes forms
- `components/email/SponsorshipNotificationEmail.tsx` - Update existing or create new with deep link
- `components/email/CandidateRejectionEmail.tsx` - Optional rejection notification to sponsor

### Reference Files (For Patterns)
- `app/admin/weekends/[weekend_id]/weekend-roster-table.tsx` - **PRIMARY REFERENCE** for search/filter/sort/pagination and mobile responsive dual-layout
- `hooks/use-table-pagination.ts` - Existing pagination hook to integrate
- `components/ui/delete-confirmation-dialog.tsx` - Pattern for confirmation modals
- `components/email/CandidateFormsEmail.tsx` - Existing email component for reference
- `components/email/PaymentRequestEmail.tsx` - Existing email component for reference

### Notes
- Follow the dual-layout pattern from `weekend-roster-table.tsx` for mobile responsiveness
- Use `router.refresh()` instead of `window.location.reload()`
- Use `toast` from `sonner` for user feedback
- Email preview is optional - can implement as "nice-to-have" in later phase
- All modals should use shadcn/ui Sheet or Dialog components
- Status colors use Badge `color` prop: info, warning, secondary, success, error

---

## Tasks

- [x] **1.0 Enhanced Status System & Table Foundation**
  - **Demo Criteria**: Open `/review-candidate` page; observe color-coded status badges on each candidate; see always-visible status legend below table showing all 6 statuses with colors and descriptions; legend matches the color scheme (blue → yellow → green, red for rejected)
  - **Proof Artifact(s)**: Screenshot of table with color-coded statuses; Screenshot of status legend below table; URL: `/review-candidate` (accessible by Pre-Weekend Couple)
  - [x] 1.1 Update `components/candidates/status-chip.tsx` to use Badge `color` prop instead of `variant` per FR-1 color scheme (sponsored: info, awaiting_forms: warning, pending_approval: secondary, awaiting_payment: warning, confirmed: success, rejected: error)
  - [x] 1.2 Create `StatusLegend.tsx` component displaying all 6 statuses with their badges and descriptions in a grid layout below the table
  - [x] 1.3 Add StatusLegend component to `CandidateReviewTable.tsx` below the table component
  - [x] 1.4 Remove or deprecate `StatusInfoSheet.tsx` component (replaced by always-visible legend)
  - [x] 1.5 Test color accessibility and verify colors are distinguishable for colorblind users (Colors use OKLCH space with text labels for full accessibility; hues well-separated: blue=220°, yellow=85°, green=145°, red=33°)

- [x] **2.0 Table Controls & Data Management**
  - **Demo Criteria**: Search candidates by name/email/sponsor in real-time; filter by status (multi-select); sort by clicking column headers (name, sponsor, submitted, status); navigate pages with pagination controls showing "Showing X-Y of Z candidates"; toggle "Show Archived Candidates" to reveal/hide rejected candidates
  - **Proof Artifact(s)**: Video showing search → filter → sort → paginate workflow; Screenshot of table with "Show Archived" toggle enabled showing rejected candidates grayed out; Test: `use-candidate-review-table.test.ts` passing
  - [x] 2.1 Create `hooks/use-candidate-review-table.ts` hook with state for search query, status filters, sort column/direction, and show archived toggle
  - [x] 2.2 Integrate existing `useTablePagination` hook into the custom hook for pagination state management
  - [x] 2.3 Implement fuzzy search logic filtering by candidate_name, candidate_email, and sponsor_name (reference: `weekend-roster-table.tsx`)
  - [x] 2.4 Implement multi-status filter logic (default: show all except rejected)
  - [x] 2.5 Implement column sorting logic (sortable: name, sponsor, submitted date, status)
  - [x] 2.6 Create `CandidateTableControls.tsx` component with search Input, status multi-select filter, "Show Archived" Switch, and clear filters button
  - [x] 2.7 Add TablePagination component below table in `CandidateReviewTable.tsx` with page size options (10, 25, 50, 100)
  - [x] 2.8 Update `CandidateTable.tsx` to add sortable column headers with up/down arrow indicators
  - [x] 2.9 Connect `CandidateTableControls` and `CandidateTable` to the custom hook in `CandidateReviewTable.tsx`
  - [x] 2.10 Replace all `window.location.reload()` calls with `router.refresh()` from `useRouter`
  - [x] 2.11 Add visual styling for archived candidates (grayed out, opacity reduced) when "Show Archived" is enabled

- [ ] **3.0 Deep Linking & Workflow Modals**
  - **Demo Criteria**: Click deep link from email (`/review-candidate?candidate_id=abc123`) → page opens with that candidate's detail sheet automatically opened and row highlighted; click "Accept" on sponsored candidate → modal shows email preview and explanation; click "Reject" → confirmation modal with archive warning; both modals update status and refresh table on confirm
  - **Proof Artifact(s)**: Video showing email click → deep link → auto-open modal → row highlight; Screenshot of Accept modal with email preview; Screenshot of Reject modal with archive checkbox; Test: Deep link handling works for valid/invalid IDs
  - [ ] 3.1 Update `app/(public)/review-candidate/page.tsx` to extract `candidate_id` from searchParams and pass to CandidateReviewTable
  - [ ] 3.2 Add `selectedCandidateId` prop to `CandidateReviewTable` and auto-open detail sheet if provided
  - [ ] 3.3 Implement row highlight animation (add `animate-highlight` class for 3 seconds then fade out) using Tailwind animations
  - [ ] 3.4 Add scroll-into-view logic to bring the deep-linked candidate row into viewport
  - [ ] 3.5 Add toast error message using `sonner` if `candidate_id` is invalid or not found
  - [ ] 3.6 Create `AcceptCandidateModal.tsx` (Dialog component) with candidate details, explanation text, rendered email preview section (CandidateFormsEmail), "Cancel" and "Accept & Send Forms" buttons
  - [ ] 3.7 Add `@react-email/render` function to render email component to HTML for preview in modal
  - [ ] 3.8 Create `RejectCandidateModal.tsx` (Dialog component) with candidate/sponsor details, warning text, optional "Send rejection notification to sponsor" checkbox, "Cancel" and "Reject & Archive" buttons
  - [ ] 3.9 Wire up Accept button in `CandidateActions` and `CandidateTableActions` to open AcceptCandidateModal
  - [ ] 3.10 Wire up Reject button to open RejectCandidateModal
  - [ ] 3.11 Implement modal confirmation handlers: Accept → updateCandidateStatus('awaiting_forms') + sendCandidateForms(), Reject → updateCandidateStatus('rejected')
  - [ ] 3.12 Add success/error toast notifications after modal actions complete
  - [ ] 3.13 Call `router.refresh()` after successful modal actions to update table

- [ ] **4.0 Inline Actions & Email Notifications**
  - **Demo Criteria**: Each table row shows contextual action buttons based on status (sponsored: Accept/Reject; pending_approval: Approve/Reject; awaiting_payment: Resend Payment); clicking actions triggers appropriate modals/confirmations; email notifications sent at key steps (sponsorship submitted, forms completed) with deep links; Pre-Weekend Couple receives emails with working links
  - **Proof Artifact(s)**: Screenshot showing inline action buttons on different status rows; Test email received with deep link; Screenshot of notification email (CandidateFormsCompletedEmail); CLI: Check email logs showing sent emails
  - [ ] 4.1 Create `CandidateTableActions.tsx` component with contextual button logic per FR-20 (sponsored: Accept/Reject/View; awaiting_forms: View/Resend Forms; pending_approval: Approve/Reject/View; awaiting_payment: Preview/Resend Payment/View; confirmed: View; rejected: View/Unarchive)
  - [ ] 4.2 Add Actions column to `CandidateTable.tsx` as the rightmost column, rendering CandidateTableActions for each row
  - [ ] 4.3 Create `components/email/CandidateFormsCompletedEmail.tsx` React Email template with subject "[Candidate Name] Has Completed Their Forms - Action Required", deep link button to `/review-candidate?candidate_id=[id]`
  - [ ] 4.4 Check if `components/email/SponsorshipNotificationEmail.tsx` exists; if yes, update with deep link; if no, create new template with subject "New Sponsorship Request: [Candidate Name]" and deep link
  - [ ] 4.5 Add `sendCandidateFormsCompletedEmail(candidateId)` function to `actions/emails.ts` that sends to all Pre-Weekend Couple users
  - [ ] 4.6 Add `sendSponsorshipNotification(candidateId)` function to `actions/emails.ts` (or update existing) to include deep link parameter
  - [ ] 4.7 Find where candidate forms are submitted (likely in `app/(public)/candidate/[id]/forms` route) and add trigger to call `sendCandidateFormsCompletedEmail` after status update to `pending_approval`
  - [ ] 4.8 Verify sponsorship form submission triggers `sendSponsorshipNotification` with deep link (update if needed)
  - [ ] 4.9 Add "Resend Forms Email" action button that calls `sendCandidateForms` again
  - [ ] 4.10 Add "Resend Payment Request" action button that calls `sendPaymentRequestEmail` again
  - [ ] 4.11 Update approve handler to open confirmation modal (similar to Accept) showing payment request details before sending
  - [ ] 4.12 Test email delivery and verify deep links work end-to-end

- [ ] **5.0 Mobile Responsive Layout**
  - **Demo Criteria**: On mobile viewport (< 768px): table hidden, card layout displayed; cards show candidate name, status badge, key info, action buttons; all functionality works (search, filter, modals, actions); touch targets meet 44px minimum; on desktop (>= 768px): cards hidden, table displayed
  - **Proof Artifact(s)**: Screenshot of mobile card layout; Screenshot showing responsive breakpoint transition (side-by-side); Video of mobile interaction (tap card → modal opens → action completes); Test: Responsive layout verified at md breakpoint
  - [ ] 5.1 Create `CandidateCard.tsx` component following the pattern from `weekend-roster-table.tsx` with header (name + status badge), body (email, sponsor, submitted date labels), footer (action buttons from CandidateTableActions)
  - [ ] 5.2 Add mobile card layout section to `CandidateTable.tsx` with `md:hidden` class wrapping the cards, and add `hidden md:block` to the existing table
  - [ ] 5.3 Ensure cards use `bg-card border rounded-lg p-4 space-y-3` styling per spec
  - [ ] 5.4 Wire up card click handler to open CandidateDetailSheet (same as row click)
  - [ ] 5.5 Ensure all action buttons in cards have minimum 44px touch targets (use `min-h-[44px] min-w-[44px]` classes)
  - [ ] 5.6 Test all modals (Accept, Reject, Approve, Detail Sheet) work correctly when triggered from mobile cards
  - [ ] 5.7 Test search, filter, sort, pagination controls work on mobile viewports
  - [ ] 5.8 Verify deep link highlighting and scroll-into-view work for mobile cards
  - [ ] 5.9 Test responsive breakpoint transition at 768px (md breakpoint) switches between table and cards smoothly

---

**Implementation Notes**:
- Start with Task 1.0 (sub-task 1.1) and work sequentially through each sub-task
- Mark sub-tasks as `[~]` when starting, `[x]` when complete
- After completing all sub-tasks in a parent task, run tests, commit changes, then mark parent task as `[x]`
- Use the completion protocol: test → stage → validate → commit → mark complete
