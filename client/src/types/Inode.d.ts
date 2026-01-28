import { INodeType } from '@/config/enums'

type INode = {
  id: string
  name: string
  data: Record<string, unknown>
  userId: string
  updated_at: Date
  created_at: Date
  deleted_at?: Date | null | undefined
  type?: INodeType | undefined
  workflowId: string
  position: { x: number; y: number }
  credentialId?: string | null | undefined
}
type IUpdateNode = Partial<INode>
