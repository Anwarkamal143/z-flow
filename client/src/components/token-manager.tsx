'use client'

import { useTokenRefresher } from '@/hooks/useTokenRefresher'

export default function TokenManager() {
  useTokenRefresher()

  return null // invisible background component
}
