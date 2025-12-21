'use client'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useGetSuspenseWorkflow } from '@/features/workflows/api'

import { SaveIcon } from '@/assets/icons'
import InputComponent from '@/components/Input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useUpdateWorkflowName } from '@/features/workflows/api/mutation-hooks'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type IEditorHeaderProps = {
  workflowId: string
}

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className='ml-auto'>
      <Button
        size={'sm'}
        onClick={() => {
          console.log('Saving  workflow')
        }}
      >
        <SaveIcon className='size-4' />
        Save
      </Button>
    </div>
  )
}

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data } = useGetSuspenseWorkflow({
    id: workflowId,
    isEnabled: !!workflowId,
  })
  const { updateWorkflowName, isPending } = useUpdateWorkflowName()
  const workflowName = data?.data?.name
  const [name, setName] = useState(workflowName)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (name) {
      // eslint-disable-next-line
      setName(name)
    }
  }, [data?.data?.name])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  const handleSave = async () => {
    if (name === workflowName && !isPending) {
      setIsEditing(false)
      return
    }
    const res = await updateWorkflowName(workflowId, name)
    if (res?.data) {
      toast.success(`Workflow "${res.data.name}" updated`)
    }
    setIsEditing(false)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == 'Enter') {
      return handleSave()
    }

    if (e.key == 'Escape') {
      setName(name)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <BreadcrumbItem>
        <InputComponent
          className='h-7'
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isPending}
        />
      </BreadcrumbItem>
    )
  }

  return (
    <BreadcrumbItem
      className='cursor-pointer'
      onClick={() => setIsEditing(true)}
    >
      <BreadcrumbPage>{workflowName}</BreadcrumbPage>
    </BreadcrumbItem>
  )
}

export const EditorBreadcrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb className='flex'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={'/workflows'} prefetch>
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function EditorHeader({ workflowId }: IEditorHeaderProps) {
  const { data } = useGetSuspenseWorkflow({
    id: workflowId,
    isEnabled: !!workflowId,
  })
  const isExist = !!data?.data?.id
  return (
    <div className='bg-background flex h-14 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger />
      {isExist ? (
        <div className='flex w-full flex-row items-center justify-between gap-x-4'>
          <EditorBreadcrumbs workflowId={workflowId} />
          <EditorSaveButton workflowId={workflowId} />
        </div>
      ) : null}
    </div>
  )
}

export default EditorHeader
