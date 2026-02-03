# 08-tasks-current-weekend-page.md

This task list implements the Current Weekend Page feature as specified in `08-spec-current-weekend-page.md`.

## Tasks

### [x] 1.0 Database Schema Extensions for Events

Extend the `events` table to support multi-day events, weekend associations, and event type categorization.

#### 1.0 Proof Artifact(s)

- Migration file: `supabase/migrations/[timestamp]_add_event_fields.sql` exists with correct schema changes
- CLI: `yarn generate` completes successfully
- Code: `database.types.ts` includes new `events` columns (`end_datetime`, `weekend_id`, `type`) and `event_type` enum

#### 1.0 Tasks

- [x] 1.1 Create migration file with `event_type` enum containing values: `meeting`, `weekend`, `serenade`, `sendoff`, `closing`, `other`
- [x] 1.2 Add `end_datetime` column (nullable timestamp with time zone) to `events` table
- [x] 1.3 Add `weekend_id` column (nullable UUID) with foreign key reference to `weekends.id` with `ON DELETE SET NULL`
- [x] 1.4 Add `type` column using the `event_type` enum (nullable to preserve existing data)
- [x] 1.5 Run `yarn db:generate` to regenerate TypeScript types (requires migration to be applied to database first; types will be updated after deployment)

---

### [x] 2.0 Event Service Layer Updates

Update the events system to support the new fields and provide queries needed for the current weekend page, following the repository → service → actions pattern.

#### 2.0 Proof Artifact(s)

- Code: `lib/events/types.ts` exports `Event` type with `end_datetime`, `weekend_id`, and `type` fields
- Code: `services/events.ts` exports `getEventsForWeekendGroup` and `getUpcomingEventsForPeriod` functions
- Manual test: Creating an event with `weekend_id` and `type` via admin UI persists correctly and is queryable

#### 2.0 Tasks

- [x] 2.1 Create `lib/events/types.ts` with `Event` type, `EventType` enum, and `EventTypeValue` constants matching the database enum
- [x] 2.2 Update `services/events.ts` to use the new Event type and include new fields in all queries
- [x] 2.3 Add `getEventsForWeekendGroup(groupId: string)` function to fetch all events for a weekend group (both men's and women's weekends)
- [x] 2.4 Add `getUpcomingEventsForPeriod(months: number)` function to fetch events within a specified future time window
- [x] 2.5 Update `createEvent` and `updateEvent` functions to support `end_datetime`, `weekend_id`, and `type` fields

---

### [x] 3.0 Current Weekend Page - Header and Candidate Progress

Create the authenticated page at `/current-weekend` showing weekend information, candidate sponsorship progress bars, and prayer wheel links.

#### 3.0 Proof Artifact(s)

- New card exists on the dashboard that redirects users to the current weekend page when clicked
- URL: `/current-weekend` displays weekend header with title (e.g., "DTTD #11") and dates when authenticated
- Screenshot: Progress bars showing candidate counts (e.g., "28/42") with green color when under capacity
- Screenshot: Progress bars showing red color when count reaches or exceeds 42 (e.g., "52/42")
- Screenshot: Prayer wheel buttons visible linking to men's and women's signup URLs
- Screenshot: Empty state message "No upcoming weekends at this time. Check back soon!" when no active weekends

#### 3.0 Tasks

- [x] 3.1 Add `getCandidateCountByWeekend(weekendId)` function to candidates service to count non-rejected candidates per weekend
- [x] 3.2 Create `/current-weekend` page with authentication check and redirect to login if not authenticated
- [x] 3.3 Create `CurrentWeekendHeader` component displaying weekend title (e.g., "DTTD #11") and date ranges for both men's and women's weekends
- [x] 3.4 Create `CandidateProgressBar` component showing count/capacity (e.g., "28/42") with green color under 42 and red at/over 42
- [x] 3.5 Create `PrayerWheelButtons` component displaying prayer wheel signup buttons for both weekends using URLs from site settings
- [x] 3.6 Create `EmptyWeekendState` component showing friendly message when no active weekends exist
- [x] 3.7 Integrate all components into the current weekend page with proper data fetching
- [x] 3.8 Add "Current Weekend" card to dashboard that links to `/current-weekend`

---

### [x] 4.0 Interactive Event Calendar Component

Create a calendar component that displays events with color-coded indicators and supports month navigation with click-to-scroll functionality. Should use shadcn-ui standards

#### 4.0 Proof Artifact(s)

- Screenshot: Calendar showing current month with previous/next navigation arrows
- Screenshot: Calendar with colored dot indicators on dates that have events (green for meeting, red for weekend, blue for serenade, etc.)
- Screenshot: Multiple events on same day showing horizontal stacked dots (Google Calendar style)
- Screenshot: Current date highlighted distinctly
- Video/GIF: Clicking a date indicator triggers smooth scroll to that event in the event list

#### 4.0 Tasks

- [x] 4.1 Create `EventCalendar` component wrapper that extends shadcn/ui Calendar with event indicator support and month navigation
- [x] 4.2 Create `EventDayCell` component that renders horizontally stacked color-coded dots for events on each calendar day
- [x] 4.3 Create `getEventsGroupedByDate` utility function to group events by date string for efficient calendar lookup
- [x] 4.4 Add current date highlighting with distinct visual styling (ring or background accent)
- [x] 4.5 Implement click handler on day cells with events to trigger `onDateClick` callback for scroll-to-event functionality
- [x] 4.6 Integrate EventCalendar into CurrentWeekendView with events data fetching from `getEventsForWeekendGroup`

---

### [x] 5.0 Event List Display

Display upcoming events in a scrollable list with consistent styling, color-coded borders, and scroll targeting support.

#### 5.0 Proof Artifact(s)

- Screenshot: Event list showing events in chronological order by start datetime
- Screenshot: Events displaying title, date/time, and location (matching existing EventCard format)
- Screenshot: Color-coded left border on each event card matching event type
- Screenshot: Events from multiple months visible in list (6-month window)
- Screenshot: Empty state when no events exist for active weekends
- Video/GIF: Smooth scroll working when clicking calendar date indicators

#### 5.0 Tasks

- [x] 5.1 Create `WeekendEventCard` component in `components/current-weekend/` with color-coded left border based on event type, displaying title, date/time, and location
- [x] 5.2 Create `EventList` component that renders events in chronological order with scroll targeting support via element IDs (format: `event-{id}`)
- [x] 5.3 Create `EmptyEventsState` component showing friendly message when no events exist for active weekends
- [x] 5.4 Integrate EventList into CurrentWeekendView, connecting EventCalendar's `onDateClick` to scroll to the selected event
- [x] 5.5 Add smooth scroll behavior using `scrollIntoView({ behavior: 'smooth' })` when clicking calendar date indicators

---

### [x] 6.0 Mobile Responsive Layout

Implement mobile-optimized layout using tabs to switch between calendar and event list views while maintaining full functionality.

#### 6.0 Proof Artifact(s)

- Screenshot: Desktop layout showing calendar and events side-by-side (md breakpoint and above)
- Screenshot: Mobile layout showing tabs with "Calendar" tab active
- Screenshot: Mobile layout showing tabs with "Events" tab active
- Manual test: Tapping calendar date on mobile switches to events tab and scrolls to event
- Manual test: Touch targets meet minimum 44px sizing requirements

#### 6.0 Tasks

- [x] 6.1 Update CalendarEventSection to use shadcn/ui Tabs component for mobile layout with "Calendar" and "Events" tabs
- [x] 6.2 Implement responsive layout: side-by-side on md+ breakpoint, tabbed on mobile
- [x] 6.3 Add auto-switch to Events tab when clicking a calendar date on mobile
- [x] 6.4 Ensure touch targets meet 44px minimum sizing for mobile interactions
- [x] 6.5 Test and verify all functionality works in both desktop and mobile layouts
