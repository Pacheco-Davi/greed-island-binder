// Testes de cor e contraste. Rodar com: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHex, relativeLuminance, contrastRatio, inkFor, INK_DARK, INK_LIGHT } from './color.js';
import { RANK_PALETTE, rankBackgrounds, rankStyle, categoryStyle } from './palette.js';

const { categories } = JSON.parse(readFileSync(new URL('../data/greed-island-cards.json', import.meta.url), 'utf8'));
const AA = 4.5;

describe('funções de contraste', () => {
  test('lê #rgb e #rrggbb', () => {
    assert.deepEqual(parseHex('#c62828'), [198, 40, 40]);
    assert.deepEqual(parseHex('fff'), [255, 255, 255]);
    assert.throws(() => parseHex('vermelho'), /Cor inválida/);
  });

  test('valores de referência das WCAG', () => {
    assert.equal(relativeLuminance('#000000'), 0);
    assert.equal(relativeLuminance('#ffffff'), 1);
    assert.equal(contrastRatio('#000', '#fff'), 21);
    assert.equal(contrastRatio('#777', '#777'), 1);
    assert.equal(contrastRatio('#fff', '#000'), contrastRatio('#000', '#fff')); // ordem não importa
  });

  test('inkFor escolhe a tinta com mais contraste', () => {
    assert.equal(inkFor('#151515'), INK_LIGHT); // fundo preto → texto branco
    assert.equal(inkFor('#e0b020'), INK_DARK); // fundo amarelo → texto escuro
  });

  test('com gradiente, inkFor garante o pior caso', () => {
    // Branco → preto: nenhuma tinta é boa nas duas pontas, mas a escolha maximiza o mínimo.
    const ink = inkFor(['#ffffff', '#808080']);
    assert.equal(ink, INK_DARK);
  });
});

describe('paleta do app passa no AA (4,5:1)', () => {
  test('cada categoria com a tinta escolhida', () => {
    for (const { id, color } of categories) {
      const { '--category-ink': ink } = categoryStyle(color);
      assert.ok(contrastRatio(color, ink) >= AA, `${id}: ${contrastRatio(color, ink).toFixed(2)}`);
    }
  });

  test('cada rank, em TODAS as paradas do gradiente metálico', () => {
    for (const rank of [...Object.keys(RANK_PALETTE), null]) {
      const ink = rankStyle(rank)['--rank-ink'];
      for (const bg of rankBackgrounds(rank)) {
        assert.ok(contrastRatio(bg, ink) >= AA, `${rank} sobre ${bg}: ${contrastRatio(bg, ink).toFixed(2)}`);
      }
    }
  });

  test('SS e S são metálicos; os demais, cor sólida', () => {
    assert.match(rankStyle('SS')['--rank-gradient'], /^linear-gradient/);
    assert.match(rankStyle('S')['--rank-gradient'], /^linear-gradient/);
    assert.equal(rankStyle('A')['--rank-gradient'], 'none');
  });
});
