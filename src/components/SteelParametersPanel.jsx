import { CompactField } from "./ui";
import ScientificInput from "./ScientificInput";

export default function SteelParametersPanel({ parameters, onChange }) {
  const updateEG = (field, value) => {
    const mu = Number(parameters.poissonRatio);
    const numeric = Number(value);

    if (field === "poissonRatio") {
      const muN = Number(value);
      const E = Number(parameters.eSteel);
      const patch = { poissonRatio: value };
      if (Number.isFinite(muN) && muN > -1 && Number.isFinite(E) && E > 0) {
        patch.gSteel = Number((E / (2 * (1 + muN))).toFixed(3));
      }
      onChange(patch);
      return;
    }

    if (!Number.isFinite(mu) || mu <= -1 || !Number.isFinite(numeric) || numeric <= 0) {
      onChange(field, value);
      return;
    }

    if (field === "eSteel") {
      onChange({
        eSteel: value,
        gSteel: Number((numeric / (2 * (1 + mu))).toFixed(3)),
      });
      return;
    }

    if (field === "gSteel") {
      onChange({
        gSteel: value,
        eSteel: Number((2 * numeric * (1 + mu)).toFixed(3)),
      });
    }
  };

  return (
    <div className="space-y-1">
      <CompactField
        label="Fy"
        unit="MPa"
        value={parameters.fySteel}
        onChange={(value) => onChange("fySteel", value)}
      />
      <CompactField
        label="Fu"
        unit="MPa"
        value={parameters.fuSteel}
        onChange={(value) => onChange("fuSteel", value)}
      />
      <ScientificInput
        label="E (EF)"
        unit="MPa"
        value={parameters.eSteel}
        onChange={(value) => updateEG("eSteel", value)}
      />
      <ScientificInput
        label="G"
        unit="MPa"
        value={parameters.gSteel}
        onChange={(value) => updateEG("gSteel", value)}
      />
      <CompactField
        label="μ"
        value={parameters.poissonRatio}
        step="0.001"
        onChange={(value) => updateEG("poissonRatio", value)}
      />
      <CompactField
        label="tF"
        unit="mm"
        step="0.01"
        value={parameters.tF}
        onChange={(value) => onChange("tF", value)}
      />
    </div>
  );
}
