'use client'
import { cn } from '@/lib/utils'
// we omit the native `onSubmit` event in favor of `SubmitHandler` event
// the beauty of this is, the values returned by the submit handler are fully typed

import { ComponentProps } from 'react'
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

interface FormProps<T extends FieldValues = any> extends Omit<
  ComponentProps<'form'>,
  'onSubmit'
> {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  className?: string
}

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  ref,
  className,
  ...props
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      {/* the `form` passed here is return value of useForm() hook */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
        className={cn('border-none bg-transparent outline-none', className)}
        ref={ref as any}
      >
        {/* <fieldset
          //   We disable form inputs when we are submitting the form!! A tiny detail
          //        that is missed a lot of times
          className={cn(
            "border-none outline-none bg-transparent",
            fieldSetclassName
          )}
          disabled={form.formState.isSubmitting}
        > */}
        {children}
        {/* {React.Children.map(children, (child: any) => {
          return React.cloneElement(child, {
            disabled: form.formState.isSubmitting,
          });
        })} */}
        {/* </fieldset> */}
      </form>
    </FormProvider>
  )
}
export default Form
