import { useId } from 'react';
import '../../css/TeamFilter.css';

/**
 * "Cartas do time": mostra só as cartas que o time escolhido teve.
 * Times sem nenhuma carta comprovada aparecem desabilitados.
 *
 * Props: teams, cardCounts (Map teamId → número), value (teamId ou null), onChange
 */
export default function TeamFilter({ teams, cardCounts, value, onChange }) {
  const id = useId();
  const groups = ['time', 'alianca'].map((kind) => ({ kind, teams: teams.filter((team) => team.kind === kind) }));

  return (
    <div className="team-filter">
      <label className="team-filter__label" htmlFor={id}>
        Cartas do time
      </label>
      <select id={id} className="team-filter__select" value={value ?? ''} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">Todas as cartas</option>
        {groups.map((group) => (
          <optgroup key={group.kind} label={group.kind === 'time' ? 'Times' : 'Alianças'}>
            {group.teams.map((team) => {
              const count = cardCounts.get(team.id) ?? 0;
              return (
                <option key={team.id} value={team.id} disabled={count === 0}>
                  {team.name} ({count === 0 ? 'nenhuma carta comprovada' : count})
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
