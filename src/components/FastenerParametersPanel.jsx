import { CompactField, CompactSelect } from "./ui";

export default function FastenerParametersPanel({ parameters, onChange }) {
  return (
    <div className="space-y-1">
      <CompactField
        label="Screw type"
        type="text"
        value={parameters.screwType}
        onChange={(value) => onChange("screwType", value)}
      />
      <CompactField
        label="dC"
        unit="mm"
        step="0.001"
        value={parameters.dC}
        onChange={(value) => onChange("dC", value)}
      />
      <CompactSelect
        label="Specimen"
        value={parameters.specimenType ?? "control"}
        onChange={(value) => onChange("specimenType", value)}
      >
        <option value="control">Control</option>
        <option value="intermediateBracing">Intermediate bracing</option>
      </CompactSelect>
      <CompactField
        label="Perimeter sC"
        unit="mm"
        value={parameters.perimeterSpacing}
        onChange={(value) => onChange("perimeterSpacing", value)}
      />
      <CompactField
        label="Field spacing"
        unit="mm"
        value={parameters.fieldSpacing}
        onChange={(value) => onChange("fieldSpacing", value)}
      />
      {parameters.specimenType === "intermediateBracing" ? (
        <CompactField
          label="Horiz. spacing"
          unit="mm"
          value={parameters.horizontalSpacing}
          onChange={(value) => onChange("horizontalSpacing", value)}
        />
      ) : null}
      <CompactField
        label="Vr,screw"
        unit="N"
        value={parameters.vrSScrew}
        onChange={(value) => onChange("vrSScrew", value)}
      />
      <CompactField
        label="Vr,pullout"
        unit="N"
        value={parameters.vrPScrew}
        onChange={(value) => onChange("vrPScrew", value)}
      />
    </div>
  );
}
