import { useState } from "react";

import ShearWallParameters from "./components/ShearWallParameters";
import Results from "./components/Results";

import {
  calculateScrewLayout,
} from "./calculations/screwLayout";

import {
  calculateLateralStrength,
} from "./calculations/lateralStrength";

function App() {
  const [parameters, setParameters] = useState({
  /* ================================
     PANEL
  ================================= */

  panelHeight: 2438,
  panelLength: 1219,


  /* ================================
     STEEL
  ================================= */

  fySteel: 230,
  fuSteel: 344,

  // 2.03 × 10^5
  eSteel: 203000,

  tF: 1.12,

  poissonRatio: 0.02,


  /* ================================
     SHEATHING SIDE 1
  ================================= */

  sheathingConfiguration: "single",

  sheathingMaterial: "FCB",

  tS: 12.5,

  fuSheathing: 4.5,

  sheathingPoissonRatio: 0.02,

  // 1.0445 × 10^4
  eSheathing: 10445,

  // 8.25 × 10^2
  gSheathing: 825,


  /* ================================
     SHEATHING SIDE 2
  ================================= */

  sheathingMaterial2: "FCB",

  tS2: 12.5,

  fuSheathing2: 4.5,

  sheathingPoissonRatio2: 0.02,

  eSheathing2: 10445,

  gSheathing2: 825,


  /* ================================
     SCREWS
  ================================= */

  screwMode: "manual",

  screwType: "No. 8",

  dC: 4.064,

  nC: 50,

  specimenType: "control",

  perimeterSpacing: 152,

  fieldSpacing: 305,

  horizontalSpacing: 305,


  /* ================================
     TEMPORARY SCREW RESISTANCES
  ================================= */

  vrSScrew: 3256,

  vrPScrew: 1255,


  /* ================================
     FRAME
  ================================= */

  // 1.816 × 10^5
  endStudMomentOfInertia: 181600,

  // 5.124 × 10^4
  intermediateStudMomentOfInertia: 51240,

  numberOfIntermediateStuds: 1,

  nominalCompressionStrength: 50000,
});

  const [result, setResult] =
    useState(null);

  const [isCalculating, setIsCalculating] =
    useState(false);

  const handleParameterChange = (
    key,
    value
  ) => {
    setParameters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleCalculate = () => {
    setIsCalculating(true);

    try {
      // ==========================================
      // 1. CALCULATE SCREW LAYOUT
      // ==========================================

      const screwLayoutResult =
        calculateScrewLayout({
          mode:
            parameters.screwMode,

          panelHeight:
            parameters.panelHeight,

          panelLength:
            parameters.panelLength,

          totalScrews:
            parameters.nC,

          specimenType:
            parameters.specimenType,

          perimeterSpacing:
            parameters.perimeterSpacing,

          fieldSpacing:
            parameters.fieldSpacing,

          horizontalSpacing:
            parameters.horizontalSpacing,
        });

      if (!screwLayoutResult.success) {
        setResult(
          screwLayoutResult
        );

        return;
      }

      // ==========================================
      // 2. CONNECTION INPUTS
      // ==========================================

      const connection = {
        tS:
          parameters.tS,

        dC:
          parameters.dC,

        fuSheathing:
          parameters.fuSheathing,

        tF:
          parameters.tF,

        fuSteel:
          parameters.fuSteel,

        vrSScrew:
          parameters.vrSScrew,

        vrPScrew:
          parameters.vrPScrew,
      };

      // ==========================================
      // 3. SHEATHING INPUTS
      // ==========================================

      const sheathing = {
        thickness:
          parameters.tS,

        youngsModulus:
          parameters.eSheathing,

        shearModulus:
          parameters.gSheathing,

        screwSpacing:
          parameters.perimeterSpacing,
      };

      // ==========================================
      // 4. FRAME INPUTS
      // ==========================================

      const frame = {
        youngsModulus:
          parameters.eSteel,

        endStudMomentOfInertia:
          parameters.endStudMomentOfInertia,

        intermediateStudMomentOfInertia:
          parameters.intermediateStudMomentOfInertia,

        numberOfIntermediateStuds:
          parameters.numberOfIntermediateStuds,

        nominalCompressionStrength:
          parameters.nominalCompressionStrength,
      };

      // ==========================================
      // 5. MAIN CALCULATION
      // ==========================================

      const calculation =
        calculateLateralStrength({
          panelHeight:
            parameters.panelHeight,

          panelLength:
            parameters.panelLength,

          connection,

          screwLayout:
            screwLayoutResult,

          sheathing,

          frame,
        });

      setResult(
        calculation
      );
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        error:
          error.message ||
          "An unexpected calculation error occurred.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">

          <h1 className="text-2xl font-bold tracking-tight text-blue-700">
            CFS Shear Wall Calculator
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Lateral strength analysis of cold-formed steel shear wall panels
          </p>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* INPUT SECTION */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Shear Wall Parameters
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the panel, material, sheathing, screw and frame parameters.
            </p>

          </div>

          <div className="p-6">

            <ShearWallParameters
              parameters={parameters}
              onChange={
                handleParameterChange
              }
            />

            {/* CALCULATE BUTTON */}

            <div className="mt-8 border-t border-gray-200 pt-6">

              <button
                type="button"
                onClick={
                  handleCalculate
                }
                disabled={
                  isCalculating
                }
                className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCalculating
                  ? "Calculating..."
                  : "Calculate"}
              </button>

            </div>

          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

          <Results
            result={result}
          />

        </section>

      </main>
    </div>
  );
}

export default App;