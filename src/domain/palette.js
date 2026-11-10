/**
 * Cores que dependem de DADOS (rank e categoria de cada carta). Ficam em JS,
 * e não só no CSS, porque a cor do texto é calculada por contraste (inkFor):
 * o CSS ainda não sabe escolher sozinho entre tinta clara e escura.
 *
 * SS e S têm acabamento metálico (ouro e prata): `stops` vira um gradiente.
 * Os demais ranks usam tons sóbrios, todos com contraste ≥ 4,5:1 com o texto.
 */
import { inkFor } from './color.js';

export const RANK_PALETTE = Object.freeze({
  SS: { base: '#e3bf55', stops: ['#fff4c4', '#e3bf55', '#b8892a', '#f4d985'], finish: 'ouro' },
  S: { base: '#c3c8d2', stops: ['#ffffff', '#d5d9e1', '#9aa1ae', '#eef1f5'], finish: 'prata' },
  A: { base: '#7a2335' },
  B: { base: '#8a4b1f' },
  C: { base: '#4f6b2e' },
  D: { base: '#2f6670' },
  E: { base: '#3c5592' },
  F: { base: '#5d4a85' },
  G: { base: '#6b6460' },
  H: { base: '#3d3a37' },
});

const NO_RANK = Object.freeze({ base: '#d8d2c4' });

/** Todas as cores de fundo de um rank (a base e, se for metálico, as paradas do gradiente). */
export function rankBackgrounds(rank) {
  const entry = RANK_PALETTE[rank] ?? NO_RANK;
  return entry.stops ?? [entry.base];
}

/**
 * Variáveis CSS para pintar um selo de rank:
 *   --rank-bg (cor sólida), --rank-gradient (só SS e S) e --rank-ink (texto).
 */
export function rankStyle(rank) {
  const entry = RANK_PALETTE[rank] ?? NO_RANK;
  return {
    '--rank-bg': entry.base,
    '--rank-gradient': entry.stops ? `linear-gradient(135deg, ${entry.stops.join(', ')})` : 'none',
    '--rank-ink': inkFor(rankBackgrounds(rank)),
  };
}

/** Variáveis CSS para pintar algo com a cor da categoria (vinda do JSON). */
export function categoryStyle(color) {
  return { '--category-color': color, '--category-ink': inkFor(color) };
}
