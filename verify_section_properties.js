/* global process */
import {
  calculateGenericSectionProperties,
  calculateSectionProperties,
  calculateISectionProperties,
  calculateGridSectionProperties,
} from './src/calculations/sectionProperties.js';

let allPassed = true;

function assertClose(name, actual, expected, tol = 1e-7) {
  const diff = Math.abs(actual - expected);
  const relDiff = expected !== 0 ? diff / Math.abs(expected) : diff;
  const passed = diff < tol || relDiff < tol;
  if (!passed) allPassed = false;
  console.log(
    `  ${name.padEnd(14)}: Actual = ${String(actual).padEnd(22)} | Expected = ${String(expected).padEnd(22)} | Diff = ${diff.toExponential(4)} ${passed ? '✓' : '✗ FAIL'}`
  );
  return passed;
}

console.log('========================================================================');
console.log('SECTION PROPERTIES VERIFICATION SUITE');
console.log('========================================================================\n');

// ------------------------------------------------------------------------
// TEST 0: USER MANDATORY TEST CASE (Web=200x8, Flanges=100x12 -> 3808 mm²)
// ------------------------------------------------------------------------
console.log('--- TEST 0: User Case (Web=200x8, Top Flange=100x12, Bottom Flange=100x12) ---');
const uNodes = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 0, y: 200 },
  { id: 3, x: 100, y: 200 },
  { id: 4, x: 100, y: 0 }
];
const uEdges = [
  { id: 1, startNode: 1, endNode: 2, thickness: 8 },  // Web L=200, t=8
  { id: 2, startNode: 2, endNode: 3, thickness: 12 }, // Top flange L=100, t=12
  { id: 3, startNode: 1, endNode: 4, thickness: 12 }  // Bottom flange L=100, t=12
];
const uGrid = calculateGridSectionProperties(uNodes, uEdges);

// Theoretical exact finite-thickness non-overlapping properties:
// Web: [0, 8] x [0, 200] -> area = 1600, x = 4, y = 100
// Top flange: [8, 100] x [188, 200] -> width = 92, height = 12, area = 1104, x = 54, y = 194
// Bottom flange: [8, 100] x [0, 12] -> width = 92, height = 12, area = 1104, x = 54, y = 6
const uExpectedElements = [
  { area: 1600, x: 4, y: 100, IxLocal: (8 * 200**3)/12, IyLocal: (200 * 8**3)/12 },
  { area: 1104, x: 54, y: 194, IxLocal: (92 * 12**3)/12, IyLocal: (12 * 92**3)/12 },
  { area: 1104, x: 54, y: 6, IxLocal: (92 * 12**3)/12, IyLocal: (12 * 92**3)/12 },
];
const uExpected = calculateGenericSectionProperties(uExpectedElements);

assertClose('Area', uGrid.area, 3808);
assertClose('Centroid X', uGrid.centroidX, uExpected.centroidX);
assertClose('Centroid Y', uGrid.centroidY, 100);
assertClose('Ix', uGrid.Ix, uExpected.Ix);
assertClose('Iy', uGrid.Iy, uExpected.Iy);

// ------------------------------------------------------------------------
// TEST 1: C-SECTION EQUIVALENCE (92 x 41 x 12.7 x 1.12)
// ------------------------------------------------------------------------
console.log('\n--- TEST 1: C-Section Equivalence (Web=92, Flange=41, Lip=12.7, t=1.12) ---');
const cSec = { webLength: 92, flangeWidth: 41, lipLength: 12.7, thickness: 1.12 };
const cPredefined = calculateSectionProperties(cSec);

const cNodes = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 0, y: 92 },
  { id: 3, x: 41, y: 92 },
  { id: 4, x: 41, y: 79.3 },
  { id: 5, x: 41, y: 0 },
  { id: 6, x: 41, y: 12.7 },
];
const cEdges = [
  { id: 1, startNode: 1, endNode: 2, thickness: 1.12 }, // Web
  { id: 2, startNode: 2, endNode: 3, thickness: 1.12 }, // Top Flange
  { id: 3, startNode: 3, endNode: 4, thickness: 1.12 }, // Top Lip
  { id: 4, startNode: 1, endNode: 5, thickness: 1.12 }, // Bottom Flange
  { id: 5, startNode: 5, endNode: 6, thickness: 1.12 }, // Bottom Lip
];
const cGrid = calculateGridSectionProperties(cNodes, cEdges);

assertClose('Area', cGrid.area, cPredefined.area);
assertClose('Centroid X', cGrid.centroidX, cPredefined.centroidX);
assertClose('Centroid Y', cGrid.centroidY, cPredefined.centroidY);
assertClose('Ix', cGrid.Ix, cPredefined.Ix);
assertClose('Iy', cGrid.Iy, cPredefined.Iy);

// ------------------------------------------------------------------------
// TEST 2: 3-SEGMENT OPEN C-SECTION (Web, Top Flange, Top Lip)
// ------------------------------------------------------------------------
console.log('\n--- TEST 2: 3-Segment Open Section ((0,0)->(0,92)->(41,92)->(41,79.3)) ---');
const hNodes = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 0, y: 92 },
  { id: 3, x: 41, y: 92 },
  { id: 4, x: 41, y: 79.3 },
];
const hEdges = [
  { id: 1, startNode: 1, endNode: 2, thickness: 1.12 },
  { id: 2, startNode: 2, endNode: 3, thickness: 1.12 },
  { id: 3, startNode: 3, endNode: 4, thickness: 1.12 },
];
const hGrid = calculateGridSectionProperties(hNodes, hEdges);
const expectedHalfElements = [
  { area: 1.12 * 92, x: 0.56, y: 46, IxLocal: (1.12 * 92**3)/12, IyLocal: (92 * 1.12**3)/12 },
  { area: 39.88 * 1.12, x: 21.06, y: 91.44, IxLocal: (39.88 * 1.12**3)/12, IyLocal: (1.12 * 39.88**3)/12 },
  { area: 1.12 * 12.7, x: 40.44, y: 84.53, IxLocal: (1.12 * 12.7**3)/12, IyLocal: (12.7 * 1.12**3)/12 },
];
const expectedHalf = calculateGenericSectionProperties(expectedHalfElements);
assertClose('Area', hGrid.area, expectedHalf.area);
assertClose('Centroid X', hGrid.centroidX, expectedHalf.centroidX);
assertClose('Centroid Y', hGrid.centroidY, expectedHalf.centroidY);
assertClose('Ix', hGrid.Ix, expectedHalf.Ix);
assertClose('Iy', hGrid.Iy, expectedHalf.Iy);

// ------------------------------------------------------------------------
// TEST 3: DIFFERENT THICKNESS (t = 1.5 mm)
// ------------------------------------------------------------------------
console.log('\n--- TEST 3: Different Thickness (t = 1.5 mm, Web=92, Flange=41, Lip=12.7) ---');
const cSec15 = { webLength: 92, flangeWidth: 41, lipLength: 12.7, thickness: 1.5 };
const cPre15 = calculateSectionProperties(cSec15);
const cEdges15 = cEdges.map(e => ({ ...e, thickness: 1.5 }));
const cGrid15 = calculateGridSectionProperties(cNodes, cEdges15);

assertClose('Area', cGrid15.area, cPre15.area);
assertClose('Centroid X', cGrid15.centroidX, cPre15.centroidX);
assertClose('Centroid Y', cGrid15.centroidY, cPre15.centroidY);
assertClose('Ix', cGrid15.Ix, cPre15.Ix);
assertClose('Iy', cGrid15.Iy, cPre15.Iy);

// ------------------------------------------------------------------------
// TEST 4: CLOSED HOLLOW RECTANGULAR BOX (92 x 41, t = 1.12 mm)
// ------------------------------------------------------------------------
console.log('\n--- TEST 4: Closed Hollow Box Section (92 x 41 outer, t = 1.12 mm) ---');
const boxNodes = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 92, y: 0 },
  { id: 3, x: 92, y: 41 },
  { id: 4, x: 0, y: 41 },
];
const boxEdges = [
  { id: 1, startNode: 1, endNode: 2, thickness: 1.12 },
  { id: 2, startNode: 2, endNode: 3, thickness: 1.12 },
  { id: 3, startNode: 3, endNode: 4, thickness: 1.12 },
  { id: 4, startNode: 4, endNode: 1, thickness: 1.12 },
];
const boxGrid = calculateGridSectionProperties(boxNodes, boxEdges);
const expectedBoxArea = 92 * 41 - (92 - 2 * 1.12) * (41 - 2 * 1.12);
const expectedBoxIx = (92 * 41**3 - (92 - 2 * 1.12) * (41 - 2 * 1.12)**3) / 12;
const expectedBoxIy = (41 * 92**3 - (41 - 2 * 1.12) * (92 - 2 * 1.12)**3) / 12;

assertClose('Area', boxGrid.area, expectedBoxArea);
assertClose('Centroid X', boxGrid.centroidX, 46);
assertClose('Centroid Y', boxGrid.centroidY, 20.5);
assertClose('Ix', boxGrid.Ix, expectedBoxIx);
assertClose('Iy', boxGrid.Iy, expectedBoxIy);

// ------------------------------------------------------------------------
// TEST 5: DIAGONAL ELEMENT
// ------------------------------------------------------------------------
console.log('\n--- TEST 5: Diagonal Segment ((0,0) -> (100, 100), t = 2.0 mm) ---');
const diagNodes = [
  { id: 1, x: 0, y: 0 },
  { id: 2, x: 100, y: 100 },
];
const diagEdges = [
  { id: 1, startNode: 1, endNode: 2, thickness: 2.0 },
];
const diagGrid = calculateGridSectionProperties(diagNodes, diagEdges);
const Ldiag = Math.hypot(100, 100);
const expectedDiagArea = Ldiag * 2.0;
const IPerpDiag = (2.0 * Math.pow(Ldiag, 3)) / 12;
const IParDiag = (Ldiag * Math.pow(2.0, 3)) / 12;
const expectedDiagIx = (IPerpDiag + IParDiag) / 2;
const expectedDiagIy = expectedDiagIx;

assertClose('Area', diagGrid.area, expectedDiagArea);
assertClose('Centroid X', diagGrid.centroidX, 50);
assertClose('Centroid Y', diagGrid.centroidY, 50);
assertClose('Ix', diagGrid.Ix, expectedDiagIx);
assertClose('Iy', diagGrid.Iy, expectedDiagIy);

// ------------------------------------------------------------------------
// TEST 6: BOOK 7.6.3 LIPPED CHANNEL (Unit-agnostic, R = 0.125)
// ------------------------------------------------------------------------
console.log('\n--- TEST 6: Book 7.6.3 Lipped Channel (Web=4, Flange=3, Lip=0.565, t=0.06, R=0.125) ---');
const book6Sec = {
  webLength: 4,
  flangeWidth: 3,
  lipLength: 0.565,
  thickness: 0.06,
  radius: 0.125,
};
const book6 = calculateSectionProperties(book6Sec);
const tolBook = 0.002; // 0.2% tolerance

assertClose('Area', book6.area, 0.6446, tolBook);
assertClose('Centroid X', book6.centroidX, 1.1237, tolBook);
assertClose('Ix', book6.Ix, 1.8134, tolBook);
assertClose('Iy', book6.Iy, 0.7924, tolBook);

// ------------------------------------------------------------------------
// TEST 7: BOOK 7.6.2 UNLIPPED CHANNEL (Unit-agnostic, R = 0.125)
// ------------------------------------------------------------------------
console.log('\n--- TEST 7: Book 7.6.2 Unlipped Channel (Web=6, Flange=2, Lip=0, t=0.125, R=0.125) ---');
const book7Sec = {
  webLength: 6,
  flangeWidth: 2,
  lipLength: 0,
  thickness: 0.125,
  radius: 0.125,
};
const book7 = calculateSectionProperties(book7Sec);

assertClose('Area', book7.area, 1.1986, tolBook);
assertClose('Centroid X', book7.centroidX, 0.4545, tolBook);
assertClose('Ix', book7.Ix, 6.1153, tolBook);
assertClose('Iy', book7.Iy, 0.4228, tolBook);

// ------------------------------------------------------------------------
// TEST 8: DEFAULT APP C (Web=92, Flange=41, Lip=10.5, t=1.12, R=2.0 mm)
// ------------------------------------------------------------------------
console.log('\n--- TEST 8: Default App C (Web=92, Flange=41, Lip=10.5, t=1.12, R=2.0) ---');
const app8Sec = {
  webLength: 92,
  flangeWidth: 41,
  lipLength: 10.5,
  thickness: 1.12,
  radius: 2.0,
};
const app8 = calculateSectionProperties(app8Sec);

assertClose('Area', app8.area, 210.969, 1e-3);
assertClose('Centroid X', app8.centroidX, 13.221, 1e-3);
assertClose('Centroid Y', app8.centroidY, 46.0, 1e-3);
assertClose('Ix', app8.Ix, 283876.4, 0.5);
assertClose('Iy', app8.Iy, 48956.5, 0.5);

// ------------------------------------------------------------------------
// TEST 9: BUILT-UP I-SECTION (Same section, R = 2.0 mm)
// ------------------------------------------------------------------------
console.log('\n--- TEST 9: Built-up I-Section (Web=92, Flange=41, Lip=10.5, t=1.12, R=2.0) ---');
const app9 = calculateISectionProperties(app8Sec);

assertClose('Area', app9.area, 421.937, 1e-3);
assertClose('Centroid X', app9.centroidX, 0, 1e-6);
assertClose('Ix', app9.Ix, 567752.8, 0.5);
assertClose('Iy', app9.Iy, 171667.5, 0.5);

// ------------------------------------------------------------------------
// TEST 10: REGRESSION TEST (Radius = 0 gives current results bit-for-bit)
// ------------------------------------------------------------------------
console.log('\n--- TEST 10: Regression (Web=92, Flange=41, Lip=10.5, t=1.12, R=0) ---');
const app10Sec = {
  webLength: 92,
  flangeWidth: 41,
  lipLength: 10.5,
  thickness: 1.12,
  radius: 0,
};
const app10 = calculateSectionProperties(app10Sec);

assertClose('Area', app10.area, 215.891, 1e-3);
assertClose('Ix', app10.Ix, 294292.5, 0.5);
assertClose('Iy', app10.Iy, 51278.9, 0.5);

console.log('\n========================================================================');
console.log(`ALL TESTS RESULT: ${allPassed ? 'ALL PASSED SUCCESSFULLY ✓' : 'SOME TESTS FAILED ✗'}`);
console.log('========================================================================');
process.exit(allPassed ? 0 : 1);
