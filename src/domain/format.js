/**
 * Textos formatados para a interface — funções puras, sem React.
 * Ficam aqui (e não espalhados nos componentes) para que a mesma carta seja
 * escrita do mesmo jeito em todo lugar, e para poderem ser testadas.
 */

export const RELATION_LABELS = Object.freeze({ usou: 'Usou', obteve: 'Obteve', possuía: 'Possuía' });
export const KIND_LABELS = Object.freeze({ time: 'Time', alianca: 'Aliança' });

/** plural(1, 'carta') → "1 carta"; plural(3, 'carta') → "3 cartas"; plural(2, 'aliança', 'alianças') */
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** "#000", "#-001", ou "Sem nº" para a carta sem número. */
export function formatNumber(card) {
  return card.number === null ? 'Sem nº' : `#${card.number}`;
}

export function formatRank(card) {
  return card.rank ?? '—';
}

export function formatLimit(card) {
  if (card.unlimited) return '∞ (ilimitado)';
  if (card.unknown) return '? (desconhecido)';
  if (card.limit === null) return '—';
  return String(card.limit);
}

/** Recebe o resultado de getRarityPosition. */
export function formatRarity(rarity) {
  if (!rarity) return 'Fora do ranking (limite ∞, desconhecido ou inexistente)';
  const { position, tiedWith, total } = rarity;
  const tie = tiedWith === 0 ? '' : tiedWith === 1 ? ' (empatada com outra carta)' : ` (empatada com outras ${tiedWith})`;
  return `${position}ª mais rara${tie} entre ${total} cartas com limite conhecido`;
}

/** "Usou · cap. 160" */
export function formatSource({ relation, chapter }) {
  return chapter ? `${RELATION_LABELS[relation]} · cap. ${chapter}` : RELATION_LABELS[relation];
}

/**
 * Momento da contagem com o capítulo no fim, sem duplicar:
 *   "Antes da troca com Genthru." + 152 → "Antes da troca com Genthru (cap. 152)."
 */
export function formatSlotsMoment({ moment, chapter }) {
  const text = moment.replace(/\s*\(cap\. \d+\)/g, '').replace(/[.\s]+$/, '');
  return chapter ? `${text} (cap. ${chapter}).` : `${text}.`;
}

/** "99/100 slots designados" ou null quando a wiki não informa. */
export function formatSlots(specifiedSlots) {
  return specifiedSlots ? `${specifiedSlots.count}/100 slots designados` : null;
}
