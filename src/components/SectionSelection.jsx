import { CompactButton } from "./ui";
import CSectionInput from "./CSectionInput";
import ISectionInput from "./ISectionInput";
import SectionDrawing from "./SectionDrawing";

export default function SectionSelection({
  sectionType,
  section,
  onChangeType,
  onChangeSection,
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-2 gap-2">
      <div className="flex min-h-0 flex-col border border-slate-300 bg-white p-2">
        <h3 className="mb-2 text-[11px] font-semibold text-blue-900">
          Section Type
        </h3>
        <div className="mb-3 flex gap-1">
          <CompactButton
            variant={sectionType === "C" ? "primary" : "default"}
            onClick={() => onChangeType("C")}
          >
            C-section
          </CompactButton>
          <CompactButton
            variant={sectionType === "I" ? "primary" : "default"}
            onClick={() => onChangeType("I")}
          >
            I-section
          </CompactButton>
        </div>
        {sectionType === "I" ? (
          <ISectionInput section={section} onChange={onChangeSection} />
        ) : (
          <CSectionInput section={section} onChange={onChangeSection} />
        )}
      </div>
      <SectionDrawing section={section} type={sectionType} />
    </div>
  );
}
