import { useState } from "react";

import SectionInput from "./components/SectionInput";
import SectionDrawing from "./components/SectionDrawing";
import SectionProperties from "./components/SectionProperties";
import ShearWallParameters from "./components/ShearWallParameters";
import Results from "./components/Results";

function App() {
  // ============================================================
  // SECTION GEOMETRY
  // ============================================================

  const [section, setSection] = useState({
    webLength: 200,
    flangeWidth: 50,
    lipLength: 20,
    thickness: 1.12,
    radius: 0,
  });

  // Handle section input changes
  const handleSectionChange = (field, value) => {
    setSection((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // ============================================================
  // SHEAR WALL PARAMETERS
  // ============================================================

  const [parameters, setParameters] = useState({
    // ----------------------------------------------------------
    // STEEL PROPERTIES
    // ----------------------------------------------------------

    fySteel: 230,
    fuSteel: 344,
    eSteel: 203000,
    tF: 1.12,

    // ----------------------------------------------------------
    // SHEATHING PROPERTIES
    // ----------------------------------------------------------

    tS: 12.5,
    fuSheathing: 4.5,
    eSheathing: 10445,
    gSheathing: 825,

    // ----------------------------------------------------------
    // FASTENER PROPERTIES
    // ----------------------------------------------------------

    dC: 4.064,
    sC: 152,
    nC: 50,
  });

  // Handle shear wall parameter changes
  const handleParameterChange = (field, value) => {
    setParameters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  // ============================================================
  // APP UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">

      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <header className="border-b border-gray-300 bg-white">

        <div className="mx-auto max-w-7xl px-8 py-5">

          <h1 className="text-2xl font-semibold text-blue-800">
            CFS Shear Wall Calculator
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Cold-Formed Steel Section & Lateral Strength Analysis
          </p>

        </div>

      </header>


      {/* ====================================================== */}
      {/* MAIN CONTENT                                           */}
      {/* ====================================================== */}

      <main className="mx-auto max-w-7xl px-8 py-8">


        {/* ==================================================== */}
        {/* SECTION DEFINITION                                   */}
        {/* ==================================================== */}

        <div className="mb-6">

          <h2 className="text-xl font-semibold text-gray-800">
            Section Definition
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the geometric properties of the cold-formed steel
            section.
          </p>

        </div>


        {/* ==================================================== */}
        {/* SECTION INPUT + DRAWING                              */}
        {/* ==================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* LEFT - INPUTS */}

          <SectionInput
            section={section}
            onChange={handleSectionChange}
          />


          {/* RIGHT - DRAWING */}

          <SectionDrawing
            section={section}
          />

        </div>


        {/* ==================================================== */}
        {/* SECTION PROPERTIES                                   */}
        {/* ==================================================== */}

        <SectionProperties
          section={section}
        />


        {/* ==================================================== */}
        {/* SHEAR WALL PARAMETERS                                */}
        {/* ==================================================== */}

        <ShearWallParameters
          parameters={parameters}
          onChange={handleParameterChange}
        />

        <Results />


      </main>

    </div>
  );
}

export default App;