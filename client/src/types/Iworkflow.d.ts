import { INode } from './Inode'

type IWorkflow = {
  id: string
  name: string
  userId: string
  updated_at: Date
  created_at: Date
  deleted_at: Date | null
  nodes?: INode[]
  edges?: IOutputEdge[]
}
