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

export function ExperienceSection() {
  const { control } = useFormContext<TeamInfoFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <History />
            <Typography variant="h3">Previous Roles</Typography>
          </CardTitle>
          <CardDescription>
            Please let us know of any previous weekends you have served on
            outside of Dusty Trails.
            <br />
            If you have filled out this form in the past (paper or online),
            please only include experience you have not already told us about.
            <br />
            <i>
              This helps our leaders committee and Rectors make informed
              decisions about how to best use your experience.
            </i>
          </CardDescription>
          <Button
            onClick={() =>
              append({
                cha_role: '' as CHARole,
                community_weekend: '',
                date: '',
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
          {fields.length === 0 && (
            <Typography variant="muted" className="text-sm italic">
              No roles added. Click &quot;Add Experience&quot; to add entries.
            </Typography>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative"
            >
              <div className="col-span-12 md:col-span-4">
                <FormField
                  control={control}
                  name={`experience.${index}.cha_role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={index !== 0 ? 'sr-only md:not-sr-only' : ''}
                      >
                        Role on weekend
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                  name={`experience.${index}.community_weekend`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={index !== 0 ? 'sr-only md:not-sr-only' : ''}
                      >
                        Community & Weekend #
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="North Texas #12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-3">
                <FormField
                  control={control}
                  name={`experience.${index}.date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel
                        className={index !== 0 ? 'sr-only md:not-sr-only' : ''}
                      >
                        Date (Month/Year)
                      </FormLabel>
                      <FormControl>
                        <MonthPickerPopover
                          value={field.value}
                          onChange={field.onChange}
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
