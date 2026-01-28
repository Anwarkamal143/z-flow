'use client'
import {
  AnthropicIcon,
  GeminiIcon,
  GlobeIcon,
  GoogleFormIcon,
  MousePointerIcon,
  OpenAiIcon,
  StripeIcon,
} from '@/assets/icons'
import { NodeType } from '@/config/enums'
import { useCreateNode } from '@/features/nodes/api/mutation-hooks'
import { generateUlid } from '@/lib'
import { cn } from '@/lib/utils'
import { useReactFlow } from '@xyflow/react'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'
import ImageWithFallback from './image-fallback'
import Dataloader from './loaders'
import { Separator } from './ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
export type NodeTypeOptions = {
  type?: NodeType
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }> | string
}
const triggerNodes: NodeTypeOptions[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: 'Trigger manually',
    description:
      'Runs the flow on clicking a button. Good for testing started quickly.',
    icon: MousePointerIcon,
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: 'Google Form',
    description: 'Runs the flow when a Google form is submitted.',
    icon: GoogleFormIcon,
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: 'Stripe',
    description: 'Runs the flow when a Stripe event captured.',
    icon: StripeIcon,
  },
]

const executionNodes: NodeTypeOptions[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: 'HTTP Request',
    description:
      'Starts the flow when an HTTP request is received. Useful for webhooks and APIs.',
    icon: GlobeIcon,
  },
  {
    type: NodeType.GEMINI,
    label: 'Gemini',
    description: 'Uses Google Gemini to generate text',
    icon: GeminiIcon,
  },
  {
    type: NodeType.OPENAI,
    label: 'Openai',
    description: 'Uses Openai to generate text',
    icon: OpenAiIcon,
  },
  {
    type: NodeType.ANTHROPIC,
    label: 'Anthropic',
    description: 'Uses Anthropic to generate text',
    icon: AnthropicIcon,
  },
]

type INodeSelectorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

const NodeSelector = ({ open, onOpenChange, children }: INodeSelectorProps) => {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow()
  const params = useParams<{ workflowId: string }>()
  const { handleCreate, isPending, variables } = useCreateNode()
  const handleNodeSelect = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    async (node: NodeTypeOptions | undefined) => {
      if (!node || !params.workflowId || isPending) return
      // Check if trying to add a manual trigger when one already exists
      if (node.type == NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes()
        const manualTriggerExists = nodes.some(
          (n) => n.type == NodeType.MANUAL_TRIGGER,
        )
        if (manualTriggerExists) {
          toast.error('Only one manual trigger is allowed per workflow.')
          return
        }
      }
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const x = centerX + (Math.random() - 0.5) * 200
      const y = centerY + (Math.random() - 0.5) * 200
      const flowPosition = screenToFlowPosition({ x, y })
      const id = generateUlid()
      const newNode = {
        id,
        type: node.type,
        position: flowPosition,
        data: {},
        name: node.type,
        workflowId: params.workflowId,
      }
      const resp = await handleCreate(newNode)
      const nNode = resp.data?.id ? resp.data : newNode
      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some((n) => n.type == NodeType.INITIAL)
        if (hasInitialTrigger) {
          return [nNode]
        }
        return [...nodes, nNode]
      })
      onOpenChange(false)
    },
    [getNodes, onOpenChange, screenToFlowPosition, setNodes],
  )
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto sm:max-w-md dark:bg-gray-900'
      >
        {isPending && <Dataloader className='absolute' />}

        <SheetHeader>
          <SheetTitle>What triggers this workflow?</SheetTitle>
          <SheetDescription>
            A trigger is a step that starts your workflow.
          </SheetDescription>
        </SheetHeader>
        <div>
          {triggerNodes.map((node) => {
            const Icon = node.icon

            return (
              <div
                key={node.type}
                className={cn(
                  'hover:border-l-primary flex h-auto w-full cursor-pointer justify-start rounded-none border-l-2 border-transparent px-4 py-5 hover:shadow-xs',
                )}
                onClick={() => handleNodeSelect(node)}
              >
                <div className='flex w-full items-center gap-6 overflow-hidden'>
                  {typeof Icon == 'string' ? (
                    <ImageWithFallback
                      src={Icon}
                      alt={node.label}
                      className='size-5 rounded-sm object-contain'
                    />
                  ) : Icon ? (
                    <Icon className='size-5' />
                  ) : null}
                  <div className='flex flex-col items-start text-left'>
                    <span className='text-sm font-medium'>{node.label}</span>
                    <span className='text-muted-foreground text-xs'>
                      {node.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Separator />
        <div>
          {executionNodes.map((node) => {
            const Icon = node.icon

            return (
              <div
                key={node.type}
                className={cn(
                  'hover:border-l-primary flex h-auto w-full cursor-pointer justify-start rounded-none border-l-2 border-transparent px-4 py-5 hover:shadow-xs',
                )}
                onClick={() => handleNodeSelect(node)}
              >
                <div className='flex w-full items-center gap-6 overflow-hidden'>
                  {typeof Icon == 'string' ? (
                    <ImageWithFallback
                      src={Icon}
                      alt={node.label}
                      className='size-5 rounded-sm object-contain'
                    />
                  ) : Icon ? (
                    <Icon className='size-5' />
                  ) : null}
                  <div className='flex flex-col items-start text-left'>
                    <span className='text-sm font-medium'>{node.label}</span>
                    <span className='text-muted-foreground text-xs'>
                      {node.description}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
export default NodeSelector
