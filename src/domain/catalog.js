/**
 * Catálogo: o ÚNICO lugar que lê os arquivos JSON. Ele normaliza os dados uma
 * vez, quando o app carrega, e entrega tudo pronto para os componentes.
 *
 * Se um dia os dados vierem de uma API em vez de JSON, só este arquivo muda.
 */
import cardsData from '../data/greed-island-cards.json';
import teamsData from '../data/teams.json';
import playersData from '../data/players.json';
import { normalizeCard } from './cards.js';
import { indexById, getTeamCardIds } from './teams.js';
import { getCardImage, PLACEHOLDER_IMAGE } from './images.js';

export const CATEGORIES = Object.freeze(cardsData.categories);
export const RANKS = Object.freeze(cardsData.ranks);
export const SPELL_CLASSES = indexById(cardsData.spellClasses);

export const CARDS = Object.freeze(
  cardsData.cards.map((raw) => normalizeCard(raw, { categories: CATEGORIES, getImage: getCardImage })),
);
export const CARDS_BY_ID = indexById(CARDS);

export const TEAMS = Object.freeze(teamsData.teams);
export const TEAMS_BY_ID = indexById(TEAMS);
export const PLAYERS = Object.freeze(playersData.players);
export const PLAYERS_BY_ID = indexById(PLAYERS);

/**
 * Cartas de cada time (Map teamId → Set de ids), calculadas uma vez só: os dados
 * são fixos, então não há motivo para recalcular a cada render.
 */
export const TEAM_CARD_IDS = new Map(TEAMS.map((team) => [team.id, getTeamCardIds(team, PLAYERS_BY_ID)]));

/** Fonte e licença dos dados (para os créditos). */
export const SOURCES = Object.freeze({ cards: cardsData.meta, teams: teamsData.meta });

export { PLACEHOLDER_IMAGE };
