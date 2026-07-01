type SimSegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SimSegmentControlProps<T extends string> = {
  options: SimSegmentOption<T>[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
};

export function SimSegmentControl<T extends string>({
  options,
  value,
  disabled = false,
  onChange,
}: SimSegmentControlProps<T>) {
  return (
    <div className="sim-segment" role="group">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`sim-segment__option ${isActive ? 'sim-segment__option--active' : ''}`}
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
