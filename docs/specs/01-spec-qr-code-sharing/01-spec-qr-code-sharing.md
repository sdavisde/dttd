# 01-spec-qr-code-sharing

## Introduction/Overview

Admins need a way to share public-facing pages of the DTTD site with the community via QR codes, primarily for printing on physical handouts at events and weekends. This feature adds a dedicated admin page where admins can select a public page from a curated, searchable list and generate a high-resolution QR code that can be copied to clipboard or downloaded as an image.

## Goals

- Provide admins a simple, dedicated page to generate QR codes for any public-facing page in the app
- Offer a curated, human-readable, searchable list of public pages with icons for easy identification
- Support both clipboard copy and image download for generated QR codes
- Produce high-resolution QR codes suitable for print materials
- Use the current domain so QR codes work in both development and production environments

## User Stories

- **As an admin**, I want to quickly generate a QR code for any public page so that I can include it on printed handouts for community events.
- **As an admin**, I want to search through available pages by name so that I can find the right page without memorizing URL paths.
- **As an admin**, I want to download the QR code as a high-resolution image so that it prints clearly on physical materials.
- **As an admin**, I want to copy the QR code to my clipboard so that I can paste it directly into documents or messages.

## Demoable Units of Work

### Unit 1: QR Code Page with Page Selector

**Purpose:** Give admins a dedicated page in the admin portal with a searchable dropdown of all public pages, establishing the foundation of the feature.

**Functional Requirements:**

- The system shall add a "QR Codes" page accessible from the admin sidebar navigation
- The system shall display a curated list of public pages in a searchable dropdown/combobox component
- Each option in the list shall display a human-readable page name and an icon (using Lucide icons consistent with the rest of the admin UI)
- The dropdown shall be filterable by typing to search page names
- The page shall be accessible to all authenticated admin users (no special permissions required)

**Proof Artifacts:**

- Screenshot: Admin sidebar showing the new "QR Codes" navigation item demonstrates the page is integrated into admin navigation
- Screenshot: The QR Codes page with the searchable page selector open, showing human-readable page names with icons, demonstrates the curated page list works

### Unit 2: QR Code Generation and Output Actions

**Purpose:** Generate a QR code from the selected page and provide copy-to-clipboard and download actions, completing the end-to-end feature.

**Functional Requirements:**

- The system shall generate a standard black-and-white QR code when a page is selected from the dropdown
- The QR code shall encode an absolute URL using the current domain (e.g., `window.location.origin` + the page path)
- The system shall display the generated QR code as a preview on the page
- The user shall be able to copy the QR code image to their clipboard via a "Copy" button
- The user shall be able to download the QR code as a high-resolution PNG image via a "Download" button
- The downloaded image shall be named descriptively (e.g., `qr-sponsor-page.png`)

**Proof Artifacts:**

- Screenshot: A generated QR code displayed on the page with Copy and Download buttons demonstrates end-to-end generation
- Screenshot: Scanning the generated QR code with a phone camera navigates to the correct page demonstrates the QR code encodes the correct URL

## Non-Goals (Out of Scope)

1. **QR code customization**: No color, size, or branding options — standard black/white only
2. **Persistence/history**: QR codes are generated on-the-fly; no saved history or database storage
3. **Custom URL input**: Only curated public pages are available; no free-text URL entry
4. **Analytics/tracking**: No scan tracking or analytics on QR code usage
5. **Bulk generation**: No batch generation of multiple QR codes at once

## Design Considerations

- Use the existing admin page layout pattern (AdminBreadcrumbs header, content area with padding)
- Use the shadcn/ui `Combobox` (or `Command` + `Popover`) pattern for the searchable page selector
- Each page option should show a Lucide icon and a friendly display name (e.g., "Sponsor a Candidate" not "/sponsor")
- The QR code preview should be prominently displayed in the center of the page once a page is selected
- Copy and Download buttons should be placed directly below the QR code preview
- Follow the existing admin page responsive patterns (the QR code page content is simple enough that a single-column layout works for both desktop and mobile)

## Repository Standards

- Use shadcn/ui components exclusively (no other UI libraries)
- Follow the existing admin page patterns: server component page with client component children as needed
- Add the nav item to `lib/admin/navigation.ts` using the existing `AdminNavElement` structure
- Add the icon to the `iconMap` in both `components/admin/sidebar/index.tsx` and `app/admin/page.tsx`
- Use TypeScript with strict typing throughout
- QR code generation should be client-side only (no server action needed since there's no persistence)

## Technical Considerations

- **QR code library**: Use a lightweight client-side QR code generation library (e.g., `qrcode` or `react-qr-code`). Evaluate options for canvas/SVG output that supports both clipboard copy and high-resolution PNG download.
- **Clipboard API**: Use the `navigator.clipboard.write()` API with a `ClipboardItem` containing a PNG blob for image copying. This requires a secure context (HTTPS or localhost).
- **Download**: Convert the QR code to a canvas, export as a high-resolution PNG blob, and trigger a download via a temporary anchor element.
- **Page list maintenance**: The curated list of public pages and their display names/icons should be defined in a single configuration file for easy updates as pages are added or removed.

## Security Considerations

- No sensitive data involved — QR codes encode public page URLs only
- The page should be protected behind admin authentication (same as all `/admin` routes, handled by existing middleware)
- No API keys or external services needed for client-side QR generation

## Success Metrics

1. **Usability**: Admin can generate and download a QR code in under 10 seconds (3 interactions: navigate to page, select page, click download)
2. **Print quality**: Downloaded QR code scans reliably when printed at standard handout sizes
3. **Correctness**: 100% of generated QR codes resolve to the intended page URL

## Open Questions

No open questions at this time.
