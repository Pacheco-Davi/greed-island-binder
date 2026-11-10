// Testes das regras de times. Rodar com: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexById, getTeamMembers, getPlayerTeams, getTeamCardIds, getTeamCardSources, getTeamsWithCard } from './teams.js';

const read = (file) => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
const { teams } = read('teams.json');
const { players } = read('players.json');
const { cards } = read('greed-island-cards.json');
const teamsById = indexById(teams);
const playersById = indexById(players);
const cardIds = new Set(cards.map((card) => card.id));

describe('integridade dos dados', () => {
  test('todo integrante de time existe em players.json', () => {
    for (const team of teams) {
      assert.equal(getTeamMembers(team, playersById).length, team.memberIds.length, team.id);
    }
  });

  test('todo jogador pertence a pelo menos um time, e os times dele existem', () => {
    for (const player of players) {
      assert.ok(player.teamIds.length > 0, player.id);
      assert.equal(getPlayerTeams(player, teamsById).length, player.teamIds.length, player.id);
    }
  });

  test('toda carta citada em times e jogadores existe no catálogo e tem prova', () => {
    const entries = [...teams.flatMap((t) => t.cards), ...players.flatMap((p) => p.cards)];
    for (const entry of entries) {
      assert.ok(cardIds.has(entry.id), `carta ${entry.id}`);
      assert.ok(entry.evidence.length > 20, `prova da carta ${entry.id}`);
      assert.ok(['usou', 'obteve', 'possuía'].includes(entry.relation));
    }
  });
});

describe('getTeamCardIds', () => {
  test('junta as cartas do grupo e as dos integrantes, sem repetir', () => {
    const gon = teamsById.get('gon');
    const ids = getTeamCardIds(gon, playersById);
    assert.equal(ids.size, 35);
    assert.ok(ids.has('000')); // Ruler's Blessing, de Gon
    for (const card of gon.cards) assert.ok(ids.has(card.id));
  });

  test('time sem nenhuma carta comprovada devolve Set vazio', () => {
    assert.equal(getTeamCardIds(teamsById.get('trupe'), playersById).size, 0);
  });
});

describe('getTeamsWithCard', () => {
  test('encontra os times que tiveram a carta', () => {
    const teamCardIds = new Map(teams.map((team) => [team.id, getTeamCardIds(team, playersById)]));
    const ids = getTeamsWithCard('000', teams, teamCardIds).map((team) => team.id);
    assert.ok(ids.includes('gon'));
    assert.ok(!ids.includes('trupe'));
  });
});

describe('getTeamCardSources', () => {
  test('lista quem teve cada carta e fica com a relação mais forte', () => {
    const sources = getTeamCardSources(teamsById.get('gon'), playersById);
    assert.equal(sources.size, 35);
    const accompany = sources.get('1039');
    assert.equal(accompany.relation, 'usou');
    assert.ok(accompany.holders.some((h) => h.type === 'player' && h.id === 'gon-freecss'));
    for (const holder of accompany.holders) assert.ok(holder.evidence && holder.relation);
  });
});
