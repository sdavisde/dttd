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
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { CHARole } from '@/lib/weekend/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ExperienceSection() {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <Typography variant="h3">Past Experience</Typography>
          </CardTitle>
          <CardDescription>
            Please let us know of any previous weekends you have served on
            outside of Dusty Trails
          </CardDescription>
          <Button
            onClick={() =>
              append({ cha_role: '', community_weekend: '', date: '' })
            }
            variant="outline"
            size="sm"
            className="h-8 absolute -top-2 right-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {fields.length === 0 && (
            <Typography variant="muted" className="text-sm italic">
              No external experience added. Click &quot;Add Experience&quot; to
              add entries.
            </Typography>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 rounded-md bg-muted/10 relative"
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
                          <SelectTrigger>
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
                        <Input type="month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-1 flex justify-end">
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
