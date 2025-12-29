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
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

import { Input, InputProps } from '@/components/ui/input'
import { Textarea } from './ui/textarea'

// ✅ Border variants (top, bottom, left, right)
const inputVariants = cva(
  'rounded-none focus-visible:border-primary focus-visible:ring-primary/50 dark:focus-visible:ring-ring/50 dark:focus-visible:border-ring',
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
      error: {
        primary:
          'ring-destructive/20 dark:ring-destructive/40 border-destructive',
      },
    },
    // defaultVariants: {
    //   error: "primary",
    // },
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

type InputFormProps = {
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  leftIcon?: IconProps
  rightIcon?: IconProps
  border?: VariantProps<typeof inputVariants>['border']
  rounded?: VariantProps<typeof inputVariants>['rounded']

  placeholder?: string
  error?: string
} & InputProps

type FormInputProps = InputFormProps

const ICON_COMMON_CLASSES = (extra: string) =>
  'h-[45%] absolute top-1/2 -translate-y-1/2 pointer-events-none ' + extra

const InputComponent = ({
  name,
  label,
  labelClass,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  border,
  rounded,
  disabled = false,
  error: erroMessage = '',
  placeholder,
  className,
  ...rest
}: FormInputProps) => {
  const isTextArea = type == 'textarea'
  const error = erroMessage != null ? erroMessage.trim() : undefined
  const renderIcon = (icon?: IconProps, position?: string) => {
    if (!icon) return null
    const { render, Icon, onClick, className, meta } = icon
    const handleClick = (e: MouseEvent) => {
      onClick?.(e, { value: rest.value, name: name as string })
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

  const getVariants = () => {
    const _error = error ? 'primary' : undefined
    const _rounded = !border ? rounded : undefined

    return inputVariants({ border, rounded: _rounded, error: _error })
  }
  return (
    <Field data-invalid={!!error} className={cn('w-full', className)}>
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
              className={cn(getVariants(), {
                'pl-8': !!leftIcon,
                'pr-8': !!rightIcon,
              })}
              aria-invalid={!!error}
              aria-errormessage={error}
            />
          ) : (
            /*: isSwitch ? (
            <Switch
              checked={!!rest.value}
              onCheckedChange={(e) => rest.onCheckedChange?.(e)}
              disabled={disabled}
            />
          ) : ( */
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                getVariants(),

                {
                  'pl-8': !!leftIcon,
                  'pr-8': !!rightIcon,
                },
              )}
              autoComplete={rest.autoComplete}
              {...rest}
              aria-invalid={!!error}
              aria-errormessage={error}
            />
          )}
        </div>

        <FieldDescription>
          {helperText && !error && (
            <span className={`field-helper-text text-xs`}>{helperText}</span>
          )}
        </FieldDescription>
        <FieldError>
          {!!error && <span className='text-destructive text-sm'>{error}</span>}
        </FieldError>
      </FieldContent>
    </Field>
  )
}

export default InputComponent
