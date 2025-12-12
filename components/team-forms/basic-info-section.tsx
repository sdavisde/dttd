'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import * as React from 'react'

export function BasicInfoSection() {
  const { control, setValue, watch } = useFormContext()

  const [hasCompleted, setHasCompleted] = React.useState(
    !!watch('basicInfo.essentials_training_date') ? 'yes' : 'no'
  )

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
            <FormLabel>Which weekend did you go through Tres Dias?</FormLabel>
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Community" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DTTD">
                            Dusty Trails
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

          <div className="space-y-4">
            <FormLabel>Have you completed Essentials Training?</FormLabel>
            <RadioGroup
              value={hasCompleted}
              onValueChange={(val) => {
                setHasCompleted(val)
                if (val === 'no') {
                  setValue('basicInfo.essentials_training_date', '')
                }
              }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="training-yes" />
                <FormLabel htmlFor="training-yes" className="font-normal">
                  Yes
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="training-no" />
                <FormLabel htmlFor="training-no" className="font-normal">
                  No
                </FormLabel>
              </div>
            </RadioGroup>

            {hasCompleted === 'yes' && (
              <FormField
                control={control}
                name="basicInfo.essentials_training_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      When did you complete Essentials Training?
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}