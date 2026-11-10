// Testes das rotas. Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, buildHash } from './routes.js';

test('lê as abas', () => {
  assert.deepEqual(parseHash(''), { tab: 'fichario', teamId: null, playerId: null });
  assert.deepEqual(parseHash('#/'), { tab: 'fichario', teamId: null, playerId: null });
  assert.equal(parseHash('#/favoritos').tab, 'favoritos');
  assert.deepEqual(parseHash('#/times'), { tab: 'times', teamId: null, playerId: null });
});

test('lê time e integrante', () => {
  assert.deepEqual(parseHash('#/times/gon'), { tab: 'times', teamId: 'gon', playerId: null });
  assert.deepEqual(parseHash('#/times/gon/killua-zoldyck'), { tab: 'times', teamId: 'gon', playerId: 'killua-zoldyck' });
  assert.deepEqual(parseHash('#times/gon/'), { tab: 'times', teamId: 'gon', playerId: null }); // tolera barras a menos/a mais
});

test('endereço desconhecido ou malformado cai no fichário', () => {
  assert.equal(parseHash('#/pokedex').tab, 'fichario');
  assert.equal(parseHash('#/favoritos/extra').teamId, null);
  assert.doesNotThrow(() => parseHash('#/times/%E0'));
});

test('buildHash é o inverso de parseHash', () => {
  for (const route of [
    { tab: 'fichario' },
    { tab: 'favoritos' },
    { tab: 'times' },
    { tab: 'times', teamId: 'nickes-alliance' },
    { tab: 'times', teamId: 'gon', playerId: 'biscuit-krueger' },
  ]) {
    assert.deepEqual(parseHash(buildHash(route)), { teamId: null, playerId: null, ...route });
  }
  assert.equal(buildHash({ tab: 'fichario', teamId: 'gon' }), '#/fichario'); // time só existe na aba Times
});
