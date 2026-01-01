import { Loader2Icon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { Button, IButtonProps } from './ui/button'

type Props = IButtonProps & {
  isloading?: boolean
  loadingText?: string
}

export default function ButtonLoader({
  isloading,
  className,
  loadingText,
  ...rest
}: Props) {
  return (
    <Button className={cn('flex cursor-pointer gap-1', className)} {...rest}>
      {isloading ? <Loader2Icon className='animate-spin' /> : null}
      {isloading && loadingText ? loadingText : rest.children}{' '}
    </Button>
  )
}
