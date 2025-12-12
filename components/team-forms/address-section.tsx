'use client'

import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Address } from '@/lib/users/validation'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { Typography } from '@/components/ui/typography'
import { isNil } from 'lodash'
import { TeamInfoFormValues } from './schemas'

interface AddressSectionProps {
  savedAddress: Address | null
}

export function AddressSection({ savedAddress }: AddressSectionProps) {
  const { control, setValue, trigger } = useFormContext<TeamInfoFormValues>()
  const [useSavedAddress, setUseSavedAddress] = useState(!isNil(savedAddress))

  // Initialize form with saved address if available and user chooses to use it
  useEffect(() => {
    if (useSavedAddress && !isNil(savedAddress)) {
      setValue('address.addressLine1', savedAddress.addressLine1)
      setValue('address.addressLine2', savedAddress.addressLine2 || '')
      setValue('address.city', savedAddress.city)
      setValue('address.state', savedAddress.state)
      setValue('address.zip', savedAddress.zip)
      // Clear errors that might have appeared if switching back
      trigger('address')
    }
  }, [useSavedAddress, savedAddress, setValue, trigger])

  const handleModeChange = (value: string) => {
    setUseSavedAddress(value === 'saved')
  }

  return (
    <div className="space-y-6">
      {!isNil(savedAddress) && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <Typography variant="h3">Address Information</Typography>
            </CardTitle>
            <CardDescription>
              <Typography variant="muted">
                Please complete your team member profile.
              </Typography>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="saved"
              value={useSavedAddress ? 'saved' : 'new'}
              onValueChange={handleModeChange}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="saved" id="use-saved" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="use-saved"
                    className="font-medium cursor-pointer"
                  >
                    Use my saved address
                  </Label>
                  <div className="text-sm text-muted-foreground pl-1">
                    {savedAddress.addressLine1}
                    {savedAddress.addressLine2 && (
                      <>
                        <br />
                        {savedAddress.addressLine2}
                      </>
                    )}
                    <br />
                    {savedAddress.city}, {savedAddress.state} {savedAddress.zip}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="new" id="use-new" />
                <Label htmlFor="use-new" className="font-medium cursor-pointer">
                  Update my address
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {(isNil(savedAddress) || !useSavedAddress) && (
        <div className="grid gap-4 pl-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <FormField
            control={control}
            name="address.addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address.addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment, Suite, etc. (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apt 4B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="TX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="address.zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
