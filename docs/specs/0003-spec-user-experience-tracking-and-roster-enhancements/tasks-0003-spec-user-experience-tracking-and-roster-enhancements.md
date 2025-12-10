# Task List: User Experience Tracking and Master Roster Enhancements

Based on Spec: `0002-spec-user-experience-tracking-and-roster-enhancements.md`

## Relevant Files

- `actions/user-experience.ts` - Server actions for CRUD operations on user experience records
- `lib/user-experience/types.ts` - TypeScript types for user experience data structures
- `lib/user-experience/calculations.ts` - Helper functions for calculating experience levels and Rector Ready status
- `lib/user-experience/index.ts` - Barrel export for user experience utilities
- `app/admin/users/components/UserRoleSidebar.tsx` - Existing component to be enhanced with experience sections
- `app/admin/users/components/experience-level-section.tsx` - New component for displaying experience level
- `app/admin/users/components/rector-ready-section.tsx` - New component for displaying Rector Ready status
- `app/admin/users/components/previous-experience-section.tsx` - New component for displaying previous experience list
- `app/admin/users/components/add-experience-modal.tsx` - New modal component for manual experience entry
- `app/admin/weekends/[weekend_id]/page.tsx` - Weekend detail page to be enhanced with finalization workflow
- `app/admin/weekends/[weekend_id]/finish-weekend-modal.tsx` - New modal for weekend finalization confirmation
- `app/admin/weekends/[weekend_id]/weekend-roster-table.tsx` - Existing component to be enhanced with experience level display
- `actions/weekend.ts` - Existing file to be enhanced with finalization logic
- `lib/weekend/validation.ts` - New file for weekend position validation helpers
- `lib/security.ts` - Existing file to be enhanced with new VIEW_ROSTER_EXPERIENCE_LEVEL permission
- `database.types.ts` - Will be regenerated after manual database setup

### Notes

- The `user_experience` table and `VIEW_ROSTER_EXPERIENCE_LEVEL` permission must be manually created in Supabase before implementation begins (see Unit 1 note in spec)
- After creating the table, run `yarn generate` to regenerate `database.types.ts` with the new types
- Use existing patterns from `actions/users.ts` and `actions/weekend.ts` for server action structure
- Follow existing shadcn/ui component patterns from `app/admin/users/components/UserRoleSidebar.tsx`
- Weekend finalization logic should prevent any edits to finished weekends at both UI and server action levels

## Tasks

- [ ] 1.0 Database Schema and Server Actions Setup
  - Demo Criteria: "user_experience table exists in Supabase with all columns; VIEW_ROSTER_EXPERIENCE_LEVEL permission exists; server actions for fetching, creating, editing, and deleting experience records are functional; database types regenerated; can insert and query test records"
  - Proof Artifact(s): "Screenshot of Supabase table structure; SQL query: SELECT * FROM user_experience LIMIT 5; Server action files in /actions/user-experience.ts; Updated database.types.ts with UserExperience types"

- [ ] 2.0 Experience Calculation and Helper Functions
  - Demo Criteria: "Helper functions calculate experience level (1, 2, 3) correctly based on distinct weekend count; Rector Ready status calculated with all four criteria (Head/Assistant Head, Team Head, 2+ talks, Dining); functions return correct data structures for UI consumption"
  - Proof Artifact(s): "Test file demonstrating calculations with sample data; lib/user-experience/calculations.ts with exported functions; Console output showing correct level and Rector Ready calculations for test users"

- [ ] 3.0 Master Roster User Sheet UI Updates
  - Demo Criteria: "Open /admin/users, click on a user, sheet displays sections in order: Personal Information → Level → Rector Ready → Previous Experience → Security; Level shows 'Level X'; Rector Ready shows overall badge and 4 individual criteria with ✓/✗; Previous Experience shows grouped comma-separated lists by community; Manual experience entry button appears at bottom"
  - Proof Artifact(s): "URL: /admin/users; Screenshots showing: (1) user sheet with all sections, (2) different experience levels, (3) Rector Ready with mixed criteria statuses, (4) Previous Experience with DTTD and other communities"

- [ ] 4.0 Manual Experience Entry
  - Demo Criteria: "Click 'Add Experience' button opens modal with form fields (Role dropdown, Weekend dropdown, Other Community Location text, Date picker, Rollo text); Head/Assistant Head roles disabled in dropdown; Validation prevents both Weekend and Other Community being selected; Submission creates record and immediately appears in Previous Experience list; Can add multiple entries"
  - Proof Artifact(s): "Video/screenshots showing: (1) opening modal, (2) form validation working, (3) submitting other community experience, (4) new entry appearing in list; SQL query showing created record"

- [ ] 5.0 Weekend Finalization Workflow
  - Demo Criteria: "Navigate to /admin/weekends/[weekend_id]; 'Finish Weekend' button triggers validation of required positions; If validation fails, modal shows missing positions with Override/Cancel options; If validation passes, confirmation modal warns about read-only state; After confirmation, weekend status becomes 'FINISHED' in database; user_experience records auto-created for all roster participants"
  - Proof Artifact(s): "URL: /admin/weekends/[test_weekend_id]; Screenshots of: (1) validation warning modal, (2) confirmation modal; SQL queries: SELECT id, status FROM weekend WHERE id = ?; SELECT COUNT(*) FROM user_experience WHERE weekend_id = ?; Screenshot showing user's updated Previous Experience"

- [ ] 6.0 Read-Only Weekend Enforcement
  - Demo Criteria: "After weekend is finished, /admin/weekends/[finished_weekend_id] displays read-only view with disabled controls and banner message; All edit buttons hidden/disabled; Attempt to edit via server action returns error; Roster, candidates, and files all read-only"
  - Proof Artifact(s): "URL: /admin/weekends/[finished_weekend_id]; Side-by-side screenshots of editable vs read-only weekend pages; Error toast/message when attempting edit; Server action test showing rejected modification attempt"

- [ ] 7.0 Experience Level Visibility on Weekend Roster (Permission-Based)
  - Demo Criteria: "Users with VIEW_ROSTER_EXPERIENCE_LEVEL permission see experience levels (1, 2, 3) next to team member names on /admin/weekends/[weekend_id]; Users without permission see roster without levels; Permission check works correctly; Experience levels update when user's experience changes"
  - Proof Artifact(s): "URL: /admin/weekends/[weekend_id]; Side-by-side screenshots: (1) user with permission showing levels, (2) user without permission; Code comment noting 'Create Leaders Committee role' for product owner; SQL: SELECT * FROM user_permissions WHERE permission_name = 'VIEW_ROSTER_EXPERIENCE_LEVEL'"

