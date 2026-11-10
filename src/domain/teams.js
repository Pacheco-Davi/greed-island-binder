/**
 * Regras de negócio dos times — funções puras, sem React.
 *
 * Os dados são "normalizados" como num banco de dados: o time guarda só os ids
 * dos integrantes (memberIds) e cada jogador guarda as próprias cartas.
 * Nada é copiado em dois lugares; o que é derivado (as cartas do time) é
 * calculado aqui.
 */

/** "usou" vale mais que "obteve", que vale mais que "possuía". */
export const RELATION_ORDER = Object.freeze({ possuía: 1, obteve: 2, usou: 3 });

/** Transforma uma lista em Map por id, para buscas O(1): playersById.get('genthru'). */
export function indexById(list) {
  return new Map(list.map((item) => [item.id, item]));
}

/** Os jogadores de um time, na ordem de memberIds. */
export function getTeamMembers(team, playersById) {
  return team.memberIds.map((id) => playersById.get(id)).filter(Boolean);
}

/** Os times (e alianças) de que o jogador faz parte. */
export function getPlayerTeams(player, teamsById) {
  return player.teamIds.map((id) => teamsById.get(id)).filter(Boolean);
}

/**
 * Cartas do time = cartas atribuídas ao grupo + cartas de cada integrante,
 * sem repetir. Devolve um Set, pronto para `filterCards(cards, { ids })`.
 */
export function getTeamCardIds(team, playersById) {
  const ids = new Set(team.cards.map((card) => card.id));
  for (const member of getTeamMembers(team, playersById)) {
    for (const card of member.cards) ids.add(card.id);
  }
  return ids;
}

/** Os times que tiveram a carta. `teamCardIds` é um Map teamId → Set de ids. */
export function getTeamsWithCard(cardId, teams, teamCardIds) {
  return teams.filter((team) => teamCardIds.get(team.id)?.has(cardId));
}

/**
 * Para a página do time: de onde vem cada carta, com a prova.
 * Devolve Map cardId → { relation, holders }, em que `relation` é a relação
 * mais forte entre todos que tiveram a carta e `holders` lista cada um:
 *   { type: 'team' | 'player', id, name, relation, evidence, chapter, source }
 */
export function getTeamCardSources(team, playersById) {
  const sources = new Map();

  const add = (card, holder) => {
    const entry = sources.get(card.id) ?? { relation: card.relation, holders: [] };
    if (RELATION_ORDER[card.relation] > RELATION_ORDER[entry.relation]) entry.relation = card.relation;
    entry.holders.push({ ...holder, relation: card.relation, evidence: card.evidence, chapter: card.chapter, source: card.source });
    sources.set(card.id, entry);
  };

  for (const card of team.cards) add(card, { type: 'team', id: team.id, name: team.name });
  for (const member of getTeamMembers(team, playersById)) {
    for (const card of member.cards) add(card, { type: 'player', id: member.id, name: member.name });
  }
  return sources;
}
