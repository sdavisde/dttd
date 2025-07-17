import { Control, FieldValues, Path } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface Option {
  value: string
  label: string
}

interface FormRadioGroupProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  options: Option[]
  required?: boolean
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required = false,
}: FormRadioGroupProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className='text-destructive ml-1'>*</span>}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className='flex flex-col space-y-2'
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className='flex items-center space-x-2'
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className='text-sm font-normal cursor-pointer'
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
