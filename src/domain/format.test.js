// Testes dos textos formatados. Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plural, formatNumber, formatLimit, formatRank, formatRarity, formatSource, formatSlots } from './format.js';

test('plural', () => {
  assert.equal(plural(1, 'carta'), '1 carta');
  assert.equal(plural(0, 'carta'), '0 cartas');
  assert.equal(plural(2, 'aliança', 'alianças'), '2 alianças');
});

test('número, rank e limite', () => {
  assert.equal(formatNumber({ number: '000' }), '#000');
  assert.equal(formatNumber({ number: null }), 'Sem nº');
  assert.equal(formatRank({ rank: null }), '—');
  assert.equal(formatLimit({ limit: 17, unlimited: false, unknown: false }), '17');
  assert.equal(formatLimit({ limit: null, unlimited: true, unknown: false }), '∞ (ilimitado)');
  assert.equal(formatLimit({ limit: null, unlimited: false, unknown: true }), '? (desconhecido)');
  assert.equal(formatLimit({ limit: null, unlimited: false, unknown: false }), '—');
});

test('raridade', () => {
  assert.equal(formatRarity({ position: 3, tiedWith: 0, total: 154 }), '3ª mais rara entre 154 cartas com limite conhecido');
  assert.equal(formatRarity({ position: 1, tiedWith: 1, total: 154 }), '1ª mais rara (empatada com outra carta) entre 154 cartas com limite conhecido');
  assert.match(formatRarity({ position: 3, tiedWith: 2, total: 154 }), /outras 2/);
  assert.match(formatRarity(null), /Fora do ranking/);
});

test('fonte e slots', () => {
  assert.equal(formatSource({ relation: 'usou', chapter: 160 }), 'Usou · cap. 160');
  assert.equal(formatSource({ relation: 'possuía', chapter: null }), 'Possuía');
  assert.equal(formatSlots({ count: 99 }), '99/100 slots designados');
  assert.equal(formatSlots(null), null);
});
