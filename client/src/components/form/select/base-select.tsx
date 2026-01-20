'use client'
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
import FieldHelperText from '../Input/FieldHelperText'

type IconProp = React.ElementType | React.ReactElement
type IOptionType = { value: string; label: React.ReactNode; icon?: IconProp }
type IGroupOptionType = {
  id: string | number
  label: React.ReactNode
  options: IOptionType[]
}
type SelectOption = IOptionType | IGroupOptionType

export type BaseSelectProps = SelectProps & {
  options?: SelectOption[]
  placeholder?: string | { title: string; icon: IconProp }
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  error?: string
}

/** ===== Reusable Helpers ===== */
export function renderSelectValue(
  placeholder?: BaseSelectProps['placeholder'],
  className = 'w-full',
) {
  if (!placeholder)
    return <SelectValue placeholder={'Select a value'} className={className} />
  if (typeof placeholder === 'string') {
    return <SelectValue placeholder={placeholder} className={className} />
  }

  const { icon, title = 'Select a value' } = placeholder
  if (React.isValidElement(icon)) {
    return <SelectValue icon={icon} placeholder={title} className={className} />
  }

  const Icon = icon
  return (
    <SelectValue
      icon={<Icon className={className} />}
      placeholder={title}
      className={className}
    />
  )
}

export function renderIcon(icon?: IconProp, className = 'w-4 h-4 mr-2') {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  const Icon = icon
  return <Icon className={className} />
}

export function mapOptions(options?: SelectOption[]) {
  if (!options?.length) return null

  const isGroupOption = (op: SelectOption): op is IGroupOptionType =>
    'options' in op

  return options.map((op) => {
    if (isGroupOption(op)) {
      return (
        <SelectGroup key={op.id}>
          <SelectLabel>{op.label}</SelectLabel>
          {op.options.map((sub) => (
            <SelectItem value={sub.value} key={sub.value}>
              {renderIcon(sub.icon)}
              {sub.label}
            </SelectItem>
          ))}
        </SelectGroup>
      )
    }

    return (
      <SelectItem value={op.value} key={op.value}>
        {renderIcon(op.icon)}
        {op.label}
      </SelectItem>
    )
  })
}

export const BaseSelect = ({
  label,
  labelClass,
  placeholder,
  helperText,
  options,
  error,
  ...rest
}: BaseSelectProps) => {
  return (
    <Field>
      {label && (
        <FieldLabel className={cn('text-sm font-medium', labelClass)}>
          {label}
        </FieldLabel>
      )}

      <FieldContent>
        <Select {...rest}>
          <SelectTrigger className='w-full'>
            {renderSelectValue(placeholder)}
          </SelectTrigger>
          <SelectContent>{mapOptions(options)}</SelectContent>
        </Select>
        {(helperText || error) && (
          <FieldDescription className='mt-1 ml-0.5 text-xs'>
            {helperText && <FieldHelperText>{helperText}</FieldHelperText>}
            {error && <FieldError className='text-red-500'>{error}</FieldError>}
          </FieldDescription>
        )}
      </FieldContent>
    </Field>
  )
}
