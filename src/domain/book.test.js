// Testes da máquina de estados do livro e da paginação. Rodar com: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { bookReducer, initialBookState, BOOK_STATES } from './book.js';
import { paginate } from './pagination.js';

describe('bookReducer', () => {
  test('ciclo completo: fechado → abrindo → aberto → fechando → fechado', () => {
    let state = 'closed';
    for (const [action, expected] of [['OPEN', 'opening'], ['DONE', 'open'], ['CLOSE', 'closing'], ['DONE', 'closed']]) {
      state = bookReducer(state, { type: action });
      assert.equal(state, expected);
    }
  });

  test('ações fora de hora são ignoradas', () => {
    assert.equal(bookReducer('opening', { type: 'CLOSE' }), 'opening'); // não fecha no meio da abertura
    assert.equal(bookReducer('closing', { type: 'OPEN' }), 'closing');
    assert.equal(bookReducer('open', { type: 'OPEN' }), 'open');
    assert.equal(bookReducer('closed', { type: 'DONE' }), 'closed');
    assert.equal(bookReducer('closed', { type: 'QUALQUER' }), 'closed');
  });

  test('todos os estados alcançáveis são conhecidos', () => {
    for (const state of BOOK_STATES) {
      for (const type of ['OPEN', 'CLOSE', 'DONE']) assert.ok(BOOK_STATES.includes(bookReducer(state, { type })));
    }
  });

  test('com endereço específico, começa aberto', () => {
    assert.equal(initialBookState(''), 'closed');
    assert.equal(initialBookState('#/'), 'closed');
    assert.equal(initialBookState('#/times/gon'), 'open');
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 164 }, (_, i) => i);

  test('divide em páginas de 20', () => {
    const first = paginate(items, 0, 20);
    assert.equal(first.pageCount, 9);
    assert.deepEqual(first.items, items.slice(0, 20));
    assert.deepEqual(paginate(items, 8, 20).items, [160, 161, 162, 163]);
  });

  test('página fora do intervalo é presa ao válido', () => {
    assert.equal(paginate(items, 99, 20).page, 8);
    assert.equal(paginate(items, -3, 20).page, 0);
    assert.equal(paginate(items.slice(0, 5), 4, 20).page, 0);
  });

  test('lista vazia tem 1 página vazia', () => {
    assert.deepEqual(paginate([], 0, 20), { items: [], page: 0, pageCount: 1, start: 0 });
  });
});
