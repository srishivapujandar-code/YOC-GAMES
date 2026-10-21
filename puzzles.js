/**
 * YOC GAMES - Official LinkedIn Zip Puzzle Configurations
 * 
 * Features Two Distinct Solvable Matches/Patterns for Every Level:
 * - Match 1: Pattern Alpha
 * - Match 2: Pattern Beta
 * 
 * Every user gets a different pattern automatically based on their Roll Number,
 * preventing adjacent players from copying during events.
 */

export const PUZZLES = {
  1: {
    id: 1,
    name: "Level 1: Cadet",
    difficulty: "EASY",
    rows: 4,
    cols: 4,
    totalCells: 16,
    baseMarks: 100,
    timeLimitSeconds: 120,
    maxBonusMarks: 50,
    description: "4x4 Grid. Connect 1 to 6 covering all 16 squares.",
    matches: {
      A: {
        matchId: 'A',
        matchName: "Match 1: Pattern Alpha",
        startCorner: "Top-Left",
        checkpoints: [
          { r: 0, c: 0, num: 1 },
          { r: 2, c: 1, num: 2 },
          { r: 3, c: 1, num: 3 },
          { r: 2, c: 3, num: 4 },
          { r: 1, c: 3, num: 5 },
          { r: 0, c: 1, num: 6 }
        ],
        solution: [
          [0, 0], [1, 0], [1, 1], [2, 1],
          [2, 0], [3, 0], [3, 1], [3, 2],
          [3, 3], [2, 3], [2, 2], [1, 2],
          [1, 3], [0, 3], [0, 2], [0, 1]
        ]
      },
      B: {
        matchId: 'B',
        matchName: "Match 2: Pattern Beta",
        startCorner: "Bottom-Right",
        checkpoints: [
          { r: 3, c: 3, num: 1 },
          { r: 1, c: 2, num: 2 },
          { r: 0, c: 2, num: 3 },
          { r: 1, c: 0, num: 4 },
          { r: 2, c: 0, num: 5 },
          { r: 3, c: 2, num: 6 }
        ],
        solution: [
          [3, 3], [2, 3], [2, 2], [1, 2],
          [1, 3], [0, 3], [0, 2], [0, 1],
          [0, 0], [1, 0], [1, 1], [2, 1],
          [2, 0], [3, 0], [3, 1], [3, 2]
        ]
      }
    }
  },

  2: {
    id: 2,
    name: "Level 2: Navigator",
    difficulty: "MEDIUM",
    rows: 5,
    cols: 5,
    totalCells: 25,
    baseMarks: 200,
    timeLimitSeconds: 180,
    maxBonusMarks: 100,
    description: "5x5 Grid. Connect 1 to 10 covering all 25 squares.",
    matches: {
      A: {
        matchId: 'A',
        matchName: "Match 1: Pattern Alpha",
        startCorner: "Top-Left",
        checkpoints: [
          { r: 0, c: 0, num: 1 },
          { r: 0, c: 1, num: 2 },
          { r: 0, c: 3, num: 3 },
          { r: 2, c: 2, num: 4 },
          { r: 2, c: 1, num: 5 },
          { r: 3, c: 0, num: 6 },
          { r: 4, c: 2, num: 7 },
          { r: 3, c: 4, num: 8 },
          { r: 2, c: 3, num: 9 },
          { r: 0, c: 4, num: 10 }
        ],
        solution: [
          [0, 0], [1, 0], [1, 1], [0, 1], [0, 2],
          [0, 3], [1, 3], [1, 2], [2, 2], [3, 2],
          [3, 1], [2, 1], [2, 0], [3, 0], [4, 0],
          [4, 1], [4, 2], [4, 3], [4, 4], [3, 4],
          [3, 3], [2, 3], [2, 4], [1, 4], [0, 4]
        ]
      },
      B: {
        matchId: 'B',
        matchName: "Match 2: Pattern Beta",
        startCorner: "Bottom-Left",
        checkpoints: [
          { r: 4, c: 0, num: 1 },
          { r: 3, c: 0, num: 2 },
          { r: 1, c: 0, num: 3 },
          { r: 0, c: 2, num: 4 },
          { r: 2, c: 1, num: 5 },
          { r: 2, c: 3, num: 6 },
          { r: 0, c: 4, num: 7 },
          { r: 3, c: 4, num: 8 },
          { r: 4, c: 3, num: 9 },
          { r: 4, c: 2, num: 10 }
        ],
        solution: [
          [4, 0], [4, 1], [3, 1], [3, 0], [2, 0],
          [1, 0], [0, 0], [0, 1], [0, 2], [1, 2],
          [1, 1], [2, 1], [2, 2], [2, 3], [1, 3],
          [0, 3], [0, 4], [1, 4], [2, 4], [3, 4],
          [4, 4], [4, 3], [3, 3], [3, 2], [4, 2]
        ]
      }
    }
  },

  3: {
    id: 3,
    name: "Level 3: Grandmaster",
    difficulty: "HARD",
    rows: 6,
    cols: 6,
    totalCells: 36,
    baseMarks: 350,
    timeLimitSeconds: 240,
    maxBonusMarks: 150,
    description: "6x6 Grid. Connect 1 to 15 covering all 36 squares.",
    matches: {
      A: {
        matchId: 'A',
        matchName: "Match 1: Pattern Alpha",
        startCorner: "Top-Left",
        checkpoints: [
          { r: 0, c: 0, num: 1 },
          { r: 1, c: 1, num: 2 },
          { r: 0, c: 3, num: 3 },
          { r: 1, c: 5, num: 4 },
          { r: 1, c: 3, num: 5 },
          { r: 2, c: 2, num: 6 },
          { r: 3, c: 4, num: 7 },
          { r: 3, c: 5, num: 8 },
          { r: 5, c: 5, num: 9 },
          { r: 4, c: 4, num: 10 },
          { r: 5, c: 2, num: 11 },
          { r: 5, c: 1, num: 12 },
          { r: 4, c: 0, num: 13 },
          { r: 3, c: 1, num: 14 },
          { r: 1, c: 0, num: 15 }
        ],
        solution: [
          [0, 0], [0, 1], [1, 1], [1, 2], [0, 2], [0, 3],
          [0, 4], [0, 5], [1, 5], [1, 4], [1, 3], [2, 3],
          [2, 2], [3, 2], [3, 3], [3, 4], [2, 4], [2, 5],
          [3, 5], [4, 5], [5, 5], [5, 4], [4, 4], [4, 3],
          [5, 3], [5, 2], [4, 2], [4, 1], [5, 1], [5, 0],
          [4, 0], [3, 0], [3, 1], [2, 1], [2, 0], [1, 0]
        ]
      },
      B: {
        matchId: 'B',
        matchName: "Match 2: Pattern Beta",
        startCorner: "Bottom-Right",
        checkpoints: [
          { r: 5, c: 5, num: 1 },
          { r: 3, c: 5, num: 2 },
          { r: 4, c: 3, num: 3 },
          { r: 3, c: 1, num: 4 },
          { r: 3, c: 3, num: 5 },
          { r: 2, c: 2, num: 6 },
          { r: 1, c: 2, num: 7 },
          { r: 2, c: 4, num: 8 },
          { r: 1, c: 5, num: 9 },
          { r: 0, c: 4, num: 10 },
          { r: 0, c: 1, num: 11 },
          { r: 2, c: 0, num: 12 },
          { r: 4, c: 0, num: 13 },
          { r: 5, c: 1, num: 14 },
          { r: 5, c: 4, num: 15 }
        ],
        solution: [
          [5, 5], [4, 5], [3, 5], [3, 4], [4, 4], [4, 3],
          [4, 2], [4, 1], [3, 1], [3, 2], [3, 3], [2, 3],
          [2, 2], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4],
          [2, 4], [2, 5], [1, 5], [0, 5], [0, 4], [0, 3],
          [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0],
          [4, 0], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4]
        ]
      }
    }
  }
};

/**
 * Assigns Match 'A' or 'B' deterministically from participant roll number.
 */
export function getAssignedMatchForUser(rollNumber = '') {
  if (!rollNumber) return 'A';
  let hash = 0;
  for (let i = 0; i < rollNumber.length; i++) {
    hash = (hash << 5) - hash + rollNumber.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B';
}
