import { limitPosition, limitTicks } from '../../domain/meters.js';
import { plural } from '../../domain/format.js';
import '../../css/LimitMeter.css';

/**
 * Limite de conversão (quantas cópias da carta podem existir no jogo) numa
 * barra em escala logarítmica. ∞ e "?" não cabem na escala: têm visual próprio.
 * Props: card, max (maior limite numérico do catálogo)
 */
export default function LimitMeter({ card, max }) {
  if (card.unlimited) {
    return (
      <div className="limit-meter limit-meter--unlimited">
        <div className="limit-meter__track" aria-hidden="true" />
        <p className="limit-meter__text">∞ — cópias ilimitadas</p>
      </div>
    );
  }

  if (card.limit === null) {
    return <p className="limit-meter__text limit-meter__text--muted">{card.unknown ? '? — limite desconhecido' : 'Sem limite de conversão'}</p>;
  }

  return (
    <div className="limit-meter">
      <div
        className="limit-meter__track"
        role="meter"
        aria-label="Limite de conversão"
        aria-valuemin={1}
        aria-valuemax={max}
        aria-valuenow={card.limit}
        aria-valuetext={`no máximo ${plural(card.limit, 'cópia')}`}
      >
        <span className="limit-meter__fill" style={{ '--fill': limitPosition(card.limit, max) }} />
      </div>
      <div className="limit-meter__scale" aria-hidden="true">
        {limitTicks(max).map((tick) => (
          <span key={tick.value} style={{ '--at': tick.position }}>
            {tick.value}
          </span>
        ))}
      </div>
      <p className="limit-meter__text">
        Até <strong>{plural(card.limit, 'cópia')}</strong> no jogo <span className="limit-meter__hint">(escala logarítmica)</span>
      </p>
    </div>
  );
}
