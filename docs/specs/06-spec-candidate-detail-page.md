# 01-spec-candidate-detail-page.md

## Introduction/Overview

This feature replaces the current sheet-based candidate detail view with a dedicated candidate detail page. When users click a candidate row in the review candidates table, they will navigate to a full page (`/review-candidates/[candidate_id]`) where they can view and inline-edit all candidate information. This improves the editing experience and provides more screen real estate for managing candidate data.

## Goals

- Replace the sheet component with a dedicated candidate detail page at `/review-candidates/[candidate_id]`
- Enable inline editing of all candidate fields with auto-save on blur
- Maintain existing permission structure (READ_CANDIDATES for viewing, WRITE_CANDIDATES for editing)
- Provide mobile-optimized layout with collapsible sections
- Include all existing actions (send forms, request payment, reject, delete) on the detail page

## User Stories

- **As a Pre-Weekend Couple member**, I want to click on a candidate row and navigate to a full detail page so that I have more space to review and edit candidate information.
- **As a Pre-Weekend Couple member**, I want to edit candidate fields inline and have them auto-save so that I can quickly update information without extra steps.
- **As a Pre-Weekend Couple member**, I want to see breadcrumb navigation so that I can easily return to the candidate list.
- **As a Pre-Weekend Couple member**, I want to access all candidate actions (send forms, request payment, reject, delete) from the detail page so that I can manage the candidate workflow in one place.
- **As a mobile user**, I want collapsible sections and optimized touch targets so that I can efficiently review candidates on my phone.

## Demoable Units of Work

### Unit 1: Candidate Detail Page Route and Navigation

**Purpose:** Establish the new page route structure and navigation flow from the candidate list to the detail page.

**Functional Requirements:**

- The system shall create a new route at `/review-candidates/[candidate_id]` that displays candidate details
- The system shall protect the route with the same authentication as the review-candidates page
- The system shall display a breadcrumb showing "Review Candidates > [Candidate Name]" at the top of the page
- The user shall be able to click the "Review Candidates" breadcrumb to return to the list
- The system shall update the candidate table row click behavior to navigate to the detail page instead of opening a sheet
- The system shall remove or deprecate the CandidateDetailSheet component

**Proof Artifacts:**

- Screenshot: Candidate detail page at `/review-candidates/[id]` shows candidate information
- Screenshot: Breadcrumb navigation visible at top of page
- CLI: Clicking candidate row in table navigates to detail page URL

### Unit 2: Read-Only Detail View with Sections

**Purpose:** Display all candidate information in organized sections, handling the case where candidate forms are not yet submitted.

**Functional Requirements:**

- The system shall display candidate information in the following sections: Candidate Information, Candidate Assessment (from Sponsor), Candidate Form Details, Sponsor Information
- The system shall display candidate name and current status in the page header
- The system shall show a message "[Candidate Name] has not completed their forms yet" when no `candidate_info` record exists, hiding the Candidate Form Details section fields
- The system shall display all fields currently shown in the CandidateDetailSheet
- The user shall see fields rendered as read-only when they lack WRITE_CANDIDATES permission

**Proof Artifacts:**

- Screenshot: Detail page showing all sections with candidate data populated
- Screenshot: Detail page showing "has not completed their forms yet" message for candidate without `candidate_info`
- Screenshot: Read-only view for user without WRITE_CANDIDATES permission

### Unit 3: Inline Editing with Auto-Save

**Purpose:** Allow authorized users to edit candidate fields inline with automatic saving on blur.

**Functional Requirements:**

- The system shall render fields as editable inputs for users with WRITE_CANDIDATES permission
- The system shall auto-save field changes when the user blurs (leaves) the input field
- The system shall display a toast notification confirming successful save
- The system shall display a toast notification with error message if save fails
- The system shall use existing validation from sponsorship and candidate forms (no additional validation)
- The system shall allow editing of: Candidate Info fields, Sponsor Info fields, Sponsor Assessment fields, Status, and Payment Owner

**Proof Artifacts:**

- Screenshot: Editable input fields visible for authorized user
- Screenshot: Toast notification showing "Changes saved" after editing a field
- CLI: Server action successfully updates database record

### Unit 4: Actions and Delete Functionality

**Purpose:** Provide all candidate management actions on the detail page, including a clearly marked delete option.

**Functional Requirements:**

- The system shall display action buttons for: Send Forms, Request Payment, Reject Candidate
- The system shall display a Delete button with destructive/dangerous styling (red, clearly marked)
- The system shall show confirmation dialogs before executing destructive actions (reject, delete)
- The system shall navigate back to the candidate list after deleting a candidate
- The system shall respect existing permission requirements for each action

**Proof Artifacts:**

- Screenshot: Action buttons visible on detail page including delete button with dangerous styling
- Screenshot: Delete confirmation modal
- CLI: After delete action, user is redirected to `/review-candidates`

### Unit 5: Mobile-Responsive Layout

**Purpose:** Provide an optimized mobile experience with collapsible sections and appropriate touch targets.

**Functional Requirements:**

- The system shall display a simplified mobile layout on screens smaller than `md` breakpoint
- The system shall implement collapsible/accordion sections for mobile view
- The system shall maintain minimum 44px touch targets for all interactive elements
- The system shall ensure all functionality works on mobile (editing, actions, navigation)

**Proof Artifacts:**

- Screenshot: Mobile view showing collapsible sections
- Screenshot: Mobile view with section expanded showing editable fields
- Screenshot: Mobile view showing action buttons with appropriate sizing

## Non-Goals (Out of Scope)

1. **Complex validation rules**: This spec uses existing form validation only; no new business rule validation will be added
2. **Unsaved changes warning**: Users will not be warned when navigating away with unsaved changes; changes are auto-saved on blur
3. **Bulk editing**: This feature focuses on single-candidate editing only
4. **Audit logging of edits**: Tracking who edited what fields is not included in this scope
5. **Undo/revert functionality**: Users cannot undo individual field changes

## Design Considerations

- Follow existing shadcn/ui component patterns used throughout the application
- Use the existing `StatusChip` component for status display
- Maintain visual consistency with the current review-candidates page styling
- Action buttons should follow existing confirmation modal patterns
- Delete button should use destructive variant styling (red/danger colors)
- Mobile collapsible sections should use shadcn/ui Accordion or Collapsible components
- Breadcrumb should be positioned at the top of the page content area

## Repository Standards

- Use server actions in `/actions/` directory for all database operations
- Return `Result<Error, T>` types from server actions for consistent error handling
- Mark client components with `'use client'` directive
- Follow existing responsive design pattern: desktop table hidden on mobile (`hidden md:block`), mobile layout shown only on small screens (`md:hidden`)
- Use shadcn/ui components exclusively (no Material-UI or other UI libraries)
- Place new components in `/app/(public)/review-candidates/[candidate_id]/` directory
- Use Zod schemas for any form validation
- Use Sonner for toast notifications

## Technical Considerations

- Reuse data fetching patterns from existing `getReviewPageData()` server action
- Create new server action for updating individual candidate fields
- The detail page should be a server component that fetches candidate data
- Editable form sections should be client components
- Permission checking should happen server-side in the page component and passed to client components as props
- Consider optimistic updates for better UX on auto-save, with rollback on error

## Security Considerations

- Route must verify user authentication before rendering
- WRITE_CANDIDATES permission must be verified server-side before allowing any updates
- All database mutations must use server actions with proper permission checks via `authorizedAction()`
- Delete action requires confirmation and proper permission verification

## Success Metrics

1. **Feature completeness**: All fields currently visible in CandidateDetailSheet are viewable and editable on the new page
2. **Permission enforcement**: Users without WRITE_CANDIDATES see read-only view; unauthorized edit attempts are blocked server-side
3. **Mobile usability**: All functionality accessible and usable on mobile devices
4. **Build verification**: `yarn build` completes without errors

## Open Questions

No open questions at this time.
