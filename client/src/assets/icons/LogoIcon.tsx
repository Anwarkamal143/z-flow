import { cn } from '@/lib/utils'

type Props = React.SVGProps<SVGSVGElement>

const LogoIcon = (props: Props) => {
  const { className, ...rest } = props
  return (
    <svg
      id='logo-35'
      viewBox='0 0 50 39'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('h-[39] w-[50]', className)}
      {...rest}
    >
      <title>Logo Icon</title>

      <path
        d='M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z'
        className='ccompli1'
        fill='#007AFF'
      />
      <path
        d='M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z'
        className='ccustom'
        fill='#312ECB'
      />
    </svg>
  )
}
export default LogoIcon
