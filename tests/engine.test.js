// Run: node tests/engine.test.js
const assert = require('assert');
const { allocate, mulberry32 } = require('../engine.js');
const demo = require('../demo-data.js');

let pass = 0;
function test(name, fn) { fn(); pass++; console.log('  ok  ' + name); }

test('demo data: everyone seated, zero same-subject neighbours', () => {
  const r = allocate(demo.students, demo.halls, { seed: 1 });
  assert.strictEqual(r.violations.length, 0);
  assert.strictEqual(r.unplaced.length, 0);
  const seated = r.halls.reduce((a, h) => a + h.count, 0);
  assert.strictEqual(seated, demo.students.length);
});

test('Economics from Commerce and Humanities is one paper', () => {
  const r = allocate(demo.students, demo.halls, { seed: 7 });
  for (const h of r.halls) for (let y = 0; y < h.grid.length; y++) for (let x = 0; x < h.cols; x++) {
    const a = h.grid[y][x]; if (!a || a.subject !== 'Economics') continue;
    const right = h.grid[y][x + 1], down = h.grid[y + 1] && h.grid[y + 1][x];
    assert.ok(!(right && right.subject === 'Economics'), 'Economics side by side at ' + h.hall.name + ' ' + a.seat);
    assert.ok(!(down && down.subject === 'Economics'), 'Economics front/back at ' + h.hall.name + ' ' + a.seat);
  }
});

test('same input + same seed gives the same plan', () => {
  const a = allocate(demo.students, demo.halls, { seed: 3 });
  const b = allocate(demo.students, demo.halls, { seed: 3 });
  assert.deepStrictEqual(a.halls.map(h => h.grid), b.halls.map(h => h.grid));
});

test('capacity shortfall is reported, not silently dropped', () => {
  const r = allocate(demo.students, demo.halls.slice(0, 3), { seed: 1 });
  const seated = r.halls.reduce((a, h) => a + h.count, 0);
  assert.strictEqual(seated + r.unplaced.length, demo.students.length);
  assert.ok(r.unplaced.length > 0);
  assert.strictEqual(r.violations.length, 0);
});

test('500 random inputs: never a same-subject neighbour', () => {
  const rnd = mulberry32(42);
  for (let t = 0; t < 500; t++) {
    const nSub = 2 + Math.floor(rnd() * 6);
    const students = [];
    const n = 20 + Math.floor(rnd() * 300);
    for (let i = 0; i < n; i++) students.push({ reg: 'R' + i, name: 'S' + i, cls: 'C' + (i % 5), subject: 'Sub' + Math.floor(rnd() * nSub) });
    const halls = [];
    const nh = 1 + Math.floor(rnd() * 6);
    for (let h = 0; h < nh; h++) halls.push({ name: 'H' + h, rows: 3 + Math.floor(rnd() * 8), benches: 2 + Math.floor(rnd() * 3), perBench: 1 + Math.floor(rnd() * 3) });
    const r = allocate(students, halls, { seed: t + 1, evenly: rnd() < 0.5 });
    assert.strictEqual(r.violations.length, 0, 'violation in run ' + t);
    const seated = r.halls.reduce((a, h) => a + h.count, 0);
    assert.strictEqual(seated + r.unplaced.length, n, 'lost students in run ' + t);
  }
});

console.log(`\n${pass} tests passed`);
