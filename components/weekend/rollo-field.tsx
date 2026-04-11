'use client'

import { CHARole, Rollo } from '@/lib/weekend/types'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Control, FieldPath } from 'react-hook-form'

/**
 * Sentinel value used in the Select UI to represent "no rollo."
 * This is mapped to `undefined` (which becomes `null` in the DB)
 * before the form value is set. It is NOT a real Rollo enum value.
 */
const SILENT_SENTINEL = '__silent__'

interface RolloFieldProps<T extends Record<string, any>> {
  control: Control<T>
  name: FieldPath<T>
  selectedRole: string
  label?: string
  placeholder?: string
  description?: string
}

export function RolloField<T extends Record<string, any>>({
  control,
  name,
  selectedRole,
  label = 'Rollo',
  placeholder = 'Select a rollo or Silent',
  description = 'What Rollo is this team member going to do? Select Silent if they are not doing a Rollo.',
}: RolloFieldProps<T>) {
  const shouldShowField = [
    CHARole.TABLE_LEADER.toString(),
    CHARole.SPIRITUAL_DIRECTOR.toString(),
    CHARole.HEAD_SPIRITUAL_DIRECTOR.toString(),
  ].includes(selectedRole)

  if (!shouldShowField) {
    return null
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(v) =>
              field.onChange(v === SILENT_SENTINEL ? undefined : v)
            }
            value={field.value ?? SILENT_SENTINEL}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={SILENT_SENTINEL}>Silent</SelectItem>
              {Object.values(Rollo).map((rollo) => (
                <SelectItem key={rollo} value={rollo}>
                  {rollo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
