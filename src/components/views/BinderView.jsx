import SearchBar from '../controls/SearchBar.jsx';
import CategoryFilter from '../controls/CategoryFilter.jsx';
import RankFilter from '../controls/RankFilter.jsx';
import TeamFilter from '../controls/TeamFilter.jsx';
import SortControl from '../controls/SortControl.jsx';
import CardGrid from '../cards/CardGrid.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { CATEGORIES, RANKS, TEAMS, TEAMS_BY_ID, TEAM_CARD_IDS } from '../../domain/catalog.js';
import { plural } from '../../domain/format.js';
import '../../css/BinderView.css';

// Dados fixos: calculados uma vez, fora do componente.
const TEAM_CARD_COUNTS = new Map([...TEAM_CARD_IDS].map(([teamId, ids]) => [teamId, ids.size]));

/**
 * Aba "Fichário": controles de busca/filtro/ordem + grade de cartas.
 * Não guarda estado: recebe tudo do App por props e avisa as mudanças por callbacks.
 */
export default function BinderView({ filters, onFilterChange, sort, onSortChange, onClear, hasFilters, cards, categoryCounts, total, favoriteIds, onOpenCard }) {
  const activeTeam = filters.teamId ? TEAMS_BY_ID.get(filters.teamId) : null;

  return (
    <div className="binder-view">
      <div className="binder-view__controls">
        <SearchBar value={filters.query} onChange={(value) => onFilterChange('query', value)} />
        <CategoryFilter categories={CATEGORIES} counts={categoryCounts} value={filters.category} onChange={(value) => onFilterChange('category', value)} />
        <RankFilter ranks={RANKS} value={filters.rank} onChange={(value) => onFilterChange('rank', value)} />
        <div className="binder-view__row">
          <TeamFilter teams={TEAMS} cardCounts={TEAM_CARD_COUNTS} value={filters.teamId} onChange={(value) => onFilterChange('teamId', value)} />
          <SortControl value={sort} onChange={onSortChange} />
        </div>
      </div>

      <div className="binder-view__status">
        {/* aria-live: o leitor de tela anuncia o novo total sempre que ele muda. */}
        <p aria-live="polite">
          {cards.length} de {plural(total, 'carta')}
          {activeTeam && ` · cartas de ${activeTeam.name}`}
        </p>
        {hasFilters && (
          <button type="button" className="link-button" onClick={onClear}>
            Limpar busca e filtros
          </button>
        )}
      </div>

      {cards.length > 0 ? (
        <CardGrid cards={cards} favoriteIds={favoriteIds} onOpen={onOpenCard} label="Cartas encontradas" />
      ) : (
        <EmptyState
          title="Nenhuma carta encontrada"
          message="Tente outro nome ou número, ou remova algum filtro."
          action={{ label: 'Limpar busca e filtros', onClick: onClear }}
        />
      )}
    </div>
  );
}
