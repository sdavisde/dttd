# 01-tasks-homepage-team-todos.md

## Tasks

### [x] 1.0 Create Server Action to Check Team Member Status on Active Weekend

#### 1.0 Proof Artifact(s)

- CLI: `yarn build` completes successfully demonstrates no TypeScript errors
- Code snippet: Server action `isUserOnActiveWeekendRoster()` exported from `actions/roster.ts` demonstrates function signature and logic
- Test execution: Manual test by calling action with authenticated user returns correct boolean demonstrates function works correctly

#### 1.0 Tasks

TBD

### [ ] 2.0 Create TODO Configuration System

#### 2.0 Proof Artifact(s)

- CLI: `yarn build` completes successfully demonstrates no TypeScript errors
- Code snippet: Configuration object in `lib/team-todos/config.ts` showing all three TODO items with structure demonstrates configuration is complete
- Code snippet: TypeScript types exported from `lib/team-todos/types.ts` demonstrates type safety for configuration

#### 2.0 Tasks

TBD

### [ ] 3.0 Build TODO UI Components (Item and Section)

#### 3.0 Proof Artifact(s)

- CLI: `yarn build` completes successfully demonstrates no TypeScript errors
- Screenshot: Storybook or isolated component test showing unchecked TODO item demonstrates base state rendering
- Screenshot: Component test showing checked TODO item with strikethrough and muted styling demonstrates completion state
- Screenshot: Component test showing disabled TODO item with tooltip demonstrates placeholder behavior
- Screenshot: Component test showing "All Set!" alert demonstrates celebration state

#### 3.0 Tasks

TBD

### [ ] 4.0 Integrate TODO Section into Homepage with Conditional Rendering

#### 4.0 Proof Artifact(s)

- Screenshot: Homepage with TODO section visible for authenticated team member on active weekend demonstrates conditional display works
- Screenshot: Homepage without TODO section for non-team-member user demonstrates conditional hiding works
- Screenshot: Clicking "Complete team payment" navigates to `/payment/team-fee?weekend_id=XXX` demonstrates link functionality
- Screenshot: Clicking "Review Job Description" navigates to `/files` page demonstrates files link functionality
- Screenshot: Hovering over disabled "Complete team information sheet" shows "Coming soon" tooltip demonstrates disabled state
- CLI: `yarn build` completes successfully demonstrates no production errors
- Browser console: No React warnings or errors demonstrates clean implementation

#### 4.0 Tasks

TBD
