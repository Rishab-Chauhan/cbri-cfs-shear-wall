import { CompactField, CompactSelect } from "./ui";

export const SHEATHING_PRESETS = {
  DFP: {
    label: "DFP — Douglas-fir plywood",
    tS: 12.5,
    eS: 10445,
    gS: 825,
  },
  CSP: {
    label: "CSP — Canadian softwood plywood",
    tS: 12.5,
    eS: 7376,
    gS: 497,
  },
  OSB: {
    label: "OSB — Oriented strand board",
    tS: 11,
    eS: 9917,
    gS: 925,
  },
  GWB: {
    label: "GWB — Gypsum wallboard",
    tS: "", // Not specified in thesis table; user must enter
    eS: 1290,
    gS: 561,
  },
  Custom: {
    label: "Custom",
  },
};

function SideFields({ prefix, parameters, onChange }) {
  const materialKey = prefix === "2" ? "sheathingMaterial2" : "sheathingMaterial";
  const tKey = prefix === "2" ? "tS2" : "tS";
  const fuKey = prefix === "2" ? "fuSheathing2" : "fuSheathing";
  const eKey = prefix === "2" ? "eSheathing2" : "eSheathing";
  const gKey = prefix === "2" ? "gSheathing2" : "gSheathing";

  const currentMaterial = parameters[materialKey] ?? "Custom";

  const handleMaterialChange = (selectedMaterial) => {
    if (selectedMaterial === "Custom") {
      onChange(materialKey, "Custom");
      return;
    }

    const preset = SHEATHING_PRESETS[selectedMaterial];
    if (!preset) {
      onChange(materialKey, selectedMaterial);
      return;
    }

    const patch = {
      [materialKey]: selectedMaterial,
      [eKey]: preset.eS,
      [gKey]: preset.gS,
    };

    if (preset.tS !== undefined) {
      patch[tKey] = preset.tS;
    }

    onChange(patch);
  };

  const handleFieldChange = (key, value) => {
    const patch = { [key]: value };
    if (currentMaterial !== "Custom") {
      patch[materialKey] = "Custom";
    }
    onChange(patch);
  };

  return (
    <div className="space-y-1">
      <CompactSelect
        label="Material"
        value={currentMaterial}
        onChange={handleMaterialChange}
      >
        <option value="DFP">DFP — Douglas-fir plywood</option>
        <option value="CSP">CSP — Canadian softwood plywood</option>
        <option value="OSB">OSB — Oriented strand board</option>
        <option value="GWB">GWB — Gypsum wallboard</option>
        <option value="Custom">Custom</option>
      </CompactSelect>
      <CompactField
        label="Thickness (tS)"
        unit="mm"
        step="0.01"
        value={parameters[tKey]}
        onChange={(value) => handleFieldChange(tKey, value)}
      />
      <CompactField
        label="Bearing Strength (FuS)"
        unit="MPa"
        value={parameters[fuKey]}
        onChange={(value) => handleFieldChange(fuKey, value)}
      />
      <CompactField
        label="Young's Modulus (ES)"
        unit="MPa"
        value={parameters[eKey]}
        onChange={(value) => handleFieldChange(eKey, value)}
      />
      <CompactField
        label="Shear Modulus (GS)"
        unit="MPa"
        value={parameters[gKey]}
        onChange={(value) => handleFieldChange(gKey, value)}
      />
    </div>
  );
}

export default function SheathingParametersPanel({ parameters, onChange }) {
  return (
    <div className="space-y-1">
      <CompactSelect
        label="Configuration"
        value={parameters.sheathingConfiguration ?? "single"}
        onChange={(value) => onChange("sheathingConfiguration", value)}
      >
        <option value="single">Single side</option>
        <option value="double">Double side</option>
      </CompactSelect>
      <p className="text-[10px] font-medium text-slate-500">
        {parameters.sheathingConfiguration === "double" ? "Side 1" : "Sheathing"}
      </p>
      <SideFields
        prefix="1"
        parameters={parameters}
        onChange={onChange}
      />
      {parameters.sheathingConfiguration === "double" ? (
        <>
          <p className="pt-1 text-[10px] font-medium text-slate-500">Side 2</p>
          <SideFields
            prefix="2"
            parameters={parameters}
            onChange={onChange}
          />
        </>
      ) : null}
    </div>
  );
}
