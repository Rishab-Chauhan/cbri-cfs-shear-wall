function Results({ results }) {
  return (
    <section className="mt-6 border border-gray-300 bg-white">

      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <div className="border-b border-gray-300 bg-slate-50 px-6 py-4">

        <h3 className="font-semibold text-blue-800">
          Results
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Calculated section and shear wall strength results.
        </p>

      </div>


      {/* ====================================================== */}
      {/* RESULT CONTENT                                         */}
      {/* ====================================================== */}

      <div className="p-6">


        {/* ==================================================== */}
        {/* SECTION RESULTS                                      */}
        {/* ==================================================== */}

        <div>

          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Section Results
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <ResultCard
              label="Area"
              value={results?.area ?? "--"}
              unit="mm²"
            />

            <ResultCard
              label="Centroid X"
              value={results?.centroidX ?? "--"}
              unit="mm"
            />

            <ResultCard
              label="Centroid Y"
              value={results?.centroidY ?? "--"}
              unit="mm"
            />

            <ResultCard
              label="Ix"
              value={results?.ix ?? "--"}
              unit="mm⁴"
            />

            <ResultCard
              label="Iy"
              value={results?.iy ?? "--"}
              unit="mm⁴"
            />

          </div>

        </div>


        {/* ==================================================== */}
        {/* STUD PROPERTIES                                      */}
        {/* ==================================================== */}

        <div className="mt-8">

          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Stud Properties
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <ResultCard
              label="Double End-Stud Moment of Inertia (IF)"
              value={results?.endStudInertia ?? "--"}
              unit="mm⁴"
            />

            <ResultCard
              label="Intermediate Stud Moment of Inertia (IF)"
              value={results?.intermediateStudInertia ?? "--"}
              unit="mm⁴"
            />

          </div>

        </div>


        {/* ==================================================== */}
        {/* SHEAR WALL STRENGTH                                  */}
        {/* ==================================================== */}

        <div className="mt-8">

          <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
            Shear Wall Strength
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <ResultCard
              label="Sheathing Strength"
              value={results?.sheathingStrength ?? "--"}
              unit="kN"
            />

            <ResultCard
              label="Fastener Strength"
              value={results?.fastenerStrength ?? "--"}
              unit="kN"
            />

            <ResultCard
              label="Frame Strength"
              value={results?.frameStrength ?? "--"}
              unit="kN"
            />

          </div>

        </div>


        {/* ==================================================== */}
        {/* FINAL RESULT                                         */}
        {/* ==================================================== */}

        <div className="mt-8 border-t border-gray-300 pt-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium text-gray-600">
                Final Lateral Shear Strength
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Governing shear wall strength
              </p>

            </div>

            <div className="text-left md:text-right">

              <span className="text-3xl font-semibold text-blue-800">
                {results?.lateralStrength ?? "--"}
              </span>

              <span className="ml-2 text-sm text-gray-600">
                kN
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/* ============================================================= */
/* RESULT CARD                                                   */
/* ============================================================= */

function ResultCard({ label, value, unit }) {
  return (
    <div className="border border-gray-200 bg-white p-4">

      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-2">

        <span className="break-all text-lg font-semibold text-gray-800">
          {value}
        </span>

        <span className="text-xs text-gray-500">
          {unit}
        </span>

      </div>

    </div>
  );
}

export default Results;