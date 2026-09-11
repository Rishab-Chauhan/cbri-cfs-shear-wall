import { useMemo, useState } from "react";

import ShearWallParameters from "./components/ShearWallParameters";
import Results from "./components/Results";
import SectionDrawing from "./components/SectionDrawing";
import SectionInput from "./components/SectionInput";
import SectionProperties from "./components/SectionProperties";
import { calculateScrewLayout } from "./calculations/screwLayout";
import { calculateLateralStrength } from "./calculations/lateralStrength";
import { calculateSectionProperties } from "./calculations/sectionProperties";

function App() {
  const [parameters, setParameters] = useState({
    panelHeight: 2438,
    panelLength: 1219,

    fySteel: 230,
    fuSteel: 344,
    eSteel: 203000,
    tF: 1.12,
    poissonRatio: 0.02,

    sheathingConfiguration: "single",
    sheathingMaterial: "FCB",
    tS: 12.5,
    fuSheathing: 4.5,
    sheathingPoissonRatio: 0.02,
    eSheathing: 10445,
    gSheathing: 825,

    sheathingMaterial2: "FCB",
    tS2: 12.5,
    fuSheathing2: 4.5,
    sheathingPoissonRatio2: 0.02,
    eSheathing2: 10445,
    gSheathing2: 825,

    screwMode: "automatic",
    screwType: "No. 8",
    dC: 4.064,
    nC: 50,
    specimenType: "control",
    perimeterSpacing: 152,
    fieldSpacing: 305,
    horizontalSpacing: 305,

    vrSScrew: 3256,
    vrPScrew: 1255,

    numberOfIntermediateStuds: 1,
    nominalCompressionStrength: 71166,
  });

  const [section, setSection] = useState({
    webLength: 92,
    flangeWidth: 41,
    lipLength: 12.7,
    thickness: 1.12,
    radius: 0,
  });

  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const sectionProperties = useMemo(
    () => calculateSectionProperties(section),
    [section]
  );

  const handleParameterChange = (key, value) => {
    setParameters((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (key === "tF") {
      setSection((previous) => ({
        ...previous,
        thickness: value,
      }));
    }
  };

  const handleSectionChange = (key, value) => {
    setSection((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (key === "thickness") {
      setParameters((previous) => ({
        ...previous,
        tF: value,
      }));
    }
  };

  const handleCalculate = () => {
    setIsCalculating(true);

    try {
      const properties = calculateSectionProperties(section);

      if (!properties) {
        setResult({
          success: false,
          error: "Please enter valid C-section dimensions.",
        });
        return;
      }

      const screwLayoutResult = calculateScrewLayout({
        mode: parameters.screwMode,
        panelHeight: parameters.panelHeight,
        panelLength: parameters.panelLength,
        totalScrews: parameters.nC,
        specimenType: parameters.specimenType,
        perimeterSpacing: parameters.perimeterSpacing,
        fieldSpacing: parameters.fieldSpacing,
        horizontalSpacing: parameters.horizontalSpacing,
      });

      if (!screwLayoutResult.success) {
        setResult(screwLayoutResult);
        return;
      }

      const connection = {
        tS: parameters.tS,
        dC: parameters.dC,
        fuSheathing: parameters.fuSheathing,
        tF: parameters.tF,
        fuSteel: parameters.fuSteel,
        vrSScrew: parameters.vrSScrew,
        vrPScrew: parameters.vrPScrew,
      };

      const sheathing = {
        thickness: parameters.tS,
        youngsModulus: parameters.eSheathing,
        shearModulus: parameters.gSheathing,
        screwSpacing: parameters.perimeterSpacing,
      };

      const frame = {
        youngsModulus: parameters.eSteel,
        endStudMomentOfInertia: properties.IF_end,
        intermediateStudMomentOfInertia: properties.IF_intermediate,
        numberOfIntermediateStuds: parameters.numberOfIntermediateStuds,
        nominalCompressionStrength: parameters.nominalCompressionStrength,
      };

      const calculation = calculateLateralStrength({
        panelHeight: parameters.panelHeight,
        panelLength: parameters.panelLength,
        connection,
        screwLayout: screwLayoutResult,
        sheathing,
        frame,
        section: properties,
      });

      setResult(calculation);
    } catch (error) {
      console.error(error);
      setResult({
        success: false,
        error: error.message || "An unexpected calculation error occurred.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight text-blue-700">
            CFS Shear Wall Calculator
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Martinez thesis simplified procedure — C-section properties,
            screw coordinates, and lateral strength
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              CFS C-Section
            </h2>
         
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            <SectionInput
              section={section}
              onChange={handleSectionChange}
            />
            <SectionDrawing section={section} />
          </div>

          <div className="border-t border-gray-200 p-6">
            <SectionProperties section={section} />
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Shear Wall Parameters
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the panel, material, sheathing and screw parameters. Stud
              moments of inertia come from the C-section above.
            </p>
          </div>

          <div className="p-6">
            <ShearWallParameters
              parameters={parameters}
              onChange={handleParameterChange}
              sectionProperties={sectionProperties}
            />
          </div>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCalculating ? "Calculating..." : "Calculate"}
          </button>
        </div>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <Results result={result} />
        </section>
      </main>
    </div>
  );
}

export default App;
