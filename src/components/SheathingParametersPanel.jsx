import { CompactField, CompactSelect } from "./ui";
import ScientificInput from "./ScientificInput";

function SideFields({ prefix, parameters, onChange, calculateModulus }) {
  const materialKey = prefix === "2" ? "sheathingMaterial2" : "sheathingMaterial";
  const tKey = prefix === "2" ? "tS2" : "tS";
  const fuKey = prefix === "2" ? "fuSheathing2" : "fuSheathing";
  const muKey = prefix === "2" ? "sheathingPoissonRatio2" : "sheathingPoissonRatio";
  const eKey = prefix === "2" ? "eSheathing2" : "eSheathing";
  const gKey = prefix === "2" ? "gSheathing2" : "gSheathing";

  return (
    <div className="space-y-1">
      <CompactSelect
        label="Material"
        value={parameters[materialKey] ?? "FCB"}
        onChange={(value) => onChange(materialKey, value)}
      >
        <option value="FCB">FCB</option>
        <option value="CSB">CSB</option>
        <option value="Other">Other</option>
      </CompactSelect>
      <CompactField
        label="tS"
        unit="mm"
        step="0.01"
        value={parameters[tKey]}
        onChange={(value) => onChange(tKey, value)}
      />
      <CompactField
        label="FuS"
        unit="MPa"
        value={parameters[fuKey]}
        onChange={(value) => onChange(fuKey, value)}
      />
      <CompactField
        label="μ"
        step="0.001"
        value={parameters[muKey]}
        onChange={(value) => onChange(muKey, value)}
      />
      <ScientificInput
        label="ES"
        unit="MPa"
        value={parameters[eKey]}
        onChange={(value) => calculateModulus(eKey, gKey, muKey, "E", value)}
      />
      <ScientificInput
        label="GS"
        unit="MPa"
        value={parameters[gKey]}
        onChange={(value) => calculateModulus(eKey, gKey, muKey, "G", value)}
      />
    </div>
  );
}

export default function SheathingParametersPanel({ parameters, onChange }) {
  const calculateModulus = (eKey, gKey, muKey, which, value) => {
    const mu = Number(parameters[muKey]);
    const numeric = Number(value);

    if (!Number.isFinite(mu) || mu <= -1 || !Number.isFinite(numeric) || numeric <= 0) {
      onChange(which === "E" ? eKey : gKey, value);
      return;
    }

    if (which === "E") {
      onChange({
        [eKey]: value,
        [gKey]: Number((numeric / (2 * (1 + mu))).toFixed(3)),
      });
      return;
    }

    onChange({
      [gKey]: value,
      [eKey]: Number((2 * numeric * (1 + mu)).toFixed(3)),
    });
  };

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
        calculateModulus={calculateModulus}
      />
      {parameters.sheathingConfiguration === "double" ? (
        <>
          <p className="pt-1 text-[10px] font-medium text-slate-500">Side 2</p>
          <SideFields
            prefix="2"
            parameters={parameters}
            onChange={onChange}
            calculateModulus={calculateModulus}
          />
        </>
      ) : null}
    </div>
  );
}
