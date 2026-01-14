'use client'
import { SidebarTrigger } from '@/components/ui/sidebar'

import { SaveIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import InputComponent from '@/components/form/Input/Input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NodeType } from '@/config/enums'
import {
  useUpdateWorkflow,
  useUpdateWorkflowName,
} from '@/features/workflows/api'
import { useActiveWorkflow, useEditorInstance } from '@/store/useEditorStore'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type IEditorHeaderProps = {
  workflowId: string
}

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  const editor = useEditorInstance()
  const { updateWorkflow, isPending } = useUpdateWorkflow()
  const activeWorkflow = useActiveWorkflow()
  const handleSave = async () => {
    if (!editor) {
      return
    }
    const nodes = editor.getNodes()
    const edges = editor.getEdges()
    const filteredNodes = nodes.filter((n) => n.type != NodeType.INITIAL)
    const resp = await updateWorkflow({
      id: workflowId,
      nodes: filteredNodes,
      edges,
    })
    if (resp.success) {
      toast.success(`Workflow "${activeWorkflow?.name}" saved`)
    }
    console.log(resp, 'resp')
  }
  return (
    <div className='ml-auto'>
      <ButtonLoader
        size={'sm'}
        onClick={handleSave}
        isloading={isPending}
        disabled={isPending || !editor}
      >
        <SaveIcon className='size-4' />
        Save
      </ButtonLoader>
    </div>
  )
}

export const EditorNameInput = () => {
  const workflow = useActiveWorkflow()
  const { updateWorkflowName, isPending } = useUpdateWorkflowName()
  const workflowName = workflow?.name
  const [name, setName] = useState(workflowName)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (name) {
      // eslint-disable-next-line
      setName(name)
    }
  }, [workflowName])

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
    const res = await updateWorkflowName(workflow!.id, name)
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
        <EditorNameInput />
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function EditorHeader({ workflowId }: IEditorHeaderProps) {
  const workflow = useActiveWorkflow()

  const isExist = !!workflow?.id
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
