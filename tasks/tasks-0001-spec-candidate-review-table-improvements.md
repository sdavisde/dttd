# Task List: Candidate Review Table Improvements

**Source Spec**: `0001-spec-candidate-review-table-improvements.md`
**Status**: Parent tasks defined, awaiting sub-task generation
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

- [ ] **1.0 Enhanced Status System & Table Foundation**
  - **Demo Criteria**: Open `/review-candidate` page; observe color-coded status badges on each candidate; see always-visible status legend below table showing all 6 statuses with colors and descriptions; legend matches the color scheme (blue → yellow → green, red for rejected)
  - **Proof Artifact(s)**: Screenshot of table with color-coded statuses; Screenshot of status legend below table; URL: `/review-candidate` (accessible by Pre-Weekend Couple)

- [ ] **2.0 Table Controls & Data Management**
  - **Demo Criteria**: Search candidates by name/email/sponsor in real-time; filter by status (multi-select); sort by clicking column headers (name, sponsor, submitted, status); navigate pages with pagination controls showing "Showing X-Y of Z candidates"; toggle "Show Archived Candidates" to reveal/hide rejected candidates
  - **Proof Artifact(s)**: Video showing search → filter → sort → paginate workflow; Screenshot of table with "Show Archived" toggle enabled showing rejected candidates grayed out; Test: `use-candidate-review-table.test.ts` passing

- [ ] **3.0 Deep Linking & Workflow Modals**
  - **Demo Criteria**: Click deep link from email (`/review-candidate?candidate_id=abc123`) → page opens with that candidate's detail sheet automatically opened and row highlighted; click "Accept" on sponsored candidate → modal shows email preview and explanation; click "Reject" → confirmation modal with archive warning; both modals update status and refresh table on confirm
  - **Proof Artifact(s)**: Video showing email click → deep link → auto-open modal → row highlight; Screenshot of Accept modal with email preview; Screenshot of Reject modal with archive checkbox; Test: Deep link handling works for valid/invalid IDs

- [ ] **4.0 Inline Actions & Email Notifications**
  - **Demo Criteria**: Each table row shows contextual action buttons based on status (sponsored: Accept/Reject; pending_approval: Approve/Reject; awaiting_payment: Resend Payment); clicking actions triggers appropriate modals/confirmations; email notifications sent at key steps (sponsorship submitted, forms completed) with deep links; Pre-Weekend Couple receives emails with working links
  - **Proof Artifact(s)**: Screenshot showing inline action buttons on different status rows; Test email received with deep link; Screenshot of notification email (CandidateFormsCompletedEmail); CLI: Check email logs showing sent emails

- [ ] **5.0 Mobile Responsive Layout**
  - **Demo Criteria**: On mobile viewport (< 768px): table hidden, card layout displayed; cards show candidate name, status badge, key info, action buttons; all functionality works (search, filter, modals, actions); touch targets meet 44px minimum; on desktop (>= 768px): cards hidden, table displayed
  - **Proof Artifact(s)**: Screenshot of mobile card layout; Screenshot showing responsive breakpoint transition (side-by-side); Video of mobile interaction (tap card → modal opens → action completes); Test: Responsive layout verified at md breakpoint

---

**Next Steps**: Respond with "Generate sub tasks" to break down each parent task into detailed implementation steps.
