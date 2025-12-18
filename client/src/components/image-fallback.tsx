'use client'
import Placeholder from '@/assets/icons/placeholder'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Dataloader from './loaders'

type ImageWithFallbackProps = {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
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
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const fallbackCheck = FallBack && typeof FallBack == 'string'
  const handleLoadStart = () => {
    onLoadStart?.(src)
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.(src)
  }

  const handleError = () => {
    console.log('ërror', alt)
    setHasError(true)
    onError?.(src)
    setIsLoaded(true)
  }

  const handleClick = () => {
    if (src && !hasError) onClick?.(src)
  }

  const shouldShowImg = src && !hasError && isLoaded
  const shoudShowPlaceholder = !shouldShowImg
  const getPlaceholder = () => {
    if (!shoudShowPlaceholder) {
      return null
    }
    if (fallbackCheck) {
      return (
        <img
          src={FallBack}
          alt={alt}
          className={cn('block h-full w-full', className)}
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
    if (FallBack) {
      return FallBack
    }

    return (
      <Placeholder
        className={cn('h-full w-full', className)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleClick()
        }}
      />
    )
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      className='h-full w-full'
    >
      <>
        {!isLoaded && !hasError && (
          <Dataloader className='absolute top-0 h-full w-full rounded-xl bg-gray-400/40' />
        )}
        {!shouldShowImg && shoudShowPlaceholder && getPlaceholder()}
        {/* <Placeholder
            className={cn('h-full w-full', className)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick();
            }}
          /> */}
      </>
      {src && !hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'h-full w-full',
            className,
            shouldShowImg ? 'block' : 'hidden',
          )}
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
      )}
    </div>
  )
}

export default ImageWithFallback
