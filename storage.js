/**
 * YOC GAMES - Local Storage & Leaderboard Data Manager
 * Manages participant registration, session persistence, scoring, and leaderboard export.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'yoc_current_user',
  LEADERBOARD: 'yoc_event_leaderboard',
  USER_PROGRESS: 'yoc_user_progress_'
};

export const storage = {
  // --- Current User Session ---
  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(name, rollNumber, department = 'General') {
    const cleanUser = {
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      department: department.trim() || 'General',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(cleanUser));
    return cleanUser;
  },

  logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // --- Participant Progress & Scores ---
  getUserProgress(rollNumber) {
    if (!rollNumber) return { completedLevels: [], scores: {}, totalMarks: 0, totalTime: 0 };
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS + rollNumber);
    if (!raw) return { completedLevels: [], scores: {}, totalMarks: 0, totalTime: 0 };
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { completedLevels: [], scores: {}, totalMarks: 0, totalTime: 0 };
    }
  },

  saveLevelResult(levelId, marks, timeSeconds) {
    const user = this.getCurrentUser();
    if (!user) return null;

    const progress = this.getUserProgress(user.rollNumber);
    
    // Check if user already completed this level with a higher or existing score
    const prevScore = progress.scores[levelId];
    if (!prevScore || marks > prevScore.marks || (marks === prevScore.marks && timeSeconds < prevScore.timeSeconds)) {
      progress.scores[levelId] = {
        marks,
        timeSeconds,
        completedAt: new Date().toISOString()
      };
    }

    if (!progress.completedLevels.includes(levelId)) {
      progress.completedLevels.push(levelId);
      progress.completedLevels.sort((a, b) => a - b);
    }

    // Recompute total marks and total time
    let totalMarks = 0;
    let totalTime = 0;
    Object.values(progress.scores).forEach(item => {
      totalMarks += item.marks;
      totalTime += item.timeSeconds;
    });

    progress.totalMarks = totalMarks;
    progress.totalTime = totalTime;

    // Save user progress
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS + user.rollNumber, JSON.stringify(progress));

    // Update global leaderboard
    this.updateLeaderboardEntry(user, progress);

    return progress;
  },

  // --- Leaderboard Operations ---
  getLeaderboard() {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    let list = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch (e) {
        list = [];
      }
    }

    // Sort by Total Marks DESC, then Total Time ASC (lower time is better), then Completed Levels DESC
    list.sort((a, b) => {
      if (b.totalMarks !== a.totalMarks) {
        return b.totalMarks - a.totalMarks;
      }
      if (a.totalTime !== b.totalTime) {
        return a.totalTime - b.totalTime;
      }
      return b.completedLevels.length - a.completedLevels.length;
    });

    return list;
  },

  updateLeaderboardEntry(user, progress) {
    const list = this.getLeaderboard();
    const existingIndex = list.findIndex(item => item.rollNumber === user.rollNumber);

    const entry = {
      rollNumber: user.rollNumber,
      name: user.name,
      department: user.department,
      totalMarks: progress.totalMarks,
      totalTime: progress.totalTime,
      completedLevels: progress.completedLevels,
      scores: progress.scores,
      lastActive: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = entry;
    } else {
      list.push(entry);
    }

    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(list));
  },

  clearLeaderboard() {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  },

  populateMockLeaderboard() {
    const sampleParticipants = [
      {
        rollNumber: "22CS104",
        name: "Aarav Sharma",
        department: "Computer Science",
        totalMarks: 785,
        totalTime: 182,
        completedLevels: [1, 2, 3],
        scores: {
          1: { marks: 148, timeSeconds: 24 },
          2: { marks: 282, timeSeconds: 58 },
          3: { marks: 355, timeSeconds: 100 }
        },
        lastActive: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        rollNumber: "21IT089",
        name: "Sneha Patel",
        department: "Information Tech",
        totalMarks: 745,
        totalTime: 215,
        completedLevels: [1, 2, 3],
        scores: {
          1: { marks: 142, timeSeconds: 31 },
          2: { marks: 265, timeSeconds: 74 },
          3: { marks: 338, timeSeconds: 110 }
        },
        lastActive: new Date(Date.now() - 40 * 60000).toISOString()
      },
      {
        rollNumber: "23AI015",
        name: "Vikram Sengupta",
        department: "AI & Data Science",
        totalMarks: 710,
        totalTime: 240,
        completedLevels: [1, 2, 3],
        scores: {
          1: { marks: 135, timeSeconds: 38 },
          2: { marks: 250, timeSeconds: 82 },
          3: { marks: 325, timeSeconds: 120 }
        },
        lastActive: new Date(Date.now() - 65 * 60000).toISOString()
      },
      {
        rollNumber: "22EC052",
        name: "Ananya Iyer",
        department: "Electronics & Comm",
        totalMarks: 440,
        totalTime: 115,
        completedLevels: [1, 2],
        scores: {
          1: { marks: 150, timeSeconds: 20 },
          2: { marks: 290, timeSeconds: 95 }
        },
        lastActive: new Date(Date.now() - 90 * 60000).toISOString()
      },
      {
        rollNumber: "21ME033",
        name: "Rohan Varma",
        department: "Mechanical Engg",
        totalMarks: 395,
        totalTime: 142,
        completedLevels: [1, 2],
        scores: {
          1: { marks: 130, timeSeconds: 42 },
          2: { marks: 265, timeSeconds: 100 }
        },
        lastActive: new Date(Date.now() - 120 * 60000).toISOString()
      },
      {
        rollNumber: "23CS078",
        name: "Diya Nambiar",
        department: "Computer Science",
        totalMarks: 145,
        totalTime: 28,
        completedLevels: [1],
        scores: {
          1: { marks: 145, timeSeconds: 28 }
        },
        lastActive: new Date(Date.now() - 150 * 60000).toISOString()
      },
      {
        rollNumber: "22EE041",
        name: "Karthik Raja",
        department: "Electrical Engg",
        totalMarks: 138,
        totalTime: 36,
        completedLevels: [1],
        scores: {
          1: { marks: 138, timeSeconds: 36 }
        },
        lastActive: new Date(Date.now() - 200 * 60000).toISOString()
      }
    ];

    // Merge with current user if exists
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const curProg = this.getUserProgress(currentUser.rollNumber);
      if (curProg.totalMarks > 0) {
        sampleParticipants.push({
          rollNumber: currentUser.rollNumber,
          name: currentUser.name,
          department: currentUser.department,
          totalMarks: curProg.totalMarks,
          totalTime: curProg.totalTime,
          completedLevels: curProg.completedLevels,
          scores: curProg.scores,
          lastActive: new Date().toISOString()
        });
      }
    }

    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(sampleParticipants));
    return this.getLeaderboard();
  },

  exportToCSV() {
    const list = this.getLeaderboard();
    if (list.length === 0) {
      return false;
    }

    const headers = ["Rank", "Roll Number", "Participant Name", "Department", "Levels Completed", "Level 1 Marks", "Level 2 Marks", "Level 3 Marks", "Total Marks", "Total Time (s)", "Formatted Time", "Last Active"];
    
    const rows = list.map((item, idx) => {
      const l1 = item.scores && item.scores[1] ? item.scores[1].marks : 0;
      const l2 = item.scores && item.scores[2] ? item.scores[2].marks : 0;
      const l3 = item.scores && item.scores[3] ? item.scores[3].marks : 0;
      const mins = Math.floor(item.totalTime / 60);
      const secs = item.totalTime % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      return [
        idx + 1,
        `"${item.rollNumber}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.department || 'N/A'}"`,
        `"${item.completedLevels.join(', ') || 'None'}"`,
        l1,
        l2,
        l3,
        item.totalMarks,
        item.totalTime,
        `"${timeStr}"`,
        `"${item.lastActive || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yoc_games_zip_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};
