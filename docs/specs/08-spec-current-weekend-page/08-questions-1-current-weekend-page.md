# 08 Questions Round 1 - Current Weekend Page

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Page Access & Authentication

Should this page require authentication, or be fully public to anyone who visits the site?

- [ ] (A) **Fully public** - Anyone can view the page without logging in
- [x] (B) **Requires login** - User must be authenticated to view the page
- [ ] (C) **Hybrid** - Basic info is public, but some details (like candidate counts) require login
- [ ] (D) Other (describe)

## 2. "Active Weekend" Definition

What constitutes the "active" or "current" weekend to display? Looking at the existing system, weekends have a `status` field with values: PLANNING, ACTIVE, FINISHED.

- [x] (A) **Only ACTIVE status** - Show weekends explicitly marked as ACTIVE
- [ ] (B) **ACTIVE + PLANNING** - Show both planning and active weekends (community needs visibility into upcoming weekends)
- [ ] (C) **Most recent unfinished** - Automatically show the most recent weekend that isn't FINISHED
- [ ] (D) Other (describe)

## 3. Candidate Progress Bar - Count Basis

The mockup shows candidate counts like "28/42". What candidates should be included in the count?

- [x] (A) **All non-rejected** - Count all candidates except those with status 'rejected' (includes: sponsored, awaiting_forms, pending_approval, awaiting_payment, confirmed)
- [ ] (B) **Confirmed only** - Only count candidates with 'confirmed' status (paid and ready)
- [ ] (C) **Approved+** - Count confirmed + awaiting_payment (approved candidates)
- [ ] (D) Other (describe)

## 4. Candidate Progress Bar - Maximum (42)

Is 42 the fixed maximum capacity, or should this be configurable per weekend?

- [x] (A) **Fixed at 42** - The maximum is always 42 candidates per weekend
- [ ] (B) **Configurable per weekend** - Each weekend can have a different capacity (would require adding a `capacity` field to weekends table)
- [ ] (C) **Configurable globally** - Site-wide setting for all weekends
- [x] (D) Other (describe) - the maximum number of candidates that can attend a weekend is 42, but there might be more than 42 who are sponsored, and the rest go onto an imaginary "waitlist". So that bar might say "52/42" and that's valid. The bar should never go past 100% but should turn red when full.

## 5. "Prayer Wheels" Section

The mockup shows "Prayer Wheels" with links to Men's and Women's. What should these link to?

- [ ] (A) **Existing files** - Link to prayer wheel documents in the files system
- [ ] (B) **Dedicated prayer wheel page** - A separate page showing the prayer wheel (future feature)
- [ ] (C) **External link** - Links to an external resource (Google Doc, PDF, etc.)
- [ ] (D) **Exclude for now** - Don't include this section in the initial implementation
- [x] (E) Other (describe) - should render the same links used in the homepage, on the dashboard component

## 6. Events Table Schema Changes

The current `events` table has only `datetime` (single timestamp). To support multi-day events and weekend linking, we need to add fields. Which approach do you prefer?

- [ ] (A) **Add all fields** - Add `weekend_id` (optional FK), `start_datetime`, `end_datetime`, keep existing `datetime` for backwards compatibility
- [ ] (B) **Replace datetime** - Remove `datetime`, add `start_datetime` and `end_datetime`, add `weekend_id`
- [x] (C) **Minimal change** - Keep `datetime` as start, add only `end_datetime` and `weekend_id`
- [ ] (D) Other (describe)

## 7. Event Categories/Colors

The mockup shows color-coded events (green for meetings, red for weekends, blue for serenade). How should event colors/categories be handled?

- [x] (A) **Event type enum** - Add a `type` field with predefined types (meeting, weekend, serenade, etc.) each mapped to a color
- [ ] (B) **Direct color field** - Add a `color` field where admins pick the color directly
- [ ] (C) **Auto-detect** - Automatically assign colors based on event title keywords or weekend association
- [ ] (D) **Category table** - Create a separate `event_categories` table with name and color
- [ ] (E) Other (describe)

## 8. Calendar Behavior

The calendar should show the current month by default. How should users navigate between months?

- [x] (A) **Arrow navigation** - Previous/next month arrows as shown in mockup
- [ ] (B) **Full date picker** - Allow jumping to any month/year
- [ ] (C) **Smart default** - Default to the month containing the weekend start date, with arrow navigation
- [x] (D) Other (describe) - the list of events should apppear regardless of month being viewed. So if a user is viewing february and there's only 1 event on that month, the right side should still show the events in march and beyond (up to 6 months)

## 9. Calendar Event Indicators

How should multiple events on the same day be displayed on the calendar?

- [x] (A) **Stacked dots** - Multiple small colored dots stacked horizontally, like google calendar
- [ ] (B) **Single dot + count** - One dot with a small number badge if multiple events
- [ ] (C) **Color priority** - Show only the highest-priority event color (weekend > meeting > other)
- [ ] (D) Other (describe)

## 10. Mobile Responsiveness

How should the layout adapt on mobile devices?

- [ ] (A) **Stack vertically** - Calendar on top, event list below
- [x] (B) **Tabs** - Switch between calendar view and event list view
- [ ] (C) **Calendar only with modal** - Show calendar, tap date to see events in a modal
- [ ] (D) Other (describe)

## 11. Event List Scrolling Behavior

When clicking a date indicator on the calendar, what should happen?

- [x] (A) **Smooth scroll** - Smooth scroll to that event in the list on the right
- [ ] (B) **Instant jump** - Immediately jump to that event (no animation)
- [ ] (C) **Highlight only** - Highlight the event card without scrolling
- [ ] (D) **Filter** - Filter the event list to only show events on that date
- [ ] (E) Other (describe)

## 12. Event Details Display

What information should be shown for each event in the list?

- [ ] (A) **Minimal** - Title, date/time, location
- [ ] (B) **Standard** - Title, start/end date/time, location (as shown in mockup)
- [ ] (C) **Detailed** - Title, date/time range, location, description/notes field
- [x] (D) Other (describe)- same information shown for events today (title,times,location)

## 13. Empty State

What should the page show when there are no active weekends or no events?

- [x] (A) **Friendly message** - "No upcoming weekends at this time. Check back soon!"
- [ ] (B) **Next weekend preview** - Show info about the next planned weekend even if not "active"
- [ ] (C) **Historical view** - Show the most recent past weekend's information
- [ ] (D) Other (describe)

## 14. URL/Route

What should the URL path be for this page?

- [x] (A) `/current-weekend` - Explicit and clear
- [ ] (B) `/weekend` - Short and simple
- [ ] (C) `/community/weekend` - Grouped under community section
- [ ] (D) `/` (home page section) - Integrate into the existing home page rather than separate page
- [ ] (E) Other (describe)
