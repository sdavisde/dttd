'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { CHARole } from '@/lib/weekend/types'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Control, FieldPath } from 'react-hook-form'

interface ChaRoleFieldProps<T extends Record<string, any>> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  placeholder?: string
  required?: boolean
}

export function ChaRoleField<T extends Record<string, any>>({
  control,
  name,
  label = 'CHA Role',
  placeholder = 'Select a role...',
  required = false,
}: ChaRoleFieldProps<T>) {
  const [comboboxOpen, setComboboxOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && ' *'}
          </FormLabel>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {field.value ? field.value : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search roles..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    {Object.values(CHARole).map((role) => (
                      <CommandItem
                        key={role}
                        value={role}
                        onSelect={() => {
                          field.onChange(role)
                          setComboboxOpen(false)
                        }}
                      >
                        {role}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            field.value === role ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
