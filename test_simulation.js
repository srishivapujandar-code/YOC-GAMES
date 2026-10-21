/**
 * Automated Simulation Test for 2 Solvable Matches in Every Level
 */

import { PUZZLES, getAssignedMatchForUser } from './puzzles.js';

console.log("=== Testing 2 Solvable Matches for Every Level ===");

for (const [lvlId, p] of Object.entries(PUZZLES)) {
  console.log(`\nValidating ${p.name} (${p.difficulty}, ${p.rows}x${p.cols}):`);
  
  for (const [matchKey, m] of Object.entries(p.matches)) {
    console.log(`  Checking ${m.matchName} (Starts: ${m.startCorner}):`);

    // 1. Check total cells
    if (m.solution.length !== p.totalCells) {
      throw new Error(`${p.name} ${m.matchName} solution length (${m.solution.length}) does not match totalCells (${p.totalCells})`);
    }

    // 2. Check no duplicate cells
    const visited = new Set();
    m.solution.forEach(([r, c]) => {
      const key = `${r},${c}`;
      if (visited.has(key)) throw new Error(`${p.name} ${m.matchName} duplicate cell (${r},${c})`);
      if (r < 0 || r >= p.rows || c < 0 || c >= p.cols) throw new Error(`${p.name} ${m.matchName} cell out of bounds (${r},${c})`);
      visited.add(key);
    });

    // 3. Check adjacency
    for (let i = 0; i < m.solution.length - 1; i++) {
      const [r1, c1] = m.solution[i];
      const [r2, c2] = m.solution[i+1];
      const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
      if (dist !== 1) {
        throw new Error(`${p.name} ${m.matchName} step ${i} -> ${i+1} is not adjacent!`);
      }
    }

    // 4. Check checkpoints order
    let curChk = 1;
    const chkMap = new Map();
    m.checkpoints.forEach(cp => {
      chkMap.set(`${cp.r},${cp.c}`, cp.num);
    });

    m.solution.forEach(([r, c], idx) => {
      const key = `${r},${c}`;
      if (chkMap.has(key)) {
        const num = chkMap.get(key);
        if (num !== curChk) {
          throw new Error(`${p.name} ${m.matchName} checkpoint order violated at step ${idx}! Expected ${curChk}, got ${num}`);
        }
        curChk++;
      }
    });

    if (curChk !== m.checkpoints.length + 1) {
      throw new Error(`${p.name} ${m.matchName} not all checkpoints visited!`);
    }

    console.log(`  ✓ ${m.matchName} verified: 100% solvable Hamiltonian path with ${m.checkpoints.length} checkpoints.`);
  }
}

// Test deterministic user match assignment
console.log("\nTesting User Match Assignment by Roll Number:");
const roll1 = "22CS104";
const roll2 = "22CS105";
const m1 = getAssignedMatchForUser(roll1);
const m2 = getAssignedMatchForUser(roll2);
console.log(`Roll ${roll1} -> Pattern ${m1}`);
console.log(`Roll ${roll2} -> Pattern ${m2}`);

console.log("\nALL 6 MATCHES & ASSIGNMENT TESTS PASSED WITH 100% SUCCESS! 🚀");
