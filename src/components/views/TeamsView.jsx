import TeamList from '../teams/TeamList.jsx';
import TeamPage from '../teams/TeamPage.jsx';
import MemberPage from '../teams/MemberPage.jsx';
import { CARDS, CARDS_BY_ID, PLAYERS_BY_ID, TEAMS, TEAMS_BY_ID, TEAM_CARD_IDS } from '../../domain/catalog.js';
import { filterCards } from '../../domain/cards.js';
import { getPlayerTeams, getTeamCardSources, getTeamMembers } from '../../domain/teams.js';
import { RELATION_LABELS } from '../../domain/format.js';

// A lista de times não muda: montada uma vez só.
const TEAM_ITEMS = TEAMS.map((team) => ({
  team,
  members: getTeamMembers(team, PLAYERS_BY_ID),
  cardCount: TEAM_CARD_IDS.get(team.id).size,
}));

/** "Usou · Gon Freecss, Killua Zoldyck" — quem teve cada carta do time. */
function buildNotes(team) {
  const notes = new Map();
  for (const [cardId, { relation, holders }] of getTeamCardSources(team, PLAYERS_BY_ID)) {
    const names = [...new Set(holders.map((holder) => (holder.type === 'team' ? 'o grupo' : holder.name)))];
    notes.set(cardId, `${RELATION_LABELS[relation]} · ${names.join(', ')}`);
  }
  return notes;
}

/**
 * Aba "Times". Decide qual tela mostrar a partir de `route`:
 *   { playerId } → página do integrante · { teamId } → página do time · {} → lista
 * Renderização condicional: cada `return` devolve uma tela diferente.
 */
export default function TeamsView({ route, onNavigate, favoriteIds, onOpenCard, onShowInBinder }) {
  const team = route.teamId ? TEAMS_BY_ID.get(route.teamId) : null;
  const player = route.playerId ? PLAYERS_BY_ID.get(route.playerId) : null;

  if (player) {
    return (
      <MemberPage
        player={player}
        teams={getPlayerTeams(player, TEAMS_BY_ID)}
        entries={player.cards.map((entry) => ({ card: CARDS_BY_ID.get(entry.id), entry }))}
        backTeam={team}
        favoriteIds={favoriteIds}
        onBack={() => onNavigate(team ? { teamId: team.id } : {})}
        onOpenTeam={(teamId) => onNavigate({ teamId })}
        onOpenCard={onOpenCard}
      />
    );
  }

  if (team) {
    return (
      <TeamPage
        team={team}
        members={getTeamMembers(team, PLAYERS_BY_ID)}
        cards={filterCards(CARDS, { ids: TEAM_CARD_IDS.get(team.id) })}
        notes={buildNotes(team)}
        favoriteIds={favoriteIds}
        onBack={() => onNavigate({})}
        onOpenMember={(playerId) => onNavigate({ teamId: team.id, playerId })}
        onOpenCard={onOpenCard}
        onShowInBinder={onShowInBinder}
      />
    );
  }

  return <TeamList items={TEAM_ITEMS} onOpenTeam={(teamId) => onNavigate({ teamId })} />;
}
