type IEdge = {
  id: string
  name: string
  userId: string
  updated_at: Date
  created_at: Date
  deleted_at: Date | null
  workflowId: string
  fromNodeId: string
  toNodeId: string
  fromOutput: string | null
  toInput: string | null
}
export type IOutputEdge = Omit<
  IEdge,
  'fromNodeId' | 'toNodeId' | 'fromOutput' | 'toInput'
> & {
  source: IEdge['fromNodeId']
  target: IEdge['toNodeId']
  sourceHandle: IEdge['fromOutput']
  targetHandle: IEdge['toInput']
}
