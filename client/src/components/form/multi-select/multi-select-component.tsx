'use client'

import { forwardRef, Ref } from 'react'
import MultiSelectCommonComponent, { ICommonMultiSelectProps } from './common'
import FormMultiSelect from './multi-select-form-component'

/* -------------------------------- Types -------------------------------- */
export type IMultiSelectCompnentProps = ICommonMultiSelectProps
/* ----------------------------- Component ---------------------------- */
const MultiSelect = (
  props: IMultiSelectCompnentProps,
  ref: Ref<HTMLButtonElement>,
) => {
  const {
    placeholder = 'Select options',
    ...rest
  } = props

  return (
    <MultiSelectCommonComponent
      name={rest.name}
      placeholder={placeholder}
      {...rest}
      ref={ref}
    />
  )
}

export const MultiSelectComp = forwardRef(MultiSelect)
MultiSelectComp.displayName = 'MultiSelectComp'
export default MultiSelectComp
