'use client'
import {
  useAuthAccessToken,
  useAuthRefreshToken,
  useStoreAuthActions,
} from '@/store/userAuthStore'

import { REFRESH_QUERY_KEY } from '@/config'
import { getRefreshTokens, signOut } from '@/features/auth/api'
import { decodeToken } from '@/lib'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function useTokenRefresher() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const accessToken = useAuthAccessToken()
  const refreshToken = useAuthRefreshToken()
  const authStoreActions = useStoreAuthActions()

  const router = useRouter()
  const searchParams = useSearchParams()

  function isExpired(token: string) {
    try {
      const decoded = decodeToken(token)
      if (!decoded) {
        return false
      }
      const now = Date.now() / 1000
      return decoded?.exp != null && decoded.exp < now
    } catch (e) {
      return true
    }
  }

  async function refreshTokens(cb?: () => void) {
    try {
      if (!accessToken) {
        clearInterval(intervalRef.current!)
        return
      }
      authStoreActions.setIsTokensRefreshing(true)
      const resp = await getRefreshTokens(refreshToken)
      if (resp) {
        authStoreActions.setTokens({
          ...resp,
          isRefreshing: false,
        })
        cb?.()
        return
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
      await signOut()
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      await signOut()
      console.log('Token refresh failed:', err)
    } finally {
      authStoreActions.setIsTokensRefreshing(false)
    }
  }
  function removeRefreshFlag() {
    const url = new URL(window.location.href)
    url.searchParams.delete(REFRESH_QUERY_KEY)

    router.replace(url.pathname + url.search) // FULL NAVIGATION
    router.refresh() // now server sees the UPDATED search params
  }

  useEffect(() => {
    // From server component set this key to true
    if (searchParams.get(REFRESH_QUERY_KEY) == 'true') {
      refreshTokens(() => {
        // setRefreshQueryValue(null);
        // router.refresh();

        removeRefreshFlag()
      })
    }

    return () => {}
  }, [searchParams])

  useEffect(() => {
    if (!accessToken) {
      return
    }
    intervalRef.current = setInterval(async () => {
      if (!accessToken) {
        clearInterval(intervalRef.current!)
        return
      }

      if (isExpired(accessToken)) {
        console.log('🔄 Access token expired → refreshing…')
        await refreshTokens()
      }
    }, 30_000) // check every 30 sec

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [accessToken])
  return null
}
