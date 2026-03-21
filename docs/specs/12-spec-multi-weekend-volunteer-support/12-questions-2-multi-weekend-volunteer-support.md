# 12 Questions Round 2 - Multi-Weekend Volunteer Support

Please answer each question below. These follow up on your answer that forms and fees only need to be completed once for a volunteer serving both weekends.

---

## 1. What Does "Once" Mean — Per Group, or Forever?

If a spiritual director serves on a group this year (both men's and women's), completes forms, and then serves again on a group next year — do they need to re-complete forms for the second group?

- [x] (A) Once per weekend group — forms reset each time they serve a new group (most likely)
- [ ] (B) Once per year — forms are valid for the calendar year regardless of how many groups
- [ ] (C) Once ever — once completed, never need to redo them
- [ ] (D) Other (describe)

---

## 2. Where Should Forms and Payment Live If Not Per-Weekend-Assignment?

If a volunteer on both weekends only fills out forms and pays once, those records can't meaningfully belong to one specific roster row over the other. The cleanest place to attach them is to the person's participation in the **weekend group** itself — not either individual weekend.

This would mean introducing a new concept: a "group roster" record that says "this person is serving in this group" — which is where forms and payment attach. The individual `weekend_roster` rows would just track which specific weekend(s) and what role.

- [ ] (A) Yes — introduce a `weekend_group_roster` record (user + group) as the anchor for forms and payment; individual `weekend_roster` rows just hold role/rollo info
- [x] (B) No — keep forms and payment on one of the individual `weekend_roster` rows; the second row just inherits completion state from the first. When forms or payments are added, both rows are updated. Kept in sync.
- [ ] (C) Other (describe)

---

## 3. Single-Weekend Volunteers — How Are They Affected?

Most volunteers only serve one of the two weekends in a group (e.g., a Table Leader on the men's weekend only). Under the new model:

- [x] (A) They still get a `weekend_group_roster` record (just with one `weekend_roster` underneath it) — uniform model for everyone
- [ ] (B) Only cross-weekend volunteers get a `weekend_group_roster`; single-weekend volunteers keep working exactly as today
- [ ] (C) Other (describe)

---

## 4. Weekend Number — Confirm Behavior

In Round 1 you said the `number` (e.g., "Group 47") should move to the `weekend_groups` table and weekends themselves only need a type (MENS/WOMENS). The service layer would derive a label like "Group 47 — Men's" from the combination.

Does that mean:

- [x] (A) Yes — `number` is removed from the `weekends` table and exists only on `weekend_groups`; each weekend just has a `type` and belongs to a group
- [ ] (B) Keep `number` on both — `weekend_groups` has the group number, and individual weekends optionally retain a separate identifier
- [ ] (C) Other (describe)
