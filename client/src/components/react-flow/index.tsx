'use client'

import { nodeComponents } from '@/config/node-components'
import AddNodeButton from '@/features/editor/components/add-node-button'
import { useStoreWorkflowActions } from '@/store/useEditorStore'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  ColorMode,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  Panel,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProps,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

type FlowContainerProps = ReactFlowProps & {
  nodes?: Node[]
  edges?: Edge[]
  onAutoSave?: (nodes: Node[], edges: Edge[]) => void | Promise<void>
  autoSaveMs?: number
}

export default function FlowContainer({
  nodes: nds = [],
  edges: edgs = [],
  onInit,
  onAutoSave,
  autoSaveMs = 1000,
  ...rest
}: FlowContainerProps) {
  const { setEditor } = useStoreWorkflowActions()

  const [nodes, setNodes] = useState<Node[]>(nds)
  const [edges, setEdges] = useState<Edge[]>(edgs)
  const { theme } = useTheme()
  const timeOutRef = useRef<NodeJS.Timeout>(null)
  const editor = useRef<ReactFlowInstance<Node, Edge> | null>(null)

  const handleAutoSave = () => {
    timeOutRef.current && clearTimeout(timeOutRef.current)
    if (onAutoSave) {
      timeOutRef.current = setTimeout(() => {
        onAutoSave?.(nodes, edges)
      }, autoSaveMs)
    }
  }
  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  )
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  )

  useEffect(() => {
    if (editor.current) {
      handleAutoSave()
    }

    return () => {
      timeOutRef.current && clearTimeout(timeOutRef.current)
    }
  }, [nodes, edges, autoSaveMs])

  useEffect(() => {
    return () => {
      editor.current = null
    }
  }, [])

  const handleOnInit = (e?: ReactFlowInstance<Node, Edge>) => {
    if (e) {
      setEditor(e)
      onInit?.(e)
      editor.current = e
    }
  }
  return (
    <div className='h-full w-full'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
        fitView
        colorMode={theme as ColorMode}
        onInit={handleOnInit}
        proOptions={{
          hideAttribution: true,
        }}
        snapGrid={[10, 10]}
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
        {...rest}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position='top-right'>
          <AddNodeButton />
        </Panel>
      </ReactFlow>
    </div>
  )
}
