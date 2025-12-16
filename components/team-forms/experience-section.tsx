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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { History, Plus, Trash2 } from 'lucide-react'
import { CHARole } from '@/lib/weekend/types'
import { TeamInfoFormValues } from './schemas'
import { deleteUserExperience } from '@/actions/user-experience'
import { isErr } from '@/lib/results'
import { toast } from 'sonner'
import { isNil } from 'lodash'
import { UserExperienceField } from './user-experience-field'

export function ExperienceSection() {
  const { control, watch } = useFormContext<TeamInfoFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  })

  const handleDelete = async (experienceId: string, index: number) => {
    const result = await deleteUserExperience(experienceId)
    if (isErr(result)) {
      toast.error(result.error)
    } else {
      toast.success('Experience deleted.')
      remove(index)
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
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fields.map((field, index) => {
            const experienceItem = watch(`experience.${index}`)
            const isExisting = !isNil(experienceItem.id)
            if (isExisting) {
              return (
                <div
                  key={field.id}
                  className="col-span-1 flex items-center justify-between p-2 border rounded-md"
                >
                  <p className="font-semibold">{experienceItem.cha_role}</p>
                  <p className="text-sm text-muted-foreground">
                    {experienceItem.community} #{experienceItem.weekend_number}
                  </p>
                </div>
              )
            }

            // New item, render fields
            return (
              <div key={field.id} className="col-span-3">
                <UserExperienceField
                  control={control}
                  index={index}
                  remove={remove}
                  baseFieldName={`experience.${index}`}
                />
              </div>
            )
          })}
        </CardContent>

        <CardFooter>
          <Button
            onClick={() =>
              append({
                cha_role: '' as CHARole,
                rollo: '',
                community: 'DTTD',
                weekend_number: '',
              })
            }
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>

          {fields.length === 0 && (
            <Typography variant="muted" className="text-sm italic">
              No roles added. Click &quot;Add Experience&quot; to add entries.
            </Typography>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
