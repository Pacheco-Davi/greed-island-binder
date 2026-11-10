/**
 * Cor e contraste segundo as WCAG 2.x — funções puras, sem React.
 *
 * O contraste entre duas cores vai de 1:1 (iguais) a 21:1 (preto no branco).
 * Mínimos das WCAG (nível AA): 4,5:1 para texto normal, 3:1 para texto grande
 * (24px, ou 18,66px em negrito) e para ícones e bordas que transmitem informação.
 */

export const INK_DARK = '#1b1712';
export const INK_LIGHT = '#ffffff';

/** "#c62828" ou "#c22" → [198, 40, 40] */
export function parseHex(hex) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) throw new Error(`Cor inválida: "${hex}" (use #rgb ou #rrggbb)`);
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
}

/**
 * Luminância relativa: quanto de luz a cor "emite" para o olho, de 0 (preto)
 * a 1 (branco). O verde pesa mais que o vermelho, e o azul quase nada, porque
 * o olho humano é mais sensível ao verde.
 */
export function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores (1 a 21). A ordem não importa. */
export function contrastRatio(a, b) {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Escolhe a cor do texto (tinta escura ou clara) que dá mais contraste sobre
 * TODAS as cores de fundo informadas. Com um gradiente, passe todas as
 * paradas: o texto precisa ser legível na parte mais clara e na mais escura.
 */
export function inkFor(backgrounds, { dark = INK_DARK, light = INK_LIGHT } = {}) {
  const colors = Array.isArray(backgrounds) ? backgrounds : [backgrounds];
  const worst = (ink) => Math.min(...colors.map((bg) => contrastRatio(bg, ink)));
  return worst(dark) >= worst(light) ? dark : light;
}
