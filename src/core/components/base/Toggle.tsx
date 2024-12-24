import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const Toggle = ({ checked, onChange, label, size = 'sm' }: ToggleProps) => {
  const sizeClasses = {
    sm: {
      button: 'h-5 w-9',
      circle: 'h-3 w-3',
      translate: checked ? 'translate-x-5' : 'translate-x-1',
    },
    md: {
      button: 'h-6 w-11',
      circle: 'h-4 w-4',
      translate: checked ? 'translate-x-6' : 'translate-x-1',
    },
  };

  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-2 w-full focus:outline-none group"
    >
      {label && (
        <span className="text-sm text-gray-700 select-none group-hover:text-gray-900">{label}</span>
      )}
      <div
        role="switch"
        aria-checked={checked}
        className={clsx(
          'relative inline-flex items-center rounded-full transition-colors',
          'group-focus:ring-2 group-focus:ring-felineGreen-dark group-focus:ring-offset-1',
          checked ? 'bg-felineGreen-dark' : 'bg-gray-200',
          sizeClasses[size].button
        )}
      >
        <span
          className={clsx(
            'inline-block transform rounded-full bg-white transition-transform',
            sizeClasses[size].circle,
            sizeClasses[size].translate
          )}
        />
      </div>
    </button>
  );
};
