'use client'

import {
  BaseMultiSelect,
  MultiSelectProps,
} from '@/components/form/multi-select/base-multi-select'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { forwardRef, ReactNode, Ref } from 'react'
import FieldHelperText from '../Input/FieldHelperText'

/* -------------------------------- Types -------------------------------- */
export type ICommonMultiSelectProps = MultiSelectProps & {
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  options: MultiSelectProps['options']
  loading?: boolean
  selectProps?: Omit<MultiSelectProps, 'options'>
  placeholder?: string
  error?: string
}

/* ----------------------------- Component ---------------------------- */
const MultiSelectCommonComponent = forwardRef(
  (props: ICommonMultiSelectProps, ref: Ref<HTMLButtonElement> | undefined) => {
    const {
      label,
      labelClass,
      helperText,
      options,
      selectProps,
      placeholder = 'Select options',
      loading = false,
      onValueChange,
      error,
      value,
      defaultValue,
      ...rest
    } = props

    return (
      <Field>
        {label && (
          <FieldLabel className={cn('text-sm font-medium', labelClass)}>
            {label}
          </FieldLabel>
        )}

        <FieldContent>
          <BaseMultiSelect
            {...rest}
            {...selectProps}
            ref={ref}
            options={options}
            placeholder={loading ? 'Loading...' : placeholder}
            onValueChange={onValueChange}
            value={value || []}
            defaultValue={defaultValue}
          />
          {(helperText || error) && (
            <FieldDescription className='mt-1 ml-0.5 text-xs'>
              {helperText && <FieldHelperText>{helperText}</FieldHelperText>}
              {error && (
                <FieldError className='text-red-500'>{error}</FieldError>
              )}
            </FieldDescription>
          )}
        </FieldContent>
      </Field>
    )
  },
)
MultiSelectCommonComponent.displayName = 'MultiSelectCommonComponent'
export default MultiSelectCommonComponent
