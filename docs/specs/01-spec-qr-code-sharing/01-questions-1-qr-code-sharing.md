# 01 Questions Round 1 - QR Code Sharing

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Page Selection Method

How should admins choose which page to generate a QR code for?

- [x] (A) Dropdown/select list of all public pages (curated, predefined list where the options are human-readable and friendly with an icon - and searchable)
- [ ] (B) Free-text URL input where they can type/paste any path
- [ ] (C) Both — a predefined list with an option to enter a custom URL
- [ ] (D) Other (describe)

## 2. QR Code Output Actions

What should the admin be able to do with the generated QR code?

- [ ] (A) Copy QR code image to clipboard only
- [ ] (B) Download QR code as an image file only (PNG/SVG)
- [x] (C) Both copy to clipboard and download as image
- [ ] (D) Also include a "copy link" button for the plain URL
- [ ] (E) Other (describe)

## 3. QR Code Customization

Should admins be able to customize the QR code appearance?

- [x] (A) No customization — standard black/white QR code is fine
- [ ] (B) Minimal — maybe choose a size (small/medium/large)
- [ ] (C) Moderate — size + optional DTTD logo/branding in the center
- [ ] (D) Other (describe)

## 4. Where Should This Live in the Admin Portal?

Where should this feature be accessible from?

- [x] (A) Its own dedicated page in the admin sidebar (e.g., "QR Codes" or "Share Pages")
- [ ] (B) A section/card on the existing admin dashboard home page
- [ ] (C) A modal/dialog accessible from a button in the admin header or sidebar
- [ ] (D) Other (describe)

## 5. Dynamic vs. Static URLs

Should the QR codes point to absolute URLs (requiring the production domain) or relative paths?

- [ ] (A) Use the production domain (e.g., `https://dttd.org/sponsor`) — admins will primarily share these in print or at events
- [x] (B) Use the current domain (works in dev and prod) — more flexible
- [ ] (C) Let the admin configure/confirm the base URL before generating
- [ ] (D) Other (describe)

## 6. Persistence

Should generated QR codes be saved/persisted anywhere?

- [x] (A) No persistence — generate on-the-fly each time (simplest)
- [ ] (B) Save a history of generated QR codes for quick re-access
- [ ] (C) Other (describe)

## 7. Primary Use Case

What's the main scenario for sharing these QR codes? (helps inform design decisions)

- [x] (A) Printing for physical handouts at events/weekends (needs high resolution)
- [ ] (B) Sharing digitally (Slack, email, text) with community members
- [ ] (C) Both print and digital sharing
- [ ] (D) Other (describe)
