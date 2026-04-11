# 13 Questions Round 1 - Roster Builder

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Roster Slot Template

Currently, roles are assigned ad-hoc (no predefined "template" of how many of each role a weekend needs). The mock data uses ~58 slots across 10 categories. **How should the roster builder know which positions to show?**

- [ ] (A) Hardcode a standard template (e.g., always 1 Rector, 1 Head, 1 Asst Head, 15 Table Leaders, 3 Prayers, etc.) that every weekend uses
- [ ] (B) Let the rector define the slots they need (add/remove positions dynamically)
- [ ] (C) Keep it free-form like today — no predefined slots, just a list of assigned people, and the rector adds people one at a time picking their role
- [x] (D) Start with a standard template (A) but allow the rector to add/remove slots as needed. I think for each group, we can assume there will always be 1 head of that position (if applicable) then at least 1 non-head versino of that role. For now, I really like what the template has done to start - we just need to make sure its intuitive how to add new positions to a group if needed.
- [ ] (E) Other (describe)

## 2. Community Pool — Who appears in the "Browse Community" panel?

The master roster is computed by joining `users` with `users_experience`. **Which users should the rector see as available to assign?**

- [ ] (A) All registered users in the system (filtered to match the weekend's gender — men for Men's weekend, women for Women's weekend)
- [ ] (B) Only users who attended secuela (have `attends_secuela = true` on the active weekend group)
- [x] (C) All users, but with secuela attendees highlighted/prioritized at the top
- [ ] (D) Only users who have served on at least one past weekend (have entries in `users_experience`)
- [ ] (E) Other (describe)

## 3. "Wants to Serve" Signal

The mock data has a `wantsToServe` flag. In reality, the only signal I found is `attends_secuela` on `weekend_group_members`. **Is "attends secuela" the same as "wants to serve," or is there a separate concept?**

- [x] (A) Yes, attending secuela IS the "wants to serve" signal — if they came to secuela, they want to serve
- [ ] (B) No, there should be a separate "wants to serve" flag captured somewhere (describe where/how)
- [ ] (C) Neither — the rector just knows from personal relationships who wants to serve, no system flag needed
- [ ] (D) Other (describe)

## 4. "Rector Ready" — How is this determined?

The mock data has an `isRectorReady` boolean. **How should the system determine if someone is rector-ready?**

- [ ] (A) Computed from experience: must have served as Head or Assistant Head at least once (check `users_experience` for those roles)
- [ ] (B) Computed from a more specific set of criteria (describe the exact requirements)
- [ ] (C) Manually flagged by someone (e.g., admin sets a "rector ready" flag on the user)
- [ ] (D) Not needed for this feature — remove it from the UI
- [x] (E) Other (describe) use the `calculateRectorReadyStatus ` check we use in the master roster

## 5. "Has Been Section Head" — Derived from experience?

For Head/Asst Head eligibility, the mock checks `hasBeenSectionHead`. **Should this be derived by checking if any past `users_experience` row has a `Head *` role (e.g., Head Tech, Head Music, Head Prayer, etc.)?**

- [ ] (A) Yes, derive from `users_experience` — any past role starting with "Head" counts
- [x] (B) Yes, but only specific head roles count (list which ones). Every "Head" role except for head spiritual director, head CHA, or assistant head cha. Should be a whitelist we can edit later if needed. In general, "warnings" like this in the UI are very helpful and it would be good to implement this in an extendable fashion in case we need more warnings in the future derived from user data.
- [ ] (C) This should be a manually managed flag
- [ ] (D) Other (describe)

## 6. "Has Given a Rollo" — Derived from experience?

For Head/Asst Head eligibility, the mock checks `hasGivenRollo`. **Should this be derived by checking if any `users_experience` row has a non-null `rollo` field?**

- [x] (A) Yes, derive from `users_experience` — any non-null rollo means they've given a rollo.
- [ ] (B) No, there's a different way to determine this (describe)
- [ ] (C) Other (describe)

## 7. Saving Assignments — Behavior

When the rector assigns someone to a role from this page:

- [ ] (A) Save immediately (each assignment is persisted as soon as the rector clicks "assign") — creates `weekend_roster` row + `weekend_group_members` row if needed
- [ ] (B) Batch save — rector builds the roster in-memory and clicks "Save" to persist all changes at once
- [ ] (C) Auto-save with undo — save immediately but show a toast with "Undo" option for a few seconds
- [x] (D) Other (describe) - I think we're going to need some way for rectors to start placing people on the roster without being "finalized". Maybe a new table called `draft_weekend_roster` that can be used to let rectors start to build their roster without changing the downstream user experience until the rector has marked the user as accepted.

## 8. Access Control — Who can use this page?

- [x] (A) Only the Rector of the active weekend (check their `cha_role` on `weekend_roster`)
- [ ] (B) Rector + Backup Rector
- [ ] (C) Rector + Backup Rector + Head + Assistant Head
- [ ] (D) Anyone with `WRITE_TEAM_ROSTER` permission (which includes Rector, Head, Asst Head, and Roster role)
- [ ] (E) Other (describe)

## 9. Navbar Item

How should the roster builder appear in the navigation?

- [ ] (A) Show as "Roster Builder" under "Current Weekend" dropdown, only visible to users who have access (per Q8)
- [ ] (B) Show as "DTTD #45 Men's Roster Builder" (with specific weekend label) as a top-level nav item, only for authorized users
- [ ] (C) Show as a top-level nav item labeled "Roster Builder" for authorized users
- [x] (D) Other (describe) Option A and also the homepage should show a link to it for rectors.

## 10. Weekend Scope

When the rector opens the page, which weekend's roster do they see?

- [ ] (A) Automatically show the weekend matching their gender (Men's rector sees Men's roster, Women's rector sees Women's roster)
- [ ] (B) Show both weekends with tabs to switch (like the existing roster page)
- [x] (C) Show only the weekend(s) they are assigned to as Rector
- [ ] (D) Other (describe) if the

## 11. Removing Roster Members

When the rector removes someone from a slot:

- [ ] (A) Set their `weekend_roster.status` to `'drop'` (soft delete — preserves history, matches existing pattern)
- [ ] (B) Delete the `weekend_roster` row entirely (hard delete)
- [ ] (C) Ask for confirmation before removing, then soft delete
- [x] (D) Other (describe) If a user has not accepted the permission, just remove the draft roster record without validation. If they had accepted, we should prompt the rector using a Menu with either "Dropped" or "Remove", so the Rector has some control over whether the user dropped or not (maybe they just want to move them to another position, or the Rector made a mistake before)

## 12. Existing Roster Members

The active weekend likely already has some people assigned via the current admin flow. **Should the roster builder show these existing assignments?**

- [x] (A) Yes, show all current assignments as pre-filled slots that can be changed/removed. There should be no difference between how this page stores data vs the current /roster page. The only difference is the information we show in the design, and how the user adds team members to the roster / finds them.
- [ ] (B) Yes, show them but mark them as "locked" (can't be changed from this page)
- [ ] (C) Other (describe)

## 13. Gender Filtering for Shared Volunteers

Some volunteers serve on BOTH Men's and Women's weekends (like Christopher Wilson and Matthew Thomas in the seed data). **How should these be handled?**

- [x] (A) Show all eligible members regardless — if someone is already assigned to the other weekend in the same group, show a badge indicating this but still allow assignment
- [ ] (B) Filter to only show members matching the weekend's gender, but make exceptions for members already serving on both
- [ ] (C) Only show members matching the weekend gender — cross-gender serving is handled separately
- [ ] (D) Other (describe)

## 14. Any Additional Features?

Is there anything else the rector needs on this page that we haven't covered?

- [ ] Notes/comments per assignment (e.g., "John prefers morning shifts")
- [ ] Export roster to PDF/print
- [ ] Share roster link with the team
- [ ] Track who confirmed their availability
- [ ] Other (describe)
