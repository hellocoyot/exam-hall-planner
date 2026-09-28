/* Exam Hall Planner — seating engine.
 * Rule: two students writing the SAME subject paper are never side by side,
 * in front of, or behind each other. Works in the browser and in Node (tests).
 */
(function (root) {
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Treat "Physics", " physics ", "PHYSICS" as the same paper.
  function subjectKey(s) {
    return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  /**
   * students: [{reg, name, cls, subject}]
   * halls:    [{name, rows, benches, perBench}]  (columns = benches * perBench)
   * opts:     {seed, evenly}
   */
  function allocate(students, halls, opts) {
    opts = opts || {};
    const rnd = mulberry32(opts.seed || 1);
    const evenly = opts.evenly !== false;

    // Queue per subject, shuffled deterministically.
    const bySubject = new Map();
    for (const s of students) {
      const k = subjectKey(s.subject);
      if (!bySubject.has(k)) bySubject.set(k, []);
      bySubject.get(k).push(s);
    }
    const queues = new Map();
    for (const [k, list] of [...bySubject.entries()].sort()) {
      queues.set(k, shuffle(list.slice().sort((a, b) => String(a.reg).localeCompare(String(b.reg))), rnd));
    }
    const origSize = new Map([...queues].map(([k, q]) => [k, q.length]));
    let remaining = students.length;

    const active = halls.filter(h => !h.disabled);
    const caps = active.map(h => h.rows * h.benches * h.perBench);
    const totalCap = caps.reduce((a, b) => a + b, 0);

    // How many students each hall should take.
    let targets;
    if (evenly && totalCap > 0) {
      const n = Math.min(students.length, totalCap);
      targets = caps.map(c => Math.floor(n * c / totalCap));
      let left = n - targets.reduce((a, b) => a + b, 0);
      for (let i = 0; left > 0; i = (i + 1) % targets.length) {
        if (targets[i] < caps[i]) { targets[i]++; left--; }
      }
    } else {
      targets = caps.slice();
    }

    const out = [];
    const skipped = [];
    active.forEach((h, hi) => {
      const cols = h.benches * h.perBench;
      const grid = Array.from({ length: h.rows }, () => Array(cols).fill(null));
      let placed = 0;
      const seatsLeftTotal = () => { let s = 0; for (let j = hi; j < active.length; j++) s += caps[j]; return s; };

      for (let r = 0; r < h.rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (placed >= targets[hi] || remaining === 0) continue;
          // Spread the gaps out: if we have spare seats in this hall, leave some empty.
          const seatsHere = (h.rows - r) * cols - c;
          const need = targets[hi] - placed;
          if (seatsHere > need && need > 0 && rnd() < (seatsHere - need) / seatsHere * 0.35 && r > 0) continue;

          const nb = (rr, cc) => (rr >= 0 && cc >= 0 && rr < h.rows && cc < cols ? grid[rr][cc] : null);
          const left = nb(r, c - 1), up = nb(r - 1, c);
          const banned = new Set([left, up].filter(Boolean).map(x => x.key));
          const diag = new Set([nb(r - 1, c - 1), nb(r - 1, c + 1)].filter(Boolean).map(x => x.key));
          const nearCls = new Set([left, up].filter(Boolean).map(x => x.s.cls));

          let best = null, bestScore = -Infinity;
          for (const [k, q] of queues) {
            if (!q.length || banned.has(k)) continue;
            // Deplete every subject at the same rate so each hall gets a fair mix.
            let score = q.length / origSize.get(k) * 100 + q.length * 0.5;
            if (diag.has(k)) score -= 8;
            if (nearCls.has(q[q.length - 1].cls)) score -= 3;
            if (score > bestScore) { bestScore = score; best = k; }
          }
          if (best === null) { skipped.push({ hall: h.name, row: r + 1, col: c + 1 }); continue; }
          const s = queues.get(best).pop();
          grid[r][c] = { s, key: best };
          placed++; remaining--;
        }
      }
      out.push({
        hall: h,
        cols,
        grid: grid.map((row, r) => row.map((cell, c) => cell && {
          ...cell.s, seat: `R${r + 1}C${c + 1}`, row: r + 1, col: c + 1, bench: Math.floor(c / h.perBench) + 1
        })),
        count: placed,
        capacity: caps[hi]
      });
    });

    // Second pass: anyone still waiting takes any empty seat that keeps the rule.
    if (remaining > 0) {
      for (const h of out) {
        const g = h.grid, rows = g.length, cols = h.cols;
        for (let r = 0; r < rows && remaining > 0; r++) {
          for (let c = 0; c < cols && remaining > 0; c++) {
            if (g[r][c]) continue;
            const around = [[r, c - 1], [r, c + 1], [r - 1, c], [r + 1, c]]
              .map(([rr, cc]) => g[rr] && g[rr][cc]).filter(Boolean).map(x => subjectKey(x.subject));
            let best = null, bestLen = 0;
            for (const [k, q] of queues) if (q.length > bestLen && !around.includes(k)) { best = k; bestLen = q.length; }
            if (!best) continue;
            const s = queues.get(best).pop();
            g[r][c] = { ...s, seat: `R${r + 1}C${c + 1}`, row: r + 1, col: c + 1, bench: Math.floor(c / h.hall.perBench) + 1 };
            h.count++; remaining--;
          }
        }
      }
    }

    const unplaced = [];
    for (const q of queues.values()) unplaced.push(...q);
    return {
      halls: out,
      unplaced,
      skipped,
      totalStudents: students.length,
      totalCapacity: totalCap,
      violations: countViolations(out)
    };
  }

  function countViolations(hallResults) {
    const v = [];
    for (const h of hallResults) {
      const g = h.grid;
      for (let r = 0; r < g.length; r++) {
        for (let c = 0; c < g[r].length; c++) {
          const a = g[r][c]; if (!a) continue;
          const right = g[r][c + 1], down = g[r + 1] && g[r + 1][c];
          for (const b of [right, down]) {
            if (b && subjectKey(a.subject) === subjectKey(b.subject)) v.push({ hall: h.hall.name, a: a.seat, b: b.seat });
          }
        }
      }
    }
    return v;
  }

  const api = { allocate, countViolations, subjectKey, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeatEngine = api;
})(this);
