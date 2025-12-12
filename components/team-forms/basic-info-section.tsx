'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { User, Building } from 'lucide-react'
import { MonthPickerPopover } from '@/components/ui/month-picker'
import * as React from 'react'

export function BasicInfoSection() {
  const { control } = useFormContext()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <Typography variant="h3">Basic Information</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="basicInfo.church_affiliation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Church Affiliation</FormLabel>
                <FormControl>
                  <div className="flex items-center relative">
                    <Building className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="My Church"
                      {...field}
                      className="pl-9"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Past Weekend Attended</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="basicInfo.weekend_attended.community"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Community" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DTTD">
                            Dusty Trails (DTTD)
                          </SelectItem>
                          <SelectItem value="Other">Other Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="basicInfo.weekend_attended.number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Weekend #" {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="basicInfo.weekend_attended.location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Location (City, State)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={control}
            name="basicInfo.essentials_training_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Essentials Training Completed (Month/Year)
                </FormLabel>
                <MonthPickerPopover
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick a date"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}