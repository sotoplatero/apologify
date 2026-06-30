import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomSuffix, buildApologySlug, isLikelySlug } from './slug.js';

test('randomSuffix is base36 of requested length and varies', () => {
  const a = randomSuffix(6);
  assert.equal(a.length, 6);
  assert.match(a, /^[0-9a-z]+$/);
  assert.notEqual(randomSuffix(6), randomSuffix(6));
});

test('buildApologySlug uses name + title and ends with a suffix', () => {
  const s = buildApologySlug({ recipientName: 'Mia', recipient: 'girlfriend', title: 'Forgetting Our Anniversary' });
  assert.match(s, /^mia-forgetting-our-anniversary-[0-9a-z]{6}$/);
});

test('buildApologySlug falls back to recipient when no name', () => {
  const s = buildApologySlug({ recipient: 'customers', title: 'Service Outage Apology' });
  assert.match(s, /^customers-service-outage-apology-[0-9a-z]{6}$/);
});

test('isLikelySlug validates kebab-case', () => {
  assert.equal(isLikelySlug('mia-forgetting-our-anniversary-ab12cd'), true);
  assert.equal(isLikelySlug('Has Space'), false);
  assert.equal(isLikelySlug('x'), false);
});
