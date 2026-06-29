'use client'

import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { isNil } from 'lodash'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { getCroppedWebpBlob } from '@/lib/avatar/crop-image'
import { validateAvatarFile } from '@/lib/avatar/validate-file'
import { isErr } from '@/lib/results'
import { toastError } from '@/lib/toast-error'

type AvatarCropperDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Receives the cropped 256×256 WebP blob. May be async (e.g. to upload). */
  onConfirm: (blob: Blob) => void | Promise<void>
  title?: string
  description?: string
  confirmLabel?: string
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result as string))
    reader.addEventListener('error', () =>
      reject(new Error('Could not read the selected file'))
    )
    reader.readAsDataURL(file)
  })
}

/**
 * Reusable pick → circular-crop → zoom → confirm flow. Returns a cropped 256×256
 * WebP blob to `onConfirm`; the caller decides what to do with it (upload now on
 * the profile page, or hold it until signup completes). Validation and crop
 * encoding live in `lib/avatar/*` so this component stays presentational.
 */
export function AvatarCropperDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Add your photo',
  description = 'Pick a clear photo of you, then drag and zoom so your face fills the circle.',
  confirmLabel = 'Save photo',
}: AvatarCropperDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const reset = useCallback(() => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsProcessing(false)
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        reset()
      }
      onOpenChange(next)
    },
    [onOpenChange, reset]
  )

  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      // Allow re-selecting the same file later by clearing the input value.
      event.target.value = ''
      if (isNil(file)) {
        return
      }

      const validation = validateAvatarFile(file)
      if (isErr(validation)) {
        toastError(validation.error)
        return
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        setImageSrc(dataUrl)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
      } catch (error) {
        toastError('Could not open that image. Please try another file.', {
          error,
        })
      }
    },
    []
  )

  const handleConfirm = useCallback(async () => {
    if (isNil(imageSrc) || isNil(croppedAreaPixels)) {
      return
    }

    setIsProcessing(true)
    try {
      const blob = await getCroppedWebpBlob(imageSrc, croppedAreaPixels)
      await onConfirm(blob)
      handleOpenChange(false)
    } catch (error) {
      toastError('Could not process that image. Please try again.', { error })
      setIsProcessing(false)
    }
  }, [imageSrc, croppedAreaPixels, onConfirm, handleOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isNil(imageSrc) ? (
          <div className="flex flex-col gap-3">
            <div className="bg-muted/50 text-muted-foreground rounded-md border p-3 text-sm">
              <p className="text-foreground font-medium">
                A friendly photo of just you
              </p>
              <p className="mt-1">
                This helps the community recognize you in person. Please choose
                a recent photo where your face is clearly visible and large
                enough to see &mdash; not a group shot, pet, or landscape. A
                smile is always welcome!
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="avatar-file">Choose an image</Label>
              <Input
                id="avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelected}
              />
              <p className="text-muted-foreground text-xs">
                JPEG, PNG, or WebP. Up to 5MB.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-muted relative h-64 w-full overflow-hidden rounded-md">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, areaPixels) =>
                  setCroppedAreaPixels(areaPixels)
                }
              />
            </div>
            <p className="text-muted-foreground text-center text-xs">
              Drag and zoom so your face fills the circle.
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="avatar-zoom">Zoom</Label>
              <Slider
                id="avatar-zoom"
                min={1}
                max={3}
                step={0.01}
                value={[zoom]}
                onValueChange={([next]) => setZoom(next)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isNil(imageSrc) || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
