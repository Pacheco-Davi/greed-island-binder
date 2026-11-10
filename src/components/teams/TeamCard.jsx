import { KIND_LABELS, formatSlots, plural } from '../../domain/format.js';
import { buildHash } from '../../domain/routes.js';
import '../../css/TeamCard.css';

/** Resumo de um time na lista. Props: team, members, cardCount, isCurrent */
export default function TeamCard({ team, members, cardCount, isCurrent = false }) {
  const slots = formatSlots(team.specifiedSlots);

  return (
    <article className={isCurrent ? 'team-card team-card--current' : 'team-card'}>
      <p className="team-card__kind">{KIND_LABELS[team.kind]}</p>
      <h4 className="team-card__name">
        {/* Navegar é papel de link (<a>), não de botão: o endereço aparece ao passar o
            mouse, dá para abrir em outra aba e o Voltar do navegador funciona. */}
        {/* aria-current: o leitor de tela anuncia "página atual" no time que está aberto */}
        <a className="team-card__open" href={buildHash({ tab: 'times', teamId: team.id })} aria-current={isCurrent ? 'page' : undefined}>
          {team.name}
        </a>
      </h4>
      <p className="team-card__members">{members.map((member) => member.name).join(', ')}</p>
      <ul className="team-card__stats">
        <li>{plural(members.length, 'integrante')}</li>
        <li>{cardCount === 0 ? 'nenhuma carta comprovada' : plural(cardCount, 'carta comprovada', 'cartas comprovadas')}</li>
        {slots && <li>{slots}</li>}
      </ul>
    </article>
  );
}
