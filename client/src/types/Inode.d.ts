type INode = {
  id: string
  name: string
  data: Record<string, unknown>
  userId: string
  updated_at: Date
  created_at: Date
  deleted_at: Date | null
  type: NodeType | null
  workflowId: string
  position: { x: number; y: number }
}
