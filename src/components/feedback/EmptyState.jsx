import '../../css/EmptyState.css';

/**
 * Mensagem para quando não há nada para mostrar.
 * role="status" faz o leitor de tela anunciar a mensagem quando ela aparece.
 *
 * Props: title, message (opcional), action ({ label, onClick }, opcional)
 */
export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__message">{message}</p>}
      {action && (
        <button type="button" className="empty-state__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
