'use client'
import Placeholder from '@/assets/icons/placeholder'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import Dataloader from './loaders'
function isValidImagePath(value?: unknown): value is string {
  if (typeof value != 'string') return false
  const v = value?.trim()
  if (v.length < 3) return false

  // allow http(s), data URLs, and relative paths
  return (
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('data:image/') ||
    v.startsWith('/') ||
    v.includes('.')
  )
}
function getFirstLetter(value?: string) {
  if (typeof value != 'string') return null
  return value?.trim()?.charAt(0)?.toUpperCase()
}
type ImageWithFallbackProps = {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  imgClassName?: string
  onLoad?: (url?: string) => void
  onLoadStart?: (url?: string) => void
  onError?: (url?: string) => void
  loadingImage?: HTMLImageElement['loading']
  onClick?: (url: string) => void
  placeholder?: React.ReactNode
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  onLoad,
  onLoadStart,
  onError,
  loadingImage,
  onClick,
  placeholder: FallBack,
  imgClassName,

  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [imgSrc, setImgSrc] = useState(isValidImagePath(src) ? src : undefined)
  const fallbackCheck = FallBack && typeof FallBack == 'string'

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false)
    setIsLoaded(false)
    if (isValidImagePath(src)) {
      setImgSrc(src)
      return
    }
    console.log(fallbackCheck, 'fallback')
    // 2️⃣ Valid fallback image string → use it
    if (fallbackCheck && isValidImagePath(FallBack)) {
      setImgSrc(FallBack)
      return
    }
    // 3️⃣ No valid image source
    setImgSrc(undefined)
    setIsLoaded(true)
    return () => {}
  }, [src, FallBack, fallbackCheck])

  const handleLoadStart = () => {
    onLoadStart?.(imgSrc)
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.(imgSrc)
  }

  const handleError = () => {
    // console.log('ërror', alt)
    // try fallback image once
    if (fallbackCheck && isValidImagePath(FallBack) && imgSrc != FallBack) {
      setImgSrc(FallBack)
      return
    }
    setHasError(true)
    setIsLoaded(true)
    onError?.(imgSrc)
  }

  const handleClick = () => {
    if (imgSrc && !hasError) onClick?.(imgSrc)
  }

  const getComponent = () => {
    if (imgSrc && !hasError) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt || ''}
          className={cn('h-full w-full', imgClassName)}
          // className={cn('h-full w-full object-cover', imgClassName)}
          loading={loadingImage}
          onLoad={handleLoad}
          onError={handleError}
          onLoadStart={handleLoadStart}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClick()
          }}
          {...props}
        />
      )
    }
    // 🔤 First letter from src
    const letterFromSrc = getFirstLetter(src)
    if (letterFromSrc) {
      return (
        <div
          className={cn(
            'bg-muted flex h-full w-full items-center justify-center rounded-full text-[90%] font-semibold',
            imgClassName,
          )}
        >
          {letterFromSrc}
        </div>
      )
    }
    // 🔤 First letter from fallback (string only)
    if (fallbackCheck) {
      const letterFromFallback = getFirstLetter(FallBack)
      if (letterFromFallback) {
        return (
          <div
            className={cn(
              'bg-muted flex h-full w-full items-center justify-center rounded-full text-[90%] font-semibold',
              imgClassName,
            )}
          >
            {letterFromFallback}
          </div>
        )
      }
    }
    if (FallBack && !fallbackCheck) {
      return FallBack
    }

    return (
      <Placeholder
        className={cn('h-full w-full', imgClassName)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleClick()
        }}
      />
    )
  }
  const showLoader = !isLoaded && !!imgSrc

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: props.width,
        height: props.height,
      }}
      className={cn('h-full w-full', className)}
    >
      <>
        {showLoader && (
          <Dataloader className='absolute top-0 h-full w-full rounded-xl bg-black/50 backdrop-blur-sm' />
        )}
        {getComponent()}
      </>
    </div>
  )
}

export default ImageWithFallback
