type Props = React.SVGProps<SVGSVGElement>
const EmailIcon = (props: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='currentColor'
      stroke='currentColor'
      className='absolute right-2 h-[18px] w-[18px]'
      viewBox='0 0 682.667 682.667'
      {...props}
    >
      <title>Email Icon</title>
      <defs>
        <clipPath id='a' clipPathUnits='userSpaceOnUse'>
          <path d='M0 512h512V0H0Z'></path>
        </clipPath>
      </defs>
      <g clipPath='url(#a)' transform='matrix(1.33 0 0 -1.33 0 682.667)'>
        <path
          fill='none'
          strokeMiterlimit='10'
          strokeWidth='40'
          d='M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z'
        ></path>
        <path d='M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z'></path>
      </g>
    </svg>
  )
}

export default EmailIcon
