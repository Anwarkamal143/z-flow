'use client'

import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import {
  cloneElement,
  ElementType,
  isValidElement,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react'
import {
  Controller,
  FieldValues,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

import { Input, InputProps } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import FieldHelperText from './FieldHelperText'

// ✅ Border variants (top, bottom, left, right)
const inputVariants = cva(
  'border-transparent rounded-none outline-none focus-visible:border-transparent px-0 ',
  {
    variants: {
      rounded: {
        sm: 'rounded-sm px-2 ',
        md: 'rounded-md px-2',
        lg: 'rounded-lg px-2',
        full: 'rounded-full px-2',
      },
      border: {
        bottom:
          'border-b border-b-input hover:border-b-inputActive focus-visible:border-b-inputActive dark:bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-b-ring',
        top: 'border-t border-t-input hover:border-t-inputActive focus-visible:border-t-inputActive dark:bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-t-ring',
        left: 'border-l border-l-input hover:border-l-inputActive focus-visible:border-l-inputActive dark:bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-l-ring',
        right:
          'border-r border-r-input hover:border-r-inputActive focus-visible:border-r-inputActive dark:bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-r-ring',
      },
    },
  },
)

type IconProps = {
  className?: string
  onClick?: (e: MouseEvent, meta: { value: any; name: string }) => void
  meta?: Record<string, any>
  render?: (props: {
    className?: string
    onClick: (e: MouseEvent) => void
  }) => ReactNode
  Icon?: ElementType | ReactElement
}

type InputFormProps = InputProps & {
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  leftIcon?: IconProps
  rightIcon?: IconProps
  border?: VariantProps<typeof inputVariants>['border']
  rounded?: VariantProps<typeof inputVariants>['rounded']
  isSwitch?: boolean
  isTextArea?: boolean
}

type FormInputProps<T extends FieldValues> = UseControllerProps<T> &
  InputFormProps

const ICON_COMMON_CLASSES = (extra: string) =>
  'h-[45%] absolute top-1/2 -translate-y-1/2 pointer-events-none ' + extra

// ✅ Reusable FormInput Component
export function FormInput<T extends FieldValues>({
  name,
  label,
  labelClass,
  helperText,
  leftIcon,
  rightIcon,
  placeholder,
  type = 'text',
  border,
  rounded,
  isSwitch = false,
  isTextArea = false,
  disabled = false,
  ...rest
}: FormInputProps<T>) {
  const { control, getValues } = useFormContext<T>()

  const renderIcon = (icon?: IconProps, position?: string) => {
    if (!icon) return null
    const { render, Icon, onClick, className, meta } = icon
    const handleClick = (e: MouseEvent) => {
      onClick?.(e, { value: getValues(name), name })
    }
    const pointer = onClick ? 'cursor-pointer pointer-events-auto' : ''

    if (render) {
      return render({
        className: cn(ICON_COMMON_CLASSES(position || ''), pointer, className),
        onClick: handleClick,
      })
    }

    if (Icon) {
      if (isValidElement(Icon)) {
        return cloneElement(Icon, {
          className: cn(
            ICON_COMMON_CLASSES(position || ''),
            pointer,
            className,
          ),
          onClick: handleClick,
          ...meta,
        } as any)
      }
      const Comp = Icon as ElementType
      return (
        <Comp
          className={cn(
            ICON_COMMON_CLASSES(position || ''),
            pointer,
            className,
          )}
          onClick={handleClick}
          {...meta}
        />
      )
    }
    return null
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error} className='w-full'>
          {label && (
            <FieldLabel className={cn('text-sm font-medium', labelClass)}>
              {label}
            </FieldLabel>
          )}

          <FieldContent>
            <div className='relative flex h-full items-center'>
              {renderIcon(leftIcon, 'left-2')}
              {renderIcon(rightIcon, 'right-2')}

              {isTextArea ? (
                <Textarea
                  disabled={disabled}
                  rows={3}
                  placeholder={placeholder}
                  className={cn(
                    border && inputVariants({ border }),
                    rounded && inputVariants({ rounded }),
                    {
                      'pl-8': !!leftIcon,
                      'pr-8': !!rightIcon,
                    },
                    rest.className,
                  )}
                  {...field}
                />
              ) : isSwitch ? (
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              ) : (
                <Input
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    border && inputVariants({ border }),
                    !border && rounded && inputVariants({ rounded }),

                    {
                      'pl-8': !!leftIcon,
                      'pr-8': !!rightIcon,
                    },
                    rest.className,
                  )}
                  autoComplete={rest.autoComplete}
                  {...field}
                />
              )}
            </div>

            <FieldDescription>
              {helperText && (
                <FieldHelperText helperText={helperText} name={name} />
              )}
              <FieldError>
                {fieldState.error?.message && (
                  <span className='text-destructive text-sm'>
                    {fieldState.error.message}
                  </span>
                )}
              </FieldError>
            </FieldDescription>
          </FieldContent>
        </Field>
      )}
    />
  )
}

export default FormInput
