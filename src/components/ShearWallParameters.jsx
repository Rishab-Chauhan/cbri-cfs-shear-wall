function ShearWallParameters({ parameters, onChange }) {
  return (
    <section className="mt-6 border border-gray-300 bg-white">

      {/* HEADER */}
      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">
        <h3 className="font-semibold text-blue-800">
          Shear Wall Parameters
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Enter the material, sheathing and fastener properties used for
          the shear wall calculation.
        </p>
      </div>

      <div className="p-6">

        {/* ===================================================== */}
        {/* STEEL PROPERTIES */}
        {/* ===================================================== */}

        <div>
          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Steel Properties
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <ParameterInput
              label="Yield Strength (Fy-steel)"
              value={parameters.fySteel}
              unit="MPa"
              onChange={(value) => onChange("fySteel", value)}
            />

            <ParameterInput
              label="Tensile Strength (Fu-steel)"
              value={parameters.fuSteel}
              unit="MPa"
              onChange={(value) => onChange("fuSteel", value)}
            />

            <ParameterInput
              label="Young's Modulus (EF)"
              value={parameters.eSteel}
              unit="MPa"
              onChange={(value) => onChange("eSteel", value)}
            />

            <ParameterInput
              label="End Steel Stud Thickness (tF)"
              value={parameters.tF}
              unit="mm"
              onChange={(value) => onChange("tF", value)}
            />

          </div>
        </div>


        {/* ===================================================== */}
        {/* SHEATHING PROPERTIES */}
        {/* ===================================================== */}

        <div className="mt-8">

          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Sheathing Properties
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <ParameterInput
              label="Sheathing Thickness (tS)"
              value={parameters.tS}
              unit="mm"
              onChange={(value) => onChange("tS", value)}
            />

            <ParameterInput
              label="Bearing Strength (Fu-sheathing)"
              value={parameters.fuSheathing}
              unit="MPa"
              onChange={(value) =>
                onChange("fuSheathing", value)
              }
            />

            <ParameterInput
              label="Young's Modulus (ES)"
              value={parameters.eSheathing}
              unit="MPa"
              onChange={(value) =>
                onChange("eSheathing", value)
              }
            />

            <ParameterInput
              label="Shear Modulus (GS)"
              value={parameters.gSheathing}
              unit="MPa"
              onChange={(value) =>
                onChange("gSheathing", value)
              }
            />

          </div>
        </div>


        {/* ===================================================== */}
        {/* FASTENER PROPERTIES */}
        {/* ===================================================== */}

        <div className="mt-8">

          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Fastener Properties
          </h4>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <ParameterInput
              label="Screw Diameter (dC)"
              value={parameters.dC}
              unit="mm"
              onChange={(value) => onChange("dC", value)}
            />

            <ParameterInput
              label="Screw Spacing (sC)"
              value={parameters.sC}
              unit="mm"
              onChange={(value) => onChange("sC", value)}
            />

            <ParameterInput
              label="Total Number of Screws (nC)"
              value={parameters.nC}
              unit="nos."
              onChange={(value) => onChange("nC", value)}
            />

          </div>
        </div>

      </div>
    </section>
  );
}


/* ============================================================= */
/* REUSABLE INPUT                                                */
/* ============================================================= */

function ParameterInput({
  label,
  value,
  unit,
  onChange,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </label>

      <div className="flex">

        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
        />

        <span className="flex min-w-[70px] items-center justify-center border border-l-0 border-gray-300 bg-gray-50 px-2 text-sm text-gray-600">
          {unit}
        </span>

      </div>

    </div>
  );
}

export default ShearWallParameters;