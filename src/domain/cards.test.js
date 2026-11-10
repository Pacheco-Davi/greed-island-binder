// Testes das regras de cartas. Rodar com: npm test
// Usa o executor de testes que já vem no Node (node:test): nenhuma dependência nova.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  normalizeCard,
  normalizeText,
  numberKey,
  searchCards,
  filterCards,
  sortCards,
  countByCategory,
  getRarityPosition,
} from './cards.js';

const data = JSON.parse(readFileSync(new URL('../data/greed-island-cards.json', import.meta.url), 'utf8'));
const cards = data.cards.map((raw) => normalizeCard(raw, { categories: data.categories }));
const ids = (list) => list.map((card) => card.id);
const byId = (id) => cards.find((card) => card.id === id);

describe('critérios de aceite da Etapa 2', () => {
  test('"bulba" não encontra nada', () => {
    assert.deepEqual(searchCards(cards, 'bulba'), []);
  });

  test('"25" (e "#025") encontra a carta 025', () => {
    assert.deepEqual(ids(searchCards(cards, '25')), ['025']);
    assert.deepEqual(ids(searchCards(cards, '#025')), ['025']);
  });

  test('"1001" encontra a 1001', () => {
    assert.deepEqual(ids(searchCards(cards, '1001')), ['1001']);
  });

  test('"-1" encontra a -001', () => {
    assert.deepEqual(ids(searchCards(cards, '-1')), ['-001']);
  });

  test('a busca funciona com e sem acento', () => {
    assert.deepEqual(ids(searchCards(cards, 'Ruler’s Blêssing')), ['000']);
    assert.deepEqual(ids(searchCards(cards, 'rulers blessing')), ['000']);
  });
});

describe('normalizeText e numberKey', () => {
  test('tira acento, apóstrofo e símbolos', () => {
    assert.equal(normalizeText('  Rúler’s  Blessing! '), 'rulers blessing');
    assert.equal(normalizeText("Map of the Island 'empty'"), 'map of the island empty');
    assert.equal(normalizeText(null), '');
  });

  test('ignora zeros à esquerda e mantém o sinal', () => {
    assert.equal(numberKey('025'), '25');
    assert.equal(numberKey('000'), '0');
    assert.equal(numberKey('-000'), '-0');
    assert.equal(numberKey('-001'), '-1');
    assert.equal(numberKey('abc'), null);
  });
});

describe('normalizeCard', () => {
  test('devolve um objeto congelado com os campos calculados', () => {
    const card = byId('000');
    assert.ok(Object.isFrozen(card));
    assert.equal(card.rankOrder, 10); // SS
    assert.equal(card.searchName, 'rulers blessing blessing of ruler'); // nome + tradução alternativa
    assert.equal(card.categoryInfo.label, 'Slot designado');
    assert.throws(() => {
      'use strict';
      card.name = 'outro';
    }, TypeError);
  });

  test('rank H vale 1 e carta sem rank vale 0', () => {
    assert.equal(byId('711').rankOrder, 1); // H-800
    assert.equal(byId('-000').rankOrder, 0); // Game Master
  });

  test('limite ∞ vira Infinity e "?" vira null', () => {
    assert.equal(byId('607').limitValue, Number.POSITIVE_INFINITY);
    assert.equal(byId('7018').limitValue, null);
  });

  test('sem getImage, a imagem é null', () => {
    assert.equal(byId('000').image, null);
    const withImage = normalizeCard(data.cards[0], { getImage: (id) => `/img/${id}.webp` });
    assert.equal(withImage.image, '/img/000.webp');
  });
});

describe('searchCards', () => {
  test('busca vazia (ou só com símbolos) devolve todas', () => {
    assert.equal(searchCards(cards, '').length, cards.length);
    assert.equal(searchCards(cards, '   ').length, cards.length);
    assert.equal(searchCards(cards, '#').length, cards.length);
  });

  test('"0" encontra só a 000 e "-0" só a -000', () => {
    assert.deepEqual(ids(searchCards(cards, '0')), ['000']);
    assert.deepEqual(ids(searchCards(cards, '-0')), ['-000']);
  });

  test('palavras em qualquer ordem, e a tradução alternativa também conta', () => {
    assert.deepEqual(ids(searchCards(cards, 'blessing ruler')), ['000']);
    assert.deepEqual(ids(searchCards(cards, 'little devil')), ['018']); // altName de "Imp's Wink"
  });

  test('pedaço de palavra também encontra', () => {
    assert.ok(ids(searchCards(cards, 'rul')).includes('110')); // Ruler's Invitation
  });
});

describe('filterCards e countByCategory', () => {
  test('filtra por categoria e por rank', () => {
    assert.equal(filterCards(cards, { category: 'spell' }).length, 40);
    assert.equal(filterCards(cards, { rank: 'SS' }).length, 7);
    assert.deepEqual(ids(filterCards(cards, { query: 'ruler', rank: 'SS', category: 'free' })), ['110']);
  });

  test('restringe a um conjunto de ids (times e favoritos)', () => {
    assert.deepEqual(ids(filterCards(cards, { ids: new Set(['1001', '000']) })), ['000', '1001']);
  });

  test('sem filtros devolve todas', () => {
    assert.equal(filterCards(cards).length, cards.length);
  });

  test('conta cartas por categoria', () => {
    assert.deepEqual(countByCategory(cards), { specified: 100, free: 20, spell: 40, gm: 4 });
  });
});

describe('sortCards', () => {
  test('não altera o array original', () => {
    const before = ids(cards);
    sortCards(cards, { field: 'name' });
    assert.deepEqual(ids(cards), before);
  });

  test('"number" segue a ordem do fichário: designadas, livres, feitiços, GM', () => {
    const sorted = ids(sortCards(cards, { field: 'number' }));
    assert.deepEqual(sorted.slice(0, 2), ['000', '001']);
    assert.equal(sorted[100], '100'); // primeira livre
    assert.equal(sorted.indexOf('1001'), 120); // primeira de feitiço, depois das 20 livres
    assert.deepEqual(sorted.slice(-4), ['-000', '-001', '-002', '-003']);
  });

  test('"name" usa ordem alfabética do pt-BR', () => {
    const sorted = sortCards(cards, { field: 'name' });
    const names = sorted.map((card) => card.name);
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
    assert.deepEqual(names, names.toSorted(collator.compare));
  });

  test('"rank" desc começa pelos SS e deixa as de Game Master no fim', () => {
    const sorted = sortCards(cards, { field: 'rank', direction: 'desc' });
    assert.equal(sorted[0].rank, 'SS');
    assert.deepEqual(sorted.slice(-4).map((card) => card.category), ['gm', 'gm', 'gm', 'gm']);
  });

  test('"limit" asc: menor limite primeiro, ∞ depois dos números, "?" e GM no fim', () => {
    const sorted = sortCards(cards, { field: 'limit' });
    assert.deepEqual(ids(sorted.slice(0, 2)), ['000', '110']); // limite 1 (empate resolvido pelo fichário)
    const firstInfinite = sorted.findIndex((card) => card.unlimited);
    assert.equal(firstInfinite, 154); // depois das 154 cartas com limite numérico
    assert.ok(sorted.slice(-6).every((card) => card.limitValue === null));
  });

  test('campo desconhecido gera erro claro', () => {
    assert.throws(() => sortCards(cards, { field: 'hp' }), /desconhecido/);
  });
});

describe('getRarityPosition', () => {
  test('empates dividem a posição, como num pódio', () => {
    assert.deepEqual(getRarityPosition(byId('000'), cards), { position: 1, tiedWith: 1, total: 154 });
    assert.deepEqual(getRarityPosition(byId('110'), cards), { position: 1, tiedWith: 1, total: 154 });
    assert.deepEqual(getRarityPosition(byId('017'), cards), { position: 3, tiedWith: 2, total: 154 });
  });

  test('limite ∞, "?" e Game Master não entram no ranking', () => {
    assert.equal(getRarityPosition(byId('607'), cards), null);
    assert.equal(getRarityPosition(byId('7018'), cards), null);
    assert.equal(getRarityPosition(byId('-000'), cards), null);
  });
});
