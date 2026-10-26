import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listThemes, resolveTheme, isPremiumTheme, canonicalThemeId } from './themes.js';

test('listThemes exposes the live designs and hides retired ones', () => {
  const ids = listThemes().map((t) => t.id);
  for (const id of ['classic', 'editorial', 'velvet', 'postcard', 'starry', 'cute-duck', 'formal']) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes('keep-calm'));
  assert.ok(!ids.includes('zine'));
});

test('retired designs still saved on pages keep rendering as themselves', () => {
  assert.equal(canonicalThemeId('keep-calm'), 'keep-calm');
  assert.equal(canonicalThemeId('zine'), 'zine');
});

test('deleted designs render their replacement; unknown ids fall back to Letter', () => {
  assert.equal(canonicalThemeId('ransom'), 'swiss');
  assert.equal(canonicalThemeId('typewriter'), 'handwritten');
  assert.equal(resolveTheme('mixtape').id, 'cute-duck');
  assert.equal(resolveTheme('nope').id, 'classic');
  assert.equal(resolveTheme('starry').id, 'starry');
});

test('every design is free for now', () => {
  for (const t of listThemes()) assert.equal(isPremiumTheme(t.id), false, t.id);
  assert.equal(isPremiumTheme('unknown'), false);
});
