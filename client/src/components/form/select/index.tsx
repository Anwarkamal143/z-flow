'use client'
import SelectComponent, { ISelectProps } from './select-component'
import SelectFormComp, { IFormSelectProps } from './select-form-component'
type SelectProps<IS_FORM_COMPONENT = true> = {
  isFormComponent?: IS_FORM_COMPONENT
} & (IS_FORM_COMPONENT extends true ? IFormSelectProps : ISelectProps)

const SelectComp = <IS_FORM_COMPONENT extends boolean = true>({
  isFormComponent = true as IS_FORM_COMPONENT,
  ...rest
}: SelectProps<IS_FORM_COMPONENT>) => {
  if (isFormComponent) {
    return <SelectFormComp name={rest.name as string} {...rest} />
  }
  return <SelectComponent {...rest} />
}

export default SelectComp
