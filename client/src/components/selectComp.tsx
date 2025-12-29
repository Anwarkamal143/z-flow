import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SelectProps } from '@radix-ui/react-select'
import React from 'react'
type ISelectProps = SelectProps & {
  groups?: Array<{
    options: Array<{ value: string; label: React.ReactNode; icon?: IconProp }>
    label: React.ReactNode
    id: string | number
  }>
  options?: Array<{ value: string; label: React.ReactNode; icon?: IconProp }>
  placeholder?: string | { title: string; icon: IconProp }
}

function renderSelectValue(
  placeholder?: ISelectProps['placeholder'],
  className = 'w-full',
) {
  if (!placeholder) return <SelectValue placeholder={'Select a value'} />
  if (typeof placeholder == 'string') {
    return <SelectValue placeholder={placeholder} />
  }
  const { icon, title = 'Select a value' } = placeholder
  // JSX element: <CircleIcon />
  if (React.isValidElement(icon)) {
    return <SelectValue icon={icon} placeholder={title} />
  }

  // Component: CircleIcon
  const Icon = icon
  return (
    <SelectValue icon={<Icon className={className} />} placeholder={title} />
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
  groups,
  defaultValue,
  placeholder,
  ...rest
}: ISelectProps) => {
  const getOptions = () => {
    if (options?.length) {
      return options.map((op) => (
        <SelectItem value={op.value} key={op.value}>
          {renderIcon(op.icon)}
          {op.label}
        </SelectItem>
      ))
    }
    return groups?.map((g) => (
      <SelectGroup key={g.id}>
        <SelectLabel>{g.label}</SelectLabel>
        {g.options.map((op) => (
          <SelectItem value={op.value} key={op.value}>
            {renderIcon(op.icon)}

            {op.label}
          </SelectItem>
        ))}
      </SelectGroup>
    ))
  }
  if (!options?.length && !groups?.length) {
    return null
  }

  return (
    <Select defaultValue={defaultValue} {...rest}>
      <SelectTrigger className='w-full'>
        {renderSelectValue(placeholder)}
      </SelectTrigger>
      <SelectContent>{getOptions()}</SelectContent>
    </Select>
  )
}

export default SelectComp
