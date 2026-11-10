import { formatLimit, formatNumber, formatRank, formatRarity } from '../../domain/format.js';
import '../../css/CardDetails.css';

/**
 * Carta ampliada com todos os dados. Versão simples: a Etapa 7 transforma
 * isto num modal completo (foco preso, fundo inerte, carta que vira).
 *
 * Props:
 *   card, rarity (resultado de getRarityPosition), spellClasses ([{ id, label, description }])
 *   teams (times que tiveram a carta), placeholder (imagem reserva)
 *   isFavorite, onToggleFavorite, onClose, onOpenTeam
 */
export default function CardDetails({ card, rarity, spellClasses, teams, placeholder, isFavorite, onToggleFavorite, onClose, onOpenTeam }) {
  const number = formatNumber(card);

  return (
    // Clicar no fundo escuro fecha; o stopPropagation no painel impede que um
    // clique DENTRO dele "suba" até o fundo e feche sem querer.
    <div className="card-details__backdrop" onClick={onClose}>
      <section
        className="card-details"
        role="dialog"
        aria-labelledby="card-details-title"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose();
        }}
      >
        <button type="button" className="card-details__close" onClick={onClose} autoFocus>
          Fechar
        </button>

        <img className="card-details__image" src={card.image ?? placeholder} alt={`Arte da carta ${card.name} (${number})`} />

        <div className="card-details__body">
          <p className="card-details__number">{number}</p>
          <h2 id="card-details-title" className="card-details__name">
            {card.name}
          </h2>
          {card.altName && <p className="card-details__alt">Tradução alternativa: {card.altName}</p>}

          <button type="button" className="card-details__favorite" aria-pressed={isFavorite} onClick={() => onToggleFavorite(card.id)}>
            {isFavorite ? '★ Favorita' : '☆ Favoritar'}
          </button>

          <dl className="card-details__facts">
            <dt>Categoria</dt>
            <dd>
              <span className="card-details__swatch" style={{ '--category-color': card.categoryInfo.color }} aria-hidden="true" />
              {card.categoryInfo.label}
            </dd>

            <dt>Rank</dt>
            <dd>{formatRank(card)}</dd>

            <dt>Limite de conversão</dt>
            <dd>{formatLimit(card)}</dd>

            <dt>Raridade</dt>
            <dd>{formatRarity(rarity)}</dd>

            {spellClasses.length > 0 && (
              <>
                <dt>Classe</dt>
                <dd>
                  <ul className="card-details__classes">
                    {spellClasses.map((spellClass) => (
                      <li key={spellClass.id}>
                        <abbr title={spellClass.labelEn}>{spellClass.id}</abbr> — {spellClass.label}: {spellClass.description}
                      </li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>

          <h3 className="card-details__heading">Descrição</h3>
          <p className="card-details__description" lang="en">
            {card.description}
          </p>

          <h3 className="card-details__heading">Times que tiveram esta carta</h3>
          {teams.length > 0 ? (
            <ul className="card-details__teams">
              {teams.map((team) => (
                <li key={team.id}>
                  <button type="button" className="link-button" onClick={() => onOpenTeam(team.id)}>
                    {team.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="card-details__muted">Nenhum time com essa carta comprovada pela wiki.</p>
          )}
        </div>
      </section>
    </div>
  );
}
