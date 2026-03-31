# 01 Tasks - QR Code Sharing

## Tasks

### [x] 1.0 Add QR Codes page to admin navigation and create page shell

#### 1.0 Proof Artifact(s)

- Screenshot: Admin sidebar showing the new "QR Codes" navigation item with icon demonstrates the page is integrated into admin navigation
- Screenshot: Navigating to `/admin/qr-codes` renders a page with AdminBreadcrumbs and an empty content area demonstrates the route and layout work

#### 1.0 Tasks

- [x] 1.1 Add "QR Codes" entry to `adminNavItems` in `lib/admin/navigation.ts` with icon `QrCode`, url `/admin/qr-codes`, and no permissions required
- [x] 1.2 Add `QrCode` icon to the `iconMap` in `components/admin/sidebar/index.tsx` and `app/admin/page.tsx`
- [x] 1.3 Create `app/admin/qr-codes/page.tsx` server component with AdminBreadcrumbs and empty content area

### [ ] 2.0 Build the curated public pages config and searchable page selector

#### 2.0 Proof Artifact(s)

- Screenshot: The QR Codes page with the combobox open, showing human-readable page names with Lucide icons, and filtering by search text demonstrates the curated page list and search work

#### 2.0 Tasks

- [ ] 2.1 Create `lib/admin/qr-pages-config.ts` with curated list of public pages (display name, path, icon name)
- [ ] 2.2 Create `app/admin/qr-codes/qr-code-generator.tsx` client component with searchable combobox (Command + Popover) for page selection

### [ ] 3.0 Generate and display QR code with copy and download actions

#### 3.0 Proof Artifact(s)

- Screenshot: A generated QR code displayed on the page with "Copy" and "Download" buttons after selecting a page demonstrates end-to-end QR generation
- Screenshot: Scanning the downloaded QR code with a phone camera navigates to the correct page demonstrates the QR code encodes the correct URL

#### 3.0 Tasks

- [ ] 3.1 Install a QR code generation library (`qrcode` npm package)
- [ ] 3.2 Add QR code rendering, copy-to-clipboard, and download functionality to the generator component
