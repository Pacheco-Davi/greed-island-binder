import { useCallback, useEffect, useMemo, useRef } from 'react';
import Tabs from './components/controls/Tabs.jsx';
import ThemeToggle from './components/controls/ThemeToggle.jsx';
import CardDetails from './components/cards/CardDetails.jsx';
import Book from './components/book/Book.jsx';
import BookCover from './components/book/BookCover.jsx';
import Emblem from './components/book/Emblem.jsx';
import BinderView from './components/views/BinderView.jsx';
import FavoritesView from './components/views/FavoritesView.jsx';
import TeamsView from './components/views/TeamsView.jsx';
import { CARDS, CARDS_BY_ID, PLACEHOLDER_IMAGE, PLAYERS_BY_ID, SPELL_CLASSES, TEAMS, TEAMS_BY_ID, TEAM_CARD_IDS } from './domain/catalog.js';
import { countByCategory, filterCards, getRarityPosition } from './domain/cards.js';
import { getTeamsWithCard } from './domain/teams.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import { useTheme } from './hooks/useTheme.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useCardFilters } from './hooks/useCardFilters.js';
import { useCardDetail } from './hooks/useCardDetail.js';
import { useBookState } from './hooks/useBookState.js';
import './css/App.css';

const APP_TITLE = 'Fichário de Greed Island';
const TAB_LABELS = { fichario: 'Fichário', favoritos: 'Favoritos', times: 'Times' };
const CATALOG_TOTALS = countByCategory(CARDS); // fixo: quantas cartas existem por categoria

// Definida FORA do componente: é a mesma função em todos os renders (o
// useFavorites a usa como dependência de efeito).
const isKnownCard = (id) => CARDS_BY_ID.has(id);

/**
 * O App compõe os hooks e decide o que aparece na mesa:
 *   livro fechado (ou abrindo/fechando) → BookCover, a capa em 3D
 *   livro aberto                        → Book, com as abas e as páginas
 */
export default function App() {
  const [route, navigate] = useHashRoute();
  const { theme, toggleTheme } = useTheme();
  const { favoriteIds, toggleFavorite } = useFavorites(isKnownCard);
  const binder = useCardFilters(CARDS, TEAM_CARD_IDS);
  const detail = useCardDetail();
  const book = useBookState();

  const favoriteCards = useMemo(() => filterCards(CARDS, { ids: favoriteIds }), [favoriteIds]);
  const collection = useMemo(() => ({ counts: countByCategory(favoriteCards), totals: CATALOG_TOTALS }), [favoriteCards]);
  const visibleIds = useMemo(() => binder.visibleCards.map((card) => card.id), [binder.visibleCards]);
  const openCard = detail.openId ? CARDS_BY_ID.get(detail.openId) : null;

  // ---- Foco gerenciado nas transições do livro ----
  // Quem usa teclado não pode "perder" o foco quando a capa some: ao terminar
  // de abrir, o foco vai para a aba ativa; ao terminar de fechar, volta à capa.
  const coverRef = useRef(null);
  const bookRef = useRef(null);
  const previousBookState = useRef(book.state);
  useEffect(() => {
    const previous = previousBookState.current;
    previousBookState.current = book.state;
    if (previous === 'opening' && book.state === 'open') bookRef.current?.querySelector('[role="tab"][aria-selected="true"]')?.focus();
    if (previous === 'closing' && book.state === 'closed') coverRef.current?.focus();
  }, [book.state]);

  // Título da aba do navegador acompanha a página.
  const pageName =
    book.state !== 'open'
      ? null
      : route.playerId
        ? PLAYERS_BY_ID.get(route.playerId)?.name
        : route.teamId
          ? TEAMS_BY_ID.get(route.teamId)?.name
          : TAB_LABELS[route.tab];
  useEffect(() => {
    document.title = pageName ? `${pageName} · ${APP_TITLE}` : APP_TITLE;
  }, [pageName]);

  // Página nova começa do topo.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.tab, route.teamId, route.playerId]);

  const { applyFilters } = binder;
  const showTeamInBinder = useCallback(
    (teamId) => {
      applyFilters({ teamId });
      navigate({ tab: 'fichario' });
    },
    [applyFilters, navigate],
  );

  const tabs = [
    { id: 'fichario', label: 'Fichário', count: CARDS.length },
    { id: 'favoritos', label: 'Favoritos', count: favoriteCards.length },
    { id: 'times', label: 'Times', count: TEAMS.length },
  ];

  return (
    <div className="app" data-book={book.state}>
      <header className="app__topbar">
        <Emblem className="app__emblem" framed={false} />
        <h1 className="app__title">{APP_TITLE}</h1>
        <div className="app__actions">
          {book.state === 'open' && (
            <button type="button" className="app__close-book" onClick={book.close}>
              Fechar o livro
            </button>
          )}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="app__main">
        {book.state === 'open' ? (
          <Book ref={bookRef} tabs={<Tabs tabs={tabs} selected={route.tab} onChange={(tab) => navigate({ tab })} label="Seções do fichário" />}>
            <section className="app__panel" role="tabpanel" id={`painel-${route.tab}`} aria-labelledby={`aba-${route.tab}`}>
              {route.tab === 'fichario' && (
                <BinderView
                  filters={binder.filters}
                  onFilterChange={binder.setFilter}
                  sort={binder.sort}
                  onSortChange={binder.setSort}
                  onClear={binder.clearFilters}
                  hasFilters={binder.hasFilters}
                  cards={binder.visibleCards}
                  categoryCounts={binder.categoryCounts}
                  total={CARDS.length}
                  favoriteIds={favoriteIds}
                  onOpenCard={detail.open}
                  onRandom={() => detail.openRandom(visibleIds)}
                  collection={collection}
                />
              )}
              {route.tab === 'favoritos' && (
                <FavoritesView cards={favoriteCards} favoriteIds={favoriteIds} onOpenCard={detail.open} onGoToBinder={() => navigate({ tab: 'fichario' })} collection={collection} />
              )}
              {route.tab === 'times' && <TeamsView route={route} favoriteIds={favoriteIds} onOpenCard={detail.open} onShowInBinder={showTeamInBinder} />}
            </section>
          </Book>
        ) : (
          <BookCover ref={coverRef} state={book.state} duration={book.duration} onOpen={book.open} />
        )}
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

      {openCard && (
        <CardDetails
          card={openCard}
          rarity={getRarityPosition(openCard, CARDS)}
          spellClasses={(openCard.spellClass ?? []).map((id) => SPELL_CLASSES.get(id)).filter(Boolean)}
          teams={getTeamsWithCard(openCard.id, TEAMS, TEAM_CARD_IDS)}
          placeholder={PLACEHOLDER_IMAGE}
          isFavorite={favoriteIds.has(openCard.id)}
          onToggleFavorite={toggleFavorite}
          onClose={detail.close}
          navigation={{
            position: detail.position,
            total: detail.total,
            hasPrevious: detail.hasPrevious,
            hasNext: detail.hasNext,
            onPrevious: detail.previous,
            onNext: detail.next,
            onRandom: () => detail.openRandom(detail.ids),
          }}
        />
      )}
    </div>
  );
}
