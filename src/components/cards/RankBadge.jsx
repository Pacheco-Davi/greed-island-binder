import { rankStyle } from '../../domain/palette.js';
import '../../css/RankBadge.css';

/**
 * Selo do rank (SS → H). SS e S têm acabamento metálico (gradiente de ouro e
 * prata); a cor do texto é escolhida por contraste em src/domain/palette.js.
 * Props: rank ('SS' … 'H' ou null), size ('sm' | 'md')
 */
export default function RankBadge({ rank, size = 'sm' }) {
  const metallic = rank === 'SS' || rank === 'S';
  return (
    <span className={`rank-badge rank-badge--${size}${metallic ? ' rank-badge--metallic' : ''}`} style={rankStyle(rank)}>
      {rank ? (
        <>
          <span className="visually-hidden">Rank </span>
          {rank}
        </>
      ) : (
        <>
          <span aria-hidden="true">—</span>
          <span className="visually-hidden">Sem rank</span>
        </>
      )}
    </span>
  );
}
