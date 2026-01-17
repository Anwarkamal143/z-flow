import { REFRESH_QUERY_KEY } from '@/config'
import { getQueryClient } from '@/get-query-client'
import { RequestOptions } from '@/queries/v1/types'
import { resetAllStores } from '@/store/useGlobalStore'
import { IResponseError } from '@/types/Iquery'
import { decodeJwt } from 'jose'
import { ulid } from 'ulid'
import z from 'zod'

export function _omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = {} as Omit<T, K>
  for (const key in obj) {
    if (!keys.includes(key as unknown as K)) {
      ;(result as any)[key] = obj[key]
    }
  }
  return result
}
export const stringToNumber = (strNumber?: string): number | undefined => {
  if (strNumber === null || strNumber === undefined) return undefined
  const strTypeof = typeof strNumber
  if (strTypeof !== 'string' && strTypeof !== 'number') return undefined
  if (strTypeof === 'string' && strNumber.trim() == '') return undefined
  const number = 1 * (strNumber as unknown as number)
  return isNaN(number) ? undefined : number
}
export const isArray = (args: any) => Array.isArray(args)

export const wait = async (time: number = 0) => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

export const normalizeObjectForAPI = <T>(
  object: T,
  omit: (keyof T)[] = [],
  ignore: (keyof T)[] = [],
): Partial<T> => {
  return _omit(
    object as any,
    ['created_at', 'slug', 'updated_at', 'id', 'is_deleted', ...omit].filter(
      (item) => !ignore.includes(item as keyof T),
    ),
  ) as Partial<T>
}

export function generateUUID() {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = ((dt + Math.random() * 16) % 16) | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    },
  )
  return uuid
}

export const withErrorHandler = <TArgs extends any[], TResponse>(
  handler: (...args: TArgs) => Promise<TResponse>,
): ((...args: TArgs) => Promise<TResponse>) => {
  return async (...args: TArgs) => {
    try {
      return await handler(...args)
    } catch (error: any) {
      console.error('An error occurred:', error instanceof Error, error)
      if (error.data) {
        const { message, data = {}, statusText, status } = error as any
        return {
          ...data,
          statusText,
          // result: data?.status,
          status,
          message: data?.message || message,
          success: false,
        }
      }
      return error as IResponseError<TResponse>
    }
  }
}

export const isServer = typeof window === 'undefined' || 'Deno' in globalThis

export const appSignOutCleanup = async () => {
  const client = getQueryClient()
  client.clear()
  resetAllStores()
  // 5. Navigate and refresh cleanly

  window.location.replace('/login')
}
export function capitalizeFirstLetter(str?: string) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatTimeRemaining(ms: number | null) {
  if (ms === null || !isFinite(ms) || ms < 0) return '—'
  const s = Math.ceil(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const remS = s % 60
  if (m < 60) return `${m}m ${remS}s`
  const h = Math.floor(m / 60)
  const remM = m % 60
  return `${h}h ${remM}m`
}

// Small helper to create a mock thumbnail (SVG data URL)
export function makeThumb(text: string, size = 48) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='#2e2e2e'/><text x='50' y='55' font-size='42' text-anchor='middle' fill='#ffffff' font-family='Arial' font-weight='600'>${text
    .slice(0, 2)
    .toUpperCase()}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Converts a duration string or number into seconds.
 *
 * Supports units: seconds (`s`, `sec`, `seconds`, etc.),
 * minutes (`m`, `min`, `minutes`, etc.),
 * hours (`h`, `hr`, `hours`, etc.),
 * and days (`d`, `day`, `days`).
 *
 * @param input - The duration to convert (e.g., "15m", "2 hours", 10)
 * @returns number - The duration in seconds
 */
export const parseDurationToSeconds = (input: string | number): number => {
  // If a number is passed directly, assume it's minutes
  if (typeof input === 'number') {
    return input * 60
  }

  const trimmed = input.trim().toLowerCase()

  // Regex to match duration strings with various units
  const regex =
    /^(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)$/i

  const match = trimmed.match(regex)

  if (!match) {
    throw new Error(
      `Invalid duration format: "${input}". Try "15m", "2 hours", "1.5 days", "30s", etc.`,
    )
  }

  const value = parseFloat(match[1]) // Numeric portion
  const unit = match[2] // Time unit

  switch (unit) {
    // Seconds
    case 's':
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
      return Math.floor(value)

    // Minutes
    case 'm':
    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes':
      return Math.floor(value * 60)

    // Hours
    case 'h':
    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours':
      return Math.floor(value * 60 * 60)

    // Days
    case 'd':
    case 'day':
    case 'days':
      return Math.floor(value * 24 * 60 * 60)

    default:
      throw new Error(`Unknown time unit: "${unit}"`)
  }
}

export function decodeToken(token: string) {
  const res = decodeJwt(token)
  if (res) {
    const { iat, jti, ...userData } = res
    return userData as IServerCookieType & { exp?: number }
  }
  return null
}
type OpenWindowTarget = '_blank' | '_self' | '_parent' | '_top'
export const openWindow = (
  url: string,
  target: OpenWindowTarget = '_blank',
) => {
  window.open(url, target, 'noopener,noreferrer')
}

export const optionsWithCookies = <T>(
  options: RequestOptions<T> = {},
  cookies?: string,
) => {
  const newOptions = { ...(options || {}) }
  if (!cookies) {
    return newOptions
  }
  return {
    ...newOptions,
    requestOptions: {
      ...(newOptions.requestOptions || {}),
      headers: {
        ...(newOptions.requestOptions?.headers || {}),
        cookie: cookies,
      },
    },
  } satisfies RequestOptions<T>
}
export function getValidNumber(value: unknown): null | number {
  if (value === null || value === undefined) return null

  if (typeof value === 'number') {
    const isNumber = !Number.isNaN(value) && Number.isFinite(value)
    return isNumber ? value : null
  }

  if (typeof value === 'string') {
    if (value.trim() === '') return null

    const n = Number(value)
    const isNumber = !Number.isNaN(n) && Number.isFinite(n)
    return isNumber ? n : null
  }

  return null
}

export const isNotEmpty = (value: unknown): boolean => {
  if (value == null) return false

  // string: non-whitespace characters
  if (typeof value == 'string') {
    return value.trim().length > 0
  }

  // number: finite values count as non-empty
  if (typeof value == 'number') {
    return Number.isFinite(value)
  }

  // boolean: always has a value
  if (typeof value == 'boolean') {
    return true
  }

  // array: must have at least one item
  if (Array.isArray(value)) {
    return value.length > 0
  }

  // object: must have at least one key
  if (typeof value == 'object') {
    return Object.keys(value).length > 0
  }

  return false
}

export const isAccessTokenRefresing = (params?: Record<string, any>) => {
  if (params && params?.[REFRESH_QUERY_KEY]) {
    return true
  }
  return false
}

export function generateUlid() {
  return ulid()
}
export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
  }))
}

export const removeVersionFromApiURL = (url: string) => {
  if (!url) {
    return null
  }
  try {
    const newUrl = new URL(url)

    newUrl.pathname = newUrl.pathname.replace(/\/v\d+$/, '')
    return newUrl
  } catch (error) {
    return null
  }
}
