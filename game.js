/**
 * YOC GAMES - Official LinkedIn Zip Game Engine
 * Features pixel-perfect LinkedIn Zip mechanics:
 * - Solid black circular numbered checkpoint badges
 * - Vibrant coral-red smooth path line
 * - Soft coral-pink background tint for visited cells
 * - Drag and click controls with automatic backtrack retraction
 * - Undo, Hint, and Reset features
 */

import { soundManager } from './audio.js';

export class ZipGame {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = options; // onProgress, onTimerTick, onVictory, onWarning
    this.puzzle = null;
    this.path = []; // array of [r, c]
    this.nextCheckpointNum = 2;
    this.isDragging = false;
    this.isCompleted = false;
    this.undoCount = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;

    this.boardEl = null;
    this.canvasEl = null;
    this.ctx = null;

    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  loadLevel(puzzleData) {
    this.puzzle = puzzleData;
    this.isCompleted = false;
    this.undoCount = 0;
    this.elapsedSeconds = 0;
    this.clearInterval();

    // Start path at checkpoint 1
    const startCheckpoint = this.puzzle.checkpoints.find(cp => cp.num === 1);
    this.path = [[startCheckpoint.r, startCheckpoint.c]];
    this.nextCheckpointNum = 2;

    this.render();
    this.startTimer();
    this.attachEvents();

    if (this.options.onProgress) {
      this.options.onProgress(this.getProgressStats());
    }
  }

  startTimer() {
    this.clearInterval();
    this.timerInterval = setInterval(() => {
      if (this.isCompleted) return;
      this.elapsedSeconds++;
      if (this.options.onTimerTick) {
        this.options.onTimerTick(this.elapsedSeconds);
      }
    }, 1000);
  }

  clearInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  attachEvents() {
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);

    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    this.clearInterval();
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.handleResize);
  }

  getCheckpointAt(r, c) {
    const cp = this.puzzle.checkpoints.find(item => item.r === r && item.c === c);
    return cp ? cp.num : null;
  }

  getPathIndex(r, c) {
    return this.path.findIndex(([pr, pc]) => pr === r && pc === c);
  }

  isAdjacent(r1, c1, r2, c2) {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  tryMoveTo(targetR, targetC) {
    if (this.isCompleted) return false;
    if (targetR < 0 || targetR >= this.puzzle.rows || targetC < 0 || targetC >= this.puzzle.cols) {
      return false;
    }

    const currentHead = this.path[this.path.length - 1];
    const [headR, headC] = currentHead;

    // Already on current head
    if (headR === targetR && headC === targetC) {
      return true;
    }

    // Check if target is already in path (allow rewinding/backtracking)
    const existingIndex = this.getPathIndex(targetR, targetC);
    if (existingIndex !== -1) {
      this.rewindTo(existingIndex);
      return true;
    }

    // Must be orthogonal adjacent
    if (!this.isAdjacent(headR, headC, targetR, targetC)) {
      return false;
    }

    // Check checkpoint ordering rule
    const targetCheckpoint = this.getCheckpointAt(targetR, targetC);
    if (targetCheckpoint !== null) {
      if (targetCheckpoint !== this.nextCheckpointNum) {
        soundManager.playWall();
        this.shakeCell(targetR, targetC);
        if (this.options.onWarning) {
          this.options.onWarning(`Cannot skip to ${targetCheckpoint}! Next target is ${this.nextCheckpointNum}.`);
        }
        return false;
      }
    }

    // Valid step!
    this.path.push([targetR, targetC]);

    if (targetCheckpoint === this.nextCheckpointNum) {
      soundManager.playCheckpoint(targetCheckpoint);
      this.nextCheckpointNum++;
    } else {
      soundManager.playStep(this.path.length);
    }

    this.updateVisuals();
    this.checkVictory();

    if (this.options.onProgress) {
      this.options.onProgress(this.getProgressStats());
    }

    return true;
  }

  rewindTo(index) {
    if (index < 0 || index >= this.path.length - 1) return;
    
    // Check if any checkpoints were retracted
    for (let i = this.path.length - 1; i > index; i--) {
      const [r, c] = this.path[i];
      const cp = this.getCheckpointAt(r, c);
      if (cp !== null && cp === this.nextCheckpointNum - 1) {
        this.nextCheckpointNum--;
      }
    }

    this.path = this.path.slice(0, index + 1);
    this.undoCount++;
    soundManager.playUndo();
    this.updateVisuals();

    if (this.options.onProgress) {
      this.options.onProgress(this.getProgressStats());
    }
  }

  undo() {
    if (this.isCompleted || this.path.length <= 1) return;
    this.rewindTo(this.path.length - 2);
  }

  reset() {
    if (this.isCompleted) return;
    this.path = [this.path[0]];
    this.nextCheckpointNum = 2;
    this.updateVisuals();
    soundManager.playUndo();

    if (this.options.onProgress) {
      this.options.onProgress(this.getProgressStats());
    }
  }

  checkVictory() {
    const totalRequired = this.puzzle.totalCells;
    const maxCheckpoint = Math.max(...this.puzzle.checkpoints.map(cp => cp.num));

    if (this.path.length === totalRequired && this.nextCheckpointNum > maxCheckpoint) {
      this.isCompleted = true;
      this.clearInterval();
      soundManager.playVictory();

      const finalStats = this.calculateFinalMarks();
      if (this.options.onVictory) {
        this.options.onVictory(finalStats);
      }
    }
  }

  calculateFinalMarks() {
    const baseMarks = this.puzzle.baseMarks;
    const targetSeconds = this.puzzle.timeLimitSeconds;
    
    let timeBonus = 0;
    if (this.elapsedSeconds <= targetSeconds) {
      const ratio = Math.max(0, (targetSeconds - this.elapsedSeconds) / targetSeconds);
      timeBonus = Math.round(ratio * this.puzzle.maxBonusMarks);
    }

    const efficiencyBonus = this.undoCount === 0 ? 25 : Math.max(0, 15 - this.undoCount * 3);
    const totalMarks = baseMarks + timeBonus + efficiencyBonus;

    return {
      levelId: this.puzzle.id,
      baseMarks,
      timeBonus,
      efficiencyBonus,
      totalMarks,
      timeSeconds: this.elapsedSeconds,
      undoCount: this.undoCount,
      cellsCovered: this.path.length,
      totalCells: this.puzzle.totalCells
    };
  }

  getProgressStats() {
    const maxCheckpoint = Math.max(...this.puzzle.checkpoints.map(cp => cp.num));
    return {
      cellsCovered: this.path.length,
      totalCells: this.puzzle.totalCells,
      percentage: Math.round((this.path.length / this.puzzle.totalCells) * 100),
      nextCheckpoint: Math.min(this.nextCheckpointNum, maxCheckpoint),
      maxCheckpoint,
      elapsedSeconds: this.elapsedSeconds
    };
  }

  provideHint() {
    if (this.isCompleted) return;
    const sol = this.puzzle.solution;
    
    // Check if current path matches solution prefix
    let matches = true;
    for (let i = 0; i < this.path.length; i++) {
      if (this.path[i][0] !== sol[i][0] || this.path[i][1] !== sol[i][1]) {
        matches = false;
        break;
      }
    }

    if (!matches) {
      let divergeIdx = 0;
      for (let i = 0; i < this.path.length; i++) {
        if (i >= sol.length || this.path[i][0] !== sol[i][0] || this.path[i][1] !== sol[i][1]) {
          divergeIdx = i;
          break;
        }
      }
      this.rewindTo(Math.max(0, divergeIdx - 1));
      if (this.options.onWarning) {
        this.options.onWarning("Path diverged from solution! Rolled back to last correct step.");
      }
      return;
    }

    if (this.path.length < sol.length) {
      const nextStep = sol[this.path.length];
      this.pulseHintCell(nextStep[0], nextStep[1]);
      if (this.options.onWarning) {
        this.options.onWarning(`💡 Next step: row ${nextStep[0] + 1}, column ${nextStep[1] + 1}`);
      }
    }
  }

  pulseHintCell(r, c) {
    if (!this.boardEl) return;
    const cell = this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
      cell.classList.add('hint-pulse');
      setTimeout(() => cell.classList.remove('hint-pulse'), 1400);
    }
  }

  shakeCell(r, c) {
    if (!this.boardEl) return;
    const cell = this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
      cell.classList.add('cell-shake');
      setTimeout(() => cell.classList.remove('cell-shake'), 400);
    }
  }

  // --- Pointer & Touch Interactions ---
  handlePointerDown(e) {
    if (this.isCompleted) return;
    soundManager.ensureContext();

    const cell = e.target.closest('.linkedin-cell');
    if (!cell) return;

    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    const head = this.path[this.path.length - 1];

    if (head[0] === r && head[1] === c) {
      this.isDragging = true;
    } else {
      const moved = this.tryMoveTo(r, c);
      if (moved) {
        this.isDragging = true;
      }
    }
  }

  handlePointerMove(e) {
    if (!this.isDragging || this.isCompleted) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    const cell = element.closest('.linkedin-cell');
    if (!cell) return;

    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    if (isNaN(r) || isNaN(c)) return;

    this.tryMoveTo(r, c);
  }

  handlePointerUp() {
    this.isDragging = false;
  }

  handleKeyDown(e) {
    if (this.isCompleted) return;

    const head = this.path[this.path.length - 1];
    if (!head) return;

    let targetR = head[0];
    let targetC = head[1];

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      targetR--;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      targetR++;
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      targetC--;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      targetC++;
    } else if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') {
      this.undo();
      e.preventDefault();
      return;
    } else if (e.key === 'r' || e.key === 'R') {
      this.reset();
      e.preventDefault();
      return;
    } else if (e.key === 'h' || e.key === 'H') {
      this.provideHint();
      e.preventDefault();
      return;
    } else {
      return;
    }

    e.preventDefault();
    this.tryMoveTo(targetR, targetC);
  }

  handleResize() {
    this.syncCanvasSize();
    this.drawPathOnCanvas();
  }

  // --- LinkedIn Zip Board Rendering ---
  render() {
    const { rows, cols } = this.puzzle;
    this.container.innerHTML = '';

    // Board Frame
    const board = document.createElement('div');
    board.className = 'linkedin-zip-board';
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    this.boardEl = board;

    // Generate Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'linkedin-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Checkpoint Dot
        const cpNum = this.getCheckpointAt(r, c);
        if (cpNum !== null) {
          const badge = document.createElement('div');
          badge.className = 'linkedin-dot';
          badge.dataset.num = cpNum;
          badge.textContent = cpNum;
          cell.appendChild(badge);
        }

        board.appendChild(cell);
      }
    }

    // Canvas Overlay for vibrant red path
    const canvas = document.createElement('canvas');
    canvas.className = 'linkedin-zip-canvas';
    this.canvasEl = canvas;
    this.ctx = canvas.getContext('2d');
    board.appendChild(canvas);

    this.container.appendChild(board);

    // Bind pointer events directly to board
    board.addEventListener('pointerdown', this.handlePointerDown);
    board.addEventListener('pointermove', this.handlePointerMove);

    // Initial draw
    requestAnimationFrame(() => {
      this.syncCanvasSize();
      this.updateVisuals();
    });
  }

  syncCanvasSize() {
    if (!this.boardEl || !this.canvasEl) return;
    const rect = this.boardEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvasEl.width = rect.width * dpr;
    this.canvasEl.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  updateVisuals() {
    if (!this.boardEl) return;

    // Update cell background tints
    const cells = this.boardEl.querySelectorAll('.linkedin-cell');
    cells.forEach(cell => {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const isVisited = this.getPathIndex(r, c) !== -1;
      cell.classList.toggle('visited', isVisited);

      // Checkpoint badge styling
      const dot = cell.querySelector('.linkedin-dot');
      if (dot) {
        const num = parseInt(dot.dataset.num, 10);
        dot.classList.toggle('reached', num < this.nextCheckpointNum);
        dot.classList.toggle('next-target', num === this.nextCheckpointNum);
      }
    });

    this.drawPathOnCanvas();
  }

  drawPathOnCanvas() {
    if (!this.ctx || !this.boardEl || this.path.length === 0) return;

    const boardRect = this.boardEl.getBoundingClientRect();
    const width = boardRect.width;
    const height = boardRect.height;

    this.ctx.clearRect(0, 0, width, height);

    // Compute cell center coordinates
    const points = this.path.map(([r, c]) => {
      const cell = this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (!cell) return { x: 0, y: 0 };
      const cr = cell.getBoundingClientRect();
      return {
        x: cr.left - boardRect.left + cr.width / 2,
        y: cr.top - boardRect.top + cr.height / 2
      };
    });

    // Draw vibrant coral-red path
    if (points.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
      this.ctx.strokeStyle = '#ef4444'; // LinkedIn Zip signature coral red
      this.ctx.lineWidth = Math.max(10, Math.min(width / 22, 16));
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    }

    // Draw active head indicator
    const head = points[points.length - 1];
    if (head) {
      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, Math.max(7, Math.min(width / 32, 11)), 0, Math.PI * 2);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fill();

      // Outer gentle pulse
      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, Math.max(12, Math.min(width / 20, 18)), 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
    }
  }
}
