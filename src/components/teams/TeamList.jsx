import TeamCard from './TeamCard.jsx';
import '../../css/TeamList.css';

const SECTIONS = [
  { kind: 'time', title: 'Times', hint: 'Equipes que jogaram juntas no arco.' },
  { kind: 'alianca', title: 'Alianças', hint: 'Grupos maiores, formados por várias equipes ou jogadores.' },
];

/** Lista de times, separada em Times e Alianças. Props: items ([{ team, members, cardCount }]) */
export default function TeamList({ items }) {
  return (
    <div className="team-list">
      {SECTIONS.map((section) => (
        <section key={section.kind} className="team-list__section" aria-labelledby={`times-${section.kind}`}>
          <h2 id={`times-${section.kind}`} className="team-list__title">
            {section.title}
          </h2>
          <p className="team-list__hint">{section.hint}</p>
          <div className="team-list__grid">
            {items
              .filter(({ team }) => team.kind === section.kind)
              .map(({ team, members, cardCount }) => (
                <TeamCard key={team.id} team={team} members={members} cardCount={cardCount} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
