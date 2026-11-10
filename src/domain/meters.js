/**
 * Matemática dos medidores do verso da carta — funções puras.
 *
 * Por que escala LOGARÍTMICA no limite de conversão? Os limites vão de 1 a 800.
 * Numa barra comum (linear), 1, 3, 10 e 20 ficariam todos espremidos no
 * comecinho e pareceriam iguais. No log, cada "multiplicar por 10" ocupa o
 * mesmo espaço: 1→10 e 10→100 têm a mesma largura. É como a escala Richter
 * dos terremotos.
 */

/** Posição (0 a 1) de um limite numa escala log de 1 até `max`. */
export function limitPosition(limit, max) {
  if (!(limit >= 1) || !(max > 1)) return 0;
  return Math.min(1, Math.log(limit) / Math.log(max));
}

/** Marcas da régua: 1, 10, 100… até `max` (e o próprio `max`), com a posição de cada uma. */
export function limitTicks(max) {
  const ticks = [];
  for (let value = 1; value < max; value *= 10) ticks.push(value);
  ticks.push(max);
  return ticks.map((value) => ({ value, position: limitPosition(value, max) }));
}

/** Os 10 degraus do medidor de rank, do mais baixo (H) ao mais alto (SS). */
export const RANK_STEPS = Object.freeze(['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS']);

/** Nível do rank no medidor: H = 1 … SS = 10; sem rank = 0. */
export function rankLevel(rank) {
  return RANK_STEPS.indexOf(rank) + 1;
}
