import RankBadge from './RankBadge.jsx';
import RankMeter from './RankMeter.jsx';
import LimitMeter from './LimitMeter.jsx';
import CategoryBadge from './CategoryBadge.jsx';
import { formatNumber, formatRarity } from '../../domain/format.js';
import { buildHash } from '../../domain/routes.js';
import { categoryStyle } from '../../domain/palette.js';
import '../../css/CardBack.css';

/**
 * Verso da carta: os "atributos" (o equivalente às barras de status da Pokédex).
 * Props: card, rarity, spellClasses, teams, maxLimit, onOpenTeam
 */
export default function CardBack({ card, rarity, spellClasses, teams, maxLimit, onOpenTeam }) {
  return (
    <div className="card-back" style={categoryStyle(card.categoryInfo.color)}>
      <header className="card-back__header">
        <span className="card-back__number">{formatNumber(card)}</span>
        <RankBadge rank={card.rank} size="md" />
      </header>
      <h3 className="card-back__name">{card.name}</h3>
      {card.altName && <p className="card-back__alt">Tradução alternativa: {card.altName}</p>}

      <section className="card-back__section" aria-labelledby="card-back-attributes">
        <h4 id="card-back-attributes" className="card-back__heading">
          Atributos
        </h4>
        <dl className="card-back__facts">
          <dt>Rank</dt>
          <dd>
            <RankMeter rank={card.rank} />
          </dd>
          <dt>Limite de conversão</dt>
          <dd>
            <LimitMeter card={card} max={maxLimit} />
          </dd>
          <dt>Raridade</dt>
          <dd>{formatRarity(rarity)}</dd>
          <dt>Categoria</dt>
          <dd>
            <CategoryBadge category={card.categoryInfo} />
          </dd>
          {spellClasses.length > 0 && (
            <>
              <dt>Classe</dt>
              <dd>
                <ul className="card-back__classes">
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
      </section>

      <section className="card-back__section" aria-labelledby="card-back-description">
        <h4 id="card-back-description" className="card-back__heading">
          Descrição
        </h4>
        <p className="card-back__description" lang="en">
          {card.description}
        </p>
      </section>

      <section className="card-back__section" aria-labelledby="card-back-teams">
        <h4 id="card-back-teams" className="card-back__heading">
          Times que tiveram esta carta
        </h4>
        {teams.length > 0 ? (
          <ul className="card-back__teams">
            {teams.map((team) => (
              <li key={team.id}>
                <a href={buildHash({ tab: 'times', teamId: team.id })} onClick={onOpenTeam}>
                  {team.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card-back__muted">Nenhum time com essa carta comprovada pela wiki.</p>
        )}
      </section>
    </div>
  );
}
