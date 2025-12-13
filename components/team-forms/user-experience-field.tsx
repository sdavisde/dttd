'use client'

import { Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { CHARole } from '@/lib/weekend/types'
import { MonthPickerPopover } from '@/components/ui/month-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TeamInfoFormValues } from './schemas'
import { RECOGNIZED_COMMUNITIES } from '@/lib/communities/whitelist'

type UserExperienceFieldProps = {
  control: Control<any>
  index: number
  baseFieldName: string
  remove: (index: number) => void
}

export function UserExperienceField({
  control,
  index,
  baseFieldName,
  remove,
}: UserExperienceFieldProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative p-4 rounded-md border mb-4 items-center">
      <div className="col-span-12 md:col-span-4">
        <FormField
          control={control}
          name={`${baseFieldName}.cha_role`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Role on weekend</FormLabel>
              <Select
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(CHARole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-12 md:col-span-3">
        <FormField
          control={control}
          name={`${baseFieldName}.community`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Community</FormLabel>
              <Select
                onValueChange={formField.onChange}
                defaultValue={formField.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Community" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(RECOGNIZED_COMMUNITIES).map(
                    ([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-12 md:col-span-2">
        <FormField
          control={control}
          name={`${baseFieldName}.weekend_number`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Weekend #</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-12 md:col-span-1 flex items-center h-full">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive/90"
          onClick={() => remove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
