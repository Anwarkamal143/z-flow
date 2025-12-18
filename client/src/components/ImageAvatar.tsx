import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

type Props = {
  src?: string
  fallback?: string
}

const ImageAvatar = ({ src, fallback }: Props) => {
  const fallb = (fallback || 'AB').slice(0, 1).toUpperCase()
  return (
    <Avatar className='size-10 rounded-md transition hover:opacity-75'>
      <AvatarImage alt={fallback} src={src} />
      <AvatarFallback className='rounded-md'>{fallb}</AvatarFallback>
    </Avatar>
  )
}

export default ImageAvatar
