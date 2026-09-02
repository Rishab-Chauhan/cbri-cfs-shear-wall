function ResultCard({
  label,
  value,
  unit = "",
  highlight = false,
}) {
  return (
    <div
      className={`rounded-md border p-5 ${
        highlight
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-900">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  unit = "",
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value} {unit}
      </span>
    </div>
  );
}

export default function Results({
  result,
}) {
  if (!result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Enter the shear-wall parameters and click{" "}
          <span className="font-semibold text-gray-700">
            Calculate
          </span>{" "}
          to view the results.
        </p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h3 className="text-sm font-semibold text-red-800">
          Calculation Error
        </h3>

        <p className="mt-2 text-sm text-red-700">
          {result.error}
        </p>
      </div>
    );
  }

  const strength =
    result.ultimateLateralStrength /
    1000;

  const frameCapacity =
    result.Pfc /
    1000;

  const sheathingStrength =
    result.PRSheathing /
    1000;

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Calculation Results
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Ultimate lateral strength and governing failure mode.
        </p>
      </div>

      {/* MAIN RESULTS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <ResultCard
          label="Ultimate Lateral Strength"
          value={strength.toFixed(3)}
          unit="kN"
          highlight
        />

        <ResultCard
          label="Governing Failure Mode"
          value={
            result.governingFailureMode
          }
        />

        <ResultCard
          label="Ultimate Lateral Displacement"
          value={
            result.ultimateDisplacement.toFixed(
              3
            )
          }
          unit="mm"
        />
      </div>

      {/* CAPACITY */}
     
<div className="rounded-lg border border-gray-200 bg-white p-5">

  <h4 className="mb-3 text-sm font-semibold text-gray-800">
    Strength Comparison
  </h4>

  <DetailRow
    label="Sheathing Strength (Ps)"
    value={
      (
        result.sheathingStrength.Ps /
        1000
      ).toFixed(3)
    }
    unit="kN"
  />

  <DetailRow
    label="Sheathing + Frame Strength (PR)"
    value={sheathingStrength.toFixed(3)}
    unit="kN"
  />

  <DetailRow
    label="Frame Failure Capacity (Pfc)"
    value={frameCapacity.toFixed(3)}
    unit="kN"
  />

  <DetailRow
    label="Governing Strength"
    value={strength.toFixed(3)}
    unit="kN"
  />

</div>
      {/* CALCULATION DETAILS */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">

        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Calculation Details
        </h4>

        <DetailRow
          label="Total Screws (nC)"
          value={result.totalScrews}
        />

        <DetailRow
          label="Connection Strength (Vr)"
          value={result.connection.vr.toFixed(2)}
          unit="N"
        />

        <DetailRow
          label="Governing Connection Mode"
          value={
            result.connection.governingMode
          }
        />

        <DetailRow
          label="Screw Group Factor (Cu)"
          value={result.screwGroup.Cu.toFixed(3)}
        />

        <DetailRow
          label="Aspect Ratio Factor (η)"
          value={
            result.sheathingStrength.eta.toFixed(
              3
            )
          }
        />

        <DetailRow
          label="Sheathing Strength (Ps)"
          value={
            (
              result.sheathingStrength.Ps /
              1000
            ).toFixed(3)
          }
          unit="kN"
        />

        <DetailRow
          label="Sheathing Stiffness (Ks)"
          value={
            result.Ks.toFixed(3)
          }
          unit="N/mm"
        />

        <DetailRow
          label="Frame Stiffness (Kf)"
          value={
            result.Kf.toFixed(3)
          }
          unit="N/mm"
        />
      </div>

    </div>
  );
}