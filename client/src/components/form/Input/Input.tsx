'use client'

import { BaseInput, BaseInputProps, IComponentType } from './base-input'

const InputComponent = <T extends IComponentType>(props: BaseInputProps<T>) => {
  const error = props.error != null ? props.error?.trim() : undefined
  return <BaseInput {...props} error={error} />
}

export default InputComponent
