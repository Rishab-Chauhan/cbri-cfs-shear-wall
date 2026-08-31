import { calculateSectionProperties } from "../calculations/sectionProperties";

function SectionProperties({ section }) {
  const properties = calculateSectionProperties(section);

  return (
    <section className="mt-6 border border-gray-300 bg-white">

      {/* HEADER */}
      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">
        <h3 className="font-semibold text-blue-800">
          Section Properties
        </h3>
      </div>

      {/* PROPERTIES */}
      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-5">

        <PropertyCard
          label="Area"
          value={properties.area.toFixed(2)}
          unit="mm²"
        />

        <PropertyCard
          label="Centroid X"
          value={properties.centroidX.toFixed(2)}
          unit="mm"
        />

        <PropertyCard
          label="Centroid Y"
          value={properties.centroidY.toFixed(2)}
          unit="mm"
        />

        <PropertyCard
          label="Ix"
          value={properties.ix.toFixed(2)}
          unit="mm⁴"
        />

        <PropertyCard
          label="Iy"
          value={properties.iy.toFixed(2)}
          unit="mm⁴"
        />

      </div>

    </section>
  );
}


function PropertyCard({ label, value, unit }) {
  return (
    <div className="border border-gray-200 p-4">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all text-lg font-semibold text-gray-800">
        {value}
      </p>

      <p className="text-xs text-gray-500">
        {unit}
      </p>

    </div>
  );
}

export default SectionProperties;