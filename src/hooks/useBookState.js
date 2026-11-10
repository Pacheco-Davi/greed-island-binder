import { useCallback, useEffect, useReducer } from 'react';
import { BOOK_DURATIONS, bookReducer, initialBookState } from '../domain/book.js';
import { useMediaQuery } from './useMediaQuery.js';

/**
 * Estado do livro: 'closed' | 'opening' | 'open' | 'closing'.
 *
 * useReducer em vez de useState: as regras de transição moram numa função
 * pura (bookReducer, em src/domain/book.js), e os componentes só "despacham"
 * ações ({ type: 'OPEN' }). Quem decide se a ação vale é o reducer.
 *
 * Os estados intermediários ('opening', 'closing') duram o tempo da animação;
 * um efeito agenda o 'DONE'. Com prefers-reduced-motion, a animação vira um
 * fade curto e a espera também encurta.
 */
export function useBookState() {
  const [state, dispatch] = useReducer(bookReducer, window.location.hash, initialBookState);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const duration = reducedMotion ? BOOK_DURATIONS.reduced : (BOOK_DURATIONS[state] ?? 0);

  useEffect(() => {
    if (state !== 'opening' && state !== 'closing') return undefined;
    const timer = setTimeout(() => dispatch({ type: 'DONE' }), duration);
    return () => clearTimeout(timer); // se o componente sair antes, o timer não dispara depois
  }, [state, duration]);

  const open = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const close = useCallback(() => dispatch({ type: 'CLOSE' }), []);

  return { state, open, close, duration, reducedMotion };
}
