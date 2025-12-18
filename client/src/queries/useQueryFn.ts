type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

const deepMerge = <T extends Record<string, any>>(
  target: T,
  ...sources: Array<DeepPartial<T>>
): T => {
  const result = { ...target }

  for (const source of sources) {
    if (!source) continue

    for (const key in source) {
      if (source[key] == null) continue

      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        sourceValue &&
        targetValue &&
        typeof sourceValue === 'object' &&
        typeof targetValue === 'object' &&
        !Array.isArray(sourceValue) &&
        !Array.isArray(targetValue)
      ) {
        // Recursive merge for nested objects
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        // Replace for primitives, arrays, or null
        result[key] = sourceValue as any
      }
    }
  }
  return result
}

const getQueryFn = <
  T extends (...args: any) => any,
  TParams = Parameters<T>[0],
  TReturn = ReturnType<T>,
>(
  method: T,
  defaultProps?: DeepPartial<TParams>,
) => {
  return (props?: DeepPartial<Parameters<T>[0]>): TReturn => {
    const mergedProps = deepMerge(
      {},
      defaultProps || {},
      props || {},
    ) as Parameters<T>[0]
    return method(mergedProps)
  }
}
export default getQueryFn
