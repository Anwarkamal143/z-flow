import { Controller, useFormContext } from 'react-hook-form'
import { BaseSelect, BaseSelectProps } from './base-select'

export type IFormSelectProps = Omit<BaseSelectProps, 'name'> & { name: string }

const SelectFormComp = (props: IFormSelectProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={props.name}
      control={control}
      defaultValue={props.defaultValue}
      render={({ field, fieldState }) => {
        return (
          <BaseSelect
            {...field}
            error={fieldState.error?.message}
            {...props}
            onValueChange={field.onChange}
          />
        )
      }}
    />
  )
}

export default SelectFormComp
