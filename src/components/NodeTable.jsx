import { CompactButton } from "./ui";

export default function NodeTable({
  nodes,
  onChangeNode,
  onAddNode,
  onRemoveNode,
  onPlot,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-blue-900">Nodes</h3>
        <div className="flex gap-1">
          <CompactButton onClick={onAddNode}>Add Node</CompactButton>
          <CompactButton onClick={onRemoveNode}>Remove Node</CompactButton>
          <CompactButton variant="primary" onClick={onPlot}>
            Plot
          </CompactButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto border border-slate-300">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                Node
              </th>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                X (mm)
              </th>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                Y (mm)
              </th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr key={node.id} className="odd:bg-white even:bg-slate-50">
                <td className="border-b border-slate-200 px-1.5 py-0.5">
                  {node.id}
                </td>
                <td className="border-b border-slate-200 px-1 py-0.5">
                  <input
                    type="number"
                    step="any"
                    value={node.x}
                    onChange={(e) => onChangeNode(node.id, "x", e.target.value)}
                    className="h-5 w-full border border-slate-300 px-1 text-[11px] outline-none focus:border-blue-700"
                  />
                </td>
                <td className="border-b border-slate-200 px-1 py-0.5">
                  <input
                    type="number"
                    step="any"
                    value={node.y}
                    onChange={(e) => onChangeNode(node.id, "y", e.target.value)}
                    className="h-5 w-full border border-slate-300 px-1 text-[11px] outline-none focus:border-blue-700"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
