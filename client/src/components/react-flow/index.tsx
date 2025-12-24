'use client'

import { nodeComponents } from '@/config/node-components'
import AddNodeButton from '@/features/editor/components/add-node-button'
import {
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
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import { useTheme } from 'next-themes'
import { useCallback, useState } from 'react'

type FlowContainerProps = {
  nodes?: Node[]
  edges?: Edge[]
}

export default function FlowContainer({
  nodes: nds = [],
  edges: edgs = [],
}: FlowContainerProps) {
  const [nodes, setNodes] = useState<Node[]>(nds)
  const [edges, setEdges] = useState<Edge[]>(edgs)
  const { theme } = useTheme()
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
        proOptions={{
          hideAttribution: true,
        }}
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
