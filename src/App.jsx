import { useState } from "react";
import TopNavigation from "./components/TopNavigation";
import SectionPropertiesPage from "./components/SectionPropertiesPage";
import ShearWallParameters from "./components/ShearWallParameters";
import { calculateScrewLayout } from "./calculations/screwLayout";
import { calculateLateralStrength } from "./calculations/lateralStrength";
import { calculateSectionFromInputs } from "./calculations/sectionProperties";

const DEFAULT_SECTION = {
  webLength: 92,
  flangeWidth: 41,
  lipLength: 12.7,
  thickness: 1.12,
};

const DEFAULT_NODES = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 92, y: 0 },
  { id: 3, x: 92, y: 41 },
  { id: 4, x: 0, y: 41 },
];

function steelG(eSteel, poissonRatio) {
  const E = Number(eSteel);
  const mu = Number(poissonRatio);
  if (!Number.isFinite(E) || !Number.isFinite(mu) || mu <= -1) {
    return 99509.804;
  }
  return Number((E / (2 * (1 + mu))).toFixed(3));
}

function App() {
  const [activeView, setActiveView] = useState("section");
  const [method, setMethod] = useState("selection");
  const [sectionType, setSectionType] = useState("C");
  const [section, setSection] = useState(DEFAULT_SECTION);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [edges, setEdges] = useState([]);
  const [plotted, setPlotted] = useState({ nodes: [], edges: [] });
  const [sectionResults, setSectionResults] = useState(null);
  const [sectionCalculated, setSectionCalculated] = useState(false);
  const [sectionStale, setSectionStale] = useState(false);
  const [sectionError, setSectionError] = useState("");

  const [parameters, setParameters] = useState({
    panelHeight: 2438,
    panelLength: 1219,
    fySteel: 230,
    fuSteel: 344,
    eSteel: 203000,
    gSteel: steelG(203000, 0.02),
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
    screwType: "No. 8",
    dC: 4.064,
    specimenType: "control",
    perimeterSpacing: 152,
    fieldSpacing: 305,
    horizontalSpacing: 305,
    vrSScrew: 3256,
    vrPScrew: 1255,
    numberOfEndCoupledStuds: 2,
    numberOfSingleStuds: 1,
    numberOfIntermediateStuds: 1,
    nominalCompressionStrength: 71166,
  });

  const [result, setResult] = useState(null);
  const [swStale, setSwStale] = useState(false);
  const [swError, setSwError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const invalidateSection = () => {
    setSectionCalculated(false);
    setSectionStale(Boolean(sectionResults));
    setResult(null);
    setSwStale(false);
  };

  const handleParameterChange = (key, value) => {
    setParameters((previous) => {
      const patch =
        typeof key === "object" && value === undefined ? key : { [key]: value };
      const next = { ...previous, ...patch };
      if (patch.numberOfSingleStuds !== undefined) {
        next.numberOfIntermediateStuds = patch.numberOfSingleStuds;
      }
      return next;
    });
    setSwStale(Boolean(result));
  };

  const handleSectionFieldChange = (key, value) => {
    setSection((previous) => ({ ...previous, [key]: value }));
    invalidateSection();
  };

  const handleCalculateSection = () => {
    const computed = calculateSectionFromInputs({
      method,
      sectionType,
      section,
      nodes,
      edges,
    });

    if (!computed || computed.success === false) {
      setSectionResults(null);
      setSectionCalculated(false);
      setSectionError(computed?.error || "Please enter valid section geometry.");
      return;
    }

    setSectionResults(computed);
    setSectionCalculated(true);
    setSectionStale(false);
    setSectionError("");

    if (computed.thickness) {
      setParameters((previous) => ({
        ...previous,
        tF: computed.thickness,
      }));
    }
  };

  const handleCalculateShearWall = () => {
    if (!sectionCalculated || !sectionResults) {
      setSwError("Complete section properties before calculating the shear wall.");
      return;
    }

    const h = Number(parameters.panelHeight);
    const l = Number(parameters.panelLength);
    const perimeter = Number(parameters.perimeterSpacing);
    const field = Number(parameters.fieldSpacing);

    if (![h, l, perimeter, field].every((v) => Number.isFinite(v) && v > 0)) {
      setSwError("Panel dimensions and screw spacings must be greater than zero.");
      return;
    }

    setIsCalculating(true);
    setSwError("");

    try {
      const screwLayoutResult = calculateScrewLayout({
        panelHeight: parameters.panelHeight,
        panelLength: parameters.panelLength,
        specimenType: parameters.specimenType,
        perimeterSpacing: parameters.perimeterSpacing,
        fieldSpacing: parameters.fieldSpacing,
        horizontalSpacing: parameters.horizontalSpacing,
      });

      if (!screwLayoutResult.success) {
        setResult(screwLayoutResult);
        return;
      }

      const screwLocations = screwLayoutResult.screwLocations;
      const totalScrews = screwLocations.length;

      const calculation = calculateLateralStrength({
        panelHeight: parameters.panelHeight,
        panelLength: parameters.panelLength,
        connection: {
          tS: parameters.tS,
          dC: parameters.dC,
          fuSheathing: parameters.fuSheathing,
          tF: parameters.tF,
          fuSteel: parameters.fuSteel,
          vrSScrew: parameters.vrSScrew,
          vrPScrew: parameters.vrPScrew,
        },
        screwLayout: {
          ...screwLayoutResult,
          totalScrews,
          screwLocations,
        },
        sheathing: {
          thickness: parameters.tS,
          youngsModulus: parameters.eSheathing,
          shearModulus: parameters.gSheathing,
          screwSpacing: parameters.perimeterSpacing,
        },
        frame: {
          youngsModulus: parameters.eSteel,
          endStudMomentOfInertia: sectionResults.IF_end,
          intermediateStudMomentOfInertia: sectionResults.IF_intermediate,
          numberOfEndCoupledStuds: parameters.numberOfEndCoupledStuds,
          numberOfSingleStuds: parameters.numberOfSingleStuds,
          numberOfIntermediateStuds: parameters.numberOfSingleStuds,
          nominalCompressionStrength: parameters.nominalCompressionStrength,
        },
        section: sectionResults,
      });

      if (calculation.success) {
        calculation.screwLocations = screwLocations;
        calculation.totalScrews = totalScrews;
        calculation.screwDetails = (calculation.screwDetails || []).map(
          (screw, index) => ({
            ...screw,
            number: index + 1,
            location: screwLocations[index]?.location || screw.location,
            x: screwLocations[index]?.x ?? screw.x,
            y: screwLocations[index]?.y ?? screw.y,
          })
        );
      }

      setResult(calculation);
      setSwStale(false);
    } catch (error) {
      setResult({
        success: false,
        error: error.message || "An unexpected calculation error occurred.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#e8eef4] text-slate-900">
      <TopNavigation
        activeView={activeView}
        sectionCalculated={sectionCalculated}
        onChangeView={setActiveView}
      />
      <main className="min-h-0 flex-1 overflow-hidden">
        {activeView === "section" ? (
          <SectionPropertiesPage
            method={method}
            sectionType={sectionType}
            section={section}
            nodes={nodes}
            edges={edges}
            plotted={plotted}
            results={sectionResults}
            error={sectionError}
            stale={sectionStale}
            sectionCalculated={sectionCalculated}
            onChangeMethod={(next) => {
              setMethod(next);
              invalidateSection();
            }}
            onChangeType={(next) => {
              setSectionType(next);
              invalidateSection();
            }}
            onChangeSection={handleSectionFieldChange}
            onChangeNodes={setNodes}
            onChangeEdges={setEdges}
            onPlot={(nextNodes, nextEdges) =>
              setPlotted({
                nodes: nextNodes,
                edges: nextEdges,
              })
            }
            onGeometryChange={invalidateSection}
            onCalculate={handleCalculateSection}
            onNext={() => {
              if (sectionCalculated) {
                setActiveView("sw");
              }
            }}
          />
        ) : (
          <ShearWallParameters
            parameters={parameters}
            onChange={handleParameterChange}
            onCalculate={handleCalculateShearWall}
            isCalculating={isCalculating}
            result={result}
            stale={swStale}
            error={swError}
            sectionResults={sectionResults}
            onBack={() => setActiveView("section")}
          />
        )}
      </main>
    </div>
  );
}

export default App;
