import '../../css/ThemeToggle.css';

/** Alterna entre o tema claro e o noturno. Props: theme ('light' | 'dark'), onToggle */
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button type="button" className="theme-toggle" aria-pressed={isDark} onClick={onToggle}>
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span> Modo noturno
    </button>
  );
}
