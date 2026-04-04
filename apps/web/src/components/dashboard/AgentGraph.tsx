"use client";

import React, { useMemo } from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

interface LogEntry {
  agent: string;
  status: string;
  created_at: string;
}

interface AgentGraphProps {
  logs: LogEntry[];
}

/**
 * Visualización dinámica del comportamiento de los agentes basada en logs.
 */
export default function AgentGraph({ logs }: AgentGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodesMap: Record<string, Node> = {};
    const edgesList: Edge[] = [];

    // Construir nodos desde agentes únicos
    logs.forEach((log, index) => {
      if (!nodesMap[log.agent]) {
        nodesMap[log.agent] = {
          id: log.agent,
          data: { label: `🤖 ${log.agent}` },
          position: { x: Object.keys(nodesMap).length * 200, y: 100 },
          style: { 
            background: '#1a1a1a', 
            color: '#fff', 
            borderRadius: '8px',
            border: '2px solid #555',
            padding: '10px'
          }
        };
      }

      // Crear hilos (edges) basados en la secuencia temporal de la traza
      if (index > 0) {
        edgesList.push({
          id: `e-${index}-${log.agent}`,
          source: logs[index - 1].agent,
          target: log.agent,
          animated: true,
          style: {
            stroke:
              log.status === "error"
                ? "#ef4444" // rojo
                : log.status === "retry"
                ? "#3b82f6" // azul
                : "#22c55e", // verde
            strokeWidth: 2
          }
        });
      }
    });

    return { 
      nodes: Object.values(nodesMap), 
      edges: edgesList 
    };
  }, [logs]);

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-xl overflow-hidden border border-white/10">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
      >
        <Background color="#333" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
