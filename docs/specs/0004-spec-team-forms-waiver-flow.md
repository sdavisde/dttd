# 0004-spec-team-forms-waiver-flow.md

## Introduction/Overview

The Team Forms Waiver Flow provides a multi-step process for team members to complete three required waivers before attending the weekend: Statement of Belief, Commitment Form, and Release of Claim. This UI-only implementation creates the navigation flow and form structure without database persistence.

## User Story

As a leader of the DTTD community,

I want every active team member to be required to complete each of our required waivers in a step-by-step flow,

so that our whole team is aligned on the expectations for the weekend.

## Description

We have 3 required waivers as part of the team forms process:

1. Statement of believe
2. Commitment form
3. Release of Claim

As part of these, we aim to gain alignment between all team members of the expectation when volunteering for the weekend, and identify any special needs (bottom bunk, mobility issues, special diet or medications) when staying at Tanglewood christian camp.

## Acceptance Criteria

### Given: A user has clicked on "Complete team forms"

The user is immediately taken to `/team-forms/statement-of-belief` which holds the statement of belief, and has an input field for a user to sign at the bottom of the page.

### Given: A user has signed the statement of belief and pressed "Agree and Continue"

The user is taken to `/team-forms/commitment-form` which holds the team commitment form. This form requires the user to check off a slew of checkboxes with the different commitments for the weekend as a volunteer.

### Given: A user has completed the commitment-form and pressed "Agree and Continue"

The user is taken to `/team-forms/release-of-claim` which holds the release of claim paragraphs and a small form that lets the user enter any special needs necessary to attend the weekend.

### Given: A user has completed the release of claim and pressed "Agree and Continue"

The user is taken to `/team-info/info-sheet` which holds the next feature: DTTD-9

## Notes

- This ticket is for UI only - no database persistence
- Actual waiver content will need to be provided and can replace placeholder text
- The final redirect to `/team-info/info-sheet` will 404 until DTTD-9 is implemented

## Implementation Details

See [implementation_plan.md](file:///Users/sdavis/.gemini/antigravity/brain/2dedb350-0ffc-4ebc-9b52-3291e749e447/implementation_plan.md) for full technical details.

### Pages to Create

1. `app/(public)/team-forms/statement-of-belief/page.tsx`
2. `app/(public)/team-forms/commitment-form/page.tsx`
3. `app/(public)/team-forms/release-of-claim/page.tsx`

### Components to Create

1. `components/team-forms/statement-of-belief-form.tsx`
2. `components/team-forms/commitment-form-component.tsx`
3. `components/team-forms/release-of-claim-form.tsx`

### Configuration Updates

- Update `lib/weekend/team/todos.config.ts` to enable the "Complete team forms" link
