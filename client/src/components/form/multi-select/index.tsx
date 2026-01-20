'use client'


import { forwardRef, ReactNode, Ref } from 'react'
import {
  Controller,
  FieldValues,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form'
import FormMultiSelectFormComponent, { FormMultiSelectProps } from './multi-select-form-component'
import MultiSelect, {
  IMultiSelectCompnentProps,
} from './multi-select-component'

/* -------------------------------- Types -------------------------------- */
type IProps<IS_HOOK> =  {isFormComponent?: IS_HOOK} & (IS_HOOK extends true ?  FormMultiSelectProps<FieldValues> : IMultiSelectCompnentProps)

/* ----------------------------- Component ---------------------------- */
const MultiSelectComp = <T extends boolean = false>(
  props: IProps<T>,
  ref: Ref<HTMLButtonElement>,
) => {
  const {


    placeholder = 'Select options',

    isFormComponent = false,
    ...rest
  } = props
if (isFormComponent) {
  return (
    <FormMultiSelectFormComponent
      name={rest.name}
      placeholder={placeholder}
      {...rest}
    />
  )
}
return <MultiSelect name={rest.name} placeholder={placeholer} {...rest} />

}

export const MultiSelect = forwardRef(MultiSelectComp) as <T extends FieldValues>(
  props: FormMultiSelectProps<T> & { ref?: Ref<HTMLButtonElement> },
) => ReturnType<typeof MultiSelectComp>

export default  MultiSelect
