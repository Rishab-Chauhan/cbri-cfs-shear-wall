import { useMemo } from "react";
import { calculateSectionProperties } from "../calculations/sectionProperties";

function SectionProperties({ section, onPropertiesCalculated }) {
  const properties = useMemo(() => {
    const result = calculateSectionProperties(section);

    if (onPropertiesCalculated) {
      onPropertiesCalculated(result);
    }

    return result;
  }, [section, onPropertiesCalculated]);

  return (
    <section className="mt-6 border border-gray-300 bg-white">

      {/* HEADER */}
      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">

        <h3 className="font-semibold text-blue-800">
          Section Properties
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Calculated geometric properties of the CFS section.
        </p>

      </div>


      {/* CONTENT */}
      <div className="p-6">

        {!properties ? (

          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Please enter valid section dimensions.
          </div>

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* AREA */}

            <PropertyCard
              label="Area (A)"
              value={properties.area}
              unit="mm²"
            />


            {/* CENTROID X */}

            <PropertyCard
              label="Centroid X"
              value={properties.centroidX}
              unit="mm"
            />


            {/* CENTROID Y */}

            <PropertyCard
              label="Centroid Y"
              value={properties.centroidY}
              unit="mm"
            />


            {/* IX */}

            <PropertyCard
              label="Moment of Inertia (Ix)"
              value={properties.Ix}
              unit="mm⁴"
            />


            {/* IY */}

            <PropertyCard
              label="Moment of Inertia (Iy)"
              value={properties.Iy}
              unit="mm⁴"
            />

          </div>

        )}

      </div>

    </section>
  );
}


/* ============================================================= */
/* PROPERTY CARD                                                 */
/* ============================================================= */

function PropertyCard({ label, value, unit }) {
  return (
    <div className="border border-gray-200 bg-white p-4">

      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-2">

        <span className="break-all text-lg font-semibold text-gray-800">
          {formatNumber(value)}
        </span>

        <span className="text-xs text-gray-500">
          {unit}
        </span>

      </div>

    </div>
  );
}


/* ============================================================= */
/* NUMBER FORMATTER                                              */
/* ============================================================= */

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "--";
  }

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default SectionProperties;