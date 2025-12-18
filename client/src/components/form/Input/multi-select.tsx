'use client'

import { MultiSelect, MultiSelectProps } from '@/components/multi-select'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { forwardRef, ReactNode, Ref } from 'react'
import {
  Controller,
  FieldValues,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form'
import FieldHelperText from './FieldHelperText'

/* -------------------------------- Types -------------------------------- */
export type FormMultiSelectProps<T extends FieldValues> =
  UseControllerProps<T> & {
    label?: ReactNode
    labelClass?: string
    helperText?: ReactNode
    options: MultiSelectProps['options']
    loading?: boolean
    selectProps?: Omit<MultiSelectProps, 'options'>
    placeholder?: string
  }

/* ----------------------------- Component ---------------------------- */
const FormMultiSelectInner = <T extends FieldValues>(
  props: FormMultiSelectProps<T>,
  ref: Ref<HTMLButtonElement>,
) => {
  const {
    name,
    label,
    labelClass,
    helperText,
    options,
    selectProps,
    placeholder = 'Select options',
    loading = false,
    defaultValue,
  } = props

  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Field>
          {label && (
            <FieldLabel className={cn('text-sm font-medium', labelClass)}>
              {label}
            </FieldLabel>
          )}

          <FieldContent>
            <MultiSelect
              {...selectProps}
              ref={ref}
              options={options}
              placeholder={loading ? 'Loading...' : placeholder}
              onValueChange={field.onChange}
              defaultValue={field.value ?? []}
            />
            {(helperText || fieldState.error) && (
              <FieldDescription className='mt-1 ml-0.5 text-xs'>
                {helperText && (
                  <FieldHelperText helperText={helperText} name={name} />
                )}
                {fieldState.error && (
                  <FieldError className='text-red-500'>
                    {fieldState.error.message}
                  </FieldError>
                )}
              </FieldDescription>
            )}
          </FieldContent>
        </Field>
      )}
    />
  )
}

export const FormMultiSelect = forwardRef(FormMultiSelectInner) as <
  T extends FieldValues,
>(
  props: FormMultiSelectProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReturnType<typeof FormMultiSelectInner>

export default FormMultiSelect
