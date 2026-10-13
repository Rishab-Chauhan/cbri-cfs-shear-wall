import { CompactField } from "./ui";

export default function SteelParametersPanel({ parameters, onChange }) {
  return (
    <div className="space-y-1">
      <CompactField
        label="Yield Strength (Fy)"
        unit="MPa"
        value={parameters.fySteel}
        onChange={(value) => onChange("fySteel", value)}
      />
      <CompactField
        label="Tensile Strength (Fu)"
        unit="MPa"
        value={parameters.fuSteel}
        onChange={(value) => onChange("fuSteel", value)}
      />
      <CompactField
        label="Young's Modulus (EF)"
        unit="MPa"
        value={parameters.eSteel}
        onChange={(value) => onChange("eSteel", value)}
      />
      <CompactField
        label="Stud Thickness (tF)"
        unit="mm"
        step="0.01"
        value={parameters.tF}
        onChange={(value) => onChange("tF", value)}
      />
    </div>
  );
}
