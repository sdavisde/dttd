# 0001-spec-homepage-team-todos.md

## Introduction/Overview

The Homepage Team TODOs feature provides weekend team members with a clear, visible checklist of pre-meeting tasks directly on the homepage. This TODO section displays for team members assigned to active weekends and tracks completion status, helping them understand what's expected before the third team meeting. The TODO list is configurable to allow easy addition of new tasks by developers as features are implemented.

## Goals

- Provide team members with clear visibility into pre-weekend requirements through a homepage TODO section
- Display TODO section only for users assigned to active weekends (leveraging existing weekend_roster logic)
- Track completion status visually with checkboxes and styling (manual and automatic)
- Enable automatic completion checking via configurable callbacks
- Show celebratory "All Set!" state when all tasks are complete
- Support easy extension of TODO list through configuration object

## User Stories

**As a weekend team member**, I want to see a clear list of tasks I need to complete before the third team meeting so that I know what's expected of me and can track my progress.

## Demoable Units of Work

### Unit 1: Homepage TODO Section with Configurable Task List

**Purpose:** Provide team members on active weekends with a visible, trackable list of pre-meeting tasks directly on the homepage, with a configurable TODO list that developers can easily extend.

**Functional Requirements:**

- The system shall display a "Team TODO List" section on the homepage for users assigned to a weekend roster where the weekend status is "active"
- The system shall position the TODO section below "Upcoming Weekends" and above existing content/widgets on the homepage
- The system shall display each TODO item as a separate line with a checkbox, task name, and link/button
- The system shall display incomplete TODOs with an unchecked checkbox and normal styling
- The system shall display completed TODOs with a checked checkbox, strikethrough styling, and muted/greyed appearance
- The system shall display an "All Set!" success alert when all TODOs are marked as complete
- The system shall determine completion state via checkCompletion callbacks only (no manual checkbox toggling)
- The system shall show the TODO section only for the active weekend matching the user's gender (leveraging existing weekend_roster scoping logic)
- The system shall load TODO items from a configuration object that defines:
  - Task label/text
  - Link URL (or null for disabled items)
  - Tooltip text for disabled items
  - Unique identifier
  - Completion check callback function
- The system shall determine TODO completion status in the parent component by:
  1. For each TODO item, call its checkCompletion callback (if defined) with user/weekend data
  2. If no callback is defined, completion status is false (incomplete)
  3. Pass completion state as props to child TODO components
- The system shall not allow manual checkbox toggling (checkboxes are visual indicators only)
- The system shall include three initial TODO items (all initially incomplete due to no callbacks):
  1. "Complete team information sheet" - disabled link with tooltip "Coming soon", no completion callback
  2. "Complete team payment" - active link to `/payment/team-fee` page, no completion callback
  3. "Review Job Description" - active link to `/files/job-descriptions`, no completion callback
- The system shall visually distinguish between active links and disabled items (only item #1 initially)

**Proof Artifacts:**

- Screenshot: Homepage with TODO section showing uncompleted tasks demonstrates section visibility and layout
- Screenshot: Homepage with TODOs showing "All Set!" alert (using mock checkCompletion callbacks) demonstrates completion state
- Code snippet: Configuration object showing structure with checkCompletion callback demonstrates extensibility
- Screenshot: Homepage without TODO section for non-team-member user demonstrates conditional display logic
- Screenshot: Tooltip showing "Coming soon" on disabled TODO item #1 demonstrates placeholder behavior
- Screenshot: Clicking "Complete team payment" link navigates to payment page demonstrates active link functionality

## Non-Goals (Out of Scope)

1. **Manual checkbox toggling**: Users cannot manually check/uncheck TODOs; completion is determined by backend data only
2. **Team information form**: The /team-info route and form are not included (see spec 0002)
3. **Email notifications**: No automated emails about incomplete TODOs
4. **Admin visibility**: No admin dashboard showing team member TODO completion rates
5. **Deadline enforcement**: No time-based restrictions or warnings about approaching deadlines

## Design Considerations

**TODO Section Layout:**

- Position TODO section between "Upcoming Weekends" and main content on homepage
- Use consistent spacing with existing homepage sections (maintain current design system)
- Consider using a Card component with border for visual grouping
- Section heading: "Team Preparation Tasks" or "Before the Third Team Meeting"

**TODO Item Design:**

- Each TODO item should have clear visual separation
- Use Lucide React icons for checkboxes (CheckSquare for checked, Square for unchecked) - non-interactive, visual only
- Checkboxes should not have pointer cursor or hover states (they are indicators, not controls)
- Disabled links should be visually muted but still readable
- Active links should use standard link styling (underline on hover, cursor pointer)
- Include small info icon (ⓘ) next to disabled items that shows tooltip on hover

**Completion States:**

- Unchecked: Normal text color, unchecked icon (visual only, not interactive)
- Checked: Muted foreground color (text-muted-foreground), strikethrough, checked icon
- Strikethrough should not make text illegible (use appropriate opacity/color)

**"All Set!" Alert:**

- Use shadcn/ui Alert component with success variant (or custom green styling)
- Include a celebration icon (PartyPopper, CheckCircle, or similar)
- Position above or below the TODO list
- Message: "All Set! You've completed all preparation tasks."

**Responsive Design:**

- TODO section should work well on mobile and desktop
- Consider stacking on mobile if layout is complex
- Ensure touch targets are adequate for mobile users

## Repository Standards

**Code Organization:**

- Create TODO section component at `components/team-todos/team-todo-section.tsx` (client component)
- Create individual TODO item component at `components/team-todos/todo-item.tsx` (presentational)
- Create TODO configuration at `lib/team-todos/config.ts`
- Add TODO section to homepage at `app/(public)/page.tsx` (server component passes data)
- Parent component calls checkCompletion callbacks and passes completion state as props
- Consider creating a custom hook `useTeamTodoCompletion()` for calling completion callbacks

**Component Patterns:**

- Use ONLY shadcn/ui components (Alert, Card, Checkbox, etc.)
- Import UI components from `@/components/ui/` directory
- Mark client components with 'use client' directive
- Use React hooks (useState, useEffect) for localStorage persistence
- Follow responsive design guidelines

**Data Fetching:**

- Use existing server-side data fetching patterns to check if user is on active weekend roster
- Leverage existing `weekend_roster` queries (see `actions/roster.ts`)
- Only render TODO section if user has active weekend assignment

**Testing:**

- Ensure `yarn build` completes successfully
- Test responsive behavior on mobile and desktop viewports
- Test that checkboxes are non-interactive (no cursor pointer, no click handler)
- Test conditional rendering (show/hide based on weekend assignment)
- Test completion callback execution (add a mock callback that returns true during development)
- Test "All Set!" alert displays when all callbacks return true

## Technical Considerations

**Weekend Roster Check:**

- Query `weekend_roster` table to check if logged-in user has a record with:
  - `weekend_id` matching an active weekend
  - Active weekend scoped to user's gender (existing logic in codebase)
- Use existing `isUserRectorOnUpcomingWeekend()` pattern from `actions/roster.ts` as reference
- Server-side check determines if TODO section should render

**TODO Configuration Object:**

- Define TODO items in a configuration object/array in `lib/team-todos/config.ts`
- Configuration structure for each TODO:
  ```typescript
  {
    id: string,                           // Unique identifier
    label: string,                        // Display text
    href: string | null,                  // URL or null for disabled
    tooltip?: string,                     // Tooltip text for disabled items
    params?: (weekend, user) => string,   // Function to generate URL params if needed
    checkCompletion?: (data: {            // Optional: Check if TODO is complete
      user: User,
      weekend: Weekend,
      weekendRosterId: string
    }) => Promise<boolean> | boolean
  }
  ```
- Example configurations:
  - **Payment TODO**: Include `params` function to generate URL with weekend_id parameter
  - **Team info TODO** (future): Add `checkCompletion` callback that queries `weekend_roster_team_info` table
- Developers can easily add new TODOs by adding to this configuration array

**Completion Status Logic:**

- Parent component (server or client) is responsible for determining completion state:
  1. For each TODO item, call its `checkCompletion` callback if defined
  2. If callback returns `true`, TODO is complete
  3. If callback returns `false` or is undefined, TODO is incomplete
  4. Pass completion state as props: `completionState: Record<string, boolean>`
- Child TODO components receive completion state as props and render accordingly
- No client-side state management or localStorage needed

**Disabled Item Behavior:**

- Disabled items (href is null) should not be actual `<a>` tags (use `<span>` or `<button disabled>`)
- Include `aria-disabled="true"` for accessibility
- Tooltip on hover: Use shadcn/ui Tooltip component showing the tooltip text from config
- Cursor should show "not-allowed" on disabled items
- Active links should be normal `<a>` or Next.js `<Link>` components

**Performance Considerations:**

- Weekend roster check happens server-side (no extra client queries)
- Completion callbacks may be async (database queries) - consider caching/memoization
- TODO section is small component with minimal re-renders
- Consider server-side rendering completion state if all callbacks can run server-side

**Future Integration Notes:**

- When team info form is implemented (spec 0002), update TODO configuration for item #1:
  - Enable the link (change `href` from `null` to `/team-info`)
  - Add `checkCompletion` callback that queries `weekend_roster_team_info` table:
    ```typescript
    checkCompletion: async ({ weekendRosterId }) => {
      // Check if weekend_roster_team_info record exists with all required fields
      const record = await getTeamInfo(weekendRosterId)
      return record && record.church && record.past_weekend_attended && ...
    }
    ```
- Future enhancement: Add `checkCompletion` callback for payment TODO that checks payment records
- No code changes needed outside of configuration file when adding automatic completion checking

## Security Considerations

**Authentication & Authorization:**

- Require authentication for homepage (already handled by Supabase middleware)
- Weekend roster check ensures users only see TODOs for their assigned weekends
- No sensitive data displayed in TODO section itself

**Data Privacy:**

- Completion state is derived from backend data, not stored client-side
- No PII displayed in TODO section

**Input Validation:**

- No user input in this feature (checkboxes are non-interactive)
- Links are defined in configuration, not user-generated
- Validate that configuration URLs are internal routes only (security best practice)

**Proof Artifact Security:**

- Screenshots should not reveal other users' data
- Safe to share screenshots of TODO section (no PII)

## Success Metrics

1. **Visibility**: 100% of team members assigned to active weekends see the TODO section on homepage
2. **Engagement**: 80%+ of team members interact with at least one TODO checkbox within first week of assignment
3. **Clarity**: User feedback indicates clear understanding of required tasks
4. **Technical Performance**: TODO section loads and renders in <100ms
5. **Completion Celebration**: Users who complete all TODOs see "All Set!" alert

## Open Questions

1. **TODO Section Placement**: Should this be above or below existing "Upcoming Weekends" section? Need to review current homepage layout.
2. **Section Title**: What should we call this section? "Team Preparation Tasks", "Before the Third Team Meeting", "Action Items", or something else?
3. **Multiple Weekends Edge Case**: If user is somehow on multiple active weekends, show multiple TODO sections or merge into one?
4. **Payment URL Parameters**: What parameters does the `/payment/team-fee` page require? (weekend_id, user_id, roster_id?)
5. **Callback Execution Location**: Should completion callbacks run server-side (in page component) or client-side (in useEffect)? Server-side would be faster initial render.
6. **Callback Performance**: Should completion check callbacks be cached/memoized to avoid repeated database queries?
7. **Loading States**: Should there be a loading skeleton while completion callbacks execute, or is instant render with "incomplete" acceptable?
