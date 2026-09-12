import { CompactField } from "./ui";

export default function WallParametersPanel({ parameters, onChange }) {
  return (
    <div className="space-y-1">
      <CompactField
        label="Height (h)"
        unit="mm"
        value={parameters.panelHeight}
        onChange={(value) => onChange("panelHeight", value)}
      />
      <CompactField
        label="Length (l)"
        unit="mm"
        value={parameters.panelLength}
        onChange={(value) => onChange("panelLength", value)}
      />
      <CompactField
        label="End-coupled studs"
        unit="No."
        value={parameters.numberOfEndCoupledStuds}
        onChange={(value) => onChange("numberOfEndCoupledStuds", value)}
      />
      <CompactField
        label="Single studs"
        unit="No."
        value={parameters.numberOfSingleStuds}
        onChange={(value) => onChange("numberOfSingleStuds", value)}
      />
      <CompactField
        label="Pn"
        unit="N"
        value={parameters.nominalCompressionStrength}
        onChange={(value) => onChange("nominalCompressionStrength", value)}
      />
    </div>
  );
}
