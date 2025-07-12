import React from 'react'
import { FormControl, FormControlLabel, Radio, RadioGroup, FormHelperText, FormLabel } from '@mui/material'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

interface YesNoFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  error?: string
  required?: boolean
}

export function YesNoField<T extends FieldValues>({
  name,
  control,
  label,
  error,
  required = false,
}: YesNoFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          error={!!error}
          required={required}
        >
          <FormLabel>{label}</FormLabel>
          <RadioGroup
            row
            value={field.value === true ? 'yes' : field.value === false ? 'no' : ''}
            onChange={(e) => field.onChange(e.target.value === 'yes')}
          >
            <FormControlLabel
              value='yes'
              control={<Radio />}
              label='Yes'
            />
            <FormControlLabel
              value='no'
              control={<Radio />}
              label='No'
            />
          </RadioGroup>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}
    />
  )
}
