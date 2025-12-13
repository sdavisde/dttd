# Spec: User Experience Tracking and Master Roster Enhancements

## Introduction/Overview

This feature enhances the DTTD platform's ability to track community member experience across weekends and provides better visibility into member qualifications for leadership roles. Currently, the system lacks a structured way to track which positions members have served in across multiple weekends, making it difficult for leadership to assess readiness for advanced roles like Rector.

The solution introduces a comprehensive experience tracking system that automatically captures service records when weekends are finalized, calculates member experience levels, evaluates "Rector Ready" status, and displays this information on the Master Roster with appropriate permission controls.

## Goals

1. Create a structured system to track user experience across DTTD weekends and other Tres Dias communities
2. Automatically capture service records when weekends are finalized
3. Calculate and display member experience levels (1, 2, 3) based on weekend participation
4. Evaluate and display "Rector Ready" status based on four key criteria
5. Provide visibility into complete service history for all community members
6. Allow manual entry of other community experience
7. Prevent accidental roster changes after weekend finalization through confirmation workflows
8. Add permission controls for viewing sensitive experience level information on Weekend Roster pages

## User Stories

### 1. View Member Experience and Service History

**As a Rector**, I want to see each community member's experience level and service history so I can make informed decisions when building my weekend team.

**Description:**
When building a weekend team, Rectors need comprehensive visibility into each member's qualifications, past roles, and experience level to make appropriate team assignments and ensure a balanced, capable team.

**Acceptance Criteria:**
- View complete service history for any community member from Master Roster
- See experience level (1, 2, or 3) calculated based on weekend participation count
- View previous roles grouped by community (DTTD and external)
- See dates and specific roles for each weekend served
- Access this information from the Master Roster user detail sheet

### 2. Identify Rector-Ready Candidates

**As a Pre-Weekend Couple member**, I want to see which community members are "Rector Ready" so I can identify potential future Rectors and encourage their development.

**Description:**
Pre-Weekend Couple members are responsible for identifying and mentoring future leadership. They need clear visibility into which community members meet the qualifications to serve as Rector based on defined criteria.

**Acceptance Criteria:**
- See overall "Rector Ready" status (yes/no) for each community member
- View four individual criteria with pass/fail status:
  - Has served as Head or Assistant Head
  - Has served as Team Head
  - Has given 2+ talks (rollos)
  - Has worked Dining
- Status updates automatically as members gain experience
- Accessible from Master Roster user detail sheet

### 3. Automatic Service History Tracking

**As a community member**, I want my service experience across multiple weekends to be automatically tracked so I don't have to manually maintain my service record.

**Description:**
Community members serve in various roles across multiple weekends. The system should automatically capture and maintain their complete service history without requiring manual entry or maintenance.

**Acceptance Criteria:**
- Experience records created automatically when weekend is finalized
- All roles served during the weekend are captured
- Rollos (talks given) are recorded for speaking roles
- Service history visible in Master Roster shows all automatically-tracked experience
- No manual intervention required for DTTD weekend experience tracking

### 4. Add External Community Experience

**As a community member**, I want to add experience from other Tres Dias communities or roles I served outside the normal roster so my complete service history is visible.

**Description:**
Many community members have served in other Tres Dias communities or may have served roles that weren't captured in the system. They need the ability to manually add this experience to their profile for a complete service record.

**Acceptance Criteria:**
- Access manual experience entry form from Master Roster
- Select role from dropdown (excluding Head/Assistant Head)
- Choose between DTTD weekend or enter external community location
- Specify month/year of service
- Optionally add rollo name if a talk was given
- New experience immediately appears in service history
- Can add multiple experiences for the same time period (different roles)

### 5. Weekend Finalization Validation

**As an administrator**, I want to be warned before finalizing a weekend roster if required positions are unfilled so I can ensure the weekend team is complete.

**Description:**
Before a weekend is finalized, administrators need to verify that all critical leadership positions are filled. The system should validate roster completeness and warn if required positions are missing.

**Acceptance Criteria:**
- System validates all required leadership positions before finalization
- Display warning modal if any required positions are unfilled
- List specific missing positions in the warning
- Provide option to override and proceed with finalization
- Provide option to cancel and return to roster editing
- Required positions include all CHA leadership roles

### 6. Protect Historical Weekend Data

**As an administrator**, I want weekend rosters to become read-only after finalization so historical records remain accurate and unchanged.

**Description:**
Once a weekend is complete and finalized, its roster and related data should be permanently protected from accidental modifications to maintain historical accuracy and data integrity.

**Acceptance Criteria:**
- All weekend data becomes read-only after finalization (roster, candidates, files)
- Clear visual indication of read-only status (banner/message)
- All edit buttons, dropdowns, and form fields are disabled
- Server actions reject modification attempts with appropriate errors
- No ability to "un-finalize" or reopen a weekend
- Confirmation modal required before finalization explaining permanence

### 7. Permission-Based Experience Visibility

**As a Leaders Committee member**, I want to see experience levels on the Weekend Roster page so I can assess team composition during planning.

**Description:**
When planning a weekend, Leaders Committee members need to see the experience level of team members directly on the Weekend Roster page to ensure appropriate balance of experienced and newer members.

**Acceptance Criteria:**
- Experience level (1, 2, or 3) displays next to each person's name on Weekend Roster page
- Only visible to users with VIEW_ROSTER_EXPERIENCE_LEVEL permission
- Users without permission see Weekend Roster without experience levels
- Experience level updates automatically as members gain experience
- Permission applies only to Weekend Roster page (Master Roster has no restrictions)

## Demoable Units of Work

### Unit 1: Database Schema and Server Actions Setup
**Purpose:** Establish the foundational data structure for tracking user experience and create server actions to interact with the data.

**Demo Criteria:**
- `user_experience` table exists in Supabase with all required columns (see REQ-1)
- `VIEW_ROSTER_EXPERIENCE_LEVEL` permission exists in the permissions system
- Server actions created for:
  - Fetching all experience for a user
  - Creating manual experience entries
  - Editing experience entries (admin only)
  - Deleting experience entries (admin only)

**Proof Artifact:**
- Screenshot of Supabase table structure showing `user_experience` table
- SQL query showing sample test records in the table
- Server action file(s) in `/actions` directory
- Updated `database.types.ts` file with UserExperience types

**Note for Product Owner:** Manually create the `user_experience` table and `VIEW_ROSTER_EXPERIENCE_LEVEL` permission in Supabase before starting implementation work on other units.

### Unit 2: Master Roster User Sheet UI Updates
**Purpose:** Display experience information in the Master Roster user detail sheet.

**Demo Criteria:**
- Click on a user in Master Roster opens updated sheet with new sections
- Sections appear in order: Personal Information → Level → Rector Ready → Previous Experience → Security
- Previous Experience shows grouped, comma-separated lists by community
- Manual experience entry dropdown appears at bottom of Previous Experience section
- Level displays as "Level 1", "Level 2", or "Level 3" based on experience count
- Rector Ready shows overall status icon (✓ or ✗) plus four individual criteria with status icons

**Proof Artifact:**
- URL: `/admin/users` (Master roster page)
- Screenshot showing expanded user sheet with all new sections
- Test users with varying experience levels (1, 2, 3) to demonstrate calculation

### Unit 3: Manual Experience Entry
**Purpose:** Allow users/admins to add other community experience or missed internal roles.

**Demo Criteria:**
- Button at bottom of Previous Experience opens a modal form with dropdown for selecting CHA role (except Head/Assistant Head which are disabled)
- Form includes fields for: Role, Weekend (optional dropdown of system weekends), Other Community Location (text field), Date (month/year picker), Rollo (optional text field)
- Validation prevents Head/Assistant Head roles from being manually added
- After submission, new experience appears in Previous Experience list immediately
- Can add multiple roles for same weekend/community

**Proof Artifact:**
- Short video or screenshot series showing:
  1. Opening manual entry form
  2. Filling in other community experience
  3. Submitting and seeing it appear in the list

### Unit 4: Weekend Finalization Validation and Confirmation
**Purpose:** Prevent premature weekend finalization and confirm roster accuracy.

**Demo Criteria:**
- When setting a new weekend to be "active", the currently active weekend is inherently set to "finished" and system validates required leadership positions
- If validation fails, shows warning modal with option to override or cancel
- If validation passes, shows confirmation modal stating rosters will become read-only
- Modal requires explicit confirmation before proceeding
- After confirmation, weekend status changes to "finished"

**Proof Artifact:**
- URL: `/admin/weekends/[weekend_id]` (Weekend management page)
- Screenshot of validation warning modal (with missing positions listed)
- Screenshot of confirmation modal
- Database query showing weekend status: `SELECT id, status FROM weekend WHERE id = [test_weekend_id];`

### Unit 5: Automatic Experience Record Creation
**Purpose:** Auto-generate user_experience records when weekend is finalized.

**Demo Criteria:**
- After confirming weekend finalization, system creates user_experience records for all roster participants
- Each participant gets one record per role they held during the weekend
- Records include: user_id, weekend_id, cha_role, rollo (if applicable), served_at (weekend start date)
- Can query user_experience table and see new records for that weekend

**Proof Artifact:**
- Before/after SQL query: `SELECT COUNT(*) FROM user_experience WHERE weekend_id = [test_weekend_id];`
- Detailed query showing created records: `SELECT * FROM user_experience WHERE weekend_id = [test_weekend_id] LIMIT 10;`
- Screenshot of user's Previous Experience section showing newly added weekend

### Unit 6: Read-Only Weekend Rosters
**Purpose:** Prevent modifications to finalized weekend data.

**Demo Criteria:**
- After weekend is finished, Weekend Roster page displays read-only view
- All edit buttons, dropdowns, and form fields are disabled or hidden
- Attempt to edit via UI shows "This weekend is finalized and cannot be modified" message
- Server actions reject modification attempts with appropriate error
- Everything related to the weekend (roster, candidates, files) is read-only

**Proof Artifact:**
- URL: `/admin/weekends/[finished_weekend_id]` (showing read-only state)
- Screenshot comparing editable vs. read-only weekend roster views
- Error message screenshot when attempting to edit
- Test of API/server action showing rejected modification

### Unit 7: Experience Level Visibility on Weekend Roster (Permission-Based)
**Purpose:** Show experience levels on Weekend Roster page for authorized users only.

**Demo Criteria:**
- New `VIEW_ROSTER_EXPERIENCE_LEVEL` permission exists in database
- Weekend Roster page shows Level (1, 2, 3) next to each user's name for users with permission
- Users without permission see Weekend Roster without Level information
- Experience level updates when user's experience changes

**Proof Artifact:**
- URL: `/admin/weekends/[weekend_id]`
- Side-by-side screenshots: one user with permission, one without
- Database query showing permission: `SELECT * FROM user_permissions WHERE permission_name = 'VIEW_ROSTER_EXPERIENCE_LEVEL';`
- Note: "Create Leaders Committee role that includes this permission" (manual task for product owner)

## Functional Requirements

### Database & Data Model

1. **REQ-1:** Create a `user_experience` table with the following columns:
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to users table, required)
   - `weekend_id` (UUID, foreign key to weekend table, nullable)
   - `cha_role` (string, required) - stores CHA role enum values
   - `weekend_reference` (string) - reference of the community/weekend attended - like `DTTD#5` or `Brazos Valley#20`
   - `rollo` (string, nullable) - stores the name of the rollo given (if applicable)
   - `served_at` (date, required) - stores midnight of the first day of the month (or start date of the weekend, for DTTD weekends) for month/year tracking
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **REQ-2:** Add appropriate indexes on `user_id`, `weekend_id`, and `served_at` for query performance.

3. **REQ-3:** Add a new permission `VIEW_ROSTER_EXPERIENCE_LEVEL` to the permissions system.

4. **REQ-4:** Add comments in code noting the assumption that other community experience counts the same as DTTD experience for level calculations, for future modification if needed.

### Experience Level Calculation

5. **REQ-5:** Calculate user experience level based on count of experience records with `weekend_id` populated:
   - **Level 1:** 0 or 1 weekend
   - **Level 2:** 2 or 3 weekends
   - **Level 3:** 4 or more weekends

6. **REQ-6:** Level calculation should count distinct `weekend_id` values (deduplicate if a user has multiple roles on same weekend).

### Rector Ready Calculation

7. **REQ-7:** Calculate "Rector Ready" status based on four criteria:
   - **Criterion 1:** Has served as Head or Assistant Head (check for CHA_ROLE.HEAD_* or CHA_ROLE.ASSISTANT_HEAD_* in experience)
   - **Criterion 2:** Has served as Team Head (check for CHA_ROLE.*_HEAD in experience)
   - **Criterion 3:** Has given 2+ talks (count experience records with `rollo` field populated for that user, must be >= 2)
   - **Criterion 4:** Has worked dining (check for CHA_ROLE.DINING or CHA_ROLE.HEAD_DINING in experience)

8. **REQ-8:** Overall "Rector Ready" badge shows ✓ only if all four criteria are met, otherwise shows ✗.

9. **REQ-9:** Individual status (✓ or ✗) should display next to each of the four criteria.

10. **REQ-10:** Rollo counting logic (Criterion 3) should only count experience where `rollo` is not null/empty. Validation that only speaker roles have rollos should be done at application level, not database level.

### Master Roster User Sheet Display

11. **REQ-11:** Update the Master Roster user detail sheet to include sections in this order:
    - Personal Information
    - Level
    - Rector Ready
    - Previous Experience
    - Security
    - (existing sections)

12. **REQ-12:** The **Level** section displays the calculated experience level (1, 2, or 3) as "Level X".

13. **REQ-13:** The **Rector Ready** section displays:
    - Overall status badge: "Rector ready: ✓" or "Rector ready: ✗"
    - Four individual criteria with status indicators:
      - "Head or Assistant Head: ✓/✗"
      - "Team Head: ✓/✗"
      - "Given 2+ talks: ✓/✗"
      - "Worked Dining: ✓/✗"

14. **REQ-14:** The **Previous Experience** section displays:
    - Comma-separated lists grouped by community
    - Format: "DTTD: [Role] ([Month Year]), [Role] ([Month Year]), ..."
    - Format: "[Other Community Name]: [Role] ([Month Year]), ..."
    - Ordered reverse chronologically (most recent first) within each group
    - Separate groups for DTTD vs. each other community location

15. **REQ-15:** At the bottom of the **Previous Experience** section, provide a manual entry control (dropdown/button) to add experience.

16. **REQ-16:** Previous Experience is visible to all users (no permission restrictions on viewing).

### Manual Experience Entry

17. **REQ-17:** Manual experience entry form includes fields:
    - **Role** (dropdown of all CHA roles)
    - **Weekend** (optional dropdown of system weekends)
    - **Other Community Location** (text field, required if Weekend not selected)
    - **Date** (month/year picker)
    - **Rollo** (optional text field)

18. **REQ-18:** Head and Assistant Head roles must be disabled/unavailable in the manual entry role dropdown.

19. **REQ-19:** Validation: User can select either a system Weekend OR enter Other Community Location, but not both (mutually exclusive).

20. **REQ-20:** When Date is selected, the system stores midnight of the first day of the selected month in the `served_at` field.

21. **REQ-21:** Users can manually add experience for a weekend that already exists in the system (has a `weekend_id`), but should be shown a warning/confirmation if they do so.

22. **REQ-22:** After successful submission, the new experience immediately appears in the Previous Experience list.

### Weekend Finalization Workflow

23. **REQ-23:** Add a "Finish Weekend" button/action to the weekend management interface.

24. **REQ-24:** When "Finish Weekend" is clicked, validate that all required leadership positions are filled using a helper function that can be extended in the future. Initially, required positions include:
    - All CHA leadership roles (Rector, Head Cha, etc.)

25. **REQ-25:** If validation fails, display a warning modal listing the missing required positions, with options to "Override and Finish" or "Cancel".

26. **REQ-26:** If validation passes (or user overrides), display a confirmation modal stating:
    - "Before finishing this weekend, please confirm that the rosters are correct."
    - "Once finished, the roster and all related data will become read-only and cannot be edited."
    - Buttons: "Cancel" and "Confirm and Finish"

27. **REQ-27:** After user confirms, the system must:
    - Mark the weekend status as "finished"
    - Create `user_experience` records for all roster participants
    - Make all weekend-related data read-only

### Automatic Experience Record Creation

28. **REQ-28:** When a weekend is marked as "finished", automatically create `user_experience` records for all users on the roster.

29. **REQ-29:** Create one record per role per user (if a user held multiple roles, create multiple records).

30. **REQ-30:** For automatically-created records:
    - `user_id` = roster participant's user ID
    - `weekend_id` = the finished weekend's ID
    - `cha_role` = the role they served in
    - `rollo` = populated if the role was a speaking role (application logic determines this)
    - `served_at` = the weekend's start date
    - `weekend_reference` = `DTTD#<number>` 

### Read-Only Weekend Data

31. **REQ-31:** Once a weekend is marked as "finished", all related data becomes read-only:
    - Weekend roster assignments
    - Candidate information for that weekend
    - Files associated with that weekend
    - All other weekend-related records

32. **REQ-32:** Finished weekends cannot be re-opened or edited. This restriction is permanent.

33. **REQ-33:** UI must clearly indicate read-only status:
    - Disable or hide all edit buttons, dropdowns, and form fields
    - Display a banner or message: "This weekend is finalized and cannot be modified"

34. **REQ-34:** Server actions must reject any modification attempts to finished weekends with appropriate error messages.

### Experience Editing and Corrections

35. **REQ-35:** Admins (users with appropriate permissions) can edit or delete any `user_experience` record, including automatically-created ones.

36. **REQ-36:** Provide an edit/delete action in the Previous Experience section (for admin users only).

### Weekend Roster Experience Level Visibility

37. **REQ-37:** On the Weekend Roster page (e.g., `/admin/weekends/[weekend_id]/roster`), display each user's experience level (1, 2, 3) next to their name **only for users with the `VIEW_ROSTER_EXPERIENCE_LEVEL` permission**.

38. **REQ-38:** Users without the `VIEW_ROSTER_EXPERIENCE_LEVEL` permission should see the Weekend Roster page without experience level information.

39. **REQ-39:** This permission-based display applies **only to the Weekend Roster page**, not the Master Roster page (where everyone can view all experience info).

40. **REQ-40:** Leave a code comment noting: "Create a Leaders Committee role that includes the VIEW_ROSTER_EXPERIENCE_LEVEL permission" (manual task for product owner).

## Non-Goals (Out of Scope)

1. **Historical Data Migration:** This feature does not include automatic migration or import of historical experience data for existing users. Product owner will handle this manually in a separate effort.

2. **Experience Approval Workflow:** Experience entries (manual or automatic) do not require approval. All entries are immediately visible and counted.

3. **Rollo Management:** This feature does not create a separate rollos table or comprehensive rollo management system. Rollos are stored as simple strings.

4. **Experience Level Weighting:** Other community experience counts the same as DTTD experience (no weighting or differentiation in level calculation). This may be revisited in the future.

5. **Weekend Un-Finishing:** Once a weekend is marked as "finished", it cannot be un-finished or re-opened. No rollback mechanism is provided.

6. **Database Enforcement of Mutual Exclusivity:** The mutual exclusivity between `weekend_id` and `external_community_weekend` is not enforced at the database level (no check constraint).

7. **Leaders Committee Role Creation:** This spec includes the permission creation but not the actual role setup. Product owner will create the Leaders Committee role manually.

8. **Complex Rector Ready Logic:** The four Rector Ready criteria are fixed and not configurable. Future enhancements may allow customization.

## Design Considerations

### UI/UX

- **Master Roster User Sheet:** Use existing shadcn/ui components (Card, Badge, Separator) for consistent styling of new sections.
- **Experience Lists:** Display as inline comma-separated text with bold community names, not as tables, to save space.
- **Status Indicators:** Use ✓ (check) and ✗ (x) symbols for Rector Ready status. Consider using Badge components with success/destructive variants.
- **Manual Entry Form:** Use a Dialog or Sheet component for the manual experience entry form to avoid cluttering the main sheet.
- **Confirmation Modals:** Use AlertDialog component for weekend finalization warnings and confirmations, with clear action buttons.
- **Read-Only Indicators:** Use muted colors, disabled states, and clear messaging (banner or alert) to indicate read-only status on finished weekends.

### Mobile Responsiveness

- **Master Roster User Sheet:** Ensure all new sections are readable and functional on mobile devices (existing sheet should already be responsive).
- **Weekend Roster Experience Level:** Display level as a badge or small indicator that doesn't clutter the mobile layout.

## Technical Considerations

### Database

- **Migration:** Create a new migration file to add the `user_experience` table and `VIEW_ROSTER_EXPERIENCE_LEVEL` permission.
- **Indexes:** Add indexes on frequently queried columns (`user_id`, `weekend_id`, `served_at`) to optimize performance.
- **Foreign Keys:** Ensure proper foreign key constraints and cascade rules for `user_id` and `weekend_id`.

### Server Actions

- **Experience CRUD:** Create server actions in `actions/` for:
  - Creating manual experience entries
  - Editing experience entries (admin only)
  - Deleting experience entries (admin only)
  - Fetching all experience for a user
- **Weekend Finalization:** Create or update weekend finalization server action to handle:
  - Validation of required positions
  - Status update to "finished"
  - Bulk creation of user_experience records
  - Triggering read-only enforcement
- **Result Pattern:** All server actions should return `Result<Error, T>` types for consistent error handling.

### Type Safety

- **Generated Types:** Regenerate `database.types.ts` after migration to include `user_experience` table types.
- **CHA Role Enum:** Use existing CHA role enum/constants for the `cha_role` field to ensure type safety.

### Validation and Business Logic

- **Helper Functions:** Create reusable helper functions in `lib/`:
  - `calculateExperienceLevel(userId: string): Promise<1 | 2 | 3>`
  - `calculateRectorReady(userId: string): Promise<RectorReadyStatus>` (where `RectorReadyStatus` includes overall status and four individual criteria)
  - `validateRequiredWeekendPositions(weekendId: string): Promise<ValidationResult>` (extensible for future changes)
  - `canEditExperience(userId: string, currentUserId: string): boolean` (permission check)
- **Rollo Validation:** Create application-level validation to warn if a non-speaking role has a rollo assigned (when manually adding experience).

### Permissions

- **Permission Check:** Use existing permission checking utilities to verify `VIEW_ROSTER_EXPERIENCE_LEVEL` permission on Weekend Roster page.
- **Admin Checks:** Ensure only admins can edit/delete experience records.

### State Management

- **React Query:** Use TanStack React Query for fetching and caching user experience data.
- **Optimistic Updates:** Consider optimistic updates when manually adding experience to improve UX (immediately show in list before server confirmation).

### Comments and Documentation

- **Assumption Comments:** Add comments wherever the "other community experience counts the same as DTTD experience" assumption is used, noting it may need future modification.
- **Extensibility Comments:** Add comments in the required positions validation helper indicating it can be extended with additional position checks in the future.
- **Leaders Committee Note:** Add a TODO or note comment about creating the Leaders Committee role after the permission is added.

## Success Metrics

1. **Adoption:** 90%+ of community members have at least one experience record within 3 months of launch (through weekend finalizations and manual entries).
2. **Data Accuracy:** Less than 5% of experience records require correction/deletion within first 6 months.
3. **Rector Ready Visibility:** Rectors and Pre-Weekend Couple members report improved ability to identify qualified candidates for leadership roles (qualitative feedback).
4. **Finalization Errors:** Less than 10% of weekend finalizations require override due to validation warnings (indicating most weekends are properly staffed before finalization).
5. **Read-Only Compliance:** Zero instances of accidental roster modifications after weekend finalization (system successfully prevents edits).

## Open Questions

1. **Experience Record Editing UI:** Should the edit/delete functionality for experience records be in the Master Roster user sheet, or in a separate admin page?
   - *Recommendation:* Add edit/delete icons next to each experience entry in the Previous Experience section (visible only to admins).

2. **Weekend Start Date:** Is the weekend start date reliably stored in the `weekend` table? If not, how should we determine the `served_at` date for auto-created experience records?
   - *Action:* Verify weekend table schema includes start/end dates.

3. **Rollo Dropdown:** Should the Rollo field be a dropdown of predefined rollo names, or free-text entry?
   - *Recommendation:* Start with free-text for flexibility, consider dropdown in future if standardization is needed.

4. **Experience Level on Master Roster:** Should the Level also be displayed on the main Master Roster table/list view (not just in the user sheet)?
   - *Action:* Confirm with stakeholders. Current spec only includes it in the user detail sheet.

5. **Multiple Roles Same Weekend:** If a user held multiple roles on the same weekend (e.g., Prayer and Dining), how should this be displayed in the Previous Experience list?
   - *Recommendation:* Display as separate entries: "DTTD: Prayer (May 2023), Dining (May 2023), ..." (already covered in REQ-14, but confirm this is acceptable).

6. **Notification on Finalization:** Should users on the finished weekend roster receive a notification that their experience has been recorded?
   - *Action:* Consider for future enhancement, out of scope for initial implementation.

---

**Document Version:** 1.0  
**Created:** 2025-12-08  
**Status:** Draft - Awaiting Approval
