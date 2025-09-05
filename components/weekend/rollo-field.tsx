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
import { Control, FieldPath } from 'react-hook-form'

interface RolloFieldProps<T extends Record<string, any>> {
  control: Control<T>
  name: FieldPath<T>
  selectedRole: string
  label?: string
  placeholder?: string
  silentLabel?: string
  description?: string
}

export function RolloField<T extends Record<string, any>>({
  control,
  name,
  selectedRole,
  label = 'Rollo',
  placeholder = 'Select a rollo or Silent',
  silentLabel = 'Silent',
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
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={silentLabel}>{silentLabel}</SelectItem>
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
