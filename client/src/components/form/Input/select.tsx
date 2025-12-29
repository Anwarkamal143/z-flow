import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { SelectProps } from '@radix-ui/react-select'
import React, { ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import FieldHelperText from './FieldHelperText'
type IOptionType = { value: string; label: React.ReactNode; icon?: IconProp }
type IGroupOptionType = {
  id: string | number
  label: React.ReactNode
  options: IOptionType[]
}
type SelectOption = IOptionType | IGroupOptionType
type ISelectProps = SelectProps & {
  options?: SelectOption[]
  placeholder?: string | { title: string; icon: IconProp }
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  name: string
}

function renderSelectValue(
  placeholder?: ISelectProps['placeholder'],
  className = 'w-full',
) {
  if (!placeholder)
    return <SelectValue placeholder={'Select a value'} className='w-full' />
  if (typeof placeholder == 'string') {
    return <SelectValue placeholder={placeholder} className='w-full' />
  }
  const { icon, title = 'Select a value' } = placeholder
  // JSX element: <CircleIcon />
  if (React.isValidElement(icon)) {
    return <SelectValue icon={icon} placeholder={title} className='w-full' />
  }

  // Component: CircleIcon
  const Icon = icon
  return (
    <SelectValue
      icon={<Icon className={className} />}
      placeholder={title}
      className='w-full'
    />
  )
}
function renderIcon(icon?: IconProp, className = 'w-full') {
  if (!icon) return null

  // JSX element: <CircleIcon />
  if (React.isValidElement(icon)) {
    return icon
  }

  // Component: CircleIcon
  const Icon = icon
  return <Icon className={className} />
}
const SelectComp = ({
  options,

  defaultValue,
  placeholder,
  name,
  labelClass,
  label,
  helperText,
  ...rest
}: ISelectProps) => {
  const { control } = useFormContext()

  const isGroupOption = (op: SelectOption): op is IGroupOptionType => {
    return 'options' in op
  }
  const getOptions = () => {
    if (options?.length) {
      return options.map((op) => {
        if (isGroupOption(op)) {
          return (
            <SelectGroup key={op.id}>
              <SelectLabel>{op.label}</SelectLabel>
              {op.options.map((op) => (
                <SelectItem value={op.value} key={op.value} className='w-full'>
                  {renderIcon(op.icon)}

                  {op.label}
                </SelectItem>
              ))}
            </SelectGroup>
          )
        }

        return (
          <SelectItem value={op.value} key={op.value} className='w-full'>
            {renderIcon(op.icon)}
            {op.label}
          </SelectItem>
        )
      })
    }
  }
  if (!options?.length) {
    return null
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        return (
          <Field>
            {label && (
              <FieldLabel className={cn('text-sm font-medium', labelClass)}>
                {label}
              </FieldLabel>
            )}

            <FieldContent>
              <Select {...rest} {...field} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  {renderSelectValue(placeholder)}
                </SelectTrigger>
                <SelectContent>{getOptions()}</SelectContent>
              </Select>
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
        )
      }}
    />
  )
}

export default SelectComp
