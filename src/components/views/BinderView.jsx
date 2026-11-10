import { useState } from 'react';
import BookSpread from '../book/BookSpread.jsx';
import SearchBar from '../controls/SearchBar.jsx';
import CategoryFilter from '../controls/CategoryFilter.jsx';
import RankFilter from '../controls/RankFilter.jsx';
import TeamFilter from '../controls/TeamFilter.jsx';
import SortControl from '../controls/SortControl.jsx';
import PocketPage from '../cards/PocketPage.jsx';
import CollectionProgress from '../cards/CollectionProgress.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { CATEGORIES, RANKS, TEAMS, TEAMS_BY_ID, TEAM_CARD_IDS } from '../../domain/catalog.js';
import { plural } from '../../domain/format.js';
import '../../css/BinderView.css';

// Dados fixos: calculados uma vez, fora do componente.
const TEAM_CARD_COUNTS = new Map([...TEAM_CARD_IDS].map(([teamId, ids]) => [teamId, ids.size]));

/**
 * Aba "Fichário" no livro aberto:
 *   página esquerda = índice (busca, filtros, ordem, progresso da coleção)
 *   página direita  = bolsos com as cartas encontradas
 * Não guarda os filtros: recebe tudo do App por props. Só guarda qual página
 * aparece em telas estreitas (estado de interface, local a esta aba).
 */
export default function BinderView({ filters, onFilterChange, sort, onSortChange, onClear, hasFilters, cards, categoryCounts, total, favoriteIds, onOpenCard, onRandom, collection }) {
  const [mobilePage, setMobilePage] = useState('right');
  const activeTeam = filters.teamId ? TEAMS_BY_ID.get(filters.teamId) : null;
  const resultText = `${cards.length} de ${plural(total, 'carta')}${activeTeam ? ` · cartas de ${activeTeam.name}` : ''}`;

  const left = (
    <>
      <header className="book-page__header">
        <p className="book-page__eyebrow">Fichário</p>
        <h2 className="book-page__title">Índice</h2>
      </header>
      <div className="binder-view__controls">
        <SearchBar value={filters.query} onChange={(value) => onFilterChange('query', value)} />
        <CategoryFilter categories={CATEGORIES} counts={categoryCounts} value={filters.category} onChange={(value) => onFilterChange('category', value)} />
        <RankFilter ranks={RANKS} value={filters.rank} onChange={(value) => onFilterChange('rank', value)} />
        <TeamFilter teams={TEAMS} cardCounts={TEAM_CARD_COUNTS} value={filters.teamId} onChange={(value) => onFilterChange('teamId', value)} />
        <SortControl value={sort} onChange={onSortChange} />
      </div>

      <div className="binder-view__status">
        {/* aria-live: o leitor de tela anuncia o novo total sempre que ele muda. */}
        <p aria-live="polite">{resultText}</p>
        <div className="binder-view__actions">
          {hasFilters && (
            <button type="button" className="link-button" onClick={onClear}>
              Limpar busca e filtros
            </button>
          )}
          <button type="button" className="binder-view__random" onClick={onRandom} disabled={cards.length === 0}>
            <span aria-hidden="true">🎲</span> Sortear carta
          </button>
          <button type="button" className="binder-view__see-cards" onClick={() => setMobilePage('right')}>
            Ver {plural(cards.length, 'carta')} →
          </button>
        </div>
      </div>

      <CollectionProgress categories={CATEGORIES} counts={collection.counts} totals={collection.totals} />
    </>
  );

  const right = (
    <>
      <header className="book-page__header">
        <p className="book-page__eyebrow">Fichário</p>
        <h2 className="book-page__title">Cartas</h2>
        <p className="book-page__subtitle">{resultText}</p>
      </header>
      {cards.length > 0 ? (
        <PocketPage cards={cards} resetKey={JSON.stringify([filters, sort])} favoriteIds={favoriteIds} onOpen={onOpenCard} label="Cartas encontradas" />
      ) : (
        <EmptyState
          title="Nenhuma carta encontrada"
          message="Tente outro nome ou número, ou remova algum filtro."
          action={{ label: 'Limpar busca e filtros', onClick: onClear }}
        />
      )}
    </>
  );

  return <BookSpread left={left} right={right} labels={['Índice', 'Cartas']} mobilePage={mobilePage} onMobilePageChange={setMobilePage} />;
}
