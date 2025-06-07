import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material'
import { UseFormRegister, FieldValues, Path } from 'react-hook-form'

interface Option {
  value: string
  label: string
}

interface FormRadioGroupProps<T extends FieldValues> {
  name: Path<T>
  register: UseFormRegister<T>
  label: string
  options: Option[]
  required?: boolean
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  register,
  label,
  options,
  required = false,
}: FormRadioGroupProps<T>) {
  return (
    <FormControl
      required={required}
      component='fieldset'
    >
      <FormLabel component='legend'>{label}</FormLabel>
      <RadioGroup {...register(name)}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}
