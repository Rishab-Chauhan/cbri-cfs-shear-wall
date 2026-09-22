import { CompactButton } from "./ui";

export default function EdgeTable({
  edges,
  draftEdge,
  onDraftChange,
  onConnect,
  onDeleteEdge,
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
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-3 gap-1.5 rounded border border-slate-200 bg-white p-1.5 shadow-sm">
        <label className="flex flex-col gap-0.5 text-[10px] font-medium text-slate-700">
          Start Node
          <input
            type="number"
            placeholder="e.g. 1"
            value={draftEdge.startNode}
            onChange={(e) => onDraftChange("startNode", e.target.value)}
            className="h-6 w-full rounded border border-slate-300 bg-white px-1.5 text-[11px] text-slate-900 shadow-inner outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] font-medium text-slate-700">
          End Node
          <input
            type="number"
            placeholder="e.g. 2"
            value={draftEdge.endNode}
            onChange={(e) => onDraftChange("endNode", e.target.value)}
            className="h-6 w-full rounded border border-slate-300 bg-white px-1.5 text-[11px] text-slate-900 shadow-inner outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[10px] font-medium text-slate-700">
          Thickness (mm)
          <input
            type="number"
            step="0.01"
            placeholder="1.12"
            value={draftEdge.thickness}
            onChange={(e) => onDraftChange("thickness", e.target.value)}
            className="h-6 w-full rounded border border-slate-300 bg-white px-1.5 text-[11px] text-slate-900 shadow-inner outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </label>
      </div>

      {error ? (
        <p className="mb-1 text-[11px] text-red-700">{error}</p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto border border-slate-300 bg-white">
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
              <th className="w-8 border-b border-slate-300 px-1 py-0.5 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {edges.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
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
                  <td className="border-b border-slate-200 px-1 py-0.5 text-center">
                    <button
                      type="button"
                      title="Delete edge"
                      onClick={() => onDeleteEdge(edge.id)}
                      className="inline-flex h-4 w-4 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </button>
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
