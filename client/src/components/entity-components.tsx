import {
  AlertTriangleIcon,
  MoreVerticalIcon,
  PackageOpenIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '@/assets/icons'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Ref } from 'react'
import ButtonLoader from './button-loader'
import InputComponent from './form/Input/Input'
import Dataloader from './loaders'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardTitle } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty'

type EntityHeaderProps = {
  title: string
  description?: string
  newButtonLabel: string
  disabled?: boolean
  isCreating?: boolean
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
)

export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {
  return (
    <div className='flex flex-row items-center justify-between gap-x-4'>
      <div className='flex flex-col'>
        <h1 className='text-lg font-semibold md:text-xl'>{title}</h1>
        {description && (
          <p className='text-muted-foreground text-xs md:text-sm'>
            {description}
          </p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <ButtonLoader
          disabled={disabled || isCreating}
          isloading={isCreating}
          size={'sm'}
          onClick={onNew}
        >
          <PlusIcon className='size-4' />
          {newButtonLabel}
        </ButtonLoader>
      )}
      {!onNew && newButtonHref && (
        <Link href={newButtonHref} prefetch>
          <PlusIcon className='size-4' />
          {newButtonLabel}
        </Link>
      )}
    </div>
  )
}

type EntityContainerProps = {
  children: React.ReactNode
  header?: React.ReactNode
  search?: React.ReactNode
  pagination?: React.ReactNode
  className?: string
  id?: string
}

export const EntityContainer = ({
  children,
  header,
  search,
  pagination,
  className,
  id,
}: EntityContainerProps) => {
  return (
    <div
      className={cn('h-full w-full p-4 md:px-10 md:py-6', className)}
      id={id || 'Entity-container'}
    >
      <div
        className={cn(
          'mx-auto flex h-full w-full flex-1 flex-col gap-y-8',
          `${className}_header_container `,
        )}
      >
        {header}
        <div
          className={cn(
            'flex h-full flex-1 flex-col gap-y-4',
            `${className}_content_container `,
          )}
        >
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  )
}

interface EntitySearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  autoFocus?: boolean
}

export const EntitySearch = ({
  value,
  onChange,
  placeholder = 'Search',
  error,
  autoFocus = false,
}: EntitySearchProps) => {
  return (
    <div className='text-muted-foreground top-1/2 left-3 ml-auto -translate-y-1/2'>
      <InputComponent
        autoFocus={autoFocus}
        className='max-w-[200px]'
        rightIcon={<SearchIcon />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rounded={'sm'}
        error={error}
      />
    </div>
  )

  return null
}
interface EntityPaginationProps {
  page: number
  totalPages?: number
  onPageChange: (page: number) => void
  disabled?: boolean
  isNext?: boolean
}

export const EntityPaination = ({
  page,
  totalPages = 0,
  onPageChange,
  disabled,
  isNext,
}: EntityPaginationProps) => {
  return (
    <div className='flex w-full items-center justify-between gap-x-2'>
      <div className='text-muted-foreground flex-1 text-sm'>
        Page {page}
        {totalPages > 0 ? `of ${totalPages}` : ''}
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <ButtonLoader
          disabled={disabled || page <= 1}
          variant={'outline'}
          size={'sm'}
          onClick={() => {
            if (page > 1) {
              onPageChange(Math.max(1, page - 1))
            }
          }}
        >
          Previous
        </ButtonLoader>
        <ButtonLoader
          disabled={disabled || !isNext}
          variant={'outline'}
          size={'sm'}
          onClick={() => {
            if (isNext) {
              onPageChange(page + 1)
            }
          }}
        >
          Next
        </ButtonLoader>
      </div>
    </div>
  )

  return null
}

interface StateViewProps {
  message: React.ReactNode
}

export const LoadingView = ({ message }: StateViewProps) => {
  return <Dataloader message={message} />
}
export const ErrorView = ({ message }: StateViewProps) => {
  return (
    <div className='flex h-full flex-1 flex-col items-center justify-center gap-y-4'>
      <AlertTriangleIcon className='text-primary size-6' />
      {!!message && <p className='text-muted-foreground text-sm'>{message}</p>}
    </div>
  )
}

interface EmptyViewProps extends StateViewProps {
  onNew?: () => void
}
export const EmptyView = ({ message, onNew }: EmptyViewProps) => {
  return (
    <Empty className='border border-dashed shadow'>
      <EmptyHeader>
        <EmptyMedia variant={'icon'}>
          <PackageOpenIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No Items</EmptyTitle>
      {!!message && <EmptyDescription>{message}</EmptyDescription>}
      {!!onNew && (
        <EmptyContent>
          <ButtonLoader onClick={onNew}>Add item</ButtonLoader>
        </EmptyContent>
      )}
    </Empty>
  )
}
export const EmptySingleView = ({
  message,
  onActionClick,
  actionMessage,
}: {
  message?: string
  actionMessage?: string
  onActionClick?: () => void
}) => {
  return (
    <Empty className='border border-dashed shadow'>
      <EmptyHeader>
        <EmptyMedia variant={'icon'}>
          <PackageOpenIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Not Found</EmptyTitle>
      {!!message && <EmptyDescription>{message}</EmptyDescription>}
      {!!onActionClick && (
        <EmptyContent>
          <ButtonLoader onClick={onActionClick}>
            {actionMessage || 'Go Back'}
          </ButtonLoader>
        </EmptyContent>
      )}
    </Empty>
  )
}

interface EntityListProps<T> {
  items?: T[]
  renderItem: (item: T, index: number) => React.ReactNode

  getKey?: (item: T, index: number) => string | number
  emptyView?: React.ReactNode
  className?: string
  ref?: Ref<HTMLDivElement>
}
export function EntityList<T>({
  items,
  renderItem,
  getKey,
  emptyView,
  className,
  ref,
}: EntityListProps<T>) {
  if (items?.length == 0 && emptyView) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <div className='mx-auto max-w-sm'>{emptyView}</div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-y-4', className)} ref={ref}>
      {items?.map((item, index) => {
        return (
          <div key={getKey ? getKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}
interface EntityItemProps {
  href: string
  title: string
  subtitle?: React.ReactNode
  image?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  onRemove?: () => void | Promise<void>
  isRemoving?: boolean
}
export const EntityItem = ({
  href,
  title,
  subtitle,
  onRemove,
  isRemoving,
  actions,
  image,
  className,
}: EntityItemProps) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isRemoving) {
      return
    }
    if (onRemove) {
      await onRemove()
    }
  }
  return (
    <Link href={href} prefetch>
      <Card
        className={cn(
          'cursor-pointer p-4 shadow-none hover:shadow',
          isRemoving && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <CardContent className='flex flex-row items-center justify-between p-0'>
          <div className='flex items-center gap-3'>
            {image}
            <div>
              <CardTitle className='text-base font-medium'>{title}</CardTitle>
              {!!subtitle && (
                <CardDescription className='text-xs'>
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          {(actions || onRemove) && (
            <div className='flex items-center gap-x-4'>
              {actions}
              {onRemove && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size={'icon'}
                      variant={'ghost'}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <MoreVerticalIcon className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <DropdownMenuItem onClick={handleRemove}>
                      <TrashIcon className='size-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
