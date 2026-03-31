'use client'

import { useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronsUpDown,
  ClipboardList,
  ClipboardPen,
  CreditCard,
  DollarSign,
  FileCheck,
  FilePen,
  FileSignature,
  FileText,
  Folder,
  Heart,
  LogIn,
  TentTree,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { qrPages } from '@/lib/admin/qr-pages-config'
import { isNil } from 'lodash'

const iconMap: Record<string, LucideIcon> = {
  Heart,
  ClipboardList,
  UserCheck,
  Users,
  TentTree,
  FileText,
  FileSignature,
  FilePen,
  BookOpen,
  FileCheck,
  ClipboardPen,
  DollarSign,
  CreditCard,
  Folder,
  LogIn,
}

export function QrCodeGenerator() {
  const [open, setOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')

  const selectedPage = qrPages.find((page) => page.path === selectedPath)

  return (
    <div className="flex flex-col items-center gap-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full max-w-sm justify-between"
          >
            {!isNil(selectedPage) ? (
              <span className="flex items-center gap-2">
                <PageIcon iconName={selectedPage.icon} />
                {selectedPage.label}
              </span>
            ) : (
              'Select a page...'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Search pages..." />
            <CommandList>
              <CommandEmpty>No page found.</CommandEmpty>
              <CommandGroup>
                {qrPages.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={page.label}
                    onSelect={() => {
                      setSelectedPath(
                        page.path === selectedPath ? '' : page.path
                      )
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedPath === page.path ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <PageIcon iconName={page.icon} />
                    {page.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function PageIcon({ iconName }: { iconName: string }) {
  const Icon = iconMap[iconName]
  if (isNil(Icon)) return null
  return <Icon className="h-4 w-4" />
}
