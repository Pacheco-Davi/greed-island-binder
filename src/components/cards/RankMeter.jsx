import { RANK_STEPS, rankLevel } from '../../domain/meters.js';
import { rankStyle } from '../../domain/palette.js';
import '../../css/RankMeter.css';

/**
 * Medidor de 10 degraus, do H (1) ao SS (10). Os degraus até o rank da carta
 * ficam preenchidos com a cor do rank. role="meter" + aria-valuetext fazem o
 * leitor de tela dizer "Rank S, 9 de 10" em vez de ler 10 quadradinhos.
 * Props: rank
 */
export default function RankMeter({ rank }) {
  const level = rankLevel(rank);
  if (level === 0) return <p className="rank-meter__none">Sem rank (carta de Game Master)</p>;

  return (
    <div className="rank-meter" style={rankStyle(rank)}>
      <div className="rank-meter__steps" role="meter" aria-label="Rank" aria-valuemin={1} aria-valuemax={10} aria-valuenow={level} aria-valuetext={`Rank ${rank}, ${level} de 10`}>
        {RANK_STEPS.map((step, index) => (
          <span key={step} className={index < level ? 'rank-meter__step rank-meter__step--on' : 'rank-meter__step'} />
        ))}
      </div>
      <div className="rank-meter__scale" aria-hidden="true">
        <span>H</span>
        <span>SS</span>
      </div>
    </div>
  );
}
