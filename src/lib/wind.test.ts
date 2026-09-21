import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepSpring, gustStrength, influenceAt, kick } from './wind.ts';

test('faster gestures produce stronger bounded gusts; stale pointers produce none', () => {
  assert.ok(gustStrength(30, 0.016) > gustStrength(3, 0.016));
  assert.equal(gustStrength(10000, 0.001), 2.6);
  assert.equal(gustStrength(100, 0.5), 0);
  assert.equal(gustStrength(100, 0), 0);
});
test('cursor position makes nearby leaves react more than distant ones', () => {
  assert.ok(influenceAt(0, 2, 0, 2) > influenceAt(0, -2, 0, 2) * 20);
});
test('disturbed springs reassemble without residual drift', () => {
  const spring = { position: 0, velocity: 0 };
  kick(spring, 12);
  for (let i = 0; i < 600; i++) stepSpring(spring, 1 / 60);
  assert.ok(Math.abs(spring.position) < 0.001);
  assert.ok(Math.abs(spring.velocity) < 0.001);
});
test('sustained violent gestures remain finite and bounded', () => {
  const spring = { position: 0, velocity: 0 };
  for (let i = 0; i < 600; i++) { kick(spring, 100); stepSpring(spring, 1 / 30); }
  assert.ok(Number.isFinite(spring.position));
  assert.ok(Math.abs(spring.position) <= 2.2);
  assert.ok(Math.abs(spring.velocity) <= 18);
});
test('30 and 120 fps produce nearly identical spring trajectories', () => {
  const slow = { position: 0.5, velocity: 9 }, fast = { ...slow };
  for (let i = 0; i < 30; i++) stepSpring(slow, 1 / 30);
  for (let i = 0; i < 120; i++) stepSpring(fast, 1 / 120);
  assert.ok(Math.abs(slow.position - fast.position) < 0.001);
});
