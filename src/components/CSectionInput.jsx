import { CompactField } from "./ui";

export default function CSectionInput({ section, onChange }) {
  const webT = section.webThickness ?? section.thickness ?? "";
  const flangeT = section.flangeThickness ?? section.thickness ?? "";

  const handleWebThicknessChange = (value) => {
    onChange("webThickness", value);
  };

  const handleFlangeThicknessChange = (value) => {
    onChange("flangeThickness", value);
    onChange("thickness", value);
  };

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
        label="Web Thickness"
        unit="mm"
        step="0.01"
        value={webT}
        onChange={handleWebThicknessChange}
      />
      <CompactField
        label="Flange Thickness"
        unit="mm"
        step="0.01"
        value={flangeT}
        onChange={handleFlangeThicknessChange}
      />
    </div>
  );
}
