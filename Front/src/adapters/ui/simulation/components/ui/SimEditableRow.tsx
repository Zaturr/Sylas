import '../simulationSteps.css';

type SimEditableRowProps = {
  label: string;
  value: string;
  onEdit: () => void;
  editLabel?: string;
};

export function SimEditableRow({
  label,
  value,
  onEdit,
  editLabel = 'Editar',
}: SimEditableRowProps) {
  return (
    <div className="sim-editable-row">
      <div className="sim-editable-row__content">
        <span className="sim-editable-row__label">{label}</span>
        <strong className="sim-editable-row__value">{value}</strong>
      </div>
      <button
        type="button"
        className="sim-editable-row__btn"
        aria-label={`${editLabel} ${label}`}
        onClick={onEdit}
      >
        ✎
      </button>
    </div>
  );
}
