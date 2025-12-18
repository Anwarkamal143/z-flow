import { ReactNode } from 'react'

type Props = {
  text: ReactNode
  className?: string
}

const SeparatorText = (props: Props) => {
  const { text, className } = props
  return (
    <div className={`flex w-full items-center gap-4 ${className}`}>
      <hr className='w-full' />
      <p className='text-muted-foreground text-center text-sm'>{text}</p>
      <hr className='w-full' />
    </div>
  )
}

export default SeparatorText
