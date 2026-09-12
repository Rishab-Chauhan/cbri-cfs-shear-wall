import { CompactButton } from "./ui";
import SectionCreationSelector from "./SectionCreationSelector";
import GridSectionEditor from "./GridSectionEditor";
import SectionSelection from "./SectionSelection";
import SectionResults from "./SectionResults";

export default function SectionPropertiesPage({
  method,
  sectionType,
  section,
  nodes,
  edges,
  plotted,
  results,
  error,
  stale,
  sectionCalculated,
  onChangeMethod,
  onChangeType,
  onChangeSection,
  onChangeNodes,
  onChangeEdges,
  onPlot,
  onGeometryChange,
  onCalculate,
  onNext,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <SectionCreationSelector method={method} onChange={onChangeMethod} />

      <div className="flex min-h-0 flex-1 flex-col">
        {method === "grid" ? (
          <GridSectionEditor
            nodes={nodes}
            edges={edges}
            plotted={plotted}
            onChangeNodes={onChangeNodes}
            onChangeEdges={onChangeEdges}
            onPlot={onPlot}
            onGeometryChange={onGeometryChange}
          />
        ) : (
          <SectionSelection
            sectionType={sectionType}
            section={section}
            onChangeType={onChangeType}
            onChangeSection={onChangeSection}
          />
        )}
      </div>

      <SectionResults results={results} error={error} stale={stale} />

      <div className="flex shrink-0 items-center justify-between">
        <CompactButton variant="primary" onClick={onCalculate}>
          Calculate Section Properties
        </CompactButton>
        <div className="flex gap-1">
          <CompactButton disabled>Back</CompactButton>
          <CompactButton
            variant="primary"
            disabled={!sectionCalculated}
            onClick={onNext}
          >
            Next →
          </CompactButton>
        </div>
      </div>
    </div>
  );
}
