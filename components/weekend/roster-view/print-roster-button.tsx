'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

/**
 * Triggers the browser print dialog. The `@media print` rules in globals.css
 * hide the app chrome and reveal the print-only roster, so the user can print
 * to paper or "Save as PDF" with a clean, full-roster layout.
 */
export function PrintRosterButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Print</span>
    </Button>
  )
}
