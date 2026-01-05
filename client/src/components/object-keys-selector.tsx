'use client'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import * as React from 'react'

// Example data structure
const obj = {
  name: 'Anwar',
  age: 25,
  address: {
    street: 'Main',
    city: 'Lahore',
  },
  new: () => {},
}

// Utils
function getValueAtPath(data: any, path: string[]) {
  let current = data
  console.log(typeof current == 'object', current)
  for (const key of path) {
    if (typeof current != 'object' || current == null) return undefined
    current = current[key]
  }
  return current
}

function getKeysAtPath(data: any, path: string[]): string[] {
  const value = getValueAtPath(data, path)
  const pathKeys = []
  if (typeof value == 'object' && value != null) {
    const keys = Object.keys(value)

    for (const key of keys) {
      if (typeof value[key] != 'function') {
        console.log(typeof data[key], key)
        pathKeys.push(key)
      }
    }
  }
  return pathKeys
}

export default function ObjectKeySelect({
  showRemove = true,
  onChange,
}: {
  showRemove?: boolean
  onChange?: (path: string[], dotPath: string) => void
}) {
  const [path, setPath] = React.useState<string[]>([])
  const [activeDepth, setActiveDepth] = React.useState<number>(0)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const activePath = path.slice(0, activeDepth)

  const keys = React.useMemo(() => {
    const allKeys = getKeysAtPath(obj, activePath)
    if (!search) return allKeys
    return allKeys.filter((k) => k.toLowerCase().includes(search.toLowerCase()))
  }, [activePath, search])

  const handleSelect = (key: string) => {
    const nextPath = [...activePath, key]
    const value = getValueAtPath(obj, nextPath)

    setPath(nextPath)
    setActiveDepth(nextPath.length)
    setSearch('')

    onChange?.(nextPath, nextPath.join('.'))

    setOpen(typeof value == 'object' && value !== null)
  }

  const handleRemoveAt = (index: number) => {
    const newPath = path.slice(0, index)
    setPath(newPath)
    setActiveDepth(newPath.length)
    setSearch('')

    onChange?.(newPath, newPath.join('.'))

    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Backspace' || e.key === 'Delete') && !search) {
      e.preventDefault()
      if (!path.length) return
      const newPath = path.slice(0, -1)
      setPath(newPath)
      setActiveDepth(newPath.length)
      setOpen(true)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className='h-auto py-1 pl-1'>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full flex-wrap justify-start gap-1'
        >
          {path.length === 0 && (
            <span className='text-muted-foreground'>Select object key…</span>
          )}

          {path.map((segment, index) => (
            <span key={index} className='flex items-center gap-1'>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveDepth(index)
                  setSearch('')
                  setOpen(true)
                }}
                className='bg-primary text-primary-foreground relative flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-sm'
              >
                {segment}

                {showRemove && (
                  <X
                    className='!pointer-events-auto cursor-pointer opacity-70 hover:opacity-100'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveAt(index)
                    }}
                  />
                )}
              </span>

              {index < path.length - 1 && (
                <span className='text-muted-foreground'>.</span>
              )}
            </span>
          ))}
        </Button>
      </PopoverTrigger>

      <PopoverContent className='p-0' align='start'>
        <Command shouldFilter={false} className='w-full'>
          <CommandInput
            placeholder='Type to filter keys…'
            value={search}
            onValueChange={setSearch}
            onKeyDown={handleKeyDown}
            className='w-full'
          />

          <CommandList className='w-full'>
            <CommandEmpty>No matching keys.</CommandEmpty>

            <CommandGroup heading='Available keys' className='w-full'>
              {keys.map((key) => {
                const isSelected = path[activeDepth] === key

                return (
                  <CommandItem
                    key={key}
                    onSelect={() => handleSelect(key)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between',
                      isSelected && 'bg-accent',
                    )}
                  >
                    <span>{key}</span>
                    {isSelected && <Check className='h-4 w-4' />}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
