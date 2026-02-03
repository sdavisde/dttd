# 08-spec-current-weekend-page.md

## Introduction/Overview

The Current Weekend Page provides authenticated community members with a centralized view of the active weekend(s), including candidate sponsorship progress, prayer wheel links, and an interactive event calendar. This page serves as the go-to resource for anyone wanting to stay informed about the current Tres Dias weekend activities and related events.

## Goals

- Provide community members with real-time visibility into candidate sponsorship progress for both men's and women's weekends
- Display weekend-related events in an intuitive, interactive calendar format with color-coded event types
- Enable quick access to prayer wheel signup links for both weekends
- Create a responsive experience that works well on both desktop and mobile devices
- Extend the events system to support multi-day events and weekend associations

## User Stories

- **As a community member**, I want to see how many candidates have been sponsored for each weekend so that I know how full the weekend is and whether I should encourage more sponsorships.
- **As a community member**, I want to see all events related to the current weekend in a calendar view so that I can plan my participation in sendoffs, meetings, serenades, and closing ceremonies.
- **As a community member**, I want to click on a date in the calendar and have the event list scroll to show me that event's details so that I can quickly find information about specific dates.
- **As a community member**, I want easy access to the prayer wheel signup for either weekend so that I can sign up to pray for the candidates.
- **As a mobile user**, I want to easily switch between viewing the calendar and the event list so that I can use this page effectively on my phone.

## Demoable Units of Work

### Unit 1: Database Schema Extensions for Events

**Purpose:** Extend the events table to support multi-day events, weekend associations, and event categorization for color-coding.

**Functional Requirements:**

- The system shall add an `end_datetime` column (nullable timestamp) to the `events` table to support multi-day events
- The system shall add a `weekend_id` column (nullable UUID foreign key to `weekends.id`) to the `events` table to associate events with specific weekends
- The system shall add a `type` column (enum) to the `events` table with values: `meeting`, `weekend`, `serenade`, `sendoff`, `closing`, `other`
- The system shall preserve existing events data during migration (existing `datetime` values remain unchanged)
- The system shall regenerate TypeScript types via `yarn generate` after migration

**Proof Artifacts:**

- Migration file: `supabase/migrations/[timestamp]_add_event_fields.sql` exists with correct schema changes
- CLI: `yarn generate` completes successfully and `database.types.ts` includes new `events` columns
- Database: Query `SELECT column_name FROM information_schema.columns WHERE table_name = 'events'` shows new columns

### Unit 2: Event Service Layer Updates

**Purpose:** Update the events service to support the new fields and provide queries needed for the current weekend page.

**Functional Requirements:**

- The system shall update event types to include `end_datetime`, `weekend_id`, and `type` fields
- The system shall provide a `getEventsForWeekendGroup(groupId)` function that returns all events associated with either weekend in the group
- The system shall provide a `getUpcomingEventsForPeriod(months: number)` function that returns events within the specified future time window
- The system shall include event type in all event queries for color-coding purposes
- The system shall support creating and updating events with the new fields in admin interfaces

**Proof Artifacts:**

- Code: `lib/events/types.ts` includes updated `Event` type with new fields
- Code: `services/events.ts` exports `getEventsForWeekendGroup` and `getUpcomingEventsForPeriod` functions
- Test: Manual verification that creating an event with `weekend_id` and `type` persists correctly

### Unit 3: Current Weekend Page - Header and Candidate Progress

**Purpose:** Create the authenticated page showing weekend information and candidate sponsorship progress bars.

**Functional Requirements:**

- The system shall create a new page at `/current-weekend` that requires authentication (redirect to login if not authenticated)
- The system shall display the weekend title (e.g., "DTTD #11") and dates for both men's and women's weekends when active
- The system shall show a progress bar for each weekend displaying sponsored candidate count vs. capacity (42)
- The system shall count all candidates except those with `rejected` status toward the progress count
- The system shall display counts that exceed 42 (e.g., "52/42") but cap the visual progress bar at 100%
- The system shall change the progress bar color to red when the count reaches or exceeds 42
- The system shall show a friendly message "No upcoming weekends at this time. Check back soon!" when no active weekends exist
- The system shall display prayer wheel signup buttons for both men's and women's weekends using URLs from site settings

**Proof Artifacts:**

- URL: `/current-weekend` redirects to login when not authenticated
- URL: `/current-weekend` displays weekend header with correct dates when authenticated
- Screenshot: Progress bars showing candidate counts with appropriate colors (green under 42, red at/over 42)
- Screenshot: Prayer wheel buttons visible and linking to configured URLs

### Unit 4: Interactive Event Calendar Component

**Purpose:** Create a calendar component that displays events with color-coded indicators and supports month navigation.

**Functional Requirements:**

- The system shall display a monthly calendar view with previous/next month arrow navigation
- The system shall show colored dot indicators on dates that have events, with colors matching event types
- The system shall display multiple dots horizontally (like Google Calendar) when multiple events occur on the same day
- The system shall use consistent color mapping for event types: meeting (green), weekend (red), serenade (blue), sendoff (orange), closing (purple), other (gray)
- The system shall highlight the current date distinctly
- The user shall be able to click on a date indicator to trigger smooth scrolling to that event in the event list

**Proof Artifacts:**

- Screenshot: Calendar showing current month with colored event indicators
- Screenshot: Multiple events on same day showing horizontal stacked dots
- Video/GIF: Clicking a date indicator smoothly scrolls the event list to that event

### Unit 5: Event List Display

**Purpose:** Display upcoming events in a scrollable list with consistent styling and color-coding.

**Functional Requirements:**

- The system shall display events in chronological order by start datetime
- The system shall show events for up to 6 months into the future, regardless of which month is displayed on the calendar
- The system shall display each event with: title, date/time, and location (matching existing event card format)
- The system shall apply a colored left border or accent to each event card matching its event type
- The system shall support smooth scroll targeting via element IDs for calendar interaction
- The system shall show an appropriate empty state if no events exist for the active weekends

**Proof Artifacts:**

- Screenshot: Event list showing events in chronological order with color-coded borders
- Screenshot: Events from multiple months visible in list while calendar shows single month
- Video/GIF: Smooth scroll working when clicking calendar date indicators

### Unit 6: Mobile Responsive Layout

**Purpose:** Create a mobile-optimized layout using tabs to switch between calendar and event list views.

**Functional Requirements:**

- The system shall display side-by-side layout (calendar left, events right) on desktop (md breakpoint and above)
- The system shall display a tabbed interface on mobile with "Calendar" and "Events" tabs
- The user shall be able to switch between calendar and event list views using tabs on mobile
- The system shall maintain full functionality (date clicking, scrolling) within the mobile tab views
- The system shall ensure touch targets meet minimum 44px sizing requirements

**Proof Artifacts:**

- Screenshot: Desktop layout showing calendar and events side-by-side
- Screenshot: Mobile layout showing tabs with calendar view active
- Screenshot: Mobile layout showing tabs with event list view active
- Manual test: Tapping calendar date on mobile switches to events tab and scrolls to event

## Non-Goals (Out of Scope)

1. **Event creation/editing on this page**: Admin event management remains in the admin section; this page is read-only for community members
2. **Historical weekend viewing**: Only the currently active weekend(s) are displayed; past weekends are not accessible from this page
3. **Individual candidate details**: Only aggregate counts are shown; no candidate names or personal information is displayed
4. **Event notifications/reminders**: No push notifications or email reminders for events; this is display-only
5. **Calendar export (iCal/Google Calendar)**: Integration with external calendars is not included in this implementation
6. **Event filtering or search**: All events are displayed; no filtering by type or search functionality

## Design Considerations

Based on the provided mockup:

- **Layout**: Two-column layout on desktop with weekend info/candidates at top, calendar on left, event list on right
- **Progress Bars**: Horizontal bars with percentage fill, count displayed as "X/42" on right side
- **Calendar**: Clean grid layout matching the mockup, with clear month/year header and navigation arrows
- **Event Cards**: Bordered cards with color-coding, displaying title prominently with date/time/location below
- **Color Palette for Events**:
  - Meeting: Green (`#22c55e` / `text-green-600`)
  - Weekend: Red (`#ef4444` / `text-red-600`)
  - Serenade: Blue (`#3b82f6` / `text-blue-600`)
  - Sendoff: Orange (`#f97316` / `text-orange-600`)
  - Closing: Purple (`#a855f7` / `text-purple-600`)
  - Other: Gray (`#6b7280` / `text-gray-500`)

## Repository Standards

- Use shadcn/ui components exclusively (no Material-UI or other UI libraries)
- Follow the server actions pattern in `actions/` directory for database operations
- Use Result pattern (`Result<Error, T>`) for all server action returns
- Follow mobile-responsive guidelines from CLAUDE.md (dual layout strategy)
- Place page in `app/(public)/current-weekend/page.tsx`
- Create reusable components in `components/current-weekend/` directory
- Use existing event card patterns from `components/events/EventCard.tsx` as reference
- Follow service layer architecture: repository -> service -> actions

## Technical Considerations

- **Database Migration**: New columns added to existing `events` table must be nullable to preserve existing data
- **Event Type Enum**: Create as PostgreSQL enum type for type safety and validation
- **Foreign Key**: `weekend_id` references `weekends.id` with `ON DELETE SET NULL` to handle weekend deletion gracefully
- **Query Optimization**: Events query should filter by weekend group and date range to avoid loading unnecessary data
- **Scroll Behavior**: Use `scrollIntoView({ behavior: 'smooth' })` with element IDs for calendar-to-list interaction
- **Calendar State**: Maintain selected month in component state; event list is independent of calendar month view

## Security Considerations

- Page requires authentication via Supabase Auth middleware
- No sensitive candidate information is exposed (only aggregate counts)
- Prayer wheel URLs are fetched from site settings (already secured)
- No new API keys or credentials required

## Success Metrics

1. **Page Load Performance**: Page loads and displays data within 2 seconds on typical connections
2. **Mobile Usability**: Tab switching and calendar interactions work smoothly on mobile devices
3. **Data Accuracy**: Candidate counts match database queries for non-rejected candidates
4. **Event Visibility**: All events associated with active weekends display correctly with proper color-coding

## Open Questions

1. Should the calendar default to the current month or to the month containing the weekend start date?
2. Should clicking a date with no events do anything (e.g., show a "no events" tooltip)?
3. For multi-day events spanning across months, should dots appear on all days or just the start date?
