'use client'

import { forwardRef, Ref } from 'react'
import {
  Controller,
  FieldValues,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form'
import MultiSelectCommonComponent, { ICommonMultiSelectProps } from './common'

/* -------------------------------- Types -------------------------------- */
export type FormMultiSelectProps<T extends FieldValues> =
  UseControllerProps<T> & Omit<ICommonMultiSelectProps, 'onValueChange'>

/* ----------------------------- Component ---------------------------- */
const MultiSelect = <T extends FieldValues>(
  props: FormMultiSelectProps<T>,
  ref: Ref<HTMLButtonElement>,
) => {
  const {
    name,

    placeholder = 'Select options',

    defaultValue,

    ...rest
  } = props

  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <MultiSelectCommonComponent
          {...field}
          error={fieldState.error?.message}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onValueChange={field.onChange}
          value={field.value}
          ref={ref}
          {...rest}
        />
      )}
    />
  )
}

export const MultiSelectFormComp = forwardRef(MultiSelect) as <
  T extends FieldValues,
>(
  props: FormMultiSelectProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReturnType<typeof MultiSelect>

export default MultiSelectFormComp
