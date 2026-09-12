import { CompactField } from "./ui";

export default function CSectionInput({ section, onChange }) {
  return (
    <div className="space-y-1.5">
      <CompactField
        label="Web Length"
        unit="mm"
        value={section.webLength}
        onChange={(value) => onChange("webLength", value)}
      />
      <CompactField
        label="Flange Width"
        unit="mm"
        value={section.flangeWidth}
        onChange={(value) => onChange("flangeWidth", value)}
      />
      <CompactField
        label="Lip Length"
        unit="mm"
        value={section.lipLength}
        onChange={(value) => onChange("lipLength", value)}
      />
      <CompactField
        label="Thickness"
        unit="mm"
        step="0.01"
        value={section.thickness}
        onChange={(value) => onChange("thickness", value)}
      />
    </div>
  );
}
