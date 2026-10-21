/**
 * YOC GAMES - Application Controller & Event Coordinator
 * Manages screen routing, authentication state, game flow, score submission,
 * leaderboard rendering, and modals.
 */

import { PUZZLES } from './puzzles.js';
import { soundManager } from './audio.js';
import { ConfettiCannon } from './confetti.js';
import { storage } from './storage.js';
import { ZipGame } from './game.js';

class App {
  constructor() {
    this.currentView = 'auth';
    this.activeGame = null;
    this.activeLevelId = 1;
    this.confetti = null;

    // Elements
    this.views = {
      auth: document.getElementById('view-auth'),
      arena: document.getElementById('view-arena'),
      game: document.getElementById('view-game'),
      leaderboard: document.getElementById('view-leaderboard')
    };

    this.profileChip = document.getElementById('header-profile-chip');
    this.profileName = document.getElementById('header-profile-name');
    this.profileRoll = document.getElementById('header-profile-roll');

    this.victoryModal = document.getElementById('modal-victory');
    this.howToPlayModal = document.getElementById('modal-how-to-play');
    this.toastContainer = document.getElementById('toast-container');

    this.init();
  }

  init() {
    // Initialize Confetti
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      this.confetti = new ConfettiCannon(canvas);
    }

    // Auto-populate mock leaderboard if empty so event coordinators have a lively board immediately
    if (storage.getLeaderboard().length === 0) {
      storage.populateMockLeaderboard();
    }

    this.bindEvents();
    this.checkAuthStatus();
    this.updateAudioButtonState();
  }

  bindEvents() {
    // Header Branding Click -> Arena
    document.getElementById('brand-corner').addEventListener('click', () => {
      if (storage.getCurrentUser()) {
        this.switchView('arena');
      }
    });

    // Sound Toggle Button
    const btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        this.updateAudioButtonState();
        this.showToast(isMuted ? '🔇 Sound muted' : '🔊 Sound unmuted');
      });
    }

    // How to Play Modal Button
    document.getElementById('btn-how-to-play').addEventListener('click', () => {
      this.openHowToPlay();
    });
    document.getElementById('btn-close-how-to-play').addEventListener('click', () => {
      this.closeHowToPlay();
    });

    // Leaderboard Header Button
    document.getElementById('btn-nav-leaderboard').addEventListener('click', () => {
      this.switchView('leaderboard');
    });

    // Switch User / Logout Button
    document.getElementById('btn-nav-logout').addEventListener('click', () => {
      storage.logoutUser();
      this.switchView('auth');
      this.showToast('Logged out of session.');
    });

    // Registration Form Submit
    const authForm = document.getElementById('form-register');
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rollInput = document.getElementById('input-roll').value.trim();
      const nameInput = document.getElementById('input-name').value.trim();
      const deptInput = document.getElementById('input-dept').value.trim();

      if (!rollInput || !nameInput) {
        this.showToast('Please provide both Roll Number and Name!', 'warning');
        return;
      }

      storage.setCurrentUser(nameInput, rollInput, deptInput);
      soundManager.ensureContext();
      this.showToast(`Welcome to YOC GAMES, ${nameInput}! 🚀`);
      this.checkAuthStatus();
      this.switchView('arena');
    });

    // Demo Fill Chips
    const demoChips = document.querySelectorAll('.demo-chip');
    demoChips.forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('input-roll').value = chip.dataset.roll;
        document.getElementById('input-name').value = chip.dataset.name;
        document.getElementById('input-dept').value = chip.dataset.dept;
      });
    });

    // Arena Level Cards
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
      card.addEventListener('click', () => {
        const levelId = parseInt(card.dataset.level, 10);
        this.startLevel(levelId);
      });
    });

    // Arena: Event Run Start Button
    const btnStartEvent = document.getElementById('btn-start-event-run');
    if (btnStartEvent) {
      btnStartEvent.addEventListener('click', () => {
        this.startLevel(1);
      });
    }

    // Game In-Bar Controls
    document.getElementById('btn-game-back').addEventListener('click', () => {
      if (this.activeGame) {
        this.activeGame.destroy();
        this.activeGame = null;
      }
      this.switchView('arena');
    });

    document.getElementById('btn-game-undo').addEventListener('click', () => {
      if (this.activeGame) this.activeGame.undo();
    });

    document.getElementById('btn-game-hint').addEventListener('click', () => {
      if (this.activeGame) this.activeGame.provideHint();
    });

    document.getElementById('btn-game-reset').addEventListener('click', () => {
      if (this.activeGame) this.activeGame.reset();
    });

    // Victory Modal Controls
    document.getElementById('btn-victory-next').addEventListener('click', () => {
      this.closeVictoryModal();
      if (this.activeLevelId < 3) {
        this.startLevel(this.activeLevelId + 1);
      } else {
        this.switchView('leaderboard');
      }
    });

    document.getElementById('btn-victory-replay').addEventListener('click', () => {
      this.closeVictoryModal();
      this.startLevel(this.activeLevelId);
    });

    document.getElementById('btn-victory-leaderboard').addEventListener('click', () => {
      this.closeVictoryModal();
      this.switchView('leaderboard');
    });

    // Leaderboard Screen Actions
    document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
      this.switchView('arena');
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
      const ok = storage.exportToCSV();
      if (ok) {
        this.showToast('✅ Leaderboard CSV downloaded!');
      } else {
        this.showToast('No entries to export!', 'warning');
      }
    });

    document.getElementById('btn-populate-mock').addEventListener('click', () => {
      storage.populateMockLeaderboard();
      this.renderLeaderboard();
      this.showToast('Sample event participants loaded!');
    });

    document.getElementById('btn-reset-leaderboard').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the entire event leaderboard?')) {
        storage.clearLeaderboard();
        this.renderLeaderboard();
        this.showToast('Leaderboard reset successfully.');
      }
    });

    // Leaderboard Search Filter
    const searchInput = document.getElementById('search-leaderboard');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderLeaderboard(e.target.value.trim().toLowerCase());
      });
    }

    // How to Play Collapsible Toggle in LinkedIn Card
    const howToHeader = document.querySelector('.how-to-header');
    const howToContent = document.getElementById('how-to-content');
    const howToToggle = document.getElementById('how-to-toggle');
    if (howToHeader && howToContent) {
      howToHeader.addEventListener('click', () => {
        const isHidden = howToContent.style.display === 'none';
        howToContent.style.display = isHidden ? 'block' : 'none';
        if (howToToggle) {
          howToToggle.textContent = isHidden ? '⌃' : '⌄';
        }
      });
    }
  }

  updateAudioButtonState() {
    const btnSound = document.getElementById('btn-sound-toggle');
    if (!btnSound) return;
    btnSound.innerHTML = soundManager.isMuted ? '🔇' : '🔊';
  }

  checkAuthStatus() {
    const user = storage.getCurrentUser();
    if (user) {
      this.profileChip.style.display = 'flex';
      this.profileName.textContent = user.name;
      this.profileRoll.textContent = user.rollNumber;
      this.updateArenaStats();
      this.switchView('arena');
    } else {
      this.profileChip.style.display = 'none';
      this.switchView('auth');
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    Object.keys(this.views).forEach(key => {
      if (this.views[key]) {
        this.views[key].classList.toggle('active', key === viewName);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'arena') {
      this.updateArenaStats();
    } else if (viewName === 'leaderboard') {
      this.renderLeaderboard();
    }
  }

  updateArenaStats() {
    const user = storage.getCurrentUser();
    if (!user) return;

    const progress = storage.getUserProgress(user.rollNumber);

    // Update banner numbers
    document.getElementById('arena-total-marks').textContent = progress.totalMarks;
    const mins = Math.floor(progress.totalTime / 60);
    const secs = progress.totalTime % 60;
    document.getElementById('arena-total-time').textContent = 
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('arena-levels-cleared').textContent = `${progress.completedLevels.length} / 3`;

    // Update level cards
    [1, 2, 3].forEach(lvl => {
      const statusEl = document.getElementById(`level-status-${lvl}`);
      if (!statusEl) return;
      if (progress.completedLevels.includes(lvl)) {
        const score = progress.scores[lvl];
        statusEl.innerHTML = `✅ Cleared (${score.marks} pts)`;
        statusEl.style.color = '#10b981';
      } else {
        statusEl.innerHTML = `⭕ Unsolved`;
        statusEl.style.color = '#94a3b8';
      }
    });
  }

  startLevel(levelId) {
    const puzzleData = PUZZLES[levelId];
    if (!puzzleData) return;

    this.activeLevelId = levelId;
    this.switchView('game');

    // Update in-game headers
    const titleEl = document.getElementById('game-level-title');
    if (titleEl) titleEl.textContent = puzzleData.name;

    const diffLabel = document.getElementById('game-diff-label');
    if (diffLabel) diffLabel.textContent = puzzleData.difficulty;

    const potentialEl = document.getElementById('game-potential-marks');
    if (potentialEl) potentialEl.textContent = `${puzzleData.baseMarks + puzzleData.maxBonusMarks} pts`;

    const timerEl = document.getElementById('game-timer');
    if (timerEl) timerEl.textContent = '0:00';

    const boardContainer = document.getElementById('zip-board-container');
    if (!boardContainer) return;

    if (this.activeGame) {
      this.activeGame.destroy();
    }

    this.activeGame = new ZipGame(boardContainer, {
      onProgress: (stats) => {
        this.updateGameHUD(stats);
      },
      onTimerTick: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const timer = document.getElementById('game-timer');
        if (timer) {
          timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      },
      onWarning: (msg) => {
        this.showToast(msg, 'warning');
      },
      onVictory: (finalStats) => {
        this.handleLevelVictory(finalStats);
      }
    });

    this.activeGame.loadLevel(puzzleData);
  }

  updateGameHUD(stats) {
    const fillBar = document.getElementById('game-progress-fill');
    if (fillBar) fillBar.style.width = `${stats.percentage}%`;

    const textStats = document.getElementById('game-progress-text');
    if (textStats) textStats.textContent = `${stats.cellsCovered} / ${stats.totalCells} cells (${stats.percentage}%)`;
    
    const targetBadge = document.getElementById('game-target-badge');
    if (targetBadge) {
      if (stats.cellsCovered === stats.totalCells) {
        targetBadge.textContent = '🎉 Completed!';
        targetBadge.style.color = '#10b981';
      } else {
        targetBadge.textContent = `🎯 Target: ${stats.nextCheckpoint}`;
        targetBadge.style.color = '#f59e0b';
      }
    }
  }

  handleLevelVictory(stats) {
    if (this.confetti) {
      this.confetti.burst(140);
    }

    // Save to storage & leaderboard
    storage.saveLevelResult(stats.levelId, stats.totalMarks, stats.timeSeconds);

    // Populate Victory Modal
    document.getElementById('modal-level-name').textContent = PUZZLES[stats.levelId].name;
    document.getElementById('stat-base-marks').textContent = `+${stats.baseMarks}`;
    document.getElementById('stat-time-bonus').textContent = `+${stats.timeBonus}`;
    document.getElementById('stat-efficiency-bonus').textContent = `+${stats.efficiencyBonus}`;
    document.getElementById('stat-total-marks').textContent = `${stats.totalMarks} Marks`;

    const mins = Math.floor(stats.timeSeconds / 60);
    const secs = stats.timeSeconds % 60;
    document.getElementById('stat-time-taken').textContent = 
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const nextBtn = document.getElementById('btn-victory-next');
    if (stats.levelId < 3) {
      nextBtn.innerHTML = `Advance to Level ${stats.levelId + 1} 🚀`;
    } else {
      nextBtn.innerHTML = `View Final Leaderboard 🏆`;
    }

    this.victoryModal.classList.add('active');
  }

  closeVictoryModal() {
    this.victoryModal.classList.remove('active');
  }

  openHowToPlay() {
    this.howToPlayModal.classList.add('active');
  }

  closeHowToPlay() {
    this.howToPlayModal.classList.remove('active');
  }

  renderLeaderboard(query = '') {
    const list = storage.getLeaderboard();
    const currentUser = storage.getCurrentUser();

    const filtered = query
      ? list.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.rollNumber.toLowerCase().includes(query) ||
          (item.department && item.department.toLowerCase().includes(query))
        )
      : list;

    // Render Podium (Top 3)
    const podiumContainer = document.getElementById('leaderboard-podium');
    if (podiumContainer) {
      if (list.length >= 1) {
        const top1 = list[0];
        const top2 = list[1] || null;
        const top3 = list[2] || null;

        podiumContainer.innerHTML = `
          ${top2 ? `
            <div class="podium-card second">
              <div class="podium-rank-badge">🥈</div>
              <div class="podium-name">${top2.name}</div>
              <div class="podium-roll">${top2.rollNumber}</div>
              <div class="podium-marks">${top2.totalMarks} Marks</div>
              <div class="podium-time">⏱️ ${Math.floor(top2.totalTime/60)}m ${top2.totalTime%60}s (${top2.completedLevels.length}/3 lvls)</div>
            </div>
          ` : ''}

          <div class="podium-card first">
            <div class="podium-rank-badge">🥇</div>
            <div class="podium-name">${top1.name}</div>
            <div class="podium-roll">${top1.rollNumber}</div>
            <div class="podium-marks">${top1.totalMarks} Marks</div>
            <div class="podium-time">⏱️ ${Math.floor(top1.totalTime/60)}m ${top1.totalTime%60}s (${top1.completedLevels.length}/3 lvls)</div>
          </div>

          ${top3 ? `
            <div class="podium-card third">
              <div class="podium-rank-badge">🥉</div>
              <div class="podium-name">${top3.name}</div>
              <div class="podium-roll">${top3.rollNumber}</div>
              <div class="podium-marks">${top3.totalMarks} Marks</div>
              <div class="podium-time">⏱️ ${Math.floor(top3.totalTime/60)}m ${top3.totalTime%60}s (${top3.completedLevels.length}/3 lvls)</div>
            </div>
          ` : ''}
        `;
        podiumContainer.style.display = 'grid';
      } else {
        podiumContainer.style.display = 'none';
      }
    }

    // Render Table Rows
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 30px; color: var(--text-dim);">
            No participants found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((item, idx) => {
      const isCurrent = currentUser && currentUser.rollNumber === item.rollNumber;
      const rankClass = idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : '';
      const mins = Math.floor(item.totalTime / 60);
      const secs = item.totalTime % 60;
      const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      const l1Marks = item.scores && item.scores[1] ? `${item.scores[1].marks} pts` : '-';
      const l2Marks = item.scores && item.scores[2] ? `${item.scores[2].marks} pts` : '-';
      const l3Marks = item.scores && item.scores[3] ? `${item.scores[3].marks} pts` : '-';

      return `
        <tr class="${isCurrent ? 'current-user-row' : ''}">
          <td class="rank-cell ${rankClass}">#${idx + 1}</td>
          <td>
            <div class="participant-cell-name">${item.name} ${isCurrent ? '⭐ (You)' : ''}</div>
            <div class="participant-cell-dept">${item.department || 'General'}</div>
          </td>
          <td><span style="font-family: monospace; color: #00f2fe; font-weight:700;">${item.rollNumber}</span></td>
          <td>
            <div class="level-badges-cell">
              <span class="lvl-chip ${item.completedLevels.includes(1) ? 'done' : ''}">L1</span>
              <span class="lvl-chip ${item.completedLevels.includes(2) ? 'done' : ''}">L2</span>
              <span class="lvl-chip ${item.completedLevels.includes(3) ? 'done' : ''}">L3</span>
            </div>
          </td>
          <td style="font-size:0.8rem; color:var(--text-muted);">
            L1: ${l1Marks} | L2: ${l2Marks} | L3: ${l3Marks}
          </td>
          <td class="time-cell">${formattedTime}</td>
          <td class="marks-cell">${item.totalMarks}</td>
        </tr>
      `;
    }).join('');
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
