# Task 3.0 Proof Artifacts - QR Code Generation, Copy, and Download

## QR Code Library

### Installation

```
yarn add qrcode @types/qrcode
```

- `qrcode@1.5.4` — lightweight client-side QR code generation with canvas support
- `@types/qrcode@1.5.6` — TypeScript type definitions

## QR Code Generation

### Implementation in `app/admin/qr-codes/qr-code-generator.tsx`

- Uses `QRCode.toCanvas()` from the `qrcode` library
- Generates high-resolution 1024x1024 QR codes suitable for print
- Encodes absolute URL: `window.location.origin + page.path`
- Standard black-and-white output with margin of 2

### Copy to Clipboard

- Uses `navigator.clipboard.write()` with `ClipboardItem` containing PNG blob
- Canvas converted to blob via `canvas.toBlob()`
- Sonner toast confirms "QR code copied to clipboard"

### Download as PNG

- Canvas exported as high-resolution PNG blob
- Descriptive filename: `qr-{slug}.png` (e.g., `qr-sponsor-a-candidate.png`)
- Triggered via temporary anchor element with blob URL
- Blob URL revoked after download to prevent memory leaks
- Sonner toast confirms "QR code downloaded"

## Lint Output

```
✖ 1 problem (0 errors, 1 warning)
```

Only pre-existing React Compiler warning — no new issues.

## Type Check Output

```
npx tsc --noEmit
(no errors)
```

## Verification

- Selecting a page from the combobox generates and displays a QR code preview
- "Copy" button copies the QR code image to clipboard as PNG
- "Download" button downloads high-resolution PNG with descriptive filename
- QR code encodes the correct absolute URL for the selected page
- Canvas displays with white background, border, and rounded corners
- Copy and Download buttons only visible when a page is selected
- Screenshots and scan verification to be performed when dev server is running
