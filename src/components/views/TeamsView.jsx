import TeamList from '../teams/TeamList.jsx';
import TeamPage from '../teams/TeamPage.jsx';
import MemberPage from '../teams/MemberPage.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { CARDS, CARDS_BY_ID, PLAYERS_BY_ID, TEAMS, TEAMS_BY_ID, TEAM_CARD_IDS } from '../../domain/catalog.js';
import { filterCards } from '../../domain/cards.js';
import { getPlayerTeams, getTeamCardSources, getTeamMembers } from '../../domain/teams.js';
import { RELATION_LABELS } from '../../domain/format.js';
import { buildHash } from '../../domain/routes.js';

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
 * Aba "Times". A tela depende da rota (vinda da URL):
 *   #/times/:teamId/:playerId → integrante · #/times/:teamId → time · #/times → lista
 * Um endereço com id que não existe (link antigo, erro de digitação) mostra "não encontrado".
 */
export default function TeamsView({ route, favoriteIds, onOpenCard, onShowInBinder }) {
  const team = route.teamId ? TEAMS_BY_ID.get(route.teamId) : null;
  const player = route.playerId ? PLAYERS_BY_ID.get(route.playerId) : null;

  if (route.teamId && !team) {
    return <EmptyState title="Time não encontrado" message={`Não existe um time com o endereço “${route.teamId}”.`} action={{ label: 'Ver todos os times', href: buildHash({ tab: 'times' }) }} />;
  }

  if (route.playerId && !player) {
    return <EmptyState title="Jogador não encontrado" message={`Não existe um jogador com o endereço “${route.playerId}”.`} action={{ label: `Voltar para ${team.name}`, href: buildHash({ tab: 'times', teamId: team.id }) }} />;
  }

  if (player) {
    return (
      <MemberPage
        player={player}
        teams={getPlayerTeams(player, TEAMS_BY_ID)}
        entries={player.cards.map((entry) => ({ card: CARDS_BY_ID.get(entry.id), entry }))}
        backTeam={team}
        favoriteIds={favoriteIds}
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
        onOpenCard={onOpenCard}
        onShowInBinder={onShowInBinder}
      />
    );
  }

  return <TeamList items={TEAM_ITEMS} />;
}
