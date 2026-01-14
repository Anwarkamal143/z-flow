'use client'
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
import * as React from 'react'
import { InputFormProps } from './form/Input'
import InputComponent from './form/Input/Input'

// Utils
function getValueAtPath(data: any, path: string[]) {
  if (!data) return undefined
  let current = data
  for (const key of path) {
    if (typeof current != 'object' || current == null) return undefined
    current = current[key]
  }
  return current
}

function getKeysAtPath(data: any, path: string[]): string[] {
  if (!data) return []
  const value = getValueAtPath(data, path)
  if (typeof value != 'object' || value == null) return []

  const pathKeys = []
  const keys = Object.keys(value)

  for (const key of keys) {
    if (typeof value[key] != 'function') {
      pathKeys.push(key)
    }
  }
  return pathKeys
}

function getRootKeys(data: any): string[] {
  if (!data || typeof data != 'object') return []
  const keys = Object.keys(data)
  return keys.filter((key) => typeof data[key] != 'function')
}

// Find token under cursor or at click
function findTokenAtCursor(template: string, cursor: number) {
  const beforeCursor = template.slice(0, cursor)
  const lastOpen = beforeCursor.lastIndexOf('{{')
  if (lastOpen == -1) return null

  const afterOpen = template.slice(lastOpen, cursor)
  if (afterOpen.includes('}}')) return null // ignore already closed before cursor

  const text = afterOpen.slice(2).trim()
  const path = text.split('.').filter(Boolean)
  return {
    start: lastOpen,
    end: cursor,
    path,
    text,
  }
}
type IObjectTemplateInput = {
  data?: any
  value?: string
  onChange?: (value: string) => void
} & Omit<InputFormProps, 'onChange'>
export default function ObjectTemplateInput({
  value = '',
  onChange,
  data,
  placeholder = 'Type text and use {{ }} for object keys',
  ...rest
}: IObjectTemplateInput) {
  const [template, setTemplate] = React.useState(value)
  const [cursor, setCursor] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  // Track the current path we're navigating
  const [currentPath, setCurrentPath] = React.useState<string[]>([])
  // Track the token start position for replacement
  const [tokenStart, setTokenStart] = React.useState<number | null>(null)

  const currentToken = React.useMemo(
    () => findTokenAtCursor(template, cursor),
    [template, cursor],
  )

  // Determine which keys to show - SIMPLIFIED LOGIC
  const keys = React.useMemo(() => {
    if (!data) return []

    // ALWAYS show keys at the current path
    const allKeys =
      currentPath.length == 0
        ? getRootKeys(data)
        : getKeysAtPath(data, currentPath)

    if (!search) return allKeys
    return allKeys.filter((k) => k.toLowerCase().includes(search.toLowerCase()))
  }, [currentPath, search, data])

  const handleSelectKey = (key: string) => {
    const newPath = [...currentPath, key]
    const valueAtPath = getValueAtPath(data, newPath)
    const isObject = typeof valueAtPath == 'object' && valueAtPath != null

    let newTemplate = ''
    let cursorPosition = 0

    // Replace or insert the token
    if (tokenStart != null) {
      // Find the closing }} after tokenStart
      const afterStart = template.slice(tokenStart)
      const closeIndex = afterStart.indexOf('}}')

      if (closeIndex != -1) {
        // Replace from {{ to }}
        const before = template.slice(0, tokenStart)
        const after = template.slice(tokenStart + closeIndex + 2)
        newTemplate = before + '{{' + newPath.join('.') + '}}' + after
        cursorPosition = before.length + newPath.join('.').length + 4
      } else {
        // No closing }} found, insert at tokenStart
        const before = template.slice(0, tokenStart + 2)
        const after = template.slice(tokenStart + 2)
        newTemplate = before + newPath.join('.') + '}}' + after
        cursorPosition = before.length + newPath.join('.').length + 2
      }
    } else if (currentToken) {
      // Replace current token being typed
      const before = template.slice(0, currentToken.start + 2)
      const after = template.slice(currentToken.end)
      newTemplate = before + newPath.join('.') + '}}' + after
      cursorPosition = before.length + newPath.join('.').length + 2
      setTokenStart(currentToken.start)
    } else {
      // Insert new token at cursor
      const before = template.slice(0, cursor)
      const after = template.slice(cursor)
      newTemplate = before + '{{' + newPath.join('.') + '}}' + after
      cursorPosition = before.length + newPath.join('.').length + 4
      setTokenStart(before.length)
    }

    setTemplate(newTemplate)

    onChange?.(newTemplate)

    if (isObject) {
      // Keep dropdown open and navigate deeper
      setCurrentPath(newPath)
      setSearch('')
      setOpen(true)
    } else {
      // Close dropdown for primitives
      setCurrentPath([])
      setTokenStart(null)
      setOpen(false)
    }

    // Update cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
        setCursor(cursorPosition)
      }
    }, 0)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTemplate(value)
    onChange?.(value)

    // Check if typing {{
    const cursorPos = e.target.selectionStart || 0
    if (cursorPos >= 2) {
      const lastTwoChars = value.slice(cursorPos - 2, cursorPos)
      if (lastTwoChars == '{{') {
        setOpen(true)
        setCurrentPath([])
        setTokenStart(cursorPos - 2)
      }
    }

    // Reset if not in a token
    if (!findTokenAtCursor(value, cursorPos)) {
      setCurrentPath([])
      setTokenStart(null)
    }
  }

  const handleCursor = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const pos = e.currentTarget.selectionStart ?? 0
    setCursor(pos)

    const token = findTokenAtCursor(template, pos)
    if (!token) {
      setOpen(false)
      setCurrentPath([])
      setTokenStart(null)
    }
  }

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const pos = e.currentTarget.selectionStart ?? 0

    // Find if clicking inside a token
    const beforeCursor = template.slice(0, pos)
    const lastOpen = beforeCursor.lastIndexOf('{{')
    if (lastOpen != -1) {
      const afterOpen = template.slice(lastOpen, pos)
      if (!afterOpen.includes('}}')) {
        // Clicking inside {{ but before }}
        const token = findTokenAtCursor(template, pos)
        if (token) {
          setCurrentPath(token.path.slice(0, -1))
          setTokenStart(token.start)
          setOpen(true)
          return
        }
      }
    }

    // Find complete token by checking for }} after {{
    const regex = /\{\{(.*?)\}\}/g
    regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(template)) != null) {
      if (pos >= match.index && pos <= match.index + match[0].length) {
        // Clicking inside existing token
        const tokenPath = match[1].trim().split('.').filter(Boolean)
        setCurrentPath(tokenPath.slice(0, -1))
        setTokenStart(match.index)
        setOpen(true)
        return
      }
    }

    // Clicking outside tokens
    setOpen(false)
    setCurrentPath([])
    setTokenStart(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Backspace') {
      const pos = e.currentTarget.selectionStart ?? 0

      // Check if deleting into {{
      if (pos > 0 && template[pos - 1] == '{' && template[pos] == '{') {
        setOpen(true)
        setCurrentPath([])
        setTokenStart(pos - 2)
      }

      // Find and delete complete tokens
      const regex = /\{\{(.*?)\}\}/g
      regex.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = regex.exec(template)) != null) {
        if (
          pos === match.index ||
          pos === match.index + 1 ||
          pos === match.index + 2
        ) {
          e.preventDefault()
          const before = template.slice(0, match.index)
          const after = template.slice(match.index + match[0].length)
          const newTemplate = before + after
          setTemplate(newTemplate)
          onChange?.(newTemplate)
          setCurrentPath([])
          setTokenStart(null)

          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus()
              inputRef.current.setSelectionRange(match!.index, match!.index)
              setCursor(match!.index)
            }
          }, 0)
          break
        }
      }
    }
  }

  const handleClickToken = (start: number) => {
    // Find the token
    const tokenMatch = template.slice(start).match(/^\{\{(.*?)\}\}/)
    if (!tokenMatch || !inputRef.current) return

    const tokenPath = tokenMatch[1].trim().split('.').filter(Boolean)

    // Set current path to parent of clicked token
    setCurrentPath(tokenPath.slice(0, -1))
    setTokenStart(start)

    // Focus and position cursor
    inputRef.current.focus()
    const cursorPos = start + tokenMatch[0].length
    inputRef.current.setSelectionRange(cursorPos, cursorPos)
    setCursor(cursorPos)
    setOpen(true)
  }

  const renderHighlighted = () => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const regex = /\{\{(.*?)\}\}/g
    let match: RegExpExecArray | null
    regex.lastIndex = 0
    // eslint-disable-next-line react-hooks/immutability
    while ((match = regex.exec(template)) != null) {
      if (match.index > lastIndex)
        parts.push(template.slice(lastIndex, match.index))
      const tokenPath = match[1].trim().split('.').filter(Boolean)
      const valid = data ? getValueAtPath(data, tokenPath) != null : true
      console.log(currentToken, cursor, match, 'currentToken jjj')
      parts.push(
        <span
          key={match.index}
          className={cn(
            'cursor-pointer rounded px-px',
            valid ? 'bg-accent' : 'bg-destructive/35',
          )}
          onClick={() => handleClickToken(match!.index)}
        >
          {`{{${tokenPath.join('.')}}}`}
        </span>,
      )
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < template.length) parts.push(template.slice(lastIndex))
    return parts
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setCurrentPath([])
      setTokenStart(null)
      setSearch('')
    }
  }

  if (!keys.length) {
    return (
      // <div className='relative w-full'>
      //   <div className='pointer-events-none absolute inset-0 px-3 py-2 text-sm text-transparent'>
      //     {renderHighlighted()}
      //   </div>
      <InputComponent
        ref={inputRef}
        value={template}
        onChange={handleChange}
        placeholder={placeholder}
        onClick={handleInputClick}
        onSelect={handleCursor}
        prefixComponent={{
          Comp: (
            <div className='pointer-events-none absolute inset-0 -z-1 px-3 py-2 text-sm text-transparent'>
              {renderHighlighted()}
            </div>
          ),
        }}
        {...rest}
        // className='relative w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2'
      />
      // </div>
    )
  }
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {/* <div className='relative w-full'> */}
        {/* <div className='pointer-events-none absolute inset-0 px-3 py-2 text-sm text-transparent'>
            {renderHighlighted()}
          </div> */}
        <InputComponent
          ref={inputRef}
          value={template}
          onChange={handleChange}
          onSelect={handleCursor}
          onClick={handleInputClick}
          onKeyUp={handleCursor}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          prefixComponent={
            <div className='pointer-events-none absolute inset-0 -z-1 px-3 py-2 text-sm text-transparent'>
              {renderHighlighted()}
            </div>
          }
          {...rest}

          // className='relative w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2'
        />
        {/* </div> */}
      </PopoverTrigger>

      <PopoverContent
        className='p-0'
        align='start'
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          if (inputRef.current) inputRef.current.focus()
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={data ? 'Select object key…' : 'No data available'}
            value={search}
            onValueChange={setSearch}
            disabled={!data}
          />
          <CommandList>
            <CommandEmpty>
              {!data ? 'No data object provided' : 'No matching keys'}
            </CommandEmpty>
            {data && keys.length > 0 && (
              <CommandGroup heading='Available keys'>
                {keys.map((key) => (
                  <CommandItem key={key} onSelect={() => handleSelectKey(key)}>
                    {key}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
