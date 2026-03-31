# Task 2.0 Proof Artifacts - Curated Public Pages Config and Page Selector

## Curated Pages Config

### `lib/admin/qr-pages-config.ts`

15 curated public pages with human-readable labels and Lucide icon names:

| Label                 | Path                            | Icon          |
| --------------------- | ------------------------------- | ------------- |
| Sponsor a Candidate   | /sponsor                        | Heart         |
| Candidate List        | /candidate-list                 | ClipboardList |
| Review Candidates     | /review-candidates              | UserCheck     |
| Community Roster      | /roster                         | Users         |
| Current Weekend       | /current-weekend                | TentTree      |
| Team Forms            | /team-forms                     | FileText      |
| Camp Waiver           | /team-forms/camp-waiver         | FileSignature |
| Commitment Form       | /team-forms/commitment-form     | FilePen       |
| Statement of Belief   | /team-forms/statement-of-belief | BookOpen      |
| Release of Claim      | /team-forms/release-of-claim    | FileCheck     |
| Team Info Sheet       | /team-forms/info-sheet          | ClipboardPen  |
| Team Fee Payment      | /payment/team-fee               | DollarSign    |
| Candidate Fee Payment | /payment/candidate-fee          | CreditCard    |
| Files                 | /files                          | Folder        |
| Secuela Sign In       | /secuela-signin                 | LogIn         |

## Searchable Page Selector

### `app/admin/qr-codes/qr-code-generator.tsx`

- Client component using shadcn/ui Command + Popover pattern (combobox)
- Each page option displays a Lucide icon and human-readable label
- Search/filter by typing page names
- Check mark indicates currently selected page
- Selection state managed via React useState

## Lint Output

```
✖ 1 problem (0 errors, 1 warning)
```

Only pre-existing React Compiler warning — no new issues.

## Verification

- Combobox opens with searchable list of all 15 curated public pages
- Each option shows its Lucide icon and friendly display name
- Typing in search input filters the list by page name
- Selecting a page updates the trigger button to show the selected page name and icon
- Screenshots to be captured when dev server is running
