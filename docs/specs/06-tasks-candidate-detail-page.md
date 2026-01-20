# 06-tasks-candidate-detail-page

## Summary

This task list implements the Candidate Detail Page feature as specified in `06-spec-candidate-detail-page.md`. The feature replaces the CandidateDetailSheet component with a dedicated page at `/review-candidates/[candidate_id]`, enabling inline editing with auto-save, organized sections, and mobile-responsive design.

## Tasks

### [x] 1.0 Candidate Detail Page Route and Navigation

Establish the new page route structure and navigation flow from the candidate list to the detail page.

#### 1.0 Proof Artifact(s)

- Screenshot: Candidate detail page at `/review-candidates/[id]` showing candidate name and status in header
- Screenshot: Breadcrumb navigation visible at top showing "Review Candidates > [Candidate Name]"
- CLI: `yarn build` completes without errors after route creation
- Navigation: Clicking candidate row in table navigates to `/review-candidates/[candidate_id]` URL

#### 1.0 Tasks

- [x] 1.1 Create the dynamic route directory structure at `app/(public)/review-candidates/[candidate_id]/` with a `page.tsx` server component
- [x] 1.2 Implement server-side data fetching using `getHydratedCandidate()` to load candidate data by ID with error handling for invalid/missing candidates
- [x] 1.3 Create the page header component displaying candidate name and status using the existing `StatusChip` component
- [x] 1.4 Add breadcrumb navigation component showing "Review Candidates > [Candidate Name]" with link back to `/review-candidates`
- [x] 1.5 Update `CandidateTable.tsx` to change row click behavior from opening sheet to navigating to `/review-candidates/[candidate_id]`
- [x] 1.6 Verify route protection matches existing review-candidates page authentication

---

### [x] 2.0 Read-Only Detail View with Sections

Display all candidate information in organized sections, handling both complete and incomplete form states.

#### 2.0 Proof Artifact(s)

- Screenshot: Detail page showing all 4 sections (Candidate Information, Candidate Assessment, Candidate Form Details, Sponsor Information) with data populated
- Screenshot: Detail page showing "[Candidate Name] has not completed their forms yet" message when `candidate_info` is null
- Screenshot: Read-only view rendered for user without WRITE_CANDIDATES permission (no editable inputs visible)
- CLI: Page loads without console errors when viewing candidate without `candidate_info`

#### 2.0 Tasks

- [x] 2.1 Create `CandidateInformationSection` component displaying basic candidate info (name, email, status, weekend assignment)
- [x] 2.2 Create `CandidateAssessmentSection` component displaying sponsor's assessment fields (church_environment, home_environment, social_environment, work_environment, god_evidence, support_plan, prayer_request)
- [x] 2.3 Create `CandidateFormDetailsSection` component displaying candidate form data (personal info, address, church, marital status, medical info, emergency contact, shirt size)
- [x] 2.4 Create `SponsorInformationSection` component displaying sponsor details (name, email, phone, church, address, weekend, reunion group, attends secuela, contact frequency)
- [x] 2.5 Implement conditional rendering to show "[Candidate Name] has not completed their forms yet" message when `candidate_info` is null, hiding the Candidate Form Details section
- [x] 2.6 Assemble all sections in the detail page with proper layout and spacing using responsive grid

---

### [ ] 3.0 Inline Editing with Auto-Save

Allow authorized users to edit candidate fields inline with automatic saving on blur.

#### 3.0 Proof Artifact(s)

- Screenshot: Editable input fields visible for user with WRITE_CANDIDATES permission
- Screenshot: Toast notification showing "Changes saved" after editing and blurring a field
- Screenshot: Toast notification showing error message when save fails (can simulate via network error)
- CLI: Server action `updateCandidateField` successfully updates database record (verify via Supabase logs or query)

#### 3.0 Tasks

TBD

---

### [ ] 4.0 Actions and Delete Functionality

Provide all candidate management actions on the detail page with confirmation dialogs.

#### 4.0 Proof Artifact(s)

- Screenshot: Action buttons visible on detail page (Send Forms, Request Payment, Reject Candidate, Delete) with Delete button showing destructive red styling
- Screenshot: Delete confirmation modal with warning text
- Navigation: After confirming delete action, user is redirected to `/review-candidates`
- CLI: `yarn build` completes without errors after action integration

#### 4.0 Tasks

TBD

---

### [ ] 5.0 Mobile-Responsive Layout

Provide an optimized mobile experience with collapsible sections and appropriate touch targets.

#### 5.0 Proof Artifact(s)

- Screenshot: Mobile view (< md breakpoint) showing collapsible/accordion sections in collapsed state
- Screenshot: Mobile view with one section expanded showing editable fields
- Screenshot: Mobile view showing action buttons with appropriate sizing (min 44px touch targets)
- CLI: All functionality works on mobile viewport in browser dev tools (editing, actions, navigation)

#### 5.0 Tasks

TBD
