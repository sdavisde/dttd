# 13 Questions Round 2 - Roster Builder

Based on your Round 1 answers, I have follow-up questions on a few areas. The draft roster concept (Q7) and the removal flow (Q11) introduce new mechanics that need clarity before I write the spec.

## 1. Draft Roster — Lifecycle & Storage

You mentioned a `draft_weekend_roster` table so rectors can place people without it being "finalized." I want to make sure I understand the full lifecycle:

- [ ] (A) **Draft → Accept flow**: Rector places someone in draft. The person gets notified (email? in-app?) and must "accept" the position. Once accepted, a real `weekend_roster` row is created. Draft rows that aren't accepted stay as drafts until the rector removes them or the person declines.
- [ ] (B) **Draft → Publish flow**: Rector builds the whole roster as drafts. When ready, they click "Publish" which bulk-creates `weekend_roster` rows for all drafts at once. No individual acceptance needed — the rector's decision is final.
- [x] (C) **Draft → Finalize per-person**: Rector places someone in draft, then manually "finalizes" each person one at a time (no notification to the team member, just the rector confirming their own decision). We should include some messaging to ensure the rector has personally reached out to the user and can confirm the user has accepted the position.
- [ ] (D) Other (describe the flow you envision)

## 2. Draft Roster — What triggers notification?

When someone is placed on the draft roster, should they know about it?

- [x] (A) No notification — drafts are private to the rector until finalized/published
- [ ] (B) Send a notification when drafted, asking them to accept/decline
- [ ] (C) Send a notification only when the rector finalizes/publishes their assignment
- [ ] (D) Other (describe)

## 3. Draft Roster — Coexistence with existing roster

The active weekend (DTTD #45) already has real `weekend_roster` rows from the admin flow. How should drafts and existing assignments coexist?

- [x] (A) Existing `weekend_roster` rows show as "Accepted/Finalized" in the builder. New placements from this page start as drafts. The rector can see both side-by-side. When a draft is finalized, the draft record becomes archived.
- [ ] (B) Existing assignments are imported into the draft table and everything goes through the draft flow from now on
- [ ] (C) Other (describe)

## 4. Removal — "Dropped" vs "Remove" detail

You said for accepted/finalized members: show a menu with "Dropped" or "Remove." Can you clarify the difference?

- [x] (A) **Dropped** = soft-delete (set status to `'drop'` — they were committed but left for a reason, preserved in history). **Remove** = hard-delete the `weekend_roster` row (rector made a mistake or is just rearranging, no history needed).
- [ ] (B) **Dropped** = they backed out or were removed for cause (status → `'drop'`). **Remove** = move them back to draft status so the rector can reassign them to a different slot.
- [ ] (C) Other (describe the distinction you have in mind)

## 5. Section Head Eligibility — Whitelist Confirmation

You said every "Head" role counts EXCEPT: Head Spiritual Director, Head CHA, and Assistant Head CHA. Looking at the existing `TEAM_HEAD_ROLES` constant in `lib/users/experience/calculations.ts`, it already defines this whitelist:

```
Head Tech, Head Rollista, Head Spiritual Director, Head Prayer, Head Chapel,
Head Chapel Tech, Head Music, Head Palanca, Head Table, Head Dorm,
Head Dining, Head Mobile
```

Should I use this same list but REMOVE `Head Spiritual Director` from it? (It's currently included in `TEAM_HEAD_ROLES`.) Or did you mean something different?

- [ ] (A) Yes, use `TEAM_HEAD_ROLES` minus `Head Spiritual Director` as the section head whitelist
- [x] (B) Use `TEAM_HEAD_ROLES` as-is (Head Spiritual Director DOES count as section head experience)
- [ ] (C) Other (describe)

## 6. Homepage Link for Rectors

You mentioned the homepage should show a link to the roster builder for rectors. What does the homepage currently look like for rectors, and where should this link appear?

- [x] (A) Add a prominent card/banner at the top of the homepage (e.g., "You're the Rector for DTTD #45 Men's Weekend — Build Your Roster →")
- [ ] (B) Add it to an existing section/widget on the homepage
- [ ] (C) I'll figure out the exact placement later — just note it in the spec as a requirement
- [ ] (D) Other (describe)

## 7. Slot Template — Adding Positions

You liked the template approach but want it to be intuitive to add new positions. How should adding work?

- [x] (A) An "Add Position" button at the bottom of each category column that opens a dropdown to pick a CHA role (and optionally a rollo for Table Leader slots)
- [ ] (B) An "Add Position" button that opens a dialog where you pick the category, role, and optionally rollo
- [ ] (C) A global "Add Position" button in the toolbar
- [ ] (D) Other (describe)
