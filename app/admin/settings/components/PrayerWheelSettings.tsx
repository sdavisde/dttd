'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import {
  updateSetting,
  MENS_PRAYER_WHEEL_URL,
  WOMENS_PRAYER_WHEEL_URL,
  type PrayerWheelUrls,
} from '@/services/settings'
import { isErr } from '@/lib/results'

interface PrayerWheelSettingsProps {
  prayerWheelUrls: PrayerWheelUrls
}

const urlSchema = z.url('Must be a valid URL')

const formSchema = z.object({
  mens: urlSchema,
  womens: urlSchema,
})

type FormValues = z.infer<typeof formSchema>

const SETTING_KEYS: Record<keyof FormValues, string> = {
  mens: MENS_PRAYER_WHEEL_URL,
  womens: WOMENS_PRAYER_WHEEL_URL,
}

export function PrayerWheelSettings({
  prayerWheelUrls,
}: PrayerWheelSettingsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mens: prayerWheelUrls.mens,
      womens: prayerWheelUrls.womens,
    },
    mode: 'onChange',
  })

  async function handleBlurSave(name: keyof FormValues) {
    const valid = await form.trigger(name)
    if (!valid) return

    const value = form.getValues(name)
    const defaultValue =
      name === 'mens' ? prayerWheelUrls.mens : prayerWheelUrls.womens
    if (value === defaultValue) return

    const result = await updateSetting({ key: SETTING_KEYS[name], value })
    if (isErr(result)) {
      toast.error(`Failed to save: ${result.error}`)
      return
    }
    toast.success('Saved.')
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="mens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Men&apos;s Prayer Wheel URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  onBlur={() => {
                    field.onBlur()
                    handleBlurSave('mens')
                  }}
                />
              </FormControl>
              <FormDescription>
                Will be presented to women in the community on the home page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="womens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Women&apos;s Prayer Wheel URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  {...field}
                  onBlur={() => {
                    field.onBlur()
                    handleBlurSave('womens')
                  }}
                />
              </FormControl>
              <FormDescription>
                Will be presented to men in the community on the home page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
