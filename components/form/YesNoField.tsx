import React from 'react'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface YesNoFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  error?: string
  required?: boolean
}

export function YesNoField<T extends FieldValues>({
  name,
  control,
  label,
  error,
  required = false,
}: YesNoFieldProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(value === 'yes')}
              value={
                field.value === true ? 'yes' : field.value === false ? 'no' : ''
              }
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`}>No</Label>
              </div>
            </RadioGroup>
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      )}
    />
  )
}
