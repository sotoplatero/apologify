import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listThemes, resolveTheme, isPremiumTheme } from './themes.js';

test('listThemes exposes the four distinct templates', () => {
  const ids = listThemes().map((t) => t.id);
  assert.ok(ids.includes('classic'));
  assert.ok(ids.includes('cute-duck'));
  assert.ok(ids.includes('formal'));
  assert.ok(ids.includes('starry'));
});

test('resolveTheme falls back to the first template on unknown id', () => {
  assert.equal(resolveTheme('nope').id, 'classic');
  assert.equal(resolveTheme('starry').id, 'starry');
});

test('isPremiumTheme marks Night premium and the rest free', () => {
  assert.equal(isPremiumTheme('classic'), false);
  assert.equal(isPremiumTheme('cute-duck'), false);
  assert.equal(isPremiumTheme('formal'), false);
  assert.equal(isPremiumTheme('starry'), true);
  assert.equal(isPremiumTheme('unknown'), false);
});
