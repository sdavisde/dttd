'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  ChevronsUpDown,
  Copy,
  Download,
  ExternalLink,
  Heart,
  LogIn,
  QrCode,
  Share2,
  TentTree,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useShare } from '@/hooks/use-share'

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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const { share, copyLink, download, linkCopied } = useShare()

  const selectedPage = qrPages.find((page) => page.path === selectedPath)

  const getFullUrl = useCallback(
    (path: string) => `${window.location.origin}${path}`,
    []
  )

  useEffect(() => {
    if (selectedPath === '') return

    let cancelled = false
    const url = `${window.location.origin}${selectedPath}`
    void QRCode.toDataURL(url, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl)
    })

    return () => {
      cancelled = true
      setQrDataUrl(null)
    }
  }, [selectedPath])

  const getBlob = useCallback(async (): Promise<Blob | null> => {
    if (isNil(qrDataUrl)) return null

    const res = await fetch(qrDataUrl)
    return res.blob()
  }, [qrDataUrl])

  const getFileName = useCallback(() => {
    if (isNil(selectedPage)) return 'qr-code.png'
    const slug = selectedPage.label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    return `qr-${slug}.png`
  }, [selectedPage])

  const handleShare = useCallback(async () => {
    if (isNil(selectedPage)) return

    const url = getFullUrl(selectedPage.path)
    const blob = await getBlob()
    const file = !isNil(blob)
      ? new File([blob], getFileName(), { type: 'image/png' })
      : undefined

    await share({
      title: `QR Code – ${selectedPage.label}`,
      text: `Scan this QR code to visit ${selectedPage.label}`,
      url,
      file,
    })
  }, [selectedPage, getBlob, getFullUrl, getFileName, share])

  const handleCopyLink = useCallback(async () => {
    if (isNil(selectedPage)) return
    await copyLink(getFullUrl(selectedPage.path))
  }, [selectedPage, getFullUrl, copyLink])

  const handleDownload = useCallback(async () => {
    const blob = await getBlob()
    if (isNil(blob)) return
    download(blob, getFileName())
  }, [getBlob, getFileName, download])

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Page selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Page</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
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
                          selectedPath === page.path
                            ? 'opacity-100'
                            : 'opacity-0'
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

      {/* QR Code display */}
      {selectedPath === '' ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <div className="rounded-full bg-muted p-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Select a page above to generate its QR code
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="flex items-center gap-2">
              {!isNil(selectedPage) && (
                <PageIcon iconName={selectedPage.icon} />
              )}
              {selectedPage?.label}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {selectedPage?.path}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <div className="rounded-xl border bg-white p-3 shadow-sm">
              {!isNil(qrDataUrl) && (
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${selectedPage?.label}`}
                  width={224}
                  height={224}
                  unoptimized
                  className="h-48 w-48 sm:h-56 sm:w-56"
                />
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button className="flex-1" onClick={handleShare}>
                <Share2 />
                Share
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                {linkCopied ? <Check /> : <Copy />}
                {linkCopied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PageIcon({ iconName }: { iconName: string }) {
  const Icon = iconMap[iconName]
  if (isNil(Icon)) return null
  return <Icon className="h-4 w-4" />
}
