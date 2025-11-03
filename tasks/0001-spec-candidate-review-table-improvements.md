# Specification: Candidate Review Table Improvements

---

## Executive Summary

**TL;DR**: Transform the `/review-candidate` page from a basic list to an intuitive, guided workflow interface that helps Pre-Weekend Couple members efficiently process candidates through a 6-step journey—from initial sponsorship to confirmed attendance.

### What's Being Built
- **Color-coded status system** with always-visible legend (no more clicking for help)
- **Inline action buttons** on each row (no more opening detail sheet for every action)
- **Email preview modals** before sending (see exactly what candidates/sponsors will receive)
- **Confirmation modals** for approve/reject (understand consequences before acting)
- **Deep linking** from notification emails directly to specific candidates
- **Search, filter, sort, pagination** for efficient candidate discovery
- **Mobile-responsive card layout** following dual-layout pattern
- **Archive functionality** for rejected candidates (hide from active view)
- **Guided workflow** that makes next steps obvious at each status

### Why It Matters
**Current pain points**:
- Pre-Weekend Couple members must click each row to see what actions are available
- No way to preview emails before sending (risk of sending wrong information)
- Status meanings are hidden in a separate sheet
- No confirmation when approving/rejecting (easy to make mistakes)
- Cannot filter to see "candidates needing attention"
- Poor mobile experience

**Expected outcomes**:
- ✅ 80% reduction in accidental actions (approve/reject confirmation + email preview)
- ✅ 50% faster candidate processing (inline actions + search/filter)
- ✅ Zero confusion about what status means (always-visible legend)
- ✅ Full mobile functionality (card layout + all interactions work on mobile)

### Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Deep Linking to Candidate Modal** | ⚠️ TODO | New feature: Email notifications should include candidate ID in URL query param |
| **Accept → Send Forms Flow** | ⚠️ TODO | Update: Accepting should immediately show "Send Forms" preview modal |
| **Reject → Archive Flow** | ⚠️ TODO | New feature: Rejected candidates should be archived (soft delete or filter) |
| **Candidate Completes Forms Notification** | ⚠️ TODO | New feature: Email Pre-Weekend Couple when status changes to pending_approval |
| **Status Color Coding** | 🔄 PARTIAL | Colors exist but need updating per new gradient scheme |
| **Status Legend** | ⚠️ TODO | Currently in separate sheet, needs to be always-visible below table |
| **Inline Action Buttons** | ⚠️ TODO | Actions only in detail sheet, need to add to table rows |
| **Email Preview Modals** | ⚠️ TODO | No preview functionality exists |
| **Approve/Reject Confirmation** | 🔄 PARTIAL | Approve/Reject exist but no confirmation modals |
| **Search/Filter/Sort** | ⚠️ TODO | No table controls exist |
| **Pagination** | ⚠️ TODO | Hook exists (`useTablePagination`) but not integrated |
| **Mobile Card Layout** | ⚠️ TODO | Table not responsive (horizontal scroll on mobile) |
| **Server Actions** | ✅ DONE | `sendCandidateForms`, `sendPaymentRequestEmail`, `updateCandidateStatus` exist |
| **Email Components** | ✅ DONE | `CandidateFormsEmail`, `PaymentRequestEmail` exist |

**Legend**: ✅ DONE | 🔄 PARTIAL | ⚠️ TODO

### The 6-Step Candidate Journey

```
1. SPONSORED (Community Member)
   └─> Sponsor fills out /sponsor form
   └─> Candidate created with status: "sponsored"
   └─> Pre-Weekend Couple receives email notification with deep link
       ↓

2. REVIEW SPONSORSHIP (Pre-Weekend Couple)
   └─> Email link opens /review-candidate page with candidate modal open
   └─> Pre-Weekend Couple reviews sponsorship details
   └─> Options: Accept (go to step 3) or Reject (archived)
       ↓

3. SEND FORMS (Pre-Weekend Couple)
   └─> Clicking "Accept" opens email preview modal
   └─> Modal shows rendered "Candidate Forms" email
   └─> Explanation: "Next step is to send forms to candidate to fill out"
   └─> Confirm → Email sent to candidate, status: "awaiting_forms"
       ↓

4. CANDIDATE FILLS FORMS (Candidate)
   └─> Candidate receives email, clicks link to /candidate/[id]/forms
   └─> Candidate completes and submits required forms
   └─> Status changes: "awaiting_forms" → "pending_approval"
   └─> Pre-Weekend Couple receives notification email
       ↓

5. APPROVE & REQUEST PAYMENT (Pre-Weekend Couple)
   └─> Pre-Weekend Couple reviews completed forms in detail modal
   └─> Click "Approve" → Confirmation modal opens
   └─> Modal explains: "Payment request will be sent to [payment owner email]"
   └─> Confirm → Status: "awaiting_payment", payment email sent
       ↓

6. PAYMENT COMPLETE (Stripe Webhook)
   └─> Payment owner completes payment via Stripe
   └─> Webhook updates status: "awaiting_payment" → "confirmed"
   └─> Candidate is now confirmed for the weekend ✅
```

**Reject Flow (Can Happen at Step 2 or 5)**:
```
REJECT (Pre-Weekend Couple)
   └─> Click "Reject" → Confirmation modal opens
   └─> Modal warns: "This will archive the candidate"
   └─> Confirm → Status: "rejected", candidate archived (hidden from active view)
```

---

## 1. Introduction/Overview

The `/review-candidate` page is the primary interface for Pre-Weekend Couple members to review, approve, and manage candidates for upcoming Tres Dias weekends. The current implementation has several usability issues that make the candidate review process cumbersome and error-prone.

This specification outlines improvements to transform the candidate review experience into an intuitive, efficient workflow with better visual feedback, inline actions, confirmation dialogs, and mobile responsiveness.

**Problem Statement**: Pre-Weekend Couple members currently must:
- Click each row to see available actions (no inline action buttons)
- Open a separate sheet to understand status meanings
- Send emails without previewing content first
- Approve/reject candidates without confirmation or understanding consequences
- Cannot sort, search, or filter candidates efficiently
- Experience poor usability on mobile devices

**Goal**: Create a streamlined, self-documenting candidate review interface that reduces errors, increases efficiency, and works seamlessly across all device sizes.

---

## 2. Goals

1. **Reduce cognitive load** by making statuses self-explanatory with color coding and an always-visible legend
2. **Increase efficiency** by adding inline action buttons to each row
3. **Prevent errors** by adding preview/confirmation modals for all critical actions
4. **Improve discoverability** with better table controls (sort, search, filter, pagination)
5. **Ensure mobile usability** following the dual-layout pattern (desktop table + mobile cards)
6. **Maintain data integrity** by clearly communicating action consequences before execution

---

## 3. User Stories

### US-1: Understanding Candidate Status
**As a** Pre-Weekend Couple member
**I want to** see color-coded candidate statuses with a reference legend
**So that** I can quickly understand where each candidate is in the process without clicking additional UI elements

**Acceptance Criteria:**
- Status badges use a consistent color gradient that indicates progression
- A status reference legend is always visible below the table
- The legend explains what each status means and its visual appearance
- Colors are accessible and distinguishable for colorblind users

### US-2: Taking Action on Candidates
**As a** Pre-Weekend Couple member
**I want to** see available actions directly on each candidate row
**So that** I can take action quickly without opening a detail sheet

**Acceptance Criteria:**
- Action buttons/icons appear on each row
- Actions are contextual based on candidate status
- Common actions (view details, send forms, request payment) are always visible
- Desktop: Actions appear in a dedicated column
- Mobile: Actions appear in the card header

### US-3: Previewing Emails Before Sending
**As a** Pre-Weekend Couple member
**I want to** preview the exact email content before sending it
**So that** I can verify the information is correct and understand what the recipient will see

**Acceptance Criteria:**
- A "Preview" button appears next to "Send Forms" and "Send Payment Request" actions
- Clicking preview opens a modal showing the rendered email (using React Email component)
- The preview modal includes recipient email address and subject line
- Users can close preview and return to the table or proceed to send
- After reviewing, users can click "Send Email" to execute the action

### US-4: Confirming Approve/Reject Actions
**As a** Pre-Weekend Couple member
**I want to** see a confirmation dialog when approving or rejecting a candidate
**So that** I understand the consequences (like payment requests being sent) before proceeding

**Acceptance Criteria:**
- Approve action shows: "If you approve this candidate, the system will update their status to 'awaiting_payment' and send a payment request email to [email address]. Continue?"
- Reject action shows: "Are you sure you want to reject [Candidate Name]? This will update their status to 'rejected' and notify the sponsor. Continue?"
- Confirmation modals display candidate details (name, email, sponsor)
- Users can Cancel (no action taken) or Confirm (action executed)
- After confirmation, the table refreshes to show updated status

### US-5: Searching and Filtering Candidates
**As a** Pre-Weekend Couple member
**I want to** search by name/email and filter by status
**So that** I can quickly find specific candidates or focus on candidates requiring attention

**Acceptance Criteria:**
- Search input filters candidates by name, email, or sponsor in real-time
- Status filter dropdown allows filtering by one or multiple statuses
- Filter by weekend (if multiple weekends exist)
- Sorting works on all columns (name, sponsor, submitted date, status)
- Pagination controls show current page, total pages, and items per page
- All filtering/sorting/search state is managed in a custom hook

### US-6: Mobile-Friendly Review Experience
**As a** Pre-Weekend Couple member using a mobile device
**I want to** review and manage candidates with the same functionality as desktop
**So that** I can work efficiently from any device

**Acceptance Criteria:**
- Mobile (sm and below): Card-based layout replaces table
- Desktop (md+): Table layout remains unchanged
- Cards display: Candidate name (header), status badge, key info, action buttons
- All functionality (search, filter, sort, actions, modals) works on mobile
- Touch targets are minimum 44px for accessibility
- Cards are easy to scan and interact with on small screens

---

## 4. Demoable Units of Work

### Unit 1: Enhanced Status System with Legend
**Purpose**: Make candidate statuses visually clear and self-documenting
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Open `/review-candidate` page
- Observe color-coded status badges on each candidate
- Status legend visible below table showing all 6 statuses with colors and descriptions
- Colors follow a logical progression (e.g., blue → yellow → green for positive flow, red for rejected)

**Proof Artifacts**:
- Screenshot of table with color-coded statuses
- Screenshot of status legend below table

---

### Unit 2: Inline Action Buttons on Table Rows
**Purpose**: Enable quick actions without opening detail sheet
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Each row shows contextual action buttons based on status
- pending_approval: Approve, Reject, View Details buttons
- sponsored: Send Forms, View Details buttons
- awaiting_forms/awaiting_payment: Send Payment Request, View Details buttons
- confirmed: View Details button
- rejected: View Details button
- Clicking View Details opens existing detail sheet

**Proof Artifacts**:
- Screenshot of table row with pending_approval showing Approve/Reject/View Details
- Screenshot of table row with sponsored showing Send Forms/View Details

---

### Unit 3: Email Preview Modal for "Send Forms"
**Purpose**: Allow users to preview candidate forms email before sending
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Click "Preview Forms Email" button on a sponsored candidate
- Modal opens showing rendered CandidateFormsEmail component
- Modal header shows: "Preview: Candidate Forms Email"
- Modal displays recipient email, subject line
- Modal includes "Cancel" and "Send Email" buttons
- Clicking "Send Email" executes sendCandidateForms action and closes modal

**Proof Artifacts**:
- Screenshot of preview modal with rendered email content
- Console log showing email sent successfully after confirmation

---

### Unit 4: Email Preview Modal for "Send Payment Request"
**Purpose**: Allow users to preview payment request email before sending
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Click "Preview Payment Request" button on awaiting_payment candidate
- Modal opens showing rendered PaymentRequestEmail component
- Modal displays correct payment owner (candidate or sponsor) and recipient
- Modal includes "Cancel" and "Send Email" buttons
- Clicking "Send Email" executes sendPaymentRequestEmail action and closes modal

**Proof Artifacts**:
- Screenshot of payment request preview modal
- Console log showing payment request sent successfully

---

### Unit 5: Approve/Reject Confirmation Modals
**Purpose**: Prevent accidental approvals/rejections and clarify consequences
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Click "Approve" on pending_approval candidate
- Confirmation modal shows: candidate details, payment owner email, explanation that payment request will be sent
- Clicking "Confirm" approves candidate, updates status to awaiting_payment, sends payment request
- Click "Reject" on pending_approval candidate
- Confirmation modal shows: candidate details, explanation that sponsor will be notified
- Clicking "Confirm" updates status to rejected

**Proof Artifacts**:
- Screenshot of approve confirmation modal
- Screenshot of reject confirmation modal
- Table showing updated status after confirmation

---

### Unit 6: Search, Sort, Filter, and Pagination
**Purpose**: Enable efficient candidate discovery and navigation
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Search input filters candidates in real-time by name/email/sponsor
- Status filter dropdown allows selecting multiple statuses (e.g., "pending_approval" + "awaiting_payment")
- Weekend filter (if multiple weekends)
- Clicking column headers sorts ascending/descending
- Pagination controls: Previous/Next, page size selector (10/25/50/100), "Showing X-Y of Z candidates"
- All state managed in `useCandidateReviewTable` hook

**Proof Artifacts**:
- Screenshot of search/filter controls
- Screenshot showing filtered results
- Screenshot of pagination controls with page info

---

### Unit 7: Mobile-Responsive Card Layout
**Purpose**: Provide full functionality on mobile devices
**Users**: Pre-Weekend Couple members on mobile
**Demo Criteria**:
- On mobile (sm breakpoint): Table hidden, cards displayed
- On desktop (md+ breakpoint): Cards hidden, table displayed
- Each card shows: Candidate name (header), status badge, sponsor, submitted date, action buttons
- All modals and interactions work on mobile
- Touch targets meet 44px minimum

**Proof Artifacts**:
- Screenshot of mobile card layout
- Screenshot of mobile modal interaction
- Screenshot showing responsive breakpoint transition

---

### Unit 8: Deep Linking from Email Notifications
**Purpose**: Allow Pre-Weekend Couple to jump directly to specific candidate from email
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Trigger sponsorship notification email (or forms completed email)
- Email contains deep link: `/review-candidate?candidate_id=abc123`
- Click link → Page opens with that candidate's detail sheet automatically opened
- Candidate row is highlighted temporarily (3-second fade)
- Candidate is scrolled into view if not on current page
- Invalid candidate_id shows toast error and displays normal list

**Proof Artifacts**:
- Screenshot of email with deep link button
- Video showing click → page load → modal auto-open → row highlight
- Screenshot of error state (invalid candidate_id)

---

### Unit 9: Accept Candidate → Send Forms Flow
**Purpose**: Guide Pre-Weekend Couple through accepting sponsorship and sending forms in one action
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Candidate with status `sponsored` shows "Accept" and "Reject" buttons
- Click "Accept" → Modal opens: "Accept Candidate & Send Forms"
- Modal shows:
  - Candidate details
  - Explanation of what accepting does
  - Preview of CandidateFormsEmail that will be sent
  - Recipient email address
- Click "Accept & Send Forms" → Status changes to `awaiting_forms`, email sent, modal closes
- Toast notification confirms action
- Table refreshes showing updated status

**Proof Artifacts**:
- Screenshot of "Accept Candidate & Send Forms" modal with email preview
- Before/after screenshots showing status change
- Screenshot of toast notification

---

### Unit 10: Reject Candidate → Archive Flow
**Purpose**: Prevent accidental rejections and allow archived candidates to be hidden
**Users**: Pre-Weekend Couple members
**Demo Criteria**:
- Click "Reject" on any candidate → Confirmation modal opens
- Modal shows:
  - Candidate and sponsor details
  - Warning about archiving
  - Optional checkbox: "Send rejection notification to sponsor"
- Click "Reject & Archive" → Status changes to `rejected`, candidate removed from default view
- Table refreshes
- Toggle "Show Archived Candidates" → Rejected candidates reappear with grayed-out styling
- Archived candidate shows "Unarchive" button to restore

**Proof Artifacts**:
- Screenshot of reject confirmation modal
- Screenshot of table with archived candidates hidden (default view)
- Screenshot of table with "Show Archived" toggle enabled
- Screenshot of archived candidate with "Unarchive" button

---

### Unit 11: Candidate Forms Completion Notification
**Purpose**: Notify Pre-Weekend Couple when candidate completes forms
**Users**: Pre-Weekend Couple members, Candidates
**Demo Criteria**:
- Candidate completes and submits forms at `/candidate/[id]/forms`
- Status changes: `awaiting_forms` → `pending_approval`
- Pre-Weekend Couple receives email: "[Candidate Name] Has Completed Their Forms - Action Required"
- Email contains deep link to review candidate
- Click link → Opens review page with candidate detail sheet open
- Pre-Weekend Couple can now approve or reject

**Proof Artifacts**:
- Screenshot of forms submission confirmation page
- Screenshot of notification email received by Pre-Weekend Couple
- Screenshot showing status updated to `pending_approval` in table
- Video showing email click → deep link → auto-open modal

---

## 5. Functional Requirements

### FR-1: Status Color Coding
1. System shall assign the following colors to candidate statuses:
   - **sponsored**: `info` (blue) - Candidate is newly sponsored
   - **awaiting_forms**: `warning` (yellow/orange) - Action required from candidate
   - **pending_approval**: `secondary` (purple/gray) - Action required from Pre-Weekend Couple
   - **awaiting_payment**: `warning` (yellow/orange) - Action required from payment owner
   - **confirmed**: `success` (green) - Candidate is fully confirmed
   - **rejected**: `error` (red) - Candidate was rejected

2. Colors shall use the existing Badge component with `color` prop (not variant)
3. Color scheme should create a visual gradient suggesting progression through the workflow

### FR-2: Status Legend Display
1. Status legend shall appear below the table (and below mobile cards)
2. Legend shall display all 6 statuses with their visual badge and text description
3. Legend shall be always visible (not hidden in a sheet/modal)
4. Legend descriptions:
   - **sponsored**: "Candidate has been sponsored and is ready for the next step"
   - **awaiting_forms**: "Candidate needs to complete and submit required forms"
   - **pending_approval**: "Candidate is waiting for approval from the review committee"
   - **awaiting_payment**: "Payment is required before proceeding"
   - **confirmed**: "Candidate has been confirmed and is ready for the weekend"
   - **rejected**: "Candidate application has been rejected"

### FR-3: Table Column Improvements
1. Current columns to **keep**: Candidate Name, Email, Sponsor, Submitted, Status
2. Column to **add**: Actions (far right column)
3. Column to **consider adding**: Weekend (if candidates can be for different weekends), Gender (Mens/Womens), Phone
4. Recommendation: Add **Weekend** and **Gender** columns for better filtering, keep Phone in detail sheet
5. All columns except Actions shall be sortable

### FR-4: Inline Action Buttons
1. Actions column shall display contextual buttons based on status:
   - **pending_approval**:
     - Approve button (primary variant, checkmark icon)
     - Reject button (destructive variant, X icon)
     - View Details button (ghost variant, eye icon)
   - **sponsored**:
     - Preview Forms button (outline variant, eye icon) → Opens preview modal
     - Send Forms button (default variant, send icon)
     - View Details button (ghost variant, eye icon)
   - **awaiting_forms** or **awaiting_payment**:
     - Preview Payment Request button (outline variant, eye icon) → Opens preview modal
     - Send Payment Request button (default variant, credit card icon)
     - View Details button (ghost variant, eye icon)
   - **confirmed** or **rejected**:
     - View Details button (ghost variant, eye icon)

2. On desktop: Show up to 3 buttons, use dropdown menu (three-dot) for additional actions if needed
3. On mobile: Show 2 primary action buttons, use dropdown menu for others
4. All existing actions in detail sheet remain available

### FR-5: Email Preview Modal for Candidate Forms
1. Clicking "Preview Forms" button shall open a modal
2. Modal title: "Preview: Candidate Forms Email"
3. Modal shall display:
   - Recipient email address
   - Email subject line: "Important Forms for Your Upcoming Tres Dias Weekend"
   - Rendered React Email component (CandidateFormsEmail)
4. Modal footer shall have:
   - "Cancel" button (secondary) → Closes modal without action
   - "Send Email" button (primary) → Executes sendCandidateForms and closes modal
5. After sending, status updates to `awaiting_forms` and table refreshes

### FR-6: Email Preview Modal for Payment Request
1. Clicking "Preview Payment Request" button shall open a modal
2. Modal title: "Preview: Payment Request Email"
3. Modal shall display:
   - Recipient email address (candidate or sponsor based on payment_owner)
   - Email subject line: "Last Step! Complete Payment for [Candidate Name] - Dusty Trails Tres Dias Weekend"
   - Rendered React Email component (PaymentRequestEmail)
4. Modal footer shall have:
   - "Cancel" button (secondary) → Closes modal without action
   - "Send Email" button (primary) → Executes sendPaymentRequestEmail and closes modal
5. After sending, table refreshes

### FR-7: Approve Candidate Confirmation Modal
1. Clicking "Approve" button shall open a confirmation modal
2. Modal title: "Approve Candidate"
3. Modal shall display:
   - Candidate name
   - Candidate email
   - Sponsor name
   - Payment owner information
   - Warning text: "If you approve this candidate, the system will update their status to 'awaiting_payment' and send a payment request email to [payment owner email]. Continue?"
4. Modal footer shall have:
   - "Cancel" button (secondary) → Closes modal without action
   - "Approve & Send Payment Request" button (primary) → Updates status and sends email
5. After approval:
   - Status updates to `awaiting_payment`
   - Payment request email sent to payment owner
   - Table refreshes

### FR-8: Reject Candidate Confirmation Modal
1. Clicking "Reject" button shall open a confirmation modal
2. Modal title: "Reject Candidate"
3. Modal shall display:
   - Candidate name
   - Sponsor name
   - Warning text: "Are you sure you want to reject [Candidate Name]? This will update their status to 'rejected'. This action cannot be easily undone. Continue?"
4. Modal footer shall have:
   - "Cancel" button (secondary) → Closes modal without action
   - "Reject Candidate" button (destructive) → Updates status to rejected
5. After rejection:
   - Status updates to `rejected`
   - Table refreshes

### FR-9: Search and Filter Controls
1. System shall provide a search input above the table
   - Placeholder: "Search by name, email, or sponsor..."
   - Filters candidates in real-time (debounced 300ms)
   - Searches across: candidate_name, candidate_email, sponsor_name

2. System shall provide a multi-select status filter dropdown
   - Label: "Filter by Status"
   - Options: All 6 candidate statuses
   - Default: All statuses selected
   - Allows selecting multiple statuses simultaneously

3. System shall provide a weekend filter (if applicable)
   - Label: "Filter by Weekend"
   - Options: List of upcoming weekends
   - Default: Current weekend

4. Clear filters button to reset all filters

### FR-10: Sorting
1. All columns except Actions shall support sorting
2. Clicking column header toggles: No sort → Ascending → Descending → No sort
3. Visual indicator (up/down arrow) shows current sort state
4. Default sort: Submitted date (most recent first)

### FR-11: Pagination
1. System shall paginate candidates with these controls:
   - Page size selector: 10, 25, 50, 100 items per page (default: 25)
   - Previous/Next page buttons
   - Page number display: "Page X of Y"
   - Total items display: "Showing X-Y of Z candidates"
   - First/Last page buttons

2. Pagination state persists when filtering/sorting
3. Use existing `useTablePagination` hook

### FR-12: Custom Hook for Table State
1. Create `useCandidateReviewTable` hook to manage:
   - Search query state
   - Filter selections (status, weekend)
   - Sort column and direction
   - Pagination state (via existing useTablePagination)
   - Filtered/sorted/paginated data computation

2. Hook shall return:
   - Processed data for current page
   - Search/filter/sort state and setters
   - Pagination controls
   - Helper functions (clearFilters, etc.)

### FR-13: Mobile Card Layout
1. On mobile (< md breakpoint):
   - Table shall be hidden (`hidden md:block`)
   - Card layout shall be displayed (`md:hidden`)

2. Each card shall display:
   - **Header**: Candidate name (text-lg font-medium) + Status badge
   - **Body**:
     - Email (with label)
     - Sponsor name (with label)
     - Submitted date (with label)
     - Weekend (with label, if applicable)
   - **Footer**: Action buttons (same logic as FR-4, but condensed)

3. Cards shall use: `bg-card border rounded-lg p-4 space-y-3`
4. Touch targets minimum 44px for all interactive elements
5. All modals and interactions work identically on mobile

### FR-14: Desktop Table Layout (Unchanged)
1. On desktop (>= md breakpoint):
   - Table shall be displayed (`hidden md:block`)
   - Card layout shall be hidden (`md:hidden`)

2. Preserve existing table styling and behavior
3. Add Actions column as described in FR-4

### FR-15: Deep Linking from Email Notifications
**Status**: ⚠️ TODO (New Feature)

1. Sponsorship notification emails to Pre-Weekend Couple shall include a URL parameter:
   - Format: `/review-candidate?candidate_id=[candidate-id]`
   - Example: `/review-candidate?candidate_id=abc-123-def`

2. When page loads with `candidate_id` query parameter:
   - Automatically open the CandidateDetailSheet for that candidate
   - Scroll the candidate into view in the table/card list
   - Highlight the row/card temporarily (3-second fade animation)

3. If candidate_id is invalid or not found:
   - Show toast error: "Candidate not found"
   - Display full candidate list normally

4. Deep link shall work on both desktop and mobile

### FR-16: Accept Candidate → Send Forms Flow
**Status**: ⚠️ TODO (Workflow Change)

**Current behavior**: Separate "Accept" and "Send Forms" actions
**New behavior**: Accepting immediately triggers send forms flow

1. When candidate has status `sponsored`:
   - Show "Accept" button (primary variant, checkmark icon)
   - Show "Reject" button (destructive variant, X icon)
   - Show "View Details" button (ghost variant, eye icon)

2. Clicking "Accept" shall:
   - Open "Send Candidate Forms" email preview modal
   - Modal title: "Accept Candidate & Send Forms"
   - Modal displays:
     - Candidate name and email
     - Explanation: "Accepting this candidate will send them an email with a link to complete their candidate forms. The candidate will fill out medical information, emergency contacts, and other required details."
     - Email preview section showing rendered CandidateFormsEmail component
   - Modal footer:
     - "Cancel" button (secondary) → Closes modal, no action taken
     - "Accept & Send Forms" button (primary) → Executes both actions

3. After clicking "Accept & Send Forms":
   - Status updates to `awaiting_forms`
   - Email sent to candidate with forms link
   - Toast notification: "Candidate accepted and forms email sent to [email]"
   - Table refreshes

### FR-17: Reject Candidate → Archive Flow
**Status**: ⚠️ TODO (New Feature)

1. Clicking "Reject" button shall open a confirmation modal
2. Modal title: "Reject & Archive Candidate"
3. Modal shall display:
   - Candidate name
   - Sponsor name and email
   - Warning text: "Are you sure you want to reject [Candidate Name]? This will archive the candidate and remove them from the active candidate list. The sponsor will NOT be automatically notified."
   - Checkbox: "Send rejection notification to sponsor" (optional, unchecked by default)

4. Modal footer:
   - "Cancel" button (secondary) → Closes modal without action
   - "Reject & Archive" button (destructive) → Updates status and archives

5. After rejection:
   - Status updates to `rejected`
   - Candidate is filtered out of the default view (see FR-17.6)
   - If checkbox selected, send rejection email to sponsor (new email template needed)
   - Table refreshes

6. Archived candidates filtering:
   - Default view: Hide rejected candidates
   - Add toggle above table: "Show Archived Candidates" (off by default)
   - When toggle enabled: Include rejected candidates in list with visual indicator (grayed out or "Archived" badge)

### FR-18: Candidate Completes Forms Notification
**Status**: ⚠️ TODO (New Feature + Email Template)

1. When candidate submits their candidate forms:
   - Status updates from `awaiting_forms` to `pending_approval`
   - Trigger notification email to Pre-Weekend Couple

2. New email template: `CandidateFormsCompletedEmail.tsx`
   - Subject: "[Candidate Name] Has Completed Their Forms - Action Required"
   - Body:
     - Greeting to Pre-Weekend Couple
     - Candidate name and sponsor name
     - Message: "The candidate has completed and submitted their forms. Please review the information and approve or reject the candidate."
     - Call-to-action button with deep link: "Review Candidate" → `/review-candidate?candidate_id=[id]`
     - Footer with standard branding

3. Email shall be sent to all users with pre-weekend couple role/permissions

### FR-19: New Sponsorship Notification Email
**Status**: ⚠️ TODO (Update Existing Email)

**Current behavior**: Email sent when sponsor submits form (implementation may exist)
**Required update**: Ensure email includes deep link to specific candidate

1. When sponsor submits sponsorship form:
   - Candidate created with status `sponsored`
   - Send notification email to Pre-Weekend Couple

2. Email template: `SponsorshipNotificationEmail.tsx` (may already exist, needs update)
   - Subject: "New Sponsorship Request: [Candidate Name]"
   - Body:
     - Greeting to Pre-Weekend Couple
     - Candidate name, email, sponsor name
     - Message: "A new candidate has been sponsored and is ready for your review."
     - Call-to-action button with deep link: "Review Candidate" → `/review-candidate?candidate_id=[id]`
     - Footer with standard branding

3. Email shall be sent to all users with pre-weekend couple role/permissions

### FR-20: Updated Action Button Context per Workflow
**Status**: ⚠️ TODO (Updates FR-4 based on new workflow)

Updated actions column display based on corrected workflow:

1. **Status: sponsored** (Step 2 - Review Sponsorship)
   - Accept button (primary variant, checkmark icon) → Opens FR-16 modal
   - Reject button (destructive variant, X icon) → Opens FR-17 modal
   - View Details button (ghost variant, eye icon)

2. **Status: awaiting_forms** (Step 4 - Waiting for candidate)
   - View Details button (ghost variant, eye icon)
   - Optional: "Resend Forms Email" button (outline variant, send icon)

3. **Status: pending_approval** (Step 5 - Review completed forms)
   - Approve button (primary variant, checkmark icon) → Opens payment request confirmation (updated FR-7)
   - Reject button (destructive variant, X icon) → Opens FR-17 modal
   - View Details button (ghost variant, eye icon)

4. **Status: awaiting_payment** (Step 5/6 - Waiting for payment)
   - Preview Payment Request button (outline variant, eye icon) → Opens FR-6 modal
   - Resend Payment Request button (default variant, send icon)
   - View Details button (ghost variant, eye icon)

5. **Status: confirmed** (Step 6 - Complete)
   - View Details button (ghost variant, eye icon)
   - Optional: "View Payment Receipt" button (outline variant, receipt icon)

6. **Status: rejected** (Archived - only visible if "Show Archived" toggle on)
   - View Details button (ghost variant, eye icon)
   - "Unarchive" button (outline variant) → Changes status back to `sponsored`

---

## 6. Non-Goals (Out of Scope)

1. **Bulk Actions**: Selecting multiple candidates and performing batch operations (future enhancement)
2. **Candidate Editing**: Editing candidate information from review page (use detail sheet or dedicated edit page)
3. **Custom Email Templates**: Allowing Pre-Weekend Couple to modify email content before sending
4. **Email Scheduling**: Scheduling emails to be sent at a specific time
5. **Notification System**: Real-time notifications when candidate status changes
6. **Export to CSV/PDF**: Exporting candidate list (future enhancement)
7. **Advanced Filtering**: Filtering by date range, custom fields, or complex boolean logic
8. **Candidate Notes**: Adding internal notes to candidates (future enhancement)
9. **Audit Log**: Tracking who performed each action and when (future enhancement)
10. **Undo Actions**: Reversing approve/reject/email sending actions

---

## 7. Design Considerations

### Visual Design
- **Color System**: Use existing shadcn/ui Badge component with `color` prop
- **Status Gradient**: Blue → Yellow/Orange → Green (positive flow), Red (negative)
- **Iconography**: Use Lucide React icons consistently (CheckCircle, X, Send, Eye, CreditCard, HelpCircle)
- **Spacing**: Follow existing spacing patterns in other admin tables (if any exist)

### Component Architecture
- **New Components**:
  - `EmailPreviewModal.tsx` - Generic modal for rendering React Email components
  - `ApproveConfirmationModal.tsx` - Approve action confirmation
  - `RejectConfirmationModal.tsx` - Reject action confirmation
  - `CandidateTableActions.tsx` - Inline action buttons for table rows
  - `CandidateCard.tsx` - Mobile card component
  - `CandidateTableControls.tsx` - Search/filter/sort controls above table
  - `StatusLegend.tsx` - Status reference below table

- **Modified Components**:
  - `CandidateTable.tsx` - Add Actions column, integrate with hook
  - `CandidateReviewTable.tsx` - Add new modals, controls, legend
  - `status-chip.tsx` - Update color mapping per FR-1

- **New Hook**:
  - `hooks/use-candidate-review-table.ts`

### Responsive Breakpoints
- **Mobile**: < 768px (md breakpoint)
- **Desktop**: >= 768px (md breakpoint)

### Email Rendering
- Use `@react-email/render` to convert React Email components to HTML
- Display rendered HTML in modal iframe or div with sandboxed styles
- Alternative: Use `@react-email/components` and render directly in modal

---

## 8. Technical Considerations

### Dependencies
- No new dependencies required (all existing in project)
- React Email components already implemented
- shadcn/ui components available
- Lucide React icons available

### State Management
- Use React Query for data fetching (if not already)
- Local state for modals, search, filters, sort
- Custom hook encapsulates all table state logic

### Performance
- Debounce search input (300ms) to reduce re-renders
- Memoize filtered/sorted data computation
- Pagination limits rendered items

### Error Handling
- Display toast notifications for email send failures
- Show error state if email preview fails to render
- Graceful degradation if email components throw errors

### Accessibility
- All modals have proper focus management
- Action buttons have aria-labels
- Status colors meet WCAG AA contrast requirements
- Touch targets minimum 44px on mobile
- Keyboard navigation support (Tab, Enter, Escape)

### Data Flow
1. User clicks action button
2. Modal opens with preview/confirmation
3. User confirms action
4. Server action executes (updateCandidateStatus, sendEmail)
5. If successful: Close modal, show toast, refresh table
6. If error: Show error message, keep modal open, allow retry

### Integration Points
- **Server Actions**:
  - `updateCandidateStatus` - Update candidate status
  - `sendCandidateForms` - Send forms email
  - `sendPaymentRequestEmail` - Send payment request
- **Email Components**:
  - `CandidateFormsEmail.tsx`
  - `PaymentRequestEmail.tsx`

---

## 9. Success Metrics

### Quantitative Metrics
1. **Reduced time to review candidates**: Measure average time from page load to action completion
2. **Reduced errors**: Track instances of "undo" requests or incorrect emails sent
3. **Mobile usage**: Track percentage of reviews completed on mobile devices
4. **Feature adoption**: Track usage of preview modals vs. direct send

### Qualitative Metrics
1. **User satisfaction**: Gather feedback from Pre-Weekend Couple on new interface
2. **Ease of use**: Observe if users can complete tasks without training
3. **Clarity**: Confirm users understand status meanings without clicking help

### Acceptance Criteria
- Pre-Weekend Couple members can review and take action on candidates without opening detail sheet
- 100% of email sends are previewed before execution (or user explicitly chooses to skip)
- 0 reported instances of accidental approvals/rejections
- Mobile experience matches desktop functionality

---

## 10. Open Questions & Decisions

### ✅ RESOLVED

1. **Accept vs. Send Forms Flow** → RESOLVED
   - *Decision*: Accept immediately triggers "Send Forms" modal with email preview
   - Implemented in FR-16

2. **Reject → Archive** → RESOLVED
   - *Decision*: Rejecting archives candidates (hidden from default view) with toggle to show
   - Optional: Send rejection email to sponsor
   - Implemented in FR-17

3. **Deep Linking** → RESOLVED
   - *Decision*: Email notifications include candidate_id in URL to auto-open specific candidate
   - Implemented in FR-15

4. **Candidate Forms Completion Notification** → RESOLVED
   - *Decision*: When forms submitted, Pre-Weekend Couple receives notification email
   - Implemented in FR-18

5. **Approve vs. Send Payment Request** → RESOLVED
   - *Decision*: Keep as separate actions (Approve at pending_approval, Payment Request at awaiting_payment)
   - Approve modal explains payment request will be sent
   - Implemented in FR-7

6. **Status Transition Rules** → RESOLVED
   - *Decision*: sponsored → awaiting_forms → pending_approval → awaiting_payment → confirmed
   - Reject can happen at sponsored or pending_approval
   - Documented in Appendix workflow diagram

### ⚠️ REMAINING QUESTIONS

1. **Weekend Filtering**: Are candidates always for a single weekend, or do we need to filter by weekend?
   - *Current Assumption*: Add weekend column and filter if multiple weekends are active simultaneously
   - *Impact*: Affects FR-3, FR-9, FR-12

2. **Gender Column**: Should we add a Gender (Mens/Womens) column for easier filtering?
   - *Current Assumption*: Yes, add this column since weekends are gender-specific
   - *Impact*: Affects FR-3, FR-9

3. **Email Editing**: Should users be able to edit email content before sending, or is preview-only sufficient?
   - *Current Assumption*: Preview-only for MVP, editing can be future enhancement
   - *Impact*: Scope of FR-5, FR-6

4. **Notification to Sponsors on Rejection**: Should we send the optional rejection email to sponsors, or leave it manual?
   - *Current Assumption*: Optional checkbox in reject modal (default: unchecked)
   - *Impact*: FR-17, new email template needed

5. **Delete Action**: Should hard delete remain available, or only archive/unarchive?
   - *Current Assumption*: Keep delete in detail sheet only (for data cleanup purposes)
   - *Impact*: CandidateActions component

6. **Pagination Persistence**: Should pagination state persist across page refreshes?
   - *Current Assumption*: No persistence needed for MVP, can add URL params in future
   - *Impact*: FR-11, FR-12

7. **Resend Frequency Limits**: Should there be rate limiting on "Resend" buttons?
   - *Current Assumption*: No rate limiting for MVP (trusted users)
   - *Impact*: FR-20, server actions

---

## Implementation Notes for Developers

### Suggested Implementation Order

**Note**: Phases are organized to deliver working, demoable features incrementally. Each phase builds on the previous.

1. **Phase 1: Status System** (Unit 1)
   - Update status-chip colors per FR-1
   - Create StatusLegend component
   - Add legend below table
   - **Deliverable**: Visual clarity improvement

2. **Phase 2: Table Enhancements** (Unit 6)
   - Create useCandidateReviewTable hook with search/filter/sort/pagination
   - Add CandidateTableControls component
   - Add "Show Archived Candidates" toggle
   - Update CandidateTable to use hook
   - Test filtering and sorting logic
   - **Deliverable**: Full table controls working

3. **Phase 3: Deep Linking** (Unit 8)
   - Add URL query parameter handling in page.tsx
   - Auto-open modal based on candidate_id
   - Add row highlight animation
   - Add scroll-into-view logic
   - **Deliverable**: Email deep links work end-to-end

4. **Phase 4: Workflow Modals - Accept & Reject** (Units 9 & 10)
   - Create AcceptCandidateModal (combines accept + send forms preview)
   - Create RejectCandidateModal (with archive and optional notification)
   - Update action button context per FR-20
   - Wire up modals to action buttons
   - Test accept → awaiting_forms flow
   - Test reject → archived flow
   - **Deliverable**: Core workflow guided by modals

5. **Phase 5: Email Notifications** (Unit 11)
   - Create CandidateFormsCompletedEmail.tsx template
   - Update SponsorshipNotificationEmail.tsx with deep link
   - Add email trigger when forms submitted (in candidate forms page)
   - Test notification emails end-to-end
   - **Deliverable**: Pre-Weekend Couple notified at key steps

6. **Phase 6: Inline Actions & Email Preview** (Units 2, 3, 4)
   - Create CandidateTableActions component
   - Add Actions column to table
   - Create EmailPreviewModal component (generic for any email)
   - Add "Preview" and "Resend" buttons per FR-20
   - Test payment request preview and send
   - **Deliverable**: All actions available inline with previews

7. **Phase 7: Mobile Layout** (Unit 7)
   - Create CandidateCard component
   - Implement responsive switching (hidden md:block / md:hidden)
   - Test all interactions on mobile (modals, deep links, actions)
   - Verify touch target sizes (44px minimum)
   - **Deliverable**: Full mobile support

### Code Organization
```
app/(public)/review-candidate/
├── page.tsx (modified - add URL param handling for deep linking)
├── components/
│   ├── CandidateReviewTable.tsx (modified - add new modals, controls, legend)
│   ├── CandidateTable.tsx (modified - add Actions column, integrate hook)
│   ├── CandidateTableActions.tsx (new - inline action buttons)
│   ├── CandidateTableControls.tsx (new - search/filter/sort/pagination UI)
│   ├── CandidateCard.tsx (new - mobile card layout)
│   ├── StatusLegend.tsx (new - always-visible status reference)
│   ├── EmailPreviewModal.tsx (new - generic email preview)
│   ├── AcceptCandidateModal.tsx (new - accept + send forms combined)
│   ├── RejectCandidateModal.tsx (new - reject with archive + optional notification)
│   ├── CandidateDetailSheet.tsx (unchanged)
│   ├── CandidateActions.tsx (keep for detail sheet actions)
│   └── StatusInfoSheet.tsx (can be removed - replaced by StatusLegend)

hooks/
└── use-candidate-review-table.ts (new - table state management)

components/candidates/
└── status-chip.tsx (modified - update color mapping per FR-1)

components/email/
├── CandidateFormsEmail.tsx (existing - unchanged)
├── PaymentRequestEmail.tsx (existing - unchanged)
├── CandidateFormsCompletedEmail.tsx (new - notify Pre-Weekend Couple)
├── SponsorshipNotificationEmail.tsx (existing - update with deep link)
└── CandidateRejectionEmail.tsx (new - optional rejection notification to sponsor)

actions/
├── candidates.ts (existing - may need updates for archive logic)
└── emails.ts (existing - add sendCandidateFormsCompletedEmail, etc.)
```

### Key Technical Decisions
1. **Hook Pattern**: Encapsulate all table logic in custom hook for reusability and testability
2. **Modal Pattern**: Create generic EmailPreviewModal that accepts any React Email component
3. **Responsive Pattern**: Separate components (Table vs Cards) rather than complex conditional rendering
4. **Action Pattern**: Centralize action button logic in CandidateTableActions for consistency
5. **Color Pattern**: Use Badge `color` prop (not `variant`) for semantic status colors

---

## Appendix: Complete Workflow Diagram

### Visual Status Flow

```
                    ┌─────────────────────────────────────────────────┐
                    │  STEP 1: Community Member Sponsors Candidate   │
                    │  Action: Submit /sponsor form                   │
                    └────────────────────┬────────────────────────────┘
                                         │
                                         ↓
                    ┌─────────────────────────────────────────────────┐
                    │  STATUS: sponsored (Blue - Info)                │
                    │  Email Notification → Pre-Weekend Couple         │
                    │  (with deep link to specific candidate)          │
                    └────────────────────┬────────────────────────────┘
                                         │
                                         ↓
                    ┌─────────────────────────────────────────────────┐
                    │  STEP 2: Pre-Weekend Couple Reviews Sponsorship│
                    │  Actions: Accept OR Reject                      │
                    └──────────┬────────────────────────┬─────────────┘
                               │                        │
                  [ACCEPT]     │                        │  [REJECT]
                               ↓                        ↓
           ┌──────────────────────────────┐   ┌─────────────────────┐
           │ STEP 3: Send Candidate Forms │   │ STATUS: rejected    │
           │ Modal: Accept + Forms Preview│   │ (Red - Error)       │
           │ Action: Send forms email     │   │ Candidate archived  │
           │                              │   │ Hidden from default │
           └──────────────┬───────────────┘   └─────────────────────┘
                          │
                          ↓
           ┌─────────────────────────────────────────┐
           │ STATUS: awaiting_forms                  │
           │ (Yellow/Orange - Warning)               │
           │ Waiting for candidate to complete forms │
           └─────────────────┬───────────────────────┘
                             │
                             ↓
           ┌─────────────────────────────────────────┐
           │ STEP 4: Candidate Completes Forms      │
           │ Action: Submit forms at /candidate/[id]│
           └─────────────────┬───────────────────────┘
                             │
                             ↓
           ┌─────────────────────────────────────────┐
           │ STATUS: pending_approval                │
           │ (Purple/Gray - Secondary)               │
           │ Email Notification → Pre-Weekend Couple │
           │ "Forms completed - ready for review"    │
           └──────────┬──────────────────────────────┘
                      │
                      ↓
           ┌─────────────────────────────────────────┐
           │ STEP 5: Pre-Weekend Couple Approves    │
           │ Modal: Approve + Payment Request Info   │
           │ Actions: Approve (send payment) OR      │
           │          Reject (archive)               │
           └──────────┬──────────────────────────────┘
                      │
         [APPROVE]    │
                      ↓
           ┌─────────────────────────────────────────┐
           │ STATUS: awaiting_payment                │
           │ (Yellow/Orange - Warning)               │
           │ Email sent to payment owner             │
           │ (candidate or sponsor)                  │
           └─────────────────┬───────────────────────┘
                             │
                             ↓
           ┌─────────────────────────────────────────┐
           │ STEP 6: Payment Received via Stripe    │
           │ Webhook updates status automatically    │
           └─────────────────┬───────────────────────┘
                             │
                             ↓
           ┌─────────────────────────────────────────┐
           │ STATUS: confirmed (Green - Success)     │
           │ Candidate ready for weekend ✅          │
           └─────────────────────────────────────────┘
```

### Status Meanings (Updated)

| Status | Color | Who Acts | What It Means | Next Action |
|--------|-------|----------|---------------|-------------|
| **sponsored** | Blue (Info) | Pre-Weekend Couple | New sponsorship submitted, awaiting initial review | Accept (send forms) or Reject (archive) |
| **awaiting_forms** | Yellow/Orange (Warning) | Candidate | Candidate received forms email, needs to complete | Wait for candidate to submit forms |
| **pending_approval** | Purple/Gray (Secondary) | Pre-Weekend Couple | Candidate completed forms, awaiting final approval | Approve (send payment) or Reject (archive) |
| **awaiting_payment** | Yellow/Orange (Warning) | Payment Owner | Payment request sent, waiting for Stripe payment | Wait for payment, or resend request |
| **confirmed** | Green (Success) | N/A (Complete) | Payment received, candidate confirmed for weekend | No action needed - candidate is ready |
| **rejected** | Red (Error) | N/A (Archived) | Candidate rejected and archived | Can unarchive if needed |

---

## Appendix: Current vs. Proposed Comparison

| Feature | Current | Proposed |
|---------|---------|----------|
| **Status Visibility** | Colors exist but legend in separate sheet | Always-visible legend below table |
| **Action Location** | Only in detail sheet | Inline on each row + detail sheet |
| **Email Preview** | None | Preview modal before sending |
| **Approve/Reject** | Direct action, no confirmation | Confirmation modal with consequences |
| **Search** | None | Real-time search by name/email/sponsor |
| **Filter** | None | Multi-select status filter + weekend filter |
| **Sort** | None | Sort by any column |
| **Pagination** | None | Full pagination controls |
| **Mobile** | Horizontal scroll (poor UX) | Dedicated card layout |

---

---

**Document Version**: 2.0
**Last Updated**: 2025-11-02
**Author**: Claude (AI Assistant)
**Status**: Ready for Implementation

**Change Log**:
- v2.0 (2025-11-02): Added Executive Summary, complete 6-step workflow diagram, deep linking (FR-15), Accept→Send Forms flow (FR-16), Reject→Archive flow (FR-17), Forms completion notification (FR-18), updated implementation status table
- v1.0 (2025-11-02): Initial draft with core table improvements

**Approvals**:
- [ ] User Review: Workflow accuracy confirmed
- [ ] User Review: Implementation scope approved
- [ ] Technical Lead: Architecture review
- [ ] Pre-Weekend Couple: UX flow validation
