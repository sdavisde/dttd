'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Check,
  ChevronsUpDown,
  Copy,
  Download,
  Heart,
  LogIn,
  QrCode,
  TentTree,
  type LucideIcon,
} from 'lucide-react'
import QRCode from 'qrcode'
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
import { toast } from 'sonner'

const iconMap: Record<string, LucideIcon> = {
  Heart,
  TentTree,
  LogIn,
}

/** High-resolution size for print-quality output */
const QR_SIZE = 1024

export function QrCodeGenerator() {
  const [open, setOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selectedPage = qrPages.find((page) => page.path === selectedPath)

  const generateQrCode = useCallback(async (path: string) => {
    const canvas = canvasRef.current
    if (isNil(canvas)) return

    const url = `${window.location.origin}${path}`
    await QRCode.toCanvas(canvas, url, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [])

  useEffect(() => {
    if (selectedPath !== '') {
      void generateQrCode(selectedPath)
    }
  }, [selectedPath, generateQrCode])

  const getCanvasBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current
    if (isNil(canvas)) return null

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }, [])

  const handleCopy = useCallback(async () => {
    const blob = await getCanvasBlob()
    if (isNil(blob)) return

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    toast.success('QR code copied to clipboard')
  }, [getCanvasBlob])

  const handleDownload = useCallback(async () => {
    const blob = await getCanvasBlob()
    if (isNil(blob) || isNil(selectedPage)) return

    const slug = selectedPage.label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${slug}.png`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('QR code downloaded')
  }, [getCanvasBlob, selectedPage])

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

      {selectedPath === '' ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <QrCode className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a page above to generate a QR code
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            className="max-h-64 max-w-64 rounded-lg border bg-white p-2"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function PageIcon({ iconName }: { iconName: string }) {
  const Icon = iconMap[iconName]
  if (isNil(Icon)) return null
  return <Icon className="h-4 w-4" />
}
