import React from "react";
import ScientificInput from "./ScientificInput";

/* -------------------------------------------------------
   NORMAL INPUT
------------------------------------------------------- */

function ParameterInput({
  label,
  value,
  unit,
  onChange,
  type = "number",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex">
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="w-full rounded-l-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        />

        {unit && (
          <span className="inline-flex min-w-[58px] items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-2 text-xs font-medium text-gray-600">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   SECTION TITLE
------------------------------------------------------- */

function SectionTitle({ children }) {
  return (
    <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
      {children}
    </h4>
  );
}

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */

export default function ShearWallParameters({
  parameters,
  onChange,
}) {
  /* -----------------------------------------------------
     SHEATHING MODULUS CALCULATION

     E = 2G(1 + μ)

     G = E / [2(1 + μ)]
  ----------------------------------------------------- */

  const calculateSheathingModulus = (
    changedField,
    value
  ) => {
    const mu = Number(
      parameters.sheathingPoissonRatio
    );

    const numericValue = Number(value);

    /*
     * If input is temporarily incomplete while typing,
     * simply store the value.
     */
    if (
      !Number.isFinite(mu) ||
      mu <= -1 ||
      !Number.isFinite(numericValue) ||
      numericValue <= 0
    ) {
      onChange(
        changedField,
        value
      );

      return;
    }

    /* ---------------------------------------------------
       User entered Young's Modulus ES

       Calculate:
       GS = ES / [2(1 + μ)]
    --------------------------------------------------- */

    if (
      changedField === "eSheathing"
    ) {
      const g =
        numericValue /
        (2 * (1 + mu));

      onChange(
        "eSheathing",
        value
      );

      onChange(
        "gSheathing",
        Number(g.toFixed(3))
      );
    }

    /* ---------------------------------------------------
       User entered Shear Modulus GS

       Calculate:
       ES = 2GS(1 + μ)
    --------------------------------------------------- */

    if (
      changedField === "gSheathing"
    ) {
      const e =
        2 *
        numericValue *
        (1 + mu);

      onChange(
        "gSheathing",
        value
      );

      onChange(
        "eSheathing",
        Number(e.toFixed(3))
      );
    }
  };

  return (
    <div className="space-y-8">

      {/* =================================================
          PANEL GEOMETRY
      ================================================= */}

      <div>
        <SectionTitle>
          Panel Geometry
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <ParameterInput
            label="Panel Height (h)"
            value={parameters.panelHeight}
            unit="mm"
            onChange={(value) =>
              onChange(
                "panelHeight",
                value
              )
            }
          />

          <ParameterInput
            label="Panel Length (l)"
            value={parameters.panelLength}
            unit="mm"
            onChange={(value) =>
              onChange(
                "panelLength",
                value
              )
            }
          />

        </div>
      </div>


      {/* =================================================
          STEEL MATERIAL PROPERTIES
      ================================================= */}

      <div>
        <SectionTitle>
          Steel Material Properties
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Fy */}

          <ParameterInput
            label="Yield Strength (Fy)"
            value={parameters.fySteel}
            unit="MPa"
            onChange={(value) =>
              onChange(
                "fySteel",
                value
              )
            }
          />


          {/* Fu */}

          <ParameterInput
            label="Tensile Strength (Fu)"
            value={parameters.fuSteel}
            unit="MPa"
            onChange={(value) =>
              onChange(
                "fuSteel",
                value
              )
            }
          />


          {/* EF */}

          <ScientificInput
            label="Young's Modulus (EF)"
            value={parameters.eSteel}
            unit="MPa"
            onChange={(value) =>
              onChange(
                "eSteel",
                value
              )
            }
          />


          {/* Steel Thickness */}

          <ParameterInput
            label="Steel Thickness (tF)"
            value={parameters.tF}
            unit="mm"
            onChange={(value) =>
              onChange(
                "tF",
                value
              )
            }
          />


          {/* Poisson Ratio */}

          <ParameterInput
            label="Poisson's Ratio (μ)"
            value={parameters.poissonRatio}
            unit=""
            onChange={(value) =>
              onChange(
                "poissonRatio",
                value
              )
            }
          />

        </div>
      </div>


      {/* =================================================
          SHEATHING
      ================================================= */}

      <div>
        <SectionTitle>
          Sheathing
        </SectionTitle>


        {/* SHEATHING CONFIGURATION */}

        <div className="mb-5">

          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Sheathing Configuration
          </label>

          <select
            value={
              parameters.sheathingConfiguration ??
              "single"
            }
            onChange={(e) =>
              onChange(
                "sheathingConfiguration",
                e.target.value
              )
            }
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="single">
              Single Side
            </option>

            <option value="double">
              Double Side
            </option>
          </select>

        </div>


        {/* =================================================
            SIDE 1
        ================================================= */}

        <div className="rounded-md border border-gray-200 bg-gray-50 p-5">

          <h5 className="mb-4 text-sm font-semibold text-gray-800">
            Side 1
          </h5>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* Material */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Sheathing Material
              </label>

              <select
                value={
                  parameters.sheathingMaterial ??
                  "FCB"
                }
                onChange={(e) =>
                  onChange(
                    "sheathingMaterial",
                    e.target.value
                  )
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >

                <option value="FCB">
                  FCB
                </option>

                <option value="CSB">
                  CSB
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            {/* Thickness */}

            <ParameterInput
              label="Sheathing Thickness (tS)"
              value={parameters.tS}
              unit="mm"
              onChange={(value) =>
                onChange(
                  "tS",
                  value
                )
              }
            />


            {/* Bearing Strength */}

            <ParameterInput
              label="Bearing Strength (Fu-sheathing)"
              value={
                parameters.fuSheathing
              }
              unit="MPa"
              onChange={(value) =>
                onChange(
                  "fuSheathing",
                  value
                )
              }
            />


            {/* Poisson Ratio */}

            <ParameterInput
              label="Poisson's Ratio (μ)"
              value={
                parameters.sheathingPoissonRatio
              }
              unit=""
              onChange={(value) =>
                onChange(
                  "sheathingPoissonRatio",
                  value
                )
              }
            />


            {/* Young's Modulus */}

            <ScientificInput
              label="Young's Modulus (ES)"
              value={
                parameters.eSheathing
              }
              unit="MPa"
              onChange={(value) =>
                calculateSheathingModulus(
                  "eSheathing",
                  value
                )
              }
            />


            {/* Shear Modulus */}

            <ScientificInput
              label="Shear Modulus (GS)"
              value={
                parameters.gSheathing
              }
              unit="MPa"
              onChange={(value) =>
                calculateSheathingModulus(
                  "gSheathing",
                  value
                )
              }
            />

          </div>
        </div>


        {/* =================================================
            SIDE 2
        ================================================= */}

        {parameters.sheathingConfiguration ===
          "double" && (

          <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-5">

            <h5 className="mb-4 text-sm font-semibold text-gray-800">
              Side 2
            </h5>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* Material */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sheathing Material
                </label>

                <select
                  value={
                    parameters.sheathingMaterial2 ??
                    "FCB"
                  }
                  onChange={(e) =>
                    onChange(
                      "sheathingMaterial2",
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >

                  <option value="FCB">
                    FCB
                  </option>

                  <option value="CSB">
                    CSB
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              {/* Thickness */}

              <ParameterInput
                label="Sheathing Thickness (tS)"
                value={
                  parameters.tS2
                }
                unit="mm"
                onChange={(value) =>
                  onChange(
                    "tS2",
                    value
                  )
                }
              />


              {/* Bearing Strength */}

              <ParameterInput
                label="Bearing Strength (Fu-sheathing)"
                value={
                  parameters.fuSheathing2
                }
                unit="MPa"
                onChange={(value) =>
                  onChange(
                    "fuSheathing2",
                    value
                  )
                }
              />


              {/* Poisson Ratio */}

              <ParameterInput
                label="Poisson's Ratio (μ)"
                value={
                  parameters.sheathingPoissonRatio2
                }
                unit=""
                onChange={(value) =>
                  onChange(
                    "sheathingPoissonRatio2",
                    value
                  )
                }
              />


              {/* Young's Modulus */}

              <ScientificInput
                label="Young's Modulus (ES)"
                value={
                  parameters.eSheathing2
                }
                unit="MPa"
                onChange={(value) =>
                  onChange(
                    "eSheathing2",
                    value
                  )
                }
              />


              {/* Shear Modulus */}

              <ScientificInput
                label="Shear Modulus (GS)"
                value={
                  parameters.gSheathing2
                }
                unit="MPa"
                onChange={(value) =>
                  onChange(
                    "gSheathing2",
                    value
                  )
                }
              />

            </div>
          </div>
        )}

      </div>


      {/* =================================================
          SCREWS
      ================================================= */}

      <div>

        <SectionTitle>
          Screw / Fastener Information
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


          {/* Number of screws */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Number of Screws
            </label>

            <select
              value={
                parameters.screwMode ??
                "manual"
              }
              onChange={(e) =>
                onChange(
                  "screwMode",
                  e.target.value
                )
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >

              <option value="manual">
                I have the total number of screws
              </option>

              <option value="automatic">
                Calculate automatically
              </option>

            </select>

          </div>


          {/* Screw Type */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Screw Type
            </label>

            <input
              value={
                parameters.screwType ??
                "No. 8"
              }
              onChange={(e) =>
                onChange(
                  "screwType",
                  e.target.value
                )
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />

          </div>


          {/* Diameter */}

          <ParameterInput
            label="Screw Diameter (dC)"
            value={parameters.dC}
            unit="mm"
            onChange={(value) =>
              onChange(
                "dC",
                value
              )
            }
          />


          {/* Manual / Automatic */}

          {parameters.screwMode ===
            "manual" ? (

            <ParameterInput
              label="Total Number of Screws (nC)"
              value={
                parameters.nC
              }
              unit="No."
              onChange={(value) =>
                onChange(
                  "nC",
                  value
                )
              }
            />

          ) : (

            <div>

              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Specimen Type
              </label>

              <select
                value={
                  parameters.specimenType ??
                  "control"
                }
                onChange={(e) =>
                  onChange(
                    "specimenType",
                    e.target.value
                  )
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >

                <option value="control">
                  Control Specimen
                </option>

                <option value="intermediateBracing">
                  Intermediate Bracing Specimen
                </option>

              </select>

            </div>
          )}

        </div>


        {/* =================================================
            AUTOMATIC SCREW LAYOUT
        ================================================= */}

        {parameters.screwMode ===
          "automatic" && (

          <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-5">

            <h5 className="mb-4 text-sm font-semibold text-gray-800">
              Screw Layout
            </h5>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">


              {/* Perimeter */}

              <ParameterInput
                label="Perimeter Screw Spacing"
                value={
                  parameters.perimeterSpacing
                }
                unit="mm"
                onChange={(value) =>
                  onChange(
                    "perimeterSpacing",
                    value
                  )
                }
              />


              {/* Vertical */}

              <ParameterInput
                label="Vertical Intermediate Spacing"
                value={
                  parameters.fieldSpacing
                }
                unit="mm"
                onChange={(value) =>
                  onChange(
                    "fieldSpacing",
                    value
                  )
                }
              />


              {/* Horizontal */}

              {parameters.specimenType ===
                "intermediateBracing" && (

                <ParameterInput
                  label="Horizontal Intermediate Spacing"
                  value={
                    parameters.horizontalSpacing
                  }
                  unit="mm"
                  onChange={(value) =>
                    onChange(
                      "horizontalSpacing",
                      value
                    )
                  }
                />

              )}

            </div>
          </div>
        )}

      </div>


      {/* =================================================
          SCREW RESISTANCES
      ================================================= */}

      <div>

        <SectionTitle>
          Screw Resistance
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <ParameterInput
            label="Screw Shear Resistance"
            value={
              parameters.vrSScrew
            }
            unit="N"
            onChange={(value) =>
              onChange(
                "vrSScrew",
                value
              )
            }
          />

          <ParameterInput
            label="Screw Pullout Resistance"
            value={
              parameters.vrPScrew
            }
            unit="N"
            onChange={(value) =>
              onChange(
                "vrPScrew",
                value
              )
            }
          />

        </div>
      </div>


      {/* =================================================
          FRAME PARAMETERS
      ================================================= */}

      <div>

        <SectionTitle>
          Frame Parameters
        </SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">


          {/* End Stud I */}

          <ScientificInput
            label="End Stud Moment of Inertia (IF)"
            value={
              parameters.endStudMomentOfInertia
            }
            unit="mm⁴"
            onChange={(value) =>
              onChange(
                "endStudMomentOfInertia",
                value
              )
            }
          />


          {/* Intermediate Stud I */}

          <ScientificInput
            label="Intermediate Stud Moment of Inertia (IF)"
            value={
              parameters.intermediateStudMomentOfInertia
            }
            unit="mm⁴"
            onChange={(value) =>
              onChange(
                "intermediateStudMomentOfInertia",
                value
              )
            }
          />


          {/* Number of intermediate studs */}

          <ParameterInput
            label="Intermediate Studs"
            value={
              parameters.numberOfIntermediateStuds
            }
            unit="No."
            onChange={(value) =>
              onChange(
                "numberOfIntermediateStuds",
                value
              )
            }
          />


          {/* Pn */}

          <ParameterInput
            label="Nominal Compression Strength (Pn)"
            value={
              parameters.nominalCompressionStrength
            }
            unit="N"
            onChange={(value) =>
              onChange(
                "nominalCompressionStrength",
                value
              )
            }
          />

        </div>
      </div>

    </div>
  );
}