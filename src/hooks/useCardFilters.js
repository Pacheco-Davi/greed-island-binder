import { useCallback, useMemo, useState } from 'react';
import { countByCategory, filterCards, sortCards } from '../domain/cards.js';

export const EMPTY_FILTERS = Object.freeze({ query: '', category: null, rank: null, teamId: null });
export const DEFAULT_SORT = Object.freeze({ field: 'number', direction: 'asc' });

/**
 * Busca, filtros e ordem do fichário, num hook só.
 *
 * O que é guardado (useState): o que o usuário escolheu (filters, sort).
 * O que é calculado (useMemo): as cartas visíveis e as contagens por categoria.
 * useMemo guarda o resultado e só refaz a conta quando uma dependência muda:
 * abrir uma carta ou favoritar re-renderiza o App, mas não refiltra as 164 cartas.
 *
 * @param cards        lista completa (normalizada)
 * @param teamCardIds  Map teamId → Set de ids (para o filtro "cartas do time")
 */
export function useCardFilters(cards, teamCardIds) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const setFilter = useCallback((name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }, []);

  /** Troca todos os filtros de uma vez (ex.: "Ver no fichário" = só o filtro do time). */
  const applyFilters = useCallback((partial) => setFilters({ ...EMPTY_FILTERS, ...partial }), []);
  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const ids = filters.teamId ? (teamCardIds.get(filters.teamId) ?? null) : null;

  const visibleCards = useMemo(() => sortCards(filterCards(cards, { ...filters, ids }), sort), [cards, filters, ids, sort]);

  // As contagens ignoram o filtro de categoria: cada chip mostra quantas cartas
  // ele teria se fosse clicado, com a busca e os outros filtros atuais.
  const { query, rank } = filters;
  const categoryCounts = useMemo(() => countByCategory(filterCards(cards, { query, rank, ids })), [cards, query, rank, ids]);

  const hasFilters = Object.keys(EMPTY_FILTERS).some((key) => filters[key] !== EMPTY_FILTERS[key]);

  return { filters, setFilter, applyFilters, clearFilters, sort, setSort, visibleCards, categoryCounts, hasFilters };
}
