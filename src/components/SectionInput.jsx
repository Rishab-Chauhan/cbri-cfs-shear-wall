function SectionInput({ section, onChange }) {
  return (
    <section className="border border-gray-300 bg-white">
      {/* SECTION HEADER */}
      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">
        <h3 className="font-semibold text-blue-800">
          Section Inputs
        </h3>
      </div>

      <div className="space-y-5 p-6">

        {/* WEB LENGTH */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Web Length
          </label>

          <div className="flex">
            <input
              type="number"
              value={section.webLength}
              onChange={(e) => onChange("webLength", e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />

            <span className="flex w-16 items-center justify-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-600">
              mm
            </span>
          </div>
        </div>

        {/* FLANGE WIDTH */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Flange Width
          </label>

          <div className="flex">
            <input
              type="number"
              value={section.flangeWidth}
              onChange={(e) => onChange("flangeWidth", e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />

            <span className="flex w-16 items-center justify-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-600">
              mm
            </span>
          </div>
        </div>

        {/* LIP LENGTH */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Lip Length
          </label>

          <div className="flex">
            <input
              type="number"
              value={section.lipLength}
              onChange={(e) => onChange("lipLength", e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />

            <span className="flex w-16 items-center justify-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-600">
              mm
            </span>
          </div>
        </div>

        {/* THICKNESS */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Thickness
          </label>

          <div className="flex">
            <input
              type="number"
              step="0.01"
              value={section.thickness}
              onChange={(e) => onChange("thickness", e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />

            <span className="flex w-16 items-center justify-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-600">
              mm
            </span>
          </div>
        </div>

        {/* CORNER RADIUS */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Corner Radius
          </label>

          <div className="flex">
            <input
              type="number"
              step="0.1"
              value={section.radius}
              onChange={(e) => onChange("radius", e.target.value)}
              className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
            />

            <span className="flex w-16 items-center justify-center border border-l-0 border-gray-300 bg-gray-50 text-sm text-gray-600">
              mm
            </span>
          </div>
        </div>

        {/* BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            className="w-full bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Calculate Section
          </button>
        </div>

      </div>
    </section>
  );
}

export default SectionInput;