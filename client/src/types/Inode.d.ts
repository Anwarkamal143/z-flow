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
}
type IUpdateNode = {
  updated_at?: Date | undefined
  created_at?: Date | undefined
  deleted_at?: Date | null | undefined
  id?: string | undefined
  name?: string | undefined
  userId?: string | undefined
  workflowId?: string | undefined
  type?: INodeType | undefined
  position?: Json | undefined
  data?: Json | undefined
}
