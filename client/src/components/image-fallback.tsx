'use client'
import Placeholder from '@/assets/icons/placeholder'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import Dataloader from './loaders'

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
  const [imgSrc, setImgSrc] = useState(src)
  const fallbackCheck = FallBack && typeof FallBack == 'string'

  useEffect(() => {
    if (src && src.trim() != '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgSrc(src)
      setHasError(false)
      setIsLoaded(false)
      return
    }
    if (fallbackCheck) {
      setImgSrc(FallBack as string)
      return
    }
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
    console.log('ërror', alt)
    if (fallbackCheck && FallBack != imgSrc) {
      setImgSrc(FallBack as string)
      return
    }
    setHasError(true)
    onError?.(imgSrc)
    setIsLoaded(true)
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
