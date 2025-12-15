# 0002-spec-team-information-form.md

## Introduction/Overview

The Team Information Form collects comprehensive information from weekend team members including contact details, church affiliation, past weekend experience, and special skills. This form enables weekend leadership to plan effectively by understanding each team member's background, experience level, and capabilities. The form integrates with the homepage TODO system (spec 0001) by automatically marking the "Complete team information sheet" task as complete when submitted.

## Goals

- Collect comprehensive team member information including address, church, past weekend experience, and skills
- Enable reuse of saved user address data across multiple weekend assignments
- Track team member completion status automatically based on form submission
- Support flexible data entry for varied experience backgrounds and custom skills
- Provide seamless user experience with saved data pre-filling and validation

## User Stories

### 1. Submit Team Member Information

**As a weekend team member**, I want to submit my contact information, church affiliation, and past weekend experience so that the weekend leadership has the information they need to plan effectively.

**Description:**
Weekend leadership requires comprehensive information about each team member to plan logistics, understand member backgrounds, and make informed decisions about team assignments. Team members need a straightforward way to provide this essential information.

**Acceptance Criteria:**

- Access team information form from /team-info route when assigned to an active weekend
- Submit address (street, city, state, zip), church affiliation, past weekend attended details, and essentials training date
- All required fields are validated before submission
- Receive confirmation that information was successfully submitted
- Redirected to homepage with success notification after submission
- Cannot access form if not assigned to an active weekend roster

### 2. Reuse Saved Address Information

**As a returning team member**, I want the system to remember my address from previous weekends so that I don't have to re-enter the same information every time.

**Description:**
Many team members serve on multiple weekends over time. Re-entering the same address information for each weekend is tedious and error-prone. The system should remember and offer to reuse previously submitted address data.

**Acceptance Criteria:**

- Form displays "Do you want to use this saved address or change it?" when saved address exists
- Saved address automatically pre-fills all address fields when choosing to use it
- Option to modify saved address if information has changed
- Updated address is saved for future form submissions
- New team members see empty address fields without the reuse prompt
- Address Line 2 is optional while all other address fields are required

### 3. Document External Community Experience

**As a weekend team member with varied Tres Dias experience**, I want to document my roles across different communities and weekends so that leadership understands my background and can assign me appropriately.

**Description:**
Team members often have experience serving in other Tres Dias communities or serving multiple roles across different weekends. Leadership needs visibility into this varied experience to understand each member's full background and capabilities.

**Acceptance Criteria:**

- Add multiple experience entries dynamically (no fixed limit)
- Each entry includes CHA role, community + weekend number, and date (month/year)
- Remove experience entries that were added in error
- Experience entries are saved and linked to the user's profile
- Same role can appear multiple times with different dates (repeated service)
- System prevents duplicate entries (same role + date) through upsert logic
- All experience entries persist when form is re-accessed for editing

### 4. Identify Special Skills and Abilities

**As a weekend team member**, I want to indicate my special skills and abilities so that leadership can utilize my talents effectively during the weekend.

**Description:**
Weekend planning is more effective when leadership knows what special skills and abilities team members possess (audio/visual, carpentry, music, medical, etc.). Team members need an easy way to indicate their relevant skills.

**Acceptance Criteria:**

- Select multiple skills from predefined list using multi-select dropdown
- Predefined options include: Audio/video, Carpenter, Crafts, Music (vocal), Music (instrument), Sewing, Computer skills, Nurse/medical, Clergy, Plumber, Electrician, Photography
- Option to add custom skills not in the predefined list
- Custom skills are saved but not added to the global options list
- Selected skills display as tags/chips for easy visualization
- Skills are saved as comma-separated values linked to weekend roster assignment

### 5. Edit Previously Submitted Information

**As a weekend team member**, I want to update my team information after initial submission if my circumstances change.

**Description:**
Team member circumstances may change between initial form submission and the weekend event (address change, new skills acquired, etc.). The system should allow editing previously submitted information at any time.

**Acceptance Criteria:**

- Re-access /team-info form after initial submission
- All previously submitted data pre-fills in the form
- Edit any field including address, church, past weekend, essentials training, experience, and skills
- Changes are saved and update the existing record (not create duplicate)
- Success notification confirms updates were saved
- Experience entries can be added or removed when editing

## Demoable Units of Work

### Unit 1: Team Information Form - Basic Data Collection

**Purpose:** Collect essential team member information including address, church affiliation, past weekend attendance, and essentials training completion.

**Functional Requirements:**

- The system shall provide a /team-info route accessible to logged-in users on the (public) layout
- The system shall redirect users to the homepage with an error toast if they access /team-info without being assigned to an active weekend roster
- The system shall fetch the logged-in user's saved address from the `users.address` JSONB field on the server-side when loading the form
- The system shall display an address fieldset asking "Do you want to use this saved address or change it?" if a saved address exists
- The system shall show address input fields (addressLine1, addressLine2, city, state, zip) with saved values pre-filled when the user chooses to change their address
- The system shall show empty address input fields without the "use saved address" question if no saved address exists
- The system shall mark addressLine1, city, state, and zip as required; addressLine2 shall be optional
- The system shall provide a "Church" text field (required) for the user to enter their church affiliation
- The system shall provide three separate fields for "Past Weekend Attended":
  1. Community type dropdown (required)
  2. Weekend number input (required)
  3. Location text field - city/state (required)
- The system shall combine past weekend fields into a single string format "X Community#32|Dallas" when saving to the database
- The system shall provide a date picker (month/year mode) for "Essentials Training Completed" (required)
- The system shall validate all required fields before allowing form submission
- The system shall allow users to re-access and edit the form at any time after initial submission

**Proof Artifacts:**

- Screenshot: /team-info form with empty fields for new user demonstrates initial form state
- Screenshot: /team-info form with pre-filled address for returning user demonstrates saved address reuse
- Screenshot: Form validation errors for missing required fields demonstrates validation logic
- Database record: `weekend_roster_team_info` record with properly formatted data demonstrates successful submission

### Unit 2: Team Information Form - Experience and Skills

**Purpose:** Collect detailed team member experience from other communities and identify special skills/abilities for weekend planning.

**Functional Requirements:**

- The system shall provide an "Experience outside of Dusty Trails" section allowing users to add multiple experience entries
- The system shall allow users to add/remove experience entries dynamically (no fixed limit)
- Each experience entry shall contain:
  1. CHA Role text field (required)
  2. Community + Weekend # text field (required)
  3. Date month/year picker (required)
- The system shall save experience entries to a `user_experience` table linked to the logged-in user
- The system shall upsert user_experience records matching on (user_id + cha_role + month/year) to prevent duplicate entries for the same role in the same month/year
- The system shall allow the same cha_role to appear multiple times with different dates (supporting repeated roles across different weekends)
- The system shall provide a "Special Gifts / Skills / Abilities" multi-select field using a dropdown component (shadcn/ui default approach)
- The system shall offer predefined skill options:
  - Audio/video
  - Carpenter
  - Crafts
  - Music (vocal)
  - Music (instrument)
  - Sewing
  - Computer (spreadsheets)
  - Computer (powerpoint / creative design)
  - Nurse / medical
  - Clergy (ordained)
  - Plumber
  - Electrician
  - Photography
  - Other (custom text entry)
- The system shall save custom skills entered by users but shall NOT add them to the predefined options list for other users
- The system shall store selected skills as a comma-separated string in the `weekend_roster_team_info` table

**Proof Artifacts:**

- Screenshot: Form showing multiple experience entries demonstrates dynamic entry management
- Database records: Multiple `user_experience` rows for same user demonstrates experience tracking
- Screenshot: Skills dropdown with selected options demonstrates multi-select functionality
- Database record: `weekend_roster_team_info.skills` field with comma-separated values demonstrates skill storage

### Unit 3: Form Submission and Database Updates

**Purpose:** Persist all collected team information to the database, update user address for future reuse, and enable TODO completion tracking.

**Functional Requirements:**

- The system shall create or update a `weekend_roster_team_info` record linked to the user's active `weekend_roster` record via weekend_roster_id
- The system shall update the `users.address` JSONB field with the submitted address data for all form submissions
- The system shall save all user_experience entries to the database with proper upsert logic
- The system shall redirect users to the homepage with a success toast notification after successful form submission
- The system shall use React Hook Form with Zod validation for client-side form validation
- The system shall use server actions (not API routes) for form submission and database updates
- The system shall handle form submission errors gracefully with user-friendly error messages
- The system shall validate weekend_roster_id belongs to the authenticated user before saving data
- The system shall fetch existing form data when user re-accesses the form (for editing)
- The system shall pre-populate all fields with saved data on form re-access

**Proof Artifacts:**

- Database record: `users.address` JSONB field updated with submitted address demonstrates address persistence
- Database record: `weekend_roster_team_info` record with weekend_roster_id foreign key demonstrates proper linking
- Database records: Multiple `user_experience` records demonstrate experience tracking
- Screenshot: Success toast notification on homepage demonstrates successful submission feedback
- Screenshot: Form pre-populated with existing data on re-access demonstrates edit capability

## Non-Goals (Out of Scope)

1. **Homepage TODO integration**: While this form enables TODO completion, the actual homepage TODO section is implemented in spec 0001
2. **Payment processing integration**: No payment functionality is included in this spec
3. **Email notifications**: No automated emails will be sent to team members or leadership after form submission
4. **Admin review interface**: No admin dashboard features for reviewing submitted team information (may be added in future)
5. **Custom skill approval workflow**: Custom skills entered by users will be saved but not added to the master list; no admin approval process is included
6. **Deadline enforcement**: No hard deadlines or time-based restrictions on when team members can complete the form
7. **Mobile app**: This feature is web-only; no native mobile app development is included
8. **Export functionality**: No CSV/PDF export of team member information is included in this scope
9. **Bulk data import**: No ability to import team information from spreadsheets or other sources

## Design Considerations

**Page Layout:**

- Follow existing form patterns used in candidate forms (consistent field styling, validation messages)
- Use a single-page form with all sections visible (no multi-step wizard)
- Include progress indicator or section navigation for long form (optional)
- Sticky submit button at bottom (optional for UX improvement)

**Form Sections:**
Group related fields into clear sections with headings:

1. **Address Information**
   - "Use saved address?" toggle/radio (if saved address exists)
   - Address fields (collapsible if using saved address)
2. **Church Affiliation**
   - Single text field
3. **Past Weekend Experience**
   - Three-field input group
   - Help text explaining format
4. **Essentials Training**
   - Month/year date picker
5. **Experience Outside Dusty Trails**
   - Dynamic entry section with "Add Another" button
   - Each entry in a Card with remove button
6. **Special Gifts & Skills**
   - Multi-select dropdown
   - Selected items displayed as tags/chips

**Component Selection:**

- Use shadcn/ui Form components (wraps React Hook Form)
- Input, Select, DatePicker components from shadcn/ui
- Button with loading state for submission
- Alert for error messages
- Card component for experience entries
- Badge component for selected skills display

**Address Fieldset Behavior:**

- If saved address exists: Show radio buttons or toggle switch
- Options: "Use saved address" (default) vs "Enter new address"
- Selecting "Enter new address" reveals address fields with pre-filled values
- Use Collapsible component for smooth expand/collapse animation
- Pre-filled values should be editable

**Experience Entry Management:**

- Use "Add Another Experience" button (secondary variant) with Plus icon
- Each entry in a Card component with subtle border
- Remove button as icon button (Trash2 icon) in top-right of card
- Minimum 0 entries (section is optional)
- Consider reasonable maximum (20 entries) to prevent abuse

**Validation & Error Display:**

- Show validation errors inline below each field
- Use red text and error icons for errors
- Highlight fields with errors (red border)
- Show summary of errors at top of form on submit (optional)
- Disable submit button while validation errors exist (or show errors on click)

**Loading & Success States:**

- Show loading spinner on submit button during submission
- Disable all form fields during submission
- Success: Redirect to homepage with toast notification
- Toast message: "Team information saved successfully!"

## Repository Standards

**Code Organization:**

- Create /team-info page at `app/(public)/team-info/page.tsx`
- Create form component at `components/team-forms/team-info-form.tsx`
- Create reusable subcomponents:
  - `components/team-forms/address-section.tsx`
  - `components/team-forms/experience-entry.tsx`
  - `components/team-forms/skills-selector.tsx`
- Create server actions in `actions/team-info.ts`
- Create types in `lib/team-forms/types.ts`
- Create validation schemas in `lib/team-forms/validation.ts`
- Update database types by running `yarn generate` after schema changes

**Component Patterns:**

- Use ONLY shadcn/ui components (NO Material-UI or other libraries)
- Import UI components from `@/components/ui/` directory
- Mark client components with 'use client' directive
- Use React Hook Form with Zod schemas for form validation
- Follow responsive design guidelines (mobile-first approach)
- Use TypeScript for all components with proper typing

**Database Operations:**

- Use server actions pattern (not API routes) for all database operations
- Return `Result<Error, T>` types for consistent error handling
- Use generated types from `database.types.ts`
- Follow existing Supabase SSR patterns for authentication and data fetching
- Use transactions where appropriate (e.g., saving multiple experience entries)

**Testing:**

- Ensure `yarn build` completes successfully
- Test responsive behavior on mobile and desktop viewports
- Manually test form validation and error states
- Test all field types (text, dropdown, date picker, multi-select)
- Test dynamic experience entry add/remove
- Test saved address pre-fill logic
- Test form edit capability (re-accessing after submission)

## Technical Considerations

**Database Schema Changes:**

Create `users.address` JSONB column:

```sql
ALTER TABLE users ADD COLUMN address JSONB;
```

Structure: `{addressLine1: string, addressLine2: string?, city: string, state: string, zip: string}`

Create `weekend_roster_team_info` table:

```sql
CREATE TABLE weekend_roster_team_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekend_roster_id UUID NOT NULL REFERENCES weekend_roster(id) ON DELETE CASCADE,
  church TEXT NOT NULL,
  past_weekend_attended TEXT NOT NULL,
  completed_essentials_training_at TEXT NOT NULL,
  skills TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(weekend_roster_id)
);
```

Create `user_experience` table:

```sql
CREATE TABLE user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cha_role TEXT NOT NULL,
  community_weekend TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cha_role, date)
);
```

**RLS Policies:**

- `users.address`: Users can read/update their own address only
- `weekend_roster_team_info`: Users can read/write records linked to their own weekend_roster entries
- `user_experience`: Users can read/write their own experience records
- Weekend leadership with appropriate permissions can read all team info for their weekend

**Form State Management:**

- Use React Hook Form's `useForm` hook with Zod resolver
- Define Zod schemas for validation in `lib/team-forms/validation.ts`
- Use `defaultValues` to populate saved data from server
- Use `useFieldArray` for dynamic experience entries
- Handle async server actions with proper loading/error states

**Data Fetching Strategy:**

- Server-side: Fetch user's saved address and existing team_info in parallel
- Check if user is on active weekend roster (redirect if not)
- Pass data to client component via props
- Client-side: Use React Hook Form to manage form state

**Weekend Roster Validation:**

- Verify user is assigned to an active weekend roster before allowing form access
- Get weekend_roster_id for the user's active weekend
- Use this ID when saving weekend_roster_team_info
- Prevent users from submitting for weekends they're not assigned to

**Past Weekend Formatting:**

- Input: 3 separate fields (community dropdown, number input, location text)
- Output format: "Community Name#12|Dallas, TX"
- Validation: Ensure number is positive integer, location is not empty
- Display format when editing: Parse string back into 3 fields

**Essentials Training Date:**

- Use shadcn/ui DatePicker in month/year mode (no day selection)
- Store as string in format "YYYY-MM"
- Display format: "January 2024" (human-readable)

**User Experience Upsert Logic:**

- Before inserting, check if record exists with matching (user_id, cha_role, date)
- If exists: UPDATE with new community_weekend value
- If not exists: INSERT new record
- Use Supabase upsert functionality or manual check-then-insert

**Performance Considerations:**

- Fetch user's saved address and existing team_info data in parallel on page load
- Use Supabase's RLS to scope queries automatically
- Consider debouncing validation for text inputs (optional)
- Batch user_experience inserts in a single transaction

**Error Handling:**

- Wrap server actions in try-catch blocks
- Return Result<Error, T> for consistent error handling
- Display user-friendly error messages (don't expose technical details)
- Log errors server-side for debugging
- Handle network errors gracefully (retry logic optional)

## Security Considerations

**Authentication & Authorization:**

- Require authentication for /team-info route (handled by Supabase middleware)
- Verify user is assigned to active weekend roster before allowing form access
- Ensure users can only view/edit their own team information
- Validate weekend_roster_id belongs to authenticated user before saving

**Data Privacy:**

- Address information is PII - ensure proper RLS policies
- User experience data should be scoped to the user
- Skills/abilities data should be accessible to weekend leadership but not public
- Consider GDPR compliance for data retention and deletion

**Input Validation:**

- Validate all form inputs on both client (Zod) and server (server action validation)
- Sanitize text inputs to prevent XSS attacks
- Validate date formats and ensure reasonable date ranges (e.g., essentials training date not in future)
- Limit length of text fields to prevent abuse:
  - Church: max 200 chars
  - Past weekend location: max 100 chars
  - CHA role: max 100 chars
  - Community/weekend: max 200 chars
  - Skills: max 500 chars total
- Validate weekend number is positive integer between 1-999

**SQL Injection Prevention:**

- Use Supabase client with parameterized queries (automatically handled)
- Never construct raw SQL with user input
- Rely on generated types and Supabase methods

**Proof Artifact Security:**

- Screenshots should not reveal sensitive data from other users
- Database records in proof artifacts should only show test user's data
- Do NOT commit any real user data in proof artifacts
- Blur or redact addresses in public screenshots if needed

## Success Metrics

1. **Completion Rate**: 90% of team members assigned to active weekends complete the form before third team meeting
2. **Form Abandonment**: Less than 10% of users who start the form abandon it without completing
3. **Address Reuse**: 80% of returning team members successfully have their saved address pre-filled
4. **Time to Complete**: Average time to complete form is under 10 minutes for users with previous weekend experience
5. **Error Rate**: Less than 5% of form submissions result in validation errors or server errors
6. **Edit Success**: 95% of form edit attempts (re-accessing after initial submission) load existing data correctly

## Open Questions

1. **Date Format Display**: Should dates be displayed in a specific format in the UI after submission (e.g., "January 2024" vs "01/2024")?
2. **Experience Entry Limits**: While no hard limit is specified, should we set a reasonable maximum (e.g., 20 entries) to prevent abuse?
3. **Skills Field Migration**: If we want to support skills better in the future (e.g., move to a separate table with admin management), should we design with that in mind now?
4. **Third Team Meeting Deadline**: Is there a specific date/time before which the form must be completed? Should the system display this deadline prominently?
5. **Community Dropdown Options**: What communities should appear in the "Past Weekend Attended" dropdown? (DTTD, other sister communities?)
6. **Form Sections Collapsible**: Should form sections be collapsible to reduce visual clutter for long forms?
7. **Integration with TODO**: Should this spec include updating the homepage TODO completion tracking, or is that separate (spec 0001 enhancement)?
