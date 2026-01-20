'use client'

import {
  Controller,
  FieldValues,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form'
import { BaseInput, BaseInputProps, IComponentType } from './base-input'

type FormInputProps<
  T extends FieldValues,
  K extends IComponentType,
> = BaseInputProps<K> & UseControllerProps<T>

// ✅ Reusable FormInput Component
export function FormInput<T extends FieldValues, K extends IComponentType>(
  props: FormInputProps<T, K>,
) {
  const { control } = useFormContext<T>()

  return (
    <Controller
      name={props.name}
      control={control}
      render={({ field, fieldState }) => (
        <BaseInput {...props} {...field} error={fieldState.error?.message} />
      )}
    />
  )
}

export default FormInput
