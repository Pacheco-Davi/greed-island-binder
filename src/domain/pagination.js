/**
 * Paginação — função pura. Um fichário tem páginas com um número fixo de
 * bolsos; aqui são 20 por página.
 *
 *   paginate(164 itens, página 8, 20) → { items: os 4 últimos, page: 8, pageCount: 9 }
 *
 * A página pedida é "presa" ao intervalo válido: se um filtro deixar só 2
 * páginas e a pessoa estava na 5ª, ela vê a última que existe.
 */
export function paginate(items, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(0, page), pageCount - 1);
  const start = current * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, pageCount, start };
}
