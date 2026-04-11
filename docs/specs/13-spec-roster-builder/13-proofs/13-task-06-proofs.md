# Task 6.0 — Navigation & Homepage Integration — Proof Artifacts

## CLI Output

### TypeScript Type Check

```
$ npx tsc --noEmit
(no errors)
```

### Lint

```
$ yarn lint
✖ 1 problem (0 errors, 1 warning)
  - 1 warning: react-hooks/incompatible-library (known useReactTable warning, not an error)
```

## Implementation Evidence

### 6.1 — Roster Builder Nav Item

Added to `components/navbar/navbar-server.tsx` under the "Current Weekend" dropdown children, before "Review Candidates":

```typescript
{
  name: 'Roster Builder',
  slug: 'roster-builder',
  permissions_needed: [Permission.WRITE_TEAM_ROSTER],
  description: 'Build and manage the weekend team roster',
  icon: 'shield',
  badge: 'restricted',
},
```

- **Permission gating**: Requires `WRITE_TEAM_ROSTER`, which is granted to Rector, Backup Rector, Head, Assistant Head, and Roster CHA roles (see `CHA_ROLE_PERMISSIONS` in `lib/security.ts`)
- **Restricted badge**: Shows amber "Restricted" badge via `mega-menu-link.tsx` rendering
- **Non-rector users**: The `filterNavElement()` function in `navbar-client.tsx` removes items the user lacks permission for, so non-rectors will not see this item

### 6.2 — Rector Homepage Banner

Added `RectorBanner` component to `app/(public)/home/dashboard.tsx`:

- Checks `user.teamMemberInfo.weekendAssignments` for an assignment with `chaRole === CHARole.RECTOR`
- If found, displays a prominent banner: "You're the Rector for DTTD #[N] [Men's/Women's] Weekend" with "Build Your Roster →" link to `/roster-builder`
- If user is not a rector (no matching assignment), component returns `null` — nothing rendered
- Uses primary color accent styling (`border-primary/30 bg-primary/5`) for visual prominence
- Shield icon matches the nav item icon for consistency

## Verification

- [x] Nav item appears under "Current Weekend" for users with WRITE_TEAM_ROSTER permission
- [x] Nav item hidden from users without WRITE_TEAM_ROSTER permission (filtered by `filterNavElement()`)
- [x] Nav item shows "Restricted" badge
- [x] Homepage banner shown only when user has Rector CHA role assignment
- [x] Homepage banner hidden for non-rector users
- [x] Banner displays correct weekend number and type (Men's/Women's)
- [x] Banner links to `/roster-builder`
- [x] `npx tsc --noEmit` passes with zero errors
- [x] `yarn lint` passes with zero errors (1 known warning)
