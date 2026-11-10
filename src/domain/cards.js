/**
 * Regras de negócio das cartas — funções puras, sem React.
 *
 * "Pura" quer dizer: a mesma entrada sempre gera a mesma saída e a função não
 * tem efeitos colaterais (não mexe no DOM, não lê localStorage, não altera o
 * array que recebeu). Por isso dá para testar tudo com `npm test`, sem navegador.
 */

/** SS é o rank mais alto (10) e H o mais baixo (1). Carta sem rank = 0. */
export const RANK_ORDER = Object.freeze({ SS: 10, S: 9, A: 8, B: 7, C: 6, D: 5, E: 4, F: 3, G: 2, H: 1 });

/** Ordem das seções do fichário: designadas → livres → feitiços → Game Master. */
export const CATEGORY_ORDER = Object.freeze({ specified: 0, free: 1, spell: 2, gm: 3 });

export const SORT_FIELDS = Object.freeze(['number', 'name', 'rank', 'limit']);

// Criado uma vez só: montar um Collator é caro, e ele é usado em todo sort.
// numeric: true → "Card 2" vem antes de "Card 10"; sensitivity: 'base' → ignora maiúsculas e acentos.
const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

// ---------------------------------------------------------------------------
// Texto e número
// ---------------------------------------------------------------------------

/**
 * Deixa o texto no formato usado na busca: minúsculo, sem acento e sem símbolos.
 *   "Rúler’s  Blessing!" → "rulers blessing"
 */
export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD') // "ú" vira "u" + acento solto…
    .replace(/\p{Diacritic}/gu, '') // …e o acento solto é removido
    .toLowerCase()
    .replace(/['’`]/g, '') // apóstrofo some: "ruler's" → "rulers" (assim "rulers" também encontra)
    .replace(/[^a-z0-9]+/g, ' ') // qualquer outro símbolo vira espaço
    .trim();
}

/**
 * Forma canônica do número, para comparar ignorando zeros à esquerda mas
 * mantendo o sinal: "025" → "25", "000" → "0", "-001" → "-1", "-000" → "-0".
 */
export function numberKey(text) {
  const match = /^(-?)0*(\d+)$/.exec(String(text ?? '').trim());
  return match ? match[1] + match[2] : null;
}

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------

/**
 * Recebe a carta crua do JSON e devolve uma carta "pronta para a interface",
 * com campos calculados uma única vez (em vez de recalcular a cada render).
 *
 * As dependências chegam por parâmetro (injeção de dependência): assim esta
 * função não precisa saber de onde vêm as categorias nem as imagens, e os
 * testes podem chamá-la sem o Vite.
 *
 * O resultado é congelado (Object.freeze): ninguém consegue alterar a carta
 * sem querer, por exemplo `card.name = 'x'` dentro de um componente.
 */
export function normalizeCard(raw, { categories = [], getImage = () => null } = {}) {
  const category = categories.find((c) => c.id === raw.category);

  return Object.freeze({
    ...raw,
    spellClass: raw.spellClass ? Object.freeze([...raw.spellClass]) : null,
    searchName: normalizeText(`${raw.name} ${raw.altName ?? ''}`),
    numberKey: raw.number === null ? null : numberKey(raw.number),
    numberOrder: raw.number === null ? Number.POSITIVE_INFINITY : Math.abs(Number(raw.number)),
    rankOrder: RANK_ORDER[raw.rank] ?? 0,
    limitValue: raw.unlimited ? Number.POSITIVE_INFINITY : raw.limit, // null = desconhecido ou sem limite
    categoryInfo: Object.freeze(category ? { ...category } : { id: raw.category, label: raw.category, color: null }),
    image: getImage(raw.id), // URL da imagem ou null (a interface decide o que mostrar no lugar)
  });
}

// ---------------------------------------------------------------------------
// Busca e filtros
// ---------------------------------------------------------------------------

/** "25", "#025", "1001", "-1", "# 7018" contam como busca por número. */
const NUMERIC_QUERY = /^#?\s*(-?\d+)$/;

/**
 * - Busca numérica: compara o número ignorando zeros à esquerda e mantendo o
 *   sinal ("-1" encontra só a -001, "0" encontra a 000 mas não a -000).
 * - Busca por texto: cada palavra digitada precisa aparecer no nome (ou na
 *   tradução alternativa), em qualquer ordem e sem depender de acento.
 * - Busca vazia devolve todas as cartas.
 */
export function searchCards(cards, query) {
  const text = String(query ?? '').trim();
  if (!text) return cards;

  const numeric = NUMERIC_QUERY.exec(text);
  if (numeric) {
    const key = numberKey(numeric[1]);
    return cards.filter((card) => card.numberKey === key);
  }

  const words = normalizeText(text).split(' ').filter(Boolean);
  if (words.length === 0) return cards; // a busca só tinha símbolos
  return cards.filter((card) => words.every((word) => card.searchName.includes(word)));
}

/**
 * Junta busca e filtros. `null` (ou ausente) significa "sem filtro".
 *   ids: Set de ids permitidos. Serve para "cartas do time" e também para os favoritos.
 */
export function filterCards(cards, { query = '', category = null, rank = null, ids = null } = {}) {
  return searchCards(cards, query).filter(
    (card) =>
      (category === null || card.category === category) &&
      (rank === null || card.rank === rank) &&
      (ids === null || ids.has(card.id)),
  );
}

/** Quantas cartas existem em cada categoria (para os chips do filtro). */
export function countByCategory(cards) {
  const counts = Object.fromEntries(Object.keys(CATEGORY_ORDER).map((id) => [id, 0]));
  for (const card of cards) counts[card.category] = (counts[card.category] ?? 0) + 1;
  return counts;
}

// ---------------------------------------------------------------------------
// Ordenação
// ---------------------------------------------------------------------------

/** Ordem do fichário: seção (categoria) → número → nome. É o desempate de todas as outras. */
function compareBinder(a, b) {
  return (
    CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] ||
    compareNumbers(a.numberOrder, b.numberOrder) ||
    collator.compare(a.name, b.name)
  );
}

/** Compara números aceitando Infinity (Infinity - Infinity daria NaN). */
function compareNumbers(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Devolve um array NOVO ordenado (toSorted não altera o original; sort alteraria).
 *   field: 'number' (ordem do fichário) | 'name' | 'rank' | 'limit'
 *   direction: 'asc' | 'desc'
 * Cartas sem valor (sem rank, limite "?") ficam sempre no fim, nos dois sentidos.
 */
export function sortCards(cards, { field = 'number', direction = 'asc' } = {}) {
  const sign = direction === 'desc' ? -1 : 1;

  const byValue = (getValue) => (a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va === null || vb === null) return (va === null) - (vb === null) || compareBinder(a, b);
    return sign * compareNumbers(va, vb) || compareBinder(a, b);
  };

  const comparators = {
    number: (a, b) => sign * compareBinder(a, b),
    name: (a, b) => sign * collator.compare(a.name, b.name) || compareBinder(a, b),
    rank: byValue((card) => (card.rank === null ? null : card.rankOrder)),
    limit: byValue((card) => card.limitValue),
  };

  const compare = comparators[field];
  if (!compare) throw new Error(`Campo de ordenação desconhecido: "${field}"`);
  return cards.toSorted(compare);
}

// ---------------------------------------------------------------------------
// Raridade
// ---------------------------------------------------------------------------

/**
 * Posição da carta entre as mais raras: quanto menor o limite de conversão,
 * mais rara. Empates dividem a posição (como num pódio: 1º, 1º, 3º…).
 * Cartas com limite ∞, "?" ou sem limite (Game Master) não entram: devolve null.
 *
 *   { position: 3, tiedWith: 2, total: 154 } → "3ª mais rara (empatada com outras 2) entre 154 cartas"
 */
export function getRarityPosition(card, cards) {
  if (typeof card.limit !== 'number') return null;
  const ranked = cards.filter((c) => typeof c.limit === 'number');
  const rarer = ranked.filter((c) => c.limit < card.limit).length;
  const sameLimit = ranked.filter((c) => c.limit === card.limit).length;
  return { position: rarer + 1, tiedWith: sameLimit - 1, total: ranked.length };
}
