import { KIND_LABELS, formatSlots, plural } from '../../domain/format.js';
import '../../css/TeamCard.css';

/** Resumo de um time na lista. Props: team, members, cardCount, onOpen */
export default function TeamCard({ team, members, cardCount, onOpen }) {
  const slots = formatSlots(team.specifiedSlots);

  return (
    <article className="team-card">
      <p className="team-card__kind">{KIND_LABELS[team.kind]}</p>
      <h3 className="team-card__name">
        {/* O botão fica dentro do título: o leitor de tela lista o time como título E como ação. */}
        <button type="button" className="team-card__open" onClick={() => onOpen(team.id)}>
          {team.name}
        </button>
      </h3>
      <p className="team-card__members">{members.map((member) => member.name).join(', ')}</p>
      <ul className="team-card__stats">
        <li>{plural(members.length, 'integrante')}</li>
        <li>{cardCount === 0 ? 'nenhuma carta comprovada' : plural(cardCount, 'carta comprovada', 'cartas comprovadas')}</li>
        {slots && <li>{slots}</li>}
      </ul>
    </article>
  );
}
