import { ReactNode } from 'react'

function FieldHelperText({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  // const error = errors[name]
  if (!children) return null

  return (
    <span className={`field-helper-text text-xs ${className}`}>{children}</span>
  )
}
export default FieldHelperText
