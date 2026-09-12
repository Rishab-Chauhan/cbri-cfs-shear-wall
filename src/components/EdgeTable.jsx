import { CompactButton } from "./ui";

export default function EdgeTable({
  edges,
  draftEdge,
  onDraftChange,
  onConnect,
  onRemoveEdge,
  error,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-blue-900">Edges</h3>
        <div className="flex gap-1">
          <CompactButton variant="primary" onClick={onConnect}>
            Connect
          </CompactButton>
          <CompactButton onClick={onRemoveEdge}>Remove Edge</CompactButton>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-3 gap-1">
        <label className="flex flex-col gap-0.5 text-[10px] text-slate-600">
          Start Node
          <input
            type="number"
            value={draftEdge.startNode}
            onChange={(e) => onDraftChange("startNode", e.target.value)}
            className="h-6 border border-slate-300 px-1 text-[11px] outline-none focus:border-blue-700"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] text-slate-600">
          End Node
          <input
            type="number"
            value={draftEdge.endNode}
            onChange={(e) => onDraftChange("endNode", e.target.value)}
            className="h-6 border border-slate-300 px-1 text-[11px] outline-none focus:border-blue-700"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] text-slate-600">
          Thickness (mm)
          <input
            type="number"
            step="0.01"
            value={draftEdge.thickness}
            onChange={(e) => onDraftChange("thickness", e.target.value)}
            className="h-6 border border-slate-300 px-1 text-[11px] outline-none focus:border-blue-700"
          />
        </label>
      </div>

      {error ? (
        <p className="mb-1 text-[11px] text-red-700">{error}</p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto border border-slate-300">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                Edge
              </th>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                Start Node
              </th>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                End Node
              </th>
              <th className="border-b border-slate-300 px-1.5 py-0.5 font-semibold">
                Thickness (mm)
              </th>
            </tr>
          </thead>
          <tbody>
            {edges.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-1.5 py-2 text-center text-slate-500"
                >
                  No edges connected.
                </td>
              </tr>
            ) : (
              edges.map((edge) => (
                <tr key={edge.id} className="odd:bg-white even:bg-slate-50">
                  <td className="border-b border-slate-200 px-1.5 py-0.5">
                    {edge.id}
                  </td>
                  <td className="border-b border-slate-200 px-1.5 py-0.5">
                    {edge.startNode}
                  </td>
                  <td className="border-b border-slate-200 px-1.5 py-0.5">
                    {edge.endNode}
                  </td>
                  <td className="border-b border-slate-200 px-1.5 py-0.5">
                    {edge.thickness}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
