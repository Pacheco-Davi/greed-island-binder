// Testes dos medidores. Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limitPosition, limitTicks, rankLevel, RANK_STEPS } from './meters.js';
import { RANK_ORDER } from './cards.js';

const close = (a, b) => Math.abs(a - b) < 1e-9;

test('limite em escala log: 1 → 0, máximo → 1', () => {
  assert.equal(limitPosition(1, 800), 0);
  assert.equal(limitPosition(800, 800), 1);
  assert.ok(close(limitPosition(10, 1000), 1 / 3)); // cada potência de 10 ocupa o mesmo espaço
  assert.ok(close(limitPosition(100, 1000), 2 / 3));
});

test('valores fora do domínio não quebram a barra', () => {
  assert.equal(limitPosition(null, 800), 0);
  assert.equal(limitPosition(0, 800), 0);
  assert.equal(limitPosition(5000, 800), 1); // acima do máximo: barra cheia
});

test('marcas da régua', () => {
  assert.deepEqual(limitTicks(800).map((t) => t.value), [1, 10, 100, 800]);
  assert.equal(limitTicks(800).at(-1).position, 1);
});

test('nível do rank coincide com a ordem do domínio (H = 1 … SS = 10)', () => {
  assert.equal(rankLevel('H'), 1);
  assert.equal(rankLevel('SS'), 10);
  assert.equal(rankLevel(null), 0);
  for (const rank of RANK_STEPS) assert.equal(rankLevel(rank), RANK_ORDER[rank]);
});
