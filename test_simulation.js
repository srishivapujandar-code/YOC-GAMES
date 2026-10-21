/**
 * Automated Simulation Test for Official LinkedIn Zip Puzzles
 */

import { PUZZLES } from './puzzles.js';

console.log("=== Testing Official LinkedIn Zip Puzzle Configurations ===");

for (const [lvlId, p] of Object.entries(PUZZLES)) {
  console.log(`\nValidating Level ${lvlId} (${p.name}, ${p.rows}x${p.cols}, Checkpoints: 1 to ${p.checkpoints.length}):`);
  
  // 1. Check total cells
  if (p.solution.length !== p.totalCells) {
    throw new Error(`Level ${lvlId} solution length (${p.solution.length}) does not match totalCells (${p.totalCells})`);
  }

  // 2. Check no duplicate cells in solution
  const visited = new Set();
  p.solution.forEach(([r, c]) => {
    const key = `${r},${c}`;
    if (visited.has(key)) throw new Error(`Level ${lvlId} solution contains duplicate cell (${r},${c})`);
    if (r < 0 || r >= p.rows || c < 0 || c >= p.cols) throw new Error(`Level ${lvlId} solution out of bounds (${r},${c})`);
    visited.add(key);
  });
  console.log(`- All ${p.totalCells} cells visited uniquely in solution.`);

  // 3. Check adjacency
  for (let i = 0; i < p.solution.length - 1; i++) {
    const [r1, c1] = p.solution[i];
    const [r2, c2] = p.solution[i+1];
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist !== 1) {
      throw new Error(`Level ${lvlId} step ${i} -> ${i+1} is not adjacent! (${r1},${c1}) to (${r2},${c2})`);
    }
  }
  console.log(`- All moves in solution are orthogonally adjacent.`);

  // 4. Check checkpoints sequence along solution path
  let curChk = 1;
  const chkMap = new Map();
  p.checkpoints.forEach(cp => {
    chkMap.set(`${cp.r},${cp.c}`, cp.num);
  });

  p.solution.forEach(([r, c], idx) => {
    const key = `${r},${c}`;
    if (chkMap.has(key)) {
      const num = chkMap.get(key);
      if (num !== curChk) {
        throw new Error(`Level ${lvlId} checkpoint order violated at step ${idx}! Expected ${curChk}, found ${num}`);
      }
      curChk++;
    }
  });

  if (curChk !== p.checkpoints.length + 1) {
    throw new Error(`Level ${lvlId} not all checkpoints were visited! Reached up to ${curChk - 1}`);
  }
  console.log(`- All checkpoints 1 through ${p.checkpoints.length} visited in exact ascending order.`);
}

console.log("\nALL OFFICIAL LINKEDIN ZIP PUZZLES 100% VERIFIED! 🚀");
