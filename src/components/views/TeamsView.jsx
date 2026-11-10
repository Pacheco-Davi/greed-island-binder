import BookSpread from '../book/BookSpread.jsx';
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
 * Aba "Times" no livro aberto:
 *   página esquerda = lista de times (o índice)
 *   página direita  = o time ou o integrante escolhido (vem da URL)
 * Em telas estreitas, a página exibida também vem da URL: sem time escolhido,
 * a lista; com time, o detalhe (que tem o link "voltar").
 */
export default function TeamsView({ route, favoriteIds, onOpenCard, onShowInBinder }) {
  const left = (
    <>
      <header className="book-page__header">
        <p className="book-page__eyebrow">Times</p>
        <h2 className="book-page__title">Índice de times</h2>
      </header>
      <TeamList items={TEAM_ITEMS} currentTeamId={route.teamId} />
    </>
  );

  return (
    <BookSpread
      left={left}
      right={<TeamsDetail route={route} favoriteIds={favoriteIds} onOpenCard={onOpenCard} onShowInBinder={onShowInBinder} />}
      labels={['Índice de times', 'Detalhe']}
      mobilePage={route.teamId ? 'right' : 'left'}
    />
  );
}

/** Página direita: integrante, time, "não encontrado" ou um convite para escolher. */
function TeamsDetail({ route, favoriteIds, onOpenCard, onShowInBinder }) {
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

  return (
    <div className="teams-intro">
      <header className="book-page__header">
        <p className="book-page__eyebrow">Times</p>
        <h2 className="book-page__title">Jogadores de Greed Island</h2>
      </header>
      <p>
        {TEAMS.filter((t) => t.kind === 'time').length} times e {TEAMS.filter((t) => t.kind === 'alianca').length} alianças que disputaram o jogo. Escolha um no índice para ver o
        resumo do arco, os integrantes e as cartas que o grupo teve — cada carta com o trecho da Hunter x Hunter Wiki que comprova.
      </p>
    </div>
  );
}
