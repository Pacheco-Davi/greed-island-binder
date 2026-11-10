import { useState } from 'react';
import Tabs from './components/controls/Tabs.jsx';
import CardDetails from './components/cards/CardDetails.jsx';
import BinderView from './components/views/BinderView.jsx';
import FavoritesView from './components/views/FavoritesView.jsx';
import TeamsView from './components/views/TeamsView.jsx';
import { CARDS, CARDS_BY_ID, PLACEHOLDER_IMAGE, SPELL_CLASSES, TEAMS, TEAM_CARD_IDS } from './domain/catalog.js';
import { countByCategory, filterCards, getRarityPosition, sortCards } from './domain/cards.js';
import { getTeamsWithCard } from './domain/teams.js';
import './css/App.css';

const EMPTY_FILTERS = Object.freeze({ query: '', category: null, rank: null, teamId: null });
const DEFAULT_SORT = Object.freeze({ field: 'number', direction: 'asc' });

/**
 * O App guarda o ESTADO e distribui por props. O estado mora aqui (e não em
 * cada aba) porque várias partes precisam dele: por exemplo, o botão
 * "Ver no fichário" da página de um time muda o filtro do Fichário E troca de aba.
 * Isso se chama "elevar o estado" (lifting state up).
 *
 * Na Etapa 4, esses useState viram hooks customizados (useCardFilters, useFavorites…).
 */
export default function App() {
  const [tab, setTab] = useState('fichario');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [openCardId, setOpenCardId] = useState(null);
  const [teamsRoute, setTeamsRoute] = useState({});

  // ---- Estado derivado: calculado a partir do estado acima, a cada render ----
  // (não vai para outro useState: se fosse, poderia ficar dessincronizado)
  const teamCardIds = filters.teamId ? TEAM_CARD_IDS.get(filters.teamId) : null;
  const visibleCards = sortCards(filterCards(CARDS, { ...filters, ids: teamCardIds }), sort);
  const categoryCounts = countByCategory(filterCards(CARDS, { ...filters, category: null, ids: teamCardIds }));
  const favoriteCards = filterCards(CARDS, { ids: favoriteIds });
  const hasFilters = Object.keys(EMPTY_FILTERS).some((key) => filters[key] !== EMPTY_FILTERS[key]);
  const openCard = openCardId ? CARDS_BY_ID.get(openCardId) : null;

  // ---- Eventos ----
  function setFilter(name, value) {
    // Nunca alterar o objeto antigo: criamos um novo com o spread (...).
    // É a troca de referência que avisa o React que algo mudou.
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function toggleFavorite(cardId) {
    setFavoriteIds((previous) => {
      const next = new Set(previous); // cópia: o Set antigo continua intacto
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  function navigateTeams(route) {
    setTeamsRoute(route);
    window.scrollTo({ top: 0 });
  }

  function openTeam(teamId) {
    setOpenCardId(null);
    setTab('times');
    navigateTeams({ teamId });
  }

  function showTeamInBinder(teamId) {
    setFilters({ ...EMPTY_FILTERS, teamId });
    setTab('fichario');
    window.scrollTo({ top: 0 });
  }

  const tabs = [
    { id: 'fichario', label: 'Fichário', count: CARDS.length },
    { id: 'favoritos', label: 'Favoritos', count: favoriteIds.size },
    { id: 'times', label: 'Times', count: TEAMS.length },
  ];

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Fichário de Greed Island</h1>
        <p className="app__subtitle">As cartas do jogo de Hunter x Hunter</p>
        <Tabs tabs={tabs} selected={tab} onChange={setTab} label="Seções do fichário" />
      </header>

      <main className="app__main">
        <section className="app__panel" role="tabpanel" id={`painel-${tab}`} aria-labelledby={`aba-${tab}`}>
          {tab === 'fichario' && (
            <BinderView
              filters={filters}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              onClear={() => setFilters(EMPTY_FILTERS)}
              hasFilters={hasFilters}
              cards={visibleCards}
              categoryCounts={categoryCounts}
              total={CARDS.length}
              favoriteIds={favoriteIds}
              onOpenCard={setOpenCardId}
            />
          )}
          {tab === 'favoritos' && (
            <FavoritesView cards={favoriteCards} favoriteIds={favoriteIds} onOpenCard={setOpenCardId} onGoToBinder={() => setTab('fichario')} />
          )}
          {tab === 'times' && (
            <TeamsView route={teamsRoute} onNavigate={navigateTeams} favoriteIds={favoriteIds} onOpenCard={setOpenCardId} onShowInBinder={showTeamInBinder} />
          )}
        </section>
      </main>

      <footer className="app__footer">
        <p>
          Dados adaptados da{' '}
          <a href="https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists" target="_blank" rel="noreferrer">
            Hunter x Hunter Wiki
          </a>{' '}
          (Fandom, licença CC BY-SA). Hunter x Hunter e as artes das cartas pertencem a seus autores e detentores de direitos;
          projeto acadêmico, sem fins comerciais.
        </p>
      </footer>

      {/* Renderização condicional: o painel só existe enquanto há uma carta aberta. */}
      {openCard && (
        <CardDetails
          card={openCard}
          rarity={getRarityPosition(openCard, CARDS)}
          spellClasses={(openCard.spellClass ?? []).map((id) => SPELL_CLASSES.get(id)).filter(Boolean)}
          teams={getTeamsWithCard(openCard.id, TEAMS, TEAM_CARD_IDS)}
          placeholder={PLACEHOLDER_IMAGE}
          isFavorite={favoriteIds.has(openCard.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setOpenCardId(null)}
          onOpenTeam={openTeam}
        />
      )}
    </div>
  );
}
