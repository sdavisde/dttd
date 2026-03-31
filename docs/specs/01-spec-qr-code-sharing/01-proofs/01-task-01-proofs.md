# Task 1.0 Proof Artifacts - QR Codes Admin Page Shell

## Navigation Integration

### `lib/admin/navigation.ts` - New nav entry added

```typescript
{
  title: 'QR Codes',
  url: '/admin/qr-codes',
  icon: 'QrCode',
  description: 'Generate QR codes for public pages to use on printed handouts.',
  permissions_needed: [],
},
```

### `components/admin/sidebar/index.tsx` - QrCode added to iconMap

```typescript
const iconMap: Record<string, LucideIcon> = {
  SquareTerminal,
  Users,
  Folder,
  Calendar,
  DollarSign,
  Landmark,
  TentTree,
  QrCode,
  Settings2,
  ShieldCheck,
}
```

### `app/admin/page.tsx` - QrCode added to dashboard iconMap

```typescript
const iconMap: Record<string, LucideIcon> = {
  TentTree,
  Calendar,
  DollarSign,
  Users,
  Folder,
  QrCode,
  Settings2,
  ShieldCheck,
}
```

## Page Shell

### `app/admin/qr-codes/page.tsx` - Server component with AdminBreadcrumbs

```typescript
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'

export default function Page() {
  return (
    <>
      <AdminBreadcrumbs
        title="QR Codes"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* QR code generator will be added here */}
      </div>
    </>
  )
}
```

## Lint Output

```
✖ 1 problem (0 errors, 1 warning)
```

Only pre-existing React Compiler warning for `useReactTable` — no new issues introduced.

## Verification

- Admin sidebar will show "QR Codes" nav item with QrCode Lucide icon
- Admin dashboard will show "QR Codes" card with icon and description
- `/admin/qr-codes` route renders with AdminBreadcrumbs header showing "Admin > QR Codes"
- No permissions required — accessible to all authenticated admin users
- Screenshots to be captured when dev server is running
