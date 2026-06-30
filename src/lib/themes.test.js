import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listThemes, resolveTheme, isPremiumTheme } from './themes.js';

test('listThemes includes free + premium + formal', () => {
  const ids = listThemes().map((t) => t.id);
  assert.ok(ids.includes('classic'));
  assert.ok(ids.includes('cute-duck'));
  assert.ok(ids.includes('formal'));
  assert.ok(ids.includes('hearts'));
});

test('resolveTheme falls back to classic on unknown id', () => {
  assert.equal(resolveTheme('nope').id, 'classic');
  assert.equal(resolveTheme('formal').id, 'formal');
});

test('isPremiumTheme distinguishes free from premium', () => {
  assert.equal(isPremiumTheme('classic'), false);
  assert.equal(isPremiumTheme('formal'), false);
  assert.equal(isPremiumTheme('hearts'), true);
  assert.equal(isPremiumTheme('unknown'), false);
});
