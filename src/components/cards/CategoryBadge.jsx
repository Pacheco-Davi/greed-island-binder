import { categoryStyle } from '../../domain/palette.js';
import '../../css/CategoryBadge.css';

/** Etiqueta com a cor da categoria e texto com contraste garantido. Props: category ({ label, color }) */
export default function CategoryBadge({ category }) {
  return (
    <span className="category-badge" style={categoryStyle(category.color)}>
      {category.label}
    </span>
  );
}
