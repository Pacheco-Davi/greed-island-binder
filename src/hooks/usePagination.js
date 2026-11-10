import { useCallback, useState } from 'react';
import { paginate } from '../domain/pagination.js';

/**
 * Página atual de uma lista + direção da última virada (para a animação).
 *
 * `resetKey` muda quando a lista "é outra" (outro filtro, outra busca): aí a
 * paginação volta para a primeira página. O ajuste é feito DURANTE o render,
 * guardando a chave anterior no estado — é o padrão recomendado pela
 * documentação do React ("You Might Not Need an Effect"): com um useEffect,
 * a tela primeiro pintaria a página errada e só depois corrigiria.
 */
export function usePagination(items, pageSize, resetKey) {
  const [state, setState] = useState({ page: 0, direction: 0, resetKey });

  if (state.resetKey !== resetKey) {
    setState({ page: 0, direction: 0, resetKey });
  }

  const result = paginate(items, state.resetKey === resetKey ? state.page : 0, pageSize);

  const goTo = useCallback((page) => {
    setState((current) => ({ ...current, page, direction: Math.sign(page - current.page) }));
  }, []);

  return {
    ...result,
    direction: state.direction, // -1 voltou, 1 avançou, 0 primeira exibição
    hasPrevious: result.page > 0,
    hasNext: result.page < result.pageCount - 1,
    previous: () => goTo(result.page - 1),
    next: () => goTo(result.page + 1),
  };
}
