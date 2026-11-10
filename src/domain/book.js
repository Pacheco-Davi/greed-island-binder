/**
 * Máquina de estados do livro — função pura, sem React.
 *
 *   fechado ──OPEN──▶ abrindo ──DONE──▶ aberto ──CLOSE──▶ fechando ──DONE──▶ fechado
 *
 * Uma máquina de estados deixa explícito o que pode acontecer em cada
 * momento: clicar em "abrir" no meio do fechamento, por exemplo, é ignorado,
 * em vez de deixar o livro num estado impossível ("meio aberto e fechando").
 */

export const BOOK_STATES = Object.freeze(['closed', 'opening', 'open', 'closing']);

const TRANSITIONS = Object.freeze({
  closed: { OPEN: 'opening' },
  opening: { DONE: 'open' },
  open: { CLOSE: 'closing' },
  closing: { DONE: 'closed' },
});

/** Duração das animações (ms). O CSS recebe estes valores por variável: uma fonte só. */
export const BOOK_DURATIONS = Object.freeze({ opening: 1100, closing: 800, reduced: 180 });

/** Reducer: (estado atual, ação) → próximo estado. Ação que não vale no estado atual é ignorada. */
export function bookReducer(state, action) {
  return TRANSITIONS[state]?.[action.type] ?? state;
}

/** Estado inicial: com um endereço específico (#/times/gon), o livro já começa aberto. */
export function initialBookState(hash) {
  return hash && hash !== '#' && hash !== '#/' ? 'open' : 'closed';
}
