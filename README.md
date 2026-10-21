# ⚡ YOC GAMES • LinkedIn Zip Puzzle Event Arena

A feature-rich, high-polish event web application featuring **LinkedIn Zip logic puzzles** with three progressive difficulty tiers, live real-time scoring and marks system, interactive event leaderboard with CSV export, participant registration via Roll Number and Name, and responsive cyber-aesthetic UI/UX.

---

## 🌟 Key Highlights & Features

### 1. 🏆 Prominent Event Branding
- **"YOC GAMES"** branding prominently highlighted in the top-left corner with glowing lightning badge, event edition subtitle, and navigation controls.
- Tailored for college fests, technical symposiums, hackathons, and corporate gaming events.

### 2. 🧩 LinkedIn Zip Game Mechanics
- Connect numbered checkpoints in strictly sequential order (**1 → 2 → 3 → ...**).
- **Hamiltonian Path Challenge:** Every single square on the board must be filled by the continuous path by the time the final number is reached.
- **Barrier Walls:** Respect dark neon interior walls that forbid path traversal.
- **Controls & Interaction:**
  - Touch/Mouse drag or direct click on adjacent cells.
  - Automatic backtrack rewinding by dragging backward over previous steps or clicking previous nodes.
  - Keyboard controls (`W/A/S/D` or Arrow keys to move, `Z` or `Backspace` to undo, `R` to reset, `H` for intelligent hint).
  - Web Audio API real-time sound effects (synthesized melodic clicks, checkpoint chimes, barrier warning buzz, victory fanfare).
  - Canvas confetti particle burst upon clearing levels.

### 3. 🎯 Three Scalable Difficulty Levels
- **Level 1: Cadet (Easy)**
  - Grid: `4 x 4` (16 cells)
  - Checkpoints: `1` to `5`
  - Walls: 2 interior barriers
  - Max Marks: 150 pts
- **Level 2: Navigator (Medium)**
  - Grid: `5 x 5` (25 cells)
  - Checkpoints: `1` to `6`
  - Walls: 5 interior barriers
  - Max Marks: 300 pts
- **Level 3: Grandmaster (Hard)**
  - Grid: `6 x 6` (36 cells)
  - Checkpoints: `1` to `8`
  - Walls: 10 interior barriers
  - Max Marks: 500 pts
- *All puzzles are mathematically verified to have valid, unique Hamiltonian solutions.*

### 4. 📝 Participant Registration & Session Management
- Registration inputs: **Roll Number** (or Participant ID), **Full Name**, and optional **Department/Branch**.
- Quick Demo Login chips for fast judge/coordinator testing.
- Persistent session storage in `localStorage` with active user indicator in the header.

### 5. 🥇 Event Leaderboard & Marks System
- **Detailed Marks Breakdown:**
  - Base Level Completion Marks
  - Speed Time Bonus (faster solves = more marks)
  - Path Efficiency Bonus (no undos reward)
- **Interactive Leaderboard:**
  - Top 3 Podium (🥇 Gold, 🥈 Silver, 🥉 Bronze with rank cards & avatars)
  - Live search filter by Roll Number, Name, or Department
  - Level badges (`L1`, `L2`, `L3`) showing individual level completion
  - Tier scores breakdown and total completion time
- **Event Coordinator Tools:**
  - **📥 Export CSV:** Instant download of all participant scores, roll numbers, and times for official records.
  - **👥 Sample Competitors:** Pre-populates realistic event competitors for immediate exhibition.
  - **🗑️ Reset Board:** Clears the board for new event rounds.

---

## 🚀 How to Run

Because the project is built with vanilla modern HTML5, CSS3, and ES Modules:
- **Zero build step is required.**
- **Zero external network dependencies.**

### Option A: Using Python (Recommended)
From the project directory:
```bash
python3 -m http.server 8080
```
Then open your browser at:
```
http://localhost:8080
```

### Option B: Using Node
```bash
npx serve .
```

### Option C: Direct File Opening
You can also open `index.html` directly or host on GitHub Pages / Vercel / Netlify with a single drag-and-drop.

---

## 📁 Project Structure

```
yoc-zip-games/
├── index.html          # Semantic application layout & modals
├── styles.css          # Glassmorphism, neon glows, responsive styles
├── puzzles.js          # Verified puzzle grids, walls, checkpoints, solutions
├── game.js             # Zip puzzle engine (drag, walls, SVG path, hints)
├── storage.js          # LocalStorage manager, leaderboard, CSV export
├── audio.js            # Web Audio API sound synthesizer
├── confetti.js         # Canvas particle burst effects
├── app.js              # Application controller & event router
├── test_simulation.js  # Automated verification script
└── package.json        # Project metadata
```
