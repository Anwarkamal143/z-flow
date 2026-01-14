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
import { ISwitchProps, Switch } from '@/components/ui/switch'
import { ITextAreaPrpops, Textarea } from '@/components/ui/textarea'
import FieldHelperText from './FieldHelperText'

/* ---------------------------------- styles --------------------------------- */

const inputVariants = cva(
  'rounded-none bg-transparent! border-input focus-visible:border-primary focus-visible:ring-primary/50 dark:focus-visible:ring-ring/50 dark:focus-visible:border-ring',
  {
    variants: {
      rounded: {
        sm: 'rounded-sm px-2',
        md: 'rounded-md px-2',
        lg: 'rounded-lg px-2',
        full: 'rounded-full px-2',
      },
      border: {
        bottom:
          'border-0  shadow-none border-b border-b-input hover:border-b-primary focus-visible:border-b-primary focus-visible:ring-0',
        top: 'border-0 shadow-none border-t border-t-input hover:border-t-primary focus-visible:border-t-primary focus-visible:ring-0',
        left: 'border-0 shadow-none border-l border-l-input hover:border-l-primary focus-visible:border-l-primary focus-visible:ring-0',
        right:
          'border-0 shadow-none border-r border-r-input hover:border-r-primary focus-visible:border-r-primary focus-visible:ring-0',
      },
      error: {
        primary: 'border-destructive ring-destructive/20',
      },
      readOnly: {
        true: `
          bg-muted/40
          text-muted-foreground
          cursor-default
          pointer-events-none
          focus-visible:ring-0
          focus-visible:border-input
          hover:border-input
        `,
      },
    },
  },
)

/* ---------------------------------- types ---------------------------------- */

export type IconProps = {
  className?: string
  onClick?: (e: MouseEvent, meta: { value: any; name: string }) => void
  meta?: Record<string, any>
  render?: (props: {
    className?: string
    onClick: (e: MouseEvent) => void
  }) => ReactNode
  Comp?: ElementType | ReactElement
}
export type ICommonProps<T> = {
  name?: string
  label?: ReactNode
  labelClass?: string
  helperText?: ReactNode
  error?: string

  leftIcon?: IconProps | ReactNode | ElementType | ReactElement
  rightIcon?: IconProps | ReactNode | ElementType | ReactElement
  prefixComponent?: IconProps | ReactNode
  suffixComponent?: IconProps | ReactNode

  border?: VariantProps<typeof inputVariants>['border']
  rounded?: VariantProps<typeof inputVariants>['rounded']
  type?: T
  readOnly?: Pick<InputProps, 'readOnly'>
}
export type IComponentType = InputProps['type'] | 'switch' | 'textarea'
export type BaseInputProps<T> = ICommonProps<T> &
  (T extends 'switch'
    ? ISwitchProps
    : T extends 'textarea'
      ? ITextAreaPrpops
      : Omit<InputProps, 'type'>)

/* -------------------------------- utilities -------------------------------- */

const isIconProps = (v: unknown): v is IconProps =>
  typeof v === 'object' && v !== null && ('render' in v || 'Comp' in v)

/* -------------------------------- component -------------------------------- */
export const ICON_COMMON_CLASSES = (extra: string) =>
  'h-[45%] absolute top-1/2 -translate-y-1/2 pointer-events-none ' + extra
export function BaseInput<T extends IComponentType = 'text'>({
  label,
  labelClass,
  helperText,
  error,
  leftIcon,
  rightIcon,
  prefixComponent,
  suffixComponent,
  border,
  rounded,
  className,
  type = 'text',

  ...rest
}: BaseInputProps<T>) {
  const isTextArea = type == 'textarea'
  const isSwitch = type == 'switch'
  const variants = inputVariants({
    border,
    rounded: border ? undefined : rounded,
    error: error ? 'primary' : undefined,
    readOnly: !!rest.readOnly,
  })

  const renderIcon = (
    icon?: IconProps | ReactNode | ElementType | ReactElement,
    position?: string,
  ) => {
    if (!icon) return null

    const baseClass = cn(
      ICON_COMMON_CLASSES(position || ''),
      'text-gray-500',
      rest.readOnly ? 'opacity-60' : 'hover:text-gray-600',
    )

    /* --------------------------------------------------
     * 1️⃣ IconProps abstraction (highest priority)
     * -------------------------------------------------- */
    if (isIconProps(icon)) {
      const { render, Comp, onClick, className, meta } = icon

      const handleClick = (e: MouseEvent) => {
        if (rest.readOnly) return
        onClick?.(e, { value: rest.value, name: rest.name as string })
      }

      const cls = cn(
        baseClass,
        onClick && 'cursor-pointer pointer-events-auto ',
        className,
      )

      if (render) {
        return render({
          className: cls,
          onClick: handleClick,
        })
      }

      if (Comp) {
        if (isValidElement(Comp)) {
          return cloneElement(Comp, {
            className: cn(cls, (Comp as any)?.props?.className),
            onClick: handleClick,
            ...meta,
          } as any)
        }

        const Component = Comp as ElementType
        return <Component className={cls} onClick={handleClick} {...meta} />
      }

      return null
    }

    /* --------------------------------------------------
     * 2️⃣ Already a React element <Icon />
     * -------------------------------------------------- */
    if (isValidElement(icon)) {
      return cloneElement(icon, {
        className: cn(baseClass, (icon as any)?.props?.className),
      } as any)
    }

    /* --------------------------------------------------
     * 3️⃣ Component type (Icon component)
     * -------------------------------------------------- */
    if (typeof icon === 'function') {
      const Component = icon as ElementType
      return <Component className={baseClass} />
    }

    /* --------------------------------------------------
     * 4️⃣ Plain ReactNode (string, fragment, etc.)
     * -------------------------------------------------- */
    return icon
  }

  const renderComponent = (comp?: IconProps | ReactNode) => {
    if (!comp) return null

    /** ✅ Plain ReactNode → render directly */
    if (!isIconProps(comp)) {
      return comp
    }

    const { render, Comp, onClick, className, meta } = comp

    const handleClick = (e: MouseEvent) => {
      onClick?.(e, { value: rest.value, name: rest.name as string })
    }

    const pointer = onClick ? 'cursor-pointer pointer-events-auto' : ''

    if (render) {
      return render({
        className: cn(pointer, className),
        onClick: handleClick,
      })
    }

    if (!Comp) return null

    /** ✅ Comp as JSX element */
    if (isValidElement(Comp)) {
      return cloneElement(Comp, {
        className: cn(pointer, className, (Comp as any)?.props?.className),
        onClick: handleClick,
        ...meta,
      } as any)
    }

    /** ✅ Comp as component type */
    const Component = Comp

    return (
      <Component
        className={cn(pointer, className)}
        onClick={handleClick}
        {...meta}
      />
    )
  }
  const isDisabled = rest.readOnly || rest.disabled
  return (
    <Field data-invalid={!!error} className='w-full'>
      {label && (
        <FieldLabel
          className={cn(
            'text-sm font-medium',
            rest.readOnly && 'text-muted-foreground',
            labelClass,
          )}
          htmlFor={isDisabled ? undefined : rest.id || rest.name}
        >
          {label}
        </FieldLabel>
      )}

      <FieldContent>
        <div className='relative flex h-full items-center'>
          {renderIcon(leftIcon, 'left-2')}
          {renderIcon(rightIcon, 'right-2')}

          {isTextArea ? (
            <Textarea
              rows={3}
              className={cn(
                variants,
                {
                  'pl-8': !!leftIcon,
                  'pr-8': !!rightIcon,
                },
                className,
              )}
              aria-invalid={!!error}
              aria-errormessage={error}
              id={rest.id || rest.name}
              {...(rest as ITextAreaPrpops)}
            />
          ) : isSwitch ? (
            <Switch
              aria-invalid={!!error}
              aria-errormessage={error}
              className={cn(
                variants,

                {
                  'pl-8': !!leftIcon,
                  'pr-8': !!rightIcon,
                },
                rest.readOnly && 'cursor-default opacity-60',

                className,
              )}
              disabled={!!isDisabled}
              id={rest.id || rest.name}
              {...(rest as ISwitchProps)}
            />
          ) : (
            <>
              {renderComponent(prefixComponent)}
              <Input
                className={cn(
                  variants,

                  {
                    'pl-8': !!leftIcon,
                    'pr-8': !!rightIcon,
                  },
                  className,
                )}
                aria-invalid={!!error}
                aria-errormessage={error}
                id={rest.id || rest.name}
                {...(rest as InputProps)}
              />
              {renderComponent(suffixComponent)}
            </>
          )}
        </div>

        <FieldDescription>
          <FieldHelperText className={`${className}`}>
            {helperText}
          </FieldHelperText>
        </FieldDescription>
        <FieldError>
          {error && <span className='text-destructive text-sm'>{error}</span>}
        </FieldError>
      </FieldContent>
    </Field>
  )
}
