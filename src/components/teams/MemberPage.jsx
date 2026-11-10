import CardSlot from '../cards/CardSlot.jsx';
import EmptyState from '../feedback/EmptyState.jsx';
import { formatSource } from '../../domain/format.js';
import '../../css/MemberPage.css';

/**
 * Página resumida de um integrante: só o arco Greed Island e as cartas dele,
 * cada uma com a prova (trecho original da wiki).
 *
 * Props:
 *   player, teams (times do jogador), entries ([{ card, entry }])
 *   backTeam (time de onde a pessoa veio, ou null), favoriteIds
 *   onBack, onOpenTeam, onOpenCard
 */
export default function MemberPage({ player, teams, entries, backTeam, favoriteIds, onBack, onOpenTeam, onOpenCard }) {
  return (
    <article className="member-page" aria-labelledby="member-page-title">
      <button type="button" className="link-button member-page__back" onClick={onBack}>
        ← {backTeam ? backTeam.name : 'Todos os times'}
      </button>

      <header className="member-page__header">
        <h2 id="member-page-title" className="member-page__name">
          {player.name}
        </h2>
        {player.role && <p className="member-page__role">{player.role}</p>}
      </header>

      <dl className="member-page__facts">
        <dt>{teams.length === 1 ? 'Time' : 'Times'}</dt>
        <dd>
          <ul className="member-page__teams">
            {teams.map((team) => (
              <li key={team.id}>
                <button type="button" className="link-button" onClick={() => onOpenTeam(team.id)}>
                  {team.name}
                </button>
              </li>
            ))}
          </ul>
        </dd>
        {player.hiredByBattera && (
          <>
            <dt>Contrato</dt>
            <dd>Contratado por Battera</dd>
          </>
        )}
        {player.nen && (
          <>
            <dt>Nen</dt>
            <dd>{player.nen}</dd>
          </>
        )}
        {player.fate && (
          <>
            <dt>Fim do arco</dt>
            <dd>{player.fate}</dd>
          </>
        )}
      </dl>

      <p className="member-page__summary">{player.summary ?? 'A wiki não traz detalhes deste jogador no arco Greed Island.'}</p>

      <section className="member-page__section" aria-labelledby="member-cards-title">
        <h3 id="member-cards-title">Cartas ({entries.length})</h3>
        {entries.length > 0 ? (
          <ul className="member-page__cards">
            {entries.map(({ card, entry }) => (
              <li key={card.id} className="member-page__card">
                <CardSlot card={card} onOpen={onOpenCard} isFavorite={favoriteIds.has(card.id)} />
                <figure className="member-page__evidence">
                  <figcaption>{formatSource(entry)}</figcaption>
                  <blockquote lang="en">{entry.evidence}</blockquote>
                  <p className="member-page__cite">Fonte: página “{entry.source}” da Hunter x Hunter Wiki</p>
                </figure>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nenhuma carta comprovada" message="A wiki não diz quais cartas este jogador obteve ou usou." />
        )}
      </section>

      <p className="member-page__wiki">
        <a href={player.wiki} target="_blank" rel="noreferrer">
          Ver a página completa na wiki
        </a>
      </p>
    </article>
  );
}
