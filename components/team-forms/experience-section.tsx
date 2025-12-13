'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { History, Plus, Trash2 } from 'lucide-react'
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
import { deleteUserExperience } from '@/actions/user-experience'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import { isNil } from 'lodash'
import { getMonthString } from '@/lib/date'

export function ExperienceSection() {
  const { control, setValue, watch } = useFormContext<TeamInfoFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })

  const handleDelete = async (experienceId: string) => {
    const result = await deleteUserExperience(experienceId)
    if (isErr(result)) {
      toast.error(result.error)
    } else {
      toast.success('Experience deleted.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <History />
            <Typography variant="h3">Previous Roles</Typography>
          </CardTitle>
          <CardDescription>
            Your previously entered experience is listed below. Please add any
            weekends you have served on that are not listed.
          </CardDescription>
          <Button
            onClick={() =>
              append({
                cha_role: '' as CHARole,
                rollo: '',
                weekend_reference: '',
                served_date: '',
              })
            }
            variant="outline"
            size="sm"
            className="h-8 absolute -top-2 right-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const experienceItem = watch(`experience.${index}`)
            const isExisting = !isNil(experienceItem.id)
            console.log(experienceItem)

            if (isExisting) {
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <p className="font-semibold">{experienceItem.cha_role}</p>
                    <p className="text-sm text-muted-foreground">
                      {experienceItem.weekend_reference} -
                      {getMonthString(new Date(experienceItem.served_date))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(experienceItem.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }

            // New item, render fields
            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative"
              >
                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={control}
                    name={`experience.${index}.cha_role`}
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

                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={control}
                    name={`experience.${index}.weekend_reference`}
                    render={({ field: formField }) => {
                      return (
                        <FormItem>
                          <FormLabel>Community & Weekend #</FormLabel>
                          <FormControl>
                            <Input placeholder="DTTD #10" {...formField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>

                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={control}
                    name={`experience.${index}.served_date`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>Date (Month/Year)</FormLabel>
                        <FormControl>
                          <MonthPickerPopover
                            value={formField.value}
                            onChange={formField.onChange}
                            placeholder="Pick a date"
                            className="w-full"
                          />
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
          })}

          {fields.length === 0 && (
            <Typography variant="muted" className="text-sm italic">
              No roles added. Click &quot;Add Experience&quot; to add entries.
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
