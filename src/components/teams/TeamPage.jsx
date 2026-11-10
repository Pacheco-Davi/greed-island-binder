import CardGrid from '../cards/CardGrid.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { KIND_LABELS, formatSlots, formatSlotsMoment, plural } from '../../domain/format.js';
import { buildHash } from '../../domain/routes.js';
import '../../css/TeamPage.css';

/**
 * Página de um time: resumo, integrantes e cartas.
 *
 * Props:
 *   team, members, cards (cartas normalizadas do time), notes (Map id → "Usou · Gon Freecss")
 *   favoriteIds, onOpenCard, onShowInBinder
 */
export default function TeamPage({ team, members, cards, notes, favoriteIds, onOpenCard, onShowInBinder }) {
  const slots = formatSlots(team.specifiedSlots);

  return (
    <article className="team-page" aria-labelledby="team-page-title">
      <a className="team-page__back" href={buildHash({ tab: 'times' })}>
        ← Todos os times
      </a>

      <header className="team-page__header">
        <p className="team-page__kind">{KIND_LABELS[team.kind]}</p>
        <h2 id="team-page-title" className="team-page__name">
          {team.name}
        </h2>
      </header>

      {team.summary && <p className="team-page__summary">{team.summary}</p>}

      <dl className="team-page__facts">
        {team.goal && (
          <>
            <dt>Objetivo</dt>
            <dd>{team.goal}</dd>
          </>
        )}
        {team.outcome && (
          <>
            <dt>Desfecho</dt>
            <dd>{team.outcome}</dd>
          </>
        )}
        <dt>Slots designados</dt>
        <dd>
          {slots ? (
            <>
              {slots} — {formatSlotsMoment(team.specifiedSlots)}
            </>
          ) : (
            'A wiki não informa.'
          )}
        </dd>
      </dl>

      <section className="team-page__section" aria-labelledby="team-members-title">
        <h3 id="team-members-title">Integrantes ({members.length})</h3>
        <ul className="team-page__members">
          {members.map((member) => (
            <li key={member.id}>
              <a href={buildHash({ tab: 'times', teamId: team.id, playerId: member.id })}>{member.name}</a>
              {member.role && <span className="team-page__role"> — {member.role}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="team-page__section" aria-labelledby="team-cards-title">
        <h3 id="team-cards-title">Cartas do time ({cards.length})</h3>
        {cards.length > 0 ? (
          <>
            <p className="team-page__hint">
              {plural(cards.length, 'carta comprovada', 'cartas comprovadas')} pela wiki — um mínimo, não o fichário completo.{' '}
              <button type="button" className="link-button" onClick={() => onShowInBinder(team.id)}>
                Ver no fichário
              </button>
            </p>
            <CardGrid cards={cards} notes={notes} favoriteIds={favoriteIds} onOpen={onOpenCard} label={`Cartas de ${team.name}`} />
          </>
        ) : (
          <EmptyState title="Nenhuma carta comprovada" message="A wiki não diz quais cartas este grupo teve." />
        )}
      </section>
    </article>
  );
}
