import { useState } from "react";
import ScrewCoordinateTable, {
  downloadScrewCsv,
} from "./ScrewCoordinateTable";
import ScrewPlot from "./ScrewPlot";

function ResultCard({ label, value, unit = "", highlight = false }) {
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
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

function DetailRow({ label, value, unit = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">
        {value} {unit}
      </span>
    </div>
  );
}

function formatNumber(value, digits = 3) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return Number(value).toFixed(digits);
}

export default function Results({ result }) {
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showPlot, setShowPlot] = useState(false);

  if (!result) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">
          Enter the shear-wall parameters and click{" "}
          <span className="font-semibold text-gray-700">Calculate</span> to view
          the results.
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
        <p className="mt-2 text-sm text-red-700">{result.error}</p>
      </div>
    );
  }

  const strength = result.ultimateLateralStrength / 1000;
  const frameCapacity = result.Pfc / 1000;
  const sheathingStrength = result.PRSheathing / 1000;
  const screws = result.screwDetails || [];
  const layout = result.screwLayout || {};
  const section = result.section;
  const group = result.screwGroup;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          Calculation Results
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Martinez thesis simplified procedure — same outputs as the Python
          calculator.
        </p>
      </div>

      {result.sheathingStrength?.aspectRatioWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          H/L is greater than 8.0. Thesis Eq. 3.13 gives η = 0 for this case.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResultCard
          label="Ultimate Lateral Strength"
          value={strength.toFixed(3)}
          unit="kN"
          highlight
        />
        <ResultCard
          label="Governing Failure Mode"
          value={result.governingFailureMode}
        />
        <ResultCard
          label="Ultimate Lateral Displacement"
          value={result.ultimateDisplacement.toFixed(3)}
          unit="mm"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowCoordinates((open) => !open)}
          className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          {showCoordinates ? "Hide Coordinates" : "View Coordinates"}
        </button>
        <button
          type="button"
          onClick={() => setShowPlot((open) => !open)}
          className="rounded-md border border-blue-700 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          {showPlot ? "Hide Plot" : "Plot Coordinates"}
        </button>
        <button
          type="button"
          onClick={() => downloadScrewCsv(screws)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Download CSV
        </button>
      </div>

      {showCoordinates && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">
            Screw Coordinates and Detailed Moment M Calculation
          </h4>
          <ScrewCoordinateTable
            screws={screws}
            J={group.J}
            M={group.M}
          />
        </div>
      )}

      {showPlot && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">
            Screw Coordinate Plot
          </h4>
          <p className="mb-4 text-xs text-gray-500">
            Origin (0, 0) is at the centre of the wall. Blue dots are perimeter
            screws; red dots are intermediate-stud screws.
          </p>
          <ScrewPlot
            screws={screws}
            panelLength={result.panelLength}
            panelHeight={result.panelHeight}
          />
        </div>
      )}

      {section && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">
            CFS Stud Section
          </h4>
          <DetailRow
            label="Web length"
            value={formatNumber(section.webLength)}
            unit="mm"
          />
          <DetailRow
            label="Flange width"
            value={formatNumber(section.flangeWidth)}
            unit="mm"
          />
          <DetailRow
            label="Lip length"
            value={formatNumber(section.lipLength)}
            unit="mm"
          />
          <DetailRow
            label="Thickness"
            value={formatNumber(section.thickness)}
            unit="mm"
          />
          <DetailRow
            label="Section area"
            value={formatNumber(section.area)}
            unit="mm²"
          />
          <DetailRow
            label="Centroid X"
            value={formatNumber(section.centroidX)}
            unit="mm"
          />
          <DetailRow
            label="Centroid Y"
            value={formatNumber(section.centroidY)}
            unit="mm"
          />
          <DetailRow
            label="Ix of one C-section"
            value={formatNumber(section.Ix)}
            unit="mm⁴"
          />
          <DetailRow
            label="Iy of one C-section"
            value={formatNumber(section.Iy)}
            unit="mm⁴"
          />
          <DetailRow
            label="Intermediate stud IF"
            value={formatNumber(section.IF_intermediate)}
            unit="mm⁴"
          />
          <DetailRow
            label="Double end-stud IF"
            value={formatNumber(section.IF_end)}
            unit="mm⁴"
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Screw Arrangement
        </h4>
        <DetailRow label="Horizontal divisions (nx)" value={layout.nx ?? "—"} />
        <DetailRow
          label="Vertical perimeter divisions (ny)"
          value={layout.ny ?? "—"}
        />
        <DetailRow
          label="Field vertical divisions"
          value={layout.nField ?? "—"}
        />
        <DetailRow
          label="Actual horizontal perimeter spacing"
          value={formatNumber(layout.actualXSpacing)}
          unit="mm"
        />
        <DetailRow
          label="Actual vertical perimeter spacing"
          value={formatNumber(layout.actualYSpacing)}
          unit="mm"
        />
        <DetailRow
          label="Actual field spacing"
          value={formatNumber(layout.actualFieldSpacing)}
          unit="mm"
        />
        <DetailRow label="Total number of screws (nC)" value={result.totalScrews} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Fastener-Group Calculation
        </h4>
        <DetailRow label="J" value={formatNumber(group.J)} unit="mm²" />
        <DetailRow
          label="Initial eccentricity ey(0)"
          value={formatNumber(group.ey0)}
          unit="mm"
        />
        <DetailRow label="M0" value={formatNumber(group.M0)} />
        <DetailRow
          label="delta_y"
          value={formatNumber(group.deltaY)}
          unit="mm"
        />
        <DetailRow label="ey" value={formatNumber(group.ey)} unit="mm" />
        <DetailRow label="Mp" value={formatNumber(group.Mp)} />
        <DetailRow label="M" value={formatNumber(group.M)} />
        <DetailRow label="Cu" value={formatNumber(group.Cu, 6)} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Connection Strength
        </h4>
        <DetailRow
          label="Sheathing bearing"
          value={formatNumber(result.connection.brSheathing)}
          unit="N"
        />
        <DetailRow
          label="Steel bearing"
          value={formatNumber(result.connection.brSteel)}
          unit="N"
        />
        <DetailRow
          label="Screw shear"
          value={formatNumber(result.connection.vrSScrew)}
          unit="N"
        />
        <DetailRow
          label="Screw pullout"
          value={formatNumber(result.connection.vrPScrew)}
          unit="N"
        />
        <DetailRow
          label="Vr"
          value={formatNumber(result.connection.vr)}
          unit="N"
        />
        <DetailRow
          label="Controlling connection mode"
          value={result.connection.governingMode}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Sheathing Calculation
        </h4>
        <DetailRow
          label="eta"
          value={formatNumber(result.sheathingStrength.eta, 6)}
        />
        <DetailRow
          label="Ps"
          value={formatNumber(result.sheathingStrength.Ps / 1000)}
          unit="kN"
        />
        <DetailRow
          label="alpha_V"
          value={formatNumber(result.sheathingStiffness.alphaV, 6)}
        />
        <DetailRow
          label="alpha_B"
          value={formatNumber(result.sheathingStiffness.alphaB, 6)}
        />
        <DetailRow
          label="As"
          value={formatNumber(result.sheathingStiffness.As)}
          unit="mm²"
        />
        <DetailRow
          label="Is"
          value={formatNumber(result.sheathingStiffness.Is)}
          unit="mm⁴"
        />
        <DetailRow
          label="Ks"
          value={formatNumber(result.Ks)}
          unit="N/mm"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-800">
          Frame / Wall Calculation
        </h4>
        <DetailRow
          label="K_end_each"
          value={formatNumber(result.KEndEach)}
          unit="N/mm"
        />
        <DetailRow
          label="K_intermediate"
          value={formatNumber(result.KIntermediate)}
          unit="N/mm"
        />
        <DetailRow label="Kf" value={formatNumber(result.Kf)} unit="N/mm" />
        <DetailRow
          label="Pr (sheathing-controlled)"
          value={sheathingStrength.toFixed(3)}
          unit="kN"
        />
        <DetailRow label="Pn" value={formatNumber(result.Pn)} unit="N" />
        <DetailRow
          label="Pfc (frame failure)"
          value={frameCapacity.toFixed(3)}
          unit="kN"
        />
        <DetailRow
          label="Governing strength"
          value={strength.toFixed(3)}
          unit="kN"
        />
      </div>
    </div>
  );
}
