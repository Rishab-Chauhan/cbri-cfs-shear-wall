import { CompactButton } from "./ui";

export default function SectionCreationSelector({ method, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium text-slate-700">
        Section Creation Method
      </span>
      <div className="flex gap-1">
        <CompactButton
          variant={method === "grid" ? "primary" : "default"}
          onClick={() => onChange("grid")}
        >
          Grid Layout
        </CompactButton>
        <CompactButton
          variant={method === "selection" ? "primary" : "default"}
          onClick={() => onChange("selection")}
        >
          Section Selection
        </CompactButton>
      </div>
    </div>
  );
}
