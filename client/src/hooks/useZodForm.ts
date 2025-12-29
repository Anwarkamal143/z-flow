// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
// import { z } from "zod";

// /**
//  * A reusable hook that sets up react-hook-form with Zod schema validation.
//  *
//  * @param schema - Zod schema for form validation
//  * @param props - Additional props passed to useForm
//  */
// import { FieldValues } from "react-hook-form";

// export default function useZodForm<
//   TSchema extends z.ZodTypeAny,
//   TFieldValues extends FieldValues = z.infer<TSchema> & FieldValues
// >(
//   props: Omit<UseFormProps<TFieldValues>, "resolver"> & {
//     schema: TSchema;
//   }
// ): UseFormReturn<TFieldValues> {
//   return useForm<TFieldValues>({
//     ...props,
//     resolver: zodResolver(props.schema as z.ZodType<any, any, any>),
//   });
// }

import { ExtractHookOptions } from '@/queries/v1/types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DeepPartial,
  DeepPartialSkipArrayKey,
  FieldValues,
  Path,
  Resolver,
  useForm,
  UseFormProps,
  UseFormReturn,
  useWatch,
  UseWatchProps,
} from 'react-hook-form'
import { z } from 'zod'

/**
 * A reusable hook that sets up react-hook-form with Zod schema validation.
 *
 * @param schema - Zod schema for form validation
 * @param props - Additional props passed to useForm
 */

type DefaultFromNames<
  TFieldValues,
  TNames extends readonly (keyof TFieldValues)[] | keyof TFieldValues,
> = TNames extends readonly (keyof TFieldValues)[]
  ? DeepPartial<Pick<TFieldValues, TNames[number]>>
  : TNames extends keyof TFieldValues
    ? DeepPartial<Pick<TFieldValues, TNames>>
    : never

type WatchReturn<
  TFieldValues,
  TNames extends readonly (keyof TFieldValues)[] | keyof TFieldValues,
> = TNames extends readonly (keyof TFieldValues)[]
  ? Pick<TFieldValues, TNames[number]>
  : TNames extends keyof TFieldValues
    ? TFieldValues[TNames]
    : never

type WatchUseReturn<
  TFieldValues,
  TNames extends readonly (keyof TFieldValues)[] | keyof TFieldValues,
> = TNames extends readonly (keyof TFieldValues)[]
  ? Pick<TFieldValues, TNames[number]>
  : TNames extends keyof TFieldValues
    ? Pick<TFieldValues, TNames>
    : never

type UseWatchPropsInfer<
  T extends FieldValues,
  Names extends (keyof T)[] | keyof T,
> = Omit<UseWatchProps<T>, 'name' | 'defaultValue' | 'compute'> & {
  name: Names
  defaultValue?: DeepPartialSkipArrayKey<T>
  compute?: (values: any, formValues: WatchUseReturn<T, Names>) => any
}
export default function useZodForm<
  TSchema extends z.ZodTypeAny,
  TFieldValues extends FieldValues = z.infer<TSchema> & FieldValues,
>(
  props: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
    schema: TSchema
  },
): UseFormReturn<TFieldValues> & {
  watchValus: <T extends (keyof TFieldValues)[] | keyof TFieldValues>(
    names: T,
    defaultValue?: DefaultFromNames<TFieldValues, T>,
  ) => WatchReturn<TFieldValues, T>
  useWatchValues: <T extends (keyof TFieldValues)[] | keyof TFieldValues>(
    props: UseWatchPropsInfer<TFieldValues, T>,
  ) => DeepPartialSkipArrayKey<WatchReturn<TFieldValues, T>> & {
    data: WatchUseReturn<TFieldValues, T>
  }
} {
  const { schema, ...rest } = props

  // Explicitly cast the resolver to match expected type

  const resolver = zodResolver(schema as any) as unknown as Resolver<
    TFieldValues,
    unknown,
    TFieldValues
  >
  const form = useForm<TFieldValues>({
    ...rest,
    resolver,
  })
  const watchValus = <T extends (keyof TFieldValues)[] | keyof TFieldValues>(
    names: T,
    defaultValue?: DefaultFromNames<TFieldValues, T>,
  ): WatchReturn<TFieldValues, T> => {
    return form.watch(names as any, defaultValue) as WatchReturn<
      TFieldValues,
      T
    >
  }

  const useWatchValues = <
    T extends (keyof TFieldValues)[] | keyof TFieldValues,
  >(
    props: UseWatchPropsInfer<TFieldValues, T>,
  ) => {
    const resp = useWatch({
      ...props,
      name: props.name as Path<TFieldValues>[],
      control: form.control,
      compute: (values: ExtractHookOptions<UseWatchProps['compute']>) => {
        const obj: any = {}
        if (typeof props.name == 'string') {
          obj[props.name] = values
          props.compute?.(values, obj)
          return obj
        }
        if (Array.isArray(props.name)) {
          props.name.map((n: keyof TFieldValues, i: number) => {
            obj[n] = values[i]
          })
        }
        props.compute?.(values, obj)
        return obj
      },
    })
    return { ...resp, data: { ...resp } }
  }

  return { ...form, watchValus, useWatchValues }
}
