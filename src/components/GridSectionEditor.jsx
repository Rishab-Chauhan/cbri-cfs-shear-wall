import { useState } from "react";
import NodeTable from "./NodeTable";
import EdgeTable from "./EdgeTable";
import SectionGraph from "./SectionGraph";

export default function GridSectionEditor({
  nodes,
  edges,
  plotted,
  onChangeNodes,
  onChangeEdges,
  onPlot,
  onGeometryChange,
}) {
  const [draftEdge, setDraftEdge] = useState({
    startNode: "",
    endNode: "",
    thickness: 1.12,
  });
  const [edgeError, setEdgeError] = useState("");

  const handleChangeNode = (id, key, value) => {
    const next = nodes.map((node) =>
      node.id === id ? { ...node, [key]: value } : node
    );
    onChangeNodes(next);
    onGeometryChange();
  };

  const handleAddNode = () => {
    const nextId = nodes.reduce((max, node) => Math.max(max, node.id), 0) + 1;
    onChangeNodes([...nodes, { id: nextId, x: 0, y: 0 }]);
    onGeometryChange();
  };

  const handleRemoveNode = () => {
    if (nodes.length === 0) {
      return;
    }
    const lastId = nodes[nodes.length - 1].id;
    onChangeNodes(nodes.slice(0, -1));
    onChangeEdges(
      edges.filter(
        (edge) =>
          Number(edge.startNode) !== lastId && Number(edge.endNode) !== lastId
      )
    );
    onGeometryChange();
  };

  const handleConnect = () => {
    const start = Number(draftEdge.startNode);
    const end = Number(draftEdge.endNode);
    const thickness = Number(draftEdge.thickness);
    const ids = new Set(nodes.map((node) => Number(node.id)));

    if (!ids.has(start) || !ids.has(end)) {
      setEdgeError("Start and end nodes must exist.");
      return;
    }

    if (start === end) {
      setEdgeError("Start node and end node must be different.");
      return;
    }

    if (!Number.isFinite(thickness) || thickness <= 0) {
      setEdgeError("Thickness must be greater than zero.");
      return;
    }

    const nextId = edges.reduce((max, edge) => Math.max(max, edge.id), 0) + 1;
    const nextEdges = [
      ...edges,
      { id: nextId, startNode: start, endNode: end, thickness },
    ];
    onChangeEdges(nextEdges);
    onPlot(nodes, nextEdges);
    onGeometryChange();
    setEdgeError("");
  };

  const handleRemoveEdge = () => {
    if (edges.length === 0) {
      return;
    }
    const nextEdges = edges.slice(0, -1);
    onChangeEdges(nextEdges);
    onPlot(nodes, nextEdges);
    onGeometryChange();
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-2">
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="min-h-0 flex-[3]">
          <NodeTable
            nodes={nodes}
            onChangeNode={handleChangeNode}
            onAddNode={handleAddNode}
            onRemoveNode={handleRemoveNode}
            onPlot={() => onPlot(nodes, edges)}
          />
        </div>
        <div className="min-h-0 flex-[2]">
          <EdgeTable
            edges={edges}
            draftEdge={draftEdge}
            onDraftChange={(key, value) =>
              setDraftEdge((prev) => ({ ...prev, [key]: value }))
            }
            onConnect={handleConnect}
            onRemoveEdge={handleRemoveEdge}
            error={edgeError}
          />
        </div>
      </div>
      <SectionGraph nodes={plotted.nodes} edges={plotted.edges} />
    </div>
  );
}
