import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material'
import { Control, FieldValues, Path, Controller } from 'react-hook-form'

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
  error?: boolean
  helperText?: string
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  options,
  required = false,
  error = false,
  helperText,
}: FormRadioGroupProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          required={required}
          component='fieldset'
          error={error}
        >
          <FormLabel component='legend'>{label}</FormLabel>
          <RadioGroup
            {...field}
            value={field.value || ''}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}
