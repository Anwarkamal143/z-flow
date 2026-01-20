import { BaseSelect, BaseSelectProps } from './base-select'

export type ISelectProps = Omit<BaseSelectProps, 'name'> & { name?: string }

const SelectComp = (props: ISelectProps) => {
  return <BaseSelect {...props} />
}

export default SelectComp
