#!/usr/bin/env node
/**
 * Converte o CSV das cartas de Greed Island no JSON usado pela aplicação.
 *
 * Uso:
 *   npm run data
 *   node scripts/csv-to-json.mjs [entrada.csv] [saida.json]
 *
 * Node puro, sem dependências. Roda uma vez (ou sempre que o CSV mudar);
 * o JSON gerado é versionado junto com o código.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = resolve(process.argv[2] ?? `${ROOT}/scripts/greed-island-cards.csv`);
const OUTPUT = resolve(process.argv[3] ?? `${ROOT}/src/data/greed-island-cards.json`);
const IMAGES_DIR = `${ROOT}/src/assets/cards`;
const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'];

// ---------------------------------------------------------------------------
// Tabelas de referência
// ---------------------------------------------------------------------------

/** Colunas reais do CSV (lidas do cabeçalho) → nome do campo no nosso código. */
const COLUMNS = {
  number: 'numero',
  name: 'nome',
  rankLimit: 'rank',
  description: 'descricao_efeito',
  category: 'categoria', // opcional: se faltar, deduzimos pela faixa do número
  spellClass: 'classe', // opcional
};
const REQUIRED_COLUMNS = ['number', 'name', 'rankLimit', 'description'];

const CATEGORIES = [
  { id: 'specified', label: 'Slot designado', range: '000–099', color: '#c62828' },
  { id: 'free', label: 'Slot livre', range: '100+', color: '#e0b020' },
  { id: 'spell', label: 'Feitiço', range: '1001–1040', color: '#1e5bb8' },
  { id: 'gm', label: 'Game Master', range: '-000 a -003', color: '#151515' },
];

/** Como a categoria aparece escrita no CSV → id interno. */
const CATEGORY_BY_CSV_LABEL = {
  'specified slot': 'specified',
  'free slot': 'free',
  spell: 'spell',
  'game master': 'gm',
};

/** Do mais alto para o mais baixo (a wiki lista H → SS, do menor para o maior). */
const RANKS = ['SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Legenda das classes de feitiço, traduzida da seção "List of the 40 Spell Cards"
 * da Hunter x Hunter Wiki. `group` separa o alcance (range) do tipo (type).
 */
const SPELL_CLASSES = [
  { id: 'SR', group: 'range', label: 'Curto alcance', labelEn: 'Short Range', description: 'Normalmente afeta o espaço pessoal de quem usa.' },
  { id: 'LR', group: 'range', label: 'Longo alcance', labelEn: 'Long Range', description: 'O efeito alcança qualquer coisa a mais de um metro de distância.' },
  { id: 'RS', group: 'type', label: 'Feitiço comum', labelEn: 'Regular Spell', description: 'Feitiço de efeito instantâneo e constante.' },
  { id: 'AS', group: 'type', label: 'Feitiço de ataque', labelEn: 'Attack Spell', description: 'Feitiço que afeta outro jogador.' },
  { id: 'DS', group: 'type', label: 'Feitiço defensivo', labelEn: 'Defensive Spell', description: 'Feitiço aplicado em quem usa.' },
  { id: 'AA', group: 'type', label: 'Feitiço antiataque', labelEn: 'Anti-Attack Spell', description: 'Impede o uso de feitiços de ataque.' },
  { id: 'C', group: 'type', label: 'Feitiço contínuo', labelEn: 'Continuous Spell', description: 'Fica ativo até ser destruído.' },
  { id: 'VS', group: 'type', label: 'Feitiço de oposição', labelEn: 'Versus Spell', description: 'Feitiço que neutraliza outro.' },
  { id: '*S', group: 'type', label: 'Feitiço especial', labelEn: 'Special Spell', description: 'Carta com atributos especiais (só as cartas de Game Master têm).' },
];
const SPELL_CLASS_IDS = new Set(SPELL_CLASSES.map((c) => c.id));

// ---------------------------------------------------------------------------
// 1. Parser de CSV (RFC 4180)
// ---------------------------------------------------------------------------

/**
 * Lê o texto caractere por caractere, como uma máquina de estados com dois
 * modos: "dentro de aspas" e "fora de aspas". Isso resolve os casos que um
 * simples `split(',')` quebraria:
 *   - vírgula dentro do texto:  "A castle ..., a town ..."
 *   - aspas escapadas:          "the ""Mountain God's Garden"""
 *   - quebra de linha dentro de um campo entre aspas
 *
 * Antes de começar, os finais de linha \r\n (Windows) e \r (Mac antigo) viram \n,
 * então o parser só precisa conhecer um tipo de quebra.
 *
 * Devolve [{ line, fields }], em que `line` é a linha do arquivo onde o
 * registro começa (para as mensagens de erro apontarem o lugar certo).
 */
function parseCsv(rawText) {
  const text = rawText.replace(/\r\n?/g, '\n');
  const records = [];
  let fields = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let recordLine = 1;

  const endField = () => {
    fields.push(field);
    field = '';
  };
  const endRecord = () => {
    endField();
    records.push({ line: recordLine, fields });
    fields = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'; // "" dentro de aspas = uma aspa literal
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        if (ch === '\n') line++;
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      endField();
    } else if (ch === '\n') {
      endRecord();
      line++;
      recordLine = line;
    } else {
      field += ch;
    }
  }

  if (inQuotes) {
    throw new Error(`Aspas abertas e nunca fechadas no registro que começa na linha ${recordLine}.`);
  }
  if (field !== '' || fields.length > 0) endRecord(); // última linha sem \n no final

  return records;
}

// ---------------------------------------------------------------------------
// 2. Normalização de cada campo
// ---------------------------------------------------------------------------

/**
 * O número é uma STRING de propósito: "000", "-001" e "1001" perderiam o zero à
 * esquerda e o sinal se virassem Number (000 → 0, -000 → -0).
 * "?" ou vazio = carta sem número conhecido → null.
 */
function parseNumber(raw) {
  const value = raw.trim();
  if (value === '' || value === '?') return { number: null };
  if (!/^-?\d+$/.test(value)) return { error: `número inválido "${raw}"` };
  return { number: value };
}

/** Faixas do enunciado, usadas quando o CSV não traz a coluna de categoria. */
function categoryFromNumber(number) {
  if (number === null) return null;
  if (number.startsWith('-')) return 'gm';
  const n = Number(number);
  if (number.length === 3 && n <= 99) return 'specified';
  if (n >= 1001 && n <= 1040) return 'spell';
  return 'free';
}

/**
 * "A-17" → { rank: 'A', limit: 17 }
 * "H-∞"  → { rank: 'H', limit: null, unlimited: true }
 * "C-?"  → { rank: 'C', limit: null, unknown: true }
 * ""     → { rank: null, limit: null }  (cartas de Game Master)
 */
function parseRankLimit(raw) {
  const value = raw.trim();
  const empty = { rank: null, limit: null, unlimited: false, unknown: false };
  if (value === '' || value === '-') return empty;

  const match = /^(SS|S|A|B|C|D|E|F|G|H)\s*-\s*(\d+|∞|\?)$/i.exec(value);
  if (!match) return { error: `rank/limite em formato desconhecido "${raw}" (esperado algo como "A-17")` };

  const [, rank, limit] = match;
  return {
    rank: rank.toUpperCase(),
    limit: /^\d+$/.test(limit) ? Number(limit) : null,
    unlimited: limit === '∞',
    unknown: limit === '?',
  };
}

/**
 * "Ruler's Blessing (Blessing of Ruler)" → nome + tradução literal alternativa.
 * "Risky Dice (Risky Dice)" → a tradução é igual ao nome, então altName = null.
 */
function parseName(raw) {
  const value = raw.trim();
  const match = /^(.+?)\s*\(([^()]+)\)$/.exec(value);
  if (!match) return { name: value, altName: null };
  const [, name, altName] = match;
  return { name, altName: altName.toLowerCase() === name.toLowerCase() ? null : altName };
}

/** "SR ¦ DS ¦ C" → ['SR', 'DS', 'C']. O separador do CSV é a barra partida ¦. */
function parseSpellClass(raw) {
  const codes = raw.split(/\s*[¦|]\s*/).map((c) => c.trim().toUpperCase()).filter(Boolean);
  return codes.length ? codes : null;
}

/** Caminho curto para as mensagens (relativo à raiz do projeto, quando possível). */
function show(path) {
  const rel = relative(ROOT, path);
  return rel.startsWith('..') ? path : rel;
}

function findImage(id) {
  return IMAGE_EXTENSIONS.some((ext) => existsSync(`${IMAGES_DIR}/${id}.${ext}`));
}

// ---------------------------------------------------------------------------
// 3. Conversão
// ---------------------------------------------------------------------------

function convert(csvText) {
  const records = parseCsv(csvText.replace(/^﻿/, '')); // remove o BOM do Excel
  if (records.length === 0) throw new Error('CSV vazio.');

  // Cabeçalho → índice de cada coluna
  const header = records[0].fields.map((h) => h.trim().toLowerCase());
  const col = {};
  for (const [key, csvName] of Object.entries(COLUMNS)) {
    const index = header.indexOf(csvName);
    if (index !== -1) col[key] = index;
  }
  const missing = REQUIRED_COLUMNS.filter((key) => col[key] === undefined);
  if (missing.length) {
    throw new Error(
      `Colunas obrigatórias ausentes: ${missing.map((k) => COLUMNS[k]).join(', ')}.\n` +
        `  Cabeçalho encontrado: ${header.join(', ')}`,
    );
  }

  const cards = [];
  const skipped = []; // linhas descartadas (erro)
  const warnings = []; // linhas aproveitadas, mas com algo estranho
  const seenIds = new Set();
  const withoutNumber = {}; // contador por categoria, para gerar ids

  for (const { line, fields } of records.slice(1)) {
    if (fields.every((f) => f.trim() === '')) continue; // linha em branco

    const skip = (reason) => skipped.push(`linha ${line}: ${reason}`);
    const warn = (reason) => warnings.push(`linha ${line}: ${reason}`);
    const get = (key) => (col[key] === undefined ? '' : (fields[col[key]] ?? ''));

    if (fields.length !== header.length) {
      skip(`${fields.length} colunas (o cabeçalho tem ${header.length})`);
      continue;
    }

    const { name, altName } = parseName(get('name'));
    if (!name) {
      skip('carta sem nome');
      continue;
    }

    const parsedNumber = parseNumber(get('number'));
    if (parsedNumber.error) {
      skip(`${name}: ${parsedNumber.error}`);
      continue;
    }
    const { number } = parsedNumber;

    // Categoria: a coluna do CSV tem prioridade; a faixa do número é o plano B.
    const csvCategory = get('category').trim();
    const byNumber = categoryFromNumber(number);
    let category = byNumber;
    if (csvCategory) {
      category = CATEGORY_BY_CSV_LABEL[csvCategory.toLowerCase()];
      if (!category) {
        skip(`${name}: categoria desconhecida "${csvCategory}"`);
        continue;
      }
      if (byNumber && byNumber !== category) {
        warn(`${name}: o número ${number} sugere "${byNumber}", mas o CSV diz "${category}" (mantido o CSV)`);
      }
    }
    if (!category) {
      skip(`${name}: sem número e sem categoria, impossível classificar`);
      continue;
    }

    const rankLimit = parseRankLimit(get('rankLimit'));
    if (rankLimit.error) {
      skip(`${name}: ${rankLimit.error}`);
      continue;
    }
    if (rankLimit.rank === null && category !== 'gm') {
      warn(`${name}: carta sem rank/limite (só as de Game Master deveriam ser assim)`);
    }

    const spellClass = parseSpellClass(get('spellClass'));
    if (spellClass) {
      const unknownCodes = spellClass.filter((c) => !SPELL_CLASS_IDS.has(c));
      if (unknownCodes.length) warn(`${name}: classe desconhecida ${unknownCodes.join(', ')}`);
      if (category !== 'spell' && category !== 'gm') warn(`${name}: tem classe, mas não é feitiço`);
    } else if (category === 'spell') {
      warn(`${name}: feitiço sem classe`);
    }

    // Carta sem número ganha um id estável e legível: "free-sem-numero-1"
    let id = number;
    if (id === null) {
      withoutNumber[category] = (withoutNumber[category] ?? 0) + 1;
      id = `${category}-sem-numero-${withoutNumber[category]}`;
    }
    if (seenIds.has(id)) {
      skip(`${name}: id "${id}" repetido`);
      continue;
    }
    seenIds.add(id);

    if (!findImage(id)) warn(`${name}: imagem não encontrada (src/assets/cards/${id}.webp)`);

    cards.push({
      id,
      number,
      name,
      altName,
      category,
      rank: rankLimit.rank,
      limit: rankLimit.limit,
      unlimited: rankLimit.unlimited,
      unknown: rankLimit.unknown,
      spellClass,
      description: get('description').trim(),
    });
  }

  return { cards, skipped, warnings };
}

// ---------------------------------------------------------------------------
// 4. Execução: lê, converte, grava e imprime o resumo
// ---------------------------------------------------------------------------

function main() {
  let result;
  try {
    result = convert(readFileSync(INPUT, 'utf8'));
  } catch (error) {
    console.error(`✖ Não foi possível converter ${show(INPUT)}\n  ${error.message}`);
    process.exit(1);
  }
  const { cards, skipped, warnings } = result;

  // Trava de segurança: nunca trocar o JSON bom por um vazio.
  if (cards.length === 0) {
    console.error(`✖ Nenhuma carta válida em ${show(INPUT)}. O JSON existente NÃO foi alterado.`);
    skipped.forEach((s) => console.error(`  - ${s}`));
    process.exit(1);
  }

  const data = {
    meta: {
      source: 'https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists',
      license: 'CC BY-SA (Hunter x Hunter Wiki / Fandom)',
      total: cards.length,
    },
    categories: CATEGORIES,
    ranks: RANKS,
    spellClasses: SPELL_CLASSES,
    cards,
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(data, null, 2)}\n`);

  // Resumo
  const count = (predicate) => cards.filter(predicate).length;
  const pad = Math.max(...CATEGORIES.map((c) => c.label.length));
  console.log(`✔ ${cards.length} cartas → ${show(OUTPUT)}\n`);
  for (const category of CATEGORIES) {
    console.log(`  ${category.label.padEnd(pad)}  ${String(count((c) => c.category === category.id)).padStart(3)}`);
  }
  console.log(
    `\n  limite ∞: ${count((c) => c.unlimited)} · limite ?: ${count((c) => c.unknown)} · ` +
      `sem rank: ${count((c) => c.rank === null)} · sem número: ${count((c) => c.number === null)} · ` +
      `com imagem: ${count((c) => findImage(c.id))}/${cards.length}`,
  );

  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} aviso(s) — a carta foi mantida:`);
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (skipped.length) {
    console.log(`\n✖ ${skipped.length} linha(s) inválida(s) — ignorada(s):`);
    skipped.forEach((s) => console.log(`  - ${s}`));
    process.exitCode = 1; // o JSON foi gerado, mas sinaliza o problema (útil em CI)
  }
  if (!warnings.length && !skipped.length) console.log('\n  Nenhum aviso. Nenhuma linha inválida.');
}

main();
