import { useCallback, useState } from 'react';
import { pickRandomId } from '../domain/cards.js';

/**
 * Qual carta está aberta no detalhe e em qual LISTA ela estava.
 *
 * Guardamos { ids, index } da lista que estava na tela no momento do clique
 * (o fichário filtrado, os favoritos, as cartas de um time…). Assim
 * "anterior/próximo" percorre exatamente o que a pessoa via, com a busca e os
 * filtros daquele momento.
 */
export function useCardDetail() {
  const [detail, setDetail] = useState(null); // { ids: string[], index: number } | null

  /** Abre a carta `id`; `ids` é a lista de onde ela veio (padrão: só ela). */
  const open = useCallback((id, ids = [id]) => {
    const index = ids.indexOf(id);
    setDetail(index === -1 ? { ids: [id], index: 0 } : { ids, index });
  }, []);

  const close = useCallback(() => setDetail(null), []);

  /** delta = -1 (anterior) ou +1 (próximo). Para nas pontas. */
  const move = useCallback((delta) => {
    setDetail((current) => {
      if (!current) return current;
      const index = current.index + delta;
      return index < 0 || index >= current.ids.length ? current : { ...current, index };
    });
  }, []);

  const openId = detail ? detail.ids[detail.index] : null;

  /**
   * Sorteia uma carta de `ids` sem repetir a que está aberta.
   * O sorteio acontece AQUI, fora do setDetail: a função passada ao setState
   * precisa ser pura (o React a executa duas vezes no modo de desenvolvimento
   * para flagrar impurezas, e um Math.random lá dentro daria dois resultados).
   */
  const openRandom = useCallback(
    (ids) => {
      const id = pickRandomId(ids, openId);
      if (id !== null) setDetail({ ids, index: ids.indexOf(id) });
    },
    [openId],
  );

  const previous = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  return {
    openId,
    ids: detail?.ids ?? [],
    position: detail ? detail.index + 1 : 0, // 1-based, para mostrar "3 de 35"
    total: detail?.ids.length ?? 0,
    hasPrevious: detail ? detail.index > 0 : false,
    hasNext: detail ? detail.index < detail.ids.length - 1 : false,
    open,
    close,
    previous,
    next,
    openRandom,
  };
}
